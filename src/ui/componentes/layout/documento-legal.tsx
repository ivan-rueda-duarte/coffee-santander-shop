import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { slugify } from "@/domain/comun/slug";
import type { BloqueEstructurado } from "@/domain/marca/reglas-texto";

// Cuerpo de un documento legal publicado letra por letra (docs/legal/, paquete del abogado v1.0): índice de anclas,
// subtítulos, párrafos y listas. Lo usan /legal/[slug]/ y /envios/ (D3, LEG-141), con los mismos estilos de siempre.

type Bloque = { tipo: "titulo"; texto: string; id: string; numeral: number | null } | { tipo: "parrafo"; texto: string } | { tipo: "lista"; numerada: boolean; items: string[] };

/** Con más de cinco títulos el documento lleva índice de anclas (diseño, páginas legales). */
const MINIMO_TITULOS_INDICE = 6;

/** «13. Envío gratis…» → 13. */
const numeralDe = (titulo: string): number | null => {
  const m = /^(\d+)\.\s/.exec(titulo);
  return m ? Number(m[1]) : null;
};

/** Junta los elementos de lista seguidos en una sola lista y da a cada título un id único para las anclas. */
function agrupar(bloques: readonly BloqueEstructurado[], ids: Readonly<Record<number, string>>): Bloque[] {
  const salida: Bloque[] = [];
  const usados = new Set<string>();
  for (const b of bloques) {
    const ultimo = salida[salida.length - 1];
    if (b.tipo === "titulo") {
      const numeral = numeralDe(b.texto);
      const base = (numeral !== null && ids[numeral]) || slugify(b.texto) || "seccion";
      let id = base;
      for (let n = 2; usados.has(id); n++) id = `${base}-${n}`;
      usados.add(id);
      salida.push({ tipo: "titulo", texto: b.texto, id, numeral });
    } else if (b.tipo === "parrafo") salida.push({ tipo: "parrafo", texto: b.texto });
    else if (ultimo?.tipo === "lista" && ultimo.numerada === Boolean(b.numerada)) ultimo.items.push(b.texto);
    else salida.push({ tipo: "lista", numerada: Boolean(b.numerada), items: [b.texto] });
  }
  return salida;
}

/** Convierte «Información del vendedor» en enlace a /legal/vendedor/. */
function conEnlaceVendedor(texto: string, activo: boolean) {
  const clave = "Información del vendedor";
  const i = texto.indexOf(clave);
  if (!activo || i < 0) return texto;
  return (
    <>
      {texto.slice(0, i)}
      <Link href="/legal/vendedor/" className="underline underline-offset-4">{clave}</Link>
      {texto.slice(i + clave.length)}
    </>
  );
}

export function DocumentoLegal({
  bloques,
  enlazarVendedor = false,
  ids = {},
  alInicioDeNumeral = {},
  antesDeNumeral = {},
}: {
  bloques: readonly BloqueEstructurado[];
  /** Enlaza «Información del vendedor» dentro del texto. */
  enlazarVendedor?: boolean;
  /** Ids fijos para algunos numerales (D3 numeral 13 → «envio-gratis»). */
  ids?: Readonly<Record<number, string>>;
  /** Contenido generado (no legal) justo después del título de un numeral. */
  alInicioDeNumeral?: Readonly<Record<number, ReactNode>>;
  /** Contenido generado (tablas de los CSV) justo antes del título de un numeral. */
  antesDeNumeral?: Readonly<Record<number, ReactNode>>;
}) {
  const grupos = agrupar(bloques, ids);
  const indice = grupos.filter((b): b is Extract<Bloque, { tipo: "titulo" }> => b.tipo === "titulo");
  return (
    <>
      {indice.length >= MINIMO_TITULOS_INDICE && (
        <nav aria-labelledby="indice-legal" className="mt-8 max-w-[68ch] rounded-lg bg-surface-raised p-5 [overflow-wrap:anywhere]" data-testid="indice-legal">
          <h2 id="indice-legal" className="small font-bold! text-ink-title">En este documento</h2>
          <ol className="small mt-2 space-y-1">
            {indice.map((t) => (
              <li key={t.id}>
                <a className="inline-block py-1 underline underline-offset-4" href={`#${t.id}`}>{t.texto}</a>
              </li>
            ))}
          </ol>
        </nav>
      )}
      {/* Columna de lectura de 68 caracteres; overflow-wrap para que el correo y las direcciones no desborden a 320 px (QA-007). */}
      <div className="body-l mt-8 max-w-[68ch] space-y-4 [overflow-wrap:anywhere]">
        {grupos.map((b, i) =>
          b.tipo === "titulo" ? (
            <Fragment key={i}>
              {b.numeral !== null && antesDeNumeral[b.numeral]}
              <h2 id={b.id} className="h3 !mt-10 scroll-mt-24 text-ink-title">{b.texto}</h2>
              {b.numeral !== null && alInicioDeNumeral[b.numeral]}
            </Fragment>
          ) : b.tipo === "lista" ? (
            b.numerada ? (
              <ol key={i} className="ml-5 list-decimal space-y-1">{b.items.map((x) => <li key={x}>{conEnlaceVendedor(x, enlazarVendedor)}</li>)}</ol>
            ) : (
              <ul key={i} className="ml-5 list-disc space-y-1">{b.items.map((x) => <li key={x}>{conEnlaceVendedor(x, enlazarVendedor)}</li>)}</ul>
            )
          ) : (
            <p key={i}>{conEnlaceVendedor(b.texto, enlazarVendedor)}</p>
          ),
        )}
      </div>
    </>
  );
}
