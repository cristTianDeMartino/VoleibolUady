// Script temporal: limpia la BD de desarrollo antes de la carga masiva real.
// NO usa prisma migrate reset (no toca schema/migraciones). VideoGimnasio se conserva.
import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function main() {
  console.log('🧹 Limpiando base de datos...')

  const [
    claveAtleta,
    atletaPrivado,
    asistencia,
    lesion,
    citaMedica,
    atleta,
    evento,
    detalleSemana,
    ejercicioPrincipal,
    etapaEntrenamiento,
    ejercicioAccesorio,
    catalogoEjercicio,
    partido,
    sesionGimnasio,
  ] = await prisma.$transaction([
    // Dependencias de atletas primero
    prisma.claveAtleta.deleteMany(),
    prisma.atletaPrivado.deleteMany(),
    prisma.asistencia.deleteMany(),
    prisma.lesion.deleteMany(),
    prisma.citaMedica.deleteMany(),
    // Atletas
    prisma.atleta.deleteMany(),
    // Cronograma
    prisma.evento.deleteMany(),
    // Programa de pesas (en orden por dependencias)
    prisma.detalleSemana.deleteMany(),
    prisma.ejercicioPrincipal.deleteMany(),
    prisma.etapaEntrenamiento.deleteMany(),
    prisma.ejercicioAccesorio.deleteMany(),
    prisma.catalogoEjercicio.deleteMany(),
    // Partidos / récord de temporada
    prisma.partido.deleteMany(),
    // Sesiones de gimnasio
    prisma.sesionGimnasio.deleteMany(),
  ])

  console.log('✅ Limpieza completada:')
  console.log(`   ClaveAtleta eliminadas: ${claveAtleta.count}`)
  console.log(`   AtletaPrivado eliminados: ${atletaPrivado.count}`)
  console.log(`   Asistencias eliminadas: ${asistencia.count}`)
  console.log(`   Lesiones eliminadas: ${lesion.count}`)
  console.log(`   Citas médicas eliminadas: ${citaMedica.count}`)
  console.log(`   Atletas eliminados: ${atleta.count}`)
  console.log(`   Eventos eliminados: ${evento.count}`)
  console.log(`   Detalles de semana eliminados: ${detalleSemana.count}`)
  console.log(`   Ejercicios principales eliminados: ${ejercicioPrincipal.count}`)
  console.log(`   Etapas de entrenamiento eliminadas: ${etapaEntrenamiento.count}`)
  console.log(`   Ejercicios accesorios eliminados: ${ejercicioAccesorio.count}`)
  console.log(`   Catálogo de ejercicios eliminado: ${catalogoEjercicio.count}`)
  console.log(`   Partidos eliminados: ${partido.count}`)
  console.log(`   Sesiones de gimnasio eliminadas: ${sesionGimnasio.count}`)

  const videos = await prisma.videoGimnasio.count()
  console.log(`   Videos de YouTube: ${videos} registros conservados ✓`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
