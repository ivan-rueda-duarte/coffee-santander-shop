import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Reglas de capas (Clean Architecture):
//   domain          → no importa nada de fuera de domain (ni React, ni Next, ni datos).
//   application     → solo domain.
//   ui              → no llama a infrastructure directamente.
const fuera = (...capas) =>
  capas.map((c) => ({ group: [`@/${c}`, `@/${c}/**`], message: `Esta capa no puede importar de ${c}.` }));
const librerias = ["react", "react-dom", "next", "next/*", "@sanity/*", "groq", "csv-parse", "csv-parse/*", "@radix-ui/*", "@floating-ui/*"];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [
        ...fuera("application", "infrastructure", "ui"),
        { group: librerias, message: "domain es TypeScript puro: sin React, Next, Sanity ni lectores de datos." },
        { group: ["../../**"], message: "domain no puede salir de su carpeta." },
      ] }],
    },
  },
  {
    files: ["src/application/**/*.{ts,tsx}"],
    rules: { "no-restricted-imports": ["error", { patterns: [
      ...fuera("infrastructure", "ui"),
      { group: ["react", "react-dom", "next", "next/*"], message: "application no depende de React ni de Next." },
    ] }] },
  },
  {
    files: ["src/ui/**/*.{ts,tsx}"],
    rules: { "no-restricted-imports": ["error", { patterns: [
      ...fuera("infrastructure"),
      { group: ["@sanity/*", "groq", "csv-parse", "csv-parse/*"], message: "ui usa casos de uso o hooks, no clientes de datos." },
    ] }] },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "legacy/**", "page_style/**", "tools/**", "coverage/**", ".claude/**", ".impeccable/**", "studio/**"]),
]);

export default eslintConfig;
