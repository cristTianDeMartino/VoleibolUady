'use client'

import { useActionState, useEffect, useRef } from 'react'
import { createLesion } from '@/actions/lesiones'

// Fecha de hoy en formato YYYY-MM-DD para el valor por defecto del input date
const hoy = new Date().toISOString().slice(0, 10)

export default function RegistrarLesionForm() {
  const [state, formAction, isPending] = useActionState(createLesion, { error: null })
  const formRef = useRef<HTMLFormElement>(null)

  // Limpia el formulario tras un registro exitoso
  useEffect(() => {
    if (state.success) formRef.current?.reset()
  }, [state.success])

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
      <div className="bg-uady-gold px-5 py-3 flex items-center gap-2">
        <span>🩹</span>
        <h2 className="font-bold text-white text-sm">Reportar Nueva Lesión</h2>
      </div>

      <div className="p-5">
        {state.error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2">
            <span>⚠️</span> {state.error}
          </div>
        )}
        {state.success && !state.error && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2">
            <span>✅</span> Lesión registrada. Aparece en tus lesiones activas.
          </div>
        )}

        <form ref={formRef} action={formAction} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Fecha de Consulta <span className="text-uady-gold">*</span>
            </label>
            <input
              type="date"
              name="fechaConsulta"
              required
              defaultValue={hoy}
              max={hoy}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all text-gray-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Diagnóstico <span className="text-uady-gold">*</span>
            </label>
            <input
              type="text"
              name="diagnostico"
              required
              placeholder="Ej. Esguince de tobillo grado I"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Tratamiento a Seguir <span className="text-uady-gold">*</span>
            </label>
            <textarea
              name="tratamiento"
              required
              rows={3}
              placeholder="Describe el tratamiento, reposo o terapia indicada..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all resize-none"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="bg-uady-gold text-uady-blue font-bold px-6 py-2.5 rounded-lg text-sm hover:brightness-110 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Registrando...
                </>
              ) : (
                '+ Registrar Lesión'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
