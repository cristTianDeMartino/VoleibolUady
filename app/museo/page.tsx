import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import MuseoMagazine from '@/components/MuseoMagazine'

export const metadata = { title: 'Museo de Logros — Sistema de Voleibol' }

const RAMAS = ['Femenil', 'Varonil', 'Ambas'] as const

function filtroHref(anio: string | null, rama: string | null) {
  const params = new URLSearchParams()
  if (anio) params.set('anio', anio)
  if (rama) params.set('rama', rama)
  const qs = params.toString()
  return qs ? `/museo?${qs}` : '/museo'
}

function Pill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
        active
          ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]'
          : 'bg-white text-gray-600 border-gray-200 hover:border-uady-gold hover:text-uady-gold'
      }`}
    >
      {children}
    </Link>
  )
}

function Stat({ icono, valor, label }: { icono: string; valor: number; label: string }) {
  return (
    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl px-4 py-2 text-center">
      <p className="text-lg font-black text-white">{icono} {valor}</p>
      <p className="text-[10px] uppercase tracking-wide text-gray-300 font-semibold">{label}</p>
    </div>
  )
}

export default async function MuseoPage({
  searchParams,
}: {
  searchParams: Promise<{ anio?: string; rama?: string }>
}) {
  const { anio, rama } = await searchParams
  const anioNum = anio && /^\d{4}$/.test(anio) ? Number(anio) : null
  const ramaSel = rama && RAMAS.includes(rama as (typeof RAMAS)[number]) ? rama : null

  const [logros, aniosDisponibles, porRama, galeria] = await Promise.all([
    prisma.logro.findMany({
      where: {
        ...(anioNum ? { anio: anioNum } : {}),
        ...(ramaSel ? { rama: ramaSel } : {}),
      },
      include: { imagenes: { orderBy: { orden: 'asc' } } },
      orderBy: [{ anio: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.logro.findMany({ select: { anio: true }, distinct: ['anio'], orderBy: { anio: 'desc' } }),
    prisma.logro.groupBy({ by: ['rama'], _count: true }),
    prisma.logroImagen.findMany({ orderBy: [{ logroId: 'asc' }, { orden: 'asc' }] }),
  ])

  const total = porRama.reduce((s, r) => s + r._count, 0)
  const cuenta = (r: string) => porRama.find((g) => g.rama === r)?._count ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero con parallax (bg-fixed) */}
      <div
        className="h-[400px] bg-cover bg-center bg-fixed relative flex flex-col items-center justify-center text-center px-4"
        style={{ backgroundImage: "url('/images/jaguaresUnidos.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1628]/85 to-[#1B2A4A]/90" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.3em] text-uady-gold font-bold">Selección UADY Voleibol</p>
          <h1 className="mt-2 text-5xl sm:text-7xl font-black text-white">NUESTRA HISTORIA</h1>
          <p className="mt-3 text-gray-300">Cada logro, cada punto, cada victoria</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Stat icono="🏆" valor={total} label="Logros" />
            <Stat icono="📅" valor={aniosDisponibles.length} label="Años" />
            <Stat icono="♀" valor={cuenta('Femenil')} label="Femenil" />
            <Stat icono="♂" valor={cuenta('Varonil')} label="Varonil" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 space-y-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-gray-400 w-12">Año</span>
            <Pill href={filtroHref(null, ramaSel)} active={!anioNum}>Todos</Pill>
            {aniosDisponibles.map(({ anio: a }) => (
              <Pill key={a} href={filtroHref(String(a), ramaSel)} active={anioNum === a}>{a}</Pill>
            ))}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-gray-400 w-12">Rama</span>
            <Pill href={filtroHref(anioNum ? String(anioNum) : null, null)} active={!ramaSel}>Todos</Pill>
            {RAMAS.map((r) => (
              <Pill key={r} href={filtroHref(anioNum ? String(anioNum) : null, r)} active={ramaSel === r}>{r}</Pill>
            ))}
          </div>
        </div>
      </div>

      {/* Grid revista */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        {logros.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-16">
            No hay logros registrados{anioNum || ramaSel ? ' con estos filtros' : ' todavía'}.
          </p>
        ) : (
          <MuseoMagazine logros={logros} />
        )}
      </div>

      {/* Galería global — masonry con CSS columns */}
      {galeria.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 pb-16">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-uady-gold font-bold">Momentos</p>
            <h2 className="mt-1 text-3xl font-black text-[#1B2A4A]">GALERÍA DE MOMENTOS</h2>
            <div className="mt-3 mx-auto w-[60px] h-[3px] bg-uady-gold rounded-full" />
          </div>
          <div className="columns-2 sm:columns-3 gap-3">
            {galeria.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- masonry de alturas variables
              <img
                key={img.id}
                src={img.url}
                alt=""
                loading="lazy"
                className={`w-full mb-3 rounded-xl break-inside-avoid border border-gray-200 object-cover ${
                  i % 3 === 0 ? 'aspect-[3/4]' : i % 3 === 1 ? 'aspect-square' : 'aspect-[4/3]'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
