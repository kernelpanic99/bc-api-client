import { HEADERS, type RateLimitMeta } from './common';

const parseIntHeader = (headers: Headers, key: string): number | undefined => {
    const value = Number.parseInt(headers.get(key) ?? '', 10);

    return Number.isNaN(value) ? undefined : value;
};

export const extractRateLimitHeaders = (headers: Headers): RateLimitMeta | undefined => {
    const resetIn = parseIntHeader(headers, HEADERS.RATE_LIMIT_RESET);

    // Can't retry without this header - treat as unrecoverable
    if (resetIn === undefined) {
        return undefined;
    }

    return {
        resetIn,
        requestsLeft: parseIntHeader(headers, HEADERS.RATE_LIMIT_LEFT),
        quota: parseIntHeader(headers, HEADERS.RATE_LIMIT_QUOTA),
        window: parseIntHeader(headers, HEADERS.RATE_LIMIT_WINDOW),
    };
};
