const requireFields = require('./requiredFields.middleware');

function mockRes() {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
}

describe('requiredFields.middleware', () => {
    test('laisse passer quand tous les champs sont présents', () => {
        const mw = requireFields(['email', 'password']);
        const req = { body: { email: 'a@b.c', password: 'secret' } };
        const res = mockRes();
        const next = jest.fn();

        mw(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    test('400 quand un champ manque', () => {
        const mw = requireFields(['email', 'password']);
        const req = { body: { email: 'a@b.c' } };
        const res = mockRes();
        const next = jest.fn();

        mw(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid fields: password' });
        expect(next).not.toHaveBeenCalled();
    });

    test('400 quand un champ est vide', () => {
        const mw = requireFields(['content']);
        const req = { body: { content: '' } };
        const res = mockRes();
        const next = jest.fn();

        mw(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });

    test('400 quand un champ est un objet (entrée invalide)', () => {
        const mw = requireFields(['content']);
        const req = { body: { content: { hack: 1 } } };
        const res = mockRes();
        const next = jest.fn();

        mw(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });
});
