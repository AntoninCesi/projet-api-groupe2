'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, Landmark, Trophy, Cpu, TrendingUp, Image, FlaskConical } from 'lucide-react';
import Shell from '@/components/Shell';
import api from '@/utils/api';
import { mapTopic, mapTheme } from '@/utils/adapters';

const LIMIT = 20;

const categoryIcons = {
  politics: Landmark,
  sport: Trophy,
  tech: Cpu,
  economy: TrendingUp,
  culture: Image,
  science: FlaskConical,
};

const toTopic = (t) => ({
  ...mapTopic(t),
  meta: `${t.postsCount ?? 0} posts · ${t.participantsCount ?? 0} participants`,
});

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [topics, setTopics] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) setQuery(q);
  }, []);

  useEffect(() => {
    api.get('/themes')
      .then((res) => setCategories(res.data.map((t) => mapTheme(t))))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const q = query.trim();
    setLoading(true);
    const id = setTimeout(() => {
      api.get('/topics', { params: { page: 1, limit: LIMIT, ...(q && { search: q }) } })
        .then((res) => {
          setTopics(res.data.map(toTopic));
          setPage(1);
          setHasMore(res.data.length === LIMIT);
        })
        .catch(() => {
          setTopics([]);
          setHasMore(false);
        })
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(id);
  }, [query]);

  const loadMore = useCallback(async () => {
    const q = query.trim();
    const next = page + 1;
    setLoadingMore(true);
    try {
      const res = await api.get('/topics', { params: { page: next, limit: LIMIT, ...(q && { search: q }) } });
      setTopics((prev) => [...prev, ...res.data.map(toTopic)]);
      setPage(next);
      setHasMore(res.data.length === LIMIT);
    } catch {
    } finally {
      setLoadingMore(false);
    }
  }, [query, page]);

  const q = query.trim().toLowerCase();
  const matchCategories = q ? categories.filter((c) => c.name.toLowerCase().includes(q)) : categories;
  const noResult = q && topics.length === 0 && matchCategories.length === 0;

  return (
    <Shell>
      <div className="pt-6 lg:pt-0">
        <h1 className="font-title text-3xl font-bold text-ink lg:text-4xl">Explore</h1>
        <p className="mt-1 text-sm text-muted">Find hot topics or start deep diving by category</p>
      </div>

      <div className="glass mt-5 flex items-center gap-2.5 rounded-2xl px-4 py-3.5">
        <Search size={18} className="text-faint" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a topic or a theme…"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
        />
      </div>

      {loading ? (
        <p className="mt-8 text-center text-sm text-faint">Loading…</p>
      ) : noResult ? (
        <p className="mt-8 text-center text-sm text-faint">No results for “{query}”.</p>
      ) : (
        <>
          {topics.length > 0 && (
            <>
              <h2 className="mt-7 text-xs font-semibold uppercase tracking-wide text-brand">{q ? 'Topics' : 'Hot trends'}</h2>
              <div className="mt-3 space-y-3">
                {topics.map((t) => (
                  <HotTopic key={t.id} topic={t} />
                ))}
              </div>

              {hasMore && (
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="mt-4 w-full rounded-2xl border border-line/70 py-3 text-sm font-medium text-brand transition hover:border-brand/40 disabled:opacity-50"
                >
                  {loadingMore ? 'Loading…' : 'Load more'}
                </button>
              )}
            </>
          )}

          {matchCategories.length > 0 && (
            <>
              <h2 className="mt-8 text-xs font-semibold uppercase tracking-wide text-brand">Themes</h2>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {matchCategories.map((c) => (
                  <CategoryCard key={c.id} category={c} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </Shell>
  );
}

function HotTopic({ topic }) {
  return (
    <Link href={`/topic/${topic.id}`} className="flex w-full items-center gap-3 rounded-2xl border border-line/70 p-3 text-left transition hover:border-brand/40">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 font-title font-bold text-brand">
        {topic.degree}°
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-title font-semibold text-ink">{topic.title}</p>
        <p className="text-xs text-faint">{topic.meta}</p>
      </div>
      <ChevronRight size={18} className="shrink-0 text-faint" />
    </Link>
  );
}

function CategoryCard({ category }) {
  const Icon = categoryIcons[category.icon] ?? Landmark;
  return (
    <Link href={`/theme/${encodeURIComponent(category.id)}`} className="flex items-center gap-3 rounded-2xl border border-line/70 p-4 text-left transition hover:border-brand/40">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="font-title font-semibold text-ink">{category.name}</p>
        <p className="text-xs text-faint">{category.topicsCount} topics</p>
      </div>
    </Link>
  );
}
