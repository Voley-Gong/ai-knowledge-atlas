'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

const WORDS = ['我', '爱', 'AI', '技术'];

export default function SelfAttentionInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selected, setSelected] = useState<number>(0);

  // Simulated Q*K dot products (scores)
  const scores = [
    [8.0, 1.0, 3.0, 2.0],
    [1.5, 7.0, 4.0, 3.0],
    [2.0, 3.5, 9.0, 5.0],
    [1.0, 2.0, 4.0, 7.5],
  ];

  // Softmax
  function softmax(arr: number[]): number[] {
    const max = Math.max(...arr);
    const exps = arr.map(x => Math.exp(x - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(e => e / sum);
  }

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

    const pad = 20;
    const sectionW = rect.width - pad * 2;
    const topH = 50;

    // Draw words at top
    const wordSpacing = sectionW / WORDS.length;
    WORDS.forEach((w, i) => {
      const x = pad + i * wordSpacing + wordSpacing / 2;
      const isActive = i === selected;
      ctx.beginPath();
      ctx.roundRect(x - 24, 10, 48, 30, 8);
      ctx.fillStyle = isActive ? '#8B5CF640' : '#1e293b';
      ctx.fill();
      ctx.strokeStyle = isActive ? '#8B5CF6' : '#334155';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.stroke();
      ctx.fillStyle = isActive ? '#fff' : '#94a3b8';
      ctx.font = `${isActive ? 'bold ' : ''}14px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(w, x, 25);
    });

    // Show Q, K, V vectors for selected word
    const selX = pad + selected * wordSpacing + wordSpacing / 2;
    const vecY = 65;
    const vecLabels = ['Q', 'K', 'V'];
    const vecColors = ['#3B82F6', '#F59E0B', '#10B981'];
    const vecW = 30;

    vecLabels.forEach((label, vi) => {
      const vx = pad + vi * (sectionW / 3);
      ctx.fillStyle = vecColors[vi] + '20';
      ctx.fillRect(vx, vecY, sectionW / 3 - 10, 35);
      ctx.strokeStyle = vecColors[vi] + '60';
      ctx.strokeRect(vx, vecY, sectionW / 3 - 10, 35);
      ctx.fillStyle = vecColors[vi];
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${label}(${WORDS[selected]})`, vx + (sectionW / 3 - 10) / 2, vecY + 20);
    });

    // Attention weights bar chart
    const weights = softmax(scores[selected]);
    const barY = 115;
    const barH = 50;
    const barW = wordSpacing - 20;

    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('注意力权重 (Q·K → Softmax)', rect.width / 2, barY - 4);

    WORDS.forEach((w, i) => {
      const bx = pad + i * wordSpacing + (wordSpacing - barW) / 2;
      const h = weights[i] * barH * 2;
      const isMax = weights[i] === Math.max(...weights);

      ctx.fillStyle = isMax ? '#8B5CF680' : '#8B5CF630';
      ctx.beginPath();
      ctx.roundRect(bx, barY + barH - h, barW, h, 4);
      ctx.fill();

      ctx.fillStyle = isMax ? '#fff' : '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(w, bx + barW / 2, barY + barH + 14);
      ctx.fillText((weights[i] * 100).toFixed(1) + '%', bx + barW / 2, barY + barH - h - 6);
    });

    // Label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`点击上方词语查看其 Q·K 注意力分布`, rect.width / 2, rect.height - 10);
  }, [selected]);

  useEffect(() => { draw(); }, [draw]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const pad = 20;
    const sectionW = rect.width - pad * 2;
    const wordSpacing = sectionW / WORDS.length;
    for (let i = 0; i < WORDS.length; i++) {
      const x = pad + i * wordSpacing;
      if (mx >= x && mx <= x + wordSpacing) {
        setSelected(i);
        break;
      }
    }
  };

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} onClick={handleClick} />;
}
