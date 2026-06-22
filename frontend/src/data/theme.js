// fake json waiting for back-end api data
// back end will send date based on theme id
export const theme = {
  id: 'climate',
  name: 'Climate',
  icon: 'leaf',
  actives: '980 active',
  topicsCount: 12,
  following: true,
  degree: 67,
  change: '+18%',
  window: '24 h',
  // format Polymarket prices-history : [{ t: unix s, p: prix 0..1 }]
  spark: [
    { t: 1750000000, p: 0.50 }, { t: 1750021600, p: 0.52 }, { t: 1750043200, p: 0.55 },
    { t: 1750064800, p: 0.54 }, { t: 1750086400, p: 0.60 }, { t: 1750108000, p: 0.63 },
    { t: 1750129600, p: 0.64 }, { t: 1750151200, p: 0.67 },
  ],
  featured: {
    title: 'Floods in Valencia',
    degree: 91,
    tag: 'Climate',
    official: 'AFP',
    posts: 214,
    participants: '7.3k',
    change: '+31%',
    window: '1 h',
    link: '/topic/floods-valencia',
  },
  topics: [
    { id: 1, name: 'COP30 in Belém', meta: 'Politics · 128 posts', degree: 82, change: '+9', up: true, official: true, onFire: true, link: '/topic/cop30-belem',
      spark: [{ t: 1750000000, p: 0.40 }, { t: 1750043200, p: 0.48 }, { t: 1750086400, p: 0.58 }, { t: 1750129600, p: 0.66 }] },
    { id: 2, name: 'Carbon tax debate', meta: 'Economy · 64 posts', degree: 74, change: '+5', up: true, official: false, onFire: false, link: '/topic/carbon-tax',
      spark: [{ t: 1750000000, p: 0.55 }, { t: 1750043200, p: 0.58 }, { t: 1750086400, p: 0.60 }, { t: 1750129600, p: 0.64 }] },
    { id: 3, name: 'Wildfires in Greece', meta: 'Climate · 51 posts', degree: 69, change: '-2', up: false, official: true, onFire: false, link: '/topic/wildfires-greece',
      spark: [{ t: 1750000000, p: 0.70 }, { t: 1750043200, p: 0.66 }, { t: 1750086400, p: 0.62 }, { t: 1750129600, p: 0.58 }] },
  ],
};
