'use client'

import { useState } from 'react'
import {
  Apple,
  Brain,
  Activity,
  SmilePlus,
  HeartPulse,
  Plus,
  Pencil,
  Trash2,
  Clock,
  CheckCircle2,
  Loader2,
} from 'lucide-react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type IconKey = 'nutrition' | 'psychology' | 'physio' | 'dentistry'

interface RegistroSalud {
  id: number
  atleta: string
  tipo: string
  descripcion: string
  fecha: string
  estado: 'Pendiente' | 'En proceso' | 'Programada'
  iconKey: IconKey
  badge: string        // clases para la pastilla de tipo
  border: string       // clase border-l-COLOR
  estadoColor: string  // clases para el chip de estado
}

interface VideoMock {
  id: number
  titulo: string
  descripcion: string
  embedId: string
  duracion: string
  tag: string
}

// ─── Datos mock ───────────────────────────────────────────────────────────────

const registros: RegistroSalud[] = [
  {
    id: 1,
    atleta: 'Ana López',
    tipo: 'Nutrición',
    descripcion: 'Evaluación del plan nutricional e hidratación en período competitivo.',
    fecha: 'Mañana · 10:00 am',
    estado: 'Pendiente',
    iconKey: 'nutrition',
    badge: 'bg-emerald-100 text-emerald-700',
    border: 'border-l-emerald-400',
    estadoColor: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  },
  {
    id: 2,
    atleta: 'Valeria Ruiz',
    tipo: 'Psicología Deportiva',
    descripcion: 'Sesión de manejo de ansiedad pre-competitiva y trabajo de visualización.',
    fecha: '5 Jun · 9:00 am',
    estado: 'Programada',
    iconKey: 'psychology',
    badge: 'bg-violet-100 text-violet-700',
    border: 'border-l-violet-400',
    estadoColor: 'bg-violet-50 text-violet-600 border border-violet-200',
  },
  {
    id: 3,
    atleta: 'Sofía Martínez',
    tipo: 'Fisioterapia · Sobrecarga',
    descripcion: 'Molestia leve en hombro derecho. Control preventivo de manguito rotador.',
    fecha: 'Hoy · 4:30 pm',
    estado: 'En proceso',
    iconKey: 'physio',
    badge: 'bg-sky-100 text-sky-700',
    border: 'border-l-sky-400',
    estadoColor: 'bg-sky-50 text-sky-600 border border-sky-200',
  },
  {
    id: 4,
    atleta: 'Mariana Vega',
    tipo: 'Odontología',
    descripcion: 'Revisión semestral y adaptación de protector bucal deportivo.',
    fecha: '8 Jun · 11:00 am',
    estado: 'Pendiente',
    iconKey: 'dentistry',
    badge: 'bg-amber-100 text-amber-700',
    border: 'border-l-amber-400',
    estadoColor: 'bg-amber-50 text-amber-600 border border-amber-200',
  },
]

const videos: VideoMock[] = [
  {
    id: 1,
    titulo: 'Gestión del estrés pre-competitivo',
    descripcion: 'Técnicas de control del estrés y ansiedad antes de partidos clave. Respiración y enfoque mental.',
    embedId: 'RcGyVTAoXEU',
    duracion: '14:28',
    tag: 'Manejo del Estrés',
  },
  {
    id: 2,
    titulo: 'Visualización del éxito en la cancha',
    descripcion: 'Protocolo de visualización deportiva aplicado a situaciones reales de partido y saque.',
    embedId: 'Ks-_Mh1QhMc',
    duracion: '21:02',
    tag: 'Técnica Mental',
  },
  {
    id: 3,
    titulo: 'Charla motivacional de temporada',
    descripcion: 'Conferencia sobre mentalidad de alto rendimiento, trabajo en equipo y resiliencia.',
    embedId: 'rrkrvAUbU9Y',
    duracion: '18:31',
    tag: 'Motivación',
  },
]

// ─── Mapa de iconos ───────────────────────────────────────────────────────────

const ICON_MAP: Record<IconKey, React.ReactNode> = {
  nutrition: <Apple className="w-5 h-5" />,
  psychology: <Brain className="w-5 h-5" />,
  physio: <Activity className="w-5 h-5" />,
  dentistry: <SmilePlus className="w-5 h-5" />,
}

const ESTADO_ICON: Record<RegistroSalud['estado'], React.ReactNode> = {
  'Pendiente': <Clock className="w-3 h-3" />,
  'En proceso': <Loader2 className="w-3 h-3" />,
  'Programada': <CheckCircle2 className="w-3 h-3" />,
}

// ─── Sub-componente: Tarjeta de registro preventivo ──────────────────────────

function RegistroCard({ r }: { r: RegistroSalud }) {
  return (
    <div
      className={`
        bg-white rounded-xl border border-gray-100 border-l-4 ${r.border}
        shadow-sm hover:shadow-md transition-all duration-200 p-5
      `}
    >
      <div className="flex items-start gap-3">
        {/* Ícono */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${r.badge}`}>
          {ICON_MAP[r.iconKey]}
        </div>

        <div className="flex-1 min-w-0">
          {/* Encabezado */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <p className="font-black text-uady-blue text-sm leading-snug">{r.atleta}</p>
              <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5 ${r.badge}`}>
                {r.tipo}
              </span>
            </div>
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg flex-shrink-0 ${r.estadoColor}`}>
              {ESTADO_ICON[r.estado]}
              {r.estado}
            </div>
          </div>

          {/* Descripción */}
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">{r.descripcion}</p>

          {/* Fecha */}
          <div className="flex items-center gap-1.5 mt-3">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400 font-medium">{r.fecha}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-componente: Tarjeta de video ─────────────────────────────────────────

function VideoCard({ v }: { v: VideoMock }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Contenedor iframe 16:9 */}
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        <iframe
          src={`https://www.youtube.com/embed/${v.embedId}`}
          title={v.titulo}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 w-full h-full border-0"
        />

        {/* Controles admin — visibles solo en hover */}
        <div
          className={`
            absolute top-2 right-2 flex items-center gap-1.5
            transition-all duration-200
            ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'}
          `}
        >
          <button
            title="Editar video"
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow text-slate-600 hover:text-uady-blue hover:bg-white transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            title="Eliminar video"
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow text-slate-600 hover:text-red-500 hover:bg-white transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Badge de duración */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold px-1.5 py-0.5 rounded pointer-events-none">
          {v.duracion}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <span className="inline-block text-xs font-bold bg-uady-blue/10 text-uady-blue px-2 py-0.5 rounded-full mb-2">
          {v.tag}
        </span>
        <h3 className="font-black text-uady-blue text-sm leading-snug mb-1">{v.titulo}</h3>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{v.descripcion}</p>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function PrevencionPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* ══ SECCIÓN 1: Monitoreo Preventivo ══ */}
        <section className="mb-14">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-7 bg-uady-gold rounded-full" />
                <h1 className="text-3xl font-black text-uady-blue">Control de Salud Preventiva</h1>
              </div>
              <p className="text-gray-500 text-sm ml-3">
                Seguimiento de citas, molestias menores y atención preventiva del equipo.
              </p>
            </div>
            <button className="flex items-center gap-2 bg-uady-gold text-uady-blue px-5 py-2.5 rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-md shadow-uady-gold/20 self-start sm:self-auto flex-shrink-0">
              <Plus className="w-4 h-4" />
              Registrar Cita / Molestia
            </button>
          </div>

          {/* Resumen rápido */}
          <div className="grid grid-cols-3 gap-4 mb-7">
            {[
              { label: 'Pendientes', value: '2', color: 'bg-amber-50 border-amber-200 text-amber-700' },
              { label: 'En proceso', value: '1', color: 'bg-sky-50 border-sky-200 text-sky-700' },
              { label: 'Esta semana', value: '4', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
            ].map(s => (
              <div key={s.label} className={`rounded-xl border p-4 text-center ${s.color}`}>
                <p className="text-2xl font-black leading-none">{s.value}</p>
                <p className="text-xs font-semibold mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Grid de tarjetas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {registros.map(r => (
              <RegistroCard key={r.id} r={r} />
            ))}
          </div>
        </section>

        {/* ── Divisor visual ── */}
        <div className="flex items-center gap-4 mb-10">
          <div className="h-px flex-1 bg-gray-200" />
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm">
            <HeartPulse className="w-3.5 h-3.5 text-uady-gold" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Bienestar Mental
            </span>
          </div>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* ══ SECCIÓN 2: Psicología y Motivación ══ */}
        <section>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-6 bg-uady-gold rounded-full" />
                <h2 className="text-xl font-black text-uady-blue">Psicología y Motivación Deportiva</h2>
              </div>
              <p className="text-gray-500 text-sm ml-3">
                Recursos audiovisuales de apoyo mental y desarrollo personal del atleta.
              </p>
            </div>
            <button className="flex items-center gap-2 border border-uady-blue/40 text-uady-blue px-4 py-2 rounded-xl text-sm font-bold hover:bg-uady-blue hover:text-white transition-all self-start sm:self-auto flex-shrink-0">
              <Plus className="w-4 h-4" />
              Agregar Video
            </button>
          </div>

          {/* Grid de videos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videos.map(v => (
              <VideoCard key={v.id} v={v} />
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
