import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import CitasClient from '@/components/CitasClient'

export const metadata = { title: 'Citas Médicas — Sistema de Voleibol' }

export default async function CitasMedicasPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const isAdmin = session.rol === 'ADMIN'

  const [citas, atletas] = await Promise.all([
    prisma.citaMedica.findMany({
      where: isAdmin ? {} : { atletaId: session.id },
      orderBy: { fechaHora: 'asc' },
      include: {
        atleta: { select: { id: true, nombre: true, apellidos: true, posicion: true, rama: true } },
      },
    }),
    isAdmin
      ? prisma.atleta.findMany({
          where: { rol: 'JUGADOR' },
          orderBy: [{ nombre: 'asc' }, { apellidos: 'asc' }],
          select: { id: true, nombre: true, apellidos: true },
        })
      : Promise.resolve([]),
  ])

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-7 bg-accent-green rounded-full" />
          <h1 className="text-3xl font-black text-primary-blue">Citas Médicas</h1>
        </div>
        <p className="text-gray-500 text-sm ml-3">
          {isAdmin
            ? 'Gestión de citas médicas de todos los atletas.'
            : 'Consulta y programa tus citas médicas con los especialistas del programa.'}
        </p>
      </div>

      <CitasClient
        citas={citas}
        atletas={atletas}
        isAdmin={isAdmin}
        currentAtletaId={session.id}
      />
    </div>
  )
}
