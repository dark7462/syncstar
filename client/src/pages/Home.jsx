import { useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";

function Home() {
    const [joinId, setJoinId] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleCreate = () => {
        setIsCreating(true);
        setError("");
        socket.emit("create-room", ({ roomId }) => {
            setIsCreating(false);
            navigate(`/room/${roomId}`);
        });
    };

    const handleJoin = (e) => {
        e.preventDefault();
        const id = joinId.trim().toUpperCase();
        if (!id) {
            setError("Please enter a Room ID");
            return;
        }
        navigate(`/room/${id}`);
    };

    return (
        <div className="min-h-screen gradient-bg-subtle flex flex-col">
            {/* ── Nav ───────────────────────────────────────── */}
            <nav className="w-full px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary-500/25">
                        <span className="text-white text-lg font-bold">▶</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-gray-800">
                        Play<span className="text-primary-600">Sync</span>
                    </span>
                </div>
                <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                    Built with MERN + Socket.io
                </a>
            </nav>

            {/* ── Hero ──────────────────────────────────────── */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20 animate-fade-in">
                {/* Floating orbs (decorative) */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl -z-10 float-animation" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl -z-10 float-animation" style={{ animationDelay: "1.5s" }} />

                <div className="text-center mb-12 animate-slide-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium mb-6">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-soft" />
                        Real-time multiplayer — no sign-up needed
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
                        Draw, Chat &<br />
                        <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                            Play Together
                        </span>
                    </h1>
                    <p className="mt-5 text-lg md:text-xl text-gray-500 max-w-lg mx-auto leading-relaxed">
                        Create a room, share the code with friends, and collaborate on a whiteboard in real time.
                    </p>
                </div>

                {/* ── Action Cards ────────────────────────────── */}
                <div className="flex flex-col sm:flex-row gap-5 w-full max-w-xl animate-slide-up" style={{ animationDelay: "0.2s" }}>
                    {/* Create Room */}
                    <button
                        onClick={handleCreate}
                        disabled={isCreating}
                        className="flex-1 group glass-card rounded-2xl p-8 text-center hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 hover:border-primary-200"
                    >
                        <div className="w-14 h-14 rounded-2xl gradient-bg mx-auto mb-4 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:scale-110 transition-transform">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-1">
                            {isCreating ? "Creating…" : "Create Room"}
                        </h2>
                        <p className="text-sm text-gray-400">
                            Start a new room &amp; invite friends
                        </p>
                    </button>

                    {/* Join Room */}
                    <form
                        onSubmit={handleJoin}
                        className="flex-1 glass-card rounded-2xl p-8 text-center hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 border border-gray-100 hover:border-purple-200"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-purple-500/25">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">
                            Join Room
                        </h2>
                        <input
                            type="text"
                            value={joinId}
                            onChange={(e) => {
                                setJoinId(e.target.value.toUpperCase());
                                setError("");
                            }}
                            placeholder="Enter Room ID"
                            maxLength={10}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 text-center text-lg font-mono tracking-widest placeholder:text-gray-300 placeholder:tracking-normal placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300 transition-all"
                        />
                        {error && (
                            <p className="text-red-400 text-sm mt-2">{error}</p>
                        )}
                        <button
                            type="submit"
                            className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-md shadow-purple-500/20"
                        >
                            Join →
                        </button>
                    </form>
                </div>
            </main>

            {/* ── Footer ────────────────────────────────────── */}
            <footer className="text-center py-6 text-xs text-gray-300">
                MERN Stack &bull; Socket.io &bull; Real-Time Collaboration
            </footer>
        </div>
    );
}

export default Home;
