import { build } from "esbuild";
import dtsPlugin from "esbuild-plugin-d.ts";

// V2
await build({
    entryPoints: ["src/v2/index.ts", "src/v2/endpoints.ts"],
    outdir: "dist/v2",
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node20",
    sourcemap: true,
    external: ["jose", "ky"],
    plugins: [dtsPlugin()],
});

await build({
    entryPoints: ["src/index.ts"],
    outdir: "dist/",
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node20",
    sourcemap: true,
    external: ["jose", "ky"],
    plugins: [dtsPlugin()],
});
