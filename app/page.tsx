import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowRight } from 'lucide-react'
import HeroCarousel from '@/components/HeroCarousel'

const pillars = [
  {
    icon: '📋',
    title: 'Metodológico',
    description:
      'Estructura sistemática de planificación deportiva enfocada en la planeación, ejecución y evaluación de los modelos del desarrollo de los equipos.',
    color: 'bg-accent-green',
  },
  {
    icon: '🎓',
    title: 'Pedagógico',
    description:
      'Desarrollo integral del atleta: formación técnica, táctica y humana en equilibrio con la excelencia deportiva.',
    color: 'bg-primary-blue',
  },
  {
    icon: '💻',
    title: 'Tecnológico',
    description:
      'Herramientas digitales para el monitoreo de rendimiento, control de lesiones, análisis de videos y gestión de datos del equipo.',
    color: 'bg-accent-green',
  },
]

const quickAccess = [
  { href: '/atletas', icon: '🏃‍♀️', label: 'Roster', sub: '12 atletas activas', bg: 'bg-primary-blue' },
  { href: '/cronograma', icon: '📅', label: 'Cronograma', sub: 'Próx. evento: Martes', bg: 'bg-accent-green' },
  { href: '/trabajo-fisico', icon: '💪', label: 'Físico', sub: 'Duela + Gimnasio', bg: 'bg-primary-blue' },
  { href: '/psicologia', icon: '🧠', label: 'Psicología', sub: '8 videos cargados', bg: 'bg-accent-green' },
  { href: '/lesiones', icon: '🩺', label: 'Lesiones', sub: '4 reportes activos', bg: 'bg-accent-green' },
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
      {/* Hero with Carousel */}
      <section className="relative bg-primary-blue text-white overflow-hidden">
        <Suspense fallback={<div className="h-96 bg-primary-blue" />}>
          <HeroCarousel />
        </Suspense>

        {/* Content overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-blue via-primary-blue/80 to-transparent flex items-center">
          <div className="max-w-5xl mx-auto px-4 py-16">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-accent-green/40 text-accent-green text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-accent-green rounded-full" />
              Plan Rector 2026–2027
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">
              Selecciones de Voleibol
              <span className="block text-accent-green">Club de Voleibol</span>
            </h1>
            <p className="text-lg text-white/80 max-w-2xl leading-relaxed mb-8">
              Plataforma integral de gestión del voleibol centralizada en la gestión de atletas en entrenamiento físico, técnico-táctico y de las ciencias aplicadas al deporte.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/atletas"
                className="bg-accent-green text-primary-blue font-bold px-6 py-3 rounded-lg hover:brightness-110 transition-all duration-200 text-sm"
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
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-accent-green py-5 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-primary-blue font-black text-2xl leading-none">{s.value}</p>
                <p className="text-primary-blue/75 text-xs font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-14">
        {/* Three Pillars */}
        <section>
          <h2 className="text-2xl font-black text-primary-blue mb-1">
            Los Tres Pilares del Plan Rector
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            El modelo de desarrollo deportivo del equipo de voleibol se sustenta en tres ejes fundamentales.
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
          <h2 className="text-2xl font-black text-primary-blue mb-1">Acceso Rápido</h2>
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
                <p className="font-bold text-primary-blue text-sm">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* About banner — CTA */}
        <section className="bg-primary-blue rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <h2 className="text-xl font-black text-accent-green mb-3">Sobre el Plan Rector</h2>
              <p className="text-sm text-white/80 leading-7 text-justify">
                El desarrollo de las selecciones de voleibol del club se ha sustentado en una visión integral que combina la planeación deportiva, el trabajo multidisciplinario, la captación de talento, la preparación física especializada y el seguimiento académico y humano, con una profunda adaptación a la realidad socioeconómica de nuestro entorno.

                Gracias a este modelo de trabajo, los equipos representativos de voleibol del club han logrado consolidarse entre los más competitivos de la región y mantenerse como protagonistas en el ámbito nacional.
              </p>

              <div className="mt-6">
                <Link
                  href="/plan-rector"
                  className="inline-flex items-center gap-2 bg-accent-green hover:brightness-110 transition-all duration-200 text-primary-blue font-bold text-sm px-5 py-3 rounded-lg shadow-md shadow-black/20"
                >
                  Leer más sobre el Plan Rector
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="flex-shrink-0 text-center">
              <div className="bg-accent-green/20 border-2 border-accent-green rounded-2xl p-6">
                <p className="text-6xl mb-2">🏆</p>
                <p className="text-accent-green font-bold text-sm">Excelencia</p>
                <p className="text-white/60 text-xs">Deportiva</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
