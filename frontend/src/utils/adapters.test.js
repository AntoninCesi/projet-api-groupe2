import { mapPost } from '@/utils/adapters';

// Post minimal renvoyé par l'API (authorId/topicId populés côté back).
const basePost = {
  _id: 'p1',
  content: 'hello',
  createdAt: new Date().toISOString(),
  likes: [],
  comments: [],
};

describe('mapPost — onglet official / community', () => {
  test('auteur source officielle -> tab "official"', () => {
    const p = { ...basePost, authorId: { _id: 'u1', username: 'diana', isOfficialSource: true, isVerified: true } };
    expect(mapPost(p).tab).toBe('official');
  });

  test('auteur vérifié mais NON source officielle -> tab "community"', () => {
    const p = { ...basePost, authorId: { _id: 'u2', username: 'alice', isOfficialSource: false, isVerified: true } };
    const m = mapPost(p);
    expect(m.tab).toBe('community');
    expect(m.verified).toBe(true); // le badge ✓ est indépendant de l'onglet
  });
});

describe('mapPost — like de l\'utilisateur courant', () => {
  test('liked=true si userId est dans les likes', () => {
    const p = { ...basePost, authorId: { _id: 'u1', username: 'x' }, likes: ['me', 'other'] };
    const m = mapPost(p, 'me');
    expect(m.liked).toBe(true);
    expect(m.likes).toBe(2);
  });

  test('liked=false sinon', () => {
    const p = { ...basePost, authorId: { _id: 'u1', username: 'x' }, likes: ['other'] };
    expect(mapPost(p, 'me').liked).toBe(false);
  });

  test('auteur absent -> "unknown" (pas de crash)', () => {
    const m = mapPost({ ...basePost, authorId: null });
    expect(m.author).toBe('unknown');
    expect(m.tab).toBe('community');
  });
});
