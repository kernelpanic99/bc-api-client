import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BigCommerceAuth, TokenResponse, Claims } from '../src/auth';
import ky from 'ky';
import * as jose from 'jose';
import pino from 'pino';

vi.mock('ky');
vi.mock('jose');

describe('BigCommerceAuth', () => {
    const storeHash = 'test-store-hash';

    const mockConfig = {
        clientId: 'test-client-id',
        secret: 'test-secret',
        redirectUri: 'https://example.com/callback',
        scopes: ['store_v2_products', 'store_v2_customers'],
        logger: pino({
            level: 'debug',
        }),
    };

    let auth: BigCommerceAuth;

    beforeEach(() => {
        auth = new BigCommerceAuth(mockConfig);
        vi.clearAllMocks();
    });

    describe('constructor', () => {
        it('should create a new instance with valid config', () => {
            expect(auth).toBeInstanceOf(BigCommerceAuth);
        });

        it('should throw error for invalid redirect URI', () => {
            expect(
                () =>
                    new BigCommerceAuth({
                        ...mockConfig,
                        redirectUri: 'invalid-uri',
                    }),
            ).toThrow('Invalid redirect URI');
        });
    });

    describe('requestToken', () => {
        const mockTokenResponse: TokenResponse = {
            access_token: 'test-access-token',
            scope: 'store_v2_products store_v2_customers',
            user: {
                id: 1,
                username: 'test-user',
                email: 'test@example.com',
            },
            owner: {
                id: 2,
                username: 'owner',
                email: 'owner@example.com',
            },
            context: 'stores/test-store-hash',
            account_uuid: 'test-uuid',
        };

        it('should request token with query string', async () => {
            const mockQueryString =
                'code=test-code&scope=store_v2_products store_v2_customers&context=stores/test-store-hash&account_uuid=test-uuid';

            const mockResponse = {
                json: () => Promise.resolve(mockTokenResponse),
            } as unknown as Response & { json: <T>() => Promise<T> };

            vi.mocked(ky).mockResolvedValue(mockResponse);

            const result = await auth.requestToken(mockQueryString);
            expect(result).toEqual(mockTokenResponse);
        });

        it('should request token with AuthQuery object', async () => {
            const mockQuery = {
                code: 'test-code',
                scope: 'store_v2_products store_v2_customers',
                context: 'stores/test-store-hash',
                account_uuid: 'test-uuid',
            };

            const mockResponse = {
                json: () => Promise.resolve(mockTokenResponse),
            } as unknown as Response & { json: <T>() => Promise<T> };

            vi.mocked(ky).mockResolvedValue(mockResponse);

            const result = await auth.requestToken(mockQuery);
            expect(result).toEqual(mockTokenResponse);
        });

        it('should request token with URLSearchParams instance', async () => {
            const mockQuery = new URLSearchParams(
                'code=test-code&scope=store_v2_products store_v2_customers&context=stores/test-store-hash&account_uuid=test-uuid',
            );
            const mockResponse = {
                json: () => Promise.resolve(mockTokenResponse),
            } as unknown as Response & { json: <T>() => Promise<T> };

            vi.mocked(ky).mockResolvedValue(mockResponse);

            const result = await auth.requestToken(mockQuery);
            expect(result).toEqual(mockTokenResponse);
        });

        it('should throw error for missing code in query string', async () => {
            const mockQueryString = 'scope=store_v2_products&context=stores/test-store-hash&account_uuid=test-uuid';
            await expect(auth.requestToken(mockQueryString)).rejects.toThrow('No code found in query string');
        });

        it('should throw error for missing scope in query string', async () => {
            const mockQueryString = 'code=test-code&context=stores/test-store-hash&account_uuid=test-uuid';
            await expect(auth.requestToken(mockQueryString)).rejects.toThrow('No scope found in query string');
        });

        it('should throw error for scope mismatch', async () => {
            const mockQueryString =
                'code=test-code&scope=store_v2_orders&context=stores/test-store-hash&account_uuid=test-uuid';
            await expect(auth.requestToken(mockQueryString)).rejects.toThrow('Scope mismatch');
        });
    });

    describe('verify', () => {
        const mockClaims: Claims = {
            aud: mockConfig.clientId,
            iss: 'bc',
            iat: Date.now() / 1000,
            nbf: Date.now() / 1000,
            exp: Date.now() / 1000 + 3600,
            jti: 'test-jti',
            sub: `stores/${storeHash}`,
            user: {
                id: 1,
                email: 'test@example.com',
                locale: 'en-US',
            },
            owner: {
                id: 2,
                email: 'owner@example.com',
            },
            url: 'https://store.example.com',
            channel_id: null,
        };

        it('should verify valid JWT payload', async () => {
            const mockVerifyResult = {
                payload: mockClaims,
                protectedHeader: { alg: 'HS256' },
                key: new TextEncoder().encode('test-key'),
            };

            vi.mocked(jose.jwtVerify).mockResolvedValue(mockVerifyResult);

            const result = await auth.verify('test-jwt', storeHash);
            expect(result).toEqual(mockClaims);
        });

        it('should throw error for invalid JWT payload', async () => {
            vi.mocked(jose.jwtVerify).mockRejectedValue(new Error('Invalid JWT'));

            await expect(auth.verify('invalid-jwt', storeHash)).rejects.toThrow('Invalid JWT payload');
        });
    });
});
