'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { createAtleta } from '@/actions/atletas'

const posiciones = ['Libero', 'Armadora', 'Opuesta', 'Central', 'Banda']

const facultades = [
  'Facultad de Medicina',
  'Facultad de Ingeniería',
  'Facultad de Derecho',
  'Facultad de Contaduría y Administración',
  'Facultad de Psicología',
  'Facultad de Arquitectura',
  'Facultad de Enfermería',
  'Facultad de Nutrición',
  'Facultad de Odontología',
  'Facultad de Matemáticas',
  'Facultad de Química',
  'Facultad de Biología',
  'Facultad de Educación',
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
  label, name, required, type = 'text', placeholder, children, span2,
}: {
  label: string; name: string; required?: boolean; type?: string;
  placeholder?: string; children?: React.ReactNode; span2?: boolean;
}) {
  return (
    <div className={span2 ? 'md:col-span-2' : ''}>
      <label className="block text-xs font-bold text-gray-600 mb-1">
        {label} {required && <span className="text-uady-orange-cta">*</span>}
      </label>
      {children ?? (
        <input
          type={type}
          name={name}
          required={required}
          placeholder={placeholder}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all"
        />
      )}
    </div>
  )
}

export default function AgregarAtletaForm() {
  const [state, formAction, isPending] = useActionState(createAtleta, { error: null })
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPhotoPreview(URL.createObjectURL(file))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
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
          <div className="w-1 h-7 bg-uady-orange-cta rounded-full" />
          <h1 className="text-2xl font-black text-uady-blue">Agregar Atleta</h1>
        </div>
      </div>

      {state.error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2">
          <span>⚠️</span> {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-5">
        {/* Sección 1: Datos Personales */}
        <SectionCard title="Datos Personales" icon="👤">
          <Field label="Nombre(s)" name="nombre" required placeholder="Ej. Ana Lucía" />
          <Field label="Apellidos" name="apellidos" required placeholder="Ej. García Pérez" />
          <Field label="Posición" name="posicion" required>
            <select
              name="posicion"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all text-gray-700"
            >
              <option value="">Seleccionar posición...</option>
              {posiciones.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>

          {/* Rama */}
          <Field label="Rama" name="rama" required>
            <div className="flex gap-3 mt-1">
              {(['Femenil', 'Varonil'] as const).map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="rama"
                    value={r}
                    defaultChecked={r === 'Femenil'}
                    required
                    className="accent-uady-blue w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-uady-blue transition-colors">
                    {r === 'Femenil' ? '♀ Femenil' : '♂ Varonil'}
                  </span>
                </label>
              ))}
            </div>
          </Field>

          {/* Género */}
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
        </SectionCard>

        {/* Sección 2: Datos Académicos */}
        <SectionCard title="Datos Académicos" icon="🎓">
          <Field label="Facultad" name="facultad" required>
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
          <Field
            label="Semestre"
            name="semestre"
            required
            type="number"
            placeholder="1–12"
          />
          <Field
            label="Director(a) de la Facultad"
            name="directorFacultad"
            required
            placeholder="Nombre completo del director"
            span2
          />
        </SectionCard>

        {/* Sección 3: Datos de Contacto */}
        <SectionCard title="Datos de Contacto" icon="📞">
          <Field
            label="Teléfono Personal"
            name="telefonoPersonal"
            required
            type="tel"
            placeholder="10 dígitos"
          />
          <Field
            label="Teléfono Tutor / Familiar"
            name="telefonoTutor"
            required
            type="tel"
            placeholder="10 dígitos"
          />
        </SectionCard>

        {/* Sección 4: Datos Médicos y Acceso */}
        <SectionCard title="Datos Médicos y Acceso al Sistema" icon="🏥">
          <Field
            label="Número de Seguro Social (NSS)"
            name="nss"
            required
            placeholder="11 dígitos"
          />
          <Field
            label="Seguro Médico Privado"
            name="seguroPrivado"
            placeholder="Nombre de la aseguradora (opcional)"
          />
          <Field
            label="Código de Acceso"
            name="codigoAcceso"
            required
            placeholder="Clave única para iniciar sesión"
          />
          <Field label="Rol en el Sistema" name="rol">
            <select
              name="rol"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-uady-blue focus:ring-1 focus:ring-uady-blue transition-all text-gray-700"
            >
              <option value="JUGADOR">JUGADOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </Field>
        </SectionCard>

        {/* Submit */}
        <div className="flex gap-3 justify-end pt-2">
          <Link
            href="/atletas"
            className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="bg-uady-orange-cta text-white font-bold px-8 py-2.5 rounded-lg text-sm hover:brightness-110 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
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
              '+ Guardar Atleta'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
