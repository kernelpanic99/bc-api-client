import ky, { isHTTPError, isKyError, isTimeoutError, type KyInstance, type KyResponse } from 'ky';
import pLimit, { type LimitFunction } from 'p-limit';
import {
    BASE_KY_CONFIG,
    type ClientConfig,
    type ConcurrencyOptions,
    DEFAULT_BACKOFF_RATE,
    DEFAULT_BACKOFF_RECOVER,
    DEFAULT_CONCURRENCY,
    DEFAULT_LIMIT,
    DEFAULT_RATE_LIMIT_BACKOFF,
    HEADERS,
    type Logger,
    MAX_CONCURRENCY,
    MAX_URL_LENGTH,
    type ResolvedConcurrencyOptions,
} from './lib/common';
import {
    BaseError,
    BCApiError,
    BCClientError,
    BCCredentialsError,
    BCPaginatedItemValidationError,
    BCPaginatedOptionError,
    BCPaginatedResponseError,
    BCQueryValidationError,
    BCRequestBodyValidationError,
    BCResponseParseError,
    BCResponseValidationError,
    type BCSchemaValidationError,
    BCTimeoutError,
} from './lib/errors';
import { bcRateLimitRetry, validateUrlLength } from './lib/hooks';
import { initLogger } from './lib/logger';
import type { V3Resource } from './lib/pagination';
import {
    type ApiVersion,
    type BatchRequestOptions,
    type CollectOptions,
    type DeleteOptions,
    type GetOptions,
    type PostOptions,
    type PutOptions,
    type Query,
    type QueryOptions,
    type RequestOptions,
    req,
    toUrlSearchParams,
} from './lib/request';
import { Err, Ok, type Result } from './lib/result';
import type { StandardSchemaV1 } from './lib/standard-schema';
import { AsyncChannel, chunkStrLength, stripKeys } from './lib/util';

const LEADING_SLASHES = /^\/+/;
export class BigCommerceClient {
    private readonly logger?: Logger;
    private readonly client: KyInstance;
    private readonly storeHash: string;

    constructor(private readonly config: ClientConfig) {
        this.validateConfig();

        const { storeHash, accessToken, logger, concurrency: _, ...kyOptions } = config;

        this.logger = initLogger(logger);
        this.storeHash = storeHash;

        this.client = ky.create({
            ...BASE_KY_CONFIG,
            ...kyOptions,

            headers: {
                ...BASE_KY_CONFIG.headers,
                ...((kyOptions.headers ?? {}) as Record<string, string>),
                [HEADERS.AUTH_TOKEN]: accessToken,
            },

            hooks: {
                beforeRequest: [...(kyOptions.hooks?.beforeRequest ?? []), validateUrlLength],
                beforeRetry: [
                    ({ error }) => {
                        if (error instanceof BaseError) {
                            throw error;
                        }
                    },
                    bcRateLimitRetry(this.logger),
                    ...(kyOptions.hooks?.beforeRetry ?? []),
                ],
                beforeError: [...(kyOptions.hooks?.beforeError ?? [])],
                afterResponse: [...(kyOptions.hooks?.afterResponse ?? [])],
            },
        });
    }

    async get<TRes, TQuery extends Query = Query>(path: string, options?: GetOptions<TRes, TQuery>): Promise<TRes> {
        return this.request<never, TRes, TQuery>(path, {
            ...stripKeys(options, ['body', 'bodySchema']),
            method: 'GET',
        });
    }

    async post<TRes, TBody = unknown, TQuery extends Query = Query>(
        path: string,
        options?: PostOptions<TBody, TRes, TQuery>,
    ): Promise<TRes> {
        return this.request<TBody, TRes, TQuery>(path, {
            ...options,
            method: 'POST',
        });
    }

    async put<TRes, TBody = unknown, TQuery extends Query = Query>(
        path: string,
        options?: PutOptions<TBody, TRes, TQuery>,
    ): Promise<TRes> {
        return this.request<TBody, TRes, TQuery>(path, {
            ...options,
            method: 'PUT',
        });
    }

    async delete<TRes = never, TQuery extends Query = Query>(
        path: string,
        options?: DeleteOptions<TQuery>,
    ): Promise<void> {
        try {
            await this.request<never, TRes, TQuery>(path, {
                ...stripKeys(options, ['body', 'bodySchema', 'responseSchema']),
                method: 'DELETE',
            });
        } catch (err) {
            if (err instanceof BCResponseParseError && err.context.rawBody === '') {
                return;
            }

            // Do not throw on delete for resources that are already gone.
            if (err instanceof BCApiError && err.context.status === 404) {
                // A guard for typo'd paths. If path is invalid, the api will return plain text "Route not found".
                // If the resource is genuinely missing, the api will return proper json error
                if (err.context.headers[HEADERS.CONTENT_TYPE.toLowerCase()] === 'application/json') {
                    this.logger?.warn({ err }, 'Attempted to delete the resource that is already gone');

                    return;
                }
            }

            throw err;
        }
    }

    async query<TItem, TQuery extends Query = Query>(
        path: string,
        options: QueryOptions<TItem, TQuery>,
    ): Promise<TItem[]> {
        const results: TItem[] = [];

        for await (const { data, err } of this.queryStream(path, options)) {
            if (err) {
                throw err;
            } else {
                results.push(data);
            }
        }

        return results;
    }

    async *queryStream<TItem, TQuery extends Query = Query>(
        path: string,
        options: QueryOptions<TItem, TQuery>,
    ): AsyncGenerator<Result<TItem, BaseError>> {
        const limit = this.validatePaginationOption(path, 'limit', options?.query?.limit ?? DEFAULT_LIMIT);
        stripKeys(options, ['responseSchema']);

        const itemSchema = options?.itemSchema;

        const newQuery: Query = {
            ...options.query,
            limit,
        };

        if (options.key in newQuery) {
            this.logger?.warn(
                { key: options.key },
                'The provided key is already in the query params, this param will be ignored',
            );

            stripKeys(newQuery, [options.key]);
        }

        const url = this.config.prefixUrl ?? options.prefixUrl ?? BASE_KY_CONFIG.prefixUrl;
        const fullPath = this.makePath('v3', path);
        const fullQuery = toUrlSearchParams(newQuery);
        const fullUrl = `${url}/${fullPath}?${fullQuery}`;
        const keyOverhead = options.key.length + 2; // `&key=` or `key=` prefix

        const chunks = chunkStrLength(options.values.map(String), {
            chunkLength: limit,
            maxLength: MAX_URL_LENGTH,
            offset: fullUrl.length + keyOverhead,
            separatorSize: 1,
        });

        const requests = chunks.map((chunk) =>
            req.get(path, {
                query: {
                    ...newQuery,
                    page: 1,
                    [options.key]: chunk,
                },
            }),
        );

        for await (const { err, data } of this.batchStream(requests, options)) {
            if (err) {
                yield Err(err);
                continue;
            }

            try {
                const { data: items } = this.assertPaginatedResponse(path, data);

                for (const item of items) {
                    yield this.validatePaginatedItem(path, item, itemSchema);
                }
            } catch (err) {
                if (err instanceof BaseError) {
                    yield Err(err);
                } else {
                    yield Err(new BCClientError('Unknown error occurred processing page', {}, { cause: err }));
                }
            }
        }
    }

    async collect<TItem, TQuery extends Query>(
        path: string,
        options?: CollectOptions<TItem, TQuery>,
    ): Promise<TItem[]> {
        const items: TItem[] = [];

        for await (const { data, err } of this.stream(path, options)) {
            if (err) {
                throw err;
            } else {
                items.push(data);
            }
        }

        return items;
    }

    async batch<TBody, TRes, TQuery extends Query>(
        requests: BatchRequestOptions<TBody, TRes, TQuery>[],
        options?: ConcurrencyOptions,
    ): Promise<TRes[]> {
        const results: TRes[] = [];

        for await (const { data, err } of this.batchStream(requests, options)) {
            if (err) {
                throw err;
            } else {
                results.push(data);
            }
        }

        return results;
    }

    async *stream<TItem, TQuery extends Query>(
        path: string,
        options?: CollectOptions<TItem, TQuery>,
    ): AsyncGenerator<Result<TItem, BaseError>> {
        let limit = this.validatePaginationOption(path, 'limit', options?.query?.limit ?? DEFAULT_LIMIT);
        const page = this.validatePaginationOption(path, 'page', options?.query?.page ?? 1);

        stripKeys(options, ['responseSchema']);

        const itemSchema = options?.itemSchema;

        let firstPageMeta: V3Resource<unknown[]>['meta'];

        try {
            const firstPage = await this.get(path, {
                ...options,
                query: {
                    ...options?.query,
                    page,
                    limit,
                } as unknown as TQuery,
            });

            const { data, meta } = this.assertPaginatedResponse(path, firstPage);

            firstPageMeta = meta;

            // Validate and return the first page
            for (const item of data) {
                yield this.validatePaginatedItem(path, item, itemSchema);
            }
        } catch (err) {
            if (err instanceof BaseError) {
                yield Err(err);
            } else {
                yield Err(new BCClientError('Unknown error occurred fetching first page', {}, { cause: err }));
            }

            return;
        }

        // Query would be validated by the request above
        stripKeys(options, ['itemSchema', 'querySchema']);

        const { total_pages, per_page } = firstPageMeta.pagination;

        if (limit !== per_page) {
            this.logger?.warn({ limit, actual: per_page }, 'API enforces alternate limit on this endpoint');
            limit = per_page;
        }

        // Fetch other pages using batchStream
        const requests = Array.from({ length: total_pages - page }, (_, i) => i + page + 1).map((page) => ({
            method: 'GET' as const,
            path,
            query: {
                ...options?.query,
                limit,
                page,
            },
        }));

        for await (const pageRes of requests.length > 0 ? this.batchStream(requests, options) : []) {
            const { data: page, err } = pageRes;

            if (err) {
                yield Err(err);
                continue;
            }

            try {
                const { data } = this.assertPaginatedResponse(path, page);

                for (const item of data) {
                    yield this.validatePaginatedItem(path, item, itemSchema);
                }
            } catch (err) {
                if (err instanceof BaseError) {
                    yield Err(err);
                } else {
                    yield Err(new BCClientError('Unknown error occured processing page', {}, { cause: err }));
                }
            }
        }
    }

    async *batchStream<TBody, TRes, TQuery extends Query>(
        requests: BatchRequestOptions<TBody, TRes, TQuery>[],
        options?: ConcurrencyOptions,
    ): AsyncGenerator<Result<TRes, BaseError>> {
        const resolved = this.resolveStreamOptions(options);

        if (resolved.concurrency) {
            const limit = pLimit(resolved.concurrency);
            const client = this.makeStreamClient(limit, resolved);
            const channel = new AsyncChannel<Result<TRes, BaseError>>();

            try {
                Promise.all(
                    requests.map((req) =>
                        limit(() =>
                            this.request(req.path, req, client).then(
                                (val) => channel.push(Ok(val)),
                                (err) => channel.push(Err(err)),
                            ),
                        ),
                    ),
                ).finally(() => channel.close());

                for await (const item of channel) {
                    yield item;
                }
            } finally {
                limit.clearQueue();
            }
        } else {
            for (const request of requests) {
                try {
                    const res = await this.request(request.path, request);

                    yield Ok(res);
                } catch (err) {
                    if (err instanceof BaseError) {
                        yield Err(err);
                    } else {
                        yield Err(new BCClientError('Unknown error in batchStream', {}, { cause: err }));
                    }
                }
            }
        }
    }

    private async validatePaginatedItem<TItem>(
        path: string,
        item: unknown,
        schema?: StandardSchemaV1<TItem>,
    ): Promise<Result<TItem, BaseError>> {
        if (!schema) {
            return Ok(item as TItem);
        }

        const result = await schema['~standard'].validate(item);

        if (result.issues) {
            return Err(new BCPaginatedItemValidationError('Page item validation failed', 'GET', path, item, result));
        } else {
            return Ok(result.value);
        }
    }

    private assertPaginatedResponse(path: string, res: unknown): V3Resource<unknown[]> {
        if (typeof res !== 'object' || res === null) {
            throw new BCPaginatedResponseError(path, res, 'Response is invalid');
        }

        if (!('data' in res) || !Array.isArray(res.data)) {
            throw new BCPaginatedResponseError(
                path,
                res,
                'response.data must be an array, ensure this endpoint returns a v3 collection',
            );
        }

        if (!('meta' in res) || typeof res.meta !== 'object' || res.meta === null || !('pagination' in res.meta)) {
            throw new BCPaginatedResponseError(path, res, 'response.meta is invalid unable to paginate');
        }

        const pagination = res.meta.pagination;

        if (typeof pagination !== 'object' || pagination === null) {
            throw new BCPaginatedResponseError(path, res, 'response.meta.pagination is invalid unable to paginate');
        }

        const requiredFields: Array<[string, (v: unknown) => boolean]> = [
            ['per_page', (v) => typeof v === 'number' && v > 0],
            ['total_pages', (v) => typeof v === 'number' && v >= 0],
        ];

        for (const [field, isValid] of requiredFields) {
            if (!(field in pagination) || !isValid(pagination[field as keyof typeof pagination])) {
                throw new BCPaginatedResponseError(
                    path,
                    res,
                    `response.meta.pagination.${field} is missing or invalid`,
                );
            }
        }

        const { links } = pagination as { links?: unknown };

        if (typeof links !== 'object' || links === null) {
            throw new BCPaginatedResponseError(path, res, 'response.meta.pagination.links is missing or invalid');
        }

        const isNullableString = (v: unknown) => v === null || typeof v === 'string';

        if (!('current' in links) || typeof links.current !== 'string') {
            throw new BCPaginatedResponseError(
                path,
                res,
                'response.meta.pagination.links.current is missing or invalid',
            );
        }

        if ('next' in links && !isNullableString(links.next)) {
            throw new BCPaginatedResponseError(path, res, 'response.meta.pagination.links.next is invalid');
        }

        if ('previous' in links && !isNullableString(links.previous)) {
            throw new BCPaginatedResponseError(path, res, 'response.meta.pagination.links.previous is invalid');
        }

        return res as V3Resource<unknown[]>;
    }

    private validatePaginationOption(path: string, key: string, value: unknown): number {
        if (typeof value !== 'number' || value <= 0) {
            throw new BCPaginatedOptionError(path, value, key);
        }

        return value;
    }

    private resolveStreamOptions(options?: ConcurrencyOptions): ResolvedConcurrencyOptions {
        return {
            concurrency: options?.concurrency ?? this.config.concurrency ?? DEFAULT_CONCURRENCY,
            rateLimitBackoff: options?.rateLimitBackoff ?? this.config.rateLimitBackoff ?? DEFAULT_RATE_LIMIT_BACKOFF,
            backoff: options?.backoff ?? this.config.backoff ?? DEFAULT_BACKOFF_RATE,
            backoffRecover: options?.backoffRecover ?? this.config.backoffRecover ?? DEFAULT_BACKOFF_RECOVER,
        };
    }

    private makeStreamClient(limit: LimitFunction, options: ResolvedConcurrencyOptions): KyInstance {
        const { concurrency, rateLimitBackoff, backoff, backoffRecover } = options;

        if (concurrency === false) {
            return this.client;
        }

        return this.client.extend({
            hooks: {
                beforeRetry: [
                    ({ error }) => {
                        if (!isHTTPError(error)) {
                            return;
                        }

                        const previousConcurrency = limit.concurrency;

                        if (error.response.status === 429) {
                            limit.concurrency = rateLimitBackoff;

                            this.logger?.warn(
                                { previousConcurrency, newConcurrency: limit.concurrency },
                                'Rate limit reached, limiting concurrency',
                            );
                        } else {
                            const rate =
                                typeof backoff === 'function'
                                    ? backoff(limit.concurrency, error.response.status)
                                    : backoff;

                            limit.concurrency = Math.ceil(limit.concurrency / rate);

                            this.logger?.warn(
                                { previousConcurrency, newConcurrency: limit.concurrency },
                                'Intermittent errors, limiting concurrency to compensate',
                            );
                        }
                    },
                ],
                afterResponse: [
                    (_request, _options, response) => {
                        if (response.ok && limit.concurrency < concurrency) {
                            const recover =
                                typeof backoffRecover === 'function'
                                    ? backoffRecover(limit.concurrency)
                                    : backoffRecover;

                            limit.concurrency = Math.min(concurrency, limit.concurrency + recover);
                        }
                    },
                ],
            },
        });
    }

    private async request<TBody, TRes, TQuery extends Query = Query>(
        _path: string,
        options: RequestOptions<TBody, TRes, TQuery>,
        client?: KyInstance,
    ) {
        const { version, query, body, bodySchema, querySchema, responseSchema, ...kyOptions } = options;

        const path = this.makePath(options.version ?? 'v3', _path);
        const validQuery = await this.validate(
            query,
            querySchema,
            BCQueryValidationError,
            options.method,
            path,
            'Invalid query parameters',
        );
        const validBody = await this.validate(
            body,
            bodySchema,
            BCRequestBodyValidationError,
            options.method,
            path,
            `Invalid ${options.method} request body`,
        );

        let response: KyResponse;

        try {
            response = await (client ?? this.client)(path, {
                ...kyOptions,
                method: options.method,
                searchParams: toUrlSearchParams(validQuery),
                json: validBody,
            });
        } catch (err) {
            if (err instanceof BaseError) {
                throw err;
            }

            if (isHTTPError(err)) {
                const requestBody = await err.request.text().catch(() => '');
                const responseBody = await err.response.text().catch(() => '');
                const error = new BCApiError(err, requestBody, responseBody);

                this.logger?.error(error.context, 'Request failed');

                throw error;
            }

            if (isTimeoutError(err)) {
                const error = new BCTimeoutError(err);

                this.logger?.error(error.context, 'Request timed out');

                throw error;
            }

            if (isKyError(err)) {
                throw new BCClientError('Client error', undefined, err);
            }

            throw new BCClientError('Unknown error', undefined, err);
        }

        let text: string;

        try {
            text = await response.text();
        } catch (err) {
            throw new BCResponseParseError(options.method, path, err, '');
        }

        let res: TRes;

        try {
            res = JSON.parse(text);
        } catch (err) {
            throw new BCResponseParseError(options.method, path, err, text);
        }

        this.logger?.debug(
            { method: options.method, url: response.url, status: response.status },
            'Successful request',
        );

        return this.validate(
            res,
            responseSchema,
            BCResponseValidationError,
            options.method,
            path,
            'Invalid API response',
        );
    }

    private async validate<T>(
        data: unknown,
        schema: StandardSchemaV1<T> | undefined,
        ErrorClass: new (
            message: string,
            method: string,
            path: string,
            data: unknown,
            error: StandardSchemaV1.FailureResult,
        ) => BCSchemaValidationError,
        method: string,
        path: string,
        message?: string,
    ): Promise<T> {
        if (!schema) {
            return data as T;
        }

        const result = await schema['~standard'].validate(data);

        if (result.issues) {
            throw new ErrorClass(message ?? 'Validation failed', method, path, data, result);
        }

        return result.value;
    }

    private makePath(version: ApiVersion, route: string): string {
        return `stores/${this.storeHash}/${version}/${route.replace(LEADING_SLASHES, '')}`;
    }

    private validateConfig() {
        const { accessToken, storeHash } = this.config;
        const errors: string[] = [];

        // Using reasonable assumptions about these credentials for validation.
        // This will not verify the credentials but at least guard against providing
        // something completely invalid like empty string
        if (typeof storeHash !== 'string' || storeHash.length <= 0) {
            errors.push('storeHash is empty');
        }

        if (typeof accessToken !== 'string' || accessToken.length <= 0) {
            errors.push('accessToken is empty');
        }

        if (this.config.prefixUrl) {
            try {
                new URL(this.config.prefixUrl);
            } catch (err) {
                throw new BCClientError('Invalid prefixUrl', undefined, err);
            }
        }

        try {
            this.validateConcurrency(this.config.concurrency);
        } catch (err) {
            if (err instanceof BCClientError) {
                errors.push(err.message);
            } else {
                throw err;
            }
        }

        if (errors.length > 0) {
            throw new BCCredentialsError(errors);
        }
    }

    private validateConcurrency(concurrency: number | undefined | false) {
        if (concurrency === undefined) {
            return;
        }

        if (concurrency === false) {
            return concurrency;
        }

        if (concurrency <= 0 || concurrency > MAX_CONCURRENCY) {
            throw new BCClientError(`Invalid concurrency: allowed range (1:${MAX_CONCURRENCY})`, undefined);
        }
    }
}
