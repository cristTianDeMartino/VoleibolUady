import type { Metadata } from 'next'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  obtenerEventosMes,
  obtenerEventosCatalogo,
  obtenerProximosEventos,
  obtenerGrupos,
} from '@/actions/cronograma'
import CronogramaClient from '@/components/CronogramaClient'

export const metadata: Metadata = { title: 'Cronograma — Sistema de Voleibol' }

export default async function CronogramaPage() {
  const session = await getSession()
  const rol = session?.rol ?? 'JUGADOR'

  const now = new Date()
  const mesActual = now.getMonth() + 1
  const anioActual = now.getFullYear()
  const hoyLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [eventosIniciales, eventosPanel, proximosIniciales, gruposDisponibles, totalProximos] =
    await Promise.all([
      obtenerEventosMes(mesActual, anioActual),
      obtenerEventosCatalogo(),
      obtenerProximosEventos(0, 3),
      obtenerGrupos(),
      prisma.evento.count({ where: { fechaFin: { gte: hoyLocal } } }),
    ])

  return (
    <CronogramaClient
      rol={rol}
      eventosIniciales={eventosIniciales}
      eventosPanel={eventosPanel}
      proximosIniciales={proximosIniciales}
      totalProximos={totalProximos}
      gruposDisponibles={gruposDisponibles}
      mesInicial={mesActual}
      anioInicial={anioActual}
    />
  )
}
