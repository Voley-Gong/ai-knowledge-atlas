'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

interface WordPoint {
  word: string;
  x: number;
  y: number;
  origX: number;
  origY: number;
  category: string;
}

const WORDS: Omit<WordPoint, 'x' | 'y' | 'origX' | 'origY'>[] = [
  { word: '猫', category: 'animal' },
  { word: '狗', category: 'animal' },
  { word: '鱼', category: 'animal' },
  { word: '鸟', category: 'animal' },
  { word: '汽车', category: 'vehicle' },
  { word: '火箭', category: 'vehicle' },
  { word: '飞机', category: 'vehicle' },
  { word: '苹果', category: 'fruit' },
  { word: '香蕉', category: 'fruit' },
  { word: '电脑', category: 'tech' },
  { word: '手机', category: 'tech' },
  { word: '快乐', category: 'emotion' },
  { word: '悲伤', category: 'emotion' },
];

const CAT_COLORS: Record<string, string> = {
  animal: '#10B981',
  vehicle: '#3B82F6',
  fruit: '#F59E0B',
  tech: '#8B5CF6',
  emotion: '#EC4899',
};

export default function EmbeddingInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<WordPoint[]>([]);
  const draggingRef = useRef<number | null>(null);
  const animRef = useRef<number>(0);

  // Initialize points
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const clusterOffsets: Record<string, { x: number; y: number }> = {
      animal: { x: -80, y: -60 },
      vehicle: { x: 80, y: -60 },
      fruit: { x: -80, y: 60 },
      tech: { x: 80, y: 60 },
      emotion: { x: 0, y: 0 },
    };
    const pts: WordPoint[] = WORDS.map(w => {
      const off = clusterOffsets[w.category];
      const x = cx + off.x + (Math.random() - 0.5) * 60;
      const y = cy + off.y + (Math.random() - 0.5) * 50;
      return { ...w, x, y, origX: x, origY: y };
    });
    setPoints(pts);
  }, []);

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

    if (points.length === 0) return;

    // Draw connections between same-category
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        if (points[i].category === points[j].category) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            const alpha = Math.max(0, 1 - dist / 200) * 0.3;
            ctx.strokeStyle = CAT_COLORS[points[i].category] + Math.round(alpha * 255).toString(16).padStart(2, '0');
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }
      }
    }

    // Draw points
    points.forEach(p => {
      const color = CAT_COLORS[p.category];
      // Circle
      ctx.beginPath();
      ctx.arc(p.x, p.y, 20, 0, Math.PI * 2);
      ctx.fillStyle = color + '30';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Word
      ctx.fillStyle = '#fff';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.word, p.x, p.y);
    });

    // Spring-back animation
    let needsAnim = false;
    setPoints(prev => prev.map(p => {
      if (draggingRef.current !== null && points[draggingRef.current] === p) return p;
      const dx = p.origX - p.x;
      const dy = p.origY - p.y;
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        needsAnim = true;
        return { ...p, x: p.x + dx * 0.08, y: p.y + dy * 0.08 };
      }
      return p;
    }));

    if (needsAnim) {
      animRef.current = requestAnimationFrame(draw);
    }
  }, [points]);

  useEffect(() => {
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  const getPointAt = (mx: number, my: number): number | null => {
    for (let i = points.length - 1; i >= 0; i--) {
      const dx = points[i].x - mx;
      const dy = points[i].y - my;
      if (dx * dx + dy * dy < 400) return i;
    }
    return null;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const idx = getPointAt(e.clientX - rect.left, e.clientY - rect.top);
    if (idx !== null) {
      draggingRef.current = idx;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (draggingRef.current === null) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPoints(prev => prev.map((p, i) => i === draggingRef.current ? { ...p, x, y } : p));
  };

  const handlePointerUp = () => {
    draggingRef.current = null;
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    />
  );
}
