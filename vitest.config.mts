import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "tools/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/domain/**/*.ts"],
      exclude: ["src/domain/**/*.test.ts", "src/domain/pruebas/**"],
      thresholds: { lines: 90, statements: 90, functions: 90, branches: 85 },
    },
  },
});
