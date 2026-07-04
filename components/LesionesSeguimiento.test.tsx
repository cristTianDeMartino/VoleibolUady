// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import LesionesSeguimiento, { type LesionRow } from './LesionesSeguimiento'

const darDeAltaMock = vi.fn(async () => ({ success: true }))

const activa: LesionRow = {
  id: 'a1',
  fechaConsulta: '2026-05-20',
  diagnostico: 'Esguince de tobillo',
  tratamiento: 'Reposo y vendaje',
  estatus: 'Activo',
  fechaAlta: null,
  atleta: { nombre: 'Ana', apellidos: 'García' },
}

const alta: LesionRow = {
  id: 'h1',
  fechaConsulta: '2026-04-01',
  diagnostico: 'Tendinitis rotuliana',
  tratamiento: 'Fisioterapia',
  estatus: 'Alta',
  fechaAlta: '2026-04-20',
  atleta: { nombre: 'Laura', apellidos: 'Martínez' },
}

beforeEach(() => vi.clearAllMocks())

describe('LesionesSeguimiento — vista del JUGADOR', () => {
  it('muestra la lesión activa con badge "Activo" y botón "Dar de Alta"', () => {
    render(<LesionesSeguimiento lesiones={[activa, alta]} isAdmin={false} />)
    expect(screen.getByText('Esguince de tobillo')).toBeInTheDocument()
    expect(screen.getByText('Activo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dar de alta/i })).toBeInTheDocument()
  })

  it('NO muestra el nombre del atleta (el jugador solo ve lo suyo)', () => {
    render(<LesionesSeguimiento lesiones={[activa]} isAdmin={false} altaAction={darDeAltaMock} />)
    expect(screen.queryByText('Ana García')).not.toBeInTheDocument()
  })

  it('al cambiar al tab Historial muestra la tabla sin acciones', async () => {
    const user = userEvent.setup()
    render(<LesionesSeguimiento lesiones={[activa, alta]} isAdmin={false} />)

    await user.click(screen.getByRole('button', { name: /historial/i }))

    expect(screen.getByText('Tendinitis rotuliana')).toBeInTheDocument()
    // El historial no tiene botón de acción
    expect(screen.queryByRole('button', { name: /dar de alta/i })).not.toBeInTheDocument()
  })

  it('invoca darDeAltaLesion con el id correcto al pulsar el botón', async () => {
    const user = userEvent.setup()
    render(<LesionesSeguimiento lesiones={[activa]} isAdmin={false} />)

    await user.click(screen.getByRole('button', { name: /dar de alta/i }))
    await waitFor(() => expect(darDeAltaMock).toHaveBeenCalledWith('a1'))
  })
})

describe('LesionesSeguimiento — vista del ADMIN', () => {
  it('muestra el nombre del atleta en la tarjeta activa', () => {
    render(<LesionesSeguimiento lesiones={[activa]} isAdmin={true} />)
    expect(screen.getByText('Ana García')).toBeInTheDocument()
  })

  it('en el historial incluye la columna Atleta', async () => {
    const user = userEvent.setup()
    render(<LesionesSeguimiento lesiones={[alta]} isAdmin={true} />)
    await user.click(screen.getByRole('button', { name: /historial/i }))
    expect(screen.getByText('Laura Martínez')).toBeInTheDocument()
  })
})

describe('LesionesSeguimiento — estados vacíos', () => {
  it('muestra el estado vacío cuando no hay lesiones activas', () => {
    render(<LesionesSeguimiento lesiones={[alta]} isAdmin={false} />)
    expect(screen.getByText(/no hay lesiones activas/i)).toBeInTheDocument()
  })
})
