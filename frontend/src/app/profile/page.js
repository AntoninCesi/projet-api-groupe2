'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings } from 'lucide-react';
import ThemeCard from '@/components/ThemeCard';
import Shell from '@/components/Shell';
import Avatar from '@/components/Avatar';
import api from '@/utils/api';
import { mapProfile } from '@/utils/adapters';
import { profile as mockProfile } from '@/data/profile';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get('/api/auth/me').then((res) => setProfile(mapProfile(res.data))).catch(() => {});
  }, []);

  const name = profile?.name ?? '…';
  const handle = profile?.handle ?? '';
  const avatar = profile?.avatar ?? null;
  const bio = profile?.bio ?? '';
  const stats = profile?.stats ?? { topics: 0, following: 0, karma: 0 };
  // shortcut: "My Themes" encore mocké (pas d'endpoint dédié côté back)
  const themes = mockProfile.themes;

  return (
    <Shell>
      {/* header */}
      <div className="flex justify-end py-4 lg:pt-0">
        <Link href="/profile/edit" className="text-muted" aria-label="Edit profile"><Settings size={22} /></Link>
      </div>

      {/* identité */}
      <div className="flex flex-col items-center text-center">
        {avatar ? (
          <img src={avatar} alt={name} className="h-24 w-24 rounded-full object-cover" />
        ) : (
          <Avatar name={name} size={96} />
        )}
        <h1 className="mt-3 font-title text-2xl font-bold text-ink">{name}</h1>
        <p className="text-faint">{handle}</p>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">{bio}</p>
      </div>

      {/* stats */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat value={stats.topics} label="Topics" />
        <Stat value={stats.following} label="Following" />
        <Stat value={stats.karma} label="Karma" />
      </div>

      {/* mes thèmes */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">— My Themes</h2>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {themes.map((t) => (
          <ThemeCard key={t.id} theme={t} />
        ))}
      </div>

    </Shell>
  );
}

function Stat({ value, label }) {
  return (
    <div className="rounded-2xl border border-line bg-white py-4 text-center">
      <p className="font-title text-xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-faint">{label}</p>
    </div>
  );
}