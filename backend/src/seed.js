/**
 * Seed de la base Breezy : 10 users de test + des posts likés/commentés
 * rattachés aux VRAIS topics (Polymarket) une fois la synchro passée.
 * Activé par SEED_ON_START=true. Reset manuel complet : `npm run seed`.
 * Tous les users ont le même mot de passe : Password123!
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/database.config');
const User = require('./models/user.model');
const Topic = require('./models/topic.model');
const Post = require('./models/post.model');
const Activity = require('./models/activity.model');
const Notification = require('./models/notification.model');

const PASSWORD = 'Password123!';
const TOPIC_COUNT = 6; // nombre de topics qui reçoivent des posts de test

// --- 10 utilisateurs -------------------------------------------------------
const USERS = [
    { username: 'alice',   bio: 'Modératrice & accro aux pronostics.', role: 'moderator', isVerified: true,  karma: 320 },
    { username: 'bob',     bio: 'Fan de foot et de stats.',            role: 'user',                          karma: 145 },
    { username: 'charlie', bio: 'Toujours un avis sur tout.',          role: 'user',                          karma: 88 },
    { username: 'diana',   bio: 'Admin de Breezy.',                    role: 'admin',     isVerified: true,  karma: 500, isOfficialSource: true },
    { username: 'ethan',   bio: 'Crypto-curieux.',                     role: 'user',                          karma: 30 },
    { username: 'fatima',  bio: 'Journaliste politique.',              role: 'user',      isVerified: true,  karma: 210 },
    { username: 'gabriel', bio: 'Cinéphile invétéré.',                 role: 'user',                          karma: 64 },
    { username: 'hana',    bio: 'Dev le jour, gameuse la nuit.',       role: 'user',                          karma: 99 },
    { username: 'ines',    bio: 'Je débute ici, soyez sympas !',       role: 'user',                          karma: 5 },
    { username: 'jamal',   bio: 'Économie & marchés.',                 role: 'user',                          karma: 175 },
];

// --- Topics de repli (UNIQUEMENT si Polymarket est indispo) ----------------
const FALLBACK_TOPICS = [
    { title: 'Débat de société', category: 'Société', tags: ['actu'] },
    { title: 'Tech & innovation', category: 'Tech', tags: ['tech'] },
    { title: 'Sport & compétitions', category: 'Sport', tags: ['sport'] },
];

// --- Posts GÉNÉRIQUES (réactions de marché de prédiction) ------------------
// Pas de topic fixe : ils sont répartis sur les topics choisis
const POSTS = [
    { author: 1, content: 'Gros doute sur l’issue, ça peut basculer à tout moment.', likes: [0, 2, 5, 9],
      comments: [
          { author: 9, content: 'Totalement d’accord, rien n’est joué.', likes: [5],
            replies: [
                { author: 1, content: 'Exactement, le marché sous-estime le risque.', likes: [9] },
                { author: 5, content: 'On en reparle dans une semaine 😏', likes: [] },
            ] },
          { author: 0, content: 'Bien vu, merci pour l’analyse !', likes: [] },
      ] },
    { author: 2, content: 'Je parie clairement pour le oui. 🔥', likes: [1, 7] },
    { author: 5, content: 'Les chiffres penchent dans l’autre sens, prudence.', likes: [0, 3, 9] },
    { author: 9, content: 'Le volume explose en ce moment, ça sent le retournement. 📈', likes: [4, 2] },
    { author: 4, content: 'Trop serré pour trancher honnêtement.', likes: [9],
      comments: [{ author: 3, content: 'Pas sûr, je le vois différemment.', likes: [7],
            replies: [{ author: 4, content: 'Justement, c’est ce qui rend ça intéressant.', likes: [3] }] }] },
    { author: 7, content: 'Je suis ça de très près, gros potentiel ici.', likes: [3, 6] },
    { author: 3, content: 'Le sentiment général a complètement changé cette semaine.', likes: [0, 5, 7, 9] },
    { author: 6, content: 'Pas convaincu par les favoris, j’attends les outsiders.', likes: [8] },
    { author: 0, content: 'Dossier explosif, à suivre absolument.', likes: [1, 5, 9] },
    { author: 5, content: 'Mon intuition dit non, mais le marché dit oui…', likes: [0] },
    { author: 8, content: 'Première fois que je parie là-dessus, des conseils ? 😅', likes: [1, 2],
      comments: [{ author: 1, content: 'Commence petit et diversifie !', likes: [8],
            replies: [{ author: 8, content: 'Merci du conseil 🙏', likes: [1] }] }] },
    { author: 2, content: 'Ça se joue à rien, les deux camps sont solides.', likes: [] },
    { author: 1, content: 'Restez prudents, la volatilité est énorme en ce moment.', likes: [7, 3] },
    { author: 9, content: 'Achetez la rumeur, vendez la nouvelle. 🪙', likes: [5, 3, 0] },
    { author: 4, content: 'Un outsider pourrait surprendre tout le monde.', likes: [9, 2] },
    { author: 6, content: 'Je reste sur ma position, le retournement est proche.', likes: [8, 2] },
];

/** Points d'historique pour les sparklines des topics de repli. */
function buildHistory(base) {
    const now = Math.floor(Date.now() / 1000);
    const pts = [];
    for (let i = 6; i >= 0; i--) {
        const p = Math.max(0, Math.min(100, base + ((i * 7) % 23) - 10));
        pts.push({ t: now - i * 3600, p });
    }
    return pts;
}

/** Crée les 10 users (+ abonnements entre eux) si la base n'en a aucun. */
async function seedUsersIfEmpty() {
    if ((await User.estimatedDocumentCount()) > 0) return;

    const hashed = await bcrypt.hash(PASSWORD, 10);
    const users = await User.insertMany(
        USERS.map(u => ({ ...u, email: `${u.username}@breezy.test`, password: hashed }))
    );

    // Abonnements user -> user (indépendants des topics).
    await User.findByIdAndUpdate(users[8]._id, { following: [users[0]._id, users[3]._id, users[5]._id] });
    await User.findByIdAndUpdate(users[1]._id, { following: [users[9]._id] });

    console.log(`[seed] ${users.length} users créés (mdp commun: ${PASSWORD}).`);
}

/** Renvoie les users de test ordonnés comme le tableau USERS. */
async function getOrderedUsers() {
    const docs = await User.find({ email: { $in: USERS.map(u => `${u.username}@breezy.test`) } });
    const byUsername = new Map(docs.map(u => [u.username, u]));
    return USERS.map(u => byUsername.get(u.username)).filter(Boolean);
}

/** Topics qui recevront les posts : les vrais (Polymarket) ou un repli communautaire. */
async function pickTopics() {
    const real = await Topic.find().sort({ degree: -1 }).limit(TOPIC_COUNT);
    if (real.length > 0) return real;

    console.log('[seed] Aucun topic en base -> création de topics communautaires de repli.');
    return Topic.insertMany(
        FALLBACK_TOPICS.map((t, i) => ({
            ...t,
            source: 'COMMUNITY',
            degree: 45 + i * 6,
            isOnFire: i === 0,
            history: buildHistory(45 + i * 6),
        }))
    );
}

/** Répartit les posts de test (+ likes/commentaires/activités) sur les topics. */
async function seedContentIfEmpty() {
    if ((await Post.estimatedDocumentCount()) > 0) return; // déjà du contenu
    const users = await getOrderedUsers();
    if (users.length === 0) return;                        // users pas encore seedés
    const topics = await pickTopics();

    const posts = POSTS.map((p, idx) => {
        const topic = topics[idx % topics.length];
        return {
            authorId: users[p.author]._id,
            topicId: topic._id,
            content: p.content,
            tags: topic.tags || [],
            likes: (p.likes || []).map(i => users[i]._id),
            comments: (p.comments || []).map(c => ({
                authorId: users[c.author]._id,
                content: c.content,
                likes: (c.likes || []).map(i => users[i]._id),
                replies: (c.replies || []).map(r => ({
                    authorId: users[r.author]._id,
                    content: r.content,
                    likes: (r.likes || []).map(i => users[i]._id),
                })),
            })),
        };
    });
    const createdPosts = await Post.insertMany(posts);

    // Activity : c'est cette collection qui alimente le calcul de "chaleur" (degree).
    const activities = [];
    createdPosts.forEach((post, idx) => {
        const src = POSTS[idx];
        activities.push({ userId: post.authorId, type: 'POST', targetType: 'Post', targetId: post._id });
        (src.likes || []).forEach(i => activities.push({ userId: users[i]._id, type: 'LIKE', targetType: 'Post', targetId: post._id }));
        (src.comments || []).forEach(c => activities.push({ userId: users[c.author]._id, type: 'COMMENT', targetType: 'Post', targetId: post._id }));
    });
    await Activity.insertMany(activities);

    // Notifications, calquées sur ce que génèrent les controllers :
    //  - like sur un post -> type LIKE pour l'auteur du post
    //  - reply sur un commentaire -> type MENTION pour l'auteur du commentaire
    // (jamais de notif quand on agit sur son propre contenu)
    const notifications = [];
    createdPosts.forEach((post, idx) => {
        const src = POSTS[idx];
        (src.likes || []).forEach(i => {
            if (i !== src.author) {
                notifications.push({ userId: post.authorId, actorId: users[i]._id, type: 'LIKE', sourceType: 'Post', sourceId: post._id });
            }
        });
        (src.comments || []).forEach(c => {
            (c.replies || []).forEach(r => {
                if (r.author !== c.author) {
                    notifications.push({ userId: users[c.author]._id, actorId: users[r.author]._id, type: 'MENTION', sourceType: 'Post', sourceId: post._id });
                }
            });
        });
    });
    await Notification.insertMany(notifications);

    // postsCount immédiat (le recalc le réécrira de toute façon au prochain cycle).
    for (const topic of topics) {
        const count = createdPosts.filter(p => String(p.topicId) === String(topic._id)).length;
        if (count > 0) await Topic.findByIdAndUpdate(topic._id, { $inc: { postsCount: count } });
    }

    // Quelques abonnements à de vrais topics + thèmes correspondants.
    const cats = [...new Set(topics.map(t => t.category).filter(Boolean))].slice(0, 2);
    await User.findByIdAndUpdate(users[8]._id, {
        followedTopics: [topics[0]._id, topics[1] && topics[1]._id].filter(Boolean),
        followedThemes: cats,
    });
    await User.findByIdAndUpdate(users[1]._id, {
        followedTopics: [topics[0]._id],
        followedThemes: cats.slice(0, 1),
    });

    console.log(`[seed] Contenu : ${createdPosts.length} posts + ${activities.length} activities + ${notifications.length} notifications répartis sur ${topics.length} topics.`);
}

/** Reset manuel complet (`npm run seed`) : users + posts/activités, SANS toucher aux topics. */
async function seed() {
    await Promise.all([
        User.deleteMany({}), Post.deleteMany({}),
        Activity.deleteMany({}), Notification.deleteMany({}),
    ]);
    await seedUsersIfEmpty();
    await seedContentIfEmpty();
    console.log(`[seed] Connexion test -> email: alice@breezy.test  |  mot de passe: ${PASSWORD}`);
}

module.exports = { seed, seedUsersIfEmpty, seedContentIfEmpty };

// Exécution directe : `node src/seed.js` ou `npm run seed`.
if (require.main === module) {
    connectDB()
        .then(seed)
        .then(() => mongoose.connection.close())
        .then(() => process.exit(0))
        .catch(err => {
            console.error('[seed] Erreur :', err);
            process.exit(1);
        });
}
