import { defaultJitter } from 'src/common';
import { describe, expect, it } from 'vitest';

describe('Default jitter', () => {
    it('Returns a random integer value within [0 - 500] in increments of 100', { repeats: 100 }, () => {
        expect(defaultJitter(1000)).toBeLessThanOrEqual(1500);
        expect(defaultJitter(1000)).toBeGreaterThanOrEqual(1000);
        expect(defaultJitter(1000) % 100).toBe(0);
    });
});
