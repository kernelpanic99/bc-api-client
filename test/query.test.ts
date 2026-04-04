import { BigCommerceClient } from 'src';
import { BASE_KY_CONFIG } from 'src/lib/common';
import { describe, expect, it, vi } from 'vitest';
import { BCApiError, BCPaginatedResponseError } from '../src/lib/errors';
import { VALID_CREDENTIALS } from './util';

type PagedResponse = {
    data: unknown[];
    meta: {
        pagination: {
            per_page: number;
            total_pages: number;
            links: { current: string; next?: string | null; previous?: string | null };
        };
    };
};

const pagedResponse = (data: unknown[], overrides?: Partial<PagedResponse['meta']['pagination']>): PagedResponse => ({
    data,
    meta: {
        pagination: {
            per_page: 250,
            total_pages: 1,
            links: { current: '?page=1&limit=250' },
            ...overrides,
        },
    },
});

const echo = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status });
const errResponse = (status: number) => new Response(JSON.stringify({ status, title: 'Error' }), { status });

const bcClientQuery = (responses: Response[]) => {
    let index = 0;

    return new BigCommerceClient({
        ...VALID_CREDENTIALS,
        retry: {
            ...BASE_KY_CONFIG.retry,
            backoffLimit: 1,
        },
        hooks: {
            beforeRequest: [() => responses[index++] ?? new Response('{}', { status: 404 })],
        },
    });
};

const BASE_OPTIONS = { key: 'sku:in', values: ['A', 'B', 'C'] };

describe('BigCommerceClient', () => {
    describe('queryStream', () => {
        it('yields each item from a paginated response', async () => {
            const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
            const client = bcClientQuery([echo(pagedResponse(items))]);
            const results: unknown[] = [];

            for await (const result of client.queryStream('/catalog/products', BASE_OPTIONS)) {
                expect(result.ok).toBe(true);
                results.push(result.data);
            }

            expect(results).toEqual(items);
        });

        it('yields nothing for empty values list', async () => {
            const client = bcClientQuery([]);
            const count = vi.fn();

            for await (const _ of client.queryStream('/catalog/products', { key: 'sku:in', values: [] })) {
                count();
            }

            expect(count).not.toHaveBeenCalled();
        });

        it('yields Err when the request fails', async () => {
            const client = bcClientQuery([errResponse(500)]);
            const results: unknown[] = [];

            for await (const result of client.queryStream('/catalog/products', BASE_OPTIONS)) {
                results.push(result);
            }

            expect(results).toHaveLength(1);
            expect(results[0]).toMatchObject({ ok: false, err: expect.any(BCApiError) });
        });

        it('yields Err when response is not a valid paginated structure', async () => {
            const client = bcClientQuery([echo({ not: 'paginated' })]);
            const results: unknown[] = [];

            for await (const result of client.queryStream('/catalog/products', BASE_OPTIONS)) {
                results.push(result);
            }

            expect(results).toHaveLength(1);
            expect(results[0]).toMatchObject({ ok: false, err: expect.any(BCPaginatedResponseError) });
        });

        it('validates items with itemSchema and yields Err for invalid items', async () => {
            const items = [{ id: 1, name: 'valid' }, { id: 'bad' }];
            const client = bcClientQuery([echo(pagedResponse(items))]);

            const itemSchema = {
                '~standard': {
                    version: 1 as const,
                    vendor: 'test',
                    validate: (data: unknown) => {
                        const d = data as { id: unknown };

                        if (typeof d.id !== 'number') {
                            return { issues: [{ message: 'id must be a number' }] };
                        }

                        return { value: d as { id: number } };
                    },
                },
            };

            const results: { ok: boolean }[] = [];

            for await (const result of client.queryStream('/catalog/products', { ...BASE_OPTIONS, itemSchema })) {
                results.push(result);
            }

            expect(results).toHaveLength(2);
            expect(results[0].ok).toBe(true);
            expect(results[1].ok).toBe(false);
        });

        it('makes one request per chunk when values span multiple chunks', async () => {
            const responses = [echo(pagedResponse([{ id: 1 }])), echo(pagedResponse([{ id: 2 }]))];
            const client = bcClientQuery(responses);
            const requestCount = vi.fn();

            // Force two chunks: offset ≈ 77, maxLength = 2048.
            // Two 990-char values: 77 + 990 + (990+1) = 2058 > 2048, so they must split.
            const longValues = Array.from({ length: 2 }, () => 'x'.repeat(990));

            const results: unknown[] = [];

            for await (const result of client.queryStream('/catalog/products', {
                key: 'sku:in',
                values: longValues,
            })) {
                requestCount();
                results.push(result.data);
            }

            expect(requestCount).toHaveBeenCalledTimes(2);
            expect(results).toEqual([{ id: 1 }, { id: 2 }]);
        });
    });

    describe('query', () => {
        it('returns all items as an array on success', async () => {
            const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
            const client = bcClientQuery([echo(pagedResponse(items))]);

            const result = await client.query('/catalog/products', BASE_OPTIONS);

            expect(result).toEqual(items);
        });

        it('throws on request failure', async () => {
            const client = bcClientQuery([errResponse(500)]);

            await expect(client.query('/catalog/products', BASE_OPTIONS)).rejects.toBeInstanceOf(BCApiError);
        });
    });
});
