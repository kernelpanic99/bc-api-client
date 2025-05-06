import { V3Resource } from './core';
import { RateLimitOptions, RequestOptions, StoreOptions, request } from './net';
import { chunk, range } from 'remeda';

const MAX_PAGE_SIZE = 250;

type GetOptions = {
    endpoint: string;
    query?: Record<string, string>;
    version?: 'v3' | 'v2';
};

type PostOptions<T> = {
    endpoint: string;
    query?: Record<string, string>;
    body: T;
    version?: 'v3' | 'v2';
};

type Config = StoreOptions & RateLimitOptions;

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

    async concurrent<T, R>(requests: RequestOptions<T>[], concurrency = 10): Promise<R[]> {
        const chunks = chunk(requests, concurrency);

        const results = await Promise.all(
            chunks.map((chunk) =>
                Promise.all(
                    chunk.map((opt) =>
                        request<T, R>({
                            ...opt,
                            ...this.config,
                        }),
                    ),
                ),
            ),
        );

        return results.flat();
    }

    async collect<T>(options: Omit<GetOptions, 'version'>, concurrency = 10): Promise<T[]> {
        if (options.query) {
            options.query.limit = MAX_PAGE_SIZE.toString();
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

        const responses = await this.concurrent<never, V3Resource<T[]>>(requests, concurrency);

        responses.forEach((response) => {
            results.push(...response.data);
        });

        return results;
    }
}
