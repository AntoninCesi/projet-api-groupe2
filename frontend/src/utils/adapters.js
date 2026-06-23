// Adaptateurs API (back) -> forme utilisée par le front.
// Tout le renommage / la mise en forme vit ici = point de couture de l'intégration.
// utilisé après les appels api.js (fetch) -> mapPost(res.data), etc.

import { formatCount, timeAgo } from '@/utils/format';

// post API -> post front
// suppose authorId / topicId populate côté back (cf. demande à l'équipe back)
export function mapPost(p, userId) {
  return {
    id: p._id,
    text: p.content,
    author: p.authorId?.username ?? 'unknown',
    topic: p.topicId?.title ?? null,
    verified: p.authorId?.isVerified ?? false,
    time: timeAgo(p.createdAt),
    likes: p.likes?.length ?? 0,
    liked: hasLiked(p.likes, userId),
    comments: p.comments?.length ?? 0,
    reposts: p.shareCount ?? 0,
    pinned: false, // pas dans le modèle Post -> false
    // post d'une source officielle -> onglet Official, sinon Community
    tab: p.authorId?.isOfficialSource ? 'official' : 'community',
    avatar: p.authorId?.avatarUrl || null, // vide/absent -> avatar à initiales
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
    avatar: r.authorId?.avatarUrl || null,
    time: timeAgo(r.createdAt),
    text: r.content,
    likes: r.likes?.length ?? 0,
    liked: hasLiked(r.likes, userId),
  };
}

// user API -> profile front (User back n'a que username, pas de name séparé)
export function mapProfile(u) {
  return {
    name: u.username,
    handle: '@' + u.username,
    bio: u.bio ?? '',
    avatar: u.avatarUrl || null,
    verified: u.isVerified ?? false,
    stats: {
      topics: u.followedTopics?.length ?? 0,
      following: u.following?.length ?? 0,
      followers: u.followersCount ?? 0, // ajouté par GET /users/:id
      karma: formatCount(u.karma ?? 0),
    },
  };
}

// notification API -> activity item front
// NB: le back ne populate PAS sourceId -> pas de pseudo/texte réel.
// On dérive un libellé à partir du `type` (acteur générique).
const NOTIF_META = {
  LIKE:          { type: 'like',    actor: 'Someone', text: 'liked your post' },
  FOLLOW:        { type: 'follow',  actor: 'Someone', text: 'started following you' },
  MENTION:       { type: 'mention', actor: 'Someone', text: 'mentioned you' },
  REPOST:        { type: 'repost',  actor: 'Someone', text: 'reposted your post' },
  NEW_POST:      { type: 'post',    actor: 'Someone', text: 'published a new post' },
  TOPIC_ON_FIRE: { type: 'fire',    actor: 'A topic', text: 'is on fire right now' },
};

export function mapNotification(n) {
  const meta = NOTIF_META[n.type] ?? { type: 'like', actor: 'Someone', text: 'sent you a notification' };
  return {
    id: n._id,
    type: meta.type,
    actor: meta.actor,
    text: meta.text,
    time: timeAgo(n.createdAt),
    read: n.isRead ?? false,
    link: notifLink(n.sourceType, n.sourceId),
  };
}

// lien best-effort selon le sourceType (string libre côté back, sourceId non populé)
function notifLink(sourceType, sourceId) {
  if (!sourceId) return '#';
  const t = String(sourceType || '').toLowerCase();
  if (t.includes('post')) return `/post/${sourceId}`;
  if (t.includes('topic')) return `/topic/${sourceId}`;
  return '#';
}

// topic API -> topic front
export function mapTopic(t, userId, myFollowedTopics) {
  return {
    id: t._id,
    title: t.title,
    degree: t.degree,
    onFire: t.isOnFire ?? false,
    official: t.isOfficial ?? false,
    variation: t.variationPct ?? 0,
    participants: formatCount(t.participantsCount ?? 0) + ' participants',
    avatar: null, // pas dans le modèle Topic -> avatar à initiales
    // suivi = topicId dans les followedTopics du user courant (sinon false)
    following: Array.isArray(myFollowedTopics)
      ? myFollowedTopics.some((id) => String(id) === String(t._id))
      : false,
  };
}

// likes est un tableau d'ObjectId côté back -> bool "j'ai liké"
function hasLiked(likes, userId) {
  if (!userId || !Array.isArray(likes)) return false;
  return likes.some((id) => String(id) === String(userId));
}
