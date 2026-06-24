'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Pencil, MessageCircle, Repeat2, BadgeCheck, Pin } from 'lucide-react';
import Shell from '@/components/Shell';
import LikeButton from '@/components/LikeButton';
import Avatar from '@/components/Avatar';
import api from '@/utils/api';
import { mapTopic, mapPost } from '@/utils/adapters';
import { getUserId } from '@/utils/auth';

export default function TopicPage() {
  const { id } = useParams();
  const search = useSearchParams();
  const myId = getUserId();
  const [topic, setTopic] = useState(null);
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState(false);
  // if we just posted (?tab=community), open straight to Community
  const [tab, setTab] = useState(search.get('tab') === 'community' ? 'community' : 'official');

  useEffect(() => {
    const userId = getUserId();
    api.get(`/topics/${id}`).then((res) => setTopic(mapTopic(res.data))).catch(() => {});
    api.get('/posts', { params: { topicId: id } })
      .then((res) => setPosts(res.data.map((p) => mapPost(p, userId))))
      .catch(() => {});
    // "following" state from the current profile (ignored if not signed in)
    api.get('/api/auth/me')
      .then((res) => setFollowing((res.data.followedTopics ?? []).some((t) => String(t) === String(id))))
      .catch(() => {});
  }, [id]);

  async function toggleFollow() {
    const prev = following;
    setFollowing(!prev); // optimistic
    try {
      const { data } = await api.post(`/topics/${id}/follow`);
      setFollowing(data.following);
    } catch {
      setFollowing(prev); // failure (e.g. not signed in) -> roll back
    }
  }

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
          <p className="text-xs text-faint">{topic?.degree ?? 0}° · {topic?.participants ?? '0 participants'}</p>
        </div>
        <button
          onClick={toggleFollow}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${following ? 'bg-brand/10 text-brand' : 'bg-brand text-white'}`}
        >
          {following ? 'Following' : 'Follow'}
        </button>
      </div>

      {/* Official / Community tabs */}
      <div className="mt-4 flex gap-1 rounded-2xl bg-line/60 p-1">
        <TabButton label="Official" active={tab === 'official'} onClick={() => setTab('official')} />
        <TabButton label="Community" active={tab === 'community'} onClick={() => setTab('community')} />
      </div>

      {/* posts of the current tab -> click opens the post + comments page */}
      <div className="mt-3 space-y-3">
        {visible.map((p) => (
          <Post
            key={p.id}
            post={p}
            mine={String(p.authorId) === String(myId)}
            onUpdate={(up) => setPosts((list) => list.map((x) => (x.id === up.id ? up : x)))}
          />
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

// avatar + author + time row (shared between read & edit modes)
function PostHead({ post }) {
  return (
    <div className="flex items-start gap-2">
      {/* mocked posts -> logo (img); user posts -> initials avatar */}
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
    </div>
  );
}

function PinnedTag({ post }) {
  if (!post.pinned) return null;
  return (
    <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand">
      <Pin size={12} /> {post.tab === 'official' ? 'Official' : 'Community'} · Pinned
    </p>
  );
}

function Post({ post, mine, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.text);
  const [saving, setSaving] = useState(false);

  function startEdit(e) {
    // le bouton est dans un <Link> -> on bloque la navigation
    e.preventDefault();
    e.stopPropagation();
    setDraft(post.text);
    setEditing(true);
  }

  async function save() {
    const content = draft.trim();
    if (!content || saving) return;
    setSaving(true);
    try {
      const { data } = await api.patch(`/posts/${post.id}`, { content });
      onUpdate({ ...post, text: data.content });
      setEditing(false);
    } catch { /* échec -> on garde le mode édition */ }
    finally { setSaving(false); }
  }

  // edit mode (own posts only) : textarea + Save/Cancel, no Link wrapper
  if (editing) {
    return (
      <div className="rounded-2xl border border-line/70 p-4">
        <PinnedTag post={post} />
        <PostHead post={post} />
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={280}
          rows={3}
          autoFocus
          className="mt-2 w-full resize-none rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand"
        />
        <div className="mt-2 flex items-center justify-end gap-2">
          <button onClick={() => setEditing(false)} className="rounded-full px-3 py-1.5 text-sm font-medium text-faint">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!draft.trim() || saving}
            className="rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Link href={`/post/${post.id}`} className="block rounded-2xl border border-line/70 p-4 transition hover:border-brand/40">
        <PinnedTag post={post} />
        <PostHead post={post} />

        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">{post.text}</p>

        {/* actions: like is clickable, rest stays gray (// shortcut: not wired up) */}
        <div className="mt-3 flex items-center gap-6 text-faint">
          <LikeButton count={post.likes} liked={post.liked} size={16} postId={post.id} />
          <span className="flex items-center gap-1.5 text-sm">
            <MessageCircle size={16} /> {post.comments}
          </span>
          <span className="flex items-center gap-1.5 text-sm">
            <Repeat2 size={16} /> {post.reposts}
          </span>
        </div>
      </Link>

      {/* edit button shown only on your own posts */}
      {mine && (
        <button
          onClick={startEdit}
          aria-label="Edit post"
          className="absolute right-4 top-4 text-faint hover:text-brand"
        >
          <Pencil size={16} />
        </button>
      )}
    </div>
  );
}
