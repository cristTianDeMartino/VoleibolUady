const positionColors: Record<string, string> = {
  Libero: 'bg-uady-gold text-uady-blue',
  Armadora: 'bg-uady-blue text-white',
  Opuesta: 'bg-uady-orange-cta text-white',
  Central: 'bg-emerald-600 text-white',
  Punta: 'bg-purple-600 text-white',
  
}


const mockAthletes = [
  { id: 1, nombre: 'Ana', apellido: 'García Pérez', numero: 12, posicion: 'Libero', carrera: 'Medicina', semestre: 6 },
  { id: 2, nombre: 'Laura', apellido: 'Martínez Cen', numero: 7, posicion: 'Armadora', carrera: 'Psicología', semestre: 4 },
  { id: 3, nombre: 'Sofía', apellido: 'López Uc', numero: 14, posicion: 'Opuesta', carrera: 'Derecho', semestre: 8 },
  { id: 4, nombre: 'María', apellido: 'Hernández Dzul', numero: 3, posicion: 'Central', carrera: 'Ingeniería Civil', semestre: 5 },
  { id: 5, nombre: 'Daniela', apellido: 'Torres Cahun', numero: 9, posicion: 'Puntal', carrera: 'Contaduría', semestre: 3 },
  { id: 6, nombre: 'Valentina', apellido: 'Ramírez Balam', numero: 11, posicion: 'Puntal', carrera: 'Arquitectura', semestre: 7 },
  { id: 7, nombre: 'Isabella', apellido: 'Pérez Canul', numero: 6, posicion: 'Central', carrera: 'Nutrición', semestre: 2 },
  { id: 8, nombre: 'Camila', apellido: 'Vargas May', numero: 2, posicion: 'Armadora', carrera: 'Enfermería', semestre: 5 },
  { id: 9, nombre: 'Fernanda', apellido: 'Castillo Coba', numero: 15, posicion: 'Libero', carrera: 'Medicina', semestre: 9 },
  { id: 10, nombre: 'Andrea', apellido: 'Morales Chi', numero: 8, posicion: 'Opuesta', carrera: 'Derecho', semestre: 6 },
  { id: 11, nombre: 'Paola', apellido: 'Jiménez Tzab', numero: 5, posicion: 'Puntal', carrera: 'Psicología', semestre: 4 },
  { id: 12, nombre: 'Renata', apellido: 'Cruz Poot', numero: 4, posicion: 'Central', carrera: 'Ingeniería Civil', semestre: 3 },
]

export default function AtletasPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-7 bg-uady-gold rounded-full" />
            <h1 className="text-3xl font-black text-uady-blue">Roster de Atletas</h1>
          </div>
          <p className="text-gray-500 text-sm ml-3">
            {mockAthletes.length} atletas activas · Temporada 2025–2026
          </p>
        </div>

        {/* Search placeholder */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar atleta..."
            disabled
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-400 bg-gray-50 w-48 cursor-not-allowed"
          />
          <select
            disabled
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
          >
            <option>Todas las posiciones</option>
          </select>
          <button
            disabled
            className="bg-uady-orange-cta text-white px-4 py-2 rounded-lg text-sm font-semibold opacity-50 cursor-not-allowed"
          >
            + Agregar
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {mockAthletes.map((a) => (
          <div
            key={a.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group cursor-pointer"
          >
            {/* Photo placeholder */}
            <div className="bg-gradient-to-br from-uady-blue to-blue-800 h-32 flex items-center justify-center relative">
              <span className="text-5xl">🏐</span>
              <div className="absolute top-2 right-2 bg-white/90 rounded-full w-7 h-7 flex items-center justify-center">
                <span className="text-uady-blue font-black text-xs">#{a.numero}</span>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>

            {/* Info */}
            <div className="p-3">
              <p className="font-black text-uady-blue text-sm leading-tight">{a.nombre}</p>
              <p className="text-gray-500 text-xs truncate">{a.apellido}</p>

              <div className="mt-2">
                <span
                  className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${
                    positionColors[a.posicion] || 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {a.posicion}
                </span>
              </div>

              <div className="mt-2 pt-2 border-t border-gray-50">
                <p className="text-xs text-gray-400 truncate">📚 {a.carrera}</p>
                <p className="text-xs text-gray-400">Sem. {a.semestre}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 bg-white rounded-xl border border-gray-100 p-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Posiciones
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(positionColors).map(([pos, cls]) => (
            <span key={pos} className={`text-xs font-bold px-2.5 py-1 rounded-full ${cls}`}>
              {pos}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
