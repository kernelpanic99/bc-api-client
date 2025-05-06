import { RateLimitOptions, StoreOptions, request } from "./net";

type GetOptions = {
    endpoint: string;
    query?: Record<string, string>;
    version?: 'v3' | 'v2';
}

type PostOptions<T> = {
    endpoint: string;
    query?: Record<string, string>;
    body: T;
    version?: 'v3' | 'v2';
}

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
}