// Puebla las 5 "Notas de Programación" que antes vivían hardcodeadas en
// components/GimnasioClient.tsx. Uso: npm run seed-notas
// Idempotente: si ya hay notas en la tabla, no duplica nada.
import 'dotenv/config'
import { prisma } from '../lib/prisma'

const NOTAS = [
  'RIR: Repeticiones en reserva.',
  'El peso que permita llegar a las RPT indicadas con los RIR de reserva propuestos.',
  'En todos los ejercicios cuidar que el peso utilizado NO deforme la técnica, pero que sea suficientemente intenso para reproducir un esfuerzo significativo.',
  'Los ejercicios accesorios se deberán hacer semanalmente en relación al tiempo con el que dispongan, SIN sobrepasar las 16 series semanales por tren (ejemplo: 4 de Bíceps, 4 de Tríceps, 4 de Dorsal y 4 de Hombro = 16 series).',
  'Las series de potencia se ejecutarán con el peso que permita realizar el número de repeticiones indicado, de manera explosiva, sin deformar la técnica.',
]

async function main() {
  const existentes = await prisma.notaProgramacion.count()
  if (existentes > 0) {
    console.log(`⏭ Ya existen ${existentes} notas en BD — no se vuelve a poblar.`)
    return
  }

  for (let i = 0; i < NOTAS.length; i++) {
    await prisma.notaProgramacion.create({ data: { contenido: NOTAS[i], orden: i + 1 } })
  }
  console.log(`✅ ${NOTAS.length} notas de programación creadas.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
