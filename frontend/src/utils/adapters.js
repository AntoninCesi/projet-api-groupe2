// API adapters (back) -> shape used by the front.
// All renaming / formatting lives here = the integration seam.
// used after api.js calls (fetch) -> mapPost(res.data), etc.

import { formatCount, timeAgo } from '@/utils/format';

// API post -> front post
// assumes authorId / topicId are populated on the back (cf. request to the back team)
export function mapPost(p, userId) {
  return {
    id: p._id,
    text: p.content,
    author: p.authorId?.username ?? 'unknown',
    authorId: p.authorId?._id ?? null, // for the Message button (DM the author)
    topic: p.topicId?.title ?? null,
    verified: p.authorId?.isVerified ?? false,
    time: timeAgo(p.createdAt),
    likes: p.likes?.length ?? 0,
    liked: hasLiked(p.likes, userId),
    comments: p.comments?.length ?? 0,
    reposts: p.shareCount ?? 0,
    pinned: false, // not in the Post model -> false
    // post from an official source -> Official tab, otherwise Community
    tab: p.authorId?.isOfficialSource ? 'official' : 'community',
    avatar: p.authorId?.avatarUrl || null, // empty/absent -> initials avatar
  };
}

// API comment -> front comment
export function mapComment(c, userId) {
  return {
    ...mapReply(c, userId),
    replies: (c.replies ?? []).map((r) => mapReply(r, userId)),
  };
}

// comment or reply (same shape, without the replies array)
export function mapReply(r, userId) {
  return {
    id: r._id,
    author: r.authorId?.username ?? 'unknown',
    avatar: r.authorId?.avatarUrl || null,
    time: timeAgo(r.createdAt),
    text: r.content,
    likes: r.likes?.length ?? 0,
    liked: hasLiked(r.likes, userId),
    // id of the reply this one replies to (null = replies to the comment).
    // backward-compatible: null until the back adds the replyTo field.
    replyTo: r.replyTo ?? null,
  };
}

// API user -> front profile (back User only has username, no separate name)
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
      followers: u.followersCount ?? 0, // added by GET /users/:id
      karma: formatCount(u.karma ?? 0),
    },
  };
}

// API notification -> front activity item
// the back populates `actorId` (username/avatarUrl/isVerified) -> we display the real actor.
// generic actor fallback if actorId is absent (old notifs / TOPIC_ON_FIRE).
const NOTIF_META = {
  LIKE:          { type: 'like',    fallback: 'Someone', text: 'liked your post' },
  FOLLOW:        { type: 'follow',  fallback: 'Someone', text: 'started following you' },
  MENTION:       { type: 'mention', fallback: 'Someone', text: 'mentioned you' },
  REPOST:        { type: 'repost',  fallback: 'Someone', text: 'reposted your post' },
  NEW_POST:      { type: 'post',    fallback: 'Someone', text: 'published a new post' },
  TOPIC_ON_FIRE: { type: 'fire',    fallback: 'A topic', text: 'is on fire right now' },
  // labels ready if the back adds these types (otherwise comments/replies arrive as MENTION)
  COMMENT:       { type: 'reply',   fallback: 'Someone', text: 'commented on your post' },
  REPLY:         { type: 'reply',   fallback: 'Someone', text: 'replied to you' },
};

export function mapNotification(n) {
  const meta = NOTIF_META[n.type] ?? { type: 'like', fallback: 'Someone', text: 'sent you a notification' };
  const actorName = n.actorId?.username;
  return {
    id: n._id,
    type: meta.type,
    actor: actorName ? '@' + actorName : meta.fallback,
    avatar: n.actorId?.avatarUrl || null,
    verified: n.actorId?.isVerified ?? false,
    text: meta.text,
    time: timeAgo(n.createdAt),
    read: n.isRead ?? false,
    link: notifLink(n.sourceType, n.sourceId),
  };
}

// best-effort link based on sourceType (free string on the back, sourceId not populated)
function notifLink(sourceType, sourceId) {
  if (!sourceId) return '#';
  const t = String(sourceType || '').toLowerCase();
  if (t.includes('post')) return `/post/${sourceId}`;
  if (t.includes('topic')) return `/topic/${sourceId}`;
  return '#';
}

// API topic -> front topic
export function mapTopic(t, userId, myFollowedTopics) {
  return {
    id: t._id,
    title: t.title,
    degree: t.degree,
    onFire: t.isOnFire ?? false,
    official: t.isOfficial ?? false,
    variation: t.variationPct ?? 0,
    participants: formatCount(t.participantsCount ?? 0) + ' participants',
    avatar: null, // not in the Topic model -> initials avatar
    // heat snapshots for the sparkline: [{ t, p }] (empty until the job has run)
    spark: Array.isArray(t.history) ? t.history : [],
    // following = topicId in the current user's followedTopics (otherwise false)
    following: Array.isArray(myFollowedTopics)
      ? myFollowedTopics.some((id) => String(id) === String(t._id))
      : false,
  };
}

// derives an icon (shared key ThemeCard / explore) from the category name
export function themeIcon(name = '') {
  const n = name.toLowerCase();
  if (/polit|election|govern|war|geopolit/.test(n)) return 'politics';
  if (/sport|football|soccer|nba|nfl|tennis|cricket|game/.test(n)) return 'sport';
  if (/tech|\bai\b|crypto|software/.test(n)) return 'tech';
  if (/econ|market|finance|\bfed\b|inflation|business/.test(n)) return 'economy';
  if (/cultur|music|movie|film|celebrit|\bart\b/.test(n)) return 'culture';
  if (/scien|space|climate|health|covid/.test(n)) return 'science';
  return 'politics';
}

// API theme (aggregated category) -> front theme (ThemeCard + /theme page)
export function mapTheme(t, myFollowedThemes) {
  return {
    id: t.name,
    name: t.name,
    degree: t.degree ?? 0,
    topicsCount: t.topicsCount ?? 0,
    actives: formatCount(t.participantsCount ?? 0) + ' active',
    topic: t.topTopic ?? '', // hottest topic of the theme (ThemeCard subtitle)
    icon: themeIcon(t.name),
    following: Array.isArray(myFollowedThemes)
      ? myFollowedThemes.includes(t.name)
      : false,
  };
}

// likes is an array of ObjectId on the back -> bool "I liked it"
function hasLiked(likes, userId) {
  if (!userId || !Array.isArray(likes)) return false;
  return likes.some((id) => String(id) === String(userId));
}
