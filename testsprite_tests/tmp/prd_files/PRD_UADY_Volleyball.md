# Product Requirements Document (PRD)
## Sistema de Gestión Deportiva — Selección de Voleibol UADY

### 1. Overview
Web platform for managing university sports teams at Universidad Autónoma de Yucatán (UADY).
Currently focused on volleyball but architected for multi-sport scalability.
Built with Next.js App Router, Prisma ORM, SQLite (dev) / PostgreSQL (prod), Tailwind CSS.
Closed system — no open registration. Access by unique numeric code only.

---

### 2. User Roles

#### ADMIN (Coaching Staff)
- Full read/write access to all modules
- Can create, edit, and delete athletes
- Can assign athletes as EGRESADO (graduated)
- Can download full system Excel export
- Can manage medical records, appointments, attendance

#### ATLETA (Athlete)
- Read-only access to their own area
- Can view tactical videos
- Can view their own profile (public + private fields)
- Can view teammates' public profile only
- Cannot see medical data of other athletes
- Cannot see access codes

---

### 3. Authentication
- Login via unique 6-digit numeric access code (no username/email)
- Code format: [01/02][YY][XX] where 01=male, 02=female, YY=year, XX=random
- No self-registration — admin creates all accounts
- Graduated athletes (EGRESADO) are blocked from login with specific message
- After successful login, always redirect to /inicio (dashboard)

---

### 4. Athlete Data Model

#### Public fields (visible to all authenticated users)
- Nombre, Apellidos
- Género (FEMENINO / MASCULINO)
- Posición: ACOMODO | CENTRAL | BANDA | LIBERO | OPUESTO
- Estado: ACTIVO | EGRESADO
- Año de ingreso, Año de egreso (if applicable)
- Número de uniforme (optional)
- Tallas: playera, short, pants, chamarra
- Facultad, Semestre
- Correo, Teléfono personal

#### Private fields (visible only to own athlete + ADMIN)
- NSS (Número de Seguridad Social — 11 digits)
- Seguro privado: aseguradora, póliza, titular
- Teléfono tutor/familiar
- Código de acceso (shown as •••••• — not recoverable after creation)

---

### 5. Modules / Navigation

#### Inicio (Dashboard)
- Main landing page after login
- Summary stats and quick access

#### Plantilla (Roster)
- Grid of athlete cards with photo, name, position badge, faculty, semester
- Filter by: estado (ACTIVO/EGRESADO), posición, género
- Each card shows: rama badge (Femenil/Varonil), name, position, faculty, "Ver detalles →"
- EGRESADO cards show: dark overlay on photo + "2020 · 2025" year range in gold
- Admin only: "+ Agregar Atleta" button

#### Área Deportiva
- Cronograma de eventos
- Preparación Física (gym videos)
- Récord de temporada
- Videoteca táctica (QuickMark analysis viewer)

#### Área de la Salud
- Historial médico de lesiones (private)
- Control de citas médicas
- Seguimiento clínico
- Filters by posición available

#### Gestión (ADMIN only)
- Bulk import via Excel
- Centro de Reportes Generales:
  - Roster General → downloads full Excel with all athlete data + access codes
- System configuration

#### Museo
- Hall of fame / historical achievements display

---

### 6. Key Forms & Flows

#### Agregar Atleta (ADMIN only) — /atletas/agregar
Step 1: Select ROL (JUGADOR or ADMINISTRADOR) — controls which fields appear

If ROL = JUGADOR, show all fields:
- Nombre, Apellidos (letters only, no numbers)
- Género: radio Femenino/Masculino
- Posición: select (Acomodo/Central/Banda/Líbero/Opuesto)
- Matrícula (numbers only)
- Facultad, Semestre (select 1-12), Director (letters only)
- Teléfono Personal (exactly 10 digits), Teléfono Tutor (exactly 10 digits)
- Correo
- Año de ingreso (select dropdown 2000-current year, no negatives)
- Número de uniforme (optional)
- Tallas: playera, short, pants, chamarra (XS/S/M/L/XL/XXL)
- NSS (exactly 11 digits), Seguro privado fields (optional)
- Foto del atleta (file upload)

If ROL = ADMINISTRADOR, show only:
- Nombre, Apellidos, Género, Teléfono, Correo

On save:
- System auto-generates 6-digit access code
- Modal appears showing the code ONE TIME ONLY
- Copy button available
- Form resets, user stays on same page (for bulk entry)
- "Terminar y salir" button appears after first successful save

#### Perfil del Atleta — /atletas/[id]
4 cards layout:
1. Información Académica (public)
2. Información Deportiva (public)
3. Información de Contacto 🔒 (private — own athlete + admin only)
4. Datos Médicos 🔒 (private — own athlete + admin only, hidden entirely for teammates)

Admin action buttons at bottom:
- If ACTIVO: [Asignar como Egresado] [Eliminar atleta por completo]
- If EGRESADO: [Reactivar atleta] [Eliminar atleta por completo]

Both destructive actions use confirmation Modal + Toast notification.

---

### 7. Validation Rules
- Matrícula: numbers only
- Nombre/Apellidos/Director: letters and spaces only, no numbers
- NSS: exactly 11 numeric digits
- Teléfonos: exactly 10 numeric digits
- Semestre: select 1-12 (no free text, no negatives)
- Año de ingreso: select dropdown 2000-current year (no negatives, no future)
- Posición: strictly one of 5 enum values (ACOMODO/CENTRAL/BANDA/LIBERO/OPUESTO)

---

### 8. Excel Export (Gestión → Roster General)
Single .xlsx file with 2 sheets:

Sheet 1 "Atletas" columns:
Nombre · Apellidos · Género · Rama · Posición · Estado · Año Ingreso · Año Egreso ·
Núm. Uniforme · Talla Playera · Talla Short · Talla Pants · Talla Chamarra ·
Facultad · Semestre · Correo · Teléfono Personal · Teléfono Tutor ·
Matrícula · NSS · Aseguradora · Póliza · Titular · Código de Acceso

Row order: Femenil ACTIVO → Varonil ACTIVO → Femenil EGRESADO → Varonil EGRESADO

Sheet 2 "Administradores" columns:
Nombre · Apellidos · Género · Correo · Teléfono · Código de Acceso

---

### 9. Access Code System
- Format: 6 numeric digits [prefix][year][random]
- Female prefix: 02, Male prefix: 01
- Year: last 2 digits of current year
- Random: 2 digits (10-99)
- Example: 022547 (female, 2025, random 47)
- Stored hashed (bcrypt) in Atleta.codigoAcceso
- Plain text stored in ClaveAtleta.clavePlana (admin-only access)
- Shown ONE TIME in modal after athlete creation
- Displayed as •••••• thereafter — not recoverable from UI
- Graduated athletes blocked from login with message: "Eres egresado de la UADY"

---

### 10. Estado (ACTIVO / EGRESADO) System
- Assigned only by ADMIN from athlete's individual profile
- anioEgreso auto-set to current year when marked EGRESADO
- anioEgreso cleared to null when reactivated to ACTIVO
- EGRESADO athletes blocked from login
- EGRESADO athletes excluded from: attendance lists, appointment selectors
- EGRESADO athletes visible in Roster with "Egresado" filter
- Full historical data preserved — nothing deleted on graduation
