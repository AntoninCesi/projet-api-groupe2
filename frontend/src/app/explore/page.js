'use client';

  import { useState, useEffect, useCallback } from 'react';
  import Link from 'next/link';
  import { Search, ChevronRight, Landmark, Trophy, Cpu, TrendingUp, Image, FlaskConical } from 'lucide-react';
  import BottomNav from '@/components/BottomNav';
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

  // topic API -> forme front + ligne meta affichée sous le titre
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

    // catégories (thèmes) chargées une fois
    useEffect(() => {
      api.get('/themes')
        .then((res) => setCategories(res.data.map((t) => mapTheme(t))))
        .catch(() => setCategories([]));
    }, []);

    // recherche serveur (debounced) : reset page 1 à chaque frappe
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
          .catch(() => { setTopics([]); setHasMore(false); })
          .finally(() => setLoading(false));
      }, 300);
      return () => clearTimeout(id);
    }, [query]);

    // page suivante -> on concatène (search inclus pour paginer aussi les résultats)
    const loadMore = useCallback(async () => {
      const q = query.trim();
      const next = page + 1;
      setLoadingMore(true);
      try {
        const res = await api.get('/topics', { params: { page: next, limit: LIMIT, ...(q && { search: q }) } });
        setTopics((prev) => [...prev, ...res.data.map(toTopic)]);
        setPage(next);
        setHasMore(res.data.length === LIMIT);
      } catch { /* on garde la liste courante */ }
      finally { setLoadingMore(false); }
    }, [query, page]);

    const q = query.trim().toLowerCase();
    const matchCategories = q
      ? categories.filter((c) => c.name.toLowerCase().includes(q))
      : categories;
    const noResult = q && topics.length === 0 && matchCategories.length === 0;

    return (
      <main className="mx-auto min-h-screen max-w-md bg-background px-5 pb-28">
        {/* header */}
        <div className="pt-6">
          <h1 className="font-title text-3xl font-bold text-ink">Explore</h1>
          <p className="mt-1 text-sm text-muted">Find hot topics or start deep diving by category</p>
        </div>

        {/* search */}
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-3">
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
            {/* topics (recherche serveur si query, sinon les plus chauds) */}
            {topics.length > 0 && (
              <>
                <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-brand">
                  — {q ? 'Topics' : 'Hot trends'}
                </h2>
                <div className="mt-3 space-y-3">
                  {topics.map((t) => (
                    <HotTopic key={t.id} topic={t} />
                  ))}
                </div>

                {/* charger plus de résultats */}
                {hasMore && (
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="mt-4 w-full rounded-2xl border border-line bg-white py-3 text-sm font-medium text-brand disabled:opacity-50"
                  >
                    {loadingMore ? 'Loading…' : 'Load more'}
                  </button>
                )}
              </>
            )}

            {/* Themes */}
            {matchCategories.length > 0 && (
              <>
                <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-brand">— Themes</h2>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {matchCategories.map((c) => (
                    <CategoryCard key={c.id} category={c} />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <BottomNav />
      </main>
    );
  }

  function HotTopic({ topic }) {
    return (
      <Link href={`/topic/${topic.id}`} className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white p-3 text-left">
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
      <Link href={`/theme/${encodeURIComponent(category.id)}`} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 text-left">
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
