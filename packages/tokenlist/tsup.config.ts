import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./index.ts"],
  tsconfig: "./tsconfig.json",
  format: ["cjs", "esm"],
  minify: true,
  sourcemap: true,
  dts: true, // declaration files
  publicDir: "./public", // copy the jsons to dist for good measure
});
