'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Bell, User, Plus, Landmark, Trophy, Cpu, TrendingUp, Image, FlaskConical } from 'lucide-react';
import Avatar from './Avatar';
import api from '@/utils/api';
import { mapProfile, mapTheme } from '@/utils/adapters';

const nav = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/activity', label: 'Activity', icon: Bell },
  { href: '/profile', label: 'Profile', icon: User },
];

const themeIcons = {
  politics: Landmark,
  sport: Trophy,
  tech: Cpu,
  economy: TrendingUp,
  culture: Image,
  science: FlaskConical,
};

export default function Sidebar() {
  const path = usePathname();
  const [me, setMe] = useState(null);
  const [themes, setThemes] = useState([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api.get('/api/auth/me')
      .then((r) => {
        setMe(mapProfile(r.data));
        const followed = r.data.followedThemes ?? [];
        return api.get('/themes').then((res) => {
          const all = res.data.map((t) => mapTheme(t, followed));
          const mine = all.filter((t) => t.following);
          setThemes((mine.length ? mine : all).slice(0, 6));
        });
      })
      .catch(() => {});
    api.get('/notifications')
      .then((r) => setUnread((r.data ?? []).filter((n) => !n.isRead).length))
      .catch(() => {});
  }, []);

  return (
    <aside className="sticky top-0 hidden h-screen flex-col gap-1 overflow-y-auto border-r border-white/60 bg-white/45 px-5 py-6 backdrop-blur-2xl backdrop-saturate-150 lg:flex">
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
        const badge = n.href === '/activity' && unread > 0 ? unread : null;
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
            {badge && (
              <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-extrabold text-white">
                {badge}
              </span>
            )}
          </Link>
        );
      })}

      <Link
        href="/create"
        className="mt-3.5 flex h-[50px] items-center justify-center gap-2 rounded-2xl bg-brand-grad font-extrabold text-onbrand shadow-glow transition hover:-translate-y-px"
      >
        <Plus size={18} /> New post
      </Link>

      {themes.length > 0 && (
        <>
          <div className="px-3.5 pb-1.5 pt-5 text-[11px] font-extrabold uppercase tracking-[0.13em] text-faint">
            Your themes
          </div>
          {themes.map((t) => {
            const Icon = themeIcons[t.icon] ?? Landmark;
            return (
              <Link
                key={t.id}
                href={`/theme/${encodeURIComponent(t.id)}`}
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
        </>
      )}

      <Link href="/profile" className="mt-auto flex items-center gap-3 rounded-2xl p-2.5 transition hover:bg-brand/5">
        <Avatar name={me?.name ?? 'You'} src={me?.avatar} size={40} />
        <div className="min-w-0 leading-tight">
          <div className="truncate font-title text-sm font-bold text-ink">{me?.name ?? 'My profile'}</div>
          <div className="truncate text-xs text-faint">{me?.handle ?? ''}</div>
        </div>
      </Link>
    </aside>
  );
}
