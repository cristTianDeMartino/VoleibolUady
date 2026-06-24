'use client'

import { useState, useTransition, useMemo } from 'react'
import { Search, Filter } from 'lucide-react'
import { darDeAltaLesion } from '@/actions/lesiones'
import { POSICIONES, labelPosicion, type PosicionValue } from '@/lib/constants/posiciones'
import { ramaFromGenero } from '@/lib/constants/genero'

export interface LesionRow {
  id: string
  fechaConsulta: string | Date
  diagnostico: string
  tratamiento: string
  estatus: string
  fechaAlta: string | Date | null
  atleta?: {
    nombre: string
    apellidos: string
    posicion?: PosicionValue | null
    genero?: string | null
  } | null
}

interface Props {
  lesiones: LesionRow[]
  isAdmin: boolean
}

const fmtFecha = (d: string | Date | null) =>
  d
    ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

const fmtFechaHora = (d: string | Date | null) =>
  d
    ? new Date(d).toLocaleString('es-MX', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—'

// ─── DarDeAltaButton ──────────────────────────────────────────────────────────

function DarDeAltaButton({ lesionId }: { lesionId: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleAlta = () => {
    setError(null)
    startTransition(async () => {
      const res = await darDeAltaLesion(lesionId)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      {error && <p className="text-xs text-red-600 mb-2">⚠️ {error}</p>}
      <button
        onClick={handleAlta}
        disabled={isPending}
        className="w-full bg-emerald-600 text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Procesando...
          </>
        ) : (
          '✓ Dar de Alta'
        )}
      </button>
    </div>
  )
}

// ─── LesionesSeguimiento ──────────────────────────────────────────────────────

export default function LesionesSeguimiento({ lesiones, isAdmin }: Props) {
  const [tab, setTab]               = useState<'activas' | 'historial'>('activas')
  const [busqueda, setBusqueda]     = useState('')
  const [filtroRama, setFiltroRama] = useState('Todas')
  const [filtroPosicion, setFiltroPosicion] = useState<PosicionValue | 'Todas'>('Todas')

  const nombreAtleta = (l: LesionRow) =>
    l.atleta ? `${l.atleta.nombre} ${l.atleta.apellidos}` : null

  const applyFilters = (rows: LesionRow[]) => {
    if (!isAdmin) return rows
    return rows.filter(l => {
      const nombre = nombreAtleta(l)?.toLowerCase() ?? ''
      const rama = ramaFromGenero(l.atleta?.genero)
      const posicion = l.atleta?.posicion ?? null

      const matchBusqueda = !busqueda.trim() || nombre.includes(busqueda.trim().toLowerCase())
      const matchRama     = filtroRama === 'Todas' || rama === filtroRama
      const matchPosicion = filtroPosicion === 'Todas' || posicion === filtroPosicion

      return matchBusqueda && matchRama && matchPosicion
    })
  }

  const activas   = useMemo(() => applyFilters(lesiones.filter(l => l.estatus === 'Activo')),  [lesiones, busqueda, filtroRama, filtroPosicion])
  const historial = useMemo(() => applyFilters(lesiones.filter(l => l.estatus === 'Alta')),    [lesiones, busqueda, filtroRama, filtroPosicion])

  const hasFilters = busqueda.trim() || filtroRama !== 'Todas' || filtroPosicion !== 'Todas'

  return (
    <div className="space-y-5">

      {/* ── Barra de filtros (solo ADMIN) ── */}
      {isAdmin && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-3.5 h-3.5 text-uady-blue/50" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filtros</span>
            {hasFilters && (
              <button
                onClick={() => { setBusqueda(''); setFiltroRama('Todas'); setFiltroPosicion('Todas') }}
                className="ml-auto text-[10px] text-uady-blue/50 hover:text-uady-blue font-semibold transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all"
              />
            </div>
            {/* Rama */}
            <select
              value={filtroRama}
              onChange={e => setFiltroRama(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all text-gray-700"
            >
              <option value="Todas">Todas las ramas</option>
              <option value="Femenil">Femenil</option>
              <option value="Varonil">Varonil</option>
            </select>
            {/* Posición */}
            <select
              value={filtroPosicion}
              onChange={e => setFiltroPosicion(e.target.value as PosicionValue | 'Todas')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all text-gray-700"
            >
              <option value="Todas">Todas las posiciones</option>
              {POSICIONES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab('activas')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
            tab === 'activas' ? 'bg-uady-blue text-white shadow-sm' : 'text-gray-500 hover:text-uady-blue'
          }`}
        >
          🩹 Lesiones Activas
          <span className="ml-2 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">{activas.length}</span>
        </button>
        <button
          onClick={() => setTab('historial')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
            tab === 'historial' ? 'bg-uady-blue text-white shadow-sm' : 'text-gray-500 hover:text-uady-blue'
          }`}
        >
          📋 Historial
          <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${tab === 'historial' ? 'bg-white/20' : 'bg-gray-200 text-gray-600'}`}>
            {historial.length}
          </span>
        </button>
      </div>

      {/* ── Tab: Lesiones Activas ── */}
      {tab === 'activas' && (
        activas.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-gray-500 font-bold text-sm">
              {hasFilters ? 'Sin resultados para los filtros aplicados.' : 'No hay lesiones activas.'}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {isAdmin ? 'Ningún atleta coincide con los filtros.' : '¡Mantente así!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activas.map(l => (
              <div key={l.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    {isAdmin && nombreAtleta(l) && (
                      <p className="font-black text-uady-blue text-sm truncate">{nombreAtleta(l)}</p>
                    )}
                    {isAdmin && l.atleta?.posicion && (
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {labelPosicion(l.atleta.posicion)} · {ramaFromGenero(l.atleta.genero)}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">Consulta: {fmtFecha(l.fechaConsulta)}</p>
                  </div>
                  <span className="bg-uady-gold text-uady-blue text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    Activo
                  </span>
                </div>
                <div className="space-y-3 text-sm flex-1">
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Diagnóstico</p>
                    <p className="text-gray-700 mt-0.5">{l.diagnostico}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Tratamiento</p>
                    <p className="text-gray-600 mt-0.5">{l.tratamiento}</p>
                  </div>
                </div>
                <DarDeAltaButton lesionId={l.id} />
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Tab: Historial ── */}
      {tab === 'historial' && (
        historial.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-500 font-bold text-sm">
              {hasFilters ? 'Sin resultados para los filtros aplicados.' : 'Sin lesiones en el historial.'}
            </p>
            <p className="text-gray-400 text-xs mt-1">Aquí aparecen las lesiones dadas de alta.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                    {isAdmin && <th className="text-left px-5 py-3 font-semibold">Atleta</th>}
                    {isAdmin && <th className="text-left px-5 py-3 font-semibold">Posición / Rama</th>}
                    <th className="text-left px-5 py-3 font-semibold">Fecha de Consulta</th>
                    <th className="text-left px-5 py-3 font-semibold">Diagnóstico</th>
                    <th className="text-left px-5 py-3 font-semibold">Fecha de Alta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {historial.map(l => (
                    <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                      {isAdmin && (
                        <td className="px-5 py-3 font-medium text-uady-blue whitespace-nowrap">
                          {nombreAtleta(l) ?? '—'}
                        </td>
                      )}
                      {isAdmin && (
                        <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {labelPosicion(l.atleta?.posicion)} · {ramaFromGenero(l.atleta?.genero)}
                        </td>
                      )}
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                        {fmtFecha(l.fechaConsulta)}
                      </td>
                      <td className="px-5 py-3 text-gray-700">{l.diagnostico}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          {fmtFechaHora(l.fechaAlta)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  )
}
