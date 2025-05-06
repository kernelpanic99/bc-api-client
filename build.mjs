import { build } from 'esbuild';
import dtsPlugin from 'esbuild-plugin-d.ts';

await build({
    entryPoints: ['src/index.ts'],
    outdir: 'dist',
    bundle: true,
    sourcemap: true,
    plugins: [dtsPlugin()],
});