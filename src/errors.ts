import type { HTTPError, KyRequest, TimeoutError as KyTimeoutError } from 'ky';
import type { StandardSchemaV1 } from './standard-schema';

export type ErrorContext = Record<string, unknown>;

export abstract class BaseError<TContext extends ErrorContext = ErrorContext> extends Error {
    abstract readonly code: string;

    constructor(
        message: string,
        readonly context: TContext,
        options?: ErrorOptions,
    ) {
        super(message, options);

        this.name = this.constructor.name;
    }

    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            context: this.context,
            cause: this.cause,
        };
    }
}

export class BCClientError extends BaseError<Record<string, string>> {
    code = 'BC_GENERIC_ERROR';

    constructor(message: string, context?: Record<string, string>, cause?: unknown) {
        super(message, context ?? {}, { cause });
    }
}

export class BCCredentialsError extends BaseError<{
    errors: string[];
}> {
    code = 'BC_CLIENT_CREDENTIALS_ERROR';

    constructor(errors: string[]) {
        super('Failed to initialize BigCommerceClient', { errors });
    }
}

export class BCUrlTooLongError extends BaseError<{
    url: string;
    max: number;
    len: number;
}> {
    code = 'BC_URL_TOO_LONG';

    constructor(url: string, max: number) {
        super(`Url length (${url.length}) exceeds max allowed length of ${max}`, { url, max, len: url.length });
    }
}

export class BCRateLimitNoHeadersError extends BaseError<{
    url: string;
    method: string;
    attempts: number;
}> {
    code = 'BC_RATE_LIMIT_NO_HEADERS';

    constructor(attempts: number, request: KyRequest) {
        super('Rate limit reached but the X-Rate-Limit-* headers were not returned. Unable to retry', {
            url: request.url,
            method: request.method,
            attempts,
        });
    }
}

export class BCRateLimitDelayTooLongError extends BaseError<{
    url: string;
    method: string;
    attempts: number;
    maxDelay: number;
    delay: number;
}> {
    code = 'BC_RATE_LIMIT_DELAY_TOO_LONG';

    constructor(maxDelay: number, delay: number, attempts: number, request: KyRequest) {
        super('Rate limit reached, and the rate limit reset window is too high.', {
            url: request.url,
            method: request.method,
            attempts,
            maxDelay,
            delay,
        });
    }
}

export class BCSchemaValidationError extends BaseError<{
    method: string;
    path: string;
    data: unknown;
    error: StandardSchemaV1.FailureResult;
}> {
    code = 'BC_SCHEMA_VALIDATION_FAILED';

    constructor(message: string, method: string, path: string, data: unknown, error: StandardSchemaV1.FailureResult) {
        super(message, { method, path, data, error });
    }
}

export class BCApiError extends BaseError<{
    method: string;
    url: string;
    status: number;
    statusMessage: string;
    headers: Record<string, string>;
    requestBody: string;
    responseBody: string;
}> {
    code = 'BC_API_ERROR';

    constructor(err: HTTPError, requestBody: string, responseBody: string) {
        const { request, response } = err;

        super('BigCommerce API request failed', {
            method: request.method,
            url: request.url,
            status: response.status,
            statusMessage: response.statusText,
            headers: Object.fromEntries(response.headers as unknown as Iterable<[string, string]>),
            requestBody,
            responseBody,
        });
    }
}

export class BCTimeoutError extends BaseError<{
    method: string;
    url: string;
}> {
    code = 'BC_TIMEOUT_ERROR';

    constructor(err: KyTimeoutError) {
        super('BigCommerce API request timed out', {
            method: err.request.method,
            url: err.request.url,
        });
    }
}

export class BCResponseParseError extends BaseError<{ method: string; path: string; rawBody?: string }> {
    code = 'BC_RESPONSE_PARSE_ERROR';

    constructor(method: string, path: string, cause: unknown, rawBody?: string) {
        super(
            'Failed to parse BigCommerce API response',
            {
                method,
                path,
                rawBody,
            },
            { cause },
        );
    }
}
