import { redirect } from 'next/navigation';

// pour l'instant on n'a que le profil -> on redirige dessus
export default function Home() {
  redirect('/profile');
}
