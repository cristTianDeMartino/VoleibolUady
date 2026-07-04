import crypto from 'crypto'

// Verificación de firma HMAC para la cookie de sesión — sin esto, la cookie es
// JSON plano y cualquiera que logre escribir un cookie con este nombre (p. ej.
// vía un XSS que sobrescriba la cookie httpOnly con document.cookie) podría
// autoasignarse rol ADMIN. Este módulo no importa next/headers para poder
// usarse tanto en Server Actions/Components (lib/auth.ts) como en proxy.ts.
export interface Session {
  id: string
  rol: string
  nombre: string
}

const SECRET = process.env.SESSION_SECRET || 'dev-only-insecure-secret-change-me'

if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  console.error(
    'SESSION_SECRET no está configurado en producción. Configúralo en .env — ' +
      'sin él, las sesiones se firman con un secreto inseguro conocido.'
  )
}

function sign(value: string): string {
  return crypto.createHmac('sha256', SECRET).update(value).digest('hex')
}

export function signSession(session: Session): string {
  const encoded = Buffer.from(JSON.stringify(session), 'utf8').toString('base64url')
  return `${encoded}.${sign(encoded)}`
}

export function verifySessionCookie(raw: string | undefined | null): Session | null {
  if (!raw) return null
  const dot = raw.lastIndexOf('.')
  if (dot === -1) return null
  const encoded = raw.slice(0, dot)
  const signature = raw.slice(dot + 1)
  const expected = sign(encoded)

  const sigBuf = Buffer.from(signature)
  const expectedBuf = Buffer.from(expected)
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null
  }

  try {
    return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as Session
  } catch {
    return null
  }
}
