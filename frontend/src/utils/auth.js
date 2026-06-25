// front-side JWT handling, stored in a cookie (read by the api.js client + middleware)
const TOKEN_COOKIE = 'trend_token';

// stores the JWT (max-age 24h = back token lifetime)
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

// current user id, decoded from the JWT payload (used to compute "I liked it", etc.)
export function getUserId() {
  const token = getToken();
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1])).id;
  } catch {
    return null;
  }
}

export function getUserRole() {
  const token = getToken();
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1])).role;
  } catch {
    return null;
  }
}