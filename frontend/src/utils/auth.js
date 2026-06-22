// mock auth front-only (cookie) en attendant le vrai JWT back
// le middleware lit ce cookie pour protéger les pages
export function login() {
  document.cookie = 'trend_auth=1; path=/; max-age=604800'; // 7j
}

export function logout() {
  document.cookie = 'trend_auth=; path=/; max-age=0';
}
