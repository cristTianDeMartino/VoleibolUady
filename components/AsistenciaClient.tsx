'use client'

import { useState, useTransition, useMemo } from 'react'
import { CheckCircle2, Loader2, CalendarDays, ChevronLeft, ChevronRight, Check, Minus } from 'lucide-react'
import { registrarAsistenciaHoy } from '@/actions/asistencia'
import type { AtletaConAsistencia } from '@/actions/asistencia'
import { ramaFromGenero } from '@/lib/constants/genero'

// ─── Utilidades ───────────────────────────────────────────────────────────────

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function formatearFechaElegante(date: Date): string {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return `${dias[date.getDay()]} ${date.getDate()} de ${MESES[date.getMonth()]}`
}

function diasEnMes(mes: number, anio: number): number {
  return new Date(anio, mes, 0).getDate()
}

function isoFecha(anio: number, mes: number, dia: number): string {
  return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

// ─── Componente Jugador ───────────────────────────────────────────────────────

interface JugadorViewProps {
  nombre: string
  yaTieneAsistenciaHoy: boolean
}

function JugadorView({ nombre, yaTieneAsistenciaHoy }: JugadorViewProps) {
  const [registrada, setRegistrada] = useState(yaTieneAsistenciaHoy)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const hoy = new Date()

  function handleRegistrar() {
    setError(null)
    startTransition(async () => {
      const result = await registrarAsistenciaHoy()
      if (result.error) {
        setError(result.error)
      } else {
        setRegistrada(true)
      }
    })
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          {/* Header con color principal */}
          <div className="bg-uady-blue px-8 py-6 text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CalendarDays className="w-5 h-5 opacity-80" />
              <span className="text-sm font-medium opacity-80 uppercase tracking-wider">
                Control de Asistencia
              </span>
            </div>
            <h1 className="text-2xl font-black leading-tight">
              ¡Hola, {nombre.split(' ')[0]}!
            </h1>
          </div>

          {/* Cuerpo */}
          <div className="px-8 py-10 text-center">
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">
              Hoy es
            </p>
            <p className="text-uady-blue text-xl font-bold mb-10">
              {formatearFechaElegante(hoy)}
            </p>

            {/* Estado: ya registrada */}
            {registrada ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle2 className="w-9 h-9 text-green-500" />
                </div>
                <p className="text-green-600 font-bold text-lg">
                  Asistencia registrada correctamente
                </p>
                <p className="text-slate-400 text-sm">
                  Tu asistencia de hoy ya fue guardada.
                </p>
              </div>
            ) : (
              <>
                <button
                  onClick={handleRegistrar}
                  disabled={isPending}
                  className="w-full bg-uady-blue hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-md shadow-uady-blue/20"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Registrando…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Confirmar mi Asistencia de Hoy
                    </>
                  )}
                </button>
                {error && (
                  <p className="mt-4 text-red-500 text-sm">{error}</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Nota de pie */}
        <p className="text-center text-slate-400 text-xs mt-4">
          Solo puedes registrar una asistencia por día.
        </p>
      </div>
    </div>
  )
}

// ─── Componente Admin (Matriz) ────────────────────────────────────────────────

interface AdminViewProps {
  atletas: AtletaConAsistencia[]
  registros: Record<string, string[]>
  mesInicial: number
  anioInicial: number
}

export function AdminView({ atletas, registros, mesInicial, anioInicial }: AdminViewProps) {
  const [mes, setMes] = useState(mesInicial)
  const [anio, setAnio] = useState(anioInicial)

  const totalDias = useMemo(() => diasEnMes(mes, anio), [mes, anio])

  const dias = useMemo(
    () => Array.from({ length: totalDias }, (_, i) => i + 1),
    [totalDias]
  )

  const registrosSet = useMemo(() => {
    const set = new Set<string>()
    for (const [atletaId, fechas] of Object.entries(registros)) {
      for (const f of fechas) set.add(`${atletaId}_${f}`)
    }
    return set
  }, [registros])

  function tieneAsistencia(atletaId: string, dia: number): boolean {
    return registrosSet.has(`${atletaId}_${isoFecha(anio, mes, dia)}`)
  }

  function irMesAnterior() {
    if (mes === 1) { setMes(12); setAnio(a => a - 1) }
    else setMes(m => m - 1)
  }

  function irMesSiguiente() {
    if (mes === 12) { setMes(1); setAnio(a => a + 1) }
    else setMes(m => m + 1)
  }

  const asistenciasPorAtleta = useMemo(() => {
    const map: Record<string, number> = {}
    for (const a of atletas) {
      map[a.id] = (registros[a.id] ?? []).filter(f => f.startsWith(`${anio}-${String(mes).padStart(2, '0')}`)).length
    }
    return map
  }, [atletas, registros, mes, anio])

  return (
    <div className="max-w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-7 bg-uady-gold rounded-full" />
          <h1 className="text-3xl font-black text-uady-blue">Registro de Asistencia</h1>
        </div>
        <p className="text-slate-500 text-sm ml-3">Hoja de asistencia mensual del equipo.</p>
      </div>

      {/* Navegador de mes */}
      <div className="flex items-center justify-between mb-6 bg-white border border-slate-100 rounded-xl px-5 py-3 shadow-sm">
        <button
          onClick={irMesAnterior}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <p className="text-uady-blue font-black text-xl">{MESES[mes - 1]}</p>
          <p className="text-slate-400 text-sm">{anio}</p>
        </div>

        <button
          onClick={irMesSiguiente}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
        <table className="border-collapse text-sm min-w-max w-full">
          <thead>
            {/* Fila de días del mes */}
            <tr className="border-b border-slate-200">
              <th
                scope="col"
                className="sticky left-0 z-10 bg-uady-blue text-white text-left px-4 py-3 font-semibold min-w-[200px] rounded-tl-2xl"
              >
                Atleta
              </th>
              {dias.map(d => {
                const fecha = new Date(anio, mes - 1, d)
                const esDomingo = fecha.getDay() === 0
                return (
                  <th
                    key={d}
                    scope="col"
                    className={`text-center px-1 py-2 font-medium min-w-[36px] ${
                      esDomingo ? 'bg-slate-100 text-slate-400' : 'bg-uady-blue/5 text-slate-500'
                    }`}
                  >
                    <div className="text-[10px] leading-none">{DIAS_SEMANA[fecha.getDay()]}</div>
                    <div className="text-xs font-bold text-slate-700">{d}</div>
                  </th>
                )
              })}
              <th
                scope="col"
                className="text-center px-3 py-3 font-semibold bg-uady-blue text-white min-w-[60px] rounded-tr-2xl"
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {atletas.map((atleta, idx) => (
              <tr
                key={atleta.id}
                className={`border-b border-slate-100 hover:bg-slate-50/80 transition-colors ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                }`}
              >
                {/* Nombre del atleta */}
                <td className="sticky left-0 z-10 bg-inherit px-4 py-2.5 font-medium text-uady-blue whitespace-nowrap border-r border-slate-100">
                  <div className="leading-tight">
                    <span className="font-bold">{atleta.apellidos}</span>
                    <span className="text-slate-400 font-normal">, {atleta.nombre}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal mt-0.5">{ramaFromGenero(atleta.genero)}</div>
                </td>

                {/* Celdas por día */}
                {dias.map(d => {
                  const fecha = new Date(anio, mes - 1, d)
                  const esDomingo = fecha.getDay() === 0
                  const presente = tieneAsistencia(atleta.id, d)

                  return (
                    <td
                      key={d}
                      className={`text-center px-0.5 py-2 ${
                        esDomingo ? 'bg-slate-100/60' : ''
                      } ${presente ? 'bg-uady-blue/10' : ''}`}
                    >
                      {presente ? (
                        <Check className="w-3.5 h-3.5 text-green-600 mx-auto" strokeWidth={3} />
                      ) : (
                        <Minus className="w-3 h-3 text-slate-200 mx-auto" />
                      )}
                    </td>
                  )
                })}

                {/* Total */}
                <td className="text-center px-3 py-2 font-bold text-uady-blue border-l border-slate-100">
                  <span className="bg-uady-blue/10 text-uady-blue text-xs font-bold px-2 py-1 rounded-full">
                    {asistenciasPorAtleta[atleta.id] ?? 0}
                  </span>
                </td>
              </tr>
            ))}
            {atletas.length === 0 && (
              <tr>
                <td
                  colSpan={totalDias + 2}
                  className="text-center text-slate-400 py-10 text-sm"
                >
                  No hay atletas registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-6 mt-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-uady-blue/10 flex items-center justify-center">
            <Check className="w-3 h-3 text-green-600" strokeWidth={3} />
          </div>
          <span>Presente</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-white border border-slate-100 flex items-center justify-center">
            <Minus className="w-3 h-3 text-slate-200" />
          </div>
          <span>Sin registro</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-slate-100" />
          <span>Domingo</span>
        </div>
      </div>
    </div>
  )
}

// ─── Export principal ─────────────────────────────────────────────────────────

interface AsistenciaClientProps {
  rol: string
  nombre: string
  yaTieneAsistenciaHoy: boolean
  atletas: AtletaConAsistencia[]
  registros: Record<string, string[]>
  mesActual: number
  anioActual: number
}

export default function AsistenciaClient({
  rol,
  nombre,
  yaTieneAsistenciaHoy,
  atletas,
  registros,
  mesActual,
  anioActual,
}: AsistenciaClientProps) {
  if (rol === 'JUGADOR') {
    return (
      <JugadorView
        nombre={nombre}
        yaTieneAsistenciaHoy={yaTieneAsistenciaHoy}
      />
    )
  }

  return (
    <div className="max-w-full mx-auto px-4 py-10">
      <AdminView
        atletas={atletas}
        registros={registros}
        mesInicial={mesActual}
        anioInicial={anioActual}
      />
    </div>
  )
}
