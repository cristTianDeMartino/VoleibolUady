import { getSession } from '@/lib/auth'
import { obtenerPartidos } from '@/actions/partidos'
import RecordTemporadaClient from '@/components/RecordTemporadaClient'

export const metadata = { title: 'Récord de Temporada — UADY Voleibol' }

export default async function RecordTemporadaPage() {
  const [session, partidos] = await Promise.all([getSession(), obtenerPartidos()])
  const isAdmin = session?.rol === 'ADMIN'

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-7 bg-uady-gold rounded-full" />
          <h1 className="text-3xl font-black text-uady-blue">Récord de Temporada</h1>
        </div>
        <p className="text-gray-500 text-sm ml-3">
          Historial de partidos de las selecciones representativas · Temporada 2025–2026
        </p>
      </div>

      <RecordTemporadaClient partidos={partidos} isAdmin={isAdmin} />
    </div>
  )
}
