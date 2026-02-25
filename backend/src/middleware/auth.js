const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
    const token = authHeader && authHeader.split(' ')[0] !== 'Bearer' ? authHeader : (authHeader && authHeader.split(' ')[1]) || authHeader;
    if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId; // attach user id to request
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};
