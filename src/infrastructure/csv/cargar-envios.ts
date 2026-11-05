import { normalizar, slugify } from "@/domain/comun/slug";
import { esquemaReglaZona, esquemaTarifa } from "@/domain/envio/esquema";
import { ZONA_ESPECIAL, ZONA_POR_DEFECTO, type ReglaZona, type ReglasEnvio, type TarifaEnvio, type Zona } from "@/domain/envio/tipos";
import { Errores, LectorFila, verificarUnicos } from "./campos";
import { tabla, type LeerArchivo } from "./tabla";

/** Forma de src/data/divipola.json: de ahí salen los nombres que guarda el formulario de envío. */
export interface DatosDivipola {
  departamentos: { nombre: string; municipios: { nombre: string }[] }[];
}

export const ARCHIVO_TARIFAS = "tarifas_envio.csv";
export const ARCHIVO_ZONAS = "zonas_envio.csv";

const POR_COTIZAR = "por_cotizar";

/** Escalón: entero en pesos, o "por_cotizar" (null). Devuelve undefined si la celda no se pudo leer. */
function leerEscalon(f: LectorFila, columna: string, valor: string): number | null | undefined {
  if (valor === POR_COTIZAR) return null;
  return f.entero(columna, { min: 1 }) ?? undefined;
}

/**
 * Lee data/tarifas_envio.csv y data/zonas_envio.csv.
 * Además de los tipos, comprueba que cada departamento y municipio exista en DIVIPOLA (sin importar tildes ni
 * mayúsculas), que haya tarifa para cada zona y para cada municipio de zona 1, y que exista la zona 4.
 */
export function cargarEnvios(leer: LeerArchivo, errores: Errores, divipola: DatosDivipola): ReglasEnvio {
  // ---------- tarifas ----------
  const tarifas: TarifaEnvio[] = [];
  const claves: { valor: string; linea: number }[] = [];
  const columnas = ["zona", "clave", "nombre", "medio", "hasta_1kg_cop", "hasta_2kg_cop", "hasta_5kg_cop", "mas_5kg"];
  tabla(leer, ARCHIVO_TARIFAS, columnas, ["vigencia_desde"], errores).forEach((fila) => {
    const f = new LectorFila(ARCHIVO_TARIFAS, fila, errores);
    const v = fila.valores;
    const clave = f.texto("clave", true);
    claves.push({ valor: clave, linea: f.linea });
    const zona = f.entero("zona", { min: 1, max: 5 });
    const h1 = leerEscalon(f, "hasta_1kg_cop", v.hasta_1kg_cop ?? "");
    const h2 = leerEscalon(f, "hasta_2kg_cop", v.hasta_2kg_cop ?? "");
    const h5 = leerEscalon(f, "hasta_5kg_cop", v.hasta_5kg_cop ?? "");
    if (v.mas_5kg !== POR_COTIZAR) f.error("mas_5kg", `debe decir "${POR_COTIZAR}": más de 5 kg siempre se cotiza.`);
    f.fecha("vigencia_desde");
    if (zona === null || h1 === undefined || h2 === undefined || h5 === undefined) return;

    const r = esquemaTarifa.safeParse({ zona, clave, nombre: f.texto("nombre", true), medio: f.texto("medio", true), hasta1: h1, hasta2: h2, hasta5: h5 });
    if (!r.success) {
      r.error.issues.forEach((i) => f.error(String(i.path[0] ?? "zona"), i.message));
      return;
    }
    const d = r.data;
    tarifas.push({ zona: d.zona, clave: d.clave, nombre: d.nombre, medio: d.medio, escalones: d.hasta1 === null ? null : [d.hasta1, d.hasta2!, d.hasta5!] });
  });
  verificarUnicos(ARCHIVO_TARIFAS, "clave", claves, errores);

  // ---------- zonas ----------
  const reglas: ReglaZona[] = [];
  const nombresMunicipio = new Map<string, Set<string>>(); // departamento normalizado → municipios normalizados
  for (const d of divipola.departamentos) nombresMunicipio.set(normalizar(d.nombre), new Set(d.municipios.map((m) => normalizar(m.nombre))));
  const vistas = new Map<string, number>();

  tabla(leer, ARCHIVO_ZONAS, ["nivel", "departamento", "municipio", "zona"], ["nota"], errores).forEach((fila) => {
    const f = new LectorFila(ARCHIVO_ZONAS, fila, errores);
    const zona = f.entero("zona", { min: 1, max: 5 });
    const departamento = f.texto("departamento", true);
    const municipio = f.texto("municipio");
    const r = esquemaReglaZona.safeParse({ nivel: fila.valores.nivel, departamento, municipio, zona: zona ?? 0 });
    if (zona === null) return;
    if (!r.success) {
      r.error.issues.forEach((i) => f.error(String(i.path[0] ?? "nivel"), i.message));
      return;
    }
    const { nivel } = r.data;

    const municipiosDelDepartamento = nombresMunicipio.get(normalizar(departamento));
    if (departamento && !municipiosDelDepartamento) {
      f.error("departamento", `"${departamento}" no existe en src/data/divipola.json. Usa el nombre exacto del DANE (por ejemplo "Bogotá, D.C." o "Archipiélago de San Andrés, Providencia y Santa Catalina").`);
    } else if (nivel === "municipio" && municipiosDelDepartamento && !municipiosDelDepartamento.has(normalizar(municipio))) {
      f.error("municipio", `"${municipio}" no existe en ${departamento} según src/data/divipola.json. Usa el nombre del DANE (por ejemplo "Cartagena de Indias").`);
    }

    const llave = `${nivel}|${normalizar(departamento)}|${normalizar(municipio)}`;
    const previa = vistas.get(llave);
    if (previa !== undefined) f.error("departamento", `esta regla ya aparece en la línea ${previa}.`);
    else vistas.set(llave, f.linea);

    reglas.push({ nivel, departamento, municipio: nivel === "municipio" ? municipio : null, zona: r.data.zona });
  });

  // ---------- referencias entre los dos archivos ----------
  const porClave = new Set(tarifas.map((t) => t.clave));
  if (!tarifas.some((t) => t.zona === ZONA_POR_DEFECTO && t.clave === `zona${ZONA_POR_DEFECTO}`)) {
    errores.agregar(`${ARCHIVO_TARIFAS}: falta la tarifa de la zona ${ZONA_POR_DEFECTO} (clave "zona${ZONA_POR_DEFECTO}"). Es la que se aplica a todo destino que no aparece en ${ARCHIVO_ZONAS}.`);
  }
  for (const tarifa of tarifas) {
    if (tarifa.zona !== 1 && tarifa.clave !== `zona${tarifa.zona}`) {
      errores.agregar(`${ARCHIVO_TARIFAS}: la tarifa "${tarifa.clave}" es de la zona ${tarifa.zona}; su clave debe ser "zona${tarifa.zona}".`);
    }
  }
  for (const zona of [2, 3, ZONA_ESPECIAL] as Zona[]) {
    if (reglas.some((r) => r.zona === zona) && !porClave.has(`zona${zona}`)) errores.agregar(`${ARCHIVO_TARIFAS}: falta la tarifa de la zona ${zona} (clave "zona${zona}"), que ${ARCHIVO_ZONAS} usa.`);
  }
  for (const r of reglas) {
    if (r.zona !== 1 || !r.municipio) continue;
    const clave = slugify(r.municipio);
    const tarifa = tarifas.find((t) => t.clave === clave);
    if (!tarifa) errores.agregar(`${ARCHIVO_ZONAS}: ${r.municipio} es de zona 1 y necesita una tarifa con clave "${clave}" en ${ARCHIVO_TARIFAS}.`);
    else if (tarifa.zona !== 1) errores.agregar(`${ARCHIVO_TARIFAS}: la tarifa "${clave}" debe ser de la zona 1.`);
  }

  return { tarifas, zonas: reglas };
}
