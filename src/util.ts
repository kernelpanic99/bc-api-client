import { HEADERS, type RateLimitMeta } from './common';

export function stripKeys<T extends object, K extends PropertyKey>(
    obj: T | undefined,
    keys: K[],
): Omit<T, K> | undefined {
    if (!obj) {
        return obj;
    }

    const result = { ...obj } as Record<PropertyKey, unknown>;

    for (const key of keys) {
        delete result[key];
    }

    return result as Omit<T, K>;
}

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
