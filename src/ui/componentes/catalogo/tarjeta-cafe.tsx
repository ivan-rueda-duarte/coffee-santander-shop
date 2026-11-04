import Link from "next/link";
import { ETIQUETA_PROCESO, ETIQUETA_TUESTE, grupoDeTueste, mostrarSelloSca, precioDesde, type Cafe } from "@/domain/catalogo/tipos";
import { formatearCOP, formatearMiles } from "@/domain/comun/dinero";
import { nombresDeVariedades } from "@/domain/marca/variedad";
import { BotonAgregar } from "../carrito/boton-agregar";
import { BarraAcento, Pastilla, SelloSCA } from "../marca/etiquetas";
import { BolsaIlustrada, Foto } from "../marca/superficies";

/** Tarjeta de café (page_style/components/ProductCard): ilustración 3:4, pastilla de provincia, sello SCA verificado, datos en silencio y un solo botón. */
export function TarjetaCafe({ cafe }: { cafe: Cafe }) {
  const desde = precioDesde(cafe);
  const datos: [string, string][] = [
    ["Altitud", cafe.alturaMsnm ? `${formatearMiles(cafe.alturaMsnm)} m` : ""],
    ["Variedad", nombresDeVariedades(cafe.variedades)],
    ["Proceso", ETIQUETA_PROCESO[cafe.proceso]],
    ["Tamaños", cafe.presentaciones.map((p) => `${p.gramos} g`).join(" · ")],
  ];
  return (
    <article className="ds-card relative h-full">
      <div className="ds-card__media">
        {cafe.fotos[0] ? (
          <Foto src={cafe.fotos[0]} alt={cafe.fotoDescripcion ?? cafe.nombre} ancho={600} alto={800} redondeada={false} className="absolute inset-0 h-full" />
        ) : (
          <BolsaIlustrada tueste={grupoDeTueste(cafe.tueste)} nombre={cafe.nombre} />
        )}
        {cafe.provincia && <Pastilla variante="region">{cafe.provincia}</Pastilla>}
        {mostrarSelloSca(cafe) && <SelloSCA puntaje={cafe.puntajeSca!} tamano="sm" />}
      </div>
      <div className="ds-card__body">
        <p className="ds-card__origin">{cafe.municipio}</p>
        <h3 className="ds-card__title">
          <Link href={`/cafes/${cafe.slug}/`} className="after:absolute after:inset-0 hover:underline focus-visible:underline">
            {cafe.nombre}
          </Link>
        </h3>
        {cafe.notasCata.length > 0 && <p className="ds-card__notes">{cafe.notasCata.join(", ")}</p>}
        <p className="ds-card__roast">
          <BarraAcento color="terracota" />
          Tueste {ETIQUETA_TUESTE[cafe.tueste].toLowerCase()}
        </p>
        <dl className="ds-card__meta">
          {datos.filter(([, v]) => v).map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="ds-card__foot relative z-10">
          <p className="ds-card__price">
            {desde !== null ? formatearCOP(desde) : "Consultar"}
            <small>desde</small>
          </p>
          <BotonAgregar cafe={cafe} />
        </div>
      </div>
    </article>
  );
}
