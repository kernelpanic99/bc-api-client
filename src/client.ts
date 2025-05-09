import { V3Resource } from './core';
import { BASE_URL, RateLimitOptions, RequestError, RequestOptions, StoreOptions, request } from './net';
import { chunk, range } from 'remeda';
import { chunkStrLength } from './util';

const MAX_PAGE_SIZE = 250;

/**
 * Options for GET requests to the BigCommerce API
 */
export type GetOptions = {
    /** The API endpoint to call */
    endpoint: string;
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
export type Config = StoreOptions & RateLimitOptions;

/**
 * Client for interacting with the BigCommerce API
 * 
 * This client provides methods for making HTTP requests to the BigCommerce API,
 * with support for both v2 and v3 endpoints, pagination, and concurrent requests.
 */
export class BigCommerceClient {
    /**
     * Creates a new BigCommerce client instance
     * @param config - Configuration options for the client
     */
    constructor(private readonly config: Config) {}

    /**
     * Makes a GET request to the BigCommerce API
     * @param options - Request options
     * @returns Promise resolving to the response data
     */
    async get<R>(options: GetOptions): Promise<R> {
        return request<never, R>({
            ...options,
            method: 'GET',
            ...this.config,
        });
    }

    /**
     * Makes a POST request to the BigCommerce API
     * @param options - Request options including body data
     * @returns Promise resolving to the response data
     */
    async post<T, R>(options: PostOptions<T>): Promise<R> {
        return request<T, R>({
            ...options,
            method: 'POST',
            ...this.config,
        });
    }

    /**
     * Makes a PUT request to the BigCommerce API
     * @param options - Request options including body data
     * @returns Promise resolving to the response data
     */
    async put<T, R>(options: PostOptions<T>): Promise<R> {
        return request<T, R>({
            ...options,
            method: 'PUT',
            ...this.config,
        });
    }

    /**
     * Makes a DELETE request to the BigCommerce API
     * @param endpoint - The API endpoint to delete
     */
    async delete<R>(endpoint: string): Promise<void> {
        await request<never, R>({
            endpoint,
            method: 'DELETE',
            ...this.config,
        });
    }

    /**
     * Executes multiple requests concurrently with controlled concurrency
     * @param requests - Array of request options to execute
     * @param options - Concurrency control options
     * @returns Promise resolving to array of response data
     */
    async concurrent<T, R>(requests: RequestOptions<T>[], options: ConcurrencyOptions): Promise<R[]> {
        const chunks = chunk(requests, options.concurrency ?? 10);
        const skipErrors = options.skipErrors ?? false;

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
     * Collects all pages of data from a paginated v3 API endpoint
     * @param options - Request options with pagination parameters
     * @returns Promise resolving to array of all items across all pages
     */
    async collect<T>(options: Omit<GetOptions, 'version'> & ConcurrencyOptions): Promise<T[]> {
        if (options.query) {
            if (!options.query.limit) {
                options.query.limit = MAX_PAGE_SIZE.toString();
            }
        } else {
            options.query = { limit: MAX_PAGE_SIZE.toString() };
        }

        const first = await this.get<V3Resource<T[]>>(options);

        if (!Array.isArray(first.data) || !first?.meta?.pagination?.total_pages) {
            return first.data;
        }

        const results: T[] = [...first.data];
        const pages = first.meta.pagination.total_pages;

        const remainingPages = range(2, pages + 1);

        const requests = remainingPages.map((page) => ({
            ...options,
            query: { ...options.query, page: page.toString() },
        }));

        const responses = await this.concurrent<never, V3Resource<T[]>>(requests, options);

        responses.forEach((response) => {
            results.push(...response.data);
        });

        return results;
    }

    /**
     * Collects all pages of data from a paginated v2 API endpoint
     * @param options - Request options with pagination parameters
     * @returns Promise resolving to array of all items across all pages
     */
    async collectV2<T>(options: Omit<GetOptions, 'version'> & ConcurrencyOptions): Promise<T[]> {
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
        const concurrency = options.concurrency ?? 10;

        while (!done) {
            const pages = range(page, page + concurrency);
            page += concurrency;

            const requests = pages.map((page) => ({
                ...options,
                version: 'v2' as const,
                query: { ...options.query, page: page.toString() },
            }));

            const responses = await Promise.allSettled(requests.map((request) => this.get<T[]>(request)));

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
                        if (!options.skipErrors) {
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
     * Queries multiple values against a single field using the v3 API
     * @param options - Query options including field name and values
     * @returns Promise resolving to array of matching items
     */
    async query<T>(options: QueryOptions): Promise<T[]> {
        if(options.query) {
            if(!options.query.limit) {
                options.query.limit = MAX_PAGE_SIZE.toString();
            }
        } else {
            options.query = { limit: MAX_PAGE_SIZE.toString() };
        }

        const {limit:_, ...restQuery} = options.query;
        // Only needed to calculate the offset for chunking
        const fullUrl = `${BASE_URL}${this.config.storeHash}/v3/${options.endpoint}?${new URLSearchParams(restQuery).toString()}`;

        const queryStr = options.values.map((value) => `${value}`)
        const chunks = chunkStrLength(queryStr, {
            offset: fullUrl.length,
            chunkLength: Number.parseInt(options.query?.limit) || MAX_PAGE_SIZE,
        });

        const requests = chunks.map((chunk) => ({
            ...options,
            query: { ...options.query, [options.key]: chunk.join(',') },
        }));

        const responses = await this.concurrent<never, V3Resource<T[]>>(requests, options);

        return responses.flatMap((response) => response.data);
    }
}
