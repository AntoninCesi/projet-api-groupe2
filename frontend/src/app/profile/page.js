'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Mail, MessageCircle, Repeat2, Pencil } from 'lucide-react';
import ThemeCard from '@/components/ThemeCard';
import LikeButton from '@/components/LikeButton';
import Shell from '@/components/Shell';
import Avatar from '@/components/Avatar';
import api from '@/utils/api';
import { mapProfile, mapPost } from '@/utils/adapters';
import { useFollowedThemes } from '@/components/FollowedThemes';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const { all, followed } = useFollowedThemes();
  const themes = all.filter((t) => followed.includes(t.name));

  useEffect(() => {
    api.get('/api/auth/me')
      .then((res) => {
        const me = res.data;
        setProfile(mapProfile(me));
        api.get('/posts', { params: { authorId: me._id } })
          .then((r) => setPosts(r.data.map((p) => mapPost(p, me._id))))
          .catch(() => {});
      })
      .catch(() => {});
  }, []);

  const name = profile?.name ?? '…';
  const handle = profile?.handle ?? '';
  const avatar = profile?.avatar ?? null;
  const bio = profile?.bio ?? '';
  const stats = profile?.stats ?? { topics: 0, following: 0, karma: 0 };

  return (
    <Shell>
      {/* mobile: top icon bar + centered identity */}
      <div className="lg:hidden">
        <div className="flex justify-between py-4">
          <Link href="/messages" className="text-muted" aria-label="Messages"><Mail size={22} /></Link>
          <Link href="/profile/edit" className="text-muted" aria-label="Edit profile"><Settings size={22} /></Link>
        </div>
        <div className="flex flex-col items-center text-center">
          {avatar ? (
            <img src={avatar} alt={name} className="h-24 w-24 rounded-full object-cover" />
          ) : (
            <Avatar name={name} size={96} />
          )}
          <h1 className="mt-3 font-title text-2xl font-bold text-ink">{name}</h1>
          <p className="text-faint">{handle}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">{bio}</p>
        </div>
      </div>

      {/* desktop: profile header row (avatar, identity, actions) */}
      <div className="hidden lg:flex lg:items-start lg:gap-6">
        {avatar ? (
          <img src={avatar} alt={name} className="h-24 w-24 shrink-0 rounded-full object-cover" />
        ) : (
          <Avatar name={name} size={96} />
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-title text-3xl font-bold text-ink">{name}</h1>
          <p className="text-faint">{handle}</p>
          {bio && <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{bio}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/messages"
            className="flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-muted transition hover:border-brand hover:text-press"
          >
            <Mail size={16} /> Messages
          </Link>
          <Link
            href="/profile/edit"
            className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-press"
          >
            <Settings size={16} /> Edit profile
          </Link>
        </div>
      </div>

      {/* stats */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat value={stats.topics} label="Topics" />
        <Stat value={stats.following} label="Following" />
        <Stat value={stats.karma} label="Karma" />
      </div>

      {/* my followed themes */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">My Themes</h2>
      </div>
      {themes.length === 0 ? (
        <p className="mt-4 text-sm text-faint">
          You don’t follow any theme yet. <Link href="/explore" className="font-medium text-brand">Explore themes</Link>
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {themes.map((t) => (
            <ThemeCard key={t.id} theme={t} />
          ))}
        </div>
      )}

      {/* my posts */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">My Posts</h2>
      </div>
      {posts.length === 0 ? (
        <p className="mt-4 text-sm text-faint">
          You haven’t posted anything yet. <Link href="/create" className="font-medium text-brand">Create a post</Link>
        </p>
      ) : (
        <div className="mt-2 divide-y divide-line">
          {posts.map((p) => (
            <PostItem
              key={p.id}
              post={p}
              onUpdate={(up) => setPosts((list) => list.map((x) => (x.id === up.id ? up : x)))}
            />
          ))}
        </div>
      )}

    </Shell>
  );
}

function PostItem({ post, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.text);
  const [saving, setSaving] = useState(false);

  function startEdit(e) {
    // button in Link div -> blocks 
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
    } catch { }
    finally { setSaving(false); }
  }

  // Edition
  if (editing) {
    return (
      <div className="py-4">
        {post.topic && <p className="mb-1 text-xs font-medium text-brand">{post.topic}</p>}
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={280}
          rows={3}
          autoFocus
          className="w-full resize-none rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand"
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
      <Link href={`/post/${post.id}`} className="block py-4">
        {post.topic && (
          <p className="mb-1 text-xs font-medium text-brand">{post.topic}</p>
        )}
        <p className="whitespace-pre-wrap break-words pr-8 text-sm leading-relaxed text-ink">{post.text}</p>
        <div className="mt-2 flex items-center gap-6 text-faint">
          <span className="text-xs text-faint">{post.time} ago</span>
          <LikeButton count={post.likes} liked={post.liked} size={15} postId={post.id} />
          <span className="flex items-center gap-1.5 text-sm">
            <MessageCircle size={15} /> {post.comments}
          </span>
          <span className="flex items-center gap-1.5 text-sm">
            <Repeat2 size={15} /> {post.reposts}
          </span>
        </div>
      </Link>
      <button
        onClick={startEdit}
        aria-label="Edit post"
        className="absolute right-0 top-4 text-faint hover:text-brand"
      >
        <Pencil size={16} />
      </button>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="rounded-2xl border border-line/70 py-4 text-center">
      <p className="font-title text-xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-faint">{label}</p>
    </div>
  );
}