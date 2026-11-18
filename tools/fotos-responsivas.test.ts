import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// QA-020 (ronda 2026-11-18): `npm run fotos` corre en prebuild y predev e importa «sharp».
// Hoy solo llega como dependencia opcional y transitiva de next: un cambio de next o `npm ci --omit=optional`
// deja sin build ni despliegue. El script debe tener su dependencia declarada.
describe("QA-020 · dependencias de tools/fotos-responsivas.ts", () => {
  it("sharp está declarado en dependencies o devDependencies de package.json", () => {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    expect(pkg.devDependencies?.sharp ?? pkg.dependencies?.sharp).toBeDefined();
  });
});
