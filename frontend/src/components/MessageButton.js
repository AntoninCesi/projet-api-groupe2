import Link from 'next/link';
import { Mail } from 'lucide-react';

// bouton "envoyer un message" à poser sur n'importe quel user (auteur de post, profil…)
export default function MessageButton({ userId, className = '' }) {
  if (!userId) return null; // pas d'id -> rien (ex. data mockée sans authorId)
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
