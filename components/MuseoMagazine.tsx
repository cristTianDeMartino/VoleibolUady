'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export type LogroConImagenes = {
  id: string
  titulo: string
  descripcion: string
  anio: number
  rama: string
  categoria: string
  imagenes: { id: string; url: string; orden: number }[]
}

const BADGE: Record<string, { emoji: string; cls: string }> = {
  'Campeon': { emoji: '🏆', cls: 'bg-uady-gold text-white' },
  '1er Lugar': { emoji: '🥇', cls: 'bg-uady-gold text-white' },
  '2do Lugar': { emoji: '🥈', cls: 'bg-gray-400 text-white' },
  '3er Lugar': { emoji: '🥉', cls: 'bg-orange-500 text-white' },
  'Participacion': { emoji: '🎖️', cls: 'bg-blue-600 text-white' },
}

const badge = (cat: string) => BADGE[cat] ?? BADGE['Participacion']

function Badge({ categoria, grande = false }: { categoria: string; grande?: boolean }) {
  const b = badge(categoria)
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-bold ${b.cls} ${grande ? 'px-4 py-1.5 text-sm' : 'px-2.5 py-0.5 text-[11px]'}`}>
      {b.emoji} {categoria}
    </span>
  )
}

export default function MuseoMagazine({ logros }: { logros: LogroConImagenes[] }) {
  const [abierto, setAbierto] = useState<LogroConImagenes | null>(null)
  const [imgIdx, setImgIdx] = useState(0)
  const [lightbox, setLightbox] = useState<string | null>(null)

  function abrir(logro: LogroConImagenes) {
    setAbierto(logro)
    setImgIdx(0)
  }

  return (
    <>
      {/* Grid tipo revista: 1º ancho completo, 2º-3º medianos, resto pequeños */}
      <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
        {logros.map((logro, i) => {
          const portada = logro.imagenes[0]?.url
          const featured = i === 0
          const span = featured ? 'sm:col-span-6' : i <= 2 ? 'sm:col-span-3' : 'sm:col-span-2'

          if (featured) {
            return (
              <button
                key={logro.id}
                onClick={() => abrir(logro)}
                className={`${span} relative rounded-2xl overflow-hidden text-left h-64 sm:h-[500px] group`}
              >
                {portada ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={portada} alt={logro.titulo} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] to-[#1B2A4A] flex items-center justify-center text-8xl opacity-90">
                    {badge(logro.categoria).emoji}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute bottom-0 p-5 sm:p-8">
                  <Badge categoria={logro.categoria} grande />
                  <h2 className="mt-3 text-2xl sm:text-4xl font-black text-white">{logro.titulo}</h2>
                  <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-2xl line-clamp-2">{logro.descripcion}</p>
                  <p className="mt-2 text-xs font-semibold text-uady-gold uppercase tracking-wide">{logro.anio} · {logro.rama}</p>
                </div>
              </button>
            )
          }

          return (
            <button
              key={logro.id}
              onClick={() => abrir(logro)}
              className={`${span} relative bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-left flex flex-col`}
            >
              <div className="relative h-40 shrink-0">
                {portada ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={portada} alt={logro.titulo} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0A1628] to-[#1B2A4A] flex items-center justify-center text-5xl">
                    {badge(logro.categoria).emoji}
                  </div>
                )}
                <div className="absolute top-2 right-2"><Badge categoria={logro.categoria} /></div>
              </div>
              <div className="p-4">
                <p className="text-[11px] font-bold text-uady-gold uppercase tracking-wide">{logro.anio} · {logro.rama}</p>
                <h3 className="mt-1 font-bold text-gray-900 leading-snug">{logro.titulo}</h3>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {logro.descripcion} <span className="text-uady-gold font-semibold">Leer más</span>
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Drawer lateral */}
      {abierto && (
        <div className="fixed inset-0 z-40" onClick={() => setAbierto(null)}>
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-white shadow-2xl transform transition-transform duration-300 overflow-y-auto ${
          abierto ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {abierto && (
          <div className="p-6">
            <button onClick={() => setAbierto(null)} className="mb-4 p-2 rounded-full hover:bg-gray-100" aria-label="Cerrar">
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {abierto.imagenes.length > 0 && (
              <div className="relative rounded-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={abierto.imagenes[imgIdx].url}
                  alt={abierto.titulo}
                  className="w-full h-64 object-cover cursor-zoom-in"
                  onClick={() => setLightbox(abierto.imagenes[imgIdx].url)}
                />
                {abierto.imagenes.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIdx((imgIdx - 1 + abierto.imagenes.length) % abierto.imagenes.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70"
                      aria-label="Anterior"
                    ><ChevronLeft className="w-5 h-5" /></button>
                    <button
                      onClick={() => setImgIdx((imgIdx + 1) % abierto.imagenes.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70"
                      aria-label="Siguiente"
                    ><ChevronRight className="w-5 h-5" /></button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {abierto.imagenes.map((img, i) => (
                        <span key={img.id} className={`w-2 h-2 rounded-full ${i === imgIdx ? 'bg-white' : 'bg-white/40'}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="mt-5 flex items-center gap-2 flex-wrap">
              <Badge categoria={abierto.categoria} />
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">{abierto.rama}</span>
              <span className="text-2xl font-black text-[#1B2A4A] ml-auto">{abierto.anio}</span>
            </div>
            <h2 className="mt-3 text-2xl font-black text-gray-900">{abierto.titulo}</h2>
            <p className="mt-3 text-gray-600 whitespace-pre-line">{abierto.descripcion}</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setLightbox(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </>
  )
}
