'use client'

import { useState, useTransition } from 'react'
import { Pencil, X, Loader2, Check } from 'lucide-react'
import { actualizarDatosGenerales, actualizarDatosPrivados } from '@/app/actions/atleta.actions'
import type { DatosGenerales, DatosPrivados } from '@/app/actions/atleta.actions'
import { POSICIONES, labelPosicion, type PosicionValue } from '@/lib/constants/posiciones'
import { aniosDesde2000 } from '@/lib/validation'

const TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const ic = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all bg-white'
const lc = 'block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1'

function Dato({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{label}</dt>
      <dd className="text-gray-700 mt-0.5">{value !== null && value !== undefined && value !== '' ? value : <span className="text-gray-300 italic">—</span>}</dd>
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

// ─── Información de Contacto ───────────────────────────────────────────────────
// 'completo' (ADMIN o el propio atleta): clave/correo/tel. personal/tel. tutor,
// con badge Privado. 'reducido' (compañero de equipo): solo correo y tel.
// personal, sin badge — son los únicos datos de contacto públicos dentro del
// equipo. La forma de los datos en cada variante evita que el cliente reciba
// campos que no le corresponden (p. ej. teléfono del tutor nunca se serializa
// para un compañero).

export interface ContactoDataCompleta {
  correo: string | null
  telefonoPersonal: string
  telefonoTutor: string
}

export interface ContactoDataReducida {
  correo: string | null
  telefonoPersonal: string
}

type CardContactoProps =
  | { atletaId: string; canEdit: boolean; variant: 'completo'; data: ContactoDataCompleta }
  | { atletaId: string; variant: 'reducido'; data: ContactoDataReducida }

export function CardContacto(props: CardContactoProps) {
  const { atletaId, variant, data } = props
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  if (variant === 'reducido') {
    return (
      <CardShell title="Información de Contacto" accent="blue" canEdit={false}>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <Dato label="Correo" value={data.correo} />
          <Dato label="Teléfono Personal" value={data.telefonoPersonal} />
        </dl>
      </CardShell>
    )
  }

  const handleSave = (formData: FormData) => {
    setError(null)
    const payload: DatosGenerales = {
      correo: (formData.get('correo') as string) || null,
      telefonoPersonal: (formData.get('telefonoPersonal') as string) || data.telefonoPersonal,
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
    <CardShell title="Información de Contacto" accent="blue" privateLabel canEdit={props.canEdit} onEditClick={() => setEditing(true)}>
      {editing ? (
        <form action={handleSave} className="space-y-3">
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
          <Dato label="Correo" value={data.correo} />
          <Dato label="Teléfono Personal" value={data.telefonoPersonal} />
          <Dato label="Teléfono Tutor / Familiar" value={data.telefonoTutor} />
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
