'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Landmark, Trophy, Cpu, TrendingUp, Image, FlaskConical } from 'lucide-react';
import api from '@/utils/api';
import { mapTheme } from '@/utils/adapters';

const themeIcons = {
  politics: Landmark,
  sport: Trophy,
  tech: Cpu,
  economy: TrendingUp,
  culture: Image,
  science: FlaskConical,
};

function FollowRow({ theme }) {
  const [on, setOn] = useState(theme.following);
  const [busy, setBusy] = useState(false);
  const Icon = themeIcons[theme.icon] ?? Landmark;

  async function toggle() {
    if (busy) return;
    const prev = on;
    setOn(!prev);
    setBusy(true);
    try {
      const { data } = await api.post(`/themes/${encodeURIComponent(theme.id)}/follow`);
      setOn(data.following);
    } catch {
      setOn(prev);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-press">
        <Icon size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate font-title text-[13.5px] font-bold text-ink">{theme.name}</div>
        <div className="text-[11.5px] text-faint">{theme.actives}</div>
      </div>
      <button
        onClick={toggle}
        aria-pressed={on}
        className={`h-8 rounded-full px-3 text-xs font-bold transition ${
          on ? 'bg-brand/10 text-press' : 'border border-line text-muted hover:border-brand hover:text-press'
        }`}
      >
        {on ? 'Following' : '+ Follow'}
      </button>
    </div>
  );
}

export default function RailHome() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [themes, setThemes] = useState([]);

  useEffect(() => {
    api.get('/api/auth/me')
      .then((r) => {
        const followed = r.data.followedThemes ?? [];
        return api.get('/themes').then((res) => setThemes(res.data.map((t) => mapTheme(t, followed)).slice(0, 5)));
      })
      .catch(() => {
        api.get('/themes').then((res) => setThemes(res.data.map((t) => mapTheme(t)).slice(0, 5))).catch(() => {});
      });
  }, []);

  function submit(e) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/explore?q=${encodeURIComponent(q)}` : '/explore');
  }

  return (
    <aside className="sticky top-0 hidden h-screen flex-col gap-5 overflow-y-auto border-l border-white/60 bg-white/45 px-6 py-6 backdrop-blur-2xl backdrop-saturate-150 lg:flex">
      <form onSubmit={submit} className="glass flex h-12 items-center gap-2.5 rounded-2xl px-4 text-faint">
        <Search size={18} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a topic…"
          aria-label="Search a topic"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
        />
      </form>

      {themes.length > 0 && (
        <div className="rounded-2xl border border-line/70 p-4">
          <div className="font-title text-sm font-bold text-ink">Themes to follow</div>
          <div className="mt-3 flex flex-col gap-3.5">
            {themes.map((t) => (
              <FollowRow key={t.id} theme={t} />
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
