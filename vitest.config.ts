import { defineConfig } from "vitest/config"

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@": __dirname,
      "server-only": `${__dirname}/tests/server-only.ts`,
    },
  },
  test: {
    environment: "happy-dom",
    setupFiles: ["./jest.setup.js"],
  },
})
