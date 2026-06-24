import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const atletasSeed = [
  // Admin
  {
    nombre: 'Coordinador',
    apellidos: 'Técnico UADY',
    genero: 'M',
    posicion: null, // ADMIN — no tiene posición de juego
    facultad: 'Dirección de Deporte Universitario',
    directorFacultad: 'Rector UADY',
    semestre: 0,
    telefonoPersonal: '9999999999',
    telefonoTutor: '9999999999',
    nss: '000000000000',
    anioIngreso: 2015,
    codigoAcceso: 'VOLEIUADY',
    rol: 'ADMIN',
  },
  // Atletas Femeniles
  {
    nombre: 'Ana',
    apellidos: 'García Pérez',
    genero: 'F',
    posicion: 'LIBERO',
    facultad: 'Facultad de Medicina',
    directorFacultad: 'Dr. Jorge Cuevas Alpuche',
    semestre: 6,
    telefonoPersonal: '9991001001',
    telefonoTutor: '9991001002',
    nss: '332810760145',
    anioIngreso: 2023,
    codigoAcceso: 'ANA001',
    rol: 'JUGADOR',
  },
  {
    nombre: 'Laura',
    apellidos: 'Martínez Cen',
    genero: 'F',
    posicion: 'ACOMODO',
    facultad: 'Facultad de Psicología',
    directorFacultad: 'Dra. María Angélica Verdejo',
    semestre: 4,
    telefonoPersonal: '9992002001',
    telefonoTutor: '9992002002',
    nss: '541023891234',
    anioIngreso: 2024,
    codigoAcceso: 'LAURA002',
    rol: 'JUGADOR',
  },
  {
    nombre: 'Sofía',
    apellidos: 'López Uc',
    genero: 'F',
    posicion: 'OPUESTO',
    facultad: 'Facultad de Derecho',
    directorFacultad: 'Dr. Arturo Hernández Magaña',
    semestre: 8,
    telefonoPersonal: '9993003001',
    telefonoTutor: '9993003002',
    nss: '421890234567',
    anioIngreso: 2022,
    codigoAcceso: 'SOFIA003',
    rol: 'JUGADOR',
  },
  {
    nombre: 'María',
    apellidos: 'Hernández Dzul',
    genero: 'F',
    posicion: 'CENTRAL',
    facultad: 'Facultad de Ingeniería',
    directorFacultad: 'Dr. Carlos Peniche Covas',
    semestre: 5,
    telefonoPersonal: '9994004001',
    telefonoTutor: '9994004002',
    nss: '238901456789',
    anioIngreso: 2023,
    codigoAcceso: 'MARIA004',
    rol: 'JUGADOR',
  },
  {
    nombre: 'Daniela',
    apellidos: 'Torres Cahun',
    genero: 'F',
    posicion: 'BANDA',
    facultad: 'Facultad de Contaduría y Administración',
    directorFacultad: 'Dra. Ligia González Herrera',
    semestre: 3,
    telefonoPersonal: '9995005001',
    telefonoTutor: '9995005002',
    nss: '119023567890',
    anioIngreso: 2024,
    codigoAcceso: 'DANI005',
    rol: 'JUGADOR',
  },
  {
    nombre: 'Valentina',
    apellidos: 'Ramírez Balam',
    genero: 'F',
    posicion: 'BANDA',
    facultad: 'Facultad de Arquitectura',
    directorFacultad: 'Arq. Rosario Ocaña Cetina',
    semestre: 7,
    telefonoPersonal: '9996006001',
    telefonoTutor: '9996006002',
    nss: '774512678901',
    anioIngreso: 2022,
    codigoAcceso: 'VALE006',
    rol: 'JUGADOR',
  },
  {
    nombre: 'Isabella',
    apellidos: 'Pérez Canul',
    genero: 'F',
    posicion: 'CENTRAL',
    facultad: 'Facultad de Nutrición',
    directorFacultad: 'Dra. Esperanza Salazar',
    semestre: 2,
    telefonoPersonal: '9997007001',
    telefonoTutor: '9997007002',
    nss: '663401789012',
    anioIngreso: 2025,
    codigoAcceso: 'ISA007',
    rol: 'JUGADOR',
  },
  {
    nombre: 'Camila',
    apellidos: 'Vargas May',
    genero: 'F',
    posicion: 'ACOMODO',
    facultad: 'Facultad de Enfermería',
    directorFacultad: 'Dra. Patricia Dzul Canché',
    semestre: 5,
    telefonoPersonal: '9998008001',
    telefonoTutor: '9998008002',
    nss: '552390890123',
    anioIngreso: 2023,
    codigoAcceso: 'CAMI008',
    rol: 'JUGADOR',
  },
  {
    nombre: 'Fernanda',
    apellidos: 'Castillo Coba',
    genero: 'F',
    posicion: 'LIBERO',
    facultad: 'Facultad de Medicina',
    directorFacultad: 'Dr. Jorge Cuevas Alpuche',
    semestre: 9,
    telefonoPersonal: '9999009001',
    telefonoTutor: '9999009002',
    nss: '441289901234',
    anioIngreso: 2021,
    codigoAcceso: 'FER009',
    rol: 'JUGADOR',
  },
  {
    nombre: 'Andrea',
    apellidos: 'Morales Chi',
    genero: 'F',
    posicion: 'OPUESTO',
    facultad: 'Facultad de Derecho',
    directorFacultad: 'Dr. Arturo Hernández Magaña',
    semestre: 6,
    telefonoPersonal: '9990010001',
    telefonoTutor: '9990010002',
    nss: '330178012345',
    anioIngreso: 2023,
    codigoAcceso: 'ANDREA010',
    rol: 'JUGADOR',
  },
  {
    nombre: 'Paola',
    apellidos: 'Jiménez Tzab',
    genero: 'F',
    posicion: 'BANDA',
    facultad: 'Facultad de Psicología',
    directorFacultad: 'Dra. María Angélica Verdejo',
    semestre: 4,
    telefonoPersonal: '9991011001',
    telefonoTutor: '9991011002',
    nss: '221067123456',
    anioIngreso: 2024,
    codigoAcceso: 'PAOLA011',
    rol: 'JUGADOR',
  },
  {
    nombre: 'Renata',
    apellidos: 'Cruz Poot',
    genero: 'F',
    posicion: 'CENTRAL',
    facultad: 'Facultad de Ingeniería',
    directorFacultad: 'Dr. Carlos Peniche Covas',
    semestre: 3,
    telefonoPersonal: '9992012001',
    telefonoTutor: '9992012002',
    nss: '112956234567',
    anioIngreso: 2024,
    codigoAcceso: 'RENATA012',
    rol: 'JUGADOR',
  },
] as const

// ─── Eventos del Macrociclo ───────────────────────────────────────────────────
// Temporada Junio–Agosto 2026
// JUPLAV: Vie–Sáb 17–18 jul (misma semana). CIVOLSUR: Vie–Sáb 14–15 ago.
const eventosSeed = [
  {
    titulo: 'Adaptación Anatómica',
    descripcion: 'Fase de adaptación progresiva al trabajo físico estructurado. Volumen bajo, intensidad baja.',
    fechaInicio: new Date(2026, 5, 1),
    fechaFin:    new Date(2026, 5, 28),
    color: '#eab308',
    grupo: 'PREPARACIÓN O ENTRENAMIENTOS',
  },
  {
    titulo: 'Hipertrofia',
    descripcion: 'Ciclo de aumento de masa muscular funcional orientado al rendimiento en voleibol.',
    fechaInicio: new Date(2026, 5, 29),
    fechaFin:    new Date(2026, 6, 26),
    color: '#06b6d4',
    grupo: 'PREPARACIÓN O ENTRENAMIENTOS',
  },
  {
    titulo: 'Fuerza Máxima',
    descripcion: 'Desarrollo de la fuerza máxima para potenciar el rendimiento explosivo en salto y saque.',
    fechaInicio: new Date(2026, 6, 27),
    fechaFin:    new Date(2026, 7, 23),
    color: '#3b82f6',
    grupo: 'PREPARACIÓN O ENTRENAMIENTOS',
  },
  {
    titulo: 'Preparación Psicológica',
    descripcion: 'Sesión de cohesión grupal y entrenamiento de mentalidad competitiva.',
    fechaInicio: new Date(2026, 6, 6),
    fechaFin:    new Date(2026, 6, 6),
    color: '#ec4899',
    grupo: 'PREPARACIÓN O ENTRENAMIENTOS',
  },
  {
    titulo: 'Preparación Psicológica',
    descripcion: 'Sesión de cohesión grupal y entrenamiento de mentalidad competitiva.',
    fechaInicio: new Date(2026, 6, 13),
    fechaFin:    new Date(2026, 6, 13),
    color: '#ec4899',
    grupo: 'PREPARACIÓN O ENTRENAMIENTOS',
  },
  {
    titulo: 'Preparación Psicológica',
    descripcion: 'Sesión de cohesión grupal y entrenamiento de mentalidad competitiva.',
    fechaInicio: new Date(2026, 6, 20),
    fechaFin:    new Date(2026, 6, 20),
    color: '#ec4899',
    grupo: 'PREPARACIÓN O ENTRENAMIENTOS',
  },
  {
    titulo: 'Preparación Psicológica',
    descripcion: 'Sesión de cohesión grupal y entrenamiento de mentalidad competitiva.',
    fechaInicio: new Date(2026, 6, 27),
    fechaFin:    new Date(2026, 6, 27),
    color: '#ec4899',
    grupo: 'PREPARACIÓN O ENTRENAMIENTOS',
  },
  {
    titulo: 'Torneo JUPLAV',
    descripcion: 'Juegos Universitarios y Preparatorianos de la Liga Asociada de Voleibol — fase regional UADY.',
    fechaInicio: new Date(2026, 6, 17),
    fechaFin:    new Date(2026, 6, 18),
    color: '#ef4444',
    grupo: 'TORNEOS',
  },
  {
    titulo: 'CIVOLSUR',
    descripcion: 'Circuito de Voleibol del Sureste — fase regional clasificatoria al nacional.',
    fechaInicio: new Date(2026, 7, 14),
    fechaFin:    new Date(2026, 7, 15),
    color: '#22c55e',
    grupo: 'TORNEOS',
  },
]

// Mapa para migrar grupos de eventos que ya existían con grupo='GENERAL'
const gruposPorTitulo: Record<string, string> = {
  'Adaptación Anatómica':   'PREPARACIÓN O ENTRENAMIENTOS',
  'Hipertrofia':            'PREPARACIÓN O ENTRENAMIENTOS',
  'Fuerza Máxima':          'PREPARACIÓN O ENTRENAMIENTOS',
  'Preparación Psicológica':'PREPARACIÓN O ENTRENAMIENTOS',
  'Torneo JUPLAV':          'TORNEOS',
  'CIVOLSUR':               'TORNEOS',
}

const accesoriosSeed = [
  // Tren Inferior
  { nombre: 'Extensión de cuádriceps', tipo: 'TREN_INFERIOR' },
  { nombre: 'Curl de pierna',          tipo: 'TREN_INFERIOR' },
  { nombre: 'Sentadillas búlgaras',    tipo: 'TREN_INFERIOR' },
  { nombre: 'Pantorrillas',            tipo: 'TREN_INFERIOR' },
  { nombre: 'Aductores',               tipo: 'TREN_INFERIOR' },
  { nombre: 'Abductores',              tipo: 'TREN_INFERIOR' },
  { nombre: 'Tibial',                  tipo: 'TREN_INFERIOR' },
  // Tren Superior
  { nombre: 'Press de hombro',         tipo: 'TREN_SUPERIOR' },
  { nombre: 'Elevaciones laterales',   tipo: 'TREN_SUPERIOR' },
  { nombre: 'Bíceps',                  tipo: 'TREN_SUPERIOR' },
  { nombre: 'Tríceps',                 tipo: 'TREN_SUPERIOR' },
  { nombre: 'Pull over',               tipo: 'TREN_SUPERIOR' },
  { nombre: 'Dorsal',                  tipo: 'TREN_SUPERIOR' },
  { nombre: 'Trapecios',               tipo: 'TREN_SUPERIOR' },
]

async function main() {
  console.log('🌱 Seeding database...')

  let created = 0
  let skipped = 0

  for (const atleta of atletasSeed) {
    const exists = await prisma.claveAtleta.findUnique({
      where: { clavePlana: atleta.codigoAcceso },
    })

    if (exists) {
      skipped++
      continue
    }

    const { nss, codigoAcceso: codigoPlano, ...atletaData } = atleta
    await prisma.atleta.create({
      data: {
        ...atletaData,
        codigoAcceso: await bcrypt.hash(codigoPlano, 10),
        privado: { create: { nss } },
        claveAtleta: { create: { clavePlana: codigoPlano } },
      },
    })
    created++
    console.log(`  ✅ ${atleta.nombre} ${atleta.apellidos} (${atleta.codigoAcceso})`)
  }

  // Add sample lesions for Ana García
  const ana = await prisma.atleta.findUnique({ where: { codigoAcceso: 'ANA001' } })
  if (ana) {
    const lesionExists = await prisma.lesion.findFirst({ where: { atletaId: ana.id } })
    if (!lesionExists) {
      await prisma.lesion.createMany({
        data: [
          {
            atletaId: ana.id,
            fechaConsulta: new Date('2026-05-25'),
            diagnostico: 'Esguince leve de tobillo derecho en defensa de segunda línea.',
            tratamiento: 'Reposo relativo, hielo (RICE) y vendaje funcional por 7 días.',
            estatus: 'Activo',
          },
          {
            atletaId: ana.id,
            fechaConsulta: new Date('2026-04-10'),
            diagnostico: 'Tendinitis rotuliana izquierda por sobrecarga en salto.',
            tratamiento: 'Fisioterapia y fortalecimiento excéntrico de cuádriceps.',
            estatus: 'Alta',
            fechaAlta: new Date('2026-05-02'),
          },
        ],
      })
      console.log('  ✅ Lesiones de Ana García cargadas')
    }
  }

  console.log(`\n🏐 Seed completo: ${created} registros creados, ${skipped} ya existían.`)

  // Eventos del macrociclo (idempotente: solo si no existe ningún evento)
  const eventosCount = await prisma.evento.count()
  if (eventosCount === 0) {
    await prisma.evento.createMany({ data: eventosSeed })
    console.log(`  ✅ ${eventosSeed.length} eventos del macrociclo creados`)
  } else {
    console.log(`  ⏭️  Eventos ya existentes (${eventosCount}), omitiendo seed inicial`)
  }

  // Migrar grupos: asignar grupo correcto a eventos que aún tienen el valor por defecto
  let actualizados = 0
  for (const [titulo, grupo] of Object.entries(gruposPorTitulo)) {
    const result = await prisma.evento.updateMany({
      where: { titulo, grupo: 'GENERAL' },
      data: { grupo },
    })
    actualizados += result.count
  }
  if (actualizados > 0) {
    console.log(`  ✅ ${actualizados} eventos actualizados con grupo correcto`)
  } else {
    console.log(`  ⏭️  Grupos ya asignados, sin cambios`)
  }

  // Ejercicios Accesorios (idempotente por nombre + tipo)
  let accesoriosCreados = 0
  for (const acc of accesoriosSeed) {
    const existe = await prisma.ejercicioAccesorio.findFirst({
      where: { nombre: acc.nombre, tipo: acc.tipo },
    })
    if (!existe) {
      await prisma.ejercicioAccesorio.create({ data: acc })
      accesoriosCreados++
    }
  }
  console.log(
    accesoriosCreados > 0
      ? `  ✅ ${accesoriosCreados} ejercicios accesorios creados`
      : `  ⏭️  Ejercicios accesorios ya existentes, sin cambios`
  )
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
