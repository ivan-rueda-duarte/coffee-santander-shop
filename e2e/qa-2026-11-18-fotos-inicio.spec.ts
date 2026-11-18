import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test, type Browser } from "@playwright/test";

// Ronda QA 2026-11-18 (verificación de 2bc61e8): variantes responsivas de las fotos de inicio e Historia
// (public/assets/fotografia/ → /fotos-optimizadas/assets/fotografia/). Corre contra out/; las pruebas de disco exigen un build reciente.

const RAIZ = process.cwd();
const OUT = join(RAIZ, "out");
const HISTORIA = "#historia picture img";
const ANCHOS = [400, 800, 1200];

function anchoElegido(src: string): number {
  const m = /\/fotos-optimizadas\/assets\/fotografia\/cafetal-montana-(\d+)\.(avif|webp|jpg)$/.exec(new URL(src).pathname);
  if (!m) throw new Error(`currentSrc fuera de las variantes de cafetal-montana: ${src}`);
  return Number(m[1]);
}

async function contexto(browser: Browser, ancho: number, alto: number, dpr: number) {
  return browser.newContext({ viewport: { width: ancho, height: alto }, deviceScaleFactor: dpr });
}

test.describe("QA 2026-11-18 · foto de Historia en el inicio", () => {
  test("HTML de out/: <picture> con AVIF y WebP, JPEG 1200 de respaldo, lazy, sin fetchpriority, con width/height", () => {
    const html = readFileSync(join(OUT, "index.html"), "utf8");
    const pic = /<picture>(?:(?!<\/picture>)[\s\S])*cafetal-montana(?:(?!<\/picture>)[\s\S])*<\/picture>/.exec(html)?.[0] ?? "";
    expect(pic).not.toBe("");
    expect(pic).toContain('type="image/avif"');
    expect(pic).toContain('type="image/webp"');
    for (const a of ANCHOS) for (const e of ["avif", "webp"]) expect(pic).toContain(`/fotos-optimizadas/assets/fotografia/cafetal-montana-${a}.${e} ${a}w`);
    const img = /<img[^>]*>/.exec(pic)?.[0] ?? "";
    expect(img).toContain('src="/fotos-optimizadas/assets/fotografia/cafetal-montana-1200.jpg"');
    expect(img).toContain('loading="lazy"');
    expect(img).not.toMatch(/fetchpriority/i);
    expect(img).toMatch(/width="\d+"/);
    expect(img).toMatch(/height="\d+"/);
    // Ninguna página de out/ enlaza el original.
    const html2 = readdirSync(OUT, { recursive: true, withFileTypes: true }).filter((d) => d.isFile() && d.name.endsWith(".html"));
    const conOriginal = html2.filter((d) => /\/assets\/fotografia\/[a-z-]+\.jpg/.test(readFileSync(join(d.parentPath, d.name), "utf8")));
    expect(conOriginal.map((d) => d.name)).toEqual([]);
  });

  for (const vp of [
    { ancho: 360, alto: 740, dpr: 1 },
    { ancho: 390, alto: 844, dpr: 3 },
    { ancho: 1024, alto: 768, dpr: 1 },
    { ancho: 1100, alto: 800, dpr: 1 },
    { ancho: 1440, alto: 900, dpr: 1 },
  ]) {
    test(`${vp.ancho} DPR ${vp.dpr}: variante AVIF elegida = menor ≥ ancho CSS × DPR; no se descarga antes de acercarse`, async ({ browser }) => {
      const ctx = await contexto(browser, vp.ancho, vp.alto, vp.dpr);
      const page = await ctx.newPage();
      const pedidas: string[] = [];
      page.on("request", (r) => {
        if (r.url().includes("cafetal-montana")) pedidas.push(r.url());
      });
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      // Diferida: Historia está lejos del primer pantallazo.
      expect(pedidas, "la foto de Historia se pidió sin desplazarse (lazy)").toEqual([]);
      const img = page.locator(HISTORIA).first();
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0 && i.currentSrc !== "")).toBe(true);
      const r = await img.evaluate((i: HTMLImageElement) => ({ src: i.currentSrc, w: i.getBoundingClientRect().width }));
      const necesario = r.w * vp.dpr;
      const esperado = ANCHOS.find((a) => a >= necesario) ?? 1200;
      test.info().annotations.push({ type: `historia-${vp.ancho}x${vp.dpr}`, description: `caja ${Math.round(r.w)} px → ${r.src.split("/").pop()} (esperado ${esperado})` });
      expect(r.src).toMatch(/\.avif$/);
      expect(anchoElegido(r.src)).toBe(esperado);
      expect(pedidas.filter((u) => !u.includes("fotos-optimizadas"))).toEqual([]);
      await ctx.close();
    });
  }

  for (const vp of [
    { ancho: 360, alto: 740 },
    { ancho: 1440, alto: 900 },
  ]) {
    test(`CLS < 0,01 en / a ${vp.ancho} al desplazarse hasta la Historia`, async ({ browser }) => {
      const ctx = await contexto(browser, vp.ancho, vp.alto, 1);
      const page = await ctx.newPage();
      await page.addInitScript(() => {
        (window as unknown as { __cls: number }).__cls = 0;
        new PerformanceObserver((l) => {
          for (const e of l.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
        }).observe({ type: "layout-shift", buffered: true });
      });
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      const img = page.locator(HISTORIA).first();
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
      await page.waitForTimeout(300);
      const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
      test.info().annotations.push({ type: `cls-${vp.ancho}`, description: String(cls) });
      expect(cls).toBeLessThan(0.01);
      await ctx.close();
    });
  }

  test("out/assets/fotografia/ sin originales; variantes de las dos fotos presentes", () => {
    const quedan = readdirSync(join(OUT, "assets/fotografia"), { recursive: true, withFileTypes: true }).filter((d) => d.isFile() && /\.(jpe?g|png|webp|avif)$/i.test(d.name));
    expect(quedan.map((d) => d.name)).toEqual([]);
    for (const n of ["cafetal-montana", "chicamocha-canon"]) {
      for (const a of ANCHOS) for (const e of ["avif", "webp"]) expect(existsSync(join(OUT, `fotos-optimizadas/assets/fotografia/${n}-${a}.${e}`)), `${n}-${a}.${e}`).toBe(true);
      expect(existsSync(join(OUT, `fotos-optimizadas/assets/fotografia/${n}-1200.jpg`))).toBe(true);
    }
  });

  /** Copia out/ a una carpeta temporal, repone el original de cafetal-montana, inyecta `fragmento` y corre `--limpiar-out`. */
  function limpiar(fragmento: string, destino: "html" | "css"): { codigo: number; salida: string; originalSigue: boolean } {
    const tmp = mkdtempSync(join(tmpdir(), "qa-fotos-inicio-"));
    try {
      cpSync(OUT, join(tmp, "out"), { recursive: true });
      mkdirSync(join(tmp, "src/data"), { recursive: true });
      cpSync(join(RAIZ, "src/data/fotos-responsivas.json"), join(tmp, "src/data/fotos-responsivas.json"));
      const original = join(tmp, "out/assets/fotografia/cafetal-montana.jpg");
      cpSync(join(RAIZ, "public/assets/fotografia/cafetal-montana.jpg"), original);
      if (destino === "html") {
        const pagina = join(tmp, "out/index.html");
        writeFileSync(pagina, readFileSync(pagina, "utf8").replace("</body>", `${fragmento}</body>`));
      } else {
        const css = readdirSync(join(tmp, "out/_next/static"), { recursive: true, withFileTypes: true }).find((d) => d.isFile() && d.name.endsWith(".css"));
        if (!css) throw new Error("out/_next/static sin .css");
        const ruta = join(css.parentPath, css.name);
        writeFileSync(ruta, `${readFileSync(ruta, "utf8")}\n${fragmento}`);
      }
      let codigo = 0;
      let salida = "";
      try {
        salida = execFileSync(join(RAIZ, "node_modules/.bin/tsx"), [join(RAIZ, "tools/fotos-responsivas.ts"), "--limpiar-out"], { cwd: tmp, encoding: "utf8", stdio: "pipe" });
      } catch (e) {
        const err = e as { status: number; stderr: string; stdout: string };
        codigo = err.status;
        salida = `${err.stdout}${err.stderr}`;
      }
      return { codigo, salida, originalSigue: existsSync(original) };
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }

  test("postbuild falla y no borra si el HTML enlaza /assets/fotografia/cafetal-montana.jpg", () => {
    const r = limpiar('<img src="/assets/fotografia/cafetal-montana.jpg" alt="">', "html");
    expect(r.codigo, r.salida).not.toBe(0);
    expect(r.salida).toContain("/assets/fotografia/cafetal-montana.jpg");
    expect(r.originalSigue).toBe(true);
  });

  test("postbuild falla y no borra si un style en línea con basePath usa el original", () => {
    const r = limpiar('<div style="background:url(/coffee-santander-shop/assets/fotografia/cafetal-montana.jpg)"></div>', "html");
    expect(r.codigo, r.salida).not.toBe(0);
    expect(r.originalSigue).toBe(true);
  });

  test("postbuild falla y no borra si el CSS de _next/static usa el original", () => {
    const r = limpiar(".qa{background-image:url('/assets/fotografia/cafetal-montana.jpg?v=1')}", "css");
    expect(r.codigo, r.salida).not.toBe(0);
    expect(r.originalSigue).toBe(true);
  });

  test("postbuild sin referencias: pasa y borra el original repuesto", () => {
    const r = limpiar("", "html");
    expect(r.codigo, r.salida).toBe(0);
    expect(r.originalSigue).toBe(false);
  });
});

test.describe("QA 2026-11-18 · foto de Historia bajo basePath", () => {
  const base = process.env.E2E_BASEPATH_URL;
  const REPO = "/coffee-santander-shop";
  test.skip(!base, "Define E2E_BASEPATH_URL con un build GITHUB_PAGES=true servido bajo /coffee-santander-shop/");

  test("/ bajo basePath: la foto de Historia sale de /coffee-santander-shop/fotos-optimizadas/assets/fotografia/ y nada da 404", async ({ page }) => {
    const fallidas: string[] = [];
    page.on("response", (r) => {
      if (r.status() >= 400) fallidas.push(`${r.status()} ${r.url()}`);
    });
    await page.goto(`${base}${REPO}/`);
    const img = page.locator(HISTORIA).first();
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
    expect(await img.evaluate((i: HTMLImageElement) => new URL(i.currentSrc).pathname)).toMatch(new RegExp(`^${REPO}/fotos-optimizadas/assets/fotografia/cafetal-montana-\\d+\\.avif$`));
    const srcs = await page.locator("#historia picture source").evaluateAll((s) => s.map((e) => e.getAttribute("srcset") ?? ""));
    for (const s of srcs) for (const parte of s.split(",")) expect(parte.trim()).toMatch(new RegExp(`^${REPO}/fotos-optimizadas/`));
    await page.waitForLoadState("networkidle");
    expect(fallidas).toEqual([]);
  });
});
