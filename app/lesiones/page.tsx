'use client'

import { useState } from 'react'

interface Reporte {
  id: number
  nombre: string
  zona: string
  nivelDolor: number
  fecha: string
  descripcion: string
  estado: 'activo' | 'recuperado'
}

const mockHistorial: Reporte[] = [
  { id: 1, nombre: 'María Hernández', zona: 'Rodilla derecha', nivelDolor: 6, fecha: '2026-05-20', descripcion: 'Molestia al saltar y aterrizar. Sin inflamación visible.', estado: 'activo' },
  { id: 2, nombre: 'Valentina Ramírez', zona: 'Hombro izquierdo', nivelDolor: 4, fecha: '2026-05-22', descripcion: 'Tensión muscular al realizar remate de alto impacto.', estado: 'activo' },
  { id: 3, nombre: 'Ana García', zona: 'Tobillo derecho', nivelDolor: 8, fecha: '2026-05-25', descripcion: 'Torcedura leve en defensa de segunda línea. Revisión médica completada.', estado: 'activo' },
  { id: 4, nombre: 'Daniela Torres', zona: 'Muñeca izquierda', nivelDolor: 3, fecha: '2026-05-28', descripcion: 'Incomodidad leve al bloquear. Bajo seguimiento.', estado: 'activo' },
  { id: 5, nombre: 'Laura Martínez', zona: 'Espalda baja', nivelDolor: 5, fecha: '2026-05-12', descripcion: 'Contractura muscular después de sesión de gimnasio. Resuelta.', estado: 'recuperado' },
  { id: 6, nombre: 'Sofía López', zona: 'Dedo pulgar derecho', nivelDolor: 3, fecha: '2026-05-08', descripcion: 'Golpe con balón en entrenamiento. Sin complicaciones.', estado: 'recuperado' },
]

const zonasCuerpo = [
  'Cabeza / Cuello', 'Hombro derecho', 'Hombro izquierdo', 'Codo derecho', 'Codo izquierdo',
  'Muñeca derecha', 'Muñeca izquierda', 'Mano / Dedos derecha', 'Mano / Dedos izquierda',
  'Espalda alta', 'Espalda baja', 'Rodilla derecha', 'Rodilla izquierda',
  'Tobillo derecho', 'Tobillo izquierdo', 'Pie / Dedos derecho', 'Pie / Dedos izquierdo',
]

function PainIndicator({ nivel }: { nivel: number }) {
  const color =
    nivel <= 3 ? 'bg-emerald-500' : nivel <= 6 ? 'bg-uady-gold' : 'bg-uady-orange-cta'
  const label = nivel <= 3 ? 'Leve' : nivel <= 6 ? 'Moderado' : 'Alto'
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-3 rounded-sm ${i < nivel ? color : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <span className={`text-xs font-bold ${nivel <= 3 ? 'text-emerald-600' : nivel <= 6 ? 'text-amber-600' : 'text-uady-orange-cta'}`}>
        {nivel}/10 · {label}
      </span>
    </div>
  )
}

export default function LesionesPage() {
  const [nombre, setNombre] = useState('')
  const [zona, setZona] = useState('')
  const [nivelDolor, setNivelDolor] = useState(5)
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [descripcion, setDescripcion] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activo' | 'recuperado'>('todos')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setNombre('')
      setZona('')
      setNivelDolor(5)
      setFecha(new Date().toISOString().split('T')[0])
      setDescripcion('')
    }, 3000)
  }

  const historialFiltrado =
    filtroEstado === 'todos'
      ? mockHistorial
      : mockHistorial.filter((r) => r.estado === filtroEstado)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-7 bg-uady-orange-cta rounded-full" />
        <h1 className="text-3xl font-black text-uady-blue">Reporte de Lesiones</h1>
      </div>
      <p className="text-gray-500 text-sm ml-3 mb-8">
        Registra molestias físicas y consulta el historial del equipo.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-black text-uady-blue mb-5 flex items-center gap-2">
              🩺 <span>Nueva Molestia</span>
            </h2>

            {submitted && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                ✅ Reporte enviado correctamente
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Nombre del Atleta *
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Ana García"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Zona del Cuerpo Afectada *
                </label>
                <select
                  required
                  value={zona}
                  onChange={(e) => setZona(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all text-gray-700"
                >
                  <option value="">Seleccionar zona...</option>
                  {zonasCuerpo.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2">
                  Nivel de Dolor: <span className="text-uady-orange-cta font-black">{nivelDolor}/10</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={nivelDolor}
                  onChange={(e) => setNivelDolor(Number(e.target.value))}
                  className="w-full accent-uady-orange-cta"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1 · Mínimo</span>
                  <span>5 · Moderado</span>
                  <span>10 · Máximo</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Fecha *</label>
                <input
                  type="date"
                  required
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Descripción
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={3}
                  placeholder="Describe cómo ocurrió la molestia, en qué movimiento, etc."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-uady-orange-cta text-white font-bold py-2.5 rounded-lg text-sm hover:brightness-110 transition-all duration-200 active:scale-95"
              >
                Enviar Reporte
              </button>
            </form>
          </div>
        </div>

        {/* History table */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-uady-blue flex items-center gap-2">
                📋 <span>Historial de Reportes</span>
              </h2>
              <div className="flex gap-1 text-xs">
                {(['todos', 'activo', 'recuperado'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFiltroEstado(f)}
                    className={`px-3 py-1 rounded-full font-semibold capitalize transition-colors ${
                      filtroEstado === f
                        ? 'bg-uady-blue text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {historialFiltrado.map((r) => (
                <div
                  key={r.id}
                  className={`border rounded-xl p-4 transition-all ${
                    r.estado === 'activo'
                      ? 'border-uady-orange-cta/20 bg-orange-50/40'
                      : 'border-emerald-200 bg-emerald-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-bold text-uady-blue text-sm">{r.nombre}</p>
                      <p className="text-xs text-gray-500">{r.zona} · {r.fecha}</p>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        r.estado === 'activo'
                          ? 'bg-uady-orange-cta/15 text-uady-orange-cta'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {r.estado === 'activo' ? '🔴 Activo' : '✅ Recuperado'}
                    </span>
                  </div>
                  <PainIndicator nivel={r.nivelDolor} />
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">{r.descripcion}</p>
                </div>
              ))}
              {historialFiltrado.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8">
                  No hay reportes con este filtro.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
