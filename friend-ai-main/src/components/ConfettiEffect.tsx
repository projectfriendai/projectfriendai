import React, { useEffect, useRef } from "react";

interface ConfettiEffectProps {
  triggerKey: number;
}

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: "circle" | "square" | "triangle" | "star";
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  scaleY: number; // for 3D spin effect
  scaleYSpeed: number;
}

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ triggerKey }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Festive, sophisticated Indian art & botanical-inspired color palette
  const colors = [
    "#ca8a04", // Chittara Gold
    "#db7093", // Botanical Rose
    "#22c55e", // Sufi Emerald
    "#0ea5e9", // Narmada Turquoise
    "#6366f1", // Cosmic Indigo
    "#f97316", // Rogan Coral
    "#ec4899", // Fuchsia Pink
    "#a855f7", // Royal Amethyst
  ];

  const shapes: Array<"circle" | "square" | "triangle" | "star"> = [
    "circle",
    "square",
    "triangle",
    "star",
  ];

  const initParticles = (width: number, height: number) => {
    const list: ConfettiParticle[] = [];

    // Left Cannon Burst
    for (let i = 0; i < 75; i++) {
      list.push(createParticle(0, height - 20, "left"));
    }

    // Right Cannon Burst
    for (let i = 0; i < 75; i++) {
      list.push(createParticle(width, height - 20, "right"));
    }

    // Center Fountain Burst
    for (let i = 0; i < 60; i++) {
      list.push(createParticle(width / 2, height - 10, "center"));
    }

    particlesRef.current = list;
  };

  const createParticle = (
    startX: number,
    startY: number,
    type: "left" | "right" | "center"
  ): ConfettiParticle => {
    let vx = 0;
    let vy = 0;

    if (type === "left") {
      // Shoot up and right
      vx = Math.random() * 12 + 6;
      vy = -(Math.random() * 16 + 10);
    } else if (type === "right") {
      // Shoot up and left
      vx = -(Math.random() * 12 + 6);
      vy = -(Math.random() * 16 + 10);
    } else {
      // Shoot straight up slightly fanned out
      vx = (Math.random() - 0.5) * 8;
      vy = -(Math.random() * 14 + 12);
    }

    return {
      x: startX,
      y: startY,
      vx,
      vy,
      size: Math.random() * 7 + 6, // 6px - 13px
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      opacity: 1,
      scaleY: Math.random(),
      scaleYSpeed: Math.random() * 0.1 + 0.05,
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const updateSize = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    updateSize();

    // Trigger burst
    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;
    initParticles(width, height);

    // Resize observer to scale coordinates dynamically
    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(parent);

    return () => {
      resizeObserver.disconnect();
    };
  }, [triggerKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      // Clear with absolute transparency
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Apply physics
        p.vy += 0.35; // Gravity pull
        p.vx *= 0.98; // Air resistance / friction
        p.vy *= 0.98; 
        p.x += p.vx;
        p.y += p.vy;

        p.rotation += p.rotationSpeed;
        p.scaleY += p.scaleYSpeed;
        if (p.scaleY > 1 || p.scaleY < -1) {
          p.scaleYSpeed = -p.scaleYSpeed;
        }

        // Fade out as they fall below screen or age
        if (p.y > height - 80) {
          p.opacity -= 0.015;
        } else {
          p.opacity -= 0.002;
        }

        if (p.opacity <= 0) {
          particles.splice(i, 1);
          continue;
        }

        // Draw particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(1, p.scaleY);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        ctx.beginPath();
        if (p.shape === "circle") {
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "square") {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else if (p.shape === "triangle") {
          ctx.moveTo(0, -p.size / 2);
          ctx.lineTo(p.size / 2, p.size / 2);
          ctx.lineTo(-p.size / 2, p.size / 2);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === "star") {
          // Draw standard 5-point star
          const spikes = 5;
          const outerRadius = p.size / 2;
          const innerRadius = p.size / 4;
          let rot = (Math.PI / 2) * 3;
          let cx = 0;
          let cy = 0;
          const step = Math.PI / spikes;

          ctx.moveTo(cx, cy - outerRadius);
          for (let s = 0; s < spikes; s++) {
            cx = Math.cos(rot) * outerRadius;
            cy = Math.sin(rot) * outerRadius;
            ctx.lineTo(cx, cy);
            rot += step;

            cx = Math.cos(rot) * innerRadius;
            cy = Math.sin(rot) * innerRadius;
            ctx.lineTo(cx, cy);
            rot += step;
          }
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      if (particles.length > 0) {
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [triggerKey]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-50 overflow-hidden rounded-2xl"
    />
  );
};
