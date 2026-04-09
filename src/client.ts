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
    DEFAULT_MAX_BLIND_PAGES,
    DEFAULT_RATE_LIMIT_BACKOFF,
    HEADERS,
    LEADING_SLASHES,
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
    type BlindOptions,
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
import { type BatchResult, Err, Ok, type PageResult, type Result } from './lib/result';
import type { StandardSchemaV1 } from './lib/standard-schema';
import { AsyncChannel, chunkStrLength } from './lib/util';

export class BigCommerceClient {
    private readonly logger?: Logger;
    private readonly client: KyInstance;
    private readonly storeHash: string;

    /**
     * Creates a new BigCommerceClient.
     *
     * @param config - Client configuration. Ky options (e.g. `prefixUrl`, `timeout`, `retry`,
     *   `hooks`) are forwarded to the underlying ky instance.
     * @param config.storeHash - BigCommerce store hash. Must be a non-empty string.
     * @param config.accessToken - BigCommerce API access token. Must be a non-empty string.
     * @param config.logger - A {@link Logger} instance, a log level string
     *   (`'debug' | 'info' | 'warn' | 'error'`), `true` to enable console logging at `'info'`
     *   level, or `false` to disable logging entirely. Omitting also defaults to `'info'` level.
     * @param config.concurrency - Default max concurrent requests for batch/stream operations.
     *   Must be between 1 and 1000. Pass `false` to disable concurrency (sequential execution).
     *   Defaults to 10.
     * @param config.rateLimitBackoff - Concurrency cap applied when a 429 response is received.
     *   Defaults to 1.
     * @param config.backoff - Divisor (or `(concurrency, status) => number` function) applied to
     *   concurrency on non-429 error responses. Defaults to 2.
     * @param config.backoffRecover - Amount (or `(concurrency) => number` function) added to
     *   concurrency per successful response while below the configured max. Defaults to 1.
     *
     * @throws {@link BCCredentialsError} if `storeHash` or `accessToken` are missing.
     * @throws {@link BCClientError} if `prefixUrl` is not a valid URL or `concurrency` is out of range.
     */
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

    /**
     * Sends a GET request to the given path.
     *
     * @param path - API path relative to the store's versioned base URL (e.g. `catalog/products`).
     * @param options - Ky options are forwarded to the underlying request.
     * @param options.version - API version segment inserted into the URL. Defaults to `'v3'`.
     * @param options.query - Query parameters to append to the URL.
     * @param options.querySchema - StandardSchemaV1 schema to validate `query` before the request
     *   is sent. Requires `query` to be provided.
     * @param options.responseSchema - StandardSchemaV1 schema to validate the parsed response body.
     *
     * @returns Parsed and optionally validated response body.
     *
     * @throws {@link BCApiError} on HTTP error responses.
     * @throws {@link BCTimeoutError} if the request times out.
     * @throws {@link BCResponseParseError} if the response body cannot be parsed.
     * @throws {@link BCUrlTooLongError} if the constructed URL exceeds 2048 characters.
     * @throws {@link BCRateLimitNoHeadersError} if a 429 is received without rate-limit headers.
     * @throws {@link BCRateLimitDelayTooLongError} if the rate-limit reset window exceeds
     *   `config.retry.maxRetryAfter`.
     * @throws {@link BCQueryValidationError} if `querySchema` validation fails.
     * @throws {@link BCResponseValidationError} if `responseSchema` validation fails.
     * @throws {@link BCClientError} on any other ky or unknown error.
     */
    async get<TRes = unknown, TQuery extends Query = Query>(
        path: string,
        options?: GetOptions<TRes, TQuery>,
    ): Promise<TRes> {
        return this.request<never, TRes, TQuery>(path, {
            ...options,
            method: 'GET',
        } as RequestOptions<never, TRes, TQuery>);
    }

    /**
     * Sends a POST request to the given path.
     *
     * @param path - API path relative to the store's versioned base URL.
     * @param options - Ky options are forwarded to the underlying request.
     * @param options.version - API version segment inserted into the URL. Defaults to `'v3'`.
     * @param options.body - Request body, serialized as JSON.
     * @param options.bodySchema - StandardSchemaV1 schema to validate `body` before the request
     *   is sent. Requires `body` to be provided.
     * @param options.query - Query parameters to append to the URL.
     * @param options.querySchema - StandardSchemaV1 schema to validate `query` before the request
     *   is sent. Requires `query` to be provided.
     * @param options.responseSchema - StandardSchemaV1 schema to validate the parsed response body.
     *
     * @returns Parsed and optionally validated response body.
     *
     * @throws {@link BCApiError} on HTTP error responses.
     * @throws {@link BCTimeoutError} if the request times out.
     * @throws {@link BCResponseParseError} if the response body cannot be parsed.
     * @throws {@link BCUrlTooLongError} if the constructed URL exceeds 2048 characters.
     * @throws {@link BCRateLimitNoHeadersError} if a 429 is received without rate-limit headers.
     * @throws {@link BCRateLimitDelayTooLongError} if the rate-limit reset window exceeds
     *   `config.retry.maxRetryAfter`.
     * @throws {@link BCQueryValidationError} if `querySchema` validation fails.
     * @throws {@link BCRequestBodyValidationError} if `bodySchema` validation fails.
     * @throws {@link BCResponseValidationError} if `responseSchema` validation fails.
     * @throws {@link BCClientError} on any other ky or unknown error.
     */
    async post<TRes = unknown, TBody = unknown, TQuery extends Query = Query>(
        path: string,
        options?: PostOptions<TBody, TRes, TQuery>,
    ): Promise<TRes> {
        return this.request<TBody, TRes, TQuery>(path, {
            ...options,
            method: 'POST',
        } as RequestOptions<TBody, TRes, TQuery>);
    }

    /**
     * Sends a PUT request to the given path.
     *
     * @param path - API path relative to the store's versioned base URL.
     * @param options - Ky options are forwarded to the underlying request.
     * @param options.version - API version segment inserted into the URL. Defaults to `'v3'`.
     * @param options.body - Request body, serialized as JSON.
     * @param options.bodySchema - StandardSchemaV1 schema to validate `body` before the request
     *   is sent. Requires `body` to be provided.
     * @param options.query - Query parameters to append to the URL.
     * @param options.querySchema - StandardSchemaV1 schema to validate `query` before the request
     *   is sent. Requires `query` to be provided.
     * @param options.responseSchema - StandardSchemaV1 schema to validate the parsed response body.
     *
     * @returns Parsed and optionally validated response body.
     *
     * @throws {@link BCApiError} on HTTP error responses.
     * @throws {@link BCTimeoutError} if the request times out.
     * @throws {@link BCResponseParseError} if the response body cannot be parsed.
     * @throws {@link BCUrlTooLongError} if the constructed URL exceeds 2048 characters.
     * @throws {@link BCRateLimitNoHeadersError} if a 429 is received without rate-limit headers.
     * @throws {@link BCRateLimitDelayTooLongError} if the rate-limit reset window exceeds
     *   `config.retry.maxRetryAfter`.
     * @throws {@link BCQueryValidationError} if `querySchema` validation fails.
     * @throws {@link BCRequestBodyValidationError} if `bodySchema` validation fails.
     * @throws {@link BCResponseValidationError} if `responseSchema` validation fails.
     * @throws {@link BCClientError} on any other ky or unknown error.
     */
    async put<TRes = unknown, TBody = unknown, TQuery extends Query = Query>(
        path: string,
        options?: PutOptions<TBody, TRes, TQuery>,
    ): Promise<TRes> {
        return this.request<TBody, TRes, TQuery>(path, {
            ...options,
            method: 'PUT',
        } as RequestOptions<TBody, TRes, TQuery>);
    }

    /**
     * Sends a DELETE request to the given path.
     *
     * Silently suppresses 404 responses (resource already gone) and empty response bodies.
     *
     * @param path - API path relative to the store's versioned base URL.
     * @param options - Ky options are forwarded to the underlying request.
     * @param options.version - API version segment inserted into the URL. Defaults to `'v3'`.
     * @param options.query - Query parameters to append to the URL.
     * @param options.querySchema - StandardSchemaV1 schema to validate `query` before the request
     *   is sent. Requires `query` to be provided.
     *
     * @throws {@link BCApiError} on non-404 HTTP error responses.
     * @throws {@link BCTimeoutError} if the request times out.
     * @throws {@link BCResponseParseError} if the response body is non-empty and cannot be parsed.
     * @throws {@link BCUrlTooLongError} if the constructed URL exceeds 2048 characters.
     * @throws {@link BCRateLimitNoHeadersError} if a 429 is received without rate-limit headers.
     * @throws {@link BCRateLimitDelayTooLongError} if the rate-limit reset window exceeds
     *   `config.retry.maxRetryAfter`.
     * @throws {@link BCQueryValidationError} if `querySchema` validation fails.
     * @throws {@link BCClientError} on any other ky or unknown error.
     */
    async delete<TRes = never, TQuery extends Query = Query>(
        path: string,
        options?: DeleteOptions<TQuery>,
    ): Promise<void> {
        try {
            await this.request<never, TRes, TQuery>(path, {
                ...options,
                method: 'DELETE',
            } as RequestOptions<never, TRes, TQuery>);
        } catch (err) {
            if (err instanceof BCResponseParseError && err.context.rawBody === '') {
                return;
            }

            // Do not throw on delete for resources that are already gone.
            if (err instanceof BCApiError && err.context.status === 404) {
                this.logger?.warn({ err }, 'Attempted to delete the resource that is already gone');

                return;
            }

            throw err;
        }
    }

    /**
     * Fetches items from a v3 paginated endpoint by splitting `values` across multiple requests
     * using the given `key` query param, chunking to stay within URL length limits.
     *
     * Collects all results into an array. Use {@link queryStream} to process items lazily.
     *
     * **Sorting and concurrency:** when `concurrency > 1`, chunks complete out of order so
     * sorted output is not preserved across the full result set. Pass `concurrency: false`
     * if sort order matters.
     *
     * @param path - API path relative to the store's versioned base URL.
     * @param options - Query options including `key`, `values`, pagination params, and concurrency
     *   controls.
     * @param options.key - Query parameter name used for value filtering (e.g. `'id:in'`).
     * @param options.values - Values to filter by. Automatically chunked across multiple requests
     *   to keep each URL under 2048 characters.
     * @param options.query - Additional query parameters. `query.limit` controls page size
     *   (default 250, must be > 0). If `options.key` is present in `query` it will be ignored.
     * @param options.querySchema - StandardSchemaV1 schema to validate `query`. Requires `query`
     *   to be provided.
     * @param options.itemSchema - StandardSchemaV1 schema to validate each returned item.
     * @param options.concurrency - Max concurrent chunk requests. Must be 1–1000. `false` for
     *   sequential. Defaults to `config.concurrency`, or 10 if not set on the client.
     * @param options.rateLimitBackoff - Concurrency cap on 429 responses. Defaults to
     *   `config.rateLimitBackoff`, or 1 if not set on the client.
     * @param options.backoff - Divisor (or function) applied to concurrency on error responses.
     *   Defaults to `config.backoff`, or 2 if not set on the client.
     * @param options.backoffRecover - Amount (or function) added to concurrency per successful
     *   response. Defaults to `config.backoffRecover`, or 1 if not set on the client.
     *
     * @returns All matching items across all chunked requests.
     * @throws {@link BCPaginatedOptionError} if `query.limit` is not a positive number.
     * @throws {@link BCQueryValidationError} if `querySchema` validation fails.
     * @throws {@link BCApiError} on HTTP error responses.
     * @throws {@link BCTimeoutError} if a request times out.
     * @throws {@link BCResponseParseError} if a response body cannot be parsed.
     * @throws {@link BCUrlTooLongError} if a constructed URL exceeds 2048 characters.
     * @throws {@link BCRateLimitNoHeadersError} if a 429 is received without rate-limit headers.
     * @throws {@link BCRateLimitDelayTooLongError} if the rate-limit reset window exceeds
     *   `config.retry.maxRetryAfter`.
     * @throws {@link BCPaginatedResponseError} if a page response has an unexpected shape.
     * @throws {@link BCPaginatedItemValidationError} if `itemSchema` validation fails for an item.
     * @throws {@link BCClientError} on any other ky or unknown error.
     */
    async query<TItem = unknown, TQuery extends Query = Query>(
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

    /**
     * Streaming variant of {@link query}. Yields each item individually as results arrive,
     * splitting `values` into URL-length-safe chunks across concurrent requests.
     *
     * Each yielded value is a {@link Result} — check `err` before using `data`.
     *
     * **Sorting and concurrency:** when `concurrency > 1`, chunks complete out of order so
     * sorted output is not preserved across the full result set. Pass `concurrency: false`
     * if sort order matters.
     *
     * @param path - API path relative to the store's versioned base URL.
     * @param options - Query options including `key`, `values`, pagination params, and concurrency
     *   controls.
     * @param options.key - Query parameter name used for value filtering (e.g. `'id:in'`).
     * @param options.values - Values to filter by. Automatically chunked across multiple requests
     *   to keep each URL under 2048 characters.
     * @param options.query - Additional query parameters. `query.limit` controls page size
     *   (default 250, must be > 0). If `options.key` is present in `query` it will be ignored.
     * @param options.querySchema - StandardSchemaV1 schema to validate `query`. Requires `query`
     *   to be provided.
     * @param options.itemSchema - StandardSchemaV1 schema to validate each returned item.
     * @param options.concurrency - Max concurrent chunk requests. Must be 1–1000. `false` for
     *   sequential. Defaults to `config.concurrency`, or 10 if not set on the client.
     * @param options.rateLimitBackoff - Concurrency cap on 429 responses. Defaults to
     *   `config.rateLimitBackoff`, or 1 if not set on the client.
     * @param options.backoff - Divisor (or function) applied to concurrency on error responses.
     *   Defaults to `config.backoff`, or 2 if not set on the client.
     * @param options.backoffRecover - Amount (or function) added to concurrency per successful
     *   response. Defaults to `config.backoffRecover`, or 1 if not set on the client.
     * @throws {@link BCPaginatedOptionError} if `query.limit` is not a positive number.
     * @throws {@link BCQueryValidationError} if `querySchema` validation fails.
     */
    async *queryStream<TItem = unknown, TQuery extends Query = Query>(
        path: string,
        options: QueryOptions<TItem, TQuery>,
    ): AsyncGenerator<Result<TItem, BaseError>> {
        const {
            key,
            values,
            query,
            querySchema,
            itemSchema,
            concurrency,
            rateLimitBackoff,
            backoff,
            backoffRecover,
            ...requestOptions
        } = options;

        const limit = this.validatePaginationOption(path, 'limit', query?.limit ?? DEFAULT_LIMIT);

        const validatedQuery = await this.validate(
            query,
            querySchema,
            BCQueryValidationError,
            'GET',
            path,
            'Invalid query parameters',
        );

        const newQuery: Query = {
            ...validatedQuery,
            limit,
        };

        if (key in newQuery) {
            this.logger?.warn({ key }, 'The provided key is already in the query params, this param will be ignored');

            delete newQuery[key];
        }

        const url = this.config.prefixUrl ?? requestOptions.prefixUrl ?? BASE_KY_CONFIG.prefixUrl;
        const fullPath = this.makePath('v3', path);
        const fullQuery = toUrlSearchParams({ ...newQuery, page: 1 });
        const fullUrl = `${url}/${fullPath}?${fullQuery}`;
        const keyOverhead = encodeURIComponent(key).length + 2; // `&key=` or `key=` prefix

        const chunks = chunkStrLength(values.map(String), {
            chunkLength: limit,
            maxLength: MAX_URL_LENGTH,
            offset: fullUrl.length + keyOverhead,
            separatorSize: encodeURIComponent(',').length,
        });

        const requests = chunks.map((chunk) =>
            req.get(path, {
                ...requestOptions,
                query: {
                    ...newQuery,
                    page: 1,
                    [key]: chunk,
                },
            }),
        );

        for await (const { err, data } of this.batchStream(requests, {
            concurrency,
            rateLimitBackoff,
            backoff,
            backoffRecover,
        })) {
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

    /**
     * Fetches all pages from a v3 paginated endpoint and collects items into an array.
     *
     * Use {@link stream} to process items lazily without buffering the full result set.
     *
     * **Sorting and concurrency:** the first page is fetched sequentially; remaining pages are
     * fetched concurrently and may complete out of order. When `concurrency > 1`, sort order
     * is not preserved across pages. Pass `concurrency: false` if sort order matters.
     *
     * @param path - API path relative to the store's versioned base URL.
     * @param options - Ky options are forwarded to page requests.
     * @param options.query - Query parameters. `query.limit` controls page size (default 250,
     *   must be > 0). `query.page` sets the starting page (default 1, must be > 0).
     * @param options.querySchema - StandardSchemaV1 schema to validate `query`. Requires `query`
     *   to be provided.
     * @param options.itemSchema - StandardSchemaV1 schema to validate each returned item.
     * @param options.concurrency - Max concurrent page requests for pages after the first.
     *   Must be 1–1000. `false` for sequential. Defaults to `config.concurrency`, or 10 if not
     *   set on the client.
     * @param options.rateLimitBackoff - Concurrency cap on 429 responses. Defaults to
     *   `config.rateLimitBackoff`, or 1 if not set on the client.
     * @param options.backoff - Divisor (or function) applied to concurrency on error responses.
     *   Defaults to `config.backoff`, or 2 if not set on the client.
     * @param options.backoffRecover - Amount (or function) added to concurrency per successful
     *   response. Defaults to `config.backoffRecover`, or 1 if not set on the client.
     * @returns All items across all pages.
     *
     * @throws {@link BCPaginatedOptionError} if `query.limit` or `query.page` is not a positive number.
     * @throws {@link BCQueryValidationError} if `querySchema` validation fails.
     * @throws {@link BCApiError} on HTTP error responses.
     * @throws {@link BCTimeoutError} if a request times out.
     * @throws {@link BCResponseParseError} if a response body cannot be parsed.
     * @throws {@link BCUrlTooLongError} if a constructed URL exceeds 2048 characters.
     * @throws {@link BCRateLimitNoHeadersError} if a 429 is received without rate-limit headers.
     * @throws {@link BCRateLimitDelayTooLongError} if the rate-limit reset window exceeds
     *   `config.retry.maxRetryAfter`.
     * @throws {@link BCPaginatedResponseError} if a page response has an unexpected shape.
     * @throws {@link BCPaginatedItemValidationError} if `itemSchema` validation fails for an item.
     * @throws {@link BCClientError} on any other ky or unknown error.
     */
    async collect<TItem = unknown, TQuery extends Query = Query>(
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

    /**
     * Fetches all pages from a v2 flat-array endpoint and collects items into an array.
     *
     * Pagination is discovered dynamically — pages are fetched in batches until an empty page,
     * a 404, or a 204 response is received. No prior knowledge of total count is required.
     *
     * Use {@link streamBlind} to process items lazily without buffering the full result set.
     *
     * **Sorting and concurrency:** pages within each batch are fetched concurrently and may
     * complete out of order. When `concurrency > 1`, sort order is not preserved across pages.
     * Pass `concurrency: false` if sort order matters.
     *
     * @param path - API path relative to the store's versioned base URL (always requests v2).
     * @param options - Ky options are forwarded to page requests.
     * @param options.query - Query parameters. `query.limit` controls page size (default 250,
     *   must be > 0). `query.page` sets the starting page (default 1, must be > 0).
     * @param options.querySchema - StandardSchemaV1 schema to validate `query`. Requires `query`
     *   to be provided.
     * @param options.itemSchema - StandardSchemaV1 schema to validate each returned item.
     * @param options.maxPages - Maximum number of pages to fetch before stopping (default 500,
     *   must be > 0). A warning is logged if this limit is reached.
     * @param options.concurrency - Max concurrent page requests per batch. Must be 1–1000.
     *   `false` for sequential. Defaults to `config.concurrency`, or 10 if not set on the client.
     * @param options.rateLimitBackoff - Concurrency cap on 429 responses. Defaults to
     *   `config.rateLimitBackoff`, or 1 if not set on the client.
     * @param options.backoff - Divisor (or function) applied to concurrency on error responses.
     *   Defaults to `config.backoff`, or 2 if not set on the client.
     * @param options.backoffRecover - Amount (or function) added to concurrency per successful
     *   response. Defaults to `config.backoffRecover`, or 1 if not set on the client.
     * @returns All items across all pages.
     *
     * @throws {@link BCPaginatedOptionError} if `query.limit`, `query.page`, or `maxPages` is not a positive number.
     * @throws {@link BCQueryValidationError} if `querySchema` validation fails.
     * @throws {@link BCPaginatedItemValidationError} if `itemSchema` validation fails for an item.
     * @throws {@link BCClientError} if a page returns a non-array response, or on any other error.
     * @throws {@link BCApiError} on non-terminating HTTP error responses.
     * @throws {@link BCTimeoutError} if a request times out.
     * @throws {@link BCResponseParseError} if a response body cannot be parsed.
     */
    async collectBlind<TItem = unknown, TQuery extends Query = Query>(
        path: string,
        options?: BlindOptions<TItem, TQuery>,
    ): Promise<TItem[]> {
        const results: TItem[] = [];

        for await (const { err, data } of this.streamBlind(path, options)) {
            if (err) {
                throw err;
            } else {
                results.push(data);
            }
        }

        return results;
    }

    /**
     * Lazily streams items from a v2 flat-array endpoint, page by page.
     *
     * Pagination is discovered dynamically — pages are fetched in concurrent batches until an
     * empty page, a 404, or a 204 response is received. No prior knowledge of total count is
     * required. Each item is yielded as a {@link PageResult}: `Ok(item)` on success or
     * `Err(error)` for item-level validation failures and non-terminating page errors.
     * Use `page` to correlate the item back to its source page.
     *
     * Use {@link collectBlind} to buffer all results into an array (throws on any error).
     *
     * **Sorting and concurrency:** pages within each batch are fetched concurrently and may
     * complete out of order. When `concurrency > 1`, sort order is not preserved across pages.
     * Pass `concurrency: false` if sort order matters.
     *
     * @param path - API path relative to the store's versioned base URL (always requests v2).
     * @param options - Ky options are forwarded to page requests.
     * @param options.query - Query parameters. `query.limit` controls page size (default 250,
     *   must be > 0). `query.page` sets the starting page (default 1, must be > 0).
     * @param options.querySchema - StandardSchemaV1 schema to validate `query`. Requires `query`
     *   to be provided.
     * @param options.itemSchema - StandardSchemaV1 schema to validate each returned item.
     * @param options.maxPages - Maximum number of pages to fetch before stopping (default 500,
     *   must be > 0). A warning is logged if this limit is reached.
     * @param options.concurrency - Max concurrent page requests per batch. Must be 1–1000.
     *   `false` for sequential. Defaults to `config.concurrency`, or 10 if not set on the client.
     * @param options.rateLimitBackoff - Concurrency cap on 429 responses. Defaults to
     *   `config.rateLimitBackoff`, or 1 if not set on the client.
     * @param options.backoff - Divisor (or function) applied to concurrency on error responses.
     *   Defaults to `config.backoff`, or 2 if not set on the client.
     * @param options.backoffRecover - Amount (or function) added to concurrency per successful
     *   response. Defaults to `config.backoffRecover`, or 1 if not set on the client.
     *
     * @throws {@link BCPaginatedOptionError} if `query.limit`, `query.page`, or `maxPages` is not a positive number.
     * @throws {@link BCQueryValidationError} if `querySchema` validation fails.
     *
     * @yields `Ok(item)` for each successfully fetched and validated item.
     * @yields `Err(BCPaginatedItemValidationError)` when `itemSchema` rejects an item.
     * @yields `Err(BCClientError)` when a page returns a non-array response.
     * @yields `Err(error)` for non-terminating page errors (e.g. non-404/204 HTTP errors).
     */
    async *streamBlind<TItem = unknown, TQuery extends Query = Query>(
        path: string,
        options?: BlindOptions<TItem, TQuery>,
    ): AsyncGenerator<PageResult<TItem, BaseError>> {
        const {
            query: rawQuery,
            querySchema,
            itemSchema,
            maxPages: rawMaxPages,
            concurrency: rawConcurrency,
            rateLimitBackoff,
            backoff,
            backoffRecover,
            pLimit: rawPLimit,
            ...requestOptions
        } = options ?? {};

        const concurrency = this.validateConcurrency(rawConcurrency ?? this.config.concurrency ?? DEFAULT_CONCURRENCY);
        const limiter = rawPLimit ?? (concurrency ? pLimit({ concurrency, rejectOnClear: true }) : undefined);

        const concurrencyOptions = {
            concurrency: rawConcurrency,
            rateLimitBackoff,
            backoff,
            backoffRecover,
            pLimit: limiter,
        };

        const query = await this.validate(rawQuery, querySchema, BCQueryValidationError, 'GET', path);
        const page = this.validatePaginationOption(path, 'page', query?.page ?? 1);
        const limit = this.validatePaginationOption(path, 'limit', query?.limit ?? DEFAULT_LIMIT);
        const maxPages = this.validatePaginationOption(path, 'maxPages', rawMaxPages ?? DEFAULT_MAX_BLIND_PAGES);

        let done = false;
        let currentPage = page;

        do {
            if (currentPage > maxPages) {
                this.logger?.warn({ currentPage }, 'Blind pagination reached maxPages before the end of the data');
                break;
            }

            const batchSize = (limiter?.concurrency ?? concurrency) || 1;
            const batchStartPage = currentPage;
            const pageRequests = Array.from({ length: batchSize }, (_, i) => currentPage + i).map((page) =>
                req.get(path, {
                    ...requestOptions,
                    version: 'v2',
                    query: {
                        ...query,
                        page,
                        limit,
                    },
                }),
            );

            currentPage += batchSize;

            const pages = await this.batchSafe(pageRequests, concurrencyOptions);

            for (const { err, data, index } of pages) {
                const itemPage = batchStartPage + index;

                if (err) {
                    done =
                        (err instanceof BCApiError && err.context.status === 404) ||
                        (err instanceof BCResponseParseError &&
                            err.context.rawBody === '' &&
                            err.context.status === 204);

                    if (!done) {
                        yield { ...Err(err), page: itemPage };
                    }
                } else {
                    if (Array.isArray(data)) {
                        if (data.length === 0) {
                            done = true;
                            break;
                        }

                        for (const item of data) {
                            yield { ...(await this.validatePaginatedItem(path, item, itemSchema)), page: itemPage };
                        }
                    } else {
                        yield {
                            ...Err(
                                new BCClientError('Received non array response from blind pagination page endpoint', {
                                    data,
                                    path,
                                }),
                            ),
                            page: itemPage,
                        };
                    }
                }
            }
        } while (!done);
    }

    /**
     * Executes multiple requests concurrently and returns all results as {@link BatchResult}
     * values, never throwing. Errors from individual requests are captured as `Err` results.
     *
     * Results arrive in completion order, not input order. Use the `index` field on each
     * {@link BatchResult} to correlate a result back to its position in the `requests` array.
     *
     * Use {@link batchStream} to process results as they arrive rather than waiting for all.
     *
     * @param requests - Array of request descriptors built with the {@link req} helpers.
     * @param options.concurrency - Max concurrent requests. Must be 1–1000. `false` for
     *   sequential. Defaults to `config.concurrency`, or 10 if not set on the client.
     * @param options.rateLimitBackoff - Concurrency cap on 429 responses. Defaults to
     *   `config.rateLimitBackoff`, or 1 if not set on the client.
     * @param options.backoff - Divisor (or function) applied to concurrency on error responses.
     *   Defaults to `config.backoff`, or 2 if not set on the client.
     * @param options.backoffRecover - Amount (or function) added to concurrency per successful
     *   response. Defaults to `config.backoffRecover`, or 1 if not set on the client.
     *
     * @returns {@link BatchResult} array in the order requests completed (not input order).
     */
    async batchSafe<TRes = unknown, TBody = unknown, TQuery extends Query = Query>(
        requests: BatchRequestOptions<TBody, TRes, TQuery>[],
        options?: ConcurrencyOptions,
    ): Promise<BatchResult<TRes, BaseError>[]> {
        const results: BatchResult<TRes, BaseError>[] = [];

        for await (const res of this.batchStream(requests, options)) {
            results.push(res);
        }

        return results;
    }

    /**
     * Streams all items from a v3 paginated endpoint, fetching the first page sequentially
     * and remaining pages concurrently via {@link batchStream}.
     *
     * Each yielded value is a {@link PageResult} — check `err` before using `data`, and use
     * `page` to correlate the item back to its source page. Use
     * {@link collect} to gather all items into an array.
     *
     * **Sorting and concurrency:** the first page is fetched sequentially; remaining pages are
     * fetched concurrently and may complete out of order. When `concurrency > 1`, sort order
     * is not preserved across pages. Pass `concurrency: false` if sort order matters.
     *
     * @param path - API path relative to the store's versioned base URL.
     * @param options - Ky options are forwarded to page requests.
     * @param options.query - Query parameters. `query.limit` controls page size (default 250,
     *   must be > 0). `query.page` sets the starting page (default 1, must be > 0). If the API
     *   enforces a different limit, the actual `per_page` from the first response is used for
     *   subsequent pages.
     * @param options.querySchema - StandardSchemaV1 schema to validate `query`. Requires `query`
     *   to be provided.
     * @param options.itemSchema - StandardSchemaV1 schema to validate each returned item.
     * @param options.concurrency - Max concurrent page requests for pages after the first.
     *   Must be 1–1000. `false` for sequential. Defaults to `config.concurrency`, or 10 if not
     *   set on the client.
     * @param options.rateLimitBackoff - Concurrency cap on 429 responses. Defaults to
     *   `config.rateLimitBackoff`, or 1 if not set on the client.
     * @param options.backoff - Divisor (or function) applied to concurrency on error responses.
     *   Defaults to `config.backoff`, or 2 if not set on the client.
     * @param options.backoffRecover - Amount (or function) added to concurrency per successful
     *   response. Defaults to `config.backoffRecover`, or 1 if not set on the client.
     * @throws {@link BCPaginatedOptionError} if `query.limit` or `query.page` is not a positive number.
     * @throws {@link BCQueryValidationError} if `querySchema` validation fails.
     */
    async *stream<TItem = unknown, TQuery extends Query = Query>(
        path: string,
        options?: CollectOptions<TItem, TQuery>,
    ): AsyncGenerator<PageResult<TItem, BaseError>> {
        const {
            query,
            querySchema,
            itemSchema,
            concurrency,
            rateLimitBackoff,
            backoff,
            backoffRecover,
            ...requestOptions
        } = options ?? {};

        let limit = this.validatePaginationOption(path, 'limit', query?.limit ?? DEFAULT_LIMIT);
        const page = this.validatePaginationOption(path, 'page', query?.page ?? 1);

        const validatedQuery = await this.validate(
            query,
            querySchema,
            BCQueryValidationError,
            'GET',
            path,
            'Invalid query parameters',
        );

        let firstPageMeta: V3Resource<unknown[]>['meta'];

        try {
            const firstPage = await this.get(path, {
                ...requestOptions,
                query: {
                    ...validatedQuery,
                    page,
                    limit,
                } as unknown as TQuery,
            });

            const { data, meta } = this.assertPaginatedResponse(path, firstPage);

            firstPageMeta = meta;

            // Validate and return the first page
            for (const item of data) {
                yield { ...(await this.validatePaginatedItem(path, item, itemSchema)), page };
            }
        } catch (err) {
            if (err instanceof BaseError) {
                yield { ...Err(err), page };
            } else {
                yield {
                    ...Err(new BCClientError('Unknown error occurred fetching first page', {}, { cause: err })),
                    page,
                };
            }

            return;
        }

        const { total_pages, per_page } = firstPageMeta.pagination;

        if (limit !== per_page) {
            this.logger?.warn({ limit, actual: per_page }, 'API enforces alternate limit on this endpoint');
            limit = per_page;
        }

        // Fetch other pages using batchStream
        const requests = Array.from({ length: total_pages - page }, (_, i) => i + page + 1).map((page) => ({
            method: 'GET' as const,
            path,
            ...requestOptions,
            query: {
                ...validatedQuery,
                limit,
                page,
            },
        }));

        for await (const pageRes of requests.length > 0
            ? this.batchStream(requests, { concurrency, rateLimitBackoff, backoff, backoffRecover })
            : []) {
            const { data: pageData, err, index } = pageRes;
            const pageNum = page + index + 1;

            if (err) {
                yield { ...Err(err), page: pageNum };
                continue;
            }

            try {
                const { data } = this.assertPaginatedResponse(path, pageData);

                for (const item of data) {
                    yield { ...(await this.validatePaginatedItem(path, item, itemSchema)), page: pageNum };
                }
            } catch (err) {
                if (err instanceof BaseError) {
                    yield { ...Err(err), page: pageNum };
                } else {
                    yield {
                        ...Err(new BCClientError('Unknown error occurred processing page', {}, { cause: err })),
                        page: pageNum,
                    };
                }
            }
        }
    }

    /**
     * Executes multiple requests with configurable concurrency, yielding each result as a
     * {@link BatchResult} as it completes. Errors from individual requests are yielded as `Err`
     * results rather than thrown.
     *
     * Results arrive in completion order, not input order. Use the `index` field on each
     * {@link BatchResult} to correlate a result back to its position in the `requests` array.
     *
     * Automatically adjusts concurrency up/down in response to rate-limit and error responses.
     * Use {@link batchSafe} to collect all results into an array.
     *
     * **Caution:** the generator is making requests concurrently. As a consequence if a
     * request is mutating the remote (POST, DELETE) and `for await` loop is exited early,
     * the in-flight request may or may not commit the mutation, and the results of
     * these request WILL NOT be yielded. If you do intent to break the loop early and want to
     * get all the results, set `concurrency: false` to trade concurrency for deterministic behavior.
     *
     * @param requests - Array of request descriptors built with the {@link req} helpers.
     * @param options.concurrency - Max concurrent requests. Must be 1–1000. `false` for
     *   sequential. Defaults to `config.concurrency`, or 10 if not set on the client.
     * @param options.rateLimitBackoff - Concurrency cap on 429 responses. Defaults to
     *   `config.rateLimitBackoff`, or 1 if not set on the client.
     * @param options.backoff - Divisor (or function) applied to concurrency on error responses.
     *   Defaults to `config.backoff`, or 2 if not set on the client.
     * @param options.backoffRecover - Amount (or function) added to concurrency per successful
     *   response. Defaults to `config.backoffRecover`, or 1 if not set on the client.
     */
    async *batchStream<TRes = unknown, TBody = unknown, TQuery extends Query = Query>(
        requests: BatchRequestOptions<TBody, TRes, TQuery>[],
        options?: ConcurrencyOptions,
    ): AsyncGenerator<BatchResult<TRes, BaseError>> {
        const resolved = this.resolveStreamOptions(options);

        if (resolved.concurrency) {
            const limit = resolved.pLimit ?? pLimit({ concurrency: resolved.concurrency, rejectOnClear: true });
            const client = this.makeStreamClient(limit, resolved);
            const channel = new AsyncChannel<BatchResult<TRes, BaseError>>();

            try {
                Promise.all(
                    requests.map((req, index) =>
                        limit(() =>
                            this.request(req.path, req, client).then(
                                (val) => channel.push({ ...Ok(val), index }),
                                (err) => channel.push({ ...Err(err), index }),
                            ),
                        ),
                    ),
                )
                    .catch((err) => this.logger?.warn({ err }, 'In-flight concurrent requests aborted'))
                    .finally(() => channel.close());

                for await (const item of channel) {
                    yield item;
                }
            } finally {
                limit.clearQueue();
            }
        } else {
            for (const [index, request] of requests.entries()) {
                try {
                    const res = await this.request(request.path, request);

                    yield { ...Ok(res), index };
                } catch (err) {
                    if (err instanceof BaseError) {
                        yield { ...Err(err), index };
                    } else {
                        yield { ...Err(new BCClientError('Unknown error in batchStream', {}, { cause: err })), index };
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
            pLimit: options?.pLimit,
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
        rawPath: string,
        options: RequestOptions<TBody, TRes, TQuery>,
        client?: KyInstance,
    ) {
        const { version, query, body, bodySchema, querySchema, responseSchema, ...kyOptions } = options;

        const path = this.makePath(options.version ?? 'v3', rawPath);
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
            throw new BCResponseParseError(options.method, path, response.status, err, query, '');
        }

        let res: TRes;

        try {
            res = JSON.parse(text);
        } catch (err) {
            throw new BCResponseParseError(options.method, path, response.status, err, query, text);
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

        if (errors.length > 0) {
            throw new BCCredentialsError(errors);
        }

        if (this.config.prefixUrl) {
            try {
                new URL(this.config.prefixUrl);
            } catch (err) {
                throw new BCClientError('Invalid prefixUrl', undefined, err);
            }
        }

        this.validateConcurrency(this.config.concurrency);
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

        return concurrency;
    }
}
