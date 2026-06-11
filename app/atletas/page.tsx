import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import RosterClient from '@/components/RosterClient'

export const metadata = { title: 'Roster de Atletas — Sistema de Voleibol' }

export default async function AtletasPage() {
  const [session, atletas] = await Promise.all([
    getSession(),
    prisma.atleta.findMany({
      where: { rol: 'JUGADOR' },
      orderBy: { apellidos: 'asc' },
      select: {
        id: true,
        nombre: true,
        apellidos: true,
        genero: true,
        rama: true,
        posicion: true,
        facultad: true,
        semestre: true,
        fotoUrl: true,
      },
    }),
  ])

  const isAdmin = session?.rol === 'ADMIN'

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-7 bg-uady-gold rounded-full" />
            <h1 className="text-3xl font-black text-uady-blue">Roster de Atletas</h1>
          </div>
          <p className="text-gray-500 text-sm ml-3">
            {atletas.length} atleta{atletas.length !== 1 ? 's' : ''} registrada
            {atletas.length !== 1 ? 's' : ''} · Temporada 2025–2026
          </p>
        </div>

        <div className="flex gap-2 items-center">
          {isAdmin && (
            <Link
              href="/atletas/agregar"
              className="bg-uady-gold text-uady-blue px-5 py-2 rounded-lg text-sm font-bold hover:brightness-110 transition-all duration-200 flex items-center gap-1.5"
            >
              + Agregar Atleta
            </Link>
          )}
          {!session && (
            <Link
              href="/login"
              className="border border-uady-blue text-uady-blue px-4 py-2 rounded-lg text-sm font-semibold hover:bg-uady-blue hover:text-white transition-all"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>

      {/* Empty DB state */}
      {atletas.length === 0 && (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-4">🏐</p>
          <h3 className="text-lg font-bold text-uady-blue mb-2">Sin atletas registradas</h3>
          <p className="text-gray-400 text-sm mb-6">Aún no hay atletas en la base de datos.</p>
          {isAdmin && (
            <Link
              href="/atletas/agregar"
              className="inline-block bg-uady-gold text-uady-blue px-6 py-2.5 rounded-lg font-bold text-sm hover:brightness-110 transition-all"
            >
              + Registrar primera atleta
            </Link>
          )}
        </div>
      )}

      {/* Client component handles all search + filtering + rendering */}
      {atletas.length > 0 && (
        <RosterClient initialAtletas={atletas} isAdmin={isAdmin} />
      )}
    </div>
  )
}
