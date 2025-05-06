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
    }
}


export type V3Resource<T> = {
    data: T;
    meta: {
        pagination: Pagination;
    }
}

