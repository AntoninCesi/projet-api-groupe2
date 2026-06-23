'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import Avatar from '@/components/Avatar';
import api from '@/utils/api';
import { getUserId } from '@/utils/auth';

export default function ThreadPage() {
  const { userId } = useParams();
  const myId = getUserId();
  const [messages, setMessages] = useState([]);
  const [contact, setContact] = useState('user');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const endRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [conv, user] = await Promise.all([
          api.get(`/messages/${userId}`),          // chronological messages (reads -> marked read on the back)
          api.get(`/users/${userId}`).catch(() => null),
        ]);
        if (!alive) return;
        setMessages(conv.data);
        if (user) setContact(user.data.username ?? 'user');
      } catch {
        if (alive) setMessages([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [userId]);

  // scroll to bottom on each new message
  useEffect(() => { endRef.current?.scrollIntoView(); }, [messages]);

  async function send() {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const { data } = await api.post('/messages', { receiverId: userId, content });
      setMessages((m) => [...m, data]);
      setText('');
    } catch { /* failure -> keep the entered text */ }
    finally { setSending(false); }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
      {/* contact header */}
      <header className="flex items-center gap-3 border-b border-line bg-white px-5 py-3">
        <Link href="/messages" aria-label="Back" className="text-ink"><ArrowLeft size={22} /></Link>
        <Avatar name={contact} size={36} />
        <p className="font-semibold text-ink">{contact}</p>
      </header>

      {/* message thread */}
      <div className="flex-1 space-y-2 overflow-y-auto px-5 py-4">
        {loading ? (
          <p className="text-center text-sm text-faint">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-faint">No messages yet. Say hi 👋</p>
        ) : (
          messages.map((m) => {
            const mine = String(m.senderId) === String(myId);
            return (
              <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <p className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${mine ? 'bg-brand text-white' : 'border border-line bg-white text-ink'}`}>
                  {m.content}
                </p>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* composer */}
      <div className="flex items-center gap-2 border-t border-line bg-white px-4 py-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Write a message…"
          maxLength={1000}
          className="flex-1 rounded-full border border-line bg-background px-4 py-2 text-sm text-ink outline-none focus:border-brand"
        />
        <button
          onClick={send}
          disabled={!text.trim() || sending}
          aria-label="Send"
          className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${text.trim() && !sending ? 'bg-brand' : 'bg-brand/40'}`}
        >
          <Send size={18} />
        </button>
      </div>
    </main>
  );
}
