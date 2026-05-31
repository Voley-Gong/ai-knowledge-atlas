'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

function setupCanvas(canvas: HTMLCanvasElement): { ctx: CanvasRenderingContext2D; w: number; h: number } | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const parent = canvas.parentElement;
  if (!parent) return null;
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const w = parent.clientWidth || 400;
  const h = 240;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  return { ctx, w, h };
}

const SENTENCE = ['猫', '坐在', '垫子上', '，', '因为', '它', '很', '累'];

// 预设注意力权重（每行=一个词对其他词的关注度）
const ATTENTION_WEIGHTS: number[][] = [
  [0.3, 0.15, 0.05, 0.02, 0.03, 0.35, 0.02, 0.08], // 猫 → 关注"它"
  [0.25, 0.1, 0.3, 0.02, 0.05, 0.08, 0.05, 0.15],  // 坐在 → 关注"垫子上"
  [0.1, 0.35, 0.1, 0.02, 0.03, 0.05, 0.05, 0.3],    // 垫子上 → 关注"坐在"
  [0.1, 0.1, 0.1, 0.3, 0.1, 0.1, 0.1, 0.1],          // ，→ 均匀
  [0.15, 0.05, 0.05, 0.02, 0.1, 0.45, 0.03, 0.15],   // 因为 → 关注"它"
  [0.5, 0.1, 0.05, 0.02, 0.05, 0.1, 0.03, 0.15],     // 它 → 关注"猫"（指代消解）
  [0.1, 0.05, 0.05, 0.02, 0.08, 0.15, 0.3, 0.25],    // 很 → 关注"累"
  [0.15, 0.05, 0.05, 0.02, 0.15, 0.3, 0.13, 0.15],   // 累 → 关注"它"
];

export default function AttentionInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredWord, setHoveredWord] = useState<number | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const result = setupCanvas(canvas);
    if (!result) return;
    const { ctx, w, h } = result;

    const padding = 20;
    const gap = (w - padding * 2) / (SENTENCE.length - 1);
    const wordY = 40;
    const arcBottom = h - 30;

    // 画注意力弧线
    if (hoveredWord !== null) {
      const weights = ATTENTION_WEIGHTS[hoveredWord];
      const maxW = Math.max(...weights);
      
      for (let j = 0; j < SENTENCE.length; j++) {
        if (j === hoveredWord) continue;
        const weight = weights[j];
        const x1 = padding + hoveredWord * gap;
        const x2 = padding + j * gap;
        const midX = (x1 + x2) / 2;
        const arcH = Math.abs(j - hoveredWord) * gap * 0.4 + 30;

        // 弧线
        ctx.beginPath();
        ctx.moveTo(x1, wordY);
        ctx.quadraticCurveTo(midX, wordY - arcH, x2, wordY);
        ctx.strokeStyle = `rgba(59, 130, 246, ${weight / maxW * 0.8})`;
        ctx.lineWidth = weight / maxW * 4 + 0.5;
        ctx.stroke();

        // 权重标签
        ctx.fillStyle = `rgba(59, 130, 246, ${weight / maxW})`;
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText((weight * 100).toFixed(0) + '%', midX, wordY - arcH - 4);
      }
    }

    // 画词语
    SENTENCE.forEach((word, i) => {
      const x = padding + i * gap;
      const isActive = hoveredWord === i;
      const isRelated = hoveredWord !== null && ATTENTION_WEIGHTS[hoveredWord]?.[i] > 0.15;

      // 底部高亮
      ctx.beginPath();
      ctx.arc(x, wordY, isActive ? 22 : 18, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? 'rgba(59,130,246,0.2)' : 'transparent';
      ctx.fill();

      // 词语
      ctx.fillStyle = isActive ? '#60a5fa' : isRelated ? '#93c5fd' : '#94a3b8';
      ctx.font = (isActive ? 'bold 15px' : '14px') + ' sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(word, x, wordY);

      // 下划线
      ctx.beginPath();
      ctx.moveTo(x - 12, wordY + 14);
      ctx.lineTo(x + 12, wordY + 14);
      ctx.strokeStyle = isActive ? '#3B82F6' : '#334155';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.stroke();
    });

    // 底部提示
    if (hoveredWord === null) {
      ctx.fillStyle = '#475569';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👆 点击或悬停某个词，查看它"关注"哪些词', w / 2, h - 10);
    }
  }, [hoveredWord]);

  useEffect(() => {
    const t = setTimeout(draw, 100);
    window.addEventListener('resize', draw);
    return () => { clearTimeout(t); window.removeEventListener('resize', draw); };
  }, [draw]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const w = rect.width;
    const padding = 20;
    const gap = (w - padding * 2) / (SENTENCE.length - 1);

    for (let i = 0; i < SENTENCE.length; i++) {
      const x = padding + i * gap;
      if (Math.abs(mx - x) < gap / 2) {
        setHoveredWord(prev => prev === i ? null : i);
        return;
      }
    }
    setHoveredWord(null);
  };

  return (
    <div className="w-full p-3">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        style={{ width: '100%', height: '240px', display: 'block' }}
      />
    </div>
  );
}
