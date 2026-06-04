'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CircleDollarSign, TrendingUp, TrendingDown, Wallet, ShoppingBag, Trophy, Plane } from 'lucide-react'
import type { Metadata } from 'next'

// ─── Mockup visual (fallback cuando no existe la imagen) ──────────────────────

function EconomiaMockup() {
  const presupuesto = [
    { label: 'Inscripciones a torneos', monto: '$12,500', pct: 72, color: 'bg-primary-blue' },
    { label: 'Viáticos y transporte',   monto: '$8,200',  pct: 55, color: 'bg-accent-green' },
    { label: 'Equipamiento deportivo',  monto: '$5,800',  pct: 38, color: 'bg-accent-green' },
    { label: 'Gastos médicos',          monto: '$3,100',  pct: 22, color: 'bg-sky-500' },
  ]

  const movimientos = [
    { concepto: 'Venta de boletos — Clásico Regional', tipo: 'ingreso', monto: '+$4,200', fecha: '01 Jun' },
    { concepto: 'Inscripción Torneo Universitario',   tipo: 'egreso',  monto: '−$3,500', fecha: '28 May' },
    { concepto: 'Donación Club de Padres',            tipo: 'ingreso', monto: '+$2,000', fecha: '25 May' },
    { concepto: 'Viáticos — Torneo Noreste',          tipo: 'egreso',  monto: '−$1,800', fecha: '20 May' },
  ]

  return (
    <div className="w-full max-w-4xl mt-8 rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60 overflow-hidden">

      {/* Barra superior estilo app */}
      <div className="bg-primary-blue px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-accent-green" />
          <span className="text-white text-sm font-bold">Control de Recursos Económicos</span>
        </div>
        <span className="text-accent-green/70 text-xs font-semibold">Temporada 2025–2026</span>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Panel izquierdo: resumen de fondos */}
        <div className="space-y-5">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Fondo disponible', value: '$18,400', icon: <TrendingUp className="w-4 h-4 text-emerald-500" />, sub: '+12% vs temporada ant.' },
              { label: 'Total egresos',    value: '$11,900', icon: <TrendingDown className="w-4 h-4 text-accent-green" />, sub: 'Este semestre' },
            ].map(k => (
              <div key={k.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400 font-medium">{k.label}</span>
                  {k.icon}
                </div>
                <p className="text-lg font-black text-primary-blue">{k.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Barras de presupuesto */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Distribución del presupuesto</p>
            <div className="space-y-3">
              {presupuesto.map(p => (
                <div key={p.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 font-medium">{p.label}</span>
                    <span className="text-xs font-black text-primary-blue">{p.monto}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${p.color} rounded-full`} style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel derecho: últimos movimientos */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Últimos movimientos</p>
          <div className="space-y-2">
            {movimientos.map((m, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${m.tipo === 'ingreso' ? 'bg-emerald-400' : 'bg-accent-green'}`} />
                  <div>
                    <p className="text-xs font-semibold text-gray-700 leading-snug">{m.concepto}</p>
                    <p className="text-xs text-gray-400">{m.fecha}</p>
                  </div>
                </div>
                <span className={`text-sm font-black flex-shrink-0 ml-2 ${m.tipo === 'ingreso' ? 'text-emerald-600' : 'text-accent-green'}`}>
                  {m.monto}
                </span>
              </div>
            ))}
          </div>

          {/* Actividades de recaudación */}
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-5 mb-3">Fuentes de recaudación</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: <ShoppingBag className="w-4 h-4" />, label: 'Venta de chocolates', color: 'text-amber-600 bg-amber-50 border-amber-100' },
              { icon: <Trophy className="w-4 h-4" />,      label: 'Boletos de torneos',  color: 'text-primary-blue bg-primary-blue/5 border-primary-blue/10' },
              { icon: <Plane className="w-4 h-4" />,       label: 'Viáticos y fees',     color: 'text-sky-600 bg-sky-50 border-sky-100' },
            ].map(a => (
              <div key={a.label} className={`rounded-xl p-3 border text-center ${a.color}`}>
                <div className="flex justify-center mb-1">{a.icon}</div>
                <p className="text-xs font-semibold leading-tight">{a.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer del mockup */}
      <div className="bg-gray-50 border-t border-gray-100 px-6 py-3 flex items-center justify-between">
        <span className="text-xs text-gray-400">Vista previa conceptual — datos de muestra</span>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary-blue" />
          <div className="w-2 h-2 rounded-full bg-accent-green" />
          <div className="w-2 h-2 rounded-full bg-accent-green" />
        </div>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function EconomiaPage() {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="bg-gray-50 min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-16">

      {/* Encabezado */}
      <div className="max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-blue/10 mb-6">
          <CircleDollarSign className="w-10 h-10 text-accent-green" strokeWidth={1.5} />
        </div>

        <div className="inline-flex items-center gap-2 bg-accent-green/10 border border-accent-green/30 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
          Módulo en Desarrollo
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-primary-blue mb-4 leading-tight">
          Control de Recursos Económicos
        </h1>

        <div className="w-14 h-1 bg-accent-green rounded-full mx-auto mb-5" />

        <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
          Módulo en desarrollo diseñado para llevar el registro transparente de las finanzas del
          equipo. Incluirá el control de fondos, ingresos por actividades de recaudación (venta de
          boletos, chocolates) y presupuestos para inscripciones a torneos y viáticos.
        </p>
      </div>

      {/* Imagen o mockup */}
      {!imgError ? (
        <div className="relative w-full max-w-4xl mt-8">
          <Image
            src="/economia.png"
            alt="Vista previa del módulo de recursos económicos"
            width={1200}
            height={675}
            onError={() => setImgError(true)}
            className="rounded-xl shadow-lg border border-gray-200 w-full h-auto object-cover"
            priority
          />
        </div>
      ) : (
        <EconomiaMockup />
      )}
    </div>
  )
}
