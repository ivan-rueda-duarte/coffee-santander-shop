import type { SVGProps } from "react";

// Iconos dibujados a mano: trazo de 2 px, esquinas redondeadas, un solo color (currentColor).
type Props = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: Props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
      {children}
    </svg>
  );
}

export const IconoCerrar = (p: Props) => <Base {...p}><path d="M6 6l12 12M18 6 6 18" /></Base>;
export const IconoMas = (p: Props) => <Base {...p}><path d="M12 5v14M5 12h14" /></Base>;
export const IconoMenos = (p: Props) => <Base {...p}><path d="M5 12h14" /></Base>;
export const IconoCheck = (p: Props) => <Base {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></Base>;
export const IconoFlecha = (p: Props) => <Base {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Base>;
export const IconoFlechaAtras = (p: Props) => <Base {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></Base>;
export const IconoBolsa = (p: Props) => <Base {...p}><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></Base>;
export const IconoFiltro = (p: Props) => <Base {...p}><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></Base>;
export const IconoCopiar = (p: Props) => <Base {...p}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h8" /></Base>;
export const IconoPapelera = (p: Props) => <Base {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></Base>;
export const IconoChevron = (p: Props) => <Base {...p}><path d="m6 9 6 6 6-6" /></Base>;
export const IconoMenu = (p: Props) => <Base {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Base>;

export const IconoWhatsapp = (p: Props) => (
  <Base {...p}>
    <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z" />
    <path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8a5 5 0 0 1-2.8-2.8l.8-1-1-2-1.5 1Z" />
  </Base>
);
