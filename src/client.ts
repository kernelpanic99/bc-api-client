import ky, { isHTTPError, isKyError, isTimeoutError, type KyInstance, type KyResponse } from 'ky';
import {
    type ApiVersion,
    BASE_KY_CONFIG,
    type ClientConfig,
    type DeleteOptions,
    type GetOptions,
    HEADERS,
    type Logger,
    type PostOptions,
    type PutOptions,
    type Query,
    type RequestOptions,
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

const LEADING_SLASHES = /^\/+/;

export class BigCommerceClient {
    private readonly logger?: Logger;
    private readonly client: KyInstance;
    private readonly storeHash: string;

    constructor(private readonly config: ClientConfig) {
        this.validateCredentials();

        const { storeHash, accessToken, logger, ...kyOptions } = config;

        if (kyOptions.prefixUrl) {
            try {
                new URL(kyOptions.prefixUrl);
            } catch (err) {
                throw new BCClientError('Invalid prefixUrl', err);
            }
        }

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
            method: 'GET',
            ...options,
        });
    }

    async post<TBody, TRes, TQuery extends Query = Query>(
        path: string,
        options?: PostOptions<TBody, TRes, TQuery>,
    ): Promise<TRes> {
        return this.request<TBody, TRes, TQuery>(path, {
            method: 'POST',
            ...options,
        });
    }

    async put<TBody, TRes, TQuery extends Query = Query>(
        path: string,
        options?: PutOptions<TBody, TRes, TQuery>,
    ): Promise<TRes> {
        return this.request<TBody, TRes, TQuery>(path, {
            method: 'PUT',
            ...options,
        });
    }

    async delete<TRes = never, TQuery extends Query = Query>(
        path: string,
        options?: DeleteOptions<TQuery>,
    ): Promise<void> {
        try {
            await this.request<never, TRes, TQuery>(path, {
                method: 'DELETE',
                ...options,
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

    private async request<TBody, TRes, TQuery extends Query = Query>(
        _path: string,
        options: RequestOptions<TBody, TRes, TQuery>,
    ) {
        const { version, query, body, bodySchema, querySchema, responseSchema, ...kyOptions } = options;

        const path = this.makePath(options.version ?? 'v3', _path);
        const validQuery = await this.validate(query, querySchema, 'Invalid query parameters');
        const validBody = await this.validate(body, bodySchema, `Invalid ${options.method} request body`);

        let response: KyResponse;

        try {
            response = await this.client(path, {
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
                throw new BCClientError('Client error', err);
            }

            throw new BCClientError('Unknown error', err);
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

    private validateCredentials() {
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
    }
}
