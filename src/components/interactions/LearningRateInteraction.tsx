'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

function lossAt(x: number, y: number): number {
  return 0.5 * (x * x + 2.5 * y * y + 0.5 * x * y);
}

function gradAt(x: number, y: number): [number, number] {
  return [x + 0.25 * y, 5 * y + 0.25 * x];
}

export default function LearningRateInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lr, setLr] = useState(0.1);
  const [ballPos, setBallPos] = useState<[number, number]>([2.0, 1.5]);
  const [trail, setTrail] = useState<[number, number][]>([[2.0, 1.5]]);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<'good' | 'slow' | 'explode'>('good');

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setBallPos(([x, y]) => {
        const [gx, gy] = gradAt(x, y);
        const nx = x - lr * gx;
        const ny = y - lr * gy;
        const clamped: [number, number] = [
          Math.max(-3, Math.min(3, nx)),
          Math.max(-3, Math.min(3, ny)),
        ];

        // Check for divergence
        if (Math.abs(nx) > 5 || Math.abs(ny) > 5 || isNaN(nx) || isNaN(ny)) {
          setRunning(false);
          setStatus('explode');
          return [2.0, 1.5];
        }

        setTrail(prev => [...prev.slice(-50), clamped]);
        return clamped;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [running, lr]);

  useEffect(() => {
    if (lr < 0.05) setStatus('slow');
    else if (lr > 0.35) setStatus('explode');
    else setStatus('good');
  }, [lr]);

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
    const plotH = rect.height - 60;
    const plotW = rect.width - pad * 2;
    const ox = pad;
    const oy = 10;

    function toScreen(x: number, y: number): [number, number] {
      return [
        ox + (x + 3) / 6 * plotW,
        oy + (y + 3) / 6 * plotH,
      ];
    }

    // Draw contour map
    const resolution = 50;
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const x = -3 + (i / resolution) * 6;
        const y = -3 + (j / resolution) * 6;
        const l = lossAt(x, y);
        const [sx, sy] = toScreen(x, y);
        const cellW = 6 / resolution * plotW;
        const cellH = 6 / resolution * plotH;
        const intensity = Math.min(1, l / 12);
        const r = Math.round(10 + intensity * 25);
        const g = Math.round(14 + intensity * 15);
        const b = Math.round(26 + intensity * 50);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(sx, sy, cellW + 1, cellH + 1);
      }
    }

    // Trail
    if (trail.length > 1) {
      ctx.beginPath();
      const trailColor = status === 'good' ? '#10B981' : status === 'slow' ? '#3B82F6' : '#EF4444';
      ctx.strokeStyle = trailColor + '80';
      ctx.lineWidth = 2;
      trail.forEach(([x, y], i) => {
        const [sx, sy] = toScreen(x, y);
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      ctx.stroke();
    }

    // Ball
    const [bx, by] = toScreen(ballPos[0], ballPos[1]);
    const ballColor = status === 'good' ? '#10B981' : status === 'slow' ? '#3B82F6' : '#EF4444';
    ctx.beginPath();
    ctx.arc(bx, by, 8, 0, Math.PI * 2);
    ctx.fillStyle = ballColor;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Status text
    const statusText = status === 'good'
      ? '✅ 学习率合适 — 平滑收敛'
      : status === 'slow'
        ? '🐌 学习率太小 — 收敛太慢'
        : '💥 学习率太大 — 发散震荡！';
    ctx.fillStyle = ballColor;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(statusText, rect.width / 2, oy + plotH + 14);

    // Slider area
    const sliderY = oy + plotH + 30;
    const sliderX = pad;
    const sliderW = plotW;
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(sliderX, sliderY, sliderW, 6, 3);
    ctx.fill();

    // Slider zones
    const goodStart = sliderX + (0.05 / 0.5) * sliderW;
    const goodEnd = sliderX + (0.35 / 0.5) * sliderW;
    ctx.fillStyle = '#10B98120';
    ctx.fillRect(goodStart, sliderY, goodEnd - goodStart, 6);

    // Knob
    const knobX = sliderX + (lr / 0.5) * sliderW;
    ctx.fillStyle = ballColor;
    ctx.beginPath();
    ctx.arc(knobX, sliderY + 3, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('LR: 0', sliderX, sliderY - 5);
    ctx.textAlign = 'right';
    ctx.fillText('0.5', sliderX + sliderW, sliderY - 5);
    ctx.textAlign = 'center';
    ctx.fillText(`学习率: ${lr.toFixed(3)}`, rect.width / 2, sliderY + 18);
  }, [ballPos, trail, lr, status]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.buttons === 0) return;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const pad = 15;
    const plotH = rect.height - 60;
    const sliderY = 10 + plotH + 30;
    const sliderW = rect.width - pad * 2;
    const sliderX = pad;

    if (Math.abs(my - (sliderY + 3)) < 15) {
      const norm = Math.max(0, Math.min(1, (mx - sliderX) / sliderW));
      setLr(norm * 0.5);
    }
  }, []);

  const reset = () => {
    setBallPos([2.0, 1.5]);
    setTrail([[2.0, 1.5]]);
    setRunning(false);
    setStatus('good');
  };

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex gap-2 items-center">
        <button
          onClick={() => setRunning(!running)}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          {running ? '⏸ 暂停' : '▶ 开始训练'}
        </button>
        <button
          onClick={reset}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          🔄 重置
        </button>
      </div>
      <div style={{ height: '240px', position: 'relative' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none"
          onPointerMove={handlePointerMove}
        />
      </div>
    </div>
  );
}
