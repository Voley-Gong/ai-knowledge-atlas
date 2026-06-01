'use client';

import { useRef, useEffect, useState } from 'react';

type FnType = 'relu' | 'sigmoid' | 'gelu' | 'tanh';

const FUNCTIONS: Record<FnType, { name: string; formula: string; fn: (x: number) => number; color: string }> = {
  relu: { name: 'ReLU', formula: 'f(x) = max(0, x)', fn: (x) => Math.max(0, x), color: '#3B82F6' },
  sigmoid: { name: 'Sigmoid', formula: 'f(x) = 1/(1+e⁻ˣ)', fn: (x) => 1 / (1 + Math.exp(-x)), color: '#10B981' },
  gelu: { name: 'GELU', formula: 'f(x) = x·Φ(x)', fn: (x) => x * 0.5 * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x * x * x))), color: '#8B5CF6' },
  tanh: { name: 'Tanh', formula: 'f(x) = tanh(x)', fn: (x) => Math.tanh(x), color: '#F59E0B' },
};

export default function ActivationFunctionInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeFn, setActiveFn] = useState<FnType>('relu');
  const [showComparison, setShowComparison] = useState(false);
  const [compProgress, setCompProgress] = useState(0);

  useEffect(() => {
    if (!showComparison) { setCompProgress(0); return; }
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      setCompProgress(Math.min(1, frame / 60));
      if (frame >= 60) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [showComparison]);

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

    const fnInfo = FUNCTIONS[activeFn];
    const padL = 35, padR = 15, padT = 20, padB = showComparison ? 70 : 30;
    const plotW = rect.width - padL - padR;
    const plotH = rect.height - padT - padB;
    const xMin = -5, xMax = 5;
    const yMin = activeFn === 'tanh' ? -1.5 : -0.5;
    const yMax = activeFn === 'tanh' ? 1.5 : activeFn === 'relu' ? 5.5 : 1.5;

    const toScreen = (x: number, y: number): [number, number] => [
      padL + (x - xMin) / (xMax - xMin) * plotW,
      padT + plotH - (y - yMin) / (yMax - yMin) * plotH,
    ];

    // Grid
    ctx.strokeStyle = '#1e293b40';
    ctx.lineWidth = 0.5;
    for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
      const [, sy] = toScreen(0, y);
      ctx.beginPath(); ctx.moveTo(padL, sy); ctx.lineTo(padL + plotW, sy); ctx.stroke();
      ctx.fillStyle = '#4b5563'; ctx.font = '9px sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(y.toString(), padL - 4, sy + 3);
    }

    // Zero axes
    const [zx0, zy0] = toScreen(xMin, 0);
    const [zx1] = toScreen(xMax, 0);
    ctx.strokeStyle = '#33415560';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(zx0, zy0); ctx.lineTo(zx1, zy0); ctx.stroke();
    const [ax0, ay0] = toScreen(0, yMin);
    const [, ay1] = toScreen(0, yMax);
    ctx.beginPath(); ctx.moveTo(ax0, ay0); ctx.lineTo(ax0, ay1); ctx.stroke();

    // Function curve
    ctx.beginPath();
    ctx.strokeStyle = fnInfo.color;
    ctx.lineWidth = 2.5;
    for (let px = 0; px <= plotW; px++) {
      const x = xMin + (px / plotW) * (xMax - xMin);
      const y = fnInfo.fn(x);
      const [sx, sy] = toScreen(x, y);
      if (px === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // Glow effect
    ctx.beginPath();
    ctx.strokeStyle = fnInfo.color + '30';
    ctx.lineWidth = 8;
    for (let px = 0; px <= plotW; px++) {
      const x = xMin + (px / plotW) * (xMax - xMin);
      const y = fnInfo.fn(x);
      const [sx, sy] = toScreen(x, y);
      if (px === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // Title
    ctx.fillStyle = fnInfo.color;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(fnInfo.name, padL + 5, 14);
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.fillText(fnInfo.formula, padL + 50, 14);

    // Comparison section
    if (showComparison) {
      const compY = padT + plotH + 12;
      const halfW = plotW / 2 - 10;

      // Without activation (linear)
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(padL, compY, halfW, 50, 6);
      ctx.fill();
      ctx.strokeStyle = '#EF444440';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('❌ 无激活函数', padL + halfW / 2, compY + 12);

      // Draw linear-only network (all same color = linear)
      const lw = compProgress;
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.3 + lw * 0.5})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const nx = padL + 15 + i * (halfW - 30) / 2;
          const ny = compY + 20 + j * 10;
          ctx.beginPath(); ctx.arc(nx, ny, 3, 0, Math.PI * 2); ctx.stroke();
          if (i < 2) {
            for (let k = 0; k < 3; k++) {
              const nnx = padL + 15 + (i + 1) * (halfW - 30) / 2;
              const nny = compY + 20 + k * 10;
              ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(nnx, nny); ctx.stroke();
            }
          }
        }
      }
      ctx.fillStyle = '#EF444480';
      ctx.font = '8px sans-serif';
      ctx.fillText('只能拟合线性关系', padL + halfW / 2, compY + 46);

      // With activation (nonlinear)
      const rx = padL + halfW + 20;
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(rx, compY, halfW, 50, 6);
      ctx.fill();
      ctx.strokeStyle = '#10B98140';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('✅ 有激活函数', rx + halfW / 2, compY + 12);

      const nodeColors = ['#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981'];
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const nx = rx + 15 + i * (halfW - 30) / 2;
          const ny = compY + 20 + j * 10;
          const col = nodeColors[(i + j) % nodeColors.length];
          ctx.fillStyle = col + (lw > 0.5 ? '80' : '30');
          ctx.beginPath(); ctx.arc(nx, ny, 3, 0, Math.PI * 2); ctx.fill();
          if (i < 2) {
            for (let k = 0; k < 3; k++) {
              const nnx = rx + 15 + (i + 1) * (halfW - 30) / 2;
              const nny = compY + 20 + k * 10;
              ctx.strokeStyle = nodeColors[(i + 1 + k) % nodeColors.length] + '40';
              ctx.lineWidth = 1;
              ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(nnx, nny); ctx.stroke();
            }
          }
        }
      }
      ctx.fillStyle = '#10B98180';
      ctx.font = '8px sans-serif';
      ctx.fillText('能拟合复杂非线性关系', rx + halfW / 2, compY + 46);
    }
  }, [activeFn, showComparison, compProgress]);

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex gap-2 items-center flex-wrap">
        {(Object.keys(FUNCTIONS) as FnType[]).map((key) => (
          <button
            key={key}
            onClick={() => setActiveFn(key)}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              activeFn === key
                ? 'text-white'
                : 'bg-[#1e293b] text-[#64748b] hover:text-white'
            }`}
            style={activeFn === key ? { backgroundColor: FUNCTIONS[key].color + '40', color: FUNCTIONS[key].color } : {}}
          >
            {FUNCTIONS[key].name}
          </button>
        ))}
        <button
          onClick={() => setShowComparison(!showComparison)}
          className={`px-3 py-1 rounded text-xs transition-colors ${
            showComparison ? 'bg-[#10B98120] text-[#10B981]' : 'bg-[#1e293b] text-[#64748b] hover:text-white'
          }`}
        >
          {showComparison ? '隐藏对比' : '📊 对比效果'}
        </button>
      </div>
      <div style={{ height: '240px', position: 'relative' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
    </div>
  );
}
