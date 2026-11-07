import Link from "next/link";
import type { ConfigTienda } from "@/domain/pedido/tienda";
import { leyendaIvaPie } from "@/domain/pedido/iva";
import { formatearWhatsapp } from "@/domain/pedido/mensaje-whatsapp";
import { Franja, Textura } from "../marca/superficies";
import { Marca } from "./encabezado";

const LEGALES = [
  { href: "/legal/terminos/", texto: "Términos y condiciones" },
  { href: "/legal/privacidad/", texto: "Tratamiento de datos" },
  { href: "/legal/envios-devoluciones/", texto: "Envíos, devoluciones, retracto y garantía" },
  { href: "/legal/vendedor/", texto: "Información del vendedor" },
];

export function Pie({ tienda, anio }: { tienda: ConfigTienda; anio: number }) {
  const v = tienda.vendedor;
  return (
    <footer data-theme="dark">
      <Textura trama="oscuro" className="bg-surface text-ink">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.2fr_1fr_1fr] md:px-8">
          <div>
            <Marca pie />
            {/* Modelo C (microcopy §2): la tienda vende café de otras marcas; no se presenta como marca. */}
            <p className="body mt-4 max-w-xs text-ink-muted">Café de origen de provincias de Santander, Colombia.</p>
          </div>

          <dl className="space-y-4 text-sm">
            <div>
              <dt className="overline text-eyebrow">Pedidos</dt>
              <dd className="mt-1">
                <a className="font-semibold underline underline-offset-4" href={`https://wa.me/${tienda.whatsapp}`} target="_blank" rel="noopener noreferrer">
                  WhatsApp {formatearWhatsapp(tienda.whatsapp)}
                </a>
              </dd>
            </div>
            <div>
              <dt className="overline text-eyebrow">Envíos</dt>
              <dd className="mt-1 text-ink-muted">
                {tienda.notaEnvio}{" "}
                <Link href="/envios/" className="font-semibold text-ink underline underline-offset-4">
                  Zonas, tarifas y plazos
                </Link>
              </dd>
            </div>
            <div>
              <dt className="overline text-eyebrow">Pagos</dt>
              <dd className="mt-1 text-ink-muted">{tienda.formasPago.join(" · ")}</dd>
            </div>
          </dl>

          <div className="text-sm">
            <p className="overline text-eyebrow">Información legal</p>
            <ul className="mt-2 space-y-1">
              {LEGALES.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-block py-1 underline-offset-4 hover:underline">
                    {l.texto}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Vendedor (Ley 1480, art. 50 lit. a; microcopy §5.4): cada línea solo si el dato existe. Sin representante ni matrícula (LEG-085). */}
            {v.razonSocial && (
              <address className="mt-5 space-y-1 border-t border-line pt-4 text-ink-muted not-italic [overflow-wrap:anywhere]" data-testid="pie-vendedor">
                <p>{v.nit ? `${v.razonSocial} · NIT ${v.nit}` : v.razonSocial}</p>
                {v.domicilio && <p>Domicilio: {v.domicilio}</p>}
                {v.direccionNotificacion && <p>Notificaciones judiciales: {v.direccionNotificacion}</p>}
                {v.correoContacto && (
                  <p>
                    Correo de atención y de notificación judicial:{" "}
                    <a href={`mailto:${v.correoContacto}`} className="underline underline-offset-4">
                      {v.correoContacto}
                    </a>
                  </p>
                )}
                <p>WhatsApp {formatearWhatsapp(tienda.whatsapp)}</p>
              </address>
            )}
          </div>
        </div>
        {/* Microcopy §1.4: «© {anio} De Santander SAS. Precios en pesos colombianos, con IVA del 5 % incluido.» (sin tarifa: «con todos los impuestos incluidos»). */}
        <p className="mx-auto max-w-6xl px-5 pb-6 text-xs text-ink-muted md:px-8" data-testid="pie-copyright">
          © {anio} {v.razonSocial ?? tienda.nombre}. {leyendaIvaPie(tienda.ivaTarifa)}
        </p>
      </Textura>
      <Franja />
    </footer>
  );
}
