'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Flame, Landmark, Trophy, Cpu, TrendingUp, Image, FlaskConical } from 'lucide-react';
import api from '@/utils/api';
import TopicPicker from './TopicPicker';
import { useFollowedThemes } from './FollowedThemes';

const themeIcons = {
  politics: Landmark,
  sport: Trophy,
  tech: Cpu,
  economy: TrendingUp,
  culture: Image,
  science: FlaskConical,
};

function FollowRow({ theme, onFollow }) {
  const Icon = themeIcons[theme.icon] ?? Landmark;
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
        onClick={onFollow}
        className="h-8 rounded-full border border-line px-3 text-xs font-bold text-muted transition hover:border-brand hover:text-press"
      >
        + Follow
      </button>
    </div>
  );
}

export default function RailTheme({ themeTopics = [] }) {
  const router = useRouter();
  const [topics, setTopics] = useState([]);
  const { all, followed, toggle } = useFollowedThemes();

  useEffect(() => {
    api.get('/topics', { params: { limit: 100 } })
      .then((res) => setTopics(res.data.map((t) => ({ id: t._id, title: t.title, category: t.category }))))
      .catch(() => {});
  }, []);

  const onFire = [...themeTopics].sort((a, b) => b.degree - a.degree).slice(0, 5);
  const suggestions = all.filter((t) => !followed.includes(t.name)).slice(0, 5);

  return (
    <aside className="sticky top-0 hidden h-screen flex-col gap-5 overflow-y-auto border-l border-white/60 bg-white/45 px-6 py-6 lg:flex">
      <TopicPicker
        variant="search"
        topics={topics}
        value={null}
        onChange={(t) => router.push(`/topic/${t.id}`)}
        placeholder="Search a topic…"
      />

      {onFire.length > 0 && (
        <div className="rounded-2xl border border-line/70 p-4">
          <div className="mb-3 flex items-center gap-1.5 font-title text-sm font-bold text-ink">
            <Flame size={15} className="text-brand" /> On fire here
          </div>
          <div className="flex flex-col">
            {onFire.map((t, i) => (
              <Link
                key={t.id}
                href={t.link ?? `/topic/${t.id}`}
                className="flex items-center gap-3 border-b border-line/60 py-2.5 last:border-0"
              >
                <span className="w-4 font-title text-xs font-bold text-faint">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink">{t.name}</span>
                <span className="font-title text-xs font-bold tabular-nums text-press">{t.degree}°</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="rounded-2xl border border-line/70 p-4">
          <div className="font-title text-sm font-bold text-ink">Themes to follow</div>
          <div className="mt-3 flex flex-col gap-3.5">
            {suggestions.map((t) => (
              <FollowRow key={t.id} theme={t} onFollow={() => toggle(t.name)} />
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
