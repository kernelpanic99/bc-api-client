import { BigCommerceClient } from 'src/client';
import {
    type BaseError,
    BCApiError,
    BCClientError,
    BCPaginatedItemValidationError,
    BCPaginatedOptionError,
    BCPaginatedResponseError,
    BCResponseParseError,
} from 'src/lib/errors';
import { Err, Ok, type PageResult, type Result } from 'src/lib/result';
import type { StandardSchemaV1 } from 'src/lib/standard-schema';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const makeClient = () => new BigCommerceClient({ storeHash: 'abc', accessToken: 'tok', logger: false });

/** Wraps a Result with an index to satisfy the BatchResult type expected by batchStream/batchSafe mocks. */
const br = <T>(r: Result<T, BaseError>, index = 0) => ({ ...r, index });

/** Wraps a Result with a page number to match the PageResult shape yielded by stream/streamBlind. */
const pr = <T>(r: Result<T, BaseError>, page: number): PageResult<T, BaseError> => ({ ...r, page });

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

            expect(results).toEqual(items.map((v) => pr(Ok(v), 1)));
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

            expect(results).toEqual([pr(Ok(84), 1), pr(Ok(14), 1)]);
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

            expect(results[0]).toEqual(pr(Ok(1), 1));
            expect(results[1].err).toBeInstanceOf(BCPaginatedItemValidationError);
            expect(results[2]).toEqual(pr(Ok(3), 1));
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
                { concurrency: undefined, rateLimitBackoff: undefined, backoff: undefined, backoffRecover: undefined },
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
                yield br(Ok(null)); // bad — not a paginated envelope, index 0 → page 2
                yield br(Ok(makePage([{ id: 3 }])), 1); // index 1 → page 3
            });

            const results = await drain(client.stream('/products'));

            expect(results[0]).toEqual(pr(Ok({ id: 1 }), 1));
            expect(results[1].err).toBeInstanceOf(BCPaginatedResponseError);
            expect(results[1].page).toBe(2);
            expect(results[2]).toEqual(pr(Ok({ id: 3 }), 3));
        });

        it('propagates Err from batchStream directly', async () => {
            const error = new BCClientError('page 2 failed');

            vi.spyOn(client, 'get').mockResolvedValue(makePage([{ id: 1 }], { total_pages: 2, per_page: 250 }));
            vi.spyOn(client, 'batchStream').mockImplementation(async function* () {
                yield br(Err(error)); // index 0 → page 2
            });

            const results = await drain(client.stream('/products'));

            expect(results[0]).toEqual(pr(Ok({ id: 1 }), 1));
            expect(results[1]).toEqual(pr(Err(error), 2));
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

function make404Error(): BCApiError {
    const httpError = Object.assign(new Error('Not Found'), {
        request: { method: 'GET', url: 'http://x.com', text: () => Promise.resolve('') },
        response: { status: 404, statusText: 'Not Found', text: () => Promise.resolve(''), headers: new Headers() },
    });

    // biome-ignore lint/suspicious/noExplicitAny: Test files
    return new BCApiError(httpError as any, '', '');
}

describe('streamBlind', () => {
    let client: BigCommerceClient;

    beforeEach(() => {
        client = makeClient();
    });

    describe('pagination option validation', () => {
        it('throws BCPaginatedOptionError for maxPages = 0', async () => {
            await expect(drain(client.streamBlind('/p', { maxPages: 0 }))).rejects.toThrow(BCPaginatedOptionError);
        });

        it('throws BCPaginatedOptionError for negative maxPages', async () => {
            await expect(drain(client.streamBlind('/p', { maxPages: -1 }))).rejects.toThrow(BCPaginatedOptionError);
        });

        it('throws BCPaginatedOptionError for non-number maxPages', async () => {
            await expect(drain(client.streamBlind('/p', { maxPages: 'bad' as unknown as number }))).rejects.toThrow(
                BCPaginatedOptionError,
            );
        });

        it('throws BCPaginatedOptionError for page = 0', async () => {
            await expect(drain(client.streamBlind('/p', { query: { page: 0 } }))).rejects.toThrow(
                BCPaginatedOptionError,
            );
        });

        it('throws BCPaginatedOptionError for negative limit', async () => {
            await expect(drain(client.streamBlind('/p', { query: { limit: -1 } }))).rejects.toThrow(
                BCPaginatedOptionError,
            );
        });
    });

    describe('request construction', () => {
        it('sends page and limit in each request', async () => {
            const batchSpy = vi.spyOn(client, 'batchSafe').mockResolvedValue([br(Ok([]))]);

            await drain(client.streamBlind('/legacy', { query: { limit: 50 }, concurrency: 1 }));

            expect(batchSpy).toHaveBeenCalledWith(
                [{ method: 'GET', version: 'v2', path: '/legacy', query: { limit: 50, page: 1 } }],
                expect.anything(),
            );
        });

        it('uses DEFAULT_LIMIT when limit is omitted', async () => {
            const batchSpy = vi.spyOn(client, 'batchSafe').mockResolvedValue([br(Ok([]))]);

            await drain(client.streamBlind('/legacy', { concurrency: 1 }));

            expect(batchSpy).toHaveBeenCalledWith(
                [{ method: 'GET', version: 'v2', path: '/legacy', query: { limit: 250, page: 1 } }],
                expect.anything(),
            );
        });

        it('starts from the given page', async () => {
            const batchSpy = vi.spyOn(client, 'batchSafe').mockResolvedValue([br(Ok([]))]);

            await drain(client.streamBlind('/legacy', { query: { limit: 250, page: 3 }, concurrency: 1 }));

            expect(batchSpy).toHaveBeenCalledWith(
                [{ method: 'GET', version: 'v2', path: '/legacy', query: { limit: 250, page: 3 } }],
                expect.anything(),
            );
        });

        it('spreads extra query params into every request', async () => {
            const batchSpy = vi.spyOn(client, 'batchSafe').mockResolvedValue([br(Ok([]))]);

            await drain(client.streamBlind('/legacy', { query: { limit: 250, category_id: 5 }, concurrency: 1 }));

            expect(batchSpy).toHaveBeenCalledWith(
                [{ method: 'GET', version: 'v2', path: '/legacy', query: { limit: 250, page: 1, category_id: 5 } }],
                expect.anything(),
            );
        });

        it('advances by concurrency pages per batch', async () => {
            const batchSpy = vi
                .spyOn(client, 'batchSafe')
                .mockResolvedValueOnce([br(Ok([{ id: 1 }])), br(Ok([{ id: 2 }]), 1)])
                .mockResolvedValue([br(Ok([]))]);

            await drain(client.streamBlind('/legacy', { query: { limit: 250 }, concurrency: 2 }));

            expect(batchSpy.mock.calls[0][0]).toEqual([
                { method: 'GET', version: 'v2', path: '/legacy', query: { limit: 250, page: 1 } },
                { method: 'GET', version: 'v2', path: '/legacy', query: { limit: 250, page: 2 } },
            ]);
        });

        it('adjusts next batch size to limit.concurrency after backoff', async () => {
            const batchSpy = vi
                .spyOn(client, 'batchSafe')
                .mockImplementationOnce(async (_reqs, opts) => {
                    const { pLimit } = opts ?? {};
                    if (pLimit) {
                        pLimit.concurrency = 2;
                    }
                    return [
                        br(Ok([{ id: 1 }])),
                        br(Ok([{ id: 2 }]), 1),
                        br(Ok([{ id: 3 }]), 2),
                        br(Ok([{ id: 4 }]), 3),
                    ];
                })
                .mockResolvedValue([br(Ok([]))]);

            await drain(client.streamBlind('/legacy', { query: { limit: 250 }, concurrency: 4 }));

            expect(batchSpy.mock.calls[1][0]).toHaveLength(2);
            expect(batchSpy.mock.calls[1][0]).toEqual([
                { method: 'GET', version: 'v2', path: '/legacy', query: { limit: 250, page: 5 } },
                { method: 'GET', version: 'v2', path: '/legacy', query: { limit: 250, page: 6 } },
            ]);
        });
    });

    describe('stopping conditions', () => {
        it('stops after receiving an empty page', async () => {
            const batchSpy = vi
                .spyOn(client, 'batchSafe')
                .mockResolvedValueOnce([br(Ok([{ id: 1 }]))])
                .mockResolvedValueOnce([br(Ok([]))])
                .mockResolvedValue([br(Ok([{ id: 99 }]))]);

            const results = await drain(client.streamBlind('/legacy', { concurrency: 1 }));

            expect(results).toEqual([pr(Ok({ id: 1 }), 1)]);
            expect(batchSpy).toHaveBeenCalledTimes(2);
        });

        it('stops after a 404 without yielding an error', async () => {
            vi.spyOn(client, 'batchSafe')
                .mockResolvedValueOnce([br(Ok([{ id: 1 }]))])
                .mockResolvedValueOnce([br(Err(make404Error()))]);

            const results = await drain(client.streamBlind('/legacy', { concurrency: 1 }));

            expect(results).toEqual([pr(Ok({ id: 1 }), 1)]);
        });

        it('stops after a 204 empty body without yielding an error', async () => {
            const err204 = new BCResponseParseError('GET', '/legacy', 204, null, undefined, '');

            vi.spyOn(client, 'batchSafe')
                .mockResolvedValueOnce([br(Ok([{ id: 1 }]))])
                .mockResolvedValueOnce([br(Err(err204))]);

            const results = await drain(client.streamBlind('/legacy', { concurrency: 1 }));

            expect(results).toEqual([pr(Ok({ id: 1 }), 1)]);
        });

        it('stops at maxPages', async () => {
            const batchSpy = vi.spyOn(client, 'batchSafe').mockResolvedValue([br(Ok([{ id: 1 }]))]);

            await drain(client.streamBlind('/legacy', { maxPages: 2, concurrency: 1 }));

            expect(batchSpy).toHaveBeenCalledTimes(2);
        });
    });

    describe('response handling', () => {
        it('yields Ok for each item in array pages', async () => {
            vi.spyOn(client, 'batchSafe')
                .mockResolvedValueOnce([br(Ok([{ id: 1 }, { id: 2 }]))])
                .mockResolvedValue([br(Ok([]))]);

            const results = await drain(client.streamBlind('/legacy', { concurrency: 1 }));

            expect(results).toEqual([pr(Ok({ id: 1 }), 1), pr(Ok({ id: 2 }), 1)]);
        });

        it('yields Err(BCClientError) when page response is not an array', async () => {
            vi.spyOn(client, 'batchSafe')
                .mockResolvedValueOnce([br(Ok({ data: [], meta: {} }))]) // v3 envelope — not a flat array
                .mockResolvedValue([br(Ok([]))]);

            const results = await drain(client.streamBlind('/legacy', { concurrency: 1 }));

            expect(results).toHaveLength(1);
            expect(results[0].err).toBeInstanceOf(BCClientError);
            expect(results[0].page).toBe(1);
        });

        it('yields Err for non-terminating API errors and continues', async () => {
            const error = new BCClientError('request failed');

            vi.spyOn(client, 'batchSafe')
                .mockResolvedValueOnce([br(Err(error))])
                .mockResolvedValue([br(Ok([]))]);

            const results = await drain(client.streamBlind('/legacy', { concurrency: 1 }));

            expect(results[0]).toEqual(pr(Err(error), 1));
        });

        it('continues after a non-array page response', async () => {
            vi.spyOn(client, 'batchSafe')
                .mockResolvedValueOnce([br(Ok('not an array')), br(Ok([{ id: 1 }]), 1)]) // index 0 → page 1, index 1 → page 2
                .mockResolvedValue([br(Ok([]))]);

            const results = await drain(client.streamBlind('/legacy', { concurrency: 2 }));

            expect(results[0].err).toBeInstanceOf(BCClientError);
            expect(results[0].page).toBe(1);
            expect(results[1]).toEqual(pr(Ok({ id: 1 }), 2));
        });
    });

    describe('item schema validation', () => {
        it('yields Ok(validatedValue) when schema passes', async () => {
            vi.spyOn(client, 'batchSafe')
                .mockResolvedValueOnce([br(Ok([10, 20]))])
                .mockResolvedValue([br(Ok([]))]);

            const schema = makeSchema<number>((v) => ({ value: (v as number) * 2 }));
            const results = await drain(client.streamBlind('/legacy', { itemSchema: schema, concurrency: 1 }));

            expect(results).toEqual([pr(Ok(20), 1), pr(Ok(40), 1)]);
        });

        it('yields Err(BCPaginatedItemValidationError) when schema fails', async () => {
            vi.spyOn(client, 'batchSafe')
                .mockResolvedValueOnce([br(Ok(['not-a-number']))])
                .mockResolvedValue([br(Ok([]))]);

            const schema = makeSchema<number>((v) =>
                typeof v === 'number' ? { value: v } : { issues: [{ message: 'not a number' }] },
            );
            const results = await drain(client.streamBlind('/legacy', { itemSchema: schema, concurrency: 1 }));

            expect(results[0].err).toBeInstanceOf(BCPaginatedItemValidationError);
        });

        it('mixes Ok and Err when some items fail schema', async () => {
            vi.spyOn(client, 'batchSafe')
                .mockResolvedValueOnce([br(Ok([1, 'bad', 3]))])
                .mockResolvedValue([br(Ok([]))]);

            const schema = makeSchema<number>((v) =>
                typeof v === 'number' ? { value: v } : { issues: [{ message: 'bad' }] },
            );
            const results = await drain(client.streamBlind('/legacy', { itemSchema: schema, concurrency: 1 }));

            expect(results[0]).toEqual(pr(Ok(1), 1));
            expect(results[1].err).toBeInstanceOf(BCPaginatedItemValidationError);
            expect(results[2]).toEqual(pr(Ok(3), 1));
        });
    });
});

describe('collectBlind', () => {
    it('returns all items as a flat array', async () => {
        const client = makeClient();

        vi.spyOn(client, 'batchSafe')
            .mockResolvedValueOnce([br(Ok([{ id: 1 }, { id: 2 }]))])
            .mockResolvedValueOnce([br(Ok([{ id: 3 }]))])
            .mockResolvedValue([br(Ok([]))]);

        const result = await client.collectBlind('/legacy', { concurrency: 1 });

        expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });

    it('throws when any item yields an error', async () => {
        const client = makeClient();
        const error = new BCClientError('bad page');

        vi.spyOn(client, 'batchSafe')
            .mockResolvedValueOnce([br(Ok([{ id: 1 }]))])
            .mockResolvedValueOnce([br(Err(error))]);

        await expect(client.collectBlind('/legacy', { concurrency: 1 })).rejects.toThrow(error);
    });
});
