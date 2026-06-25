'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Leaf, Check, Flame, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Shell from '@/components/Shell';
import SparkLine from '@/components/SparkLine';
import RailTheme from '@/components/RailTheme';
import api from '@/utils/api';
import { mapTopic } from '@/utils/adapters';
import { formatCount } from '@/utils/format';
import { useFollowedThemes } from '@/components/FollowedThemes';

const filters = ['All', 'On fire', 'Official'];

// turn a topic into a row for the list
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
  const { id } = useParams(); // category name, Next already decoded it
  const name = decodeURIComponent(id);

  const { followed, toggle } = useFollowedThemes();
  const following = followed.includes(name);

  const [theme, setTheme] = useState(null);
  const [topics, setTopics] = useState([]);
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
    })();
    return () => { alive = false; };
  }, [name]);

  const shownTopics = topics.filter((t) =>
    filter === 'All' ? true : filter === 'Official' ? t.official : t.onFire
  );
  const featured = topics[0] ?? null;

  if (loading) {
    return <Shell><p className="mt-16 text-center text-sm text-faint">Loading…</p></Shell>;
  }
  if (notFound || !theme) {
    return (
      <Shell>
        <div className="flex items-center gap-3 py-5">
          <Link href="/explore" aria-label="Back" className="text-ink"><ArrowLeft size={22} /></Link>
          <h1 className="font-title text-xl font-bold text-ink">Theme</h1>
        </div>
        <p className="mt-16 text-center text-sm text-faint">This theme has no topics yet.</p>
      </Shell>
    );
  }

  const actives = `${formatCount(theme.participantsCount ?? 0)} active`;

  return (
    <Shell wide rail={<RailTheme themeTopics={topics} />}>
      {/* mobile: stacked layout (unchanged) */}
      <div className="lg:hidden">
        <div className="flex items-center gap-3 py-5">
          <Link href="/explore" aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-title text-lg font-bold text-ink">Theme</h1>
            <p className="text-xs text-faint">{actives}</p>
          </div>
        </div>

        <section className="rounded-3xl border border-line/70 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-grad text-white">
              <Leaf size={24} />
            </div>
            <div>
              <h2 className="font-title text-2xl font-bold text-ink">{theme.name}</h2>
              <p className="text-sm text-muted">{actives} · {theme.topicsCount} topics</p>
            </div>
          </div>

          <button
            onClick={() => toggle(name)}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-semibold ${
              following ? 'border border-brand text-brand' : 'bg-brand text-white'
            }`}
          >
            {following ? <>Following <Check size={18} /></> : 'Follow'}
          </button>

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

        <div className="mt-5 flex gap-2 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex shrink-0 items-center gap-1 rounded-full px-4 py-2 text-sm font-medium ${
                filter === f ? 'bg-brand/10 text-brand' : 'border border-line/70 text-muted'
              }`}
            >
              {f === 'On fire' && <Flame size={14} />}
              {f}
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-brand">Theme topics</h3>
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
      </div>

      {/* desktop: editorial leaderboard */}
      <div className="hidden lg:block lg:pt-1">
        {/* hero */}
        <section className="flex items-center gap-6 rounded-3xl border border-white/60 bg-white/55 p-7 shadow-soft backdrop-blur-2xl">
          <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-[26px] bg-brand-grad text-white shadow-glowsm">
            <Leaf size={36} />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="truncate font-title text-[34px] font-bold leading-none text-ink">{theme.name}</h1>
            <p className="mt-2 text-muted">{actives} · {theme.topicsCount} topics</p>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-brand">
              <span className="font-title text-xl font-bold text-ink">{theme.degree}°</span>
            </div>
            {featured && (
              <span className={`flex items-center gap-1 text-sm font-semibold ${featured.up ? 'text-brand' : 'text-faint'}`}>
                <TrendingUp size={15} /> {featured.change}
              </span>
            )}
          </div>

          {featured?.spark.length > 1 && (
            <div className="hidden xl:block">
              <SparkLine data={featured.spark} width={150} height={56} />
            </div>
          )}

          <button
            onClick={() => toggle(name)}
            className={`flex shrink-0 items-center justify-center gap-2 rounded-2xl px-7 py-3 font-semibold transition ${
              following ? 'border border-brand text-brand hover:bg-brand/5' : 'bg-brand text-white hover:bg-press'
            }`}
          >
            {following ? <>Following <Check size={17} /></> : 'Follow'}
          </button>
        </section>

        {/* filters */}
        <div className="mt-6 flex gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition ${
                filter === f ? 'bg-brand/10 text-brand' : 'border border-line/70 text-muted hover:border-brand/40'
              }`}
            >
              {f === 'On fire' && <Flame size={14} />}
              {f}
            </button>
          ))}
        </div>

        {/* leaderboard table */}
        <div className="mt-4 grid grid-cols-[44px_minmax(0,1fr)_120px_72px_72px] items-center gap-3 border-b border-line px-4 pb-2.5 text-[11px] font-semibold uppercase tracking-wide text-faint">
          <span>#</span>
          <span>Topic</span>
          <span className="text-center">Trend</span>
          <span className="text-right">Heat</span>
          <span className="text-right">24h</span>
        </div>

        {shownTopics.length === 0 && <p className="py-10 text-center text-sm text-faint">No topics here yet.</p>}

        {shownTopics.map((t, i) => (
          <Link
            key={t.id}
            href={t.link}
            className="grid grid-cols-[44px_minmax(0,1fr)_120px_72px_72px] items-center gap-3 border-b border-line/70 px-4 py-3.5 transition hover:bg-brand/[0.035]"
          >
            <span className="font-title text-sm font-bold text-faint">{String(i + 1).padStart(2, '0')}</span>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 truncate font-semibold text-ink">
                {t.onFire && <Flame size={14} className="shrink-0 text-brand" />}
                {t.name}
              </p>
              <p className="truncate text-xs text-faint">{t.meta}</p>
            </div>
            <div className="flex justify-center">
              {t.spark.length > 1 && (
                <SparkLine data={t.spark} width={100} height={28} color={t.up ? '#06C2B2' : '#90A09B'} />
              )}
            </div>
            <span className="text-right font-title text-sm font-bold text-ink">{t.degree}°</span>
            <span className={`flex items-center justify-end gap-0.5 text-xs font-medium ${t.up ? 'text-brand' : 'text-faint'}`}>
              {t.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {t.change.replace(/^[+-]/, '')}
            </span>
          </Link>
        ))}
      </div>
    </Shell>
  );
}
