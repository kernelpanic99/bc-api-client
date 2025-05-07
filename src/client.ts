import { V3Resource } from './core';
import { RateLimitOptions, RequestError, RequestOptions, StoreOptions, request } from './net';
import { chunk, range } from 'remeda';
import { chunkStrLength } from './util';

const MAX_PAGE_SIZE = 250;

export type GetOptions = {
    endpoint: string;
    query?: Record<string, string>;
    version?: 'v2' | 'v3';
};

export type PostOptions<T> = GetOptions & {
    body: T;
};

export type ConcurrencyOptions = {
    concurrency?: number;
    skipErrors?: boolean;
};

export type QueryOptions = Omit<GetOptions, 'version'> & ConcurrencyOptions & {
    key: string;
    values: (string | number)[];
};

export type Config = StoreOptions & RateLimitOptions;

export class BigCommerceClient {
    constructor(private readonly config: Config) {}

    async get<R>(options: GetOptions): Promise<R> {
        return request<never, R>({
            ...options,
            method: 'GET',
            ...this.config,
        });
    }

    async post<T, R>(options: PostOptions<T>): Promise<R> {
        return request<T, R>({
            ...options,
            method: 'POST',
            ...this.config,
        });
    }

    async put<T, R>(options: PostOptions<T>): Promise<R> {
        return request<T, R>({
            ...options,
            method: 'PUT',
            ...this.config,
        });
    }

    async delete<R>(endpoint: string): Promise<void> {
        await request<never, R>({
            endpoint,
            method: 'DELETE',
            ...this.config,
        });
    }

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

    async query<T>(options: QueryOptions): Promise<T[]> {
        const queryStr = options.values.map((value) => `${value}`)
        const chunks = chunkStrLength(queryStr, {
            chunkLength: MAX_PAGE_SIZE
        });

        const requests = chunks.map((chunk) => ({
            ...options,
            query: { ...options.query, [options.key]: chunk.join(',') },
        }));

        const responses = await this.concurrent<never, T[]>(requests, options);

        return responses.flat();
    }
}
