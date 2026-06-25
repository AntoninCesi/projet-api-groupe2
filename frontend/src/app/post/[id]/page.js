'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, MessageCircle, Repeat2, BadgeCheck, ChevronDown, Pin } from 'lucide-react';
import Shell from '@/components/Shell';
import LikeButton from '@/components/LikeButton';
import Avatar from '@/components/Avatar';
import api from '@/utils/api';
import { mapPost, mapComment } from '@/utils/adapters';
import { getUserId } from '@/utils/auth';
import MessageButton from '@/components/MessageButton';
import CommentThread from '@/components/CommentThread';

export default function PostPage() {
  const router = useRouter();
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);

  // get the post with its comments and replies in one call
  function load() {
    const userId = getUserId();
    api.get(`/posts/${id}`).then((res) => {
      setPost(mapPost(res.data, userId));
      setComments((res.data.comments ?? []).map((c) => mapComment(c, userId)));
    }).catch(() => {});
  }

  useEffect(() => { load(); }, [id]);

  // add a top-level comment then reload
  async function addComment(text) {
    try {
      await api.post(`/posts/${id}/comments`, { content: text });
      load();
    } catch {}
  }

  // add a reply, replyTo is the line we answer, backend keeps it under the parent comment
  async function addReply(commentId, content, replyTo) {
    try {
      await api.post(`/posts/${id}/comments/${commentId}/replies`, { content, replyTo });
      load();
    } catch {}
  }

  const total = comments.reduce((n, c) => n + 1 + c.replies.length, 0);

  return (
    <Shell>
      <div className="flex items-center gap-3 pt-4 lg:pt-0">
        <button onClick={() => router.back()} aria-label="Back" className="text-ink">
          <ArrowLeft size={22} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="font-title text-base font-bold leading-tight text-ink">Post</h1>
          <p className="truncate text-xs text-faint">{post?.topic || ''}</p>
        </div>
      </div>

      {post && <PostCard post={post} />}

      <section className="mt-4 rounded-2xl border border-line/70 lg:border-white/60 lg:bg-white/45 lg:shadow-soft lg:backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-line/70 px-5 py-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">{total} replies</h2>
          <button className="flex items-center gap-1 text-xs font-medium text-faint">
            Top <ChevronDown size={14} />
          </button>
        </div>

        <div className="border-b border-line/70 px-5 py-4">
          <Composer onSubmit={addComment} />
        </div>

        <div className="px-5">
          <CommentThread comments={comments} onReply={addReply} />
        </div>
      </section>
    </Shell>
  );
}

function PostCard({ post }) {
  return (
    <article className="mt-4 rounded-2xl border border-line/70 p-5 lg:border-white/60 lg:bg-white/50 lg:shadow-soft lg:backdrop-blur-xl">
      {post.pinned && (
        <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand">
          <Pin size={13} /> {post.official ? 'Official' : 'Community'} · Pinned
        </p>
      )}

      <div className="flex items-center gap-2">
        <Link
          href={post.authorId ? `/users/${post.authorId}` : '#'}
          className="flex flex-1 items-center gap-2"
        >
          <Avatar name={post.author} src={post.avatar} size={40} />
          <span className="font-title text-lg font-semibold text-ink hover:underline">{post.author}</span>
          {post.verified && <BadgeCheck size={16} className="text-brand" />}
        </Link>
        <MessageButton userId={post.authorId} />
      </div>
      <p className="mt-1 text-xs text-faint">{post.time} ago</p>

      <p className="mt-3 whitespace-pre-wrap break-words text-[17px] leading-relaxed text-ink">{post.text}</p>

      {/* like works, the rest is just counts */}
      <div className="mt-4 flex items-center gap-6 text-faint">
        <LikeButton count={post.likes} liked={post.liked} size={18} postId={post.id} />
        <span className="flex items-center gap-1.5 text-sm">
          <MessageCircle size={18} /> {post.comments}
        </span>
        <span className="flex items-center gap-1.5 text-sm">
          <Repeat2 size={18} /> {post.reposts}
        </span>
      </div>
    </article>
  );
}

function Composer({ onSubmit }) {
  const [text, setText] = useState('');

  function send() {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText('');
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-line bg-transparent p-1.5 transition focus-within:border-brand/40">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && send()}
        placeholder="Add a comment…"
        className="flex-1 bg-transparent px-3 text-sm text-ink outline-none"
      />
      <button onClick={send} className="rounded-lg bg-brand-grad px-5 py-2 text-sm font-bold text-onbrand shadow-glowsm transition hover:-translate-y-px">
        Send
      </button>
    </div>
  );
}
