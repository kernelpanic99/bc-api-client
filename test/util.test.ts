import { chunkStrLength, extractRateLimitHeaders } from 'src/lib/util';
import { describe, expect, it } from 'vitest';

const makeHeaders = (entries: Record<string, string>) => new Headers(entries);

describe('extractRateLimitHeaders', () => {
    it('returns undefined when reset header is missing', () => {
        expect(extractRateLimitHeaders(makeHeaders({}))).toBeUndefined();
    });

    it('returns undefined when reset header is not a valid number', () => {
        expect(extractRateLimitHeaders(makeHeaders({ 'x-rate-limit-time-reset-ms': 'abc' }))).toBeUndefined();
    });

    it('returns resetIn with optional fields undefined when only reset header is present', () => {
        const result = extractRateLimitHeaders(makeHeaders({ 'x-rate-limit-time-reset-ms': '5000' }));

        expect(result).toEqual({ resetIn: 5000, requestsLeft: undefined, quota: undefined, window: undefined });
    });

    it('parses all rate limit headers', () => {
        const result = extractRateLimitHeaders(
            makeHeaders({
                'x-rate-limit-time-reset-ms': '5000',
                'x-rate-limit-requests-left': '42',
                'x-rate-limit-requests-quota': '100',
                'x-rate-limit-time-window-ms': '60000',
            }),
        );

        expect(result).toEqual({ resetIn: 5000, requestsLeft: 42, quota: 100, window: 60000 });
    });

    it('returns undefined for optional fields with invalid values', () => {
        const result = extractRateLimitHeaders(
            makeHeaders({
                'x-rate-limit-time-reset-ms': '5000',
                'x-rate-limit-requests-left': 'bad',
                'x-rate-limit-requests-quota': '',
            }),
        );

        expect(result).toEqual({ resetIn: 5000, requestsLeft: undefined, quota: undefined, window: undefined });
    });

    it('parses resetIn of zero as valid', () => {
        const result = extractRateLimitHeaders(makeHeaders({ 'x-rate-limit-time-reset-ms': '0' }));

        expect(result?.resetIn).toBe(0);
    });
});

describe('chunkStrLength', () => {
    describe('defaults', () => {
        it('returns empty array for empty input', () => {
            expect(chunkStrLength([])).toEqual([]);
        });

        it('returns single chunk when items fit within defaults', () => {
            expect(chunkStrLength(['a', 'b', 'c'])).toEqual([['a', 'b', 'c']]);
        });

        it('splits by default chunkLength of 250', () => {
            const items = Array.from({ length: 300 }, () => 'x');
            const result = chunkStrLength(items);

            expect(result.length).toBe(2);
            expect(result[0].length).toBe(250);
            expect(result[1].length).toBe(50);
        });
    });

    describe('maxLength splitting', () => {
        it('splits when encoded length would exceed maxLength', () => {
            // 'aa'=2, 'bb'=2+sep(1)=3 → cumulative 5 > 4 → each item in its own chunk
            const result = chunkStrLength(['aa', 'bb', 'cc'], { maxLength: 4 });

            expect(result).toEqual([['aa'], ['bb'], ['cc']]);
        });

        it('accounts for separator between items', () => {
            // 'ab' = 2 chars each; first item: 2, second: 2 + sep(1) = 3, total 5 > 4
            const result = chunkStrLength(['ab', 'cd'], { maxLength: 4, separatorSize: 1 });

            expect(result).toEqual([['ab'], ['cd']]);
        });

        it('no separator counted for first item in each chunk', () => {
            // separatorSize=2, maxLength=7
            // 'ab'=2; 'cd'=2+2=4 → total 6 ≤ 7; 'ef'=2+2=4 → total 10 > 7 → new chunk
            // First item of new chunk: 'ef' should cost 2 (no separator), NOT 2+2=4
            // If the bug existed, 'ef' would be strLen=4 and 'gh' (4+4=8>7) would start a third chunk
            // Correct: 'ef' strLen=2, 'gh' 2+2+2=6 ≤ 7 → fits in same chunk
            const result = chunkStrLength(['ab', 'cd', 'ef', 'gh'], { maxLength: 7, separatorSize: 2 });

            expect(result).toEqual([
                ['ab', 'cd'],
                ['ef', 'gh'],
            ]);
        });

        it('packs multiple items when they fit', () => {
            // items 'a'=1; separator=1; maxLength=10
            // chunk 1: a(1), a(1+1), a(1+1), a(1+1), a(1+1) = 1+2+2+2+2=9 ≤ 10; 6th: 9+2=11 > 10
            const items = Array.from({ length: 10 }, () => 'a');
            const result = chunkStrLength(items, { maxLength: 10, separatorSize: 1 });

            expect(result.length).toBe(2);
            expect(result[0].length).toBe(5);
            expect(result[1].length).toBe(5);
        });
    });

    describe('chunkLength splitting', () => {
        it('splits by item count limit', () => {
            const items = Array.from({ length: 20 }, (_, i) => String(i + 1));
            const result = chunkStrLength(items, { chunkLength: 10, maxLength: 10_000 });

            expect(result.length).toBe(2);
            expect(result[0].length).toBe(10);
            expect(result[1].length).toBe(10);
        });

        it('uses whichever limit is hit first (count)', () => {
            // maxLength is huge, chunkLength=2 forces split at 2 items
            const result = chunkStrLength(['a', 'b', 'c', 'd'], { chunkLength: 2, maxLength: 10_000 });

            expect(result).toEqual([
                ['a', 'b'],
                ['c', 'd'],
            ]);
        });
    });

    describe('offset', () => {
        it('reduces available space in every chunk', () => {
            // offset=8, maxLength=10 → 2 chars available per chunk
            // 'a'=1, 'b'=1+sep(1)=2 → total 3 > 2, so each chunk holds 1 item
            const result = chunkStrLength(['a', 'b', 'c'], { maxLength: 10, offset: 8, separatorSize: 1 });

            expect(result).toEqual([['a'], ['b'], ['c']]);
        });

        it('offset=0 same as no offset', () => {
            const a = chunkStrLength(['aa', 'bb'], { maxLength: 10, offset: 0 });
            const b = chunkStrLength(['aa', 'bb'], { maxLength: 10 });

            expect(a).toEqual(b);
        });
    });

    describe('URL encoding', () => {
        it('measures encoded byte length, not raw character count', () => {
            // encodeURIComponent(',') = '%2C' (3 chars), so two commas = 6
            const result = chunkStrLength([',', ',', ','], { maxLength: 6, separatorSize: 0 });

            expect(result).toEqual([[',', ','], [',']]);
        });

        it('handles items with special URL characters correctly', () => {
            // encodeURIComponent(' ') = '%20' (3 chars)
            // maxLength=6, separatorSize=0: first item=3, second=3, third would be 9 > 6
            const result = chunkStrLength([' ', ' ', ' '], { maxLength: 6, separatorSize: 0 });

            expect(result).toEqual([[' ', ' '], [' ']]);
        });

        it('real-world SKU values with no special chars are measured as-is', () => {
            const skus = ['SKU-001', 'SKU-002', 'SKU-003'];
            // 'SKU-001' = 7 chars (no encoding change), sep=1
            // total: 7 + (7+1) + (7+1) = 23; maxLength=20 → split after 2
            const result = chunkStrLength(skus, { maxLength: 15, separatorSize: 1 });

            expect(result).toEqual([['SKU-001', 'SKU-002'], ['SKU-003']]);
        });
    });

    describe('real-world query chunking scenario', () => {
        it('mirrors client.ts usage: chunks values to stay within MAX_URL_LENGTH', () => {
            const baseUrl = 'https://api.bigcommerce.com/stores/abc123/v3/catalog/products';
            const query = 'limit=250&include_fields=id,sku';
            const key = 'sku:in';
            const fullUrl = `${baseUrl}?${query}`;
            const keyOverhead = key.length + 2;
            const offset = fullUrl.length + keyOverhead;

            const skus = Array.from({ length: 300 }, (_, i) => `SKU-${String(i).padStart(5, '0')}`);

            // separatorSize matches client.ts: URLSearchParams encodes ',' as '%2C' (3 chars)
            const chunks = chunkStrLength(skus.map(String), {
                chunkLength: 250,
                maxLength: 2048,
                offset,
                separatorSize: encodeURIComponent(',').length,
            });

            // Every chunk must produce a URL within MAX_URL_LENGTH.
            // URLSearchParams encodes commas as %2C (3 chars), so measure encoded length.
            for (const chunk of chunks) {
                const encodedParam = chunk.map(encodeURIComponent).join('%2C');
                const totalLength = offset + encodedParam.length;

                expect(totalLength).toBeLessThanOrEqual(2048);
            }

            // All items must be present across all chunks
            expect(chunks.flat()).toEqual(skus);
        });
    });

    describe('error handling', () => {
        it('throws when a single item exceeds maxLength accounting for offset', () => {
            // item 'abcde'=5 chars, offset=6, maxLength=10 → 5+6=11 > 10
            expect(() => chunkStrLength(['abcde'], { maxLength: 10, offset: 6 })).toThrow('Item too large');
        });

        it('throw message includes item length and maxLength', () => {
            expect(() => chunkStrLength(['abc'], { maxLength: 2 })).toThrow(/exceeds maxLength 2/);
        });

        it('does not throw when item fits exactly at boundary', () => {
            // 'abc'=3, offset=0, maxLength=3 → 3+0=3 ≤ 3, no throw
            expect(() => chunkStrLength(['abc'], { maxLength: 3 })).not.toThrow();
        });
    });
});
