'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Mail, MessageCircle, Repeat2, Pencil } from 'lucide-react';
import ThemeCard from '@/components/ThemeCard';
import LikeButton from '@/components/LikeButton';
import Shell from '@/components/Shell';
import Avatar from '@/components/Avatar';
import api from '@/utils/api';
import { mapProfile, mapTheme, mapPost } from '@/utils/adapters';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [themes, setThemes] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.get('/api/auth/me')
      .then(async (res) => {
        const me = res.data;
        setProfile(mapProfile(me));

        // 'My Posts' : hitsory of user's posts
        api.get('/posts', { params: { authorId: me._id } })
          .then((r) => setPosts(r.data.map((p) => mapPost(p, me._id))))
          .catch(() => {});

        // "My Themes" = followed themes -> fetch their stats via /themes
        const followed = me.followedThemes ?? [];
        if (followed.length === 0) return;
        try {
          const all = await api.get('/themes');
          setThemes(all.data.filter((t) => followed.includes(t.name)).map((t) => mapTheme(t)));
        } catch { /* /themes unavailable -> show nothing */ }
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
      {/* header */}
      <div className="flex justify-between py-4 lg:pt-0">
        <Link href="/messages" className="text-muted" aria-label="Messages"><Mail size={22} /></Link>
        <Link href="/profile/edit" className="text-muted" aria-label="Edit profile"><Settings size={22} /></Link>
      </div>

      {/* identity */}
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
    <div className="rounded-2xl border border-line bg-white py-4 text-center">
      <p className="font-title text-xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-faint">{label}</p>
    </div>
  );
}