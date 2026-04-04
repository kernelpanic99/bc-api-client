import type { Options as KyOptions } from 'ky';
import type { ConcurrencyOptions } from './common';
import type { StandardSchemaV1 } from './standard-schema';

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

type QuerySchemaOptions<TQuery extends Query> =
    | { query: TQuery; querySchema: StandardSchemaV1<TQuery> }
    | { query?: TQuery; querySchema?: never };

type BodySchemaOptions<TBody> =
    | { body: TBody; bodySchema: StandardSchemaV1<TBody> }
    | { body?: TBody; bodySchema?: never };

export type RequestOptions<TBody, TRes, TQuery extends Query> = BaseKyRequest &
    QuerySchemaOptions<TQuery> &
    BodySchemaOptions<TBody> & {
        method: HttpMethod;
        version?: ApiVersion;
        responseSchema?: StandardSchemaV1<TRes>;
    };

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

export type BatchRequestOptions<TBody, TRes, TQuery extends Query> = {
    path: string;
} & RequestOptions<TBody, TRes, TQuery>;

export const req = {
    get: <TRes, TQuery extends Query = Query>(
        path: string,
        options?: GetOptions<TRes, TQuery>,
    ): BatchRequestOptions<never, TRes, TQuery> =>
        ({ method: 'GET', path, ...options }) as BatchRequestOptions<never, TRes, TQuery>,

    post: <TRes, TBody = unknown, TQuery extends Query = Query>(
        path: string,
        options?: PostOptions<TBody, TRes, TQuery>,
    ): BatchRequestOptions<TBody, TRes, TQuery> =>
        ({ method: 'POST', path, ...options }) as BatchRequestOptions<TBody, TRes, TQuery>,

    put: <TRes, TBody = unknown, TQuery extends Query = Query>(
        path: string,
        options?: PutOptions<TBody, TRes, TQuery>,
    ): BatchRequestOptions<TBody, TRes, TQuery> =>
        ({ method: 'PUT', path, ...options }) as BatchRequestOptions<TBody, TRes, TQuery>,

    delete: <TQuery extends Query = Query>(
        path: string,
        options?: DeleteOptions<TQuery>,
    ): BatchRequestOptions<never, never, TQuery> =>
        ({ method: 'DELETE', path, ...options }) as BatchRequestOptions<never, never, TQuery>,
};

export type CollectOptions<TItem, TQuery extends Query> = ConcurrencyOptions &
    Omit<GetOptions<TItem, TQuery>, 'responseSchema' | 'version'> & {
        itemSchema?: StandardSchemaV1<TItem>;
    };

export type CountedCollectOptions<TItem, TQuery extends Query> = CollectOptions<TItem, TQuery> & {
    count?: number;
};

export type QueryOptions<TItem, TQuery extends Query> = CollectOptions<TItem, TQuery> & {
    key: string;
    values: (string | number)[];
};
