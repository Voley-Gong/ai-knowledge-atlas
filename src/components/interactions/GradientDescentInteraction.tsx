'use client';

import { useRef, useEffect, useState } from 'react';

// Simple 2D loss landscape
function lossAt(x: number, y: number): number {
  return 0.5 * (x * x + 3 * y * y + x * y);
}

function gradAt(x: number, y: number): [number, number] {
  return [x + 0.5 * y, 6 * y + 0.5 * x];
}

export default function GradientDescentInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lr, setLr] = useState(0.15);
  const [ballPos, setBallPos] = useState<[number, number]>([1.5, 1.2]);
  const [trail, setTrail] = useState<[number, number][]>([[1.5, 1.2]]);
  const [running, setRunning] = useState(false);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setBallPos(([x, y]) => {
        const [gx, gy] = gradAt(x, y);
        const nx = x - lr * gx;
        const ny = y - lr * gy;
        const clamped: [number, number] = [
          Math.max(-2, Math.min(2, nx)),
          Math.max(-2, Math.min(2, ny)),
        ];
        setTrail(prev => [...prev, clamped]);
        return clamped;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [running, lr]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const pad = 15;
    const size = Math.min(rect.width, rect.height) - pad * 2 - 30;
    const ox = (rect.width - size) / 2;
    const oy = 15;

    function toScreen(x: number, y: number): [number, number] {
      return [ox + (x + 2) / 4 * size, oy + (y + 2) / 4 * size];
    }

    // Draw contour map
    const resolution = 60;
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const x = -2 + (i / resolution) * 4;
        const y = -2 + (j / resolution) * 4;
        const l = lossAt(x, y);
        const [sx, sy] = toScreen(x, y);
        const cellW = 4 / resolution * size;
        const intensity = Math.min(1, l / 8);

        // Color: low loss = dark blue, high loss = lighter
        const r = Math.round(10 + intensity * 30);
        const g = Math.round(14 + intensity * 20);
        const b = Math.round(26 + intensity * 60);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(sx, sy, cellW + 1, cellW + 1);
      }
    }

    // Contour lines
    const levels = [0.2, 0.5, 1, 2, 4, 6];
    ctx.lineWidth = 0.5;
    levels.forEach(level => {
      ctx.strokeStyle = '#33415560';
      ctx.beginPath();
      for (let a = 0; a < 360; a += 2) {
        const angle = (a / 180) * Math.PI;
        // Ellipse approximation
        const scale = Math.sqrt(level * 2);
        const ex = scale * Math.cos(angle) * 0.8;
        const ey = scale * Math.sin(angle) * 0.4;
        const [sx, sy] = toScreen(ex, ey);
        if (a === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.stroke();
    });

    // Draw trail
    if (trail.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#F59E0B60';
      ctx.lineWidth = 2;
      trail.forEach(([x, y], i) => {
        const [sx, sy] = toScreen(x, y);
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      ctx.stroke();
    }

    // Draw ball
    const [bx, by] = toScreen(ballPos[0], ballPos[1]);
    ctx.beginPath();
    ctx.arc(bx, by, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#F59E0B';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Controls info
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`学习率: ${lr.toFixed(2)} | Loss: ${lossAt(ballPos[0], ballPos[1]).toFixed(3)}`, rect.width / 2, oy + size + 18);

    // LR slider
    const sliderY = oy + size + 32;
    const sliderW = size;
    const sliderX = ox;
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(sliderX, sliderY, sliderW, 4, 2);
    ctx.fill();
    const knobX = sliderX + (lr / 0.5) * sliderW;
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(knobX, sliderY + 2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#64748b';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('LR', sliderX, sliderY - 4);
  }, [ballPos, trail, lr]);

  const reset = () => {
    setBallPos([1.5, 1.2]);
    setTrail([[1.5, 1.2]]);
    setRunning(false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.buttons === 0) return;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const pad = 15;
    const size = Math.min(rect.width, rect.height) - pad * 2 - 30;
    const ox = (rect.width - size) / 2;
    const sliderY = 15 + size + 32;
    if (Math.abs((e.clientY - rect.top) - sliderY) < 12) {
      const norm = Math.max(0, Math.min(1, (mx - ox) / size));
      setLr(norm * 0.5);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-2 flex gap-2 items-center">
        <button
          onClick={() => setRunning(!running)}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          {running ? '⏸ 暂停' : '▶ 开始下降'}
        </button>
        <button
          onClick={reset}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          🔄 重置
        </button>
      </div>
      <div className="flex-1">
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none"
          onPointerMove={handlePointerMove}
        />
      </div>
    </div>
  );
}
