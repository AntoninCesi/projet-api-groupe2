import Link from 'next/link';
import { Mail } from 'lucide-react';

// "send a message" button to place on any user (post author, profile...)
export default function MessageButton({ userId, className = '' }) {
  if (!userId) return null; // no id -> nothing (e.g. mocked data without authorId)
  return (
    <Link
      href={`/messages/${userId}`}
      aria-label="Send a message"
      className={`flex items-center gap-1.5 rounded-full border border-brand px-3 py-1.5 text-sm font-medium text-brand ${className}`}
    >
      <Mail size={15} /> Message
    </Link>
  );
}
