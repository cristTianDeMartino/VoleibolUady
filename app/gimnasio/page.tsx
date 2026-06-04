import type { Metadata } from 'next'
import { getSession } from '@/lib/auth'
import { obtenerSesionesMes, obtenerVideosAgrupados } from '@/actions/gimnasio'
import GimnasioClient from '@/components/GimnasioClient'

export const metadata: Metadata = { title: 'Gimnasio — Sistema de Voleibol' }

export default async function GimnasioPage() {
  const session = await getSession()
  const rol = session?.rol ?? 'JUGADOR'

  const now = new Date()
  const mesActual = now.getMonth() + 1
  const anioActual = now.getFullYear()

  const [sesionesIniciales, videosAgrupados] = await Promise.all([
    obtenerSesionesMes(mesActual, anioActual),
    obtenerVideosAgrupados(),
  ])

  return (
    <GimnasioClient
      rol={rol}
      sesionesIniciales={sesionesIniciales}
      videosAgrupados={videosAgrupados}
      mesInicial={mesActual}
      anioInicial={anioActual}
    />
  )
}
