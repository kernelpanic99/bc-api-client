import ky from 'ky';
import * as jose from 'jose';
import { intersection } from 'remeda';

type Config = {
    clientId: string;
    secret: string;
    redirectUri: string;
    storeHash: string;
    // Pass an array of scopes to validate the scopes in the auth callback.
    // Otherwise the scopes will not be validated.
    scopes?: string[];
};

const GRANT_TYPE = 'authorization_code';
const TOKEN_ENDPOINT = 'https://login.bigcommerce.com/oauth2/token';
const ISSUER = 'bc';


type AuthQuery = {
    account_uuid: string;
    code: string;
    scope: string;
    context: string;
};

type TokenRequest = {
    client_id: string;
    client_secret: string;
    code: string;
    context: string;
    scope: string;
    grant_type: typeof GRANT_TYPE;
    redirect_uri: string;
};

export type User = {
    id: number;
    username: string;
    email: string;
};

export type TokenResponse = {
    access_token: string;
    scope: string;
    user: User;
    owner: User;
    context: string;
    account_uuid: string;
};

export type Claims = {
    aud: string;
    iss: string;
    iat: number;
    nbf: number;
    exp: number;
    jti: string;
    sub: string;
    user: {
        id: number;
        email: string;
        locale: string;
    };
    owner: {
        id: number;
        email: string;
    };
    url: string;
    channel_id: number | null;
}

export class BigCommerceAuth {
    constructor(private readonly config: Config) {
        try {
            URL.parse(this.config.redirectUri);
        } catch (error) {
            throw new Error('Invalid redirect URI', { cause: error });
        }
    }

    async requestToken(queryString: string) {
        const query = this.parseQueryString(queryString);

        const tokenRequest: TokenRequest = {
            client_id: this.config.clientId,
            client_secret: this.config.secret,
            ...query,
            grant_type: GRANT_TYPE,
            redirect_uri: this.config.redirectUri,
        };

        return await ky(TOKEN_ENDPOINT, {
            method: 'POST',
            json: tokenRequest,
        }).json<TokenResponse>();
    }

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

    private validateScopes(scopes: string) {
        const scopesArray = scopes.split(' ');

        if (this.config.scopes?.length) {
            const int = intersection(scopesArray, this.config.scopes);

            if (int.length !== scopesArray.length) {
                throw new Error(`Scope mismatch: ${scopes}; expected: ${this.config.scopes.join(' ')}`);
            }
        }
    }
}
