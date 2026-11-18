import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Browser, type Page } from "@playwright/test";

// Ronda QA 2026-11-18: fotos responsivas (auditoría UX A3, commit 1c1812e).
// Corre contra out/ (webServer de playwright.config.ts). Las pruebas de out/ leen el disco: exigen un build reciente.

const RAIZ = process.cwd();
const OUT = join(RAIZ, "out");
const MANIFIESTO = JSON.parse(readFileSync(join(RAIZ, "src/data/fotos-responsivas.json"), "utf8")) as Record<string, { anchos: number[] }>;
const FICHA = "/cafes/cafe-casa-martinez/";

async function contexto(browser: Browser, ancho: number, alto: number, dpr: number) {
  return browser.newContext({ viewport: { width: ancho, height: alto }, deviceScaleFactor: dpr });
}

/** Ancho (w) del candidato elegido, a partir de currentSrc ("…/1-800.avif" → 800). */
function anchoElegido(currentSrc: string): number {
  const m = /-(\d+)\.(avif|webp|jpg)$/.exec(currentSrc);
  if (!m) throw new Error(`currentSrc sin variante: ${currentSrc}`);
  return Number(m[1]);
}

async function esperarImagen(page: Page, selector: string) {
  // /cafes/ vuelve a montar las tarjetas al hidratar el explorador (Suspense con useSearchParams): se espera a que termine.
  await page.waitForLoadState("networkidle");
  const img = page.locator(selector).first();
  await img.scrollIntoViewIfNeeded();
  await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0 && i.currentSrc !== "")).toBe(true);
  return img.evaluate((i: HTMLImageElement) => ({ currentSrc: i.currentSrc, ancho: i.getBoundingClientRect().width, alto: i.getBoundingClientRect().height }));
}

// A2 (8c7b943): la caja de la foto pasó a aspect-[4/3] lg:aspect-[3/4]; se ubica por estructura (celda de la cuadrícula > figure), no por clase de proporción.
const FOTO_PRINCIPAL = "main article .grid > div > figure picture img";
const MINIATURA = 'main ul[aria-label^="Más fotos"] picture img';
const TARJETA = "main .ds-card__media picture img";

/** Candidato esperado: el menor ancho disponible que cubre ancho CSS × DPR (o el mayor si ninguno lo cubre). */
function esperado(anchoCss: number, dpr: number, anchos: number[]): number {
  const necesario = anchoCss * dpr;
  return anchos.find((a) => a >= necesario) ?? anchos[anchos.length - 1];
}

test.describe("QA 2026-11-18 · fotos responsivas", () => {
  test("ficha: la foto principal carga con prioridad alta y sin lazy; las miniaturas, diferidas", async ({ page }) => {
    await page.goto(FICHA);
    const principal = page.locator(FOTO_PRINCIPAL);
    await expect(principal).toHaveCount(1);
    await expect(principal).toHaveAttribute("loading", "eager");
    await expect(principal).toHaveAttribute("fetchpriority", "high");
    const miniaturas = page.locator(MINIATURA);
    expect(await miniaturas.count()).toBeGreaterThan(0);
    for (const m of await miniaturas.all()) await expect(m).toHaveAttribute("loading", "lazy");
    // Ninguna foto de café sin <picture> (todas tienen variantes en el manifiesto).
    expect(await page.locator("main img[src*='/fotos/cafes/']").count()).toBe(0);
  });

  const casos = [
    { nombre: "390 DPR 3", ancho: 390, alto: 844, dpr: 3, principal: 1200 },
    { nombre: "1440 DPR 1", ancho: 1440, alto: 900, dpr: 1, principal: 800 },
  ];
  for (const c of casos) {
    test(`ficha a ${c.nombre}: AVIF con la variante esperada en la foto principal y la miniatura`, async ({ browser }) => {
      const ctx = await contexto(browser, c.ancho, c.alto, c.dpr);
      const page = await ctx.newPage();
      await page.goto(FICHA);
      const anchos = MANIFIESTO["/fotos/cafes/cafe-casa-martinez/1.jpg"].anchos;

      const p = await esperarImagen(page, FOTO_PRINCIPAL);
      expect(p.currentSrc).toMatch(/\/fotos-optimizadas\/cafes\/cafe-casa-martinez\/1-\d+\.avif$/);
      expect(anchoElegido(p.currentSrc), `principal (${p.ancho} px CSS)`).toBe(c.principal);
      expect(anchoElegido(p.currentSrc)).toBe(esperado(p.ancho, c.dpr, anchos));

      const m = await esperarImagen(page, MINIATURA);
      expect(m.currentSrc).toMatch(/\.avif$/);
      expect(anchoElegido(m.currentSrc), `miniatura (${m.ancho} px CSS)`).toBe(esperado(m.ancho, c.dpr, MANIFIESTO["/fotos/cafes/cafe-casa-martinez/2.jpg"].anchos));

      await ctx.close();
    });
  }

  for (const vp of [
    { ancho: 360, alto: 740, dpr: 1 },
    { ancho: 390, alto: 844, dpr: 3 },
    { ancho: 768, alto: 1024, dpr: 1 },
    { ancho: 1440, alto: 900, dpr: 1 },
  ]) {
    test(`catálogo a ${vp.ancho} DPR ${vp.dpr}: el sizes de la tarjeta no pide una foto más chica que la caja ni más de un escalón de sobra`, async ({ browser }) => {
      const ctx = await contexto(browser, vp.ancho, vp.alto, vp.dpr);
      const page = await ctx.newPage();
      await page.goto("/cafes/");
      const t = await esperarImagen(page, TARJETA);
      const elegido = anchoElegido(t.currentSrc);
      expect(t.currentSrc).toMatch(/\.avif$/);
      expect(elegido, `tarjeta ${t.ancho} px CSS`).toBe(esperado(t.ancho, vp.dpr, [400, 800, 1200]));
      await ctx.close();
    });
  }

  for (const vp of [
    { ancho: 360, alto: 740 },
    { ancho: 1440, alto: 900 },
  ]) {
    for (const ruta of ["/", "/cafes/", FICHA]) {
      test(`CLS ≈ 0 en ${ruta} a ${vp.ancho} (carga y desplazamiento hasta las fotos diferidas)`, async ({ browser }) => {
        const ctx = await contexto(browser, vp.ancho, vp.alto, 1);
        const page = await ctx.newPage();
        await page.addInitScript(() => {
          (window as unknown as { __cls: number }).__cls = 0;
          new PerformanceObserver((l) => {
            for (const e of l.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
          }).observe({ type: "layout-shift", buffered: true });
        });
        await page.goto(ruta);
        await page.waitForLoadState("networkidle");
        for (const img of await page.locator("main picture img").all()) {
          await img.scrollIntoViewIfNeeded();
          await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete)).toBe(true);
        }
        await page.waitForTimeout(300);
        const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
        expect(cls).toBeLessThan(0.01);
        await ctx.close();
      });
    }
  }

  test("capturas de tarjeta y ficha (360 y 1440)", async ({ browser }) => {
    for (const vp of [
      { ancho: 360, alto: 740 },
      { ancho: 1440, alto: 900 },
    ]) {
      const ctx = await contexto(browser, vp.ancho, vp.alto, 1);
      const page = await ctx.newPage();
      await page.goto(FICHA);
      await esperarImagen(page, FOTO_PRINCIPAL);
      await esperarImagen(page, MINIATURA);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `docs/qa/capturas/2026-11-18-ficha-${vp.ancho}.png` });
      await page.goto("/cafes/");
      const tarjeta = page.locator("main .ds-card").first();
      await esperarImagen(page, TARJETA);
      await tarjeta.screenshot({ path: `docs/qa/capturas/2026-11-18-tarjeta-${vp.ancho}.png` });
      await ctx.close();
    }
  });

  test("axe sin violaciones serias en ficha y catálogo con <picture>", async ({ page }) => {
    for (const ruta of [FICHA, "/cafes/"]) {
      await page.goto(ruta);
      const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id), ruta).toEqual([]);
    }
  });

  test("out/: sin originales de fotos/cafes y con todas las variantes del manifiesto", () => {
    const quedan = readdirSync(join(OUT, "fotos"), { recursive: true, withFileTypes: true })
      .filter((d) => d.isFile() && /\.(jpe?g|png|webp|avif)$/i.test(d.name))
      .map((d) => join(d.parentPath, d.name));
    expect(quedan).toEqual([]);
    for (const [original, { anchos }] of Object.entries(MANIFIESTO)) {
      const base = original.replace(/^\/fotos/, "/fotos-optimizadas").replace(/\.[^.]+$/, "");
      for (const a of anchos) for (const ext of ["avif", "webp"]) expect(existsSync(join(OUT, `${base}-${a}.${ext}`)), `${base}-${a}.${ext}`).toBe(true);
      expect(existsSync(join(OUT, `${base}-${anchos.at(-1)}.jpg`))).toBe(true);
    }
  });

  // `serve` (local) no envía Content-Type para .avif; GitHub Pages sí (image/avif). El AVIF se comprueba por currentSrc y decodificación.
  test("las variantes WebP y JPEG responden 200 con el tipo MIME correcto", async ({ request }) => {
    for (const [ruta, tipo] of [
      ["/fotos-optimizadas/cafes/cafe-casa-martinez/1-800.webp", "image/webp"],
      ["/fotos-optimizadas/cafes/cafe-casa-martinez/1-1200.jpg", "image/jpeg"],
    ]) {
      const r = await request.get(ruta);
      expect(r.status(), ruta).toBe(200);
      expect(r.headers()["content-type"], ruta).toContain(tipo);
    }
  });

  /** Copia out/ y el manifiesto a una carpeta temporal, inyecta `fragmento` en una página y corre `--limpiar-out` allí. */
  function limpiarConReferencia(fragmento: string, destino: "html" | "css" = "html"): { codigo: number; salida: string; originalSigue: boolean } {
    const tmp = mkdtempSync(join(tmpdir(), "qa-fotos-"));
    try {
      cpSync(OUT, join(tmp, "out"), { recursive: true });
      mkdirSync(join(tmp, "src/data"), { recursive: true });
      cpSync(join(RAIZ, "src/data/fotos-responsivas.json"), join(tmp, "src/data/fotos-responsivas.json"));
      // Los originales ya se quitaron en el build: se reponen para ver si el script los borra.
      const original = join(tmp, "out/fotos/cafes/cafe-arreboles/1.jpg");
      cpSync(join(RAIZ, "public/fotos/cafes/cafe-arreboles/1.jpg"), original);
      if (destino === "html") {
        const pagina = join(tmp, "out/cafes/cafe-arreboles/index.html");
        writeFileSync(pagina, readFileSync(pagina, "utf8").replace("</body>", `${fragmento}</body>`));
      } else {
        // Hoja de estilos real del build (Next 16 la deja en _next/static/chunks/; se acepta también _next/static/css/).
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

  test("postbuild falla y no borra si un <img> enlaza un original", () => {
    const r = limpiarConReferencia('<img src="/fotos/cafes/cafe-arreboles/1.jpg" alt="">');
    expect(r.codigo, r.salida).not.toBe(0);
    expect(r.salida).toContain("enlaza /fotos/cafes/cafe-arreboles/1.jpg");
    expect(r.originalSigue).toBe(true);
  });

  test("postbuild falla y no borra si un srcset con basePath enlaza un original", () => {
    const r = limpiarConReferencia('<img srcset="/coffee-santander-shop/fotos/cafes/cafe-arreboles/1.jpg 2000w" alt="">');
    expect(r.codigo, r.salida).not.toBe(0);
    expect(r.originalSigue).toBe(true);
  });

  // QA-019: el JSON-LD (Product.image) y los estilos en línea también cargan la foto, pero la comprobación solo mira atributos.
  test("QA-019: postbuild falla si el JSON-LD de una ficha apunta a un original", () => {
    const r = limpiarConReferencia('<script type="application/ld+json">{"@type":"Product","image":"https://ejemplo.test/fotos/cafes/cafe-arreboles/1.jpg"}</script>');
    expect(r.codigo, r.salida).not.toBe(0);
    expect(r.originalSigue).toBe(true);
  });

  test("QA-019: postbuild falla si un style en línea usa un original como fondo", () => {
    const r = limpiarConReferencia('<div style="background-image:url(/fotos/cafes/cafe-arreboles/1.jpg)"></div>');
    expect(r.codigo, r.salida).not.toBe(0);
    expect(r.originalSigue).toBe(true);
  });

  // Verificación de QA-019 (ronda 2026-11-18 · verificación, commit 3246fb5): CSS de _next/static, ?v= y #.
  test("QA-019 (verificación): postbuild falla si el CSS de _next/static usa un original con url()", () => {
    const r = limpiarConReferencia(".qa-019{background-image:url(/fotos/cafes/cafe-arreboles/1.jpg)}", "css");
    expect(r.codigo, r.salida).not.toBe(0);
    expect(r.salida).toMatch(/out\/_next\/static\/.+\.css enlaza \/fotos\/cafes\/cafe-arreboles\/1\.jpg/);
    expect(r.originalSigue).toBe(true);
  });

  test("QA-019 (verificación): postbuild falla si el CSS usa un original con basePath y ?v=", () => {
    const r = limpiarConReferencia('.qa-019{background:url("/coffee-santander-shop/fotos/cafes/cafe-arreboles/1.jpg?v=3")}', "css");
    expect(r.codigo, r.salida).not.toBe(0);
    expect(r.originalSigue).toBe(true);
  });

  test("QA-019 (verificación): postbuild falla si un <img> enlaza un original con ?v=", () => {
    const r = limpiarConReferencia('<img src="/fotos/cafes/cafe-arreboles/1.jpg?v=2" alt="">');
    expect(r.codigo, r.salida).not.toBe(0);
    expect(r.originalSigue).toBe(true);
  });

  test("QA-019 (verificación): postbuild falla si un enlace con dominio apunta a un original con #", () => {
    const r = limpiarConReferencia('<a href="https://ejemplo.test/fotos/cafes/cafe-arreboles/1.jpg#foto">foto</a>');
    expect(r.codigo, r.salida).not.toBe(0);
    expect(r.originalSigue).toBe(true);
  });

  test("QA-019 (verificación): sin referencias inyectadas, el postbuild sobre el out/ real pasa y borra el original", () => {
    const r = limpiarConReferencia("");
    expect(r.codigo, r.salida).toBe(0);
    expect(r.originalSigue).toBe(false);
  });
});

// Build GITHUB_PAGES=true servido bajo /coffee-santander-shop/ (mismo montaje que e2e/basepath.spec.ts).
test.describe("QA 2026-11-18 · fotos bajo basePath", () => {
  const base = process.env.E2E_BASEPATH_URL;
  const REPO = "/coffee-santander-shop";
  test.skip(!base, "Define E2E_BASEPATH_URL con un build GITHUB_PAGES=true servido bajo /coffee-santander-shop/");

  for (const ruta of ["/", "/cafes/", "/cafes/cafe-casa-martinez/", "/cafes/cafe-arreboles/", "/provincias/guanenta/"]) {
    test(`${ruta}: todas las fotos cargan con el prefijo y ninguna petición da 404`, async ({ page }) => {
      const fallidas: string[] = [];
      page.on("response", (r) => {
        if (r.status() >= 400) fallidas.push(`${r.status()} ${r.url()}`);
      });
      await page.goto(`${base}${REPO}${ruta}`);
      const imgs = await page.locator("main picture img").all();
      for (const img of imgs) {
        await img.scrollIntoViewIfNeeded();
        await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
        expect(await img.evaluate((i: HTMLImageElement) => new URL(i.currentSrc).pathname)).toMatch(new RegExp(`^${REPO}/fotos-optimizadas/`));
      }
      await page.waitForLoadState("networkidle");
      expect(fallidas).toEqual([]);
    });
  }

  test("og:image y JSON-LD de la ficha apuntan al JPEG 1200 bajo basePath y ese archivo existe", async ({ page, request }) => {
    await page.goto(`${base}${REPO}/cafes/cafe-casa-martinez/`);
    const og = await page.locator('meta[property="og:image"]').getAttribute("content");
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent()) ?? "{}") as { image?: string };
    expect(og).toMatch(new RegExp(`${REPO}/fotos-optimizadas/cafes/cafe-casa-martinez/1-1200\\.jpg$`));
    expect(ld.image).toBe(og);
    const ruta = new URL(og!).pathname;
    const r = await request.get(`${base}${ruta}`);
    expect(r.status()).toBe(200);
    expect(r.headers()["content-type"]).toContain("image/jpeg");
  });
});
