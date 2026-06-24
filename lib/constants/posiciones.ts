export const POSICIONES = [
  { value: 'ACOMODO', label: 'Acomodo' },
  { value: 'CENTRAL', label: 'Central' },
  { value: 'BANDA', label: 'Banda' },
  { value: 'LIBERO', label: 'Líbero' },
  { value: 'OPUESTO', label: 'Opuesto' },
] as const

export type PosicionValue = typeof POSICIONES[number]['value']

export function labelPosicion(value: string | null | undefined): string {
  return POSICIONES.find((p) => p.value === value)?.label ?? '—'
}

const ALIAS_POSICION: Record<string, PosicionValue> = {
  colocador: 'ACOMODO',
  armadora: 'ACOMODO',
  armador: 'ACOMODO',
  acomodo: 'ACOMODO',
  central: 'CENTRAL',
  banda: 'BANDA',
  libero: 'LIBERO',
  opuesto: 'OPUESTO',
  opuesta: 'OPUESTO',
}

// Normaliza cualquier variante histórica (acentos, mayúsculas, género) al
// valor canónico del enum. Usado tanto en la migración única como en el
// import masivo por Excel, para que ambos caminos compartan la misma regla.
export function normalizePosicion(raw: string | null | undefined): PosicionValue | null {
  if (!raw) return null
  const sinAcentos = raw.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  return ALIAS_POSICION[sinAcentos] ?? null
}
