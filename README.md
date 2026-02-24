# 🎮 SyncStar — Real-Time Multi-Game Platform

A MERN stack real-time multiplayer platform built with **MongoDB, Express, React, Node.js**, and **Socket.io**. Create a room, share the code with friends, and collaborate on a whiteboard — no sign-up required.

![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue)
![Socket.io](https://img.shields.io/badge/Real--Time-Socket.io-green)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-purple)

---

## ✨ Features

- **Instant Rooms** — Generate a unique room code and share it. No login needed.
- **Collaborative Whiteboard** — Draw together in real-time with pen/eraser tools, colors, and line widths.
- **Live Chat** — Chat with everyone in your room. Messages are persisted to MongoDB.
- **User Presence** — See who's in the room with colorful avatars and online indicators.
- **Responsive UI** — Clean, modern, Apple-esque design with glassmorphism effects.

---

## 🏗️ Tech Stack

| Layer      | Technology                 |
|------------|---------------------------|
| Frontend   | React 19 (Vite), Tailwind CSS, React Router |
| Backend    | Node.js, Express          |
| Real-Time  | Socket.io                 |
| Database   | MongoDB (Mongoose)        |

---

## 📁 Project Structure

```
mern-project/
├── server/               # Node.js backend
│   ├── server.js         # Express + Socket.io server
│   ├── models/Room.js    # Mongoose model
│   ├── .env              # Environment variables
│   └── package.json
├── client/               # React frontend
│   ├── src/
│   │   ├── pages/        # Home, Room pages
│   │   ├── components/   # Whiteboard, Chat, UserList
│   │   ├── socket.js     # Socket.io client
│   │   └── App.jsx       # Router setup
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas URI

### 1. Clone & Install

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment

Edit `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/multigame
CLIENT_URL=http://localhost:5173
```

### 3. Run Locally

Open **two terminals**:

```bash
# Terminal 1 — Start backend
cd server
npm run dev

# Terminal 2 — Start frontend
cd client
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:5000](http://localhost:5000)

### 4. Test It

1. Open [http://localhost:5173](http://localhost:5173) in your browser
2. Click **Create Room** → you'll be taken to the room
3. Copy the room code from the top bar
4. Open a **second browser tab** and click **Join Room** → paste the code
5. Both tabs should see each other in the user list
6. Draw on the whiteboard — it syncs in real-time!
7. Send chat messages — they appear for everyone

---

## 🗄️ MongoDB Usage

The app stores:
- **Room documents** — Room ID, creation time, active status
- **Chat logs** — All messages with user name, message, and timestamp

You can view stored data using MongoDB Compass or the shell:

```bash
mongosh
use multigame
db.rooms.find().pretty()
```

REST API endpoints for room/chat history:
- `GET /api/rooms` — List all active rooms
- `GET /api/rooms/:roomId/chats` — Get chat logs for a room

---

## 🌐 Deployment

| Service    | Frontend (React) | Backend (Node + Socket.io) |
|------------|-----------------|---------------------------|
| Recommended | **Vercel**      | **Render** or **Railway**  |

> ⚠️ **Important**: Vercel only supports serverless functions. WebSockets need a persistent server, so the backend must be deployed on a platform that supports long-lived connections (Render, Railway, Fly.io, etc.).

---

## 📝 License

MIT — Built for academic purposes.
# syncstar
