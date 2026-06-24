'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export type LoginState = { error: string | null }

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const codigo = (formData.get('codigoAcceso') as string)?.trim()

  if (!codigo) return { error: 'Ingresa tu código de acceso.' }

  // codigoAcceso se guarda hasheado (bcrypt) — no se puede buscar por igualdad,
  // así que se compara contra cada hash hasta encontrar coincidencia.
  const candidatos = await prisma.atleta.findMany({
    select: { id: true, rol: true, nombre: true, apellidos: true, codigoAcceso: true, estado: true },
  })

  let atleta: { id: string; rol: string; nombre: string; apellidos: string; estado: string } | null = null
  for (const c of candidatos) {
    if (await bcrypt.compare(codigo, c.codigoAcceso)) {
      atleta = c
      break
    }
  }

  if (!atleta) return { error: 'Código incorrecto. Verifica con tu entrenador.' }

  // El egresado conserva su código de acceso intacto (integridad del historial)
  // pero nunca puede iniciar sesión, aunque la clave sea técnicamente válida.
  if (atleta.estado === 'EGRESADO') return { error: 'EGRESADO' }

  const cookieStore = await cookies()
  cookieStore.set(
    'uady-session',
    JSON.stringify({ id: atleta.id, rol: atleta.rol, nombre: `${atleta.nombre} ${atleta.apellidos}` }),
    { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' }
  )

  // Tras iniciar sesión exitosamente, siempre al Dashboard de Inicio —
  // sin importar el rol ni la última ruta visitada.
  redirect('/')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('uady-session')
  redirect('/login')
}
