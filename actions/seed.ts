'use server'

import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { ramaFromGenero } from '@/lib/constants/genero'

// codigoAcceso siempre se guarda hasheado — no se puede buscar/upsert por
// igualdad de texto plano, así que primero se resuelve el atletaId vía
// ClaveAtleta.clavePlana (única fuente recuperable de la clave en texto plano).
export async function crearAdminMaestro(): Promise<{ error?: string; ok?: boolean; codigo?: string }> {
  if (process.env.NODE_ENV === 'production') {
    return { error: 'No disponible en producción.' }
  }

  const codigoPlano = 'ADMIN001'

  try {
    const existente = await prisma.claveAtleta.findUnique({
      where: { clavePlana: codigoPlano },
      select: { atletaId: true },
    })

    if (existente) {
      await prisma.atleta.update({
        where: { id: existente.atletaId },
        data: { rol: 'ADMIN', rolTecnico: 'Entrenador' },
      })
    } else {
      const claveHasheada = await bcrypt.hash(codigoPlano, 10)
      await prisma.atleta.create({
        data: {
          nombre: 'Admin',
          apellidos: 'Maestro',
          genero: 'M',
          rama: 'Varonil',
          posicion: null, // ADMIN — no tiene posición de juego
          facultad: 'FMAT',
          directorFacultad: 'Director General',
          semestre: 1,
          telefonoPersonal: '9991234567',
          telefonoTutor: '9991234567',
          anioIngreso: 2020,
          codigoAcceso: claveHasheada,
          rol: 'ADMIN',
          rolTecnico: 'Entrenador',
          correo: 'admin@uady.mx',
          privado: { create: { nss: '00000000000' } },
          claveAtleta: { create: { clavePlana: codigoPlano } },
        },
      })
    }
    return { ok: true, codigo: codigoPlano }
  } catch (e) {
    return { error: (e as Error).message }
  }
}

// ---------------------------------------------------------------------------
// Demo seed — jugadores, lesiones, citas
// ---------------------------------------------------------------------------

const JUGADORES = [
  {
    nombre: 'Ana', apellidos: 'García Reyes', genero: 'F', rama: 'Femenil',
    posicion: 'LIBERO', facultad: 'FMAT', directorFacultad: 'Dr. Ramón Espinosa',
    semestre: 6, telefonoPersonal: '9991110001', telefonoTutor: '9991110002',
    nss: '11111111101', codigoAcceso: 'ANA001', email: 'ana.garcia@uady.mx', anioIngreso: 2023,
    seguroPrivado: 'IMSS',
  },
  {
    nombre: 'María', apellidos: 'López Cervantes', genero: 'F', rama: 'Femenil',
    posicion: 'ACOMODO', facultad: 'FMAT', directorFacultad: 'Dr. Ramón Espinosa',
    semestre: 4, telefonoPersonal: '9992220001', telefonoTutor: '9992220002',
    nss: '11111111102', codigoAcceso: 'MARIA001', email: 'maria.lopez@uady.mx', anioIngreso: 2024,
    seguroPrivado: null,
  },
  {
    nombre: 'Carmen', apellidos: 'Pérez Dzul', genero: 'F', rama: 'Femenil',
    posicion: 'CENTRAL', facultad: 'Ingeniería', directorFacultad: 'Dra. Silvia Méndez',
    semestre: 8, telefonoPersonal: '9993330001', telefonoTutor: '9993330002',
    nss: '11111111103', codigoAcceso: 'CARMEN001', email: 'carmen.perez@uady.mx', anioIngreso: 2022,
    seguroPrivado: 'Seguro Popular',
  },
  {
    nombre: 'Laura', apellidos: 'Martínez Cab', genero: 'F', rama: 'Femenil',
    posicion: 'BANDA', facultad: 'Medicina', directorFacultad: 'Dr. Jorge Trejo',
    semestre: 5, telefonoPersonal: '9994440001', telefonoTutor: '9994440002',
    nss: '11111111104', codigoAcceso: 'LAURA001', email: 'laura.martinez@uady.mx', anioIngreso: 2023,
    seguroPrivado: 'IMSS',
  },
  {
    nombre: 'Sofía', apellidos: 'Jiménez Chan', genero: 'F', rama: 'Femenil',
    posicion: 'OPUESTO', facultad: 'Arquitectura', directorFacultad: 'Arq. Marcos Uh',
    semestre: 3, telefonoPersonal: '9995550001', telefonoTutor: '9995550002',
    nss: '11111111105', codigoAcceso: 'SOFIA001', email: 'sofia.jimenez@uady.mx', anioIngreso: 2024,
    seguroPrivado: null,
  },
  {
    nombre: 'Diego', apellidos: 'Hernández Pool', genero: 'M', rama: 'Varonil',
    posicion: 'OPUESTO', facultad: 'FMAT', directorFacultad: 'Dr. Ramón Espinosa',
    semestre: 7, telefonoPersonal: '9996660001', telefonoTutor: '9996660002',
    nss: '11111111106', codigoAcceso: 'DIEGO001', email: 'diego.hernandez@uady.mx', anioIngreso: 2022,
    seguroPrivado: 'IMSS',
  },
  {
    nombre: 'Carlos', apellidos: 'Ramírez Tzuc', genero: 'M', rama: 'Varonil',
    posicion: 'ACOMODO', facultad: 'Ingeniería', directorFacultad: 'Dra. Silvia Méndez',
    semestre: 6, telefonoPersonal: '9997770001', telefonoTutor: '9997770002',
    nss: '11111111107', codigoAcceso: 'CARLOS001', email: 'carlos.ramirez@uady.mx', anioIngreso: 2023,
    seguroPrivado: null,
  },
  {
    nombre: 'Miguel', apellidos: 'Torres Kantún', genero: 'M', rama: 'Varonil',
    posicion: 'CENTRAL', facultad: 'Derecho', directorFacultad: 'Lic. Patricia Cano',
    semestre: 9, telefonoPersonal: '9998880001', telefonoTutor: '9998880002',
    nss: '11111111108', codigoAcceso: 'MIGUEL001', email: 'miguel.torres@uady.mx', anioIngreso: 2021,
    seguroPrivado: 'Seguro Popular',
  },
  {
    nombre: 'Valeria', apellidos: 'Castillo May', genero: 'F', rama: 'Femenil',
    posicion: 'BANDA', facultad: 'Psicología', directorFacultad: 'Dra. Rosa Cetina',
    semestre: 2, telefonoPersonal: '9999990001', telefonoTutor: '9999990002',
    nss: '11111111109', codigoAcceso: 'VALE001', email: 'valeria.castillo@uady.mx', anioIngreso: 2025,
    seguroPrivado: null,
  },
  {
    nombre: 'Roberto', apellidos: 'Soberanis Balam', genero: 'M', rama: 'Varonil',
    posicion: 'LIBERO', facultad: 'Contaduría', directorFacultad: 'Lic. Ernesto Uc',
    semestre: 4, telefonoPersonal: '9990000001', telefonoTutor: '9990000002',
    nss: '11111111110', codigoAcceso: 'ROBERTO001', email: 'roberto.soberanis@uady.mx', anioIngreso: 2024,
    seguroPrivado: 'IMSS',
  },
] as const

type LesionSeed = {
  offset: number       // días antes de hoy
  diagnostico: string
  tratamiento: string
  estatus: 'Activo' | 'Alta'
  altaOffset?: number  // días antes de hoy para fechaAlta (solo si estatus='Alta')
}

const LESIONES_POR_JUGADOR: Record<string, LesionSeed[]> = {
  ANA001: [
    {
      offset: 25,
      diagnostico: 'Esguince de tobillo derecho grado II',
      tratamiento: 'Reposo relativo, hielo 20 min c/8h, vendaje funcional y fisioterapia 3x semana.',
      estatus: 'Activo',
    },
  ],
  MARIA001: [
    {
      offset: 60,
      diagnostico: 'Tendinitis rotuliana rodilla izquierda',
      tratamiento: 'AINE por 7 días, ejercicios excéntricos de cuádriceps, evitar saltos por 3 semanas.',
      estatus: 'Alta',
      altaOffset: 30,
    },
    {
      offset: 10,
      diagnostico: 'Contusión en dedo índice de mano derecha',
      tratamiento: 'Inmovilización con férula por 10 días, antiinflamatorio tópico.',
      estatus: 'Activo',
    },
  ],
  CARMEN001: [
    {
      offset: 45,
      diagnostico: 'Lumbalgia mecánica por sobrecarga de entrenamiento',
      tratamiento: 'Reposo 48h, calor local, antiinflamatorio oral, ejercicios de estabilización lumbar.',
      estatus: 'Alta',
      altaOffset: 20,
    },
  ],
  DIEGO001: [
    {
      offset: 15,
      diagnostico: 'Distensión del manguito rotador hombro derecho',
      tratamiento: 'Reposo de movimientos por encima de la cabeza 2 semanas, fisioterapia, AINE.',
      estatus: 'Activo',
    },
    {
      offset: 90,
      diagnostico: 'Fascitis plantar pie izquierdo',
      tratamiento: 'Plantillas ortopédicas, estiramiento plantar diario, masaje con hielo.',
      estatus: 'Alta',
      altaOffset: 50,
    },
  ],
  CARLOS001: [
    {
      offset: 5,
      diagnostico: 'Esguince de muñeca izquierda grado I',
      tratamiento: 'Muñequera elástica, hielo 15 min c/6h, evitar apoyos por 7 días.',
      estatus: 'Activo',
    },
  ],
  MIGUEL001: [
    {
      offset: 70,
      diagnostico: 'Fractura por estrés en metatarso derecho',
      tratamiento: 'Inmovilización con bota ortopédica 6 semanas, sin apoyo de peso, calcio + vitamina D.',
      estatus: 'Alta',
      altaOffset: 10,
    },
  ],
  SOFIA001: [
    {
      offset: 20,
      diagnostico: 'Síndrome del impingement subacromial hombro izquierdo',
      tratamiento: 'Infiltración corticoide, fisioterapia descompresiva, fortalecimiento de manguito rotador.',
      estatus: 'Activo',
    },
  ],
  VALE001: [
    {
      offset: 35,
      diagnostico: 'Periostitis tibial bilateral (shin splints)',
      tratamiento: 'Reducción de carga de entrenamiento al 50%, hielo post-entreno, plantillas absorbentes.',
      estatus: 'Activo',
    },
    {
      offset: 100,
      diagnostico: 'Luxación parcial hombro derecho',
      tratamiento: 'Reducción ortopédica, inmovilización 3 semanas, rehabilitación progresiva.',
      estatus: 'Alta',
      altaOffset: 55,
    },
  ],
}

type CitaSeed = {
  offset: number   // días desde hoy (negativo = pasado, positivo = futuro)
  tipoEspecialista: string
  motivo: string
  estado: 'Programada' | 'Completada' | 'Cancelada'
  hora: string
}

const CITAS_POR_JUGADOR: Record<string, CitaSeed[]> = {
  ANA001: [
    {
      offset: 7, tipoEspecialista: 'Médico General',
      motivo: 'Revisión y alta médica de esguince de tobillo.',
      estado: 'Programada', hora: '10:00',
    },
    {
      offset: -20, tipoEspecialista: 'Fisioterapeuta',
      motivo: 'Evaluación inicial de movilidad y plan de rehabilitación.',
      estado: 'Completada', hora: '09:00',
    },
  ],
  MARIA001: [
    {
      offset: 3, tipoEspecialista: 'Nutriólogo',
      motivo: 'Plan nutricional para optimizar recuperación muscular y control de peso competitivo.',
      estado: 'Programada', hora: '11:30',
    },
    {
      offset: -10, tipoEspecialista: 'Médico General',
      motivo: 'Seguimiento de tendinitis, solicitud de RX de rodilla.',
      estado: 'Completada', hora: '08:30',
    },
  ],
  CARMEN001: [
    {
      offset: -5, tipoEspecialista: 'Psicólogo',
      motivo: 'Manejo de ansiedad pre-competencia y técnicas de visualización.',
      estado: 'Completada', hora: '16:00',
    },
    {
      offset: 14, tipoEspecialista: 'Psicólogo',
      motivo: 'Sesión de seguimiento de estrategias mentales.',
      estado: 'Programada', hora: '16:00',
    },
  ],
  DIEGO001: [
    {
      offset: -30, tipoEspecialista: 'Médico General',
      motivo: 'Valoración inicial de dolor en hombro derecho.',
      estado: 'Completada', hora: '10:00',
    },
    {
      offset: 5, tipoEspecialista: 'Fisioterapeuta',
      motivo: 'Sesión de ultrasonido terapéutico en manguito rotador.',
      estado: 'Programada', hora: '07:30',
    },
    {
      offset: -45, tipoEspecialista: 'Dentista',
      motivo: 'Revisión semestral y limpieza dental.',
      estado: 'Cancelada', hora: '12:00',
    },
  ],
  CARLOS001: [
    {
      offset: 10, tipoEspecialista: 'Médico General',
      motivo: 'Revisión de esguince de muñeca y retorno deportivo.',
      estado: 'Programada', hora: '09:00',
    },
  ],
  MIGUEL001: [
    {
      offset: -15, tipoEspecialista: 'Nutriólogo',
      motivo: 'Ajuste de dieta durante período de inmovilización, énfasis en calcio y colágeno.',
      estado: 'Completada', hora: '13:00',
    },
    {
      offset: 21, tipoEspecialista: 'Médico General',
      motivo: 'RX de control para evaluar consolidación de fractura por estrés.',
      estado: 'Programada', hora: '08:00',
    },
  ],
  SOFIA001: [
    {
      offset: -8, tipoEspecialista: 'Médico General',
      motivo: 'Evaluación post-infiltración y seguimiento de impingement.',
      estado: 'Completada', hora: '11:00',
    },
    {
      offset: -3, tipoEspecialista: 'Psicólogo',
      motivo: 'Primera sesión — evaluación de bienestar emocional y rendimiento.',
      estado: 'Cancelada', hora: '15:00',
    },
    {
      offset: 12, tipoEspecialista: 'Psicólogo',
      motivo: 'Sesión de bienestar emocional reprogramada.',
      estado: 'Programada', hora: '15:00',
    },
  ],
  LAURA001: [
    {
      offset: 2, tipoEspecialista: 'Nutriólogo',
      motivo: 'Control de composición corporal pre-torneo y plan de hidratación.',
      estado: 'Programada', hora: '10:30',
    },
  ],
  VALE001: [
    {
      offset: -12, tipoEspecialista: 'Fisioterapeuta',
      motivo: 'Rehabilitación de hombro: fortalecimiento fase 2.',
      estado: 'Completada', hora: '07:00',
    },
    {
      offset: 6, tipoEspecialista: 'Médico General',
      motivo: 'Seguimiento de periostitis tibial y evaluación de retorno.',
      estado: 'Programada', hora: '09:30',
    },
  ],
  ROBERTO001: [
    {
      offset: -2, tipoEspecialista: 'Dentista',
      motivo: 'Revisión por dolor en muela de juicio.',
      estado: 'Completada', hora: '14:00',
    },
    {
      offset: 18, tipoEspecialista: 'Psicólogo',
      motivo: 'Evaluación de rendimiento mental y gestión del estrés académico-deportivo.',
      estado: 'Programada', hora: '17:00',
    },
  ],
}

function daysFromNow(days: number, hour = '08:00'): Date {
  const [h, m] = hour.split(':').map(Number)
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(h, m, 0, 0)
  return d
}

export async function sembrarDatosDemo(): Promise<{ error?: string; ok?: boolean; resumen?: string }> {
  if (process.env.NODE_ENV === 'production') {
    return { error: 'No disponible en producción.' }
  }

  try {
    let totalAtletas = 0
    let totalLesiones = 0
    let totalCitas = 0

    for (const j of JUGADORES) {
      const { nss, email, seguroPrivado, codigoAcceso: codigoPlano, ...resto } = j
      const existente = await prisma.claveAtleta.findUnique({
        where: { clavePlana: codigoPlano },
        select: { atletaId: true },
      })

      const atleta = existente
        ? { id: existente.atletaId }
        : await prisma.atleta.create({
            data: {
              ...resto,
              correo: email,
              rol: 'JUGADOR',
              codigoAcceso: await bcrypt.hash(codigoPlano, 10),
              privado: { create: { nss, seguroAseguradora: seguroPrivado } },
              claveAtleta: { create: { clavePlana: codigoPlano } },
            },
          })
      totalAtletas++

      const lesiones = LESIONES_POR_JUGADOR[j.codigoAcceso] ?? []
      for (const l of lesiones) {
        const fechaConsulta = daysFromNow(-l.offset)
        const fechaAlta = l.estatus === 'Alta' && l.altaOffset != null
          ? daysFromNow(-l.altaOffset)
          : null
        await prisma.lesion.create({
          data: {
            atletaId: atleta.id,
            fechaConsulta,
            diagnostico: l.diagnostico,
            tratamiento: l.tratamiento,
            estatus: l.estatus,
            ...(fechaAlta ? { fechaAlta } : {}),
          },
        })
        totalLesiones++
      }

      const citas = CITAS_POR_JUGADOR[j.codigoAcceso] ?? []
      for (const c of citas) {
        await prisma.citaMedica.create({
          data: {
            atletaId: atleta.id,
            tipoEspecialista: c.tipoEspecialista,
            fechaHora: daysFromNow(c.offset, c.hora),
            motivo: c.motivo,
            estado: c.estado,
          },
        })
        totalCitas++
      }
    }

    return {
      ok: true,
      resumen: `${totalAtletas} jugadores · ${totalLesiones} lesiones · ${totalCitas} citas`,
    }
  } catch (e) {
    return { error: (e as Error).message }
  }
}

// ---------------------------------------------------------------------------
// Planificación voleibol — Staff técnico, Gimnasio (23 semanas), Macrociclo
// (49 semanas) y Récord de partidos. Usa exclusivamente los modelos ya
// existentes en el schema (Atleta, EtapaEntrenamiento/EjercicioPrincipal/
// DetalleSemana, EjercicioAccesorio, Evento, Partido).
// ---------------------------------------------------------------------------

const MS_DIA = 86_400_000
const MACROCICLO_INICIO = new Date(2026, 5, 1) // 1 de junio de 2026

function addDias(base: Date, dias: number): Date {
  return new Date(base.getTime() + dias * MS_DIA)
}

function semanaRango(numeroSemana: number): { inicio: Date; fin: Date } {
  const inicio = addDias(MACROCICLO_INICIO, (numeroSemana - 1) * 7)
  return { inicio, fin: addDias(inicio, 6) }
}

// ─── Staff técnico ──────────────────────────────────────────────────────────

const STAFF_SEED = [
  {
    nombre: 'Patricia', apellidos: 'Couoh Pech', genero: 'F',
    telefonoPersonal: '9991234001', email: 'patricia.couoh@uady.mx',
    rolTecnico: 'Entrenador', codigoAcceso: 'COACH001', nss: '00000000001',
  },
  {
    nombre: 'José', apellidos: 'Canul Dzib', genero: 'M',
    telefonoPersonal: '9991234002', email: 'jose.canul@uady.mx',
    rolTecnico: 'Auxiliar', codigoAcceso: 'AUX001', nss: '00000000002',
  },
  {
    nombre: 'Lucía', apellidos: 'Estrada Novelo', genero: 'F',
    telefonoPersonal: '9991234003', email: 'lucia.estrada@uady.mx',
    rolTecnico: 'Médico', codigoAcceso: 'MED001', nss: '00000000003',
  },
  {
    nombre: 'Andrés', apellidos: 'Rejón Aguilar', genero: 'M',
    telefonoPersonal: '9991234004', email: 'andres.rejon@uady.mx',
    rolTecnico: 'Psicólogo', codigoAcceso: 'PSIC001', nss: '00000000004',
  },
] as const

// ─── Gimnasio: progresión de 23 semanas (Sentadilla, Peso Muerto, Press Pecho, Remo) ──

const ETAPAS_GIMNASIO = [
  { nombre: 'Adaptación Anatómica', desde: 1, hasta: 6 },
  { nombre: 'Fuerza Máxima', desde: 7, hasta: 9 },
  { nombre: 'Hipertrofia', desde: 10, hasta: 16 },
  { nombre: 'Potencia', desde: 17, hasta: 23 },
] as const

const EJERCICIOS_PRINCIPALES = ['Sentadilla', 'Peso Muerto', 'Press Pecho', 'Remo'] as const

// numeroSemana, series, repeticiones, RIR
const PROGRESION_SEMANAL: { semana: number; series: number; rpt: string; rir: number }[] = [
  // Adaptación Anatómica (1-6): 8x18-20 RIR5 → 12x15-18 RIR4
  { semana: 1, series: 8, rpt: '18-20', rir: 5 },
  { semana: 2, series: 9, rpt: '18-20', rir: 5 },
  { semana: 3, series: 10, rpt: '17-19', rir: 5 },
  { semana: 4, series: 10, rpt: '16-18', rir: 4 },
  { semana: 5, series: 11, rpt: '15-18', rir: 4 },
  { semana: 6, series: 12, rpt: '15-18', rir: 4 },
  // Fuerza Máxima (7-9): 6x8 RIR3 → 7x6 RIR1
  { semana: 7, series: 6, rpt: '8', rir: 3 },
  { semana: 8, series: 6, rpt: '7', rir: 2 },
  { semana: 9, series: 7, rpt: '6', rir: 1 },
  // Hipertrofia (10-16): 8x8 RIR2 → 10x10 RIR2
  { semana: 10, series: 8, rpt: '8', rir: 2 },
  { semana: 11, series: 8, rpt: '8', rir: 2 },
  { semana: 12, series: 9, rpt: '8', rir: 2 },
  { semana: 13, series: 9, rpt: '9', rir: 2 },
  { semana: 14, series: 9, rpt: '9', rir: 2 },
  { semana: 15, series: 10, rpt: '10', rir: 2 },
  { semana: 16, series: 10, rpt: '10', rir: 2 },
  // Potencia (17-23): 3-4 series explosivas
  { semana: 17, series: 3, rpt: '5', rir: 3 },
  { semana: 18, series: 4, rpt: '5', rir: 3 },
  { semana: 19, series: 3, rpt: '4', rir: 3 },
  { semana: 20, series: 4, rpt: '4', rir: 3 },
  { semana: 21, series: 3, rpt: '4', rir: 3 },
  { semana: 22, series: 4, rpt: '3', rir: 3 },
  { semana: 23, series: 3, rpt: '3', rir: 3 },
]

// Ejercicios accesorios (catálogo + límite de 16 series semanales por tren)
const ACCESORIOS_SEED = [
  // Tren Inferior
  { nombre: 'Extensión de cuádriceps', tipo: 'TREN_INFERIOR' },
  { nombre: 'Curl de pierna', tipo: 'TREN_INFERIOR' },
  { nombre: 'Sentadillas búlgaras', tipo: 'TREN_INFERIOR' },
  { nombre: 'Pantorrillas', tipo: 'TREN_INFERIOR' },
  { nombre: 'Aductores', tipo: 'TREN_INFERIOR' },
  { nombre: 'Abductores', tipo: 'TREN_INFERIOR' },
  { nombre: 'Tibial', tipo: 'TREN_INFERIOR' },
  // Tren Superior
  { nombre: 'Press de hombro', tipo: 'TREN_SUPERIOR' },
  { nombre: 'Elevaciones laterales', tipo: 'TREN_SUPERIOR' },
  { nombre: 'Bíceps', tipo: 'TREN_SUPERIOR' },
  { nombre: 'Tríceps', tipo: 'TREN_SUPERIOR' },
  { nombre: 'Pull over', tipo: 'TREN_SUPERIOR' },
  { nombre: 'Dorsal', tipo: 'TREN_SUPERIOR' },
  { nombre: 'Trapecios', tipo: 'TREN_SUPERIOR' },
] as const

// ─── Macrociclo de voleibol: 49 semanas (Junio a Mayo) ─────────────────────

const FASES_FISICAS = [
  { hasta: 6, codigo: 'AD', nombre: 'Adaptación Anatómica' },
  { hasta: 9, codigo: 'FM', nombre: 'Fuerza Máxima' },
  { hasta: 16, codigo: 'H', nombre: 'Hipertrofia' },
  { hasta: 23, codigo: 'P', nombre: 'Potencia' },
] as const

function faseFisica(semana: number) {
  return FASES_FISICAS.find(f => semana <= f.hasta) ?? null
}

const FASES_TACTICAS = [
  { hasta: 10, codigo: '1', nombre: 'Complejo 1' },
  { hasta: 23, codigo: '2', nombre: 'Complejo 2' },
  { hasta: 36, codigo: 'TD', nombre: 'Transición Defensa-Ataque' },
  { hasta: 49, codigo: 'TA', nombre: 'Transición Ataque-Defensa' },
] as const

function faseTactica(semana: number) {
  return FASES_TACTICAS.find(f => semana <= f.hasta)!
}

// Codificación de torneos por semana del macrociclo (alta frecuencia de
// JUPLAV entre semanas 15 y 30, según diccionario de la planificación)
const TORNEOS_SEMANA: Record<number, { codigo: string; nombre: string }> = {
  15: { codigo: 'J', nombre: 'Torneo JUPLAV — Jornada 1' },
  17: { codigo: 'J', nombre: 'Torneo JUPLAV — Jornada 2' },
  18: { codigo: 'V', nombre: 'Viaje de Fogueo' },
  19: { codigo: 'J', nombre: 'Torneo JUPLAV — Jornada 3' },
  21: { codigo: 'CG', nombre: 'Copa Guizu' },
  23: { codigo: 'J', nombre: 'Torneo JUPLAV — Jornada 4' },
  25: { codigo: 'CL', nombre: 'Copa Leglise' },
  27: { codigo: 'J', nombre: 'Torneo JUPLAV — Jornada 5' },
  29: { codigo: 'CSF', nombre: 'Copa San Francisco' },
  30: { codigo: 'J', nombre: 'Torneo JUPLAV — Jornada 6 (Final)' },
  32: { codigo: 'Y', nombre: 'CIVOLSUR' },
  35: { codigo: 'C', nombre: 'Copa Cancún' },
  38: { codigo: 'CD', nombre: 'Copa Ciudad del Carmen' },
  41: { codigo: 'CU', nombre: 'Copa University' },
  45: { codigo: 'U', nombre: 'Universiada — Fase Estatal' },
  47: { codigo: 'U', nombre: 'Universiada — Fase Regional' },
  49: { codigo: 'U', nombre: 'Universiada Nacional' },
}

const COLOR_FASE: Record<string, string> = {
  AD: '#eab308',
  FM: '#3b82f6',
  H: '#06b6d4',
  P: '#8b5cf6',
}

const MARCA_MACROCICLO = '[Macrociclo 49 semanas — Plan Rector]'

function tienePreparacionPsicologica(semana: number): boolean {
  return semana % 4 === 1 // semanas 1, 5, 9, 13, ... 49
}

function construirEventosMacrociclo() {
  const eventos: {
    titulo: string
    descripcion: string
    fechaInicio: Date
    fechaFin: Date
    color: string
    grupo: string
  }[] = []

  for (let semana = 1; semana <= 49; semana++) {
    const { inicio, fin } = semanaRango(semana)
    const periodo = semana <= 14 ? 'Preparatorio' : 'Competitivo'
    const ff = faseFisica(semana)
    const ft = faseTactica(semana)
    const torneo = TORNEOS_SEMANA[semana]
    const ps = tienePreparacionPsicologica(semana)

    const codigos = [ff?.codigo, ft.codigo, torneo?.codigo, ps ? 'PS' : null]
      .filter((c): c is string => Boolean(c))
      .join(' / ')

    const partesDescripcion = [
      `Periodo: ${periodo}.`,
      `Fase táctica: ${ft.nombre} (${ft.codigo}).`,
      ff ? `Fase física: ${ff.nombre} (${ff.codigo}).` : null,
      torneo ? `Actividad: ${torneo.nombre} (${torneo.codigo}).` : null,
      ps ? 'Incluye sesión de Preparación Psicológica (PS).' : null,
      MARCA_MACROCICLO,
    ].filter(Boolean)

    eventos.push({
      titulo: `Semana ${semana} · ${codigos}`,
      descripcion: partesDescripcion.join(' '),
      fechaInicio: inicio,
      fechaFin: fin,
      color: torneo ? '#ef4444' : (ff ? COLOR_FASE[ff.codigo] : '#64748b'),
      grupo: torneo ? 'TORNEOS' : 'PREPARACIÓN O ENTRENAMIENTOS',
    })
  }

  return eventos
}

// ─── Récord de partidos: 20 encuentros ficticios de la fase competitiva ────

const PARTIDOS_SEED: {
  semana: number
  diaOffset: number
  torneo: string
  rival: string
  sede: string
  hora: string
  resultadoSets: string
}[] = [
  { semana: 15, diaOffset: 0, torneo: 'Torneo JUPLAV', rival: 'Universidad Autónoma de Campeche', sede: 'Gimnasio UADY', hora: '17:00', resultadoSets: '3-0' },
  { semana: 15, diaOffset: 1, torneo: 'Torneo JUPLAV', rival: 'Tecnológico de Mérida', sede: 'Gimnasio UADY', hora: '19:00', resultadoSets: '3-1' },
  { semana: 17, diaOffset: 0, torneo: 'Torneo JUPLAV', rival: 'Universidad de Quintana Roo', sede: 'Gimnasio UQROO', hora: '18:00', resultadoSets: '2-3' },
  { semana: 17, diaOffset: 1, torneo: 'Torneo JUPLAV', rival: 'ITESM Campus Mérida', sede: 'Gimnasio UQROO', hora: '20:00', resultadoSets: '3-2' },
  { semana: 18, diaOffset: 2, torneo: 'Viaje de Fogueo', rival: 'Club Deportivo Caribe', sede: 'Cancún', hora: '17:30', resultadoSets: '3-0' },
  { semana: 19, diaOffset: 0, torneo: 'Torneo JUPLAV', rival: 'Universidad Modelo', sede: 'Gimnasio UADY', hora: '18:00', resultadoSets: '3-1' },
  { semana: 19, diaOffset: 1, torneo: 'Torneo JUPLAV', rival: 'CETYS Universidad', sede: 'Gimnasio UADY', hora: '20:00', resultadoSets: '1-3' },
  { semana: 21, diaOffset: 1, torneo: 'Copa Guizu', rival: 'Club Voleibol Guizu', sede: 'Auditorio Municipal de Mérida', hora: '17:00', resultadoSets: '3-0' },
  { semana: 23, diaOffset: 0, torneo: 'Torneo JUPLAV', rival: 'Universidad Autónoma de Chiapas', sede: 'Gimnasio UADY', hora: '18:00', resultadoSets: '3-2' },
  { semana: 23, diaOffset: 1, torneo: 'Torneo JUPLAV', rival: 'Universidad del Mayab', sede: 'Gimnasio UADY', hora: '20:00', resultadoSets: '3-0' },
  { semana: 25, diaOffset: 2, torneo: 'Copa Leglise', rival: 'Liceo Francés de Mérida', sede: 'Polideportivo Kukulcán', hora: '17:00', resultadoSets: '3-1' },
  { semana: 27, diaOffset: 0, torneo: 'Torneo JUPLAV', rival: 'Universidad Autónoma de Campeche', sede: 'Gimnasio UNACAR', hora: '18:00', resultadoSets: '0-3' },
  { semana: 27, diaOffset: 1, torneo: 'Torneo JUPLAV', rival: 'Tecnológico de Mérida', sede: 'Gimnasio UNACAR', hora: '20:00', resultadoSets: '3-1' },
  { semana: 29, diaOffset: 2, torneo: 'Copa San Francisco', rival: 'Club San Francisco Voleibol', sede: 'Gimnasio San Francisco de Asís', hora: '17:30', resultadoSets: '3-2' },
  { semana: 30, diaOffset: 0, torneo: 'Torneo JUPLAV', rival: 'Universidad de Quintana Roo', sede: 'Gimnasio UADY', hora: '18:00', resultadoSets: '3-0' },
  { semana: 32, diaOffset: 1, torneo: 'CIVOLSUR', rival: 'Universidad Autónoma de Tabasco', sede: 'Domo de la Feria, Villahermosa', hora: '17:00', resultadoSets: '2-3' },
  { semana: 35, diaOffset: 2, torneo: 'Copa Cancún', rival: 'Club Deportivo Cancún', sede: 'Centro de Usos Múltiples, Cancún', hora: '18:00', resultadoSets: '3-1' },
  { semana: 38, diaOffset: 1, torneo: 'Copa Ciudad del Carmen', rival: 'Universidad Autónoma del Carmen', sede: 'Gimnasio Lic. Benito Juárez, Cd. del Carmen', hora: '17:00', resultadoSets: '3-0' },
  { semana: 41, diaOffset: 2, torneo: 'Copa University', rival: 'Universidad Anáhuac Mayab', sede: 'Gimnasio Universidad Anáhuac', hora: '18:30', resultadoSets: '1-3' },
  { semana: 45, diaOffset: 1, torneo: 'Universiada — Fase Estatal', rival: 'Selección ITS Mérida', sede: 'CODEMET Mérida', hora: '17:00', resultadoSets: '3-0' },
]

function resultadoFinalDeSets(resultadoSets: string): { numeroSets: number; resultadoFinal: 'Ganado' | 'Perdido' } {
  const [propios, rival] = resultadoSets.split('-').map(Number)
  return {
    numeroSets: propios + rival,
    resultadoFinal: propios > rival ? 'Ganado' : 'Perdido',
  }
}

export async function sembrarPlanificacionVoleibol(): Promise<{ error?: string; ok?: boolean; resumen?: string }> {
  if (process.env.NODE_ENV === 'production') {
    return { error: 'No disponible en producción.' }
  }

  try {
    // 1) Staff técnico (vía Atleta con rol ADMIN + rolTecnico)
    let staffCreado = 0
    for (const s of STAFF_SEED) {
      const existe = await prisma.claveAtleta.findUnique({ where: { clavePlana: s.codigoAcceso } })
      if (existe) continue
      await prisma.atleta.create({
        data: {
          nombre: s.nombre,
          apellidos: s.apellidos,
          genero: s.genero,
          rama: ramaFromGenero(s.genero),
          posicion: null, // ADMIN — no tiene posición de juego
          facultad: 'Dirección de Deporte Universitario UADY',
          directorFacultad: 'Coordinación General del Deporte',
          semestre: 0,
          telefonoPersonal: s.telefonoPersonal,
          telefonoTutor: s.telefonoPersonal,
          correo: s.email,
          rolTecnico: s.rolTecnico,
          anioIngreso: 2020,
          codigoAcceso: await bcrypt.hash(s.codigoAcceso, 10),
          rol: 'ADMIN',
          privado: { create: { nss: s.nss } },
          claveAtleta: { create: { clavePlana: s.codigoAcceso } },
        },
      })
      staffCreado++
    }

    // 2) Gimnasio: 4 etapas, 4 ejercicios principales, 23 semanas de progresión
    let etapasCreadas = 0
    for (const etapa of ETAPAS_GIMNASIO) {
      const existe = await prisma.etapaEntrenamiento.findFirst({ where: { nombre: etapa.nombre } })
      if (existe) continue

      const fechaInicio = semanaRango(etapa.desde).inicio
      const fechaFin = semanaRango(etapa.hasta).fin
      const semanasEtapa = PROGRESION_SEMANAL.filter(p => p.semana >= etapa.desde && p.semana <= etapa.hasta)

      await prisma.etapaEntrenamiento.create({
        data: {
          nombre: etapa.nombre,
          fechaInicio,
          fechaFin,
          ejercicios: {
            create: EJERCICIOS_PRINCIPALES.map(nombre => ({
              nombre,
              fechaInicio,
              fechaFin,
              semanas: {
                create: semanasEtapa.map(s => ({
                  numeroSemana: s.semana,
                  fechaInicioSemana: semanaRango(s.semana).inicio,
                  fechaFinSemana: semanaRango(s.semana).fin,
                  series: s.series,
                  rpt: s.rpt,
                  rir: s.rir,
                })),
              },
            })),
          },
        },
      })
      etapasCreadas++
    }

    // Registrar ejercicios principales en el catálogo
    for (const nombre of EJERCICIOS_PRINCIPALES) {
      const existe = await prisma.catalogoEjercicio.findUnique({ where: { nombre } })
      if (!existe) await prisma.catalogoEjercicio.create({ data: { nombre } }).catch(() => {})
    }

    // Ejercicios accesorios (límite de 16 series semanales por tren — regla de negocio
    // a validar en la UI, no se modela en BD)
    let accesoriosCreados = 0
    for (const acc of ACCESORIOS_SEED) {
      const existe = await prisma.ejercicioAccesorio.findFirst({ where: { nombre: acc.nombre, tipo: acc.tipo } })
      if (!existe) {
        await prisma.ejercicioAccesorio.create({ data: acc })
        accesoriosCreados++
      }
    }

    // 3) Macrociclo de voleibol: 49 semanas como Eventos del calendario
    let eventosCreados = 0
    const yaExisteMacrociclo = await prisma.evento.findFirst({ where: { descripcion: { contains: MARCA_MACROCICLO } } })
    if (!yaExisteMacrociclo) {
      const eventos = construirEventosMacrociclo()
      await prisma.evento.createMany({ data: eventos })
      eventosCreados = eventos.length
    }

    // 4) Récord de partidos: 20 encuentros ficticios de la fase competitiva
    let partidosCreados = 0
    const yaExistenPartidos = await prisma.partido.findFirst({ where: { rival: 'Selección ITS Mérida' } })
    if (!yaExistenPartidos) {
      for (const p of PARTIDOS_SEED) {
        const { numeroSets, resultadoFinal } = resultadoFinalDeSets(p.resultadoSets)
        const fecha = addDias(semanaRango(p.semana).inicio, p.diaOffset)
        await prisma.partido.create({
          data: {
            rama: 'Femenil',
            torneo: p.torneo,
            fecha,
            hora: p.hora,
            sede: p.sede,
            rival: p.rival,
            numeroSets,
            resultadoSets: p.resultadoSets,
            resultadoFinal,
          },
        })
        partidosCreados++
      }
    }

    return {
      ok: true,
      resumen: `${staffCreado} staff · ${etapasCreadas} etapas de gimnasio · ${accesoriosCreados} accesorios · ${eventosCreados} eventos del macrociclo · ${partidosCreados} partidos`,
    }
  } catch (e) {
    return { error: (e as Error).message }
  }
}

// ---------------------------------------------------------------------------
// Videoteca — lote de videos de YouTube para la categoría "Funcionales"
// ---------------------------------------------------------------------------

const VIDEOS_FUNCIONALES_SEED = [
  {
    url: 'https://youtube.com/shorts/jYJgLgGTuO4',
    titulo: 'Landmine Workout',
    descripcion: 'Circuito funcional con landmine (barra anclada) para fuerza y estabilidad de core y tren superior.',
  },
  {
    url: 'https://youtube.com/shorts/KA-HY5saJcs',
    titulo: 'Hombros funcionales',
    descripcion: 'Ejercicios funcionales para fortalecer y estabilizar la articulación del hombro.',
  },
  {
    url: 'https://youtube.com/shorts/jwNyj-B2RcU',
    titulo: 'Funcional con mancuernas',
    descripcion: 'Rutina funcional de cuerpo completo utilizando mancuernas.',
  },
  {
    url: 'https://youtube.com/shorts/hAm6Z4Nnz6M',
    titulo: 'Circuito mezclado',
    descripcion: 'Circuito funcional combinado que integra fuerza, equilibrio y resistencia.',
  },
  {
    url: 'https://youtube.com/shorts/JhEPgv3pcsI',
    titulo: 'Kettlebell funcional',
    descripcion: 'Ejercicios funcionales con kettlebell para potencia y estabilidad del core.',
  },
] as const

export async function seedVideosFuncionales(): Promise<{ error?: string; ok?: boolean; resumen?: string }> {
  if (process.env.NODE_ENV === 'production') {
    return { error: 'No disponible en producción.' }
  }

  try {
    let creados = 0
    for (const v of VIDEOS_FUNCIONALES_SEED) {
      const existe = await prisma.videoGimnasio.findFirst({ where: { url: v.url } })
      if (existe) continue

      await prisma.videoGimnasio.create({
        data: {
          titulo: v.titulo,
          descripcion: v.descripcion,
          url: v.url,
          categoria: 'Funcionales',
          subcategoria: null,
        },
      })
      creados++
    }

    return { ok: true, resumen: `${creados} videos de Funcionales creados (de ${VIDEOS_FUNCIONALES_SEED.length})` }
  } catch (e) {
    return { error: (e as Error).message }
  }
}
