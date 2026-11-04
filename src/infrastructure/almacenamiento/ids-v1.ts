// La v1 identificaba cada café con un número. Esta tabla solo sirve para migrar carritos viejos
// (`desantander.carrito.v1`) y no cambia: los cafés nuevos no necesitan entrada aquí.
export const ID_V1_A_SLUG: Readonly<Record<number, string>> = {
  1: "cafe-altura-de-socorro",
  2: "cafe-barichara",
  3: "cafe-san-gil",
  4: "cafe-malaga",
  5: "cafe-oiba",
};
