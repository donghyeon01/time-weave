import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    exclude: ["src/__tests__/task.test.ts"],
    env: {
      JWT_SECRET: "test-jwt-secret-for-calendar-events",
      MONGODB_URI: "",
      REDIS_URI: "redis://localhost:6379",
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
