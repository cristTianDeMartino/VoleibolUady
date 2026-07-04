'use client'

import { useState } from 'react'
import { toISODateLocal, parseFechaLocal } from '@/lib/utils/fecha'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

// Rango realista para atletas universitarios.
const ANIOS = Array.from({ length: 2010 - 1990 + 1 }, (_, i) => 2010 - i)

function diasEnMes(mes: number, anio: number): number {
  return new Date(anio, mes, 0).getDate()
}

const selectCls = 'flex-1 border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all text-gray-700'

export default function FechaNacimientoSelector({
  name, defaultValue,
}: { name: string; defaultValue?: string | null }) {
  const inicial = defaultValue ? parseFechaLocal(defaultValue) : null
  const [dia, setDia] = useState<number | ''>(inicial ? inicial.getDate() : '')
  const [mes, setMes] = useState<number | ''>(inicial ? inicial.getMonth() + 1 : '')
  const [anio, setAnio] = useState<number | ''>(inicial ? inicial.getFullYear() : '')

  const totalDias = diasEnMes(mes || 1, anio || 2000)
  const iso = dia && mes && anio ? toISODateLocal(new Date(anio, mes - 1, dia)) : ''

  function handleMes(nuevoMes: number | '') {
    setMes(nuevoMes)
    if (dia && nuevoMes && dia > diasEnMes(nuevoMes, anio || 2000)) setDia('')
  }
  function handleAnio(nuevoAnio: number | '') {
    setAnio(nuevoAnio)
    if (dia && mes && nuevoAnio && dia > diasEnMes(mes, nuevoAnio)) setDia('')
  }

  return (
    <div className="flex gap-2">
      <select
        value={dia}
        onChange={(e) => setDia(e.target.value ? Number(e.target.value) : '')}
        className={selectCls}
        aria-label="Día"
      >
        <option value="">Día</option>
        {Array.from({ length: totalDias }, (_, i) => i + 1).map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      <select
        value={mes}
        onChange={(e) => handleMes(e.target.value ? Number(e.target.value) : '')}
        className={selectCls}
        aria-label="Mes"
      >
        <option value="">Mes</option>
        {MESES.map((m, i) => (
          <option key={m} value={i + 1}>{m}</option>
        ))}
      </select>
      <select
        value={anio}
        onChange={(e) => handleAnio(e.target.value ? Number(e.target.value) : '')}
        className={selectCls}
        aria-label="Año"
      >
        <option value="">Año</option>
        {ANIOS.map((a) => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>
      <input type="hidden" name={name} value={iso} />
    </div>
  )
}
