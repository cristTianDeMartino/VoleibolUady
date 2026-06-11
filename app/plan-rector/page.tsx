import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Plan Rector — Selecciones de Voleibol',
  description:
    'Filosofía, objetivos y estructura del Plan Rector de las Selecciones de Voleibol del club.',
}

// ─── Imagen reutilizable para bloques ─────────────────────────────────────────
function BlockImage({
  src,
  alt,
  objectPosition = 'center center',
}: {
  src: string
  alt: string
  objectPosition?: string
}) {
  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-2xl border border-uady-gold/30 shadow-xl shadow-black/20">
      <Image src={src} alt={alt} fill className="object-cover" style={{ objectPosition }} />
    </div>
  )
}

// ─── Bloques de contenido alternado ───────────────────────────────────────────
interface ContentBlockProps {
  imageLeft: boolean
  eyebrow: string
  title: string
  imageSrc: string
  imageAlt: string
  imagePosition?: string
  children: React.ReactNode
}

function ContentBlock({
  imageLeft,
  eyebrow,
  title,
  imageSrc,
  imageAlt,
  imagePosition,
  children,
}: ContentBlockProps) {
  const textContent = (
    <div className="flex flex-col justify-center">
      <span className="text-uady-gold text-xs font-bold uppercase tracking-widest mb-2">
        {eyebrow}
      </span>
      <h2 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight">
        {title}
      </h2>
      <div className="space-y-4 text-white/85 leading-relaxed text-[15px]">{children}</div>
    </div>
  )

  const imageContent = <BlockImage src={imageSrc} alt={imageAlt} objectPosition={imagePosition} />

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
      {/* En móvil: imagen siempre arriba, texto abajo. En desktop: orden alternado */}
      <div className={imageLeft ? 'md:order-1 order-1' : 'md:order-2 order-1'}>
        {imageContent}
      </div>
      <div className={imageLeft ? 'md:order-2 order-2' : 'md:order-1 order-2'}>
        {textContent}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PlanRectorPage() {
  return (
    <div className="bg-uady-blue text-white">
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="bg-uady-gold text-uady-blue">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/25 border border-uady-blue/20 text-uady-blue text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-uady-blue rounded-full" />
            Documento Institucional 2026–2027
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-5">
            Plan Rector de las
            <span className="block text-white">Selecciones de Voleibol</span>
          </h1>
          <p className="text-uady-blue/90 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            Formación integral, excelencia deportiva e identidad como ejes de un
            modelo que trasciende la cancha.
          </p>
        </div>

      </section>

      {/* Onda decorativa */}
      <div
        className="relative z-10 -mt-8 h-16 bg-uady-gold"
        style={{ clipPath: 'ellipse(55% 100% at 50% 0%)' }}
      />

      {/* ── Cuerpo ──────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-20">

        {/* Bloque 1: Imagen izquierda — Texto derecha */}
        <ContentBlock
          imageLeft
          eyebrow="Trayectoria y resultados,
           Mi visión : Jesus Emilio Mijangos Noh"
          title="Resultados que respaldan el proyecto"
          imageSrc="/images/voleiplaya.jpg"
          imageAlt="Equipo de voleibol de playa"
          imagePosition="center 18%"
        >
          <p>
            A partir de mi ingreso como entrenador del equipo femenil de voleibol del club, en el
            año 2017, se ha calificado a todas las ediciones de la Universiada en su fase nacional,
            habiendo logrado una medalla de plata en voleibol de playa femenino en los Juegos
            Nacionales Universitarios en Puerto Vallarta 2021.
          </p>
          <p>
            Posterior a mi incorporación como entrenador al equipo varonil, se obtuvo una medalla
            de bronce en la Universiada Nacional 2025 en la disciplina de voleibol. Me permito
            compartir con ustedes los puntos que nos han permitido fundamentar el trabajo
            realizado.
          </p>
          <p>
            Como antecedente, los equipos femeniles del club no habían podido calificar a la
            Universiada Nacional en mucho tiempo. En años anteriores, el voleibol femenino
            en la región había sido dominado por el Tecnológico de Mérida y la
            Universidad Marista, mientras que en la rama varonil la hegemonía la había tenido el
            Tecnológico de Mérida durante muchos años.
          </p>
          <p>
            Desde el inicio de mi participación con los equipos de voleibol ha existido una
            comunicación permanente con los responsables de todas las áreas del programa, con los
            integrantes del cuerpo técnico y con las y los atletas, lo que ha permitido sostener un
            proyecto ordenado y competitivo.
          </p>
        </ContentBlock>

        {/* Separador decorativo */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-white/15" />
          <div className="w-2 h-2 rounded-full bg-uady-gold" />
          <div className="w-2 h-2 rounded-full bg-white/70" />
          <div className="w-2 h-2 rounded-full bg-uady-gold/70" />
          <div className="flex-1 h-px bg-white/15" />
        </div>

        {/* Bloque 2: Texto izquierda — Imagen derecha */}
        <ContentBlock
          imageLeft={false}
          eyebrow="Trabajo integral"
          title="Preparación multidisciplinaria dentro y fuera de la cancha"
          imageSrc="/images/voleisala.jpeg"
          imageAlt="Equipo de voleibol de sala"
        >
          <p>
            Uno de los factores más importantes ha sido la integración de un equipo de trabajo
            multidisciplinario, con auxiliar técnico, analista táctico, psicóloga, fisiatría,
            médico, odontólogo y nutriólogo. En este punto conviene enfatizar que la preparación
            profesional y la juventud de los colaboradores influyen directamente en su desempeño
            con los equipos.
          </p>
          <p>
            El área de salud institucional ha existido desde antes de nuestra incorporación a los
            equipos, pero no participaba directamente en cancha con las selecciones de voleibol. A
            través de gestiones con el responsable del área, se pudo acceder a un plan de
            voluntariado en la especialidad de fisioterapia, y ese acompañamiento ha influido
            positivamente en el desempeño de los equipos.
          </p>
          <p>
            La preparación física se ha centrado en el trabajo de fuerza como base, promoviendo y
            gestionando la creación de un gimnasio y un programa de musculación acorde con las
            características que requiere nuestro deporte.
          </p>
        </ContentBlock>

        {/* Separador decorativo */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-white/15" />
          <div className="w-2 h-2 rounded-full bg-uady-gold" />
          <div className="w-2 h-2 rounded-full bg-white/70" />
          <div className="w-2 h-2 rounded-full bg-uady-gold/70" />
          <div className="flex-1 h-px bg-white/15" />
        </div>

        {/* Bloque 3: Imagen izquierda — Texto derecha */}
        <ContentBlock
          imageLeft
          eyebrow="Captación y desarrollo"
          title="Formación, seguimiento y sostenibilidad a largo plazo"
          imageSrc="/images/jaguaresUnidos.jpg"
          imageAlt="Jaguares Unidos"
        >
          <p>
            Al no contar con un programa de becas deportivas, implementamos un seguimiento
            permanente a las y los prospectos detectados con intenciones de unirse al club.
          </p>
          <p>
            Hemos desarrollado la detección y el contacto personalizado de talentos en torneos
            locales, regionales y nacionales; también ubicamos y damos seguimiento a las y los
            atletas que participan en la Olimpiada Nacional, tanto del estado de Yucatán como de
            toda la región.
          </p>
          <p>
            A esos prospectos se les integra a un grupo de WhatsApp creado específicamente para dar
            seguimiento y compartir información, asesoramiento y apoyo en los pasos administrativos
            de ingreso al equipo. Además, se implementa un programa de asesorías impartido por
            integrantes de los equipos cuando los prospectos lo necesitan o lo desean.
          </p>
          <p>
            El reclutamiento también se realiza a través de las convocatorias a visorias del
            PICFIDE, y se han creado equipos B para potenciar el desarrollo deportivo de la mayor
            cantidad de atletas, con el fin de mantener y fortalecer el proyecto a largo plazo.
          </p>
          <p>
            Hemos estructurado un programa de fogueo en tres niveles: ligas y competencias locales,
            copas y torneos regionales en categorías libres y universitarias, y torneos nacionales y
            fogueos con universidades a nivel nacional.
          </p>
          <p>
            Otra base para el desarrollo y mantenimiento de los equipos es la estabilidad
            económica. Los recursos que genera el propio equipo son administrados exclusivamente por
            sus integrantes; los entrenadores no administran dicho recurso. Cuando no se utilizan
            durante la temporada vigente, esos recursos se conservan y administran por los
            integrantes que permanecen en los equipos para temporadas posteriores.
          </p>
          <p>
            La formación y capacitación constante, así como la conversación directa con personas
            especialistas en voleibol y en distintas ciencias aplicadas al deporte, nos ha
            permitido mantenernos al día e implementar estrategias de desarrollo en cada temporada.
          </p>
          <p>
            Estos son algunos de los puntos básicos que han permitido que los equipos de voleibol
            del club se mantengan vigentes y competitivos en el ámbito del voleibol del país.
          </p>
        </ContentBlock>

        
      </div>

      {/* ── Botón de retorno ─────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 pb-16 flex justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-uady-gold text-uady-blue font-bold text-sm px-6 py-3 rounded-lg shadow-lg shadow-uady-blue/30 hover:brightness-110 hover:shadow-uady-blue/40 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Regresar al Inicio
        </Link>
      </div>
    </div>
  )
}
