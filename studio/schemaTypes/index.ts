import { tiposComunes } from "./comunes";
import { tiposContenido } from "./contenido";
import { tiposPaginas } from "./paginas";

export const schemaTypes = [...tiposComunes, ...tiposContenido, ...tiposPaginas];
export const SINGLETONS = ["paginaInicio", "paginaHistoria", "ajustesSitio"] as const;
