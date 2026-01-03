const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, uppercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['driver', 'admin', 'officer', 'station'], required: true },
    createdBy: { type: String }, // admin user who created
    lockedUntil: { type: Date }, // lockout timer
    loginAttempts: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
