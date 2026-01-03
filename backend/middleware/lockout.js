// Used in login route to lock after 5 failed attempts for 1 min
const User = require('../models/User');

exports.checkLockout = async (req, res, next) => {
    const { username } = req.body;
    const user = await User.findOne({ username });
    if (user) {
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            return res.status(403).json({ message: 'Account locked. Try later.' });
        }
    }
    next();
};
