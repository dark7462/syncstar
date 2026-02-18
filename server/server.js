// ─────────────────────────────────────────────────────────
//  Real-Time Multi-Game Platform — Server
//  Express + Socket.io + Mongoose
// ─────────────────────────────────────────────────────────

require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const { nanoid } = require("nanoid");
const Room = require("./models/Room");

// ── App setup ────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

app.use(cors());
app.use(express.json());

// ── In-memory room state (fast lookups) ──────────────────
// Map<roomId, { users: Map<socketId, { id, name }>, drawHistory: [] }>
const rooms = new Map();

// Random display-name generator
const adjectives = [
    "Swift", "Cosmic", "Neon", "Bright", "Silent",
    "Frosted", "Golden", "Pixel", "Vivid", "Shadow",
];
const nouns = [
    "Fox", "Comet", "Wave", "Spark", "Owl",
    "Phoenix", "Tiger", "Star", "Panda", "Falcon",
];

function randomName() {
    const a = adjectives[Math.floor(Math.random() * adjectives.length)];
    const n = nouns[Math.floor(Math.random() * nouns.length)];
    return `${a}${n}`;
}

// Helper: get users list for a room
function getUserList(roomId) {
    const room = rooms.get(roomId);
    if (!room) return [];
    return Array.from(room.users.values());
}

// ── REST endpoints ───────────────────────────────────────
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", rooms: rooms.size });
});

// Get all active rooms (useful for debugging / professor demo)
app.get("/api/rooms", async (_req, res) => {
    try {
        const activeRooms = await Room.find({ isActive: true })
            .select("roomId createdAt chatLogs isActive")
            .sort({ createdAt: -1 });
        res.json(activeRooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific room's chat history from MongoDB
app.get("/api/rooms/:roomId/chats", async (req, res) => {
    try {
        const room = await Room.findOne({ roomId: req.params.roomId });
        if (!room) return res.status(404).json({ error: "Room not found" });
        res.json(room.chatLogs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Socket.io ────────────────────────────────────────────
io.on("connection", (socket) => {
    const userName = randomName();
    console.log(`⚡ ${userName} connected (${socket.id})`);

    // Track which room this socket is in
    let currentRoom = null;

    // ── Create Room ──────────────────────────────────────
    socket.on("create-room", async (callback) => {
        const roomId = nanoid(6).toUpperCase(); // short, friendly code

        // In-memory
        rooms.set(roomId, {
            users: new Map(),
            drawHistory: [],
        });

        // Persist to MongoDB
        try {
            await Room.create({ roomId });
        } catch (err) {
            console.error("MongoDB Room.create error:", err.message);
        }

        console.log(`🏠 Room created: ${roomId}`);
        if (typeof callback === "function") callback({ roomId });
    });

    // ── Join Room ────────────────────────────────────────
    socket.on("join-room", ({ roomId }, callback) => {
        // Create in-memory entry if it doesn't exist yet
        if (!rooms.has(roomId)) {
            rooms.set(roomId, {
                users: new Map(),
                drawHistory: [],
            });
            // Also create in MongoDB (fire-and-forget)
            Room.create({ roomId }).catch(() => { });
        }

        const room = rooms.get(roomId);
        room.users.set(socket.id, { id: socket.id, name: userName });
        currentRoom = roomId;

        socket.join(roomId);

        // Send the existing draw history to the newcomer
        if (typeof callback === "function") {
            callback({
                success: true,
                userName,
                drawHistory: room.drawHistory,
                users: getUserList(roomId),
            });
        }

        // Notify everyone in the room
        io.to(roomId).emit("user-list", getUserList(roomId));
        socket.to(roomId).emit("user-joined", { name: userName });

        console.log(`👤 ${userName} joined room ${roomId}`);
    });

    // ── Drawing ──────────────────────────────────────────
    socket.on("draw", ({ roomId, stroke }) => {
        const room = rooms.get(roomId);
        if (room) {
            room.drawHistory.push(stroke);
            socket.to(roomId).emit("draw", stroke);
        }
    });

    socket.on("clear-canvas", ({ roomId }) => {
        const room = rooms.get(roomId);
        if (room) {
            room.drawHistory = [];
            socket.to(roomId).emit("clear-canvas");
        }
    });

    // ── Chat ─────────────────────────────────────────────
    socket.on("chat-message", async ({ roomId, message }) => {
        const chatEntry = {
            user: userName,
            message,
            timestamp: new Date(),
        };

        // Broadcast to everyone in the room (including sender)
        io.to(roomId).emit("chat-message", chatEntry);

        // Persist to MongoDB
        try {
            await Room.findOneAndUpdate(
                { roomId },
                { $push: { chatLogs: chatEntry } },
                { upsert: true }
            );
        } catch (err) {
            console.error("MongoDB chat save error:", err.message);
        }
    });

    // ── Disconnect ───────────────────────────────────────
    socket.on("disconnect", async () => {
        console.log(`❌ ${userName} disconnected (${socket.id})`);

        if (currentRoom && rooms.has(currentRoom)) {
            const room = rooms.get(currentRoom);
            room.users.delete(socket.id);

            io.to(currentRoom).emit("user-list", getUserList(currentRoom));
            io.to(currentRoom).emit("user-left", { name: userName });

            // If room is empty, mark as inactive
            if (room.users.size === 0) {
                rooms.delete(currentRoom);
                try {
                    await Room.findOneAndUpdate(
                        { roomId: currentRoom },
                        { isActive: false }
                    );
                } catch (err) {
                    console.error("MongoDB room cleanup error:", err.message);
                }
            }
        }
    });
});

// ── MongoDB connection & server start ────────────────────
const PORT = process.env.PORT || 5001;
const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/multigame";

function startServer() {
    server.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
    server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
            console.error(`❌ Port ${PORT} is already in use. Try a different port.`);
        } else {
            console.error("❌ Server error:", err.message);
        }
        process.exit(1);
    });
}

mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log("✅ MongoDB connected");
        startServer();
    })
    .catch((err) => {
        console.error("⚠️  MongoDB connection error:", err.message);
        console.log("   Continuing without MongoDB (in-memory mode)...");
        startServer();
    });

