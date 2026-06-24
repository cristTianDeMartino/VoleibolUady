'use client'

import { useActionState, useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { GraduationCap } from 'lucide-react'
import { login } from '@/actions/auth'
import { crearAdminMaestro, sembrarDatosDemo, sembrarPlanificacionVoleibol, seedVideosFuncionales } from '@/actions/seed'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, { error: null })
  const [seedMsg, setSeedMsg] = useState<string | null>(null)
  const [seeding, startSeed] = useTransition()
  const [demoMsg, setDemoMsg] = useState<string | null>(null)
  const [demoing, startDemo] = useTransition()
  const [planMsg, setPlanMsg] = useState<string | null>(null)
  const [planning, startPlan] = useTransition()
  const [videosMsg, setVideosMsg] = useState<string | null>(null)
  const [seedingVideos, startVideos] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.error === 'EGRESADO') formRef.current?.reset()
  }, [state])

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-uady-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏐</span>
          </div>
          <h1 className="text-2xl font-black text-uady-blue">Sistema de Voleibol</h1>
          <p className="text-gray-400 text-sm mt-1">Plan Rector · Selecciones</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-7">
          <h2 className="font-black text-uady-blue text-lg mb-1">Iniciar Sesión</h2>
          <p className="text-gray-400 text-sm mb-6">
            Ingresa el código de acceso que te proporcionó tu entrenador.
          </p>

          {state.error && state.error !== 'EGRESADO' && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-3 py-2.5 rounded-lg flex items-center gap-2">
              <span>⚠️</span> {state.error}
            </div>
          )}

          <form ref={formRef} action={formAction} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                Código de Acceso
              </label>
              <input
                type="text"
                name="codigoAcceso"
                autoComplete="off"
                autoFocus
                placeholder="Ej. ANA001"
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-uady-blue focus:ring-2 focus:ring-uady-blue/10 transition-all font-mono tracking-widest"
              />
              <p className="text-xs text-gray-400 mt-1.5">
                Las mayúsculas importan. Ej: <code className="bg-gray-50 px-1 rounded">ADMIN001</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-uady-blue text-white font-bold py-3 rounded-lg text-sm hover:bg-uady-blue transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Verificando...
                </>
              ) : (
                'Entrar al Sistema'
              )}
            </button>
          </form>

          {state.error === 'EGRESADO' && (
            <div className="mt-4 bg-[#1B2A4A] border-l-4 border-[#F5A623] rounded-lg px-4 py-3 flex gap-3">
              <GraduationCap className="w-5 h-5 text-uady-gold flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-uady-gold font-bold text-sm mb-1">Eres egresado de la UADY</p>
                <p className="text-white/80 text-xs leading-relaxed">
                  Tu ciclo como atleta activo ha concluido. Tu historial y logros quedan registrados
                  en el sistema. Para cualquier consulta, contacta al cuerpo técnico.
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          ¿No tienes código?{' '}
          <Link href="/" className="text-uady-blue font-semibold hover:underline">
            Contacta a tu entrenador
          </Link>
        </p>

        {/* Dev seed — remove in production */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-center text-gray-600 space-y-2">
            <p className="font-bold text-amber-700">🛠 Modo Desarrollo</p>

            <button
              type="button"
              disabled={seeding}
              onClick={() =>
                startSeed(async () => {
                  const res = await crearAdminMaestro()
                  setSeedMsg(res.ok ? `✅ Admin listo → ${res.codigo}` : `❌ ${res.error}`)
                })
              }
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-1.5 rounded-lg disabled:opacity-60 transition-colors"
            >
              {seeding ? 'Creando…' : 'Crear Admin Maestro (ADMIN001)'}
            </button>
            {seedMsg && <p className="font-mono font-bold text-green-700">{seedMsg}</p>}

            <button
              type="button"
              disabled={demoing}
              onClick={() =>
                startDemo(async () => {
                  const res = await sembrarDatosDemo()
                  setDemoMsg(res.ok ? `✅ ${res.resumen}` : `❌ ${res.error}`)
                })
              }
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-lg disabled:opacity-60 transition-colors"
            >
              {demoing ? 'Sembrando datos…' : 'Sembrar jugadores + lesiones + citas'}
            </button>
            {demoMsg && <p className="font-mono font-bold text-green-700">{demoMsg}</p>}

            <button
              type="button"
              disabled={planning}
              onClick={() =>
                startPlan(async () => {
                  const res = await sembrarPlanificacionVoleibol()
                  setPlanMsg(res.ok ? `✅ ${res.resumen}` : `❌ ${res.error}`)
                })
              }
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg disabled:opacity-60 transition-colors"
            >
              {planning ? 'Sembrando planificación…' : 'Sembrar staff + gimnasio + macrociclo + partidos'}
            </button>
            {planMsg && <p className="font-mono font-bold text-green-700">{planMsg}</p>}

            <button
              type="button"
              disabled={seedingVideos}
              onClick={() =>
                startVideos(async () => {
                  const res = await seedVideosFuncionales()
                  setVideosMsg(res.ok ? `✅ ${res.resumen}` : `❌ ${res.error}`)
                })
              }
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold px-3 py-1.5 rounded-lg disabled:opacity-60 transition-colors"
            >
              {seedingVideos ? 'Sembrando videos…' : 'Sembrar videos Funcionales (YouTube)'}
            </button>
            {videosMsg && <p className="font-mono font-bold text-green-700">{videosMsg}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
