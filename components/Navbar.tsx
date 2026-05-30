'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/atletas', label: 'Atletas' },
  { href: '/cronograma', label: 'Cronograma' },
  { href: '/trabajo-fisico', label: 'Trabajo Físico' },
  { href: '/psicologia', label: 'Psicología' },
  { href: '/lesiones', label: 'Lesiones' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Top bar — Gold */}
      <div className="bg-uady-gold px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo placeholder */}
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
          <p className="hidden md:block text-uady-blue text-xs font-semibold tracking-wide uppercase">
            Selecciones de Voleibol · Plan Rector
          </p>
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
            {navLinks.map((link) => {
              const active = pathname === link.href
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-uady-gold text-uady-blue'
                        : 'text-white hover:bg-white/10 hover:text-uady-gold'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Mobile hamburger */}
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

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden mt-3 border-t border-white/20 pt-3">
            <ul className="flex flex-col gap-1 bg-uady-yellow-light rounded-xl p-2">
              {navLinks.map((link) => {
                const active = pathname === link.href
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        active
                          ? 'bg-uady-blue text-white'
                          : 'text-uady-blue hover:bg-uady-gold hover:text-white'
                      }`}
                    >
                      {link.label}
                    </Link>
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
