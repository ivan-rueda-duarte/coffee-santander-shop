import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Pie } from "@/ui/componentes/layout/pie";
import { cargarCatalogo, URL_SITIO } from "./_datos/catalogo";
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

const montserrat = localFont({
  src: [
    { path: "./fonts/Montserrat-Variable.woff2", style: "normal", weight: "100 900" },
    { path: "./fonts/Montserrat-Italic-Variable.woff2", style: "italic", weight: "100 900" },
  ],
  variable: "--font-montserrat",
  display: "swap",
});

const DESCRIPCION =
  "De Santander: café de especialidad de marca propia, organizado por provincias de Santander, Colombia. Elige por provincia, arma tu pedido y envíalo por WhatsApp.";

export const metadata: Metadata = {
  metadataBase: URL_SITIO ? new URL(URL_SITIO) : undefined,
  title: { default: "De Santander · Café de origen", template: "%s · De Santander" },
  description: DESCRIPCION,
  openGraph: { siteName: "De Santander", locale: "es_CO", type: "website", title: "De Santander · Café de origen", description: DESCRIPCION },
};

export const viewport: Viewport = { themeColor: "#f7f1e6" };

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const catalogo = await cargarCatalogo();
  return (
    <html lang="es" data-theme="light" className={`${fraunces.variable} ${montserrat.variable}`}>
      <body className="min-h-screen">
        <Proveedores catalogo={catalogo}>
          <main id="contenido">{children}</main>
          <Pie tienda={catalogo.tienda} anio={new Date().getFullYear()} />
        </Proveedores>
      </body>
    </html>
  );
}
