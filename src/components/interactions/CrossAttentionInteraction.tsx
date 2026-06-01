'use client';

import { useRef, useEffect, useState } from 'react';

const SOURCE_WORDS = ['The', 'cat', 'sat', 'on', 'the', 'mat'];
const TARGET_WORDS = ['猫', '坐在', '那个', '垫子', '上'];

// Attention weights: target word → source words
const ATTENTION_WEIGHTS: Record<number, { weights: number[]; desc: string }> = {
  0: { weights: [0.1, 0.8, 0.02, 0.02, 0.03, 0.03], desc: '"猫"主要关注 "cat"' },
  1: { weights: [0.05, 0.1, 0.75, 0.05, 0.03, 0.02], desc: '"坐在"主要关注 "sat"' },
  2: { weights: [0.05, 0.05, 0.05, 0.1, 0.7, 0.05], desc: '"那个"主要关注 "the"' },
  3: { weights: [0.02, 0.03, 0.05, 0.05, 0.1, 0.75], desc: '"垫子"主要关注 "mat"' },
  4: { weights: [0.05, 0.05, 0.1, 0.7, 0.05, 0.05], desc: '"上"主要关注 "on"' },
};

export default function CrossAttentionInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverTarget, setHoverTarget] = useState<number | null>(null);

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

    const pad = 20;
    const sourceY = 55;
    const targetY = rect.height - 55;
    const midY = rect.height / 2;

    const sourceSpacing = Math.min(60, (rect.width - pad * 2) / SOURCE_WORDS.length);
    const sourceStartX = (rect.width - sourceSpacing * (SOURCE_WORDS.length - 1)) / 2;

    const targetSpacing = Math.min(65, (rect.width - pad * 2) / TARGET_WORDS.length);
    const targetStartX = (rect.width - targetSpacing * (TARGET_WORDS.length - 1)) / 2;

    // Labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🇬🇧 原文 (Source)', pad, 18);
    ctx.fillText('🇨🇳 译文 (Target)', pad, rect.height - 18);

    // Draw attention connections
    if (hoverTarget !== null) {
      const attention = ATTENTION_WEIGHTS[hoverTarget];
      if (attention) {
        const tx = targetStartX + hoverTarget * targetSpacing;

        attention.weights.forEach((weight, si) => {
          if (weight < 0.01) return;
          const sx = sourceStartX + si * sourceSpacing;

          // Draw bezier curve
          ctx.beginPath();
          ctx.moveTo(tx, targetY - 18);
          ctx.bezierCurveTo(
            tx, midY + 10,
            sx, midY - 10,
            sx, sourceY + 18
          );

          const alpha = Math.round(weight * 220);
          const hue = weight > 0.5 ? '10B981' : weight > 0.1 ? '3B82F6' : '64748b';
          ctx.strokeStyle = `#${hue}${alpha.toString(16).padStart(2, '0')}`;
          ctx.lineWidth = Math.max(1, weight * 8);
          ctx.stroke();
        });

        // Description
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(attention.desc, rect.width / 2, midY);
      }
    }

    // Source words
    SOURCE_WORDS.forEach((word, i) => {
      const x = sourceStartX + i * sourceSpacing;

      // Highlight if being attended to
      let isAttended = false;
      if (hoverTarget !== null) {
        const w = ATTENTION_WEIGHTS[hoverTarget]?.weights[i] || 0;
        isAttended = w > 0.3;
      }

      ctx.beginPath();
      ctx.roundRect(x - 20, sourceY - 12, 40, 24, 6);
      ctx.fillStyle = isAttended ? '#10B98130' : '#1e293b';
      ctx.fill();
      ctx.strokeStyle = isAttended ? '#10B981' : '#334155';
      ctx.lineWidth = isAttended ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = isAttended ? '#10B981' : '#94a3b8';
      ctx.font = `${isAttended ? 'bold ' : ''}11px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(word, x, sourceY);
    });

    // Target words (clickable/hoverable)
    TARGET_WORDS.forEach((word, i) => {
      const x = targetStartX + i * targetSpacing;
      const isHovered = hoverTarget === i;

      ctx.beginPath();
      ctx.roundRect(x - 22, targetY - 13, 44, 26, 6);
      ctx.fillStyle = isHovered ? '#8B5CF630' : '#1e293b';
      ctx.fill();
      ctx.strokeStyle = isHovered ? '#8B5CF6' : '#475569';
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = isHovered ? '#A78BFA' : '#cbd5e1';
      ctx.font = `${isHovered ? 'bold ' : ''}12px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(word, x, targetY);
    });

    // Instruction
    if (hoverTarget === null) {
      ctx.fillStyle = '#4b5563';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👆 悬停译文词语，查看交叉注意力连线', rect.width / 2, midY);
    }
  }, [hoverTarget]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const pad = 20;
    const targetY = rect.height - 55;
    const targetSpacing = Math.min(65, (rect.width - pad * 2) / TARGET_WORDS.length);
    const targetStartX = (rect.width - targetSpacing * (TARGET_WORDS.length - 1)) / 2;

    let found = -1;
    TARGET_WORDS.forEach((_, i) => {
      const x = targetStartX + i * targetSpacing;
      if (Math.abs(mx - x) < 25 && Math.abs(my - targetY) < 18) {
        found = i;
      }
    });
    setHoverTarget(found >= 0 ? found : null);
  };

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex gap-2 items-center">
        <span className="text-xs text-[#64748b]">🎯 悬停下方中文词，查看注意力连线</span>
      </div>
      <div style={{ height: '240px', position: 'relative' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverTarget(null)}
        />
      </div>
    </div>
  );
}
