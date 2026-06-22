// Adaptateurs API (back) -> forme utilisée par le front.
// Tout le renommage / la mise en forme vit ici = point de couture de l'intégration.
// shortcut: à brancher quand axios sera là -> mapPost(res.data), etc. (back en parallèle)

import { formatCount, timeAgo } from '@/utils/format';

// post API -> post front
export function mapPost(p, userId) {
  return {
    id: p._id,
    text: p.content,
    author: p.authorId?.username ?? 'unknown', // authorId populate
    topic: p.topicId?.title ?? p.topicId, // topicId populate (sinon id brut)
    verified: p.authorId?.verified ?? false,
    time: timeAgo(p.createdAt),
    likes: p.likes?.length ?? 0,
    liked: hasLiked(p.likes, userId),
    comments: p.comments?.length ?? 0,
    reposts: p.reposts ?? 0, // pas de compteur direct côté back -> 0
    pinned: p.pinned ?? false, // absent du modèle -> false
    tab: p.official ? 'official' : 'community', // shortcut: champ à confirmer avec le back
    avatar: p.authorId?.avatar ?? null, // null -> avatar à initiales côté front
  };
}

// comment API -> comment front
export function mapComment(c, userId) {
  return {
    ...mapReply(c, userId),
    replies: (c.replies ?? []).map((r) => mapReply(r, userId)),
  };
}

// commentaire ou réponse (même forme, sans le tableau replies)
export function mapReply(r, userId) {
  return {
    id: r._id,
    author: r.authorId?.username ?? 'unknown',
    time: timeAgo(r.createdAt),
    text: r.content,
    likes: r.likes?.length ?? 0,
    liked: hasLiked(r.likes, userId),
  };
}

// user API -> profile front
export function mapProfile(u) {
  return {
    name: u.name ?? u.username, // pas de name séparé -> username
    handle: '@' + u.username,
    bio: u.bio ?? '',
    avatar: u.avatar ?? null,
  };
}

// topic API -> topic front
export function mapTopic(t) {
  return {
    id: t._id,
    title: t.title,
    degree: t.degree,
    participants: formatCount(t.participantsCount ?? 0) + ' participants',
    avatar: t.avatar ?? null, // absent du modèle -> avatar à initiales
    following: t.following ?? false,
  };
}

// likes est un tableau d'ObjectId côté back -> bool "j'ai liké"
function hasLiked(likes, userId) {
  if (!userId || !Array.isArray(likes)) return false;
  return likes.some((id) => String(id) === String(userId));
}
