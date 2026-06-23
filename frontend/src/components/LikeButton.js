'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { formatCount } from '@/utils/format';
import api from '@/utils/api';

// like (toggle, the API returns {liked, likesCount}) :
//  - endpoint provided -> POST to that endpoint (comment / reply)
//  - otherwise postId -> POST /posts/:id/like
//  - otherwise -> local state only
export default function LikeButton({ count, liked: initialLiked = false, size = 16, postId = null, endpoint = null }) {
  const [liked, setLiked] = useState(initialLiked);
  const [n, setN] = useState(count);

  const url = endpoint || (postId ? `/posts/${postId}/like` : null);

  async function toggle(e) {
    // avoids navigation when the button is inside a <Link> (post list)
    e.preventDefault();
    e.stopPropagation();

    // optimistic
    const prevLiked = liked;
    const prevN = n;
    setLiked(!liked);
    setN(liked ? n - 1 : n + 1);

    if (!url) return; // no endpoint -> local only
    try {
      const res = await api.post(url);
      setLiked(res.data.liked);
      setN(res.data.likesCount);
    } catch {
      setLiked(prevLiked); // rollback if the API fails (e.g. not logged in)
      setN(prevN);
    }
  }

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 ${liked ? 'text-brand' : 'text-faint'}`}
      style={{ fontSize: size < 16 ? 12 : 14 }}
      aria-pressed={liked}
    >
      <Heart size={size} fill={liked ? 'currentColor' : 'none'} /> {formatCount(n)}
    </button>
  );
}
