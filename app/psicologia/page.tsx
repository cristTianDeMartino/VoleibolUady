interface VideoCard {
  id: number
  titulo: string
  descripcion: string
  tipo: string
  duracion: string
  fecha: string
  thumbnail: string
}

const tipoColors: Record<string, string> = {
  Técnica: 'bg-uady-blue/10 text-uady-blue',
  Mental: 'bg-purple-100 text-purple-700',
  Motivacional: 'bg-uady-gold/20 text-amber-700',
  Grupal: 'bg-emerald-100 text-emerald-700',
}

const mockVideos: VideoCard[] = [
  { id: 1, titulo: 'Manejo de la Presión en Competencia', descripcion: 'Técnicas de respiración y enfoque mental para momentos de alta tensión en el marcador.', tipo: 'Mental', duracion: '18:24', fecha: '2026-05-10', thumbnail: '🧘‍♀️' },
  { id: 2, titulo: 'Visualización Deportiva — Sesión 1', descripcion: 'Práctica de visualización del saque y recepción. Ejercicios guiados de imagen mental.', tipo: 'Técnica', duracion: '22:05', fecha: '2026-05-15', thumbnail: '👁️' },
  { id: 3, titulo: 'Cohesión de Equipo y Liderazgo', descripcion: 'Dinámica grupal sobre roles dentro del equipo. Comunicación asertiva y resolución de conflictos.', tipo: 'Grupal', duracion: '31:40', fecha: '2026-05-18', thumbnail: '🤝' },
  { id: 4, titulo: 'Rutina de Activación Pre-Partido', descripcion: 'Protocolo mental de 10 minutos antes del calentamiento: enfoque, activación y propósito.', tipo: 'Técnica', duracion: '10:30', fecha: '2026-05-20', thumbnail: '⚡' },
  { id: 5, titulo: 'Resiliencia: Cómo recuperarse de un error', descripcion: 'Estrategias cognitivas para superar errores en partido y mantener la concentración.', tipo: 'Mental', duracion: '25:12', fecha: '2026-05-22', thumbnail: '💪' },
  { id: 6, titulo: '¡Somos el equipo! — Video Motivacional', descripcion: 'Compilación de momentos destacados de la temporada con música motivacional.', tipo: 'Motivacional', duracion: '05:48', fecha: '2026-05-25', thumbnail: '🏆' },
  { id: 7, titulo: 'Control del Diálogo Interno', descripcion: 'Cómo identificar y transformar pensamientos negativos en el momento del partido.', tipo: 'Mental', duracion: '19:55', fecha: '2026-05-27', thumbnail: '💭' },
  { id: 8, titulo: 'Visualización — Técnica de Bloqueo', descripcion: 'Sesión enfocada en la anticipación visual y timing para el bloqueo.', tipo: 'Técnica', duracion: '15:20', fecha: '2026-05-29', thumbnail: '🛡️' },
]

export default function PsicologiaPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-7 bg-uady-gold rounded-full" />
            <h1 className="text-3xl font-black text-uady-blue">Espacio de Psicología</h1>
          </div>
          <p className="text-gray-500 text-sm ml-3">
            {mockVideos.length} sesiones · Desarrollo mental y emocional del atleta
          </p>
        </div>
        <button
          disabled
          className="bg-uady-gold text-uady-blue px-4 py-2 rounded-lg text-sm font-semibold opacity-50 cursor-not-allowed self-start md:self-auto"
        >
          + Subir Video
        </button>
      </div>

      {/* Filter tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button className="bg-uady-blue text-white text-xs font-bold px-3 py-1.5 rounded-full">
          Todos
        </button>
        {Object.keys(tipoColors).map((tipo) => (
          <button
            key={tipo}
            className={`text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:border-uady-blue hover:text-uady-blue transition-colors`}
          >
            {tipo}
          </button>
        ))}
      </div>

      {/* Video grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockVideos.map((video) => (
          <div
            key={video.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group cursor-pointer"
          >
            {/* Video thumbnail */}
            <div className="bg-uady-blue h-36 flex items-center justify-center relative overflow-hidden">
              <span className="text-5xl group-hover:scale-110 transition-transform duration-200">
                {video.thumbnail}
              </span>
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                <div className="w-12 h-12 bg-uady-gold rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-uady-blue ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              </div>
              {/* Duration badge */}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                {video.duracion}
              </div>
            </div>

            {/* Card body */}
            <div className="p-4">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tipoColors[video.tipo] || 'bg-gray-100 text-gray-500'}`}>
                {video.tipo}
              </span>
              <h3 className="font-bold text-uady-blue text-sm mt-2 leading-snug line-clamp-2">
                {video.titulo}
              </h3>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                {video.descripcion}
              </p>
              <p className="text-xs text-gray-300 mt-2">{video.fecha}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Upload zone placeholder */}
      <div className="mt-8 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
        <p className="text-3xl mb-2">📹</p>
        <p className="text-sm font-semibold text-gray-400">Arrastra y suelta videos aquí</p>
        <p className="text-xs text-gray-300 mt-1">
          Formatos soportados: MP4, MOV, AVI · Máximo 500MB
        </p>
        <button disabled className="mt-3 bg-gray-100 text-gray-400 px-4 py-2 rounded-lg text-xs font-semibold cursor-not-allowed">
          Seleccionar Archivo
        </button>
      </div>
    </div>
  )
}
