import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import PerfilClient from '@/components/PerfilClient'

export const metadata = { title: 'Mi Perfil — Sistema de Voleibol' }

export default async function PerfilPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const atleta = await prisma.atleta.findUnique({ where: { id: session.id } })
  if (!atleta) redirect('/login')

  return (
    <PerfilClient
      atleta={{
        id: atleta.id,
        nombre: atleta.nombre,
        apellidos: atleta.apellidos,
        rol: atleta.rol,
        posicion: atleta.posicion,
        rama: atleta.rama,
        facultad: atleta.facultad,
        semestre: atleta.semestre,
        directorFacultad: atleta.directorFacultad,
        telefonoPersonal: atleta.telefonoPersonal,
        telefonoTutor: atleta.telefonoTutor,
        nss: atleta.nss,
        seguroPrivado: atleta.seguroPrivado,
        email: atleta.email ?? null,
        fotoUrl: atleta.fotoUrl,
        rolTecnico: atleta.rolTecnico ?? null,
      }}
    />
  )
}
