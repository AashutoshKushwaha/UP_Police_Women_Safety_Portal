const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

// Register Driver (only drivers can self-register)
exports.registerDriver = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ message: "Username and password required" });

        // username uniqueness check (caps)
        const existing = await User.findOne({ username: username.toUpperCase() });
        if (existing) return res.status(409).json({ message: "Username already taken" });

        const hashed = await bcrypt.hash(password, 10);
        const user = new User({
            username: username.toUpperCase(),
            password: hashed,
            role: 'driver',
            lockedUntil: null,
            loginAttempts: 0
        });
        await user.save();
        res.json({ message: "Driver registration successful. Please login." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Login (Driver, Admin, Officer, Station)
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ message: "Username and password required" });

        const user = await User.findOne({ username: username.toUpperCase() });
        if (!user) return res.status(401).json({ message: "Invalid username or password" });

        // Check lockout
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            return res.status(403).json({ message: 'Account locked. Try later.' });
        }

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) {
            // Increment login attempts
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            if (user.loginAttempts >= 5) {
                user.lockedUntil = new Date(Date.now() + 60 * 1000); // lock 1 min
                user.loginAttempts = 0;
            }
            await user.save();
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Reset login attempts if successful
        user.loginAttempts = 0;
        user.lockedUntil = null;
        await user.save();

        // JWT token (include username, role)
        const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, JWT_SECRET, { expiresIn: '30m' });
        res.json({ token, role: user.role, username: user.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
