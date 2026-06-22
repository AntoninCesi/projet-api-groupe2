'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Globe, Image as ImageIcon, BarChart2, Link2, Clapperboard } from 'lucide-react';
import Avatar from '@/components/Avatar';
import { currentUser } from '@/data/home';
import { topicList } from '@/data/create';
import { addPost } from '@/data/createdPosts';

const MAX = 280;

export default function CreatePage() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [topic, setTopic] = useState(topicList[0]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const remaining = MAX - text.length;
  const canPublish = text.trim().length > 0;

  function publish() {
    if (!canPublish) return;
    // shortcut: pas d'API encore -> stock mémoire + POST /posts { topic, text } plus tard
    addPost({
      id: Date.now(),
      topic,
      tab: 'community', // un post user arrive côté Community
      pinned: false,
      author: currentUser.name,
      verified: false,
      time: 'now',
      text: text.trim(),
      likes: 0,
      liked: false,
      comments: 0,
      reposts: 0,
    });
    // shortcut: un seul topic mocké -> on retombe toujours sur /topic/1
    router.push('/topic/1');
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
          <span className="font-medium text-press">{topic}</span>
          <ChevronDown size={14} className="text-press" />
        </button>
        {pickerOpen && (
          <div className="absolute z-10 mt-1 w-56 rounded-2xl border border-line bg-white p-1 shadow-lg">
            {topicList.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTopic(t);
                  setPickerOpen(false);
                }}
                className={`block w-full rounded-xl px-3 py-2 text-left text-sm ${t === topic ? 'font-medium text-press' : 'text-ink'}`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* auteur + visibilité */}
      <div className="mt-5 flex items-center gap-2">
        <Avatar name={currentUser.name} size={40} />
        <span className="font-title font-semibold text-ink">{currentUser.name}</span>
        {/* shortcut: visibilité non branchée (toujours Public en v1) */}
        <button className="ml-1 flex items-center gap-1 rounded-full border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink">
          <Globe size={13} /> Public
        </button>
      </div>

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
