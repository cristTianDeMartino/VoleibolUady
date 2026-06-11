'use client'

import { useActionState, useEffect, useMemo, useRef, useState } from 'react'
import { registrarPartido } from '@/actions/partidos'

export interface PartidoRow {
  id: string
  rama: string
  torneo: string
  fecha: string | Date
  hora: string
  sede: string
  rival: string
  numeroSets: number
  resultadoSets: string
  resultadoFinal: string
}

type RamaFilter = 'Todas' | 'Femenil' | 'Varonil'

const hoy = new Date().toISOString().slice(0, 10)

const fmtFecha = (d: string | Date) =>
  new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })

function parseParciales(resultadoSets: string): string[] {
  return resultadoSets.split(',').map((s) => s.trim()).filter(Boolean)
}

const DEFAULT_NUM_SETS = 3
const mkScores = (n: number) => Array.from({ length: n }, () => ({ local: '', rival: '' }))

interface Props {
  partidos: PartidoRow[]
  isAdmin: boolean
}

export default function RecordTemporadaClient({ partidos, isAdmin }: Props) {
  // ── Filtros ──────────────────────────────────────────────────────────────────
  const [ramaFilter, setRamaFilter] = useState<RamaFilter>('Todas')
  const [torneoFilter, setTorneoFilter] = useState('Todos')

  // ── Modal / Formulario ───────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false)
  const [state, formAction, isPending] = useActionState(registrarPartido, { error: null })
  const formRef = useRef<HTMLFormElement>(null)

  // ── Sets dinámicos ───────────────────────────────────────────────────────────
  const [numSets, setNumSets] = useState(DEFAULT_NUM_SETS)
  const [setScores, setSetScores] = useState(mkScores(DEFAULT_NUM_SETS))

  function handleNumSetsChange(n: number) {
    setNumSets(n)
    setSetScores((prev) =>
      n > prev.length
        ? [...prev, ...mkScores(n - prev.length)]
        : prev.slice(0, n)
    )
  }

  function updateScore(idx: number, side: 'local' | 'rival', value: string) {
    setSetScores((prev) => prev.map((s, i) => (i === idx ? { ...s, [side]: value } : s)))
  }

  // String formateado que el Server Action leerá del FormData
  const resultadoSetsStr = setScores
    .map((s) => `${s.local || '0'}-${s.rival || '0'}`)
    .join(', ')

  useEffect(() => {
    if (state.success) {
      setShowForm(false)
      formRef.current?.reset()
      setNumSets(DEFAULT_NUM_SETS)
      setSetScores(mkScores(DEFAULT_NUM_SETS))
    }
  }, [state.success])

  // ── Listas derivadas ─────────────────────────────────────────────────────────
  const torneos = useMemo(
    () => [...new Set(partidos.map((p) => p.torneo))].sort(),
    [partidos]
  )

  const filtrados = useMemo(
    () =>
      partidos.filter((p) => {
        const matchRama = ramaFilter === 'Todas' || p.rama === ramaFilter
        const matchTorneo = torneoFilter === 'Todos' || p.torneo === torneoFilter
        return matchRama && matchTorneo
      }),
    [partidos, ramaFilter, torneoFilter]
  )

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Barra superior: filtros + botón admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Filtro Rama */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-semibold">Rama:</span>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {(['Todas', 'Femenil', 'Varonil'] as RamaFilter[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRamaFilter(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
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

          {/* Filtro Torneo */}
          {torneos.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-semibold">Torneo:</span>
              <select
                value={torneoFilter}
                onChange={(e) => setTorneoFilter(e.target.value)}
                className="bg-gray-100 border-none rounded-xl px-3 py-2 text-xs font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-uady-blue/30 transition-all cursor-pointer"
              >
                <option value="Todos">Todos los torneos</option>
                {torneos.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-uady-gold text-uady-blue px-5 py-2.5 rounded-lg text-sm font-bold hover:brightness-110 transition-all duration-200 shrink-0"
          >
            + Registrar Partido
          </button>
        )}
      </div>

      {/* Conteo */}
      <p className="text-xs text-gray-400 mb-4">
        <span className="font-bold text-uady-blue">{filtrados.length}</span>{' '}
        partido{filtrados.length !== 1 ? 's' : ''}
        {ramaFilter !== 'Todas' && (
          <span className="text-gray-300"> · {ramaFilter}</span>
        )}
        {torneoFilter !== 'Todos' && (
          <span className="text-gray-300"> · {torneoFilter}</span>
        )}
      </p>

      {/* Grid de tarjetas */}
      {filtrados.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-3">🏐</p>
          <p className="text-gray-500 font-bold text-sm">Sin partidos registrados.</p>
          <p className="text-gray-400 text-xs mt-1">
            {isAdmin
              ? 'Registra el primer partido de la temporada.'
              : 'Aún no hay partidos en el récord.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map((p) => {
            const ganado = p.resultadoFinal === 'Ganado'
            const parciales = parseParciales(p.resultadoSets)
            return (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
              >
                {/* Cabecera */}
                <div className="bg-uady-blue px-4 py-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {/* Torneo con más prominencia */}
                    <p className="text-uady-gold font-black text-sm leading-tight truncate">
                      {p.torneo}
                    </p>
                    <p className="text-blue-300 text-xs mt-0.5">
                      {fmtFecha(p.fecha)} · {p.hora}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-black px-3 py-1 rounded-full whitespace-nowrap shrink-0 ${
                      ganado ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                    }`}
                  >
                    {ganado ? '✓ Ganado' : '✕ Perdido'}
                  </span>
                </div>

                {/* Cuerpo: Club vs rival + sede */}
                <div className="p-4 flex-1">
                  <p className="text-center text-lg font-black text-uady-blue">
                    Club <span className="text-uady-gold">vs</span> {p.rival}
                  </p>
                  <p className="text-center text-xs text-gray-400 mt-1">📍 {p.sede}</p>
                </div>

                {/* Pie: parciales como píldoras + rama */}
                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/60">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-2">
                    Parciales ({p.numeroSets} sets)
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1">
                      {parciales.map((set, i) => (
                        <span
                          key={i}
                          className="bg-slate-100 text-uady-blue text-xs font-bold px-2 py-0.5 rounded-md"
                        >
                          {set}
                        </span>
                      ))}
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${
                        p.rama === 'Varonil'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-pink-100 text-pink-700'
                      }`}
                    >
                      {p.rama === 'Varonil' ? '♂' : '♀'} {p.rama}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Modal de registro ─────────────────────────────────────────────────── */}
      {isAdmin && showForm && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 flex items-start sm:items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="bg-uady-gold px-5 py-3 rounded-t-2xl flex items-center justify-between">
              <h2 className="font-bold text-uady-blue text-sm flex items-center gap-2">
                🏐 Registrar Partido
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-uady-blue/70 hover:text-uady-blue text-lg leading-none"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <div className="p-5">
              {state.error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2">
                  <span>⚠️</span> {state.error}
                </div>
              )}

              <form ref={formRef} action={formAction} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Input oculto que el Server Action leerá */}
                <input type="hidden" name="resultadoSets" value={resultadoSetsStr} />

                <Field label="Torneo / Liga" required span2>
                  <input
                    name="torneo"
                    required
                    placeholder="Ej. Universiada Nacional 2026"
                    className={inputCls}
                  />
                </Field>

                <Field label="Rama" required>
                  <select name="rama" required defaultValue="" className={inputCls}>
                    <option value="" disabled>Seleccionar...</option>
                    <option value="Femenil">♀ Femenil</option>
                    <option value="Varonil">♂ Varonil</option>
                  </select>
                </Field>

                <Field label="Resultado Final" required>
                  <select name="resultadoFinal" required defaultValue="" className={inputCls}>
                    <option value="" disabled>Seleccionar...</option>
                    <option value="Ganado">Ganado</option>
                    <option value="Perdido">Perdido</option>
                  </select>
                </Field>

                <Field label="Fecha" required>
                  <input
                    type="date"
                    name="fecha"
                    required
                    defaultValue={hoy}
                    max={hoy}
                    className={inputCls}
                  />
                </Field>

                <Field label="Hora" required>
                  <input
                    type="time"
                    name="hora"
                    required
                    defaultValue="18:00"
                    className={inputCls}
                  />
                </Field>

                <Field label="Rival" required>
                  <input name="rival" required placeholder="Ej. UNAM" className={inputCls} />
                </Field>

                <Field label="Sede" required span2>
                  <input
                    name="sede"
                    required
                    placeholder="Ej. Gimnasio Polifuncional"
                    className={inputCls}
                  />
                </Field>

                {/* N° de Sets — controla los inputs dinámicos */}
                <Field label="N° de Sets" required span2>
                  <select
                    name="numeroSets"
                    required
                    value={numSets}
                    onChange={(e) => handleNumSetsChange(Number(e.target.value))}
                    className={inputCls}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n} set{n !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </Field>

                {/* Inputs dinámicos por set */}
                <div className="sm:col-span-2">
                  <p className="text-xs font-bold text-gray-600 mb-2">
                    Parciales por Set <span className="text-uady-gold">*</span>
                  </p>
                  <div className="space-y-2">
                    {setScores.map((score, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 w-10 shrink-0">
                          Set {i + 1}
                        </span>
                        <div className="flex items-center gap-2 flex-1">
                          <div className="flex-1">
                            <label className="text-[10px] text-gray-400 font-medium block mb-0.5">Club</label>
                            <input
                              type="number"
                              min={0}
                              max={40}
                              value={score.local}
                              onChange={(e) => updateScore(i, 'local', e.target.value)}
                              placeholder="0"
                              className={`${inputCls} text-center font-bold`}
                            />
                          </div>
                          <span className="text-gray-400 font-black text-lg pt-4">—</span>
                          <div className="flex-1">
                            <label className="text-[10px] text-gray-400 font-medium block mb-0.5">Rival</label>
                            <input
                              type="number"
                              min={0}
                              max={40}
                              value={score.rival}
                              onChange={(e) => updateScore(i, 'rival', e.target.value)}
                              placeholder="0"
                              className={`${inputCls} text-center font-bold`}
                            />
                          </div>
                        </div>
                        {/* Preview del parcial */}
                        <span className="text-xs font-black text-uady-blue bg-slate-100 px-2.5 py-1 rounded-lg w-16 text-center shrink-0">
                          {score.local || '0'}–{score.rival || '0'}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Preview completo del string */}
                  <p className="mt-2 text-[11px] text-gray-400 bg-slate-50 rounded-lg px-3 py-1.5 font-mono">
                    → {resultadoSetsStr}
                  </p>
                </div>

                <div className="sm:col-span-2 flex justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="bg-uady-gold text-uady-blue font-bold px-8 py-2.5 rounded-lg text-sm hover:brightness-110 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isPending ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Guardando...
                      </>
                    ) : (
                      '+ Guardar Partido'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Utilidades de UI ──────────────────────────────────────────────────────────

const inputCls =
  'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all text-gray-700'

function Field({
  label,
  required,
  span2,
  children,
}: {
  label: string
  required?: boolean
  span2?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={span2 ? 'sm:col-span-2' : ''}>
      <label className="block text-xs font-bold text-gray-600 mb-1">
        {label} {required && <span className="text-uady-gold">*</span>}
      </label>
      {children}
    </div>
  )
}
