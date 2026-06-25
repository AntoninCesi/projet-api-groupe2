'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, Repeat2, BadgeCheck, Check } from 'lucide-react';
import ThemeCard from '@/components/ThemeCard';
import LikeButton from '@/components/LikeButton';
import MessageButton from '@/components/MessageButton';
import Shell from '@/components/Shell';
import Avatar from '@/components/Avatar';
import api from '@/utils/api';
import { mapProfile, mapTheme, mapPost } from '@/utils/adapters';
import { getUserId } from '@/utils/auth';

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const myId = getUserId();

  const [profile, setProfile] = useState(null);
  const [verified, setVerified] = useState(false);
  const [themes, setThemes] = useState([]);
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // c'est moi -> on bascule sur le profil éditable
  useEffect(() => {
    if (myId && String(myId) === String(id)) router.replace('/profile');
  }, [id, myId, router]);

  useEffect(() => {
    let alive = true;
    api.get(`/users/${id}`)
      .then(async (res) => {
        if (!alive) return;
        const u = res.data;
        setProfile(mapProfile(u));
        setVerified(u.isVerified ?? false);

        // thèmes suivis -> stats via /themes
        const followed = u.followedThemes ?? [];
        if (followed.length > 0) {
          try {
            const all = await api.get('/themes');
            if (alive) setThemes(all.data.filter((t) => followed.includes(t.name)).map((t) => mapTheme(t)));
          } catch { /* /themes indispo */ }
        }
      })
      .catch(() => { if (alive) setNotFound(true); });

    // posts de l'utilisateur, plus récents d'abord
    api.get('/posts', { params: { authorId: id } })
      .then((r) => { if (alive) setPosts(r.data.map((p) => mapPost(p, myId))); })
      .catch(() => {});

    // est-ce que je le suis déjà ?
    api.get('/api/auth/me')
      .then((me) => { if (alive) setFollowing((me.data.following ?? []).some((f) => String(f) === String(id))); })
      .catch(() => {});

    return () => { alive = false; };
  }, [id, myId]);

  async function toggleFollow() {
    const prev = following;
    setFollowing(!prev); // optimiste
    try {
      const { data } = await api.post(`/users/${id}/follow`);
      setFollowing(data.following);
    } catch {
      setFollowing(prev); // échec (ex. non connecté) -> rollback
    }
  }

  if (notFound) {
    return (
      <Shell>
        <div className="flex items-center gap-3 py-4 lg:pt-0">
          <button onClick={() => router.back()} aria-label="Back" className="text-ink"><ArrowLeft size={22} /></button>
          <h1 className="font-title text-xl font-bold text-ink">Profile</h1>
        </div>
        <p className="mt-16 text-center text-sm text-faint">This user doesn’t exist.</p>
      </Shell>
    );
  }

  const name = profile?.name ?? '…';
  const handle = profile?.handle ?? '';
  const avatar = profile?.avatar ?? null;
  const bio = profile?.bio ?? '';
  const stats = profile?.stats ?? { topics: 0, following: 0, followers: 0, karma: 0 };

  return (
    <Shell>
      {/* mobile: back bar + centered identity */}
      <div className="lg:hidden">
        <div className="flex items-center gap-3 py-4">
          <button onClick={() => router.back()} aria-label="Back" className="text-ink"><ArrowLeft size={22} /></button>
          <h1 className="truncate font-title text-lg font-bold text-ink">{name}</h1>
        </div>

        <div className="flex flex-col items-center text-center">
          <Avatar name={name} src={avatar} size={96} />
          <div className="mt-3 flex items-center gap-1">
            <h2 className="font-title text-2xl font-bold text-ink">{name}</h2>
            {verified && <BadgeCheck size={18} className="text-brand" />}
          </div>
          <p className="text-faint">{handle}</p>
          {bio && <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">{bio}</p>}

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={toggleFollow}
              className={`flex items-center justify-center gap-1.5 rounded-full px-6 py-2 text-sm font-semibold ${
                following ? 'border border-brand text-brand' : 'bg-brand text-white'
              }`}
            >
              {following ? <>Following <Check size={16} /></> : 'Follow'}
            </button>
            <MessageButton userId={id} />
          </div>
        </div>
      </div>

      {/* desktop: back link + profile header row */}
      <div className="hidden lg:block">
        <button
          onClick={() => router.back()}
          className="mb-5 flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-ink"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <div className="flex items-start gap-6">
          <Avatar name={name} src={avatar} size={96} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="font-title text-3xl font-bold text-ink">{name}</h1>
              {verified && <BadgeCheck size={20} className="text-brand" />}
            </div>
            <p className="text-faint">{handle}</p>
            {bio && <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{bio}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={toggleFollow}
              className={`flex items-center justify-center gap-1.5 rounded-full px-6 py-2 text-sm font-semibold transition ${
                following ? 'border border-brand text-brand hover:bg-brand/5' : 'bg-brand text-white hover:bg-press'
              }`}
            >
              {following ? <>Following <Check size={16} /></> : 'Follow'}
            </button>
            <MessageButton userId={id} />
          </div>
        </div>
      </div>

      {/* stats */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat value={stats.topics} label="Topics" />
        <Stat value={stats.followers} label="Followers" />
        <Stat value={stats.karma} label="Karma" />
      </div>

      {/* followed themes */}
      {themes.length > 0 && (
        <>
          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">Themes</h2>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {themes.map((t) => (
              <ThemeCard key={t.id} theme={t} />
            ))}
          </div>
        </>
      )}

      {/* posts */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">Posts</h2>
      </div>
      {posts.length === 0 ? (
        <p className="mt-4 text-sm text-faint">No posts yet.</p>
      ) : (
        <div className="mt-2 divide-y divide-line">
          {posts.map((p) => (
            <PostItem key={p.id} post={p} />
          ))}
        </div>
      )}
    </Shell>
  );
}

function PostItem({ post }) {
  return (
    <Link href={`/post/${post.id}`} className="block py-4">
      {post.topic && <p className="mb-1 text-xs font-medium text-brand">{post.topic}</p>}
      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">{post.text}</p>
      <div className="mt-2 flex items-center gap-6 text-faint">
        <span className="text-xs text-faint">{post.time} ago</span>
        <LikeButton count={post.likes} liked={post.liked} size={15} postId={post.id} />
        <span className="flex items-center gap-1.5 text-sm">
          <MessageCircle size={15} /> {post.comments}
        </span>
        <span className="flex items-center gap-1.5 text-sm">
          <Repeat2 size={15} /> {post.reposts}
        </span>
      </div>
    </Link>
  );
}

function Stat({ value, label }) {
  return (
    <div className="rounded-2xl border border-line bg-white py-4 text-center">
      <p className="font-title text-xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-faint">{label}</p>
    </div>
  );
}
