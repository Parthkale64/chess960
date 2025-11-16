// server.js (updated for Mongo-persisted rooms)
require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const User = require('./models/User');
const Room = require('./models/Room');
const { Chess } = require('chess.js');

const app = express();
const server = http.createServer(app);

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_secret';

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

// --- Auth REST endpoints (same as before) ---
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) return res.status(409).json({ message: 'User already exists' });
        const hash = await bcrypt.hash(password, 10);
        const user = new User({ name, email: email.toLowerCase(), password: hash });
        await user.save();
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, email: user.email, name: user.name, rating: user.rating } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, email: user.email, name: user.name, rating: user.rating } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/me', async (req, res) => {
    try {
        const header = req.headers.authorization;
        if (!header) return res.status(401).json({ message: 'No token' });
        const token = header.split(' ')[1];
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(payload.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ user });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// --- Socket.io realtime multiplayer (Mongo-backed rooms) ---
const io = new Server(server, {
    cors: { origin: CLIENT_ORIGIN, methods: ['GET', 'POST'] }
});

// We'll keep a tiny socket->room cache to quickly map socket to roomId (not authoritative)
const socketRoomMap = new Map();

// Helper: create a new room document seeded with initial chess position (FEN from chess.js)
async function createRoomDoc(roomId, options = {}) {
    const g = new Chess(); // standard starting position; if you want Chess960 generate variant FEN here
    const doc = new Room({
        roomId,
        fen: g.fen(),
        pgn: g.pgn(),
        meta: options.meta || {}
    });
    await doc.save();
    return doc;
}

io.use((socket, next) => {
    // allow optional auth through handshake (auth.token)
    const token = socket.handshake.auth?.token;
    if (!token) return next();
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        socket.userId = payload.id;
    } catch (e) {
        // ignore invalid token (guest)
    }
    return next();
});

io.on('connection', (socket) => {
    console.log('socket connected', socket.id, 'user', socket.userId);

    // Create a room (persisted)
    socket.on('createRoom', async ({ roomId }, cb) => {
        try {
            if (!roomId) roomId = Math.random().toString(36).slice(2, 8);
            // ensure uniqueness: if exists, return error
            const existing = await Room.findOne({ roomId });
            if (existing) return cb && cb({ ok: false, message: 'Room exists' });

            const roomDoc = await createRoomDoc(roomId);
            cb && cb({ ok: true, roomId: roomDoc.roomId });
        } catch (err) {
            console.error('createRoom err', err);
            cb && cb({ ok: false, message: 'Server error' });
        }
    });

    // Join a room (adds player or spectator and returns fen/pgn)
    socket.on('joinRoom', async ({ roomId }, cb) => {
        try {
            const room = await Room.findOne({ roomId });
            if (!room) return cb && cb({ ok: false, message: 'Room not found' });

            // Determine role
            let role = 'spectator';
            // prefer to assign authenticated userId; otherwise use null userId
            if (!room.players.w || !room.players.w.socketId) {
                room.players.w = { userId: socket.userId || null, socketId: socket.id, joinedAt: new Date() };
                role = 'w';
            } else if (!room.players.b || !room.players.b.socketId) {
                room.players.b = { userId: socket.userId || null, socketId: socket.id, joinedAt: new Date() };
                role = 'b';
            } else {
                // add spectator entry
                room.spectators.push({ userId: socket.userId || null, socketId: socket.id, joinedAt: new Date() });
            }

            await room.save();

            socket.join(roomId);
            socket.data.roomId = roomId;
            socket.data.role = role;
            socketRoomMap.set(socket.id, roomId);

            cb && cb({ ok: true, role, fen: room.fen, pgn: room.pgn });

            // notify other sockets of room update (we send minimal info)
            io.to(roomId).emit('roomUpdate', {
                roomId: room.roomId,
                players: {
                    w: room.players.w ? { socketId: room.players.w.socketId, userId: room.players.w.userId } : null,
                    b: room.players.b ? { socketId: room.players.b.socketId, userId: room.players.b.userId } : null
                },
                spectatorsCount: room.spectators.length
            });
        } catch (err) {
            console.error('joinRoom err', err);
            cb && cb({ ok: false, message: 'Server error' });
        }
    });

    // Make a move: fetch room, validate with chess.js, update DB, broadcast
    socket.on('makeMove', async ({ roomId, from, to, promotion }, cb) => {
        try {
            const room = await Room.findOne({ roomId });
            if (!room) return cb && cb({ ok: false, message: 'Room not found' });
            if (room.isFinished) return cb && cb({ ok: false, message: 'Game is finished' });

            // figure out role of this socket in DB (safer than trusting socket.data)
            const socketRole =
                room.players.w && room.players.w.socketId === socket.id ? 'w' :
                    room.players.b && room.players.b.socketId === socket.id ? 'b' : null;

            if (!socketRole) return cb && cb({ ok: false, message: 'Not a player' });

            // load chess game from stored PGN/FEN using chess.js
            const g = new Chess(room.fen); // initialize from stored fen
            // optional extra: verify turn
            const turn = g.turn() === 'w' ? 'w' : 'b';
            if (turn !== socketRole) return cb && cb({ ok: false, message: "Not your turn" });

            const move = g.move({ from, to, promotion: promotion || 'q' });
            if (!move) return cb && cb({ ok: false, message: 'Invalid move' });

            // Update room document with new fen & pgn and updatedAt
            room.fen = g.fen();
            room.pgn = g.pgn();
            room.updatedAt = new Date();

            // check game over
            if (g.isGameOver()) {
                room.isFinished = true;
                // store a simple result string (caller can refine)
                if (g.isCheckmate()) {
                    room.result = `${socketRole} wins by checkmate`;
                } else if (g.isDraw()) {
                    room.result = 'draw';
                } else {
                    room.result = 'gameover';
                }
            }

            await room.save();

            // broadcast move to everyone in room
            io.to(roomId).emit('moveMade', { fen: room.fen, pgn: room.pgn, san: move.san });

            if (room.isFinished) {
                io.to(roomId).emit('gameOver', { result: room.result });
            }

            cb && cb({ ok: true });
        } catch (err) {
            console.error('makeMove err', err);
            cb && cb({ ok: false, message: 'Server error' });
        }
    });

    // Handle disconnect: remove socket entries (but keep room doc; mark player socket empty)
    socket.on('disconnect', async () => {
        try {
            const rid = socketRoomMap.get(socket.id) || socket.data.roomId;
            if (!rid) {
                socketRoomMap.delete(socket.id);
                return;
            }
            const room = await Room.findOne({ roomId: rid });
            if (!room) {
                socketRoomMap.delete(socket.id);
                return;
            }

            let changed = false;
            if (room.players.w && room.players.w.socketId === socket.id) {
                room.players.w.socketId = null;
                changed = true;
            }
            if (room.players.b && room.players.b.socketId === socket.id) {
                room.players.b.socketId = null;
                changed = true;
            }
            // remove spectator entry for this socket
            const before = room.spectators.length;
            room.spectators = room.spectators.filter(s => s.socketId !== socket.id);
            if (room.spectators.length !== before) changed = true;

            if (changed) {
                room.updatedAt = new Date();
                await room.save();
            }

            // broadcast updated room meta
            io.to(rid).emit('roomUpdate', {
                roomId: room.roomId,
                players: {
                    w: room.players.w ? { socketId: room.players.w.socketId, userId: room.players.w.userId } : null,
                    b: room.players.b ? { socketId: room.players.b.socketId, userId: room.players.b.userId } : null
                },
                spectatorsCount: room.spectators.length
            });

            socketRoomMap.delete(socket.id);

            // Optionally: if both players empty and no spectators, you can schedule removal after TTL.
            // For now we keep the room doc to allow rejoining.
        } catch (err) {
            console.error('disconnect cleanup err', err);
            socketRoomMap.delete(socket.id);
        }
    });
});

const PORT = process.env.PORT || 4000;
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        server.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
    })
    .catch(err => console.error('Mongo connection error', err));