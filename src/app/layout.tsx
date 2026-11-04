import type { Metadata } from "next";
import localFont from "next/font/local";
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

export const metadata: Metadata = {
  title: "De Santander · Café de origen",
  description:
    "De Santander: café de especialidad de marca propia, organizado por provincias de Santander, Colombia. Elige en el mapa, arma tu pedido y envíalo por WhatsApp.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" data-theme="light" className={`${fraunces.variable} ${montserrat.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
