// models/Room.js
const mongoose = require('mongoose');

const playerSub = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    socketId: { type: String, default: null },
    joinedAt: { type: Date, default: Date.now }
}, { _id: false });

const spectatorSub = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    socketId: { type: String, default: null },
    joinedAt: { type: Date, default: Date.now }
}, { _id: false });

const roomSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true, index: true },
    fen: { type: String, required: true },       // current FEN
    pgn: { type: String, default: '' },          // PGN history
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
    players: {
        w: { type: playerSub, default: () => ({}) },
        b: { type: playerSub, default: () => ({}) }
    },
    spectators: { type: [spectatorSub], default: [] },
    isFinished: { type: Boolean, default: false },
    result: { type: String, default: null },     // optional result string
    meta: { type: mongoose.Schema.Types.Mixed, default: {} } // for extras (time control, variant, etc.)
}, { timestamps: true });

// convenience helper to update fen/pgn atomically
roomSchema.methods.applyMove = function (newFen, newPgn) {
    this.fen = newFen;
    this.pgn = newPgn;
    this.updatedAt = new Date();
    return this.save();
};

module.exports = mongoose.model('Room', roomSchema);