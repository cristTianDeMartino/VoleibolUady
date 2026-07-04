'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export type AsistenciaResult = { error: string | null; yaRegistrada?: boolean }

function normalizarFecha(date: Date): Date {
  // Normaliza al inicio del día en hora local para evitar drift de timezone
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

// Sin parámetro atletaId: siempre se registra para el atleta en sesión —
// de lo contrario cualquiera podría marcar como presente a otro atleta.
export async function registrarAsistenciaHoy(): Promise<AsistenciaResult> {
  const session = await getSession()
  if (!session) return { error: 'Debes iniciar sesión.' }

  const hoy = normalizarFecha(new Date())

  try {
    await prisma.asistencia.create({
      data: { atletaId: session.id, fecha: hoy },
    })
  } catch (e: unknown) {
    // Restricción única: ya registró asistencia hoy
    if (
      e instanceof Error &&
      (e.message.includes('Unique constraint') || e.message.includes('unique constraint'))
    ) {
      return { error: null, yaRegistrada: true }
    }
    console.error('Error al registrar asistencia:', e)
    return { error: 'No se pudo registrar la asistencia. Intenta de nuevo.' }
  }

  revalidatePath('/asistencia')
  return { error: null, yaRegistrada: false }
}

export interface AtletaConAsistencia {
  id: string
  nombre: string
  apellidos: string
  genero: string
}

export interface MatrizAsistencia {
  atletas: AtletaConAsistencia[]
  diasConRegistro: Set<string> // "atletaId_YYYY-MM-DD"
  diasDelMes: number
}

export async function obtenerMatrizAsistencia(
  mes: number,
  anio: number
): Promise<{ atletas: AtletaConAsistencia[]; registros: Record<string, string[]> }> {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') return { atletas: [], registros: {} }

  const inicio = new Date(anio, mes - 1, 1)
  const fin = new Date(anio, mes, 0, 23, 59, 59)

  const [atletas, asistencias] = await Promise.all([
    prisma.atleta.findMany({
      where: { estado: 'ACTIVO' },
      orderBy: [{ apellidos: 'asc' }, { nombre: 'asc' }],
      select: { id: true, nombre: true, apellidos: true, genero: true },
    }),
    prisma.asistencia.findMany({
      where: { fecha: { gte: inicio, lte: fin } },
      select: { atletaId: true, fecha: true },
    }),
  ])

  // registros: { atletaId: ["2026-05-01", "2026-05-03", ...] }
  const registros: Record<string, string[]> = {}
  for (const a of asistencias) {
    const key = a.atletaId
    const fechaStr = a.fecha.toISOString().slice(0, 10)
    if (!registros[key]) registros[key] = []
    registros[key].push(fechaStr)
  }

  return { atletas, registros }
}
