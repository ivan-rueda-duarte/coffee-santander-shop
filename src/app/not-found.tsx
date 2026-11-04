import { BotonEnlace } from "@/ui/componentes/marca/boton";
import { Antetitulo } from "@/ui/componentes/marca/etiquetas";

export default function NoEncontrada() {
  return (
    <section className="bg-surface px-5 py-24 md:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <Antetitulo>Error 404</Antetitulo>
        <h1 className="display-l mt-3 text-ink-title">Esta página <em className="font-normal">no existe</em></h1>
        <p className="body-l mt-4 text-ink-muted">Puede que el enlace haya cambiado o que el café ya no esté en el catálogo.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <BotonEnlace href="/cafes/">Ver los cafés</BotonEnlace>
          <BotonEnlace href="/" variante="secundario">Ir al inicio</BotonEnlace>
        </div>
      </div>
    </section>
  );
}
