'use client';

import { useEffect, useState } from 'react';
import ActivityItem from '@/components/ActivityItem';
import BottomNav from '@/components/BottomNav';
import api from '@/utils/api';
import { mapNotification } from '@/utils/adapters';

// group notifications by period based on createdAt (back sorted recent -> old)
function groupByPeriod(list) {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const buckets = { Today: [], 'This week': [], Earlier: [] };
  for (const n of list) {
    const age = now - new Date(n.createdAt).getTime();
    const label = age < day ? 'Today' : age < 7 * day ? 'This week' : 'Earlier';
    buckets[label].push(mapNotification(n));
  }
  return Object.entries(buckets)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

export default function ActivityPage() {
  const [groups, setGroups] = useState(null); // null = loading

  useEffect(() => {
    api.get('/notifications')
      .then((res) => setGroups(groupByPeriod(res.data ?? [])))
      .catch(() => setGroups([]));
  }, []);

  async function markAllRead() {
    try {
      await api.patch('/notifications/read');
      setGroups((g) =>
        g?.map((grp) => ({ ...grp, items: grp.items.map((i) => ({ ...i, read: true })) }))
      );
    } catch {
      /* silent: don't break the display if mark-read fails */
    }
  }

  const hasItems = groups && groups.length > 0;

  return (
    <main className="mx-auto min-h-screen max-w-md bg-background px-5 pb-28">
      {/* header */}
      <div className="flex items-end justify-between pt-8">
        <div>
          <h1 className="font-title text-3xl font-bold text-ink">Notifications</h1>
          <p className="mt-1 text-faint">What's moving around you.</p>
        </div>
        {hasItems && (
          <button onClick={markAllRead} className="shrink-0 pb-1 text-sm font-medium text-brand">
            Mark all read
          </button>
        )}
      </div>

      {/* empty / loading states */}
      {groups === null && <p className="mt-8 text-sm text-faint">Loading…</p>}
      {groups && groups.length === 0 && (
        <p className="mt-8 text-sm text-faint">No notifications yet.</p>
      )}

      {/* chronological feed grouped by period */}
      {groups?.map((group) => (
        <section key={group.label} className="mt-7">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-brand">— {group.label}</h2>
          <div className="mt-1 divide-y divide-line">
            {group.items.map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}

      <BottomNav active="activity" />
    </main>
  );
}
