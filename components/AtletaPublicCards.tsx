'use client'

import { useState, useTransition } from 'react'
import { Pencil, X, Loader2, Check } from 'lucide-react'
import { actualizarDatosGenerales, actualizarDatosPrivados } from '@/app/actions/atleta.actions'
import type { DatosGenerales, DatosPrivados } from '@/app/actions/atleta.actions'
import { POSICIONES, labelPosicion, type PosicionValue } from '@/lib/constants/posiciones'
import { aniosDesde2000 } from '@/lib/validation'
import { parseFechaLocal } from '@/lib/utils/fecha'
import FechaNacimientoSelector from '@/components/ui/FechaNacimientoSelector'
import LicenciaturaSelector from '@/components/ui/LicenciaturaSelector'

const TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const FACULTADES = [
  'Facultad de Medicina', 'Facultad de Ingeniería', 'Facultad de Ingeniería Química', 'Facultad de Derecho',
  'Facultad de Contaduría y Administración', 'Facultad de Economía', 'Facultad de Psicología',
  'Facultad de Arquitectura', 'Facultad de Enfermería', 'Facultad de Nutrición',
  'Facultad de Odontología', 'Facultad de Matemáticas', 'Facultad de Química',
  'Facultad de Biología', 'Facultad de Educación', 'Facultad de Ciencias Antropológicas',
]
const ic = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all bg-white'
const lc = 'block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1'

function formatFechaLarga(iso: string | null): string | null {
  if (!iso) return null
  return parseFechaLocal(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

function Dato({ label, value, mono }: { label: string; value?: string | number | null; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{label}</dt>
      <dd className={`text-gray-700 mt-0.5 ${mono ? 'font-mono break-all' : ''}`}>{value !== null && value !== undefined && value !== '' ? value : <span className="text-gray-300 italic">—</span>}</dd>
    </div>
  )
}

interface CardShellProps {
  title: string
  accent?: 'blue' | 'gold'
  privateLabel?: boolean
  canEdit: boolean
  children: React.ReactNode
}

function CardShell({ title, accent = 'gold', privateLabel, canEdit, children, onEditClick }: CardShellProps & { onEditClick?: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-uady-blue flex items-center gap-2">
          <span className={`w-1 h-5 rounded-full ${accent === 'gold' ? 'bg-uady-gold' : 'bg-uady-blue'}`} />
          {title}
          {privateLabel && <span className="text-xs font-normal text-gray-400 ml-1">🔒 Privado</span>}
        </h2>
        {canEdit && onEditClick && (
          <button
            type="button"
            onClick={onEditClick}
            className="p-1.5 rounded-lg text-gray-300 hover:text-uady-blue hover:bg-uady-blue/5 transition-all"
            aria-label={`Editar ${title}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

// ─── Información Deportiva (pública) ──────────────────────────────────────────

export interface DeportivaData {
  posicion: PosicionValue | null
  numUniforme: number | null
  anioIngreso: number
  anioEgreso: number | null
  tallaPlayera: string | null
  tallaShort: string | null
  tallaPants: string | null
  tallaChamarra: string | null
}

export function CardDeportiva({ atletaId, data, canEdit }: { atletaId: string; data: DeportivaData; canEdit: boolean }) {
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const handleSave = (formData: FormData) => {
    setError(null)
    const payload: DatosGenerales = {
      posicion: (formData.get('posicion') as PosicionValue) || data.posicion,
      numUniforme: formData.get('numUniforme') ? parseInt(formData.get('numUniforme') as string, 10) : null,
      anioIngreso: formData.get('anioIngreso') ? parseInt(formData.get('anioIngreso') as string, 10) : data.anioIngreso,
      tallaPlayera: (formData.get('tallaPlayera') as string) || null,
      tallaShort: (formData.get('tallaShort') as string) || null,
      tallaPants: (formData.get('tallaPants') as string) || null,
      tallaChamarra: (formData.get('tallaChamarra') as string) || null,
    }
    startTransition(async () => {
      try {
        await actualizarDatosGenerales(atletaId, payload)
        setEditing(false)
      } catch (e) {
        setError((e as Error).message || 'Error al guardar los cambios.')
      }
    })
  }

  return (
    <CardShell title="Información Deportiva" canEdit={canEdit} onEditClick={() => setEditing(true)}>
      {editing ? (
        <form action={handleSave} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lc}>Posición</label>
              <select name="posicion" defaultValue={data.posicion ?? ''} className={ic}>
                <option value="">—</option>
                {POSICIONES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div>
              <label className={lc}>Número de Uniforme</label>
              <input type="number" name="numUniforme" min={0} defaultValue={data.numUniforme ?? ''} className={ic} />
            </div>
            <div>
              <label className={lc}>Año de Ingreso</label>
              <select name="anioIngreso" required defaultValue={data.anioIngreso} className={ic}>
                {aniosDesde2000().map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([
              ['tallaPlayera', 'Playera', data.tallaPlayera],
              ['tallaShort', 'Short', data.tallaShort],
              ['tallaPants', 'Pants', data.tallaPants],
              ['tallaChamarra', 'Chamarra', data.tallaChamarra],
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
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={pending} className="flex items-center gap-1.5 bg-uady-blue text-white text-xs font-bold px-4 py-2 rounded-lg disabled:opacity-60">
              {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Guardar
            </button>
            <button type="button" onClick={() => setEditing(false)} disabled={pending} className="flex items-center gap-1.5 border border-gray-200 text-gray-500 text-xs font-medium px-4 py-2 rounded-lg">
              <X className="w-3.5 h-3.5" /> Cancelar
            </button>
          </div>
        </form>
      ) : (
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <Dato label="Posición" value={labelPosicion(data.posicion)} />
          <Dato label="Número de Uniforme" value={data.numUniforme != null ? `#${data.numUniforme}` : null} />
          <Dato label="Año de Ingreso" value={data.anioIngreso} />
          {data.anioEgreso != null && <Dato label="Año de Egreso" value={data.anioEgreso} />}
          <Dato label="Talla Playera" value={data.tallaPlayera} />
          <Dato label="Talla Short" value={data.tallaShort} />
          <Dato label="Talla Pants" value={data.tallaPants} />
          <Dato label="Talla Chamarra" value={data.tallaChamarra} />
        </dl>
      )}
    </CardShell>
  )
}

// ─── Información Académica (pública) ──────────────────────────────────────────
// Matrícula es de solo lectura (se fija al crear el atleta o vía import).

export interface AcademicaData {
  matricula: string | null
  facultad: string
  semestre: number
  directorFacultad: string
  licenciatura: string | null
}

export function CardAcademica({
  atletaId, data, canEdit,
}: { atletaId: string; data: AcademicaData; canEdit: boolean }) {
  const [editing, setEditing] = useState(false)
  const [licenciatura, setLicenciatura] = useState(data.licenciatura ?? '')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const handleSave = (formData: FormData) => {
    setError(null)
    const payload: DatosGenerales = {
      facultad: (formData.get('facultad') as string) || data.facultad,
      semestre: formData.get('semestre') ? parseInt(formData.get('semestre') as string, 10) : data.semestre,
      directorFacultad: (formData.get('directorFacultad') as string) || data.directorFacultad,
      licenciatura: (formData.get('licenciatura') as string) || null,
    }
    startTransition(async () => {
      try {
        await actualizarDatosGenerales(atletaId, payload)
        setEditing(false)
      } catch (e) {
        setError((e as Error).message || 'Error al guardar los cambios.')
      }
    })
  }

  return (
    <CardShell
      title="Información Académica"
      canEdit={canEdit && !editing}
      onEditClick={() => { setLicenciatura(data.licenciatura ?? ''); setEditing(true) }}
    >
      {editing ? (
        <form action={handleSave} className="space-y-3">
          <div>
            <label className={lc}>Facultad</label>
            <select name="facultad" defaultValue={data.facultad} className={ic}>
              {FACULTADES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className={lc}>Licenciatura</label>
            <LicenciaturaSelector value={licenciatura} onChange={setLicenciatura} />
            <input type="hidden" name="licenciatura" value={licenciatura} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lc}>Semestre</label>
              <select name="semestre" required defaultValue={data.semestre} className={ic}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((s) => <option key={s} value={s}>{s}°</option>)}
              </select>
            </div>
            <div>
              <label className={lc}>Director(a)</label>
              <input type="text" name="directorFacultad" required defaultValue={data.directorFacultad} className={ic} />
            </div>
          </div>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={pending} className="flex items-center gap-1.5 bg-uady-blue text-white text-xs font-bold px-4 py-2 rounded-lg disabled:opacity-60">
              {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Guardar
            </button>
            <button type="button" onClick={() => setEditing(false)} disabled={pending} className="flex items-center gap-1.5 border border-gray-200 text-gray-500 text-xs font-medium px-4 py-2 rounded-lg">
              <X className="w-3.5 h-3.5" /> Cancelar
            </button>
          </div>
        </form>
      ) : (
        <dl className="space-y-3 text-sm">
          {data.matricula && <Dato label="Matrícula" value={data.matricula} />}
          <Dato label="Facultad" value={data.facultad} />
          <Dato label="Semestre" value={`${data.semestre}°`} />
          <Dato label="Director(a)" value={data.directorFacultad} />
          <Dato label="Licenciatura" value={data.licenciatura} />
        </dl>
      )}
    </CardShell>
  )
}

// ─── Información Personal (mixta: pública + privada) ──────────────────────────
// Fecha de Nacimiento, Correo y Teléfono Personal son públicos (visibles a
// cualquier compañero de equipo). Teléfono Tutor/Familiar solo llega en `data`
// cuando accesoCompleto es true — nunca se le pasa a un compañero.

export interface PersonalData {
  fechaNacimiento: string | null // ISO 'YYYY-MM-DD'
  correo: string | null
  telefonoPersonal: string
  telefonoTutor: string | null
  curp: string | null // solo llega cuando accesoCompleto es true
}

export function CardPersonal({
  atletaId, data, canEdit, accesoCompleto,
}: { atletaId: string; data: PersonalData; canEdit: boolean; accesoCompleto: boolean }) {
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const handleSave = (formData: FormData) => {
    setError(null)
    const telefonoTutor = (formData.get('telefonoTutor') as string) || ''
    const payload: DatosGenerales = {
      fechaNacimiento: (formData.get('fechaNacimiento') as string) || null,
      correo: (formData.get('correo') as string) || null,
      telefonoPersonal: (formData.get('telefonoPersonal') as string) || data.telefonoPersonal,
      // vacío no se envía: el campo es obligatorio en BD y no debe borrarse
      ...(telefonoTutor && { telefonoTutor }),
    }
    startTransition(async () => {
      try {
        await actualizarDatosGenerales(atletaId, payload)
        if (accesoCompleto) {
          await actualizarDatosPrivados(atletaId, {
            curp: ((formData.get('curp') as string) || '').toUpperCase() || null,
          })
        }
        setEditing(false)
      } catch (e) {
        setError((e as Error).message || 'Error al guardar los cambios.')
      }
    })
  }

  return (
    <CardShell title="Información Personal" accent="blue" privateLabel={accesoCompleto} canEdit={canEdit} onEditClick={() => setEditing(true)}>
      {editing ? (
        <form action={handleSave} className="space-y-3">
          <div>
            <label className={lc}>Fecha de Nacimiento</label>
            <FechaNacimientoSelector name="fechaNacimiento" defaultValue={data.fechaNacimiento} />
          </div>
          <div>
            <label className={lc}>Correo</label>
            <input type="email" name="correo" defaultValue={data.correo ?? ''} className={ic} />
          </div>
          <div>
            <label className={lc}>Teléfono Personal</label>
            <input
              type="tel" name="telefonoPersonal" maxLength={10} inputMode="numeric"
              defaultValue={data.telefonoPersonal}
              className={`${ic} ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''}`}
            />
          </div>
          {accesoCompleto && (
            <div>
              <label className={lc}>Teléfono Tutor / Familiar</label>
              <input
                type="tel" name="telefonoTutor" maxLength={10} inputMode="numeric"
                placeholder="10 dígitos"
                defaultValue={data.telefonoTutor ?? ''}
                className={`${ic} ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''}`}
              />
            </div>
          )}
          {accesoCompleto && (
            <div>
              <label className={lc}>CURP</label>
              <input
                type="text" name="curp" maxLength={18}
                defaultValue={data.curp ?? ''}
                className={`${ic} uppercase font-mono`}
              />
            </div>
          )}
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={pending} className="flex items-center gap-1.5 bg-uady-blue text-white text-xs font-bold px-4 py-2 rounded-lg disabled:opacity-60">
              {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Guardar
            </button>
            <button type="button" onClick={() => setEditing(false)} disabled={pending} className="flex items-center gap-1.5 border border-gray-200 text-gray-500 text-xs font-medium px-4 py-2 rounded-lg">
              <X className="w-3.5 h-3.5" /> Cancelar
            </button>
          </div>
        </form>
      ) : (
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="flex flex-col gap-3">
            <Dato label="Fecha de Nacimiento" value={formatFechaLarga(data.fechaNacimiento)} />
            {accesoCompleto && <Dato label="CURP" value={data.curp} mono />}
          </div>
          <Dato label="Correo" value={data.correo} />
          <div className="flex flex-col gap-3">
            <Dato label="Teléfono Personal" value={data.telefonoPersonal} />
            {accesoCompleto && <Dato label="Teléfono Tutor / Familiar" value={data.telefonoTutor} />}
          </div>
        </dl>
      )}
    </CardShell>
  )
}

// ─── Datos Médicos (privada) ──────────────────────────────────────────────────
// Solo se renderiza este componente cuando el visitante tiene acceso completo
// (ADMIN o el propio atleta) — un compañero de equipo nunca lo recibe.

export interface MedicaData {
  nss: string | null
  seguroAseguradora: string | null
  seguroPoliza: string | null
  seguroTitular: string | null
}

export function CardMedica({
  atletaId, data, canEdit,
}: { atletaId: string; data: MedicaData; canEdit: boolean }) {
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const handleSave = (formData: FormData) => {
    setError(null)
    const payload: DatosPrivados = {
      nss: (formData.get('nss') as string) || null,
      seguroAseguradora: (formData.get('seguroAseguradora') as string) || null,
      seguroPoliza: (formData.get('seguroPoliza') as string) || null,
      seguroTitular: (formData.get('seguroTitular') as string) || null,
    }
    startTransition(async () => {
      try {
        await actualizarDatosPrivados(atletaId, payload)
        setEditing(false)
      } catch (e) {
        setError((e as Error).message || 'Error al guardar los cambios.')
      }
    })
  }

  return (
    <CardShell title="Datos Médicos" privateLabel canEdit={canEdit} onEditClick={() => setEditing(true)}>
      {editing ? (
        <form action={handleSave} className="space-y-3">
          <div>
            <label className={lc}>NSS</label>
            <input
              type="text" name="nss" maxLength={11} minLength={11} inputMode="numeric"
              defaultValue={data.nss ?? ''}
              className={`${ic} ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''}`}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={lc}>Aseguradora</label>
              <input type="text" name="seguroAseguradora" defaultValue={data.seguroAseguradora ?? ''} className={ic} />
            </div>
            <div>
              <label className={lc}>Póliza</label>
              <input type="text" name="seguroPoliza" defaultValue={data.seguroPoliza ?? ''} className={ic} />
            </div>
            <div>
              <label className={lc}>Titular</label>
              <input type="text" name="seguroTitular" defaultValue={data.seguroTitular ?? ''} className={ic} />
            </div>
          </div>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={pending} className="flex items-center gap-1.5 bg-uady-blue text-white text-xs font-bold px-4 py-2 rounded-lg disabled:opacity-60">
              {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Guardar
            </button>
            <button type="button" onClick={() => setEditing(false)} disabled={pending} className="flex items-center gap-1.5 border border-gray-200 text-gray-500 text-xs font-medium px-4 py-2 rounded-lg">
              <X className="w-3.5 h-3.5" /> Cancelar
            </button>
          </div>
        </form>
      ) : (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <Dato label="NSS" value={data.nss} />
          <Dato
            label="Seguro Médico Privado"
            value={[data.seguroAseguradora, data.seguroPoliza, data.seguroTitular].filter(Boolean).join(' · ') || null}
          />
        </dl>
      )}
    </CardShell>
  )
}
