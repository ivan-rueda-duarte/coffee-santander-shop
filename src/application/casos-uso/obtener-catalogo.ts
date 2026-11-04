import { dimensionesVisibles, limitesCatalogo, type Dimension, type LimitesCatalogo } from "@/domain/catalogo/filtros";
import { provinciasConCafes, provinciasProximas, type Catalogo } from "@/domain/catalogo/catalogo";
import type { Provincia } from "@/domain/catalogo/tipos";
import type { CatalogoRepositorio } from "../puertos";

export interface VistaCatalogo extends Catalogo {
  /** Provincias con al menos un café: se pueden elegir. */
  provinciasActivas: Provincia[];
  /** Provincias sin cafés: se muestran como "Próximamente". */
  provinciasProximas: Provincia[];
  /** Controles de filtro que tienen sentido con los datos de hoy. */
  filtrosVisibles: Dimension[];
  limites: LimitesCatalogo;
}

export async function obtenerCatalogo(repo: CatalogoRepositorio): Promise<VistaCatalogo> {
  const catalogo = await repo.obtener();
  return {
    ...catalogo,
    provinciasActivas: provinciasConCafes(catalogo),
    provinciasProximas: provinciasProximas(catalogo),
    filtrosVisibles: [...dimensionesVisibles(catalogo.cafes)],
    limites: limitesCatalogo(catalogo.cafes),
  };
}
