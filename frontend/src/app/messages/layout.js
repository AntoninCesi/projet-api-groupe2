'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ConversationList from '@/components/ConversationList';

// messages shell:
//  - mobile keeps the original single-screen flow (list on /messages, thread on /messages/[id])
//  - from lg a three pane desktop layout: nav sidebar · conversation list · open thread
export default function MessagesLayout({ children }) {
  const path = usePathname();
  const onList = path === '/messages';

  return (
    <div className="lg:mx-auto lg:grid lg:min-h-screen lg:max-w-[1500px] lg:grid-cols-[266px_360px_minmax(0,1fr)]">
      <Sidebar />

      {/* conversation list: full screen on mobile /messages, left pane on desktop */}
      <div className={`${onList ? 'block' : 'hidden'} lg:block lg:border-l lg:border-white/60`}>
        <ConversationList />
      </div>

      {/* open thread (mobile + desktop) or desktop empty state */}
      <div className={onList ? 'hidden lg:block' : 'block'}>{children}</div>
    </div>
  );
}
