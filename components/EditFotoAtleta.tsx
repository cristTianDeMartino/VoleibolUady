'use client'

import { useRef, useState, useTransition, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { updateFotoAtleta } from '@/actions/atletas'

interface Props {
  atletaId: string
  fotoActualUrl: string | null
  isAdmin: boolean
}

export default function EditFotoAtleta({ atletaId, fotoActualUrl, isAdmin }: Props) {
  const [preview, setPreview] = useState<string | null>(fotoActualUrl)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Sync preview when the server re-renders with the newly persisted URL
  useEffect(() => {
    setPreview(fotoActualUrl)
  }, [fotoActualUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setErrorMsg(null)

    // Show blob URL immediately — feels instant for the user
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    const formData = new FormData()
    formData.append('foto', file)

    startTransition(async () => {
      const result = await updateFotoAtleta(atletaId, formData)
      URL.revokeObjectURL(objectUrl)

      if (result.error) {
        setErrorMsg(result.error)
        setPreview(fotoActualUrl) // revert on error
      } else {
        router.refresh() // let server re-render supply the persisted URL
      }
    })

    // Allow selecting the same file again if needed
    e.target.value = ''
  }

  return (
    <div className="relative w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-uady-gold bg-blue-800 group/photo">

      {/* Photo or emoji placeholder */}
      {preview ? (
        <Image
          src={preview}
          alt="Foto de atleta"
          fill
          className="object-cover"
          sizes="112px"
          unoptimized={preview.startsWith('blob:')}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-5xl select-none">
          🏐
        </div>
      )}

      {/* Loading overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1.5">
          <svg className="w-7 h-7 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span className="text-white text-xs font-semibold">Subiendo...</span>
        </div>
      )}

      {/* Error inline toast */}
      {errorMsg && !isPending && (
        <div
          className="absolute inset-0 bg-red-900/80 flex items-center justify-center p-2 cursor-pointer"
          onClick={() => setErrorMsg(null)}
        >
          <p className="text-white text-xs text-center leading-tight">{errorMsg}</p>
        </div>
      )}

      {/* Pencil button — admin only, visible on hover/focus */}
      {isAdmin && !isPending && !errorMsg && (
        <>
          <button
            type="button"
            title="Cambiar foto"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-uady-gold text-uady-blue flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer opacity-0 group-hover/photo:opacity-100 focus:opacity-100"
          >
            <Pencil className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  )
}
