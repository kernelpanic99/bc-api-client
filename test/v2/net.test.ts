import { request, RequestError } from '../src/net';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import ky, { KyResponse, HTTPError } from 'ky';

// Mock ky and HTTPError
vi.mock('ky', () => {
    const HTTPError = class extends Error {
        response: {
            status: number;
            text: () => Promise<string>;
            headers: Headers;
            ok: boolean;
            statusText: string;
        };
        constructor(
            response: {
                status: number;
                text: () => Promise<string>;
                headers: Headers;
                ok: boolean;
                statusText: string;
            },
            message: string,
            _data: unknown,
        ) {
            super(message);
            this.response = response;
        }
    };

    return {
        default: vi.fn(),
        HTTPError,
    };
});

describe('Network requests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should make a successful request', async () => {
        const mockResponse = { data: 'test' };
        (ky as unknown as Mock).mockResolvedValue({
            json: () => Promise.resolve(mockResponse),
            text: () => Promise.resolve(JSON.stringify(mockResponse)),
            status: 200,
        } as KyResponse);

        const res = await request({
            endpoint: '/catalog/products',
            storeHash: 'test',
            accessToken: 'test',
        });

        expect(res).toEqual(mockResponse);

        expect(ky).toHaveBeenCalledWith(
            expect.stringContaining('test/v3/catalog/products'),
            expect.objectContaining({
                headers: expect.objectContaining({
                    'X-Auth-Token': 'test',
                }),
            }),
        );
    });

    it('should handle rate limiting', async () => {
        const mockResponse = { data: 'test' };
        let callCount = 0;

        (ky as unknown as Mock).mockImplementation(() => {
            callCount++;

            if (callCount === 1) {
                const headers = new Headers();
                headers.set('X-Rate-Limit-Time-Reset-Ms', '100');

                throw new HTTPError(
                    // @ts-expect-error - Mock response doesn't need all Response properties
                    {
                        status: 429,
                        text: () => Promise.resolve('{"error": "rate limit"}'),
                        headers,
                        ok: false,
                        statusText: 'Too Many Requests',
                    },
                    'Rate limit exceeded',
                    {},
                );
            }
            return {
                json: () => Promise.resolve(mockResponse),
                text: () => Promise.resolve(JSON.stringify(mockResponse)),
                status: 200,
            } as KyResponse;
        });

        const res = await request({
            endpoint: '/catalog/products',
            storeHash: 'test',
            accessToken: 'test',
            maxDelay: 1000,
        });

        expect(res).toEqual(mockResponse);
        expect(callCount).toBe(2);
    });

    it('should throw RequestError on failed request', async () => {
        const headers = new Headers();
        (ky as unknown as Mock).mockRejectedValue(
            new HTTPError(
                // @ts-expect-error - Mock response doesn't need all Response properties
                {
                    status: 400,
                    text: () => Promise.resolve('{"error": "bad request"}'),
                    headers,
                    ok: false,
                    statusText: 'Bad Request',
                },
                'Bad request',
                {},
            ),
        );

        await expect(
            request({
                endpoint: '/catalog/products',
                storeHash: 'test',
                accessToken: 'test',
            }),
        ).rejects.toThrow(RequestError);
    });

    it('should throw RequestError when URL is too long', async () => {
        // Create a query that will make the URL too long
        const longQuery = Array.from({ length: 100 }, (_, i) => [`param${i}`, 'x'.repeat(20)]).reduce(
            (acc, [key, value]) => {
                acc[key] = value;
                return acc;
            },
            {} as Record<string, string>,
        );

        await expect(
            request({
                endpoint: '/catalog/products',
                storeHash: 'test',
                accessToken: 'test',
                query: longQuery,
            }),
        ).rejects.toThrow(RequestError);

        // Verify the error message contains the length information
        try {
            await request({
                endpoint: '/catalog/products',
                storeHash: 'test',
                accessToken: 'test',
                query: longQuery,
            });
        } catch (error) {
            expect(error).toBeInstanceOf(RequestError);
            expect((error as RequestError<unknown>).message).toContain('URL too long');
            expect((error as RequestError<unknown>).data).toContain('exceeds maximum allowed length');
        }
    });

    describe('Custom baseUrl', () => {
        it('should use custom baseUrl when provided', async () => {
            const customBaseUrl = 'https://custom-api.example.com/stores/';
            const mockResponse = { data: 'test' };
            (ky as unknown as Mock).mockResolvedValue({
                json: () => Promise.resolve(mockResponse),
                text: () => Promise.resolve(JSON.stringify(mockResponse)),
                status: 200,
            } as KyResponse);

            await request({
                endpoint: '/catalog/products',
                storeHash: 'test',
                accessToken: 'test',
                baseUrl: customBaseUrl,
            });

            expect(ky).toHaveBeenCalledWith(
                expect.stringContaining(customBaseUrl),
                expect.any(Object),
            );
            expect(ky).toHaveBeenCalledWith(
                expect.stringContaining('test/v3/catalog/products'),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'X-Auth-Token': 'test',
                    }),
                }),
            );
        });

        it('should use default baseUrl when not provided', async () => {
            const mockResponse = { data: 'test' };
            (ky as unknown as Mock).mockResolvedValue({
                json: () => Promise.resolve(mockResponse),
                text: () => Promise.resolve(JSON.stringify(mockResponse)),
                status: 200,
            } as KyResponse);

            await request({
                endpoint: '/catalog/products',
                storeHash: 'test',
                accessToken: 'test',
            });

            expect(ky).toHaveBeenCalledWith(
                expect.stringContaining('https://api.bigcommerce.com/stores/'),
                expect.any(Object),
            );
        });

        it('should use custom baseUrl with different API version', async () => {
            const customBaseUrl = 'https://staging-api.example.com/stores/';
            const mockResponse = { data: 'test' };
            (ky as unknown as Mock).mockResolvedValue({
                json: () => Promise.resolve(mockResponse),
                text: () => Promise.resolve(JSON.stringify(mockResponse)),
                status: 200,
            } as KyResponse);

            await request({
                endpoint: '/orders',
                storeHash: 'mystore',
                accessToken: 'token',
                baseUrl: customBaseUrl,
                version: 'v2',
            });

            expect(ky).toHaveBeenCalledWith(
                expect.stringContaining(customBaseUrl),
                expect.any(Object),
            );
            expect(ky).toHaveBeenCalledWith(
                expect.stringContaining('mystore/v2/orders'),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'X-Auth-Token': 'token',
                    }),
                }),
            );
        });

        it('should use custom baseUrl with query parameters', async () => {
            const customBaseUrl = 'https://custom-api.example.com/stores/';
            const mockResponse = { data: 'test' };
            (ky as unknown as Mock).mockResolvedValue({
                json: () => Promise.resolve(mockResponse),
                text: () => Promise.resolve(JSON.stringify(mockResponse)),
                status: 200,
            } as KyResponse);

            await request({
                endpoint: '/catalog/products',
                storeHash: 'test',
                accessToken: 'test',
                baseUrl: customBaseUrl,
                query: { limit: '10', page: '1' },
            });

            expect(ky).toHaveBeenCalledWith(
                expect.stringMatching(new RegExp(`^${customBaseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}test/v3/catalog/products\\?limit=10&page=1$`)),
                expect.any(Object),
            );
        });
    });
});
