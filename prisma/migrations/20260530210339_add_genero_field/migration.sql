-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Atleta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "genero" TEXT NOT NULL DEFAULT 'F',
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
INSERT INTO "new_Atleta" ("apellidos", "codigoAcceso", "createdAt", "directorFacultad", "facultad", "fotoUrl", "id", "nombre", "nss", "posicion", "rol", "seguroPrivado", "semestre", "telefonoPersonal", "telefonoTutor") SELECT "apellidos", "codigoAcceso", "createdAt", "directorFacultad", "facultad", "fotoUrl", "id", "nombre", "nss", "posicion", "rol", "seguroPrivado", "semestre", "telefonoPersonal", "telefonoTutor" FROM "Atleta";
DROP TABLE "Atleta";
ALTER TABLE "new_Atleta" RENAME TO "Atleta";
CREATE UNIQUE INDEX "Atleta_codigoAcceso_key" ON "Atleta"("codigoAcceso");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
