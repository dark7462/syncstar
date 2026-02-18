import { io } from "socket.io-client";

// Connect to the backend server
// In development, Vite proxy handles /socket.io requests
// In production, set VITE_SERVER_URL environment variable
const SERVER_URL =
    import.meta.env.VITE_SERVER_URL || "http://localhost:5001";

const socket = io(SERVER_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

export default socket;
