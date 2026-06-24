'use client'

import { useEffect, useState, useTransition } from 'react'
import { AlertTriangle, CheckCircle2, Loader2, RotateCcw, UserMinus } from 'lucide-react'
import { egresarAtleta, reactivarAtleta } from '@/app/actions/atleta.actions'

function Toast({ mensaje }: { mensaje: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 4000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className={`fixed top-4 right-4 z-50 bg-white border-l-4 border-green-500 shadow-lg rounded-lg px-5 py-4 flex items-center gap-3 transition-all duration-300 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
      }`}
    >
      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
      <p className="text-sm font-semibold text-gray-700">{mensaje}</p>
    </div>
  )
}

export function BotonEgresarAtleta({ atletaId, nombre }: { atletaId: string; nombre: string }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const anioActual = new Date().getFullYear()

  function handleConfirmar() {
    setError(null)
    startTransition(async () => {
      try {
        await egresarAtleta(atletaId)
        setOpen(false)
        setToast(`${nombre} ha sido registrado como egresado correctamente`)
      } catch {
        setError('No se pudo egresar al atleta. Intenta de nuevo.')
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm font-semibold text-uady-blue border border-uady-blue/30 px-4 py-2 rounded-lg hover:bg-uady-blue/10 transition-all"
      >
        <UserMinus className="w-4 h-4" /> Asignar como Egresado
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
          onClick={() => !pending && setOpen(false)}
        >
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-uady-blue/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-uady-blue" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              ¿Marcar a {nombre} como egresado?
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Se registrará {anioActual} como año de egreso. El atleta dejará de aparecer en el roster activo y la lista de asistencia. Esta acción se puede revertir.
            </p>
            {error && <p className="text-red-600 text-xs mb-3">{error}</p>}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                disabled={pending}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-gray-500 border border-gray-200 px-4 py-2 rounded-lg disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={handleConfirmar}
                className="flex items-center gap-1.5 bg-uady-blue text-white text-sm font-bold px-4 py-2 rounded-lg disabled:opacity-60"
              >
                {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {pending ? 'Egresando...' : 'Sí, egresar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast mensaje={toast} />}
    </>
  )
}

export function BotonReactivarAtleta({ atletaId, nombre, anioEgreso }: { atletaId: string; nombre: string; anioEgreso: number | null }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleConfirmar() {
    setError(null)
    startTransition(async () => {
      try {
        await reactivarAtleta(atletaId)
        setOpen(false)
        setToast(`${nombre} ha sido reactivado correctamente`)
      } catch {
        setError('No se pudo reactivar al atleta. Intenta de nuevo.')
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm font-semibold text-green-600 border border-green-200 px-4 py-2 rounded-lg hover:bg-green-50 transition-all"
      >
        <RotateCcw className="w-4 h-4" /> Reactivar atleta
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
          onClick={() => !pending && setOpen(false)}
        >
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              ¿Reactivar a {nombre}?
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              El atleta volverá a aparecer en el roster activo. El año de egreso registrado ({anioEgreso}) será eliminado.
            </p>
            {error && <p className="text-red-600 text-xs mb-3">{error}</p>}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                disabled={pending}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-gray-500 border border-gray-200 px-4 py-2 rounded-lg disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={handleConfirmar}
                className="flex items-center gap-1.5 bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-lg disabled:opacity-60"
              >
                {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {pending ? 'Reactivando...' : 'Sí, reactivar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast mensaje={toast} />}
    </>
  )
}
