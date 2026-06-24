'use client'

import { useState, useTransition, useMemo, useActionState, useEffect } from 'react'
import { X, Plus, Search, Filter, Loader2 } from 'lucide-react'
import { crearCita, actualizarEstadoCita, eliminarCita } from '@/actions/citas'
import type { PosicionValue } from '@/lib/constants/posiciones'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CitaRow {
  id: string
  tipoEspecialista: string
  fechaHora: Date | string
  motivo: string
  estado: string
  atletaId: string
  atleta: {
    id: string
    nombre: string
    apellidos: string
    posicion?: PosicionValue | null
  }
}

interface AtletaOpt {
  id: string
  nombre: string
  apellidos: string
}

interface Props {
  citas: CitaRow[]
  atletas: AtletaOpt[]
  isAdmin: boolean
  currentAtletaId: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIPOS_ESPECIALISTA = ['Psicólogo', 'Nutriólogo', 'Dentista', 'Médico General', 'Otro']
const ESTADOS = ['Programada', 'Completada', 'Cancelada'] as const

const ESTADO_COLORS: Record<string, string> = {
  Programada: 'bg-blue-100 text-blue-700',
  Completada: 'bg-emerald-100 text-emerald-700',
  Cancelada:  'bg-red-100 text-red-600',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtFechaHora = (d: Date | string) =>
  new Date(d).toLocaleString('es-MX', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

const fmtFechaInput = (d: Date | string) => {
  const dt = new Date(d)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

// ─── NuevaCitaModal ──────────────────────────────────────────────────────────

function NuevaCitaModal({
  isAdmin,
  atletas,
  onClose,
}: {
  isAdmin: boolean
  atletas: AtletaOpt[]
  onClose: () => void
}) {
  const [state, formAction, isPending] = useActionState(crearCita, { error: null })

  useEffect(() => {
    if (state.success) onClose()
  }, [state.success, onClose])

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all'
  const labelCls = 'block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-uady-blue px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-uady-gold" />
            <h2 className="text-white font-bold text-base">Nueva Cita Médica</h2>
          </div>
          <button type="button" onClick={onClose} className="text-white/60 hover:text-white p-1 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form action={formAction} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 p-6 space-y-4">

            {isAdmin && (
              <div>
                <label className={labelCls}>Atleta <span className="text-uady-gold">*</span></label>
                <select name="atletaId" required className={inputCls}>
                  <option value="">Seleccionar atleta...</option>
                  {atletas.map(a => (
                    <option key={a.id} value={a.id}>{a.nombre} {a.apellidos}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className={labelCls}>Tipo de Especialista <span className="text-uady-gold">*</span></label>
              <select name="tipoEspecialista" required className={inputCls}>
                <option value="">Seleccionar especialista...</option>
                {TIPOS_ESPECIALISTA.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>Fecha y Hora <span className="text-uady-gold">*</span></label>
              <input
                type="datetime-local"
                name="fechaHora"
                required
                className={inputCls}
                defaultValue={fmtFechaInput(new Date())}
              />
            </div>

            <div>
              <label className={labelCls}>Motivo de la Consulta <span className="text-uady-gold">*</span></label>
              <textarea
                name="motivo"
                required
                rows={3}
                placeholder="Describe brevemente el motivo de la cita..."
                className={`${inputCls} resize-none`}
              />
            </div>

            {state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-xs text-red-700 flex items-center gap-2">
                <span>⚠️</span> {state.error}
              </div>
            )}
          </div>

          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
            <button
              type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={isPending}
              className="flex-1 bg-uady-gold text-uady-blue rounded-lg py-2.5 text-sm font-bold hover:brightness-110 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando…</> : 'Guardar Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── EstadoBadge + ChangeEstado ───────────────────────────────────────────────

function EstadoActions({
  citaId,
  estadoActual,
  isAdmin,
  esDuena,
}: {
  citaId: string
  estadoActual: string
  isAdmin: boolean
  esDuena: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const canChange = isAdmin || esDuena

  const cambiarEstado = (nuevoEstado: string) => {
    setError(null)
    startTransition(async () => {
      const res = await actualizarEstadoCita(citaId, nuevoEstado)
      if (res?.error) setError(res.error)
    })
  }

  const siguientes = ESTADOS.filter(e => e !== estadoActual)

  return (
    <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-gray-100">
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ESTADO_COLORS[estadoActual] ?? 'bg-gray-100 text-gray-600'}`}>
        {estadoActual}
      </span>
      {canChange && siguientes.map(s => (
        <button
          key={s}
          onClick={() => cambiarEstado(s)}
          disabled={isPending}
          className="text-xs font-semibold text-gray-400 hover:text-uady-blue border border-gray-200 hover:border-uady-blue px-2.5 py-1 rounded-full transition-all disabled:opacity-50"
        >
          → {s}
        </button>
      ))}
      {error && <p className="text-xs text-red-600 w-full">⚠️ {error}</p>}
    </div>
  )
}

function EliminarBtn({ citaId }: { citaId: string }) {
  const [isPending, startTransition] = useTransition()
  const [confirm, setConfirm] = useState(false)

  const handleEliminar = () => {
    startTransition(async () => {
      await eliminarCita(citaId)
    })
  }

  if (confirm) {
    return (
      <div className="flex gap-2 mt-2">
        <button
          onClick={handleEliminar}
          disabled={isPending}
          className="text-xs font-bold text-red-600 border border-red-200 px-2.5 py-1 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {isPending ? '…' : 'Confirmar'}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="text-xs text-gray-400 border border-gray-200 px-2.5 py-1 rounded-full hover:bg-gray-50 transition-colors"
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="text-xs text-gray-300 hover:text-red-500 transition-colors mt-1"
    >
      Eliminar
    </button>
  )
}

// ─── CitasClient ──────────────────────────────────────────────────────────────

export default function CitasClient({ citas, atletas, isAdmin, currentAtletaId }: Props) {
  const [showModal, setShowModal]         = useState(false)
  const [busqueda, setBusqueda]           = useState('')
  const [filtroEspecialista, setFiltroEspecialista] = useState('Todos')
  const [filtroEstado, setFiltroEstado]   = useState('Todos')

  const hasFilters = busqueda.trim() || filtroEspecialista !== 'Todos' || filtroEstado !== 'Todos'

  const citasFiltradas = useMemo(() => {
    return citas.filter(c => {
      const nombre = `${c.atleta.nombre} ${c.atleta.apellidos}`.toLowerCase()
      const matchBusqueda   = !isAdmin || !busqueda.trim() || nombre.includes(busqueda.trim().toLowerCase())
      const matchEspecial   = filtroEspecialista === 'Todos' || c.tipoEspecialista === filtroEspecialista
      const matchEstado     = filtroEstado === 'Todos' || c.estado === filtroEstado
      return matchBusqueda && matchEspecial && matchEstado
    })
  }, [citas, busqueda, filtroEspecialista, filtroEstado, isAdmin])

  const proximas  = citasFiltradas.filter(c => c.estado === 'Programada')
  const pasadas   = citasFiltradas.filter(c => c.estado !== 'Programada')

  return (
    <div className="space-y-5">

      {/* Header actions */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-uady-blue text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" />
          Nueva Cita
        </button>
      </div>

      {/* Filtros */}
      {(isAdmin || citas.length > 0) && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-3.5 h-3.5 text-uady-blue/50" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filtros</span>
            {hasFilters && (
              <button
                onClick={() => { setBusqueda(''); setFiltroEspecialista('Todos'); setFiltroEstado('Todos') }}
                className="ml-auto text-[10px] text-uady-blue/50 hover:text-uady-blue font-semibold transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
          <div className={`grid gap-3 ${isAdmin ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {isAdmin && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar atleta..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all"
                />
              </div>
            )}
            <select
              value={filtroEspecialista}
              onChange={e => setFiltroEspecialista(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all text-gray-700"
            >
              <option value="Todos">Todos los especialistas</option>
              {TIPOS_ESPECIALISTA.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all text-gray-700"
            >
              <option value="Todos">Todos los estados</option>
              {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Próximas citas */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-uady-gold rounded-full" />
          <h2 className="text-sm font-black text-uady-blue">
            Próximas Citas
            <span className="ml-2 bg-uady-blue/10 text-uady-blue text-xs font-bold px-2 py-0.5 rounded-full">
              {proximas.length}
            </span>
          </h2>
        </div>

        {proximas.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
            <p className="text-3xl mb-2">📅</p>
            <p className="text-gray-400 text-sm font-medium">
              {hasFilters ? 'Sin resultados para los filtros aplicados.' : 'No tienes citas programadas.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proximas.map(c => (
              <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    {isAdmin && (
                      <p className="font-black text-uady-blue text-sm">
                        {c.atleta.nombre} {c.atleta.apellidos}
                      </p>
                    )}
                    <p className="font-bold text-gray-700 text-sm">{c.tipoEspecialista}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{fmtFechaHora(c.fechaHora)}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                    Programada
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{c.motivo}</p>
                <EstadoActions
                  citaId={c.id}
                  estadoActual={c.estado}
                  isAdmin={isAdmin}
                  esDuena={c.atletaId === currentAtletaId}
                />
                <EliminarBtn citaId={c.id} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Historial */}
      {pasadas.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-gray-300 rounded-full" />
            <h2 className="text-sm font-black text-gray-500">
              Historial
              <span className="ml-2 bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full">
                {pasadas.length}
              </span>
            </h2>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                    {isAdmin && <th className="text-left px-5 py-3 font-semibold">Atleta</th>}
                    <th className="text-left px-5 py-3 font-semibold">Especialista</th>
                    <th className="text-left px-5 py-3 font-semibold">Fecha</th>
                    <th className="text-left px-5 py-3 font-semibold">Motivo</th>
                    <th className="text-left px-5 py-3 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pasadas.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      {isAdmin && (
                        <td className="px-5 py-3 font-medium text-uady-blue whitespace-nowrap">
                          {c.atleta.nombre} {c.atleta.apellidos}
                        </td>
                      )}
                      <td className="px-5 py-3 text-gray-700 whitespace-nowrap">{c.tipoEspecialista}</td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{fmtFechaHora(c.fechaHora)}</td>
                      <td className="px-5 py-3 text-gray-600 max-w-[200px] truncate">{c.motivo}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ESTADO_COLORS[c.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                          {c.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {citas.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">🏥</p>
          <p className="text-gray-500 font-bold text-sm">No hay citas registradas.</p>
          <p className="text-gray-400 text-xs mt-1">
            Programa una nueva cita con el botón de arriba.
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <NuevaCitaModal
          isAdmin={isAdmin}
          atletas={atletas}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
