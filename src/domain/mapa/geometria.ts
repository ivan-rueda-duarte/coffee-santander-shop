import type { CajaMapa, ProyeccionMapa } from "./tipos";

/** Grados → coordenadas del mapa (misma proyección que tools/build_mapa.py). */
export function proyectar(p: ProyeccionMapa, lon: number, lat: number): [number, number] {
  return [(lon - p.lon0) * p.cos * p.k + p.dx, -(lat - p.lat0) * p.k + p.dy];
}

/** 6.637 → "6°38′". */
export function formatearGrados(valor: number): string {
  const abs = Math.abs(valor);
  const grados = Math.floor(abs);
  const minutos = Math.round((abs - grados) * 60);
  return minutos === 60 ? `${grados + 1}°00′` : `${grados}°${String(minutos).padStart(2, "0")}′`;
}

/** Caja que contiene a todas las dadas. */
export function unirCajas(cajas: readonly CajaMapa[]): CajaMapa | null {
  if (cajas.length === 0) return null;
  const x0 = Math.min(...cajas.map((c) => c[0]));
  const y0 = Math.min(...cajas.map((c) => c[1]));
  const x1 = Math.max(...cajas.map((c) => c[0] + c[2]));
  const y1 = Math.max(...cajas.map((c) => c[1] + c[3]));
  return [x0, y0, x1 - x0, y1 - y0];
}

/**
 * Encuadre del mapa: el departamento completo, o la caja de las provincias elegidas con 35 % de
 * margen y la misma proporción que el mapa completo (sin acercarse a menos del 40 % de su ancho).
 */
export function calcularEncuadre(completo: CajaMapa, elegidas: readonly CajaMapa[]): CajaMapa {
  const caja = unirCajas(elegidas);
  if (!caja) return [...completo];
  const [x, y, w, h] = caja;
  const proporcion = completo[2] / completo[3];
  let ancho = w * 1.35;
  let alto = h * 1.35;
  if (ancho / alto > proporcion) alto = ancho / proporcion;
  else ancho = alto * proporcion;
  ancho = Math.max(ancho, completo[2] * 0.4);
  alto = ancho / proporcion;
  return [x + w / 2 - ancho / 2, y + h / 2 - alto / 2, ancho, alto];
}

/** Interpolación de cajas con salida suave (t de 0 a 1). */
export function interpolarCaja(desde: CajaMapa, hasta: CajaMapa, t: number): CajaMapa {
  const k = 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 4);
  return desde.map((v, i) => v + (hasta[i] - v) * k) as CajaMapa;
}

/** Escala gráfica: el paso en km (de 5 a 100) que más se acerca a `objetivoPx` píxeles. */
export function escalaGrafica(proyeccion: ProyeccionMapa, anchoMapa: number, anchoPx: number, objetivoPx = 90) {
  const kmPorUnidad = 111.32 / proyeccion.k;
  const pxPorUnidad = anchoPx / anchoMapa;
  const objetivo = objetivoPx / (kmPorUnidad * pxPorUnidad);
  const km = [5, 10, 20, 25, 50, 100].find((s) => s >= objetivo) ?? 100;
  return { km, anchoPx: Math.round((km / kmPorUnidad) * pxPorUnidad) };
}
