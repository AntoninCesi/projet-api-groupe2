'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Avatar from '@/components/Avatar';
import BottomNav from '@/components/BottomNav';
import api from '@/utils/api';
import { getUserId } from '@/utils/auth';
import { timeAgo } from '@/utils/format';

export default function MessagesPage() {
  const [convs, setConvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const myId = getUserId();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get('/messages'); // last message per contact
        // sender/receiver not populated on the back -> resolve the contact via /users/:id
        const items = await Promise.all(
          data.map(async (m) => {
            const contactId = String(m.senderId) === String(myId) ? m.receiverId : m.senderId;
            let name = 'user';
            try {
              const u = await api.get(`/users/${contactId}`);
              name = u.data.username ?? 'user';
            } catch { /* contact not found -> "user" */ }
            return {
              contactId,
              name,
              last: m.content,
              time: timeAgo(m.createdAt),
              unread: String(m.receiverId) === String(myId) && !m.isRead,
            };
          })
        );
        if (alive) setConvs(items);
      } catch {
        if (alive) setConvs([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [myId]);

  return (
    <main className="mx-auto min-h-screen max-w-md bg-background px-5 pb-28">
      <div className="flex items-center gap-3 py-5">
        <Link href="/profile" aria-label="Back" className="text-ink"><ArrowLeft size={22} /></Link>
        <h1 className="font-title text-2xl font-bold text-ink">Messages</h1>
      </div>

      {loading ? (
        <p className="mt-8 text-center text-sm text-faint">Loading…</p>
      ) : convs.length === 0 ? (
        <p className="mt-8 text-center text-sm text-faint">No messages yet.</p>
      ) : (
        <div className="divide-y divide-line">
          {convs.map((c) => (
            <Link key={c.contactId} href={`/messages/${c.contactId}`} className="flex items-center gap-3 py-3">
              <Avatar name={c.name} size={44} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{c.name}</p>
                <p className="truncate text-sm text-muted">{c.last}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-faint">{c.time}</span>
                {c.unread && <span className="h-2 w-2 rounded-full bg-brand" />}
              </div>
            </Link>
          ))}
        </div>
      )}

      <BottomNav />
    </main>
  );
}
