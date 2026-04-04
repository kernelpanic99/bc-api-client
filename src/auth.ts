import * as jose from 'jose';
import ky, { isHTTPError, isTimeoutError } from 'ky';
import { BASE_KY_CONFIG } from './lib/common';
import {
    BCApiError,
    BCAuthInvalidJwtError,
    BCAuthInvalidRedirectUriError,
    BCAuthMissingParamError,
    BCAuthScopeMismatchError,
    BCClientError,
    BCTimeoutError,
} from './lib/errors';
import { initLogger, type Logger, type LogLevel } from './lib/logger';

/**
 * Configuration options for BigCommerce authentication
 */
export type BigCommerceAuthConfig = {
    /** The OAuth client ID from BigCommerce */
    clientId: string;
    /** The OAuth client secret from BigCommerce */
    secret: string;
    /** The redirect URI registered with BigCommerce */
    redirectUri: string;
    /** Optional array of scopes to validate during auth callback */
    scopes?: string[];
    /** Optional logger instance */
    logger?: Logger | LogLevel | boolean;
};

const GRANT_TYPE = 'authorization_code';
const TOKEN_ENDPOINT = 'https://login.bigcommerce.com/oauth2/token';
const ISSUER = 'bc';

/**
 * Query parameters received from BigCommerce auth callback
 */
export type BigCommerceAuthQuery = {
    /** The authorization code from BigCommerce */
    code: string;
    /** The granted OAuth scopes */
    scope: string;
    /** The store context */
    context: string;
};

/**
 * Request payload for token endpoint
 */
type TokenRequest = {
    client_id: string;
    client_secret: string;
    code: string;
    context: string;
    scope: string;
    grant_type: typeof GRANT_TYPE;
    redirect_uri: string;
};

/**
 * User information returned from BigCommerce
 */
export type User = {
    /** The user's ID */
    id: number;
    /** The user's username */
    username: string;
    /** The user's email address */
    email: string;
};

/**
 * Response from BigCommerce token endpoint
 */
export type TokenResponse = {
    /** The OAuth access token */
    access_token: string;
    /** The granted OAuth scopes */
    scope: string;
    /** Information about the authenticated user */
    user: User;
    /** Information about the store owner */
    owner: User;
    /** The store context */
    context: string;
    /** The BigCommerce account UUID */
    account_uuid: string;
};

/**
 * JWT claims from BigCommerce
 */
export type Claims = {
    /** JWT audience */
    aud: string;
    /** JWT issuer */
    iss: string;
    /** JWT issued at timestamp */
    iat: number;
    /** JWT not before timestamp */
    nbf: number;
    /** JWT expiration timestamp */
    exp: number;
    /** JWT unique identifier */
    jti: string;
    /** JWT subject */
    sub: string;
    /** Information about the authenticated user */
    user: {
        id: number;
        email: string;
        locale: string;
    };
    /** Information about the store owner */
    owner: {
        id: number;
        email: string;
    };
    /** The store URL */
    url: string;
    /** The channel ID (if applicable) */
    channel_id: number | null;
};

/**
 * Handles authentication with BigCommerce OAuth
 */
export class BigCommerceAuth {
    private readonly logger: Logger | undefined;
    private readonly client: ReturnType<typeof ky.create>;

    /**
     * Creates a new BigCommerceAuth instance for handling OAuth authentication
     * @param config - Configuration options for BigCommerce authentication
     * @param config.clientId - The OAuth client ID from BigCommerce
     * @param config.secret - The OAuth client secret from BigCommerce
     * @param config.redirectUri - The redirect URI registered with BigCommerce
     * @param config.scopes - Optional array of scopes to validate during auth callback
     * @param config.logger - Optional logger instance for debugging and error tracking
     * @throws {BCAuthInvalidRedirectUriError} If the redirect URI is invalid
     */
    constructor(private readonly config: BigCommerceAuthConfig) {
        try {
            new URL(this.config.redirectUri);
        } catch (error) {
            throw new BCAuthInvalidRedirectUriError(this.config.redirectUri, error);
        }

        this.logger = initLogger(config.logger);

        const { prefixUrl: _, ...authKyConfig } = BASE_KY_CONFIG;

        this.client = ky.create({
            ...authKyConfig,
            retry: {
                ...authKyConfig.retry,
                methods: ['POST'],
            },
        });
    }

    /**
     * Exchanges an OAuth authorization code for an access token.
     *
     * @param data - The auth callback payload: a raw query string, `URLSearchParams`, or a
     *   pre-parsed object with `code`, `scope`, and `context`.
     * @returns The token response including `access_token`, `user`, and `context`.
     * @throws {@link BCAuthMissingParamError} if `code`, `scope`, or `context` are absent.
     * @throws {@link BCAuthScopeMismatchError} if the granted scopes don't include all `config.scopes`.
     * @throws {@link BCApiError} on HTTP error responses from the token endpoint.
     * @throws {@link BCTimeoutError} if the token request times out.
     * @throws {@link BCClientError} on any other error.
     */
    async requestToken(data: string | BigCommerceAuthQuery | URLSearchParams): Promise<TokenResponse> {
        const query = typeof data === 'string' || data instanceof URLSearchParams ? this.parseQueryString(data) : data;

        this.validateScopes(query.scope);

        const tokenRequest: TokenRequest = {
            client_id: this.config.clientId,
            client_secret: this.config.secret,
            ...query,
            grant_type: GRANT_TYPE,
            redirect_uri: this.config.redirectUri,
        };

        this.logger?.debug(
            {
                clientId: this.config.clientId,
                context: query.context,
                scopes: query.scope,
            },
            'Requesting OAuth token',
        );

        let res: Response;

        try {
            res = await this.client(TOKEN_ENDPOINT, {
                method: 'POST',
                json: tokenRequest,
            });
        } catch (error) {
            if (isHTTPError(error)) {
                const requestBody = await error.request.text().catch(() => '');
                const responseBody = await error.response.text().catch(() => '');
                const err = new BCApiError(error, requestBody, responseBody);

                this.logger?.error(err.context, 'Failed to request token');

                throw err;
            }

            if (isTimeoutError(error)) {
                const err = new BCTimeoutError(error);

                this.logger?.error(err.context, 'Token request timed out');

                throw err;
            }

            throw new BCClientError('Failed to request token', {}, error);
        }

        return res.json() as Promise<TokenResponse>;
    }

    /**
     * Verifies a JWT payload from BigCommerce
     * @param jwtPayload - The JWT string to verify
     * @param storeHash - The store hash for the BigCommerce store
     * @returns Promise resolving to the verified JWT claims
     * @throws {BCAuthInvalidJwtError} If the JWT is invalid
     */
    async verify(jwtPayload: string, storeHash: string): Promise<Claims> {
        try {
            const secret = new TextEncoder().encode(this.config.secret);

            const { payload }: { payload: Claims } = await jose.jwtVerify(jwtPayload, secret, {
                audience: this.config.clientId,
                issuer: ISSUER,
                subject: `stores/${storeHash}`,
            });

            this.logger?.debug(
                {
                    userId: payload.user?.id,
                    storeHash: payload.sub.split('/')[1],
                },
                'JWT verified successfully',
            );

            return payload;
        } catch (error) {
            const err = new BCAuthInvalidJwtError(storeHash, error);

            this.logger?.error(err.context, 'JWT verification failed');

            throw err;
        }
    }

    /**
     * Parses and validates a query string from BigCommerce auth callback
     * @param queryString - The query string to parse
     * @returns The parsed auth query parameters
     * @throws {BCAuthMissingParamError} If required parameters are missing
     */
    private parseQueryString(queryString: string | URLSearchParams): BigCommerceAuthQuery {
        const params = typeof queryString === 'string' ? new URLSearchParams(queryString) : queryString;

        const code = params.get('code');
        const scope = params.get('scope');
        const context = params.get('context');

        if (!code) {
            throw new BCAuthMissingParamError('code');
        }

        if (!scope) {
            throw new BCAuthMissingParamError('scope');
        } else if (this.config.scopes?.length) {
            this.validateScopes(scope);
        }

        if (!context) {
            throw new BCAuthMissingParamError('context');
        }

        return {
            code,
            scope,
            context,
        };
    }

    /**
     * Validates that the granted scopes match the expected scopes
     * @param scopes - Space-separated list of granted scopes
     * @throws {BCAuthScopeMismatchError} If the scopes don't match the expected scopes
     */
    private validateScopes(scopes: string) {
        if (!this.config.scopes) {
            return;
        }

        const granted = scopes.split(' ');
        const expected = this.config.scopes;
        const missing = expected.filter((scope) => !granted.includes(scope));

        if (missing.length) {
            throw new BCAuthScopeMismatchError(granted, expected, missing);
        }
    }
}
