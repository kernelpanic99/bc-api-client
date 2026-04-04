import type { Options as KyOptions } from 'ky';
import type { Logger, LogLevel } from './logger';

export type { Logger, LogLevel };

export type ConcurrencyOptions = {
    /** Max concurrent requests. Must be 1–1000. `false` for sequential. Defaults to 10. */
    concurrency?: number | false;
    /**
     * Divisor (or `(concurrency, status) => number` function) applied to concurrency on
     * non-429 error responses. Defaults to 2.
     */
    backoff?: ((concurrency: number, status: number) => number) | number;
    /** Concurrency cap applied when a 429 response is received. Defaults to 1. */
    rateLimitBackoff?: number;
    /**
     * Amount (or `(concurrency) => number` function) added to concurrency per successful
     * response while below the configured max. Defaults to 1.
     */
    backoffRecover?: ((concurrency: number) => number) | number;
};

/** Maximum allowed concurrency value. */
export const MAX_CONCURRENCY = 1000;
/** Default concurrency for batch/stream operations. */
export const DEFAULT_CONCURRENCY = 10;
/** Default concurrency cap on 429 rate-limit responses. */
export const DEFAULT_RATE_LIMIT_BACKOFF = 1;
/** Default divisor applied to concurrency on non-429 errors. */
export const DEFAULT_BACKOFF_RATE = 2;
/** Default amount added to concurrency per successful response. */
export const DEFAULT_BACKOFF_RECOVER = 1;
/** Default page size for paginated requests. */
export const DEFAULT_LIMIT = 250;
/** Maximum allowed URL length before chunking is required. */
export const MAX_URL_LENGTH = 2048;
/** Default item count for v2 endpoints without pagination metadata. */
export const DEFAULT_BLIND_COUNT = 2000;
/** Regex to strip leading slashes from API paths. */
export const LEADING_SLASHES = /^\/+/;

/**
 * Configuration options for the BigCommerce client.
 */
export interface ClientConfig
    extends Omit<KyOptions, 'throwHttpErrors' | 'parseJson' | 'method' | 'body' | 'json' | 'searchParams'>,
        ConcurrencyOptions {
    storeHash: string;
    accessToken: string;
    logger?: Logger | LogLevel | boolean;
}

/**
 * Random positive jitter within 0-500 ms in increments of 100
 * @param {number} delay
 */
export const rateLimitJitter = (delay: number) => delay + Math.floor(Math.random() * 6) * 100;

/**
 * HTTP header names used by the BigCommerce API.
 */
export const HEADERS = {
    AUTH_TOKEN: 'X-Auth-Token',
    ACCEPT: 'Accept',
    CONTENT_TYPE: 'Content-Type',
    RATE_LIMIT_LEFT: 'x-rate-limit-requests-left',
    RATE_LIMIT_RESET: 'x-rate-limit-time-reset-ms',
    RATE_LIMIT_QUOTA: 'x-rate-limit-requests-quota',
    RATE_LIMIT_WINDOW: 'x-rate-limit-time-window-ms',
} as const;

/**
 * Metadata extracted from rate-limit headers in API responses.
 */
export type RateLimitMeta = {
    /** Time in milliseconds until the rate limit resets. */
    resetIn: number;
    /** Number of requests remaining in the current window. */
    requestsLeft?: number;
    /** Total request quota for the current window. */
    quota?: number;
    /** Time window size in milliseconds. */
    window?: number;
};

/**
 * Default configuration for the underlying ky HTTP client.
 */
export const BASE_KY_CONFIG = {
    prefixUrl: 'https://api.bigcommerce.com',
    throwHttpErrors: true,
    // Some BC endpoints may take a while.
    // For example /catalog/product/options* endpoints may fully
    // recreate all variants in some cases
    timeout: 120e3,

    retry: {
        limit: 3,
        // BC uses PUT for many upsert operations, it's not guaranteed to be idempotent
        methods: ['GET', 'DELETE'],
        statusCodes: [429, 500, 502, 503, 504],
        // BC does not send standart Retry-After. We'll use custom beforeRetry hook
        afterStatusCodes: [],
        jitter: true,
        maxRetryAfter: 120e3,
    },

    headers: {
        [HEADERS.ACCEPT]: 'application/json',
        [HEADERS.CONTENT_TYPE]: 'application/json',
    },
};

/**
 * Concurrency options with all values resolved to their defaults.
 */
export type ResolvedConcurrencyOptions = Required<ConcurrencyOptions>;
