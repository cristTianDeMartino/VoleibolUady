import { describe, it, expect } from 'vitest'
import { validarDirector } from './validation'

describe('validarDirector', () => {
  it('acepta nombres con guiones, puntos y apóstrofes', () => {
    expect(validarDirector('Dr. José Pérez-Gómez')).toBeNull()
    expect(validarDirector("María O'Connor")).toBeNull()
  })

  it('rechaza nombres con números', () => {
    expect(validarDirector('Juan123')).not.toBeNull()
  })
})
