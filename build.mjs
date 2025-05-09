import { build } from 'esbuild';
import dtsPlugin from 'esbuild-plugin-d.ts';

await build({
    entryPoints: ['src/index.ts', 'src/endpoints.ts'],
    outdir: 'dist',
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node20',
    sourcemap: true,
    external: ['jose', 'ky', 'remeda'],
    plugins: [dtsPlugin()],
});