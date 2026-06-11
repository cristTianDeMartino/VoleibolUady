'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Atleta } from '@prisma/client'

interface AtletasFiltersProps {
  atletas: Atleta[]
  positionColors: Record<string, string>
}

export function AtletasFilters({ atletas, positionColors }: AtletasFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'nombre' | 'posicion'>('nombre')

  // Separar por género
  const atletasFemeniles = atletas.filter(a => a.genero === 'F')
  const atletasVaroniles = atletas.filter(a => a.genero === 'M')

  // Filtrar y ordenar
  const filteredAtletas = (atletasArray: Atleta[]) => {
    let filtered = atletasArray

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(
        a =>
          a.nombre.toLowerCase().includes(search) ||
          a.apellidos.toLowerCase().includes(search)
      )
    }

    // Ordenar
    if (sortBy === 'nombre') {
      filtered.sort((a, b) => {
        const nameA = `${a.nombre} ${a.apellidos}`.toLowerCase()
        const nameB = `${b.nombre} ${b.apellidos}`.toLowerCase()
        return nameA.localeCompare(nameB)
      })
    } else if (sortBy === 'posicion') {
      filtered.sort((a, b) => a.posicion.localeCompare(b.posicion))
    }

    return filtered
  }

  const femenilFiltrado = filteredAtletas(atletasFemeniles)
  const varonilFiltrado = filteredAtletas(atletasVaroniles)

  const atletaCard = (a: Atleta) => (
    <Link
      key={a.id}
      href={`/atletas/${a.id}`}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group"
    >
      {/* Photo */}
      <div className="bg-gradient-to-br from-uady-blue to-blue-800 h-32 flex items-center justify-center relative overflow-hidden">
        {a.fotoUrl ? (
          <Image
            src={a.fotoUrl}
            alt={`${a.nombre} ${a.apellidos}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <span className="text-5xl group-hover:scale-110 transition-transform duration-200">🏐</span>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-black text-uady-blue text-sm leading-tight">{a.nombre}</p>
        <p className="text-gray-500 text-xs truncate">{a.apellidos}</p>

        <div className="mt-2">
          <span
            className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${
              positionColors[a.posicion] ?? 'bg-gray-100 text-gray-600'
            }`}
          >
            {a.posicion}
          </span>
        </div>

        <div className="mt-2 pt-2 border-t border-gray-50">
          <p className="text-xs text-gray-400 truncate">📚 {a.facultad.replace('Facultad de ', '')}</p>
          <p className="text-xs text-gray-400">Sem. {a.semestre}</p>
        </div>

        <p className="text-xs text-uady-gold font-semibold mt-2 group-hover:text-uady-blue transition-colors">
          Ver detalles →
        </p>
      </div>
    </Link>
  )

  return (
    <div className="mb-10">
      {/* Buscador y Filtros */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          {/* Buscador */}
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              🔍 Buscar por nombre
            </label>
            <input
              type="text"
              placeholder="Ingresa nombre o apellido..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-uady-blue focus:ring-2 focus:ring-uady-blue/10 outline-none transition-all"
            />
          </div>

          {/* Ordenar por */}
          <div className="w-full md:w-auto">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              📊 Ordenar por
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'nombre' | 'posicion')}
              className="w-full md:w-48 px-4 py-2.5 rounded-lg border border-gray-200 focus:border-uady-blue focus:ring-2 focus:ring-uady-blue/10 outline-none transition-all cursor-pointer bg-white"
            >
              <option value="nombre">Nombre (A-Z)</option>
              <option value="posicion">Posición</option>
            </select>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mt-4 text-xs text-gray-500">
          {searchTerm ? (
            <>
              <span className="font-semibold">{femenilFiltrado.length + varonilFiltrado.length}</span> resultado
              {femenilFiltrado.length + varonilFiltrado.length !== 1 ? 's' : ''}
            </>
          ) : (
            <>
              Mostrando <span className="font-semibold">todos los atletas</span>
            </>
          )}
        </div>
      </div>

      {/* Varonil */}
      {(atletasVaroniles.length > 0 || searchTerm) && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-uady-gold rounded-full" />
            <h2 className="text-2xl font-black text-uady-blue">
              Varonil ({varonilFiltrado.length})
            </h2>
          </div>

          {varonilFiltrado.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {varonilFiltrado.map(atletaCard)}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500">No hay atletas varoniles que coincidan con la búsqueda</p>
            </div>
          )}
        </div>
      )}

      {/* Femenino */}
      {(atletasFemeniles.length > 0 || searchTerm) && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-uady-gold rounded-full" />
            <h2 className="text-2xl font-black text-uady-blue">
              Femenino ({femenilFiltrado.length})
            </h2>
          </div>

          {femenilFiltrado.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {femenilFiltrado.map(atletaCard)}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500">No hay atletas femeniles que coincidan con la búsqueda</p>
            </div>
          )}
        </div>
      )}

      {/* Sin resultados */}
      {femenilFiltrado.length === 0 && varonilFiltrado.length === 0 && searchTerm && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-5xl mb-4">🔎</p>
          <h3 className="text-lg font-bold text-uady-blue mb-2">No se encontraron atletas</h3>
          <p className="text-gray-400 text-sm">
            Intenta con otro nombre o apellido
          </p>
        </div>
      )}
    </div>
  )
}
