'use client'

import { useState, useTransition } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Loader2,
  Dumbbell,
  Video,
  Pencil,
  Trash2,
  PlayCircle,
} from 'lucide-react'
import {
  crearSesion,
  actualizarSesion,
  eliminarSesion,
  obtenerSesionesMes,
  crearVideo,
  actualizarVideo,
  eliminarVideo,
  obtenerVideosAgrupados,
} from '@/actions/gimnasio'
import type { SesionData, VideoData } from '@/actions/gimnasio'

// ─── Constantes ────────────────────────────────────────────────────────────────

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const CATEGORIAS_FIJAS = [
  'Tren Inferior',
  'Tren Superior',
  'Core y Estabilidad',
  'Levantamientos Olímpicos',
]

// ─── Helpers de fecha ─────────────────────────────────────────────────────────

function toLocalDate(isoStr: string): Date {
  const d = new Date(isoStr)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isoToDateInput(isoStr: string): string {
  const d = toLocalDate(isoStr)
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

function getCalendarGrid(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const start = new Date(firstDay)
  start.setDate(start.getDate() - start.getDay())
  const end = new Date(lastDay)
  end.setDate(end.getDate() + (6 - end.getDay()))
  const weeks: Date[][] = []
  const cur = new Date(start)
  while (cur <= end) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cur))
      cur.setDate(cur.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

function getYouTubeEmbedUrl(url: string): string {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
    /(?:https?:\/\/)?youtu\.be\/([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^&\n?#]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match?.[1]) return `https://www.youtube.com/embed/${match[1]}`
  }
  return url
}

// ─── Lane assignment (Google Calendar style) ──────────────────────────────────

interface WeekSesionLayout {
  sesion: SesionData
  col: number
  endCol: number
  span: number
  lane: number
  isStart: boolean
}

function assignLanes(sesiones: SesionData[], weekStart: Date, weekEnd: Date): WeekSesionLayout[] {
  const positioned = sesiones
    .map(s => {
      const ss = toLocalDate(s.fechaInicio)
      const sf = toLocalDate(s.fechaFin)
      const col = Math.max(0, daysBetween(weekStart, ss))
      const endCol = Math.min(6, daysBetween(weekStart, sf))
      const span = endCol - col + 1
      const isStart = ss >= weekStart
      return { sesion: s, col, endCol, span, isStart }
    })
    .filter(p => p.span > 0)
    .sort((a, b) => a.col - b.col || b.span - a.span)

  const laneEnds: number[] = []
  return positioned.map(p => {
    let lane = laneEnds.findIndex(ec => ec < p.col)
    if (lane === -1) { lane = laneEnds.length; laneEnds.push(p.endCol) }
    else laneEnds[lane] = p.endCol
    return { ...p, lane }
  })
}

// ─── WeekRow ──────────────────────────────────────────────────────────────────

function WeekRow({ week, sesiones, month, year }: {
  week: Date[]
  sesiones: SesionData[]
  month: number
  year: number
}) {
  const weekStart = week[0]
  const weekEnd = week[6]
  const now = new Date()
  const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const weekSesiones = sesiones.filter(s => {
    const start = toLocalDate(s.fechaInicio)
    const end = toLocalDate(s.fechaFin)
    return start <= weekEnd && end >= weekStart
  })

  const laidOut = assignLanes(weekSesiones, weekStart, weekEnd)
  const maxLane = laidOut.length > 0 ? Math.max(...laidOut.map(s => s.lane)) : -1
  const rowHeight = Math.max(72, 28 + (maxLane + 1) * 22 + 6)

  return (
    <div
      className="relative grid grid-cols-7 border-b border-slate-200 last:border-b-0"
      style={{ minHeight: `${rowHeight}px` }}
    >
      {week.map((day, i) => {
        const isCurrentMonth = day.getMonth() === month - 1 && day.getFullYear() === year
        const isToday = isSameDay(day, todayLocal)
        return (
          <div
            key={i}
            className={`border-r border-slate-200 last:border-r-0 ${!isCurrentMonth ? 'bg-slate-50/70' : 'bg-white'}`}
          >
            <div className="flex justify-end pt-1 pr-1.5">
              <span
                className={`w-6 h-6 text-xs flex items-center justify-center rounded-full font-medium leading-none select-none ${
                  isToday
                    ? 'bg-accent-green text-primary-blue font-bold'
                    : isCurrentMonth
                    ? 'text-slate-700'
                    : 'text-slate-300'
                }`}
              >
                {day.getDate()}
              </span>
            </div>
          </div>
        )
      })}
      {laidOut.map((item, idx) => (
        <div
          key={item.sesion.id + '-' + idx}
          title={item.sesion.titulo}
          style={{
            position: 'absolute',
            top: `${28 + item.lane * 22}px`,
            left: `calc(${(item.col / 7) * 100}% + 2px)`,
            width: `calc(${(item.span / 7) * 100}% - 4px)`,
            backgroundColor: item.sesion.color,
          }}
          className="h-[18px] rounded text-white text-[10px] font-semibold px-1.5 truncate leading-[18px] cursor-default hover:brightness-110 transition-all"
        >
          {item.isStart ? item.sesion.titulo : ''}
        </div>
      ))}
    </div>
  )
}

// ─── SesionModal ──────────────────────────────────────────────────────────────

function SesionModal({
  onClose,
  onSuccess,
  sesionEditar = null,
}: {
  onClose: () => void
  onSuccess: () => void
  sesionEditar?: SesionData | null
}) {
  const isEdit = sesionEditar !== null
  const [colorValue, setColorValue] = useState(sesionEditar?.color ?? '#9B0014')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('color', colorValue)
    startTransition(async () => {
      const result = isEdit
        ? await actualizarSesion(sesionEditar!.id, formData)
        : await crearSesion(formData)
      if (result.error) setError(result.error)
      else { onSuccess(); onClose() }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-primary-blue px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-accent-green" />
            <h2 className="text-white font-bold text-base">
              {isEdit ? 'Editar Sesión' : 'Agregar Sesión de Gimnasio'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-white/60 hover:text-white p-1 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Título *</label>
            <input
              name="titulo" type="text" required maxLength={120}
              defaultValue={sesionEditar?.titulo ?? ''}
              placeholder="Ej. Semana Hipertrofia"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Descripción</label>
            <textarea
              name="descripcion" rows={2} maxLength={300}
              defaultValue={sesionEditar?.descripcion ?? ''}
              placeholder="Descripción del bloque de entrenamiento..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Fecha inicio *</label>
              <input
                name="fechaInicio" type="date" required
                defaultValue={sesionEditar ? isoToDateInput(sesionEditar.fechaInicio) : ''}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Fecha fin *</label>
              <input
                name="fechaFin" type="date" required
                defaultValue={sesionEditar ? isoToDateInput(sesionEditar.fechaFin) : ''}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Color del bloque</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={colorValue}
                onChange={e => setColorValue(e.target.value)}
                className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
              />
              <span className="text-xs text-slate-400 leading-tight">
                Identifica el bloque visualmente en el calendario
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-xs text-red-700">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-600 rounded-lg py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isPending}
              className="flex-1 bg-accent-green text-primary-blue rounded-lg py-2.5 text-sm font-bold hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
              {isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando…</>
                : isEdit ? 'Actualizar Sesión' : 'Guardar Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── VideoModal ───────────────────────────────────────────────────────────────

function VideoModal({
  onClose,
  onSuccess,
  videoEditar = null,
}: {
  onClose: () => void
  onSuccess: () => void
  videoEditar?: VideoData | null
}) {
  const isEdit = videoEditar !== null
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = isEdit
        ? await actualizarVideo(videoEditar!.id, formData)
        : await crearVideo(formData)
      if (result.error) setError(result.error)
      else { onSuccess(); onClose() }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-primary-blue px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-accent-green" />
            <h2 className="text-white font-bold text-base">
              {isEdit ? 'Editar Video' : 'Agregar Video'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-white/60 hover:text-white p-1 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">URL de YouTube *</label>
            <input
              name="url" type="url" required
              defaultValue={videoEditar?.url ?? ''}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Título *</label>
            <input
              name="titulo" type="text" required maxLength={120}
              defaultValue={videoEditar?.titulo ?? ''}
              placeholder="Ej. Sentadilla con barra"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Descripción</label>
            <textarea
              name="descripcion" rows={2} maxLength={300}
              defaultValue={videoEditar?.descripcion ?? ''}
              placeholder="Descripción o cue técnico del ejercicio..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Categoría *</label>
            <select
              name="categoria" required
              defaultValue={videoEditar?.categoria ?? CATEGORIAS_FIJAS[0]}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-all bg-white"
            >
              {CATEGORIAS_FIJAS.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-xs text-red-700">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-600 rounded-lg py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isPending}
              className="flex-1 bg-accent-green text-primary-blue rounded-lg py-2.5 text-sm font-bold hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
              {isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando…</>
                : isEdit ? 'Actualizar Video' : 'Guardar Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── VideoCard ────────────────────────────────────────────────────────────────

function VideoCard({ video, isAdmin, onEditar, onEliminar }: {
  video: VideoData
  isAdmin: boolean
  onEditar: (video: VideoData) => void
  onEliminar: (id: string) => void
}) {
  const embedUrl = getYouTubeEmbedUrl(video.url)

  return (
    <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden relative">
      {/* iframe 16:9 responsivo */}
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        <iframe
          src={embedUrl}
          title={video.titulo}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
          loading="lazy"
        />
      </div>

      <div className="p-3">
        <p className="font-bold text-primary-blue text-sm leading-snug">{video.titulo}</p>
        {video.descripcion && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{video.descripcion}</p>
        )}
      </div>

      {isAdmin && (
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEditar(video)}
            title="Editar"
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white text-slate-600 hover:text-primary-blue transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onEliminar(video.id)}
            title="Eliminar"
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white text-slate-600 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── CategoriaSection ─────────────────────────────────────────────────────────

function CategoriaSection({ categoria, videos, isAdmin, onEditar, onEliminar }: {
  categoria: string
  videos: VideoData[]
  isAdmin: boolean
  onEditar: (video: VideoData) => void
  onEliminar: (id: string) => void
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-accent-green rounded-full" />
          <span className="font-black text-primary-blue text-base">{categoria}</span>
          <span className="text-xs text-slate-400 font-medium bg-slate-200 px-2 py-0.5 rounded-full">
            {videos.length}
          </span>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>

      {open && (
        <div className="p-5 border-t border-slate-100">
          {videos.length === 0 ? (
            <div className="text-center py-8">
              <PlayCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm text-slate-400">Sin videos en esta categoría.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map(v => (
                <VideoCard
                  key={v.id}
                  video={v}
                  isAdmin={isAdmin}
                  onEditar={onEditar}
                  onEliminar={onEliminar}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── GimnasioClient (export principal) ───────────────────────────────────────

interface GimnasioClientProps {
  rol: string
  sesionesIniciales: SesionData[]
  videosAgrupados: Record<string, VideoData[]>
  mesInicial: number
  anioInicial: number
}

export default function GimnasioClient({
  rol,
  sesionesIniciales,
  videosAgrupados: videosAgrupadosInit,
  mesInicial,
  anioInicial,
}: GimnasioClientProps) {
  // ── Calendario ──
  const [mes, setMes] = useState(mesInicial)
  const [anio, setAnio] = useState(anioInicial)
  const [sesiones, setSesiones] = useState<SesionData[]>(sesionesIniciales)
  const [cargandoMes, setCargandoMes] = useState(false)

  // ── Videos ──
  const [videosAgrupados, setVideosAgrupados] = useState<Record<string, VideoData[]>>(videosAgrupadosInit)

  // ── Modales sesiones ──
  const [showSesionModal, setShowSesionModal] = useState(false)
  const [sesionEditar, setSesionEditar] = useState<SesionData | null>(null)

  // ── Modales videos ──
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [videoEditar, setVideoEditar] = useState<VideoData | null>(null)

  const isAdmin = rol === 'ADMIN'
  const semanas = getCalendarGrid(anio, mes)

  // ── Handlers ──

  async function cambiarMes(delta: number) {
    let newMes = mes + delta
    let newAnio = anio
    if (newMes > 12) { newMes = 1; newAnio++ }
    if (newMes < 1) { newMes = 12; newAnio-- }
    setMes(newMes)
    setAnio(newAnio)
    setCargandoMes(true)
    setSesiones(await obtenerSesionesMes(newMes, newAnio))
    setCargandoMes(false)
  }

  async function handleRefreshSesiones() {
    setSesiones(await obtenerSesionesMes(mes, anio))
  }

  async function handleRefreshVideos() {
    setVideosAgrupados(await obtenerVideosAgrupados())
  }

  async function handleEliminarSesion(id: string) {
    if (!window.confirm('¿Eliminar esta sesión? Esta acción no se puede deshacer.')) return
    const result = await eliminarSesion(id)
    if (!result.error) await handleRefreshSesiones()
  }

  async function handleEliminarVideo(id: string) {
    if (!window.confirm('¿Eliminar este video? Esta acción no se puede deshacer.')) return
    const result = await eliminarVideo(id)
    if (!result.error) await handleRefreshVideos()
  }

  // ── Render ──

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-7 bg-accent-green rounded-full" />
            <h1 className="text-3xl font-black text-primary-blue">Gimnasio y Preparación Física</h1>
          </div>
          <p className="text-slate-500 text-sm ml-3">
            Bloques de fuerza, periodización y videoteca técnica del club.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setSesionEditar(null); setShowSesionModal(true) }}
            className="flex items-center gap-2 bg-accent-green text-primary-blue px-5 py-2.5 rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-md shadow-accent-green/20 self-start sm:self-auto flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Agregar Sesión
          </button>
        )}
      </div>

      {/* ══ BLOQUE SUPERIOR: Calendario ══ */}
      <section className="mb-12">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Navegación de mes */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <button
              onClick={() => cambiarMes(-1)}
              disabled={cargandoMes}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors disabled:opacity-40"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center min-w-[160px]">
              <p className="text-primary-blue font-black text-lg leading-tight">{MESES[mes - 1]}</p>
              <p className="text-slate-400 text-sm leading-tight">{anio}</p>
            </div>
            <button
              onClick={() => cambiarMes(1)}
              disabled={cargandoMes}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors disabled:opacity-40"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Cabecera días */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/60">
            {DIAS_SEMANA.map(d => (
              <div
                key={d}
                className="py-2 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wide border-r border-slate-200 last:border-r-0"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Semanas */}
          <div className={`transition-opacity duration-200 ${cargandoMes ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
            {semanas.map((week, i) => (
              <WeekRow key={i} week={week} sesiones={sesiones} month={mes} year={anio} />
            ))}
          </div>

          {cargandoMes && (
            <div className="flex items-center justify-center py-4 -mt-4">
              <Loader2 className="w-5 h-5 text-primary-blue animate-spin" />
            </div>
          )}

          {/* Leyenda */}
          {sesiones.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 flex flex-wrap gap-x-4 gap-y-1.5">
              {Array.from(new Map(sesiones.map(s => [s.id, s])).values()).map(s => (
                <div key={s.id} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-[11px] text-slate-500 truncate max-w-[160px]">{s.titulo}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══ BLOQUE INFERIOR: Videoteca ══ */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-accent-green rounded-full" />
            <h2 className="text-xl font-black text-primary-blue">Videoteca de Ejercicios</h2>
          </div>
          {isAdmin && (
            <button
              onClick={() => { setVideoEditar(null); setShowVideoModal(true) }}
              className="flex items-center gap-2 border border-primary-blue/40 text-primary-blue px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-blue hover:text-white transition-all self-start sm:self-auto flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              Agregar Video
            </button>
          )}
        </div>

        <div className="space-y-4">
          {CATEGORIAS_FIJAS.map(cat => (
            <CategoriaSection
              key={cat}
              categoria={cat}
              videos={videosAgrupados[cat] ?? []}
              isAdmin={isAdmin}
              onEditar={v => { setVideoEditar(v); setShowVideoModal(true) }}
              onEliminar={handleEliminarVideo}
            />
          ))}
        </div>
      </section>

      {/* ── Modales ── */}
      {showSesionModal && (
        <SesionModal
          onClose={() => { setShowSesionModal(false); setSesionEditar(null) }}
          onSuccess={handleRefreshSesiones}
          sesionEditar={sesionEditar}
        />
      )}
      {showVideoModal && (
        <VideoModal
          onClose={() => { setShowVideoModal(false); setVideoEditar(null) }}
          onSuccess={handleRefreshVideos}
          videoEditar={videoEditar}
        />
      )}
    </div>
  )
}
