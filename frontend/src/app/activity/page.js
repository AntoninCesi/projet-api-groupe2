import ActivityItem from '@/components/ActivityItem';
import Shell from '@/components/Shell';
import { activity } from '@/data/activity';

export default function ActivityPage() {
  return (
    <Shell>
      {/* header */}
      <div className="pt-8 lg:pt-0">
        <h1 className="font-title text-3xl font-bold text-ink">Notifications</h1>
        <p className="mt-1 text-faint">What's moving around you.</p>
      </div>

      {/* fil chronologique groupé par période */}
      {activity.map((group) => (
        <section key={group.label} className="mt-7">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-brand">— {group.label}</h2>
          <div className="mt-1 divide-y divide-line">
            {group.items.map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}

    </Shell>
  );
}