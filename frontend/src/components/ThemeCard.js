import Link from 'next/link';
import { Compass, Vote, Droplet, Trophy } from 'lucide-react';

const icons = { compass: Compass, vote: Vote, droplet: Droplet, trophy: Trophy };

export default function ThemeCard({ theme }) {
  const Icon = icons[theme.icon] ?? Compass;

  return (
    <Link href={`/theme/${theme.id}`} className="block rounded-2xl border border-line bg-gradient-to-br from-white to-background p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <p className="font-title font-semibold leading-tight text-ink">{theme.name}</p>
          <p className="text-xs text-faint">{theme.actives}</p>
        </div>
      </div>

      {/* degré de chaleur + topic le plus chaud */}
      <div className="mt-3 flex items-center gap-2 text-sm">
        <span className="font-title font-bold text-brand">{theme.degree}°</span>
        <span className="truncate text-muted">{theme.topic}</span>
      </div>
    </Link>
  );
}
