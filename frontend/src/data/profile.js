// fake data en attendant le back (dev sur une autre branche)
// shortcut: à remplacer par un appel API getProfile() quand le back est prêt
export const profile = {
  name: 'Camille Roy',
  handle: '@camille',
  avatar: 'https://picsum.photos/seed/camille/200',
  bio: 'Accro à l’actu. Froide sur le foot, brûlante sur la géopol. Je suis 14 thèmes.',
  stats: {
    topics: 37,
    following: 14,
    karma: '6,8k',
  },
  themes: [
    { id: 1, name: 'Espace', actives: '1,2k actifs', degree: 88, topic: 'Mission Artemis III', icon: 'compass' },
    { id: 2, name: 'Élections', actives: '3,4k actifs', degree: 94, topic: 'Débat du second tour', icon: 'vote' },
    { id: 3, name: 'Climat', actives: '980 actifs', degree: 71, topic: 'Inondations à Valence', icon: 'droplet' },
    { id: 4, name: 'Football', actives: '5,1k actifs', degree: 84, topic: 'Qatar – Suisse', icon: 'trophy' },
  ],
};
