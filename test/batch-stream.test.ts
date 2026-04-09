import { BigCommerceClient } from 'src';
import { BASE_KY_CONFIG } from 'src/lib/common';
import { describe, expect, it, vi } from 'vitest';
import { BCApiError } from '../src/lib/errors';
import { VALID_CREDENTIALS } from './util';

const bcClientStream = (responses: Response[]) => {
    let index = 0;

    return new BigCommerceClient({
        ...VALID_CREDENTIALS,
        retry: {
            ...BASE_KY_CONFIG.retry,
            backoffLimit: 1,
        },
        hooks: {
            beforeRequest: [
                () => {
                    return responses[index++] ?? new Response('{}', { status: 404 });
                },
            ],
        },
    });
};

const echo = (data: unknown, status: number = 200) => new Response(JSON.stringify(data), { status });
const errResponse = (status: number) => new Response(JSON.stringify({ status, title: 'Error' }), { status });
const rateLimitResponse = () =>
    new Response(JSON.stringify({ status: 429, title: 'Too Many Requests' }), {
        status: 429,
        headers: { 'x-rate-limit-time-reset-ms': '0' },
    });

describe('BigCommerceClient', () => {
    describe('batchStream', () => {
        it('yields Ok for each successful request', async () => {
            const items = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));
            const client = bcClientStream(items.map((it) => echo(it)));
            const requests = items.map((it) => ({ method: 'GET' as const, path: `/catalog/products/${it.id}` }));

            const count = vi.fn();

            for await (const result of client.batchStream(requests)) {
                count();
                expect(result.ok).toBe(true);
                expect(result.err).toBeUndefined();
                expect(result.data).toHaveProperty('id');
            }

            expect(count).toHaveBeenCalledTimes(items.length);
        });

        it('yields Err for failed requests without throwing', async () => {
            const client = bcClientStream([errResponse(500), errResponse(404), errResponse(422)]);
            const requests = [
                { method: 'GET' as const, path: '/a' },
                { method: 'GET' as const, path: '/b' },
                { method: 'GET' as const, path: '/c' },
            ];

            const results = [];

            for await (const result of client.batchStream(requests)) {
                results.push(result);
            }

            expect(results).toHaveLength(3);

            for (const result of results) {
                expect(result.ok).toBe(false);
                expect(result.data).toBeUndefined();
                expect(result.err).toBeInstanceOf(BCApiError);
            }
        });

        it('yields all results for mixed success/failure', async () => {
            const responses = [echo({ id: 1 }), errResponse(500), echo({ id: 3 }), errResponse(404)];
            const client = bcClientStream(responses);
            const requests = responses.map((_, i) => ({ method: 'GET' as const, path: `/items/${i}` }));

            const ok: unknown[] = [];
            const err: unknown[] = [];

            for await (const result of client.batchStream(requests)) {
                if (result.ok) {
                    ok.push(result.data);
                } else {
                    err.push(result.err);
                }
            }

            expect(ok).toHaveLength(2);
            expect(err).toHaveLength(2);

            for (const e of err) {
                expect(e).toBeInstanceOf(BCApiError);
            }
        });

        it('yields nothing for an empty request list', async () => {
            const client = bcClientStream([]);
            const count = vi.fn();

            for await (const _ of client.batchStream([])) {
                count();
            }

            expect(count).not.toHaveBeenCalled();
        });

        it('respects concurrency limit', async () => {
            const concurrency = 3;
            let active = 0;
            let maxActive = 0;

            const client = new BigCommerceClient({
                ...VALID_CREDENTIALS,
                hooks: {
                    beforeRequest: [
                        async () => {
                            active++;
                            maxActive = Math.max(maxActive, active);

                            await Promise.resolve();

                            active--;

                            return new Response('{}');
                        },
                    ],
                },
            });

            const requests = Array.from({ length: 15 }, (_, i) => ({
                method: 'GET' as const,
                path: `/test/${i}`,
            }));

            for await (const _ of client.batchStream(requests, { concurrency })) {
                /* drain */
            }

            expect(maxActive).toBeLessThanOrEqual(concurrency);
        });

        it('yields results in request order when concurrency is false', async () => {
            const items = Array.from({ length: 5 }, (_, i) => ({ id: i + 1 }));
            const client = bcClientStream(items.map((it) => echo(it)));
            const requests = items.map((it) => ({ method: 'GET' as const, path: `/items/${it.id}` }));

            const results: unknown[] = [];

            for await (const result of client.batchStream(requests, { concurrency: false })) {
                expect(result.ok).toBe(true);
                results.push(result.data);
            }

            expect(results).toEqual(items);
        });

        it('can be exited early without hanging', async () => {
            const items = Array.from({ length: 50 }, (_, i) => ({ id: i }));
            const client = bcClientStream(items.map((it) => echo(it)));
            const requests = items.map((it) => ({ method: 'GET' as const, path: `/items/${it.id}` }));

            let yielded = 0;

            for await (const _ of client.batchStream(requests, { concurrency: 1 })) {
                yielded++;
                break;
            }

            expect(yielded).toBe(1);
        });

        it('calls backoff with current concurrency and error status', async () => {
            const backoff = vi.fn().mockReturnValue(1);
            let call = 0;

            const client = new BigCommerceClient({
                ...VALID_CREDENTIALS,
                hooks: {
                    beforeRequest: [() => (call++ === 0 ? errResponse(500) : echo({}))],
                },
            });

            for await (const _ of client.batchStream([{ method: 'GET' as const, path: '/test' }], {
                concurrency: 5,
                backoff,
            })) {
            }

            expect(backoff).toHaveBeenCalledWith(5, 500);
        });

        it('reduces concurrency to rateLimitBackoff on 429', async () => {
            const concurrency = 5;
            const rateLimitBackoff = 2;
            // Using a single request so the only afterResponse that can fire is the retry's.
            // By that point, beforeRetry has already set limit.concurrency = rateLimitBackoff.
            // backoffRecover receives the current limit.concurrency, confirming the reduction happened.
            const backoffRecover = vi.fn().mockReturnValue(0);
            let firstCall = true;

            const client = new BigCommerceClient({
                ...VALID_CREDENTIALS,
                hooks: {
                    beforeRequest: [
                        () => {
                            if (firstCall) {
                                firstCall = false;
                                return rateLimitResponse();
                            }
                            return echo({});
                        },
                    ],
                },
            });

            for await (const _ of client.batchStream([{ method: 'GET' as const, path: '/test' }], {
                concurrency,
                rateLimitBackoff,
                backoffRecover,
            })) {
            }

            expect(backoffRecover).toHaveBeenCalledWith(rateLimitBackoff);
        });

        it('calls backoffRecover on success when concurrency is degraded', async () => {
            const concurrency = 4;
            // DEFAULT_BACKOFF_RATE=2, so backoff halves concurrency: ceil(4/2)=2.
            // Using a single request so the retry's afterResponse fires after beforeRetry has already reduced
            // limit.concurrency — no race with concurrent requests that succeed before backoff kicks in.
            const backoffRecover = vi.fn().mockReturnValue(0);
            let firstCall = true;

            const client = new BigCommerceClient({
                ...VALID_CREDENTIALS,
                hooks: {
                    beforeRequest: [
                        () => {
                            if (firstCall) {
                                firstCall = false;
                                return errResponse(500);
                            }
                            return echo({});
                        },
                    ],
                },
            });

            for await (const _ of client.batchStream([{ method: 'GET' as const, path: '/test' }], {
                concurrency,
                backoffRecover,
            })) {
            }

            expect(backoffRecover).toHaveBeenCalledWith(Math.ceil(concurrency / 2));
        });
    });

    describe('batchSafe', () => {
        it('returns an array of Ok results for all successful requests', async () => {
            const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
            const client = bcClientStream(items.map((it) => echo(it)));
            const requests = items.map((it) => ({ method: 'GET' as const, path: `/items/${it.id}` }));

            const results = await client.batchSafe(requests);

            expect(results).toHaveLength(3);

            for (const [i, result] of results.entries()) {
                expect(result.ok).toBe(true);
                expect(result.data).toEqual(items[i]);
            }
        });

        it('returns Err for failed requests without throwing', async () => {
            const client = bcClientStream([errResponse(500), errResponse(404)]);
            const requests = [
                { method: 'GET' as const, path: '/a' },
                { method: 'GET' as const, path: '/b' },
            ];

            const results = await client.batchSafe(requests);

            expect(results).toHaveLength(2);

            for (const result of results) {
                expect(result.ok).toBe(false);
                expect(result.err).toBeInstanceOf(BCApiError);
            }
        });

        it('returns mixed Ok and Err for mixed responses', async () => {
            const responses = [echo({ id: 1 }), errResponse(422), echo({ id: 3 })];
            const client = bcClientStream(responses);
            const requests = responses.map((_, i) => ({ method: 'GET' as const, path: `/items/${i}` }));

            const results = await client.batchSafe(requests, { concurrency: false });

            expect(results).toHaveLength(3);
            expect(results[0].ok).toBe(true);
            expect(results[1].ok).toBe(false);
            expect(results[2].ok).toBe(true);
        });

        it('returns an empty array for an empty request list', async () => {
            const client = bcClientStream([]);

            const results = await client.batchSafe([]);

            expect(results).toEqual([]);
        });
    });

    describe('index correlation', () => {
        it('batchStream: index matches input position when concurrency is false', async () => {
            const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
            const client = bcClientStream(items.map((it) => echo(it)));
            const requests = items.map((it) => ({ method: 'GET' as const, path: `/items/${it.id}` }));

            const results = [];

            for await (const result of client.batchStream(requests, { concurrency: false })) {
                results.push(result);
            }

            for (const [i, result] of results.entries()) {
                expect(result.index).toBe(i);
            }
        });

        it('batchStream: index can be used to recover input order from out-of-order completions', async () => {
            const items = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
            let call = 0;
            // Responses complete in reverse order: last request resolves first.
            const delays = [50, 30, 20, 10, 0];

            const client = new BigCommerceClient({
                ...VALID_CREDENTIALS,
                hooks: {
                    beforeRequest: [
                        async () => {
                            const i = call++;
                            await new Promise((r) => setTimeout(r, delays[i]));
                            return echo(items[i]);
                        },
                    ],
                },
            });

            const requests = items.map((_, i) => ({ method: 'GET' as const, path: `/items/${i}` }));
            const results = [];

            for await (const result of client.batchStream(requests)) {
                results.push(result);
            }

            // Arrival order should differ from input order due to delays.
            const arrivalIndexes = results.map((r) => r.index);
            expect(arrivalIndexes).not.toEqual([0, 1, 2, 3, 4]);

            // Sorting by index recovers input order.
            const sorted = [...results].sort((a, b) => a.index - b.index);
            expect(sorted.map((r) => r.data)).toEqual(items);
        });

        it('batchSafe: index matches input position and allows recovery of input order', async () => {
            const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
            let call = 0;
            const delays = [20, 10, 0];

            const client = new BigCommerceClient({
                ...VALID_CREDENTIALS,
                hooks: {
                    beforeRequest: [
                        async () => {
                            const i = call++;
                            await new Promise((r) => setTimeout(r, delays[i]));
                            return echo(items[i]);
                        },
                    ],
                },
            });

            const requests = items.map((_, i) => ({ method: 'GET' as const, path: `/items/${i}` }));
            const results = await client.batchSafe(requests);

            const sorted = [...results].sort((a, b) => a.index - b.index);
            expect(sorted.map((r) => r.data)).toEqual(items);
        });
    });
});
