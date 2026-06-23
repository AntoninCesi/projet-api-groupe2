'use client';

import { useState } from 'react';
import { Search, BadgeCheck } from 'lucide-react';
import Avatar from './Avatar';
import { themes } from '@/data/home';

const sources = ['Le Monde', 'Reuters', 'AFP'];

function FollowRow({ name, sub, initial }) {
  const [on, setOn] = useState(initial);
  return (
    <div className="flex items-center gap-3">
      <Avatar name={name} size={36} />
      <div className="min-w-0 flex-1">
        <div className="font-title text-[13.5px] font-bold text-ink">{name}</div>
        <div className="text-[11.5px] text-faint">{sub}</div>
      </div>
      <button
        onClick={() => setOn((v) => !v)}
        aria-pressed={on}
        className={`h-8 rounded-full px-3 text-xs font-bold transition ${
          on ? 'bg-brand/10 text-press' : 'border border-line bg-white text-muted hover:border-brand hover:text-press'
        }`}
      >
        {on ? 'Suivi' : '+ Suivre'}
      </button>
    </div>
  );
}

// rail droit desktop uniquement (caché < lg)
export default function RailHome() {
  return (
    <aside className="sticky top-0 hidden h-screen flex-col gap-5 overflow-y-auto border-l border-line px-6 py-6 lg:flex">
      <div className="flex h-12 items-center gap-2.5 rounded-2xl border border-line bg-white px-4 text-faint">
        <Search size={18} />
        <input
          placeholder="Rechercher un sujet…"
          aria-label="Rechercher un sujet"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
        />
      </div>

      <div className="rounded-2xl border border-line bg-white p-4">
        <div className="font-title text-sm font-bold text-ink">Thèmes à suivre</div>
        <div className="mt-3 flex flex-col gap-3.5">
          {themes.slice(0, 3).map((t, i) => (
            <FollowRow key={t.id} name={t.name} sub={t.actives} initial={i === 0} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white p-4">
        <div className="font-title text-sm font-bold text-ink">Sources officielles</div>
        <div className="mt-3 flex flex-col gap-3.5">
          {sources.map((n) => (
            <div key={n} className="flex items-center gap-3">
              <Avatar name={n} size={36} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 font-title text-[13.5px] font-bold text-ink">
                  {n} <BadgeCheck size={14} className="text-brand" />
                </div>
                <div className="text-[11.5px] text-faint">Source officielle</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
