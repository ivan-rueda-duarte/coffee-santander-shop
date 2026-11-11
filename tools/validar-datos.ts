// Valida los CSV de data/ y, si Sanity está configurado, que su contenido enlace con ellos.
// Termina con código 1 si hay errores (así falla el build).
// Uso: npm run datos
import { verificarContenido } from "../src/application/casos-uso/verificar-contenido";
import { crearClienteSanity, RepositorioContenidoSanity } from "../src/infrastructure/sanity/contenido-sanity";
import { ErrorDatos } from "../src/infrastructure/csv/lector";
import { cargarCatalogoDesdeDisco } from "../src/infrastructure/csv/repositorio-catalogo-csv";
import { DOCUMENTOS_LEGALES, leerDocsLegalesDesdeDisco, numeralEnvioGratisPublicado, problemasDocsLegales, revisarEnvioGratisEnDocs } from "../src/infrastructure/legal/legal-md";
import { hoyEnColombia, modoPruebaEnvioGratis } from "../src/infrastructure/entorno";
import { ANCLA_ENVIO_GRATIS, errorNumeralTerminacion, erroresTerminacion, estadoEnvioGratis, lineaPromocionNoVigente } from "../src/domain/envio/envio-gratis";

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
    `Datos correctos: ${catalogo.cafes.length} cafés, ${catalogo.provincias.length} provincias, ${catalogo.municipios.length} municipios, ${catalogo.productores.length} productores, ${catalogo.envios.tarifas.length} tarifas, ${catalogo.envios.zonas.length} reglas de envío y ${catalogo.envios.plazos.length} plazos por zona.`,
  );
  if (advertencias.length) {
    console.warn(`\n${advertencias.length} ${advertencias.length === 1 ? "aviso" : "avisos"} (no impiden publicar):`);
    advertencias.forEach((a) => console.warn(`  - ${a}`));
  }

  // Páginas legales publicadas desde docs/legal/ (LEG-084): sin marcadores internos y con la versión de config.csv.
  const problemasLegales = problemasDocsLegales(leerDocsLegalesDesdeDisco(), catalogo.tienda.legal);
  if (problemasLegales.length) throw new ErrorDatos(problemasLegales);
  console.log(`Documentos legales publicables: ${Object.keys(DOCUMENTOS_LEGALES).length} (versión ${catalogo.tienda.legal.versionTerminos}, vigentes desde ${catalogo.tienda.legal.fechaTerminos}).`);

  // Envío gratis por comunas (microcopy §8): no se enciende sin los documentos versión 2 publicados (LEG-106).
  const promo = catalogo.envios.envioGratis;
  const hoy = hoyEnColombia();
  // P34 b (§8.6.1): envio_gratis_terminada no puede ser posterior al build.
  const errTerminacion = erroresTerminacion(promo, hoy);
  if (errTerminacion.length) throw new ErrorDatos(errTerminacion);
  const estado = estadoEnvioGratis(promo, hoy);
  if (estado.tipo === "apagada") console.log("Envío gratis por comunas: apagado (envio_gratis_desde vacía en config.csv).");
  else if (estado.tipo !== "vigente") {
    console.log(lineaPromocionNoVigente(promo, hoy));
    // Terminada: el aviso enlaza a /envios/#envio-gratis, que solo existe mientras el numeral esté publicado.
    if (estado.tipo === "terminada" && !modoPruebaEnvioGratis()) {
      const numeralPublicado = numeralEnvioGratisPublicado(leerDocsLegalesDesdeDisco());
      // QA-012: con el aviso visible, un enlace roto no se publica; fuera de esa ventana solo se avisa.
      const errNumeral = errorNumeralTerminacion(promo, hoy, numeralPublicado);
      if (errNumeral.length) throw new ErrorDatos(errNumeral);
      if (!numeralPublicado) console.warn(`  - Aviso, envío gratis: «Envíos, devoluciones, retracto y garantía» no publica el numeral del envío gratis; /envios/ no tendrá la sección #${ANCLA_ENVIO_GRATIS}${estado.fin.avisoVisible ? " y el enlace «Ver condiciones» del aviso de portada y cajón no llevará a las condiciones" : ""}.`);
    }
  } else {
    const prueba = modoPruebaEnvioGratis();
    const revision = revisarEnvioGratisEnDocs(leerDocsLegalesDesdeDisco(), estado.promo, catalogo.tienda.legal);
    revision.avisos.forEach((a) => console.warn(`  - Aviso, envío gratis: ${a}`));
    if (revision.errores.length && !prueba) throw new ErrorDatos(revision.errores.map((e) => `Envío gratis (envio_gratis_desde ${estado.promo.desde}): ${e}`));
    if (prueba) {
      console.warn(`\nENVIO_GRATIS_PRUEBA=si: build de PRUEBA con el envío gratis encendido. No se despliega.${revision.errores.length ? " Sin este modo fallaría por:" : ""}`);
      revision.errores.forEach((e) => console.warn(`  - ${e}`));
    }
    console.log(`Envío gratis por comunas: encendido desde ${estado.promo.desde} en ${estado.promo.comunas.length} comunas de ${estado.promo.municipio}.`);
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
