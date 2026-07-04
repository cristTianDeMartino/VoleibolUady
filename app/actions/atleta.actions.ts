'use server'

import { refresh, revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { updateAtletaPrivado } from '@/lib/atleta.queries'
import { POSICIONES, type PosicionValue } from '@/lib/constants/posiciones'
import { validarNSS, validarTelefono, validarAnioIngreso, validarCurp, validarDirector } from '@/lib/validation'
import { parseFechaLocal } from '@/lib/utils/fecha'

function revalidateAtleta(atletaId: string) {
  revalidatePath('/perfil')
  revalidatePath('/atletas')
  revalidatePath(`/atletas/${atletaId}`)
}

export type DatosGenerales = Partial<{
  posicion: PosicionValue
  numUniforme: number | null
  anioIngreso: number
  tallaPlayera: string | null
  tallaShort: string | null
  tallaPants: string | null
  tallaChamarra: string | null
  correo: string | null
  telefonoPersonal: string
  telefonoTutor: string
  fechaNacimiento: string | null // ISO 'YYYY-MM-DD' o null para borrar
  licenciatura: string | null
  facultad: string
  semestre: number
  directorFacultad: string
}>

export async function actualizarDatosGenerales(atletaId: string, data: DatosGenerales) {
  const session = await getSession()
  if (!session || (session.rol !== 'ADMIN' && session.id !== atletaId)) {
    throw new Error('FORBIDDEN')
  }

  if (data.telefonoPersonal != null) {
    const err = validarTelefono(data.telefonoPersonal)
    if (err) throw new Error(err)
  }
  if (data.telefonoTutor != null) {
    const err = validarTelefono(data.telefonoTutor)
    if (err) throw new Error(err)
  }
  if (data.anioIngreso != null) {
    const err = validarAnioIngreso(data.anioIngreso)
    if (err) throw new Error(err)
  }
  if (data.posicion != null && !POSICIONES.some((p) => p.value === data.posicion)) {
    throw new Error('Posición no válida.')
  }
  if (data.semestre != null && (isNaN(data.semestre) || data.semestre < 1 || data.semestre > 12)) {
    throw new Error('El semestre debe ser entre 1 y 12.')
  }
  if (data.directorFacultad != null) {
    const err = validarDirector(data.directorFacultad)
    if (err) throw new Error(err)
  }

  await prisma.atleta.update({
    where: { id: atletaId },
    data: {
      posicion: data.posicion,
      numUniforme: data.numUniforme,
      anioIngreso: data.anioIngreso,
      tallaPlayera: data.tallaPlayera,
      tallaShort: data.tallaShort,
      tallaPants: data.tallaPants,
      tallaChamarra: data.tallaChamarra,
      correo: data.correo,
      telefonoPersonal: data.telefonoPersonal,
      telefonoTutor: data.telefonoTutor,
      fechaNacimiento: data.fechaNacimiento !== undefined
        ? (data.fechaNacimiento ? parseFechaLocal(data.fechaNacimiento) : null)
        : undefined,
      licenciatura: data.licenciatura,
      facultad: data.facultad,
      semestre: data.semestre,
      directorFacultad: data.directorFacultad,
    },
  })

  revalidateAtleta(atletaId)
}

export type DatosPrivados = Partial<{
  nss: string | null
  seguroAseguradora: string | null
  seguroPoliza: string | null
  seguroTitular: string | null
  curp: string | null
}>

export async function actualizarDatosPrivados(atletaId: string, data: DatosPrivados) {
  const session = await getSession()
  if (!session) throw new Error('FORBIDDEN')

  if (data.nss != null) {
    const err = validarNSS(data.nss)
    if (err) throw new Error(err)
  }
  const curp = data.curp != null ? data.curp.toUpperCase() : data.curp
  if (curp) {
    const err = validarCurp(curp)
    if (err) throw new Error(err)
  }

  await updateAtletaPrivado(atletaId, { ...data, curp }, session)
  revalidateAtleta(atletaId)
}

// Borrado completo (hard delete) — solo ADMIN. El cascade del schema elimina
// AtletaPrivado, Asistencia, Lesion y CitaMedica asociados.
export async function eliminarAtletaPorCompleto(atletaId: string) {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') throw new Error('FORBIDDEN')

  const atleta = await prisma.atleta.findUnique({ where: { id: atletaId }, select: { nombre: true, apellidos: true } })
  await prisma.atleta.delete({ where: { id: atletaId } })

  revalidatePath('/atletas')
  // Nombre va en la URL para que /atletas pueda mostrar el toast de confirmación.
  redirect(`/atletas?deleted=${encodeURIComponent(`${atleta?.nombre ?? ''} ${atleta?.apellidos ?? ''}`.trim())}`)
}

export async function egresarAtleta(atletaId: string) {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') throw new Error('FORBIDDEN')

  const result = await prisma.atleta.updateMany({
    where: { id: atletaId, estado: 'ACTIVO' },
    data: { estado: 'EGRESADO', anioEgreso: new Date().getFullYear() },
  })

  if (result.count === 0) {
    throw new Error('No es un atleta activo.')
  }

  revalidatePath('/atletas')
  refresh()
}

export async function reactivarAtleta(atletaId: string) {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') throw new Error('FORBIDDEN')

  const result = await prisma.atleta.updateMany({
    where: { id: atletaId, estado: 'EGRESADO' },
    data: { estado: 'ACTIVO', anioEgreso: null },
  })

  if (result.count === 0) {
    throw new Error('No es un atleta egresado.')
  }

  revalidatePath('/atletas')
  refresh()
}
