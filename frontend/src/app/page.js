import Link from 'next/link';
import { cookies } from 'next/headers';
import { User, BadgeCheck, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import Shell from '@/components/Shell';
import HeatDial from '@/components/HeatDial';
import ThemeCard from '@/components/ThemeCard';
import SparkLine from '@/components/SparkLine';
import api from '@/utils/api';
import { mapTopic, mapTheme } from '@/utils/adapters';
import FeedSection from '@/components/FeedSection';

async function getTopics() {
  try {
    const res = await api.get('/topics', { params: { limit: 10 } });
    return res.data.map((t) => mapTopic(t));
  } catch {
    return [];
  }
}

async function getThemes() {
  try {
    const res = await api.get('/themes');
    return res.data.map((t) => mapTheme(t)).slice(0, 4);
  } catch {
    return [];
  }
}

export default async function Home() {
  const loggedIn = cookies().get('trend_token');
  const [topics, themes] = await Promise.all([getTopics(), getThemes()]);
  const featured = topics[0] ?? null;
  const trending = topics.slice(1, 6);

  return (
    <Shell>
      <header className="flex items-center justify-between py-5 lg:hidden">
        <Link href="/" className="flex items-baseline gap-1.5">
          <span className="font-title text-xl font-bold text-ink">Trend</span>
          <span className="text-brand">*</span>
          <span className="text-xs text-faint">by Breezy</span>
        </Link>
        {loggedIn ? (
          <Link href="/profile" aria-label="Profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand">
            <User size={18} />
          </Link>
        ) : (
          <Link href="/login" className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">
            Log in
          </Link>
        )}
      </header>

      {featured && (
        <section className="lg:pt-1">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-brand">Featured</h2>
          <div className="mt-2 flex items-start justify-between gap-3">
            <h1 className="font-title text-3xl font-bold leading-tight text-ink lg:text-4xl">{featured.title}</h1>
            <HeatDial heat={featured.degree} onFire={featured.onFire} size={84} />
          </div>

          <div className="mt-3 flex gap-2">
            {featured.official && (
              <span className="flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-press">
                <BadgeCheck size={14} /> Official
              </span>
            )}
            <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${featured.variation >= 0 ? 'bg-brand/10 text-press' : 'bg-line text-muted'}`}>
              {featured.variation >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(featured.variation)}%
            </span>
          </div>

          <p className="mt-3 text-sm text-muted">{featured.participants}</p>

          {featured.spark.length > 1 && (
            <div className="mt-3">
              <SparkLine data={featured.spark} width={320} height={56} />
            </div>
          )}

          <Link
            href={`/topic/${featured.id}`}
            className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-brand-grad py-4 font-semibold text-white shadow-md shadow-brand/30 lg:w-fit lg:px-8"
          >
            Enter the topic <ArrowRight size={18} />
          </Link>
        </section>
      )}

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-brand">Trending now</h2>
          <Link href="/explore" className="text-sm font-medium text-brand">See all</Link>
        </div>

        <div className="mt-2 divide-y divide-line">
          {trending.map((t, i) => (
            <Link key={t.id} href={`/topic/${t.id}`} className="flex items-center gap-3 py-3">
              <span className="w-5 font-title text-sm font-bold text-faint">{String(i + 2).padStart(2, '0')}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{t.title}</p>
                <p className="text-xs text-faint">{t.participants}</p>
              </div>
              {t.spark.length > 1 && (
                <SparkLine data={t.spark} width={56} height={24} color={t.variation >= 0 ? '#06C2B2' : '#90A09B'} />
              )}
              <span className="w-10 text-right font-title text-sm font-bold text-ink">{t.degree}°</span>
              <span className={`flex w-12 items-center justify-end gap-0.5 text-xs font-medium ${t.variation >= 0 ? 'text-brand' : 'text-faint'}`}>
                {t.variation >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {Math.abs(t.variation)}%
              </span>
            </Link>
          ))}
        </div>
      </section>

      {themes.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-brand">Hot themes</h2>
            <Link href="/explore" className="text-sm font-medium text-brand">Explore</Link>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {themes.map((t) => (
              <ThemeCard key={t.id} theme={t} />
            ))}
          </div>
        </section>
      )}

      <FeedSection />
    </Shell>
  );
}
