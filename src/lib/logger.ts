import type { ClientConfig } from './common';

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

/** @internal */
export const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

/**
 * Adapts an AWS Lambda Powertools logger to the {@link Logger} interface expected by
 * {@link BigCommerceClient} and {@link BigCommerceAuth}.
 *
 * Powertools loggers use `(message, ...data)` argument order whereas this library uses
 * `(data, message)`. This adapter swaps the arguments.
 *
 * @param logger - An AWS Lambda Powertools (or any {@link PowertoolsLikeLogger}-compatible) logger.
 * @returns A {@link Logger} wrapper suitable for `config.logger`.
 */
export const fromAwsPowertoolsLogger = (logger: PowertoolsLikeLogger): Logger => ({
    debug: (data, message) => logger.debug(message ?? '', data),
    info: (data, message) => logger.info(message ?? '', data),
    warn: (data, message) => logger.warn(message ?? '', data),
    error: (data, message) => logger.error(message ?? '', data),
});

/**
 * Console-based {@link Logger} that filters messages below a minimum level.
 *
 * Used automatically when `config.logger` is `true`, `undefined`, or a {@link LogLevel} string.
 * Can also be instantiated directly for custom log level control.
 *
 * @example
 * ```ts
 * new BigCommerceClient({ ..., logger: new FallbackLogger('debug') });
 * ```
 */
export class FallbackLogger implements Logger {
    /**
     * @param level - Minimum level to output. Messages below this level are silently dropped.
     */
    constructor(public readonly level: LogLevel) {}

    debug(data: Record<string, unknown>, message?: string): void {
        this.log('debug', data, message);
    }

    info(data: Record<string, unknown>, message?: string): void {
        this.log('info', data, message);
    }

    warn(data: Record<string, unknown>, message?: string): void {
        this.log('warn', data, message);
    }

    error(data: Record<string, unknown>, message?: string): void {
        this.log('error', data, message);
    }

    private log(level: LogLevel, data: Record<string, unknown>, message?: string) {
        if (LOG_LEVELS.indexOf(level) < LOG_LEVELS.indexOf(this.level)) {
            return;
        }

        const fn = console[level];

        message !== undefined ? fn(message, data) : fn(data);
    }
}

/**
 * @internal
 */
export const initLogger = (logger: ClientConfig['logger']): Logger | undefined => {
    if (logger === false) {
        return;
    }

    if (logger === undefined || logger === true) {
        return new FallbackLogger('info');
    }

    if (typeof logger === 'string') {
        if (LOG_LEVELS.includes(logger)) {
            return new FallbackLogger(logger);
        } else {
            const logger = new FallbackLogger('info');

            logger.warn({ level: logger }, 'Unknown log level passed, using info');

            return logger;
        }
    }

    return logger;
};
