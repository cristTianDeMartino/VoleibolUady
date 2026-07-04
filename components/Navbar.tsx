'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { logout } from '@/actions/auth'
import type { Session } from '@/lib/auth'

type NavLink = { label: string; href: string }
type NavItem =
  | { label: string; href: string }
  | { label: string; children: NavLink[] }

const navItems: NavItem[] = [
  { label: 'Inicio', href: '/inicio' },
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
      { label: 'Gimnasio y Preparación Física', href: '/gimnasio' },
      { label: 'Análisis Estadísticos', href: '/estadisticas' },
      { label: 'Récord de Temporada', href: '/record-temporada' },
    ],
  },
  {
    label: 'Área de la Salud',
    children: [
      { label: 'Seguimiento de Lesiones', href: '/lesiones' },
      { label: 'Citas Médicas', href: '/salud/citas' },
      { label: 'Prevenciones de la Salud', href: '/prevencion' },
    ],
  },
  {
    label: 'Gestión',
    children: [
      { label: 'Recursos Económicos', href: '/gestion/economia' },
      { label: 'Reportes', href: '/gestion/reportes' },
    ],
  },
  { label: 'Museo', href: '/museo' },
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
      <nav className="bg-uady-blue px-6 py-3">
        <div className="w-full flex items-center justify-between gap-6">

          {/* Grupo izquierdo: logo + links, pegado al borde izquierdo */}
          <div className="flex items-center gap-6 min-w-0">
            <Link href="/inicio" className="flex items-center gap-2 group flex-shrink-0">
              <span className="text-2xl">🏐</span>
              <span className="font-black text-uady-gold text-base tracking-wider uppercase group-hover:text-white transition-colors">
                Sistema de Voleibol
              </span>
            </Link>

            {/* Desktop links — pegados al logo, alineados a la izquierda */}
            <ul className="hidden md:flex items-center gap-x-6 justify-start">
              {navItems.map((item) => {
              if (!hasChildren(item)) {
                const active = isLinkActive(item.href)
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-uady-gold text-uady-blue font-bold'
                          : 'text-white hover:bg-white/10 hover:text-uady-gold'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              }

              const active = isParentActive(item.children)
              return (
                <li key={item.label} className="relative group">
                  <button
                    type="button"
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-uady-gold text-uady-blue font-bold'
                        : 'text-white hover:bg-white/10 hover:text-uady-gold'
                    }`}
                  >
                    {item.label}
                    <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                  </button>

                  <div className="absolute left-0 top-full pt-2 hidden group-hover:block z-50">
                    <ul className="bg-uady-gold rounded-xl shadow-lg border border-uady-gold/50 py-2 min-w-[15rem]">
                      {item.children.map((child) => {
                        const childActive = isLinkActive(child.href)
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={`block px-4 py-2.5 text-sm transition-colors ${
                                childActive
                                  ? 'bg-uady-blue/10 text-uady-blue font-semibold'
                                  : 'text-uady-blue hover:bg-yellow-600'
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
          </div>

          {/* Grupo derecho: auth + hamburger, pegado al borde derecho */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Auth controls (desktop) */}
            <div className="hidden md:block">
              {user ? (
                <div className="relative group">
                  <button
                    type="button"
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isLinkActive('/perfil')
                        ? 'bg-uady-gold text-uady-blue font-bold'
                        : 'text-white hover:bg-white/10 hover:text-uady-gold'
                    }`}
                  >
                    {user.nombre.split(' ')[0]}
                    <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                  </button>

                  <div className="absolute right-0 top-full pt-2 hidden group-hover:block z-50">
                    <ul className="bg-uady-gold rounded-xl shadow-lg border border-uady-gold/50 py-2 min-w-[12rem]">
                      <li>
                        <Link
                          href="/perfil"
                          className="block px-4 py-2.5 text-sm text-uady-blue hover:bg-yellow-600"
                        >
                          Mi Perfil
                        </Link>
                      </li>
                      <li>
                        <form action={logout}>
                          <button
                            type="submit"
                            className="w-full text-left px-4 py-2.5 text-sm text-uady-blue hover:bg-yellow-600"
                          >
                            Cerrar sesión
                          </button>
                        </form>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-uady-gold text-uady-blue hover:bg-white transition-all"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>

            {/* Mobile: hamburger */}
            <button
              className="md:hidden text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
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

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden mt-3 border-t border-white/20 pt-3">
            <ul className="flex flex-col gap-1 bg-uady-blue rounded-xl p-2">
              {navItems.map((item) => {
                if (!hasChildren(item)) {
                  const active = isLinkActive(item.href)
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        onClick={closeMobile}
                        className={`block px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          active
                            ? 'bg-uady-gold text-uady-blue'
                            : 'text-white hover:bg-uady-blue hover:text-uady-gold'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  )
                }

                const open = openMobileMenus.includes(item.label)
                const active = isParentActive(item.children)
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => toggleMobileMenu(item.label)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        active ? 'bg-uady-gold text-uady-blue' : 'text-white hover:bg-uady-blue hover:text-uady-gold'
                      }`}
                    >
                      {item.label}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {open && (
                      <ul className="ml-4 mt-1 flex flex-col gap-0.5 border-l-2 border-uady-gold/30 pl-2">
                        {item.children.map((child) => {
                          const childActive = isLinkActive(child.href)
                          return (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                onClick={closeMobile}
                                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                                  childActive
                                    ? 'bg-uady-gold text-uady-blue font-semibold'
                                    : 'text-white/90 hover:bg-uady-blue hover:text-uady-gold'
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

              {/* Perfil / Login — último ítem del menú móvil */}
              <li>
                {user ? (
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <Link
                      href="/perfil"
                      onClick={closeMobile}
                      className="text-white font-semibold text-sm hover:text-uady-gold"
                    >
                      {user.nombre.split(' ')[0]}
                    </Link>
                    <form action={logout}>
                      <button
                        type="submit"
                        className="text-white/80 text-xs font-semibold border border-white/30 px-2.5 py-1 rounded-lg hover:bg-white/10 hover:text-uady-gold transition-all"
                      >
                        Salir
                      </button>
                    </form>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={closeMobile}
                    className="block px-4 py-2.5 rounded-lg text-sm font-bold bg-uady-gold text-uady-blue"
                  >
                    Iniciar Sesión
                  </Link>
                )}
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  )
}
