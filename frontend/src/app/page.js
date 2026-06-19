import Link from 'next/link';
import { BadgeCheck, TrendingUp, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import ThemeCard from '@/components/ThemeCard';
import Sparkline from '@/components/SparkLine';
import { currentUser, featured, trending, themes } from '@/data/home';

export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-md bg-background px-5 pb-28">
      {/* top bar : marque + user (ou login si déconnecté) */}
      <header className="flex items-center justify-between py-5">
        <Link href="/" className="flex items-baseline gap-1.5">
          <span className="font-title text-xl font-bold text-ink">Trend</span>
          <span className="text-brand">*</span>
          <span className="text-xs text-faint">by Breezy</span>
        </Link>
        {currentUser ? (
          <Link href="/profile" aria-label="Profile">
            <img src={currentUser.avatar} alt={currentUser.name} className="h-9 w-9 rounded-full object-cover" />
          </Link>
        ) : (
          // shortcut: page /login pas encore faite
          <Link href="/login" className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">
            Log in
          </Link>
        )}
      </header>

      {/* à la une : sujet le plus chaud */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-brand">— Featured</h2>
        <div className="mt-2 flex items-start justify-between gap-3">
          <h1 className="font-title text-4xl font-bold leading-tight text-ink">{featured.topic}</h1>
          {/* jauge de chaleur */}
          <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border-4 border-brand">
            <span className="font-title text-xl font-bold text-ink">{featured.degree}°</span>
            {featured.onFire && <span className="text-[9px] font-semibold uppercase tracking-wide text-brand">On fire</span>}
          </div>
        </div>

        {/* chips */}
        <div className="mt-3 flex gap-2">
          <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-press">{featured.tag}</span>
          {featured.official && (
            <span className="flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-press">
              <BadgeCheck size={14} /> Official
            </span>
          )}
        </div>

        {/* fluctuation du sujet */}
        <div className="mt-4 flex items-center gap-3">
          <Sparkline data={featured.spark} width={180} height={36} />
          <span className="flex items-center gap-1 text-sm font-semibold text-brand">
            <TrendingUp size={16} /> {featured.change}
          </span>
          <span className="text-sm text-faint">/{featured.window}</span>
        </div>

        <p className="mt-3 text-sm text-muted">
          {featured.posts} posts · {featured.participants} participants · updated {featured.updated}
        </p>

        {/* post source mis en avant */}
        <div className="mt-4 flex items-start gap-2 border-t border-line pt-4">
          <span className="flex items-center gap-1 text-sm font-semibold text-ink">
            {featured.source.name}
            {featured.source.verified && <BadgeCheck size={14} className="text-brand" />}
          </span>
          <p className="flex-1 text-sm text-muted">{featured.source.excerpt}</p>
        </div>

        {/* lien vers le post */}
        <Link
          href={featured.link}
          className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-brand-grad py-4 font-semibold text-white shadow-md shadow-brand/30"
        >
          Enter the topic <ArrowRight size={18} />
        </Link>
      </section>

      {/* ça grimpe maintenant */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-brand">— Trending now</h2>
          <Link href="/explore" className="text-sm font-medium text-brand">See all</Link>
        </div>

        <div className="mt-2 divide-y divide-line">
          {trending.map((t, i) => (
            <Link key={t.id} href={t.link} className="flex items-center gap-3 py-3">
              <span className="w-5 font-title text-sm font-bold text-faint">{String(i + 1).padStart(2, '0')}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{t.name}</p>
                <p className="text-xs text-faint">{t.meta}</p>
              </div>
              <Sparkline data={t.spark} width={56} height={24} color={t.up ? '#06C2B2' : '#90A09B'} />
              <span className="w-10 text-right font-title text-sm font-bold text-ink">{t.degree}°</span>
              <span className={`flex w-12 items-center justify-end gap-0.5 text-xs font-medium ${t.up ? 'text-brand' : 'text-faint'}`}>
                {t.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {t.change.replace(/^[+-]/, '')}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* thèmes de l'utilisateur */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-brand">— Your themes</h2>
          <Link href="/profile" className="text-sm font-medium text-brand">Manage</Link>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {themes.map((t) => (
            <ThemeCard key={t.id} theme={t} />
          ))}
        </div>
      </section>

      <BottomNav />
    </main>
  );
}