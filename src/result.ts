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

export const Ok = <T, E>(data: T): Result<T, E> => ({ ok: true, data, err: undefined });
export const Err = <T, E>(err: E): Result<T, E> => ({ ok: false, data: undefined, err });
