export const LICENCIATURAS_UADY = [
  // Campus Ciencias de la Salud
  { facultad: 'Facultad de Medicina', licenciatura: 'Médico Cirujano' },
  { facultad: 'Facultad de Medicina', licenciatura: 'Nutrición' },
  { facultad: 'Facultad de Medicina', licenciatura: 'Rehabilitación' },
  { facultad: 'Facultad de Enfermería', licenciatura: 'Enfermería' },
  { facultad: 'Facultad de Enfermería', licenciatura: 'Trabajo Social' },
  { facultad: 'Facultad de Odontología', licenciatura: 'Cirujano Dentista' },
  { facultad: 'Facultad de Química', licenciatura: 'Químico Farmacéutico Biólogo' },
  { facultad: 'Facultad de Química', licenciatura: 'Química Aplicada' },
  // Campus Ciencias Exactas e Ingenierías
  { facultad: 'Facultad de Ingeniería', licenciatura: 'Ingeniería Civil' },
  { facultad: 'Facultad de Ingeniería', licenciatura: 'Ingeniería en Energías Renovables' },
  { facultad: 'Facultad de Ingeniería', licenciatura: 'Ingeniería Física' },
  { facultad: 'Facultad de Ingeniería', licenciatura: 'Ingeniería Mecatrónica' },
  { facultad: 'Facultad de Ingeniería Química', licenciatura: 'Ingeniería en Alimentos' },
  { facultad: 'Facultad de Ingeniería Química', licenciatura: 'Ingeniería en Biotecnología' },
  { facultad: 'Facultad de Ingeniería Química', licenciatura: 'Ingeniería Industrial Logística' },
  { facultad: 'Facultad de Ingeniería Química', licenciatura: 'Ingeniería Química Industrial' },
  { facultad: 'Facultad de Matemáticas', licenciatura: 'Actuaría' },
  { facultad: 'Facultad de Matemáticas', licenciatura: 'Ciencias de la Computación' },
  { facultad: 'Facultad de Matemáticas', licenciatura: 'Enseñanza de las Matemáticas' },
  { facultad: 'Facultad de Matemáticas', licenciatura: 'Ingeniería de Software' },
  { facultad: 'Facultad de Matemáticas', licenciatura: 'Ingeniería en Computación' },
  { facultad: 'Facultad de Matemáticas', licenciatura: 'Matemáticas' },
  // Campus Ciencias Sociales, Económico-Administrativas y Humanidades
  { facultad: 'Facultad de Ciencias Antropológicas', licenciatura: 'Arqueología' },
  { facultad: 'Facultad de Ciencias Antropológicas', licenciatura: 'Comunicación Social' },
  { facultad: 'Facultad de Ciencias Antropológicas', licenciatura: 'Turismo' },
  { facultad: 'Facultad de Contaduría y Administración', licenciatura: 'Contaduría Pública' },
  { facultad: 'Facultad de Contaduría y Administración', licenciatura: 'Administración de Empresas' },
  { facultad: 'Facultad de Derecho', licenciatura: 'Derecho' },
  { facultad: 'Facultad de Economía', licenciatura: 'Economía' },
  { facultad: 'Facultad de Educación', licenciatura: 'Educación' },
  { facultad: 'Facultad de Psicología', licenciatura: 'Psicología' },
  // Otros campus
  { facultad: 'CCBA', licenciatura: 'Medicina Veterinaria y Zootecnia' },
  { facultad: 'CCBA', licenciatura: 'Biología Marina' },
  { facultad: 'CCBA', licenciatura: 'Agroecología' },
] as const

export const LICENCIATURAS_LISTA = LICENCIATURAS_UADY.map((l) => l.licenciatura)
