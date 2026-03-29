import ky, { type KyInstance, type SearchParamsOption } from 'ky';
import { type ApiVersion, BASE_KY_CONFIG, type ClientConfig, HEADERS, type Logger } from './common';
import { BigCommerceCredentialsError } from './errors';
import { bcRateLimitRetry, logResponse, validateUrlLength } from './hooks';
import { initLogger } from './logger';

const LEADING_SLASHES = /^\/+/;

export type GetOptions<Q extends SearchParamsOption> = {
    version?: ApiVersion;
    query?: Q;
};

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
                beforeRequest: [validateUrlLength],
                beforeRetry: [bcRateLimitRetry(this.logger)],
                afterResponse: [logResponse(this.logger)],
            },
        });
    }

    // Stub GET to satisfy linter complaining about unused properties
    async get<T, Q extends SearchParamsOption = SearchParamsOption>(
        path: string,
        { version, query }: GetOptions<Q>,
    ): Promise<T> {
        const route = this.makePath(version ?? 'v3', path);

        return this.client.get(route, { searchParams: query }).json<T>();
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
