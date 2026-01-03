const bcrypt = require('bcrypt');
const User = require('../models/User');
const mongoose = require('mongoose');
require('dotenv').config();

(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const hashed = await bcrypt.hash(process.env.ADMIN_PASS, 10);
    await User.create({
        username: process.env.ADMIN_USER,
        password: hashed,
        role: 'admin'
    });
    console.log('Admin seeded.');
    process.exit();
})();
//Aashutosh Kushwaha ,IIT KANPUR