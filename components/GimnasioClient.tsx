'use client'

import { useState, useTransition, useMemo } from 'react'
import {
  Plus, X, Loader2, Trash2, Dumbbell, Video,
  Pencil, PlayCircle, ChevronDown, ChevronUp, Activity, AlertTriangle,
} from 'lucide-react'
import {
  obtenerMatriz, obtenerEtapas, obtenerCatalogoEjercicios, obtenerNombresEjercicios,
  crearEtapaConEjercicios, actualizarEtapa, actualizarDetalleSemana, eliminarEtapa,
  eliminarEjercicioPorNombreGlobal, actualizarNombreEjercicioGlobal,
  agregarEjercicioAEtapaExistente,
  obtenerAccesorios, crearEjercicioAccesorio, eliminarEjercicioAccesorio,
  crearVideo, actualizarVideo, eliminarVideo, obtenerVideosAgrupados,
} from '@/actions/gimnasio'
import type {
  EjercicioPrincipalData, DetalleSemanaData, AccesorioData, VideoData,
  EtapaData, EjercicioInput, CatalogoData, SemanaSeleccionada,
} from '@/actions/gimnasio'
import { obtenerNotasProgramacion, type NotaProgramacionData } from '@/app/actions/notas-programacion.actions'
import NotasProgramacion from '@/components/gimnasio/NotasProgramacion'

// ─── Constantes ───────────────────────────────────────────────────────────────

const CATEGORIAS_FIJAS = [
  'Estabilidad',
  'Funcionales',
  'Movilidad',
  'Potencia',
  'Psicomotriz',
  'Técnica de carrera',
  'Técnica Volleyball',
]

const SUBCATEGORIA_LATERALIDAD = 'Lateralidad'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MESES_CORTOS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const MS_DIA = 86_400_000

function formatearFechaSemana(inicioIso: string, finIso: string): string {
  const [, m1, d1] = inicioIso.substring(0, 10).split('-').map(Number)
  const [, m2, d2] = finIso.substring(0, 10).split('-').map(Number)
  return `${d1} ${MESES_CORTOS[m1 - 1]} – ${d2} ${MESES_CORTOS[m2 - 1]}`
}

function dateKey(iso: string): string {
  return iso.substring(0, 10)
}

function generarSemanasCliente(fechaInicioIso: string, fechaFinIso: string): SemanaSeleccionada[] {
  const t0 = new Date(fechaInicioIso).getTime()
  const tN = new Date(fechaFinIso).getTime()
  const semanas: SemanaSeleccionada[] = []
  let weekStart = t0
  let num = 1
  while (weekStart <= tN) {
    const weekEnd = Math.min(weekStart + 6 * MS_DIA, tN)
    semanas.push({
      numeroSemana: num++,
      fechaInicioSemana: new Date(weekStart).toISOString(),
      fechaFinSemana: new Date(weekEnd).toISOString(),
    })
    weekStart += 7 * MS_DIA
  }
  return semanas
}

function getYouTubeEmbedUrl(url: string): string {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
    /(?:https?:\/\/)?youtu\.be\/([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^&\n?#]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m?.[1]) return `https://www.youtube.com/embed/${m[1]}`
  }
  return url
}

// ─── Shared UI primitives ─────────────────────────────────────────────────────

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uady-blue/30 focus:border-uady-blue transition-all'
const labelCls = 'block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide'

function ModalShell({
  title,
  icon,
  onClose,
  children,
  maxW = 'max-w-xl',
}: {
  title: string
  icon: React.ReactNode
  onClose: () => void
  children: React.ReactNode
  maxW?: string
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxW} overflow-hidden max-h-[90vh] flex flex-col`}>
        <div className="bg-uady-blue px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-white font-bold text-base">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="text-white/60 hover:text-white p-1 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── ConfirmDeleteModal ───────────────────────────────────────────────────────

function ConfirmDeleteModal({
  title,
  description,
  isPending,
  error,
  onConfirm,
  onCancel,
}: {
  title: string
  description: string
  isPending: boolean
  error: string | null
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget && !isPending) onCancel() }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="font-bold text-uady-blue text-base">{title}</h2>
            <p className="text-slate-500 text-sm mt-1">{description}</p>
          </div>
        </div>
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-xs text-red-700">{error}</div>
        )}
        <div className="flex gap-4 mt-6 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 rounded-lg text-sm font-medium text-uady-blue bg-slate-100 hover:bg-slate-200 disabled:opacity-60 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Eliminando…</> : 'Confirmar Eliminación'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── EtapaModal ───────────────────────────────────────────────────────────────

interface EjercicioRow { _key: number; nombre: string; series: string; rpt: string; rir: string }

function EtapaModal({
  nombres,
  onClose,
  onSuccess,
}: {
  nombres: string[]
  onClose: () => void
  onSuccess: () => Promise<void>
}) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [etapaNombre, setEtapaNombre] = useState('')
  const [inicio, setInicio] = useState('')
  const [fin, setFin] = useState('')
  const [rows, setRows] = useState<EjercicioRow[]>([{ _key: 0, nombre: '', series: '', rpt: '', rir: '' }])
  const [nextKey, setNextKey] = useState(1)

  const semanaCount = useMemo(() => {
    if (!inicio || !fin) return 0
    const ms = new Date(fin + 'T00:00:00').getTime() - new Date(inicio + 'T00:00:00').getTime()
    return ms < 0 ? 0 : Math.floor(ms / (7 * MS_DIA)) + 1
  }, [inicio, fin])

  function addRow() {
    setRows(p => [...p, { _key: nextKey, nombre: '', series: '', rpt: '', rir: '' }])
    setNextKey(k => k + 1)
  }
  function removeRow(key: number) { setRows(p => p.filter(r => r._key !== key)) }
  function updateRow(key: number, field: keyof Omit<EjercicioRow, '_key'>, value: string) {
    setRows(p => p.map(r => r._key === key ? { ...r, [field]: value } : r))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!etapaNombre.trim() || !inicio || !fin) { setError('Nombre de etapa, fecha inicio y fecha fin son requeridos.'); return }
    if (semanaCount === 0) { setError('La fecha fin no puede ser anterior al inicio.'); return }
    const ejerciciosInput: EjercicioInput[] = rows.map(r => ({
      nombre: r.nombre.trim(), series: parseInt(r.series), rpt: r.rpt.trim(),
      rir: r.rir !== '' ? parseInt(r.rir) : null,
    }))
    const invalid = ejerciciosInput.find(ej => !ej.nombre || isNaN(ej.series) || !ej.rpt)
    if (invalid) { setError('Todos los ejercicios deben tener nombre, series y RPT.'); return }
    startTransition(async () => {
      const result = await crearEtapaConEjercicios(etapaNombre.trim(), inicio, fin, ejerciciosInput)
      if (result.error) setError(result.error)
      else { await onSuccess(); onClose() }
    })
  }

  return (
    <ModalShell title="Nueva Etapa de Entrenamiento" icon={<Dumbbell className="w-4 h-4 text-uady-gold" />} onClose={onClose}>
      <datalist id="cat-etapa">
        {nombres.map(n => <option key={n} value={n} />)}
      </datalist>
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Datos de la Etapa</p>
            <div>
              <label className={labelCls}>Nombre de la Etapa *</label>
              <input type="text" required maxLength={80} value={etapaNombre} onChange={e => setEtapaNombre(e.target.value)} placeholder="Ej. Adaptación Anatómica" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Fecha inicio *</label>
                <input type="date" required value={inicio} onChange={e => setInicio(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Fecha fin *</label>
                <input type="date" required value={fin} onChange={e => setFin(e.target.value)} className={inputCls} />
              </div>
            </div>
            {semanaCount > 0 && (
              <div className="bg-uady-gold/10 border border-uady-gold/30 rounded-lg px-3 py-2 text-xs font-semibold text-uady-blue">
                Se generarán <span className="text-uady-gold">{semanaCount} semana{semanaCount !== 1 ? 's' : ''}</span> por ejercicio automáticamente.
              </div>
            )}
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ejercicios</p>
            {rows.map((row, idx) => (
              <div key={row._key} className="border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Ejercicio {idx + 1}</span>
                  {rows.length > 1 && (
                    <button type="button" onClick={() => removeRow(row._key)} className="p-1 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Nombre *</label>
                  <input list="cat-etapa" type="text" required maxLength={80} value={row.nombre}
                    onChange={e => updateRow(row._key, 'nombre', e.target.value)}
                    placeholder="Ej. Sentadilla, Remo, Peso Muerto…" className={inputCls} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>Series *</label>
                    <input type="number" required min={1} max={20} value={row.series} onChange={e => updateRow(row._key, 'series', e.target.value)} placeholder="4" className={inputCls + ' text-center'} />
                  </div>
                  <div>
                    <label className={labelCls}>RPT *</label>
                    <input type="text" required maxLength={20} value={row.rpt} onChange={e => updateRow(row._key, 'rpt', e.target.value)} placeholder="16-18" className={inputCls + ' text-center'} />
                  </div>
                  <div>
                    <label className={labelCls}>RIR</label>
                    <input type="number" min={0} max={5} value={row.rir} onChange={e => updateRow(row._key, 'rir', e.target.value)} placeholder="3" className={inputCls + ' text-center'} />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={addRow} className="w-full border-2 border-dashed border-slate-200 hover:border-uady-gold/50 text-slate-400 hover:text-uady-gold rounded-xl py-3 text-sm font-medium transition-all flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Añadir otro ejercicio a esta etapa
            </button>
          </div>
          {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-xs text-red-700">{error}</div>}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0">
          <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 rounded-lg py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
          <button type="submit" disabled={isPending || semanaCount === 0}
            className="flex-1 bg-uady-gold text-uady-blue rounded-lg py-2.5 text-sm font-bold hover:brightness-110 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Creando…</> : `Crear Etapa (${rows.length} ej. × ${semanaCount} sem.)`}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

// ─── EditarEtapaModal ─────────────────────────────────────────────────────────

function EditarEtapaModal({
  etapa,
  onClose,
  onSuccess,
}: {
  etapa: EtapaData
  onClose: () => void
  onSuccess: () => Promise<void>
}) {
  const [nombre, setNombre] = useState(etapa.nombre)
  const [inicio, setInicio] = useState(dateKey(etapa.fechaInicio))
  const [fin, setFin] = useState(dateKey(etapa.fechaFin))
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await actualizarEtapa(etapa.id, nombre, inicio, fin)
      if (result.error) setError(result.error)
      else { await onSuccess(); onClose() }
    })
  }

  return (
    <ModalShell title="Editar Etapa" icon={<Pencil className="w-4 h-4 text-uady-gold" />} onClose={onClose} maxW="max-w-md">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className={labelCls}>Nombre de la Etapa *</label>
          <input type="text" required maxLength={80} value={nombre} onChange={e => setNombre(e.target.value)} className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Fecha inicio *</label>
            <input type="date" required value={inicio} onChange={e => setInicio(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Fecha fin *</label>
            <input type="date" required value={fin} onChange={e => setFin(e.target.value)} className={inputCls} />
          </div>
        </div>
        <p className="text-[11px] text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
          Cambiar fechas actualiza la etapa pero no regenera las semanas de los ejercicios existentes.
        </p>
        {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-xs text-red-700">{error}</div>}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 rounded-lg py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
          <button type="submit" disabled={isPending} className="flex-1 bg-uady-gold text-uady-blue rounded-lg py-2.5 text-sm font-bold hover:brightness-110 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando…</> : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

// ─── EditarNombreEjercicioModal ───────────────────────────────────────────────

function EditarNombreEjercicioModal({
  nombreActual,
  catalogo,
  onClose,
  onSuccess,
}: {
  nombreActual: string
  catalogo: CatalogoData[]
  onClose: () => void
  onSuccess: () => Promise<void>
}) {
  const [nombre, setNombre] = useState(nombreActual)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await actualizarNombreEjercicioGlobal(nombreActual, nombre)
      if (result.error) setError(result.error)
      else { await onSuccess(); onClose() }
    })
  }

  return (
    <ModalShell title="Editar Nombre del Ejercicio" icon={<Pencil className="w-4 h-4 text-uady-gold" />} onClose={onClose} maxW="max-w-sm">
      <datalist id="cat-edit-nombre">
        {catalogo.map(c => <option key={c.id} value={c.nombre} />)}
      </datalist>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className={labelCls}>Nuevo Nombre *</label>
          <input list="cat-edit-nombre" type="text" required maxLength={80} value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Ej. Sentadilla, Remo…" className={inputCls} />
        </div>
        {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-xs text-red-700">{error}</div>}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 rounded-lg py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
          <button type="submit" disabled={isPending} className="flex-1 bg-uady-gold text-uady-blue rounded-lg py-2.5 text-sm font-bold hover:brightness-110 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando…</> : 'Actualizar'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

// ─── AgregarEjercicioGlobalModal ──────────────────────────────────────────────

function AgregarEjercicioGlobalModal({
  etapas,
  catalogo,
  onClose,
  onSuccess,
}: {
  etapas: EtapaData[]
  catalogo: CatalogoData[]
  onClose: () => void
  onSuccess: () => Promise<void>
}) {
  // Compute the initial etapa and its weeks synchronously so the lazy initializer
  // below has the right data without needing a useEffect to populate `selected`.
  const firstEtapa = etapas.length > 0 ? etapas[0] : null
  const firstSemanas = firstEtapa
    ? generarSemanasCliente(firstEtapa.fechaInicio, firstEtapa.fechaFin)
    : []

  const [etapaId, setEtapaId] = useState(firstEtapa?.id ?? '')
  // Derive the current etapa and its weeks from the selected ID
  const etapa = useMemo(() => etapas.find(e => e.id === etapaId) ?? null, [etapas, etapaId])
  const semanas = useMemo(
    () => etapa ? generarSemanasCliente(etapa.fechaInicio, etapa.fechaFin) : [],
    [etapa],
  )
  // Initialise with all weeks of the first etapa selected
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(firstSemanas.map(s => s.numeroSemana)),
  )
  const [nombre, setNombre] = useState('')
  const [series, setSeries] = useState('')
  const [rpt, setRpt] = useState('')
  const [rir, setRir] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Single handler: update both etapaId and selected atomically so React
  // batches them into one render — no stale-closure risk, no interim flash.
  function handleEtapaChange(newId: string) {
    const newEtapa = etapas.find(e => e.id === newId) ?? null
    const newSemanas = newEtapa
      ? generarSemanasCliente(newEtapa.fechaInicio, newEtapa.fechaFin)
      : []
    setEtapaId(newId)
    setSelected(new Set(newSemanas.map(s => s.numeroSemana)))
  }

  function toggleWeek(num: number) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(num) ? next.delete(num) : next.add(num)
      return next
    })
  }
  function toggleAll(val: boolean) {
    setSelected(val ? new Set(semanas.map(s => s.numeroSemana)) : new Set())
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!etapaId) { setError('Selecciona una etapa.'); return }
    if (selected.size === 0) { setError('Selecciona al menos una semana.'); return }
    const semanasSeleccionadas = semanas.filter(s => selected.has(s.numeroSemana))
    startTransition(async () => {
      const result = await agregarEjercicioAEtapaExistente(
        etapaId, nombre, parseInt(series), rpt,
        rir !== '' ? parseInt(rir) : null,
        semanasSeleccionadas,
      )
      if (result.error) setError(result.error)
      else { await onSuccess(); onClose() }
    })
  }

  const allSelected = selected.size === semanas.length && semanas.length > 0
  const noneSelected = selected.size === 0

  return (
    <ModalShell
      title="Agregar Ejercicio a Etapa"
      icon={<Plus className="w-4 h-4 text-uady-gold" />}
      onClose={onClose}
    >
      <datalist id="cat-agregar-global">
        {catalogo.map(c => <option key={c.id} value={c.nombre} />)}
      </datalist>
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          {etapas.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No hay etapas creadas. Usa &quot;+ Nueva Etapa&quot; para crear una primero.
            </div>
          ) : (
            <>
              {/* 1. Seleccionar Etapa */}
              <div>
                <label className={labelCls}>Etapa *</label>
                <select
                  value={etapaId}
                  onChange={e => handleEtapaChange(e.target.value)}
                  required
                  className={inputCls + ' bg-white'}
                >
                  {etapas.map(et => (
                    <option key={et.id} value={et.id}>{et.nombre}</option>
                  ))}
                </select>
              </div>

              {/* 2. Seleccionar Ejercicio */}
              <div>
                <label className={labelCls}>Nombre del Ejercicio *</label>
                <input
                  list="cat-agregar-global"
                  type="text"
                  required
                  maxLength={80}
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Escribe o selecciona del catálogo…"
                  className={inputCls}
                />
              </div>

              {/* 3. Carga Base */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Series *</label>
                  <input type="number" required min={1} max={20} value={series} onChange={e => setSeries(e.target.value)} placeholder="4" className={inputCls + ' text-center'} />
                </div>
                <div>
                  <label className={labelCls}>RPT *</label>
                  <input type="text" required maxLength={20} value={rpt} onChange={e => setRpt(e.target.value)} placeholder="16-18" className={inputCls + ' text-center'} />
                </div>
                <div>
                  <label className={labelCls}>RIR</label>
                  <input type="number" min={0} max={5} value={rir} onChange={e => setRir(e.target.value)} placeholder="3" className={inputCls + ' text-center'} />
                </div>
              </div>

              {/* 4. Seleccionar Semanas */}
              {semanas.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={labelCls + ' mb-0'}>Semanas de Aplicación *</label>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => toggleAll(true)}
                        disabled={allSelected}
                        className="text-[10px] text-uady-gold font-semibold disabled:opacity-40 hover:underline">Todas</button>
                      <span className="text-slate-300 text-xs">|</span>
                      <button type="button" onClick={() => toggleAll(false)}
                        disabled={noneSelected}
                        className="text-[10px] text-slate-400 font-semibold disabled:opacity-40 hover:underline">Ninguna</button>
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-52 overflow-y-auto">
                    {semanas.map(s => (
                      <label key={s.numeroSemana}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selected.has(s.numeroSemana)}
                          onChange={() => toggleWeek(s.numeroSemana)}
                          className="w-4 h-4 rounded accent-uady-gold cursor-pointer"
                        />
                        <span className="text-sm text-slate-700">
                          <span className="font-semibold text-uady-blue">Sem. {s.numeroSemana}</span>
                          {' '}
                          <span className="text-slate-400 text-xs">({formatearFechaSemana(s.fechaInicioSemana, s.fechaFinSemana)})</span>
                        </span>
                      </label>
                    ))}
                  </div>
                  {selected.size > 0 && (
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      {selected.size} de {semanas.length} semana{semanas.length !== 1 ? 's' : ''} seleccionada{selected.size !== 1 ? 's' : ''}.
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-xs text-red-700">{error}</div>}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0">
          <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 rounded-lg py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
          <button
            type="submit"
            disabled={isPending || selected.size === 0 || !etapaId || etapas.length === 0}
            className="flex-1 bg-uady-gold text-uady-blue rounded-lg py-2.5 text-sm font-bold hover:brightness-110 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
          >
            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Creando…</> : `Agregar (${selected.size} sem.)`}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

// ─── EditarCeldaModal ─────────────────────────────────────────────────────────

interface EditarCeldaState { detalle: DetalleSemanaData; ejercicioNombre: string }

function EditarCeldaModal({
  estado, onClose, onSuccess,
}: { estado: EditarCeldaState; onClose: () => void; onSuccess: () => Promise<void> }) {
  const { detalle, ejercicioNombre } = estado
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await actualizarDetalleSemana(detalle.id, fd)
      if (result.error) setError(result.error)
      else { await onSuccess(); onClose() }
    })
  }

  return (
    <ModalShell title={ejercicioNombre} icon={<Pencil className="w-4 h-4 text-uady-gold" />} onClose={onClose} maxW="max-w-sm">
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-3 space-y-4">
        <p className="text-slate-400 text-[11px]">
          Sem. {detalle.numeroSemana} · {formatearFechaSemana(detalle.fechaInicioSemana, detalle.fechaFinSemana)}
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Series *</label>
            <input name="series" type="number" required min={1} max={20} defaultValue={detalle.series} className={inputCls + ' text-center font-bold'} />
          </div>
          <div>
            <label className={labelCls}>RPT *</label>
            <input name="rpt" type="text" required maxLength={20} defaultValue={detalle.rpt} className={inputCls + ' text-center'} />
          </div>
          <div>
            <label className={labelCls}>RIR</label>
            <input name="rir" type="number" min={0} max={5} defaultValue={detalle.rir ?? ''} className={inputCls + ' text-center'} />
          </div>
        </div>
        {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-xs text-red-700">{error}</div>}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 rounded-lg py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
          <button type="submit" disabled={isPending} className="flex-1 bg-uady-gold text-uady-blue rounded-lg py-2.5 text-sm font-bold hover:brightness-110 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando…</> : 'Actualizar Semana'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

// ─── TablaMatriz ──────────────────────────────────────────────────────────────

function TablaMatriz({
  ejercicios,
  etapas,
  catalogo,
  isAdmin,
  onRefresh,
}: {
  ejercicios: EjercicioPrincipalData[]
  etapas: EtapaData[]
  catalogo: CatalogoData[]
  isAdmin: boolean
  onRefresh: () => Promise<void>
}) {
  const [editarCelda, setEditarCelda] = useState<EditarCeldaState | null>(null)
  const [editarEtapa, setEditarEtapa] = useState<EtapaData | null>(null)
  const [editarNombreEj, setEditarNombreEj] = useState<{ nombre: string } | null>(null)

  const [itemToDelete, setItemToDelete] = useState<
    | { type: 'etapa'; id: string; nombre: string }
    | { type: 'ejercicio'; nombre: string }
    | null
  >(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const globalWeeks = useMemo(() => {
    const map = new Map<string, { key: string; inicio: string; fin: string }>()
    ejercicios.forEach(ej =>
      ej.semanas.forEach(s => {
        const k = dateKey(s.fechaInicioSemana)
        if (!map.has(k)) map.set(k, { key: k, inicio: s.fechaInicioSemana, fin: s.fechaFinSemana })
      })
    )
    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key))
  }, [ejercicios])

  // Unique exercise names in first-appearance order (global deduplication)
  const uniqueNames = useMemo(() => {
    const seen = new Set<string>()
    const names: string[] = []
    for (const ej of ejercicios) {
      const key = ej.nombre.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        names.push(ej.nombre)
      }
    }
    return names
  }, [ejercicios])

  // Key: nameLower::weekKey — first DetalleSemana found wins (handles same exercise across stages)
  const detalleMap = useMemo(() => {
    const map = new Map<string, DetalleSemanaData>()
    ejercicios.forEach(ej =>
      ej.semanas.forEach(s => {
        const key = `${ej.nombre.toLowerCase()}::${dateKey(s.fechaInicioSemana)}`
        if (!map.has(key)) map.set(key, s)
      })
    )
    return map
  }, [ejercicios])

  const etapaGroups = useMemo(() => {
    type Group = { etapa: EtapaData | null; count: number }
    const groups: Group[] = []
    for (const w of globalWeeks) {
      const etapa = etapas.find(e => dateKey(e.fechaInicio) <= w.key && w.key <= dateKey(e.fechaFin)) ?? null
      const last = groups[groups.length - 1]
      if (last && last.etapa?.id === etapa?.id) last.count++
      else groups.push({ etapa, count: 1 })
    }
    return groups
  }, [globalWeeks, etapas])

  function handleEliminarEjercicio(nombre: string) {
    setDeleteError(null)
    setItemToDelete({ type: 'ejercicio', nombre })
  }

  function handleEliminarEtapa(id: string, nombre: string) {
    setDeleteError(null)
    setItemToDelete({ type: 'etapa', id, nombre })
  }

  async function handleConfirmDelete() {
    if (!itemToDelete) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      const result = itemToDelete.type === 'etapa'
        ? await eliminarEtapa(itemToDelete.id)
        : await eliminarEjercicioPorNombreGlobal(itemToDelete.nombre)
      if (result.error) { setDeleteError(result.error); return }
      await onRefresh()
      setItemToDelete(null)
    } catch {
      setDeleteError('Ocurrió un error al eliminar. Inténtalo de nuevo.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (ejercicios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Activity className="w-12 h-12 text-slate-200 mb-3" />
        <p className="text-slate-400 text-sm font-medium">Sin ejercicios en la matriz.</p>
        {isAdmin && <p className="text-slate-300 text-xs mt-1">Usa &quot;+ Nueva Etapa&quot; para comenzar.</p>}
      </div>
    )
  }

  const totalCols = 1 + globalWeeks.length * 3

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            {/* ── Fila 0: Etapas ── */}
            <tr>
              <th rowSpan={3} className="min-w-[160px] w-[180px] text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide border-r border-slate-200 align-middle">
                EJERCICIO
              </th>
              {etapaGroups.map((g, i) => {
                const etapa = g.etapa
                return etapa ? (
                  <th
                    key={etapa.id}
                    colSpan={g.count * 3}
                    className="px-2 py-1.5 text-center border-l border-white/20 bg-uady-gold text-uady-blue group/etapa"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest leading-none">
                        {etapa.nombre.toUpperCase()}
                      </span>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => setEditarEtapa(etapa)}
                          className="opacity-0 group-hover/etapa:opacity-100 p-0.5 rounded bg-uady-blue/10 hover:bg-uady-blue/20 transition-all"
                          title="Editar etapa"
                        >
                          <Pencil className="w-2.5 h-2.5 text-uady-blue" />
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleEliminarEtapa(etapa.id, etapa.nombre)}
                          className="opacity-0 group-hover/etapa:opacity-100 p-0.5 rounded bg-uady-blue/10 hover:bg-red-500/20 transition-all"
                          title="Eliminar etapa"
                        >
                          <Trash2 className="w-2.5 h-2.5 text-uady-blue hover:text-red-600" />
                        </button>
                      )}
                    </div>
                  </th>
                ) : (
                  <th key={`orphan-${i}`} colSpan={g.count * 3} className="px-2 py-2.5 border-l border-slate-200 bg-slate-50" />
                )
              })}
            </tr>

            {/* ── Fila 1: Semanas con fechas ── */}
            <tr className="bg-slate-50">
              {globalWeeks.map((w, i) => (
                <th key={w.key} colSpan={3} className="px-2 py-2.5 text-center border-l border-slate-200 bg-uady-blue/5 whitespace-nowrap">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">S{i + 1}</span>
                    <span className="text-[10px] font-semibold text-uady-blue tracking-wide">
                      {formatearFechaSemana(w.inicio, w.fin)}
                    </span>
                  </div>
                </th>
              ))}
            </tr>

            {/* ── Fila 2: SERIES / RPT / RIR ── */}
            <tr>
              {globalWeeks.flatMap(w => [
                <th key={`${w.key}-ser`} className="px-3 py-2 text-center text-[10px] font-bold text-white uppercase tracking-wide bg-uady-blue border-l border-uady-blue/30 min-w-[52px]">SERIES</th>,
                <th key={`${w.key}-rpt`} className="px-3 py-2 text-center text-[10px] font-bold text-white uppercase tracking-wide bg-uady-blue border-l border-uady-blue/30 min-w-[60px]">RPT</th>,
                <th key={`${w.key}-rir`} className="px-3 py-2 text-center text-[10px] font-bold text-white uppercase tracking-wide bg-uady-blue border-l border-uady-blue/30 min-w-[46px]">RIR</th>,
              ])}
            </tr>
          </thead>
          <tbody>
            {uniqueNames.length === 0 ? (
              <tr>
                <td colSpan={totalCols} className="text-center py-10 text-slate-400 text-sm italic">Sin ejercicios planificados.</td>
              </tr>
            ) : (
              uniqueNames.map((nombre, idx) => {
                // Alternate between two close shades of uady-blue for a clean corporate look
                const nameBg = idx % 2 === 0 ? 'bg-uady-blue' : 'bg-uady-blue/90'
                return (
                  <tr key={nombre} className="group/row border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className={`${nameBg} text-white px-4 py-3 font-semibold text-sm border-r border-slate-200`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="leading-tight">{nombre}</span>
                        {isAdmin && (
                          <div className="opacity-0 group-hover/row:opacity-100 flex items-center gap-1 flex-shrink-0 transition-opacity">
                            <button
                              type="button"
                              onClick={() => setEditarNombreEj({ nombre })}
                              className="p-1 rounded hover:bg-white/20 transition-all"
                              title="Editar nombre"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEliminarEjercicio(nombre)}
                              className="p-1 rounded hover:bg-white/20 transition-all"
                              title="Eliminar ejercicio"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    {globalWeeks.flatMap(w => {
                      const det = detalleMap.get(`${nombre.toLowerCase()}::${w.key}`)
                      return [
                        <td key={`${w.key}-ser`} className="relative group/cell px-3 py-3 text-center font-bold text-uady-blue text-sm border-l border-slate-100 min-w-[52px]">
                          {det ? (
                            <>
                              {det.series}
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => setEditarCelda({ detalle: det, ejercicioNombre: nombre })}
                                  className="absolute top-1 right-1 opacity-0 group-hover/cell:opacity-100 p-0.5 rounded bg-white/80 hover:bg-uady-gold/20 border border-slate-200 hover:border-uady-gold/40 transition-all shadow-sm"
                                  title={`Editar Sem. ${det.numeroSemana}`}
                                >
                                  <Pencil className="w-2.5 h-2.5 text-slate-500" />
                                </button>
                              )}
                            </>
                          ) : <span className="text-slate-200 font-normal">—</span>}
                        </td>,
                        <td key={`${w.key}-rpt`} className="px-3 py-3 text-center text-slate-700 text-sm border-l border-slate-100 whitespace-nowrap">
                          {det ? det.rpt : <span className="text-slate-200">—</span>}
                        </td>,
                        <td key={`${w.key}-rir`} className="px-3 py-3 text-center text-slate-500 text-sm border-l border-slate-100">
                          {det ? (det.rir !== null ? det.rir : <span className="text-slate-300">—</span>) : <span className="text-slate-200">—</span>}
                        </td>,
                      ]
                    })}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {editarCelda && (
        <EditarCeldaModal estado={editarCelda} onClose={() => setEditarCelda(null)} onSuccess={onRefresh} />
      )}
      {editarEtapa && (
        <EditarEtapaModal etapa={editarEtapa} onClose={() => setEditarEtapa(null)} onSuccess={onRefresh} />
      )}
      {editarNombreEj && (
        <EditarNombreEjercicioModal
          nombreActual={editarNombreEj.nombre}
          catalogo={catalogo}
          onClose={() => setEditarNombreEj(null)}
          onSuccess={onRefresh}
        />
      )}
      {itemToDelete && (
        <ConfirmDeleteModal
          title={itemToDelete.type === 'etapa' ? '¿Eliminar Etapa?' : '¿Eliminar Ejercicio?'}
          description={
            itemToDelete.type === 'etapa'
              ? `¿Estás seguro de que deseas eliminar la etapa "${itemToDelete.nombre}" y todos sus ejercicios planificados? Esta acción no se puede deshacer.`
              : `¿Estás seguro de que deseas eliminar "${itemToDelete.nombre}" de todas las etapas y sus semanas planificadas? Esta acción no se puede deshacer.`
          }
          isPending={isDeleting}
          error={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={() => { if (!isDeleting) { setItemToDelete(null); setDeleteError(null) } }}
        />
      )}
    </>
  )
}

// ─── AccesoriosPanel ──────────────────────────────────────────────────────────

function AccesoriosPanel({
  accesorios, isAdmin, onRefresh,
}: { accesorios: AccesorioData[]; isAdmin: boolean; onRefresh: () => Promise<void> }) {
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState<'TREN_INFERIOR' | 'TREN_SUPERIOR'>('TREN_INFERIOR')
  const [addPending, startAddTransition] = useTransition()

  const [itemToDelete, setItemToDelete] = useState<{ id: string; nombre: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const inferior = accesorios.filter(a => a.tipo === 'TREN_INFERIOR')
  const superior = accesorios.filter(a => a.tipo === 'TREN_SUPERIOR')

  function handleEliminar(id: string, nombreAcc: string) {
    setDeleteError(null)
    setItemToDelete({ id, nombre: nombreAcc })
  }

  async function handleConfirmDelete() {
    if (!itemToDelete) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      const result = await eliminarEjercicioAccesorio(itemToDelete.id)
      if (result.error) { setDeleteError(result.error); return }
      await onRefresh()
      setItemToDelete(null)
    } catch {
      setDeleteError('Ocurrió un error al eliminar. Inténtalo de nuevo.')
    } finally {
      setIsDeleting(false)
    }
  }
  function handleAgregar(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) return
    const fd = new FormData(); fd.set('nombre', nombre.trim()); fd.set('tipo', tipo)
    startAddTransition(async () => { await crearEjercicioAccesorio(fd); setNombre(''); await onRefresh() })
  }

  const renderLista = (titulo: string, items: AccesorioData[], headerClass: string) => (
    <div className="rounded-xl overflow-hidden border border-slate-200">
      <div className={`px-4 py-2.5 font-bold text-sm uppercase tracking-wide ${headerClass}`}>{titulo}</div>
      {items.length === 0 ? (
        <div className="px-4 py-5 text-center text-slate-400 text-xs">Sin ejercicios accesorios.</div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map(a => (
            <li key={a.id} className="group/acc flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors">
              <span className="text-slate-700 text-sm">{a.nombre}</span>
              {isAdmin && (
                <button type="button" onClick={() => handleEliminar(a.id, a.nombre)}
                  className="opacity-0 group-hover/acc:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:cursor-not-allowed">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )

  return (
    <div className="space-y-4">
      {renderLista('Tren Inferior', inferior, 'bg-pink-100 text-pink-800')}
      {renderLista('Tren Superior', superior, 'bg-red-700 text-white')}
      {isAdmin && (
        <form onSubmit={handleAgregar} className="flex flex-col sm:flex-row gap-2 pt-1">
          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre del ejercicio…"
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uady-blue/30 focus:border-uady-blue transition-all" />
          <select value={tipo} onChange={e => setTipo(e.target.value as 'TREN_INFERIOR' | 'TREN_SUPERIOR')}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-uady-blue/30 focus:border-uady-blue transition-all">
            <option value="TREN_INFERIOR">Tren Inferior</option>
            <option value="TREN_SUPERIOR">Tren Superior</option>
          </select>
          <button type="submit" disabled={addPending || !nombre.trim()}
            className="px-4 py-2 bg-uady-gold text-uady-blue text-sm font-bold rounded-lg hover:brightness-110 disabled:opacity-60 transition-all flex items-center gap-1.5 justify-center">
            {addPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Agregar
          </button>
        </form>
      )}
      {itemToDelete && (
        <ConfirmDeleteModal
          title="¿Eliminar Ejercicio?"
          description={`¿Estás seguro de que deseas eliminar "${itemToDelete.nombre}" de los ejercicios accesorios? Esta acción no se puede deshacer.`}
          isPending={isDeleting}
          error={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={() => { if (!isDeleting) { setItemToDelete(null); setDeleteError(null) } }}
        />
      )}
    </div>
  )
}

// ─── VideoModal ───────────────────────────────────────────────────────────────

function VideoModal({
  onClose, onSuccess, videoEditar = null,
}: { onClose: () => void; onSuccess: () => Promise<void>; videoEditar?: VideoData | null }) {
  const isEdit = videoEditar !== null
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [categoria, setCategoria] = useState(videoEditar?.categoria ?? CATEGORIAS_FIJAS[0])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = isEdit ? await actualizarVideo(videoEditar!.id, fd) : await crearVideo(fd)
      if (result.error) setError(result.error)
      else { await onSuccess(); onClose() }
    })
  }

  return (
    <ModalShell title={isEdit ? 'Editar Video' : 'Agregar Video'} icon={<Video className="w-4 h-4 text-uady-gold" />} onClose={onClose} maxW="max-w-md">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className={labelCls}>URL de YouTube *</label>
          <input name="url" type="url" required defaultValue={videoEditar?.url ?? ''} placeholder="https://www.youtube.com/watch?v=…" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Título *</label>
          <input name="titulo" type="text" required maxLength={120} defaultValue={videoEditar?.titulo ?? ''} placeholder="Ej. Sentadilla con barra" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Descripción</label>
          <textarea name="descripcion" rows={2} maxLength={300} defaultValue={videoEditar?.descripcion ?? ''} placeholder="Descripción o cue técnico…" className={inputCls + ' resize-none'} />
        </div>
        <div>
          <label className={labelCls}>Categoría *</label>
          <select name="categoria" required value={categoria} onChange={e => setCategoria(e.target.value)} className={inputCls + ' bg-white'}>
            {CATEGORIAS_FIJAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        {categoria === 'Estabilidad' && (
          <div>
            <label className={labelCls}>Subcategoría</label>
            <select name="subcategoria" defaultValue={videoEditar?.subcategoria ?? ''} className={inputCls + ' bg-white'}>
              <option value="">General</option>
              <option value={SUBCATEGORIA_LATERALIDAD}>{SUBCATEGORIA_LATERALIDAD}</option>
            </select>
          </div>
        )}
        {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-xs text-red-700">{error}</div>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 rounded-lg py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
          <button type="submit" disabled={isPending} className="flex-1 bg-uady-gold text-uady-blue rounded-lg py-2.5 text-sm font-bold hover:brightness-110 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando…</> : isEdit ? 'Actualizar Video' : 'Guardar Video'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

// ─── VideoCard ────────────────────────────────────────────────────────────────

function VideoCard({ video, isAdmin, onEditar, onEliminar }: {
  video: VideoData; isAdmin: boolean; onEditar: (v: VideoData) => void; onEliminar: (id: string) => void
}) {
  return (
    <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden relative">
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        <iframe src={getYouTubeEmbedUrl(video.url)} title={video.titulo}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen className="absolute inset-0 w-full h-full border-0" loading="lazy" />
      </div>
      <div className="p-3">
        <p className="font-bold text-uady-blue text-sm leading-snug">{video.titulo}</p>
        {video.descripcion && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{video.descripcion}</p>}
      </div>
      {isAdmin && (
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEditar(video)} className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white text-slate-600 hover:text-uady-blue transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={() => onEliminar(video.id)} className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white text-slate-600 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      )}
    </div>
  )
}

// ─── VideoGrid ────────────────────────────────────────────────────────────────

function VideoGrid({ videos, isAdmin, onEditar, onEliminar }: {
  videos: VideoData[]; isAdmin: boolean;
  onEditar: (v: VideoData) => void; onEliminar: (id: string) => void
}) {
  if (videos.length === 0) {
    return (
      <div className="text-center py-8">
        <PlayCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
        <p className="text-sm text-slate-400">Sin videos en esta sección.</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map(v => <VideoCard key={v.id} video={v} isAdmin={isAdmin} onEditar={onEditar} onEliminar={onEliminar} />)}
    </div>
  )
}

function CategoriaSection({ categoria, videos, isAdmin, onEditar, onEliminar }: {
  categoria: string; videos: VideoData[]; isAdmin: boolean;
  onEditar: (v: VideoData) => void; onEliminar: (id: string) => void
}) {
  const [open, setOpen] = useState(true)
  const esEstabilidad = categoria === 'Estabilidad'
  const generales = esEstabilidad ? videos.filter(v => !v.subcategoria) : videos
  const lateralidad = esEstabilidad ? videos.filter(v => v.subcategoria === SUBCATEGORIA_LATERALIDAD) : []

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-uady-gold rounded-full" />
          <span className="font-black text-uady-blue text-base">{categoria}</span>
          <span className="text-xs text-slate-400 font-medium bg-slate-200 px-2 py-0.5 rounded-full">{videos.length}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="p-5 border-t border-slate-100">
          {esEstabilidad ? (
            <div className="space-y-6">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Estabilidad General</p>
                <VideoGrid videos={generales} isAdmin={isAdmin} onEditar={onEditar} onEliminar={onEliminar} />
              </div>
              <div className="bg-uady-gold/5 border border-uady-gold/20 rounded-xl p-4">
                <p className="text-[11px] font-bold text-uady-blue uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-uady-gold rounded-full" />
                  Lateralidad
                </p>
                <VideoGrid videos={lateralidad} isAdmin={isAdmin} onEditar={onEditar} onEliminar={onEliminar} />
              </div>
            </div>
          ) : (
            <VideoGrid videos={videos} isAdmin={isAdmin} onEditar={onEditar} onEliminar={onEliminar} />
          )}
        </div>
      )}
    </div>
  )
}

// ─── GimnasioClient (export principal) ───────────────────────────────────────

interface GimnasioClientProps {
  rol: string
  ejercicios: EjercicioPrincipalData[]
  accesorios: AccesorioData[]
  videosAgrupados: Record<string, VideoData[]>
  etapas: EtapaData[]
  catalogo: CatalogoData[]
  nombresEjercicios: string[]
  notas: NotaProgramacionData[]
}

export default function GimnasioClient({
  rol,
  ejercicios: ejerciciosInit,
  accesorios: accesoriosInit,
  videosAgrupados: videosAgrupadosInit,
  etapas: etapasInit,
  catalogo: catalogoInit,
  nombresEjercicios: nombresEjerciciosInit,
  notas: notasInit,
}: GimnasioClientProps) {
  const [ejercicios, setEjercicios] = useState(ejerciciosInit)
  const [accesorios, setAccesorios] = useState(accesoriosInit)
  const [videosAgrupados, setVideosAgrupados] = useState(videosAgrupadosInit)
  const [etapas, setEtapas] = useState(etapasInit)
  const [catalogo, setCatalogo] = useState(catalogoInit)
  const [nombresEjercicios, setNombresEjercicios] = useState(nombresEjerciciosInit)
  const [notas, setNotas] = useState(notasInit)

  const [showEtapaModal, setShowEtapaModal] = useState(false)
  const [showAgregarEjModal, setShowAgregarEjModal] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [videoEditar, setVideoEditar] = useState<VideoData | null>(null)

  const isAdmin = rol === 'ADMIN'

  async function handleRefreshMatriz() {
    const [ejs, ets, cat, nombres] = await Promise.all([
      obtenerMatriz(), obtenerEtapas(), obtenerCatalogoEjercicios(), obtenerNombresEjercicios(),
    ])
    setEjercicios(ejs); setEtapas(ets); setCatalogo(cat); setNombresEjercicios(nombres)
  }
  async function handleRefreshAccesorios() { setAccesorios(await obtenerAccesorios()) }
  async function handleRefreshNotas() { setNotas(await obtenerNotasProgramacion()) }
  async function handleRefreshVideos() { setVideosAgrupados(await obtenerVideosAgrupados()) }
  async function handleEliminarVideo(id: string) {
    if (!window.confirm('¿Eliminar este video?')) return
    await eliminarVideo(id); await handleRefreshVideos()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-7 bg-uady-gold rounded-full" />
            <h1 className="text-3xl font-black text-uady-blue">Gimnasio y Preparación Física</h1>
          </div>
          <p className="text-slate-500 text-sm ml-3">Periodización por microciclos y preparación física del club.</p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={() => setShowAgregarEjModal(true)}
              className="flex items-center gap-2 border border-uady-blue/40 text-uady-blue px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-uady-blue hover:text-white transition-all"
            >
              <Plus className="w-4 h-4" />
              Agregar Ejercicio a Etapa
            </button>
            <button
              onClick={() => setShowEtapaModal(true)}
              className="flex items-center gap-2 bg-uady-gold text-uady-blue px-5 py-2.5 rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-md shadow-uady-gold/20"
            >
              <Plus className="w-4 h-4" />
              Nueva Etapa
            </button>
          </div>
        )}
      </div>

      {/* ══ Matriz ══ */}
      <section className="mb-12">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-6 bg-uady-gold rounded-full" />
            <h2 className="text-xl font-black text-uady-blue">Matriz de Periodización</h2>
          </div>
          <TablaMatriz ejercicios={ejercicios} etapas={etapas} catalogo={catalogo} isAdmin={isAdmin} onRefresh={handleRefreshMatriz} />
        </div>
      </section>

      {/* ══ Accesorios + Notas ══ */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-uady-gold rounded-full" />
              <h2 className="text-xl font-black text-uady-blue">Ejercicios Accesorios</h2>
            </div>
            <AccesoriosPanel accesorios={accesorios} isAdmin={isAdmin} onRefresh={handleRefreshAccesorios} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-uady-gold rounded-full" />
              <h2 className="text-xl font-black text-uady-blue">Notas de Programación</h2>
            </div>
            <NotasProgramacion notas={notas} isAdmin={isAdmin} onRefresh={handleRefreshNotas} />
          </div>
        </div>
      </section>

      {/* ══ Videoteca ══ */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-uady-gold rounded-full" />
            <h2 className="text-xl font-black text-uady-blue">Videoteca de Ejercicios</h2>
          </div>
          {isAdmin && (
            <button onClick={() => { setVideoEditar(null); setShowVideoModal(true) }}
              className="flex items-center gap-2 border border-uady-blue/40 text-uady-blue px-4 py-2 rounded-xl text-sm font-bold hover:bg-uady-blue hover:text-white transition-all self-start sm:self-auto flex-shrink-0">
              <Plus className="w-4 h-4" />
              Agregar Video
            </button>
          )}
        </div>
        <div className="space-y-4">
          {CATEGORIAS_FIJAS.map(cat => (
            <CategoriaSection key={cat} categoria={cat} videos={videosAgrupados[cat] ?? []} isAdmin={isAdmin}
              onEditar={v => { setVideoEditar(v); setShowVideoModal(true) }}
              onEliminar={handleEliminarVideo} />
          ))}
        </div>
      </section>

      {/* ── Modales globales ── */}
      {showEtapaModal && (
        <EtapaModal nombres={nombresEjercicios} onClose={() => setShowEtapaModal(false)} onSuccess={handleRefreshMatriz} />
      )}
      {showAgregarEjModal && (
        <AgregarEjercicioGlobalModal
          etapas={etapas}
          catalogo={catalogo}
          onClose={() => setShowAgregarEjModal(false)}
          onSuccess={handleRefreshMatriz}
        />
      )}
      {showVideoModal && (
        <VideoModal onClose={() => { setShowVideoModal(false); setVideoEditar(null) }} onSuccess={handleRefreshVideos} videoEditar={videoEditar} />
      )}
    </div>
  )
}
