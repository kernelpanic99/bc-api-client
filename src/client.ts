import ky, { type KyInstance } from 'ky';
import {
    type ApiVersion,
    BASE_KY_CONFIG,
    type ClientConfig,
    HEADERS,
    type Logger,
    type Query,
    type RequestOptions,
    toUrlSearchParams,
    type ValidationBehavior,
} from './common';
import { BigCommerceCredentialsError, BigCommerceSchemaValidationError } from './errors';
import { bcRateLimitRetry, logResponse, validateUrlLength } from './hooks';
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
                beforeRetry: [bcRateLimitRetry(this.logger), ...(kyOptions.hooks?.beforeRetry ?? [])],
                afterResponse: [logResponse(this.logger), ...(kyOptions.hooks?.afterResponse ?? [])],
            },
        });
    }

    async get<T, Q extends Query = Query>(
        path: string,
        { version, query, responseSchema, querySchema, onInvalid }: RequestOptions<T, Q>,
    ): Promise<T> {
        const validQuery = querySchema
            ? await this.validate<Q>(query, querySchema, 'Invalid query params', onInvalid)
            : query;

        const route = this.makePath(version ?? 'v3', path);

        const result = await this.client.get(route, { searchParams: toUrlSearchParams(validQuery) }).json();

        return responseSchema ? this.validate(result, responseSchema, 'Invalid response', onInvalid) : (result as T);
    }

    private async validate<T>(
        data: unknown,
        schema: StandardSchemaV1<T>,
        message?: string,
        behavior?: ValidationBehavior,
    ): Promise<T> {
        const onInvalid = behavior ?? this.config.onInvalid ?? 'throw';

        const result = await schema['~standard'].validate(data);

        if (result.issues) {
            const msg = message ?? 'Validation failed';

            if (typeof onInvalid === 'function') {
                return onInvalid(result, data) as T;
            } else if (onInvalid === 'throw') {
                this.logger?.error({ data, result }, msg);

                throw new BigCommerceSchemaValidationError(msg, data, result);
            }

            this.logger?.[onInvalid === 'warn' ? 'warn' : 'debug']({ data, result }, msg);
            return data as T;
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
            throw new BigCommerceCredentialsError(errors);
        }
    }
}
