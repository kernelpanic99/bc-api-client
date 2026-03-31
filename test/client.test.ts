import {
    BASE_KY_CONFIG,
    BCApiError,
    BCCredentialsError,
    BCRateLimitDelayTooLongError,
    BCRateLimitNoHeadersError,
    BCResponseParseError,
    BCSchemaValidationError,
    BCUrlTooLongError,
    HEADERS,
} from 'src';
import { BigCommerceClient } from 'src/client';
import { describe, expect, it, vi } from 'vitest';
import z from 'zod';
import { createClient, getThrown, VALID_CREDENTIALS } from './util';

describe('BigCommerceClient', () => {
    describe('constructor', () => {
        it('Fails to constuct the instance with invalid credentials', () => {
            const err = getThrown(() => new BigCommerceClient({ accessToken: '', storeHash: '' }));

            expect(err).toBeInstanceOf(BCCredentialsError);

            expect(err).toMatchObject({
                name: 'BCCredentialsError',
                message: 'Failed to initialize BigCommerceClient',
                code: 'BC_CLIENT_CREDENTIALS_ERROR',
                context: {
                    errors: ['storeHash is empty', 'accessToken is empty'],
                },
            });
        });

        it('Fails to construct the instance with invalid prefixUrl', () => {
            expect(() => new BigCommerceClient({ ...VALID_CREDENTIALS, prefixUrl: 'invalid' })).toThrow(
                'Invalid prefixUrl',
            );
        });

        it('Fails with only storeHash invalid', () => {
            const err = getThrown(() => new BigCommerceClient({ accessToken: 'valid', storeHash: '' }));

            expect(err).toBeInstanceOf(BCCredentialsError);
            expect(err).toMatchObject({ context: { errors: ['storeHash is empty'] } });
        });

        it('Fails with only accessToken invalid', () => {
            const err = getThrown(() => new BigCommerceClient({ accessToken: '', storeHash: 'valid' }));

            expect(err).toBeInstanceOf(BCCredentialsError);
            expect(err).toMatchObject({ context: { errors: ['accessToken is empty'] } });
        });
    });

    describe('validation', () => {
        const assertValidationError = (err: unknown, body: unknown, message: string) => {
            expect(err).toBeInstanceOf(BCSchemaValidationError);

            expect(err).toMatchObject({
                name: 'BCSchemaValidationError',
                code: 'BC_SCHEMA_VALIDATION_FAILED',
                message,
                context: {
                    data: body,
                },
            });
        };

        it('Fails on invalid query', async () => {
            const client = createClient();
            const schema = z.object({
                include: z.string().array(),
                'id:in': z.int().positive().array(),
            });

            const invalid = {
                include: 'variants,images',
                'id:in': [213, '234'],
            };

            // @ts-expect-error Will not match schema type
            const err = await client.get('/catalog/products', { querySchema: schema, query: invalid }).catch((e) => e);

            assertValidationError(err, invalid, 'Invalid query parameters');
        });

        it('Fails on invalid POST body', async () => {
            const client = createClient();

            const schema = z.object({
                sku: z.string().max(255),
                categories: z.int().positive().array(),
                price: z.float64().positive(),
            });

            const body = {
                sku: 'long'.repeat(70),
                categories: [0, undefined],
                price: -3.14149,
            };

            const err = await client.post('/catalog/products', { bodySchema: schema, body }).catch((e) => e);

            assertValidationError(err, body, 'Invalid POST request body');
        });

        it('Fails on invalid PUT body', async () => {
            const client = createClient();

            const schema = z.object({ name: z.string() });
            const body = { name: 123 };

            // @ts-expect-error Will not match schema type
            const err = await client.put('/catalog/products/1', { bodySchema: schema, body }).catch((e) => e);

            assertValidationError(err, body, 'Invalid PUT request body');
        });

        it('Fails on invalid response', async () => {
            const schema = z.object({
                sku: z.string(),
                sales_price: z.float64().positive(),
                description: z.string(),
            });

            const data = {
                sku: 'test',
                sales_price: null,
                // missing description
            };

            const client = createClient(data);

            const err = await client.get('catalog/products', { responseSchema: schema }).catch((e) => e);

            assertValidationError(err, data, 'Invalid API response');
        });

        it('Returns parsed response body on success', async () => {
            const data = { id: 1, name: 'Test Product' };
            const client = createClient(data);

            const result = await client.get('/catalog/products/1');

            expect(result).toEqual(data);
        });

        it('Uses v2 path when version is specified', async () => {
            const client = createClient(new Response('not json'));

            const err = await client.get('/orders', { version: 'v2' }).catch((e) => e);

            expect(err).toBeInstanceOf(BCResponseParseError);
            expect(err).toMatchObject({
                context: { path: 'stores/test/v2/orders' },
            });
        });

        it('Throws BCApiError on HTTP error responses', async () => {
            const client = createClient({ message: 'Not found' }, 404);

            const err = await client.get('/catalog/products/1').catch((e) => e);

            expect(err).toBeInstanceOf(BCApiError);
            expect(err).toMatchObject({
                name: 'BCApiError',
                code: 'BC_API_ERROR',
                message: 'BigCommerce API request failed',
                context: {
                    method: 'GET',
                    status: 404,
                    url: 'https://api.bigcommerce.com/stores/test/v3/catalog/products/1',
                    responseBody: '{"message":"Not found"}',
                },
            });
        });

        it('Throws BCUrlTooLongError when URL exceeds 2048 chars without retrying', async () => {
            const requestCount = vi.fn();

            const client = new BigCommerceClient({
                ...VALID_CREDENTIALS,
                hooks: { beforeRequest: [requestCount] },
                logger: false,
            });

            const err = await client.get('a'.repeat(2048)).catch((e) => e);

            const longUrl = `https://api.bigcommerce.com/stores/test/v3/${'a'.repeat(2048)}`;

            expect(err).toBeInstanceOf(BCUrlTooLongError);
            expect(err).toMatchObject({
                name: 'BCUrlTooLongError',
                code: 'BC_URL_TOO_LONG',
                message: `Url length (${longUrl.length}) exceeds max allowed length of 2048`,
                context: {
                    url: longUrl,
                    max: 2048,
                    len: longUrl.length,
                },
            });

            expect(requestCount).toHaveBeenCalledTimes(1);
        });

        it('Throws BCResponseParseError on empty body (e.g. v2 orders past last page)', async () => {
            const client = createClient(new Response(null, { status: 204 }));

            const err = await client.get('/orders', { version: 'v2' }).catch((e) => e);

            expect(err).toBeInstanceOf(BCResponseParseError);
            expect(err).toMatchObject({
                context: {
                    method: 'GET',
                    path: 'stores/test/v2/orders',
                    rawBody: '',
                },
            });
        });

        it('Fails on invalid json', async () => {
            const client = createClient(new Response('not json'));

            const err = await client.get('/catalog/products').catch((e) => e);

            expect(err).toBeInstanceOf(BCResponseParseError);

            expect(err).toMatchObject({
                name: 'BCResponseParseError',
                message: 'Failed to parse BigCommerce API response',
                code: 'BC_RESPONSE_PARSE_ERROR',
                context: {
                    method: 'GET',
                    path: 'stores/test/v3/catalog/products',
                    rawBody: 'not json',
                },
            });
        });
    });

    describe('delete()', () => {
        it('Resolves on success with empty body', async () => {
            const client = createClient(new Response(null, { status: 204 }));
            await expect(client.delete('/catalog/products/1')).resolves.toBeUndefined();
        });

        it('Resolves on success with empty body and non-204 status', async () => {
            const client = createClient(new Response('', { status: 200 }));
            await expect(client.delete('/catalog/products/1')).resolves.toBeUndefined();
        });

        it('Silently swallows 404 with JSON content-type (resource already gone)', async () => {
            const client = createClient(
                new Response(JSON.stringify({ title: 'Not Found' }), {
                    status: 404,
                    headers: { 'content-type': 'application/json' },
                }),
            );

            await expect(client.delete('/catalog/products/1')).resolves.toBeUndefined();
        });

        it("Re-throws 404 without JSON content-type (typo'd path)", async () => {
            const client = createClient(
                new Response('Route not found', {
                    status: 404,
                    headers: { 'content-type': 'text/plain' },
                }),
            );

            const err = await client.delete('/catalog/prducts/1').catch((e) => e);

            expect(err).toBeInstanceOf(BCApiError);
            expect(err).toMatchObject({ context: { status: 404 } });
        });

        it('Re-throws non-404 HTTP errors', async () => {
            const client = createClient({ message: 'Server Error' }, 500);

            const err = await client.delete('/catalog/products/1').catch((e) => e);

            expect(err).toBeInstanceOf(BCApiError);
            expect(err).toMatchObject({ context: { status: 500 } });
        });
    });

    describe('Retries and rate limits', () => {
        it('Retries on failures', async () => {
            const counter = vi.fn();

            const client = new BigCommerceClient({
                ...VALID_CREDENTIALS,
                retry: {
                    ...BASE_KY_CONFIG.retry,
                    backoffLimit: 1,
                },
                logger: false,
                hooks: {
                    beforeRequest: [
                        () => {
                            counter();

                            return new Response('Internal Server Error', { status: 500 });
                        },
                    ],
                },
            });

            await client.get('catalog/products').catch(() => {});

            expect(counter).toHaveBeenCalledTimes(4);
        });

        it('Rate limit fails immediately without Reset header', async () => {
            const client = createClient(new Response('rate limit', { status: 429 }));

            const res = await client.get('/catalog/products').catch((e) => e);

            expect(res).toBeInstanceOf(BCRateLimitNoHeadersError);

            expect(res).toMatchObject({
                name: 'BCRateLimitNoHeadersError',
                message: 'Rate limit reached but the X-Rate-Limit-* headers were not returned. Unable to retry',
                code: 'BC_RATE_LIMIT_NO_HEADERS',
                context: {
                    url: 'https://api.bigcommerce.com/stores/test/v3/catalog/products',
                    method: 'GET',
                    attempts: 1,
                },
            });
        });

        it('Rate limit fails immediately if the delay is too long', async () => {
            const client = createClient(
                new Response('rate limit', {
                    status: 429,
                    headers: {
                        [HEADERS.RATE_LIMIT_RESET]: '120001',
                    },
                }),
            );

            const err = await client.get('/catalog/products').catch((e) => e);

            expect(err).toBeInstanceOf(BCRateLimitDelayTooLongError);

            expect(err).toMatchObject({
                name: 'BCRateLimitDelayTooLongError',
                message: 'Rate limit reached, and the rate limit reset window is too high.',
                code: 'BC_RATE_LIMIT_DELAY_TOO_LONG',
                context: {
                    url: 'https://api.bigcommerce.com/stores/test/v3/catalog/products',
                    method: 'GET',
                    attempts: 1,
                    maxDelay: 120000,
                    delay: 120001,
                },
            });
        });

        it('Handles rate limits', async () => {
            vi.useFakeTimers();
            const counter = vi.fn();
            let attempts = 0;

            const client = new BigCommerceClient({
                ...VALID_CREDENTIALS,
                logger: false,
                hooks: {
                    beforeRequest: [
                        () => {
                            if (attempts === 2) {
                                return new Response('{"status": "ok"}', { status: 200 });
                            }

                            attempts++;

                            counter();

                            return new Response('rate limited', {
                                status: 429,
                                headers: {
                                    [HEADERS.RATE_LIMIT_LEFT]: '0',
                                    [HEADERS.RATE_LIMIT_WINDOW]: '30000',
                                    [HEADERS.RATE_LIMIT_RESET]: '3000',
                                    [HEADERS.RATE_LIMIT_QUOTA]: '300',
                                },
                            });
                        },
                    ],
                },
            });

            const start = vi.getMockedSystemTime();

            if (!start) {
                throw new Error('Unexpected null response from vi.getMockedSystemTime');
            }

            const request = client.get('catalog/products');
            await vi.runAllTimersAsync();
            await request;

            const elapsed = Date.now() - start.valueOf();

            expect(counter).toHaveBeenCalledTimes(2);
            expect(elapsed).toBeGreaterThanOrEqual(6e3);

            vi.useRealTimers();
        });
    });
});
