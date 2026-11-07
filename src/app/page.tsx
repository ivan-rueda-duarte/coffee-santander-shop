import { SeccionCatalogo } from "@/ui/componentes/catalogo/seccion-catalogo";
import { ComoPedir, Historia, Portada } from "@/ui/componentes/layout/secciones-inicio";
import { SeccionMapa } from "@/ui/componentes/mapa/seccion-mapa";
import datosMapa from "@/data/mapa-santander.json";
import { cargarCatalogo, repositorioContenido } from "./_datos/catalogo";

export default async function Inicio() {
  const [catalogo, inicio, historia] = await Promise.all([cargarCatalogo(), repositorioContenido.inicio(), repositorioContenido.historia()]);
  return (
    <>
      <Portada catalogo={catalogo} contenido={inicio} />
      <SeccionCatalogo cafes={catalogo.cafes} provincias={catalogo.provincias} />
      <SeccionMapa fuente={datosMapa.fuente} />
      <ComoPedir catalogo={catalogo} contenido={inicio} />
      <Historia catalogo={catalogo} contenido={historia} />
    </>
  );
}
