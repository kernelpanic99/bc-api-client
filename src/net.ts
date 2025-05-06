/**
 * Network utilities for interacting with the BigCommerce API.
 * Provides rate-limited request handling, error management, and type-safe API calls.
 */

import ky, { ResponsePromise, KyResponse, HTTPError } from 'ky';

/** HTTP methods supported by the API */
export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

/** Configuration for the BigCommerce API client */
const CONFIG = {
    /** Base URL for BigCommerce API */
    BASE_URL: 'https://api.bigcommerce.com/stores/',
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
        WINDOW: 'X-Rate-Limit-Time-Window-Ms',
        /** Time to wait before retrying after rate limit in milliseconds */
        RETRY_AFTER: 'X-Rate-Limit-Time-Reset-Ms',
        /** Total request quota for the time window */
        REQUEST_QUOTA: 'X-Rate-Limit-Requests-Quota',
        /** Number of requests remaining in the current window */
        REQUESTS_LEFT: 'X-Rate-Limit-Requests-Left',
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
    /** BigCommerce store hash */
    storeHash: string;
    /** API access token */
    accessToken: string;
};

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
export const request = async <T>(options: RequestOptions<T> & RateLimitOptions) => {
    const { maxDelay = CONFIG.DEFAULT_MAX_DELAY, maxRetries = CONFIG.DEFAULT_MAX_RETRIES } = options;

    let retries = 0;
    let lastError: RequestError<T> | null = null;

    while (retries < maxRetries) {
        try {
            return await safeRequest(options);
        } catch (error) {
            const err = error as RequestError<T>;
            lastError = err;

            if (err.status === 429 && typeof err.data === 'object' && err.data !== null && 'headers' in err.data) {
                const headers = err.data.headers as Record<string, string>;

                const retryAfter = Number.parseInt(headers[CONFIG.HEADERS.RETRY_AFTER]);

                if (Number.isNaN(retryAfter)) {
                    throw new RequestError(
                        err.status,
                        `Failed to parse retry after: ${headers[CONFIG.HEADERS.RETRY_AFTER]}, ${err.message}`,
                        err.data,
                        err.cause,
                    );
                }

                if (retryAfter > maxDelay) {
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

    throw lastError ?? new RequestError(500, 'Failed to make request', 'Too many retries after rate limit');
};

/**
 * Makes a single API request with error handling
 * @template T - Type of the request body and response
 * @param options - Request options
 * @returns Promise resolving to the API response
 * @throws {RequestError} If the request fails
 */ 
const safeRequest = async <T>(options: RequestOptions<T>): Promise<T> => {
    let res: KyResponse<T>;

    try {
        res = await call<T>(options);
    } catch (_error) {
        if(_error instanceof RequestError) {
            throw _error;
        }

        const error = _error as HTTPError;
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

        throw new RequestError(
            error.response.status,
            errorMessage,
            {
                data,
                headers: Object.fromEntries(error.response.headers.entries()),
            },
            error,
        );
    }

    try {
        return await res.json<T>();
    } catch (error) {
        throw new RequestError(
            res.status,
            `Failed to parse response: ${await res.text()}`,
            await res.text(),
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
const call = <T>(options: RequestOptions<T>): ResponsePromise<T> => {
    const { storeHash, accessToken, endpoint, method = 'GET', body, version = CONFIG.DEFAULT_VERSION, query } = options;

    const url = `${CONFIG.BASE_URL}${storeHash}/${version}/${endpoint.replace(/^\//, '')}`;
    
    // Check URL length including search params
    const searchParams = query ? new URLSearchParams(query).toString() : '';
    const fullUrl = searchParams ? `${url}?${searchParams}` : url;
    
    if (fullUrl.length > CONFIG.MAX_URL_LENGTH) {
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
            'X-Auth-Token': accessToken,
        },
        body: JSON.stringify(body),
    };

    return ky(fullUrl, request);
};
