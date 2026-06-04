import type { Metadata } from 'next'
import Image from 'next/image'
import { BarChart3, Construction } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Análisis Estadístico — Sistema de Voleibol',
}

export default function EstadisticasPage() {
  return (
    <div className="min-h-[80vh] bg-gray-50 flex flex-col items-center justify-center px-4 py-16">

      {/* Encabezado central */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="flex items-center justify-center gap-3 mb-6">
          <BarChart3 className="w-14 h-14 text-accent-green" strokeWidth={1.5} />
          <Construction className="w-10 h-10 text-accent-green/60" strokeWidth={1.5} />
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-primary-blue mb-4 leading-tight">
          Módulo de Análisis Estadístico
        </h1>

        <div className="w-16 h-1 bg-accent-green rounded-full mx-auto mb-5" />

        <p className="text-gray-500 text-base md:text-lg leading-relaxed">
          Estamos trabajando en la integración de métricas avanzadas y zonas de rendimiento.
        </p>
        <p className="text-gray-400 text-sm mt-2 font-medium tracking-wide uppercase">
          Página en Construcción
        </p>
      </div>

      {/* Adelanto visual — imágenes QUICKMARK */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg shadow-primary-blue/10 border border-gray-100 bg-white">
          <Image
            src="/images/QUICKMARK1.png"
            alt="Vista previa del análisis estadístico — pantalla 1"
            fill
            className="object-contain p-2"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg shadow-primary-blue/10 border border-gray-100 bg-white">
          <Image
            src="/images/QUICKMARK2.png"
            alt="Vista previa del análisis estadístico — pantalla 2"
            fill
            className="object-contain p-2"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>

      {/* Badge inferior */}
      <div className="mt-12 inline-flex items-center gap-2 bg-accent-green/10 border border-accent-green/30 rounded-full px-5 py-2.5">
        <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
        <span className="text-amber-700 text-sm font-semibold">
          Próximamente disponible para el equipo
        </span>
      </div>
    </div>
  )
}
