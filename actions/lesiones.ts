'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export type LesionFormState = { error: string | null; success?: boolean }

/**
 * Registra una nueva lesión para el jugador autenticado.
 * El estatus inicial es siempre "Activo". La lesión se vincula
 * automáticamente al ID del atleta en sesión (un jugador no puede
 * reportar lesiones de otra persona).
 */
export async function createLesion(
  prevState: LesionFormState,
  formData: FormData
): Promise<LesionFormState> {
  const session = await getSession()
  if (!session) {
    return { error: 'Debes iniciar sesión para registrar una lesión.' }
  }
  if (session.rol !== 'JUGADOR') {
    return { error: 'Solo los jugadores pueden registrar lesiones propias.' }
  }

  const fechaConsultaRaw = (formData.get('fechaConsulta') as string)?.trim()
  const diagnostico = (formData.get('diagnostico') as string)?.trim()
  const tratamiento = (formData.get('tratamiento') as string)?.trim()

  if (!fechaConsultaRaw || !diagnostico || !tratamiento) {
    return { error: 'Completa todos los campos (fecha, diagnóstico y tratamiento).' }
  }

  const fechaConsulta = new Date(fechaConsultaRaw)
  if (isNaN(fechaConsulta.getTime())) {
    return { error: 'La fecha de consulta no es válida.' }
  }

  try {
    await prisma.lesion.create({
      data: {
        atletaId: session.id,
        fechaConsulta,
        diagnostico,
        tratamiento,
        estatus: 'Activo',
      },
    })
  } catch (e) {
    console.error('Error al crear lesión:', e)
    return { error: 'No se pudo registrar la lesión. Intenta de nuevo.' }
  }

  revalidatePath('/lesiones')
  revalidatePath(`/atletas/${session.id}`)
  return { error: null, success: true }
}

/**
 * Cierra el ciclo de una lesión: cambia el estatus a "Alta" y registra
 * la fecha de alta con la hora actual del sistema. Permitido al ADMIN
 * o al propio jugador dueño de la lesión.
 */
export async function darDeAltaLesion(
  lesionId: string
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession()
  if (!session) {
    return { error: 'Sin permisos para esta acción.' }
  }

  const lesion = await prisma.lesion.findUnique({
    where: { id: lesionId },
    select: { id: true, atletaId: true, estatus: true },
  })
  if (!lesion) {
    return { error: 'Lesión no encontrada.' }
  }

  const esAdmin = session.rol === 'ADMIN'
  const esDueno = session.id === lesion.atletaId
  if (!esAdmin && !esDueno) {
    return { error: 'Sin permisos para dar de alta esta lesión.' }
  }

  if (lesion.estatus === 'Alta') {
    return { error: 'Esta lesión ya está dada de alta.' }
  }

  try {
    await prisma.lesion.update({
      where: { id: lesionId },
      data: {
        estatus: 'Alta',
        fechaAlta: new Date(),
      },
    })
  } catch (e) {
    console.error('Error al dar de alta la lesión:', e)
    return { error: 'No se pudo dar de alta la lesión. Intenta de nuevo.' }
  }

  revalidatePath('/lesiones')
  revalidatePath(`/atletas/${lesion.atletaId}`)
  return { success: true }
}
