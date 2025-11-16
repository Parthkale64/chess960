// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    rating: { type: Number, default: 1200 },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);