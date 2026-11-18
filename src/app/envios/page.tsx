import type { Metadata } from "next";
import { Fragment } from "react";
import { formatearCOP } from "@/domain/comun/dinero";
import { fechaEnLetras } from "@/domain/comun/fecha";
import { slugify } from "@/domain/comun/slug";
import { coberturaPorZona } from "@/domain/envio/envio";
import { ANCLA_ENVIO_GRATIS, avisoTerminacion, notaVigenciaTerminada, TEXTOS_ENVIO_GRATIS } from "@/domain/envio/envio-gratis";
import { EMPAQUE_G, ESCALONES_KG, type TarifaEnvio } from "@/domain/envio/tipos";
import { leyendaIvaTarifas } from "@/domain/pedido/iva";
import { formatearWhatsapp } from "@/domain/pedido/mensaje-whatsapp";
import { DOCUMENTOS_LEGALES } from "@/infrastructure/legal/legal-md";
import { BotonEnlace } from "@/ui/componentes/marca/boton";
import { Migas } from "@/ui/componentes/ficha/ficha-cafe";
import { DocumentoLegal } from "@/ui/componentes/layout/documento-legal";
import { canonica, cargarCatalogo, repositorioContenido } from "../_datos/catalogo";

const D3 = DOCUMENTOS_LEGALES["envios-devoluciones"];

export const metadata: Metadata = {
  title: D3.titulo,
  description: "Cómo calculamos el envío de tu pedido: zonas, tarifas por peso con IVA incluido y plazos de entrega desde Bucaramanga; retracto, devoluciones y garantía.",
  alternates: { canonical: canonica("/envios/") },
};

const MEDIOS: Record<string, string> = { mensajero: "Mensajero", transportadora: "Transportadora", transportadora_o_472: "Transportadora" };

/** Numeral de D3 antes del cual va la tabla de tarifas y municipios (después del numeral 3, «Cuánto cuesta el envío»). */
const NUMERAL_DESPUES_DE_TARIFAS = 4;
/** Numeral 13 de D3: condiciones del envío gratis; su título lleva el ancla #envio-gratis (LEG-167). */
const NUMERAL_ENVIO_GRATIS = 13;

/** Une con comas; si algún nombre ya lleva coma (San Andrés, Providencia…), con punto y coma. */
const lista = (items: string[]) => items.join(items.some((i) => i.includes(",")) ? "; " : ", ");

/**
 * /envios/ publica D3 «Envíos, devoluciones, retracto y garantía» del paquete del abogado v1.0, letra por letra
 * (LEG-141), con la tabla de tarifas y la lista de municipios de cada zona generadas de los CSV después del
 * numeral 3 (D3 §2: «La lista de municipios de cada zona está en esta página»). Los textos paralelos de antes
 * (plazos, retracto, «reclamar en oficina», 30 días) se retiraron: los dice D3 (LEG-164).
 */
export default async function PaginaEnvios() {
  const [catalogo, contenido] = await Promise.all([cargarCatalogo(), repositorioContenido.legal("envios-devoluciones")]);
  if (!contenido) throw new Error(`${D3.archivo}: no se pudo publicar /envios/.`);
  const { tarifas } = catalogo.envios;
  // Envío gratis por comunas: el numeral 13 es parte de D3 y se publica siempre; lo generado (nota de la tabla,
  // salvedad de la leyenda) solo con la promoción vigente el día del build.
  const promo = catalogo.envios.envioGratis;
  // Terminada (microcopy §8.6.1): el aviso y la nota de vigencia van al inicio del numeral 13.
  const fin = promo ? null : (catalogo.envios.finEnvioGratis ?? null);
  const clavePromo = promo ? slugify(promo.municipio) : null;
  const cobertura = coberturaPorZona(catalogo.envios);

  /** Qué abarca cada fila de la tabla, generado de zonas_envio.csv. */
  const cubre = (t: TarifaEnvio): string => {
    const c = cobertura.find((x) => x.zona === t.zona)!;
    if (t.zona === 1 || t.zona === 2) return t.nombre;
    if (t.zona === 3) return `${t.nombre}: ${lista(c.municipios)}`;
    if (t.zona === 4) return `${t.nombre}, incluidas ${lista(cobertura[4].excepciones)}`;
    return `${lista(c.departamentos)}; ${lista(c.municipios)}. No incluye ${lista(c.excepciones)}`;
  };

  const tablaTarifas = (
    <section aria-labelledby="tarifas-por-zona" className="!mt-10 rounded-lg bg-surface-sunken p-5" data-testid="bloque-tarifas">
      <h3 id="tarifas-por-zona" className="body font-bold text-ink-title">Tarifas por zona y municipios de cada zona</h3>
      <p className="body mt-2 text-ink-muted">
        El peso incluye las bolsas más {EMPAQUE_G} g de empaque, y el escalón también lo cuenta: hasta 1 kg de café paga el escalón de 1 kg, hasta 2 kg el de 2 kg y hasta 5 kg el de 5 kg. Una bolsa suelta, dos de 250 g o dos de 500 g pagan el escalón de 1 kg.
      </p>
      {/* M8: por debajo de lg, una tarjeta por zona con los mismos datos, orden y textos que la tabla (LEG-183). */}
      <ul aria-label="Tarifas de envío por zona" className="mt-4 space-y-3 lg:hidden" data-testid="tarjetas-envios">
        {tarifas.map((t) => (
          <li key={t.clave} className="rounded-lg border border-line bg-surface p-4" data-testid={`tarjeta-zona-${t.clave}`}>
            <h4 className="body font-bold text-ink-title">Zona {t.zona}</h4>
            {t.zona === 1 || t.zona === 2 ? (
              <p className="small mt-1 text-ink" data-testid="cubre">{cubre(t)}</p>
            ) : (
              <details className="mt-1">
                <summary className="small flex min-h-11 cursor-pointer items-center font-bold text-ink-title underline underline-offset-4">
                  Qué cubre la zona {t.zona}
                </summary>
                <p className="small pb-2 text-ink" data-testid="cubre">{cubre(t)}</p>
              </details>
            )}
            <p className="small text-ink-muted">{MEDIOS[t.medio] ?? t.medio}</p>
            {t.clave === clavePromo && (
              <a href={`#${ANCLA_ENVIO_GRATIS}`} className="small mt-1 block text-ink-muted underline underline-offset-4" data-testid="nota-envio-gratis-tarjeta">
                {TEXTOS_ENVIO_GRATIS.notaTabla}
              </a>
            )}
            {t.escalones ? (
              <dl className="small mt-3 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-t border-line pt-3">
                {t.escalones.map((valor, i) => (
                  <Fragment key={i}>
                    <dt className="text-ink-muted">Hasta {ESCALONES_KG[i]} kg</dt>
                    <dd className="text-right font-semibold tabular-nums text-ink">{formatearCOP(valor)}</dd>
                  </Fragment>
                ))}
              </dl>
            ) : (
              <p className="small mt-3 border-t border-line pt-3 font-semibold text-ink">Por cotizar por WhatsApp antes de que pagues</p>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-4 hidden overflow-x-auto rounded-lg border border-line bg-surface lg:block" role="region" aria-label="Tarifas de envío" tabIndex={0}>
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
                    <a href={`#${ANCLA_ENVIO_GRATIS}`} className="mt-1 block text-ink-muted underline underline-offset-4" data-testid="nota-envio-gratis-tabla">
                      {TEXTOS_ENVIO_GRATIS.notaTabla}
                    </a>
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
      {/* Leyenda de IVA pegada a la tabla (diseño #12). */}
      <p className="small mt-3 text-ink-muted" data-testid="leyenda-iva">{leyendaIvaTarifas(catalogo.tienda.ivaTarifa, promo ? TEXTOS_ENVIO_GRATIS.salvedadTarifas : "")}</p>
      {/* Información adicional, no contradice D3 (LEG-164, Baja: decide el dueño si se conserva). */}
      <p className="small mt-3 text-ink-muted" data-testid="pedido-minimo">
        Sugerimos pedir al menos 2 bolsas de 250 g o 1 de 500 g: una bolsa suelta paga el envío del escalón de 1 kg. Es solo una recomendación; puedes pedir lo que quieras.
      </p>
    </section>
  );

  const avisoFin = fin && (
    <>
      <p className="body" data-testid="aviso-terminacion-envios">{avisoTerminacion(fin)}</p>
      <p className="body" data-testid="nota-vigencia-terminada">{notaVigenciaTerminada(fin)}</p>
    </>
  );

  return (
    <article className="bg-surface px-5 py-10 md:px-8 md:py-16">
      <div className="mx-auto max-w-3xl">
        <Migas items={[{ texto: "Inicio", href: "/" }, { texto: "Envíos" }]} />
        <h1 className="display-l mt-6 text-balance text-ink-title max-md:!text-[36px] max-md:!leading-[42px]">{D3.titulo}</h1>
        {/* LEG-142: versión y fecha de los términos (D3 los complementa), de data/config.csv. */}
        <p className="caption mt-2 text-ink-muted" data-testid="rotulo-legal">
          Versión {contenido.version} · vigente desde el {fechaEnLetras(contenido.vigenteDesde)}
        </p>
        <DocumentoLegal
          bloques={contenido.contenido}
          enlazarVendedor
          ids={{ [NUMERAL_ENVIO_GRATIS]: ANCLA_ENVIO_GRATIS }}
          antesDeNumeral={{ [NUMERAL_DESPUES_DE_TARIFAS]: tablaTarifas }}
          alInicioDeNumeral={avisoFin ? { [NUMERAL_ENVIO_GRATIS]: avisoFin } : {}}
        />

        <div className="mt-12 max-w-[68ch] rounded-lg bg-surface-sunken p-6">
          <p className="body-l">¿Tu destino es de zona 5 o pides más de 5 kg?</p>
          <p className="body mt-1 text-ink-muted" data-testid="caja-cotizar">
            Escríbenos al {formatearWhatsapp(catalogo.tienda.whatsapp)} y te cotizamos.
          </p>
          <BotonEnlace href={`https://wa.me/${catalogo.tienda.whatsapp}`} className="mt-4" target="_blank" rel="noopener noreferrer">
            Escribir por WhatsApp
          </BotonEnlace>
        </div>
      </div>
    </article>
  );
}
