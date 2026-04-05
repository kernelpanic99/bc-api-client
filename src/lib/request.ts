import type { Options as KyOptions } from 'ky';
import type { ConcurrencyOptions } from './common';
import type { StandardSchemaV1 } from './standard-schema';

/** BigCommerce API versions supported by the client. */
export type ApiVersion = 'v3' | 'v2';

/** Valid query parameter value types. */
export type QueryValue = string | number | Array<string | number>;

/** Query parameter object for API requests. */
export type Query = Record<string, QueryValue>;

/**
 * Converts a Query object to URLSearchParams.
 * Array values are joined with commas (e.g., `id:in=1,2,3`).
 */
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

/** Supported HTTP methods for API requests. */
export type HttpMethod = 'POST' | 'GET' | 'PUT' | 'DELETE';

/** @internal */
type BaseKyRequest = Omit<
    KyOptions,
    'json' | 'method' | 'searchQueryParams' | 'body' | 'throwHttpErrors' | 'parseJson'
>;

/** @internal */
type QuerySchemaOptions<TQuery extends Query> =
    /** Query parameters to send with the request. */
    { query: TQuery; querySchema: StandardSchemaV1<TQuery> } | { query?: TQuery; querySchema?: never };

/** @internal */
type BodySchemaOptions<TBody> =
    /** Request body, serialized as JSON. */
    { body: TBody; bodySchema: StandardSchemaV1<TBody> } | { body?: TBody; bodySchema?: never };

/**
 * Full request options for direct API calls.
 * @see {@link GetOptions}, {@link PostOptions}, {@link PutOptions}, {@link DeleteOptions}
 */
export type RequestOptions<TBody, TRes, TQuery extends Query> = BaseKyRequest &
    QuerySchemaOptions<TQuery> &
    BodySchemaOptions<TBody> & {
        /** HTTP method for the request. */
        method: HttpMethod;
        /** API version to use. Defaults to `'v3'`. */
        version?: ApiVersion;
        /** Schema to validate the response body. */
        responseSchema?: StandardSchemaV1<TRes>;
    };

/** Options for GET requests. */
export type GetOptions<TRes, TQuery extends Query> = Omit<
    RequestOptions<never, TRes, TQuery>,
    'body' | 'bodySchema' | 'method'
>;

/** Options for POST requests. */
export type PostOptions<TBody, TRes, TQuery extends Query> = Omit<RequestOptions<TBody, TRes, TQuery>, 'method'>;

/** Options for PUT requests. */
export type PutOptions<TBody, TRes, TQuery extends Query> = PostOptions<TBody, TRes, TQuery>;

/** Options for DELETE requests. */
export type DeleteOptions<TQuery extends Query> = Omit<
    RequestOptions<never, never, TQuery>,
    'body' | 'bodySchema' | 'method' | 'responseSchema'
>;

/**
 * Request descriptor for batch operations.
 * Use the {@link req} helpers to construct these.
 */
export type BatchRequestOptions<TBody, TRes, TQuery extends Query> = {
    path: string;
} & RequestOptions<TBody, TRes, TQuery>;

/**
 * Helpers for building typed request descriptors to pass to
 * {@link BigCommerceClient.batchSafe} or {@link BigCommerceClient.batchStream}.
 *
 * @example
 * ```ts
 * const results = await client.batchSafe([
 *   req.get('catalog/products/1'),
 *   req.post('catalog/products', { body: { name: 'Widget' } }),
 * ]);
 * ```
 */
export const req = {
    /**
     * Builds a GET request descriptor.
     * @param path - API path relative to the store's versioned base URL.
     * @param options - Optional query params, schemas, and ky options.
     */
    get: <TRes, TQuery extends Query = Query>(
        path: string,
        options?: GetOptions<TRes, TQuery>,
    ): BatchRequestOptions<never, TRes, TQuery> =>
        ({ method: 'GET', path, ...options }) as BatchRequestOptions<never, TRes, TQuery>,

    /**
     * Builds a POST request descriptor.
     * @param path - API path relative to the store's versioned base URL.
     * @param options - Optional body, query params, schemas, and ky options.
     */
    post: <TRes, TBody = unknown, TQuery extends Query = Query>(
        path: string,
        options?: PostOptions<TBody, TRes, TQuery>,
    ): BatchRequestOptions<TBody, TRes, TQuery> =>
        ({ method: 'POST', path, ...options }) as BatchRequestOptions<TBody, TRes, TQuery>,

    /**
     * Builds a PUT request descriptor.
     * @param path - API path relative to the store's versioned base URL.
     * @param options - Optional body, query params, schemas, and ky options.
     */
    put: <TRes, TBody = unknown, TQuery extends Query = Query>(
        path: string,
        options?: PutOptions<TBody, TRes, TQuery>,
    ): BatchRequestOptions<TBody, TRes, TQuery> =>
        ({ method: 'PUT', path, ...options }) as BatchRequestOptions<TBody, TRes, TQuery>,

    /**
     * Builds a DELETE request descriptor.
     * @param path - API path relative to the store's versioned base URL.
     * @param options - Optional query params and ky options.
     */
    delete: <TQuery extends Query = Query>(
        path: string,
        options?: DeleteOptions<TQuery>,
    ): BatchRequestOptions<never, never, TQuery> =>
        ({ method: 'DELETE', path, ...options }) as BatchRequestOptions<never, never, TQuery>,
};

/**
 * Options for v3 paginated collection operations ({@link BigCommerceClient.collect}, {@link BigCommerceClient.stream}).
 */
export type CollectOptions<TItem, TQuery extends Query> = ConcurrencyOptions &
    Omit<GetOptions<TItem, TQuery>, 'responseSchema' | 'version'> & {
        /** Schema to validate each item in the response. */
        itemSchema?: StandardSchemaV1<TItem>;
    };

export type BlindOptions<TItem, TQuery extends Query> = Omit<CollectOptions<TItem, TQuery>, 'version'> & {
    maxPages?: number;
};

/**
 * Options for v2 paginated operations with known count ({@link BigCommerceClient.collectCount}, {@link BigCommerceClient.streamCount}).
 */
export type CountedCollectOptions<TItem, TQuery extends Query> = CollectOptions<TItem, TQuery> & {
    /** Total number of items expected (for v2 endpoints without pagination metadata). */
    count?: number;
};

/**
 * Options for query-based filtering operations ({@link BigCommerceClient.query}, {@link BigCommerceClient.queryStream}).
 */
export type QueryOptions<TItem, TQuery extends Query> = CollectOptions<TItem, TQuery> & {
    /** Query parameter name for value filtering (e.g., `'id:in'`). */
    key: string;
    /** Values to filter by. Automatically chunked across multiple requests. */
    values: (string | number)[];
};
