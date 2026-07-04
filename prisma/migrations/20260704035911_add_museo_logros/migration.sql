-- CreateTable
CREATE TABLE "Logro" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "rama" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "LogroImagen" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "logroId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    CONSTRAINT "LogroImagen_logroId_fkey" FOREIGN KEY ("logroId") REFERENCES "Logro" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
