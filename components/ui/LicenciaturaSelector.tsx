'use client'

import { useState, useRef, useEffect } from 'react'
import { LICENCIATURAS_UADY } from '@/lib/constants/licenciaturas'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function LicenciaturaSelector({ value, onChange, placeholder }: Props) {
  const [busqueda, setBusqueda] = useState(value)
  const [abierto, setAbierto] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => setBusqueda(value), [value])

  useEffect(() => {
    function handleClickFuera(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setAbierto(false)
    }
    document.addEventListener('mousedown', handleClickFuera)
    return () => document.removeEventListener('mousedown', handleClickFuera)
  }, [])

  const q = busqueda.trim().toLowerCase()
  const resultados = q
    ? LICENCIATURAS_UADY.filter(
        (r) => r.licenciatura.toLowerCase().includes(q) || r.facultad.toLowerCase().includes(q)
      )
    : LICENCIATURAS_UADY

  const facultadesConResultados = [...new Set(resultados.map((r) => r.facultad))]

  function seleccionar(licenciatura: string) {
    setBusqueda(licenciatura)
    onChange(licenciatura)
    setAbierto(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={busqueda}
        onChange={(e) => { setBusqueda(e.target.value); onChange(e.target.value) }}
        onFocus={() => setAbierto(true)}
        placeholder={placeholder ?? 'Buscar licenciatura...'}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all text-gray-700"
      />
      {abierto && resultados.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {facultadesConResultados.map((facultad) => (
            <div key={facultad}>
              <div className="px-3 py-1 text-xs font-semibold text-gray-400 bg-gray-50 sticky top-0">
                {facultad}
              </div>
              {resultados.filter((r) => r.facultad === facultad).map((r) => (
                <button
                  key={r.licenciatura}
                  type="button"
                  onClick={() => seleccionar(r.licenciatura)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-[#F2F5F9] hover:text-[#1B2A4A] transition-colors"
                >
                  {r.licenciatura}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
