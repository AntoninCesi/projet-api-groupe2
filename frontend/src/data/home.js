//fake json waiting for back-end api data 

// to see login button, set to nul
export const currentUser = {
  name: 'Camille Roy',
  avatar: 'https://picsum.photos/seed/camille/200',
};

export const featured = {
  topic: 'War in Ukraine',
  tag: 'Politics',
  official: true,
  degree: 98,
  onFire: true,
  change: '+24%',
  window: '1h',
  posts: 128,
  participants: '4.2k',
  updated: '3 min ago',
  source: { name: 'Le Monde', verified: true, excerpt: 'Drone strikes reported near Kharkiv this morning…' },
  link: '/post/war-in-ukraine',   
};

export const trending = [
  { id: 1, name: 'Qatar – Switzerland', meta: 'Sport · 92 posts', degree: 84, change: '+12', up: true, link: '/topic/qatar-switzerland',
   },
  { id: 2, name: 'AI Regulation', meta: 'Tech · 64 posts', degree: 76, change: '+8', up: true, link: '/topic/ai-regulation',
   },
  { id: 3, name: 'Floods in Valencia', meta: 'Climate · 51 posts', degree: 71, change: '-3', up: false, link: '/topic/floods-valencia',
   },
];

export const themes = [
  { id: 1, name: 'Space', actives: '1.2k active', degree: 88, topic: 'Artemis III Mission', icon: 'compass' },
  { id: 2, name: 'Elections', actives: '3.4k active', degree: 94, topic: 'Runoff debate', icon: 'vote' },
  { id: 3, name: 'Climate', actives: '980 active', degree: 71, topic: 'Floods in Valencia', icon: 'droplet' },
  { id: 4, name: 'Football', actives: '5.1k active', degree: 84, topic: 'Qatar – Switzerland', icon: 'trophy' },
];
