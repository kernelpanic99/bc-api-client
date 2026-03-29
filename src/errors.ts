import type { KyRequest } from 'ky';
import type { StandardSchemaV1 } from './standard-schema';

export type ErrorContext = Record<string, unknown>;

export abstract class BaseError extends Error {
    abstract readonly code: string;

    constructor(
        message: string,
        readonly context: ErrorContext = {},
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

export class BigCommerceCredentialsError extends BaseError {
    code = 'BC_CLIENT_INIT_ERROR';

    constructor(errors: string[]) {
        super('Failed to initialize BigCommerceClient', { errors });
    }
}

export class BigCommerceUrlTooLong extends BaseError {
    code = 'BC_URL_TOO_LONG';

    constructor(url: string, max: number) {
        super(`Url length (${url.length}) exceeds max allowed length of ${max}`, { url, max, len: url.length });
    }
}

export class BigCommerceRateLimitNoHeaders extends BaseError {
    code = 'BC_RATE_LIMIT_NO_HEADERS';

    constructor(attempts: number, request: KyRequest) {
        super('Rate limit reached but the X-Rate-Limit-* headers were not returned. Unable to retry', {
            url: request.url,
            method: request.method,
            attempts,
        });
    }
}

export class BigCommerceRateLimitDelayTooLong extends BaseError {
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

export class BigCommerceSchemaValidationError extends BaseError {
    code = 'BC_SCHEMA_VALIDATION_FAILED';

    constructor(message: string, data: unknown, error: StandardSchemaV1.FailureResult) {
        super(message, {
            data,
            error,
        });
    }
}
