'use server'

import { writeFile } from 'fs/promises'
import path from 'path'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export type AtletaFormState = { error: string | null }

export async function createAtleta(
  prevState: AtletaFormState,
  formData: FormData
): Promise<AtletaFormState> {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') {
    return { error: 'Sin permisos para esta acción.' }
  }

  const nombre = (formData.get('nombre') as string)?.trim()
  const apellidos = (formData.get('apellidos') as string)?.trim()
  const posicion = formData.get('posicion') as string
  const facultad = (formData.get('facultad') as string)?.trim()
  const directorFacultad = (formData.get('directorFacultad') as string)?.trim()
  const semestre = parseInt(formData.get('semestre') as string, 10)
  const telefonoPersonal = (formData.get('telefonoPersonal') as string)?.trim()
  const telefonoTutor = (formData.get('telefonoTutor') as string)?.trim()
  const nss = (formData.get('nss') as string)?.trim()
  const seguroPrivado = (formData.get('seguroPrivado') as string)?.trim() || null
  const codigoAcceso = (formData.get('codigoAcceso') as string)?.trim()
  const rol = (formData.get('rol') as string) || 'JUGADOR'
  const rama = (formData.get('rama') as string) || 'Femenil'
  const genero = (formData.get('genero') as string) || 'F'

  if (!nombre || !apellidos || !posicion || !facultad || !directorFacultad ||
      !codigoAcceso || !nss || !telefonoPersonal || !telefonoTutor) {
    return { error: 'Completa todos los campos obligatorios (*).' }
  }

  if (isNaN(semestre) || semestre < 1 || semestre > 12) {
    return { error: 'El semestre debe ser un número entre 1 y 12.' }
  }

  let fotoUrl: string | null = null
  const fotoFile = formData.get('foto') as File | null
  if (fotoFile && fotoFile.size > 0) {
    try {
      const bytes = await fotoFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const ext = (fotoFile.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z]/g, '')
      const safe = nombre.toLowerCase().replace(/[^a-z0-9]/g, '-')
      const filename = `${Date.now()}-${safe}.${ext}`
      await writeFile(path.join(process.cwd(), 'public', 'uploads', 'fotos', filename), buffer)
      fotoUrl = `/uploads/fotos/${filename}`
    } catch {
      // Non-fatal — continue without photo
    }
  }

  try {
    await prisma.atleta.create({
      data: {
        nombre, apellidos, genero, rama, posicion, facultad, directorFacultad,
        semestre, telefonoPersonal, telefonoTutor, nss,
        seguroPrivado, codigoAcceso, rol, fotoUrl,
      },
    })
  } catch (e) {
    const msg = (e as Error).message
    if (msg.includes('Unique') || msg.includes('unique') || msg.includes('UNIQUE')) {
      return { error: `El código "${codigoAcceso}" ya está en uso. Elige otro.` }
    }
    return { error: 'Error al guardar el registro. Intenta de nuevo.' }
  }

  revalidatePath('/atletas')
  redirect('/atletas')
}

export async function updateFotoAtleta(
  atletaId: string,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') {
    return { error: 'Sin permisos para esta acción.' }
  }

  const fotoFile = formData.get('foto') as File | null
  if (!fotoFile || fotoFile.size === 0) {
    return { error: 'Selecciona un archivo de foto.' }
  }

  try {
    const atleta = await prisma.atleta.findUnique({ where: { id: atletaId } })
    if (!atleta) {
      return { error: 'Atleta no encontrado.' }
    }

    const bytes = await fotoFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = (fotoFile.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z]/g, '')
    const safe = atleta.nombre.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const filename = `${Date.now()}-${safe}.${ext}`

    await writeFile(path.join(process.cwd(), 'public', 'uploads', 'fotos', filename), buffer)
    const fotoUrl = `/uploads/fotos/${filename}`

    await prisma.atleta.update({
      where: { id: atletaId },
      data: { fotoUrl },
    })

    revalidatePath(`/atletas/${atletaId}`)
    revalidatePath('/atletas')
    return { success: true }
  } catch (e) {
    console.error('Error uploading foto:', e)
    return { error: 'Error al guardar la foto. Intenta de nuevo.' }
  }
}
