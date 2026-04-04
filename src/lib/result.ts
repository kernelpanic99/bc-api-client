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
 * Creates a successful {@link Result}. Check `result.ok` or `result.err` before accessing `data`.
 * @param data - The success value.
 */
export const Ok = <T, E>(data: T): Result<T, E> => ({ ok: true, data, err: undefined });

/**
 * Creates a failed {@link Result}. Check `result.ok` or `result.err` before accessing `err`.
 * @param err - The error value.
 */
export const Err = <T, E>(err: E): Result<T, E> => ({ ok: false, data: undefined, err });
