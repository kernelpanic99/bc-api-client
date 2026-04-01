import { BigCommerceClient } from 'src';
import { describe, expect, it, vi } from 'vitest';
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

describe('BigCommerceClient', () => {
    describe('stream', () => {
        it('Makes requests', async () => {
            const items = Array.from({ length: 100 }, (_, i) => i + 1).map((i) => ({ id: i }));
            const client = bcClientStream(items.map((it) => echo(it)));

            const requests = items.map((it) => ({
                method: 'GET' as const,
                path: `/catalog/products/${it.id}`,
            }));

            const count = vi.fn();

            for await (const { ok, data, err } of client.stream(requests)) {
                count();

                expect(ok).toBe(true);
                expect(err).toBeUndefined();
                expect(data).toBeTypeOf('object');
                expect(data).toHaveProperty('id');
            }

            expect(count).toHaveBeenCalledTimes(100);
        });
    });
});
