// Cadran de chaleur (motif signature DS) — anneau SVG turquoise = heat/100.
export default function HeatDial({ heat = 0, size = 84, onFire = false }) {
  const sw = size <= 64 ? 5 : 6;
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const on = (Math.max(0, Math.min(100, heat)) / 100) * c;
  const fs = size <= 56 ? 16 : size <= 70 ? 19 : 23;
  const showLabel = onFire && size >= 70;

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" className="stroke-line" strokeWidth={sw} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className="stroke-brand"
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={`${on.toFixed(1)} ${(c - on).toFixed(1)}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-title font-extrabold leading-none -tracking-[1px] tabular-nums text-ink"
          style={{ fontSize: fs }}
        >
          {heat}°
        </span>
        {showLabel && (
          <span className="mt-[3px] text-[8px] font-extrabold uppercase tracking-[0.12em] text-press">
            On fire
          </span>
        )}
      </span>
    </span>
  );
}
