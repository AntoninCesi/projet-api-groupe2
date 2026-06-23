'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Globe, Image as ImageIcon, BarChart2, Link2, Clapperboard } from 'lucide-react';
import Avatar from '@/components/Avatar';
import api from '@/utils/api';
import { mapProfile } from '@/utils/adapters';

const MAX = 280;

export default function CreatePage() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [topics, setTopics] = useState([]);
  const [topic, setTopic] = useState(null); // { id, title }
  const [pickerOpen, setPickerOpen] = useState(false);
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/topics', { params: { limit: 50 } })
      .then((res) => {
        const list = res.data.map((t) => ({ id: t._id, title: t.title }));
        setTopics(list);
        setTopic(list[0] ?? null);
      })
      .catch(() => {});
    api.get('/api/auth/me').then((res) => setMe(mapProfile(res.data))).catch(() => {});
  }, []);

  const remaining = MAX - text.length;
  const canPublish = text.trim().length > 0 && !!topic;

  async function publish() {
    if (!canPublish) return;
    setError('');
    try {
      await api.post('/posts', { content: text.trim(), topicId: topic.id });
      // ?tab=community : un post user arrive côté Community, on l'ouvre direct
      router.push(`/topic/${topic.id}?tab=community`);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not publish. Please try again.');
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-background px-5">
      {/* header */}
      <div className="flex items-center justify-between pt-4">
        <button onClick={() => router.back()} className="text-sm text-muted">
          Cancel
        </button>
        <h1 className="font-title text-base font-bold text-ink">New post</h1>
        <button
          onClick={publish}
          disabled={!canPublish}
          className={`rounded-2xl bg-gradient-to-r from-glow/50 to-brand/50 px-5 py-2 text-sm font-semibold text-ink shadow-sm transition ${canPublish ? '' : 'opacity-50'}`}
        >
          Publish
        </button>
      </div>

      {/* sélecteur de topic */}
      <div className="relative mt-4 w-fit">
        <button
          onClick={() => setPickerOpen(!pickerOpen)}
          className="flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1.5 text-sm"
        >
          <span className="text-faint">In</span>
          <span className="font-medium text-press">{topic?.title ?? 'Select a topic'}</span>
          <ChevronDown size={14} className="text-press" />
        </button>
        {pickerOpen && (
          <div className="absolute z-10 mt-1 max-h-72 w-64 overflow-auto rounded-2xl border border-line bg-white p-1 shadow-lg">
            {topics.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTopic(t);
                  setPickerOpen(false);
                }}
                className={`block w-full rounded-xl px-3 py-2 text-left text-sm ${t.id === topic?.id ? 'font-medium text-press' : 'text-ink'}`}
              >
                {t.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* auteur + visibilité */}
      <div className="mt-5 flex items-center gap-2">
        <Avatar name={me?.name || 'You'} size={40} />
        <span className="font-title font-semibold text-ink">{me?.name || 'You'}</span>
        {/* shortcut: visibilité non branchée (toujours Public en v1) */}
        <button className="ml-1 flex items-center gap-1 rounded-full border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink">
          <Globe size={13} /> Public
        </button>
      </div>

      {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {/* zone de texte */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={MAX}
        placeholder="What's new on this topic? Share an update, a source, your analysis…"
        className="mt-4 min-h-[120px] w-full resize-none bg-transparent text-[17px] leading-relaxed text-ink outline-none placeholder:text-faint"
      />

      {/* barre d'outils + compteur */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex gap-2">
          {/* shortcut: boutons d'ajout non branchés (image / sondage / lien / média) */}
          <ToolButton icon={ImageIcon} label="Image" />
          <ToolButton icon={BarChart2} label="Poll" />
          <ToolButton icon={Link2} label="Link" />
          <ToolButton icon={Clapperboard} label="Media" />
        </div>
        <span className={`text-sm ${remaining <= 20 ? 'text-press' : 'text-faint'}`}>{remaining}</span>
      </div>

      {/* l'espace vide ci-dessous laisse la place au clavier du téléphone */}
      <div className="flex-1" />
    </main>
  );
}

function ToolButton({ icon: Icon, label }) {
  return (
    <button
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-press shadow-sm"
    >
      <Icon size={18} />
    </button>
  );
}
