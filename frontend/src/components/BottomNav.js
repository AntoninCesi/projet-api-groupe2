import { Home, Compass, Plus, Bell, User } from 'lucide-react';

// nav flottante 5 entrées (Accueil, Explorer, Créer, Activité, Profil)
export default function BottomNav() {
  return (
    <nav className="fixed bottom-4 left-1/2 z-10 flex w-[calc(100%-2.5rem)] max-w-[22rem] -translate-x-1/2 items-center justify-between rounded-full border border-line bg-white px-6 py-3 shadow-lg">
      <button className="text-faint" aria-label="Accueil"><Home size={22} /></button>
      <button className="text-faint" aria-label="Explorer"><Compass size={22} /></button>
      <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-white shadow-md shadow-brand/30" aria-label="Créer">
        <Plus size={24} />
      </button>
      <button className="text-faint" aria-label="Activité"><Bell size={22} /></button>
      <button className="relative text-brand" aria-label="Profil">
        <User size={22} />
        <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand" />
      </button>
    </nav>
  );
}
