'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { formatCount } from '@/utils/format';
import api from '@/utils/api';

// like : si postId fourni -> POST /posts/:id/like (toggle, renvoie {liked, likesCount})
// sinon (commentaires, pas d'endpoint back) -> état local seulement
export default function LikeButton({ count, liked: initialLiked = false, size = 16, postId = null }) {
  const [liked, setLiked] = useState(initialLiked);
  const [n, setN] = useState(count);

  async function toggle(e) {
    // évite la navigation quand le bouton est dans un <Link> (liste de posts)
    e.preventDefault();
    e.stopPropagation();

    // optimiste
    const prevLiked = liked;
    const prevN = n;
    setLiked(!liked);
    setN(liked ? n - 1 : n + 1);

    if (!postId) return; // commentaire -> local seulement
    try {
      const res = await api.post(`/posts/${postId}/like`);
      setLiked(res.data.liked);
      setN(res.data.likesCount);
    } catch {
      setLiked(prevLiked); // rollback si l'API échoue (ex: non connecté)
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
