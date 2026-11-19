"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { altoContenedor, calcularCapa, type EntradaCapa } from "@/domain/mapa/capa";
import { calcularEncuadre, interpolarCaja } from "@/domain/mapa/geometria";
import type { CajaMapa } from "@/domain/mapa/tipos";
import { useCatalogo } from "@/ui/hooks/use-catalogo";
import { useFiltrosCatalogo } from "@/ui/hooks/use-filtros-catalogo";
import { useMediaQuery, useMovimientoReducido } from "@/ui/hooks/use-media-query";
import { Boton } from "../marca/boton";
import { ID_CONTADOR } from "../catalogo/explorador";
import { ID_MAPA, type Pulsada } from "./activador-mapa";
import { CapaMedida } from "./capa-mapa";
import { TarjetaProvincia } from "./tarjeta-provincia";

const NOMBRE_SVG = 'svg[aria-label="Mapa de Santander por provincias"]';

/** El contenedor, el SVG y los grupos de las provincias con cafés, tal como los dejó el HTML del build. */
function buscarNodos() {
  const mapa = document.getElementById(ID_MAPA);
  const svg = mapa?.querySelector<SVGSVGElement>(NOMBRE_SVG);
  if (!mapa || !svg) return null;
  return { mapa, svg, grupos: new Map([...svg.querySelectorAll<SVGGElement>("g.prov--activa")].map((g) => [g.dataset.provincia ?? "", g])) };
}

/**
 * Interacción del mapa sobre el dibujo que trae el HTML: encuadre animado, provincias elegidas, capa de textos medida
 * y tarjeta de provincia. No tiene estado propio de selección: lee y escribe los filtros de la URL.
 * El SVG es del servidor, así que el encuadre, las clases y los eventos se ponen sobre sus nodos.
 */
export default function InteraccionMapa({ entrada, tomarPendiente }: { entrada: EntradaCapa; tomarPendiente: () => Pulsada | undefined }) {
  const { catalogo } = useCatalogo();
  const f = useFiltrosCatalogo();
  const reducido = useMovimientoReducido();
  const comoHoja = useMediaQuery("(max-width: 767px)");
  const completo = entrada.completo;

  // Solo se monta en el navegador (la descarga el activador), así que puede leer el DOM al iniciar el estado:
  // la capa medida reemplaza a la del HTML en el mismo cuadro, sin un cuadro vacío.
  const [nodos] = useState(buscarNodos);
  // El alto sale del ancho con la misma cuenta que usa el build para la capa del HTML (QA-034): así las dos capas
  // toman las mismas decisiones aunque el navegador redondee el alto de otra manera.
  const proporcion = completo[2] / completo[3];
  const medir = useCallback((mapa: HTMLElement) => ({ w: mapa.clientWidth, h: mapa.clientWidth ? altoContenedor(mapa.clientWidth, proporcion) : 0 }), [proporcion]);
  const [tam, setTam] = useState(() => (nodos ? medir(nodos.mapa) : { w: 0, h: 0 }));
  useEffect(() => {
    if (!nodos) return;
    const { mapa } = nodos;
    const obs = new ResizeObserver(() => setTam(medir(mapa)));
    obs.observe(mapa);
    return () => obs.disconnect();
  }, [nodos, medir]);

  // ---------- Encuadre animado ----------
  const elegidas = f.filtros.provincias;
  const claveElegidas = elegidas.join(",");
  const objetivo = useMemo<CajaMapa>(
    () => calcularEncuadre(completo, elegidas.flatMap((s) => entrada.provincias.filter((p) => p.slug === s).map((p) => p.bbox))),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `elegidas` cambia de identidad en cada render; la clave la resume
    [claveElegidas, entrada, completo],
  );
  const [animado, setVb] = useState<CajaMapa>(completo);
  const vbActual = useRef<CajaMapa>(completo);
  // Con movimiento reducido el encuadre cambia de golpe; si no, se anima hacia `objetivo`.
  const vb = reducido ? objetivo : animado;
  useEffect(() => {
    if (reducido) {
      vbActual.current = objetivo;
      return;
    }
    const desde = vbActual.current;
    const inicio = performance.now();
    let cuadro = 0;
    const paso = (ahora: number) => {
      const t = Math.min(1, (ahora - inicio) / 650);
      vbActual.current = interpolarCaja(desde, objetivo, t);
      setVb(vbActual.current);
      if (t < 1) cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [objetivo, reducido]);

  useLayoutEffect(() => {
    nodos?.svg.setAttribute("viewBox", vb.map((n) => n.toFixed(2)).join(" "));
  }, [nodos, vb]);

  useLayoutEffect(() => {
    if (!nodos) return;
    nodos.mapa.classList.toggle("mapa--filtrado", elegidas.length > 0);
    for (const [slug, g] of nodos.grupos) {
      const elegida = elegidas.includes(slug);
      g.classList.toggle("prov--elegida", elegida);
      g.setAttribute("aria-pressed", String(elegida));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- igual que arriba: la clave resume `elegidas`
  }, [nodos, claveElegidas]);

  const capa = useMemo(() => calcularCapa(entrada, vb, tam.w, tam.h, elegidas), [entrada, vb, tam, elegidas]);

  // ---------- Tarjeta de provincia ----------
  const cafesPorProvincia = useMemo(() => {
    const m = new Map<string, typeof catalogo.cafes>();
    for (const c of catalogo.cafes) if (c.provinciaSlug) m.set(c.provinciaSlug, [...(m.get(c.provinciaSlug) ?? []), c]);
    return m;
  }, [catalogo]);
  const [abierta, setAbierta] = useState<string | null>(null);
  const [ancla, setAncla] = useState<Element | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout>>(undefined);
  const ultimoPuntero = useRef<string>("mouse");

  const abrir = useCallback(
    (slug: string) => {
      clearTimeout(temporizador.current);
      setAbierta(slug);
      setAncla(nodos?.grupos.get(slug) ?? null);
    },
    [nodos],
  );
  const cerrarPronto = useCallback(() => {
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setAbierta(null), 180);
  }, []);
  // QA-031: al cerrar a propósito (Escape, «Cerrar»), el puntero puede quedar quieto donde estaba la hoja. Al
  // desaparecer, el navegador manda `pointerenter` a la provincia que queda debajo sin que el ratón se mueva; si eso
  // reabre la hoja, vuelve a tapar el puntero y entra en un bucle. Se anota dónde estaba el puntero al cerrar y,
  // mientras no se mueva de ahí, `pointerenter` no abre.
  const puntero = useRef<{ x: number; y: number } | null>(null);
  const quieto = useRef<{ x: number; y: number } | null>(null);
  const cerrar = useCallback(() => {
    clearTimeout(temporizador.current);
    quieto.current = puntero.current;
    setAbierta(null);
  }, []);
  useEffect(() => () => clearTimeout(temporizador.current), []);
  useEffect(() => {
    const alMover = (e: PointerEvent) => {
      puntero.current = { x: e.clientX, y: e.clientY };
      if (quieto.current && (quieto.current.x !== e.clientX || quieto.current.y !== e.clientY)) quieto.current = null;
    };
    // `pointerover` también: si la hoja se abrió sin mover el ratón desde que llegó la interacción, ya se sabe dónde está.
    for (const tipo of ["pointermove", "pointerover"] as const) document.addEventListener(tipo, alMover, { capture: true, passive: true });
    return () => {
      for (const tipo of ["pointermove", "pointerover"] as const) document.removeEventListener(tipo, alMover, { capture: true });
    };
  }, []);
  useEffect(() => {
    if (!abierta) return;
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && cerrar();
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [abierta, cerrar]);
  useEffect(() => {
    const alPulsar = (e: PointerEvent) => {
      if (!(e.target instanceof Element) || e.target.closest("[data-mapa-interactivo]")) return;
      setAbierta(null);
    };
    document.addEventListener("pointerdown", alPulsar);
    return () => document.removeEventListener("pointerdown", alPulsar);
  }, []);

  const verCafes = (slug: string) => {
    if (!elegidas.includes(slug)) f.alternarProvincia(slug);
    cerrar();
    const destino = document.getElementById("catalogo");
    destino?.scrollIntoView({ behavior: reducido ? "auto" : "smooth", block: "start" });
    window.setTimeout(() => document.getElementById(ID_CONTADOR)?.focus({ preventScroll: true }), reducido ? 0 : 450);
  };

  // ---------- Eventos sobre las provincias del SVG ----------
  // Los manejadores cambian en cada render (leen los filtros); los nodos reciben unos fijos que llaman a los últimos.
  const alternar = f.alternarProvincia;
  const manejadores = useRef({ abrir, cerrar, cerrarPronto, alternar });
  useLayoutEffect(() => {
    manejadores.current = { abrir, cerrar, cerrarPronto, alternar };
  });
  useEffect(() => {
    if (!nodos) return;
    const quitar: (() => void)[] = [];
    const en = <K extends keyof SVGElementEventMap>(el: SVGElement | HTMLElement, tipo: K, fn: (e: SVGElementEventMap[K]) => void) => {
      el.addEventListener(tipo, fn as EventListener);
      quitar.push(() => el.removeEventListener(tipo, fn as EventListener));
    };
    const m = () => manejadores.current;
    en(nodos.mapa, "keydown", (e) => e.key === "Escape" && m().cerrar());
    for (const [slug, g] of nodos.grupos) {
      en(g, "pointerdown", (e) => (ultimoPuntero.current = e.pointerType));
      en(g, "pointerenter", (e) => {
        if (e.pointerType !== "mouse") return;
        const q = quieto.current;
        if (q && q.x === e.clientX && q.y === e.clientY) return; // el ratón no se ha movido desde que se cerró (QA-031)
        m().abrir(slug);
      });
      en(g, "pointerleave", (e) => e.pointerType === "mouse" && m().cerrarPronto());
      en(g, "focus", () => m().abrir(slug));
      en(g, "blur", (e) => {
        if (!(e.relatedTarget instanceof Element && e.relatedTarget.closest("[role=dialog]"))) m().cerrarPronto();
      });
      // Con el dedo, tocar abre la tarjeta; con ratón o teclado, alterna el filtro.
      en(g, "click", () => (ultimoPuntero.current === "touch" ? m().abrir(slug) : m().alternar(slug)));
      en(g, "keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          m().alternar(slug);
        } else if (e.key === "Escape") m().cerrar();
      });
    }

    // Lo que pasó antes de llegar: el clic, el toque o la tecla anotados, y el puntero o el foco que ya están encima.
    const p = tomarPendiente();
    if (p && nodos.grupos.has(p.slug)) {
      ultimoPuntero.current = p.puntero;
      if (p.puntero === "touch") m().abrir(p.slug);
      else m().alternar(p.slug);
    }
    const encima = [...nodos.grupos].find(([, g]) => g.matches(":hover") || g === document.activeElement);
    if (encima) m().abrir(encima[0]);

    return () => quitar.forEach((q) => q());
  }, [nodos, tomarPendiente]);

  // QA-031 y QA-033: la tarjeta escucha la entrada y la salida del puntero con eventos nativos, igual que las
  // provincias. Si la tarjeta usara `onPointerEnter` de React, este llegaría antes que el `pointerleave` nativo de la
  // provincia (React lo saca del `pointerout`, que el navegador despacha primero): el `clearTimeout` correría antes de
  // que `cerrarPronto` programe el cierre y nadie lo cancelaría. Con la hoja abierta bajo el puntero quieto, eso la
  // quitaba y la volvía a poner cada ≈ 200 ms; al pasar rápido de la provincia a su tarjeta, la cerraba a los 180 ms.
  // Con los dos nativos, el orden es el del navegador: `pointerleave` de la provincia y luego `pointerenter` de la tarjeta.
  const conTarjeta = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const entrar = () => clearTimeout(temporizador.current);
    const salir = () => manejadores.current.cerrarPronto();
    el.addEventListener("pointerenter", entrar);
    el.addEventListener("pointerleave", salir);
    return () => {
      el.removeEventListener("pointerenter", entrar);
      el.removeEventListener("pointerleave", salir);
    };
  }, []);

  const provinciaAbierta = abierta ? catalogo.provincias.find((p) => p.slug === abierta) : undefined;

  return (
    <>
      <CapaMedida capa={capa} />
      {elegidas.length > 0 && (
        <div className="absolute right-3 top-3">
          <Boton tamano="sm" variante="secundario" className="!bg-surface-raised" onClick={f.quitarProvincias}>
            Ver todo Santander
          </Boton>
        </div>
      )}
      {provinciaAbierta && (
        <div data-mapa-interactivo ref={conTarjeta}>
          <TarjetaProvincia
            provincia={provinciaAbierta}
            cafes={cafesPorProvincia.get(provinciaAbierta.slug) ?? []}
            elegida={elegidas.includes(provinciaAbierta.slug)}
            ancla={ancla}
            comoHoja={comoHoja}
            alCerrar={cerrar}
            alVerCafes={() => verCafes(provinciaAbierta.slug)}
            alAlternar={() => f.alternarProvincia(provinciaAbierta.slug)}
          />
        </div>
      )}
    </>
  );
}
