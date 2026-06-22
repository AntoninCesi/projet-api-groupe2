'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MoreHorizontal, MessageCircle, Repeat2, BadgeCheck, Pin } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import LikeButton from '@/components/LikeButton';
import Avatar from '@/components/Avatar';
import { topic, posts } from '@/data/topic';
import { createdPosts } from '@/data/createdPosts';

export default function TopicPage() {
  // posts créés cette session en premier, puis les posts mockés
  const allPosts = [...createdPosts, ...posts];
  // si on vient de poster (community), on ouvre direct sur Community pour voir son post
  const [tab, setTab] = useState(createdPosts.length ? 'community' : 'official');
  const visible = allPosts.filter((p) => p.tab === tab);

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

      {/* posts du tab courant -> clic ouvre la page post + commentaires */}
      <div className="mt-2 divide-y divide-line">
        {visible.map((p) => (
          <Link key={p.id} href={`/post/${p.id}`} className="block py-4">
            <Post post={p} />
          </Link>
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

// post posé sur le fond de l'appli, séparé par un trait (divide-y du parent)
function Post({ post }) {
  return (
    <article>
      {post.pinned && (
        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand">
          <Pin size={12} /> {post.tab === 'official' ? 'Official' : 'Community'} · Pinned
        </p>
      )}

      <div className="flex items-start gap-2">
        {/* posts mockés -> logo (img) ; posts user -> avatar à initiales */}
        {post.avatar ? (
          <img src={post.avatar} alt={post.author} className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <Avatar name={post.author} size={36} />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="font-title font-semibold text-ink">{post.author}</span>
            {post.verified && <BadgeCheck size={15} className="text-brand" />}
          </div>
          <span className="text-xs text-faint">{post.time} ago</span>
        </div>
        <button className="text-faint" aria-label="More">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-ink">{post.text}</p>

      {/* actions : like cliquable, reste en gris (// shortcut: pas branché) */}
      <div className="mt-3 flex items-center gap-6 text-faint">
        <LikeButton count={post.likes} liked={post.liked} size={16} />
        <span className="flex items-center gap-1.5 text-sm">
          <MessageCircle size={16} /> {post.comments}
        </span>
        <span className="flex items-center gap-1.5 text-sm">
          <Repeat2 size={16} /> {post.reposts}
        </span>
      </div>
    </article>
  );
}
