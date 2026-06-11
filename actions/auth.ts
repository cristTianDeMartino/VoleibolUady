'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export type LoginState = { error: string | null }

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const codigo = (formData.get('codigoAcceso') as string)?.trim().toUpperCase()

  if (!codigo) return { error: 'Ingresa tu código de acceso.' }

  const atleta = await prisma.atleta.findUnique({
    where: { codigoAcceso: codigo },
    select: { id: true, rol: true, nombre: true, apellidos: true },
  })

  if (!atleta) return { error: 'Código incorrecto. Verifica con tu entrenador.' }

  const cookieStore = await cookies()
  cookieStore.set(
    'uady-session',
    JSON.stringify({ id: atleta.id, rol: atleta.rol, nombre: `${atleta.nombre} ${atleta.apellidos}` }),
    { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' }
  )

  redirect('/perfil')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('uady-session')
  redirect('/login')
}
