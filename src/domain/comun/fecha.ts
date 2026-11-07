const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/** "2026-11-06" → "6 de noviembre de 2026". Lanza si la fecha no es ISO yyyy-mm-dd válida. */
export function fechaEnLetras(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  const mes = m ? MESES[Number(m[2]) - 1] : undefined;
  if (!m || !mes || Number(m[3]) < 1 || Number(m[3]) > 31) throw new RangeError(`"${iso}" no es una fecha año-mes-día`);
  return `${Number(m[3])} de ${mes} de ${Number(m[1])}`;
}
