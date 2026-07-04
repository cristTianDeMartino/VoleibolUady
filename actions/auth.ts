'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { setSessionCookie, clearSessionCookie } from '@/lib/auth'
import { isLoginLocked, registerFailedLogin, clearLoginAttempts } from '@/lib/rateLimit'

export type LoginState = { error: string | null }

async function getClientIp(): Promise<string> {
  const h = await headers()
  const forwardedFor = h.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  return h.get('x-real-ip') ?? 'unknown'
}

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const codigo = (formData.get('codigoAcceso') as string)?.trim()

  if (!codigo) return { error: 'Ingresa tu código de acceso.' }

  const ip = await getClientIp()
  if (isLoginLocked(ip)) {
    return { error: 'Demasiados intentos fallidos. Intenta de nuevo en unos minutos.' }
  }

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

  if (!atleta) {
    registerFailedLogin(ip)
    return { error: 'Código incorrecto. Verifica con tu entrenador.' }
  }

  // El egresado conserva su código de acceso intacto (integridad del historial)
  // pero nunca puede iniciar sesión, aunque la clave sea técnicamente válida.
  if (atleta.estado === 'EGRESADO') return { error: 'EGRESADO' }

  clearLoginAttempts(ip)
  await setSessionCookie({ id: atleta.id, rol: atleta.rol, nombre: `${atleta.nombre} ${atleta.apellidos}` })

  // Tras iniciar sesión exitosamente, siempre al Dashboard de Inicio —
  // sin importar el rol ni la última ruta visitada.
  redirect('/inicio')
}

export async function logout() {
  await clearSessionCookie()
  redirect('/login')
}
