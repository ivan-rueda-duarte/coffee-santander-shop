// Valida los CSV de data/ y, si Sanity está configurado, que su contenido enlace con ellos.
// Termina con código 1 si hay errores (así falla el build).
// Uso: npm run datos
import { verificarContenido } from "../src/application/casos-uso/verificar-contenido";
import { crearClienteSanity, RepositorioContenidoSanity } from "../src/infrastructure/sanity/contenido-sanity";
import { ErrorDatos } from "../src/infrastructure/csv/lector";
import { cargarCatalogoDesdeDisco } from "../src/infrastructure/csv/repositorio-catalogo-csv";

// Next lee .env.local solo; este script corre fuera de Next.
for (const archivo of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(archivo);
  } catch {
    /* no existe: se usa el entorno tal cual */
  }
}

async function main() {
  const { catalogo, advertencias } = cargarCatalogoDesdeDisco();
  console.log(
    `Datos correctos: ${catalogo.cafes.length} cafés, ${catalogo.provincias.length} provincias, ${catalogo.municipios.length} municipios, ${catalogo.productores.length} productores, ${catalogo.envios.tarifas.length} tarifas y ${catalogo.envios.zonas.length} reglas de envío.`,
  );
  if (advertencias.length) {
    console.warn(`\n${advertencias.length} ${advertencias.length === 1 ? "aviso" : "avisos"} (no impiden publicar):`);
    advertencias.forEach((a) => console.warn(`  - ${a}`));
  }

  const cliente = crearClienteSanity();
  if (!cliente) {
    console.log("\nSanity no está configurado (falta NEXT_PUBLIC_SANITY_PROJECT_ID): el sitio se construye solo con los datos técnicos.");
    return;
  }
  const errores = verificarContenido(catalogo, await new RepositorioContenidoSanity(cliente).slugs());
  if (errores.length) throw new ErrorDatos(errores);
  console.log("Contenido de Sanity enlazado correctamente con los CSV.");
}

main().catch((e) => {
  if (e instanceof ErrorDatos) {
    console.error(`\n${e.message}\n\nCorrige y vuelve a ejecutar "npm run datos".`);
    process.exit(1);
  }
  throw e;
});
