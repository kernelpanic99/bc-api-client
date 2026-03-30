import { extractRateLimitHeaders } from 'src/util';
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
