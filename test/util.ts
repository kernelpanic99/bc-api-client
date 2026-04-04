import { BigCommerceClient } from 'src';
import { BASE_KY_CONFIG } from 'src/lib/common';

export const getThrown = (fn: () => void) => {
    try {
        fn();
    } catch (err) {
        return err;
    }

    throw new Error(`${fn} did not throw`);
};

export const VALID_CREDENTIALS = {
    accessToken: 'test',
    storeHash: 'test',
    logger: false as const,
};

export const createClient = (response?: unknown, status?: number): BigCommerceClient => {
    if (response === undefined) {
        return new BigCommerceClient(VALID_CREDENTIALS);
    }

    let body: string;

    if (typeof response === 'string') {
        body = response;
    } else {
        body = JSON.stringify(response);
    }

    return new BigCommerceClient({
        ...VALID_CREDENTIALS,
        retry: {
            ...BASE_KY_CONFIG.retry,
            backoffLimit: 1,
        },
        hooks: {
            beforeRequest: [
                () => {
                    if (response instanceof Response) {
                        return response;
                    }

                    return new Response(body, { status: status ?? 200 });
                },
            ],
        },
    });
};
