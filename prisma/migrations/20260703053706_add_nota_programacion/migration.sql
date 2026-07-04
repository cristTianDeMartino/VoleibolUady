-- CreateTable
CREATE TABLE "NotaProgramacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contenido" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
