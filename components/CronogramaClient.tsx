'use client'

import { useState, useTransition } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  Loader2,
  CalendarDays,
  Pencil,
  Trash2,
  FolderOpen,
} from 'lucide-react'
import {
  crearEvento,
  actualizarEvento,
  eliminarEvento,
  obtenerEventosMes,
  obtenerEventosCatalogo,
  obtenerProximosEventos,
  obtenerGrupos,
} from '@/actions/cronograma'
import type { EventoData } from '@/actions/cronograma'

// ─── Constantes ───────────────────────────────────────────────────────────────

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const MESES_CORTOS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

const NUEVO_GRUPO_MARKER = '__nuevo__'

// ─── Helpers de fechas ────────────────────────────────────────────────────────

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

function formatDateRange(start: Date, end: Date): string {
  if (isSameDay(start, end)) {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    return `${dias[start.getDay()]} ${start.getDate()} de ${MESES[start.getMonth()].toLowerCase()}`
  }
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()} – ${end.getDate()} de ${MESES[start.getMonth()].toLowerCase()} de ${end.getFullYear()}`
  }
  return `${start.getDate()} ${MESES_CORTOS[start.getMonth()].toLowerCase()} – ${end.getDate()} ${MESES_CORTOS[end.getMonth()].toLowerCase()} ${end.getFullYear()}`
}

function formatDateRangeShort(start: Date, end: Date): string {
  const fmt = (d: Date) => `${d.getDate()} ${MESES_CORTOS[d.getMonth()]}`
  if (isSameDay(start, end)) return fmt(start)
  return `${fmt(start)} – ${fmt(end)}`
}

function isoToDateInput(isoStr: string): string {
  const d = toLocalDate(isoStr)
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

// ─── Asignación de carriles (Google Calendar style) ───────────────────────────

interface WeekEventLayout {
  event: EventoData
  col: number
  endCol: number
  span: number
  lane: number
  isStart: boolean
}

function assignLanes(events: EventoData[], weekStart: Date, weekEnd: Date): WeekEventLayout[] {
  const positioned = events
    .map(e => {
      const es = toLocalDate(e.fechaInicio)
      const ef = toLocalDate(e.fechaFin)
      const col = Math.max(0, daysBetween(weekStart, es))
      const endCol = Math.min(6, daysBetween(weekStart, ef))
      const span = endCol - col + 1
      const isStart = es >= weekStart
      return { event: e, col, endCol, span, isStart }
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

function WeekRow({ week, eventos, month, year }: {
  week: Date[]; eventos: EventoData[]; month: number; year: number
}) {
  const weekStart = week[0]
  const weekEnd = week[6]
  const now = new Date()
  const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const weekEventsRaw = eventos.filter(e => {
    const s = toLocalDate(e.fechaInicio)
    const f = toLocalDate(e.fechaFin)
    return s <= weekEnd && f >= weekStart
  })

  const laidOut = assignLanes(weekEventsRaw, weekStart, weekEnd)
  const maxLane = laidOut.length > 0 ? Math.max(...laidOut.map(e => e.lane)) : -1
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
          <div key={i} className={`border-r border-slate-200 last:border-r-0 ${!isCurrentMonth ? 'bg-slate-50/70' : 'bg-white'}`}>
            <div className="flex justify-end pt-1 pr-1.5">
              <span className={`w-6 h-6 text-xs flex items-center justify-center rounded-full font-medium leading-none select-none ${isToday ? 'bg-uady-orange-cta text-white font-bold' : isCurrentMonth ? 'text-slate-700' : 'text-slate-300'}`}>
                {day.getDate()}
              </span>
            </div>
          </div>
        )
      })}
      {laidOut.map((item, idx) => (
        <div
          key={item.event.id + '-' + idx}
          title={item.event.titulo}
          style={{
            position: 'absolute',
            top: `${28 + item.lane * 22}px`,
            left: `calc(${(item.col / 7) * 100}% + 2px)`,
            width: `calc(${(item.span / 7) * 100}% - 4px)`,
            backgroundColor: item.event.color,
          }}
          className="h-[18px] rounded text-white text-[10px] font-semibold px-1.5 truncate leading-[18px] cursor-default hover:brightness-110 transition-all"
        >
          {item.isStart ? item.event.titulo : ''}
        </div>
      ))}
    </div>
  )
}

// ─── EventoModal (Crear y Editar) ─────────────────────────────────────────────

function EventoModal({
  onClose,
  onSuccess,
  eventoEditar = null,
  gruposDisponibles,
}: {
  onClose: () => void
  onSuccess: () => void
  eventoEditar?: EventoData | null
  gruposDisponibles: string[]
}) {
  const isEdit = eventoEditar !== null

  const grupoInicial = eventoEditar?.grupo && eventoEditar.grupo !== 'GENERAL'
    ? (gruposDisponibles.includes(eventoEditar.grupo) ? eventoEditar.grupo : NUEVO_GRUPO_MARKER)
    : (gruposDisponibles[0] ?? 'TORNEOS')

  const [colorValue, setColorValue] = useState(eventoEditar?.color ?? '#3b82f6')
  const [grupoSel, setGrupoSel] = useState(grupoInicial)
  const [nuevoGrupo, setNuevoGrupo] = useState(
    eventoEditar?.grupo && !gruposDisponibles.includes(eventoEditar.grupo) && eventoEditar.grupo !== 'GENERAL'
      ? eventoEditar.grupo
      : ''
  )
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const esNuevoGrupo = grupoSel === NUEVO_GRUPO_MARKER
  const grupoFinal = esNuevoGrupo ? nuevoGrupo.trim().toUpperCase() : grupoSel

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (esNuevoGrupo && !nuevoGrupo.trim()) {
      setError('Escribe el nombre del nuevo grupo.')
      return
    }
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('color', colorValue)
    formData.set('grupo', grupoFinal)
    startTransition(async () => {
      const result = isEdit
        ? await actualizarEvento(eventoEditar!.id, formData)
        : await crearEvento(formData)
      if (result.error) { setError(result.error) }
      else { onSuccess(); onClose() }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-uady-blue px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-uady-gold" />
            <h2 className="text-white font-bold text-base">
              {isEdit ? 'Editar Evento' : 'Agregar Evento'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-white/60 hover:text-white p-1 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Título *</label>
            <input
              name="titulo" type="text" required maxLength={120}
              defaultValue={eventoEditar?.titulo ?? ''}
              placeholder="Ej. Torneo JUPLAV"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uady-blue/30 focus:border-uady-blue transition-all"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Descripción</label>
            <textarea
              name="descripcion" rows={2} maxLength={300}
              defaultValue={eventoEditar?.descripcion ?? ''}
              placeholder="Descripción breve del evento..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uady-blue/30 focus:border-uady-blue transition-all resize-none"
            />
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Fecha inicio *</label>
              <input
                name="fechaInicio" type="date" required
                defaultValue={eventoEditar ? isoToDateInput(eventoEditar.fechaInicio) : ''}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uady-blue/30 focus:border-uady-blue transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Fecha fin *</label>
              <input
                name="fechaFin" type="date" required
                defaultValue={eventoEditar ? isoToDateInput(eventoEditar.fechaFin) : ''}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uady-blue/30 focus:border-uady-blue transition-all"
              />
            </div>
          </div>

          {/* Grupo */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Grupo / Categoría *</label>
            <select
              value={grupoSel}
              onChange={e => setGrupoSel(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uady-blue/30 focus:border-uady-blue transition-all bg-white"
            >
              {gruposDisponibles.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
              <option value={NUEVO_GRUPO_MARKER}>+ Crear nuevo grupo…</option>
            </select>
            {esNuevoGrupo && (
              <input
                type="text"
                value={nuevoGrupo}
                onChange={e => setNuevoGrupo(e.target.value)}
                placeholder="Nombre del nuevo grupo (ej. AMISTOSOS)"
                maxLength={60}
                className="mt-2 w-full border border-uady-blue/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uady-blue/30 focus:border-uady-blue transition-all"
                autoFocus
              />
            )}
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Color del evento</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={colorValue}
                onChange={e => setColorValue(e.target.value)}
                className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
              />
              <span className="text-xs text-slate-400 leading-tight">
                Identifica el evento visualmente en el calendario
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
              className="flex-1 bg-uady-orange-cta text-white rounded-lg py-2.5 text-sm font-bold hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
              {isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando…</>
                : isEdit ? 'Actualizar Evento' : 'Guardar Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── EventoPanelItem (catálogo) ───────────────────────────────────────────────

function EventoPanelItem({ evento, isAdmin, onEditar, onEliminar }: {
  evento: EventoData
  isAdmin: boolean
  onEditar: (evento: EventoData) => void
  onEliminar: (id: string) => void
}) {
  const start = toLocalDate(evento.fechaInicio)
  const end = toLocalDate(evento.fechaFin)

  return (
    <div className="group flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0">
      <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: evento.color }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-uady-blue leading-tight truncate">{evento.titulo}</p>
        <p className="text-[11px] text-slate-400 mt-0.5 tabular-nums">{formatDateRangeShort(start, end)}</p>
      </div>
      {isAdmin && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={() => onEditar(evento)} title="Editar"
            className="p-1.5 rounded hover:bg-uady-blue/10 text-slate-400 hover:text-uady-blue transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onEliminar(evento.id)} title="Eliminar"
            className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── ProximoEventoCard (bloque inferior) ─────────────────────────────────────

function ProximoEventoCard({ evento }: { evento: EventoData }) {
  const start = toLocalDate(evento.fechaInicio)
  const end = toLocalDate(evento.fechaFin)

  return (
    <div
      className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex overflow-hidden"
      style={{ borderLeftColor: evento.color, borderLeftWidth: '4px' }}
    >
      {/* Columna de fecha */}
      <div className="flex flex-col items-center justify-center px-4 py-4 bg-slate-50/60 min-w-[60px] border-r border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">
          {MESES_CORTOS[start.getMonth()]}
        </span>
        <span className="text-2xl font-black text-uady-blue leading-none">
          {start.getDate()}
        </span>
      </div>
      {/* Contenido */}
      <div className="flex-1 px-4 py-3 flex flex-col justify-center min-w-0 gap-0.5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: evento.color }} />
          <h3 className="font-bold text-uady-blue text-sm leading-snug truncate">{evento.titulo}</h3>
        </div>
        {evento.descripcion && (
          <p className="text-xs text-slate-400 pl-4 line-clamp-1">{evento.descripcion}</p>
        )}
        <p className="text-[11px] text-slate-400 pl-4">{formatDateRange(start, end)}</p>
      </div>
    </div>
  )
}

// ─── Export principal ─────────────────────────────────────────────────────────

interface CronogramaClientProps {
  rol: string
  eventosIniciales: EventoData[]
  eventosPanel: EventoData[]
  proximosIniciales: EventoData[]
  totalProximos: number
  gruposDisponibles: string[]
  mesInicial: number
  anioInicial: number
}

export default function CronogramaClient({
  rol,
  eventosIniciales,
  eventosPanel: eventosPanelInit,
  proximosIniciales,
  totalProximos,
  gruposDisponibles: gruposInit,
  mesInicial,
  anioInicial,
}: CronogramaClientProps) {
  // ── Estado del calendario ──
  const [mes, setMes] = useState(mesInicial)
  const [anio, setAnio] = useState(anioInicial)
  const [eventos, setEventos] = useState<EventoData[]>(eventosIniciales)
  const [cargandoMes, setCargandoMes] = useState(false)

  // ── Estado del catálogo (panel lateral) ──
  const [eventosPanel, setEventosPanel] = useState<EventoData[]>(eventosPanelInit)

  // ── Estado del bloque inferior ──
  const [proximosEventos, setProximosEventos] = useState<EventoData[]>(proximosIniciales)
  const [loadingMas, setLoadingMas] = useState(false)
  const [hayMas, setHayMas] = useState(totalProximos > 3)

  // ── Estado del modal y grupos ──
  const [showModal, setShowModal] = useState(false)
  const [eventoEditar, setEventoEditar] = useState<EventoData | null>(null)
  const [gruposDisponibles, setGruposDisponibles] = useState<string[]>(gruposInit)

  const isAdmin = rol === 'ADMIN'
  const semanas = getCalendarGrid(anio, mes)

  // Agrupar eventos del catálogo por campo grupo
  const eventosPorGrupo = new Map<string, EventoData[]>()
  for (const e of eventosPanel) {
    const g = e.grupo || 'GENERAL'
    if (!eventosPorGrupo.has(g)) eventosPorGrupo.set(g, [])
    eventosPorGrupo.get(g)!.push(e)
  }

  // ── Handlers ──

  async function cambiarMes(delta: number) {
    let newMes = mes + delta
    let newAnio = anio
    if (newMes > 12) { newMes = 1; newAnio++ }
    if (newMes < 1)  { newMes = 12; newAnio-- }
    setMes(newMes)
    setAnio(newAnio)
    setCargandoMes(true)
    setEventos(await obtenerEventosMes(newMes, newAnio))
    setCargandoMes(false)
  }

  async function handleRefresh() {
    const cargados = proximosEventos.length
    const [nuevosEventos, nuevosPanel, nuevosProximos, nuevosGrupos] = await Promise.all([
      obtenerEventosMes(mes, anio),
      obtenerEventosCatalogo(),
      obtenerProximosEventos(0, Math.max(3, cargados)),
      obtenerGrupos(),
    ])
    setEventos(nuevosEventos)
    setEventosPanel(nuevosPanel)
    setProximosEventos(nuevosProximos)
    setHayMas(nuevosProximos.length === Math.max(3, cargados))
    setGruposDisponibles(nuevosGrupos)
  }

  async function cargarMasEventos() {
    setLoadingMas(true)
    const nuevos = await obtenerProximosEventos(proximosEventos.length, 3)
    setProximosEventos(prev => [...prev, ...nuevos])
    setHayMas(nuevos.length === 3)
    setLoadingMas(false)
  }

  function abrirModalCrear() { setEventoEditar(null); setShowModal(true) }
  function abrirModalEditar(evento: EventoData) { setEventoEditar(evento); setShowModal(true) }
  function cerrarModal() { setShowModal(false); setEventoEditar(null) }

  async function handleEliminar(id: string) {
    if (!window.confirm('¿Eliminar este evento? Esta acción no se puede deshacer.')) return
    const result = await eliminarEvento(id)
    if (!result.error) { cerrarModal(); await handleRefresh() }
  }

  // ── Render ──

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-7 bg-uady-gold rounded-full" />
            <h1 className="text-3xl font-black text-uady-blue">Cronograma</h1>
          </div>
          <p className="text-slate-500 text-sm ml-3">
            Periodización deportiva, torneos y entrenamientos del equipo.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={abrirModalCrear}
            className="flex items-center gap-2 bg-uady-orange-cta text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-md shadow-uady-orange-cta/20 self-start sm:self-auto flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Agregar Evento
          </button>
        )}
      </div>

      {/* ══ BLOQUE SUPERIOR: Grid Calendario + Catálogo ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">

        {/* ── Col izquierda: Calendario Mensual (span 3) ── */}
        <section className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* Navegación de mes */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <button onClick={() => cambiarMes(-1)} disabled={cargandoMes}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors disabled:opacity-40" aria-label="Mes anterior">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center min-w-[160px]">
                <p className="text-uady-blue font-black text-lg leading-tight">{MESES[mes - 1]}</p>
                <p className="text-slate-400 text-sm leading-tight">{anio}</p>
              </div>
              <button onClick={() => cambiarMes(1)} disabled={cargandoMes}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors disabled:opacity-40" aria-label="Mes siguiente">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Cabecera días */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/60">
              {DIAS_SEMANA.map(d => (
                <div key={d} className="py-2 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wide border-r border-slate-200 last:border-r-0">
                  {d}
                </div>
              ))}
            </div>

            {/* Semanas */}
            <div className={`transition-opacity duration-200 ${cargandoMes ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              {semanas.map((week, i) => (
                <WeekRow key={i} week={week} eventos={eventos} month={mes} year={anio} />
              ))}
            </div>

            {cargandoMes && (
              <div className="flex items-center justify-center py-4 -mt-4">
                <Loader2 className="w-5 h-5 text-uady-blue animate-spin" />
              </div>
            )}

            {/* Leyenda */}
            {eventos.length > 0 && (
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 flex flex-wrap gap-x-4 gap-y-1.5">
                {Array.from(new Map(eventos.map(e => [e.id, e])).values()).map(ev => (
                  <div key={ev.id} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: ev.color }} />
                    <span className="text-[11px] text-slate-500 truncate max-w-[140px]">{ev.titulo}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Col derecha: Catálogo de Eventos (span 1) ── */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* Header del catálogo */}
            <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-uady-gold" />
                <h2 className="text-xs font-black text-uady-blue uppercase tracking-wider">
                  Catálogo de Eventos
                </h2>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {eventosPanel.length} evento{eventosPanel.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Grupos */}
            {eventosPorGrupo.size === 0 ? (
              <div className="px-4 py-10 text-center">
                <CalendarDays className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs text-slate-400">Sin eventos registrados.</p>
              </div>
            ) : (
              <div className="max-h-[520px] overflow-y-auto">
                {Array.from(eventosPorGrupo.entries()).map(([grupo, grupoEventos]) => (
                  <div key={grupo}>
                    {/* Encabezado de grupo */}
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">
                        {grupo}
                      </span>
                      <span className="text-[9px] text-slate-400 ml-2 flex-shrink-0">
                        {grupoEventos.length}
                      </span>
                    </div>
                    {/* Eventos del grupo */}
                    {grupoEventos.map(ev => (
                      <EventoPanelItem
                        key={ev.id}
                        evento={ev}
                        isAdmin={isAdmin}
                        onEditar={abrirModalEditar}
                        onEliminar={handleEliminar}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

      </div>

      {/* ══ BLOQUE INFERIOR: Próximos Eventos ══ */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-6 bg-uady-orange-cta rounded-full" />
          <h2 className="text-xl font-black text-uady-blue">Próximos Eventos</h2>
        </div>

        {proximosEventos.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay eventos próximos programados.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {proximosEventos.map(ev => (
                <ProximoEventoCard key={ev.id} evento={ev} />
              ))}
            </div>

            {hayMas && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={cargarMasEventos}
                  disabled={loadingMas}
                  className="flex items-center gap-2 text-slate-500 hover:text-uady-blue text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50 border border-slate-200 hover:border-uady-blue/30"
                >
                  {loadingMas ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
                  {loadingMas ? 'Cargando…' : 'Cargar más eventos'}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── Modal ── */}
      {showModal && (
        <EventoModal
          onClose={cerrarModal}
          onSuccess={handleRefresh}
          eventoEditar={eventoEditar}
          gruposDisponibles={gruposDisponibles}
        />
      )}
    </div>
  )
}
