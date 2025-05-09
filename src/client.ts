import { V3Resource } from './core';
import { BASE_URL, RateLimitOptions, RequestError, RequestOptions, StoreOptions, request } from './net';
import { chunk, range } from 'remeda';
import { chunkStrLength } from './util';

const MAX_PAGE_SIZE = 250;
const DEFAULT_CONCURRENCY = 10;

/**
 * Options for GET requests to the BigCommerce API
 */
export type GetOptions = {
    /** Query parameters to include in the request */
    query?: Record<string, string>;
    /** API version to use (v2 or v3) */
    version?: 'v2' | 'v3';
};

/**
 * Options for POST/PUT requests to the BigCommerce API
 */
export type PostOptions<T> = GetOptions & {
    /** Request body data */
    body: T;
};

/**
 * Options for controlling concurrent request behavior
 */
export type ConcurrencyOptions = {
    /** Maximum number of concurrent requests (default: 10) */
    concurrency?: number;
    /** Whether to skip errors and continue processing (default: false) */
    skipErrors?: boolean;
};

/**
 * Options for querying multiple values against a single filter field
 */
export type QueryOptions = Omit<GetOptions, 'version'> & ConcurrencyOptions & {
    /** The field name to query against */
    key: string;
    /** Array of values to query for */
    values: (string | number)[];
};

/**
 * Configuration options for the BigCommerce client
 */
export type Config = StoreOptions & RateLimitOptions & ConcurrencyOptions;

/**
 * Client for interacting with the BigCommerce API
 * 
 * This client provides methods for making HTTP requests to the BigCommerce API,
 * with support for both v2 and v3 endpoints, pagination, and concurrent requests.
 */
export class BigCommerceClient {
    /**
     * Creates a new BigCommerce client instance
     * @param config.storeHash - The store hash to use for the client
     * @param config.accessToken - The API access token to use for the client
     * @param config.maxRetries - (default: 5) The maximum number of retries for rate limit errors
     * @param config.maxDelay - (default: 60e3 - 1 minute) Maximum time to wait to retry in case of rate limit errors. If `X-Rate-Limit-Time-Reset-Ms` header is higher than `maxDelay`, the request will fail immediately.
     * @param config.concurrency - (default: 10) The default concurrency for concurrent methods
     * @param config.skipErrors - (default: false) Whether to skip errors during concurrent requests
     */
    constructor(private readonly config: Config) {}

    /**
     * Makes a GET request to the BigCommerce API
     * @param endpoint - The API endpoint to request
     * @param options.query - Query parameters to include in the request
     * @param options.version - API version to use (v2 or v3) (default: v3)
     * @returns Promise resolving to the response data of type `R`
     */
    async get<R>(endpoint: string, options?: GetOptions): Promise<R> {
        return request<never, R>({
            endpoint,
            method: 'GET',
            ...options,
            ...this.config,
        });
    }

    /**
     * Makes a POST request to the BigCommerce API
     * @param endpoint - The API endpoint to request
     * @param options.query - Query parameters to include in the request
     * @param options.version - API version to use (v2 or v3) (default: v3)
     * @param options.body - Request body data of type `T`
     * @returns Promise resolving to the response data of type `R`
     */
    async post<T, R>(endpoint: string, options?: PostOptions<T>): Promise<R> {
        return request<T, R>({
            endpoint,
            method: 'POST',
            ...options,
            ...this.config,
        });
    }

    /**
     * Makes a PUT request to the BigCommerce API
     * @param endpoint - The API endpoint to request
     * @param options.query - Query parameters to include in the request
     * @param options.version - API version to use (v2 or v3) (default: v3)
     * @param options.body - Request body data of type `T`
     * @returns Promise resolving to the response data of type `R`
     */
    async put<T, R>(endpoint: string, options?: PostOptions<T>): Promise<R> {
        return request<T, R>({
            endpoint,
            method: 'PUT',
            ...options,
            ...this.config,
        });
    }

    /**
     * Makes a DELETE request to the BigCommerce API
     * @param endpoint - The API endpoint to delete
     * @param options.version - API version to use (v2 or v3) (default: v3)
     * @returns Promise resolving to void
     */
    async delete<R>(endpoint: string, options?: Pick<GetOptions, 'version'>): Promise<void> {
        await request<never, R>({
            endpoint,
            method: 'DELETE',
            ...options,
            ...this.config,
        });
    }

    /**
     * Executes multiple requests concurrently with controlled concurrency
     * @param requests - Array of request options to execute
     * @param options.concurrency - Maximum number of concurrent requests, overrides the client's concurrency setting (default: 10)
     * @param options.skipErrors - Whether to skip errors and continue processing, overrides the client's skipErrors setting (default: false)
     * @returns Promise resolving to array of response data
     */
    async concurrent<T, R>(requests: RequestOptions<T>[], options?: ConcurrencyOptions): Promise<R[]> {
        const chunks = chunk(requests, options?.concurrency ?? this.config.concurrency ?? DEFAULT_CONCURRENCY);
        const skipErrors = options?.skipErrors ?? this.config.skipErrors ?? false;

        const results: R[] = [];

        for (const chunk of chunks) {
            const responses = await Promise.allSettled(
                chunk.map((opt) =>
                    request<T, R>({
                        ...opt,
                        ...this.config,
                    }),
                ),
            );

            responses.forEach((response) => {
                if (response.status === 'fulfilled') {
                    results.push(response.value);
                } else {
                    if (!skipErrors) {
                        throw response.reason;
                    } else {
                        console.warn(`Error in concurrent request: ${response.reason}`);
                    }
                }
            });
        }

        return results;
    }

    /**
     * Collects all pages of data from a paginated v3 API endpoint.
     * This method pulls the first page and uses pagination meta to collect the remaining pages concurrently.
     * @param endpoint - The API endpoint to request
     * @param options.query - Query parameters to include in the request
     * @param options.concurrency - Maximum number of concurrent requests, overrides the client's concurrency setting (default: 10)
     * @param options.skipErrors - Whether to skip errors and continue processing, overrides the client's skipErrors setting (default: false)
     * @returns Promise resolving to array of all items across all pages
     */
    async collect<T>(endpoint: string, options: Omit<GetOptions, 'version'> & ConcurrencyOptions): Promise<T[]> {
        if (options.query) {
            if (!options.query.limit) {
                options.query.limit = MAX_PAGE_SIZE.toString();
            }
        } else {
            options.query = { limit: MAX_PAGE_SIZE.toString() };
        }

        const first = await this.get<V3Resource<T[]>>(endpoint, options);

        if (!Array.isArray(first.data) || !first?.meta?.pagination?.total_pages) {
            return first.data;
        }

        const results: T[] = [...first.data];
        const pages = first.meta.pagination.total_pages;

        const remainingPages = range(2, pages + 1);

        const requests = remainingPages.map((page) => ({
            ...options,
            endpoint,
            query: { ...options.query, page: page.toString() },
        }));

        const responses = await this.concurrent<never, V3Resource<T[]>>(requests, options);

        responses.forEach((response) => {
            results.push(...response.data);
        });

        return results;
    }

    /**
     * Collects all pages of data from a paginated v2 API endpoint.
     * This method simply pulls all pages concurrently until a 204 is returned in a batch.
     * @param endpoint - The API endpoint to request
     * @param options.query - Query parameters to include in the request
     * @param options.concurrency - Maximum number of concurrent requests, overrides the client's concurrency setting (default: 10)
     * @param options.skipErrors - Whether to skip errors and continue processing, overrides the client's skipErrors setting (default: false)
     * @returns Promise resolving to array of all items across all pages
     */
    async collectV2<T>(endpoint: string, options: Omit<GetOptions, 'version'> & ConcurrencyOptions): Promise<T[]> {
        if (options.query) {
            if (!options.query.limit) {
                options.query.limit = MAX_PAGE_SIZE.toString();
            }
        } else {
            options.query = { limit: MAX_PAGE_SIZE.toString() };
        }

        let done = false;
        const results: T[] = [];
        let page = 1;
        const concurrency = options.concurrency ?? this.config.concurrency ?? DEFAULT_CONCURRENCY;

        while (!done) {
            const pages = range(page, page + concurrency);
            page += concurrency;

            const requests = pages.map((page) => ({
                ...options,
                endpoint,
                version: 'v2' as const,
                query: { ...options.query, page: page.toString() },
            }));

            const responses = await Promise.allSettled(requests.map((request) => this.get<T[]>(endpoint, request)));

            responses.forEach((response) => {
                if (response.status === 'fulfilled') {
                    if (response.value) {
                        results.push(...response.value);
                    } else {
                        done = true;
                    }
                } else {
                    if (response.reason instanceof RequestError && response.reason.status === 404) {
                        done = true;
                    } else {
                        if (!(options.skipErrors ?? this.config.skipErrors ?? false)) {
                            throw response.reason;
                        } else {
                            console.warn(`Error in collectV2: ${response.reason}`);
                        }
                    }
                }
            });
        }

        return results;
    }

    /**
     * Queries multiple values against a single field using the v3 API. 
     * If the url + query params are too long, the query will be chunked. Otherwise, this method acts like `collect`.
     * This method does not check for uniqueness of the `values` array.
     * 
     * @param endpoint - The API endpoint to request
     * @param options.key - The field name to query against e.g. `sku:in`
     * @param options.values - Array of values to query for e.g. `['123', '456', ...]`
     * @param options.query - Additional query parameters
     * @param options.concurrency - Maximum number of concurrent requests, overrides the client's concurrency setting (default: 10)
     * @param options.skipErrors - Whether to skip errors and continue processing, overrides the client's skipErrors setting (default: false)
     * @returns Promise resolving to array of matching items
     */
    async query<T>(endpoint: string, options: QueryOptions): Promise<T[]> {
        if(options.query) {
            if(!options.query.limit) {
                options.query.limit = MAX_PAGE_SIZE.toString();
            }
        } else {
            options.query = { limit: MAX_PAGE_SIZE.toString() };
        }

        const {limit:_, ...restQuery} = options.query;
        // Only needed to calculate the offset for chunking
        const fullUrl = `${BASE_URL}${this.config.storeHash}/v3/${endpoint}?${new URLSearchParams(restQuery).toString()}`;

        const queryStr = options.values.map((value) => `${value}`)
        const chunks = chunkStrLength(queryStr, {
            offset: fullUrl.length,
            chunkLength: Number.parseInt(options.query?.limit) || MAX_PAGE_SIZE,
        });

        const requests = chunks.map((chunk) => ({
            ...options,
            endpoint,
            query: { ...options.query, [options.key]: chunk.join(',') },
        }));

        const responses = await this.concurrent<never, V3Resource<T[]>>(requests, options);

        return responses.flatMap((response) => response.data);
    }
}
