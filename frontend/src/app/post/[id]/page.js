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

export default function PostPage() {
  const router = useRouter();
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);

  // charge le post + ses commentaires/réponses embarqués (un seul appel)
  function load() {
    const userId = getUserId();
    api.get(`/posts/${id}`).then((res) => {
      setPost(mapPost(res.data, userId));
      setComments((res.data.comments ?? []).map((c) => mapComment(c, userId)));
    }).catch(() => {});
  }

  useEffect(() => { load(); }, [id]);

  // commentaire top-level -> POST puis refetch
  async function addComment(text) {
    try {
      await api.post(`/posts/${id}/comments`, { content: text });
      load();
    } catch {}
  }

  // réponse à un commentaire (1 niveau) -> POST puis refetch
  async function addReply(commentId, text) {
    try {
      await api.post(`/posts/${id}/comments/${commentId}/replies`, { content: text });
      load();
    } catch {}
  }

  const total = comments.reduce((n, c) => n + 1 + c.replies.length, 0);

  return (
    <Shell>
      {/* header */}
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

      <section className="mt-4 rounded-2xl border border-line/70">
        <div className="flex items-center justify-between border-b border-line/70 px-5 py-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">{total} replies</h2>
          <button className="flex items-center gap-1 text-xs font-medium text-faint">
            Top <ChevronDown size={14} />
          </button>
        </div>

        <div className="border-b border-line/70 px-5 py-4">
          <Composer onSubmit={addComment} />
        </div>

        <div className="divide-y divide-line/70 px-5">
          {comments.length === 0 && (
            <p className="py-10 text-center text-sm text-faint">No replies yet. Start the discussion.</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="py-4">
              <CommentItem comment={c} onReply={addReply} />
            </div>
          ))}
        </div>
      </section>
    </Shell>
  );
}

function PostCard({ post }) {
  return (
    <article className="mt-4 rounded-2xl border border-line/70 p-5">
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

      {/* actions : like cliquable, reste en gris (// shortcut: pas branché) */}
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

function CommentItem({ comment, onReply }) {
  // openId = id de la ligne dont l'input reply est ouvert (commentaire ou reply)
  const [openId, setOpenId] = useState(null);

  function toggle(id) {
    setOpenId(openId === id ? null : id);
  }

  // une reply va toujours sur le commentaire parent (1 seul niveau, voir CLAUDE.md)
  function submit(text) {
    onReply(comment.id, text);
    setOpenId(null);
  }

  return (
    <div>
      <CommentRow comment={comment} onReplyClick={() => toggle(comment.id)} />
      {openId === comment.id && <ReplyInput onSubmit={submit} />}

      {/* replies indentées (1 niveau) */}
      {comment.replies.length > 0 && (
        <div className="ml-5 mt-3 space-y-3 border-l border-line pl-4">
          {comment.replies.map((r) => (
            <div key={r.id}>
              <CommentRow comment={r} onReplyClick={() => toggle(r.id)} />
              {openId === r.id && <ReplyInput onSubmit={submit} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ligne d'un commentaire ou d'une reply (même rendu, onReplyClick optionnel)
function CommentRow({ comment, onReplyClick }) {
  return (
    <div className="flex gap-2.5 rounded-xl p-2 transition hover:bg-brand/[0.04]">
      {comment.authorId ? (
        <Link href={`/users/${comment.authorId}`} className="shrink-0"><Avatar name={comment.author} src={comment.avatar} size={34} /></Link>
      ) : (
        <Avatar name={comment.author} src={comment.avatar} size={34} />
      )}
      <div className="flex-1">
        <div className="flex items-center gap-1">
          {comment.authorId ? (
            <Link href={`/users/${comment.authorId}`} className="text-sm font-semibold text-ink hover:underline">{comment.author}</Link>
          ) : (
            <span className="text-sm font-semibold text-ink">{comment.author}</span>
          )}
          <span className="text-xs text-faint">· {comment.time}</span>
        </div>
        <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">{comment.text}</p>
        <div className="mt-1 flex items-center gap-4 text-xs text-faint">
          <LikeButton count={comment.likes} size={14} />
          {onReplyClick && (
            <button onClick={onReplyClick} className="font-medium text-faint">
              Reply
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReplyInput({ onSubmit }) {
  const [text, setText] = useState('');

  function send() {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText('');
  }

  return (
    <div className="mt-2 flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && send()}
        placeholder="Write a reply…"
        className="flex-1 rounded-full border border-line bg-white px-3 py-1.5 text-sm text-ink outline-none focus:border-brand"
      />
      <button onClick={send} className="rounded-full bg-brand px-3 py-1.5 text-sm font-medium text-white">
        Reply
      </button>
    </div>
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
