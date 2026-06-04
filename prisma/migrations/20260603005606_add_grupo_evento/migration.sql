-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Evento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fechaInicio" DATETIME NOT NULL,
    "fechaFin" DATETIME NOT NULL,
    "color" TEXT NOT NULL,
    "grupo" TEXT NOT NULL DEFAULT 'GENERAL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Evento" ("color", "createdAt", "descripcion", "fechaFin", "fechaInicio", "id", "titulo") SELECT "color", "createdAt", "descripcion", "fechaFin", "fechaInicio", "id", "titulo" FROM "Evento";
DROP TABLE "Evento";
ALTER TABLE "new_Evento" RENAME TO "Evento";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
