'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Plus, Bell, User } from 'lucide-react';

// onglet de nav : teal + point si actif, sinon gris
function NavLink({ href, icon: Icon, label, active }) {
  return (
    <Link href={href} aria-label={label} className={`relative ${active ? 'text-brand' : 'text-faint'}`}>
      <Icon size={22} />
      {active && <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand" />}
    </Link>
  );
}

// nav flottante 5 entrées (Accueil, Explorer, Créer, Activité, Profil)
export default function BottomNav() {
  const path = usePathname();

  return (
    <nav className="fixed bottom-4 left-1/2 z-10 flex w-[calc(100%-2.5rem)] max-w-[22rem] -translate-x-1/2 items-center justify-between rounded-full border border-line bg-white px-6 py-3 shadow-lg">
      <NavLink href="/" icon={Home} label="Accueil" active={path === '/'} />
      <NavLink href="/explore" icon={Compass} label="Explorer" active={path === '/explore'} />
      <Link href="/create" aria-label="Créer" className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-white shadow-md shadow-brand/30">
        <Plus size={24} />
      </Link>
      <NavLink href="/activity" icon={Bell} label="Activité" active={path === '/activity'} />
      <NavLink href="/profile" icon={User} label="Profil" active={path === '/profile'} />
    </nav>
  );
}
