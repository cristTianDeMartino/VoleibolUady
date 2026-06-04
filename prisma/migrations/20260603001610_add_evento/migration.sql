-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fechaInicio" DATETIME NOT NULL,
    "fechaFin" DATETIME NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
