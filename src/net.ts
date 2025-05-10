/**
 * Network utilities for interacting with the BigCommerce API.
 * Provides rate-limited request handling, error management, and type-safe API calls.
 */

import ky, { KyResponse, HTTPError } from 'ky';
import { Logger } from './core';

/** HTTP methods supported by the API */
export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

export const Methods: Record<string, Method> = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
} as const;

export const BASE_URL = 'https://api.bigcommerce.com/stores/';

/** Configuration for the BigCommerce API client */
const CONFIG = {
    /** Base URL for BigCommerce API */
    BASE_URL,
    /** Default API version to use */
    DEFAULT_VERSION: 'v3',
    /** Maximum delay in milliseconds for rate limit retries */
    DEFAULT_MAX_DELAY: 60e3,
    /** Maximum allowed URL length */
    MAX_URL_LENGTH: 2048,
    /** Default maximum number of retries for rate-limited requests */
    DEFAULT_MAX_RETRIES: 5,
    /** Rate limit header names */
    HEADERS: {
        /** Time window for rate limiting in milliseconds */
        WINDOW: 'x-rate-limit-time-window-ms',
        /** Time to wait before retrying after rate limit in milliseconds */
        RETRY_AFTER: 'x-rate-limit-time-reset-ms',
        /** Total request quota for the time window */
        REQUEST_QUOTA: 'x-rate-limit-requests-quota',
        /** Number of requests remaining in the current window */
        REQUESTS_LEFT: 'x-rate-limit-requests-left',
    }
} as const;

/** Supported BigCommerce API versions */
export type ApiVersion = 'v3' | 'v2';

/**
 * Options for making API requests
 * @template T - Type of the request body
 */
export type RequestOptions<T> = {
    /** API endpoint to call */
    endpoint: string;
    /** HTTP method to use */
    method?: Method;
    /** Request body data */
    body?: T;
    /** API version to use */
    version?: ApiVersion;
    /** Query parameters to append to the URL */
    query?: Record<string, string>;
};

export type StoreOptions = {
    /** BigCommerce store hash */
    storeHash: string;
    /** API access token */
    accessToken: string;
}

/**
 * Options for rate limit handling
 */
export type RateLimitOptions = {
    /** Maximum delay in milliseconds before giving up on rate-limited requests */
    maxDelay?: number;
    /** Maximum number of retries for rate-limited requests */
    maxRetries?: number;
};

/**
 * Custom error class for API request failures
 * @template T - Type of the error data
 */
export class RequestError<T> extends Error {
    constructor(
        public status: number,
        public message: string,
        public data: T | string,
        public cause?: unknown,
    ) {
        super(message, { cause });
    }
}

/**
 * Makes an API request with rate limit handling
 * @template T - Type of the request body and response
 * @param options - Request options including rate limit settings
 * @returns Promise resolving to the API response
 * @throws {RequestError} If the request fails or rate limit is exceeded
 */
export const request = async <T, R>(options: RequestOptions<T> & RateLimitOptions & StoreOptions & {
    logger?: Logger;
}): Promise<R> => {
    const { maxDelay = CONFIG.DEFAULT_MAX_DELAY, maxRetries = CONFIG.DEFAULT_MAX_RETRIES, logger } = options;

    let retries = 0;
    let lastError: RequestError<T> | null = null;

    while (retries < maxRetries) {
        try {
            return await safeRequest<T, R>(options);
        } catch (error) {
            const err = error as RequestError<T>;
            lastError = err;

            if (err.status === 429 && typeof err.data === 'object' && err.data !== null && 'headers' in err.data) {
                const headers = err.data.headers as Record<string, string>;
                const retryAfter = Number.parseInt(headers[CONFIG.HEADERS.RETRY_AFTER]);

                logger?.debug({
                    retryAfter,
                    retries,
                    remaining: headers[CONFIG.HEADERS.REQUESTS_LEFT]
                }, 'Rate limit hit, retrying');

                if (Number.isNaN(retryAfter)) {
                    throw new RequestError(
                        err.status,
                        `Failed to parse retry after: ${headers[CONFIG.HEADERS.RETRY_AFTER]}, ${err.message}`,
                        err.data,
                        err.cause,
                    );
                }

                if (retryAfter > maxDelay) {
                    logger?.warn({
                        retryAfter,
                        maxDelay
                    }, 'Rate limit delay exceeds maximum allowed delay');
                    throw new RequestError(
                        err.status,
                        `Rate limit exceeded: ${retryAfter}ms, ${err.message}`,
                        err.data,
                        err.cause,
                    );
                }

                await new Promise((resolve) => setTimeout(resolve, retryAfter));
                retries++;
                continue;
            }

            throw err;
        }
    }

    logger?.error({
        retries,
        error: lastError
    }, 'Request failed after maximum retries');

    throw lastError ?? new RequestError(500, 'Failed to make request', 'Too many retries after rate limit');
};

/**
 * Makes a single API request with error handling
 * @template T - Type of the request body and response
 * @param options - Request options
 * @returns Promise resolving to the API response
 * @throws {RequestError} If the request fails
 */ 
const safeRequest = async <T, R>(options: RequestOptions<T> & StoreOptions & {
    logger?: Logger;
}): Promise<R> => {
    const { logger } = options;
    let res: KyResponse<T>;

    try {
        res = await call<T, R>(options);
    } catch (error) {
        if(error instanceof RequestError) {
            throw error;
        }

        if(!(error instanceof HTTPError)) {
            logger?.error({
                error: error instanceof Error ? {
                    name: error.name,
                    message: error.message
                } : error
            }, 'Unexpected error during request');
            throw error;
        }

        let data: unknown;
        let errorMessage = error.message;

        try {
            data = await error.response.text();
            try {
                data = JSON.parse(data as string);

                if (typeof data === 'object' && data !== null && 'message' in data) {
                    errorMessage = data.message as string;
                }
            } catch {
                // If JSON parsing fails, keep the text response
            }
        } catch {
            data = 'Failed to read error response';
        }

        logger?.error({
            status: error?.response?.status,
            errorMessage
        }, 'HTTP error during request');

        throw new RequestError(
            error?.response?.status ?? 500,
            errorMessage,
            {
                data,
                headers: Object.fromEntries(error?.response?.headers?.entries() ?? []),
            },
            error,
        );
    }

    const text = await res.text();

    if(res.status === 204) {
        return undefined as unknown as R;
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        logger?.error({
            status: res.status,
            error: error instanceof Error ? {
                name: error.name,
                message: error.message
            } : error
        }, 'Failed to parse response');
        throw new RequestError(
            res.status,
            `Failed to parse response: ${text}`,
            text,
            error
        );
    }
};

/**
 * Internal function to make the actual HTTP request
 * @template T - Type of the request body and response
 * @param options - Request options
 * @returns Promise resolving to the raw response
 * @throws {RequestError} If the URL is too long or request fails
 */
const call = async <T, R>(options: RequestOptions<T> & StoreOptions & {
    logger?: Logger;
}): Promise<KyResponse<R>> => {
    const { storeHash, accessToken, endpoint, method = 'GET', body, version = CONFIG.DEFAULT_VERSION, query, logger } = options;

    const url = `${CONFIG.BASE_URL}${storeHash}/${version}/${endpoint.replace(/^\//, '')}`;
    
    // Check URL length including search params
    const searchParams = query ? new URLSearchParams(query).toString() : '';
    const fullUrl = searchParams ? `${url}?${searchParams}` : url;
    
    if (fullUrl.length > CONFIG.MAX_URL_LENGTH) {
        logger?.error({
            urlLength: fullUrl.length,
            maxLength: CONFIG.MAX_URL_LENGTH
        }, 'URL length exceeds maximum allowed length');
        throw new RequestError(
            400,
            'URL too long',
            `URL length ${fullUrl.length} exceeds maximum allowed length of ${CONFIG.MAX_URL_LENGTH}`,
        );
    }

    const request = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Auth-Token': accessToken,
        },
        json: body,
    };

    const response = await ky<R>(fullUrl, request);
    return response;
};
