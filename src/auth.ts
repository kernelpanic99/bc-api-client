import ky from 'ky';
import * as jose from 'jose';

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
    /** The store hash for the BigCommerce store */
    storeHash: string;
    /** Optional array of scopes to validate during auth callback */
    scopes?: string[];
};

const GRANT_TYPE = 'authorization_code';
const TOKEN_ENDPOINT = 'https://login.bigcommerce.com/oauth2/token';
const ISSUER = 'bc';

/**
 * Query parameters received from BigCommerce auth callback
 */
type AuthQuery = {
    /** The BigCommerce account UUID */
    account_uuid: string;
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
     * Creates a new BigCommerceAuth instance
     * @param config - Configuration options for BigCommerce authentication
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
     * @param data - Either a query string or AuthQuery object containing auth callback data
     * @returns Promise resolving to the token response
     */
    async requestToken(data: string | AuthQuery) {
        const query = typeof data === 'string' ? this.parseQueryString(data) : data;

        const tokenRequest: TokenRequest = {
            client_id: this.config.clientId,
            client_secret: this.config.secret,
            ...query,
            grant_type: GRANT_TYPE,
            redirect_uri: this.config.redirectUri,
        };

        const res = await ky(TOKEN_ENDPOINT, {
            method: 'POST',
            json: tokenRequest,
        });

        return res.json<TokenResponse>();
    }

    /**
     * Verifies a JWT payload from BigCommerce
     * @param jwtPayload - The JWT string to verify
     * @returns Promise resolving to the verified JWT claims
     * @throws {Error} If the JWT is invalid
     */
    async verify(jwtPayload: string) {
        try {
            const secret = new TextEncoder().encode(this.config.secret);

            const { payload } = await jose.jwtVerify(jwtPayload, secret, {
                audience: this.config.clientId,
                issuer: ISSUER,
                subject: `stores/${this.config.storeHash}`,
            });

            return payload as Claims;
        } catch (error) {
            throw new Error('Invalid JWT payload', { cause: error });
        }
    }

    /**
     * Parses and validates a query string from BigCommerce auth callback
     * @param queryString - The query string to parse
     * @returns The parsed auth query parameters
     * @throws {Error} If required parameters are missing or scopes are invalid
     */
    private parseQueryString(queryString: string): AuthQuery {
        const params = new URLSearchParams(queryString);

        // Get required parameters
        const code = params.get('code');
        const scope = params.get('scope');
        const context = params.get('context');
        const account_uuid = params.get('account_uuid');

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

        if (!account_uuid) {
            throw new Error('No account UUID found in query string');
        }

        return {
            account_uuid,
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
