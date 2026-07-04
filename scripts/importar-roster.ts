// Carga masiva de roster desde Excel. Uso: npm run importar-roster <archivo.xlsx>
// El Excel debe tener hojas "VARONIL" y "FEMENIL" con las columnas documentadas abajo.
import 'dotenv/config'
import * as XLSX from 'xlsx'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { generarClaveAcceso } from '../lib/utils/generarClave'
import { ramaFromGenero } from '../lib/constants/genero'

type Genero = 'F' | 'M'
type Hoja = 'VARONIL' | 'FEMENIL'

function parseSemestre(val: unknown): number {
  if (!val) return 1
  const s = val.toString().replace(/[°ºROVOMO\s]/gi, '').trim()
  const n = parseInt(s, 10)
  return isNaN(n) ? 1 : Math.max(1, Math.min(12, n))
}

const str = (v: unknown): string => (v ?? '').toString().trim()
const strOrNull = (v: unknown): string | null => str(v) || null
const num = (v: unknown): number | null => {
  const n = parseInt(str(v), 10)
  return isNaN(n) ? null : n
}

// AÑO DE INGRESO en el Excel real llega inconsistente: años completos ("2024"),
// fechas que Excel auto-formateó ("2024-08-24 00:00:00") o texto tipo
// "Aug-24"/"20-Aug" (mes + número de 2 dígitos, en cualquier orden). Como el
// campo es "año" y no "fecha", cualquier número de 2 dígitos junto a un mes se
// interpreta como año (20XX), nunca como día. Devuelve null solo si no hay
// ninguna señal reconocible (celda vacía o texto sin año ni mes).
function parseAnio(val: unknown): number | null {
  const s = str(val)
  if (!s) return null

  const anioCompleto = s.match(/\b(20\d{2})\b/)
  if (anioCompleto) return parseInt(anioCompleto[1], 10)

  const conMes = s.match(/(\d{2})[-\s]?[A-Za-z]{3}\b/) ?? s.match(/[A-Za-z]{3}[-\s]?(\d{2})\b/)
  if (conMes) return 2000 + parseInt(conMes[1], 10)

  const n = parseInt(s, 10)
  return n >= 2000 && n <= 2100 ? n : null
}

// ponytail: 10 intentos contra 90 combinaciones posibles por género/año — igual
// que generarClaveUnica en actions/atletas.ts, duplicado aquí por ser un script aparte.
async function generarClaveUnica(genero: Genero): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const clave = generarClaveAcceso(genero)
    if (!(await prisma.claveAtleta.findUnique({ where: { clavePlana: clave } }))) return clave
  }
  throw new Error('No se pudo generar una clave de acceso única.')
}

interface Resultado { nombre: string; matricula: string; rama: string; clave: string; accion: 'creado' | 'actualizado' }
interface ErrorFila { hoja: Hoja; fila: number; nombre: string; motivo: string }
interface Aviso { hoja: Hoja; fila: number; nombre: string; motivo: string }

async function procesarHoja(
  wb: XLSX.WorkBook,
  hoja: Hoja,
  resultados: Resultado[],
  errores: ErrorFila[],
  avisos: Aviso[],
  saltados: { hoja: Hoja; fila: number }[]
) {
  const sheet = wb.Sheets[hoja]
  if (!sheet) {
    console.warn(`⚠ Hoja "${hoja}" no encontrada en el archivo, se omite.`)
    return
  }

  // range: 1 salta la fila 1 (título fusionado "SELECCIÓN DE VOLEIBOL UADY — ...")
  // para que la fila 2 (headers reales) se lea como encabezado, no como dato.
  const filas = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '', range: 1 })

  for (let i = 0; i < filas.length; i++) {
    const fila = filas[i]
    // __rowNum__ es la fila física real (0-indexada) que SheetJS adjunta a cada
    // objeto — más confiable que calcular el offset a mano dado el `range: 1`.
    const numFila = ((fila as { __rowNum__?: number }).__rowNum__ ?? i) + 1
    const apellidoPaterno = str(fila['A. PATERNO'])

    if (!apellidoPaterno) {
      saltados.push({ hoja, fila: numFila })
      continue
    }

    try {
      const nombre = str(fila['NOMBRE (S)'])
      const apellidos = `${apellidoPaterno} ${str(fila['A. MATERNO'])}`.trim()
      const genero: Genero = hoja === 'FEMENIL' ? 'F' : 'M'
      const rama = ramaFromGenero(genero)
      const matricula = strOrNull(fila['MATRÍCULA'])
      const anioEgreso = num(fila['AÑO DE EGRESO'])
      const anioIngresoParseado = parseAnio(fila['AÑO DE INGRESO'])
      const anioIngreso = anioIngresoParseado ?? new Date().getFullYear()

      if (anioIngresoParseado === null || !/^\d{4}$/.test(str(fila['AÑO DE INGRESO']))) {
        avisos.push({
          hoja,
          fila: numFila,
          nombre: `${nombre} ${apellidos}`.trim(),
          motivo: anioIngresoParseado === null
            ? `AÑO DE INGRESO vacío/irreconocible ("${str(fila['AÑO DE INGRESO'])}") — se usó ${anioIngreso}, revisar manualmente.`
            : `AÑO DE INGRESO estimado desde "${str(fila['AÑO DE INGRESO'])}" → ${anioIngreso}, verificar.`,
        })
      }

      const datosComunes = {
        nombre,
        apellidos,
        genero,
        rama,
        facultad: str(fila['FACULTAD']),
        directorFacultad: str(fila['DIRECTOR']),
        matricula,
        semestre: parseSemestre(fila['SEMESTRE']),
        telefonoPersonal: str(fila['TELÉFONO']),
        telefonoTutor: str(fila['TELÉFONO FAMILIAR']),
        correo: strOrNull(fila['CORREO']),
        numUniforme: num(fila['# DE UNIFORME']),
        tallaPlayera: strOrNull(fila['TALLA PLAYERA']),
        tallaShort: strOrNull(fila['TALLA SHORT']),
        anioIngreso,
        anioEgreso,
        estado: (anioEgreso ? 'EGRESADO' : 'ACTIVO') as 'ACTIVO' | 'EGRESADO',
      }

      const privado = {
        nss: strOrNull(fila['NSS']),
        seguroAseguradora: strOrNull(fila['ASEGURADORA']),
        seguroPoliza: strOrNull(fila['No. PÓLIZA']),
        seguroTitular: strOrNull(fila['TITULAR PÓLIZA']),
      }

      const existente = matricula ? await prisma.atleta.findFirst({ where: { matricula } }) : null

      let atletaId: string
      let claveMostrada = '(sin cambios)'
      let accion: Resultado['accion']

      if (existente) {
        // Actualiza datos pero NUNCA regenera la clave de acceso existente.
        await prisma.atleta.update({ where: { id: existente.id }, data: datosComunes })
        atletaId = existente.id
        accion = 'actualizado'
      } else {
        const clavePlana = await generarClaveUnica(genero)
        const codigoAcceso = await bcrypt.hash(clavePlana, 10)
        const creado = await prisma.atleta.create({ data: { ...datosComunes, rol: 'JUGADOR', codigoAcceso } })
        atletaId = creado.id
        claveMostrada = clavePlana
        accion = 'creado'
        await prisma.claveAtleta.create({ data: { atletaId, clavePlana } })
      }

      if (privado.nss || privado.seguroAseguradora || privado.seguroPoliza || privado.seguroTitular) {
        await prisma.atletaPrivado.upsert({
          where: { atletaId },
          update: privado,
          create: { atletaId, ...privado },
        })
      }

      resultados.push({ nombre: `${nombre} ${apellidos}`.trim(), matricula: matricula ?? '', rama, clave: claveMostrada, accion })
    } catch (e) {
      errores.push({
        hoja,
        fila: numFila,
        nombre: `${apellidoPaterno} ${str(fila['A. MATERNO'])}`.trim(),
        motivo: e instanceof Error ? e.message : String(e),
      })
    }
  }
}

async function main() {
  const rutaArchivo = process.argv[2]
  if (!rutaArchivo) {
    console.error('Uso: npm run importar-roster <archivo.xlsx>')
    process.exit(1)
  }

  const wb = XLSX.readFile(rutaArchivo)
  const resultados: Resultado[] = []
  const errores: ErrorFila[] = []
  const avisos: Aviso[] = []
  const saltados: { hoja: Hoja; fila: number }[] = []

  for (const hoja of ['VARONIL', 'FEMENIL'] as const) {
    await procesarHoja(wb, hoja, resultados, errores, avisos, saltados)
  }

  console.log('\n=== ATLETAS PROCESADOS ===')
  console.table(
    resultados.map((r) => ({
      Nombre: r.nombre,
      Matrícula: r.matricula,
      Rama: r.rama,
      Acción: r.accion,
      'Código de Acceso': r.clave,
    }))
  )

  const creados = resultados.filter((r) => r.accion === 'creado').length
  const actualizados = resultados.filter((r) => r.accion === 'actualizado').length
  console.log(`\n✅ ${creados} creados · 🔄 ${actualizados} actualizados · ⏭ ${saltados.length} saltados (sin apellido paterno)`)

  if (avisos.length > 0) {
    console.log(`\n⚠ ${avisos.length} filas importadas con AÑO DE INGRESO estimado o faltante — revisar manualmente:`)
    console.table(avisos.map((a) => ({ Hoja: a.hoja, Fila: a.fila, Nombre: a.nombre, Motivo: a.motivo })))
  }

  if (errores.length > 0) {
    console.log(`\n❌ ${errores.length} filas con error:`)
    console.table(errores.map((e) => ({ Hoja: e.hoja, Fila: e.fila, Nombre: e.nombre, Motivo: e.motivo })))
  }

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error('Error fatal:', e)
  await prisma.$disconnect()
  process.exit(1)
})
