// gestion du JWT côté front, stocké en cookie (lu par le client api.js + middleware)
const TOKEN_COOKIE = 'trend_token';

// stocke le JWT (max-age 24h = durée du token back)
export function setToken(token) {
  document.cookie = `${TOKEN_COOKIE}=${token}; path=/; max-age=86400`;
}

export function getToken() {
  if (typeof document === 'undefined') return null; // SSR / edge
  const m = document.cookie.match(/(?:^|; )trend_token=([^;]*)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export function logout() {
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`;
}

// id du user courant, décodé du payload JWT (sert à calculer "j'ai liké", etc.)
export function getUserId() {
  const token = getToken();
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1])).id;
  } catch {
    return null;
  }
}
