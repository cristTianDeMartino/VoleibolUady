import Link from 'next/link'

const modules = [
  { href: '/atletas', label: 'Roster de Atletas' },
  { href: '/cronograma', label: 'Cronograma' },
  { href: '/trabajo-fisico', label: 'Programa Físico' },
  { href: '/psicologia', label: 'Psicología Deportiva' },
  { href: '/lesiones', label: 'Reporte de Lesiones' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-primary-blue text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🏐</span>
            <h3 className="text-accent-green font-black text-lg uppercase tracking-wide">
              Sistema de Voleibol
            </h3>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            Plataforma integral de gestión para las selecciones de voleibol del club,
            sustentada en tres pilares: Metodológico, Pedagógico y Tecnológico.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-accent-green font-bold mb-4 uppercase text-sm tracking-wider">
            Módulos
          </h4>
          <ul className="space-y-2">
            {modules.map((m) => (
              <li key={m.href}>
                <Link
                  href={m.href}
                  className="text-sm text-white/70 hover:text-accent-green transition-colors duration-200 flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-accent-green inline-block" />
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-accent-green font-bold mb-4 uppercase text-sm tracking-wider">
            Contacto
          </h4>
          <address className="not-italic text-sm text-white/70 space-y-1.5">
            <p>Club de Voleibol</p>
            <p>Dirección de Deporte</p>
            <p className="pt-2 text-white/50">Plan Rector de Selecciones</p>
          </address>
        </div>
      </div>

      <div className="border-t border-white/10 py-4">
        <p className="text-center text-xs text-white/40">
          © {year} Club de Voleibol · Plan Rector · Sistema de Gestión Deportiva
        </p>
      </div>
    </footer>
  )
}
