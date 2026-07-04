'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export interface NotaProgramacionData {
  id: string
  contenido: string
  orden: number
}

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') throw new Error('FORBIDDEN')
}

export async function obtenerNotasProgramacion(): Promise<NotaProgramacionData[]> {
  return prisma.notaProgramacion.findMany({
    orderBy: { orden: 'asc' },
    select: { id: true, contenido: true, orden: true },
  })
}

export async function crearNota(contenido: string) {
  await requireAdmin()
  const texto = contenido.trim()
  if (!texto) throw new Error('El contenido no puede estar vacío.')

  const ultima = await prisma.notaProgramacion.findFirst({ orderBy: { orden: 'desc' } })
  await prisma.notaProgramacion.create({ data: { contenido: texto, orden: (ultima?.orden ?? 0) + 1 } })
  revalidatePath('/gimnasio')
}

export async function editarNota(id: string, contenido: string) {
  await requireAdmin()
  const texto = contenido.trim()
  if (!texto) throw new Error('El contenido no puede estar vacío.')

  await prisma.notaProgramacion.update({ where: { id }, data: { contenido: texto } })
  revalidatePath('/gimnasio')
}

export async function eliminarNota(id: string) {
  await requireAdmin()
  await prisma.notaProgramacion.delete({ where: { id } })

  // Cierra huecos en el orden de las notas restantes.
  const restantes = await prisma.notaProgramacion.findMany({ orderBy: { orden: 'asc' } })
  await prisma.$transaction(
    restantes.map((n, i) => prisma.notaProgramacion.update({ where: { id: n.id }, data: { orden: i + 1 } }))
  )
  revalidatePath('/gimnasio')
}

async function intercambiarConVecina(id: string, direccion: 'arriba' | 'abajo') {
  await requireAdmin()
  const notas = await prisma.notaProgramacion.findMany({ orderBy: { orden: 'asc' } })
  const idx = notas.findIndex((n) => n.id === id)
  if (idx === -1) return

  const idxVecina = direccion === 'arriba' ? idx - 1 : idx + 1
  if (idxVecina < 0 || idxVecina >= notas.length) return // ya está en el extremo

  const actual = notas[idx]
  const vecina = notas[idxVecina]
  await prisma.$transaction([
    prisma.notaProgramacion.update({ where: { id: actual.id }, data: { orden: vecina.orden } }),
    prisma.notaProgramacion.update({ where: { id: vecina.id }, data: { orden: actual.orden } }),
  ])
  revalidatePath('/gimnasio')
}

export async function subirNota(id: string) {
  await intercambiarConVecina(id, 'arriba')
}

export async function bajarNota(id: string) {
  await intercambiarConVecina(id, 'abajo')
}
