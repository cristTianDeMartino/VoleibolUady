'use client'

import { useState, useTransition } from 'react'
import { darDeAltaLesion } from '@/actions/lesiones'

// Forma desacoplada del cliente Prisma. Las fechas viajan como Date
// a través del límite RSC, pero las normalizamos por seguridad.
export interface LesionRow {
  id: string
  fechaConsulta: string | Date
  diagnostico: string
  tratamiento: string
  estatus: string
  fechaAlta: string | Date | null
  atleta?: { nombre: string; apellidos: string } | null
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
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : '—'

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
        className="w-full bg-emerald-600 text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-emerald-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

export default function LesionesSeguimiento({ lesiones, isAdmin }: Props) {
  const [tab, setTab] = useState<'activas' | 'historial'>('activas')

  const activas = lesiones.filter((l) => l.estatus === 'Activo')
  const historial = lesiones.filter((l) => l.estatus === 'Alta')

  const nombreAtleta = (l: LesionRow) =>
    l.atleta ? `${l.atleta.nombre} ${l.atleta.apellidos}` : null

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        <button
          onClick={() => setTab('activas')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
            tab === 'activas' ? 'bg-primary-blue text-white shadow-sm' : 'text-gray-500 hover:text-primary-blue'
          }`}
        >
          🩹 Lesiones Activas
          <span className="ml-2 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">{activas.length}</span>
        </button>
        <button
          onClick={() => setTab('historial')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
            tab === 'historial' ? 'bg-primary-blue text-white shadow-sm' : 'text-gray-500 hover:text-primary-blue'
          }`}
        >
          📋 Historial
          <span className="ml-2 bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full text-xs">{historial.length}</span>
        </button>
      </div>

      {/* TAB: Lesiones Activas */}
      {tab === 'activas' && (
        <>
          {activas.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <p className="text-4xl mb-3">✅</p>
              <p className="text-gray-500 font-bold text-sm">No hay lesiones activas.</p>
              <p className="text-gray-400 text-xs mt-1">
                {isAdmin ? 'Ningún atleta tiene lesiones en curso.' : '¡Mantente así!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activas.map((l) => (
                <div
                  key={l.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      {isAdmin && nombreAtleta(l) && (
                        <p className="font-black text-primary-blue text-sm truncate">{nombreAtleta(l)}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        Consulta: {fmtFecha(l.fechaConsulta)}
                      </p>
                    </div>
                    <span className="bg-accent-green text-primary-blue text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
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
          )}
        </>
      )}

      {/* TAB: Historial */}
      {tab === 'historial' && (
        <>
          {historial.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-gray-500 font-bold text-sm">Sin lesiones en el historial.</p>
              <p className="text-gray-400 text-xs mt-1">Aquí aparecen las lesiones dadas de alta.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                      {isAdmin && <th className="text-left px-5 py-3 font-semibold">Atleta</th>}
                      <th className="text-left px-5 py-3 font-semibold">Fecha de Consulta</th>
                      <th className="text-left px-5 py-3 font-semibold">Diagnóstico</th>
                      <th className="text-left px-5 py-3 font-semibold">Fecha de Alta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {historial.map((l) => (
                      <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                        {isAdmin && (
                          <td className="px-5 py-3 font-medium text-primary-blue whitespace-nowrap">
                            {nombreAtleta(l) ?? '—'}
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
          )}
        </>
      )}
    </div>
  )
}
