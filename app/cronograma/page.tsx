type EventType = 'entrenamiento' | 'partido' | 'torneo' | 'reunion'

interface Evento {
  id: number
  titulo: string
  fecha: string
  horaInicio: string
  horaFin: string
  tipo: EventType
  lugar: string
  descripcion?: string
}

const tipoConfig: Record<EventType, { label: string; color: string; dot: string }> = {
  entrenamiento: { label: 'Entrenamiento', color: 'bg-uady-blue/10 text-uady-blue border-uady-blue/20', dot: 'bg-uady-blue' },
  partido: { label: 'Partido', color: 'bg-uady-orange-cta/10 text-uady-orange-cta border-uady-orange-cta/20', dot: 'bg-uady-orange-cta' },
  torneo: { label: 'Torneo', color: 'bg-uady-gold/20 text-amber-700 border-uady-gold/30', dot: 'bg-uady-gold' },
  reunion: { label: 'Reunión', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
}

const mockEventos: Evento[] = [
  { id: 1, titulo: 'Entrenamiento Técnico — Saque y Recepción', fecha: '2026-06-02', horaInicio: '07:00', horaFin: '09:30', tipo: 'entrenamiento', lugar: 'Gimnasio Universitario', descripcion: 'Trabajo en pares. Enfoque en posición de pies.' },
  { id: 2, titulo: 'Sesión de Gimnasio', fecha: '2026-06-03', horaInicio: '06:30', horaFin: '08:00', tipo: 'entrenamiento', lugar: 'Sala de Pesas UADY', descripcion: 'Fuerza de tren inferior.' },
  { id: 3, titulo: 'Partido Amistoso vs. ITESM', fecha: '2026-06-05', horaInicio: '16:00', horaFin: '19:00', tipo: 'partido', lugar: 'Gimnasio Universitario', descripcion: '3 sets de práctica, arbitraje interno.' },
  { id: 4, titulo: 'Entrenamiento Táctico — Sistemas de Ataque', fecha: '2026-06-07', horaInicio: '07:00', horaFin: '09:30', tipo: 'entrenamiento', lugar: 'Gimnasio Universitario' },
  { id: 5, titulo: 'Reunión con Cuerpo Técnico', fecha: '2026-06-09', horaInicio: '10:00', horaFin: '11:30', tipo: 'reunion', lugar: 'Sala de Juntas — Deporte Universitario', descripcion: 'Análisis de rendimiento del mes.' },
  { id: 6, titulo: 'Torneo Interuniversitario — Fase 1', fecha: '2026-06-12', horaInicio: '09:00', horaFin: '18:00', tipo: 'torneo', lugar: 'Unidad Deportiva Kukulkán', descripcion: 'UADY, ITM, UNAM Campus Mérida, Tec Mérida.' },
  { id: 7, titulo: 'Entrenamiento de Recuperación', fecha: '2026-06-14', horaInicio: '08:00', horaFin: '09:30', tipo: 'entrenamiento', lugar: 'Gimnasio Universitario', descripcion: 'Trabajo físico leve y estiramiento.' },
  { id: 8, titulo: 'Torneo Interuniversitario — Fase 2 / Final', fecha: '2026-06-19', horaInicio: '09:00', horaFin: '20:00', tipo: 'torneo', lugar: 'Unidad Deportiva Kukulkán' },
  { id: 9, titulo: 'Entrenamiento Pre-Temporada', fecha: '2026-06-22', horaInicio: '07:00', horaFin: '10:00', tipo: 'entrenamiento', lugar: 'Gimnasio Universitario' },
  { id: 10, titulo: 'Partido vs. ANAHUAC Mayab', fecha: '2026-06-26', horaInicio: '17:00', horaFin: '20:00', tipo: 'partido', lugar: 'Gimnasio Universidad Anáhuac', descripcion: 'Partido oficial de preparación.' },
]

function getDayOfWeek(dateStr: string): string {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const d = new Date(dateStr + 'T12:00:00')
  return days[d.getDay()]
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.getDate().toString()
}

export default function CronogramaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-7 bg-uady-gold rounded-full" />
            <h1 className="text-3xl font-black text-uady-blue">Cronograma</h1>
          </div>
          <p className="text-gray-500 text-sm ml-3">Junio 2026 · {mockEventos.length} eventos programados</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-uady-orange-cta text-white px-4 py-2 rounded-lg text-sm font-semibold opacity-50 cursor-not-allowed" disabled>
            + Agregar Evento
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6">
        {(Object.keys(tipoConfig) as EventType[]).map((tipo) => (
          <div key={tipo} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`w-2.5 h-2.5 rounded-full ${tipoConfig[tipo].dot}`} />
            {tipoConfig[tipo].label}
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-14 top-0 bottom-0 w-px bg-gray-200 hidden md:block" />

        <div className="space-y-4">
          {mockEventos.map((evento) => {
            const cfg = tipoConfig[evento.tipo]
            return (
              <div key={evento.id} className="flex gap-4 group">
                {/* Date column */}
                <div className="hidden md:flex flex-col items-center justify-start pt-3 w-12 flex-shrink-0 text-right pr-2">
                  <span className="text-xs font-bold text-gray-400 uppercase">
                    {getDayOfWeek(evento.fecha)}
                  </span>
                  <span className="text-2xl font-black text-uady-blue leading-none">
                    {formatDate(evento.fecha)}
                  </span>
                </div>

                {/* Dot on timeline */}
                <div className="hidden md:flex flex-col items-center flex-shrink-0 pt-4 z-10">
                  <div className={`w-3 h-3 rounded-full border-2 border-white ${cfg.dot} shadow-sm`} />
                </div>

                {/* Card */}
                <div
                  className={`flex-1 bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border-l-4 ${
                    evento.tipo === 'entrenamiento' ? 'border-l-uady-blue' :
                    evento.tipo === 'partido' ? 'border-l-uady-orange-cta' :
                    evento.tipo === 'torneo' ? 'border-l-uady-gold' : 'border-l-emerald-500'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="flex-1">
                      {/* Mobile date */}
                      <div className="flex items-center gap-2 mb-1 md:hidden">
                        <span className="text-xs font-semibold text-gray-400">
                          {getDayOfWeek(evento.fecha)} {formatDate(evento.fecha)} Jun
                        </span>
                      </div>
                      <h3 className="font-bold text-uady-blue text-sm leading-snug">{evento.titulo}</h3>
                      {evento.descripcion && (
                        <p className="text-xs text-gray-400 mt-1">{evento.descripcion}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          🕐 {evento.horaInicio} – {evento.horaFin}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          📍 {evento.lugar}
                        </span>
                      </div>
                    </div>
                    <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-gray-400 mt-8">
        Vista de lista. Próximamente: vista de calendario mensual y semanal.
      </p>
    </div>
  )
}
