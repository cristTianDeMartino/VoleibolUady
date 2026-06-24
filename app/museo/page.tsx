import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Museo — Sistema de Voleibol' }

export default function MuseoPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-uady-blue">
        Museo <span className="text-uady-gold">/ Logros</span>
      </h1>
      <p className="mt-2 text-uady-blue/70">
        Historia, trofeos y reconocimientos del equipo de voleibol UADY.
      </p>
    </main>
  )
}
