'use client'

import { useState, useTransition } from 'react'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { eliminarAtletaPorCompleto } from '@/app/actions/atleta.actions'

export default function BotonEliminarAtleta({ atletaId, nombre }: { atletaId: string; nombre: string }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleEliminar() {
    setError(null)
    startTransition(async () => {
      try {
        await eliminarAtletaPorCompleto(atletaId)
      } catch {
        setError('No se pudo eliminar. Intenta de nuevo.')
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm font-semibold text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-all"
      >
        <Trash2 className="w-4 h-4" /> Eliminar atleta por completo
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
          onClick={() => !pending && setOpen(false)}
        >
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              ¿Eliminar permanentemente a {nombre}?
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Se borrarán también sus asistencias, lesiones y citas. Esta acción no se puede deshacer.
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
                onClick={handleEliminar}
                className="flex items-center gap-1.5 bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-lg disabled:opacity-60"
              >
                {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {pending ? 'Eliminando...' : 'Sí, eliminar definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
