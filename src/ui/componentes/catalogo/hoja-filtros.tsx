"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { textoContador } from "@/domain/catalogo/filtros";
import type { EstadoFiltros } from "@/ui/hooks/use-filtros-catalogo";
import { Boton } from "../marca/boton";
import { IconoCerrar } from "../marca/iconos";
import { PanelFiltros } from "./panel-filtros";

/** Hoja inferior de filtros para celular. Se carga la primera vez que se abre. */
export default function HojaFiltros({ f, abierta, alCambiar }: { f: EstadoFiltros; abierta: boolean; alCambiar: (abierta: boolean) => void }) {
  return (
    <Dialog.Root open={abierta} onOpenChange={alCambiar}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-scrim" />
        <Dialog.Content aria-describedby={undefined} data-theme="light" className="fixed inset-x-0 bottom-0 z-50 flex max-h-[88vh] flex-col rounded-t-lg bg-surface text-ink shadow-md">
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <Dialog.Title className="h3 text-ink-title">Filtros</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" aria-label="Cerrar filtros" className="grid h-11 w-11 place-items-center rounded-pill hover:bg-surface-sunken">
                <IconoCerrar />
              </button>
            </Dialog.Close>
          </header>
          <div className="overflow-y-auto px-5 py-5">
            <PanelFiltros f={f} incluirProvincias={false} />
          </div>
          <footer className="flex gap-3 border-t border-line bg-surface-raised px-5 py-4">
            {f.activos.length > 0 && (
              <Boton variante="secundario" onClick={f.limpiar}>
                Limpiar
              </Boton>
            )}
            <Dialog.Close asChild>
              <Boton bloque>Ver {textoContador(f.resultados.length, [])}</Boton>
            </Dialog.Close>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
