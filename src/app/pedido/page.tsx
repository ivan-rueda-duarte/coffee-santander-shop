import type { Metadata } from "next";
import { FlujoPedido } from "@/ui/componentes/checkout/flujo-pedido";

// El pedido tiene datos personales y no es contenido para buscadores.
export const metadata: Metadata = { title: "Tu pedido", robots: { index: false, follow: false } };

export default function PaginaPedido() {
  return <FlujoPedido />;
}
