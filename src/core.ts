export type Pagination = {
    total: number;
    count: number;
    per_page: number;
    current_page: number;
    total_pages: number;
    links: {
        previous: string | null;
        current: string;
        next: string | null;
    };
};

export type V3Resource<T> = {
    data: T;
    meta: {
        pagination: Pagination;
    };
};

/**
 * Logger interface for logging messages and data, Pino compatible by default
 */
export interface Logger {
    debug: (data: unknown, message?: string) => void;
    info: (data: unknown, message?: string) => void;
    warn: (data: unknown, message?: string) => void;
    error: (data: unknown, message?: string) => void;
}
