'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Search, Check } from 'lucide-react';

export default function TopicPicker({ topics, value, onChange }) {
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
        <div className="glass absolute z-20 mt-2 w-80 rounded-2xl p-2 shadow-pop">
          <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2">
            <Search size={15} className="text-faint" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a topic…"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
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
