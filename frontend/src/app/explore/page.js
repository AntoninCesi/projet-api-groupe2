import Link from 'next/link';
import { Search, ChevronRight, Landmark, Trophy, Cpu, TrendingUp, Image, FlaskConical } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { explore } from '@/data/explore';

const categoryIcons = {
  politics: Landmark,
  sport: Trophy,
  tech: Cpu,
  economy: TrendingUp,
  culture: Image,
  science: FlaskConical,
};

export default function ExplorePage() {
  const { hot, categories } = explore;

  return (
    <main className="mx-auto min-h-screen max-w-md bg-background px-5 pb-28">
      {/* header */}
      <div className="pt-6">
        <h1 className="font-title text-3xl font-bold text-ink">Explore</h1>
        <p className="mt-1 text-sm text-muted">Find hot topics or start deep diving by category</p>
      </div>

      {/* recherche */}
      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-3">
        <Search size={18} className="text-faint" />
        {/* shortcut: champ non branché (pas de recherche back) */}
        <input
          type="text"
          placeholder="Search a topic or a theme…"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
        />
      </div>

      {/* en feu maintenant */}
      <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-brand">— Harrrrrrrrr trends</h2>
      <div className="mt-3 space-y-3">
        {hot.map((t) => (
          <HotTopic key={t.id} topic={t} />
        ))}
      </div>

      {/* catégories */}
      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-brand">— Categories</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {categories.map((c) => (
          <CategoryCard key={c.id} category={c} />
        ))}
      </div>

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
    <Link href={category.link} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 text-left">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="font-title font-semibold text-ink">{category.name}</p>
        <p className="text-xs text-faint">{category.topics} topics</p>
      </div>
    </Link>
  );
}
