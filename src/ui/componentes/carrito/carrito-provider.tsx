"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import type { CarritoAlmacen } from "@/application/puertos";
import { ETIQUETA_MOLIENDA, estaDisponible, type Cafe, type Molienda } from "@/domain/catalogo/tipos";
import { claveLinea, crearCarrito, depurarLineas, reducirCarrito, type LineaCarrito } from "@/domain/pedido/carrito";
import { calcularTotales, type Totales } from "@/domain/pedido/totales";
import { useAvisos } from "../layout/avisos";
import { useCatalogo } from "@/ui/hooks/use-catalogo";

export interface Preferencias {
  formaPago?: string;
  municipio?: string;
}

interface Valor {
  lineas: LineaCarrito[];
  totales: Totales;
  /** false hasta que se lee el carrito guardado en el navegador. */
  listo: boolean;
  puedeDeshacer: boolean;
  preferencias: Preferencias;
  cajonAbierto: boolean;
  abrirCajon: () => void;
  cerrarCajon: () => void;
  /** Devuelve el foco a quien abrió el cajón (o al botón «Pedido» si ya no existe). */
  devolverFoco: () => void;
  agregar: (cafe: Cafe, gramos?: number, molienda?: Molienda, cantidad?: number) => void;
  cambiarCantidad: (clave: string, delta: number) => void;
  actualizar: (clave: string, cambios: Partial<Pick<LineaCarrito, "gramos" | "molienda">>) => void;
  eliminar: (clave: string) => void;
  vaciar: () => void;
  deshacer: () => void;
  guardarPreferencias: (p: Preferencias) => void;
}

const Contexto = createContext<Valor | null>(null);

/** Carrito en memoria, guardado en localStorage (clave v2, con migración desde la v1) y sincronizado entre pestañas. */
export function CarritoProvider({ crearAlmacen, children }: { crearAlmacen: (max: number) => CarritoAlmacen; children: ReactNode }) {
  const { catalogo, buscarCafe, buscarPrecio } = useCatalogo();
  const { avisar, descartar } = useAvisos();
  const max = catalogo.tienda.maxCantidad;

  const [estado, dispatch] = useReducer(reducirCarrito, undefined, () => crearCarrito([], max));
  const [preferencias, setPreferencias] = useState<Preferencias>({});
  const [listo, setListo] = useState(false);
  const [cajonAbierto, setCajonAbierto] = useState(false);
  const almacen = useRef<CarritoAlmacen | null>(null);
  const ultimoAviso = useRef<unknown>(null);
  const quienAbrio = useRef<HTMLElement | null>(null);
  const abrir = useCallback(() => {
    quienAbrio.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    descartar();
    setCajonAbierto(true);
  }, [descartar]);
  const devolverFoco = useCallback(() => {
    const el = quienAbrio.current;
    (el?.isConnected ? el : document.getElementById("boton-pedido"))?.focus();
  }, []);

  // Solo se conservan las líneas de cafés que siguen en el catálogo y disponibles.
  const esValida = useCallback(
    (l: LineaCarrito) => {
      const cafe = buscarCafe(l.cafeSlug);
      return Boolean(cafe && cafe.moliendas.includes(l.molienda) && cafe.presentaciones.some((p) => p.gramos === l.gramos && p.disponible));
    },
    [buscarCafe],
  );

  const leer = useCallback(() => {
    const guardado = almacen.current!.cargar();
    dispatch({ tipo: "reemplazar", lineas: depurarLineas(guardado.lineas, esValida, max) });
    setPreferencias({ formaPago: guardado.formaPago, municipio: guardado.municipio });
  }, [esValida, max]);

  useEffect(() => {
    almacen.current = crearAlmacen(max);
    // El carrito guardado solo existe en el navegador: se lee tras hidratar para no desajustar el HTML del servidor.
    /* eslint-disable react-hooks/set-state-in-effect */
    leer();
    setListo(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    return almacen.current.suscribir(leer);
  }, [leer, max, crearAlmacen]);

  useEffect(() => {
    if (listo) almacen.current?.guardar({ lineas: estado.lineas, ...preferencias });
  }, [listo, estado.lineas, preferencias]);

  useEffect(() => {
    if (estado.aviso && estado.aviso !== ultimoAviso.current) {
      avisar(`Puedes pedir hasta ${max} bolsas de cada café y tamaño aquí. Para más, escríbenos por WhatsApp.`);
    }
    ultimoAviso.current = estado.aviso;
  }, [estado.aviso, avisar, max]);

  const totales = useMemo(() => calcularTotales(estado.lineas, buscarPrecio), [estado.lineas, buscarPrecio]);

  const deshacer = useCallback(() => dispatch({ tipo: "deshacer" }), []);
  const nombreDe = useCallback((slug: string) => buscarCafe(slug)?.nombre ?? slug, [buscarCafe]);

  const valor = useMemo<Valor>(
    () => ({
      lineas: estado.lineas,
      totales,
      listo,
      puedeDeshacer: estado.deshacer !== null,
      preferencias,
      cajonAbierto,
      abrirCajon: abrir,
      cerrarCajon: () => setCajonAbierto(false),
      devolverFoco,
      agregar: (cafe, gramos, molienda, cantidad) => {
        const presentacion = cafe.presentaciones.find((p) => p.disponible && (gramos === undefined || p.gramos === gramos));
        if (!estaDisponible(cafe) || !presentacion) return;
        const m = molienda ?? cafe.moliendas[0];
        dispatch({ tipo: "agregar", linea: { cafeSlug: cafe.slug, gramos: presentacion.gramos, molienda: m }, cantidad });
        avisar(`Agregaste ${cafe.nombre}: ${presentacion.gramos} g, ${ETIQUETA_MOLIENDA[m].toLowerCase()}.`, {
          etiqueta: "Ver pedido",
          alPulsar: abrir,
        });
      },
      cambiarCantidad: (clave, delta) => {
        const l = estado.lineas.find((x) => claveLinea(x) === clave);
        dispatch({ tipo: "cambiarCantidad", clave, delta });
        if (l && l.cantidad + delta <= 0) avisar(`${nombreDe(l.cafeSlug)} quitado del pedido.`, { etiqueta: "Deshacer", alPulsar: deshacer });
      },
      actualizar: (clave, cambios) => dispatch({ tipo: "actualizar", clave, cambios }),
      eliminar: (clave) => {
        const l = estado.lineas.find((x) => claveLinea(x) === clave);
        dispatch({ tipo: "eliminar", clave });
        if (l) avisar(`${nombreDe(l.cafeSlug)} quitado del pedido.`, { etiqueta: "Deshacer", alPulsar: deshacer });
      },
      vaciar: () => {
        dispatch({ tipo: "vaciar" });
        avisar("Vaciaste el pedido.", { etiqueta: "Deshacer", alPulsar: deshacer });
      },
      deshacer,
      guardarPreferencias: (p) => setPreferencias((previas) => ({ ...previas, ...p })),
    }),
    [estado.lineas, estado.deshacer, totales, listo, preferencias, cajonAbierto, avisar, deshacer, nombreDe, abrir, devolverFoco],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useCarrito(): Valor {
  const v = useContext(Contexto);
  if (!v) throw new Error("useCarrito debe usarse dentro de <CarritoProvider>");
  return v;
}
