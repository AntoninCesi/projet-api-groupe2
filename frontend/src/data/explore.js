// fake data en attendant le back
// shortcut: à remplacer par des appels API (topics chauds + catégories) plus tard
export const explore = {
  hot: [
    { id: 1, degree: 98, title: 'Guerre en Ukraine', meta: 'Politique · 128 posts · 4,2k' },
    { id: 2, degree: 84, title: 'Qatar – Suisse', meta: 'Sport · 92 posts · 2,7k' },
    { id: 3, degree: 76, title: "Régulation de l'IA", meta: 'Tech · 64 posts · 1,9k' },
    { id: 4, degree: 71, title: 'Inondations à Valence', meta: 'Climat · 51 posts · 1,3k' },
  ],
  categories: [
    { id: 1, name: 'Politique', topics: '240', icon: 'politics' },
    { id: 2, name: 'Sport', topics: '186', icon: 'sport' },
    { id: 3, name: 'Tech', topics: '152', icon: 'tech' },
    { id: 4, name: 'Économie', topics: '96', icon: 'economy' },
    { id: 5, name: 'Culture', topics: '131', icon: 'culture' },
    { id: 6, name: 'Sciences', topics: '74', icon: 'science' },
  ],
};
