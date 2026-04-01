import ky, { isHTTPError, isKyError, isTimeoutError, type KyInstance, type KyResponse } from 'ky';
import pLimit, { type LimitFunction } from 'p-limit';
import {
    type ApiVersion,
    BASE_KY_CONFIG,
    type BatchRequestOptions,
    type ClientConfig,
    type ConcurrencyOptions,
    DEFAULT_BACKOFF_RATE,
    DEFAULT_BACKOFF_RECOVER,
    DEFAULT_CONCURRENCY,
    DEFAULT_RATE_LIMIT_BACKOFF,
    type DeleteOptions,
    Err,
    type GetOptions,
    HEADERS,
    type Logger,
    MAX_CONCURRENCY,
    Ok,
    type PostOptions,
    type PutOptions,
    type Query,
    type RequestOptions,
    type ResolvedConcurrencyOptions,
    type Result,
    toUrlSearchParams,
} from './common';
import {
    BaseError,
    BCApiError,
    BCClientError,
    BCCredentialsError,
    BCResponseParseError,
    BCSchemaValidationError,
    BCTimeoutError,
} from './errors';
import { bcRateLimitRetry, validateUrlLength } from './hooks';
import { initLogger } from './logger';
import type { StandardSchemaV1 } from './standard-schema';
import { AsyncChannel, stripKeys } from './util';

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

    async post<TBody, TRes, TQuery extends Query = Query>(
        path: string,
        options?: PostOptions<TBody, TRes, TQuery>,
    ): Promise<TRes> {
        return this.request<TBody, TRes, TQuery>(path, {
            ...options,
            method: 'POST',
        });
    }

    async put<TBody, TRes, TQuery extends Query = Query>(
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

    async *stream<TBody, TRes, TQuery extends Query>(
        requests: BatchRequestOptions<TBody, TRes, TQuery>[],
        options?: ConcurrencyOptions,
    ): AsyncGenerator<Result<TRes, BaseError>> {
        const resolved = this.resolveStreamOptions(options);
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
        const validQuery = await this.validate(query, querySchema, 'Invalid query parameters');
        const validBody = await this.validate(body, bodySchema, `Invalid ${options.method} request body`);

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

        return this.validate(res, responseSchema, 'Invalid API response');
    }

    private async validate<T>(data: unknown, schema?: StandardSchemaV1<T>, message?: string): Promise<T> {
        if (!schema) {
            return data as T;
        }

        const result = await schema['~standard'].validate(data);

        if (result.issues) {
            throw new BCSchemaValidationError(message ?? 'Validation failed', data, result);
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

    private validateConcurrency(concurrency: number | undefined) {
        if (concurrency === undefined) {
            return;
        }

        if (concurrency <= 0 || concurrency > MAX_CONCURRENCY) {
            throw new BCClientError(`Invalid concurrency: allowed range (1:${MAX_CONCURRENCY})`, undefined);
        }
    }
}
