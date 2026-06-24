import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import type { Session } from '@/lib/auth'

// codigoAcceso nunca se expone fuera de la verificación de login.
const PUBLIC_SELECT = {
  id: true,
  nombre: true,
  apellidos: true,
  genero: true, // rama se deriva de aquí — ver lib/constants/genero.ts
  posicion: true,
  facultad: true,
  directorFacultad: true,
  semestre: true,
  telefonoPersonal: true,
  telefonoTutor: true,
  correo: true,
  rolTecnico: true,
  rol: true,
  estado: true,
  fotoUrl: true,
  anioIngreso: true,
  anioEgreso: true,
  numUniforme: true,
  tallaPlayera: true,
  tallaShort: true,
  tallaPants: true,
  tallaChamarra: true,
  createdAt: true,
} as const

export async function getAtletaPublico(atletaId: string) {
  const session = await getSession()
  if (!session) throw new Error('FORBIDDEN')

  return prisma.atleta.findUnique({ where: { id: atletaId }, select: PUBLIC_SELECT })
}

function puedeVerCompleto(session: Session | null, atletaId: string) {
  return !!session && (session.rol === 'ADMIN' || session.id === atletaId)
}

export async function getAtletaCompleto(atletaId: string, session: Session) {
  if (!puedeVerCompleto(session, atletaId)) throw new Error('FORBIDDEN')

  return prisma.atleta.findUnique({
    where: { id: atletaId },
    select: { ...PUBLIC_SELECT, privado: true },
  })
}

export async function updateAtletaPrivado(
  atletaId: string,
  data: { nss?: string | null; seguroAseguradora?: string | null; seguroPoliza?: string | null; seguroTitular?: string | null },
  session: Session,
) {
  if (!puedeVerCompleto(session, atletaId)) throw new Error('FORBIDDEN')

  return prisma.atletaPrivado.upsert({
    where: { atletaId },
    update: data,
    create: { atletaId, ...data },
  })
}
