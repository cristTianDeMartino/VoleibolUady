'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { logout } from '@/actions/auth'
import type { Session } from '@/lib/auth'

// Estructura jerárquica del menú. Todos los href son URL-safe (kebab-case).
type NavLink = { label: string; href: string }
type NavItem =
  | { label: string; href: string } // enlace directo
  | { label: string; children: NavLink[] } // desplegable

const navItems: NavItem[] = [
  { label: 'Inicio', href: '/' },
  {
    label: 'Plantilla',
    children: [
      { label: 'Roster de Atletas', href: '/atletas' },
      { label: 'Registro de Asistencia', href: '/asistencia' },
    ],
  },
  {
    label: 'Área Deportiva',
    children: [
      { label: 'Cronograma', href: '/cronograma' },
      { label: 'Programa de Fuerza', href: '/programa-fuerza' },
      { label: 'Análisis Estadísticos', href: '/estadisticas' },
      { label: 'Récord de Temporada', href: '/record-temporada' },
    ],
  },
  {
    label: 'Área de la Salud',
    children: [
      { label: 'Seguimiento de Lesiones', href: '/lesiones' },
      { label: 'Prevenciones de la Salud', href: '/prevencion' },
    ],
  },
  {
    label: 'Gestión',
    children: [
      { label: 'Recursos Económicos', href: '/recursos' },
      { label: 'Capacitación', href: '/capacitacion' },
    ],
  },
]

const hasChildren = (item: NavItem): item is { label: string; children: NavLink[] } =>
  'children' in item

interface NavbarProps {
  user?: Session | null
}

export default function Navbar({ user }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMobileMenus, setOpenMobileMenus] = useState<string[]>([])
  const pathname = usePathname()

  // Activo si coincide exacto o es una subruta (p. ej. /atletas/123)
  const isLinkActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')

  const isParentActive = (children: NavLink[]) => children.some((c) => isLinkActive(c.href))

  const toggleMobileMenu = (label: string) =>
    setOpenMobileMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    )

  const closeMobile = () => {
    setMobileOpen(false)
    setOpenMobileMenus([])
  }

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Top bar — Gold */}
      <div className="bg-uady-gold px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-uady-blue flex items-center justify-center flex-shrink-0">
              <span className="text-uady-gold font-black text-xs leading-none">UADY</span>
            </div>
            <div>
              <p className="font-bold text-uady-blue text-sm leading-tight">
                Universidad Autónoma de Yucatán
              </p>
              <p className="text-uady-blue text-xs italic opacity-75">Luz, Ciencia y Verdad</p>
            </div>
          </div>

          {/* Session info */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <div className="text-right">
                  <p className="text-uady-blue text-xs font-bold leading-none">{user.nombre.split(' ')[0]}</p>
                  <p className="text-uady-blue/60 text-xs">{user.rol}</p>
                </div>
                <form action={logout}>
                  <button
                    type="submit"
                    className="text-uady-blue text-xs font-semibold border border-uady-blue/30 px-2.5 py-1 rounded-lg hover:bg-uady-blue hover:text-white transition-all"
                  >
                    Salir
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="text-uady-blue text-xs font-bold border border-uady-blue/30 px-3 py-1.5 rounded-lg hover:bg-uady-blue hover:text-white transition-all"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main nav — Blue */}
      <nav className="bg-uady-blue px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🏐</span>
            <span className="font-black text-uady-gold text-base tracking-wider uppercase group-hover:text-white transition-colors">
              Voleibol UADY
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              // Enlace directo
              if (!hasChildren(item)) {
                const active = isLinkActive(item.href)
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-uady-gold text-uady-blue'
                          : 'text-white hover:bg-white/10 hover:text-uady-gold'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              }

              // Desplegable (hover con group)
              const active = isParentActive(item.children)
              return (
                <li key={item.label} className="relative group">
                  <button
                    type="button"
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-uady-gold text-uady-blue'
                        : 'text-white hover:bg-white/10 hover:text-uady-gold'
                    }`}
                  >
                    {item.label}
                    <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                  </button>

                  {/* Dropdown — el pt-2 actúa de puente para no perder el hover */}
                  <div className="absolute left-0 top-full pt-2 hidden group-hover:block z-50">
                    <ul className="bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[15rem]">
                      {item.children.map((child) => {
                        const childActive = isLinkActive(child.href)
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={`block px-4 py-2.5 text-sm transition-colors ${
                                childActive
                                  ? 'bg-gray-100 text-uady-blue font-semibold'
                                  : 'text-gray-800 hover:bg-gray-100 hover:text-uady-gold'
                              }`}
                            >
                              {child.label}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </li>
              )
            })}
          </ul>

          {/* Mobile: session + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {user ? (
              <form action={logout}>
                <button type="submit" className="text-white/70 text-xs border border-white/20 px-2 py-1 rounded-lg">
                  Salir
                </button>
              </form>
            ) : (
              <Link href="/login" className="text-white/70 text-xs border border-white/20 px-2 py-1 rounded-lg">
                Login
              </Link>
            )}
            <button
              className="text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Abrir menú"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown — acordeón jerárquico */}
        {mobileOpen && (
          <div className="md:hidden mt-3 border-t border-white/20 pt-3">
            <ul className="flex flex-col gap-1 bg-uady-yellow-light rounded-xl p-2">
              {navItems.map((item) => {
                // Enlace directo
                if (!hasChildren(item)) {
                  const active = isLinkActive(item.href)
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        onClick={closeMobile}
                        className={`block px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          active
                            ? 'bg-uady-blue text-white'
                            : 'text-uady-blue hover:bg-uady-gold hover:text-white'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  )
                }

                // Categoría desplegable
                const open = openMobileMenus.includes(item.label)
                const active = isParentActive(item.children)
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => toggleMobileMenu(item.label)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        active ? 'bg-uady-blue text-white' : 'text-uady-blue hover:bg-uady-gold hover:text-white'
                      }`}
                    >
                      {item.label}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Sub-enlaces indentados (ml-4) */}
                    {open && (
                      <ul className="ml-4 mt-1 flex flex-col gap-0.5 border-l-2 border-uady-blue/20 pl-2">
                        {item.children.map((child) => {
                          const childActive = isLinkActive(child.href)
                          return (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                onClick={closeMobile}
                                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                                  childActive
                                    ? 'bg-uady-blue text-white font-semibold'
                                    : 'text-uady-blue/90 hover:bg-uady-gold hover:text-white'
                                }`}
                              >
                                {child.label}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </nav>
    </header>
  )
}
