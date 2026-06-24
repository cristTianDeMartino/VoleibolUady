import * as XLSX from 'xlsx'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { ramaFromGenero } from '@/lib/constants/genero'
import { labelPosicion } from '@/lib/constants/posiciones'

// Celdas vacías cuando el campo no tiene valor — nunca "Sin registrar" ni "—".
const cell = (v: string | number | null | undefined): string | number => v ?? ''
const generoLabel = (g: string) => (g === 'F' ? 'Femenino' : 'Masculino')

type AtletaRow = {
  nombre: string
  apellidos: string
  genero: string
  estado: string
}

// Orden de grupos fijo: Femenil Activos, Varonil Activos, Femenil Egresados, Varonil Egresados.
function grupoOrdenAtleta(a: AtletaRow): number {
  const esFemenil = a.genero === 'F'
  const esActivo = a.estado === 'ACTIVO'
  if (esFemenil && esActivo) return 0
  if (!esFemenil && esActivo) return 1
  if (esFemenil && !esActivo) return 2
  return 3
}

export async function GET() {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') {
    return new Response('Forbidden', { status: 403 })
  }

  const [atletas, admins] = await Promise.all([
    prisma.atleta.findMany({
      where: { rol: 'JUGADOR' },
      include: { privado: true, claveAtleta: true },
    }),
    prisma.atleta.findMany({
      where: { rol: 'ADMIN' },
      include: { claveAtleta: true },
    }),
  ])

  const atletasOrdenados = atletas.sort(
    (a, b) => grupoOrdenAtleta(a) - grupoOrdenAtleta(b) || a.apellidos.localeCompare(b.apellidos)
  )
  const adminsOrdenados = admins.sort((a, b) => a.apellidos.localeCompare(b.apellidos))

  const filasAtletas = atletasOrdenados.map((a) => ({
    Nombre: cell(a.nombre),
    Apellidos: cell(a.apellidos),
    Género: generoLabel(a.genero),
    Rama: ramaFromGenero(a.genero),
    Posición: a.posicion ? labelPosicion(a.posicion) : '',
    Estado: a.estado === 'ACTIVO' ? 'Activo' : 'Egresado',
    'Año de Ingreso': cell(a.anioIngreso),
    'Año de Egreso': cell(a.anioEgreso),
    'Número de Uniforme': cell(a.numUniforme),
    'Talla Playera': cell(a.tallaPlayera),
    'Talla Short': cell(a.tallaShort),
    'Talla Pants': cell(a.tallaPants),
    'Talla Chamarra': cell(a.tallaChamarra),
    Facultad: cell(a.facultad),
    Semestre: cell(a.semestre),
    Correo: cell(a.correo),
    'Teléfono Personal': cell(a.telefonoPersonal),
    'Teléfono Tutor / Familiar': cell(a.telefonoTutor),
    Matrícula: cell(a.matricula),
    NSS: cell(a.privado?.nss),
    Aseguradora: cell(a.privado?.seguroAseguradora),
    Póliza: cell(a.privado?.seguroPoliza),
    'Titular de Póliza': cell(a.privado?.seguroTitular),
    'Código de Acceso': cell(a.claveAtleta?.clavePlana),
  }))

  const filasAdmins = adminsOrdenados.map((a) => ({
    Nombre: cell(a.nombre),
    Apellidos: cell(a.apellidos),
    Género: generoLabel(a.genero),
    Correo: cell(a.correo),
    'Teléfono Personal': cell(a.telefonoPersonal),
    'Código de Acceso': cell(a.claveAtleta?.clavePlana),
  }))

  const wb = XLSX.utils.book_new()

  const headerAtletas = [
    'Nombre', 'Apellidos', 'Género', 'Rama', 'Posición', 'Estado',
    'Año de Ingreso', 'Año de Egreso', 'Número de Uniforme',
    'Talla Playera', 'Talla Short', 'Talla Pants', 'Talla Chamarra',
    'Facultad', 'Semestre', 'Correo', 'Teléfono Personal',
    'Teléfono Tutor / Familiar', 'Matrícula', 'NSS', 'Aseguradora',
    'Póliza', 'Titular de Póliza', 'Código de Acceso',
  ]

  const wsAtletas = XLSX.utils.json_to_sheet(filasAtletas, { header: headerAtletas })
  XLSX.utils.book_append_sheet(wb, wsAtletas, 'Atletas')

  const wsEgresados = XLSX.utils.json_to_sheet(
    filasAtletas.filter((f) => f.Estado === 'Egresado'),
    { header: headerAtletas }
  )
  XLSX.utils.book_append_sheet(wb, wsEgresados, 'Egresados')

  const wsAdmins = XLSX.utils.json_to_sheet(filasAdmins, {
    header: ['Nombre', 'Apellidos', 'Género', 'Correo', 'Teléfono Personal', 'Código de Acceso'],
  })
  XLSX.utils.book_append_sheet(wb, wsAdmins, 'Administradores')

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  const fecha = new Date().toISOString().slice(0, 10)
  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="exportacion_sistema_${fecha}.xlsx"`,
    },
  })
}
