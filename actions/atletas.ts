'use server'

import { writeFile } from 'fs/promises'
import path from 'path'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { actualizarDatosGenerales } from '@/app/actions/atleta.actions'
import { POSICIONES, type PosicionValue } from '@/lib/constants/posiciones'
import { ramaFromGenero } from '@/lib/constants/genero'
import { generarClaveAcceso } from '@/lib/utils/generarClave'
import { validarMatricula, validarDirector, validarNSS, validarTelefono, validarAnioIngreso } from '@/lib/validation'

const isPosicionValida = (v: string): v is PosicionValue =>
  POSICIONES.some((p) => p.value === v)

export type AtletaFormState = {
  error: string | null
  field?: string
  success?: boolean
  nombreGuardado?: string
  claveGenerada?: string
}

async function generarClaveUnica(genero: 'F' | 'M'): Promise<string> {
  for (let intento = 0; intento < 10; intento++) {
    const clave = generarClaveAcceso(genero)
    const existe = await prisma.claveAtleta.findUnique({ where: { clavePlana: clave } })
    if (!existe) return clave
  }
  throw new Error('No se pudo generar una clave de acceso única. Intenta de nuevo.')
}

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
  const matricula = (formData.get('matricula') as string)?.trim() || null
  const posicion = (formData.get('posicion') as string) || ''
  const facultad = (formData.get('facultad') as string)?.trim()
  const directorFacultad = (formData.get('directorFacultad') as string)?.trim()
  const semestreRaw = (formData.get('semestre') as string)?.trim()
  const semestre = semestreRaw ? parseInt(semestreRaw, 10) : NaN
  const telefonoPersonal = (formData.get('telefonoPersonal') as string)?.trim()
  const telefonoTutor = (formData.get('telefonoTutor') as string)?.trim() || null
  const nss = (formData.get('nss') as string)?.trim() || null
  const seguroAseguradora = (formData.get('seguroAseguradora') as string)?.trim() || null
  const seguroPoliza = (formData.get('seguroPoliza') as string)?.trim() || null
  const seguroTitular = (formData.get('seguroTitular') as string)?.trim() || null
  const correo = (formData.get('correo') as string)?.trim() || null
  const rol = (formData.get('rol') as string) || 'JUGADOR'
  const genero = ((formData.get('genero') as string) || 'F') as 'F' | 'M'
  const rama = ramaFromGenero(genero) // derivado — nunca viene del formulario

  const anioIngresoRaw = (formData.get('anioIngreso') as string)?.trim()
  const anioIngreso = anioIngresoRaw ? parseInt(anioIngresoRaw, 10) : null // null para ADMIN: se rellena con el año actual abajo
  const numUniformeRaw = (formData.get('numUniforme') as string)?.trim()
  const numUniforme = numUniformeRaw ? parseInt(numUniformeRaw, 10) : null
  const tallaPlayera = (formData.get('tallaPlayera') as string) || null
  const tallaShort = (formData.get('tallaShort') as string) || null
  const tallaPants = (formData.get('tallaPants') as string) || null
  const tallaChamarra = (formData.get('tallaChamarra') as string) || null

  if (!nombre) return { error: 'El nombre es obligatorio.', field: 'nombre' }
  if (!apellidos) return { error: 'Los apellidos son obligatorios.', field: 'apellidos' }
  if (!telefonoPersonal) return { error: 'El teléfono personal es obligatorio.', field: 'telefonoPersonal' }
  const errTelPersonal = validarTelefono(telefonoPersonal)
  if (errTelPersonal) return { error: errTelPersonal, field: 'telefonoPersonal' }

  if (rol === 'ADMIN') {
    if (!correo) return { error: 'El correo es obligatorio.', field: 'correo' }
  } else {
    if (!matricula) return { error: 'La matrícula es obligatoria para atletas.', field: 'matricula' }
    const errMatricula = validarMatricula(matricula)
    if (errMatricula) return { error: errMatricula, field: 'matricula' }
    if (!posicion) return { error: 'Selecciona una posición.', field: 'posicion' }
    if (!isPosicionValida(posicion)) return { error: 'Selecciona una posición válida.', field: 'posicion' }
    if (!facultad) return { error: 'Selecciona una facultad.', field: 'facultad' }
    if (!directorFacultad) return { error: 'El director(a) de la facultad es obligatorio.', field: 'directorFacultad' }
    const errDirector = validarDirector(directorFacultad)
    if (errDirector) return { error: errDirector, field: 'directorFacultad' }
    if (!telefonoTutor) return { error: 'El teléfono del tutor/familiar es obligatorio.', field: 'telefonoTutor' }
    const errTelTutor = validarTelefono(telefonoTutor)
    if (errTelTutor) return { error: errTelTutor, field: 'telefonoTutor' }
    if (!nss) return { error: 'El NSS es obligatorio.', field: 'nss' }
    const errNss = validarNSS(nss)
    if (errNss) return { error: errNss, field: 'nss' }
    if (!anioIngreso) return { error: 'El año de ingreso es obligatorio.', field: 'anioIngreso' }
    const errAnio = validarAnioIngreso(anioIngreso)
    if (errAnio) return { error: errAnio, field: 'anioIngreso' }
    if (isNaN(semestre) || semestre < 1 || semestre > 12) {
      return { error: 'El semestre debe ser un número entre 1 y 12.', field: 'semestre' }
    }
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

  // El ADMIN no captura datos de atleta (facultad, semestre, NSS, etc.) — se
  // usan los mismos valores de relleno que el resto del staff técnico (ver
  // STAFF_SEED en actions/seed.ts) para satisfacer las columnas obligatorias.
  const esAdmin = rol === 'ADMIN'

  let clavePlana: string
  try {
    clavePlana = await generarClaveUnica(genero)
  } catch (e) {
    return { error: (e as Error).message }
  }
  const claveHasheada = await bcrypt.hash(clavePlana, 10)

  try {
    await prisma.atleta.create({
      data: {
        nombre, apellidos, genero, rama,
        posicion: esAdmin ? null : (posicion as PosicionValue),
        facultad: esAdmin ? 'Dirección de Deporte Universitario UADY' : facultad,
        directorFacultad: esAdmin ? 'Coordinación General del Deporte' : directorFacultad,
        matricula: esAdmin ? null : matricula,
        semestre: esAdmin ? 0 : semestre,
        telefonoPersonal,
        telefonoTutor: esAdmin ? telefonoPersonal : telefonoTutor!,
        correo,
        anioIngreso: anioIngreso ?? new Date().getFullYear(),
        numUniforme, tallaPlayera, tallaShort, tallaPants, tallaChamarra,
        codigoAcceso: claveHasheada, rol, fotoUrl,
        privado: { create: { nss, seguroAseguradora, seguroPoliza, seguroTitular } },
        claveAtleta: { create: { clavePlana } },
      },
    })
  } catch {
    return { error: 'Error al guardar el registro. Intenta de nuevo.' }
  }

  revalidatePath('/atletas')
  return { error: null, success: true, nombreGuardado: `${nombre} ${apellidos}`, claveGenerada: clavePlana }
}

export type PerfilFormState = { error: string | null; field?: string; success?: boolean }

export async function updateFotoPerfilPropio(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession()
  if (!session) return { error: 'Debes iniciar sesión.' }

  const fotoFile = formData.get('foto') as File | null
  if (!fotoFile || fotoFile.size === 0) return { error: 'Selecciona un archivo de foto.' }

  try {
    const record = await prisma.atleta.findUnique({ where: { id: session.id }, select: { nombre: true } })
    const bytes = await fotoFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = (fotoFile.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z]/g, '')
    const safe = (record?.nombre ?? 'usuario').toLowerCase().replace(/[^a-z0-9]/g, '-')
    const filename = `${Date.now()}-${safe}.${ext}`
    await writeFile(path.join(process.cwd(), 'public', 'uploads', 'fotos', filename), buffer)
    await prisma.atleta.update({ where: { id: session.id }, data: { fotoUrl: `/uploads/fotos/${filename}` } })
  } catch (e) {
    console.error('updateFotoPerfilPropio:', e)
    return { error: 'Error al guardar la foto.' }
  }

  revalidatePath('/perfil')
  return { success: true }
}

export async function updateSeccionAcademica(
  prevState: PerfilFormState,
  formData: FormData,
): Promise<PerfilFormState> {
  const session = await getSession()
  if (!session || session.rol !== 'JUGADOR') return { error: 'Sin permisos.' }

  const facultad = (formData.get('facultad') as string)?.trim()
  const semestreRaw = (formData.get('semestre') as string)?.trim()
  const directorFacultad = (formData.get('directorFacultad') as string)?.trim()

  if (!facultad || !semestreRaw || !directorFacultad) return { error: 'Completa todos los campos.' }
  const semestre = parseInt(semestreRaw, 10)
  if (isNaN(semestre) || semestre < 1 || semestre > 12) return { error: 'El semestre debe ser entre 1 y 12.', field: 'semestre' }
  const errDirector = validarDirector(directorFacultad)
  if (errDirector) return { error: errDirector, field: 'directorFacultad' }

  await prisma.atleta.update({ where: { id: session.id }, data: { facultad, semestre, directorFacultad } })
  revalidatePath('/perfil')
  return { error: null, success: true }
}

export async function updateSeccionDeportiva(
  prevState: PerfilFormState,
  formData: FormData,
): Promise<PerfilFormState> {
  const session = await getSession()
  if (!session) return { error: 'Sin permisos.' }

  const numUniformeRaw = (formData.get('numUniforme') as string)?.trim()
  const anioIngresoRaw = (formData.get('anioIngreso') as string)?.trim()

  if (!anioIngresoRaw) return { error: 'El año de ingreso es obligatorio.', field: 'anioIngreso' }
  const anioIngreso = parseInt(anioIngresoRaw, 10)
  const errAnio = validarAnioIngreso(anioIngreso)
  if (errAnio) return { error: errAnio, field: 'anioIngreso' }

  try {
    await actualizarDatosGenerales(session.id, {
      numUniforme: numUniformeRaw ? parseInt(numUniformeRaw, 10) : null,
      anioIngreso,
      tallaPlayera: (formData.get('tallaPlayera') as string) || null,
      tallaShort: (formData.get('tallaShort') as string) || null,
      tallaPants: (formData.get('tallaPants') as string) || null,
      tallaChamarra: (formData.get('tallaChamarra') as string) || null,
    })
  } catch {
    return { error: 'Error al guardar los cambios.' }
  }

  return { error: null, success: true }
}

export async function updateSeccionContacto(
  prevState: PerfilFormState,
  formData: FormData,
): Promise<PerfilFormState> {
  const session = await getSession()
  if (!session) return { error: 'Sin permisos.' }

  const correo = (formData.get('correo') as string)?.trim()
  const telefonoPersonal = (formData.get('telefonoPersonal') as string)?.trim()
  const telefonoTutor = (formData.get('telefonoTutor') as string)?.trim()

  if (!correo) return { error: 'El correo es obligatorio.', field: 'correo' }
  if (!telefonoPersonal) return { error: 'El teléfono personal es obligatorio.', field: 'telefonoPersonal' }
  if (!telefonoTutor) return { error: 'El teléfono del tutor/familiar es obligatorio.', field: 'telefonoTutor' }
  const errTelPersonal = validarTelefono(telefonoPersonal)
  if (errTelPersonal) return { error: errTelPersonal, field: 'telefonoPersonal' }
  const errTelTutor = validarTelefono(telefonoTutor)
  if (errTelTutor) return { error: errTelTutor, field: 'telefonoTutor' }

  await prisma.atleta.update({
    where: { id: session.id },
    data: { correo, telefonoPersonal, telefonoTutor },
  })
  revalidatePath('/perfil')
  return { error: null, success: true }
}

export async function updateSeccionMedica(
  prevState: PerfilFormState,
  formData: FormData,
): Promise<PerfilFormState> {
  const session = await getSession()
  if (!session || session.rol !== 'JUGADOR') return { error: 'Sin permisos.' }

  const nss = (formData.get('nss') as string)?.trim()
  const seguroAseguradora = (formData.get('seguroAseguradora') as string)?.trim() || null
  const seguroPoliza = (formData.get('seguroPoliza') as string)?.trim() || null
  const seguroTitular = (formData.get('seguroTitular') as string)?.trim() || null

  if (!nss) return { error: 'El NSS es obligatorio.', field: 'nss' }
  const errNss = validarNSS(nss)
  if (errNss) return { error: errNss, field: 'nss' }

  await prisma.atletaPrivado.upsert({
    where: { atletaId: session.id },
    update: { nss, seguroAseguradora, seguroPoliza, seguroTitular },
    create: { atletaId: session.id, nss, seguroAseguradora, seguroPoliza, seguroTitular },
  })
  revalidatePath('/perfil')
  return { error: null, success: true }
}

export async function updatePerfilAdmin(
  prevState: PerfilFormState,
  formData: FormData,
): Promise<PerfilFormState> {
  const session = await getSession()
  if (!session || session.rol !== 'ADMIN') return { error: 'Sin permisos.' }

  const nombre = (formData.get('nombre') as string)?.trim()
  const apellidos = (formData.get('apellidos') as string)?.trim()
  const correo = (formData.get('correo') as string)?.trim()
  const telefonoPersonal = (formData.get('telefonoPersonal') as string)?.trim()
  const rolTecnico = (formData.get('rolTecnico') as string)?.trim()

  if (!nombre || !apellidos || !correo || !telefonoPersonal || !rolTecnico) {
    return { error: 'Todos los campos son obligatorios.' }
  }
  const errTelPersonal = validarTelefono(telefonoPersonal)
  if (errTelPersonal) return { error: errTelPersonal, field: 'telefonoPersonal' }

  await prisma.atleta.update({
    where: { id: session.id },
    data: { nombre, apellidos, correo, telefonoPersonal, rolTecnico },
  })
  revalidatePath('/perfil')
  return { error: null, success: true }
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
