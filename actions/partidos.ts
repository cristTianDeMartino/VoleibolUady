'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export type PartidoFormState = { error: string | null; success?: boolean }

const RAMAS = ['Varonil', 'Femenil']
const RESULTADOS = ['Ganado', 'Perdido']

/**
 * Registra un nuevo partido en el récord de temporada. Solo ADMIN.
 */
export async function registrarPartido(
  prevState: PartidoFormState,
  formData: FormData
): Promise<PartidoFormState> {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') {
    return { error: 'Sin permisos para esta acción.' }
  }

  const rama = (formData.get('rama') as string)?.trim()
  const torneo = (formData.get('torneo') as string)?.trim()
  const fechaRaw = (formData.get('fecha') as string)?.trim()
  const hora = (formData.get('hora') as string)?.trim()
  const sede = (formData.get('sede') as string)?.trim()
  const rival = (formData.get('rival') as string)?.trim()
  const numeroSets = parseInt(formData.get('numeroSets') as string, 10)
  const resultadoSets = (formData.get('resultadoSets') as string)?.trim()
  const resultadoFinal = (formData.get('resultadoFinal') as string)?.trim()

  if (!rama || !torneo || !fechaRaw || !hora || !sede || !rival || !resultadoSets || !resultadoFinal) {
    return { error: 'Completa todos los campos del partido.' }
  }
  if (!RAMAS.includes(rama)) {
    return { error: 'La rama debe ser "Varonil" o "Femenil".' }
  }
  if (!RESULTADOS.includes(resultadoFinal)) {
    return { error: 'El resultado final debe ser "Ganado" o "Perdido".' }
  }
  if (isNaN(numeroSets) || numeroSets < 1 || numeroSets > 5) {
    return { error: 'El número de sets debe estar entre 1 y 5.' }
  }
  const fecha = new Date(fechaRaw)
  if (isNaN(fecha.getTime())) {
    return { error: 'La fecha del partido no es válida.' }
  }

  try {
    await prisma.partido.create({
      data: { rama, torneo, fecha, hora, sede, rival, numeroSets, resultadoSets, resultadoFinal },
    })
  } catch (e) {
    console.error('Error al registrar partido:', e)
    return { error: 'No se pudo registrar el partido. Intenta de nuevo.' }
  }

  revalidatePath('/record-temporada')
  return { error: null, success: true }
}

/**
 * Devuelve los partidos ordenados por fecha (los más recientes primero).
 */
export async function obtenerPartidos() {
  return prisma.partido.findMany({
    orderBy: { fecha: 'desc' },
  })
}
