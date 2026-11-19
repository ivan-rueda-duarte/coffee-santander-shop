// Colocación de pines y nombres sobre el mapa sin que se solapen (porta placeOverlay de la v1).
// Todo en píxeles del contenedor; el que mide y pinta es la interfaz.

export interface Caja {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

const choca = (caja: Caja, ocupadas: readonly Caja[]) =>
  ocupadas.some((b) => caja.x0 < b.x1 + 3 && caja.x1 > b.x0 - 3 && caja.y0 < b.y1 + 2 && caja.y1 > b.y0 - 2);

export interface PinEntrada {
  x: number;
  y: number;
  /** Tamaño del texto del nombre. */
  ancho: number;
  alto: number;
  /** Los pines del borde derecho prefieren el nombre a la izquierda. */
  preferirIzquierda: boolean;
}

export interface PinColocado {
  visible: boolean;
  lado: "derecha" | "izquierda" | "compacto";
  /** Esquina del pin (texto y punto) en píxeles. */
  izquierda: number;
  arriba: number;
}

/** Media caja que reserva el punto de un pin, en px desde su centro. */
export const RESERVA_PUNTO = 11;

/**
 * Los puntos reservan su lugar primero; luego cada nombre busca sitio a la derecha o a la izquierda
 * y, si no cabe, el pin queda solo con el punto. Devuelve también las cajas ocupadas.
 */
export function colocarPines(pines: readonly PinEntrada[], ancho: number, alto: number): { pines: PinColocado[]; ocupadas: Caja[] } {
  const ocupadas: Caja[] = [];
  const visibles = pines.map((p) => !(p.x < -4 || p.x > ancho + 4 || p.y < -4 || p.y > alto + 4));
  // El punto reserva ± 11 px: con el margen de `choca`, ningún rótulo queda a menos de 2 px de él (revisión visual de
  // QA-032). El nombre del pin empieza en x ± 14 y no choca con su propio punto.
  pines.forEach((p, i) => {
    if (visibles[i]) ocupadas.push({ x0: p.x - RESERVA_PUNTO, x1: p.x + RESERVA_PUNTO, y0: p.y - RESERVA_PUNTO, y1: p.y + RESERVA_PUNTO });
  });

  const colocados = pines.map<PinColocado>((p, i) => {
    if (!visibles[i]) return { visible: false, lado: "compacto", izquierda: 0, arriba: 0 };
    for (const lado of p.preferirIzquierda ? (["izquierda", "derecha"] as const) : (["derecha", "izquierda"] as const)) {
      const izquierda = lado === "izquierda" ? p.x - p.ancho + 13 : p.x - 13;
      const texto: Caja =
        lado === "izquierda"
          ? { x0: izquierda, x1: p.x - 14, y0: p.y - 8, y1: p.y + 8 }
          : { x0: p.x + 14, x1: izquierda + p.ancho, y0: p.y - 8, y1: p.y + 8 };
      if (texto.x0 < 2 || texto.x1 > ancho - 2 || choca(texto, ocupadas)) continue;
      ocupadas.push(texto);
      return { visible: true, lado, izquierda: Math.round(izquierda), arriba: Math.round(p.y - p.alto / 2) };
    }
    return { visible: true, lado: "compacto", izquierda: Math.round(p.x - 13), arriba: Math.round(p.y - p.alto / 2) };
  });
  return { pines: colocados, ocupadas };
}

export interface RotuloEntrada {
  cx: number;
  cy: number;
  /** Ancho del nombre: el rótulo se centra con él. */
  ancho: number;
  /**
   * Ancho de lo que se pinta, si es mayor que el nombre (p. ej., «Próximamente» bajo un nombre corto). El texto empieza
   * donde empezaría el nombre centrado, así que este ancho se extiende a la derecha y es el que no debe chocar (QA-032).
   */
  anchoCaja?: number;
  alto: number;
  /** Hay una provincia elegida y esta no es una de ellas. */
  atenuado: boolean;
  /** Provincia sin cafés («Próximamente»): busca sitio después de las que tienen cafés. */
  vacia?: boolean;
}

export interface RotuloColocado {
  oculto: boolean;
  izquierda: number;
  arriba: number;
  /** Corrimiento horizontal elegido (0, ±20 o ±40 px), solo cuando ningún sitio en vertical sirve (QA-032). */
  desplazamientoX: number;
}

/**
 * Sitios que prueba un rótulo, en orden, como [dx, dy] en px desde su centro: primero en vertical, como siempre; si
 * ninguno sirve, se corre a un lado antes de ocultarse (QA-032: a 320 px, «VÉLEZ» entre «COMUNERA» y la escala).
 */
export const SITIOS_ROTULO: readonly (readonly [number, number])[] = [
  [0, 0],
  [0, 20],
  [0, -20],
  [0, 40],
  [0, -40],
  [-20, 0],
  [20, 0],
  [-40, 0],
  [40, 0],
];

/**
 * Nombres de provincia: en su centro, o un poco más abajo o arriba; si no caben, se atenúan. Cada rótulo colocado
 * reserva su caja entera (nombre y «Próximamente»), así que el siguiente no lo pisa (QA-032).
 * Las provincias con cafés buscan sitio primero y las vacías después, cada grupo en su orden: una «Próximamente» no
 * deja sin nombre a una provincia con cafés (revisión visual de QA-032). La salida va en el orden de la entrada.
 */
export function colocarRotulos(rotulos: readonly RotuloEntrada[], ocupadas: Caja[], ancho: number, alto: number): RotuloColocado[] {
  const orden = rotulos.map((r, i) => ({ r, i })).sort((a, b) => Number(Boolean(a.r.vacia)) - Number(Boolean(b.r.vacia)) || a.i - b.i);
  const salida: RotuloColocado[] = new Array(rotulos.length);
  for (const { r, i } of orden) salida[i] = colocarRotulo(r, ocupadas, ancho, alto);
  return salida;
}

function colocarRotulo(r: RotuloEntrada, ocupadas: Caja[], ancho: number, alto: number): RotuloColocado {
  const fuera = r.cx < 0 || r.cx > ancho || r.cy < 0 || r.cy > alto;
  const oculto = { oculto: true, izquierda: 0, arriba: 0, desplazamientoX: 0 };
  if (fuera || r.atenuado) return oculto;
  const pintado = Math.max(r.ancho, r.anchoCaja ?? 0);
  for (const [dx, dy] of SITIOS_ROTULO) {
    const x = Math.min(Math.max(r.cx - r.ancho / 2 + dx, 4), ancho - r.ancho - 4);
    const caja: Caja = { x0: x, x1: x + pintado, y0: r.cy - r.alto / 2 + dy, y1: r.cy + r.alto / 2 + dy };
    if (caja.y0 <= 2 || caja.y1 >= alto - 2 || choca(caja, ocupadas)) continue;
    ocupadas.push(caja);
    return { oculto: false, izquierda: Math.round(caja.x0), arriba: Math.round(caja.y0), desplazamientoX: dx };
  }
  return oculto;
}
