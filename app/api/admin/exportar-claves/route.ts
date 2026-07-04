import ExcelJS from 'exceljs'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { ramaFromGenero } from '@/lib/constants/genero'

// Celdas vacías cuando el campo no tiene valor — nunca "null", "undefined" ni "Sin registrar".
const cell = (v: string | number | null | undefined): string | number => v ?? ''

const UADY_GOLD = 'FFF5A623'
const UADY_BLUE = 'FF1B2A4A'
const BORDER_GRAY = 'FFCCCCCC'
const ROW_ALT_BG = 'FFF2F5F9'
const CODE_BG = 'FFFFF3CD'

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: BORDER_GRAY } },
  left: { style: 'thin', color: { argb: BORDER_GRAY } },
  bottom: { style: 'thin', color: { argb: BORDER_GRAY } },
  right: { style: 'thin', color: { argb: BORDER_GRAY } },
}

const COLUMNAS: { header: string; width: number }[] = [
  { header: 'No.', width: 5 },
  { header: 'RAMA', width: 9.1 }, // ponytail: exceljs 4.4.0 silently drops a column width of exactly 9 on write; nudged to dodge the bug
  { header: 'A. PATERNO', width: 14 },
  { header: 'A. MATERNO', width: 14 },
  { header: 'NOMBRE (S)', width: 20 },
  { header: 'NACIMIENTO', width: 13 },
  { header: 'CURP', width: 22 },
  { header: 'FACULTAD', width: 18 },
  { header: 'LICENCIATURA', width: 25 },
  { header: 'DIRECTOR', width: 25 },
  { header: 'MATRÍCULA', width: 12 },
  { header: 'SEMESTRE', width: 9.1 }, // ponytail: same width-9 exceljs bug as RAMA above
  { header: 'AÑO DE INGRESO', width: 12 },
  { header: 'TELÉFONO', width: 14 },
  { header: '# DE UNIFORME', width: 12 },
  { header: 'TALLA PLAYERA', width: 13 },
  { header: 'TALLA SHORT', width: 12 },
  { header: 'NSS', width: 15 },
  { header: 'ASEGURADORA', width: 16 },
  { header: 'No. PÓLIZA', width: 14 },
  { header: 'TITULAR PÓLIZA', width: 18 },
  { header: 'TELÉFONO FAMILIAR', width: 17 },
  { header: 'CORREO', width: 28 },
  { header: 'AÑO DE EGRESO', width: 12 },
  { header: 'CÓDIGO DE ACCESO', width: 16 },
]

type AtletaExport = Awaited<ReturnType<typeof obtenerAtletas>>[number]

async function obtenerAtletas() {
  return prisma.atleta.findMany({
    where: { rol: 'JUGADOR' },
    include: { privado: true, claveAtleta: true },
    orderBy: [{ apellidos: 'asc' }],
  })
}

// ACTIVOS por apellidos ASC, luego EGRESADOS por apellidos ASC.
function ordenarPorEstado(atletas: AtletaExport[]): AtletaExport[] {
  const porEstado = (estado: string) =>
    atletas.filter((a) => a.estado === estado).sort((a, b) => a.apellidos.localeCompare(b.apellidos))
  return [...porEstado('ACTIVO'), ...porEstado('EGRESADO')]
}

// La BD no separa apellido paterno/materno — se aproxima dividiendo por el
// primer espacio, igual que el Excel de referencia que se está reemplazando.
function separarApellidos(apellidos: string): { paterno: string; materno: string } {
  const partes = apellidos.trim().split(/\s+/)
  return { paterno: partes[0] ?? '', materno: partes.slice(1).join(' ') }
}

function filaDeAtleta(atleta: AtletaExport, no: number): (string | number)[] {
  const { paterno, materno } = separarApellidos(atleta.apellidos)
  return [
    no,
    ramaFromGenero(atleta.genero),
    cell(paterno),
    cell(materno),
    cell(atleta.nombre),
    '', // NACIMIENTO — no existe en el schema
    '', // CURP — no existe en el schema
    cell(atleta.facultad),
    '', // LICENCIATURA — no existe en el schema
    cell(atleta.directorFacultad),
    cell(atleta.matricula),
    cell(atleta.semestre),
    cell(atleta.anioIngreso),
    cell(atleta.telefonoPersonal),
    cell(atleta.numUniforme),
    cell(atleta.tallaPlayera),
    cell(atleta.tallaShort),
    cell(atleta.privado?.nss),
    cell(atleta.privado?.seguroAseguradora),
    cell(atleta.privado?.seguroPoliza),
    cell(atleta.privado?.seguroTitular),
    cell(atleta.telefonoTutor),
    cell(atleta.correo),
    cell(atleta.anioEgreso),
    cell(atleta.claveAtleta?.clavePlana),
  ]
}

function construirHoja(workbook: ExcelJS.Workbook, nombreHoja: 'VARONIL' | 'FEMENIL', atletas: AtletaExport[]) {
  const ws = workbook.addWorksheet(nombreHoja)
  ws.columns = COLUMNAS.map((c) => ({ width: c.width }))

  // Fila 1 — título fusionado
  ws.mergeCells(1, 1, 1, COLUMNAS.length)
  const titulo = ws.getCell(1, 1)
  titulo.value = `SELECCIÓN DE VOLEIBOL UADY — ${nombreHoja}`
  titulo.font = { name: 'Arial', bold: true, size: 13, color: { argb: 'FFFFFFFF' } }
  titulo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: UADY_GOLD } }
  titulo.alignment = { horizontal: 'center', vertical: 'middle' }
  ws.getRow(1).height = 28

  // Fila 2 — headers
  const filaHeader = ws.getRow(2)
  COLUMNAS.forEach((c, i) => {
    const celda = filaHeader.getCell(i + 1)
    celda.value = c.header
    celda.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FFFFFFFF' } }
    celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: UADY_BLUE } }
    celda.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    celda.border = THIN_BORDER
  })
  filaHeader.height = 40

  // Filas 3+ — datos
  const ordenados = ordenarPorEstado(atletas)
  ordenados.forEach((atleta, idx) => {
    const fila = ws.getRow(idx + 3)
    const valores = filaDeAtleta(atleta, idx + 1)
    const esAlterna = idx % 2 === 1

    valores.forEach((valor, colIdx) => {
      const celda = fila.getCell(colIdx + 1)
      celda.value = valor
      celda.font = { name: 'Arial', size: 9, color: { argb: 'FF000000' } }
      celda.alignment = { horizontal: 'left', vertical: 'middle' }
      celda.border = THIN_BORDER
      if (esAlterna) celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ROW_ALT_BG } }
    })

    // Última columna (Código de Acceso) — resaltada
    const celdaCodigo = fila.getCell(COLUMNAS.length)
    celdaCodigo.font = { name: 'Arial', bold: true, size: 11, color: { argb: UADY_BLUE } }
    celdaCodigo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CODE_BG } }
    celdaCodigo.alignment = { horizontal: 'center', vertical: 'middle' }

    fila.height = 18
  })

  ws.views = [{ state: 'frozen', ySplit: 2 }]
}

export async function GET() {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') {
    return new Response('Forbidden', { status: 403 })
  }

  const atletas = await obtenerAtletas()
  const varonil = atletas.filter((a) => a.genero === 'M')
  const femenil = atletas.filter((a) => a.genero === 'F')

  const workbook = new ExcelJS.Workbook()
  construirHoja(workbook, 'VARONIL', varonil)
  construirHoja(workbook, 'FEMENIL', femenil)

  const buffer = await workbook.xlsx.writeBuffer()
  const fecha = new Date().toISOString().slice(0, 10)

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="Roster_UADY_${fecha}.xlsx"`,
    },
  })
}
