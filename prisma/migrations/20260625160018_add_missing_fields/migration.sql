/*
  Warnings:

  - You are about to drop the column `nss` on the `Atleta` table. All the data in the column will be lost.
  - You are about to drop the column `seguroPrivado` on the `Atleta` table. All the data in the column will be lost.
  - Added the required column `anioIngreso` to the `Atleta` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VideoGimnasio" ADD COLUMN "subcategoria" TEXT;

-- CreateTable
CREATE TABLE "ClaveAtleta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "atletaId" TEXT NOT NULL,
    "clavePlana" TEXT NOT NULL,
    "creadaEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClaveAtleta_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES "Atleta" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AtletaPrivado" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "atletaId" TEXT NOT NULL,
    "nss" TEXT,
    "seguroAseguradora" TEXT,
    "seguroPoliza" TEXT,
    "seguroTitular" TEXT,
    CONSTRAINT "AtletaPrivado_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES "Atleta" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CatalogoEjercicio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EtapaEntrenamiento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "fechaInicio" DATETIME NOT NULL,
    "fechaFin" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EjercicioPrincipal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "fechaInicio" DATETIME NOT NULL,
    "fechaFin" DATETIME NOT NULL,
    "etapaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EjercicioPrincipal_etapaId_fkey" FOREIGN KEY ("etapaId") REFERENCES "EtapaEntrenamiento" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DetalleSemana" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ejercicioId" TEXT NOT NULL,
    "numeroSemana" INTEGER NOT NULL,
    "fechaInicioSemana" DATETIME NOT NULL,
    "fechaFinSemana" DATETIME NOT NULL,
    "series" INTEGER NOT NULL,
    "rpt" TEXT NOT NULL,
    "rir" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DetalleSemana_ejercicioId_fkey" FOREIGN KEY ("ejercicioId") REFERENCES "EjercicioPrincipal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EjercicioAccesorio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CitaMedica" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "atletaId" TEXT NOT NULL,
    "tipoEspecialista" TEXT NOT NULL,
    "fechaHora" DATETIME NOT NULL,
    "motivo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Programada',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CitaMedica_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES "Atleta" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Atleta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "matricula" TEXT,
    "genero" TEXT NOT NULL DEFAULT 'F',
    "rama" TEXT NOT NULL DEFAULT 'Femenil',
    "posicion" TEXT,
    "facultad" TEXT NOT NULL,
    "directorFacultad" TEXT NOT NULL,
    "semestre" INTEGER NOT NULL,
    "telefonoPersonal" TEXT NOT NULL,
    "telefonoTutor" TEXT NOT NULL,
    "correo" TEXT,
    "rolTecnico" TEXT,
    "codigoAcceso" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'JUGADOR',
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "fotoUrl" TEXT,
    "anioIngreso" INTEGER NOT NULL,
    "anioEgreso" INTEGER,
    "numUniforme" INTEGER,
    "tallaPlayera" TEXT,
    "tallaShort" TEXT,
    "tallaPants" TEXT,
    "tallaChamarra" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Atleta" ("apellidos", "codigoAcceso", "createdAt", "directorFacultad", "facultad", "fotoUrl", "genero", "id", "nombre", "posicion", "rama", "rol", "semestre", "telefonoPersonal", "telefonoTutor") SELECT "apellidos", "codigoAcceso", "createdAt", "directorFacultad", "facultad", "fotoUrl", "genero", "id", "nombre", "posicion", "rama", "rol", "semestre", "telefonoPersonal", "telefonoTutor" FROM "Atleta";
DROP TABLE "Atleta";
ALTER TABLE "new_Atleta" RENAME TO "Atleta";
CREATE UNIQUE INDEX "Atleta_codigoAcceso_key" ON "Atleta"("codigoAcceso");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ClaveAtleta_atletaId_key" ON "ClaveAtleta"("atletaId");

-- CreateIndex
CREATE UNIQUE INDEX "ClaveAtleta_clavePlana_key" ON "ClaveAtleta"("clavePlana");

-- CreateIndex
CREATE UNIQUE INDEX "AtletaPrivado_atletaId_key" ON "AtletaPrivado"("atletaId");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogoEjercicio_nombre_key" ON "CatalogoEjercicio"("nombre");
