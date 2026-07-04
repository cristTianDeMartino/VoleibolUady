const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5

type Entry = { count: number; firstAttempt: number; lockedUntil?: number }

// ponytail: Map en memoria de un solo proceso — se reinicia al redeployar y no
// se comparte entre instancias. Suficiente para un solo servidor Node; si el
// despliegue escala horizontalmente, mover a un store compartido (Redis).
const attempts = new Map<string, Entry>()

export function isLoginLocked(key: string): boolean {
  const entry = attempts.get(key)
  if (!entry?.lockedUntil) return false
  if (Date.now() > entry.lockedUntil) {
    attempts.delete(key)
    return false
  }
  return true
}

export function registerFailedLogin(key: string) {
  const now = Date.now()
  const entry = attempts.get(key)
  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAttempt: now })
    return
  }
  entry.count++
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + WINDOW_MS
  }
}

export function clearLoginAttempts(key: string) {
  attempts.delete(key)
}
