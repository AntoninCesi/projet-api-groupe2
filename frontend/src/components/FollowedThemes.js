'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '@/utils/api';
import { mapTheme } from '@/utils/adapters';

const Ctx = createContext(null);

export function FollowedThemesProvider({ children }) {
  const [all, setAll] = useState([]);
  const [followed, setFollowed] = useState([]);

  useEffect(() => {
    api.get('/themes').then((res) => setAll(res.data.map((t) => mapTheme(t)))).catch(() => {});
    api.get('/api/auth/me').then((r) => setFollowed(r.data.followedThemes ?? [])).catch(() => {});
  }, []);

  const toggle = useCallback(async (name) => {
    const has = followed.includes(name);
    setFollowed((f) => (has ? f.filter((n) => n !== name) : [...f, name]));
    try {
      const { data } = await api.post(`/themes/${encodeURIComponent(name)}/follow`);
      setFollowed((f) => {
        const without = f.filter((n) => n !== name);
        return data.following ? [...without, name] : without;
      });
    } catch {
      setFollowed((f) => (has ? [...f.filter((n) => n !== name), name] : f.filter((n) => n !== name)));
    }
  }, [followed]);

  return <Ctx.Provider value={{ all, followed, toggle }}>{children}</Ctx.Provider>;
}

export function useFollowedThemes() {
  return useContext(Ctx) ?? { all: [], followed: [], toggle: () => {} };
}
