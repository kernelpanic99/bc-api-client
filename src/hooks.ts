import { type BeforeRequestHook, type BeforeRetryHook, isHTTPError } from 'ky';
import { type Logger, rateLimitJitter } from './common';
import { BCRateLimitDelayTooLongError, BCRateLimitNoHeadersError, BCUrlTooLongError } from './errors';
import { extractRateLimitHeaders } from './util';

const MAX_URL_LENGTH = 2048;

export const validateUrlLength: BeforeRequestHook = (request) => {
    if (request.url.length > MAX_URL_LENGTH) {
        throw new BCUrlTooLongError(request.url, MAX_URL_LENGTH);
    }
};

export const bcRateLimitRetry =
    (logger?: Logger): BeforeRetryHook =>
    async ({ request, options, error, retryCount }) => {
        if (isHTTPError(error) && error.response.status === 429) {
            const retryMeta = extractRateLimitHeaders(error.response.headers);

            if (!retryMeta) {
                throw new BCRateLimitNoHeadersError(retryCount, request);
            }

            if (options.retry.maxRetryAfter && retryMeta.resetIn > options.retry.maxRetryAfter) {
                throw new BCRateLimitDelayTooLongError(
                    options.retry.maxRetryAfter,
                    retryMeta.resetIn,
                    retryCount,
                    request,
                );
            }

            const delay =
                typeof options.retry.jitter === 'function'
                    ? options.retry.jitter(retryMeta.resetIn)
                    : rateLimitJitter(retryMeta.resetIn);

            logger?.warn(
                { attempt: retryCount, url: request.url, method: request.method, retryMeta },
                `Rate limit reached, retrying in ${delay} (with jitter)`,
            );

            await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
            logger?.warn({ url: request.url, method: request.method, attempt: retryCount }, 'Retrying request');
        }
    };
