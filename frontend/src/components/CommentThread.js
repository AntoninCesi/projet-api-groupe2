'use client';

import { useState } from 'react';
import Link from 'next/link';
import Avatar from '@/components/Avatar';
import LikeButton from '@/components/LikeButton';

const MAX_DEPTH = 4;
const COLLAPSE_OVER = 5;

// build a tree from the flat replies list using replyTo.
// if replyTo is empty or points to something we don't know, the reply goes to the top level.
function buildTree(comment) {
  const replies = comment.replies ?? [];
  const ids = new Set(replies.map((r) => String(r.id)));
  const keyOf = (r) => {
    const t = r.replyTo ? String(r.replyTo) : null;
    return t && ids.has(t) ? t : 'root';
  };
  const byParent = new Map();
  for (const r of replies) {
    const k = keyOf(r);
    if (!byParent.has(k)) byParent.set(k, []);
    byParent.get(k).push(r);
  }
  const attach = (id) => (byParent.get(String(id)) ?? []).map((r) => ({ ...r, children: attach(r.id) }));
  return (byParent.get('root') ?? []).map((r) => ({ ...r, children: attach(r.id) }));
}

function countDescendants(node) {
  return node.children.reduce((n, c) => n + 1 + countDescendants(c), 0);
}

export default function CommentThread({ comments, onReply, postId }) {
  if (!comments.length) {
    return <p className="py-10 text-center text-sm text-faint">No replies yet. Start the discussion.</p>;
  }
  return (
    <div className="divide-y divide-line/70">
      {comments.map((c) => (
        <div key={c.id} className="py-4">
          <CommentBlock comment={c} onReply={onReply} postId={postId} />
        </div>
      ))}
    </div>
  );
}

function CommentBlock({ comment, onReply, postId }) {
  const tree = buildTree(comment);
  const [replying, setReplying] = useState(false);
  // threads past the depth cap get lifted here so they restart at the left
  // instead of drifting further right. each entry is the node whose children continue.
  const [continued, setContinued] = useState([]);
  const continuedIds = new Set(continued.map((n) => n.id));

  function openContinuation(node) {
    setContinued((list) => (list.some((n) => n.id === node.id) ? list : [...list, node]));
  }

  return (
    <div>
      <Row
        node={comment}
        onReplyClick={() => setReplying((v) => !v)}
        endpoint={`/posts/${postId}/comments/${comment.id}/like`}
      />
      {replying && (
        <div className="ml-[42px] mt-2">
          <ReplyInput onSubmit={(t) => { onReply(comment.id, t, null); setReplying(false); }} />
        </div>
      )}
      {tree.length > 0 && (
        <Subtree
          nodes={tree}
          depth={1}
          commentId={comment.id}
          postId={postId}
          parentName={comment.author}
          onReply={onReply}
          onContinue={openContinuation}
          continuedIds={continuedIds}
        />
      )}

      {continued.map((node) => (
        <div key={node.id} className="mt-4 border-t border-line/60 pt-4">
          <p className="mb-2 text-xs font-semibold text-press">↳ Continuing @{node.author}</p>
          <Subtree
            nodes={node.children}
            depth={1}
            commentId={comment.id}
          postId={postId}
            parentName={node.author}
            onReply={onReply}
            onContinue={openContinuation}
            continuedIds={continuedIds}
            reset
          />
        </div>
      ))}
    </div>
  );
}

// a list of replies under one thread line, with a collapse button.
// big threads (more than COLLAPSE_OVER replies) start closed, except when reopened.
function Subtree({ nodes, depth, commentId, parentName, onReply, onContinue, continuedIds, reset, postId }) {
  const total = nodes.reduce((n, x) => n + 1 + countDescendants(x), 0);
  const [collapsed, setCollapsed] = useState(total > COLLAPSE_OVER && !reset);

  return (
    <div className="relative ml-3.5 mt-3 border-l-2 border-line pl-4 transition-colors hover:border-brand/50 lg:ml-[18px]">
      <button
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? 'Expand thread' : 'Collapse thread'}
        className="absolute -left-[10px] top-0 flex h-[19px] w-[19px] items-center justify-center rounded-full border border-line bg-surface text-[12px] font-bold leading-none text-faint transition hover:border-brand hover:text-brand"
      >
        {collapsed ? '+' : '-'}
      </button>
      {collapsed ? (
        <button onClick={() => setCollapsed(false)} className="text-xs font-semibold text-press hover:underline">
          Show {total} {total > 1 ? 'replies' : 'reply'}
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          {nodes.map((n) => (
            <ReplyNode
              key={n.id}
              node={n}
              depth={depth}
              commentId={commentId}
              targetName={reset ? parentName : null}
              onReply={onReply}
              onContinue={onContinue}
              continuedIds={continuedIds}
              postId={postId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReplyNode({ node, depth, commentId, targetName, onReply, onContinue, continuedIds, postId }) {
  const [replying, setReplying] = useState(false);
  const hasKids = node.children.length > 0;
  const atCap = depth >= MAX_DEPTH;
  const alreadyContinued = continuedIds.has(node.id);

  return (
    <div>
      <Row
        node={node}
        targetName={targetName}
        onReplyClick={() => setReplying((v) => !v)}
        endpoint={`/posts/${postId}/comments/${commentId}/replies/${node.id}/like`}
      />
      {replying && (
        <div className="ml-[42px] mt-2">
          <ReplyInput onSubmit={(t) => { onReply(commentId, t, node.id); setReplying(false); }} />
        </div>
      )}

      {hasKids && !atCap && (
        <Subtree
          nodes={node.children}
          depth={depth + 1}
          commentId={commentId}
          parentName={node.author}
          onReply={onReply}
          onContinue={onContinue}
          continuedIds={continuedIds}
          postId={postId}
        />
      )}

      {hasKids && atCap && (
        alreadyContinued ? (
          <p className="mt-2 text-xs font-medium text-faint">Continued below</p>
        ) : (
          <button
            onClick={() => onContinue(node)}
            className="mt-2 text-xs font-semibold text-press hover:underline"
          >
            ↳ Continue this thread ({countDescendants(node)} more)
          </button>
        )
      )}
    </div>
  );
}

function Row({ node, targetName, onReplyClick, endpoint = null }) {
  return (
    <div className="flex gap-2.5 rounded-xl transition hover:bg-brand/[0.03]">
      {node.authorId ? (
        <Link href={`/users/${node.authorId}`} className="shrink-0">
          <Avatar name={node.author} src={node.avatar} size={32} />
        </Link>
      ) : (
        <Avatar name={node.author} src={node.avatar} size={32} />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          {node.authorId ? (
            <Link href={`/users/${node.authorId}`} className="text-sm font-semibold text-ink hover:underline">
              {node.author}
            </Link>
          ) : (
            <span className="text-sm font-semibold text-ink">{node.author}</span>
          )}
          <span className="text-xs text-faint">· {node.time}</span>
          {targetName && (
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-press">↳ @{targetName}</span>
          )}
        </div>
        <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">{node.text}</p>
        <div className="mt-1 flex items-center gap-4 text-xs text-faint">
          <LikeButton count={node.likes} liked={node.liked} size={14} endpoint={endpoint} />
          <button onClick={onReplyClick} className="font-medium text-faint transition hover:text-press">Reply</button>
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
    <div className="flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && send()}
        placeholder="Write a reply…"
        autoFocus
        className="flex-1 rounded-full border border-line bg-transparent px-3 py-1.5 text-sm text-ink outline-none transition focus:border-brand"
      />
      <button onClick={send} className="rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-white transition hover:bg-press">
        Reply
      </button>
    </div>
  );
}
