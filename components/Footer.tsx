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
    <footer className="bg-uady-blue text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🏐</span>
            <h3 className="text-uady-gold font-black text-lg uppercase tracking-wide">
              Voleibol UADY
            </h3>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            Plataforma integral de gestión para las Selecciones de Voleibol de la
            Universidad Autónoma de Yucatán, sustentada en tres pilares:
            Metodológico, Pedagógico y Tecnológico.
          </p>
          <p className="text-uady-gold text-sm mt-3 italic font-medium">
            &ldquo;Luz, Ciencia y Verdad&rdquo;
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-uady-gold font-bold mb-4 uppercase text-sm tracking-wider">
            Módulos
          </h4>
          <ul className="space-y-2">
            {modules.map((m) => (
              <li key={m.href}>
                <Link
                  href={m.href}
                  className="text-sm text-gray-300 hover:text-uady-gold transition-colors duration-200 flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-uady-gold inline-block" />
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-uady-gold font-bold mb-4 uppercase text-sm tracking-wider">
            Contacto
          </h4>
          <address className="not-italic text-sm text-gray-300 space-y-1.5">
            <p>Universidad Autónoma de Yucatán</p>
            <p>Mérida, Yucatán, México</p>
            <p className="pt-2 text-gray-400">Dirección de Deporte Universitario</p>
            <p className="text-gray-400">Plan Rector de Selecciones</p>
          </address>
        </div>
      </div>

      <div className="border-t border-white/10 py-4">
        <p className="text-center text-xs text-gray-500">
          © {year} UADY · Dirección de Deporte Universitario · Plan Rector Voleibol
        </p>
      </div>
    </footer>
  )
}
