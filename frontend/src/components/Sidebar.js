'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Bell, User, Plus, Vote, Droplet, Trophy } from 'lucide-react';
import Avatar from './Avatar';
import api from '@/utils/api';
import { mapProfile } from '@/utils/adapters';
import { themes } from '@/data/home';

// nav alignée sur la BottomNav mobile (mêmes routes/labels)
const nav = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/explore', label: 'Explorer', icon: Compass },
  { href: '/activity', label: 'Activité', icon: Bell, badge: 3 },
  { href: '/profile', label: 'Profil', icon: User },
];

const themeIcons = { compass: Compass, vote: Vote, droplet: Droplet, trophy: Trophy };

// sidebar desktop uniquement (cachée < lg) — remplace la topbar mobile
export default function Sidebar() {
  const path = usePathname();
  const [me, setMe] = useState(null);

  // profil courant pour le pied de sidebar (GET /api/auth/me)
  useEffect(() => {
    api.get('/api/auth/me').then((r) => setMe(mapProfile(r.data))).catch(() => {});
  }, []);

  return (
    <aside className="sticky top-0 hidden h-screen flex-col gap-1 overflow-y-auto border-r border-line px-5 py-6 lg:flex">
      <Link href="/" className="mb-3 flex items-baseline gap-2 px-3">
        <span className="relative font-title text-[25px] font-bold tracking-[-0.7px] text-ink">
          Trend
          <span className="absolute left-full top-[0.16em] ml-[0.09em] h-[0.2em] w-[0.2em] rounded-full bg-brand" />
        </span>
        <span className="text-xs font-semibold text-faint">by Breezy</span>
      </Link>

      {nav.map((n) => {
        const Icon = n.icon;
        const active = path === n.href;
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`flex h-12 items-center gap-3 rounded-2xl px-3.5 text-[15px] font-semibold transition ${
              active ? 'bg-brand/10 font-extrabold text-press' : 'text-muted hover:bg-brand/5 hover:text-ink'
            }`}
          >
            <Icon size={21} />
            <span>{n.label}</span>
            {n.badge && (
              <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-extrabold text-white">
                {n.badge}
              </span>
            )}
          </Link>
        );
      })}

      <Link
        href="/create"
        className="mt-3.5 flex h-[50px] items-center justify-center gap-2 rounded-2xl bg-brand-grad font-extrabold text-white shadow-md shadow-brand/30 transition hover:-translate-y-px"
      >
        <Plus size={18} /> Nouveau post
      </Link>

      <div className="px-3.5 pb-1.5 pt-5 text-[11px] font-extrabold uppercase tracking-[0.13em] text-faint">
        Tes thèmes
      </div>
      {themes.map((t) => {
        const Icon = themeIcons[t.icon] ?? Compass;
        return (
          <Link
            key={t.id}
            href="/explore"
            className="flex h-[42px] items-center gap-3 rounded-xl px-3.5 text-sm font-semibold text-muted transition hover:bg-brand/5 hover:text-ink"
          >
            <span className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-[9px] bg-brand/10 text-press">
              <Icon size={14} />
            </span>
            <span className="truncate">{t.name}</span>
            <span className="ml-auto text-xs font-extrabold tabular-nums text-press">{t.degree}°</span>
          </Link>
        );
      })}

      <Link href="/profile" className="mt-auto flex items-center gap-3 rounded-2xl p-2.5 transition hover:bg-brand/5">
        <Avatar name={me?.name ?? 'Toi'} size={40} />
        <div className="min-w-0 leading-tight">
          <div className="truncate font-title text-sm font-bold text-ink">{me?.name ?? 'Mon profil'}</div>
          <div className="truncate text-xs text-faint">{me?.handle ?? ''}</div>
        </div>
      </Link>
    </aside>
  );
}
