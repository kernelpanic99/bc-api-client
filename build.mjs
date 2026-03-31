import { build } from "esbuild";
import dtsPlugin from "esbuild-plugin-d.ts";

await build({
    entryPoints: ["src/index.ts"],
    outdir: "dist/",
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node22",
    sourcemap: true,
    external: ["jose", "ky", "p-limit"],
    plugins: [dtsPlugin()],
});
