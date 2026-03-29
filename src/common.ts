import type { Options as KyOptions } from 'ky';

export interface Logger {
    debug(data: Record<string, unknown>, message?: string): void;
    info(data: Record<string, unknown>, message?: string): void;
    warn(data: Record<string, unknown>, message?: string): void;
    error(data: Record<string, unknown>, message?: string): void;
}

export type PowertoolsLikeLogger = {
    debug(message: string, ...data: Record<string, unknown>[]): void;
    info(message: string, ...data: Record<string, unknown>[]): void;
    warn(message: string, ...data: Record<string, unknown>[]): void;
    error(message: string, ...data: Record<string, unknown>[]): void;
};

export const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

export interface ClientConfig extends KyOptions {
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

export const BASE_KY_CONFIG: KyOptions = {
    prefixUrl: 'https://api.bigcommerce.com',
    // Some BC endpoints may take a while.
    // For example /catalog/product/options* endpoints may fully
    // recreate all variants in some cases
    timeout: 120e3,

    retry: {
        limit: 3,
        // BC uses PUT for many upsert operations, It's not gurantteed to be indempotent
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

export type ApiVersion = 'v3' | 'v2';
