import type { Metadata } from 'next'
import { getSession } from '@/lib/auth'
import { obtenerMatriz, obtenerAccesorios, obtenerVideosAgrupados, obtenerEtapas, obtenerCatalogoEjercicios, obtenerNombresEjercicios } from '@/actions/gimnasio'
import { obtenerNotasProgramacion } from '@/app/actions/notas-programacion.actions'
import GimnasioClient from '@/components/GimnasioClient'

export const metadata: Metadata = { title: 'Gimnasio — Sistema de Voleibol' }

export default async function GimnasioPage() {
  const session = await getSession()
  const rol = session?.rol ?? 'JUGADOR'

  const [ejercicios, accesorios, videosAgrupados, etapas, catalogo, nombresEjercicios, notas] = await Promise.all([
    obtenerMatriz(),
    obtenerAccesorios(),
    obtenerVideosAgrupados(),
    obtenerEtapas(),
    obtenerCatalogoEjercicios(),
    obtenerNombresEjercicios(),
    obtenerNotasProgramacion(),
  ])

  return (
    <GimnasioClient
      rol={rol}
      ejercicios={ejercicios}
      accesorios={accesorios}
      videosAgrupados={videosAgrupados}
      etapas={etapas}
      catalogo={catalogo}
      nombresEjercicios={nombresEjercicios}
      notas={notas}
    />
  )
}
