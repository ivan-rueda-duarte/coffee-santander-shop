import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes, SINGLETONS } from "./schemaTypes";

// El proyecto lo crea y lo autoriza el cliente: `npx sanity login` y luego `npx sanity init --env`
// (o copia el ID de proyecto a studio/.env como SANITY_STUDIO_PROJECT_ID).
const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? "";
const dataset = process.env.SANITY_STUDIO_DATASET ?? "production";

const esSingleton = (tipo: string) => (SINGLETONS as readonly string[]).includes(tipo);

export default defineConfig({
  name: "de-santander",
  title: "De Santander · Contenido",
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Contenido")
          .items([
            S.listItem().title("Página de inicio").child(S.document().schemaType("paginaInicio").documentId("paginaInicio")),
            S.listItem().title("Historia").child(S.document().schemaType("paginaHistoria").documentId("paginaHistoria")),
            S.listItem().title("Ajustes del sitio").child(S.document().schemaType("ajustesSitio").documentId("ajustesSitio")),
            S.divider(),
            S.documentTypeListItem("cafeContenido").title("Cafés"),
            S.documentTypeListItem("provinciaContenido").title("Provincias"),
            S.documentTypeListItem("productorContenido").title("Productores y fincas"),
            S.divider(),
            S.documentTypeListItem("paginaLegal").title("Páginas legales"),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
    // Los singletons no se crean desde el menú "Nuevo documento".
    templates: (plantillas) => plantillas.filter(({ schemaType }) => !esSingleton(schemaType)),
  },
  document: {
    actions: (acciones, { schemaType }) => (esSingleton(schemaType) ? acciones.filter(({ action }) => action !== "delete" && action !== "duplicate") : acciones),
  },
});
