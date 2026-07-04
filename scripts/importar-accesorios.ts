// Carga el catálogo de ejercicios accesorios (tren inferior / tren superior).
// Uso: npm run importar-accesorios
// Idempotente: si un (nombre, tipo) ya existe, se salta en vez de duplicarlo.
import 'dotenv/config'
import { prisma } from '../lib/prisma'

type Tipo = 'TREN_INFERIOR' | 'TREN_SUPERIOR'

const TREN_INFERIOR = [
  'Extensión de cuadriceps',
  'Curl de pierna',
  'Sentadillas bulgaras',
  'Pantorrillas',
  'Aductores',
  'Abductores',
  'Tibial',
]

const TREN_SUPERIOR = [
  'Press de hombro',
  'Elevaciones laterales',
  'Biceps',
  'Triceps',
  'Pull over',
  'Dorsal',
  'Trapecios',
]

async function cargar(nombres: string[], tipo: Tipo) {
  let creados = 0
  let saltados = 0

  for (const nombre of nombres) {
    const existente = await prisma.ejercicioAccesorio.findFirst({ where: { nombre, tipo } })
    if (existente) {
      saltados++
      continue
    }
    await prisma.ejercicioAccesorio.create({ data: { nombre, tipo } })
    creados++
  }

  console.log(`   ${tipo}: ${creados} creados, ${saltados} ya existían`)
}

async function main() {
  console.log('💪 Cargando ejercicios accesorios...')
  await cargar(TREN_INFERIOR, 'TREN_INFERIOR')
  await cargar(TREN_SUPERIOR, 'TREN_SUPERIOR')

  const total = await prisma.ejercicioAccesorio.count({
    where: { tipo: { in: ['TREN_INFERIOR', 'TREN_SUPERIOR'] } },
  })
  console.log(`\n✅ Total de ejercicios accesorios en BD: ${total}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
