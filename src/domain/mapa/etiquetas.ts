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

/**
 * Los puntos reservan su lugar primero; luego cada nombre busca sitio a la derecha o a la izquierda
 * y, si no cabe, el pin queda solo con el punto. Devuelve también las cajas ocupadas.
 */
export function colocarPines(pines: readonly PinEntrada[], ancho: number, alto: number): { pines: PinColocado[]; ocupadas: Caja[] } {
  const ocupadas: Caja[] = [];
  const visibles = pines.map((p) => !(p.x < -4 || p.x > ancho + 4 || p.y < -4 || p.y > alto + 4));
  pines.forEach((p, i) => {
    if (visibles[i]) ocupadas.push({ x0: p.x - 9, x1: p.x + 9, y0: p.y - 9, y1: p.y + 9 });
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
  ancho: number;
  alto: number;
  /** Hay una provincia elegida y esta no es una de ellas. */
  atenuado: boolean;
}

export interface RotuloColocado {
  oculto: boolean;
  izquierda: number;
  arriba: number;
}

/** Nombres de provincia: en su centro, o un poco más abajo o arriba; si no caben, se atenúan. */
export function colocarRotulos(rotulos: readonly RotuloEntrada[], ocupadas: Caja[], ancho: number, alto: number): RotuloColocado[] {
  return rotulos.map((r) => {
    const fuera = r.cx < 0 || r.cx > ancho || r.cy < 0 || r.cy > alto;
    if (fuera || r.atenuado) return { oculto: true, izquierda: 0, arriba: 0 };
    const x = Math.min(Math.max(r.cx - r.ancho / 2, 4), ancho - r.ancho - 4);
    const sitio = [0, 20, -20, 40, -40]
      .map<Caja>((dy) => ({ x0: x, x1: x + r.ancho, y0: r.cy - r.alto / 2 + dy, y1: r.cy + r.alto / 2 + dy }))
      .find((caja) => caja.y0 > 2 && caja.y1 < alto - 2 && !choca(caja, ocupadas));
    if (!sitio) return { oculto: true, izquierda: 0, arriba: 0 };
    ocupadas.push(sitio);
    return { oculto: false, izquierda: Math.round(sitio.x0), arriba: Math.round(sitio.y0) };
  });
}
