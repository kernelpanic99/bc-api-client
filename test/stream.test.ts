import { BigCommerceClient } from 'src/client';
import {
    BCClientError,
    BCPaginatedItemValidationError,
    BCPaginatedOptionError,
    BCPaginatedResponseError,
} from 'src/lib/errors';
import { Err, Ok } from 'src/lib/result';
import type { StandardSchemaV1 } from 'src/lib/standard-schema';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const makeClient = () => new BigCommerceClient({ storeHash: 'abc', accessToken: 'tok', logger: false });

function makePage(
    items: unknown[],
    opts: { total_pages?: number; per_page?: number; current_page?: number; total?: number } = {},
) {
    const per_page = opts.per_page ?? (items.length || 250);
    const current_page = opts.current_page ?? 1;
    const total_pages = opts.total_pages ?? 1;

    return {
        data: items,
        meta: {
            pagination: {
                total: opts.total ?? items.length,
                count: items.length,
                per_page,
                current_page,
                total_pages,
                links: {
                    ...(current_page > 1 && { previous: `?page=${current_page - 1}` }),
                    current: `?page=${current_page}`,
                    ...(current_page < total_pages && { next: `?page=${current_page + 1}` }),
                },
            },
        },
    };
}

async function drain<T>(gen: AsyncGenerator<T>): Promise<T[]> {
    const items: T[] = [];

    for await (const item of gen) {
        items.push(item);
    }

    return items;
}

function makeSchema<T>(validate: (v: unknown) => StandardSchemaV1.Result<T>): StandardSchemaV1<T> {
    return { '~standard': { vendor: 'test', version: 1, validate } };
}

describe('stream', () => {
    let client: BigCommerceClient;

    beforeEach(() => {
        client = makeClient();
    });

    describe('pagination option validation', () => {
        it('throws BCPaginatedOptionError for limit = 0', async () => {
            await expect(drain(client.stream('/p', { query: { limit: 0 } }))).rejects.toThrow(BCPaginatedOptionError);
        });

        it('throws BCPaginatedOptionError for negative limit', async () => {
            await expect(drain(client.stream('/p', { query: { limit: -1 } }))).rejects.toThrow(BCPaginatedOptionError);
        });

        it('throws BCPaginatedOptionError for non-number limit', async () => {
            await expect(drain(client.stream('/p', { query: { limit: 'bad' as unknown as number } }))).rejects.toThrow(
                BCPaginatedOptionError,
            );
        });

        it('throws BCPaginatedOptionError for page = 0', async () => {
            await expect(drain(client.stream('/p', { query: { page: 0 } }))).rejects.toThrow(BCPaginatedOptionError);
        });

        it('throws BCPaginatedOptionError for negative page', async () => {
            await expect(drain(client.stream('/p', { query: { page: -5 } }))).rejects.toThrow(BCPaginatedOptionError);
        });
    });

    describe('assertPaginatedResponse (first page)', () => {
        it('yields Err(BCPaginatedResponseError) when response is null', async () => {
            vi.spyOn(client, 'get').mockResolvedValue(null);

            const [result] = await drain(client.stream('/p'));

            expect(result.err).toBeInstanceOf(BCPaginatedResponseError);
        });

        it('yields Err(BCPaginatedResponseError) when response is a string', async () => {
            vi.spyOn(client, 'get').mockResolvedValue('oops');

            const [result] = await drain(client.stream('/p'));

            expect(result.err).toBeInstanceOf(BCPaginatedResponseError);
        });

        it('yields Err(BCPaginatedResponseError) when data is missing', async () => {
            vi.spyOn(client, 'get').mockResolvedValue({ meta: { pagination: {} } });

            const [result] = await drain(client.stream('/p'));

            expect(result.err).toBeInstanceOf(BCPaginatedResponseError);
        });

        it('yields Err(BCPaginatedResponseError) when data is not an array', async () => {
            vi.spyOn(client, 'get').mockResolvedValue({ data: {}, meta: { pagination: {} } });

            const [result] = await drain(client.stream('/p'));

            expect(result.err).toBeInstanceOf(BCPaginatedResponseError);
        });

        it('yields Err(BCPaginatedResponseError) when meta is missing', async () => {
            vi.spyOn(client, 'get').mockResolvedValue({ data: [] });

            const [result] = await drain(client.stream('/p'));

            expect(result.err).toBeInstanceOf(BCPaginatedResponseError);
        });

        it('yields Err(BCPaginatedResponseError) when meta.pagination is missing', async () => {
            vi.spyOn(client, 'get').mockResolvedValue({ data: [], meta: {} });

            const [result] = await drain(client.stream('/p'));

            expect(result.err).toBeInstanceOf(BCPaginatedResponseError);
        });

        it.each([
            'per_page',
            'total_pages',
        ])('yields Err(BCPaginatedResponseError) when pagination.%s is missing', async (field) => {
            const pagination = {
                per_page: 250,
                total_pages: 1,
                links: { previous: null, current: '?page=1', next: null },
            };

            delete (pagination as Record<string, unknown>)[field];

            vi.spyOn(client, 'get').mockResolvedValue({ data: [], meta: { pagination } });

            const [result] = await drain(client.stream('/p'));

            expect(result.err).toBeInstanceOf(BCPaginatedResponseError);
        });

        it('yields Err(BCPaginatedResponseError) when per_page is 0', async () => {
            vi.spyOn(client, 'get').mockResolvedValue({
                data: [],
                meta: {
                    pagination: {
                        per_page: 0,
                        total_pages: 1,
                        links: { previous: null, current: '?page=1', next: null },
                    },
                },
            });

            const [result] = await drain(client.stream('/p'));

            expect(result.err).toBeInstanceOf(BCPaginatedResponseError);
        });

        it('yields Err(BCPaginatedResponseError) when links is missing', async () => {
            vi.spyOn(client, 'get').mockResolvedValue({
                data: [],
                meta: { pagination: { per_page: 250, total_pages: 1 } },
            });

            const [result] = await drain(client.stream('/p'));

            expect(result.err).toBeInstanceOf(BCPaginatedResponseError);
        });

        it('yields Err(BCPaginatedResponseError) when links.current is missing', async () => {
            vi.spyOn(client, 'get').mockResolvedValue({
                data: [],
                meta: { pagination: { per_page: 250, total_pages: 1, links: { previous: null, next: null } } },
            });

            const [result] = await drain(client.stream('/p'));

            expect(result.err).toBeInstanceOf(BCPaginatedResponseError);
        });

        it('yields Err(BCPaginatedResponseError) when links.current is not a string', async () => {
            vi.spyOn(client, 'get').mockResolvedValue({
                data: [],
                meta: {
                    pagination: {
                        per_page: 250,
                        total_pages: 1,
                        links: { previous: null, current: 42, next: null },
                    },
                },
            });

            const [result] = await drain(client.stream('/p'));

            expect(result.err).toBeInstanceOf(BCPaginatedResponseError);
        });

        it.each([
            { previous: null, current: '?page=1', next: null },
            { current: '?page=1' },
            { current: '?page=1', next: '?page=2' },
            { previous: '?page=1', current: '?page=2' },
        ])('accepts valid links shape %o', async (links) => {
            vi.spyOn(client, 'get').mockResolvedValue({
                data: [],
                meta: { pagination: { per_page: 250, total_pages: 1, links } },
            });
            vi.spyOn(client, 'batchStream').mockImplementation(async function* () {});

            const results = await drain(client.stream('/p'));

            expect(results).toHaveLength(0);
        });
    });

    describe('first page error handling', () => {
        it('yields Err and stops when first page fetch rejects with a BaseError', async () => {
            const error = new BCClientError('network');

            vi.spyOn(client, 'get').mockRejectedValue(error);

            const batchSpy = vi.spyOn(client, 'batchStream');

            const results = await drain(client.stream('/p'));

            expect(results).toHaveLength(1);
            expect(results[0].err).toBe(error);
            expect(batchSpy).not.toHaveBeenCalled();
        });

        it('wraps unknown first page error in BCClientError', async () => {
            vi.spyOn(client, 'get').mockRejectedValue(new TypeError('boom'));

            const [result] = await drain(client.stream('/p'));

            expect(result.err).toBeInstanceOf(BCClientError);
        });

        it('does not yield subsequent items after first page error', async () => {
            vi.spyOn(client, 'get').mockRejectedValue(new BCClientError('fail'));

            const results = await drain(client.stream('/p'));

            expect(results).toHaveLength(1);
        });
    });

    describe('single page', () => {
        it('yields Ok for each item and never calls batchStream', async () => {
            const items = [{ id: 1 }, { id: 2 }, { id: 3 }];

            vi.spyOn(client, 'get').mockResolvedValue(makePage(items, { per_page: 250 }));

            const batchSpy = vi.spyOn(client, 'batchStream');
            const results = await drain(client.stream('/products'));

            expect(results).toEqual(items.map(Ok));
            expect(batchSpy).not.toHaveBeenCalled();
        });

        it('yields nothing for an empty page', async () => {
            vi.spyOn(client, 'get').mockResolvedValue(makePage([]));
            vi.spyOn(client, 'batchStream').mockImplementation(async function* () {});

            const results = await drain(client.stream('/products'));
            expect(results).toHaveLength(0);
        });
    });

    describe('item schema validation', () => {
        it('yields Ok(validatedValue) when schema passes', async () => {
            vi.spyOn(client, 'get').mockResolvedValue(makePage([42, 7]));
            vi.spyOn(client, 'batchStream').mockImplementation(async function* () {});

            const schema = makeSchema<number>((v) => ({ value: (v as number) * 2 }));
            const results = await drain(client.stream('/p', { itemSchema: schema }));

            expect(results).toEqual([Ok(84), Ok(14)]);
        });

        it('yields Err(BCPaginatedItemValidationError) when schema fails', async () => {
            vi.spyOn(client, 'get').mockResolvedValue(makePage(['not-a-number']));
            vi.spyOn(client, 'batchStream').mockImplementation(async function* () {});

            const schema = makeSchema<number>((v) =>
                typeof v === 'number' ? { value: v } : { issues: [{ message: 'not a number' }] },
            );

            const [result] = await drain(client.stream('/p', { itemSchema: schema }));

            expect(result.err).toBeInstanceOf(BCPaginatedItemValidationError);
        });

        it('mixes Ok and Err when some items fail schema', async () => {
            vi.spyOn(client, 'get').mockResolvedValue(makePage([1, 'bad', 3]));
            vi.spyOn(client, 'batchStream').mockImplementation(async function* () {});

            const schema = makeSchema<number>((v) =>
                typeof v === 'number' ? { value: v } : { issues: [{ message: 'bad' }] },
            );

            const results = await drain(client.stream('/p', { itemSchema: schema }));

            expect(results[0]).toEqual(Ok(1));
            expect(results[1].err).toBeInstanceOf(BCPaginatedItemValidationError);
            expect(results[2]).toEqual(Ok(3));
        });
    });

    describe('multi-page request construction', () => {
        it('passes remaining pages to batchStream', async () => {
            vi.spyOn(client, 'get').mockResolvedValue(makePage([{ id: 1 }], { total_pages: 3, per_page: 250 }));

            const batchSpy = vi.spyOn(client, 'batchStream').mockImplementation(async function* () {});

            await drain(client.stream('/products'));

            expect(batchSpy).toHaveBeenCalledWith(
                [
                    { method: 'GET', path: '/products', query: { limit: 250, page: 2 } },
                    { method: 'GET', path: '/products', query: { limit: 250, page: 3 } },
                ],
                undefined,
            );
        });

        it('uses API per_page for subsequent requests when it differs from requested limit', async () => {
            vi.spyOn(client, 'get').mockResolvedValue(makePage([{ id: 1 }], { total_pages: 3, per_page: 100 }));

            const batchSpy = vi.spyOn(client, 'batchStream').mockImplementation(async function* () {});

            await drain(client.stream('/products', { query: { limit: 250 } }));

            expect(batchSpy).toHaveBeenCalledWith(
                [
                    { method: 'GET', path: '/products', query: { limit: 100, page: 2 } },
                    { method: 'GET', path: '/products', query: { limit: 100, page: 3 } },
                ],
                expect.anything(),
            );
        });

        it('requests only pages after the given start page', async () => {
            vi.spyOn(client, 'get').mockResolvedValue(
                makePage([{ id: 1 }], { total_pages: 5, per_page: 250, current_page: 3 }),
            );

            const batchSpy = vi.spyOn(client, 'batchStream').mockImplementation(async function* () {});

            await drain(client.stream('/products', { query: { page: 3 } }));

            expect(batchSpy).toHaveBeenCalledWith(
                [
                    { method: 'GET', path: '/products', query: { limit: 250, page: 4 } },
                    { method: 'GET', path: '/products', query: { limit: 250, page: 5 } },
                ],
                expect.anything(),
            );
        });

        it('does not call batchStream when already on the last page', async () => {
            vi.spyOn(client, 'get').mockResolvedValue(
                makePage([{ id: 1 }], { total_pages: 3, per_page: 250, current_page: 3 }),
            );

            const batchSpy = vi.spyOn(client, 'batchStream');

            await drain(client.stream('/products', { query: { page: 3 } }));

            expect(batchSpy).not.toHaveBeenCalled();
        });
    });

    describe('subsequent page error handling', () => {
        it('yields Err for invalid page response but continues to next page', async () => {
            vi.spyOn(client, 'get').mockResolvedValue(makePage([{ id: 1 }], { total_pages: 3, per_page: 250 }));
            vi.spyOn(client, 'batchStream').mockImplementation(async function* () {
                yield Ok(null); // bad — not a paginated envelope
                yield Ok(makePage([{ id: 3 }]));
            });

            const results = await drain(client.stream('/products'));

            expect(results[0]).toEqual(Ok({ id: 1 }));
            expect(results[1].err).toBeInstanceOf(BCPaginatedResponseError);
            expect(results[2]).toEqual(Ok({ id: 3 }));
        });

        it('propagates Err from batchStream directly', async () => {
            const error = new BCClientError('page 2 failed');

            vi.spyOn(client, 'get').mockResolvedValue(makePage([{ id: 1 }], { total_pages: 2, per_page: 250 }));
            vi.spyOn(client, 'batchStream').mockImplementation(async function* () {
                yield Err(error);
            });

            const results = await drain(client.stream('/products'));

            expect(results[0]).toEqual(Ok({ id: 1 }));
            expect(results[1]).toEqual(Err(error));
        });
    });
});

describe('collect', () => {
    it('returns all items as a flat array', async () => {
        const client = makeClient();
        const items = [{ id: 1 }, { id: 2 }, { id: 3 }];

        vi.spyOn(client, 'get').mockResolvedValue(makePage(items));
        vi.spyOn(client, 'batchStream').mockImplementation(async function* () {});

        const result = await client.collect('/products');

        expect(result).toEqual(items);
    });
});

describe('streamCount', () => {
    let client: BigCommerceClient;

    beforeEach(() => {
        client = makeClient();
    });

    describe('pagination option validation', () => {
        it('throws BCPaginatedOptionError for count = 0', async () => {
            await expect(drain(client.streamCount('/p', { count: 0 }))).rejects.toThrow(BCPaginatedOptionError);
        });

        it('throws BCPaginatedOptionError for negative count', async () => {
            await expect(drain(client.streamCount('/p', { count: -1 }))).rejects.toThrow(BCPaginatedOptionError);
        });

        it('throws BCPaginatedOptionError for non-number count', async () => {
            await expect(drain(client.streamCount('/p', { count: 'bad' as unknown as number }))).rejects.toThrow(
                BCPaginatedOptionError,
            );
        });

        it('throws BCPaginatedOptionError for page = 0', async () => {
            await expect(drain(client.streamCount('/p', { count: 100, query: { page: 0 } }))).rejects.toThrow(
                BCPaginatedOptionError,
            );
        });

        it('throws BCPaginatedOptionError for negative limit', async () => {
            await expect(drain(client.streamCount('/p', { count: 100, query: { limit: -1 } }))).rejects.toThrow(
                BCPaginatedOptionError,
            );
        });
    });

    describe('request construction', () => {
        it('requests all pages from 1 to ceil(count/limit)', async () => {
            const batchSpy = vi.spyOn(client, 'batchStream').mockImplementation(async function* () {});

            await drain(client.streamCount('/legacy', { count: 500, query: { limit: 250 } }));

            expect(batchSpy).toHaveBeenCalledWith(
                [
                    { method: 'GET', path: '/legacy', query: { limit: 250, page: 1 } },
                    { method: 'GET', path: '/legacy', query: { limit: 250, page: 2 } },
                ],
                expect.anything(),
            );
        });

        it('uses DEFAULT_BLIND_COUNT and DEFAULT_LIMIT when options are omitted', async () => {
            const batchSpy = vi.spyOn(client, 'batchStream').mockImplementation(async function* () {});

            await drain(client.streamCount('/legacy'));

            const [requests] = batchSpy.mock.calls[0];

            expect(requests).toHaveLength(8); // ceil(2000/250) = 8
            expect(requests[0]).toMatchObject({ query: { page: 1, limit: 250 } });
            expect(requests[7]).toMatchObject({ query: { page: 8, limit: 250 } });
        });

        it('starts from the given page', async () => {
            const batchSpy = vi.spyOn(client, 'batchStream').mockImplementation(async function* () {});

            await drain(client.streamCount('/legacy', { count: 500, query: { limit: 250, page: 2 } }));

            expect(batchSpy).toHaveBeenCalledWith(
                [{ method: 'GET', path: '/legacy', query: { limit: 250, page: 2 } }],
                expect.anything(),
            );
        });

        it('includes a partial last page when count is not a multiple of limit', async () => {
            const batchSpy = vi.spyOn(client, 'batchStream').mockImplementation(async function* () {});

            await drain(client.streamCount('/legacy', { count: 501, query: { limit: 250 } }));

            const [requests] = batchSpy.mock.calls[0];

            expect(requests).toHaveLength(3); // ceil(501/250) = 3
            expect(requests[2]).toMatchObject({ query: { page: 3 } });
        });

        it('spreads extra query params into every request', async () => {
            const batchSpy = vi.spyOn(client, 'batchStream').mockImplementation(async function* () {});

            await drain(client.streamCount('/legacy', { count: 250, query: { limit: 250, category_id: 5 } }));

            expect(batchSpy).toHaveBeenCalledWith(
                [{ method: 'GET', path: '/legacy', query: { limit: 250, page: 1, category_id: 5 } }],
                expect.anything(),
            );
        });

        it('passes options to batchStream for concurrency settings', async () => {
            const batchSpy = vi.spyOn(client, 'batchStream').mockImplementation(async function* () {});
            const options = { count: 250, query: { limit: 250 }, concurrency: 3 };

            await drain(client.streamCount('/legacy', options));

            expect(batchSpy).toHaveBeenCalledWith(expect.anything(), options);
        });
    });

    describe('response handling', () => {
        it('yields Ok for each item in flat array responses', async () => {
            vi.spyOn(client, 'batchStream').mockImplementation(async function* () {
                yield Ok([{ id: 1 }, { id: 2 }]);
                yield Ok([{ id: 3 }]);
            });

            const results = await drain(client.streamCount('/legacy', { count: 500, query: { limit: 250 } }));

            expect(results).toEqual([Ok({ id: 1 }), Ok({ id: 2 }), Ok({ id: 3 })]);
        });

        it('yields nothing when pages are empty', async () => {
            vi.spyOn(client, 'batchStream').mockImplementation(async function* () {
                yield Ok([]);
            });

            const results = await drain(client.streamCount('/legacy', { count: 250, query: { limit: 250 } }));

            expect(results).toEqual([]);
        });

        it('yields Err(BCClientError) when response is not an array', async () => {
            vi.spyOn(client, 'batchStream').mockImplementation(async function* () {
                yield Ok({ data: [], meta: {} }); // v3 envelope — not a flat array
            });

            const results = await drain(client.streamCount('/legacy', { count: 250, query: { limit: 250 } }));

            expect(results).toHaveLength(1);
            expect(results[0].err).toBeInstanceOf(BCClientError);
        });

        it('yields Err from batchStream', async () => {
            const error = new BCClientError('request failed');

            vi.spyOn(client, 'batchStream').mockImplementation(async function* () {
                yield Err(error);
            });

            const results = await drain(client.streamCount('/legacy', { count: 250, query: { limit: 250 } }));

            expect(results).toEqual([Err(error)]);
        });

        it('continues after a non-array page response', async () => {
            vi.spyOn(client, 'batchStream').mockImplementation(async function* () {
                yield Ok('not an array');
                yield Ok([{ id: 1 }]);
            });

            const results = await drain(client.streamCount('/legacy', { count: 500, query: { limit: 250 } }));

            expect(results[0].err).toBeInstanceOf(BCClientError);
            expect(results[1]).toEqual(Ok({ id: 1 }));
        });
    });

    describe('item schema validation', () => {
        it('yields Ok(validatedValue) when schema passes', async () => {
            vi.spyOn(client, 'batchStream').mockImplementation(async function* () {
                yield Ok([10, 20]);
            });

            const schema = makeSchema<number>((v) => ({ value: (v as number) * 2 }));
            const results = await drain(
                client.streamCount('/legacy', { count: 250, query: { limit: 250 }, itemSchema: schema }),
            );

            expect(results).toEqual([Ok(20), Ok(40)]);
        });

        it('yields Err(BCPaginatedItemValidationError) when schema fails', async () => {
            vi.spyOn(client, 'batchStream').mockImplementation(async function* () {
                yield Ok(['not-a-number']);
            });

            const schema = makeSchema<number>((v) =>
                typeof v === 'number' ? { value: v } : { issues: [{ message: 'not a number' }] },
            );

            const results = await drain(
                client.streamCount('/legacy', { count: 250, query: { limit: 250 }, itemSchema: schema }),
            );

            expect(results[0].err).toBeInstanceOf(BCPaginatedItemValidationError);
        });

        it('mixes Ok and Err when some items fail schema', async () => {
            vi.spyOn(client, 'batchStream').mockImplementation(async function* () {
                yield Ok([1, 'bad', 3]);
            });

            const schema = makeSchema<number>((v) =>
                typeof v === 'number' ? { value: v } : { issues: [{ message: 'bad' }] },
            );

            const results = await drain(
                client.streamCount('/legacy', { count: 250, query: { limit: 250 }, itemSchema: schema }),
            );

            expect(results[0]).toEqual(Ok(1));
            expect(results[1].err).toBeInstanceOf(BCPaginatedItemValidationError);
            expect(results[2]).toEqual(Ok(3));
        });
    });
});

describe('collectCount', () => {
    it('returns all items as a flat array', async () => {
        const client = makeClient();

        vi.spyOn(client, 'batchStream').mockImplementation(async function* () {
            yield Ok([{ id: 1 }, { id: 2 }]);
            yield Ok([{ id: 3 }]);
        });

        const result = await client.collectCount('/legacy', { count: 500, query: { limit: 250 } });

        expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });

    it('throws when any item yields an error', async () => {
        const client = makeClient();
        const error = new BCClientError('bad page');

        vi.spyOn(client, 'batchStream').mockImplementation(async function* () {
            yield Ok([{ id: 1 }]);
            yield Err(error);
        });

        await expect(client.collectCount('/legacy', { count: 500, query: { limit: 250 } })).rejects.toThrow(error);
    });
});
