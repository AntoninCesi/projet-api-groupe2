'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AtSign } from 'lucide-react';
import Shell from '@/components/Shell';
import api from '@/utils/api';
import { logout } from '@/utils/auth';

const BIO_MAX = 160;
const AVATAR_MAX = 256; // max side (px) after resizing

export default function EditProfilePage() {
  const router = useRouter();
  const fileRef = useRef(null);
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(null); // url or data URL
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // pre-fills with the current profile (GET /api/auth/me)
  // NB: the User model only has username/bio/avatarUrl -> no separate "name"
  useEffect(() => {
    api.get('/api/auth/me')
      .then((res) => {
        setHandle(res.data.username ?? '');
        setBio(res.data.bio ?? '');
        setAvatar(res.data.avatarUrl || null);
      })
      .catch(() => {});
  }, []);

  // initials from the username (no separate name in the app)
  const initials = handle.slice(0, 2).toUpperCase();

  // image file -> resized to a data URL (lightweight avatar, stored in avatarUrl)
  async function onPickFile(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allows re-selecting the same file
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file');
      return;
    }
    try {
      setError('');
      const dataUrl = await resizeImage(file, AVATAR_MAX);
      setAvatar(dataUrl);
    } catch {
      setError('Could not read this image');
    }
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      await api.patch('/users/me', { username: handle.trim(), bio, avatarUrl: avatar });
      router.push('/profile');
    } catch (err) {
      // 409 = username already taken (otherwise a generic message)
      setError(err.response?.data?.error || 'Could not save profile');
      setSaving(false);
    }
  }

  function handleLogout() {
    logout(); // clears the JWT cookie
    // hard reload: clears the client cache (prefetched pages) and re-runs the middleware
    window.location.href = '/';
  }

  return (
    <Shell focused>
      {/* top bar */}
      <header className="flex items-center justify-between py-5 lg:pt-0">
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
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative"
          aria-label="Change photo"
        >
          {avatar ? (
            <img src={avatar} alt={handle} className="h-20 w-20 rounded-2xl object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-grad font-title text-2xl font-bold text-white">
              {initials}
            </div>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onPickFile}
          className="hidden"
        />
        <button onClick={() => fileRef.current?.click()} className="mt-2 text-sm font-medium text-brand">
          Change photo
        </button>
      </div>

      {/* error (e.g. 409 username taken) */}
      {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}

      {/* form */}
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
    </Shell>
  );
}

// resizes an image (max `max`px square) and returns a compact JPEG data URL
function resizeImage(file, max) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-sm text-muted">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
