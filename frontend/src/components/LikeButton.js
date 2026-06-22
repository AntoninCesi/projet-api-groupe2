'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';

// like front-only : gère son état localement
// shortcut: à brancher sur POST /posts/:id/like (service likePost côté back)
export default function LikeButton({ count, liked: initialLiked = false, size = 16 }) {
  const [liked, setLiked] = useState(initialLiked);
  const [n, setN] = useState(count);

  function toggle(e) {
    // évite la navigation quand le bouton est dans un <Link> (ex: liste de posts)
    e.preventDefault();
    e.stopPropagation();
    setLiked(!liked);
    setN(liked ? n - 1 : n + 1);
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

// 2100 -> "2.1k" (app en anglais, point décimal)
function formatCount(n) {
  if (n < 1000) return n;
  return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
}
