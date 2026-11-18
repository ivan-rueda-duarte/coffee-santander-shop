import Link from "next/link";

/**
 * Migas de pan (Server Component). Viven en su propio módulo: importadas desde ficha-cafe.tsx metían en /envios/, las
 * páginas legales y las de provincia la isla BloqueCompra de la ficha, y al precargar «Envíos» desde el inicio se
 * descargaba ese trozo de JS (QA-018).
 */
export function Migas({ items }: { items: { texto: string; href?: string }[] }) {
  return (
    <nav aria-label="Ruta de navegación" className="caption text-ink-muted">
      <ol className="flex flex-wrap items-center gap-x-2">
        {items.map((i, n) => (
          <li key={i.texto} className="flex items-center gap-2">
            {i.href ? (
              <Link href={i.href} className="relative underline-offset-4 hover:underline before:absolute before:content-[''] before:-inset-x-1.5 before:-inset-y-[13px]">
                {i.texto}
              </Link>
            ) : (
              <span aria-current="page" className="font-semibold text-ink">{i.texto}</span>
            )}
            {n < items.length - 1 && <span aria-hidden="true">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
