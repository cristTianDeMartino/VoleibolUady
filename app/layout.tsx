import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getSession } from '@/lib/auth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Plan Rector UADY Voleibol',
  description:
    'Plataforma de gestión del Plan Rector de las Selecciones de Voleibol de la Universidad Autónoma de Yucatán',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  return (
    <html lang="es" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col antialiased bg-slate-50`}>
        <Navbar user={session} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
