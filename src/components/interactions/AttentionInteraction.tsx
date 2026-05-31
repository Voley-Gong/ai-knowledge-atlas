'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

const WORDS = ['猫', '坐在', '垫子', '上', '，', '因为', '它', '很', '累'];
// Attention weights (simplified) - each row = attention FROM that word TO others
const ATTENTION: number[][] = [
  [0.3, 0.1, 0.2, 0.05, 0.05, 0.05, 0.2, 0.03, 0.02],
  [0.2, 0.15, 0.15, 0.1, 0.05, 0.1, 0.1, 0.1, 0.05],
  [0.2, 0.1, 0.2, 0.1, 0.05, 0.05, 0.15, 0.1, 0.05],
  [0.1, 0.1, 0.2, 0.15, 0.05, 0.1, 0.1, 0.1, 0.1],
  [0.05, 0.05, 0.05, 0.05, 0.5, 0.1, 0.05, 0.05, 0.1],
  [0.05, 0.05, 0.05, 0.05, 0.05, 0.2, 0.4, 0.1, 0.1],
  [0.35, 0.1, 0.1, 0.05, 0.05, 0.05, 0.15, 0.1, 0.05],
  [0.05, 0.05, 0.05, 0.05, 0.05, 0.15, 0.1, 0.35, 0.15],
  [0.05, 0.05, 0.05, 0.05, 0.05, 0.2, 0.15, 0.25, 0.15],
];

export default function AttentionInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const draw = useCallback(() => {
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

    const padding = 30;
    const wordSpacing = (rect.width - padding * 2) / (WORDS.length - 1);
    const topY = rect.height * 0.2;
    const bottomY = rect.height * 0.8;

    // Draw attention lines from hovered word
    if (hovered !== null) {
      const fromX = padding + hovered * wordSpacing;
      const weights = ATTENTION[hovered];
      WORDS.forEach((_, j) => {
        if (j === hovered) return;
        const toX = padding + j * wordSpacing;
        const weight = weights[j];
        const alpha = Math.min(1, weight * 2);
        const lineWidth = Math.max(1, weight * 12);

        ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(fromX, topY);
        const cpY = topY + (bottomY - topY) * (0.3 + weight * 0.4);
        ctx.quadraticCurveTo((fromX + toX) / 2, cpY, toX, bottomY);
        ctx.stroke();
      });
    }

    // Draw word circles - top row (source)
    WORDS.forEach((word, i) => {
      const x = padding + i * wordSpacing;
      const isHovered = hovered === i;
      const r = isHovered ? 22 : 18;

      ctx.beginPath();
      ctx.arc(x, topY, r, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? '#3B82F640' : '#1e293b';
      ctx.fill();
      ctx.strokeStyle = isHovered ? '#3B82F6' : '#334155';
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = isHovered ? '#fff' : '#94a3b8';
      ctx.font = `${isHovered ? 'bold ' : ''}13px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(word, x, topY);
    });

    // Draw word circles - bottom row (target)
    WORDS.forEach((word, i) => {
      const x = padding + i * wordSpacing;
      const weight = hovered !== null ? ATTENTION[hovered][i] : 0;
      const isTarget = hovered !== null && weight > 0.15;

      ctx.beginPath();
      ctx.arc(x, bottomY, 18, 0, Math.PI * 2);
      ctx.fillStyle = isTarget ? `rgba(59, 130, 246, ${weight})` : '#1e293b';
      ctx.fill();
      ctx.strokeStyle = isTarget ? '#3B82F6' : '#334155';
      ctx.lineWidth = isTarget ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = isTarget ? '#fff' : '#94a3b8';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(word, x, bottomY);
    });

    // Labels
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('悬停词语查看注意力 →', padding, rect.height - 8);
  }, [hovered]);

  useEffect(() => { draw(); }, [draw]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const padding = 30;
    const wordSpacing = (rect.width - padding * 2) / (WORDS.length - 1);
    const topY = rect.height * 0.2;

    let found: number | null = null;
    for (let i = 0; i < WORDS.length; i++) {
      const x = padding + i * wordSpacing;
      if (Math.abs(mx - x) < 22 && Math.abs(my - topY) < 22) {
        found = i;
        break;
      }
    }
    setHovered(found);
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHovered(null)}
    />
  );
}
