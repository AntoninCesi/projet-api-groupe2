'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Camera, AtSign } from 'lucide-react';
import { profile } from '@/data/profile';

const BIO_MAX = 160;

export default function EditProfilePage() {
  const router = useRouter();
  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle.replace(/^@/, ''));
  const [bio, setBio] = useState(profile.bio);

  // initials as pfp (ex. "Camille Roy" -> "CR")
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  function handleSave() {
    // API call to add
    router.push('/profile');
  }

  function handleLogout() {
    // waiting auth JWT
    router.push('/');
  }

  return (
    <main className="mx-auto min-h-screen max-w-md bg-background px-5 pb-12">
      {/* top bar */}
      <header className="flex items-center justify-between py-5">
        <Link href="/profile" className="text-sm text-muted">Cancel</Link>
        <h1 className="font-title text-lg font-bold text-ink">Edit profile</h1>
        <button onClick={handleSave} className="rounded-full bg-brand-grad px-5 py-2 text-sm font-semibold text-white">
          Save
        </button>
      </header>

      {/* change picture */}
      <div className="mt-2 flex flex-col items-center">
        <div className="relative">
          {/* picture, else initials */}
          {profile.avatar ? (
            <img src={profile.avatar} alt={name} className="h-20 w-20 rounded-2xl object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-grad font-title text-2xl font-bold text-white">
              {initials}
            </div>
          )}
        </div>
        {/* connect to back */}
        <button className="mt-2 text-sm font-medium text-brand">Change photo</button>
      </div>

      {/* formulaire */}
      <div className="mt-6 space-y-5">
        <Field label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-ink outline-none focus:border-brand"
          />
        </Field>

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
