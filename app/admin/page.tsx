import { redirect } from 'next/navigation'

// ponytail: no existe un dashboard de admin separado — los ADMIN usan el
// mismo "/" que todos. Este redirect solo evita el 404 a quien navega a /admin a mano.
export default function AdminPage() {
  redirect('/')
}
