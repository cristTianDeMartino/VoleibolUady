'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export interface EventoData {
  id: string
  titulo: string
  descripcion: string | null
  fechaInicio: string  // ISO string
  fechaFin: string     // ISO string
  color: string
  grupo: string
}

const GRUPOS_DEFAULT = ['TORNEOS', 'PREPARACIÓN O ENTRENAMIENTOS', 'CURSOS']

// ─── Consultas ────────────────────────────────────────────────────────────────

export async function obtenerEventosMes(mes: number, anio: number): Promise<EventoData[]> {
  const inicioMes = new Date(anio, mes - 1, 1)
  const finMes = new Date(anio, mes, 0, 23, 59, 59)

  const eventos = await prisma.evento.findMany({
    where: {
      fechaInicio: { lte: finMes },
      fechaFin:    { gte: inicioMes },
    },
    orderBy: { fechaInicio: 'asc' },
  })

  return eventos.map(toEventoData)
}

export async function obtenerProximosEventos(skip = 0, take = 3): Promise<EventoData[]> {
  const hoy = new Date()
  const hoyLocal = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())

  const eventos = await prisma.evento.findMany({
    where: { fechaFin: { gte: hoyLocal } },
    orderBy: { fechaInicio: 'asc' },
    skip,
    take,
  })

  return eventos.map(toEventoData)
}

// Todos los eventos que se solapan con el año en curso, agrupados para el catálogo
export async function obtenerEventosCatalogo(): Promise<EventoData[]> {
  const anio = new Date().getFullYear()
  const inicio = new Date(anio, 0, 1)
  const fin = new Date(anio, 11, 31, 23, 59, 59)

  const eventos = await prisma.evento.findMany({
    where: {
      fechaInicio: { lte: fin },
      fechaFin:    { gte: inicio },
    },
    orderBy: [{ grupo: 'asc' }, { fechaInicio: 'asc' }],
  })

  return eventos.map(toEventoData)
}

// Próximos 3 meses (fechaInicio desde hoy hasta hoy + 3 meses)
export async function obtenerEventosProximosTresMeses(): Promise<EventoData[]> {
  const hoy = new Date()
  const hoyLocal = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const tresMesesDespues = new Date(hoyLocal)
  tresMesesDespues.setMonth(tresMesesDespues.getMonth() + 3)

  const eventos = await prisma.evento.findMany({
    where: {
      fechaInicio: { gte: hoyLocal, lte: tresMesesDespues },
    },
    orderBy: { fechaInicio: 'asc' },
  })

  return eventos.map(toEventoData)
}

// Grupos distintos en la BD + defaults siempre presentes
export async function obtenerGrupos(): Promise<string[]> {
  const rows = await prisma.evento.findMany({
    select: { grupo: true },
    distinct: ['grupo'],
  })

  const gruposDB = rows
    .map(r => r.grupo)
    .filter(g => g && g !== 'GENERAL')

  return [...new Set([...GRUPOS_DEFAULT, ...gruposDB])].sort()
}

// ─── Mutaciones ───────────────────────────────────────────────────────────────

export async function crearEvento(formData: FormData): Promise<{ error: string | null }> {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') return { error: 'No autorizado.' }

  const titulo = (formData.get('titulo') as string)?.trim()
  const descripcion = (formData.get('descripcion') as string)?.trim() || null
  const fechaInicioStr = formData.get('fechaInicio') as string
  const fechaFinStr = formData.get('fechaFin') as string
  const color = (formData.get('color') as string) || '#3b82f6'
  const grupo = (formData.get('grupo') as string)?.trim().toUpperCase() || 'GENERAL'

  if (!titulo || !fechaInicioStr || !fechaFinStr) {
    return { error: 'Título, fecha de inicio y fecha de fin son requeridos.' }
  }
  if (!grupo || grupo === 'GENERAL') {
    return { error: 'Selecciona o escribe un grupo para el evento.' }
  }

  const [iy, im, id] = fechaInicioStr.split('-').map(Number)
  const [fy, fm, fd] = fechaFinStr.split('-').map(Number)
  const fechaInicio = new Date(iy, im - 1, id)
  const fechaFin = new Date(fy, fm - 1, fd)

  if (fechaFin < fechaInicio) {
    return { error: 'La fecha de fin no puede ser anterior a la fecha de inicio.' }
  }

  await prisma.evento.create({
    data: { titulo, descripcion, fechaInicio, fechaFin, color, grupo },
  })

  revalidatePath('/cronograma')
  return { error: null }
}

export async function actualizarEvento(
  eventoId: string,
  formData: FormData
): Promise<{ error: string | null }> {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') return { error: 'No autorizado.' }

  const titulo = (formData.get('titulo') as string)?.trim()
  const descripcion = (formData.get('descripcion') as string)?.trim() || null
  const fechaInicioStr = formData.get('fechaInicio') as string
  const fechaFinStr = formData.get('fechaFin') as string
  const color = (formData.get('color') as string) || '#3b82f6'
  const grupo = (formData.get('grupo') as string)?.trim().toUpperCase() || 'GENERAL'

  if (!titulo || !fechaInicioStr || !fechaFinStr) {
    return { error: 'Título, fecha de inicio y fecha de fin son requeridos.' }
  }
  if (!grupo || grupo === 'GENERAL') {
    return { error: 'Selecciona o escribe un grupo para el evento.' }
  }

  const [iy, im, iday] = fechaInicioStr.split('-').map(Number)
  const [fy, fm, fday] = fechaFinStr.split('-').map(Number)
  const fechaInicio = new Date(iy, im - 1, iday)
  const fechaFin = new Date(fy, fm - 1, fday)

  if (fechaFin < fechaInicio) {
    return { error: 'La fecha de fin no puede ser anterior a la fecha de inicio.' }
  }

  await prisma.evento.update({
    where: { id: eventoId },
    data: { titulo, descripcion, fechaInicio, fechaFin, color, grupo },
  })

  revalidatePath('/cronograma')
  return { error: null }
}

export async function eliminarEvento(eventoId: string): Promise<{ error: string | null }> {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') return { error: 'No autorizado.' }

  await prisma.evento.delete({ where: { id: eventoId } })

  revalidatePath('/cronograma')
  return { error: null }
}

// ─── Helper interno ───────────────────────────────────────────────────────────

function toEventoData(e: {
  id: string
  titulo: string
  descripcion: string | null
  fechaInicio: Date
  fechaFin: Date
  color: string
  grupo: string
}): EventoData {
  return {
    id: e.id,
    titulo: e.titulo,
    descripcion: e.descripcion,
    fechaInicio: e.fechaInicio.toISOString(),
    fechaFin: e.fechaFin.toISOString(),
    color: e.color,
    grupo: e.grupo,
  }
}
