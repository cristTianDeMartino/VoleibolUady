# CONTEXT.md — Sistema de Gestión Deportiva UADY 🏐
> Este archivo es la fuente de verdad para agentes de IA trabajando en este proyecto.
> Léelo completo antes de modificar cualquier archivo.

---

## 1. IDENTIDAD DEL PROYECTO

**Nombre:** Plan Rector — Selecciones de Voleibol UADY  
**Descripción:** Plataforma web integral para gestión técnica, estadística y médica de atletas de voleibol de la Universidad Autónoma de Yucatán (UADY).  
**URL local:** `http://localhost:3000`  
**Repositorio:** Next.js App Router monorepo

---

## 2. STACK TECNOLÓGICO

| Capa | Tecnología |
|---|---|
| Framework | Next.js (App Router) — NO usar Pages Router |
| Frontend | React + Tailwind CSS |
| Iconos | Lucide React + Tabler Icons |
| ORM | Prisma |
| BD Desarrollo | SQLite (`prisma/dev.db`) |
| BD Producción | PostgreSQL |
| Auth | Sesiones basadas en roles (RBAC) — sin NextAuth, sin Clerk |

**Reglas de stack:**
- Tailwind CSS únicamente — sin librerías de UI externas (no shadcn, no MUI, no Radix)
- Sin API routes innecesarias — usar Server Actions para mutaciones
- Server Components para lectura de datos, Server Actions para escritura
- No usar `useEffect` para fetching de datos — usar Server Components

---

## 3. PALETA DE COLORES INSTITUCIONAL UADY

| Color | Hex | Uso |
|---|---|---|
| Azul oscuro | `#1B2A4A` | Header, navbar, cards de sección, fondos de títulos |
| Amarillo/Oro | `#F5A623` | Botones primarios, badges, acentos, íconos destacados |
| Blanco | `#FFFFFF` | Fondos de cards, texto sobre azul |
| Gris claro | `#F9FAFB` | Fondos de página |

**CRÍTICO:** Respetar siempre esta paleta. No usar colores arbitrarios.  
El borde de acento izquierdo en cards usa `border-l-4 border-[#1B2A4A]` o `border-[#F5A623]`.

---

## 4. ESTRUCTURA DE ROLES Y ACCESO

### Roles existentes
```
rol: 'JUGADOR'       → atleta activo del equipo
rol: 'ADMIN'         → cuerpo técnico (entrenadores, médicos, psicólogos)
```

### Reglas de acceso por rol

| Acción | JUGADOR | ADMIN |
|---|---|---|
| Ver roster | ✅ | ✅ |
| Ver perfil propio (completo) | ✅ | ✅ |
| Ver perfil de compañero (solo datos públicos) | ✅ | ✅ |
| Ver datos privados de cualquier atleta | ❌ | ✅ |
| Crear/editar/eliminar atletas | ❌ | ✅ |
| Egresar/reactivar atletas | ❌ | ✅ |
| Acceder a módulo Gestión | ❌ | ✅ |
| Ver historial médico propio | ✅ | ✅ |
| Ver historial médico de otros | ❌ | ✅ |

### Sistema de autenticación
- Login por **código de acceso numérico de 6 dígitos** (no email/password)
- Formato del código: `[01/02][YY][XX]` donde 01=masculino, 02=femenino, YY=año, XX=aleatorio
- Sin autoregistro — solo el admin crea cuentas
- Después de login exitoso → siempre redirigir a `/inicio`
- Atletas EGRESADOS → bloqueados del login con mensaje especial (NO mostrar "Código incorrecto")

### Lógica de sesión en componentes
```typescript
const esAdmin = session.rol === 'ADMIN';
const esPropioAtleta = session.atletaId === params.id;
const accesoCompleto = esAdmin || esPropioAtleta;
```

---

## 5. SCHEMA DE PRISMA (fuente de verdad)

### Modelos principales

```prisma
enum Posicion {
  ACOMODO    // antes: colocador, armadora, armador
  CENTRAL
  BANDA
  LIBERO
  OPUESTO    // antes: opuesta
}

enum EstadoAtleta {
  ACTIVO
  EGRESADO
}

model Atleta {
  id               String        @id @default(cuid())
  nombre           String
  apellidos        String
  matricula        String?       // solo JUGADOR, no ADMIN
  genero           String        @default("F")
  rama             String        @default("Femenil") // derivado de genero — NO exponer en formularios
  posicion         Posicion?
  facultad         String
  directorFacultad String        // solo letras, sin números
  semestre         Int           // 1-12, select en UI
  telefonoPersonal String        // exactamente 10 dígitos
  telefonoTutor    String        // exactamente 10 dígitos
  correo           String?       // un solo campo de correo
  rolTecnico       String?
  codigoAcceso     String        @unique  // bcrypt hash — NUNCA exponer
  rol              String        @default("JUGADOR")
  estado           EstadoAtleta  @default(ACTIVO)
  fotoUrl          String?
  anioIngreso      Int           // OBLIGATORIO — select 2000-año actual
  anioEgreso       Int?          // NUNCA editable en UI — solo via egresarAtleta()
  numUniforme      Int?
  tallaPlayera     String?       // XS|S|M|L|XL|XXL
  tallaShort       String?
  tallaPants       String?
  tallaChamarra    String?
  privado          AtletaPrivado?
  claveAtleta      ClaveAtleta?
  lesiones         Lesion[]
  asistencias      Asistencia[]
  citas            CitaMedica[]
  createdAt        DateTime      @default(now())
}

model ClaveAtleta {
  id         String   @id @default(cuid())
  atletaId   String   @unique
  atleta     Atleta   @relation(fields: [atletaId], references: [id], onDelete: Cascade)
  clavePlana String   @unique   // texto plano — solo para exportación Excel y recuperación
  creadaEn   DateTime @default(now())
}

model AtletaPrivado {
  id                String  @id @default(cuid())
  atletaId          String  @unique
  atleta            Atleta  @relation(fields: [atletaId], references: [id], onDelete: Cascade)
  nss               String?   // exactamente 11 dígitos
  seguroAseguradora String?
  seguroPoliza      String?
  seguroTitular     String?
}
```

### Otros modelos existentes
- `Partido` — récord de temporada (sets, resultado, rival, torneo)
- `Asistencia` — registro diario de entrenamiento
- `Lesion` — historial médico (fechaConsulta, diagnostico, tratamiento, estatus: Activo|Alta)
- `Evento` — cronograma (fechaInicio, fechaFin, color, grupo)
- `CitaMedica` — citas (tipoEspecialista, fechaHora, motivo, estado: Programada|Completada|Cancelada)
- `VideoGimnasio` — videoteca de gimnasio (titulo, url, categoria, subcategoria)
- `SesionGimnasio` — sesiones de gimnasio
- `EtapaEntrenamiento`, `EjercicioPrincipal`, `DetalleSemana` — plan de pesas
- `EjercicioAccesorio` — ejercicios complementarios
- `CatalogoEjercicio` — catálogo base de ejercicios

---

## 6. REGLAS DE NEGOCIO CRÍTICAS

### Posiciones (enum cerrado — NO agregar más)
Solo existen exactamente estas 5:
`ACOMODO · CENTRAL · BANDA · LIBERO · OPUESTO`
Importar siempre desde `lib/constants/posiciones.ts` — nunca hardcodear.

### Campo `rama` — derivado, nunca editable
```typescript
// En Server Action, NUNCA en cliente:
rama = genero === 'FEMENINO' ? 'Femenil' : 'Varonil'
```

### Estado EGRESADO
```typescript
// egresarAtleta() — solo ADMIN
await prisma.atleta.update({
  where: { id: atletaId },
  data: { estado: 'EGRESADO', anioEgreso: new Date().getFullYear() }
})

// reactivarAtleta() — solo ADMIN  
await prisma.atleta.update({
  where: { id: atletaId },
  data: { estado: 'ACTIVO', anioEgreso: null }
})
```

### Atletas EGRESADOS — impacto en el sistema
- ❌ No pueden iniciar sesión (mensaje especial, no "Código incorrecto")
- ❌ No aparecen en listas de asistencia diaria
- ❌ No aparecen en selectores de citas médicas
- ✅ Su perfil se conserva íntegro con todo el historial
- ✅ Aparecen en el Roster con filtro "Egresados"
- ✅ Su tarjeta muestra años en dorado: `2020 · 2025`

### Eliminación de atletas (Hard Delete)
- Usa `onDelete: Cascade` en Prisma — borra todo en cascada
- Requiere Modal de confirmación con nombre del atleta (no texto inline)
- Muestra Toast de éxito tras eliminar
- Si hay redirect después del delete, pasar mensaje como search param: `/atletas?deleted=Nombre`

### Clave de acceso
- Generada por `lib/utils/generarClave.ts` → `generarClaveAcceso(genero)`
- Se muestra UNA SOLA VEZ en modal tras crear el atleta
- Se guarda hasheada (bcrypt) en `Atleta.codigoAcceso`
- Se guarda en texto plano en `ClaveAtleta.clavePlana` (solo para exportación)
- En UI posterior: mostrar solo `•••••• (no recuperable)`
- NUNCA exponer `codigoAcceso` en queries, respuestas de API o componentes

---

## 7. ESTRUCTURA DE NAVEGACIÓN (Header fijo)

```
[LOGO] Inicio | Plantilla ▾ | Área Deportiva ▾ | Área de la Salud ▾ | Gestión ▾ | Museo    [Usuario ▾]
```

### Submenús
- **Plantilla:** Roster · Asistencia
- **Área Deportiva:** Cronograma · Gimnasio y Preparación Física · Récord de Temporada
- **Área de la Salud:** Seguimiento Clínico · Lesiones · Citas Médicas
- **Gestión:** Panel admin — Carga masiva Excel · Centro de Reportes · Configuración

---

## 8. PERFIL DEL ATLETA — VISIBILIDAD POR ROL

### Admin o propio atleta (`accesoCompleto === true`) — 4 cards:
1. **Información Académica** — Facultad, Semestre, Director
2. **Información Deportiva** — Posición, Uniforme, Año ingreso, Tallas
3. **Información de Contacto** 🔒 — Correo, Teléfono personal, Teléfono tutor
4. **Datos Médicos** 🔒 — NSS, Seguro privado

### Compañero de equipo (`accesoCompleto === false`) — 2 cards únicamente:
1. **Información Académica** — visible completa
2. **Información Deportiva** — visible completa
- Card "Información de Contacto" → NO existe en el DOM
- Card "Datos Médicos" → NO existe en el DOM
- Código de acceso → NO visible bajo ningún contexto

### Query de Prisma según rol:
```typescript
const atleta = await prisma.atleta.findUnique({
  where: { id },
  include: accesoCompleto ? { privado: true, claveAtleta: false } : {}
})
```

---

## 9. FORMULARIO AGREGAR ATLETA

### Paso 1 — Rol (condiciona el resto):
- **JUGADOR:** muestra todos los campos
- **ADMIN:** muestra solo Nombre, Apellidos, Género, Teléfono, Correo

### Validaciones estrictas (cliente + servidor):
| Campo | Regla |
|---|---|
| Matrícula | Solo dígitos numéricos |
| Director(a) | Solo letras y espacios, sin números |
| NSS | Exactamente 11 dígitos numéricos |
| Teléfonos | Exactamente 10 dígitos numéricos |
| Semestre | Select 1-12 (no input libre) |
| Año de ingreso | Select 2000-año actual (no negativos, no futuro) |
| Posición | Select cerrado — solo los 5 valores del enum |

### Comportamiento post-guardado:
1. Server Action guarda atleta + genera clave
2. Modal muestra la clave UNA VEZ con botón "Copiar"
3. Al cerrar modal → formulario se resetea COMPLETAMENTE (reset de estado React)
4. Usuario permanece en la misma página para registrar el siguiente atleta
5. Aparece botón "Terminar y salir" tras primer guardado exitoso

---

## 10. EXPORTACIÓN EXCEL (Gestión → Roster General)

Archivo: `claves_acceso_{YYYY-MM-DD}.xlsx` con 2 hojas:

**Hoja 1 "Atletas"** — orden: Femenil ACTIVO → Varonil ACTIVO → Femenil EGRESADO → Varonil EGRESADO  
Columnas: Nombre · Apellidos · Género · Rama · Posición · Estado · Año Ingreso · Año Egreso · Núm. Uniforme · Talla Playera · Talla Short · Talla Pants · Talla Chamarra · Facultad · Semestre · Correo · Teléfono Personal · Teléfono Tutor · Matrícula · NSS · Aseguradora · Póliza · Titular · Código de Acceso

**Hoja 2 "Administradores"** — orden: Apellidos ASC  
Columnas: Nombre · Apellidos · Género · Correo · Teléfono · Código de Acceso

**Regla:** Campos vacíos = celda vacía (`""`). Nunca "Sin registrar" ni "—".

---

## 11. PATRONES DE UI CONSISTENTES

### Modales de confirmación
- Fondo: `fixed inset-0 bg-black/50 z-50`
- Contenedor: `bg-white rounded-xl shadow-xl max-w-md`
- Siempre incluir nombre del atleta en el título
- Botones alineados a la derecha: Cancelar (gris) | Acción (color según gravedad)
- Deshabilitar botones mientras la action está en proceso

### Toasts de notificación
- Posición: `fixed top-4 right-4 z-50`
- Auto-destruye en 4 segundos
- Borde izquierdo: verde para éxito, rojo para error
- Si hay redirect tras la acción → pasar mensaje como search param en URL

### Badges de estado
- ACTIVO: verde
- EGRESADO: gris oscuro (`bg-gray-700 text-white`)
- 🔒 Privado: amarillo UADY

### Filtros del Roster
- Siempre incluir: Estado (Activo/Egresado) · Posición · Género
- Por defecto mostrar ACTIVOS
- Implementar como search params en URL (Server Components, sin useState)

---

## 12. ARCHIVOS CLAVE DEL PROYECTO

```
app/
├── (auth)/login/          → página de login
├── inicio/                → dashboard principal
├── atletas/
│   ├── page.tsx           → roster con filtros
│   ├── agregar/page.tsx   → formulario nuevo atleta
│   └── [id]/page.tsx      → perfil individual
├── area-salud/            → módulo salud
├── area-deportiva/        → módulo deportivo
├── gestion/               → solo ADMIN
└── museo/                 → salón de la fama

lib/
├── utils/generarClave.ts  → generarClaveAcceso(genero)
├── constants/posiciones.ts → POSICIONES array canónico
└── atleta.queries.ts      → getAtletaPublico / getAtletaCompleto

app/actions/
└── atleta.actions.ts      → egresarAtleta / reactivarAtleta / crearAtleta

prisma/
├── schema.prisma          → fuente de verdad del schema
├── seed.ts                → datos de prueba (19 atletas)
└── dev.db                 → BD SQLite local
```

---

## 13. BUGS CONOCIDOS Y PENDIENTES

| Bug | Archivo | Estado |
|---|---|---|
| `egresarAtleta()` falla silenciosamente | `app/actions/atleta.actions.ts` | ❌ Pendiente |
| Formulario no resetea al cerrar modal de clave | `app/atletas/agregar/page.tsx` | ❌ Pendiente |

---

## 14. COMANDOS ÚTILES

```bash
npm run dev              # Levantar servidor de desarrollo
npx prisma studio        # Ver y editar BD visualmente
npx prisma db seed       # Poblar BD con datos de prueba
npx prisma migrate dev   # Aplicar migraciones pendientes
npx prisma generate      # Regenerar cliente de Prisma
```

---

## 15. RESTRICCIONES ABSOLUTAS — NUNCA VIOLAR

1. **NUNCA** exponer `codigoAcceso` en queries, APIs o UI
2. **NUNCA** incluir `AtletaPrivado` en queries públicas o listados generales
3. **NUNCA** hacer editable `anioEgreso` desde formularios de UI
4. **NUNCA** crear posiciones fuera del enum de 5 valores
5. **NUNCA** instalar librerías de UI externas (shadcn, MUI, Radix, etc.)
6. **NUNCA** usar Pages Router — solo App Router
7. **NUNCA** mostrar "Código incorrecto" a un atleta EGRESADO — usar mensaje especial
8. **NUNCA** incluir `rama` como campo editable en formularios — se deriva de `genero`
9. **NUNCA** hacer fetch del lado cliente para datos que pueden venir de Server Components
10. **NUNCA** eliminar datos históricos de atletas egresados
