"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { UMBRALES_SCA, type Dimension, type FiltroActivo } from "@/domain/catalogo/filtros";
import { ETIQUETA_PERFIL } from "@/domain/catalogo/perfiles";
import { ETIQUETA_PROCESO, ETIQUETA_TUESTE_GRUPO, GRUPOS_TUESTE, type GrupoTueste, type Perfil, type Proceso } from "@/domain/catalogo/tipos";
import { formatearCOP, formatearMiles } from "@/domain/comun/dinero";
import { slugify } from "@/domain/comun/slug";
import { nombreDeVariedad } from "@/domain/marca/variedad";
import { useCatalogo } from "@/ui/hooks/use-catalogo";
import type { EstadoFiltros } from "@/ui/hooks/use-filtros-catalogo";
import { GrupoChips, GrupoOpcionUnica, Interruptor, type OpcionChip } from "./controles-filtro";

// El deslizador (Radix Slider) pesa ~14 KB: se descarga cuando el panel de filtros aparece.
const FiltroRango = dynamic(() => import("./filtro-rango"), { ssr: false, loading: () => <div className="h-14" aria-hidden="true" /> });

export function useOpciones(f: EstadoFiltros) {
  const { catalogo } = useCatalogo();
  return useMemo(() => {
    const { facetas, filtros } = f;
    const conteo = (dim: keyof typeof facetas, v: string) => facetas[dim][v] ?? 0;
    const municipiosVisibles = catalogo.municipios.filter(
      (m) => filtros.provincias.length === 0 || (m.provinciaSlug !== null && filtros.provincias.includes(m.provinciaSlug)),
    );
    const nombresVariedad = new Map<string, string>();
    catalogo.cafes.forEach((c) => c.variedades.forEach((v) => nombresVariedad.set(slugify(v), nombreDeVariedad(v))));
    return {
      provincias: catalogo.provinciasActivas.map<OpcionChip>((p) => ({ valor: p.slug, etiqueta: p.nombreCorto, conteo: conteo("provincias", p.slug), color: p.colorHex })),
      municipios: municipiosVisibles.map<OpcionChip>((m) => ({ valor: m.slug, etiqueta: m.nombre, conteo: conteo("municipios", m.slug) })),
      productores: catalogo.productores.map<OpcionChip>((p) => ({ valor: p.slug, etiqueta: p.nombre, conteo: conteo("productores", p.slug) })),
      procesos: Object.keys(facetas.procesos).map<OpcionChip>((v) => ({ valor: v, etiqueta: ETIQUETA_PROCESO[v as Proceso], conteo: conteo("procesos", v) })),
      variedades: [...nombresVariedad].map<OpcionChip>(([slug, nombre]) => ({ valor: slug, etiqueta: nombre, conteo: conteo("variedades", slug) })),
      tuestes: GRUPOS_TUESTE.filter((g) => g in facetas.tuestes).map<OpcionChip>((g) => ({ valor: g, etiqueta: ETIQUETA_TUESTE_GRUPO[g as GrupoTueste], conteo: conteo("tuestes", g) })),
      perfiles: Object.keys(facetas.perfiles).map<OpcionChip>((v) => ({ valor: v, etiqueta: ETIQUETA_PERFIL[v as Perfil], conteo: conteo("perfiles", v) })),
    };
  }, [catalogo, f]);
}

export function etiquetaActivo(a: FiltroActivo, f: EstadoFiltros, op: ReturnType<typeof useOpciones>): string {
  const { filtros } = f;
  const buscar = (lista: OpcionChip[]) => lista.find((o) => o.valor === a.valor)?.etiqueta ?? a.valor ?? "";
  switch (a.dimension) {
    case "provincias": return buscar(op.provincias);
    case "municipios": return buscar(op.municipios);
    case "productores": return buscar(op.productores);
    case "procesos": return buscar(op.procesos);
    case "variedades": return buscar(op.variedades);
    case "tuestes": return `Tueste ${buscar(op.tuestes).toLowerCase()}`;
    case "perfiles": return buscar(op.perfiles);
    case "altitud": return `${formatearMiles(filtros.altitud![0])}–${formatearMiles(filtros.altitud![1])} m`;
    case "sca": return `SCA ${filtros.scaMinimo}+`;
    case "precio": return `${formatearCOP(filtros.precio![0])}–${formatearCOP(filtros.precio![1])}`;
    case "disponibles": return "Solo en stock";
  }
}

export function PanelFiltros({ f, incluirProvincias }: { f: EstadoFiltros; incluirProvincias: boolean }) {
  const { catalogo } = useCatalogo();
  const op = useOpciones(f);
  const visible = useMemo(() => new Set<Dimension>(catalogo.filtrosVisibles), [catalogo.filtrosVisibles]);
  const { filtros } = f;
  const { altitud, precio } = catalogo.limites;

  return (
    <div className="space-y-6">
      {incluirProvincias && visible.has("provincias") && (
        <GrupoChips leyenda="Provincia" opciones={op.provincias} seleccion={filtros.provincias} alAlternar={f.alternarProvincia} />
      )}
      {visible.has("municipios") && <GrupoChips leyenda="Municipio" opciones={op.municipios} seleccion={filtros.municipios} alAlternar={(v) => f.alternar("municipios", v)} />}
      {visible.has("productores") && <GrupoChips leyenda="Productor o finca" opciones={op.productores} seleccion={filtros.productores} alAlternar={(v) => f.alternar("productores", v)} />}
      {visible.has("procesos") && <GrupoChips leyenda="Proceso" opciones={op.procesos} seleccion={filtros.procesos} alAlternar={(v) => f.alternar("procesos", v)} />}
      {visible.has("variedades") && <GrupoChips leyenda="Variedad" opciones={op.variedades} seleccion={filtros.variedades} alAlternar={(v) => f.alternar("variedades", v)} />}
      {visible.has("tuestes") && <GrupoChips leyenda="Tueste" opciones={op.tuestes} seleccion={filtros.tuestes} alAlternar={(v) => f.alternar("tuestes", v)} />}
      {visible.has("perfiles") && <GrupoChips leyenda="Perfil de taza" opciones={op.perfiles} seleccion={filtros.perfiles} alAlternar={(v) => f.alternar("perfiles", v)} />}
      {visible.has("altitud") && altitud && (
        <FiltroRango leyenda="Altitud" limites={altitud} paso={50} valor={filtros.altitud} formato={(n: number) => `${formatearMiles(n)} m`} alConfirmar={f.cambiarAltitud} />
      )}
      {visible.has("sca") && (
        <GrupoOpcionUnica
          leyenda="Puntaje SCA"
          nombre="sca"
          valor={String(filtros.scaMinimo ?? "")}
          opciones={[{ valor: "", etiqueta: "Todos" }, ...UMBRALES_SCA.map((n) => ({ valor: String(n), etiqueta: `${n}+` }))]}
          alElegir={(v) => f.cambiarSca(v ? Number(v) : null)}
        />
      )}
      {visible.has("precio") && precio && (
        <FiltroRango leyenda="Precio desde" limites={precio} paso={1000} valor={filtros.precio} formato={formatearCOP} alConfirmar={f.cambiarPrecio} />
      )}
      {visible.has("disponibles") && <Interruptor etiqueta="Solo en stock" activo={filtros.soloDisponibles} alCambiar={f.cambiarStock} />}
    </div>
  );
}
