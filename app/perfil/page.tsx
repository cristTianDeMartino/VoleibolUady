import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import PerfilClient from '@/components/PerfilClient'
import { toISODateLocal } from '@/lib/utils/fecha'

export const metadata = { title: 'Mi Perfil — Sistema de Voleibol' }

export default async function PerfilPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const atleta = await prisma.atleta.findUnique({
    where: { id: session.id },
    select: {
      id: true, nombre: true, apellidos: true, matricula: true, rol: true, posicion: true,
      genero: true, facultad: true, semestre: true, directorFacultad: true,
      licenciatura: true, fechaNacimiento: true,
      telefonoPersonal: true, telefonoTutor: true, correo: true, fotoUrl: true,
      rolTecnico: true, numUniforme: true, anioIngreso: true, anioEgreso: true,
      tallaPlayera: true, tallaShort: true, tallaPants: true, tallaChamarra: true,
      privado: { select: { nss: true, curp: true, seguroAseguradora: true, seguroPoliza: true, seguroTitular: true } },
    },
  })
  if (!atleta) redirect('/login')

  return (
    <PerfilClient
      atleta={{
        id: atleta.id,
        nombre: atleta.nombre,
        apellidos: atleta.apellidos,
        matricula: atleta.matricula,
        rol: atleta.rol,
        posicion: atleta.posicion,
        genero: atleta.genero,
        facultad: atleta.facultad,
        semestre: atleta.semestre,
        directorFacultad: atleta.directorFacultad,
        licenciatura: atleta.licenciatura,
        fechaNacimiento: atleta.fechaNacimiento ? toISODateLocal(atleta.fechaNacimiento) : null,
        telefonoPersonal: atleta.telefonoPersonal,
        telefonoTutor: atleta.telefonoTutor,
        correo: atleta.correo ?? null,
        fotoUrl: atleta.fotoUrl,
        rolTecnico: atleta.rolTecnico ?? null,
        numUniforme: atleta.numUniforme,
        anioIngreso: atleta.anioIngreso,
        anioEgreso: atleta.anioEgreso,
        tallaPlayera: atleta.tallaPlayera,
        tallaShort: atleta.tallaShort,
        tallaPants: atleta.tallaPants,
        tallaChamarra: atleta.tallaChamarra,
        privado: atleta.privado
          ? {
              nss: atleta.privado.nss,
              curp: atleta.privado.curp,
              seguroAseguradora: atleta.privado.seguroAseguradora,
              seguroPoliza: atleta.privado.seguroPoliza,
              seguroTitular: atleta.privado.seguroTitular,
            }
          : null,
      }}
    />
  )
}
