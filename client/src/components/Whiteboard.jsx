import { useRef, useEffect, useState, useCallback } from "react";
import socket from "../socket";

const COLORS = [
    "#1a1a2e", "#e74c3c", "#e67e22", "#f1c40f",
    "#2ecc71", "#3498db", "#9b59b6", "#ffffff",
];

const LINE_WIDTHS = [2, 4, 8, 14];

function Whiteboard({ roomId, drawHistory }) {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const isDrawing = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });

    const [color, setColor] = useState(COLORS[0]);
    const [lineWidth, setLineWidth] = useState(LINE_WIDTHS[1]);
    const [tool, setTool] = useState("pen"); // pen | eraser

    // ── Initialize canvas ─────────────────────────────
    const initCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const parent = canvas.parentElement;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;

        const ctx = canvas.getContext("2d");
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctxRef.current = ctx;

        // Replay draw history
        if (drawHistory && drawHistory.length > 0) {
            drawHistory.forEach((stroke) => drawStroke(ctx, stroke));
        }
    }, [drawHistory]);

    useEffect(() => {
        initCanvas();

        const handleResize = () => initCanvas();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [initCanvas]);

    // ── Draw a single stroke on context ───────────────
    const drawStroke = (ctx, stroke) => {
        ctx.beginPath();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.lineWidth;
        ctx.globalCompositeOperation =
            stroke.color === "#ffffff" ? "destination-out" : "source-over";
        ctx.moveTo(stroke.prevX, stroke.prevY);
        ctx.lineTo(stroke.x, stroke.y);
        ctx.stroke();
        ctx.globalCompositeOperation = "source-over";
    };

    // ── Listen for remote draw events ─────────────────
    useEffect(() => {
        const handleRemoteDraw = (stroke) => {
            const ctx = ctxRef.current;
            if (ctx) drawStroke(ctx, stroke);
        };

        const handleClear = () => {
            const canvas = canvasRef.current;
            const ctx = ctxRef.current;
            if (canvas && ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        };

        socket.on("draw", handleRemoteDraw);
        socket.on("clear-canvas", handleClear);

        return () => {
            socket.off("draw", handleRemoteDraw);
            socket.off("clear-canvas", handleClear);
        };
    }, []);

    // ── Mouse / touch handlers ────────────────────────
    const getPos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };
    };

    const startDraw = (e) => {
        e.preventDefault();
        isDrawing.current = true;
        const pos = getPos(e);
        lastPos.current = pos;
    };

    const draw = (e) => {
        e.preventDefault();
        if (!isDrawing.current) return;

        const ctx = ctxRef.current;
        const pos = getPos(e);
        const activeColor = tool === "eraser" ? "#ffffff" : color;

        const stroke = {
            prevX: lastPos.current.x,
            prevY: lastPos.current.y,
            x: pos.x,
            y: pos.y,
            color: activeColor,
            lineWidth: tool === "eraser" ? lineWidth * 3 : lineWidth,
        };

        drawStroke(ctx, stroke);
        socket.emit("draw", { roomId, stroke });
        lastPos.current = pos;
    };

    const stopDraw = () => {
        isDrawing.current = false;
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            socket.emit("clear-canvas", { roomId });
        }
    };

    return (
        <div className="w-full h-full flex flex-col">
            {/* ── Toolbar ──────────────────────────────────── */}
            <div className="h-12 flex items-center gap-3 px-4 border-b border-gray-100 bg-white/60 backdrop-blur-sm">
                {/* Tool buttons */}
                <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                    <button
                        onClick={() => setTool("pen")}
                        className={`p-1.5 rounded-md transition-all text-xs font-medium ${tool === "pen"
                                ? "bg-white shadow text-primary-600"
                                : "text-gray-400 hover:text-gray-600"
                            }`}
                        title="Pen"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setTool("eraser")}
                        className={`p-1.5 rounded-md transition-all text-xs font-medium ${tool === "eraser"
                                ? "bg-white shadow text-primary-600"
                                : "text-gray-400 hover:text-gray-600"
                            }`}
                        title="Eraser"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-gray-200" />

                {/* Colors */}
                <div className="flex items-center gap-1.5">
                    {COLORS.map((c) => (
                        <button
                            key={c}
                            onClick={() => { setColor(c); setTool("pen"); }}
                            className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${color === c && tool === "pen"
                                    ? "border-primary-400 scale-110 shadow"
                                    : "border-gray-200"
                                }`}
                            style={{ backgroundColor: c }}
                            title={c}
                        />
                    ))}
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-gray-200" />

                {/* Line widths */}
                <div className="flex items-center gap-1.5">
                    {LINE_WIDTHS.map((w) => (
                        <button
                            key={w}
                            onClick={() => setLineWidth(w)}
                            className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all ${lineWidth === w
                                    ? "bg-gray-100 ring-1 ring-primary-300"
                                    : "hover:bg-gray-50"
                                }`}
                            title={`${w}px`}
                        >
                            <div
                                className="rounded-full bg-gray-700"
                                style={{ width: w + 2, height: w + 2 }}
                            />
                        </button>
                    ))}
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Clear */}
                <button
                    onClick={clearCanvas}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                >
                    Clear Canvas
                </button>
            </div>

            {/* ── Canvas ───────────────────────────────────── */}
            <div className="flex-1 relative bg-white overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 canvas-crosshair"
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={stopDraw}
                />
            </div>
        </div>
    );
}

export default Whiteboard;
