-- CreateTable
CREATE TABLE "Atleta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "posicion" TEXT NOT NULL,
    "facultad" TEXT NOT NULL,
    "directorFacultad" TEXT NOT NULL,
    "semestre" INTEGER NOT NULL,
    "telefonoPersonal" TEXT NOT NULL,
    "telefonoTutor" TEXT NOT NULL,
    "nss" TEXT NOT NULL,
    "seguroPrivado" TEXT,
    "codigoAcceso" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'JUGADOR',
    "fotoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Lesion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "atletaId" TEXT NOT NULL,
    "zonaCuerpo" TEXT NOT NULL,
    "nivelDolor" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lesion_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES "Atleta" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Atleta_codigoAcceso_key" ON "Atleta"("codigoAcceso");
