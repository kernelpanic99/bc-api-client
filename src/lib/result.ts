export type Ok<T> = {
    ok: true;
    data: T;
    err: undefined;
};

export type Err<E> = {
    ok: false;
    data: undefined;
    err: E;
};

export type Result<T, E> = Ok<T> | Err<E>;

/**
 * A {@link Result} extended with the zero-based index of the originating request in the input
 * array passed to {@link BigCommerceClient.batchStream} or {@link BigCommerceClient.batchSafe}.
 *
 * Because concurrent requests complete out of insertion order, `index` is the only reliable way
 * to correlate a result back to its input.
 *
 * @example
 * ```ts
 * const requests = ids.map(id => req.get(`catalog/products/${id}`));
 * for await (const { index, err, data } of client.batchStream(requests)) {
 *   const originalId = ids[index];
 *   if (err) { console.error(originalId, err); continue; }
 *   console.log(originalId, data);
 * }
 * ```
 */
export type BatchResult<T, E> = Result<T, E> & { index: number };

/**
 * A {@link Result} extended with the one-based page number from which the item was fetched.
 *
 * Because concurrent requests complete out of page order, `page` is the only reliable way
 * to correlate a result back to its source page when using {@link BigCommerceClient.stream}
 * or {@link BigCommerceClient.streamBlind}.
 *
 * @example
 * ```ts
 * for await (const { page, err, data } of client.stream('catalog/products')) {
 *   if (err) { console.error(`page ${page}:`, err); continue; }
 *   console.log(`page ${page}:`, data);
 * }
 * ```
 */
export type PageResult<T, E> = Result<T, E> & { page: number };

/**
 * Creates a successful {@link Result}. Check `result.ok` or `result.err` before accessing `data`.
 * @param data - The success value.
 */
export const Ok = <T, E>(data: T): Result<T, E> => ({ ok: true, data, err: undefined });

/**
 * Creates a failed {@link Result}. Check `result.ok` or `result.err` before accessing `err`.
 * @param err - The error value.
 */
export const Err = <T, E>(err: E): Result<T, E> => ({ ok: false, data: undefined, err });
