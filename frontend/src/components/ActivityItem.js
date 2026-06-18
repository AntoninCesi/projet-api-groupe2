import { CornerUpLeft, Heart, Flame, UserPlus, AtSign, ChevronRight, BadgeCheck } from 'lucide-react';

// type d'event -> icône
const icons = { reply: CornerUpLeft, like: Heart, fire: Flame, follow: UserPlus, mention: AtSign };

export default function ActivityItem({ item }) {
  const Icon = icons[item.type] ?? Heart;

  return (
    <button className="flex w-full items-center gap-3 py-3 text-left">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-ink">
          <span className="font-semibold">{item.actor}</span> {item.text}
        </p>
        <p className="mt-0.5 text-xs text-faint">{item.time}</p>
      </div>

      {/* official/verified -> badge ; sinon lien vers le contenu */}
      {item.verified
        ? <BadgeCheck size={20} className="shrink-0 text-brand" />
        : <ChevronRight size={20} className="shrink-0 text-faint" />}
    </button>
  );
}