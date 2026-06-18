import { Settings } from 'lucide-react';
import ThemeCard from '@/components/ThemeCard';
import BottomNav from '@/components/BottomNav';
import { profile } from '@/data/profile';

export default function ProfilePage() {
  const { name, handle, avatar, bio, stats, themes } = profile;

  return (
    <main className="mx-auto min-h-screen max-w-md bg-background px-5 pb-28">
      {/* header */}
      <div className="flex justify-end py-4">
        <button className="text-muted" aria-label="Réglages"><Settings size={22} /></button>
      </div>

      {/* identité */}
      <div className="flex flex-col items-center text-center">
        {/* shortcut: <img> simple, pas de next/image pour éviter la config de domaine */}
        <img src={avatar} alt={name} className="h-24 w-24 rounded-full object-cover" />
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
        <button className="text-sm font-medium text-brand">Edit</button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {themes.map((t) => (
          <ThemeCard key={t.id} theme={t} />
        ))}
      </div>

      <BottomNav />
    </main>
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
