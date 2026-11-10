"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useCatalogo } from "@/ui/hooks/use-catalogo";
import { BotonEnlace, Boton } from "../marca/boton";
import { IconoCerrar, IconoFlecha } from "../marca/iconos";
import { LineaPedido } from "./linea-pedido";
import { useCarrito } from "./carrito-provider";
import { TotalesPedido } from "./totales-pedido";

/** Cajón lateral «Tu pedido». Foco atrapado, el resto de la página queda inerte y Esc lo cierra (Radix). */
export default function CajonContenido() {
  const { lineas, totales, cajonAbierto, cerrarCajon, abrirCajon, devolverFoco, puedeDeshacer, deshacer, vaciar } = useCarrito();
  const { catalogo } = useCatalogo();
  const vacio = lineas.length === 0;

  return (
    <Dialog.Root open={cajonAbierto} onOpenChange={(abierto) => (abierto ? abrirCajon() : cerrarCajon())}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-scrim" />
        <Dialog.Content
          aria-describedby="cajon-descripcion"
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            devolverFoco();
          }}
          // Los avisos («Deshacer») viven fuera del cajón: tocarlos no debe cerrarlo.
          onInteractOutside={(e) => {
            if (e.target instanceof Element && e.target.closest("[data-aviso]")) e.preventDefault();
          }}
          data-theme="light"
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[440px] flex-col bg-surface text-ink shadow-md"
        >
          <header className="flex items-center justify-between border-b border-line px-6 py-4">
            <Dialog.Title className="h3 text-ink-title">Tu pedido</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" aria-label="Cerrar pedido" className="grid h-11 w-11 place-items-center rounded-pill hover:bg-surface-sunken">
                <IconoCerrar />
              </button>
            </Dialog.Close>
          </header>

          <Dialog.Description id="cajon-descripcion" className="sr-only">
            Cafés que agregaste, con tamaño, molienda y cantidad. El envío se calcula al elegir tu ciudad.
          </Dialog.Description>

          <div className="flex-1 overflow-y-auto px-6">
            {vacio ? (
              <div className="py-16 text-center">
                <p className="h3 text-ink-title">Tu pedido está vacío</p>
                <p className="body mt-2 text-ink-muted">Agrega un café para armar tu pedido.</p>
                <div className="mt-6 flex justify-center gap-3">
                  <BotonEnlace href="/#catalogo" variante="secundario" onClick={cerrarCajon}>
                    Ver los cafés
                  </BotonEnlace>
                  {puedeDeshacer && (
                    <Boton variante="enlace" onClick={deshacer}>
                      Deshacer
                    </Boton>
                  )}
                </div>
              </div>
            ) : (
              <>
                {puedeDeshacer && (
                  <p className="flex items-center justify-between gap-3 rounded-md bg-surface-sunken px-4 py-2 text-sm">
                    Cambiaste tu pedido.
                    <Boton variante="enlace" tamano="sm" onClick={deshacer}>
                      Deshacer
                    </Boton>
                  </p>
                )}
              <ul>
                {totales.lineas.map((l) => (
                  <LineaPedido key={`${l.cafeSlug}|${l.gramos}|${l.molienda}`} linea={l} />
                ))}
              </ul>
              </>
            )}
          </div>

          {!vacio && (
            <footer className="border-t border-line bg-surface-raised px-6 py-5">
              <TotalesPedido totales={totales} destino={null} ciudadDespacho={catalogo.tienda.ciudadDespacho} className="text-sm" alNavegar={cerrarCajon} />
              <BotonEnlace href="/pedido/" bloque tamano="lg" className="mt-4" onClick={cerrarCajon}>
                Continuar con el pedido <IconoFlecha className="ds-btn__icon" />
              </BotonEnlace>
              <div className="mt-2 flex justify-center">
                <Boton variante="enlace" tamano="sm" onClick={vaciar}>
                  Vaciar pedido
                </Boton>
              </div>
            </footer>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

