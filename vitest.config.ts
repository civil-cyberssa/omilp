import { defineConfig } from "vitest/config"

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@": __dirname,
    },
  },
  test: {
    environment: "happy-dom",
    setupFiles: ["./jest.setup.js"],
  },
})
