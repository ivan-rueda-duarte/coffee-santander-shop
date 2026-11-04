import type { CarritoAlmacen } from "@/application/puertos";
import { CLAVE_CARRITO_V1, CLAVE_CARRITO_V2, migrarCarritoV1, parsearCarrito, serializarCarrito, type CarritoGuardado } from "@/domain/pedido/persistencia";
import { ID_V1_A_SLUG } from "./ids-v1";

/** Lo mínimo que usamos de `Storage`; permite probarlo sin navegador. */
export interface AlmacenTexto {
  getItem(clave: string): string | null;
  setItem(clave: string, valor: string): void;
  removeItem(clave: string): void;
}

/** Escucha cambios de otras pestañas (evento `storage`). */
export interface EscuchaStorage {
  addEventListener(tipo: "storage", cb: (e: { key: string | null }) => void): void;
  removeEventListener(tipo: "storage", cb: (e: { key: string | null }) => void): void;
}

/**
 * Carrito en localStorage con la clave v2. Si no hay carrito v2 pero sí uno de la v1,
 * lo migra una sola vez y borra el viejo.
 */
export class CarritoLocal implements CarritoAlmacen {
  constructor(
    private readonly almacen: AlmacenTexto,
    private readonly ventana: EscuchaStorage | null = null,
    private readonly max?: number,
  ) {}

  cargar(): CarritoGuardado {
    const v2 = this.leer(CLAVE_CARRITO_V2);
    if (v2 !== null) return parsearCarrito(v2, this.max);

    const migrado = migrarCarritoV1(this.leer(CLAVE_CARRITO_V1), ID_V1_A_SLUG, this.max);
    if (migrado) {
      this.guardar(migrado);
      this.borrar(CLAVE_CARRITO_V1);
      return migrado;
    }
    return { version: 2, lineas: [] };
  }

  guardar(carrito: Omit<CarritoGuardado, "version">): void {
    try {
      this.almacen.setItem(CLAVE_CARRITO_V2, serializarCarrito(carrito));
    } catch {
      // Modo privado o almacenamiento lleno: el carrito sigue funcionando en memoria.
    }
  }

  suscribir(alCambiar: () => void): () => void {
    if (!this.ventana) return () => {};
    const escucha = (e: { key: string | null }) => {
      if (e.key === CLAVE_CARRITO_V2 || e.key === null) alCambiar();
    };
    this.ventana.addEventListener("storage", escucha);
    return () => this.ventana?.removeEventListener("storage", escucha);
  }

  private leer(clave: string): string | null {
    try {
      return this.almacen.getItem(clave);
    } catch {
      return null;
    }
  }

  private borrar(clave: string) {
    try {
      this.almacen.removeItem(clave);
    } catch {
      /* sin permiso: se deja */
    }
  }
}
