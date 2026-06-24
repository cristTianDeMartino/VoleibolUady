// Clave puramente numérica — nunca depende de nombre/matrícula, así una
// corrección de datos del atleta nunca invalida su clave de acceso.
export function generarClaveAcceso(genero: 'F' | 'M'): string {
  const prefijo = genero === 'F' ? '02' : '01'
  const anio = String(new Date().getFullYear()).slice(-2)
  const sufijo = String(Math.floor(Math.random() * 90) + 10)
  return `${prefijo}${anio}${sufijo}`
}
