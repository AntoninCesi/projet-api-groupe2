// avatar à initiales (pas d'image externe -> jamais cassé)
export default function Avatar({ name, size = 36 }) {
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
  const parts = name.replace('@', '').split(/[_\s]+/).filter(Boolean);
  // 1 lettre de chaque mot si le 2e commence par une lettre, sinon 2 lettres du 1er
  if (parts.length >= 2 && /[a-z]/i.test(parts[1][0])) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}
