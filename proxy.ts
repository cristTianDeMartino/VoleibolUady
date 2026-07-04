import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionCookie } from '@/lib/session'

// Next.js 16 renombró `middleware` a `proxy` (ver AGENTS.md — este proyecto usa
// APIs de Next 16, no las de versiones anteriores). Los Server Actions ya
// validan sesión/rol por su cuenta (ver app/actions/*.ts) — esto es una capa
// adicional para bloquear el render de páginas protegidas antes de que carguen.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = verifySessionCookie(request.cookies.get('uady-session')?.value)
  const loginUrl = new URL('/login', request.url)

  if (pathname.startsWith('/gestion')) {
    if (!session || session.rol !== 'ADMIN') return NextResponse.redirect(loginUrl)
    return NextResponse.next()
  }

  if (pathname === '/atletas/agregar') {
    if (!session || session.rol !== 'ADMIN') return NextResponse.redirect(loginUrl)
    return NextResponse.next()
  }

  // /atletas/[id] — perfil individual. No incluye /atletas (roster, público)
  // ni /atletas/agregar (ya manejado arriba).
  if (/^\/atletas\/[^/]+$/.test(pathname)) {
    if (!session) return NextResponse.redirect(loginUrl)
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/gestion/:path*', '/atletas/:path*'],
}
