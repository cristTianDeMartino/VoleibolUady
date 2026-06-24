// Validación manual (sin librerías externas) — usada tanto en cliente
// (atributos HTML5: pattern/inputMode/maxLength) como en servidor, que es la
// única fuente de verdad real: el cliente nunca es de confianza.

const REGEX_SOLO_DIGITOS = /^\d+$/
const REGEX_SOLO_LETRAS = /^[A-Za-záéíóúÁÉÍÓÚüÜñÑ\s.'-]+$/
const REGEX_NSS = /^\d{11}$/
const REGEX_TELEFONO = /^\d{10}$/

export function validarMatricula(v: string): string | null {
  return REGEX_SOLO_DIGITOS.test(v) ? null : 'La matrícula solo puede contener dígitos numéricos.'
}

export function validarDirector(v: string): string | null {
  return REGEX_SOLO_LETRAS.test(v) ? null : 'El nombre del director no puede contener números.'
}

export function validarNSS(v: string): string | null {
  return REGEX_NSS.test(v) ? null : 'El NSS debe tener exactamente 11 dígitos.'
}

export function validarTelefono(v: string): string | null {
  return REGEX_TELEFONO.test(v) ? null : 'El teléfono debe tener exactamente 10 dígitos.'
}

export function validarAnioIngreso(anio: number): string | null {
  const actual = new Date().getFullYear()
  return anio >= 2000 && anio <= actual ? null : 'El año de ingreso debe estar entre 2000 y el año actual.'
}

export function aniosDesde2000(): number[] {
  const actual = new Date().getFullYear()
  return Array.from({ length: actual - 2000 + 1 }, (_, i) => actual - i)
}
