/**
 * Seed de la base Breezy : 10 users, des topics,
 * des posts likés et commentés.
 *
 * - Lancé automatiquement au démarrage du backend si la base est vide
 *   (voir seedIfEmpty + le hook dans index.js, activé par SEED_ON_START=true).
 * - Lançable à la main pour forcer un reset complet : `npm run seed`.
 *
 * Tous les users ont le même mot de passe pour faciliter les tests : Password123!
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/database.config');
const User = require('./models/user.model');
const Topic = require('./models/topic.model');
const Post = require('./models/post.model');
const Activity = require('./models/activity.model');

const PASSWORD = 'Password123!';

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

// --- Topics (la `category` alimente les thèmes de l'app) -------------------
const TOPICS = [
    { title: 'Présidentielle 2027',          category: 'Politique', tags: ['france', 'élection'],   description: 'Qui sera au second tour ?' },
    { title: 'Coupe du monde 2026',          category: 'Sport',     tags: ['foot', 'mondial'],       description: 'Pronostics pour le mondial.' },
    { title: 'IA & régulation',              category: 'Tech',      tags: ['ia', 'loi'],             description: "L'Europe va-t-elle serrer la vis ?" },
    { title: 'Bitcoin va-t-il exploser ?',   category: 'Crypto',    tags: ['btc', 'marché'],         description: 'Le BTC au-dessus de 100k cette année ?' },
    { title: 'Réforme des retraites',        category: 'Politique', tags: ['social', 'france'],      description: 'Nouvelle réforme en vue ?' },
    { title: 'Festival de Cannes',           category: 'Culture',   tags: ['cinéma', 'palme'],       description: 'Qui repart avec la Palme ?' },
];

// --- Posts : on référence users et topics par INDEX (résolus en ObjectId) --
// likes / comments.likes = listes d'index d'utilisateurs.
const POSTS = [
    { author: 1, topic: 1, content: "L'équipe de France part favorite, mais méfiance face au Brésil. 🏆", likes: [0, 2, 5, 9] },
    { author: 2, topic: 1, content: 'Honnêtement la défense est trop fragile, je n’y crois pas cette année.', likes: [1, 7] },
    { author: 5, topic: 0, content: 'Le paysage politique est totalement éclaté à 3 ans de l’échéance.', likes: [0, 3, 9],
      comments: [
          { author: 9, content: 'Tout peut basculer en quelques mois, comme toujours.', likes: [5] },
          { author: 0, content: 'Article très clair, merci !', likes: [] },
      ] },
    { author: 9, topic: 3, content: 'Le BTC qui retente les 100k$… ça sent le rallye de fin d’année. 📈', likes: [4, 2] },
    { author: 4, topic: 3, content: 'Je reste prudent, la volatilité est énorme en ce moment.', likes: [9] },
    { author: 7, topic: 2, content: 'L’AI Act va clairement ralentir certaines boîtes en Europe.', likes: [3, 6],
      comments: [{ author: 3, content: 'Ou les pousser à mieux se structurer, à voir.', likes: [7] }] },
    { author: 3, topic: 2, content: 'Régulation ≠ frein. Bien faite, ça crée de la confiance.', likes: [0, 5, 7, 9] },
    { author: 6, topic: 5, content: 'Sélection ultra forte cette année à Cannes, des films incroyables. 🎬', likes: [8] },
    { author: 0, topic: 4, content: 'La réforme des retraites revient sur la table, ça va chauffer.', likes: [1, 5, 9] },
    { author: 5, topic: 4, content: 'Dossier explosif, je suis ça de près côté terrain.', likes: [0] },
    { author: 8, topic: 1, content: 'Première fois que je parie sur un mondial, des conseils ? 😅', likes: [1, 2],
      comments: [{ author: 1, content: 'Commence petit et diversifie !', likes: [8] }] },
    { author: 2, topic: 5, content: 'Pas convaincu par les favoris, j’attends les outsiders.', likes: [] },
    { author: 1, topic: 2, content: 'L’IA dans le foot pour l’arbitrage, ça arrive plus vite qu’on croit.', likes: [7, 3] },
    { author: 9, topic: 0, content: 'Les sondages bougent énormément, prudence sur les pronos.', likes: [5, 3, 0] },
    { author: 4, topic: 3, content: 'Achetez la rumeur, vendez la nouvelle. 🪙', likes: [9, 2] },
    { author: 6, topic: 5, content: 'Mon pronostic Palme d’or : un outsider va surprendre tout le monde.', likes: [8, 2] },
];

/** Construit quelques points d'historique pour les sparklines des topics. */
function buildHistory(base) {
    const now = Math.floor(Date.now() / 1000);
    const pts = [];
    for (let i = 6; i >= 0; i--) {
        const p = Math.max(0, Math.min(100, base + ((i * 7) % 23) - 10));
        pts.push({ t: now - i * 3600, p });
    }
    return pts;
}

/** Insère tout le jeu de données (reset complet : vide puis re-remplit). */
async function seed() {
    await Promise.all([
        User.deleteMany({}),
        Topic.deleteMany({}),
        Post.deleteMany({}),
        Activity.deleteMany({}),
    ]);

    const hashed = await bcrypt.hash(PASSWORD, 10);
    const users = await User.insertMany(
        USERS.map(u => ({
            ...u,
            email: `${u.username}@breezy.test`,
            password: hashed,
        }))
    );

    const topics = await Topic.insertMany(
        TOPICS.map((t, i) => ({
            ...t,
            source: 'COMMUNITY',
            degree: 40 + i * 8,
            internalHeat: 30 + i * 5,
            isOnFire: i < 2,
            history: buildHistory(45 + i * 6),
        }))
    );

    // Quelques relations sociales : abonnements entre users + thèmes suivis.
    await User.findByIdAndUpdate(users[8]._id, {
        following: [users[0]._id, users[3]._id, users[5]._id],
        followedThemes: ['Politique', 'Sport'],
        followedTopics: [topics[0]._id, topics[1]._id],
    });
    await User.findByIdAndUpdate(users[1]._id, {
        following: [users[9]._id],
        followedThemes: ['Sport'],
        followedTopics: [topics[1]._id],
    });

    const posts = POSTS.map(p => ({
        authorId: users[p.author]._id,
        topicId: topics[p.topic]._id,
        content: p.content,
        tags: TOPICS[p.topic].tags,
        likes: (p.likes || []).map(i => users[i]._id),
        comments: (p.comments || []).map(c => ({
            authorId: users[c.author]._id,
            content: c.content,
            likes: (c.likes || []).map(i => users[i]._id),
        })),
    }));
    const createdPosts = await Post.insertMany(posts);

    // Documents Activity : c'est CETTE collection qui alimente le calcul de "chaleur"
    // (degree) dans polymarketSync. Sans ça, les topics communautaires restent à 0.
    // createdPosts est dans le même ordre que POSTS -> on relie chaque post à son source.
    const activities = [];
    createdPosts.forEach((post, idx) => {
        const src = POSTS[idx];
        activities.push({ userId: post.authorId, type: 'POST', targetType: 'Post', targetId: post._id });
        (src.likes || []).forEach(i => {
            activities.push({ userId: users[i]._id, type: 'LIKE', targetType: 'Post', targetId: post._id });
        });
        (src.comments || []).forEach(c => {
            activities.push({ userId: users[c.author]._id, type: 'COMMENT', targetType: 'Post', targetId: post._id });
        });
    });
    await Activity.insertMany(activities);

    // Met à jour le compteur de posts par topic.
    for (const topic of topics) {
        const count = createdPosts.filter(p => String(p.topicId) === String(topic._id)).length;
        await Topic.findByIdAndUpdate(topic._id, { postsCount: count });
    }

    console.log(`[seed] OK : ${users.length} users, ${topics.length} topics, ${createdPosts.length} posts, ${activities.length} activities.`);
    console.log(`[seed] Connexion test -> email: alice@breezy.test  |  mot de passe: ${PASSWORD}`);
}

/** Ne seed que si la base est vide (utilisé au démarrage du backend). */
async function seedIfEmpty() {
    const count = await User.estimatedDocumentCount();
    if (count > 0) {
        console.log('[seed] Base déjà peuplée, seed ignoré.');
        return;
    }
    console.log('[seed] Base vide, insertion du jeu de données de démo…');
    await seed();
}

module.exports = { seed, seedIfEmpty };

// Exécution directe : `node src/seed.js` ou `npm run seed` -> reset complet.
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
