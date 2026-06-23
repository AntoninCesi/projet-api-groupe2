import Link from 'next/link';
import { CornerUpLeft, Heart, Flame, UserPlus, AtSign, ChevronRight, BadgeCheck, Repeat2, FileText } from 'lucide-react';
import Avatar from '@/components/Avatar';

// type d'event -> icône
const icons = { reply: CornerUpLeft, like: Heart, fire: Flame, follow: UserPlus, mention: AtSign, repost: Repeat2, post: FileText };

export default function ActivityItem({ item }) {
  const Icon = icons[item.type] ?? Heart;

  return (
    <Link href={item.link} className="flex w-full items-center gap-3 py-3 text-left">
      {/* avatar de l'acteur + petit badge du type d'event */}
      <div className="relative shrink-0">
        {item.avatar ? (
          <img src={item.avatar} alt={item.actor} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <Avatar name={item.actor} size={40} />
        )}
        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white ring-2 ring-background">
          <Icon size={11} />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-ink">
          <span className="font-semibold">{item.actor}</span> {item.text}
        </p>
        <p className="mt-0.5 text-xs text-faint">{item.time}</p>
      </div>

      {/* non lu -> point ; official/verified -> badge ; sinon chevron */}
      {item.read === false
        ? <span className="h-2 w-2 shrink-0 rounded-full bg-brand" aria-label="unread" />
        : item.verified
          ? <BadgeCheck size={20} className="shrink-0 text-brand" />
          : <ChevronRight size={20} className="shrink-0 text-faint" />}
    </Link>
  );
}