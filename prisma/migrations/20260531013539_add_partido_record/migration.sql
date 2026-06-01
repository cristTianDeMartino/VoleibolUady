-- CreateTable
CREATE TABLE "Partido" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rama" TEXT NOT NULL,
    "torneo" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "hora" TEXT NOT NULL,
    "sede" TEXT NOT NULL,
    "rival" TEXT NOT NULL,
    "numeroSets" INTEGER NOT NULL,
    "resultadoSets" TEXT NOT NULL,
    "resultadoFinal" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
