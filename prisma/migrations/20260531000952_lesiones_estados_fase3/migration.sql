/*
  Warnings:

  - You are about to drop the column `descripcion` on the `Lesion` table. All the data in the column will be lost.
  - You are about to drop the column `fecha` on the `Lesion` table. All the data in the column will be lost.
  - You are about to drop the column `nivelDolor` on the `Lesion` table. All the data in the column will be lost.
  - You are about to drop the column `zonaCuerpo` on the `Lesion` table. All the data in the column will be lost.
  - Added the required column `diagnostico` to the `Lesion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaConsulta` to the `Lesion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tratamiento` to the `Lesion` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lesion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "atletaId" TEXT NOT NULL,
    "fechaConsulta" DATETIME NOT NULL,
    "diagnostico" TEXT NOT NULL,
    "tratamiento" TEXT NOT NULL,
    "estatus" TEXT NOT NULL DEFAULT 'Activo',
    "fechaAlta" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lesion_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES "Atleta" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Lesion" ("atletaId", "id") SELECT "atletaId", "id" FROM "Lesion";
DROP TABLE "Lesion";
ALTER TABLE "new_Lesion" RENAME TO "Lesion";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
