import Link from 'next/link';
import { Lock } from 'lucide-react';

export default function RestrictedPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center bg-background px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
        <Lock size={28} />
      </div>
      <h1 className="mt-4 font-title text-2xl font-bold text-ink">Members only</h1>
      <p className="mt-2 text-sm text-muted">
        This area is for signed-in users. Log in or create an account to keep going.
      </p>
      <Link href="/login" className="mt-6 w-full rounded-2xl bg-brand-grad py-3.5 font-semibold text-white">
        Log in / Sign up
      </Link>
      <Link href="/" className="mt-3 text-sm font-medium text-brand">Back to home</Link>
    </main>
  );
}
