import { cookies } from 'next/headers'
import { signSession, verifySessionCookie, type Session } from '@/lib/session'

export type { Session }

const COOKIE_NAME = 'uady-session'

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  return verifySessionCookie(cookieStore.get(COOKIE_NAME)?.value)
}

export async function setSessionCookie(session: Session) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, signSession(session), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
