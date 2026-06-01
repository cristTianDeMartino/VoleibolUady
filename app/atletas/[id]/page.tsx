import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import EditFotoAtleta from '@/components/EditFotoAtleta'

const positionColors: Record<string, string> = {
  Libero: 'bg-uady-gold text-uady-blue',
  Colocador: 'bg-uady-blue text-white',
  Opuesta: 'bg-uady-orange-cta text-white',
  Central: 'bg-emerald-600 text-white',
  Banda: 'bg-purple-600 text-white',
}

const fmtFecha = (d: Date | string | null) =>
  d
    ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

export default async function AtletaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [session, atleta] = await Promise.all([
    getSession(),
    prisma.atleta.findUnique({
      where: { id },
      include: { lesiones: { orderBy: { fechaConsulta: 'desc' } } },
    }),
  ])

  if (!atleta) notFound()

  const canViewPrivate = session?.rol === 'ADMIN' || session?.id === atleta.id

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Back button */}
      <Link
        href="/atletas"
        className="inline-flex items-center gap-1.5 text-uady-blue hover:text-uady-gold text-sm font-semibold mb-6 transition-colors"
      >
        ← Regresar al Roster
      </Link>

      {/* Header card */}
      <div className="bg-uady-blue rounded-2xl p-6 text-white flex flex-col sm:flex-row gap-6 items-center sm:items-start mb-6">
        {/* Photo — editable by admin on hover */}
        <EditFotoAtleta
          atletaId={atleta.id}
          fotoActualUrl={atleta.fotoUrl}
          isAdmin={session?.rol === 'ADMIN'}
        />

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                positionColors[atleta.posicion] ?? 'bg-white/20 text-white'
              }`}
            >
              {atleta.posicion}
            </span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                atleta.rama === 'Varonil'
                  ? 'bg-blue-900/60 text-blue-200'
                  : 'bg-pink-900/60 text-pink-200'
              }`}
            >
              {atleta.rama === 'Varonil' ? '♂' : '♀'} {atleta.rama}
            </span>
            {atleta.rol === 'ADMIN' && (
              <span className="bg-uady-gold text-uady-blue text-xs font-bold px-3 py-1 rounded-full">
                Admin
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black leading-tight">
            {atleta.nombre} {atleta.apellidos}
          </h1>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-blue-200 justify-center sm:justify-start">
            <span>🎓 {atleta.facultad}</span>
            <span>📚 Semestre {atleta.semestre}</span>
          </div>
          <p className="text-xs text-blue-300 mt-1">
            Director/a: {atleta.directorFacultad}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Public section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-black text-uady-blue mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-uady-gold rounded-full" />
            Información Académica
          </h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Facultad</dt>
              <dd className="text-gray-700 mt-0.5">{atleta.facultad}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Semestre</dt>
              <dd className="text-gray-700 mt-0.5">{atleta.semestre}°</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Director(a)</dt>
              <dd className="text-gray-700 mt-0.5">{atleta.directorFacultad}</dd>
            </div>
          </dl>
        </div>

        {/* Private: Contact */}
        {canViewPrivate ? (
          <div className="bg-white rounded-xl border border-uady-blue/10 shadow-sm p-5">
            <h2 className="font-black text-uady-blue mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-uady-blue rounded-full" />
              Contacto
              <span className="text-xs font-normal text-gray-400 ml-1">🔒 Privado</span>
            </h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Teléfono Personal</dt>
                <dd className="text-gray-700 mt-0.5">📱 {atleta.telefonoPersonal}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Teléfono Tutor / Familiar</dt>
                <dd className="text-gray-700 mt-0.5">📞 {atleta.telefonoTutor}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-5 flex items-center justify-center text-center">
            <div>
              <p className="text-2xl mb-2">🔒</p>
              <p className="text-sm text-gray-400 font-medium">Sección Privada</p>
              <p className="text-xs text-gray-300 mt-1">Inicia sesión para ver</p>
            </div>
          </div>
        )}

        {/* Private: Medical */}
        {canViewPrivate && (
          <div className="bg-white rounded-xl border border-uady-orange-cta/10 shadow-sm p-5">
            <h2 className="font-black text-uady-blue mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-uady-orange-cta rounded-full" />
              Datos Médicos
              <span className="text-xs font-normal text-gray-400 ml-1">🔒 Privado</span>
            </h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-gray-400 font-semibold uppercase tracking-wider">NSS</dt>
                <dd className="text-gray-700 mt-0.5 font-mono">{atleta.nss}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Seguro Privado</dt>
                <dd className="text-gray-700 mt-0.5">
                  {atleta.seguroPrivado ?? <span className="text-gray-400 italic">No especificado</span>}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {/* Historial Médico de Lesiones — solo lesiones dadas de alta.
            Protegido: visible para ADMIN o el propio jugador (canViewPrivate). */}
        {canViewPrivate && (() => {
          const altas = atleta.lesiones.filter((l) => l.estatus === 'Alta')
          return (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 md:col-span-2">
              <h2 className="font-black text-uady-blue mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-uady-gold rounded-full" />
                Historial Médico de Lesiones
                <span className="text-xs font-normal text-gray-400 ml-1">🔒 Privado</span>
                <span className="ml-auto bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full">
                  {altas.length}
                </span>
              </h2>

              {altas.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  Sin lesiones dadas de alta ✅
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                        <th className="text-left pb-2 font-semibold">Fecha de Consulta</th>
                        <th className="text-left pb-2 font-semibold">Diagnóstico</th>
                        <th className="text-left pb-2 font-semibold">Fecha de Alta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {altas.map((l) => (
                        <tr key={l.id}>
                          <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                            {fmtFecha(l.fechaConsulta)}
                          </td>
                          <td className="py-3 pr-4 font-medium text-uady-blue">{l.diagnostico}</td>
                          <td className="py-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 text-emerald-700">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              {fmtFecha(l.fechaAlta)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })()}
      </div>

      {/* Admin actions */}
      {session?.rol === 'ADMIN' && (
        <div className="mt-6 flex gap-3 flex-wrap">
          <Link
            href="/atletas/agregar"
            className="text-sm font-semibold text-uady-blue border border-uady-blue/20 px-4 py-2 rounded-lg hover:bg-uady-blue hover:text-white transition-all"
          >
            + Agregar otra atleta
          </Link>
        </div>
      )}
    </div>
  )
}
