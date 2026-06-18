'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MoreHorizontal, Heart, MessageCircle, Repeat2, Share, BadgeCheck } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { topic, posts } from '@/data/topic';

export default function TopicPage() {
  const [tab, setTab] = useState('official');
  const visible = posts.filter((p) => p.tab === tab);

  return (
    <main className="mx-auto min-h-screen max-w-md bg-background px-5 pb-28">
      {/* header */}
      <div className="flex items-center gap-3 pt-4">
        <Link href="/explore" aria-label="Back" className="text-ink">
          <ArrowLeft size={22} />
        </Link>
        <img src={topic.avatar} alt={topic.title} className="h-9 w-9 rounded-full object-cover" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-title text-base font-bold leading-tight text-ink">{topic.title}</h1>
          <p className="text-xs text-faint">{topic.degree}° · {topic.participants}</p>
        </div>
        {/* shortcut: bouton non branché (pas d'API follow) */}
        <button className={`rounded-full px-4 py-1.5 text-sm font-medium ${topic.following ? 'bg-brand/10 text-brand' : 'bg-brand text-white'}`}>
          {topic.following ? 'Following' : 'Follow'}
        </button>
      </div>

      {/* onglets Officiel / Communauté */}
      <div className="mt-4 flex gap-1 rounded-2xl bg-line/60 p-1">
        <TabButton label="Official" active={tab === 'official'} onClick={() => setTab('official')} />
        <TabButton label="Community" active={tab === 'community'} onClick={() => setTab('community')} />
      </div>

      {/* posts du tab courant */}
      <div className="mt-4 space-y-4">
        {visible.map((p) => (
          <Post key={p.id} post={p} />
        ))}
      </div>

      <BottomNav />
    </main>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-xl py-2 text-sm font-medium ${active ? 'bg-white text-ink shadow-sm' : 'text-muted'}`}
    >
      {label}
    </button>
  );
}

function Post({ post }) {
  return (
    <article className="rounded-2xl border border-line bg-white p-4">
      {post.pinned && (
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-brand">
          {post.tab === 'official' ? 'Official' : 'Community'} · Pinned
        </p>
      )}

      <div className="flex items-center gap-2">
        <img src={post.avatar} alt={post.author} className="h-9 w-9 rounded-full object-cover" />
        <div className="flex flex-1 items-center gap-1">
          <span className="font-title font-semibold text-ink">{post.author}</span>
          {post.verified && <BadgeCheck size={15} className="text-brand" />}
          <span className="text-xs text-faint">· {post.time} ago</span>
        </div>
        <button className="text-faint" aria-label="More">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-ink">{post.text}</p>

      {/* actions : like en teal (état liké), reste en gris */}
      <div className="mt-3 flex items-center gap-6 text-faint">
        <span className="flex items-center gap-1.5 text-sm text-brand">
          <Heart size={16} fill="currentColor" /> {post.likes}
        </span>
        <span className="flex items-center gap-1.5 text-sm">
          <MessageCircle size={16} /> {post.comments}
        </span>
        <span className="flex items-center gap-1.5 text-sm">
          <Repeat2 size={16} /> {post.reposts}
        </span>
        <button className="ml-auto" aria-label="Share">
          <Share size={16} />
        </button>
      </div>
    </article>
  );
}
