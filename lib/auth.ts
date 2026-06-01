import { cookies } from 'next/headers'

export interface Session {
  id: string
  rol: string
  nombre: string
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get('uady-session')?.value
  if (!raw) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}
