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
  // format Polymarket prices-history : [{ t: unix s, p: prix 0..1 }]
  spark: [
    { t: 1750000000, p: 0.40 }, { t: 1750003600, p: 0.46 }, { t: 1750007200, p: 0.44 },
    { t: 1750010800, p: 0.52 }, { t: 1750014400, p: 0.50 }, { t: 1750018000, p: 0.58 },
    { t: 1750021600, p: 0.55 }, { t: 1750025200, p: 0.66 }, { t: 1750028800, p: 0.70 },
    { t: 1750032400, p: 0.78 },
  ],
  source: { name: 'Le Monde', verified: true, excerpt: 'Drone strikes reported near Kharkiv this morning…' },
  link: '/post/war-in-ukraine',   
};

export const trending = [
  { id: 1, name: 'Qatar – Switzerland', meta: 'Sport · 92 posts', degree: 84, change: '+12', up: true, link: '/topic/qatar-switzerland',
    spark: [{ t: 1750000000, p: 0.30 }, { t: 1750003600, p: 0.38 }, { t: 1750007200, p: 0.40 }, { t: 1750010800, p: 0.52 }, { t: 1750014400, p: 0.60 }, { t: 1750018000, p: 0.72 }, { t: 1750021600, p: 0.80 }] },
  { id: 2, name: 'AI Regulation', meta: 'Tech · 64 posts', degree: 76, change: '+8', up: true, link: '/topic/ai-regulation',
    spark: [{ t: 1750000000, p: 0.42 }, { t: 1750003600, p: 0.50 }, { t: 1750007200, p: 0.50 }, { t: 1750010800, p: 0.58 }, { t: 1750014400, p: 0.60 }, { t: 1750018000, p: 0.70 }, { t: 1750021600, p: 0.74 }] },
  { id: 3, name: 'Floods in Valencia', meta: 'Climate · 51 posts', degree: 71, change: '-3', up: false, link: '/topic/floods-valencia',
    spark: [{ t: 1750000000, p: 0.74 }, { t: 1750003600, p: 0.70 }, { t: 1750007200, p: 0.68 }, { t: 1750010800, p: 0.60 }, { t: 1750014400, p: 0.55 }, { t: 1750018000, p: 0.52 }, { t: 1750021600, p: 0.48 }] },
];

export const themes = [
  { id: 1, name: 'Space', actives: '1.2k active', degree: 88, topic: 'Artemis III Mission', icon: 'compass' },
  { id: 2, name: 'Elections', actives: '3.4k active', degree: 94, topic: 'Runoff debate', icon: 'vote' },
  { id: 3, name: 'Climate', actives: '980 active', degree: 71, topic: 'Floods in Valencia', icon: 'droplet' },
  { id: 4, name: 'Football', actives: '5.1k active', degree: 84, topic: 'Qatar – Switzerland', icon: 'trophy' },
];