import { useState, useRef, useEffect } from "react";

function Chat({ messages, onSend, currentUser }) {
    const [input, setInput] = useState("");
    const scrollRef = useRef(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        onSend(input);
        setInput("");
    };

    const formatTime = (ts) => {
        const d = new Date(ts);
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="flex-1 flex flex-col min-h-0">
            {/* Header */}
            <div className="px-4 py-3 flex items-center gap-2">
                <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                </svg>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Chat
                </span>
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 space-y-3 pb-3"
            >
                {messages.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-xs text-gray-300">No messages yet</p>
                        <p className="text-xs text-gray-300">Say hello 👋</p>
                    </div>
                )}

                {messages.map((msg, i) =>
                    msg.system ? (
                        // System message
                        <div key={i} className="text-center">
                            <span className="text-[11px] text-gray-300 bg-gray-50 px-3 py-1 rounded-full">
                                {msg.message}
                            </span>
                        </div>
                    ) : (
                        // User message
                        <div
                            key={i}
                            className={`flex flex-col ${msg.user === currentUser ? "items-end" : "items-start"
                                }`}
                        >
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[11px] font-medium text-gray-400">
                                    {msg.user === currentUser ? "You" : msg.user}
                                </span>
                                <span className="text-[10px] text-gray-300">
                                    {formatTime(msg.timestamp)}
                                </span>
                            </div>
                            <div
                                className={`max-w-[85%] px-3.5 py-2 text-sm ${msg.user === currentUser
                                        ? "chat-bubble-self bg-primary-500 text-white"
                                        : "chat-bubble bg-gray-100 text-gray-700"
                                    }`}
                            >
                                {msg.message}
                            </div>
                        </div>
                    )
                )}
            </div>

            {/* Input */}
            <form
                onSubmit={handleSubmit}
                className="p-3 border-t border-gray-100 flex items-center gap-2"
            >
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message…"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-300 transition-all"
                />
                <button
                    type="submit"
                    disabled={!input.trim()}
                    className="p-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm shadow-primary-500/20"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                    </svg>
                </button>
            </form>
        </div>
    );
}

export default Chat;
