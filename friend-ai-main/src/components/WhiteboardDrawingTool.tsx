import React, { useRef, useState, useEffect } from "react";
import { Paintbrush, Eraser, Trash2, CheckCircle2 } from "lucide-react";

interface WhiteboardDrawingToolProps {
  themeClass: (light: string, dark: string, sepia: string) => string;
  onPublish: (drawingDataUrl: string, color: string) => void;
}

export const WhiteboardDrawingTool: React.FC<WhiteboardDrawingToolProps> = ({
  themeClass,
  onPublish,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#a855f7"); // Purple default
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Brush colors selection mapping
  const paletteColors = [
    { name: "purple", value: "#a855f7", label: "Purple" },
    { name: "pink", value: "#ec4899", label: "Pink" },
    { name: "blue", value: "#0ea5e9", label: "Blue" },
    { name: "green", value: "#10b981", label: "Green" },
    { name: "orange", value: "#f97316", label: "Orange" },
    { name: "dark", value: "#1e293b", label: "Dark" },
  ];

  // Map drawing color to closest sticky note color shade
  const getStickyColorName = (hex: string): string => {
    if (hex === "#ec4899") return "pink";
    if (hex === "#10b981") return "green";
    if (hex === "#0ea5e9") return "blue";
    return "yellow"; // default yellow
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set background of canvas to white so transparent parts don't look weird
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Standard draw functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getEventCoords(e, canvas);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = isEraser ? "#ffffff" : brushColor;

    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Prevent scrolling when drawing on touchscreen
    if (e.cancelable) {
      e.preventDefault();
    }

    const coords = getEventCoords(e, canvas);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getEventCoords = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ): { x: number; y: number } => {
    const rect = canvas.getBoundingClientRect();
    
    // Scale coordinates accurately if CSS width/height differs from canvas resolution
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      const touch = e.touches[0];
      return {
        x: ((touch.clientX - rect.left) / rect.width) * canvas.width,
        y: ((touch.clientY - rect.top) / rect.height) * canvas.height,
      };
    } else {
      return {
        x: ((e.clientX - rect.left) / rect.width) * canvas.width,
        y: ((e.clientY - rect.top) / rect.height) * canvas.height,
      };
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handlePublish = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    // Extract canvas drawing to base64 jpeg or png
    const dataUrl = canvas.toDataURL("image/png");
    // Trigger onPublish
    const stickyColor = getStickyColorName(brushColor);
    onPublish(dataUrl, stickyColor);

    // Reset
    clearCanvas();
  };

  return (
    <div className="flex flex-col gap-3.5 w-full font-sans">
      {/* Mini Sketchpad container */}
      <div className="relative border rounded-xl overflow-hidden shadow-inner bg-white border-slate-200">
        <canvas
          ref={canvasRef}
          width={320}
          height={180}
          className="w-full h-[180px] bg-white cursor-crosshair touch-none block"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        
        {!hasDrawn && (
          <div className="absolute inset-0 flex items-center justify-center text-center pointer-events-none p-4 select-none">
            <p className="text-[10px] text-slate-400 font-medium">
              🎨 Draw something supportive here with your mouse or touchscreen!
            </p>
          </div>
        )}
      </div>

      {/* Toolbar controls */}
      <div className={`p-2.5 rounded-lg border flex flex-col gap-2.5 text-xs text-left ${themeClass("bg-slate-100/65", "bg-black/50", "bg-[#ebdcb9]/40")}`}>
        {/* Colors selector */}
        <div className="flex flex-col gap-1">
          <label className="text-[9.5px] font-bold font-mono uppercase tracking-wider text-slate-400">Brush Color</label>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {paletteColors.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => {
                  setBrushColor(color.value);
                  setIsEraser(false);
                }}
                className={`w-6 h-6 rounded-full border transition-transform cursor-pointer relative flex items-center justify-center ${
                  brushColor === color.value && !isEraser ? "scale-110 shadow-sm" : "scale-100"
                }`}
                style={{ backgroundColor: color.value, borderColor: "rgba(0,0,0,0.15)" }}
                title={color.label}
              >
                {brushColor === color.value && !isEraser && (
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Thickness & Mode Tools row */}
        <div className="flex items-center justify-between gap-4 border-t pt-2 border-black/5 dark:border-white/5">
          {/* Thickness selection */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold font-mono tracking-wider text-slate-400 uppercase">Brush Size</span>
            <div className="flex gap-2">
              {[2, 4, 8].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setBrushSize(size)}
                  className={`w-5 h-5 rounded-md flex items-center justify-center border text-[9.5px] font-mono font-bold transition-all ${
                    brushSize === size 
                      ? "bg-[#0a0a0a] text-white border-slate-950 dark:bg-slate-250 dark:text-slate-900" 
                      : "bg-white text-slate-600 border-slate-205 hover:bg-slate-50 dark:bg-black dark:text-slate-300"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons (Eraser, Clear) */}
          <div className="flex gap-1.5 items-end self-end">
            <button
              type="button"
              onClick={() => setIsEraser(prev => !prev)}
              className={`p-1.5 rounded-lg border flex items-center gap-1 text-[10px] font-bold transition-colors cursor-pointer ${
                isEraser 
                  ? "bg-amber-100 border-amber-305 text-amber-800" 
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-black/60 dark:border-white/10 dark:text-slate-300"
              }`}
              title="Eraser tool"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Eraser</span>
            </button>

            <button
              type="button"
              onClick={clearCanvas}
              className="p-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-600 transition-colors text-[10px] font-bold cursor-pointer"
              title="Clear canvas"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Spawning Button */}
      <button
        type="button"
        onClick={handlePublish}
        disabled={!hasDrawn}
        className={`w-full py-2 px-4 rounded-xl text-xs font-bold font-sans cursor-pointer transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm ${
          hasDrawn
            ? "bg-[#cd853f] text-white hover:bg-[#b07234] hover:scale-[1.01]"
            : "bg-slate-200/60 text-slate-450 border border-slate-200 cursor-not-allowed"
        }`}
      >
        <Paintbrush className="w-3.5 h-3.5" />
        <span>Pin My Drawing 🌟</span>
      </button>
    </div>
  );
};
