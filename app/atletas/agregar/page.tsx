import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AgregarAtletaForm from '@/components/AgregarAtletaForm'

export const metadata = { title: 'Agregar Atleta — Sistema de Voleibol' }

export default async function AgregarAtletaPage() {
  const session = await getSession()

  if (!session || session.rol !== 'ADMIN') {
    redirect('/login')
  }

  return <AgregarAtletaForm />
}
      