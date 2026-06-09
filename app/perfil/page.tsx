import { redirect } from 'next/navigation'
import Image from 'next/image'
import { User } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const fmtFecha = (d: Date | string | null) =>
  d
    ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'Sin registrar'

export default async function PerfilPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const atleta = await prisma.atleta.findUnique({ where: { id: session.id } })
  if (!atleta) redirect('/login')

  const nombreCompleto = `${atleta.nombre} ${atleta.apellidos}`
  const inicial = atleta.nombre.charAt(0).toUpperCase()

  const campos = [
    { label: 'Nombre Completo', value: nombreCompleto },
    { label: 'Correo Electrónico', value: 'Sin registrar' },
    { label: 'Fecha de Nacimiento', value: fmtFecha(null) },
    { label: 'Posición', value: atleta.posicion || 'Sin registrar' },
    { label: 'Peso / Estatura', value: 'Sin registrar' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Cabecera del perfil ── */}
      <div className="bg-primary-blue text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center text-center">
          <div className="relative w-28 h-28 rounded-full border-4 border-accent-green bg-white/10 flex items-center justify-center overflow-hidden">
            {atleta.fotoUrl ? (
              <Image src={atleta.fotoUrl} alt={nombreCompleto} fill className="object-cover" sizes="112px" />
            ) : inicial ? (
              <span className="text-4xl font-black text-accent-green">{inicial}</span>
            ) : (
              <User className="w-12 h-12 text-accent-green" />
            )}
          </div>
          <h1 className="mt-4 text-2xl sm:text-3xl font-black">{nombreCompleto}</h1>
          <p className="mt-1 text-accent-green text-sm font-bold uppercase tracking-widest">{atleta.rol}</p>
        </div>
      </div>

      {/* ── Sección de datos ── */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-lg font-black text-primary-blue mb-5">Información Personal</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {campos.map(campo => (
            <div key={campo.label} className="bg-white shadow-md rounded-xl p-6">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{campo.label}</p>
              <p className="text-primary-blue font-semibold text-base">{campo.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
