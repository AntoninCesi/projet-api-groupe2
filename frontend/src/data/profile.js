// fake data while waiting for the back end (dev on another branch)
// shortcut: to be replaced by a getProfile() API call once the back end is ready
export const profile = {
  name: 'Camille Roy',
  handle: '@camille',
  avatar: 'https://picsum.photos/seed/camille/200',
  bio: 'News junkie. Cold on football, on fire about geopolitics. Following 14 themes.',
  stats: {
    topics: 37,
    following: 14,
    karma: '6.8k',
  },
  themes: [
    { id: 1, name: 'Space', actives: '1.2k active', degree: 88, topic: 'Artemis III Mission', icon: 'compass' },
    { id: 2, name: 'Elections', actives: '3.4k active', degree: 94, topic: 'Runoff debate', icon: 'vote' },
    { id: 3, name: 'Climate', actives: '980 active', degree: 71, topic: 'Floods in Valencia', icon: 'droplet' },
    { id: 4, name: 'Football', actives: '5.1k active', degree: 84, topic: 'Qatar – Switzerland', icon: 'trophy' },
  ],
};
