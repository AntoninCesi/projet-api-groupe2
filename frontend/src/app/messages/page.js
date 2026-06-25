import { MessageCircle } from 'lucide-react';

// the conversation list is rendered by messages/layout.js (left pane on desktop,
// full screen on mobile). this page is only the desktop "nothing selected" state.
export default function MessagesPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
        <MessageCircle size={28} />
      </div>
      <p className="mt-4 text-sm text-faint">Select a conversation to start chatting.</p>
    </div>
  );
}
