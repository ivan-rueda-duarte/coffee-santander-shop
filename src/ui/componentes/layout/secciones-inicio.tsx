import type { ContenidoHistoria, ContenidoInicio } from "@/application/puertos";
import type { VistaCatalogo } from "@/application/casos-uso/obtener-catalogo";
import { BotonEnlace } from "../marca/boton";
import { Antetitulo, BarraAcento } from "../marca/etiquetas";
import { Foto, Franja, Hoja, Textura } from "../marca/superficies";

/** Titular Fraunces con una sola palabra o frase de remate en itálica 400. */
export function Titular({ nivel: Nivel = "h2", antes, remate, className }: { nivel?: "h1" | "h2"; antes: string; remate?: string | null; className?: string }) {
  return (
    <Nivel className={className}>
      {antes}
      {remate && (
        <>
          {" "}
          <em className="font-normal">{remate}</em>
        </>
      )}
    </Nivel>
  );
}

export function Portada({ catalogo, contenido }: { catalogo: VistaCatalogo; contenido: ContenidoInicio | null }) {
  const n = catalogo.cafes.length;
  const bajada =
    contenido?.bajada ??
    (n > 0
      ? "Café de especialidad de marca propia, de provincias de Santander. Elige tu provincia y pide por WhatsApp."
      : "Estamos preparando la próxima cosecha. Escríbenos por WhatsApp y te avisamos cuando haya café.");

  return (
    <div data-theme="dark">
      <Textura trama="oscuro" como="section" aria-labelledby="titulo-portada" className="relative overflow-hidden bg-surface text-ink">
        <Hoja className="hoja-portada" />
        <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-16 md:px-8 md:pb-32 md:pt-24">
          <Antetitulo>Café de especialidad · Santander</Antetitulo>
          <Titular
            nivel="h1"
            antes={contenido?.titular ?? "El café que crece entre cañones y"}
            remate={contenido ? contenido.remate : "montañas de Santander"}
            className="display-xl mt-4 max-w-3xl text-ink-title max-md:!text-[40px] max-md:!leading-[46px]"
          />
          <p className="body-l mt-5 max-w-xl text-ink-muted">{bajada}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <BotonEnlace href="#catalogo" variante="oro" tamano="lg">
              {contenido?.textoBoton ?? "Ver cafés"}
            </BotonEnlace>
          </div>
        </div>
      </Textura>
      <Franja />
    </div>
  );
}

const textoPasos = (catalogo: VistaCatalogo, contenido: ContenidoInicio | null) => {
  if (contenido && contenido.comoPedir.length) return contenido.comoPedir;
  const { tienda } = catalogo;
  const tamanos = [...new Set(catalogo.cafes.flatMap((c) => c.presentaciones.map((p) => p.gramos)))].sort((a, b) => a - b);
  const lista = tamanos.length > 1 ? `${tamanos.slice(0, -1).join(" g, ")} g o ${tamanos[tamanos.length - 1]} g` : `${tamanos[0] ?? 250} g`;
  const pagos = tienda.formasPago.map((p) => p.toLowerCase());
  const pagosTexto = pagos.length > 1 ? `${pagos.slice(0, -1).join(", ")} y ${pagos[pagos.length - 1]}` : pagos[0];
  return [
    { titulo: "Elige tus cafés", texto: `Cada café viene en bolsa de ${lista}, en grano entero o molido. El precio de cada bolsa está en su tarjeta y en su ficha.` },
    { titulo: "Envía el pedido por WhatsApp", texto: "Completas tus datos de envío y se abre WhatsApp con tu pedido ya escrito. Con ese mensaje nos pides el pedido." },
    { titulo: "Confirmamos envío y pago", texto: `Despachamos desde ${tienda.ciudadDespacho} a todo Colombia. Ves el envío en tu carrito; si hay que cotizarlo, te lo confirmamos antes de que pagues. Pagas con ${pagosTexto}.` },
  ];
};

export function ComoPedir({ catalogo, contenido }: { catalogo: VistaCatalogo; contenido: ContenidoInicio | null }) {
  const pasos = textoPasos(catalogo, contenido);
  return (
    <section id="pedir" aria-labelledby="titulo-pedir" className="scroll-mt-20 bg-surface px-5 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <Antetitulo>Tres pasos</Antetitulo>
        <Titular antes="Cómo" remate="pedir" className="display-l mt-3 text-ink-title max-md:!text-[36px] max-md:!leading-[42px]" />
        <ol className="mt-10 grid gap-10 md:grid-cols-3">
          {pasos.slice(0, 3).map((p, i) => (
            <li key={p.titulo}>
              <BarraAcento />
              <p className="stat mt-4 text-ink-title" aria-hidden="true">{i + 1}</p>
              <h3 className="h3 mt-2 text-ink-title">{p.titulo}</h3>
              <p className="body mt-2 text-ink-muted">{p.texto}</p>
            </li>
          ))}
        </ol>
        <p className="body mt-12 max-w-2xl rounded-lg bg-surface-sunken p-5">
          ¿Compras para tu negocio o necesitas más de {catalogo.tienda.maxCantidad} bolsas de un café?{" "}
          <a className="font-semibold underline underline-offset-4" href={`https://wa.me/${catalogo.tienda.whatsapp}`} target="_blank" rel="noopener noreferrer">
            Escríbenos por WhatsApp
          </a>{" "}
          y armamos el pedido contigo.
        </p>
      </div>
    </section>
  );
}

// Solo afirmaciones confirmadas por la marca (PRODUCT.md, «Brand Commitments»).
const HISTORIA_RESPALDO = {
  parrafos: [
    "De Santander es una marca propia de café de especialidad. Compramos a fincas de familias santandereanas con tradición cafetera, lo tostamos por lotes y lo enviamos a todo Colombia.",
    "En cada café verás la provincia, el municipio, la altitud, la variedad y el proceso.",
  ],
  proceso: [
    { titulo: "Cosecha", texto: "Recolección manual en el punto de maduración." },
    { titulo: "Secado", texto: "Secado al sol." },
    { titulo: "Tueste", texto: "Tueste por lotes según el perfil de cada café." },
  ],
};

export function Historia({ contenido }: { contenido: ContenidoHistoria | null }) {
  const parrafos = contenido?.texto.length ? contenido.texto : HISTORIA_RESPALDO.parrafos;
  const proceso = contenido?.proceso.length ? contenido.proceso : HISTORIA_RESPALDO.proceso;
  const foto = contenido?.foto ?? { url: "/assets/fotografia/cafetal-montana.jpg", alt: "Cafetal entre montañas de Santander con niebla de la mañana", credito: "De Santander" };
  return (
    <div data-theme="dark">
      <Textura trama="oscuro" como="section" id="historia" aria-labelledby="titulo-historia" className="scroll-mt-20 bg-surface px-5 py-16 text-ink md:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-2">
          <div>
            <Antetitulo>Nuestra historia</Antetitulo>
            <Titular antes={contenido?.titular ?? "Santander"} remate={contenido ? contenido.remate : "en cada taza"} className="display-l mt-3 text-ink-title max-md:!text-[36px] max-md:!leading-[42px]" />
            <div className="body-l mt-6 max-w-xl space-y-4 text-ink-muted">
              {parrafos.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            {contenido?.cita && (
              <blockquote className="quote mt-8 max-w-xl text-chicamocha-300">
                «{contenido.cita.texto}»
                {(contenido.cita.autor || contenido.cita.lugar) && (
                  <footer className="caption mt-2 not-italic text-ink-muted">{[contenido.cita.autor, contenido.cita.lugar].filter(Boolean).join(" · ")}</footer>
                )}
              </blockquote>
            )}
          </div>
          <div className="space-y-8">
            <Foto src={foto.url} alt={foto.alt} credito={foto.credito} ancho={2000} alto={1125} className="aspect-[16/10]" />
            <div>
              <h3 className="h3 text-ink-title">Del cafetal a la taza</h3>
              <ol className="mt-4 divide-y divide-line">
                {proceso.map((p) => (
                  <li key={p.titulo} className="py-3">
                    <strong className="block text-sm font-extrabold uppercase tracking-widest text-eyebrow">{p.titulo}</strong>
                    <span className="body text-ink-muted">{p.texto}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </Textura>
    </div>
  );
}
