import { getToken } from '@/utils/auth';

// petit client fetch qui remplace axios (zéro dépendance).
// surface gardée : api.get(url, { params }) / api.post(url, body) / api.patch(url, body) -> { data }
const BASE = process.env.NEXT_PUBLIC_API_URL || '';

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

  const data = await res.json().catch(() => null); // réponse vide -> null
  if (!res.ok) {
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
