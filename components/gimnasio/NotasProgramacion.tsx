'use client'

import { useState, useTransition } from 'react'
import { Info, Pencil, Trash2, ChevronUp, ChevronDown, Plus, X, Loader2, Check } from 'lucide-react'
import {
  crearNota, editarNota, eliminarNota, subirNota, bajarNota,
  type NotaProgramacionData,
} from '@/app/actions/notas-programacion.actions'

const btnIcon = 'p-1 rounded-md text-slate-400 hover:text-uady-blue hover:bg-uady-blue/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400'
const textareaCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-uady-blue/30 focus:border-uady-blue transition-all resize-y'

export default function NotasProgramacion({
  notas, isAdmin, onRefresh,
}: { notas: NotaProgramacionData[]; isAdmin: boolean; onRefresh: () => Promise<void> }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [addText, setAddText] = useState('')
  const [notaAEliminar, setNotaAEliminar] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function startEdit(nota: NotaProgramacionData) {
    setError(null)
    setShowAddForm(false)
    setEditingId(nota.id)
    setEditText(nota.contenido)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditText('')
  }

  function handleGuardarEdicion() {
    if (!editingId || !editText.trim()) return
    startTransition(async () => {
      try {
        await editarNota(editingId, editText.trim())
        cancelEdit()
        await onRefresh()
      } catch (e) {
        setError((e as Error).message || 'Error al guardar la nota.')
      }
    })
  }

  function handleConfirmarEliminar() {
    if (!notaAEliminar) return
    setError(null)
    startTransition(async () => {
      try {
        await eliminarNota(notaAEliminar)
        setNotaAEliminar(null)
        await onRefresh()
      } catch (e) {
        setError((e as Error).message || 'Error al eliminar la nota.')
      }
    })
  }

  function handleMover(id: string, direccion: 'subir' | 'bajar') {
    setError(null)
    startTransition(async () => {
      try {
        await (direccion === 'subir' ? subirNota(id) : bajarNota(id))
        await onRefresh()
      } catch (e) {
        setError((e as Error).message || 'Error al reordenar.')
      }
    })
  }

  function handleAgregar() {
    if (!addText.trim()) return
    startTransition(async () => {
      try {
        await crearNota(addText.trim())
        setAddText('')
        setShowAddForm(false)
        await onRefresh()
      } catch (e) {
        setError((e as Error).message || 'Error al agregar la nota.')
      }
    })
  }

  return (
    <div className="bg-uady-blue/5 border border-uady-blue/15 rounded-2xl p-6 h-full">
      <div className="flex items-center gap-2 mb-5">
        <Info className="w-5 h-5 text-uady-blue flex-shrink-0" />
        <h3 className="font-black text-uady-blue text-base">Notas de Programación</h3>
      </div>

      <ol className="space-y-4">
        {notas.map((nota, idx) => (
          <li key={nota.id} className="group/nota flex gap-3">
            <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-uady-gold text-uady-blue text-[11px] font-bold flex items-center justify-center leading-none">
              {nota.orden}
            </span>

            {editingId === nota.id ? (
              <div className="flex-1 space-y-2">
                <textarea
                  autoFocus
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={3}
                  className={textareaCls}
                />
                <div className="flex gap-2">
                  <button type="button" onClick={handleGuardarEdicion} disabled={pending || !editText.trim()}
                    className="flex items-center gap-1.5 bg-uady-blue text-white text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-60">
                    {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Guardar
                  </button>
                  <button type="button" onClick={cancelEdit} disabled={pending}
                    className="flex items-center gap-1.5 border border-gray-200 text-gray-500 text-xs font-medium px-3 py-1.5 rounded-lg">
                    <X className="w-3.5 h-3.5" /> Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-slate-700 text-sm leading-relaxed flex-1">{nota.contenido}</p>
                {isAdmin && (
                  <div className="opacity-0 group-hover/nota:opacity-100 transition-all flex items-start gap-0.5 flex-shrink-0">
                    <button type="button" onClick={() => handleMover(nota.id, 'subir')} disabled={pending || idx === 0} className={btnIcon} aria-label="Subir nota">
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => handleMover(nota.id, 'bajar')} disabled={pending || idx === notas.length - 1} className={btnIcon} aria-label="Bajar nota">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => startEdit(nota)} disabled={pending} className={btnIcon} aria-label="Editar nota">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => setNotaAEliminar(nota.id)} disabled={pending}
                      className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-30" aria-label="Eliminar nota">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </li>
        ))}
      </ol>

      {error && <p className="text-red-500 text-xs mt-3">{error}</p>}

      {isAdmin && (
        <div className="mt-5">
          {showAddForm ? (
            <div className="space-y-2">
              <textarea
                autoFocus
                value={addText}
                onChange={(e) => setAddText(e.target.value)}
                placeholder="Escribe la nueva nota…"
                rows={3}
                className={textareaCls}
              />
              <div className="flex gap-2">
                <button type="button" onClick={handleAgregar} disabled={pending || !addText.trim()}
                  className="flex items-center gap-1.5 bg-uady-blue text-white text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-60">
                  {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Guardar
                </button>
                <button type="button" onClick={() => { setShowAddForm(false); setAddText('') }} disabled={pending}
                  className="flex items-center gap-1.5 border border-gray-200 text-gray-500 text-xs font-medium px-3 py-1.5 rounded-lg">
                  <X className="w-3.5 h-3.5" /> Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => { setShowAddForm(true); setEditingId(null); setError(null) }}
              className="flex items-center gap-1.5 border border-uady-blue/40 text-uady-blue px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-uady-blue hover:text-white transition-all">
              <Plus className="w-3.5 h-3.5" /> Agregar nota
            </button>
          )}
        </div>
      )}

      {notaAEliminar && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
          onClick={() => !pending && setNotaAEliminar(null)}
        >
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="text-red-600" size={20} />
              </div>
              <h2 className="font-semibold text-[#1B2A4A] text-base">¿Eliminar esta nota?</h2>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              Esta acción no se puede deshacer. La nota será eliminada permanentemente.
            </p>
            {error && <p className="text-red-600 text-xs mb-3">{error}</p>}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={pending}
                onClick={() => setNotaAEliminar(null)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium transition-colors disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={handleConfirmarEliminar}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium transition-colors disabled:opacity-60"
              >
                {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {pending ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
