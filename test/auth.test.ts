import * as jose from 'jose';
import { isHTTPError, isTimeoutError } from 'ky';
import { BigCommerceAuth, type Claims, type TokenResponse } from 'src/auth';
import {
    BCApiError,
    BCAuthInvalidJwtError,
    BCAuthInvalidRedirectUriError,
    BCAuthMissingParamError,
    BCAuthScopeMismatchError,
    BCClientError,
    BCTimeoutError,
} from 'src/lib/errors';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getThrown } from './util';

const { mockKyInstance } = vi.hoisted(() => ({ mockKyInstance: vi.fn() }));

vi.mock('ky', () => ({
    default: { create: vi.fn().mockReturnValue(mockKyInstance) },
    isHTTPError: vi.fn(),
    isTimeoutError: vi.fn(),
}));

vi.mock('jose');

const TOKEN_ENDPOINT = 'https://login.bigcommerce.com/oauth2/token';

const mockConfig = {
    clientId: 'test-client-id',
    secret: 'test-secret',
    redirectUri: 'https://example.com/callback',
    scopes: ['store_v2_products', 'store_v2_customers'],
    logger: false as const,
};

const mockTokenResponse: TokenResponse = {
    access_token: 'test-access-token',
    scope: 'store_v2_products store_v2_customers',
    user: { id: 1, username: 'test-user', email: 'test@example.com' },
    owner: { id: 2, username: 'owner', email: 'owner@example.com' },
    context: 'stores/test-store-hash',
    account_uuid: 'test-uuid',
};

const mockClaims: Claims = {
    aud: mockConfig.clientId,
    iss: 'bc',
    iat: 1000,
    nbf: 1000,
    exp: 5000,
    jti: 'test-jti',
    sub: 'stores/test-store-hash',
    user: { id: 1, email: 'test@example.com', locale: 'en-US' },
    owner: { id: 2, email: 'owner@example.com' },
    url: 'https://store.example.com',
    channel_id: null,
};

describe('BigCommerceAuth', () => {
    let auth: BigCommerceAuth;

    beforeEach(() => {
        vi.clearAllMocks();
        auth = new BigCommerceAuth(mockConfig);
    });

    describe('constructor', () => {
        it('creates instance with valid config', () => {
            expect(auth).toBeInstanceOf(BigCommerceAuth);
        });

        it('throws BCAuthInvalidRedirectUriError for invalid redirect URI', () => {
            const err = getThrown(() => new BigCommerceAuth({ ...mockConfig, redirectUri: 'not-a-url' }));

            expect(err).toBeInstanceOf(BCAuthInvalidRedirectUriError);
            expect(err).toMatchObject({
                code: 'BC_AUTH_INVALID_REDIRECT_URI',
                message: 'Invalid redirect URI',
                context: { redirectUri: 'not-a-url' },
            });
        });
    });

    describe('requestToken', () => {
        beforeEach(() => {
            mockKyInstance.mockResolvedValue({ json: () => Promise.resolve(mockTokenResponse) });
        });

        it('accepts a query string', async () => {
            const result = await auth.requestToken(
                'code=test-code&scope=store_v2_products store_v2_customers&context=stores/test-store-hash',
            );

            expect(result).toEqual(mockTokenResponse);
            expect(mockKyInstance).toHaveBeenCalledWith(TOKEN_ENDPOINT, expect.objectContaining({ method: 'POST' }));
        });

        it('accepts an AuthQuery object', async () => {
            const result = await auth.requestToken({
                code: 'test-code',
                scope: 'store_v2_products store_v2_customers',
                context: 'stores/test-store-hash',
            });

            expect(result).toEqual(mockTokenResponse);
        });

        it('accepts URLSearchParams', async () => {
            const result = await auth.requestToken(
                new URLSearchParams(
                    'code=test-code&scope=store_v2_products store_v2_customers&context=stores/test-store-hash',
                ),
            );

            expect(result).toEqual(mockTokenResponse);
        });

        it('throws BCAuthMissingParamError for missing code', async () => {
            const err = await auth
                .requestToken('scope=store_v2_products store_v2_customers&context=stores/test-store-hash')
                .catch((e) => e);

            expect(err).toBeInstanceOf(BCAuthMissingParamError);
            expect(err).toMatchObject({
                code: 'BC_AUTH_MISSING_PARAM',
                context: { param: 'code' },
            });
        });

        it('throws BCAuthMissingParamError for missing scope', async () => {
            const err = await auth.requestToken('code=test-code&context=stores/test-store-hash').catch((e) => e);

            expect(err).toBeInstanceOf(BCAuthMissingParamError);
            expect(err).toMatchObject({
                code: 'BC_AUTH_MISSING_PARAM',
                context: { param: 'scope' },
            });
        });

        it('throws BCAuthMissingParamError for missing context', async () => {
            const err = await auth
                .requestToken('code=test-code&scope=store_v2_products store_v2_customers')
                .catch((e) => e);

            expect(err).toBeInstanceOf(BCAuthMissingParamError);
            expect(err).toMatchObject({
                code: 'BC_AUTH_MISSING_PARAM',
                context: { param: 'context' },
            });
        });

        it('throws BCAuthScopeMismatchError when granted scopes do not match expected', async () => {
            const err = await auth
                .requestToken('code=test-code&scope=store_v2_orders&context=stores/test-store-hash')
                .catch((e) => e);

            expect(err).toBeInstanceOf(BCAuthScopeMismatchError);
            expect(err).toMatchObject({
                code: 'BC_AUTH_SCOPE_MISMATCH',
                context: {
                    granted: ['store_v2_orders'],
                    expected: mockConfig.scopes,
                    missing: mockConfig.scopes,
                },
            });
        });

        it('throws BCApiError on HTTP error response', async () => {
            const httpError = Object.assign(new Error('HTTP Error'), {
                request: {
                    method: 'POST',
                    url: TOKEN_ENDPOINT,
                    text: () => Promise.resolve(''),
                },
                response: {
                    status: 401,
                    statusText: 'Unauthorized',
                    text: () => Promise.resolve('Invalid credentials'),
                    headers: new Headers(),
                },
            });

            vi.mocked(isHTTPError).mockReturnValue(true);
            mockKyInstance.mockRejectedValue(httpError);

            const err = await auth
                .requestToken({ code: 'c', scope: 'store_v2_products store_v2_customers', context: 'stores/s' })
                .catch((e) => e);

            expect(err).toBeInstanceOf(BCApiError);
            expect(err).toMatchObject({
                code: 'BC_API_ERROR',
                context: { status: 401, statusMessage: 'Unauthorized' },
            });
        });

        it('throws BCTimeoutError on timeout', async () => {
            const timeoutError = Object.assign(new Error('Timeout'), {
                request: { method: 'POST', url: TOKEN_ENDPOINT },
            });

            vi.mocked(isHTTPError).mockReturnValue(false);
            vi.mocked(isTimeoutError).mockReturnValue(true);
            mockKyInstance.mockRejectedValue(timeoutError);

            const err = await auth
                .requestToken({ code: 'c', scope: 'store_v2_products store_v2_customers', context: 'stores/s' })
                .catch((e) => e);

            expect(err).toBeInstanceOf(BCTimeoutError);
            expect(err).toMatchObject({
                code: 'BC_TIMEOUT_ERROR',
                context: { method: 'POST', url: TOKEN_ENDPOINT },
            });
        });

        it('throws BCClientError on unknown error', async () => {
            vi.mocked(isHTTPError).mockReturnValue(false);
            vi.mocked(isTimeoutError).mockReturnValue(false);
            mockKyInstance.mockRejectedValue(new Error('Unknown'));

            const err = await auth
                .requestToken({ code: 'c', scope: 'store_v2_products store_v2_customers', context: 'stores/s' })
                .catch((e) => e);

            expect(err).toBeInstanceOf(BCClientError);
            expect(err).toMatchObject({ code: 'BC_CLIENT_ERROR', message: 'Failed to request token' });
        });
    });

    describe('verify', () => {
        const storeHash = 'test-store-hash';

        it('returns verified claims for a valid JWT', async () => {
            vi.mocked(jose.jwtVerify).mockResolvedValue({
                payload: mockClaims,
                protectedHeader: { alg: 'HS256' },
            } as unknown as Awaited<ReturnType<typeof jose.jwtVerify>>);

            const result = await auth.verify('valid-jwt', storeHash);

            expect(result).toEqual(mockClaims);
            expect(jose.jwtVerify).toHaveBeenCalledWith(
                'valid-jwt',
                expect.any(Uint8Array),
                expect.objectContaining({ audience: mockConfig.clientId, subject: `stores/${storeHash}` }),
            );
        });

        it('throws BCAuthInvalidJwtError for an invalid JWT', async () => {
            vi.mocked(jose.jwtVerify).mockRejectedValue(new Error('JWTExpired'));

            const err = await auth.verify('invalid-jwt', storeHash).catch((e) => e);

            expect(err).toBeInstanceOf(BCAuthInvalidJwtError);
            expect(err).toMatchObject({
                code: 'BC_AUTH_INVALID_JWT',
                message: 'Invalid JWT payload',
                context: { storeHash },
            });
        });
    });
});
