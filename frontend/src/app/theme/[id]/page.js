'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Leaf, Check, Flame, BadgeCheck, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Shell from '@/components/Shell';
import SparkLine from '@/components/SparkLine';
import { theme } from '@/data/theme';

const filters = ['On fire', 'Official', 'All'];

export default function ThemePage() {
  const { featured } = theme;
  const [following, setFollowing] = useState(theme.following);
  const [filter, setFilter] = useState('On fire');

  const shownTopics = theme.topics.filter((t) =>
    filter === 'All' ? true : filter === 'Official' ? t.official : t.onFire
  );

  return (
    <Shell>
      {/* header */}
      <div className="flex items-center gap-3 py-5 lg:pt-0">
        <Link href="/" aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-title text-lg font-bold text-ink">Theme</h1>
          <p className="text-xs text-faint">{theme.actives}</p>
        </div>
      </div>

      {/* Theme Cards */}
      <section className="rounded-3xl border border-line bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-grad text-white">
            <Leaf size={24} />
          </div>
          <div>
            <h2 className="font-title text-2xl font-bold text-ink">{theme.name}</h2>
            <p className="text-sm text-muted">{theme.actives} · {theme.topicsCount} topics</p>
          </div>
        </div>

        {/* toggle follow button */}
        <button
          onClick={() => setFollowing((v) => !v)}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-semibold ${
            following ? 'border border-brand text-brand' : 'bg-brand text-white'
          }`}
        >
          {following ? <>Following <Check size={18} /></> : 'Follow'}
        </button>

        {/* charts*/}
        <div className="mt-4 flex items-center gap-4 border-t border-line pt-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-brand">
            <span className="font-title text-lg font-bold text-ink">{theme.degree}°</span>
          </div>
          <span className="flex items-center gap-1 text-sm font-semibold text-brand">
            <TrendingUp size={16} /> {theme.change}
          </span>
          <span className="text-sm text-faint">/{theme.window}</span>
          <div className="ml-auto">
            <SparkLine data={theme.spark} width={120} height={40} />
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

      {/* featured */}
      <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-brand">— Featured</h3>
      <Link href={featured.link} className="mt-3 block rounded-3xl border border-line bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-title text-2xl font-bold leading-tight text-ink">{featured.title}</h4>
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-brand">
            <span className="font-title text-lg font-bold text-ink">{featured.degree}°</span>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-press">{featured.tag}</span>
          <span className="flex items-center gap-1 rounded-full border border-line px-3 py-1 text-xs font-medium text-muted">
            <BadgeCheck size={14} className="text-brand" /> Official · {featured.official}
          </span>
        </div>
        <p className="mt-3 flex items-center gap-1 text-sm text-muted">
          {featured.posts} posts · {featured.participants} participants ·
          <span className="flex items-center gap-1 font-semibold text-brand"><TrendingUp size={14} /> {featured.change}</span>
          <span className="text-faint">/{featured.window}</span>
        </p>
      </Link>

      {/* Theme topics */}
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
            <SparkLine data={t.spark} width={56} height={24} color={t.up ? '#06C2B2' : '#90A09B'} />
            <span className="w-10 text-right font-title text-sm font-bold text-ink">{t.degree}°</span>
            <span className={`flex w-10 items-center justify-end gap-0.5 text-xs font-medium ${t.up ? 'text-brand' : 'text-faint'}`}>
              {t.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {t.change.replace(/^[+-]/, '')}
            </span>
          </Link>
        ))}
      </div>

    </Shell>
  );
}
