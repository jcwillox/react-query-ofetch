import { readFile, writeFile } from "node:fs/promises";
import { defineConfig } from "tsup";

const isProduction =
  process.env.NODE_ENV === "production" || process.env.CI === "true";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  treeshake: true,
  clean: true,
  minify: isProduction,
  sourcemap: !isProduction,
  dts: true,
  env: {
    NODE_ENV: isProduction ? "production" : "development",
  },
  onSuccess: async () => {
    for (const ext of ["js", "cjs"]) {
      const content = (await readFile(`dist/index.${ext}`)).toString();
      await writeFile(`dist/index.${ext}`, `'use client';\n${content}`);
    }
  },
});
