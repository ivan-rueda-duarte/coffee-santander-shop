import type { Metadata } from "next";
import { formatearCOP } from "@/domain/comun/dinero";
import { coberturaPorZona } from "@/domain/envio/envio";
import { EMPAQUE_G, type TarifaEnvio, type Zona } from "@/domain/envio/tipos";
import { formatearWhatsapp } from "@/domain/pedido/mensaje-whatsapp";
import { BotonEnlace } from "@/ui/componentes/marca/boton";
import { Antetitulo } from "@/ui/componentes/marca/etiquetas";
import { Migas } from "@/ui/componentes/ficha/ficha-cafe";
import { Titular } from "@/ui/componentes/layout/secciones-inicio";
import { canonica, cargarCatalogo } from "../_datos/catalogo";

export const metadata: Metadata = {
  title: "Envíos",
  description: "Cómo calculamos el envío de tu pedido: zonas, tarifas por peso y plazos orientativos desde Bucaramanga.",
  alternates: { canonical: canonica("/envios/") },
};

// Plazos orientativos de docs/ENVIOS.md §6. Pendiente de confirmar con el agregador (docs/PENDIENTES.md).
const PLAZOS: Record<Zona, string> = {
  1: "Mismo día o siguiente día hábil",
  2: "1 a 3 días hábiles",
  3: "1 a 3 días hábiles",
  4: "2 a 6 días hábiles",
  5: "5 a 12 días hábiles, con entrega en la oficina de la transportadora",
};

const MEDIOS: Record<string, string> = { mensajero: "Mensajero", transportadora: "Transportadora", transportadora_o_472: "Transportadora" };

/** Une con comas; si algún nombre ya lleva coma (San Andrés, Providencia…), con punto y coma. */
const lista = (items: string[]) => items.join(items.some((i) => i.includes(",")) ? "; " : ", ");

export default async function PaginaEnvios() {
  const catalogo = await cargarCatalogo();
  const { tarifas } = catalogo.envios;
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
          El peso incluye las bolsas más {EMPAQUE_G} g de empaque, y se cobra el primer escalón que lo cubre. Una bolsa suelta paga como 1 kg; dos bolsas de 250 g también.
        </p>
        <div className="mt-6 overflow-x-auto rounded-lg border border-line">
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
                  <th scope="row" className="px-4 py-3 align-top font-bold text-ink-title">Zona {t.zona}</th>
                  <td className="px-4 py-3 align-top">
                    {cubre(t)}
                    <span className="mt-1 block text-ink-muted">{MEDIOS[t.medio] ?? t.medio}</span>
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
        <p className="caption mt-3 text-ink-muted">Precios en pesos colombianos. Más de 5 kg, en cualquier zona, se cotiza aparte. Nunca cobramos primero y ajustamos después.</p>

        <h2 className="h3 mt-12 text-ink-title">Plazos orientativos</h2>
        <p className="body mt-2 max-w-2xl text-ink-muted">Son una referencia, no una fecha de entrega: dependen de la transportadora, del destino y de cuándo se confirme el pago.</p>
        <dl className="mt-4 divide-y divide-line border-y border-line text-sm">
          {([1, 2, 3, 4, 5] as Zona[]).map((zona) => (
            <div key={zona} className="grid gap-1 py-3 sm:grid-cols-[8rem_1fr] sm:gap-4">
              <dt className="font-bold text-ink-title">Zona {zona}</dt>
              <dd>{PLAZOS[zona]}</dd>
            </div>
          ))}
        </dl>

        <h2 className="h3 mt-12 text-ink-title">Si no hay reparto a domicilio</h2>
        <p className="body mt-2 max-w-2xl">
          En municipios sin reparto a domicilio, la guía de la transportadora puede cerrar en «reclamar en oficina»: en ese caso hay que reclamar el pedido en la oficina de la transportadora.
        </p>

        <h2 className="h3 mt-12 text-ink-title">Pedido mínimo sugerido</h2>
        <p className="body mt-2 max-w-2xl">
          Sugerimos pedir al menos 2 bolsas de 250 g o 1 de 500 g: una bolsa suelta paga el envío como 1 kg. Es solo una recomendación; puedes pedir lo que quieras.
        </p>

        <div className="mt-10 rounded-lg bg-surface-sunken p-6">
          <p className="body-l">¿Tu destino no aparece o pides más de 5 kg?</p>
          <p className="body mt-1 text-ink-muted">Escríbenos al {formatearWhatsapp(catalogo.tienda.whatsapp)} y te cotizamos.</p>
          <BotonEnlace href={`https://wa.me/${catalogo.tienda.whatsapp}`} className="mt-4" target="_blank" rel="noopener noreferrer">
            Escribir por WhatsApp
          </BotonEnlace>
        </div>
      </div>
    </article>
  );
}
