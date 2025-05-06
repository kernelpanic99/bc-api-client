import { chunkStrLength } from '../src/util';
import { expect, describe, it } from 'vitest';

describe('chunkStrLength', () => {
    it('should return an array of strings', () => {
        const result = chunkStrLength(['a', 'b', 'c']);

        expect(result).toEqual([['a', 'b', 'c']]);
    });

    it('should chunk normally', () => {
        const items = Array.from({ length: 20 }, (_, i) => (i + 1).toString());

        const result = chunkStrLength(items, { chunkLength: 10, maxLength: 100 });

        expect(result.length).toBe(2);
        expect(result[0].length).toBe(10);
        expect(result[1].length).toBe(10);
    });

    it('should chunk long strings', () => {
        const items = Array.from({ length: 20 }, (_, i) => (i + 1).toString().padStart(4, '0'));
        const result = chunkStrLength(items, { chunkLength: 10, maxLength: 10 });

        expect(result.length).toBe(10);

        for (const chunk of result) {
            expect(chunk.length).toBe(2);
        }
    });
});
