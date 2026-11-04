import { defineConfig, devices } from "@playwright/test";

// Las pruebas corren contra el sitio estático (out/), igual que lo servirá GitHub Pages.
const PUERTO = 4173;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL: `http://localhost:${PUERTO}`, trace: "retain-on-failure", locale: "es-CO", timezoneId: "America/Bogota" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npx serve out -l ${PUERTO} -n`,
    url: `http://localhost:${PUERTO}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
