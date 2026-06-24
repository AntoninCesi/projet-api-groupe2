'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Search, Check } from 'lucide-react';

export default function TopicPicker({ topics, value, onChange, variant = 'pick', placeholder = 'Search a topic…' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(() => new Set());
  const boxRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const groups = useMemo(() => {
    const m = new Map();
    for (const t of topics) {
      const cat = (t.category || '').trim() || 'Other';
      if (!m.has(cat)) m.set(cat, []);
      m.get(cat).push(t);
    }
    return [...m.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [topics]);

  const q = query.trim().toLowerCase();
  const matches = q ? topics.filter((t) => t.title.toLowerCase().includes(q)) : null;

  function pick(t) {
    onChange(t);
    setOpen(false);
    setQuery('');
  }

  function toggle(cat) {
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(cat)) n.delete(cat);
      else n.add(cat);
      return n;
    });
  }

  // search variant: the input IS the search bar, results drop down live as you type
  if (variant === 'search') {
    return (
      <div ref={boxRef} className="relative w-full">
        <div className="flex h-12 items-center gap-2.5 rounded-2xl border border-white/70 bg-white/55 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-2xl backdrop-saturate-150 transition focus-within:bg-white/70">
          <Search size={18} className="text-faint" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm text-ink outline-none focus-visible:!outline-none placeholder:text-faint"
          />
        </div>

        {open && matches && (
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-white/70 bg-white/55 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_18px_44px_-20px_rgba(12,27,25,0.3)] backdrop-blur-2xl backdrop-saturate-150">
            <div className="max-h-72 overflow-auto">
              {matches.length ? (
                matches.slice(0, 12).map((t) => <Row key={t.id} topic={t} onPick={pick} />)
              ) : (
                <p className="px-3 py-6 text-center text-sm text-faint">No topic found.</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={boxRef} className="relative w-fit">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1.5 text-sm"
      >
        <span className="text-faint">In</span>
        <span className="font-medium text-press">{value?.title ?? 'Select a topic'}</span>
        <ChevronDown size={14} className="text-press" />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-80 rounded-2xl border border-white/70 bg-white/55 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_18px_44px_-20px_rgba(12,27,25,0.3)] backdrop-blur-2xl backdrop-saturate-150">
          <div className="flex items-center gap-2 rounded-xl border border-white/50 bg-white/40 px-3 py-2 transition focus-within:border-white/80 focus-within:bg-white/65">
            <Search size={15} className="text-faint" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a topic…"
              className="w-full bg-transparent text-sm text-ink outline-none focus-visible:!outline-none placeholder:text-faint"
            />
          </div>

          <div className="mt-2 max-h-72 overflow-auto">
            {matches ? (
              matches.length ? (
                matches.map((t) => <Row key={t.id} topic={t} active={t.id === value?.id} onPick={pick} />)
              ) : (
                <p className="px-3 py-6 text-center text-sm text-faint">No topic found.</p>
              )
            ) : (
              groups.map(([cat, items]) => {
                const isOpen = expanded.has(cat);
                return (
                  <div key={cat}>
                    <button
                      onClick={() => toggle(cat)}
                      className="flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-left text-sm font-semibold text-ink hover:bg-brand/5"
                    >
                      {isOpen ? (
                        <ChevronDown size={14} className="text-faint" />
                      ) : (
                        <ChevronRight size={14} className="text-faint" />
                      )}
                      <span className="flex-1 truncate">{cat}</span>
                      <span className="text-xs font-medium text-faint">{items.length}</span>
                    </button>
                    {isOpen && (
                      <div className="ml-3 border-l border-line pl-2">
                        {items.map((t) => <Row key={t.id} topic={t} active={t.id === value?.id} onPick={pick} />)}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ topic, active, onPick }) {
  return (
    <button
      onClick={() => onPick(topic)}
      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm ${
        active ? 'bg-brand/10 font-medium text-press' : 'text-ink hover:bg-brand/5'
      }`}
    >
      <span className="flex-1 truncate">{topic.title}</span>
      {active && <Check size={14} className="shrink-0 text-press" />}
    </button>
  );
}
