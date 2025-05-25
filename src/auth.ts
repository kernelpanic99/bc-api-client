import ky, { HTTPError } from 'ky';
import * as jose from 'jose';
import { Logger } from './core';

/**
 * Configuration options for BigCommerce authentication
 */
type Config = {
    /** The OAuth client ID from BigCommerce */
    clientId: string;
    /** The OAuth client secret from BigCommerce */
    secret: string;
    /** The redirect URI registered with BigCommerce */
    redirectUri: string;
    /** Optional array of scopes to validate during auth callback */
    scopes?: string[];
    /** Optional logger instance */
    logger?: Logger;
};

const GRANT_TYPE = 'authorization_code';
const TOKEN_ENDPOINT = 'https://login.bigcommerce.com/oauth2/token';
const ISSUER = 'bc';

/**
 * Query parameters received from BigCommerce auth callback
 */
type AuthQuery = {
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
}

/**
 * Handles authentication with BigCommerce OAuth
 */
export class BigCommerceAuth {
    /**
     * Creates a new BigCommerceAuth instance for handling OAuth authentication
     * @param config - Configuration options for BigCommerce authentication
     * @param config.clientId - The OAuth client ID from BigCommerce
     * @param config.secret - The OAuth client secret from BigCommerce
     * @param config.redirectUri - The redirect URI registered with BigCommerce
     * @param config.scopes - Optional array of scopes to validate during auth callback
     * @param config.logger - Optional logger instance for debugging and error tracking
     * @throws {Error} If the redirect URI is invalid
     */
    constructor(private readonly config: Config) {
        try {
            new URL(this.config.redirectUri);
        } catch (error) {
            throw new Error('Invalid redirect URI', { cause: error });
        }
    }

    /**
     * Requests an access token from BigCommerce
     * @param data - Either a query string, URLSearchParams, or AuthQuery object containing auth callback data
     * @returns Promise resolving to the token response
     */
    async requestToken(data: string | AuthQuery | URLSearchParams) {
        const query = typeof data === 'string' || data instanceof URLSearchParams ? this.parseQueryString(data) : data;

        this.validateScopes(query.scope);

        const tokenRequest: TokenRequest = {
            client_id: this.config.clientId,
            client_secret: this.config.secret,
            ...query,
            grant_type: GRANT_TYPE,
            redirect_uri: this.config.redirectUri,
        };

        this.config.logger?.debug({
            clientId: this.config.clientId,
            context: query.context,
            scopes: query.scope
        }, 'Requesting OAuth token');

        let res: Response;

        try {
            res = await ky(TOKEN_ENDPOINT, {
                method: 'POST',
                json: tokenRequest,
            });
        } catch (error) {
            if(error instanceof HTTPError) {
                const text = await error.response.text();

                this.config.logger?.error({
                    err: {
                        name: error.name,
                        message: error.message,
                        text
                    }
                });

                throw new Error(`Failed to request token. BC returned: ${text}`, { cause: error });
            }

            this.config.logger?.error({
                err: error instanceof Error ? {
                    name: error.name,
                    message: error.message
                } : error
            });

            throw new Error(`Failed to request token`, { cause: error });
        }

        return res.json();
    }

    /**
     * Verifies a JWT payload from BigCommerce
     * @param jwtPayload - The JWT string to verify
     * @param storeHash - The store hash for the BigCommerce store
     * @returns Promise resolving to the verified JWT claims
     * @throws {Error} If the JWT is invalid
     */
    async verify(jwtPayload: string, storeHash: string): Promise<Claims> {
        try {
            const secret = new TextEncoder().encode(this.config.secret);

            const { payload }: { payload: Claims } = await jose.jwtVerify(jwtPayload, secret, {
                audience: this.config.clientId,
                issuer: ISSUER,
                subject: `stores/${storeHash}`,
            });

            this.config.logger?.debug({
                userId: payload.user?.id,
                storeHash: payload.sub.split('/')[1]
            }, 'JWT verified successfully');

            return payload;
        } catch (error) {
            this.config.logger?.error({
                error: error instanceof Error ? {
                    name: error.name,
                    message: error.message
                } : error
            });

            throw new Error('Invalid JWT payload', { cause: error });
        }
    }

    /**
     * Parses and validates a query string from BigCommerce auth callback
     * @param queryString - The query string to parse
     * @returns The parsed auth query parameters
     * @throws {Error} If required parameters are missing or scopes are invalid
     */
    private parseQueryString(queryString: string | URLSearchParams): AuthQuery {
        const params = typeof queryString === 'string' ? new URLSearchParams(queryString) : queryString;

        // Get required parameters
        const code = params.get('code');
        const scope = params.get('scope');
        const context = params.get('context');

        // Validate required parameters
        if (!code) {
            throw new Error('No code found in query string');
        }

        if (!scope) {
            throw new Error('No scope found in query string');
        } else if (this.config.scopes?.length) {
            this.validateScopes(scope);
        }

        if (!context) {
            throw new Error('No context found in query string');
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
     * @throws {Error} If the scopes don't match the expected scopes
     */
    private validateScopes(scopes: string) {
        if (!this.config.scopes) {
            return;
        }

        const grantedScopes = scopes.split(' ');
        const requiredScopes = this.config.scopes;
        const missingScopes = requiredScopes.filter(scope => !grantedScopes.includes(scope));

        if (missingScopes.length) {
            throw new Error(`Scope mismatch: ${scopes}; expected: ${this.config.scopes.join(' ')}`);
        }
    }
}
