// Tests d'intégration : routes -> controllers -> MongoDB (base dédiée breezy_test).
// Nécessite une instance Mongo accessible (le conteneur `mongodb` du docker-compose).
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user.model');
const Post = require('../models/post.model');
const Notification = require('../models/notification.model');

const MONGO_HOST = process.env.MONGO_HOST || 'localhost';
const TEST_URI = `mongodb://${MONGO_HOST}:27017/breezy_test`;

beforeAll(async () => {
    if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'test-secret';
    await mongoose.connect(TEST_URI);
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

// base propre avant chaque test
beforeEach(async () => {
    await Promise.all([User.deleteMany({}), Post.deleteMany({}), Notification.deleteMany({})]);
});

// helper : inscrit + connecte un user, renvoie { id, token }
async function makeUser({ username, email, password = 'Password123!' }) {
    await request(app).post('/api/auth/register').send({ username, email, password });
    const res = await request(app).post('/api/auth/login').send({ email, password });
    return { token: res.body.token, id: res.body.user.id };
}

describe('Auth — inscription & connexion (Fx1/Fx2)', () => {
    test('register (201) puis login renvoie un token', async () => {
        const reg = await request(app).post('/api/auth/register')
            .send({ username: 'alice', email: 'alice@test.io', password: 'Password123!' });
        expect(reg.status).toBe(201);
        expect(reg.body).toMatchObject({ username: 'alice', email: 'alice@test.io' });

        const login = await request(app).post('/api/auth/login')
            .send({ email: 'alice@test.io', password: 'Password123!' });
        expect(login.status).toBe(200);
        expect(typeof login.body.token).toBe('string');
    });

    test('register refuse un mot de passe trop court (400)', async () => {
        const res = await request(app).post('/api/auth/register')
            .send({ username: 'bob', email: 'bob@test.io', password: '123' });
        expect(res.status).toBe(400);
    });

    test('register refuse un email déjà pris (409)', async () => {
        const u = { username: 'carol', email: 'carol@test.io', password: 'Password123!' };
        await request(app).post('/api/auth/register').send(u);
        const res = await request(app).post('/api/auth/register').send({ ...u, username: 'carol2' });
        expect(res.status).toBe(409);
    });

    test('login refuse un mauvais mot de passe (401)', async () => {
        await request(app).post('/api/auth/register')
            .send({ username: 'dave', email: 'dave@test.io', password: 'Password123!' });
        const res = await request(app).post('/api/auth/login')
            .send({ email: 'dave@test.io', password: 'wrong' });
        expect(res.status).toBe(401);
    });
});

describe('Like (Fx6) + notification (Fx15)', () => {
    test('liker le post d\'un autre persiste, crée une notif LIKE, et le toggle annule', async () => {
        const author = await makeUser({ username: 'author', email: 'author@test.io' });
        const liker = await makeUser({ username: 'liker', email: 'liker@test.io' });

        const post = await request(app).post('/posts')
            .set('Authorization', `Bearer ${author.token}`).send({ content: 'Mon post' });
        const postId = post.body._id;

        const like = await request(app).post(`/posts/${postId}/like`)
            .set('Authorization', `Bearer ${liker.token}`);
        expect(like.status).toBe(200);
        expect(like.body).toMatchObject({ liked: true, likesCount: 1 });

        const notif = await Notification.findOne({ userId: author.id, type: 'LIKE' });
        expect(notif).not.toBeNull();
        expect(String(notif.actorId)).toBe(String(liker.id));

        const unlike = await request(app).post(`/posts/${postId}/like`)
            .set('Authorization', `Bearer ${liker.token}`);
        expect(unlike.body).toMatchObject({ liked: false, likesCount: 0 });
    });
});

describe('Commentaire (Fx7) + réponse imbriquée (Fx8)', () => {
    test('ajoute un commentaire puis une réponse sur ce commentaire', async () => {
        const a = await makeUser({ username: 'ua', email: 'ua@test.io' });
        const b = await makeUser({ username: 'ub', email: 'ub@test.io' });

        const post = await request(app).post('/posts')
            .set('Authorization', `Bearer ${a.token}`).send({ content: 'post' });
        const postId = post.body._id;

        const comment = await request(app).post(`/posts/${postId}/comments`)
            .set('Authorization', `Bearer ${b.token}`).send({ content: 'un commentaire' });
        expect(comment.status).toBe(201);

        const reply = await request(app).post(`/posts/${postId}/comments/${comment.body._id}/replies`)
            .set('Authorization', `Bearer ${a.token}`).send({ content: 'une réponse' });
        expect(reply.status).toBe(201);

        const dbPost = await Post.findById(postId);
        expect(dbPost.comments).toHaveLength(1);
        expect(dbPost.comments[0].replies).toHaveLength(1);
    });
});

describe('Follow (Fx9) + notification (Fx16)', () => {
    test('suivre un user met à jour following et crée une notif FOLLOW', async () => {
        const me = await makeUser({ username: 'me', email: 'me@test.io' });
        const target = await makeUser({ username: 'target', email: 'target@test.io' });

        const res = await request(app).post(`/users/${target.id}/follow`)
            .set('Authorization', `Bearer ${me.token}`);
        expect(res.status).toBe(200);
        expect(res.body.following).toBe(true);

        const meDoc = await User.findById(me.id);
        expect(meDoc.following.map(String)).toContain(String(target.id));

        const notif = await Notification.findOne({ userId: target.id, type: 'FOLLOW' });
        expect(notif).not.toBeNull();
    });
});
