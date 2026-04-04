import type { HTTPError, KyRequest, TimeoutError as KyTimeoutError } from 'ky';
import type { StandardSchemaV1 } from './standard-schema';

export type ErrorContext = Record<string, unknown>;

/**
 * Abstract base class for all library errors. Carries a typed `context` object with
 * structured diagnostic data and a machine-readable `code` string.
 *
 * Use `instanceof` checks against specific subclasses rather than this base class.
 */
export abstract class BaseError<TContext extends ErrorContext = ErrorContext> extends Error {
    /** Machine-readable error code. Unique per subclass. */
    abstract readonly code: string;

    constructor(
        message: string,
        readonly context: TContext,
        options?: ErrorOptions,
    ) {
        super(message, options);

        this.name = this.constructor.name;
    }

    /** @internal */
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

/** Catch-all for unexpected client-side errors not covered by a more specific subclass. */
export class BCClientError extends BaseError<Record<string, string>> {
    code = 'BC_CLIENT_ERROR';

    constructor(message: string, context?: Record<string, string>, cause?: unknown) {
        super(message, context ?? {}, { cause });
    }
}

/** Thrown by the {@link BigCommerceClient} constructor when credentials or config are invalid. */
export class BCCredentialsError extends BaseError<{
    errors: string[];
}> {
    code = 'BC_CLIENT_CREDENTIALS_ERROR';

    constructor(errors: string[]) {
        super('Failed to initialize BigCommerceClient', { errors });
    }
}

/** Thrown before a request is sent when the constructed URL exceeds 2048 characters. */
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

/**
 * Thrown during retry when a 429 response is received but the expected
 * `X-Rate-Limit-*` headers are absent, making it impossible to determine the backoff delay.
 */
export class BCRateLimitNoHeadersError extends BaseError<{
    url: string;
    method: string;
    attempts: number;
}> {
    code = 'BC_RATE_LIMIT_NO_HEADERS';

    constructor(request: KyRequest, attempts: number) {
        super('Rate limit reached but the X-Rate-Limit-* headers were not returned. Unable to retry', {
            url: request.url,
            method: request.method,
            attempts,
        });
    }
}

/**
 * Thrown during retry when a 429 response specifies a reset window that exceeds
 * `config.retry.maxRetryAfter`, preventing an unbounded wait.
 */
export class BCRateLimitDelayTooLongError extends BaseError<{
    url: string;
    method: string;
    attempts: number;
    maxDelay: number;
    delay: number;
}> {
    code = 'BC_RATE_LIMIT_DELAY_TOO_LONG';

    constructor(request: KyRequest, attempts: number, maxDelay: number, delay: number) {
        super('Rate limit reached, and the rate limit reset window is too high.', {
            url: request.url,
            method: request.method,
            attempts,
            maxDelay,
            delay,
        });
    }
}

/**
 * Abstract base for all StandardSchema validation errors. Carries the raw `data` that failed
 * validation and the schema `error` result. Use specific subclasses for `instanceof` checks.
 */
export abstract class BCSchemaValidationError extends BaseError<{
    method: string;
    path: string;
    data: unknown;
    error: StandardSchemaV1.FailureResult;
}> {
    constructor(message: string, method: string, path: string, data: unknown, error: StandardSchemaV1.FailureResult) {
        super(message, { method, path, data, error });
    }
}

/** Thrown when `options.querySchema` validation fails before a request is sent. */
export class BCQueryValidationError extends BCSchemaValidationError {
    code = 'BC_QUERY_VALIDATION_FAILED';
}

/** Thrown when `options.bodySchema` validation fails before a request is sent. */
export class BCRequestBodyValidationError extends BCSchemaValidationError {
    code = 'BC_REQUEST_BODY_VALIDATION_FAILED';
}

/** Thrown when `options.responseSchema` validation fails after a response is received. */
export class BCResponseValidationError extends BCSchemaValidationError {
    code = 'BC_RESPONSE_VALIDATION_FAILED';
}

/** Thrown or yielded when `options.itemSchema` validation fails for an item in a page response. */
export class BCPaginatedItemValidationError extends BCSchemaValidationError {
    code = 'BC_PAGINATED_ITEM_VALIDATION_FAILED';
}

/**
 * Thrown when the BigCommerce API returns a non-2xx HTTP response.
 * `context.status` and `context.responseBody` are the most useful fields for debugging.
 */
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

/** Thrown when a request exceeds the configured timeout (default 120 s). */
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

/**
 * Thrown when the response body cannot be read or parsed as JSON.
 * `context.rawBody` contains the raw text that failed to parse (empty string if the body was empty).
 */
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

/**
 * Thrown when a pagination option (`limit`, `page`, or `count`) is not a positive number.
 * `context.option` names the offending field; `context.value` is the value that was passed.
 */
export class BCPaginatedOptionError extends BaseError<{ path: string; option: string; value: unknown }> {
    code = 'BC_PAGINATED_OPTION_ERROR';

    constructor(path: string, value: unknown, option: string) {
        super('The pagination option must be a positive number', { path, option, value });
    }
}

/**
 * Thrown or yielded when a paginated response is missing required v3 envelope fields
 * (`data`, `meta.pagination`, etc.). Usually means the path is not a v3 collection endpoint.
 */
export class BCPaginatedResponseError extends BaseError<{ path: string; data: unknown; reason: string }> {
    code = 'BC_PAGINATED_RESPONSE_ERROR';

    constructor(path: string, data: unknown, reason: string) {
        super('Paginated response structure is invalid', { path, data, reason });
    }
}

/** Thrown by {@link BigCommerceAuth} constructor when `config.redirectUri` is not a valid URL. */
export class BCAuthInvalidRedirectUriError extends BaseError<{ redirectUri: string }> {
    code = 'BC_AUTH_INVALID_REDIRECT_URI';

    constructor(redirectUri: string, cause: unknown) {
        super('Invalid redirect URI', { redirectUri }, { cause });
    }
}

/** Thrown by {@link BigCommerceAuth.requestToken} when a required OAuth callback param is absent. */
export class BCAuthMissingParamError extends BaseError<{ param: string }> {
    code = 'BC_AUTH_MISSING_PARAM';

    constructor(param: string) {
        super(`Missing required auth callback parameter: ${param}`, { param });
    }
}

/**
 * Thrown by {@link BigCommerceAuth.requestToken} when the scopes granted by BigCommerce
 * do not include all scopes listed in `config.scopes`.
 * `context.missing` lists the scopes that were expected but not granted.
 */
export class BCAuthScopeMismatchError extends BaseError<{
    granted: string[];
    expected: string[];
    missing: string[];
}> {
    code = 'BC_AUTH_SCOPE_MISMATCH';

    constructor(granted: string[], expected: string[], missing: string[]) {
        super('Granted scopes do not match expected scopes', { granted, expected, missing });
    }
}

/** Thrown by {@link BigCommerceAuth.verify} when the JWT signature, audience, issuer, or subject is invalid. */
export class BCAuthInvalidJwtError extends BaseError<{ storeHash: string }> {
    code = 'BC_AUTH_INVALID_JWT';

    constructor(storeHash: string, cause: unknown) {
        super('Invalid JWT payload', { storeHash }, { cause });
    }
}
