'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'

export default function DeletedToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const deleted = searchParams.get('deleted')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!deleted) return
    setVisible(true)
    const hide = setTimeout(() => setVisible(false), 4000)
    const clean = setTimeout(() => router.replace('/atletas'), 4300)
    return () => {
      clearTimeout(hide)
      clearTimeout(clean)
    }
  }, [deleted, router])

  if (!deleted) return null

  return (
    <div
      className={`fixed top-4 right-4 z-50 bg-white border-l-4 border-green-500 shadow-lg rounded-lg px-5 py-4 flex items-center gap-3 transition-all duration-300 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
      }`}
    >
      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
      <p className="text-sm font-semibold text-gray-700">✓ {deleted} ha sido eliminado correctamente</p>
    </div>
  )
}
