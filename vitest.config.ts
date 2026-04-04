import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['./test/**.test.ts'],
    },
    resolve: {
        alias: {
            src: resolve(__dirname, 'src'),
        },
    },
});
