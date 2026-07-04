// Actualiza CURP, fecha de nacimiento y licenciatura de atletas ya importados,
// leyendo las columnas CURP / NACIMIENTO / LICENCIATURA del mismo Excel del roster.
// Identifica al atleta SOLO por MATRÍCULA. No toca claves de acceso ni ningún
// otro campo. Idempotente: re-correrlo solo re-escribe los mismos 3 valores.
// Uso: npm run actualizar-datos <archivo.xlsx>
import 'dotenv/config'
import * as XLSX from 'xlsx'
import { prisma } from '../lib/prisma'

type Hoja = 'VARONIL' | 'FEMENIL'

const str = (v: unknown): string => (v ?? '').toString().trim()

// NACIMIENTO puede llegar como serial de Excel (número), "dd/mm/yyyy" (formato
// es-MX — new Date() lo malinterpretaría como mm/dd) o "yyyy-mm-dd". Siempre
// se construye la fecha en hora local para no correr el día por UTC-6.
function parseFechaNacimiento(val: unknown): Date | null {
  if (typeof val === 'number' && val > 0) {
    return new Date(1899, 11, 30 + Math.floor(val)) // época de Excel: 1899-12-30
  }
  const s = str(val)
  if (!s) return null

  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3])

  const dmy = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/)
  if (dmy) return new Date(+dmy[3], +dmy[2] - 1, +dmy[1])

  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

interface Problema { hoja: Hoja; fila: number; nombre: string; motivo: string }

async function main() {
  const rutaArchivo = process.argv[2]
  if (!rutaArchivo) {
    console.error('❌ Uso: npm run actualizar-datos <archivo.xlsx>')
    process.exit(1)
  }

  const wb = XLSX.readFile(rutaArchivo)

  let actualizados = 0
  let sinMatricula = 0
  let noEncontrados = 0
  const errores: Problema[] = []
  const avisos: Problema[] = []

  for (const hoja of ['VARONIL', 'FEMENIL'] as const) {
    const sheet = wb.Sheets[hoja]
    if (!sheet) {
      console.warn(`⚠ Hoja "${hoja}" no encontrada en el archivo, se omite.`)
      continue
    }

    // range: 1 salta la fila de título fusionado para leer los headers reales.
    const filas = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '', range: 1 })

    for (let i = 0; i < filas.length; i++) {
      const fila = filas[i]
      const numFila = ((fila as { __rowNum__?: number }).__rowNum__ ?? i) + 1
      const apellidoPaterno = str(fila['A. PATERNO'])
      if (!apellidoPaterno) continue // fila vacía

      const nombre = `${apellidoPaterno} ${str(fila['NOMBRE (S)'])}`.trim()

      try {
        const matricula = str(fila['MATRÍCULA'])
        if (!matricula) {
          sinMatricula++
          avisos.push({ hoja, fila: numFila, nombre, motivo: 'Fila sin matrícula — no se puede identificar al atleta.' })
          continue
        }

        const atleta = await prisma.atleta.findFirst({ where: { matricula }, select: { id: true } })
        if (!atleta) {
          noEncontrados++
          errores.push({ hoja, fila: numFila, nombre, motivo: `Matrícula ${matricula} no encontrada en BD.` })
          continue
        }

        const nacimientoRaw = fila['NACIMIENTO']
        const fechaNacimiento = parseFechaNacimiento(nacimientoRaw)
        if (str(nacimientoRaw) && !fechaNacimiento) {
          avisos.push({ hoja, fila: numFila, nombre, motivo: `NACIMIENTO irreconocible ("${str(nacimientoRaw)}") — se dejó sin cambios.` })
        }

        const licenciatura = str(fila['LICENCIATURA'])
        const curp = str(fila['CURP']).toUpperCase()

        // Solo se escribe lo que el Excel trae; celdas vacías o fechas
        // irreconocibles no pisan datos ya existentes en BD.
        await prisma.atleta.update({
          where: { id: atleta.id },
          data: {
            ...(fechaNacimiento && { fechaNacimiento }),
            ...(licenciatura && { licenciatura }),
          },
        })

        if (curp) {
          await prisma.atletaPrivado.upsert({
            where: { atletaId: atleta.id },
            update: { curp },
            create: { atletaId: atleta.id, curp },
          })
        }

        actualizados++
      } catch (e) {
        errores.push({ hoja, fila: numFila, nombre, motivo: e instanceof Error ? e.message : String(e) })
      }
    }
  }

  console.log('\n=== REPORTE DE ACTUALIZACIÓN ===')
  console.log(`✅ Actualizados: ${actualizados}`)
  console.log(`⚠️  Sin matrícula: ${sinMatricula}`)
  console.log(`❌ No encontrados en BD: ${noEncontrados}`)

  if (avisos.length > 0) {
    console.log('\n⚠️  AVISOS:')
    console.table(avisos.map((a) => ({ Hoja: a.hoja, Fila: a.fila, Nombre: a.nombre, Motivo: a.motivo })))
  }
  if (errores.length > 0) {
    console.log('\n❌ FILAS CON PROBLEMAS:')
    console.table(errores.map((e) => ({ Hoja: e.hoja, Fila: e.fila, Nombre: e.nombre, Motivo: e.motivo })))
  }

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error('Error fatal:', e)
  await prisma.$disconnect()
  process.exit(1)
})
