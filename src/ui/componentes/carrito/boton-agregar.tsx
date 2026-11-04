"use client";

import { estaDisponible, type Cafe } from "@/domain/catalogo/tipos";
import { Boton } from "../marca/boton";
import { Pastilla } from "../marca/etiquetas";
import { useCarrito } from "./carrito-provider";

/** «Agregar» de la tarjeta: primer tamaño disponible, en grano entero (se cambia después en el pedido). */
export function BotonAgregar({ cafe }: { cafe: Cafe }) {
  const { agregar } = useCarrito();
  if (!estaDisponible(cafe)) return <Pastilla variante="agotado">Agotado</Pastilla>;
  const primera = cafe.presentaciones.find((p) => p.disponible);
  return (
    <Boton tamano="sm" onClick={() => agregar(cafe)} aria-label={`Agregar ${cafe.nombre}, ${primera?.gramos} g en grano entero, al pedido`}>
      Agregar
    </Boton>
  );
}
