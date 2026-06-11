'use client'

import { useState } from 'react'

interface Ejercicio {
  id: number
  nombre: string
  descripcion: string
  series?: number
  repeticiones?: string
  duracion?: string
  categoria: string
  icono: string
}

const ejerciciosDuela: Ejercicio[] = [
  { id: 1, nombre: 'Saque flotante', descripcion: 'Trabajo de zona de saque, enfoque en ángulo y profundidad. Pausa al contacto.', series: 3, repeticiones: '15 saques', categoria: 'Técnica Individual', icono: '🏐' },
  { id: 2, nombre: 'Recepción en W', descripcion: 'Sistema de recepción en formación W con rotaciones. Pelota desde cañón o lanzador.', series: 4, repeticiones: '20 contactos', categoria: 'Sistema de Equipo', icono: '🔄' },
  { id: 3, nombre: 'Pase de armadora + ataque', descripcion: 'Combinaciones de pase rápido hacia posición 4-2. Trabajo de coordinación armadora-rematadora.', series: 3, repeticiones: '12 combinaciones', categoria: 'Combinaciones', icono: '⚡' },
  { id: 4, nombre: 'Bloqueo individual 1×1', descripcion: 'Trabajo de timing de salto y posición de manos. Contra rematadora con tossing.', series: 4, repeticiones: '10 bloqueos', categoria: 'Defensa', icono: '🛡️' },
  { id: 5, nombre: 'Defensa de segunda línea', descripcion: 'Libero + zagueras: lectura de remate y posición de defensa. Variantes de caída.', series: 3, duracion: '8 min/variante', categoria: 'Defensa', icono: '🎯' },
  { id: 6, nombre: 'Juego libre 6×6', descripcion: 'Sets de 25 puntos con rotaciones completas. Arbitraje interno. Énfasis en comunicación.', series: 2, repeticiones: '2 sets a 25', categoria: 'Juego Libre', icono: '🏟️' },
]

const ejerciciosGimnasio: Ejercicio[] = [
  { id: 1, nombre: 'Sentadilla trasera', descripcion: 'Trabajo de fuerza de tren inferior. Control de la bajada en 3 segundos.', series: 4, repeticiones: '6-8 reps al 75% 1RM', categoria: 'Tren Inferior', icono: '🦵' },
  { id: 2, nombre: 'Press de hombro', descripcion: 'Fortalecimiento del manguito rotador y deltoides. Fundamental para prevención de lesiones.', series: 3, repeticiones: '10-12 reps', categoria: 'Tren Superior', icono: '💪' },
  { id: 3, nombre: 'Peso muerto rumano', descripcion: 'Activación de isquiotibiales y glúteos. Control postural en toda la amplitud.', series: 3, repeticiones: '8-10 reps', categoria: 'Tren Inferior', icono: '⬆️' },
  { id: 4, nombre: 'Saltos en cajón (Box Jumps)', descripcion: 'Desarrollo de potencia explosiva. Aterrizaje amortiguado, bajada caminando.', series: 5, repeticiones: '6 saltos', categoria: 'Potencia / Pliométrico', icono: '🚀' },
  { id: 5, nombre: 'Jalón al pecho', descripcion: 'Fortalecimiento de dorsal y bíceps. Postura recta, escápulas activas.', series: 3, repeticiones: '10-12 reps', categoria: 'Tren Superior', icono: '🏋️' },
  { id: 6, nombre: 'Plancha + rotación', descripcion: 'Core antirrotacional. Variantes: plancha lateral, plancha con extensión de brazo.', series: 3, duracion: '30 s/variante', categoria: 'Core', icono: '🔩' },
  { id: 7, nombre: 'Hip Thrust', descripcion: 'Activación de glúteo mayor. Clave para la potencia de salto vertical.', series: 4, repeticiones: '12-15 reps', categoria: 'Tren Inferior', icono: '🦵' },
]

export default function WorkoutTabs() {
  const [activeTab, setActiveTab] = useState<'duela' | 'gimnasio'>('duela')
  const ejercicios = activeTab === 'duela' ? ejerciciosDuela : ejerciciosGimnasio

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('duela')}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
            activeTab === 'duela'
              ? 'bg-uady-blue text-white shadow-sm'
              : 'text-gray-500 hover:text-uady-blue'
          }`}
        >
          🏐 Ejercicios en Duela
        </button>
        <button
          onClick={() => setActiveTab('gimnasio')}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
            activeTab === 'gimnasio'
              ? 'bg-uady-blue text-white shadow-sm'
              : 'text-gray-500 hover:text-uady-blue'
          }`}
        >
          🏋️ Gimnasio y Pesas
        </button>
      </div>

      {/* Context banner */}
      <div
        className={`rounded-xl p-4 mb-6 flex items-center gap-4 ${
          activeTab === 'duela'
            ? 'bg-uady-blue/5 border border-uady-blue/10'
            : 'bg-uady-gold/10 border border-uady-gold/20'
        }`}
      >
        <span className="text-3xl">{activeTab === 'duela' ? '🏐' : '🏋️'}</span>
        <div>
          <p className={`font-bold text-sm ${activeTab === 'duela' ? 'text-uady-blue' : 'text-amber-700'}`}>
            {activeTab === 'duela' ? 'Sesión en Duela' : 'Sesión de Gimnasio y Pesas'}
          </p>
          <p className="text-xs text-gray-500">
            {activeTab === 'duela'
              ? `${ejerciciosDuela.length} ejercicios · Trabajo técnico-táctico en cancha`
              : `${ejerciciosGimnasio.length} ejercicios · Desarrollo de fuerza y potencia física`}
          </p>
        </div>
      </div>

      {/* Exercises grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ejercicios.map((ej) => (
          <div
            key={ej.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-5"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                  activeTab === 'duela' ? 'bg-uady-blue/10' : 'bg-uady-gold/10'
                }`}
              >
                {ej.icono}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-uady-blue text-sm leading-snug">{ej.nombre}</h3>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      activeTab === 'duela'
                        ? 'bg-uady-blue/10 text-uady-blue'
                        : 'bg-uady-gold/20 text-amber-700'
                    }`}
                  >
                    {ej.categoria}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{ej.descripcion}</p>

                <div className="flex gap-4 mt-3">
                  {ej.series && (
                    <div className="text-center">
                      <p className="text-lg font-black text-uady-blue leading-none">{ej.series}</p>
                      <p className="text-xs text-gray-400">Series</p>
                    </div>
                  )}
                  {ej.repeticiones && (
                    <div>
                      <p className="text-xs font-bold text-gray-700">{ej.repeticiones}</p>
                      <p className="text-xs text-gray-400">Repeticiones</p>
                    </div>
                  )}
                  {ej.duracion && (
                    <div>
                      <p className="text-xs font-bold text-gray-700">{ej.duracion}</p>
                      <p className="text-xs text-gray-400">Duración</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add button placeholder */}
      <div className="mt-6 text-center">
        <button
          disabled
          className="bg-uady-gold text-uady-blue px-6 py-3 rounded-lg font-semibold text-sm opacity-50 cursor-not-allowed"
        >
          + Agregar Ejercicio
        </button>
        <p className="text-xs text-gray-400 mt-2">Funcionalidad disponible próximamente</p>
      </div>
    </div>
  )
}
