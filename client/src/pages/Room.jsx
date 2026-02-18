import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../socket";
import Whiteboard from "../components/Whiteboard";
import Chat from "../components/Chat";
import UserList from "../components/UserList";

function Room() {
    const { roomId } = useParams();
    const navigate = useNavigate();

    const [userName, setUserName] = useState("");
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [drawHistory, setDrawHistory] = useState([]);
    const [joined, setJoined] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [copied, setCopied] = useState(false);

    // Join the room on mount
    useEffect(() => {
        socket.emit(
            "join-room",
            { roomId },
            ({ success, userName: name, drawHistory: history, users: userList }) => {
                if (success) {
                    setUserName(name);
                    setDrawHistory(history || []);
                    setUsers(userList || []);
                    setJoined(true);
                }
            }
        );

        // Listen for updates
        socket.on("user-list", (list) => setUsers(list));

        socket.on("chat-message", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        socket.on("user-joined", ({ name }) => {
            setMessages((prev) => [
                ...prev,
                { user: "System", message: `${name} joined the room`, timestamp: new Date(), system: true },
            ]);
        });

        socket.on("user-left", ({ name }) => {
            setMessages((prev) => [
                ...prev,
                { user: "System", message: `${name} left the room`, timestamp: new Date(), system: true },
            ]);
        });

        return () => {
            socket.off("user-list");
            socket.off("chat-message");
            socket.off("user-joined");
            socket.off("user-left");
        };
    }, [roomId]);

    const handleSend = useCallback(
        (text) => {
            if (!text.trim()) return;
            socket.emit("chat-message", { roomId, message: text.trim() });
        },
        [roomId]
    );

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLeave = () => {
        navigate("/");
    };

    if (!joined) {
        return (
            <div className="min-h-screen gradient-bg-subtle flex items-center justify-center">
                <div className="glass-card rounded-2xl p-10 text-center animate-pulse-soft">
                    <div className="w-10 h-10 rounded-full gradient-bg mx-auto mb-4 animate-spin" style={{ animationDuration: "1.5s" }} />
                    <p className="text-gray-500 font-medium">Joining room…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50/50">
            {/* ── Top Bar ──────────────────────────────────── */}
            <header className="h-14 flex items-center justify-between px-4 border-b border-gray-100 bg-white/80 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleLeave}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                        title="Leave room"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>

                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">▶</span>
                        </div>
                        <span className="font-semibold text-gray-700 text-sm">
                            Play<span className="text-primary-600">Sync</span>
                        </span>
                    </div>
                </div>

                {/* Room ID badge */}
                <button
                    onClick={copyRoomId}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all group"
                >
                    <span className="text-xs text-gray-400 font-medium">ROOM</span>
                    <span className="font-mono text-sm font-bold text-gray-700 tracking-wider group-hover:text-primary-600 transition-colors">
                        {roomId}
                    </span>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    {copied && (
                        <span className="text-xs text-green-500 font-medium animate-fade-in">Copied!</span>
                    )}
                </button>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                        You are <span className="font-semibold text-primary-600">{userName}</span>
                    </span>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                        title="Toggle sidebar"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* ── Main Content ─────────────────────────────── */}
            <div className="flex-1 flex overflow-hidden">
                {/* Whiteboard */}
                <div className="flex-1 relative">
                    <Whiteboard roomId={roomId} drawHistory={drawHistory} />
                </div>

                {/* Sidebar */}
                {sidebarOpen && (
                    <aside className="w-80 border-l border-gray-100 bg-white flex flex-col animate-fade-in">
                        {/* User list */}
                        <UserList users={users} currentUser={userName} />

                        {/* Divider */}
                        <div className="border-t border-gray-100" />

                        {/* Chat */}
                        <Chat
                            messages={messages}
                            onSend={handleSend}
                            currentUser={userName}
                        />
                    </aside>
                )}
            </div>
        </div>
    );
}

export default Room;
