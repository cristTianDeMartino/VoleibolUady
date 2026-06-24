import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import EditFotoAtleta from '@/components/EditFotoAtleta'
import BotonEliminarAtleta from '@/components/BotonEliminarAtleta'
import { BotonEgresarAtleta, BotonReactivarAtleta } from '@/components/BotonEstadoAtleta'
import { CardDeportiva, CardContacto, CardMedica } from '@/components/AtletaPublicCards'
import { labelPosicion, type PosicionValue } from '@/lib/constants/posiciones'
import { ramaFromGenero } from '@/lib/constants/genero'

const positionColors: Record<PosicionValue, string> = {
  LIBERO: 'bg-uady-gold text-uady-blue',
  ACOMODO: 'bg-uady-blue text-white',
  OPUESTO: 'bg-uady-gold text-uady-blue',
  CENTRAL: 'bg-emerald-600 text-white',
  BANDA: 'bg-purple-600 text-white',
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
  const session = await getSession()
  const canViewPrivate = session?.rol === 'ADMIN' || session?.id === id

  const atleta = await prisma.atleta.findUnique({
    where: { id },
    select: {
      id: true, nombre: true, apellidos: true, matricula: true, genero: true, posicion: true,
      facultad: true, directorFacultad: true, semestre: true, telefonoPersonal: true,
      telefonoTutor: true, correo: true, rol: true, rolTecnico: true,
      fotoUrl: true, estado: true, anioIngreso: true, anioEgreso: true, numUniforme: true,
      tallaPlayera: true, tallaShort: true, tallaPants: true, tallaChamarra: true,
      lesiones: { orderBy: { fechaConsulta: 'desc' } },
      // Sin accesoCompleto, no se hace include de datos sensibles — ni siquiera llegan al componente.
      privado: canViewPrivate,
    },
  })

  if (!atleta) notFound()

  const canEdit = canViewPrivate // mismo criterio: ADMIN o el propio atleta

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
                atleta.posicion ? positionColors[atleta.posicion] : 'bg-white/20 text-white'
              }`}
            >
              {labelPosicion(atleta.posicion)}
            </span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                atleta.genero === 'M'
                  ? 'bg-blue-900/60 text-blue-200'
                  : 'bg-pink-900/60 text-pink-200'
              }`}
            >
              {atleta.genero === 'M' ? '♂' : '♀'} {ramaFromGenero(atleta.genero)}
            </span>
            {atleta.rol === 'ADMIN' && (
              <span className="bg-uady-gold text-uady-blue text-xs font-bold px-3 py-1 rounded-full">
                Admin
              </span>
            )}
            {atleta.estado === 'EGRESADO' && (
              <span className="text-uady-gold text-xs font-bold tracking-widest px-3 py-1 rounded-full border border-uady-gold/40">
                Egresado · {atleta.anioIngreso} – {atleta.anioEgreso}
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
            {atleta.matricula && (
              <div>
                <dt className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Matrícula</dt>
                <dd className="text-gray-700 mt-0.5 font-mono">{atleta.matricula}</dd>
              </div>
            )}
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

        {/* Información Deportiva — pública */}
        <CardDeportiva
          atletaId={atleta.id}
          canEdit={canEdit}
          data={{
            posicion: atleta.posicion,
            numUniforme: atleta.numUniforme,
            anioIngreso: atleta.anioIngreso,
            anioEgreso: atleta.anioEgreso,
            tallaPlayera: atleta.tallaPlayera,
            tallaShort: atleta.tallaShort,
            tallaPants: atleta.tallaPants,
            tallaChamarra: atleta.tallaChamarra,
          }}
        />

        {/* Información de Contacto — versión completa (ADMIN o el propio atleta,
            con clave/correo/tel. personal/tel. tutor) o reducida (compañero de
            equipo: solo correo y tel. personal, sin badge Privado). Cada
            variante solo recibe los campos que le corresponden. */}
        {canViewPrivate ? (
          <CardContacto
            atletaId={atleta.id}
            canEdit={canEdit}
            variant="completo"
            data={{
              correo: atleta.correo,
              telefonoPersonal: atleta.telefonoPersonal,
              telefonoTutor: atleta.telefonoTutor,
            }}
          />
        ) : (
          <CardContacto
            atletaId={atleta.id}
            variant="reducido"
            data={{
              correo: atleta.correo,
              telefonoPersonal: atleta.telefonoPersonal,
            }}
          />
        )}

        {/* Datos Médicos — nunca se renderiza para un compañero de equipo:
            ausencia total en el DOM, no solo ocultamiento visual. */}
        {canViewPrivate && (
          <CardMedica
            atletaId={atleta.id}
            canEdit={canEdit}
            data={{
              nss: atleta.privado?.nss ?? null,
              seguroAseguradora: atleta.privado?.seguroAseguradora ?? null,
              seguroPoliza: atleta.privado?.seguroPoliza ?? null,
              seguroTitular: atleta.privado?.seguroTitular ?? null,
            }}
          />
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
        <div className="mt-6 flex gap-3 flex-wrap items-start justify-end">
          {atleta.estado === 'ACTIVO' ? (
            <BotonEgresarAtleta atletaId={atleta.id} nombre={`${atleta.nombre} ${atleta.apellidos}`} />
          ) : (
            <BotonReactivarAtleta
              atletaId={atleta.id}
              nombre={`${atleta.nombre} ${atleta.apellidos}`}
              anioEgreso={atleta.anioEgreso}
            />
          )}
          <BotonEliminarAtleta atletaId={atleta.id} nombre={`${atleta.nombre} ${atleta.apellidos}`} />
        </div>
      )}
    </div>
  )
}
