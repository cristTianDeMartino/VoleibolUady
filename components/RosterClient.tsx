'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { POSICIONES, labelPosicion, type PosicionValue } from '@/lib/constants/posiciones'
import { ramaFromGenero } from '@/lib/constants/genero'

// Local interface — decoupled from Prisma client
interface AtletaRow {
  id: string
  nombre: string
  apellidos: string
  genero: string
  posicion: PosicionValue | null
  facultad: string
  semestre: number
  fotoUrl: string | null
  estado: 'ACTIVO' | 'EGRESADO'
  anioIngreso: number
  anioEgreso: number | null
}

const positionColors: Record<PosicionValue, string> = {
  LIBERO: 'bg-uady-gold text-uady-blue',
  ACOMODO: 'bg-uady-blue text-white',
  OPUESTO: 'bg-uady-gold text-uady-blue',
  CENTRAL: 'bg-emerald-600 text-white',
  BANDA: 'bg-purple-600 text-white',
}

type RamaFilter = 'Todas' | 'Femenil' | 'Varonil'
type SortOrder = 'asc' | 'desc'

interface Props {
  initialAtletas: AtletaRow[]
  isAdmin: boolean
}

export default function RosterClient({ initialAtletas, isAdmin }: Props) {
  const [search, setSearch] = useState('')
  const [ramaFilter, setRamaFilter] = useState<RamaFilter>('Todas')
  const [posFilter, setPosFilter] = useState<PosicionValue[]>([])
  const [sort, setSort] = useState<SortOrder>('asc')

  // All filtering + sorting derived from state — no DB round-trips
  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    return initialAtletas
      .filter((a) => {
        const matchSearch =
          !term ||
          a.nombre.toLowerCase().includes(term) ||
          a.apellidos.toLowerCase().includes(term) ||
          a.facultad.toLowerCase().includes(term) ||
          labelPosicion(a.posicion).toLowerCase().includes(term)
        const matchRama = ramaFilter === 'Todas' || ramaFromGenero(a.genero) === ramaFilter
        const matchPos = posFilter.length === 0 || (a.posicion != null && posFilter.includes(a.posicion))
        return matchSearch && matchRama && matchPos
      })
      .sort((a, b) => {
        const na = `${a.apellidos} ${a.nombre}`
        const nb = `${b.apellidos} ${b.nombre}`
        return sort === 'asc' ? na.localeCompare(nb, 'es') : nb.localeCompare(na, 'es')
      })
  }, [initialAtletas, search, ramaFilter, posFilter, sort])

  const togglePos = (pos: PosicionValue) =>
    setPosFilter((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    )

  const clearFilters = () => {
    setSearch('')
    setPosFilter([])
    setRamaFilter('Todas')
    setSort('asc')
  }

  const hasActiveFilters = search || posFilter.length > 0 || ramaFilter !== 'Todas'

  return (
    <div>
      {/* Search + sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, apellido, facultad o posición..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOrder)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:border-uady-blue transition-all"
        >
          <option value="asc">Apellido A → Z</option>
          <option value="desc">Apellido Z → A</option>
        </select>
      </div>

      {/* Rama toggle group */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-gray-400 font-semibold">Rama:</span>
        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
          {(['Todas', 'Femenil', 'Varonil'] as RamaFilter[]).map((r) => (
            <button
              key={r}
              onClick={() => setRamaFilter(r)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                ramaFilter === r
                  ? 'bg-uady-blue text-white shadow-sm'
                  : 'text-gray-500 hover:text-uady-blue'
              }`}
            >
              {r === 'Todas' ? '🏐 Todas' : r === 'Femenil' ? '♀ Femenil' : '♂ Varonil'}
            </button>
          ))}
        </div>
      </div>

      {/* Position chip filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <span className="text-xs text-gray-400 font-semibold">Posición:</span>
        {POSICIONES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => togglePos(value)}
            className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-all duration-200 ${
              posFilter.includes(value)
                ? `${positionColors[value]} border-transparent`
                : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
        {posFilter.length > 0 && (
          <button
            onClick={() => setPosFilter([])}
            className="text-xs text-gray-400 hover:text-uady-blue underline"
          >
            Limpiar posiciones
          </button>
        )}
      </div>

      {/* Results summary */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-400">
          <span className="font-bold text-uady-blue">{filtered.length}</span>{' '}
          atleta{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
          {hasActiveFilters && (
            <span className="text-gray-300"> (de {initialAtletas.length} totales)</span>
          )}
        </p>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-uady-gold font-semibold hover:underline"
          >
            ✕ Limpiar todos los filtros
          </button>
        )}
      </div>

      {/* Empty filter state */}
      {filtered.length === 0 && initialAtletas.length > 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-gray-500 font-bold text-sm">
            No se encontraron atletas con estos filtros.
          </p>
          <button
            onClick={clearFilters}
            className="mt-3 text-xs text-uady-blue font-semibold hover:underline"
          >
            Limpiar filtros y ver todas
          </button>
        </div>
      )}

      {/* Athlete grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((a) => (
            <Link
              key={a.id}
              href={`/atletas/${a.id}`}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group"
            >
              {/* Photo area */}
              <div className="bg-gradient-to-br from-uady-blue to-blue-800 h-32 flex items-center justify-center relative overflow-hidden">
                {a.fotoUrl ? (
                  <Image
                    src={a.fotoUrl}
                    alt={`${a.nombre} ${a.apellidos}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                ) : (
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-200">
                    🏐
                  </span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                {a.estado === 'EGRESADO' && <div className="absolute inset-0 bg-black/30" />}
                {/* Rama badge — derivada de género */}
                <div className="absolute top-2 left-2">
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                      a.genero === 'M'
                        ? 'bg-blue-900/80 text-blue-200'
                        : 'bg-pink-900/80 text-pink-200'
                    }`}
                  >
                    {ramaFromGenero(a.genero)}
                  </span>
                </div>
              </div>

              {/* Card body */}
              <div className="p-3">
                <p className="font-black text-uady-blue text-sm leading-tight">{a.nombre}</p>
                <p className="text-gray-500 text-xs truncate">{a.apellidos}</p>
                {a.estado === 'EGRESADO' && (
                  <p className="text-uady-gold text-[10px] font-bold tracking-widest mt-0.5">
                    {a.anioIngreso} · {a.anioEgreso}
                  </p>
                )}
                <div className="mt-2">
                  <span
                    className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${
                      a.posicion ? positionColors[a.posicion] : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {labelPosicion(a.posicion)}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-50">
                  <p className="text-xs text-gray-400 truncate">
                    📚 {a.facultad.replace('Facultad de ', '')}
                  </p>
                  <p className="text-xs text-gray-400">Sem. {a.semestre}</p>
                </div>
                <p className="text-xs text-uady-gold font-semibold mt-2 group-hover:text-uady-blue transition-colors">
                  Ver detalles →
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Position legend */}
      <div className="mt-8 bg-white rounded-xl border border-gray-100 p-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Posiciones</p>
        <div className="flex flex-wrap gap-2">
          {POSICIONES.map(({ value, label }) => (
            <span key={value} className={`text-xs font-bold px-2.5 py-1 rounded-full ${positionColors[value]}`}>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
