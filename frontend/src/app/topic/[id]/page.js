'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, MoreHorizontal, MessageCircle, Repeat2, BadgeCheck, Pin } from 'lucide-react';
import Shell from '@/components/Shell';
import LikeButton from '@/components/LikeButton';
import Avatar from '@/components/Avatar';
import api from '@/utils/api';
import { mapTopic, mapPost } from '@/utils/adapters';
import { getUserId } from '@/utils/auth';

export default function TopicPage() {
  const { id } = useParams();
  const search = useSearchParams();
  const [topic, setTopic] = useState(null);
  const [posts, setPosts] = useState([]);
  // si on vient de publier (?tab=community), on ouvre direct sur Community
  const [tab, setTab] = useState(search.get('tab') === 'community' ? 'community' : 'official');

  useEffect(() => {
    const userId = getUserId();
    api.get(`/topics/${id}`).then((res) => setTopic(mapTopic(res.data))).catch(() => {});
    api.get('/posts', { params: { topicId: id } })
      .then((res) => setPosts(res.data.map((p) => mapPost(p, userId))))
      .catch(() => {});
  }, [id]);

  const visible = posts.filter((p) => p.tab === tab);

  return (
    <Shell>
      {/* header */}
      <div className="flex items-center gap-3 pt-4 lg:pt-0">
        <Link href="/explore" aria-label="Back" className="text-ink">
          <ArrowLeft size={22} />
        </Link>
        {topic?.avatar ? (
          <img src={topic.avatar} alt={topic.title} className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <Avatar name={topic?.title || 'Topic'} size={36} />
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-title text-base font-bold leading-tight text-ink">{topic?.title || 'Loading…'}</h1>
          <p className="text-xs text-faint">{topic?.degree ?? 0}° · {topic?.participants ?? '—'}</p>
        </div>
        {/* shortcut: bouton follow non branché (Phase 4) */}
        <button className={`rounded-full px-4 py-1.5 text-sm font-medium ${topic?.following ? 'bg-brand/10 text-brand' : 'bg-brand text-white'}`}>
          {topic?.following ? 'Following' : 'Follow'}
        </button>
      </div>

      {/* onglets Officiel / Communauté */}
      <div className="mt-4 flex gap-1 rounded-2xl bg-line/60 p-1">
        <TabButton label="Official" active={tab === 'official'} onClick={() => setTab('official')} />
        <TabButton label="Community" active={tab === 'community'} onClick={() => setTab('community')} />
      </div>

      {/* posts du tab courant -> clic ouvre la page post + commentaires */}
      <div className="mt-3 space-y-3">
        {visible.map((p) => (
          <Link key={p.id} href={`/post/${p.id}`} className="block rounded-2xl border border-line/70 p-4 transition hover:border-brand/40">
            <Post post={p} />
          </Link>
        ))}
      </div>

    </Shell>
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
        <LikeButton count={post.likes} liked={post.liked} size={16} postId={post.id} />
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
