const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = process.env;

exports.authRequired = (roles) => async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        if (!roles.includes(payload.role)) return res.status(403).json({ message: 'Forbidden' });
        req.user = await User.findById(payload.id);
        next();
    } catch (err) { res.status(403).json({ message: 'Invalid token' }); }
};
