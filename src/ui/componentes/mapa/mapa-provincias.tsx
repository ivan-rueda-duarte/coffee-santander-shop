"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as EventoTeclado } from "react";
import { etiquetaCafes } from "@/domain/catalogo/filtros";
import { colocarPines, colocarRotulos } from "@/domain/mapa/etiquetas";
import { calcularEncuadre, escalaGrafica, formatearGrados, interpolarCaja, proyectar } from "@/domain/mapa/geometria";
import type { CajaMapa, DatosMapa } from "@/domain/mapa/tipos";
import datosCrudos from "@/data/mapa-santander.json";
import { useCatalogo } from "@/ui/hooks/use-catalogo";
import { useFiltrosCatalogo } from "@/ui/hooks/use-filtros-catalogo";
import { useMediaQuery, useMovimientoReducido } from "@/ui/hooks/use-media-query";
import { Boton } from "../marca/boton";
import { ID_CONTADOR } from "../catalogo/explorador";
import { DibujoDepartamento } from "./dibujo-departamento";
import { TarjetaProvincia } from "./tarjeta-provincia";

const datos = datosCrudos as unknown as DatosMapa;
const PROPORCION = datos.viewBox[2] / datos.viewBox[3];

/** Gratícula cada medio grado, calculada una vez sobre el departamento completo. */
const graticula = (() => {
  const p = datos.proyeccion;
  const [, , vw, vh] = datos.viewBox;
  const lonMin = p.lon0 - p.dx / (p.cos * p.k);
  const lonMax = p.lon0 + (vw - p.dx) / (p.cos * p.k);
  const latMax = p.lat0 + p.dy / p.k;
  const latMin = p.lat0 - (vh - p.dy) / p.k;
  const lons: number[] = [];
  const lats: number[] = [];
  for (let lon = Math.ceil(lonMin * 2) / 2; lon <= lonMax; lon += 0.5) lons.push(lon);
  for (let lat = Math.ceil(latMin * 2) / 2; lat <= latMax; lat += 0.5) lats.push(lat);
  return { lons, lats };
})();

const anchoPin = (nombre: string) => Math.round(nombre.length * 7.2 + 28);
const anchoRotulo = (nombre: string) => Math.round(nombre.length * 9.6);

/** Mapa interactivo de provincias. Sin estado propio de selección: lee y escribe los filtros de la URL. */
export default function MapaProvincias() {
  const { catalogo } = useCatalogo();
  const f = useFiltrosCatalogo();
  const reducido = useMovimientoReducido();
  const comoHoja = useMediaQuery("(max-width: 767px)");

  const contenedor = useRef<HTMLDivElement>(null);
  const [tam, setTam] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = contenedor.current;
    if (!el) return;
    const medir = () => setTam({ w: el.clientWidth, h: el.clientHeight });
    medir();
    const obs = new ResizeObserver(medir);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ---------- Encuadre animado ----------
  const elegidas = f.filtros.provincias;
  const claveElegidas = elegidas.join(",");
  const objetivo = useMemo<CajaMapa>(
    () => calcularEncuadre(datos.viewBox, elegidas.flatMap((s) => (datos.provincias[s] ? [datos.provincias[s].bbox] : []))),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `elegidas` cambia de identidad en cada render; la clave la resume
    [claveElegidas],
  );
  const [animado, setVb] = useState<CajaMapa>(datos.viewBox);
  const vbActual = useRef<CajaMapa>(datos.viewBox);
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

  // ---------- Qué se dibuja ----------
  const cafesPorProvincia = useMemo(() => {
    const m = new Map<string, typeof catalogo.cafes>();
    for (const c of catalogo.cafes) if (c.provinciaSlug) m.set(c.provinciaSlug, [...(m.get(c.provinciaSlug) ?? []), c]);
    return m;
  }, [catalogo]);
  const activas = useMemo(() => new Set(catalogo.provinciasActivas.map((p) => p.slug)), [catalogo]);
  const origenes = useMemo(() => new Set(catalogo.cafes.map((c) => c.municipioSlug)), [catalogo]);

  const [vx, vy, vw, vh] = vb;
  const { w: W, h: H } = tam;
  const px = useCallback((x: number, y: number): [number, number] => [((x - vx) / vw) * W, ((y - vy) / vh) * H], [vx, vy, vw, vh, W, H]);

  const { pines, rotulos } = useMemo(() => {
    if (!W || !H) return { pines: [], rotulos: [] };
    const entradas = [...origenes].flatMap((slug) => {
      const geo = datos.municipios.find((m) => m.slug === slug);
      const cafes = catalogo.cafes.filter((c) => c.municipioSlug === slug);
      if (!geo || cafes.length === 0) return [];
      const nombre = cafes.length === 1 ? cafes[0].nombre.replace(/^Café\s+/i, "") : `${cafes[0].nombre.replace(/^Café\s+/i, "")} +${cafes.length - 1}`;
      const [x, y] = px(geo.c[0], geo.c[1]);
      return [{ slug, nombre, cafe: cafes[0], x, y, ancho: anchoPin(nombre), alto: 26, preferirIzquierda: geo.c[0] > datos.viewBox[2] * 0.72 }];
    });
    const colocacion = colocarPines(entradas, W, H);
    const rot = Object.entries(datos.provincias).map(([slug, p]) => {
      const nombre = catalogo.provincias.find((x) => x.slug === slug)?.nombreCorto ?? slug;
      const [cx, cy] = px(p.c[0], p.c[1]);
      const vacia = !activas.has(slug);
      return { slug, nombre, vacia, cx, cy, ancho: anchoRotulo(nombre), alto: vacia ? 26 : 14, atenuado: elegidas.length > 0 && !elegidas.includes(slug) };
    });
    const colocados = colocarRotulos(rot, colocacion.ocupadas, W, H);
    return { pines: entradas.map((e, i) => ({ ...e, ...colocacion.pines[i] })), rotulos: rot.map((r, i) => ({ ...r, ...colocados[i] })) };
  }, [W, H, px, origenes, catalogo, activas, elegidas]);

  const escala = W ? escalaGrafica(datos.proyeccion, vw, W) : null;

  // ---------- Tarjeta de provincia ----------
  const [abierta, setAbierta] = useState<string | null>(null);
  const [ancla, setAncla] = useState<Element | null>(null);
  const grupos = useRef(new Map<string, SVGGElement>());
  const temporizador = useRef<ReturnType<typeof setTimeout>>(undefined);
  const ultimoPuntero = useRef<string>("mouse");

  const abrir = (slug: string) => {
    clearTimeout(temporizador.current);
    setAbierta(slug);
    setAncla(grupos.current.get(slug) ?? null);
  };
  const cerrarPronto = () => {
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setAbierta(null), 180);
  };
  const cerrar = () => {
    clearTimeout(temporizador.current);
    setAbierta(null);
  };
  useEffect(() => () => clearTimeout(temporizador.current), []);
  useEffect(() => {
    if (!abierta) return;
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && setAbierta(null);
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [abierta]);
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

  const alTeclear = (e: EventoTeclado, slug: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      f.alternarProvincia(slug);
    } else if (e.key === "Escape") cerrar();
  };

  const provinciaAbierta = abierta ? catalogo.provincias.find((p) => p.slug === abierta) : undefined;

  return (
    <div>
      <div
        ref={contenedor}
        data-mapa-interactivo
        className={`relative mx-auto w-full max-w-[640px] overflow-hidden rounded-lg bg-surface-sunken ${elegidas.length ? "mapa--filtrado" : ""}`}
        style={{ aspectRatio: PROPORCION }}
        onKeyDown={(e) => e.key === "Escape" && cerrar()}
      >
        <svg viewBox={vb.map((n) => n.toFixed(2)).join(" ")} className="absolute inset-0 h-full w-full" role="group" aria-label="Mapa de Santander por provincias">
          <g className="graticula" aria-hidden="true">
            {graticula.lons.map((lon) => {
              const x = proyectar(datos.proyeccion, lon, 0)[0];
              return <line key={lon} x1={x} x2={x} y1={0} y2={datos.viewBox[3]} className="graticula" />;
            })}
            {graticula.lats.map((lat) => {
              const y = proyectar(datos.proyeccion, 0, lat)[1];
              return <line key={lat} x1={0} x2={datos.viewBox[2]} y1={y} y2={y} className="graticula" />;
            })}
          </g>
          <DibujoDepartamento
            datos={datos}
            provincias={catalogo.provincias}
            prefijo="mapa"
            envolver={(p, hijos) => {
              const activa = activas.has(p.slug);
              const elegida = elegidas.includes(p.slug);
              const n = cafesPorProvincia.get(p.slug)?.length ?? 0;
              if (!activa) {
                return (
                  <g key={p.slug} className="prov prov--vacia" data-provincia={p.slug}>
                    {hijos}
                  </g>
                );
              }
              return (
                <g
                  key={p.slug}
                  ref={(el) => {
                    if (el) grupos.current.set(p.slug, el);
                    else grupos.current.delete(p.slug);
                  }}
                  className={`prov prov--activa ${elegida ? "prov--elegida" : ""}`}
                  data-provincia={p.slug}
                  role="button"
                  tabIndex={0}
                  aria-pressed={elegida}
                  aria-label={`Provincia de ${p.nombreCorto}, ${etiquetaCafes(n)}`}
                  onPointerDown={(e) => (ultimoPuntero.current = e.pointerType)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && abrir(p.slug)}
                  onPointerLeave={(e) => e.pointerType === "mouse" && cerrarPronto()}
                  onFocus={() => abrir(p.slug)}
                  onBlur={(e) => {
                    if (!(e.relatedTarget instanceof Element && e.relatedTarget.closest("[role=dialog]"))) cerrarPronto();
                  }}
                  onClick={() => {
                    // Con el dedo, tocar abre la tarjeta; con ratón o teclado, alterna el filtro.
                    if (ultimoPuntero.current === "touch") abrir(p.slug);
                    else f.alternarProvincia(p.slug);
                  }}
                  onKeyDown={(e) => alTeclear(e, p.slug)}
                >
                  {hijos}
                </g>
              );
            }}
          />
          {[...origenes].map((slug) => {
            if (!pines.length) return null;
            const geo = datos.municipios.find((m) => m.slug === slug);
            return geo ? <path key={slug} d={geo.d} className="mpio--origen" fill="none" pointerEvents="none" /> : null;
          })}
        </svg>

        {/* Textos en HTML para que conserven su tamaño con cualquier encuadre */}
        <div className="pointer-events-none absolute inset-0" aria-hidden={false}>
          {rotulos.map((r) => (
            <span
              key={r.slug}
              aria-hidden="true"
              className={`mapa-rotulo ${r.oculto ? "mapa-rotulo--oculto" : ""}`}
              style={{ transform: `translate(${r.izquierda}px, ${r.arriba}px)` }}
            >
              {r.nombre}
              {r.vacia && <small>Próximamente</small>}
            </span>
          ))}
          {graticula.lats.map((lat) => {
            const y = px(0, proyectar(datos.proyeccion, 0, lat)[1])[1];
            if (!H || y < H * 0.04 || y > H * 0.9) return null;
            return (
              <span key={`lat${lat}`} aria-hidden="true" className="mapa-marca" style={{ transform: `translate(6px, ${Math.round(y - 9)}px)` }}>
                {formatearGrados(lat)}N
              </span>
            );
          })}
          {graticula.lons.map((lon) => {
            const x = px(proyectar(datos.proyeccion, lon, 0)[0], 0)[0];
            if (!W || x < W * 0.06 || x > W * 0.86) return null;
            return (
              <span key={`lon${lon}`} aria-hidden="true" className="mapa-marca" style={{ transform: `translate(${Math.round(x + 4)}px, 4px)` }}>
                {formatearGrados(lon)}O
              </span>
            );
          })}
          {pines.map((p) =>
            p.visible ? (
              <Link
                key={p.slug}
                href={`/cafes/${p.cafe.slug}/`}
                aria-label={`Ver la ficha de ${p.cafe.nombre}, ${p.cafe.municipio}`}
                className={`mapa-pin pointer-events-auto ${p.lado === "izquierda" ? "mapa-pin--izquierda" : ""} ${p.lado === "compacto" ? "mapa-pin--compacto" : ""}`}
                style={{ transform: `translate(${p.izquierda}px, ${p.arriba}px)` }}
              >
                <span className="mapa-pin__punto" aria-hidden="true" />
                <span className="mapa-pin__nombre" aria-hidden="true">{p.nombre}</span>
              </Link>
            ) : null,
          )}
          {escala && (
            <div className="mapa-escala" aria-hidden="true" style={{ ["--ancho-escala" as string]: `${escala.anchoPx}px` }}>
              <span className="mapa-escala__barra"><i /><i /></span>
              <span className="mapa-escala__marcas"><span>0</span><span>{escala.km / 2}</span><span>{escala.km} km</span></span>
            </div>
          )}
        </div>

        {elegidas.length > 0 && (
          <div className="absolute right-3 top-3">
            <Boton tamano="sm" variante="secundario" className="!bg-surface-raised" onClick={f.quitarProvincias}>
              Ver todo Santander
            </Boton>
          </div>
        )}
      </div>

      {provinciaAbierta && (
        <div data-mapa-interactivo>
          <TarjetaProvincia
            provincia={provinciaAbierta}
            cafes={cafesPorProvincia.get(provinciaAbierta.slug) ?? []}
            elegida={elegidas.includes(provinciaAbierta.slug)}
            ancla={ancla}
            comoHoja={comoHoja}
            alCerrar={cerrar}
            alVerCafes={() => verCafes(provinciaAbierta.slug)}
            alAlternar={() => f.alternarProvincia(provinciaAbierta.slug)}
            alEntrar={() => clearTimeout(temporizador.current)}
            alSalir={cerrarPronto}
          />
        </div>
      )}
    </div>
  );
}
