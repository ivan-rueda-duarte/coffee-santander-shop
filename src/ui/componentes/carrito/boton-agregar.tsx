// Sin "use client": la isla vive en carrito-provider.tsx, el módulo cliente que el layout ya descarga, para que la
// tarjeta (Server Component) no pida un trozo de JS aparte al cargar la página (QA-018).
export { BotonAgregar } from "./carrito-provider";
