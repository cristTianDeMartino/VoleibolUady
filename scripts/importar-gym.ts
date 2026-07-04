// Carga el programa de gimnasio (3 etapas × 4 ejercicios × sus semanas).
// Uso: npm run importar-gym            → aborta si ya existen etapas con estos nombres
//      npm run importar-gym -- --force → borra (con cascade) y recrea esas etapas
import 'dotenv/config'
import { prisma } from '../lib/prisma'

interface Semana {
  numeroSemana: number
  fechaInicio: Date
  fechaFin: Date
  series: number
  rpt: string
  rir: number | null
}

interface Etapa {
  nombre: string
  fechaInicio: Date
  fechaFin: Date
  semanas: Semana[]
}

const EJERCICIOS = ['SENTADILLA', 'PESO MUERTO', 'PRESS PECHO', 'REMO']

const etapas: Etapa[] = [
  {
    nombre: 'Adaptación Anatómica',
    fechaInicio: new Date('2025-06-29'),
    fechaFin: new Date('2025-07-12'),
    semanas: [
      { numeroSemana: 5, fechaInicio: new Date('2025-06-29'), fechaFin: new Date('2025-07-05'), series: 11, rpt: '15-18', rir: 4 },
      { numeroSemana: 6, fechaInicio: new Date('2025-07-06'), fechaFin: new Date('2025-07-12'), series: 12, rpt: '15-18', rir: 4 },
    ],
  },
  {
    nombre: 'Fuerza Máxima',
    fechaInicio: new Date('2025-07-13'),
    fechaFin: new Date('2025-08-23'),
    semanas: [
      { numeroSemana: 1, fechaInicio: new Date('2025-07-13'), fechaFin: new Date('2025-07-19'), series: 6, rpt: '8', rir: 3 },
      { numeroSemana: 2, fechaInicio: new Date('2025-07-20'), fechaFin: new Date('2025-07-26'), series: 6, rpt: '6', rir: 2 },
      { numeroSemana: 3, fechaInicio: new Date('2025-07-27'), fechaFin: new Date('2025-08-02'), series: 7, rpt: '8', rir: 3 },
      { numeroSemana: 4, fechaInicio: new Date('2025-08-03'), fechaFin: new Date('2025-08-09'), series: 7, rpt: '6', rir: 2 },
      { numeroSemana: 5, fechaInicio: new Date('2025-08-10'), fechaFin: new Date('2025-08-16'), series: 8, rpt: '8', rir: 3 },
      { numeroSemana: 6, fechaInicio: new Date('2025-08-17'), fechaFin: new Date('2025-08-23'), series: 8, rpt: '6', rir: 2 },
    ],
  },
  {
    nombre: 'Hipertrofia',
    fechaInicio: new Date('2025-08-24'),
    fechaFin: new Date('2025-11-01'),
    semanas: [
      { numeroSemana: 1, fechaInicio: new Date('2025-08-24'), fechaFin: new Date('2025-08-30'), series: 9, rpt: '15', rir: 3 },
      { numeroSemana: 2, fechaInicio: new Date('2025-08-31'), fechaFin: new Date('2025-09-06'), series: 9, rpt: '12-15', rir: 2 },
      { numeroSemana: 3, fechaInicio: new Date('2025-09-07'), fechaFin: new Date('2025-09-13'), series: 9, rpt: '12', rir: 2 },
      { numeroSemana: 4, fechaInicio: new Date('2025-09-14'), fechaFin: new Date('2025-09-20'), series: 10, rpt: '12-15', rir: 3 },
      { numeroSemana: 5, fechaInicio: new Date('2025-09-21'), fechaFin: new Date('2025-09-27'), series: 10, rpt: '10-12', rir: 2 },
      { numeroSemana: 6, fechaInicio: new Date('2025-09-28'), fechaFin: new Date('2025-10-04'), series: 10, rpt: '10', rir: 2 },
      { numeroSemana: 7, fechaInicio: new Date('2025-10-05'), fechaFin: new Date('2025-10-11'), series: 11, rpt: '12-10', rir: 3 },
      { numeroSemana: 8, fechaInicio: new Date('2025-10-12'), fechaFin: new Date('2025-10-18'), series: 11, rpt: '10', rir: 2 },
      { numeroSemana: 9, fechaInicio: new Date('2025-10-19'), fechaFin: new Date('2025-10-25'), series: 12, rpt: '8-10', rir: 3 },
      { numeroSemana: 10, fechaInicio: new Date('2025-10-26'), fechaFin: new Date('2025-11-01'), series: 12, rpt: '8', rir: 3 },
    ],
  },
]

async function main() {
  const force = process.argv.includes('--force')
  console.log('🏋️ Cargando programa de gimnasio...')

  const nombres = etapas.map((e) => e.nombre)
  const existentes = await prisma.etapaEntrenamiento.findMany({ where: { nombre: { in: nombres } } })

  if (existentes.length > 0) {
    if (!force) {
      console.error(
        `❌ Ya existen etapas con estos nombres: ${existentes.map((e) => e.nombre).join(', ')}.\n` +
          `   Corre de nuevo con --force para borrarlas y recrearlas: npm run importar-gym -- --force`
      )
      process.exit(1)
    }
    // onDelete: Cascade en el schema borra en cadena EjercicioPrincipal → DetalleSemana.
    await prisma.etapaEntrenamiento.deleteMany({ where: { nombre: { in: nombres } } })
    console.log(`🗑️  ${existentes.length} etapa(s) existente(s) borrada(s) por --force.`)
  }

  let totalDetalles = 0

  for (const etapaData of etapas) {
    const etapa = await prisma.etapaEntrenamiento.create({
      data: { nombre: etapaData.nombre, fechaInicio: etapaData.fechaInicio, fechaFin: etapaData.fechaFin },
    })
    console.log(`✅ Etapa creada: ${etapa.nombre}`)

    for (const nombreEjercicio of EJERCICIOS) {
      const ejercicio = await prisma.ejercicioPrincipal.create({
        data: {
          nombre: nombreEjercicio,
          fechaInicio: etapaData.fechaInicio,
          fechaFin: etapaData.fechaFin,
          etapaId: etapa.id,
        },
      })

      for (const semana of etapaData.semanas) {
        await prisma.detalleSemana.create({
          data: {
            ejercicioId: ejercicio.id,
            numeroSemana: semana.numeroSemana,
            fechaInicioSemana: semana.fechaInicio,
            fechaFinSemana: semana.fechaFin,
            series: semana.series,
            rpt: String(semana.rpt),
            rir: semana.rir ?? null,
          },
        })
        totalDetalles++
      }
      console.log(`   💪 ${nombreEjercicio}: ${etapaData.semanas.length} semanas cargadas`)
    }
  }

  const totalSemanas = etapas.reduce((sum, e) => sum + e.semanas.length, 0)
  console.log('\n🎉 Programa de gimnasio cargado exitosamente')
  console.log(`   Etapas: ${etapas.length}`)
  console.log(`   Ejercicios por etapa: ${EJERCICIOS.length}`)
  console.log(`   Total semanas: ${totalSemanas} (${etapas.map((e) => e.semanas.length).join(' + ')})`)
  console.log(`   Total registros DetalleSemana: ${EJERCICIOS.length} × ${totalSemanas} = ${totalDetalles}`)

  // Verificación final contra BD (no solo el contador en memoria).
  const [etapasCount, ejerciciosCount, detallesCount] = await Promise.all([
    prisma.etapaEntrenamiento.count({ where: { nombre: { in: nombres } } }),
    prisma.ejercicioPrincipal.count({ where: { etapa: { nombre: { in: nombres } } } }),
    prisma.detalleSemana.count({ where: { ejercicio: { etapa: { nombre: { in: nombres } } } } }),
  ])

  const esperado = { etapas: 3, ejercicios: 12, detalles: 72 }
  const ok = etapasCount === esperado.etapas && ejerciciosCount === esperado.ejercicios && detallesCount === esperado.detalles

  console.log(`\n🔎 Verificación en BD: ${etapasCount} etapas, ${ejerciciosCount} ejercicios, ${detallesCount} DetalleSemana`)
  console.log(ok ? '✅ Coincide con lo esperado (3 / 12 / 72).' : `❌ NO coincide con lo esperado (${esperado.etapas} / ${esperado.ejercicios} / ${esperado.detalles}).`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
