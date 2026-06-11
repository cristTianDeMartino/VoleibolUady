'use client'

import { useState, useEffect, useActionState, useTransition } from 'react'
import Image from 'next/image'
import { User, Pencil, X, Loader2, Check, Camera, Shield } from 'lucide-react'
import {
  updateSeccionAcademica,
  updateSeccionContacto,
  updateSeccionMedica,
  updatePerfilAdmin,
  updateFotoPerfilPropio,
} from '@/actions/atletas'
import type { PerfilFormState } from '@/actions/atletas'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AtletaPerfilData {
  id: string
  nombre: string
  apellidos: string
  rol: string
  posicion: string
  rama: string
  facultad: string
  semestre: number
  directorFacultad: string
  telefonoPersonal: string
  telefonoTutor: string
  nss: string
  seguroPrivado: string | null
  email: string | null
  fotoUrl: string | null
  rolTecnico: string | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FACULTADES = [
  'Facultad de Medicina', 'Facultad de Ingeniería', 'Facultad de Derecho',
  'Facultad de Contaduría y Administración', 'Facultad de Psicología',
  'Facultad de Arquitectura', 'Facultad de Enfermería', 'Facultad de Nutrición',
  'Facultad de Odontología', 'Facultad de Matemáticas', 'Facultad de Química',
  'Facultad de Biología', 'Facultad de Educación',
]

const ROLES_TECNICOS = ['Entrenador', 'Auxiliar', 'Médico', 'Psicólogo', 'Fisioterapeuta', 'Nutriólogo']

const ic = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue transition-all bg-white'
const lc = 'block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1'

const POSICION_COLORS: Record<string, string> = {
  Libero:    'bg-accent-green/20 text-[#0F2540]',
  Colocador: 'bg-primary-blue/20 text-primary-blue',
  Armadora:  'bg-primary-blue/20 text-primary-blue',
  Opuesto:   'bg-emerald-100 text-emerald-800',
  Opuesta:   'bg-emerald-100 text-emerald-800',
  Central:   'bg-purple-100 text-purple-800',
  Banda:     'bg-indigo-100 text-indigo-800',
}

// ─── InfoRow ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className={lc}>{label}</p>
      <p className="text-gray-700 text-sm leading-snug">
        {value || <span className="text-gray-300 italic text-xs">Sin registrar</span>}
      </p>
    </div>
  )
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

interface SectionCardProps {
  title: string
  accent?: 'green' | 'blue'
  privateLabel?: boolean
  editing: boolean
  onEdit: () => void
  onCancel: () => void
  isPending: boolean
  error: string | null
  children: React.ReactNode
  editFields: React.ReactNode
}

function SectionCard({
  title, accent = 'green', privateLabel,
  editing, onEdit, onCancel, isPending, error, children, editFields,
}: SectionCardProps) {
  return (
    <div
      className={`bg-white rounded-xl overflow-hidden transition-all duration-200 ${
        editing
          ? 'border border-primary-blue/30 shadow-md ring-1 ring-primary-blue/10'
          : 'border border-gray-100 shadow-sm'
      }`}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className={`w-1 h-5 rounded-full ${accent === 'green' ? 'bg-accent-green' : 'bg-primary-blue'}`} />
          <h2 className="text-sm font-black text-primary-blue">
            {title}
            {privateLabel && (
              <span className="text-[10px] font-normal text-gray-400 ml-2">🔒 Privado</span>
            )}
          </h2>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 rounded-lg text-gray-300 hover:text-primary-blue hover:bg-primary-blue/5 transition-all"
            aria-label={`Editar ${title}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Card body */}
      <div className="p-5">
        {editing ? (
          <div className="space-y-4">
            {editFields}

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 flex items-center gap-1.5">
                <span>⚠️</span> {error}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-1.5 bg-primary-blue text-white text-xs font-bold px-4 py-2 rounded-lg hover:brightness-110 disabled:opacity-60 transition-all"
              >
                {isPending
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Guardando…</>
                  : <><Check className="w-3.5 h-3.5" />Guardar</>
                }
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={isPending}
                className="flex items-center gap-1.5 border border-gray-200 text-gray-500 text-xs font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />Cancelar
              </button>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

// ─── Section: Académica ───────────────────────────────────────────────────────

function SeccionAcademica({ atleta }: { atleta: AtletaPerfilData }) {
  const [editing, setEditing] = useState(false)
  const [state, formAction, isPending] = useActionState<PerfilFormState, FormData>(
    updateSeccionAcademica, { error: null },
  )
  useEffect(() => { if (state.success) setEditing(false) }, [state.success])

  return (
    <form action={formAction}>
      <SectionCard
        title="Información Académica"
        editing={editing}
        onEdit={() => setEditing(true)}
        onCancel={() => setEditing(false)}
        isPending={isPending}
        error={state.error}
        editFields={
          <div className="space-y-3">
            <div>
              <label className={lc}>Facultad</label>
              <select name="facultad" defaultValue={atleta.facultad} className={ic}>
                {FACULTADES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lc}>Semestre (1–12)</label>
                <input
                  type="number" name="semestre" min={1} max={12} required
                  defaultValue={atleta.semestre} className={ic}
                />
              </div>
              <div>
                <label className={lc}>Director(a) de la Facultad</label>
                <input
                  type="text" name="directorFacultad" required
                  defaultValue={atleta.directorFacultad} className={ic}
                />
              </div>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InfoRow label="Facultad" value={atleta.facultad} />
          <InfoRow label="Semestre" value={`${atleta.semestre}°`} />
          <InfoRow label="Director(a)" value={atleta.directorFacultad} />
        </div>
      </SectionCard>
    </form>
  )
}

// ─── Section: Contacto ────────────────────────────────────────────────────────

function SeccionContacto({ atleta }: { atleta: AtletaPerfilData }) {
  const [editing, setEditing] = useState(false)
  const [state, formAction, isPending] = useActionState<PerfilFormState, FormData>(
    updateSeccionContacto, { error: null },
  )
  useEffect(() => { if (state.success) setEditing(false) }, [state.success])

  return (
    <form action={formAction}>
      <SectionCard
        title="Información de Contacto" accent="blue" privateLabel
        editing={editing}
        onEdit={() => setEditing(true)}
        onCancel={() => setEditing(false)}
        isPending={isPending}
        error={state.error}
        editFields={
          <div className="space-y-3">
            <div>
              <label className={lc}>Correo Institucional *</label>
              <input
                type="email" name="email" required
                defaultValue={atleta.email ?? ''}
                placeholder="usuario@correo.uady.mx"
                className={ic}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lc}>Teléfono Personal *</label>
                <input type="tel" name="telefonoPersonal" required defaultValue={atleta.telefonoPersonal} className={ic} />
              </div>
              <div>
                <label className={lc}>Teléfono Tutor / Familiar *</label>
                <input type="tel" name="telefonoTutor" required defaultValue={atleta.telefonoTutor} className={ic} />
              </div>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InfoRow label="Correo Institucional" value={atleta.email} />
          <InfoRow label="Teléfono Personal" value={atleta.telefonoPersonal} />
          <InfoRow label="Teléfono Tutor / Familiar" value={atleta.telefonoTutor} />
        </div>
      </SectionCard>
    </form>
  )
}

// ─── Section: Médica ──────────────────────────────────────────────────────────

function SeccionMedica({ atleta }: { atleta: AtletaPerfilData }) {
  const [editing, setEditing] = useState(false)
  const [state, formAction, isPending] = useActionState<PerfilFormState, FormData>(
    updateSeccionMedica, { error: null },
  )
  useEffect(() => { if (state.success) setEditing(false) }, [state.success])

  return (
    <form action={formAction}>
      <SectionCard
        title="Datos Médicos" privateLabel
        editing={editing}
        onEdit={() => setEditing(true)}
        onCancel={() => setEditing(false)}
        isPending={isPending}
        error={state.error}
        editFields={
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lc}>NSS *</label>
              <input type="text" name="nss" required defaultValue={atleta.nss} className={ic} />
            </div>
            <div>
              <label className={lc}>Seguro Médico Privado</label>
              <input
                type="text" name="seguroPrivado"
                defaultValue={atleta.seguroPrivado ?? ''}
                placeholder="Nombre de aseguradora"
                className={ic}
              />
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow label="NSS" value={atleta.nss} />
          <InfoRow label="Seguro Médico Privado" value={atleta.seguroPrivado ?? 'No especificado'} />
        </div>
      </SectionCard>
    </form>
  )
}

// ─── Section: Cuerpo Técnico (Admin) ─────────────────────────────────────────

function SeccionCuerpoTecnico({ atleta }: { atleta: AtletaPerfilData }) {
  const [editing, setEditing] = useState(false)
  const [state, formAction, isPending] = useActionState<PerfilFormState, FormData>(
    updatePerfilAdmin, { error: null },
  )
  useEffect(() => { if (state.success) setEditing(false) }, [state.success])

  return (
    <form action={formAction}>
      <SectionCard
        title="Datos del Cuerpo Técnico"
        editing={editing}
        onEdit={() => setEditing(true)}
        onCancel={() => setEditing(false)}
        isPending={isPending}
        error={state.error}
        editFields={
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lc}>Nombre *</label>
                <input type="text" name="nombre" required defaultValue={atleta.nombre} className={ic} />
              </div>
              <div>
                <label className={lc}>Apellidos *</label>
                <input type="text" name="apellidos" required defaultValue={atleta.apellidos} className={ic} />
              </div>
            </div>
            <div>
              <label className={lc}>Correo Institucional *</label>
              <input
                type="email" name="email" required
                defaultValue={atleta.email ?? ''}
                placeholder="usuario@correo.uady.mx"
                className={ic}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lc}>Teléfono *</label>
                <input type="tel" name="telefonoPersonal" required defaultValue={atleta.telefonoPersonal} className={ic} />
              </div>
              <div>
                <label className={lc}>Función en el Cuerpo Técnico *</label>
                <select name="rolTecnico" defaultValue={atleta.rolTecnico ?? 'Entrenador'} className={ic}>
                  {ROLES_TECNICOS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow label="Nombre Completo" value={`${atleta.nombre} ${atleta.apellidos}`} />
          <InfoRow label="Correo Institucional" value={atleta.email} />
          <InfoRow label="Teléfono" value={atleta.telefonoPersonal} />
          <InfoRow label="Función" value={atleta.rolTecnico ?? 'No especificado'} />
        </div>
      </SectionCard>
    </form>
  )
}

// ─── PerfilClient ─────────────────────────────────────────────────────────────

export default function PerfilClient({ atleta }: { atleta: AtletaPerfilData }) {
  const [preview, setPreview] = useState<string | null>(null)
  const [fotoError, setFotoError] = useState<string | null>(null)
  const [fotoPending, startFotoTransition] = useTransition()

  const isAdmin = atleta.rol === 'ADMIN'
  const nombreCompleto = `${atleta.nombre} ${atleta.apellidos}`
  const inicial = atleta.nombre.charAt(0).toUpperCase()
  const imgSrc = preview ?? atleta.fotoUrl

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFotoError(null)
    setPreview(URL.createObjectURL(file))
    const fd = new FormData()
    fd.append('foto', file)
    startFotoTransition(async () => {
      const res = await updateFotoPerfilPropio(fd)
      if (res?.error) {
        setFotoError(res.error)
        setPreview(null)
      } else {
        setPreview(null) // fotoUrl from server will replace it on next render
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Profile header ── */}
      <div className="bg-primary-blue text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center text-center">

          {/* Avatar — click to change photo */}
          <label
            className="relative w-28 h-28 rounded-full border-4 border-accent-green bg-white/10 flex items-center justify-center overflow-hidden cursor-pointer group"
            title="Cambiar foto de perfil"
          >
            {imgSrc ? (
              <Image src={imgSrc} alt={nombreCompleto} fill className="object-cover" sizes="112px" />
            ) : inicial ? (
              <span className="text-4xl font-black text-accent-green">{inicial}</span>
            ) : (
              <User className="w-12 h-12 text-accent-green" />
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
              {fotoPending
                ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                : <Camera className="w-6 h-6 text-white" />
              }
            </div>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFoto}
              disabled={fotoPending}
            />
          </label>

          {fotoError && (
            <p className="text-xs text-red-300 mt-2">⚠️ {fotoError}</p>
          )}

          <h1 className="mt-4 text-2xl sm:text-3xl font-black">{nombreCompleto}</h1>

          {/* Role badges */}
          <div className="mt-2 flex items-center gap-2 flex-wrap justify-center">
            {isAdmin ? (
              <>
                <span className="bg-accent-green/20 text-accent-green text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Administrador
                </span>
                {atleta.rolTecnico && (
                  <span className="bg-white/10 text-white/90 text-xs font-semibold px-3 py-1 rounded-full">
                    {atleta.rolTecnico}
                  </span>
                )}
              </>
            ) : (
              <>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    POSICION_COLORS[atleta.posicion] ?? 'bg-white/20 text-white'
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
              </>
            )}
          </div>

          <p className="mt-2 text-xs text-white/40">
            Haz clic en tu foto para actualizarla
          </p>
        </div>
      </div>

      {/* ── Sections ── */}
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-5">
        {isAdmin ? (
          <SeccionCuerpoTecnico atleta={atleta} />
        ) : (
          <>
            <SeccionAcademica atleta={atleta} />
            <SeccionContacto atleta={atleta} />
            <SeccionMedica atleta={atleta} />
          </>
        )}
      </div>
    </div>
  )
}
