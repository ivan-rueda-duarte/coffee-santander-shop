import type { Metadata } from "next";
import Link from "next/link";
import { formatearCOP } from "@/domain/comun/dinero";
import { slugify } from "@/domain/comun/slug";
import { coberturaPorZona } from "@/domain/envio/envio";
import { ANCLA_ENVIO_GRATIS, comunasAlfabeticas, TEXTOS_ENVIO_GRATIS } from "@/domain/envio/envio-gratis";
import type { BloqueEstructurado } from "@/domain/marca/reglas-texto";
import { textoPlazoPagina } from "@/domain/envio/plazos";
import { EMPAQUE_G, type TarifaEnvio } from "@/domain/envio/tipos";
import { leyendaIvaTarifas } from "@/domain/pedido/iva";
import { formatearWhatsapp } from "@/domain/pedido/mensaje-whatsapp";
import { BotonEnlace } from "@/ui/componentes/marca/boton";
import { Antetitulo } from "@/ui/componentes/marca/etiquetas";
import { Migas } from "@/ui/componentes/ficha/ficha-cafe";
import { Titular } from "@/ui/componentes/layout/secciones-inicio";
import { canonica, cargarCatalogo, cargarCondicionesEnvioGratis } from "../_datos/catalogo";

export const metadata: Metadata = {
  title: "Envíos",
  description: "Cómo calculamos el envío de tu pedido: zonas, tarifas por peso con IVA incluido y plazos de entrega desde Bucaramanga.",
  alternates: { canonical: canonica("/envios/") },
};

const MEDIOS: Record<string, string> = { mensajero: "Mensajero", transportadora: "Transportadora", transportadora_o_472: "Transportadora" };

/** Párrafos y listas seguidas del numeral de condiciones, en el orden del documento. */
function agrupar(bloques: readonly BloqueEstructurado[]): ({ tipo: "parrafo"; texto: string } | { tipo: "lista"; items: string[] })[] {
  const salida: ({ tipo: "parrafo"; texto: string } | { tipo: "lista"; items: string[] })[] = [];
  for (const b of bloques) {
    const ultimo = salida[salida.length - 1];
    if (b.tipo === "item") {
      if (ultimo?.tipo === "lista") ultimo.items.push(b.texto);
      else salida.push({ tipo: "lista", items: [b.texto] });
    } else salida.push({ tipo: "parrafo", texto: b.texto });
  }
  return salida;
}

/** Une con comas; si algún nombre ya lleva coma (San Andrés, Providencia…), con punto y coma. */
const lista = (items: string[]) => items.join(items.some((i) => i.includes(",")) ? "; " : ", ");

export default async function PaginaEnvios() {
  const [catalogo, condiciones] = await Promise.all([cargarCatalogo(), cargarCondicionesEnvioGratis()]);
  const { tarifas, plazos } = catalogo.envios;
  // Envío gratis por comunas (diseño 2026-11-09 §5; microcopy §8.5): sin la promoción vigente, nada de esto se pinta.
  const promo = condiciones ? catalogo.envios.envioGratis : null;
  const clavePromo = promo ? slugify(promo.municipio) : null;
  const cobertura = coberturaPorZona(catalogo.envios);

  /** Qué abarca cada fila de la tabla, generado de zonas_envio.csv. */
  const cubre = (t: TarifaEnvio): string => {
    const c = cobertura.find((x) => x.zona === t.zona)!;
    if (t.zona === 1) return t.nombre;
    if (t.zona === 2) return t.nombre;
    if (t.zona === 3) return `${t.nombre}: ${lista(c.municipios)}`;
    if (t.zona === 4) return `${t.nombre}, incluidas ${lista(cobertura[4].excepciones)}`;
    return `${lista(c.departamentos)}; ${lista(c.municipios)}. No incluye ${lista(c.excepciones)}`;
  };

  return (
    <article className="bg-surface px-5 py-10 md:px-8 md:py-16">
      <div className="mx-auto max-w-4xl">
        <Migas items={[{ texto: "Inicio", href: "/" }, { texto: "Envíos" }]} />
        <Antetitulo className="mt-6">Envíos</Antetitulo>
        <Titular nivel="h1" antes={`Desde ${catalogo.tienda.ciudadDespacho}`} remate="a todo Colombia" className="display-l mt-2 text-ink-title max-md:!text-[36px] max-md:!leading-[42px]" />
        <p className="body-l mt-4 max-w-2xl">
          El envío se calcula por zona y por peso, y lo ves en tu pedido en cuanto eliges la ciudad. Pagas el valor que te mostramos; solo se cotiza aparte en zonas especiales y en pedidos de más de 5 kg.
        </p>

        <h2 className="h3 mt-12 text-ink-title">Tarifas por zona</h2>
        <p className="body mt-2 max-w-2xl text-ink-muted">
          El peso incluye las bolsas más {EMPAQUE_G} g de empaque, y el escalón también lo cuenta: hasta 1 kg de café paga el escalón de 1 kg, hasta 2 kg el de 2 kg y hasta 5 kg el de 5 kg. Una bolsa suelta, dos de 250 g o dos de 500 g pagan el escalón de 1 kg.
        </p>
        <div className="mt-6 overflow-x-auto rounded-lg border border-line" role="region" aria-label="Tarifas de envío" tabIndex={0}>
          <table className="w-full min-w-[44rem] border-collapse text-left text-sm" data-testid="tabla-envios">
            <caption className="sr-only">Tarifas de envío en pesos colombianos por zona y escalón de peso</caption>
            <thead className="bg-surface-sunken">
              <tr>
                <th scope="col" className="px-4 py-3 font-bold">Zona</th>
                <th scope="col" className="px-4 py-3 font-bold">Cubre</th>
                <th scope="col" className="px-4 py-3 text-right font-bold">Hasta 1 kg</th>
                <th scope="col" className="px-4 py-3 text-right font-bold">Hasta 2 kg</th>
                <th scope="col" className="px-4 py-3 text-right font-bold">Hasta 5 kg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {tarifas.map((t) => (
                <tr key={t.clave} data-testid={`tarifa-${t.clave}`}>
                  <th scope="row" className="whitespace-nowrap px-4 py-3 align-top font-bold text-ink-title">Zona {t.zona}</th>
                  <td className="px-4 py-3 align-top">
                    {cubre(t)}
                    <span className="mt-1 block text-ink-muted">{MEDIOS[t.medio] ?? t.medio}</span>
                    {t.clave === clavePromo && (
                      <Link href={`#${ANCLA_ENVIO_GRATIS}`} className="mt-1 block text-ink-muted underline underline-offset-4" data-testid="nota-envio-gratis-tabla">
                        {TEXTOS_ENVIO_GRATIS.notaTabla}
                      </Link>
                    )}
                  </td>
                  {t.escalones ? (
                    t.escalones.map((valor, i) => (
                      <td key={i} className="px-4 py-3 text-right align-top font-semibold tabular-nums">{formatearCOP(valor)}</td>
                    ))
                  ) : (
                    <td colSpan={3} className="px-4 py-3 text-right align-top font-semibold">Por cotizar por WhatsApp antes de que pagues</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Microcopy §1.4 y §1.7 (paquete legal v1): IVA incluido y comisión de recaudo dentro de la tarifa.
            Diseño #12: las dos aclaraciones de la tabla en el mismo nivel (small), la leyenda de IVA pegada a la tabla. */}
        <p className="small mt-3 max-w-2xl text-ink-muted" data-testid="leyenda-iva">{leyendaIvaTarifas(catalogo.tienda.ivaTarifa, promo ? TEXTOS_ENVIO_GRATIS.salvedadTarifas : "")}</p>
        <p className="small mt-2 max-w-2xl text-ink-muted" data-testid="comision-incluida">
          Si pagas contraentrega, la tarifa de envío de tu zona ya incluye la comisión de recaudo de la transportadora; no cobramos recargos adicionales.
        </p>

        {/* Microcopy §8.5: las condiciones completas son el numeral de «Envíos, devoluciones, retracto y garantía» v2,
            letra por letra (art. 33 de la Ley 1480). La lista de comunas sale de data/comunas_envio_gratis.csv. */}
        {promo && condiciones && (
          <section aria-labelledby={ANCLA_ENVIO_GRATIS} data-testid="seccion-envio-gratis">
            <h2 id={ANCLA_ENVIO_GRATIS} className="h3 mt-12 scroll-mt-24 text-ink-title">{TEXTOS_ENVIO_GRATIS.tituloSeccion}</h2>
            {agrupar(condiciones).map((b, i) =>
              b.tipo === "parrafo" ? (
                <div key={i}>
                  <p className="body mt-2 max-w-2xl text-ink-muted">{b.texto}</p>
                  {i === 0 && (
                    <ul className="body mt-4 grid gap-x-6 gap-y-1 rounded-lg border border-line bg-surface px-5 py-4 text-ink sm:grid-cols-2 md:grid-cols-3" aria-label="Comunas con envío gratis" data-testid="lista-comunas">
                      {comunasAlfabeticas(promo).map((c) => <li key={c}>{c}</li>)}
                    </ul>
                  )}
                </div>
              ) : (
                <ul key={i} className="body mt-4 max-w-2xl list-disc space-y-2 pl-5">
                  {b.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              ),
            )}
            <p className="body mt-4 max-w-2xl">
              Más en{" "}
              <Link className="font-semibold underline underline-offset-4" href="/legal/envios-devoluciones/">envíos, devoluciones, retracto y garantía</Link>.
            </p>
          </section>
        )}

        {/* Microcopy §5.8: plazos estimado y máximo por zona desde data/plazos_envio.csv (Ley 1480, art. 50 lit. h). */}
        <h2 className="h3 mt-12 text-ink-title">Plazos de entrega</h2>
        <p className="body mt-2 max-w-2xl text-ink-muted">
          El estimado es lo que suele tardar. El máximo es el plazo que nos comprometemos a cumplir. Los dos se cuentan en días hábiles desde que aceptas el total en el chat y, si pagas por transferencia Bre-B, desde que recibimos el pago. Si no entregamos en el máximo, puedes cancelar y te devolvemos todo en 15 días calendario.
        </p>
        <dl className="mt-4 divide-y divide-line border-y border-line text-sm">
          {plazos.map((p) => (
            <div key={p.zona} className="grid gap-1 py-3 sm:grid-cols-[8rem_1fr] sm:gap-4" data-testid={`plazo-zona-${p.zona}`}>
              <dt className="font-bold text-ink-title">Zona {p.zona}</dt>
              <dd>
                {textoPlazoPagina(p)}
                {promo && p.zona === 1 && TEXTOS_ENVIO_GRATIS.plazoZona1}
                {promo && p.zona === 5 && TEXTOS_ENVIO_GRATIS.plazoZona5}
              </dd>
            </div>
          ))}
        </dl>
        <p className="body mt-3 max-w-2xl text-ink-muted" data-testid="plazo-legal">Si no publicamos un plazo máximo para tu zona, entregamos en máximo 30 días calendario, como manda la ley.</p>

        <h2 className="h3 mt-12 text-ink-title">Si no hay reparto a domicilio</h2>
        <p className="body mt-2 max-w-2xl">
          En municipios sin reparto a domicilio, la guía de la transportadora puede cerrar en «reclamar en oficina»: en ese caso hay que reclamar el pedido en la oficina de la transportadora.
        </p>

        {/* Microcopy §5.3 (LEG-081): el retracto se concede; el texto es el del paquete legal v1. */}
        <h2 className="h3 mt-12 text-ink-title">Retracto</h2>
        <p className="body mt-2 max-w-2xl" data-testid="retracto-envios">
          Puedes retractarte dentro de los 5 días hábiles siguientes a la entrega, salvo si el empaque está abierto. El transporte de la devolución corre por tu cuenta. Te devolvemos el dinero en máximo 15 días calendario, por el medio de pago que prefieras. Más en{" "}
          <Link className="font-semibold underline underline-offset-4" href="/legal/envios-devoluciones/">envíos, devoluciones, retracto y garantía</Link>.
        </p>

        <h2 className="h3 mt-12 text-ink-title">Pedido mínimo sugerido</h2>
        <p className="body mt-2 max-w-2xl">
          Sugerimos pedir al menos 2 bolsas de 250 g o 1 de 500 g: una bolsa suelta paga el envío del escalón de 1 kg. Es solo una recomendación; puedes pedir lo que quieras.
        </p>

        <div className="mt-10 rounded-lg bg-surface-sunken p-6">
          <p className="body-l">¿Tu destino es de zona 5 o pides más de 5 kg?</p>
          <p className="body mt-1 text-ink-muted">Escríbenos al {formatearWhatsapp(catalogo.tienda.whatsapp)} y te cotizamos.</p>
          <BotonEnlace href={`https://wa.me/${catalogo.tienda.whatsapp}`} className="mt-4" target="_blank" rel="noopener noreferrer">
            Escribir por WhatsApp
          </BotonEnlace>
        </div>

        <p className="body mt-10">
          <Link className="font-semibold underline underline-offset-4" href="/legal/envios-devoluciones/">Lee la política completa de envíos, devoluciones, retracto y garantía.</Link>
        </p>
      </div>
    </article>
  );
}
