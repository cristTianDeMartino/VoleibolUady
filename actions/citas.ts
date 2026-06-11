'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export type CitaFormState = { error: string | null; success?: boolean }

const TIPOS_ESPECIALISTA = ['Psicólogo', 'Nutriólogo', 'Dentista', 'Médico General', 'Otro'] as const
const ESTADOS_VALIDOS    = ['Programada', 'Completada', 'Cancelada'] as const

export async function crearCita(
  prevState: CitaFormState,
  formData: FormData,
): Promise<CitaFormState> {
  const session = await getSession()
  if (!session) return { error: 'Debes iniciar sesión.' }

  const tipoEspecialista = (formData.get('tipoEspecialista') as string)?.trim()
  const fechaHoraRaw     = (formData.get('fechaHora') as string)?.trim()
  const motivo           = (formData.get('motivo') as string)?.trim()

  if (!tipoEspecialista || !fechaHoraRaw || !motivo) {
    return { error: 'Completa todos los campos.' }
  }
  if (!TIPOS_ESPECIALISTA.includes(tipoEspecialista as (typeof TIPOS_ESPECIALISTA)[number])) {
    return { error: 'Tipo de especialista no válido.' }
  }
  const fechaHora = new Date(fechaHoraRaw)
  if (isNaN(fechaHora.getTime())) return { error: 'La fecha y hora no son válidas.' }

  // JUGADOR creates cita for themselves; ADMIN must provide atletaId via form
  let atletaId: string
  if (session.rol === 'ADMIN') {
    const aid = (formData.get('atletaId') as string)?.trim()
    if (!aid) return { error: 'Selecciona un atleta.' }
    atletaId = aid
  } else {
    atletaId = session.id
  }

  try {
    await prisma.citaMedica.create({
      data: { atletaId, tipoEspecialista, fechaHora, motivo, estado: 'Programada' },
    })
  } catch (e) {
    console.error('crearCita:', e)
    return { error: 'No se pudo registrar la cita. Intenta de nuevo.' }
  }

  revalidatePath('/salud/citas')
  return { error: null, success: true }
}

export async function actualizarEstadoCita(
  citaId: string,
  nuevoEstado: string,
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession()
  if (!session) return { error: 'Sin permisos.' }
  if (!ESTADOS_VALIDOS.includes(nuevoEstado as (typeof ESTADOS_VALIDOS)[number])) {
    return { error: 'Estado no válido.' }
  }

  const cita = await prisma.citaMedica.findUnique({
    where: { id: citaId },
    select: { id: true, atletaId: true },
  })
  if (!cita) return { error: 'Cita no encontrada.' }

  const esAdmin  = session.rol === 'ADMIN'
  const esDueno  = session.id === cita.atletaId
  if (!esAdmin && !esDueno) return { error: 'Sin permisos para modificar esta cita.' }

  try {
    await prisma.citaMedica.update({
      where: { id: citaId },
      data: { estado: nuevoEstado },
    })
  } catch (e) {
    console.error('actualizarEstadoCita:', e)
    return { error: 'No se pudo actualizar la cita.' }
  }

  revalidatePath('/salud/citas')
  return { success: true }
}

export async function eliminarCita(
  citaId: string,
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession()
  if (!session) return { error: 'Sin permisos.' }

  const cita = await prisma.citaMedica.findUnique({
    where: { id: citaId },
    select: { id: true, atletaId: true },
  })
  if (!cita) return { error: 'Cita no encontrada.' }

  const esAdmin = session.rol === 'ADMIN'
  const esDueno = session.id === cita.atletaId
  if (!esAdmin && !esDueno) return { error: 'Sin permisos para eliminar esta cita.' }

  try {
    await prisma.citaMedica.delete({ where: { id: citaId } })
  } catch (e) {
    console.error('eliminarCita:', e)
    return { error: 'No se pudo eliminar la cita.' }
  }

  revalidatePath('/salud/citas')
  return { success: true }
}
