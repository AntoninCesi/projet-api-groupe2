const jwt = require('jsonwebtoken');
const authMiddleware = require('./auth.middleware');

const SECRET = 'test-secret';

// Simule l'objet réponse Express : res.status(...).json(...)
function mockRes() {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
}

const tokenFor = (payload, opts) => jwt.sign(payload, SECRET, opts);

describe('auth.middleware', () => {
    beforeAll(() => { process.env.JWT_SECRET = SECRET; });

    test('refuse une requête sans header Authorization (401)', () => {
        const req = { headers: {} };
        const res = mockRes();
        const next = jest.fn();

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid authorization header' });
        expect(next).not.toHaveBeenCalled();
    });

    test('refuse un header sans préfixe "Bearer " (401)', () => {
        const req = { headers: { authorization: 'Token abc' } };
        const res = mockRes();
        const next = jest.fn();

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    test('laisse passer un token valide (compte actif) et remplit req.user', () => {
        const token = tokenFor({ id: 'u1', status: 'active', role: 'user' });
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = mockRes();
        const next = jest.fn();

        authMiddleware(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
        expect(req.user).toMatchObject({ id: 'u1', status: 'active' });
    });

    test('bloque un compte suspendu/banni (403)', () => {
        const token = tokenFor({ id: 'u2', status: 'suspended' });
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = mockRes();
        const next = jest.fn();

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Account suspended or banned' });
        expect(next).not.toHaveBeenCalled();
    });

    test('refuse un token invalide (401)', () => {
        const req = { headers: { authorization: 'Bearer not.a.real.token' } };
        const res = mockRes();
        const next = jest.fn();

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
        expect(next).not.toHaveBeenCalled();
    });

    test('refuse un token expiré (401)', () => {
        const token = tokenFor({ id: 'u3', status: 'active' }, { expiresIn: '-1s' });
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = mockRes();
        const next = jest.fn();

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });
});
