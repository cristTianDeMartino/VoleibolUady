// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// useActionState llama a la action; basta con un stub que no haga nada.
vi.mock('@/actions/lesiones', () => ({
  createLesion: vi.fn(async () => ({ error: null })),
}))

import RegistrarLesionForm from './RegistrarLesionForm'

describe('RegistrarLesionForm', () => {
  it('renderiza los tres campos requeridos y el botón de envío', () => {
    render(<RegistrarLesionForm />)

    expect(screen.getByText(/fecha de consulta/i)).toBeInTheDocument()
    expect(screen.getByText(/^diagnóstico/i)).toBeInTheDocument()
    expect(screen.getByText(/tratamiento a seguir/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /registrar lesión/i })).toBeInTheDocument()
  })

  it('el input de fecha tiene como valor por defecto la fecha de hoy', () => {
    render(<RegistrarLesionForm />)
    const hoy = new Date().toISOString().slice(0, 10)
    const fecha = document.querySelector('input[name="fechaConsulta"]') as HTMLInputElement
    expect(fecha).not.toBeNull()
    expect(fecha.value).toBe(hoy)
  })
})
