import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import RegistrarLesionForm from '@/components/RegistrarLesionForm'
import LesionesSeguimiento from '@/components/LesionesSeguimiento'

export const metadata = { title: 'Lesiones — Sistema de Voleibol' }

export default async function LesionesPage() {
  const session = await getSession()

  // Sin sesión: el módulo es privado (contiene información médica)
  if (!session) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">🔒</p>
        <h1 className="text-xl font-black text-primary-blue mb-2">Módulo Privado</h1>
        <p className="text-gray-500 text-sm mb-6">
          El seguimiento de lesiones contiene información médica. Inicia sesión para continuar.
        </p>
        <Link
          href="/login"
          className="inline-block bg-primary-blue text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:brightness-110 transition-all"
        >
          Iniciar Sesión
        </Link>
      </div>
    )
  }

  const isAdmin = session.rol === 'ADMIN'

  // ADMIN: lesiones de TODOS los atletas (incluye nombre del atleta).
  // JUGADOR: únicamente las suyas.
  const lesiones = await prisma.lesion.findMany({
    where: isAdmin ? {} : { atletaId: session.id },
    orderBy: { fechaConsulta: 'desc' },
    select: {
      id: true,
      fechaConsulta: true,
      diagnostico: true,
      tratamiento: true,
      estatus: true,
      fechaAlta: true,
      // El nombre del atleta solo se muestra en la UI del ADMIN; incluirlo
      // siempre mantiene los tipos limpios y es inocuo para el jugador.
      atleta: { select: { nombre: true, apellidos: true } },
    },
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-7 bg-accent-green rounded-full" />
          <h1 className="text-3xl font-black text-primary-blue">
            Prevención y Seguimiento de Lesiones
          </h1>
        </div>
        <p className="text-gray-500 text-sm ml-3">
          {isAdmin
            ? 'Panel de control: lesiones activas e historial de todas las selecciones.'
            : 'Reporta y da seguimiento a tus lesiones del programa.'}
        </p>
      </div>

      {/* Formulario de registro — SOLO para jugadores (el admin no reporta lesiones propias) */}
      {!isAdmin && <RegistrarLesionForm />}

      {/* Panel de seguimiento con tabs — para ambos roles */}
      <LesionesSeguimiento lesiones={lesiones} isAdmin={isAdmin} />
    </div>
  )
}
