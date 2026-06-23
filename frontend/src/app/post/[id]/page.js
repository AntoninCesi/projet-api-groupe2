'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Repeat2, BadgeCheck, ChevronDown, Pin } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import LikeButton from '@/components/LikeButton';
import Avatar from '@/components/Avatar';
import MessageButton from '@/components/MessageButton';
import { post, comments as initialComments } from '@/data/post';

export default function PostPage() {
  const [comments, setComments] = useState(initialComments);

  function addComment(text) {
    const newComment = { id: nextId(comments), author: 'camille', time: 'now', text, likes: 0, replies: [] };
    setComments([newComment, ...comments]);
  }

  function addReply(commentId, text) {
    setComments(
      comments.map((c) =>
        c.id === commentId
          ? { ...c, replies: [...c.replies, { id: nextId(c.replies), author: 'camille', time: 'now', text, likes: 0 }] }
          : c
      )
    );
  }

  const total = comments.reduce((n, c) => n + 1 + c.replies.length, 0);

  return (
    <main className="mx-auto min-h-screen max-w-md bg-background px-5 pb-28">
      {/* header */}
      <div className="flex items-center gap-3 pt-4">
        <Link href="/topic/1" aria-label="Back" className="text-ink">
          <ArrowLeft size={22} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-title text-base font-bold leading-tight text-ink">Post</h1>
          <p className="truncate text-xs text-faint">{post.topic}</p>
        </div>
      </div>

      <PostCard post={post} />

      {/* replies list header */}
      <div className="mt-5 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">— {total} replies</h2>
        {/* shortcut: sorting not wired up */}
        <button className="flex items-center gap-1 text-xs font-medium text-faint">
          Top <ChevronDown size={14} />
        </button>
      </div>

      <div className="mt-3 space-y-4">
        {comments.map((c) => (
          <CommentItem key={c.id} comment={c} onReply={addReply} />
        ))}
      </div>

      <Composer onSubmit={addComment} />

      <BottomNav />
    </main>
  );
}

// original post: no card, sits on the app background + separator line
function PostCard({ post }) {
  return (
    <article className="mt-4 border-b border-line pb-5">
      {post.pinned && (
        <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand">
          <Pin size={13} /> {post.official ? 'Official' : 'Community'} · Pinned
        </p>
      )}

      <div className="flex items-center gap-2">
        <Avatar name={post.author} size={40} />
        <div className="flex flex-1 items-center gap-1">
          <span className="font-title text-lg font-semibold text-ink">{post.author}</span>
          {post.verified && <BadgeCheck size={16} className="text-brand" />}
        </div>
        <MessageButton userId={post.authorId} />
      </div>
      <p className="mt-1 text-xs text-faint">{post.time} ago</p>

      <p className="mt-3 whitespace-pre-wrap break-words text-[17px] leading-relaxed text-ink">{post.text}</p>

      {/* actions: like is clickable, rest stays gray (// shortcut: not wired up) */}
      <div className="mt-4 flex items-center gap-6 text-faint">
        <LikeButton count={post.likes} liked={post.liked} size={18} />
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
  // openId = id of the row whose reply input is open (comment or reply)
  const [openId, setOpenId] = useState(null);

  function toggle(id) {
    setOpenId(openId === id ? null : id);
  }

  // a reply always goes on the parent comment (single level only, see CLAUDE.md)
  function submit(text) {
    onReply(comment.id, text);
    setOpenId(null);
  }

  return (
    <div>
      <CommentRow comment={comment} onReplyClick={() => toggle(comment.id)} />
      {openId === comment.id && <ReplyInput onSubmit={submit} />}

      {/* indented replies (1 level) */}
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

// row for a comment or a reply (same rendering, onReplyClick optional)
function CommentRow({ comment, onReplyClick }) {
  return (
    <div className="flex gap-2">
      <Avatar name={comment.author} size={32} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-ink">{comment.author}</span>
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

// unique local id: max of existing ids + 1
function nextId(list) {
  return list.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}
