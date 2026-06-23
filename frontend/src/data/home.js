// shortcut: "Your themes" encore mocké — pas d'endpoint themes côté back pour l'instant.
// Featured / Trending / currentUser sont désormais branchés sur l'API (GET /topics, /api/auth/me).
export const themes = [
  { id: 1, name: 'Space', actives: '1.2k active', degree: 88, topic: 'Artemis III Mission', icon: 'compass' },
  { id: 2, name: 'Elections', actives: '3.4k active', degree: 94, topic: 'Runoff debate', icon: 'vote' },
  { id: 3, name: 'Climate', actives: '980 active', degree: 71, topic: 'Floods in Valencia', icon: 'droplet' },
  { id: 4, name: 'Football', actives: '5.1k active', degree: 84, topic: 'Qatar – Switzerland', icon: 'trophy' },
];