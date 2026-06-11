import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { obtenerMatrizAsistencia } from '@/actions/asistencia'
import AsistenciaClient from '@/components/AsistenciaClient'

export const metadata = { title: 'Asistencia — Sistema de Voleibol' }

function normalizarFecha(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export default async function AsistenciaPage() {
  const session = await getSession()

  if (!session) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">🔒</p>
        <h1 className="text-xl font-black text-uady-blue mb-2">Módulo Privado</h1>
        <p className="text-gray-500 text-sm mb-6">
          Inicia sesión para registrar o consultar la asistencia.
        </p>
        <Link
          href="/login"
          className="inline-block bg-uady-blue text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:brightness-110 transition-all"
        >
          Iniciar Sesión
        </Link>
      </div>
    )
  }

  const ahora = new Date()
  const mesActual = ahora.getMonth() + 1
  const anioActual = ahora.getFullYear()

  const isAdmin = session.rol === 'ADMIN'

  // Para el jugador: verificar si ya tiene asistencia hoy
  let yaTieneAsistenciaHoy = false
  if (!isAdmin) {
    const hoy = normalizarFecha(ahora)
    const registro = await prisma.asistencia.findUnique({
      where: { atletaId_fecha: { atletaId: session.id, fecha: hoy } },
      select: { id: true },
    })
    yaTieneAsistenciaHoy = registro !== null
  }

  // Para el admin: cargar la matriz completa del mes actual
  const { atletas, registros } = await obtenerMatrizAsistencia(mesActual, anioActual)

  return (
    <AsistenciaClient
      rol={session.rol}
      atletaId={session.id}
      nombre={session.nombre}
      yaTieneAsistenciaHoy={yaTieneAsistenciaHoy}
      atletas={atletas}
      registros={registros}
      mesActual={mesActual}
      anioActual={anioActual}
    />
  )
}
