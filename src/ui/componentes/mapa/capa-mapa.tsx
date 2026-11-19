import Link from "next/link";
import type { CSSProperties } from "react";
import type { Capa, CapaEstatica, MarcaCapa, PinCapa, RotuloCapa, Variante } from "@/domain/mapa/capa";

// Piezas de la capa de textos del mapa. Las usan la capa estática (HTML del build, posiciones en % del contenedor)
// y la capa del navegador (posiciones en px medidas), así que el marcado es el mismo en las dos.

/** Textos en HTML para que conserven su tamaño con cualquier encuadre. */
const CLASE_CAPA = "pointer-events-none absolute inset-0";

function Rotulo({ r, style, t, c }: { r: RotuloCapa; style: CSSProperties; t?: string; c?: string }) {
  return (
    <span aria-hidden="true" data-t={t} data-c={c} className={`mapa-rotulo ${r.oculto ? "mapa-rotulo--oculto" : ""}`} style={style}>
      {r.nombre}
      {r.vacia && <small>Próximamente</small>}
    </span>
  );
}

function Marca({ m, style, t }: { m: MarcaCapa; style: CSSProperties; t?: string }) {
  return (
    <span aria-hidden="true" data-t={t} className="mapa-marca" style={style}>
      {m.texto}
    </span>
  );
}

function Pin({ p, style, t, c, precargar }: { p: PinCapa; style: CSSProperties; t?: string; c?: string; precargar?: false }) {
  return (
    <Link
      href={`/cafes/${p.cafe.slug}/`}
      prefetch={precargar}
      aria-label={`Ver la ficha de ${p.cafe.nombre}, ${p.cafe.municipio}`}
      data-t={t}
      data-c={c}
      className={`mapa-pin pointer-events-auto ${p.lado === "izquierda" ? "mapa-pin--izquierda" : ""} ${p.lado === "compacto" ? "mapa-pin--compacto" : ""}`}
      style={style}
    >
      <span className="mapa-pin__punto" aria-hidden="true" />
      <span className="mapa-pin__nombre" aria-hidden="true">{p.nombre}</span>
    </Link>
  );
}

function Escala({ km, ancho, t }: { km: number; ancho: string; t?: string }) {
  return (
    <div className="mapa-escala" aria-hidden="true" data-t={t} style={{ ["--ancho-escala" as string]: ancho }}>
      <span className="mapa-escala__barra"><i /><i /></span>
      <span className="mapa-escala__marcas"><span>0</span><span>{km / 2}</span><span>{km} km</span></span>
    </div>
  );
}

const desplazar = (x: number, y: number): CSSProperties => ({ transform: `translate(${x}px, ${y}px)` });

/**
 * Capa del navegador: posiciones en píxeles para el encuadre y el tamaño medidos. Los pines y rótulos de `adoptados`
 * (slug del café; nombre de la provincia) no se pintan aquí: son los del HTML, que la interacción mueve sin
 * desmontarlos para no perder el foco de teclado (QA-037).
 */
export function CapaMedida({ capa, adoptados }: { capa: Capa; adoptados: { pines: ReadonlySet<string>; rotulos: ReadonlySet<string> } }) {
  return (
    <div className={CLASE_CAPA}>
      {capa.rotulos.map((r) => (adoptados.rotulos.has(r.nombre) ? null : <Rotulo key={r.slug} r={r} style={desplazar(r.izquierda, r.arriba)} />))}
      {capa.marcasLat.map((m) => <Marca key={m.clave} m={m} style={desplazar(6, m.px)} />)}
      {capa.marcasLon.map((m) => <Marca key={m.clave} m={m} style={desplazar(m.px, 4)} />)}
      {capa.pines.map((p) => (p.visible && !adoptados.pines.has(p.cafe.slug) ? <Pin key={p.slug} p={p} style={desplazar(p.izquierda, p.arriba)} /> : null))}
      {capa.escala && <Escala km={capa.escala.km} ancho={`${capa.escala.anchoPx}px`} />}
    </div>
  );
}

const pc = (f: number) => `${+(f * 100).toFixed(4)}%`;
const lista = (tramos: number[] | null) => tramos?.join(" ");

/** Agrupa las variantes de cada elemento (rótulo o pin) por su slug, en el orden de la capa. */
function porSlug<T extends { slug: string }>(vs: Variante<T>[]): Variante<T>[][] {
  const m = new Map<string, Variante<T>[]>();
  for (const v of vs) m.set(v.valor.slug, [...(m.get(v.valor.slug) ?? []), v]);
  return [...m.values()];
}

/** Variante de un elemento en el tramo `i` (o ninguna: ahí no se ve). */
const enTramo = <T,>(vs: Variante<T>[], i: number) => vs.find((v) => v.tramos === null || v.tramos.includes(i))?.valor;

/**
 * Capa del HTML estático: el departamento completo, sin medir. Las posiciones van en % del contenedor más los
 * márgenes fijos en px, igual que la capa del navegador. Lo que cambia con el ancho se resuelve con consultas de
 * contenedor: un rótulo que baja o sube para no chocar y un pin que pasa su nombre de un lado al otro son UN solo
 * elemento cuyas variables (--d, --v, --px, --pd) fija cada tramo; solo lo que cambia de forma (pin compacto,
 * marcas, escala) va repetido y se ve en su tramo (data-t). Los límites van medio píxel antes porque el navegador
 * calcula su capa con `clientWidth`, que redondea el ancho.
 */
export function CapaFija({ capa }: { capa: CapaEstatica }) {
  const reglas: string[][] = capa.tramos.map(() => []);
  const unico = (vs: Variante<unknown>[]) => vs.length === 1 && vs[0].tramos === null;

  const rotulos = porSlug<RotuloCapa>(capa.rotulos).map((vs) => {
    const r = vs[0].valor;
    // El corrimiento horizontal (QA-032) solo entra en el estilo del rótulo que lo usa en algún tramo.
    const corre = vs.some((v) => v.valor.desplazamientoX !== 0);
    const izquierda = (dx: string) => ({ left: `clamp(4px, calc(${pc(r.fx)} - ${r.ancho / 2}px${dx}), calc(100% - ${r.ancho + 4}px))` });
    if (unico(vs))
      return <Rotulo key={r.slug} r={r} style={{ ...izquierda(corre ? ` + ${r.desplazamientoX}px` : ""), top: `calc(${pc(r.fy)} + ${r.desplazamiento - r.alto / 2}px)` }} />;
    const base = izquierda(corre ? " + var(--dx, 0px)" : "");
    capa.tramos.forEach((_, i) => {
      const v = enTramo(vs, i);
      reglas[i].push(`[data-c="r-${r.slug}"]{${v ? `--d:${v.desplazamiento - r.alto / 2}px${corre ? `;--dx:${v.desplazamientoX}px` : ""}` : "--v:hidden"}}`);
    });
    return <Rotulo key={r.slug} r={r} c={`r-${r.slug}`} style={{ ...base, top: `calc(${pc(r.fy)} + var(--d, ${-r.alto / 2}px))`, visibility: "var(--v, visible)" as CSSProperties["visibility"] }} />;
  });

  const izquierdaPx = (p: PinCapa) => (p.lado === "izquierda" ? p.ancho - 13 : 13);
  const pines = porSlug<PinCapa>(capa.pines).flatMap((vs) => {
    const p = vs[0].valor;
    const top = `calc(${pc(p.fy)} - ${p.alto / 2}px)`;
    // Sin precarga al entrar en pantalla: en escritorio el mapa está en la primera pantalla y la ficha contaría
    // en el JS inicial (QA-018). Los pines de la capa medida, que llega con la interacción, sí precargan.
    if (unico(vs)) return [<Pin key={p.slug} p={p} precargar={false} style={{ left: `calc(${pc(p.fx)} - ${izquierdaPx(p)}px)`, top }} />];
    if (vs.some((v) => v.valor.lado === "compacto"))
      return vs.map(({ valor: q, tramos }) => (
        <Pin key={`${q.slug}:${q.lado}`} p={q} t={lista(tramos)} precargar={false} style={{ left: `calc(${pc(q.fx)} - ${izquierdaPx(q)}px)`, top }} />
      ));
    capa.tramos.forEach((_, i) => {
      const v = enTramo(vs, i);
      reglas[i].push(`[data-c="p-${p.slug}"]{${v ? `--px:${izquierdaPx(v)}px;--pd:${v.lado === "izquierda" ? "row-reverse" : "row"}` : "--v:hidden"}}`);
    });
    return [
      <Pin
        key={p.slug}
        p={{ ...p, lado: "derecha" }}
        c={`p-${p.slug}`}
        precargar={false}
        style={{ left: `calc(${pc(p.fx)} - var(--px, 13px))`, top, flexDirection: "var(--pd, row)" as CSSProperties["flexDirection"], visibility: "var(--v, visible)" as CSSProperties["visibility"] }}
      />,
    ];
  });

  const css =
    capa.tramos.length < 2
      ? ""
      : ".mapa-capa [data-t]{visibility:hidden}" +
        capa.tramos
          .map((t, i) => {
            const cond = [t.desde !== null && `(min-width:${t.desde - 0.5}px)`, t.hasta !== null && `(max-width:${t.hasta - 0.501}px)`].filter(Boolean).join(" and ");
            return `@container ${cond}{.mapa-capa [data-t~="${i}"]{visibility:visible}${reglas[i].map((r) => `.mapa-capa ${r}`).join("")}}`;
          })
          .join("");

  return (
    <div className={`${CLASE_CAPA} mapa-capa`}>
      {css && <style>{css}</style>}
      {rotulos}
      {capa.marcasLat.map(({ valor: m, tramos }) => <Marca key={m.clave} m={m} t={lista(tramos)} style={{ left: "6px", top: `calc(${pc(m.f)} - 9px)` }} />)}
      {capa.marcasLon.map(({ valor: m, tramos }) => <Marca key={m.clave} m={m} t={lista(tramos)} style={{ left: `calc(${pc(m.f)} + 4px)`, top: "4px" }} />)}
      {pines}
      {capa.escala.map(({ valor: e, tramos }) => <Escala key={e.km} km={e.km} t={lista(tramos)} ancho={`${+(e.fraccion * 100).toFixed(4)}cqw`} />)}
    </div>
  );
}
