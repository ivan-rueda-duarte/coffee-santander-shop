import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Pie } from "@/ui/componentes/layout/pie";
import { cargarCatalogo, cargarCatalogoNavegador, URL_SITIO } from "./_datos/catalogo";
import { Proveedores } from "./proveedores";
import "./globals.css";

const fraunces = localFont({
  src: [
    { path: "./fonts/Fraunces-Variable.woff2", style: "normal", weight: "100 900" },
    { path: "./fonts/Fraunces-Italic-Variable.woff2", style: "italic", weight: "100 900" },
  ],
  variable: "--font-fraunces",
  display: "swap",
});

// Sin la itálica de Montserrat (≈ 40 KB precargados en cada página): la única itálica de la marca es la de Fraunces
// (remate de titulares, citas y notas de cata). Si algún texto en Montserrat pidiera itálica, el navegador la sintetizaría.
const montserrat = localFont({
  src: [{ path: "./fonts/Montserrat-Variable.woff2", style: "normal", weight: "100 900" }],
  variable: "--font-montserrat",
  display: "swap",
});

// Modelo C (docs/legal/microcopy-legal.md §2): tienda de café de otras marcas, no como marca.
const DESCRIPCION =
  "De Santander: tienda de café de origen de provincias de Santander, Colombia. Elige por provincia, arma tu pedido y envíalo por WhatsApp.";

export const metadata: Metadata = {
  metadataBase: URL_SITIO ? new URL(URL_SITIO) : undefined,
  title: { default: "De Santander · Café de origen", template: "%s · De Santander" },
  description: DESCRIPCION,
  openGraph: { siteName: "De Santander", locale: "es_CO", type: "website", title: "De Santander · Café de origen", description: DESCRIPCION },
};

// Sin viewportFit: "cover" (M2): con «cover», en un iPhone de lado el contenido entra bajo la muesca y cada bloque a sangre
// (encabezado, portada, pie, franja) necesitaría safe-area-inset-left/right. La barra «Tu pedido» y su espaciador ya suman
// env(safe-area-inset-bottom), que vale 0 sin «cover»: si algún día se declara, quedan listos.
export const viewport: Viewport = { themeColor: "#f7f1e6" };

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [catalogo, catalogoNavegador] = await Promise.all([cargarCatalogo(), cargarCatalogoNavegador()]);
  return (
    <html lang="es" data-theme="light" className={`${fraunces.variable} ${montserrat.variable}`}>
      <body className="min-h-screen">
        <Proveedores catalogo={catalogoNavegador}>
          <main id="contenido">{children}</main>
          <Pie tienda={catalogo.tienda} anio={new Date().getFullYear()} />
        </Proveedores>
      </body>
    </html>
  );
}
