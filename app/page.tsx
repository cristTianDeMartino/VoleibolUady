import Link from 'next/link'

const pillars = [
  {
    icon: '📋',
    title: 'Metodológico',
    description:
      'Estructura sistemática de planificación deportiva: periodización, microciclos y macrociclos orientados al alto rendimiento universitario.',
    color: 'bg-uady-blue',
  },
  {
    icon: '🎓',
    title: 'Pedagógico',
    description:
      'Desarrollo integral del atleta-estudiante: formación técnica, táctica y humana en equilibrio con la excelencia académica.',
    color: 'bg-uady-gold',
  },
  {
    icon: '💻',
    title: 'Tecnológico',
    description:
      'Herramientas digitales para el monitoreo de rendimiento, control de lesiones, análisis de videos y gestión de datos del equipo.',
    color: 'bg-uady-orange-cta',
  },
]

const quickAccess = [
  { href: '/atletas', icon: '🏃‍♀️', label: 'Roster', sub: '12 atletas activas', bg: 'bg-uady-blue' },
  { href: '/cronograma', icon: '📅', label: 'Cronograma', sub: 'Próx. evento: Martes', bg: 'bg-uady-gold' },
  { href: '/trabajo-fisico', icon: '💪', label: 'Físico', sub: 'Duela + Gimnasio', bg: 'bg-uady-blue' },
  { href: '/psicologia', icon: '🧠', label: 'Psicología', sub: '8 videos cargados', bg: 'bg-uady-gold' },
  { href: '/lesiones', icon: '🩺', label: 'Lesiones', sub: '4 reportes activos', bg: 'bg-uady-orange-cta' },
]

const stats = [
  { label: 'Atletas Activas', value: '12', icon: '🏐' },
  { label: 'Eventos este Mes', value: '8', icon: '📅' },
  { label: 'Ejercicios Cargados', value: '24', icon: '💪' },
  { label: 'Reportes de Lesión', value: '4', icon: '🩺' },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-uady-blue text-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-uady-gold/40 text-uady-gold text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-uady-gold rounded-full" />
            Plan Rector 2024–2026
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">
            Selecciones de Voleibol
            <span className="block text-uady-gold">UADY</span>
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl leading-relaxed mb-8">
            Plataforma integral de gestión deportiva universitaria. Centraliza el control de
            atletas, entrenamiento físico, psicología y salud del equipo bajo un solo sistema.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/atletas"
              className="bg-uady-gold text-uady-blue font-bold px-6 py-3 rounded-lg hover:brightness-110 transition-all duration-200 text-sm"
            >
              Ver Roster →
            </Link>
            <Link
              href="/cronograma"
              className="border border-white/30 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 text-sm"
            >
              Ver Cronograma
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-uady-gold py-5 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-uady-blue font-black text-2xl leading-none">{s.value}</p>
                <p className="text-uady-blue/75 text-xs font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-14">
        {/* Three Pillars */}
        <section>
          <h2 className="text-2xl font-black text-uady-blue mb-1">
            Los Tres Pilares del Plan Rector
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            El modelo de desarrollo deportivo de la UADY se sustenta en tres ejes fundamentales.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pillars.map((p) => (
              <div
                key={p.title}
                className={`${p.color} text-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow`}
              >
                <span className="text-3xl mb-3 block">{p.icon}</span>
                <h3 className="font-black text-lg mb-2">{p.title}</h3>
                <p className="text-sm opacity-90 leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Access */}
        <section>
          <h2 className="text-2xl font-black text-uady-blue mb-1">Acceso Rápido</h2>
          <p className="text-gray-500 text-sm mb-6">
            Navega directamente a cada módulo del sistema.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {quickAccess.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="bg-white border border-gray-100 rounded-xl p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div
                  className={`${item.bg} w-12 h-12 rounded-xl flex items-center justify-center text-2xl mx-auto mb-3 group-hover:scale-110 transition-transform`}
                >
                  {item.icon}
                </div>
                <p className="font-bold text-uady-blue text-sm">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* About banner */}
        <section className="bg-uady-blue rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <h2 className="text-xl font-black text-uady-gold mb-3">Sobre el Plan Rector</h2>
              <p className="text-sm text-blue-100 leading-relaxed">
                El Plan Rector de las Selecciones de Voleibol de la UADY es un documento vivo que guía
                el desarrollo deportivo institucional. Integra la gestión de recursos humanos, la
                planificación técnico-táctica, el seguimiento médico y el desarrollo psicológico de
                cada atleta universitaria.
              </p>
              <p className="text-sm text-blue-100 leading-relaxed mt-3">
                Esta plataforma digitaliza y centraliza todos los procesos para facilitar la toma de
                decisiones por parte del cuerpo técnico y la dirección deportiva.
              </p>
            </div>
            <div className="flex-shrink-0 text-center">
              <div className="bg-uady-gold/20 border-2 border-uady-gold rounded-2xl p-6">
                <p className="text-6xl mb-2">🏆</p>
                <p className="text-uady-gold font-bold text-sm">Excelencia</p>
                <p className="text-blue-200 text-xs">Deportiva Universitaria</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
