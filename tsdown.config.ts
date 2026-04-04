import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ['./src/index.ts'],
    attw: {
        enabled: true,
        ignoreRules: ['cjs-resolves-to-esm'],
    },
    format: ['esm'],
});
