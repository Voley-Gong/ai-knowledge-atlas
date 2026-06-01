'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

const TOKENS = ['今天', '天气', '真的', '非常', '好', '啊'];
const WAVE_DIMS = 8;

function getEncoding(pos: number, dim: number): number {
  const freq = 1 / Math.pow(10000, (2 * Math.floor(dim / 2)) / WAVE_DIMS);
  return dim % 2 === 0 ? Math.sin(pos * freq) : Math.cos(pos * freq);
}

export default function PositionalEncodingInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [positions, setPositions] = useState<number[]>([0, 1, 2, 3, 4, 5]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const dragStartX = useRef(0);
  const dragStartPos = useRef(0);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const tokenSpacing = Math.min(80, (rect.width - 80) / 8);
    const startX = (rect.width - tokenSpacing * (TOKENS.length - 1)) / 2;
    const tokenY = 60;

    TOKENS.forEach((_, i) => {
      const tx = startX + positions[i] * tokenSpacing;
      if (Math.abs(mx - tx) < 20 && Math.abs((e.clientY - rect.top) - tokenY) < 25) {
        setDragIdx(i);
        dragStartX.current = mx;
        dragStartPos.current = positions[i];
      }
    });
  }, [positions]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragIdx === null) return;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const tokenSpacing = Math.min(80, (rect.width - 80) / 8);
    const delta = (mx - dragStartX.current) / tokenSpacing;
    const newPos = Math.round(Math.max(0, Math.min(7, dragStartPos.current + delta)));
    setPositions(prev => {
      const next = [...prev];
      next[dragIdx] = newPos;
      return next;
    });
  }, [dragIdx]);

  const handlePointerUp = useCallback(() => {
    setDragIdx(null);
  }, []);

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

    const tokenSpacing = Math.min(80, (rect.width - 80) / 8);
    const startX = (rect.width - tokenSpacing * (TOKENS.length - 1)) / 2;
    const tokenY = 55;

    // Draw grid positions
    for (let p = 0; p < 8; p++) {
      const gx = startX + p * tokenSpacing;
      ctx.fillStyle = '#1e293b40';
      ctx.beginPath();
      ctx.arc(gx, tokenY, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4b556380';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`pos${p}`, gx, tokenY + 35);
    }

    // Draw tokens at their current positions
    TOKENS.forEach((token, i) => {
      const x = startX + positions[i] * tokenSpacing;
      const y = tokenY;
      const isDragging = dragIdx === i;

      ctx.beginPath();
      ctx.arc(x, y, isDragging ? 22 : 20, 0, Math.PI * 2);
      ctx.fillStyle = isDragging ? '#3B82F640' : '#1e3a5f';
      ctx.fill();
      ctx.strokeStyle = isDragging ? '#60A5FA' : '#3B82F6';
      ctx.lineWidth = isDragging ? 2 : 1.5;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = `${isDragging ? 'bold ' : ''}12px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(token, x, y);
    });

    // Draw sinusoidal waves below
    const waveStartY = tokenY + 50;
    const waveHeight = 35;
    const waveWidth = rect.width - 40;

    // Title
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('位置编码向量波形 (8维)', 20, waveStartY - 5);

    for (let d = 0; d < WAVE_DIMS; d++) {
      const wy = waveStartY + 10 + d * 22;
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

      ctx.beginPath();
      ctx.strokeStyle = colors[d] + '80';
      ctx.lineWidth = 1;
      for (let p = 0; p <= 80; p++) {
        const px = 20 + (p / 80) * waveWidth;
        const val = getEncoding(p / 10, d);
        const py = wy - val * 8;
        if (p === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Draw position markers
      TOKENS.forEach((_, i) => {
        const posVal = positions[i];
        const px = 20 + (posVal / 8) * waveWidth;
        const val = getEncoding(posVal, d);
        const py = wy - val * 8;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = colors[d];
        ctx.fill();
      });

      // Dim label
      ctx.fillStyle = colors[d] + '90';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`d${d}`, 16, wy + 3);
    }

    // Comparison hint
    if (showComparison) {
      const compY = waveStartY + 10 + WAVE_DIMS * 22 + 5;
      if (compY < rect.height - 10) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('💡 拖拽上方的词到不同位置，观察下方波形变化 → 没有 Positional Encoding 时所有词无法区分先后', 20, compY);
      }
    }
  }, [positions, dragIdx, showComparison]);

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex gap-2 items-center">
        <span className="text-xs text-[#64748b]">🖱️ 拖拽词语改变位置</span>
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          {showComparison ? '隐藏说明' : '💡 对比说明'}
        </button>
        <button
          onClick={() => setPositions([0, 1, 2, 3, 4, 5])}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          🔄 重置
        </button>
      </div>
      <div style={{ height: '240px', position: 'relative' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="touch-none"
        />
      </div>
    </div>
  );
}
