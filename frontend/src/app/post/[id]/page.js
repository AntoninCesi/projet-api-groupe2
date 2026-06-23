'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, MessageCircle, Repeat2, BadgeCheck, ChevronDown, Pin } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import LikeButton from '@/components/LikeButton';
import Avatar from '@/components/Avatar';
import api from '@/utils/api';
import { mapPost, mapComment } from '@/utils/adapters';
import { getUserId } from '@/utils/auth';
import MessageButton from '@/components/MessageButton';
import { post, comments as initialComments } from '@/data/post';

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

  // réponse à un commentaire ou à une autre réponse -> POST puis refetch.
  // replyTo = id de la réponse visée (null = répond au commentaire).
  // rétro-compatible : le back ignore replyTo tant qu'il ne le gère pas.
  async function addReply(commentId, text, replyTo = null) {
    try {
      await api.post(`/posts/${id}/comments/${commentId}/replies`, { content: text, replyTo });
      load();
    } catch {}
  }

  const total = comments.reduce((n, c) => n + 1 + c.replies.length, 0);

  return (
    <main className="mx-auto min-h-screen max-w-md bg-background px-5 pb-28">
      {/* header */}
      <div className="flex items-center gap-3 pt-4">
        <button onClick={() => router.back()} aria-label="Back" className="text-ink">
          <ArrowLeft size={22} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="font-title text-base font-bold leading-tight text-ink">Post</h1>
          <p className="truncate text-xs text-faint">{post?.topic || ''}</p>
        </div>
      </div>

      {post && <PostCard post={post} />}

      {/* en-tête de la liste de réponses */}
      <div className="mt-5 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">— {total} replies</h2>
        {/* shortcut: tri non branché */}
        <button className="flex items-center gap-1 text-xs font-medium text-faint">
          Top <ChevronDown size={14} />
        </button>
      </div>

      <div className="mt-3 space-y-4">
        {comments.map((c) => (
          <CommentItem key={c.id} comment={c} onReply={addReply} postId={id} />
        ))}
      </div>

      <Composer onSubmit={addComment} />

      <BottomNav />
    </main>
  );
}

// post original : pas de carte, posé sur le fond de l'appli + trait de séparation
function PostCard({ post }) {
  return (
    <article className="mt-4 border-b border-line pb-5">
      {post.pinned && (
        <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand">
          <Pin size={13} /> {post.official ? 'Official' : 'Community'} · Pinned
        </p>
      )}

      <div className="flex items-center gap-2">
        {post.avatar ? (
          <img src={post.avatar} alt={post.author} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <Avatar name={post.author} size={40} />
        )}
        <div className="flex flex-1 items-center gap-1">
          <span className="font-title text-lg font-semibold text-ink">{post.author}</span>
          {post.verified && <BadgeCheck size={16} className="text-brand" />}
        </div>
        <MessageButton userId={post.authorId} />
      </div>
      <p className="mt-1 text-xs text-faint">{post.time} ago</p>

      <p className="mt-3 text-[17px] leading-relaxed text-ink">{post.text}</p>

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

function CommentItem({ comment, onReply, postId }) {
  // openId = id de la ligne dont l'input reply est ouvert (commentaire ou reply)
  const [openId, setOpenId] = useState(null);

  function toggle(id) {
    setOpenId(openId === id ? null : id);
  }

  // soumet une réponse en gardant la cible (replyTo) -> back via le commentaire parent
  function submit(replyTo, text) {
    onReply(comment.id, text, replyTo);
    setOpenId(null);
  }

  // les réponses sont à plat dans comment.replies, chacune avec un replyTo éventuel.
  // on reconstruit l'arbre : 'root' = réponses directes au commentaire.
  const byParent = {};
  for (const r of comment.replies) {
    const key = r.replyTo || 'root';
    (byParent[key] ||= []).push(r);
  }
  // id de réponse -> auteur, pour afficher "↳ @auteur"
  const authorById = Object.fromEntries(comment.replies.map((r) => [r.id, r.author]));

  // rendu récursif : décalage progressif plafonné (lisible même très imbriqué)
  function renderReplies(parentId, depth) {
    const list = byParent[parentId];
    if (!list) return null;
    return list.map((r) => (
      <div key={r.id} className="mt-3" style={{ marginLeft: Math.min(depth, 2) * 14 }}>
        {r.replyTo && (
          <p className="mb-0.5 text-xs text-faint">↳ @{authorById[r.replyTo] ?? '…'}</p>
        )}
        <CommentRow
          comment={r}
          onReplyClick={() => toggle(r.id)}
          likeEndpoint={`/posts/${postId}/comments/${comment.id}/replies/${r.id}/like`}
        />
        {openId === r.id && <ReplyInput onSubmit={(t) => submit(r.id, t)} />}
        {renderReplies(r.id, depth + 1)}
      </div>
    ));
  }

  return (
    <div>
      <CommentRow
        comment={comment}
        onReplyClick={() => toggle(comment.id)}
        likeEndpoint={`/posts/${postId}/comments/${comment.id}/like`}
      />
      {openId === comment.id && <ReplyInput onSubmit={(t) => submit(null, t)} />}

      {/* réponses indentées sous le commentaire (puis décalage par profondeur) */}
      {comment.replies.length > 0 && (
        <div className="ml-5 mt-3 border-l border-line pl-4">
          {renderReplies('root', 0)}
        </div>
      )}
    </div>
  );
}

// ligne d'un commentaire ou d'une reply (même rendu, onReplyClick optionnel)
function CommentRow({ comment, onReplyClick, likeEndpoint = null }) {
  return (
    <div className="flex gap-2">
      {comment.avatar ? (
        <img src={comment.avatar} alt={comment.author} className="h-8 w-8 rounded-full object-cover" />
      ) : (
        <Avatar name={comment.author} size={32} />
      )}
      <div className="flex-1">
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-ink">{comment.author}</span>
          <span className="text-xs text-faint">· {comment.time}</span>
        </div>
        <p className="mt-0.5 text-sm leading-relaxed text-ink">{comment.text}</p>
        <div className="mt-1 flex items-center gap-4 text-xs text-faint">
          <LikeButton count={comment.likes} liked={comment.liked} size={14} endpoint={likeEndpoint} />
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
    <div className="mt-5 flex items-center gap-2 rounded-2xl border border-line bg-white p-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && send()}
        placeholder="Add a comment…"
        className="flex-1 bg-transparent px-2 text-sm text-ink outline-none"
      />
      <button onClick={send} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">
        Send
      </button>
    </div>
  );
}
