import { getToken } from '@/utils/auth';

// small fetch client that replaces axios (zero dependency).
// kept surface: api.get(url, { params }) / api.post(url, body) / api.patch(url, body) -> { data }
//
// Next.js fetche l'API à 2 endroits :
//  - côté navigateur  -> doit viser une URL publique (ex: http://localhost:3000)
//  - côté serveur/SSR -> tourne DANS le conteneur frontend, où "localhost" = lui-même ;
//    il doit donc viser le service backend via le réseau Docker (ex: http://backend:3000).
const BASE =
  typeof window === 'undefined'
    ? process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || ''
    : process.env.NEXT_PUBLIC_API_URL || '';

async function request(method, path, { params, body } = {}) {
  const query = params ? '?' + new URLSearchParams(params) : '';
  const token = getToken();

  const res = await fetch(BASE + path + query, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null); // empty response -> null
  if (!res.ok) {
    if (res.status === 403 && data?.error === 'Account suspended or banned') {
        if (typeof window !== 'undefined' && window.location.pathname !== '/suspended')
            window.location.href = '/suspended';
        return;
    }
    const err = new Error(data?.error || `HTTP ${res.status}`);
    err.response = { data, status: res.status };
    throw err;
  }
  return { data };
}

const api = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, body) => request('POST', path, { body }),
  patch: (path, body) => request('PATCH', path, { body }),
};

export default api;
