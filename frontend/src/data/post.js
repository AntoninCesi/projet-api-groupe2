// fake data while waiting for the back end
// shortcut: a single mocked post, we ignore the URL id for now
export const post = {
  id: 1,
  topic: 'War in Ukraine',
  author: 'Le Monde',
  authorId: null, // shortcut: mocked id missing -> Message button hidden; real _id via mapPost once wired
  verified: true,
  official: true,
  pinned: true,
  time: '3 min',
  text: 'Drone strikes reported near Kharkiv overnight. Power outages in several districts; authorities call for calm. Live coverage to follow.',
  likes: 2100,
  liked: true,
  comments: 340,
  reposts: 412,
};

// replies on a single level (post -> comment -> reply), see CLAUDE.md
export const comments = [
  {
    id: 1,
    author: 'geopol_nerd',
    time: '6 min',
    text: 'Updated map of positions in reply. The front line has barely moved in three weeks.',
    likes: 312,
    replies: [
      {
        id: 11,
        author: 'marie_k',
        time: '5 min',
        text: 'Thanks for the map. Do you have a source for the northern positions?',
        likes: 88,
      },
      {
        id: 12,
        author: 'geopol_nerd',
        time: '4 min',
        text: 'Yes — official agencies + cross-checked satellite imagery. Link in my bio.',
        likes: 120,
      },
      {
        id: 13,
        author: 'anton_v',
        time: '2 min',
        text: 'Matches what I see on my side too.',
        likes: 31,
      },
    ],
  },
  {
    id: 2,
    author: 'skeptic_42',
    time: '3 min',
    text: 'Still, caution — some of these images have been circulating for months.',
    likes: 12,
    replies: [],
  },
];
