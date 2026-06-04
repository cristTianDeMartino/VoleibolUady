'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export interface SesionData {
  id: string
  titulo: string
  descripcion: string | null
  fechaInicio: string
  fechaFin: string
  color: string
}

export interface VideoData {
  id: string
  titulo: string
  descripcion: string | null
  url: string
  categoria: string
}

// ─── Sesiones ─────────────────────────────────────────────────────────────────

export async function obtenerSesionesMes(mes: number, anio: number): Promise<SesionData[]> {
  const inicioMes = new Date(anio, mes - 1, 1)
  const finMes = new Date(anio, mes, 0, 23, 59, 59)

  const sesiones = await prisma.sesionGimnasio.findMany({
    where: {
      fechaInicio: { lte: finMes },
      fechaFin: { gte: inicioMes },
    },
    orderBy: { fechaInicio: 'asc' },
  })

  return sesiones.map(toSesionData)
}

export async function crearSesion(formData: FormData): Promise<{ error: string | null }> {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') return { error: 'No autorizado.' }

  const titulo = (formData.get('titulo') as string)?.trim()
  const descripcion = (formData.get('descripcion') as string)?.trim() || null
  const fechaInicioStr = formData.get('fechaInicio') as string
  const fechaFinStr = formData.get('fechaFin') as string
  const color = (formData.get('color') as string) || '#9B0014'

  if (!titulo || !fechaInicioStr || !fechaFinStr) {
    return { error: 'Título, fecha de inicio y fecha de fin son requeridos.' }
  }

  const [iy, im, id] = fechaInicioStr.split('-').map(Number)
  const [fy, fm, fd] = fechaFinStr.split('-').map(Number)
  const fechaInicio = new Date(iy, im - 1, id)
  const fechaFin = new Date(fy, fm - 1, fd)

  if (fechaFin < fechaInicio) {
    return { error: 'La fecha de fin no puede ser anterior a la fecha de inicio.' }
  }

  await prisma.sesionGimnasio.create({
    data: { titulo, descripcion, fechaInicio, fechaFin, color },
  })

  revalidatePath('/gimnasio')
  return { error: null }
}

export async function actualizarSesion(
  sesionId: string,
  formData: FormData
): Promise<{ error: string | null }> {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') return { error: 'No autorizado.' }

  const titulo = (formData.get('titulo') as string)?.trim()
  const descripcion = (formData.get('descripcion') as string)?.trim() || null
  const fechaInicioStr = formData.get('fechaInicio') as string
  const fechaFinStr = formData.get('fechaFin') as string
  const color = (formData.get('color') as string) || '#9B0014'

  if (!titulo || !fechaInicioStr || !fechaFinStr) {
    return { error: 'Título, fecha de inicio y fecha de fin son requeridos.' }
  }

  const [iy, im, iday] = fechaInicioStr.split('-').map(Number)
  const [fy, fm, fday] = fechaFinStr.split('-').map(Number)
  const fechaInicio = new Date(iy, im - 1, iday)
  const fechaFin = new Date(fy, fm - 1, fday)

  if (fechaFin < fechaInicio) {
    return { error: 'La fecha de fin no puede ser anterior a la fecha de inicio.' }
  }

  await prisma.sesionGimnasio.update({
    where: { id: sesionId },
    data: { titulo, descripcion, fechaInicio, fechaFin, color },
  })

  revalidatePath('/gimnasio')
  return { error: null }
}

export async function eliminarSesion(sesionId: string): Promise<{ error: string | null }> {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') return { error: 'No autorizado.' }

  await prisma.sesionGimnasio.delete({ where: { id: sesionId } })

  revalidatePath('/gimnasio')
  return { error: null }
}

// ─── Videos ───────────────────────────────────────────────────────────────────

export async function obtenerVideosAgrupados(): Promise<Record<string, VideoData[]>> {
  const videos = await prisma.videoGimnasio.findMany({
    orderBy: [{ categoria: 'asc' }, { createdAt: 'asc' }],
  })

  const grouped: Record<string, VideoData[]> = {}
  for (const v of videos) {
    if (!grouped[v.categoria]) grouped[v.categoria] = []
    grouped[v.categoria].push(toVideoData(v))
  }
  return grouped
}

export async function crearVideo(formData: FormData): Promise<{ error: string | null }> {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') return { error: 'No autorizado.' }

  const titulo = (formData.get('titulo') as string)?.trim()
  const descripcion = (formData.get('descripcion') as string)?.trim() || null
  const url = (formData.get('url') as string)?.trim()
  const categoria = (formData.get('categoria') as string)?.trim()

  if (!titulo || !url || !categoria) {
    return { error: 'Título, URL y categoría son requeridos.' }
  }

  await prisma.videoGimnasio.create({
    data: { titulo, descripcion, url, categoria },
  })

  revalidatePath('/gimnasio')
  return { error: null }
}

export async function actualizarVideo(
  videoId: string,
  formData: FormData
): Promise<{ error: string | null }> {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') return { error: 'No autorizado.' }

  const titulo = (formData.get('titulo') as string)?.trim()
  const descripcion = (formData.get('descripcion') as string)?.trim() || null
  const url = (formData.get('url') as string)?.trim()
  const categoria = (formData.get('categoria') as string)?.trim()

  if (!titulo || !url || !categoria) {
    return { error: 'Título, URL y categoría son requeridos.' }
  }

  await prisma.videoGimnasio.update({
    where: { id: videoId },
    data: { titulo, descripcion, url, categoria },
  })

  revalidatePath('/gimnasio')
  return { error: null }
}

export async function eliminarVideo(videoId: string): Promise<{ error: string | null }> {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') return { error: 'No autorizado.' }

  await prisma.videoGimnasio.delete({ where: { id: videoId } })

  revalidatePath('/gimnasio')
  return { error: null }
}

// ─── Helpers internos ─────────────────────────────────────────────────────────

function toSesionData(s: {
  id: string
  titulo: string
  descripcion: string | null
  fechaInicio: Date
  fechaFin: Date
  color: string
}): SesionData {
  return {
    id: s.id,
    titulo: s.titulo,
    descripcion: s.descripcion,
    fechaInicio: s.fechaInicio.toISOString(),
    fechaFin: s.fechaFin.toISOString(),
    color: s.color,
  }
}

function toVideoData(v: {
  id: string
  titulo: string
  descripcion: string | null
  url: string
  categoria: string
}): VideoData {
  return {
    id: v.id,
    titulo: v.titulo,
    descripcion: v.descripcion,
    url: v.url,
    categoria: v.categoria,
  }
}
