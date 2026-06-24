// rama (Femenil/Varonil) es 1:1 derivado de genero (F/M) — nunca se captura
// como input independiente; se calcula aquí para evitar que el dato se desincronice.
export function ramaFromGenero(genero: string | null | undefined): 'Femenil' | 'Varonil' {
  return genero === 'M' ? 'Varonil' : 'Femenil'
}
