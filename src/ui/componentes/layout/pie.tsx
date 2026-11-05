import Link from "next/link";
import type { ConfigTienda } from "@/domain/pedido/tienda";
import { vendedorCompleto } from "@/domain/pedido/tienda";
import { formatearWhatsapp } from "@/domain/pedido/mensaje-whatsapp";
import { Franja, Textura } from "../marca/superficies";
import { Marca } from "./encabezado";

const LEGALES = [
  { href: "/legal/terminos/", texto: "Términos y condiciones" },
  { href: "/legal/privacidad/", texto: "Tratamiento de datos" },
  { href: "/legal/envios-devoluciones/", texto: "Envíos, devoluciones y retracto" },
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
            <p className="body mt-4 max-w-xs text-ink-muted">Café de especialidad de marca propia, de provincias de Santander, Colombia.</p>
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
            <ul className="mt-2 space-y-2">
              {LEGALES.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="underline-offset-4 hover:underline">
                    {l.texto}
                  </Link>
                </li>
              ))}
            </ul>
            {vendedorCompleto(v) && (
              <address className="mt-4 text-ink-muted not-italic">
                {v.razonSocial} · NIT {v.nit}
                <br />
                {v.domicilio}
                <br />
                <a href={`mailto:${v.correoContacto}`} className="underline underline-offset-4">
                  {v.correoContacto}
                </a>
              </address>
            )}
          </div>
        </div>
        <p className="mx-auto max-w-6xl px-5 pb-6 text-xs text-ink-muted md:px-8">© {anio} De Santander. Precios en pesos colombianos.</p>
      </Textura>
      <Franja />
    </footer>
  );
}
