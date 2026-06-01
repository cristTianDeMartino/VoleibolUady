# Plan Rector - Selecciones de Voleibol UADY 🏐

Plataforma web integral para la gestión, monitoreo y seguimiento técnico, estadístico y médico de los atletas pertenecientes a las selecciones representativas de voleibol de la **Universidad Autónoma de Yucatán (UADY)**. 

Este sistema digitaliza los procesos clave del cuerpo técnico y automatiza el flujo de información de los jugadores bajo una arquitectura moderna, segura y de alto rendimiento.

## 🚀 Características del Proyecto

La plataforma está dividida estructuralmente según los roles del sistema (**Administrador / Cuerpo Técnico** y **Jugadores**), ofreciendo las siguientes soluciones:

* 👥 **Gestión de Plantilla (Roster):** Control total de los atletas inscritos, filtrado dinámico en tiempo real por Rama (Varonil/Femenil) y Posición de juego. Los administradores disponen de herramientas para actualizar la fotografía de perfil de cada jugador directamente desde la vista detallada.
* 📅 **Registro de Asistencia Automatizado:** Sistema de "autoservicio" diario donde los jugadores confirman su asistencia desde su dispositivo móvil. El administrador visualiza una matriz interactiva estilo hoja de cálculo organizada por meses y días de entrenamiento para facilitar la exportación de reportes institucionales.
* ⚕️ **Módulo de Gestión de Lesiones:** Máquina de estados clínicos que permite a los atletas reportar diagnósticos y tratamientos en tiempo real. Las lesiones permanecen "Activas" con alertas visuales hasta que el cuerpo técnico otorga el "Alta", estampando automáticamente la fecha de recuperación y moviendo el registro al historial médico protegido del perfil del atleta.
* 📊 **Récord de Temporada:** Bitácora histórica de partidos jugados. Cuenta con filtros avanzados por torneo y rama, acompañados de un formulario reactivo e intuitivo que genera dinámicamente casillas numéricas set por set (máximo 5) para evitar errores de captura manual en los marcadores parciales.
* 🏢 **Sección Institucional (Sobre el Plan Rector):** Vista de presentación de la filosofía, objetivos metodológicos, pedagógicos y tecnológicos del proyecto, estructurada mediante un diseño responsivo y alternado de imágenes y texto extenso.

## 🛠️ Stack Tecnológico

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Biblioteca Frontend:** [React.js](https://react.dev/)
* **Estilos y UI:** [Tailwind CSS](https://tailwindcss.com/) & [Lucide React](https://lucide.dev/) (Iconografía)
* **ORM:** [Prisma](https://www.prisma.io/)
* **Base de Datos (Desarrollo):** SQLite (Local)

## 💻 Instalación y Configuración Local

Sigue estos pasos para levantar el entorno de desarrollo en tu computadora local sin necesidad de una conexión activa a internet (salvo para la instalación inicial de dependencias):

### 1. Clonar el repositorio e ingresar al directorio
```bash
git clone [https://github.com/tu-usuario/uady-volleyball.git](https://github.com/tu-usuario/uady-volleyball.git)
cd uady-volleyball
```
### 2.  Instalar las dependencias del proyecto
```bash
npm install
```
### 3. Inicializar la base de datos local y Prisma
Asegúrate de que tu archivo .env en la raíz contenga la ruta correcta para el entorno SQLite local:
