'use client';

import { useRef, useEffect, useState } from 'react';

type HeadType = 'syntax' | 'semantic' | 'reference';

interface HeadConfig {
  label: string;
  color: string;
  icon: string;
  connections: [number, number, number][]; // [from, to, weight]
}

const HEADS: Record<HeadType, HeadConfig> = {
  syntax: {
    label: '语法头',
    color: '#3B82F6',
    icon: '🔗',
    connections: [
      [0, 1, 0.9], [1, 2, 0.8], [2, 3, 0.7], [3, 4, 0.85],
      [4, 5, 0.9], [5, 6, 0.6], [1, 5, 0.5], [2, 4, 0.4],
    ],
  },
  semantic: {
    label: '语义头',
    color: '#10B981',
    icon: '💡',
    connections: [
      [0, 4, 0.9], [1, 3, 0.85], [2, 5, 0.7], [0, 6, 0.6],
      [3, 6, 0.5], [4, 6, 0.8], [1, 4, 0.4], [2, 6, 0.65],
    ],
  },
  reference: {
    label: '指代头',
    color: '#F59E0B',
    icon: '👆',
    connections: [
      [5, 0, 0.95], [5, 1, 0.9], [5, 2, 0.7], [5, 3, 0.5],
      [6, 4, 0.85], [6, 1, 0.6], [6, 0, 0.4], [4, 2, 0.3],
    ],
  },
};

const TOKENS = ['我', '昨天', '在', '图书馆', '看到', '它', '那边'];

export default function MultiHeadAttentionInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeHeads, setActiveHeads] = useState<Set<HeadType>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const toggleHead = (head: HeadType) => {
    setActiveHeads(prev => {
      const next = new Set(prev);
      if (next.has(head)) next.delete(head);
      else next.add(head);
      return next;
    });
    setShowAll(false);
  };

  const displayHeads = showAll
    ? new Set<HeadType>(['syntax', 'semantic', 'reference'])
    : activeHeads;

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

    const tokenCount = TOKENS.length;
    const tokenSpacing = Math.min(70, (rect.width - 60) / tokenCount);
    const startX = (rect.width - tokenSpacing * (tokenCount - 1)) / 2;
    const tokenY = rect.height / 2;
    const tokenR = 18;

    // Draw connections for each active head
    displayHeads.forEach(headType => {
      const head = HEADS[headType];
      head.connections.forEach(([from, to, weight]) => {
        const x1 = startX + from * tokenSpacing;
        const x2 = startX + to * tokenSpacing;
        const y1 = tokenY;
        const y2 = tokenY;
        const curveHeight = Math.abs(to - from) * 12 + 15;

        ctx.beginPath();
        ctx.moveTo(x1, y1 - tokenR);
        ctx.quadraticCurveTo((x1 + x2) / 2, y1 - tokenR - curveHeight, x2, y2 - tokenR);
        ctx.strokeStyle = head.color + Math.round(weight * 180).toString(16).padStart(2, '0');
        ctx.lineWidth = weight * 3.5;
        ctx.stroke();
      });
    });

    // Draw tokens
    TOKENS.forEach((token, i) => {
      const x = startX + i * tokenSpacing;
      const y = tokenY;

      // Highlight if involved in any connection
      let isHighlighted = false;
      displayHeads.forEach(headType => {
        HEADS[headType].connections.forEach(([from, to]) => {
          if (from === i || to === i) isHighlighted = true;
        });
      });

      ctx.beginPath();
      ctx.arc(x, y, tokenR, 0, Math.PI * 2);
      ctx.fillStyle = isHighlighted ? '#1e3a5f' : '#111827';
      ctx.fill();
      ctx.strokeStyle = isHighlighted ? '#60A5FA' : '#334155';
      ctx.lineWidth = isHighlighted ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = isHighlighted ? '#fff' : '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(token, x, y);
    });

    // Legend
    const legendY = rect.height - 25;
    const headTypes: HeadType[] = ['syntax', 'semantic', 'reference'];
    const legendStartX = rect.width / 2 - 120;
    headTypes.forEach((ht, i) => {
      const lx = legendStartX + i * 85;
      const isActive = displayHeads.has(ht);
      ctx.fillStyle = isActive ? HEADS[ht].color : '#4b5563';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${HEADS[ht].icon} ${HEADS[ht].label}`, lx, legendY);
    });
  }, [displayHeads]);

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex gap-2 items-center flex-wrap">
        <button
          onClick={() => toggleHead('syntax')}
          className="px-3 py-1 rounded text-sm transition-colors"
          style={{
            backgroundColor: activeHeads.has('syntax') && !showAll ? '#3B82F630' : '#1e293b',
            color: activeHeads.has('syntax') && !showAll ? '#3B82F6' : '#94a3b8',
            border: activeHeads.has('syntax') && !showAll ? '1px solid #3B82F660' : '1px solid transparent',
          }}
        >
          🔗 语法头
        </button>
        <button
          onClick={() => toggleHead('semantic')}
          className="px-3 py-1 rounded text-sm transition-colors"
          style={{
            backgroundColor: activeHeads.has('semantic') && !showAll ? '#10B98130' : '#1e293b',
            color: activeHeads.has('semantic') && !showAll ? '#10B981' : '#94a3b8',
            border: activeHeads.has('semantic') && !showAll ? '1px solid #10B98160' : '1px solid transparent',
          }}
        >
          💡 语义头
        </button>
        <button
          onClick={() => toggleHead('reference')}
          className="px-3 py-1 rounded text-sm transition-colors"
          style={{
            backgroundColor: activeHeads.has('reference') && !showAll ? '#F59E0B30' : '#1e293b',
            color: activeHeads.has('reference') && !showAll ? '#F59E0B' : '#94a3b8',
            border: activeHeads.has('reference') && !showAll ? '1px solid #F59E0B60' : '1px solid transparent',
          }}
        >
          👆 指代头
        </button>
        <button
          onClick={() => setShowAll(!showAll)}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          {showAll ? '🔀 分开查看' : '🌈 叠加全部'}
        </button>
      </div>
      <div style={{ height: '240px', position: 'relative' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
    </div>
  );
}
