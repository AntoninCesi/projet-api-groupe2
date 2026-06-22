// store mémoire (front-only) des posts créés pendant la session
// shortcut: remis à zéro au refresh, à remplacer par POST /posts + lecture API
export const createdPosts = [];

export function addPost(post) {
  createdPosts.unshift(post); // le plus récent en premier
}
