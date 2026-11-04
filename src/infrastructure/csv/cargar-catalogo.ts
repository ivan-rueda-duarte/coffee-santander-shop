import type { Catalogo } from "@/domain/catalogo/catalogo";
import { perfilesDeNotas } from "@/domain/catalogo/perfiles";
import {
  MOLIENDAS,
  PROCESOS,
  TUESTES,
  type Cafe,
  type Municipio,
  TAMANOS_GRAMOS,
  type Presentacion,
  type Productor,
  type Provincia,
} from "@/domain/catalogo/tipos";
import type { ConfigTienda } from "@/domain/pedido/tienda";
import { Errores, LectorFila, verificarUnicos } from "./campos";
import { ErrorDatos, leerCsv, type FilaCsv } from "./lector";

/** Devuelve el contenido de un archivo de data/ por su nombre ("cafes.csv"). */
export type LeerArchivo = (nombre: string) => string;

/** Dice si existe un archivo de public/ ("/fotos/cafes/cafe-oiba/1.jpg"). Sin esta función no se comprueban las fotos. */
export type ExisteArchivoPublico = (ruta: string) => boolean;

/** Carpeta (dentro de public/) donde van las fotos de cada café: public/fotos/cafes/<slug-del-cafe>/ */
export const CARPETA_FOTOS = "/fotos/cafes";
const EXTENSIONES_FOTO = /\.(jpe?g|png|webp|avif)$/i;

export interface ResultadoCarga {
  catalogo: Catalogo;
  /** Cosas que no impiden publicar pero conviene saber. */
  advertencias: string[];
}

export const ARCHIVO_CATALOGO = "catalogo.csv";
const columnaPrecio = (gramos: number) => `precio_${gramos}g`;

function tabla(leer: LeerArchivo, archivo: string, requeridas: string[], opcionales: string[], errores: Errores): FilaCsv[] {
  let texto: string;
  try {
    texto = leer(archivo);
  } catch {
    errores.agregar(`${archivo}: no se encontró el archivo en data/.`);
    return [];
  }
  const { filas, errores: erroresLectura } = leerCsv(texto, archivo, { requeridas, opcionales });
  erroresLectura.forEach((e) => errores.agregar(e));
  return filas;
}

/**
 * Lee y valida los CSV de data/ (provincias, municipios, productores, catalogo, config).
 * El catálogo es un solo archivo: una fila por café con sus precios por tamaño y sus fotos.
 * Si algo está mal lanza ErrorDatos con TODOS los problemas, cada uno con archivo, línea y columna.
 */
export function cargarCatalogo(leer: LeerArchivo, existeFoto?: ExisteArchivoPublico): ResultadoCarga {
  const errores = new Errores();
  const advertencias: string[] = [];

  // ---------- provincias ----------
  const provincias: Provincia[] = [];
  const cProv: { valor: string; linea: number }[] = [];
  tabla(leer, "provincias.csv", ["slug", "nombre", "nombre_corto", "color_hex", "orden"], ["descripcion"], errores).forEach((fila, i) => {
    const f = new LectorFila("provincias.csv", fila, errores);
    const slug = f.slug("slug");
    cProv.push({ valor: slug, linea: f.linea });
    provincias.push({
      slug,
      nombre: f.texto("nombre", true),
      nombreCorto: f.texto("nombre_corto", true),
      colorHex: f.hex("color_hex"),
      descripcion: f.textoOpcional("descripcion"),
      orden: f.entero("orden", { min: 0, requerido: true }) ?? i + 1,
    });
  });
  verificarUnicos("provincias.csv", "slug", cProv, errores);
  const slugsProvincia = new Set(provincias.map((p) => p.slug));

  // ---------- municipios ----------
  const municipios: Municipio[] = [];
  const cMun: { valor: string; linea: number }[] = [];
  tabla(leer, "municipios.csv", ["slug", "nombre", "provincia_slug", "por_verificar"], ["divipola"], errores).forEach((fila) => {
    const f = new LectorFila("municipios.csv", fila, errores);
    const slug = f.slug("slug");
    cMun.push({ valor: slug, linea: f.linea });
    const provinciaSlug = f.textoOpcional("provincia_slug");
    const porVerificar = f.booleano("por_verificar", false);
    const divipola = f.textoOpcional("divipola");
    if (divipola && !/^68\d{3}$/.test(divipola)) f.error("divipola", `"${divipola}" no es un código DIVIPOLA de Santander (cinco dígitos que empiezan por 68).`);
    if (provinciaSlug && !slugsProvincia.has(provinciaSlug)) f.error("provincia_slug", `"${provinciaSlug}" no existe en provincias.csv.`);
    if (!provinciaSlug && !porVerificar) f.error("provincia_slug", 'está vacía; escribe la provincia o marca "por_verificar" como si.');
    if (provinciaSlug && porVerificar) f.error("por_verificar", 'es "si" pero el municipio ya tiene provincia; deja una de las dos.');
    municipios.push({ slug, nombre: f.texto("nombre", true), divipola, provinciaSlug, porVerificar });
  });
  verificarUnicos("municipios.csv", "slug", cMun, errores);
  const municipioPorSlug = new Map(municipios.map((m) => [m.slug, m]));

  // ---------- productores ----------
  const productores: Productor[] = [];
  const cProd: { valor: string; linea: number }[] = [];
  tabla(leer, "productores.csv", ["slug", "nombre", "tipo"], ["municipio_slug", "activo"], errores).forEach((fila) => {
    const f = new LectorFila("productores.csv", fila, errores);
    const slug = f.slug("slug");
    cProd.push({ valor: slug, linea: f.linea });
    const activo = f.booleano("activo", true);
    const municipioSlug = f.textoOpcional("municipio_slug");
    if (municipioSlug && !municipioPorSlug.has(municipioSlug)) f.error("municipio_slug", `"${municipioSlug}" no existe en municipios.csv.`);
    const tipo = f.opcion("tipo", ["finca", "productor", "marca_aliada"] as const);
    if (activo && tipo) productores.push({ slug, nombre: f.texto("nombre", true), tipo, municipioSlug });
  });
  verificarUnicos("productores.csv", "slug", cProd, errores);
  const productorPorSlug = new Map(productores.map((p) => [p.slug, p]));

  // ---------- cafés ----------
  const cafes: Cafe[] = [];
  const cCafe: { valor: string; linea: number }[] = [];
  const filasCafes = tabla(
    leer,
    ARCHIVO_CATALOGO,
    ["slug", "nombre", "municipio_slug", "altura_msnm", "variedades", "proceso", "tueste", "notas_cata", "moliendas"],
    [
      "productor_slug", "proceso_detalle", "puntaje_sca", "puntaje_verificado", "puntaje_fuente", "puntaje_fecha", "registro_sanitario",
      ...TAMANOS_GRAMOS.map(columnaPrecio), "agotados", "fotos", "foto_descripcion", "destacado", "activo", "orden",
    ],
    errores,
  );
  filasCafes.forEach((fila, i) => {
    const f = new LectorFila(ARCHIVO_CATALOGO, fila, errores);
    const slug = f.slug("slug");
    cCafe.push({ valor: slug, linea: f.linea });

    const municipioSlug = f.slug("municipio_slug");
    const municipio = municipioPorSlug.get(municipioSlug);
    if (municipioSlug && !municipio) f.error("municipio_slug", `"${municipioSlug}" no existe en municipios.csv.`);
    const productorSlug = f.textoOpcional("productor_slug");
    if (productorSlug && !productorPorSlug.has(productorSlug)) f.error("productor_slug", `"${productorSlug}" no existe (o no está activo) en productores.csv.`);

    const proceso = f.opcion("proceso", PROCESOS);
    const tueste = f.opcion("tueste", TUESTES);
    const notas = f.lista("notas_cata");
    const sinPerfil = notas.filter((n) => perfilesDeNotas([n]).length === 0);
    if (sinPerfil.length) advertencias.push(`${ARCHIVO_CATALOGO}, línea ${f.linea}: las notas ${sinPerfil.map((n) => `"${n}"`).join(", ")} no tienen perfil de taza asignado (src/domain/catalogo/perfiles.ts).`);

    const puntaje = f.decimal("puntaje_sca");
    const verificado = f.booleano("puntaje_verificado", false);
    const fuente = f.textoOpcional("puntaje_fuente");
    const fecha = f.fecha("puntaje_fecha");
    if (verificado) {
      if (puntaje === null) f.error("puntaje_verificado", 'es "si" pero falta puntaje_sca.');
      if (!fuente) f.error("puntaje_fuente", "es obligatoria cuando el puntaje está verificado (quién lo cató).");
      if (!fecha) f.error("puntaje_fecha", "es obligatoria cuando el puntaje está verificado.");
    }

    const activo = f.booleano("activo", true);

    // Precios por tamaño: una columna por tamaño; vacía = ese tamaño no se vende.
    const presentaciones: Presentacion[] = [];
    const agotados = f.lista("agotados");
    for (const gramos of TAMANOS_GRAMOS) {
      const precio = f.entero(columnaPrecio(gramos), { min: 1, requerido: false });
      if (precio !== null) presentaciones.push({ gramos, precioCop: precio, disponible: !agotados.includes(String(gramos)) });
    }
    for (const a of agotados) {
      if (!presentaciones.some((p) => String(p.gramos) === a)) f.error("agotados", `"${a}" no es un tamaño con precio en esta fila. Tamaños con precio: ${presentaciones.map((p) => p.gramos).join(", ") || "ninguno"}.`);
    }
    if (activo && presentaciones.length === 0) f.error(columnaPrecio(TAMANOS_GRAMOS[0]), "el café está activo pero no tiene ningún precio; llena al menos una columna precio_….");

    // Fotos: nombres de archivo dentro de public/fotos/cafes/<slug>/
    const fotos: string[] = [];
    for (const archivo of f.lista("fotos")) {
      if (!EXTENSIONES_FOTO.test(archivo) || /[\\/]/.test(archivo)) {
        f.error("fotos", `"${archivo}" debe ser solo el nombre del archivo, con extensión .jpg, .png, .webp o .avif (sin carpetas).`);
        continue;
      }
      const ruta = `${CARPETA_FOTOS}/${slug}/${archivo}`;
      if (activo && existeFoto && !existeFoto(ruta)) f.error("fotos", `no se encontró la foto "${archivo}". Debe estar en public${ruta}.`);
      fotos.push(ruta);
    }
    const cafe: Cafe = {
      slug,
      nombre: f.texto("nombre", true),
      municipioSlug,
      municipio: municipio?.nombre ?? "",
      provinciaSlug: municipio?.provinciaSlug ?? null,
      provincia: provincias.find((p) => p.slug === municipio?.provinciaSlug)?.nombreCorto ?? null,
      productorSlug,
      productor: productorSlug ? (productorPorSlug.get(productorSlug)?.nombre ?? null) : null,
      alturaMsnm: f.entero("altura_msnm", { min: 0, max: 4000, requerido: false }),
      variedades: f.lista("variedades", true),
      proceso: proceso ?? "lavado",
      procesoDetalle: f.textoOpcional("proceso_detalle"),
      tueste: tueste ?? "medio",
      notasCata: notas,
      perfiles: perfilesDeNotas(notas),
      puntajeSca: puntaje,
      puntajeVerificado: verificado,
      puntajeFuente: fuente,
      puntajeFecha: fecha,
      registroSanitario: f.textoOpcional("registro_sanitario"),
      moliendas: f.opciones("moliendas", MOLIENDAS, true),
      presentaciones: presentaciones.sort((a, b) => a.gramos - b.gramos),
      fotos,
      fotoDescripcion: f.textoOpcional("foto_descripcion"),
      destacado: f.booleano("destacado", false),
      orden: f.entero("orden", { min: 0, requerido: false }) ?? i + 1,
    };
    if (activo) cafes.push(cafe);

    if (activo && municipio && municipio.porVerificar) advertencias.push(`${ARCHIVO_CATALOGO}, línea ${f.linea}: "${cafe.nombre}" está en ${municipio.nombre}, cuya provincia está por verificar; no aparecerá en ninguna provincia.`);
    if (activo && puntaje !== null && !verificado) advertencias.push(`${ARCHIVO_CATALOGO}, línea ${f.linea}: "${cafe.nombre}" tiene puntaje SCA sin verificar; no se mostrará el sello ni se usará en filtros.`);
  });
  verificarUnicos(ARCHIVO_CATALOGO, "slug", cCafe, errores);

  // ---------- config ----------
  const tienda = leerConfig(leer, errores);

  if (errores.lista.length) throw new ErrorDatos(errores.lista);
  return {
    catalogo: { provincias: provincias.sort((a, b) => a.orden - b.orden), municipios, productores, cafes: cafes.sort((a, b) => a.orden - b.orden), tienda: tienda as ConfigTienda },
    advertencias,
  };
}

const CLAVES_REQUERIDAS = ["nombre_tienda", "whatsapp", "ciudad_despacho", "nota_envio", "formas_pago", "max_cantidad"] as const;
const CLAVES_OPCIONALES = ["razon_social", "nit", "domicilio", "correo_contacto"] as const;

function leerConfig(leer: LeerArchivo, errores: Errores): ConfigTienda | null {
  const filas = tabla(leer, "config.csv", ["clave", "valor"], [], errores);
  const valores = new Map<string, { valor: string; fila: FilaCsv }>();
  const permitidas: readonly string[] = [...CLAVES_REQUERIDAS, ...CLAVES_OPCIONALES];
  for (const fila of filas) {
    const f = new LectorFila("config.csv", fila, errores);
    const clave = f.texto("clave", true);
    if (!clave) continue;
    if (!permitidas.includes(clave)) {
      f.error("clave", `"${clave}" no es una clave válida. Claves: ${permitidas.join(", ")}.`);
      continue;
    }
    if (valores.has(clave)) f.error("clave", `"${clave}" ya aparece en la línea ${valores.get(clave)!.fila.linea}.`);
    else valores.set(clave, { valor: f.texto("valor"), fila });
  }

  const obtener = (clave: string): { f: LectorFila } | null => {
    const entrada = valores.get(clave);
    if (!entrada || entrada.valor === "") {
      if ((CLAVES_REQUERIDAS as readonly string[]).includes(clave)) errores.agregar(`config.csv: falta un valor para la clave "${clave}".`);
      return null;
    }
    return { f: new LectorFila("config.csv", { linea: entrada.fila.linea, valores: { valor: entrada.valor } }, errores) };
  };
  const opcional = (clave: string) => valores.get(clave)?.valor || null;

  const nombre = obtener("nombre_tienda");
  const whatsapp = obtener("whatsapp");
  const ciudad = obtener("ciudad_despacho");
  const nota = obtener("nota_envio");
  const pagos = obtener("formas_pago");
  const max = obtener("max_cantidad");
  const numero = whatsapp?.f.texto("valor") ?? "";
  if (whatsapp && !/^\d{10,15}$/.test(numero)) {
    whatsapp.f.error("valor", `whatsapp "${numero}" debe llevar solo dígitos, con indicativo de país y sin "+" ni espacios (por ejemplo 573001129874).`);
  }
  const maxCantidad = max?.f.entero("valor", { min: 1, max: 100 }) ?? null;
  const formasPago = pagos?.f.lista("valor", true) ?? [];

  if (!nombre || !whatsapp || !ciudad || !nota || !pagos || maxCantidad === null) return null;
  return {
    nombre: nombre.f.texto("valor"),
    whatsapp: numero,
    ciudadDespacho: ciudad.f.texto("valor"),
    notaEnvio: nota.f.texto("valor"),
    formasPago,
    maxCantidad,
    vendedor: {
      razonSocial: opcional("razon_social"),
      nit: opcional("nit"),
      domicilio: opcional("domicilio"),
      correoContacto: opcional("correo_contacto"),
    },
  };
}
