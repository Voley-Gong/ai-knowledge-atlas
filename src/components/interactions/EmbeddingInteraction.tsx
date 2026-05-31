'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * 初始化Canvas并处理DPR缩放
 * 返回实际绘图宽高
 */
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

// 预设词语和它们的2D坐标（模拟embedding空间）
const WORDS = [
  { word: '猫', x: 80, y: 80, group: 'animal' },
  { word: '狗', x: 130, y: 100, group: 'animal' },
  { word: '鱼', x: 100, y: 140, group: 'animal' },
  { word: '汽车', x: 280, y: 80, group: 'vehicle' },
  { word: '火箭', x: 320, y: 120, group: 'vehicle' },
  { word: '飞机', x: 300, y: 160, group: 'vehicle' },
  { word: '苹果', x: 180, y: 60, group: 'food' },
  { word: '面包', x: 200, y: 100, group: 'food' },
  { word: '跑', x: 70, y: 180, group: 'verb' },
  { word: '飞', x: 280, y: 50, group: 'verb' },
];

const GROUP_COLORS: Record<string, string> = {
  animal: '#3B82F6',
  vehicle: '#F59E0B',
  food: '#10B981',
  verb: '#EC4899',
};

export default function EmbeddingInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const wordsRef = useRef(WORDS.map(w => ({ ...w })));

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const result = setupCanvas(canvas);
    if (!result) return;
    const { ctx, w, h } = result;
    const words = wordsRef.current;

    // 缩放坐标到画布尺寸
    const scaleX = w / 400;
    const scaleY = h / 240;

    // 画连线（同类之间）
    const groups: Record<string, typeof words> = {};
    words.forEach(word => {
      if (!groups[word.group]) groups[word.group] = [];
      groups[word.group].push(word);
    });

    Object.entries(groups).forEach(([group, members]) => {
      const color = GROUP_COLORS[group] || '#666';
      for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
          const a = members[i];
          const b = members[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x * scaleX, a.y * scaleY);
            ctx.lineTo(b.x * scaleX, b.y * scaleY);
            ctx.strokeStyle = color + '30';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    });

    // 画词语点
    words.forEach((word, i) => {
      const color = GROUP_COLORS[word.group] || '#666';
      const px = word.x * scaleX;
      const py = word.y * scaleY;
      const isActive = dragIdx === i;

      // 光晕
      ctx.beginPath();
      ctx.arc(px, py, isActive ? 18 : 12, 0, Math.PI * 2);
      ctx.fillStyle = color + (isActive ? '40' : '15');
      ctx.fill();

      // 圆点
      ctx.beginPath();
      ctx.arc(px, py, isActive ? 8 : 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // 标签
      ctx.fillStyle = isActive ? '#fff' : '#cbd5e1';
      ctx.font = (isActive ? 'bold 14px' : '13px') + ' sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(word.word, px, py - 16);
    });

    // 图例
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    let ly = 20;
    Object.entries(GROUP_COLORS).forEach(([group, color]) => {
      ctx.beginPath();
      ctx.arc(15, ly, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(group, 25, ly + 4);
      ly += 18;
    });
  }, [dragIdx]);

  useEffect(() => {
    const t = setTimeout(draw, 100);
    window.addEventListener('resize', draw);
    return () => { clearTimeout(t); window.removeEventListener('resize', draw); };
  }, [draw]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;
    const scaleX = w / 400;
    const scaleY = h / 240;

    for (let i = wordsRef.current.length - 1; i >= 0; i--) {
      const word = wordsRef.current[i];
      const dx = mx - word.x * scaleX;
      const dy = my - word.y * scaleY;
      if (Math.hypot(dx, dy) < 20) {
        setDragIdx(i);
        return;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragIdx === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const scaleX = rect.width / 400;
    const scaleY = rect.height / 240;
    wordsRef.current[dragIdx].x = Math.max(20, Math.min(380, mx / scaleX));
    wordsRef.current[dragIdx].y = Math.max(20, Math.min(220, my / scaleY));
    draw();
  };

  const handleMouseUp = () => {
    setDragIdx(null);
  };

  return (
    <div className="w-full p-3">
      <p className="text-xs text-[#64748b] mb-2">📍 拖拽词语点，观察语义空间中的"距离关系"</p>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={e => {
          const touch = e.touches[0];
          handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY } as any);
        }}
        onTouchMove={e => {
          const touch = e.touches[0];
          handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY } as any);
        }}
        onTouchEnd={handleMouseUp}
        style={{ width: '100%', height: '240px', display: 'block', touchAction: 'none' }}
      />
    </div>
  );
}
