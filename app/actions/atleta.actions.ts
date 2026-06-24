'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { updateAtletaPrivado } from '@/lib/atleta.queries'
import type { PosicionValue } from '@/lib/constants/posiciones'
import { validarNSS, validarTelefono, validarAnioIngreso } from '@/lib/validation'

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
  if (data.anioIngreso != null) {
    const err = validarAnioIngreso(data.anioIngreso)
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
    },
  })

  revalidateAtleta(atletaId)
}

export type DatosPrivados = Partial<{
  nss: string | null
  seguroAseguradora: string | null
  seguroPoliza: string | null
  seguroTitular: string | null
}>

export async function actualizarDatosPrivados(atletaId: string, data: DatosPrivados) {
  const session = await getSession()
  if (!session) throw new Error('FORBIDDEN')

  if (data.nss != null) {
    const err = validarNSS(data.nss)
    if (err) throw new Error(err)
  }

  await updateAtletaPrivado(atletaId, data, session)
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

  const atleta = await prisma.atleta.findUnique({ where: { id: atletaId }, select: { estado: true } })
  if (atleta?.estado !== 'ACTIVO') throw new Error('No es un atleta activo.')

  await prisma.atleta.update({
    where: { id: atletaId },
    data: { estado: 'EGRESADO', anioEgreso: new Date().getFullYear() },
  })

  revalidateAtleta(atletaId)
}

export async function reactivarAtleta(atletaId: string) {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') throw new Error('FORBIDDEN')

  const atleta = await prisma.atleta.findUnique({ where: { id: atletaId }, select: { estado: true } })
  if (atleta?.estado !== 'EGRESADO') throw new Error('No es un atleta egresado.')

  await prisma.atleta.update({
    where: { id: atletaId },
    data: { estado: 'ACTIVO', anioEgreso: null },
  })

  revalidateAtleta(atletaId)
}
