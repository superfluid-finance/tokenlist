import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./index.ts'],
  tsconfig: './tsconfig.json',
  format: ['cjs', 'esm'],
  minify: false,
  sourcemap: false
})
