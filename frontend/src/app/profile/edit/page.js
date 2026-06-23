'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AtSign } from 'lucide-react';
import api from '@/utils/api';
import { logout } from '@/utils/auth';

const BIO_MAX = 160;

export default function EditProfilePage() {
  const router = useRouter();
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // pré-remplit avec le profil courant (GET /api/auth/me)
  // NB: le modèle User n'a que username/bio/avatarUrl -> pas de "name" séparé
  useEffect(() => {
    api.get('/api/auth/me')
      .then((res) => {
        setHandle(res.data.username ?? '');
        setBio(res.data.bio ?? '');
        setAvatar(res.data.avatarUrl || null);
      })
      .catch(() => {});
  }, []);

  // initiales depuis le username (pas de name séparé dans l'app)
  const initials = handle.slice(0, 2).toUpperCase();

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      await api.patch('/users/me', { username: handle.trim(), bio });
      router.push('/profile');
    } catch (err) {
      // 409 = username déjà pris (sinon message générique)
      setError(err.response?.data?.error || 'Could not save profile');
      setSaving(false);
    }
  }

  function handleLogout() {
    logout(); // efface le cookie JWT
    // hard reload: vide le cache client (pages prefetch) et relance le middleware
    window.location.href = '/';
  }

  return (
    <main className="mx-auto min-h-screen max-w-md bg-background px-5 pb-12">
      {/* top bar */}
      <header className="flex items-center justify-between py-5">
        <Link href="/profile" className="text-sm text-muted">Cancel</Link>
        <h1 className="font-title text-lg font-bold text-ink">Edit profile</h1>
        <button
          onClick={handleSave}
          disabled={saving || !handle.trim()}
          className="rounded-full bg-brand-grad px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </header>

      {/* change picture */}
      <div className="mt-2 flex flex-col items-center">
        <div className="relative">
          {/* picture, else initials */}
          {avatar ? (
            <img src={avatar} alt={handle} className="h-20 w-20 rounded-2xl object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-grad font-title text-2xl font-bold text-white">
              {initials}
            </div>
          )}
        </div>
        {/* pas d'endpoint d'upload côté back -> bouton inactif pour l'instant */}
        <button className="mt-2 text-sm font-medium text-brand">Change photo</button>
      </div>

      {/* erreur (ex: 409 username pris) */}
      {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}

      {/* formulaire */}
      <div className="mt-6 space-y-5">
        <Field label="Username">
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-3 focus-within:border-brand">
            <AtSign size={18} className="text-faint" />
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full bg-transparent text-ink outline-none"
            />
          </div>
        </Field>

        <Field label="Bio">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={BIO_MAX}
            rows={4}
            className="w-full resize-none rounded-2xl border border-line bg-white px-4 py-3 text-ink outline-none focus:border-brand"
          />
          <p className="mt-1 text-right text-xs text-faint">{bio.length}</p>
        </Field>
      </div>

      {/* log out */}
      <button onClick={handleLogout} className="mt-8 w-full text-center text-sm font-semibold text-red-500">
        Log out
      </button>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-sm text-muted">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
