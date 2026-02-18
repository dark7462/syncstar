// Generate a consistent color for a user name
function nameToColor(name) {
    const colors = [
        "bg-red-400",
        "bg-orange-400",
        "bg-amber-400",
        "bg-emerald-400",
        "bg-teal-400",
        "bg-cyan-400",
        "bg-blue-400",
        "bg-indigo-400",
        "bg-violet-400",
        "bg-pink-400",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

function UserList({ users, currentUser }) {
    return (
        <div className="px-4 py-3">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                </svg>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Players
                </span>
                <span className="ml-auto text-xs text-gray-300 font-medium">
                    {users.length}
                </span>
            </div>

            {/* User list */}
            <div className="space-y-1.5">
                {users.map((u) => (
                    <div
                        key={u.id}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        {/* Avatar */}
                        <div
                            className={`w-8 h-8 rounded-full ${nameToColor(
                                u.name
                            )} flex items-center justify-center text-white text-xs font-bold shadow-sm`}
                        >
                            {u.name.slice(0, 2).toUpperCase()}
                        </div>

                        {/* Name */}
                        <span className="text-sm font-medium text-gray-700 flex-1 truncate">
                            {u.name}
                            {u.name === currentUser && (
                                <span className="ml-1.5 text-[10px] text-primary-500 font-semibold">
                                    (you)
                                </span>
                            )}
                        </span>

                        {/* Online dot */}
                        <div className="w-2 h-2 rounded-full bg-green-400 shadow-sm shadow-green-400/50" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UserList;
