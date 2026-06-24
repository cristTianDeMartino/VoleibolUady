'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  FileBarChart2,
  Download,
  Share2,
  BarChart3,
  Users,
  HeartPulse,
  CircleDollarSign,
  CheckCircle2,
  Clock,
  FileText,
  KeyRound,
} from 'lucide-react'

// ─── Mockup visual (fallback cuando no existe la imagen) ──────────────────────

function ReportesMockup() {
  const reportes = [
    {
      titulo: 'Métricas de Rendimiento Deportivo',
      descripcion: 'Estadísticas de sets, puntos, aces y errores por atleta.',
      icon: <BarChart3 className="w-5 h-5" />,
      estado: 'Disponible',
      estadoColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      color: 'border-l-emerald-400',
      fecha: 'Jun 2026',
    },
    {
      titulo: 'Registro de Asistencia Mensual',
      descripcion: 'Pases de lista detallados por atleta, rama y período.',
      icon: <Users className="w-5 h-5" />,
      estado: 'Disponible',
      estadoColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      color: 'border-l-emerald-400',
      fecha: 'Jun 2026',
    },
    {
      titulo: 'Roster General',
      descripcion: 'Datos completos de atletas y administradores con códigos de acceso.',
      icon: <KeyRound className="w-5 h-5" />,
      estado: 'Disponible',
      estadoColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      color: 'border-l-emerald-400',
      fecha: 'Jun 2026',
      href: '/api/admin/exportar-claves',
    },
    {
      titulo: 'Incidencias Médicas y Lesiones',
      descripcion: 'Historial de lesiones, diagnósticos y seguimiento por atleta.',
      icon: <HeartPulse className="w-5 h-5" />,
      estado: 'En desarrollo',
      estadoColor: 'bg-amber-50 text-amber-600 border-amber-200',
      color: 'border-l-amber-400',
      fecha: 'Próximamente',
    },
    {
      titulo: 'Estado Financiero de Temporada',
      descripcion: 'Resumen de ingresos, egresos y distribución del presupuesto.',
      icon: <CircleDollarSign className="w-5 h-5" />,
      estado: 'En desarrollo',
      estadoColor: 'bg-amber-50 text-amber-600 border-amber-200',
      color: 'border-l-amber-400',
      fecha: 'Próximamente',
    },
  ]

  const formatos = [
    { label: 'PDF', icon: <FileText className="w-4 h-4" />, color: 'bg-uady-blue/10 text-uady-blue border-uady-blue/20' },
    { label: 'Excel', icon: <BarChart3 className="w-4 h-4" />, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    { label: 'Compartir', icon: <Share2 className="w-4 h-4" />, color: 'bg-sky-50 text-sky-600 border-sky-200' },
  ]

  return (
    <div className="w-full max-w-4xl mt-8 rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60 overflow-hidden">

      {/* Barra superior */}
      <div className="bg-uady-blue px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileBarChart2 className="w-4 h-4 text-uady-gold" />
          <span className="text-white text-sm font-bold">Centro de Reportes Generales</span>
        </div>
        <span className="text-uady-gold/70 text-xs font-semibold">Temporada 2025–2026</span>
      </div>

      <div className="p-6">

        {/* KPIs superiores */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Reportes generados', value: '24', sub: 'Este ciclo', dot: 'bg-emerald-400' },
            { label: 'Disponibles ahora',  value: '3',  sub: 'Listos para descarga', dot: 'bg-emerald-400' },
            { label: 'En desarrollo',      value: '2',  sub: 'Próximamente', dot: 'bg-amber-400' },
          ].map(k => (
            <div key={k.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
              <p className="text-2xl font-black text-uady-blue">{k.value}</p>
              <p className="text-xs font-bold text-gray-600 mt-0.5">{k.label}</p>
              <div className="flex items-center justify-center gap-1 mt-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${k.dot}`} />
                <p className="text-xs text-gray-400">{k.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Lista de reportes */}
        <div className="space-y-3 mb-6">
          {reportes.map((r, i) => (
            <div
              key={i}
              className={`flex items-center justify-between bg-white border border-gray-100 border-l-4 ${r.color} rounded-xl px-5 py-4 hover:shadow-sm transition-shadow`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-uady-blue/8 text-uady-blue flex items-center justify-center flex-shrink-0">
                  {r.icon}
                </div>
                <div>
                  <p className="text-sm font-black text-uady-blue">{r.titulo}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.descripcion}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${r.estadoColor} hidden sm:inline-flex items-center gap-1`}>
                  {r.estado === 'Disponible'
                    ? <CheckCircle2 className="w-3 h-3" />
                    : <Clock className="w-3 h-3" />}
                  {r.estado}
                </span>
                {r.href ? (
                  <a
                    href={r.href}
                    className="flex items-center gap-1.5 bg-uady-gold text-uady-blue text-xs font-bold px-3 py-1.5 rounded-lg hover:brightness-110 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar
                  </a>
                ) : (
                  <button
                    disabled={r.estado !== 'Disponible'}
                    className="flex items-center gap-1.5 bg-uady-gold text-uady-blue text-xs font-bold px-3 py-1.5 rounded-lg hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Formatos de exportación */}
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Formatos de exportación disponibles</p>
            <p className="text-xs text-gray-400 mt-0.5">Genera y comparte reportes en distintos formatos</p>
          </div>
          <div className="flex items-center gap-2">
            {formatos.map(f => (
              <button
                key={f.label}
                className={`flex items-center gap-1.5 border text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:shadow-sm ${f.color}`}
              >
                {f.icon}
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-100 px-6 py-3 flex items-center justify-between">
        <span className="text-xs text-gray-400">Vista previa conceptual — datos de muestra</span>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-uady-blue" />
          <div className="w-2 h-2 rounded-full bg-uady-gold" />
          <div className="w-2 h-2 rounded-full bg-uady-gold" />
        </div>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function ReportesClient() {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="bg-gray-50 min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-16">

      {/* Encabezado */}
      <div className="max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-uady-blue/10 mb-6">
          <FileBarChart2 className="w-10 h-10 text-uady-gold" strokeWidth={1.5} />
        </div>

        <div className="inline-flex items-center gap-2 bg-uady-gold/10 border border-uady-gold/30 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-uady-gold animate-pulse" />
          Próximamente
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-uady-blue mb-4 leading-tight">
          Centro de Reportes Generales
        </h1>

        <div className="w-14 h-1 bg-uady-gold rounded-full mx-auto mb-5" />

        <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
          Próximamente podrás generar, descargar y compartir reportes automatizados de todas las
          áreas del club: métricas de rendimiento deportivo, pases de lista, incidencias médicas y
          estados financieros de la temporada.
        </p>
      </div>

      {/* Imagen o mockup */}
      {!imgError ? (
        <div className="relative w-full max-w-4xl mt-8">
          <Image
            src="/reportes.png"
            alt="Vista previa del módulo de reportes"
            width={1200}
            height={675}
            onError={() => setImgError(true)}
            className="rounded-xl shadow-lg border border-gray-200 w-full h-auto object-cover"
            priority
          />
        </div>
      ) : (
        <ReportesMockup />
      )}
    </div>
  )
}
