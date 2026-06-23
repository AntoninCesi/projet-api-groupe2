// shared display helpers (front)

// 2100 -> "2.1k" (English app, decimal point)
export function formatCount(n) {
  if (n < 1000) return n;
  return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
}

// API date -> short relative time: "now", "3 min", "2 h", "5 d"
export function timeAgo(date) {
  if (!date) return '';
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'now';
  if (s < 3600) return Math.floor(s / 60) + ' min';
  if (s < 86400) return Math.floor(s / 3600) + ' h';
  return Math.floor(s / 86400) + ' d';
}
