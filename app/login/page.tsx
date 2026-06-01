'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login } from '@/actions/auth'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, { error: null })

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-uady-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏐</span>
          </div>
          <h1 className="text-2xl font-black text-uady-blue">Voleibol UADY</h1>
          <p className="text-gray-400 text-sm mt-1">Plan Rector · Selecciones</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-7">
          <h2 className="font-black text-uady-blue text-lg mb-1">Iniciar Sesión</h2>
          <p className="text-gray-400 text-sm mb-6">
            Ingresa el código de acceso que te proporcionó tu entrenador.
          </p>

          {state.error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-3 py-2.5 rounded-lg flex items-center gap-2">
              <span>⚠️</span> {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-4">
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
                Las mayúsculas importan. Ej: <code className="bg-gray-50 px-1 rounded">VOLEIUADY</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-uady-blue text-white font-bold py-3 rounded-lg text-sm hover:bg-blue-900 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          ¿No tienes código?{' '}
          <Link href="/" className="text-uady-blue font-semibold hover:underline">
            Contacta a tu entrenador
          </Link>
        </p>

        {/* Dev hint — remove in production */}
        <div className="mt-4 bg-uady-yellow-light/40 border border-uady-gold/30 rounded-xl p-3 text-xs text-center text-gray-600">
          <p className="font-bold text-amber-700 mb-1">Códigos de prueba:</p>
          <code className="bg-white px-1.5 py-0.5 rounded font-mono">VOLEIUADY</code>
          {' '}(Admin) &nbsp;
          <code className="bg-white px-1.5 py-0.5 rounded font-mono">ANA001</code>
          {' '}(Atleta)
        </div>
      </div>
    </div>
  )
}
