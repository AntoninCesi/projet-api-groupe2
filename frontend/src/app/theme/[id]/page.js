'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Leaf, Check, Flame, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import SparkLine from '@/components/SparkLine';
import api from '@/utils/api';
import { mapTopic } from '@/utils/adapters';
import { formatCount } from '@/utils/format';

const filters = ['All', 'On fire', 'Official'];

// topic API -> ligne de la liste "Theme topics"
function toThemeTopic(t) {
  const m = mapTopic(t);
  return {
    id: m.id,
    name: m.title,
    meta: `${t.category || 'Topic'} · ${t.postsCount ?? 0} posts`,
    degree: m.degree,
    change: `${m.variation >= 0 ? '+' : ''}${m.variation}%`,
    up: m.variation >= 0,
    official: m.official,
    onFire: m.onFire,
    spark: m.spark,
    link: `/topic/${m.id}`,
  };
}

export default function ThemePage() {
  const { id } = useParams(); // = nom de catégorie (déjà décodé par Next)
  const name = decodeURIComponent(id);

  const [theme, setTheme] = useState(null);
  const [topics, setTopics] = useState([]);
  const [following, setFollowing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get(`/themes/${encodeURIComponent(name)}`);
        if (!alive) return;
        setTheme(data);
        setTopics((data.topics ?? []).map(toThemeTopic));
      } catch {
        if (alive) setNotFound(true);
      } finally {
        if (alive) setLoading(false);
      }
      // état "suivi" depuis le profil courant (ignore si non connecté)
      try {
        const me = await api.get('/api/auth/me');
        if (alive) setFollowing((me.data.followedThemes ?? []).includes(name));
      } catch { /* non connecté -> pas suivi */ }
    })();
    return () => { alive = false; };
  }, [name]);

  async function toggleFollow() {
    const prev = following;
    setFollowing(!prev); // optimiste
    try {
      const { data } = await api.post(`/themes/${encodeURIComponent(name)}/follow`);
      setFollowing(data.following);
    } catch {
      setFollowing(prev); // échec (ex. non connecté) -> on revient en arrière
    }
  }

  const shownTopics = topics.filter((t) =>
    filter === 'All' ? true : filter === 'Official' ? t.official : t.onFire
  );
  const featured = topics[0] ?? null;

  if (loading) {
    return <main className="mx-auto min-h-screen max-w-md bg-background px-5 pb-28"><p className="mt-16 text-center text-sm text-faint">Loading…</p><BottomNav /></main>;
  }
  if (notFound || !theme) {
    return (
      <main className="mx-auto min-h-screen max-w-md bg-background px-5 pb-28">
        <div className="flex items-center gap-3 py-5">
          <Link href="/explore" aria-label="Back" className="text-ink"><ArrowLeft size={22} /></Link>
          <h1 className="font-title text-xl font-bold text-ink">Theme</h1>
        </div>
        <p className="mt-16 text-center text-sm text-faint">This theme has no topics yet.</p>
        <BottomNav />
      </main>
    );
  }

  const actives = `${formatCount(theme.participantsCount ?? 0)} active`;

  return (
    <main className="mx-auto min-h-screen max-w-md bg-background px-5 pb-28">
      {/* header */}
      <div className="flex items-center gap-3 py-5">
        <Link href="/explore" aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-title text-lg font-bold text-ink">Theme</h1>
          <p className="text-xs text-faint">{actives}</p>
        </div>
      </div>

      {/* carte thème */}
      <section className="rounded-3xl border border-line bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-grad text-white">
            <Leaf size={24} />
          </div>
          <div>
            <h2 className="font-title text-2xl font-bold text-ink">{theme.name}</h2>
            <p className="text-sm text-muted">{actives} · {theme.topicsCount} topics</p>
          </div>
        </div>

        {/* bouton follow (branché) */}
        <button
          onClick={toggleFollow}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-semibold ${
            following ? 'border border-brand text-brand' : 'bg-brand text-white'
          }`}
        >
          {following ? <>Following <Check size={18} /></> : 'Follow'}
        </button>

        {/* chaleur + courbe (sparkline du topic le plus chaud) */}
        <div className="mt-4 flex items-center gap-4 border-t border-line pt-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-brand">
            <span className="font-title text-lg font-bold text-ink">{theme.degree}°</span>
          </div>
          {featured && (
            <span className={`flex items-center gap-1 text-sm font-semibold ${featured.up ? 'text-brand' : 'text-faint'}`}>
              <TrendingUp size={16} /> {featured.change}
            </span>
          )}
          <div className="ml-auto">
            {featured?.spark.length > 1 && <SparkLine data={featured.spark} width={120} height={40} />}
          </div>
        </div>
      </section>

      {/* filters */}
      <div className="mt-5 flex gap-2 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex shrink-0 items-center gap-1 rounded-full px-4 py-2 text-sm font-medium ${
              filter === f ? 'bg-brand/10 text-brand' : 'border border-line bg-white text-muted'
            }`}
          >
            {f === 'On fire' && <Flame size={14} />}
            {f}
          </button>
        ))}
      </div>

      {/* topics du thème */}
      <div className="mt-6 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-brand">— Theme topics</h3>
        <Link href="/explore" className="text-sm font-medium text-brand">See all</Link>
      </div>
      <div className="mt-2 divide-y divide-line">
        {shownTopics.length === 0 && <p className="py-6 text-center text-sm text-faint">No topics here yet.</p>}
        {shownTopics.map((t, i) => (
          <Link key={t.id} href={t.link} className="flex items-center gap-3 py-3">
            <span className="w-5 font-title text-sm font-bold text-faint">{String(i + 1).padStart(2, '0')}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink">{t.name}</p>
              <p className="text-xs text-faint">{t.meta}</p>
            </div>
            {t.spark.length > 1 && (
              <SparkLine data={t.spark} width={56} height={24} color={t.up ? '#06C2B2' : '#90A09B'} />
            )}
            <span className="w-10 text-right font-title text-sm font-bold text-ink">{t.degree}°</span>
            <span className={`flex w-12 items-center justify-end gap-0.5 text-xs font-medium ${t.up ? 'text-brand' : 'text-faint'}`}>
              {t.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {t.change.replace(/^[+-]/, '')}
            </span>
          </Link>
        ))}
      </div>

      <BottomNav />
    </main>
  );
}
