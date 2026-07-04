// new Date('YYYY-MM-DD') interpreta la cadena como medianoche UTC, lo que
// puede correr el día mostrado un día atrás en zonas horarias negativas
// (México es UTC-6). Estas funciones trabajan siempre en hora local.
export function parseFechaLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toISODateLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
