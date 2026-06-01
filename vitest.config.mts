import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    // Carga DATABASE_URL (.env) y matchers de jest-dom antes de cada suite
    setupFiles: ['./vitest.setup.ts'],
    // Cada archivo elige su entorno con `// @vitest-environment jsdom`.
    // Por defecto, node (para las pruebas de Server Actions contra Prisma).
    environment: 'node',
    globals: true,
    // Las pruebas de integración comparten la BD SQLite: sin paralelismo
    // entre archivos para evitar condiciones de carrera en los datos.
    fileParallelism: false,
  },
})
