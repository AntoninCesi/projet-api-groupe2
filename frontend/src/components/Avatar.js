// initials avatar (no external image -> never broken)
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
  // 1 letter from each word if the 2nd starts with a letter, otherwise 2 letters from the 1st
  if (parts.length >= 2 && /[a-z]/i.test(parts[1][0])) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}
