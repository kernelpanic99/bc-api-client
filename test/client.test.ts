import { BigCommerceClient } from '../src/client';
import { describe, it, expect } from 'vitest';
import { config } from 'dotenv';

config();

// Provide test credentials in .env file
const loadEnv = () => {
    if (!process.env.TEST_HASH || !process.env.TEST_TOKEN) {
        throw new Error('TEST_HASH and TEST_TOKEN must be set');
    }
    
    return {
        storeHash: process.env.TEST_HASH,
        accessToken: process.env.TEST_TOKEN,
    };
};

describe('BigCommerceClient', () => {
    const env = loadEnv();

    type MyProduct = {
        id: number;
        name: string;
        sku: string;
        inventory_level: number;
    };

    const FIELDS = 'id,name,sku,inventory_level';

    it.skip('should be able to collect data', async () => {
        const client = new BigCommerceClient({
            storeHash: env.storeHash,
            accessToken: env.accessToken,
        });

        const products = await client.collect<MyProduct>({
            endpoint: '/catalog/products',
            query: {
                include_fields: FIELDS,
            },
        });

        console.log(products);

        expect(products).toBeDefined();
        expect(products.length).toBeGreaterThan(0);

        const product = products[0];

        expect(product.id).toBeDefined();
        expect(product.name).toBeDefined();
        expect(product.sku).toBeDefined();
    });

    it.skip('should be able to collect v2 data', async () => {
        const client = new BigCommerceClient({
            storeHash: env.storeHash,
            accessToken: env.accessToken,
        });

        type MyOrder = {
            id: number,
            status: string;
        }
        
        const orders = await client.collectV2<MyOrder>({
            endpoint: '/orders',
            query: {
                limit: '5',
            },
        });

        console.log(orders.length);

        expect(orders).toBeDefined();
        expect(orders.length).toBeGreaterThan(0);
    });
});
