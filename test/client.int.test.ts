import { BigCommerceClient } from '../src/client';
import { describe, it, expect } from 'vitest';
import { config } from 'dotenv';
import { bc } from '../src/endpoints';

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

        const products = await client.collect<MyProduct>(bc.products.path, {
            query: {
                include_fields: FIELDS,
            },
        });

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
        
        const orders = await client.collectV2<MyOrder>(bc.orders.v2.path, {
            query: {
                limit: '5',
            },
        });

        expect(orders).toBeDefined();
        expect(orders.length).toBeGreaterThan(0);
    });

    it('should be able to query data with a large number of filter values', async () => {
        const client = new BigCommerceClient({
            storeHash: env.storeHash,
            accessToken: env.accessToken,
            logger: {
                debug: console.log,
                info: console.log,
                warn: console.log,
                error: console.log,
            },
        });

        // Fetch all products first
        const products = await client.collect<{id: number, sku: string}>(bc.products.path, {
            query: {
                include_fields: 'sku',
            },
        });

        const skus = products.map((product) => product.sku);

        const filteredProducts = await client.query<MyProduct>(bc.products.path, {
            key: 'sku:in',
            values: skus,
            query: {
                include_fields: FIELDS,
            },
        });

        console.log(filteredProducts);

        expect(filteredProducts).toBeDefined();
        expect(filteredProducts.length).toBeGreaterThan(0);
        expect(filteredProducts.length).toBe(skus.length);
        
        const product = filteredProducts[0];

        expect(product.id).toBeDefined();
        expect(product.name).toBeDefined();
        expect(product.sku).toBeDefined();
    });
});
