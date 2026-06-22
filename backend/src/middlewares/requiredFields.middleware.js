module.exports = (fieldsRequired) => (req, res, next) => {
    const invalid = fieldsRequired.filter(f => !req.body[f] || typeof req.body[f] === 'object');
    if (invalid.length > 0) {
        return res.status(400).json({ error: `Missing or invalid fields: ${invalid.join(', ')}` });
    }
    next();
};