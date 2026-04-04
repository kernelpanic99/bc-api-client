import { BigCommerceClient } from 'src';
import { describe, expect, it, vi } from 'vitest';
import { BCApiError } from '../src/lib/errors';
import { VALID_CREDENTIALS } from './util';

const bcClientStream = (responses: Response[]) => {
    let index = 0;

    return new BigCommerceClient({
        ...VALID_CREDENTIALS,
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
});
