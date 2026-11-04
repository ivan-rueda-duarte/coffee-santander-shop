import type { Metadata } from "next";
import { SeccionCatalogo } from "@/ui/componentes/catalogo/seccion-catalogo";
import { canonica, cargarCatalogo } from "../_datos/catalogo";

export const metadata: Metadata = {
  title: "Cafés",
  description: "Todos los cafés de De Santander, con filtros por provincia, municipio, proceso, variedad, tueste, perfil de taza y altitud.",
  alternates: { canonical: canonica("/cafes/") },
};

export default async function PaginaCafes() {
  const catalogo = await cargarCatalogo();
  return <SeccionCatalogo cafes={catalogo.cafes} provincias={catalogo.provincias} />;
}
