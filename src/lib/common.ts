import type { Options as KyOptions } from 'ky';
import type { Logger, LogLevel } from './logger';

export type { Logger, LogLevel };

export type ConcurrencyOptions = {
    concurrency?: number | false;
    backoff?: ((concurrency: number, status: number) => number) | number;
    rateLimitBackoff?: number;
    backoffRecover?: ((concurrency: number) => number) | number;
};

export const MAX_CONCURRENCY = 1000;
export const DEFAULT_CONCURRENCY = 10;
export const DEFAULT_RATE_LIMIT_BACKOFF = 1;
export const DEFAULT_BACKOFF_RATE = 2;
export const DEFAULT_BACKOFF_RECOVER = 1;
export const DEFAULT_LIMIT = 250;
export const MAX_URL_LENGTH = 2048;
export const DEFAULT_BLIND_COUNT = 2000;

export interface ClientConfig extends KyOptions, ConcurrencyOptions {
    storeHash: string;
    accessToken: string;
    logger?: Logger | LogLevel | boolean;
}

/**
 * Random positive jitter within 0-500 ms in increments of 100
 * @param {number} delay
 */
export const rateLimitJitter = (delay: number) => delay + Math.floor(Math.random() * 6) * 100;

export const HEADERS = {
    AUTH_TOKEN: 'X-Auth-Token',
    ACCEPT: 'Accept',
    CONTENT_TYPE: 'Content-Type',
    RATE_LIMIT_LEFT: 'x-rate-limit-requests-left',
    RATE_LIMIT_RESET: 'x-rate-limit-time-reset-ms',
    RATE_LIMIT_QUOTA: 'x-rate-limit-requests-quota',
    RATE_LIMIT_WINDOW: 'x-rate-limit-time-window-ms',
} as const;

export type RateLimitMeta = {
    resetIn: number;
    requestsLeft?: number;
    quota?: number;
    window?: number;
};

export const BASE_KY_CONFIG = {
    prefixUrl: 'https://api.bigcommerce.com',
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

export type ResolvedConcurrencyOptions = Required<ConcurrencyOptions>;
