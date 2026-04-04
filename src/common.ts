import type { Options as KyOptions } from 'ky';
import type { Logger, LogLevel } from './logger';
import type { StandardSchemaV1 } from './standard-schema';

export type { Logger, LogLevel };

export type ConcurrencyOptions = {
    concurrency?: number;
    backoff?: ((concurrency: number, status: number) => number) | number;
    rateLimitBackoff?: number;
    backoffRecover?: ((concurrency: number) => number) | number;
};

export const MAX_CONCURRENCY = 1000;
export const DEFAULT_CONCURRENCY = 10;
export const DEFAULT_RATE_LIMIT_BACKOFF = 1;
export const DEFAULT_BACKOFF_RATE = 2;
export const DEFAULT_BACKOFF_RECOVER = 1;

export interface ClientConfig extends KyOptions, ConcurrencyOptions {
    storeHash: string;
    accessToken: string;
    logger?: Logger | LogLevel | boolean;
}

/**
 * Random positive jitter within 0-500 ms in increments of 100
 * @param {number} delay
 */
export const rateLimitJitter = (delay: number) => delay + Math.floor(Math.random() * 6) * 100;

export const HEADERS = {
    AUTH_TOKEN: 'X-Auth-Token',
    ACCEPT: 'Accept',
    CONTENT_TYPE: 'Content-Type',
    RATE_LIMIT_LEFT: 'x-rate-limit-requests-left',
    RATE_LIMIT_RESET: 'x-rate-limit-time-reset-ms',
    RATE_LIMIT_QUOTA: 'x-rate-limit-requests-quota',
    RATE_LIMIT_WINDOW: 'x-rate-limit-time-window-ms',
} as const;

export type RateLimitMeta = {
    resetIn: number;
    requestsLeft?: number;
    quota?: number;
    window?: number;
};

export const BASE_KY_CONFIG = {
    prefixUrl: 'https://api.bigcommerce.com',
    // Some BC endpoints may take a while.
    // For example /catalog/product/options* endpoints may fully
    // recreate all variants in some cases
    timeout: 120e3,

    retry: {
        limit: 3,
        // BC uses PUT for many upsert operations, it's not guaranteed to be idempotent
        methods: ['GET', 'DELETE'],
        statusCodes: [429, 500, 502, 503, 504],
        // BC does not send standart Retry-After. We'll use custom beforeRetry hook
        afterStatusCodes: [],
        jitter: true,
        maxRetryAfter: 120e3,
    },

    headers: {
        [HEADERS.ACCEPT]: 'application/json',
        [HEADERS.CONTENT_TYPE]: 'application/json',
    },
};

export type ApiVersion = 'v3' | 'v2';

export type QueryValue = string | number | Array<string | number>;

export type Query = Record<string, QueryValue>;

export const toUrlSearchParams = (query?: Query): URLSearchParams | undefined => {
    if (!query) {
        return;
    }

    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
        if (Array.isArray(value)) {
            params.append(key, value.map(String).join(','));
        } else {
            params.append(key, String(value));
        }
    }

    return params;
};

export type HttpMethod = 'POST' | 'GET' | 'PUT' | 'DELETE';

type BaseKyRequest = Omit<KyOptions, 'json' | 'method' | 'searchQueryParams' | 'body'>;

export interface RequestOptions<TBody, TRes, TQuery extends Query> extends BaseKyRequest {
    method: HttpMethod;
    version?: ApiVersion;
    query?: TQuery;
    body?: TBody;
    responseSchema?: StandardSchemaV1<TRes>;
    bodySchema?: StandardSchemaV1<TBody>;
    querySchema?: StandardSchemaV1<TQuery>;
}

export type GetOptions<TRes, TQuery extends Query> = Omit<
    RequestOptions<never, TRes, TQuery>,
    'body' | 'bodySchema' | 'method'
>;

export type PostOptions<TBody, TRes, TQuery extends Query> = Omit<RequestOptions<TBody, TRes, TQuery>, 'method'>;
export type PutOptions<TBody, TRes, TQuery extends Query> = PostOptions<TBody, TRes, TQuery>;
export type DeleteOptions<TQuery extends Query> = Omit<
    RequestOptions<never, never, TQuery>,
    'body' | 'bodySchema' | 'method' | 'responseSchema'
>;

export type Ok<T> = {
    ok: true;
    data: T;
    err: undefined;
};

export type Err<E> = {
    ok: false;
    data: undefined;
    err: E;
};

export type Result<T, E> = Ok<T> | Err<E>;

export const Ok = <T, E>(data: T): Result<T, E> => ({ ok: true, data, err: undefined });
export const Err = <T, E>(err: E): Result<T, E> => ({ ok: false, data: undefined, err });

export type BatchRequestOptions<TBody, TRes, TQuery extends Query> = {
    path: string;
} & RequestOptions<TBody, TRes, TQuery>;

export const req = {
    get: <TRes, TQuery extends Query = Query>(
        path: string,
        options?: GetOptions<TRes, TQuery>,
    ): BatchRequestOptions<never, TRes, TQuery> => ({ method: 'GET', path, ...options }),

    post: <TRes, TBody = unknown, TQuery extends Query = Query>(
        path: string,
        options?: PostOptions<TBody, TRes, TQuery>,
    ): BatchRequestOptions<TBody, TRes, TQuery> => ({ method: 'POST', path, ...options }),

    put: <TRes, TBody = unknown, TQuery extends Query = Query>(
        path: string,
        options?: PutOptions<TBody, TRes, TQuery>,
    ): BatchRequestOptions<TBody, TRes, TQuery> => ({ method: 'PUT', path, ...options }),

    delete: <TQuery extends Query = Query>(
        path: string,
        options?: DeleteOptions<TQuery>,
    ): BatchRequestOptions<never, never, TQuery> => ({ method: 'DELETE', path, ...options }),
};

export type CollectOptions<TItem, TQuery extends Query> = ConcurrencyOptions &
    Omit<GetOptions<TItem, TQuery>, 'responseSchema'> & {
        itemSchema?: StandardSchemaV1<TItem>;
    };

export type ResolvedConcurrencyOptions = Required<ConcurrencyOptions>;

export type Pagination = {
    total: number;
    count: number;
    per_page: number;
    current_page: number;
    total_pages: number;
    links: {
        previous: string | null;
        current: string;
        next: string | null;
    };
};

export type V3Resource<T> = {
    data: T;
    meta: {
        pagination: Pagination;
    };
};
