import { Logger as AWSLogger } from '@aws-lambda-powertools/logger';
import pino from 'pino';
import type { Logger } from 'src/lib/common';
import { FallbackLogger, fromAwsPowertoolsLogger, initLogger } from 'src/lib/logger';
import { assertType, describe, expect, it, vi } from 'vitest';

describe('Logger interface', () => {
    it('Compatible with Pino', () => {
        const logger = pino({ level: 'debug' });

        assertType<Logger>(logger);
    });

    it('Compatible with @aws-lambda-powertools/logger via adapter', () => {
        const logger = new AWSLogger({ serviceName: 'test' });
        const adapted = fromAwsPowertoolsLogger(logger);

        assertType<Logger>(adapted);
    });
});

describe('Logger init', () => {
    it('Uses provided external logger', () => {
        const logger = new AWSLogger({ serviceName: 'test' });

        const newLogger = initLogger(fromAwsPowertoolsLogger(logger));

        expect(newLogger).toBeTypeOf('object');
        expect(newLogger).not.toBeInstanceOf(FallbackLogger);
    });

    it('Uses fallback logger with given level', () => {
        const logger = initLogger('warn');

        expect(logger).toBeInstanceOf(FallbackLogger);
        expect((logger as FallbackLogger).level).toBe('warn');
    });

    it('Falls back to info level if invalid level is provided', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        // @ts-expect-error Passing invalid level on purpose
        const logger = initLogger('invalid');

        expect(logger).toBeInstanceOf(FallbackLogger);
        expect((logger as FallbackLogger).level).toBe('info');
        expect(warnSpy).toHaveBeenCalled();

        warnSpy.mockRestore();
    });

    it('Uses fallback logger with info level if nothing provided', () => {
        const logger = initLogger(undefined);

        expect(logger).toBeInstanceOf(FallbackLogger);
        expect((logger as FallbackLogger).level).toBe('info');
    });

    it('Uses fallback logger with info level if true provided', () => {
        const logger = initLogger(true);

        expect(logger).toBeInstanceOf(FallbackLogger);
        expect((logger as FallbackLogger).level).toBe('info');
    });

    it('Does not initialize logger if false provided', () => {
        const logger = initLogger(false);

        expect(logger).toBeUndefined();
    });
});

describe('FallbackLogger', () => {
    it('Logs at the configured level and above', () => {
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const logger = new FallbackLogger('warn');

        logger.debug({ a: 1 });
        logger.info({ a: 1 });
        logger.warn({ a: 1 });
        logger.error({ a: 1 });

        expect(logSpy).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledTimes(1);

        logSpy.mockRestore();
        warnSpy.mockRestore();
        errorSpy.mockRestore();
    });

    it('Logs message and data when message is provided', () => {
        const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
        const logger = new FallbackLogger('info');

        logger.info({ key: 'value' }, 'hello');

        expect(spy).toHaveBeenCalledWith('hello', { key: 'value' });
        spy.mockRestore();
    });

    it('Logs only data when message is omitted', () => {
        const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
        const logger = new FallbackLogger('info');

        logger.info({ key: 'value' });

        expect(spy).toHaveBeenCalledWith({ key: 'value' });
        spy.mockRestore();
    });

    it('Routes warn to console.warn and error to console.error', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const logger = new FallbackLogger('debug');

        logger.warn({ a: 1 }, 'warning');
        logger.error({ a: 1 }, 'failure');

        expect(warnSpy).toHaveBeenCalledWith('warning', { a: 1 });
        expect(errorSpy).toHaveBeenCalledWith('failure', { a: 1 });

        warnSpy.mockRestore();
        errorSpy.mockRestore();
    });
});

describe('fromAwsPowertoolsLogger', () => {
    it('Swaps arguments from (data, message) to (message, data)', () => {
        const mock = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
        const adapted = fromAwsPowertoolsLogger(mock);

        adapted.info({ foo: 'bar' }, 'my message');

        expect(mock.info).toHaveBeenCalledWith('my message', { foo: 'bar' });
    });

    it('Falls back to empty string when message is undefined', () => {
        const mock = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
        const adapted = fromAwsPowertoolsLogger(mock);

        adapted.info({ foo: 'bar' });

        expect(mock.info).toHaveBeenCalledWith('', { foo: 'bar' });
    });

    it('Adapts all log levels', () => {
        const mock = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
        const adapted = fromAwsPowertoolsLogger(mock);

        adapted.debug({ a: 1 }, 'debug');
        adapted.info({ a: 1 }, 'info');
        adapted.warn({ a: 1 }, 'warn');
        adapted.error({ a: 1 }, 'error');

        expect(mock.debug).toHaveBeenCalledWith('debug', { a: 1 });
        expect(mock.info).toHaveBeenCalledWith('info', { a: 1 });
        expect(mock.warn).toHaveBeenCalledWith('warn', { a: 1 });
        expect(mock.error).toHaveBeenCalledWith('error', { a: 1 });
    });
});
