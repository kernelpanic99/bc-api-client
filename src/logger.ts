import { type ClientConfig, LOG_LEVELS, type Logger, type LogLevel, type PowertoolsLikeLogger } from './common';

export const fromAwsPowertoolsLogger = (logger: PowertoolsLikeLogger): Logger => ({
    debug: (data, message) => logger.debug(message ?? '', data),
    info: (data, message) => logger.info(message ?? '', data),
    warn: (data, message) => logger.warn(message ?? '', data),
    error: (data, message) => logger.error(message ?? '', data),
});

export class FallbackLogger implements Logger {
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
            throw new Error(
                `Invalid log level value provided for logger option: ${logger}. Allowed levels: ${LOG_LEVELS.join()}`,
            );
        }
    }

    return logger;
};
