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
  subcategoria: string | null
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
  const subcategoria = (formData.get('subcategoria') as string)?.trim() || null

  if (!titulo || !url || !categoria) {
    return { error: 'Título, URL y categoría son requeridos.' }
  }

  await prisma.videoGimnasio.create({
    data: { titulo, descripcion, url, categoria, subcategoria },
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
  const subcategoria = (formData.get('subcategoria') as string)?.trim() || null

  if (!titulo || !url || !categoria) {
    return { error: 'Título, URL y categoría son requeridos.' }
  }

  await prisma.videoGimnasio.update({
    where: { id: videoId },
    data: { titulo, descripcion, url, categoria, subcategoria },
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

// ─── Matriz de Periodización ──────────────────────────────────────────────────

export interface DetalleSemanaData {
  id: string
  numeroSemana: number
  fechaInicioSemana: string
  fechaFinSemana: string
  series: number
  rpt: string
  rir: number | null
}

export interface EjercicioPrincipalData {
  id: string
  nombre: string
  fechaInicio: string
  fechaFin: string
  etapaId: string | null
  semanas: DetalleSemanaData[]
}

export interface EtapaData {
  id: string
  nombre: string
  fechaInicio: string
  fechaFin: string
}

export interface EjercicioInput {
  nombre: string
  series: number
  rpt: string
  rir: number | null
}

export interface CatalogoData {
  id: string
  nombre: string
}

export interface SemanaSeleccionada {
  numeroSemana: number
  fechaInicioSemana: string
  fechaFinSemana: string
}

export interface AccesorioData {
  id: string
  nombre: string
  tipo: string
}

const MS_DIA = 86_400_000

function parseFechaUTC(str: string): Date {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

export async function obtenerCatalogoEjercicios(): Promise<CatalogoData[]> {
  return prisma.catalogoEjercicio.findMany({ orderBy: { nombre: 'asc' } })
}

export async function obtenerNombresEjercicios(): Promise<string[]> {
  const [catalogo, ejercicios] = await Promise.all([
    prisma.catalogoEjercicio.findMany({ select: { nombre: true } }),
    prisma.ejercicioPrincipal.findMany({ select: { nombre: true }, distinct: ['nombre'] }),
  ])
  const nombres = new Map<string, string>()
  for (const { nombre } of [...catalogo, ...ejercicios]) {
    const key = nombre.trim().toLowerCase()
    if (key && !nombres.has(key)) nombres.set(key, nombre.trim())
  }
  return [...nombres.values()].sort((a, b) => a.localeCompare(b))
}

export async function obtenerEtapas(): Promise<EtapaData[]> {
  const etapas = await prisma.etapaEntrenamiento.findMany({
    orderBy: { fechaInicio: 'asc' },
  })
  return etapas.map(e => ({
    id: e.id,
    nombre: e.nombre,
    fechaInicio: e.fechaInicio.toISOString(),
    fechaFin: e.fechaFin.toISOString(),
  }))
}

export async function obtenerMatriz(): Promise<EjercicioPrincipalData[]> {
  const ejercicios = await prisma.ejercicioPrincipal.findMany({
    orderBy: { fechaInicio: 'asc' },
    include: { semanas: { orderBy: { numeroSemana: 'asc' } } },
  })
  return ejercicios.map(ej => ({
    id: ej.id,
    nombre: ej.nombre,
    fechaInicio: ej.fechaInicio.toISOString(),
    fechaFin: ej.fechaFin.toISOString(),
    etapaId: ej.etapaId,
    semanas: ej.semanas.map(s => ({
      id: s.id,
      numeroSemana: s.numeroSemana,
      fechaInicioSemana: s.fechaInicioSemana.toISOString(),
      fechaFinSemana: s.fechaFinSemana.toISOString(),
      series: s.series,
      rpt: s.rpt,
      rir: s.rir,
    })),
  }))
}

async function registrarEnCatalogo(nombre: string): Promise<void> {
  const n = nombre.trim()
  if (!n) return
  const todos = await prisma.catalogoEjercicio.findMany({ select: { nombre: true } })
  const existe = todos.some(c => c.nombre.toLowerCase() === n.toLowerCase())
  if (!existe) {
    await prisma.catalogoEjercicio.create({ data: { nombre: n } }).catch(() => {})
  }
}

function calcularSemanasBase(
  fechaInicio: Date,
  fechaFin: Date,
  series: number,
  rpt: string,
  rir: number | null,
): { numeroSemana: number; fechaInicioSemana: Date; fechaFinSemana: Date; series: number; rpt: string; rir: number | null }[] {
  const semanas: ReturnType<typeof calcularSemanasBase> = []
  let weekStart = fechaInicio.getTime()
  let num = 1
  while (weekStart <= fechaFin.getTime()) {
    const weekEnd = Math.min(weekStart + 6 * MS_DIA, fechaFin.getTime())
    semanas.push({ numeroSemana: num++, fechaInicioSemana: new Date(weekStart), fechaFinSemana: new Date(weekEnd), series, rpt, rir })
    weekStart += 7 * MS_DIA
  }
  return semanas
}

export async function crearEtapaConEjercicios(
  nombre: string,
  fechaInicioStr: string,
  fechaFinStr: string,
  ejerciciosInput: EjercicioInput[],
): Promise<{ error: string | null }> {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') return { error: 'No autorizado.' }

  if (!nombre.trim() || !fechaInicioStr || !fechaFinStr) {
    return { error: 'Nombre, fecha inicio y fecha fin son requeridos.' }
  }
  if (ejerciciosInput.length === 0) return { error: 'Agrega al menos un ejercicio.' }

  const fechaInicio = parseFechaUTC(fechaInicioStr)
  const fechaFin = parseFechaUTC(fechaFinStr)
  if (fechaFin.getTime() < fechaInicio.getTime()) {
    return { error: 'La fecha fin no puede ser anterior al inicio.' }
  }

  for (const ej of ejerciciosInput) {
    if (!ej.nombre.trim() || isNaN(ej.series) || !ej.rpt.trim()) {
      return { error: `Ejercicio "${ej.nombre || '(sin nombre)'}" tiene campos incompletos.` }
    }
  }

  await prisma.$transaction(async (tx) => {
    const etapa = await tx.etapaEntrenamiento.create({
      data: { nombre: nombre.trim(), fechaInicio, fechaFin },
    })
    for (const ej of ejerciciosInput) {
      const semanas = calcularSemanasBase(fechaInicio, fechaFin, ej.series, ej.rpt.trim(), ej.rir)
      await tx.ejercicioPrincipal.create({
        data: {
          nombre: ej.nombre.trim(),
          fechaInicio,
          fechaFin,
          etapaId: etapa.id,
          semanas: { create: semanas },
        },
      })
    }
  })

  // Registrar nombres en catálogo (fuera de la transacción — es aditivo)
  for (const ej of ejerciciosInput) {
    await registrarEnCatalogo(ej.nombre)
  }

  revalidatePath('/gimnasio')
  return { error: null }
}

export async function actualizarEtapa(
  etapaId: string,
  nombre: string,
  fechaInicioStr: string,
  fechaFinStr: string,
): Promise<{ error: string | null }> {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') return { error: 'No autorizado.' }

  const nombreTrim = nombre.trim()
  if (!nombreTrim || !fechaInicioStr || !fechaFinStr) {
    return { error: 'Nombre, fecha inicio y fecha fin son requeridos.' }
  }

  const fechaInicio = parseFechaUTC(fechaInicioStr)
  const fechaFin = parseFechaUTC(fechaFinStr)
  if (fechaFin.getTime() < fechaInicio.getTime()) {
    return { error: 'La fecha fin no puede ser anterior al inicio.' }
  }

  await prisma.etapaEntrenamiento.update({
    where: { id: etapaId },
    data: { nombre: nombreTrim, fechaInicio, fechaFin },
  })

  revalidatePath('/gimnasio')
  return { error: null }
}

export async function actualizarNombreEjercicioPrincipal(
  ejercicioId: string,
  nuevoNombre: string,
): Promise<{ error: string | null }> {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') return { error: 'No autorizado.' }

  const nombre = nuevoNombre.trim()
  if (!nombre) return { error: 'El nombre es requerido.' }

  await prisma.ejercicioPrincipal.update({
    where: { id: ejercicioId },
    data: { nombre },
  })

  await registrarEnCatalogo(nombre)

  revalidatePath('/gimnasio')
  return { error: null }
}

export async function agregarEjercicioAEtapaExistente(
  etapaId: string,
  nombre: string,
  series: number,
  rpt: string,
  rir: number | null,
  semanasSeleccionadas: SemanaSeleccionada[],
): Promise<{ error: string | null }> {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') return { error: 'No autorizado.' }

  const nombreTrim = nombre.trim()
  if (!nombreTrim || isNaN(series) || !rpt.trim()) {
    return { error: 'Nombre, series y RPT son requeridos.' }
  }
  if (semanasSeleccionadas.length === 0) {
    return { error: 'Selecciona al menos una semana.' }
  }

  const etapa = await prisma.etapaEntrenamiento.findUnique({ where: { id: etapaId } })
  if (!etapa) return { error: 'Etapa no encontrada.' }

  const semanasData = semanasSeleccionadas.map(s => ({
    numeroSemana: s.numeroSemana,
    fechaInicioSemana: new Date(s.fechaInicioSemana),
    fechaFinSemana: new Date(s.fechaFinSemana),
    series,
    rpt: rpt.trim(),
    rir,
  }))

  await prisma.ejercicioPrincipal.create({
    data: {
      nombre: nombreTrim,
      fechaInicio: etapa.fechaInicio,
      fechaFin: etapa.fechaFin,
      etapaId,
      semanas: { create: semanasData },
    },
  })

  await registrarEnCatalogo(nombreTrim)

  revalidatePath('/gimnasio')
  return { error: null }
}

export async function crearEjercicioPlanificado(formData: FormData): Promise<{ error: string | null }> {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') return { error: 'No autorizado.' }

  const nombre = (formData.get('nombre') as string)?.trim()
  const fechaInicioStr = formData.get('fechaInicio') as string
  const fechaFinStr = formData.get('fechaFin') as string
  const series = parseInt(formData.get('series') as string)
  const rpt = (formData.get('rpt') as string)?.trim()
  const rirStr = (formData.get('rir') as string)?.trim()
  const rir = rirStr ? parseInt(rirStr) : null

  if (!nombre || !fechaInicioStr || !fechaFinStr || isNaN(series) || !rpt) {
    return { error: 'Todos los campos obligatorios son requeridos.' }
  }

  const fechaInicio = parseFechaUTC(fechaInicioStr)
  const fechaFin = parseFechaUTC(fechaFinStr)

  if (fechaFin.getTime() < fechaInicio.getTime()) {
    return { error: 'La fecha fin no puede ser anterior al inicio.' }
  }

  const semanasData = calcularSemanasBase(fechaInicio, fechaFin, series, rpt, rir)

  await prisma.ejercicioPrincipal.create({
    data: {
      nombre,
      fechaInicio,
      fechaFin,
      semanas: { create: semanasData },
    },
  })

  revalidatePath('/gimnasio')
  return { error: null }
}

export async function actualizarDetalleSemana(
  detalleId: string,
  formData: FormData
): Promise<{ error: string | null }> {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') return { error: 'No autorizado.' }

  const series = parseInt(formData.get('series') as string)
  const rpt = (formData.get('rpt') as string)?.trim()
  const rirStr = (formData.get('rir') as string)?.trim()
  const rir = rirStr ? parseInt(rirStr) : null

  if (isNaN(series) || !rpt) {
    return { error: 'Series y RPT son requeridos.' }
  }

  await prisma.detalleSemana.update({
    where: { id: detalleId },
    data: { series, rpt, rir },
  })

  revalidatePath('/gimnasio')
  return { error: null }
}

export async function eliminarEjercicioPrincipal(ejercicioId: string): Promise<{ error: string | null }> {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') return { error: 'No autorizado.' }

  await prisma.ejercicioPrincipal.delete({ where: { id: ejercicioId } })
  revalidatePath('/gimnasio')
  return { error: null }
}

export async function eliminarEtapa(etapaId: string): Promise<{ error: string | null }> {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') return { error: 'No autorizado.' }

  await prisma.etapaEntrenamiento.delete({ where: { id: etapaId } })
  revalidatePath('/gimnasio')
  return { error: null }
}

// ─── Ejercicios Accesorios ─────────────────────────────────────────────────────

export async function obtenerAccesorios(): Promise<AccesorioData[]> {
  return prisma.ejercicioAccesorio.findMany({
    orderBy: [{ tipo: 'asc' }, { nombre: 'asc' }],
  })
}

export const obtenerEjerciciosAccesorios = obtenerAccesorios

export async function crearEjercicioAccesorio(formData: FormData): Promise<{ error: string | null }> {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') return { error: 'No autorizado.' }

  const nombre = (formData.get('nombre') as string)?.trim()
  const tipo = formData.get('tipo') as string

  if (!nombre || !tipo) return { error: 'Nombre y tipo son requeridos.' }
  if (tipo !== 'TREN_INFERIOR' && tipo !== 'TREN_SUPERIOR') return { error: 'Tipo inválido.' }

  await prisma.ejercicioAccesorio.create({ data: { nombre, tipo } })

  revalidatePath('/gimnasio')
  return { error: null }
}

export async function eliminarEjercicioAccesorio(accesorioId: string): Promise<{ error: string | null }> {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') return { error: 'No autorizado.' }

  await prisma.ejercicioAccesorio.delete({ where: { id: accesorioId } })

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
  subcategoria: string | null
}): VideoData {
  return {
    id: v.id,
    titulo: v.titulo,
    descripcion: v.descripcion,
    url: v.url,
    categoria: v.categoria,
    subcategoria: v.subcategoria,
  }
}
