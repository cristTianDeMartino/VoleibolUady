import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'

// Mockeamos las dependencias de Next (no disponibles fuera del runtime de Next),
// pero usamos el cliente Prisma REAL contra la BD SQLite de desarrollo.
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }))

import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createLesion, darDeAltaLesion } from './lesiones'
import type { Session } from '@/lib/auth'

const mockSession = vi.mocked(getSession)

// Sesiones de prueba
const sesionJugador = (id: string): Session => ({ id, rol: 'JUGADOR', nombre: 'Test Jugador' })
const sesionAdmin: Session = { id: 'admin-test-id', rol: 'ADMIN', nombre: 'Test Admin' }

// Construye un FormData a partir de un objeto plano
function fd(data: Record<string, string>): FormData {
  const f = new FormData()
  for (const [k, v] of Object.entries(data)) f.append(k, v)
  return f
}

const camposValidos = {
  fechaConsulta: '2026-05-20',
  diagnostico: 'Esguince de tobillo grado I',
  tratamiento: 'Reposo y vendaje funcional por 7 días',
}

let jugadorId: string
let otroJugadorId: string

beforeAll(async () => {
  // Dos jugadores de prueba aislados (codigoAcceso único). El cascade
  // elimina sus lesiones al borrarlos en afterAll.
  const jugador = await prisma.atleta.create({
    data: {
      nombre: 'Test', apellidos: 'Jugador', genero: 'F', rama: 'Femenil',
      posicion: 'Libero', facultad: 'Test', directorFacultad: 'Test',
      semestre: 1, telefonoPersonal: '0', telefonoTutor: '0', nss: '0',
      codigoAcceso: `TEST_JUGADOR_${Date.now()}`, rol: 'JUGADOR',
    },
  })
  const otro = await prisma.atleta.create({
    data: {
      nombre: 'Otro', apellidos: 'Jugador', genero: 'M', rama: 'Varonil',
      posicion: 'Central', facultad: 'Test', directorFacultad: 'Test',
      semestre: 1, telefonoPersonal: '0', telefonoTutor: '0', nss: '0',
      codigoAcceso: `TEST_OTRO_${Date.now()}`, rol: 'JUGADOR',
    },
  })
  jugadorId = jugador.id
  otroJugadorId = otro.id
})

afterAll(async () => {
  await prisma.atleta.deleteMany({
    where: { id: { in: [jugadorId, otroJugadorId] } },
  })
  await prisma.$disconnect()
})

beforeEach(async () => {
  vi.clearAllMocks()
  // BD limpia de lesiones de prueba antes de cada caso
  await prisma.lesion.deleteMany({
    where: { atletaId: { in: [jugadorId, otroJugadorId] } },
  })
})

describe('createLesion — registro y control de acceso', () => {
  it('rechaza si no hay sesión', async () => {
    mockSession.mockResolvedValue(null)
    const res = await createLesion({ error: null }, fd(camposValidos))
    expect(res.error).toMatch(/iniciar sesión/i)
  })

  it('rechaza si el rol es ADMIN (el admin no reporta lesiones propias)', async () => {
    mockSession.mockResolvedValue(sesionAdmin)
    const res = await createLesion({ error: null }, fd(camposValidos))
    expect(res.error).toMatch(/jugadores/i)
  })

  it('rechaza si faltan campos obligatorios', async () => {
    mockSession.mockResolvedValue(sesionJugador(jugadorId))
    const res = await createLesion({ error: null }, fd({ fechaConsulta: '2026-05-20', diagnostico: '', tratamiento: '' }))
    expect(res.error).toMatch(/completa todos los campos/i)
  })

  it('rechaza una fecha de consulta inválida', async () => {
    mockSession.mockResolvedValue(sesionJugador(jugadorId))
    const res = await createLesion({ error: null }, fd({ ...camposValidos, fechaConsulta: 'no-es-fecha' }))
    expect(res.error).toMatch(/fecha de consulta no es válida/i)
  })

  it('crea la lesión con estatus "Activo" y sin fecha de alta, vinculada al jugador', async () => {
    mockSession.mockResolvedValue(sesionJugador(jugadorId))
    const res = await createLesion({ error: null }, fd(camposValidos))

    expect(res.error).toBeNull()
    expect(res.success).toBe(true)

    const lesion = await prisma.lesion.findFirst({ where: { atletaId: jugadorId } })
    expect(lesion).not.toBeNull()
    expect(lesion!.estatus).toBe('Activo')
    expect(lesion!.fechaAlta).toBeNull()
    expect(lesion!.diagnostico).toBe(camposValidos.diagnostico)
    expect(lesion!.atletaId).toBe(jugadorId)
  })
})

describe('darDeAltaLesion — transición de estado Activo → Alta', () => {
  // Crea una lesión activa para el jugador indicado y devuelve su id
  async function crearActiva(atletaId: string) {
    const l = await prisma.lesion.create({
      data: { atletaId, fechaConsulta: new Date('2026-05-01'), diagnostico: 'X', tratamiento: 'Y', estatus: 'Activo' },
    })
    return l.id
  }

  it('rechaza si no hay sesión', async () => {
    mockSession.mockResolvedValue(null)
    const id = await crearActiva(jugadorId)
    const res = await darDeAltaLesion(id)
    expect(res.error).toMatch(/sin permisos/i)
  })

  it('rechaza si la lesión no existe', async () => {
    mockSession.mockResolvedValue(sesionAdmin)
    const res = await darDeAltaLesion('id-inexistente')
    expect(res.error).toMatch(/no encontrada/i)
  })

  it('rechaza si un jugador intenta dar de alta una lesión ajena', async () => {
    mockSession.mockResolvedValue(sesionJugador(jugadorId))
    const idAjena = await crearActiva(otroJugadorId)
    const res = await darDeAltaLesion(idAjena)
    expect(res.error).toMatch(/sin permisos para dar de alta/i)

    // No debe haber cambiado de estado
    const lesion = await prisma.lesion.findUnique({ where: { id: idAjena } })
    expect(lesion!.estatus).toBe('Activo')
  })

  it('el jugador dueño da de alta su lesión: estatus "Alta" + fechaAlta', async () => {
    mockSession.mockResolvedValue(sesionJugador(jugadorId))
    const id = await crearActiva(jugadorId)

    const antes = new Date()
    const res = await darDeAltaLesion(id)
    expect(res.success).toBe(true)

    const lesion = await prisma.lesion.findUnique({ where: { id } })
    expect(lesion!.estatus).toBe('Alta')
    expect(lesion!.fechaAlta).toBeInstanceOf(Date)
    // La fecha de alta es del momento de la operación (con holgura de 1 min)
    expect(lesion!.fechaAlta!.getTime()).toBeGreaterThanOrEqual(antes.getTime() - 60_000)
  })

  it('el ADMIN puede dar de alta la lesión de cualquier atleta', async () => {
    mockSession.mockResolvedValue(sesionAdmin)
    const id = await crearActiva(otroJugadorId)
    const res = await darDeAltaLesion(id)
    expect(res.success).toBe(true)

    const lesion = await prisma.lesion.findUnique({ where: { id } })
    expect(lesion!.estatus).toBe('Alta')
  })

  it('rechaza dar de alta una lesión que ya está de alta (idempotencia de estado)', async () => {
    mockSession.mockResolvedValue(sesionAdmin)
    const id = await crearActiva(jugadorId)
    await darDeAltaLesion(id) // primera alta
    const res = await darDeAltaLesion(id) // segundo intento
    expect(res.error).toMatch(/ya está dada de alta/i)
  })
})
