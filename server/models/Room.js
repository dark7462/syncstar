const mongoose = require("mongoose");

// Schema for individual chat messages
const chatMessageSchema = new mongoose.Schema({
    user: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

// Schema for a game room
const roomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    chatLogs: [chatMessageSchema],
    isActive: {
        type: Boolean,
        default: true,
    },
});

module.exports = mongoose.model("Room", roomSchema);
