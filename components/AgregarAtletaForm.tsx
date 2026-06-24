'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createAtleta } from '@/actions/atletas'
import { POSICIONES } from '@/lib/constants/posiciones'
import { aniosDesde2000 } from '@/lib/validation'

const tallas = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const facultades = [
  'Facultad de Medicina',
  'Facultad de Ingeniería',
  'Facultad de Ingeniería Química',
  'Facultad de Derecho',
  'Facultad de Contaduría y Administración',
  'Facultad de Economía',
  'Facultad de Psicología',
  'Facultad de Arquitectura',
  'Facultad de Enfermería',
  'Facultad de Nutrición',
  'Facultad de Odontología',
  'Facultad de Matemáticas',
  'Facultad de Química',
  'Facultad de Biología',
  'Facultad de Educación',
  'Facultad de Ciencias Antropológicas',
]

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-uady-blue px-5 py-3 flex items-center gap-2">
        <span>{icon}</span>
        <h3 className="font-bold text-white text-sm">{title}</h3>
      </div>
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

function Field({
  label, name, required, type = 'text', placeholder, children, span2, error,
  pattern, maxLength, minLength, inputMode,
}: {
  label: string; name: string; required?: boolean; type?: string;
  placeholder?: string; children?: React.ReactNode; span2?: boolean; error?: string;
  pattern?: string; maxLength?: number; minLength?: number; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  return (
    <div className={span2 ? 'md:col-span-2' : ''}>
      <label className="block text-xs font-bold text-gray-600 mb-1">
        {label} {required && <span className="text-uady-gold">*</span>}
      </label>
      {children ?? (
        <input
          type={type}
          name={name}
          required={required}
          placeholder={placeholder}
          pattern={pattern}
          maxLength={maxLength}
          minLength={minLength}
          inputMode={inputMode}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-all ${
            error ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-uady-blue focus:ring-uady-blue'
          }`}
        />
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

const initialState = { error: null }

export default function AgregarAtletaForm() {
  const [state, formAction, isPending] = useActionState(createAtleta, initialState)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [rol, setRol] = useState<'JUGADOR' | 'ADMIN'>('JUGADOR')
  const [hasSavedOnce, setHasSavedOnce] = useState(false)
  const [claveModal, setClaveModal] = useState<{ nombre: string; clave: string } | null>(null)
  const [copiado, setCopiado] = useState(false)

  const formRef = useRef<HTMLFormElement>(null)
  const rolSelectRef = useRef<HTMLSelectElement>(null)

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPhotoPreview(URL.createObjectURL(file))
  }

  // Tras un guardado exitoso: modal bloqueante con la clave — el reset real
  // del formulario se hace hasta que el admin cierra el modal (la clave no
  // vuelve a mostrarse, así que no debe perderse por un reset prematuro).
  useEffect(() => {
    if (!state.success || !state.claveGenerada) return
    setClaveModal({ nombre: state.nombreGuardado ?? '', clave: state.claveGenerada })
  }, [state])

  const cerrarModalClave = () => {
    setClaveModal(null)
    setCopiado(false)
    formRef.current?.reset()
    setRol('JUGADOR')
    setPhotoPreview(null)
    setHasSavedOnce(true)
    rolSelectRef.current?.focus()
  }

  const copiarClave = () => {
    if (!claveModal) return
    navigator.clipboard.writeText(claveModal.clave)
    setCopiado(true)
  }

  const fieldError = (name: string) => (state.field === name ? state.error ?? undefined : undefined)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Modal bloqueante con la clave de acceso — se muestra una sola vez */}
      {claveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              Atleta registrado — guarda esta clave
            </h2>
            <p className="text-sm text-gray-500 mb-4">{claveModal.nombre}</p>
            <p className="font-mono text-4xl tracking-[0.5em] bg-gray-100 rounded-lg px-6 py-4 text-center text-uady-blue mb-4">
              {claveModal.clave}
            </p>
            <p className="text-xs text-red-600 mb-4">
              ⚠️ Esta clave no volverá a mostrarse. Anótala o descarga el Excel de claves desde Gestión.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={copiarClave}
                className="text-sm font-semibold text-uady-blue border border-uady-blue/20 px-4 py-2 rounded-lg hover:bg-uady-blue/10 transition-all"
              >
                {copiado ? '✓ Copiada' : 'Copiar clave'}
              </button>
              <button
                type="button"
                onClick={cerrarModalClave}
                className="bg-uady-blue text-white text-sm font-bold px-4 py-2 rounded-lg hover:brightness-110 transition-all"
              >
                Entendido, cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/atletas"
          className="text-uady-blue hover:text-uady-gold transition-colors text-sm font-semibold flex items-center gap-1"
        >
          ← Regresar al Roster
        </Link>
        <span className="text-gray-300">|</span>
        <div className="flex items-center gap-2">
          <div className="w-1 h-7 bg-uady-gold rounded-full" />
          <h1 className="text-2xl font-black text-uady-blue">Agregar Atleta</h1>
        </div>
      </div>

      {state.error && !state.field && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2">
          <span>⚠️</span> {state.error}
        </div>
      )}

      <form ref={formRef} action={formAction} className="space-y-5">

        {/* Paso 1 — Rol en el Sistema: selector maestro, destacado al inicio */}
        <div className="bg-uady-blue rounded-xl p-5 shadow-sm">
          <p className="text-uady-gold text-xs font-bold uppercase tracking-wider mb-2">Paso 1</p>
          <label className="block text-sm font-bold text-white mb-1.5">Rol en el Sistema</label>
          <select
            ref={rolSelectRef}
            name="rol"
            defaultValue="JUGADOR"
            onChange={(e) => setRol(e.target.value as 'JUGADOR' | 'ADMIN')}
            className="w-full md:w-72 border border-white/20 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-uady-gold transition-all text-gray-700"
          >
            <option value="JUGADOR">JUGADOR (Atleta)</option>
            <option value="ADMIN">ADMINISTRADOR</option>
          </select>
          <p className="text-blue-200 text-xs mt-2">
            Define qué campos aplican al resto del formulario.
          </p>
        </div>

        {/* Sección 1: Datos Personales */}
        <SectionCard title="Datos Personales" icon="👤">
          <Field label="Nombre(s)" name="nombre" required placeholder="Ej. Ana Lucía" error={fieldError('nombre')} />
          <Field label="Apellidos" name="apellidos" required placeholder="Ej. García Pérez" error={fieldError('apellidos')} />
          {rol === 'JUGADOR' && (
            <>
              <Field
                label="Matrícula"
                name="matricula"
                required
                placeholder="Matrícula del atleta"
                pattern="[0-9]*"
                inputMode="numeric"
                error={fieldError('matricula')}
              />
              <Field label="Posición" name="posicion" required error={fieldError('posicion')}>
                <select
                  name="posicion"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all text-gray-700"
                >
                  <option value="">Seleccionar posición...</option>
                  {POSICIONES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </Field>
            </>
          )}

          {/* Género — único dato de sexo/rama; "rama" se deriva en el servidor */}
          <Field label="Género" name="genero" required>
            <div className="flex gap-3 mt-1">
              {[{ val: 'F', label: 'Femenino' }, { val: 'M', label: 'Masculino' }].map((g) => (
                <label key={g.val} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="genero"
                    value={g.val}
                    defaultChecked={g.val === 'F'}
                    required
                    className="accent-uady-blue w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-uady-blue transition-colors">
                    {g.label}
                  </span>
                </label>
              ))}
            </div>
          </Field>

          {rol === 'JUGADOR' && (
            <Field label="Foto del Atleta" name="foto">
              <div className="flex items-center gap-3">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="Preview" className="w-12 h-12 rounded-full object-cover border-2 border-uady-blue" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-uady-blue/10 border-2 border-dashed border-uady-blue/30 flex items-center justify-center text-xl">
                    📷
                  </div>
                )}
                <input
                  type="file"
                  name="foto"
                  accept="image/*"
                  onChange={handlePhoto}
                  className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-uady-blue/10 file:text-uady-blue file:text-xs file:font-semibold hover:file:bg-uady-blue/20 transition-all"
                />
              </div>
            </Field>
          )}
        </SectionCard>

        {/* Sección 2: Datos Académicos — solo JUGADOR */}
        {rol === 'JUGADOR' && (
          <SectionCard title="Datos Académicos" icon="🎓">
            <Field label="Facultad" name="facultad" required error={fieldError('facultad')}>
              <select
                name="facultad"
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all text-gray-700"
              >
                <option value="">Seleccionar facultad...</option>
                {facultades.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </Field>
            <Field label="Semestre" name="semestre" required error={fieldError('semestre')}>
              <select
                name="semestre"
                required
                defaultValue=""
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-all text-gray-700 ${
                  fieldError('semestre') ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-uady-blue focus:ring-uady-blue'
                }`}
              >
                <option value="" disabled>Seleccionar semestre...</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((s) => (
                  <option key={s} value={s}>{s}°</option>
                ))}
              </select>
            </Field>
            <Field
              label="Director(a) de la Facultad"
              name="directorFacultad"
              required
              placeholder="Nombre completo del director"
              pattern="[A-Za-záéíóúÁÉÍÓÚüÜñÑ\s.'-]*"
              span2
              error={fieldError('directorFacultad')}
            />
          </SectionCard>
        )}

        {/* Sección 2.5: Roster y Uniforme — solo JUGADOR */}
        {rol === 'JUGADOR' && (
          <SectionCard title="Roster y Uniforme" icon="🎽">
            <Field label="Número de Uniforme" name="numUniforme" type="number" placeholder="Opcional" />
            <Field label="Año de Ingreso" name="anioIngreso" required error={fieldError('anioIngreso')}>
              <select
                name="anioIngreso"
                required
                defaultValue=""
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-all text-gray-700 ${
                  fieldError('anioIngreso') ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-uady-blue focus:ring-uady-blue'
                }`}
              >
                <option value="" disabled>Seleccionar año...</option>
                {aniosDesde2000().map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="Talla Playera" name="tallaPlayera">
              <select name="tallaPlayera" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all text-gray-700">
                <option value="">Seleccionar...</option>
                {tallas.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Talla Short" name="tallaShort">
              <select name="tallaShort" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all text-gray-700">
                <option value="">Seleccionar...</option>
                {tallas.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Talla Pants" name="tallaPants">
              <select name="tallaPants" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all text-gray-700">
                <option value="">Seleccionar...</option>
                {tallas.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Talla Chamarra" name="tallaChamarra">
              <select name="tallaChamarra" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all text-gray-700">
                <option value="">Seleccionar...</option>
                {tallas.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </SectionCard>
        )}

        {/* Sección 3: Datos de Contacto */}
        <SectionCard title="Datos de Contacto" icon="📞">
          <Field
            label="Teléfono Personal"
            name="telefonoPersonal"
            required
            type="tel"
            placeholder="10 dígitos"
            maxLength={10}
            inputMode="numeric"
            error={fieldError('telefonoPersonal')}
          />
          {rol === 'JUGADOR' ? (
            <Field
              label="Teléfono Tutor / Familiar"
              name="telefonoTutor"
              required
              type="tel"
              placeholder="10 dígitos"
              maxLength={10}
              inputMode="numeric"
              error={fieldError('telefonoTutor')}
            />
          ) : (
            <Field
              label="Correo"
              name="correo"
              required
              type="email"
              placeholder="usuario@correo.uady.mx"
              error={fieldError('correo')}
            />
          )}
        </SectionCard>

        {/* Sección 4: Datos Médicos — solo JUGADOR */}
        {rol === 'JUGADOR' && (
          <SectionCard title="Datos Médicos" icon="🏥">
            <Field
              label="Número de Seguro Social (NSS)"
              name="nss"
              required
              placeholder="11 dígitos"
              maxLength={11}
              minLength={11}
              inputMode="numeric"
              error={fieldError('nss')}
            />
            <Field label="Aseguradora (Seguro Privado)" name="seguroAseguradora" placeholder="Opcional" />
            <Field label="Póliza" name="seguroPoliza" placeholder="Opcional" />
            <Field label="Titular de la Póliza" name="seguroTitular" placeholder="Opcional" />
          </SectionCard>
        )}

        {/* Submit */}
        <div className="flex gap-3 justify-end pt-2">
          <Link
            href="/atletas"
            className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          {hasSavedOnce && (
            <Link
              href="/atletas"
              className="px-6 py-2.5 border border-uady-blue rounded-lg text-sm font-bold text-uady-blue hover:bg-uady-blue hover:text-white transition-colors"
            >
              Terminar y salir
            </Link>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="bg-uady-gold text-uady-blue font-bold px-8 py-2.5 rounded-lg text-sm hover:brightness-110 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isPending ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Guardando...
              </>
            ) : (
              rol === 'ADMIN' ? '+ Guardar Administrador' : '+ Guardar Atleta'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
