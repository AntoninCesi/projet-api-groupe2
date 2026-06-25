'use client';

import { ShieldOff } from 'lucide-react';
import { getToken, logout } from '@/utils/auth';

export default function SuspendedPage() {
    let status = 'suspended';
    try {
        const token = getToken();
        if (token) status = JSON.parse(atob(token.split('.')[1])).status ?? 'suspended';
    } catch {}

    function handleLogout() {
        logout();
        window.location.href = '/login';
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
            <ShieldOff size={48} className="text-faint" />
            <h1 className="font-title text-2xl font-bold text-ink">
                {status === 'banned' ? 'Account banned' : 'Account suspended'}
            </h1>
            <p className="max-w-xs text-sm text-muted">
                {status === 'banned'
                    ? 'Your account has been permanently banned. Contact support if you think this is a mistake.'
                    : 'Your account has been temporarily suspended. Please check back later.'}
            </p>
            <button onClick={handleLogout} className="rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white">
                Log out
            </button>
        </main>
    );
}