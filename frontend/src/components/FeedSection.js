'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Avatar from '@/components/Avatar';
import LikeButton from '@/components/LikeButton';
import api from '@/utils/api';
import { mapPost } from '@/utils/adapters';
import { getUserId } from '@/utils/auth';

export default function FeedSection() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;
    api.get('/posts/feed', { params: { limit: 10 } })
      .then((res) => setPosts(res.data.map((p) => mapPost(p, userId))))
      .catch(() => {});
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-brand">Following</h2>
      <div className="mt-2 divide-y divide-line">
        {posts.map((p) => (
          <div key={p.id} className="py-3">
            <div className="flex items-center gap-2">
              {p.avatar ? (
                <img src={p.avatar} alt={p.author} className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <Avatar name={p.author} size={32} />
              )}
              <span className="font-semibold text-ink">{p.author}</span>
              <span className="text-xs text-faint">{p.time}</span>
            </div>
            <Link href={`/post/${p.id}`}>
              <p className="mt-2 text-sm text-ink">{p.text}</p>
            </Link>
            <div className="mt-2 flex items-center gap-4">
              <LikeButton postId={p.id} initialLiked={p.liked} initialCount={p.likes} />
              <Link href={`/post/${p.id}`} className="text-xs text-faint">{p.comments} comments</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
