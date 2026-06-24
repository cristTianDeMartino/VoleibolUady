'use client'

import { useState, useEffect, useActionState, useTransition } from 'react'
import Image from 'next/image'
import { User, Pencil, X, Loader2, Check, Camera, Shield } from 'lucide-react'
import {
  updateSeccionAcademica,
  updateSeccionDeportiva,
  updateSeccionContacto,
  updateSeccionMedica,
  updatePerfilAdmin,
  updateFotoPerfilPropio,
} from '@/actions/atletas'
import type { PerfilFormState } from '@/actions/atletas'
import { labelPosicion, type PosicionValue } from '@/lib/constants/posiciones'
import { ramaFromGenero } from '@/lib/constants/genero'
import { aniosDesde2000 } from '@/lib/validation'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AtletaPerfilData {
  id: string
  nombre: string
  apellidos: string
  matricula: string | null
  rol: string
  posicion: PosicionValue | null
  genero: string
  facultad: string
  semestre: number
  directorFacultad: string
  telefonoPersonal: string
  telefonoTutor: string
  correo: string | null
  fotoUrl: string | null
  rolTecnico: string | null
  numUniforme: number | null
  anioIngreso: number | null
  anioEgreso: number | null
  tallaPlayera: string | null
  tallaShort: string | null
  tallaPants: string | null
  tallaChamarra: string | null
  privado: {
    nss: string | null
    seguroAseguradora: string | null
    seguroPoliza: string | null
    seguroTitular: string | null
  } | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const FACULTADES = [
  'Facultad de Medicina', 'Facultad de Ingeniería', 'Facultad de Ingeniería Química', 'Facultad de Derecho',
  'Facultad de Contaduría y Administración', 'Facultad de Economía', 'Facultad de Psicología',
  'Facultad de Arquitectura', 'Facultad de Enfermería', 'Facultad de Nutrición',
  'Facultad de Odontología', 'Facultad de Matemáticas', 'Facultad de Química',
  'Facultad de Biología', 'Facultad de Educación', 'Facultad de Ciencias Antropológicas',
]

const ROLES_TECNICOS = ['Entrenador', 'Auxiliar', 'Médico', 'Psicólogo', 'Fisioterapeuta', 'Nutriólogo']

const ic = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all bg-white'
const lc = 'block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1'
const icErr = (hasError?: string) => `${ic} ${hasError ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''}`

function FieldError({ msg }: { msg?: string }) {
  return msg ? <p className="text-red-500 text-xs mt-1">{msg}</p> : null
}

const POSICION_COLORS: Record<PosicionValue, string> = {
  LIBERO:  'bg-uady-gold/20 text-uady-blue',
  ACOMODO: 'bg-uady-blue/20 text-uady-blue',
  OPUESTO: 'bg-emerald-100 text-emerald-800',
  CENTRAL: 'bg-purple-100 text-purple-800',
  BANDA:   'bg-indigo-100 text-indigo-800',
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
          ? 'border border-uady-blue/30 shadow-md ring-1 ring-uady-blue/10'
          : 'border border-gray-100 shadow-sm'
      }`}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className={`w-1 h-5 rounded-full ${accent === 'green' ? 'bg-uady-gold' : 'bg-uady-blue'}`} />
          <h2 className="text-sm font-black text-uady-blue">
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
            className="p-1.5 rounded-lg text-gray-300 hover:text-uady-blue hover:bg-uady-blue/5 transition-all"
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
                className="flex items-center gap-1.5 bg-uady-blue text-white text-xs font-bold px-4 py-2 rounded-lg hover:brightness-110 disabled:opacity-60 transition-all"
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
  const fieldError = (name: string) => (state.field === name ? state.error ?? undefined : undefined)

  return (
    <form action={formAction}>
      <SectionCard
        title="Información Académica"
        editing={editing}
        onEdit={() => setEditing(true)}
        onCancel={() => setEditing(false)}
        isPending={isPending}
        error={state.field ? null : state.error}
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
                <label className={lc}>Semestre</label>
                <select
                  name="semestre" required
                  defaultValue={atleta.semestre} className={icErr(fieldError('semestre'))}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((s) => (
                    <option key={s} value={s}>{s}°</option>
                  ))}
                </select>
                <FieldError msg={fieldError('semestre')} />
              </div>
              <div>
                <label className={lc}>Director(a) de la Facultad</label>
                <input
                  type="text" name="directorFacultad" required
                  pattern="[A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]*"
                  defaultValue={atleta.directorFacultad} className={icErr(fieldError('directorFacultad'))}
                />
                <FieldError msg={fieldError('directorFacultad')} />
              </div>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InfoRow label="Matrícula" value={atleta.matricula} />
          <InfoRow label="Facultad" value={atleta.facultad} />
          <InfoRow label="Semestre" value={`${atleta.semestre}°`} />
          <InfoRow label="Director(a)" value={atleta.directorFacultad} />
        </div>
      </SectionCard>
    </form>
  )
}

// ─── Section: Deportiva (pública) ─────────────────────────────────────────────

function SeccionDeportiva({ atleta }: { atleta: AtletaPerfilData }) {
  const [editing, setEditing] = useState(false)
  const [state, formAction, isPending] = useActionState<PerfilFormState, FormData>(
    updateSeccionDeportiva, { error: null },
  )
  useEffect(() => { if (state.success) setEditing(false) }, [state.success])
  const fieldError = (name: string) => (state.field === name ? state.error ?? undefined : undefined)

  return (
    <form action={formAction}>
      <SectionCard
        title="Información Deportiva"
        editing={editing}
        onEdit={() => setEditing(true)}
        onCancel={() => setEditing(false)}
        isPending={isPending}
        error={state.field ? null : state.error}
        editFields={
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lc}>Número de Uniforme</label>
                <input type="number" name="numUniforme" min={0} defaultValue={atleta.numUniforme ?? ''} className={ic} />
              </div>
              <div>
                <label className={lc}>Año de Ingreso</label>
                <select
                  name="anioIngreso" required
                  defaultValue={atleta.anioIngreso ?? ''} className={icErr(fieldError('anioIngreso'))}
                >
                  {aniosDesde2000().map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                <FieldError msg={fieldError('anioIngreso')} />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {([
                ['tallaPlayera', 'Talla Playera', atleta.tallaPlayera],
                ['tallaShort', 'Talla Short', atleta.tallaShort],
                ['tallaPants', 'Talla Pants', atleta.tallaPants],
                ['tallaChamarra', 'Talla Chamarra', atleta.tallaChamarra],
              ] as const).map(([name, label, value]) => (
                <div key={name}>
                  <label className={lc}>{label}</label>
                  <select name={name} defaultValue={value ?? ''} className={ic}>
                    <option value="">—</option>
                    {TALLAS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <InfoRow label="Número de Uniforme" value={atleta.numUniforme != null ? `#${atleta.numUniforme}` : null} />
          <InfoRow label="Año de Ingreso" value={atleta.anioIngreso?.toString()} />
          {atleta.anioEgreso != null && <InfoRow label="Año de Egreso" value={atleta.anioEgreso.toString()} />}
          <InfoRow label="Talla Playera" value={atleta.tallaPlayera} />
          <InfoRow label="Talla Short" value={atleta.tallaShort} />
          <InfoRow label="Talla Pants" value={atleta.tallaPants} />
          <InfoRow label="Talla Chamarra" value={atleta.tallaChamarra} />
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
  const fieldError = (name: string) => (state.field === name ? state.error ?? undefined : undefined)

  return (
    <form action={formAction}>
      <SectionCard
        title="Información de Contacto" accent="blue" privateLabel
        editing={editing}
        onEdit={() => setEditing(true)}
        onCancel={() => setEditing(false)}
        isPending={isPending}
        error={state.field ? null : state.error}
        editFields={
          <div className="space-y-3">
            <div>
              <label className={lc}>Correo *</label>
              <input
                type="email" name="correo" required
                defaultValue={atleta.correo ?? ''}
                placeholder="usuario@correo.uady.mx"
                className={icErr(fieldError('correo'))}
              />
              <FieldError msg={fieldError('correo')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lc}>Teléfono Personal *</label>
                <input
                  type="tel" name="telefonoPersonal" required maxLength={10} inputMode="numeric"
                  defaultValue={atleta.telefonoPersonal} className={icErr(fieldError('telefonoPersonal'))}
                />
                <FieldError msg={fieldError('telefonoPersonal')} />
              </div>
              <div>
                <label className={lc}>Teléfono Tutor / Familiar *</label>
                <input
                  type="tel" name="telefonoTutor" required maxLength={10} inputMode="numeric"
                  defaultValue={atleta.telefonoTutor} className={icErr(fieldError('telefonoTutor'))}
                />
                <FieldError msg={fieldError('telefonoTutor')} />
              </div>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InfoRow label="Correo" value={atleta.correo} />
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
  const fieldError = (name: string) => (state.field === name ? state.error ?? undefined : undefined)

  return (
    <form action={formAction}>
      <SectionCard
        title="Datos Médicos" privateLabel
        editing={editing}
        onEdit={() => setEditing(true)}
        onCancel={() => setEditing(false)}
        isPending={isPending}
        error={state.field ? null : state.error}
        editFields={
          <div className="space-y-3">
            <div>
              <label className={lc}>NSS *</label>
              <input
                type="text" name="nss" required maxLength={11} minLength={11} inputMode="numeric"
                defaultValue={atleta.privado?.nss ?? ''} className={icErr(fieldError('nss'))}
              />
              <FieldError msg={fieldError('nss')} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={lc}>Aseguradora</label>
                <input type="text" name="seguroAseguradora" defaultValue={atleta.privado?.seguroAseguradora ?? ''} className={ic} />
              </div>
              <div>
                <label className={lc}>Póliza</label>
                <input type="text" name="seguroPoliza" defaultValue={atleta.privado?.seguroPoliza ?? ''} className={ic} />
              </div>
              <div>
                <label className={lc}>Titular</label>
                <input type="text" name="seguroTitular" defaultValue={atleta.privado?.seguroTitular ?? ''} className={ic} />
              </div>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow label="NSS" value={atleta.privado?.nss} />
          <InfoRow label="Aseguradora" value={atleta.privado?.seguroAseguradora ?? 'No especificado'} />
          <InfoRow label="Póliza" value={atleta.privado?.seguroPoliza} />
          <InfoRow label="Titular" value={atleta.privado?.seguroTitular} />
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
  const fieldError = (name: string) => (state.field === name ? state.error ?? undefined : undefined)

  return (
    <form action={formAction}>
      <SectionCard
        title="Datos del Cuerpo Técnico"
        editing={editing}
        onEdit={() => setEditing(true)}
        onCancel={() => setEditing(false)}
        isPending={isPending}
        error={state.field ? null : state.error}
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
              <label className={lc}>Correo *</label>
              <input
                type="email" name="correo" required
                defaultValue={atleta.correo ?? ''}
                placeholder="usuario@correo.uady.mx"
                className={ic}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lc}>Teléfono *</label>
                <input
                  type="tel" name="telefonoPersonal" required maxLength={10} inputMode="numeric"
                  defaultValue={atleta.telefonoPersonal} className={icErr(fieldError('telefonoPersonal'))}
                />
                <FieldError msg={fieldError('telefonoPersonal')} />
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
          <InfoRow label="Correo" value={atleta.correo} />
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
      <div className="bg-uady-blue text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center text-center">

          {/* Avatar — click to change photo */}
          <label
            className="relative w-28 h-28 rounded-full border-4 border-uady-gold bg-white/10 flex items-center justify-center overflow-hidden cursor-pointer group"
            title="Cambiar foto de perfil"
          >
            {imgSrc ? (
              <Image src={imgSrc} alt={nombreCompleto} fill className="object-cover" sizes="112px" />
            ) : inicial ? (
              <span className="text-4xl font-black text-uady-gold">{inicial}</span>
            ) : (
              <User className="w-12 h-12 text-uady-gold" />
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
                <span className="bg-uady-gold/20 text-uady-gold text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
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
                    atleta.posicion ? POSICION_COLORS[atleta.posicion] : 'bg-white/20 text-white'
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
            <SeccionDeportiva atleta={atleta} />
            <SeccionContacto atleta={atleta} />
            <SeccionMedica atleta={atleta} />
          </>
        )}
      </div>
    </div>
  )
}
