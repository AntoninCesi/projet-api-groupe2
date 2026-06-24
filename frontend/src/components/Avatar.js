// avatar: real image when an avatarUrl (data URL) is present, initials fallback otherwise
export default function Avatar({ name, src, size = 36 }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-deep font-title text-xs font-semibold text-white"
      style={{ width: size, height: size }}
    >
      {initials(name)}
    </span>
  );
}

function initials(name) {
  const parts = (name || '').replace('@', '').split(/[_\s]+/).filter(Boolean);
  if (parts.length >= 2 && /[a-z]/i.test(parts[1][0])) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (parts[0] || '?').slice(0, 2).toUpperCase();
}
