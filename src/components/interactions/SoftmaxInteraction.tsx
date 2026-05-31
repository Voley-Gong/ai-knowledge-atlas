'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

const LABELS = ['猫', '狗', '鸟', '鱼', '汽车'];

function softmax(arr: number[]): number[] {
  const max = Math.max(...arr);
  const exps = arr.map(x => Math.exp(x - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

export default function SoftmaxInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [values, setValues] = useState([3.0, 1.0, 0.5, 2.0, -1.0]);
  const [dragging, setDragging] = useState<number | null>(null);

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
    const sliderY = 50;
    const sliderH = 6;
    const barY = 110;
    const barMaxH = 100;
    const sectionW = (rect.width - pad * 2) / LABELS.length;
    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];

    const probs = softmax(values);

    // Sliders
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('拖动滑块调整原始分数 ↓', rect.width / 2, 20);

    LABELS.forEach((label, i) => {
      const cx = pad + i * sectionW + sectionW / 2;
      const sliderW = sectionW - 30;

      // Track
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(cx - sliderW / 2, sliderY, sliderW, sliderH, 3);
      ctx.fill();

      // Knob position: value range -3 to 5
      const norm = (values[i] + 3) / 8;
      const knobX = cx - sliderW / 2 + norm * sliderW;

      // Filled
      ctx.fillStyle = colors[i] + '60';
      ctx.beginPath();
      ctx.roundRect(cx - sliderW / 2, sliderY, knobX - (cx - sliderW / 2), sliderH, 3);
      ctx.fill();

      // Knob
      ctx.beginPath();
      ctx.arc(knobX, sliderY + sliderH / 2, 8, 0, Math.PI * 2);
      ctx.fillStyle = colors[i];
      ctx.fill();

      // Label + value
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, cx, sliderY - 12);
      ctx.font = '10px sans-serif';
      ctx.fillStyle = colors[i];
      ctx.fillText(values[i].toFixed(1), cx, sliderY + sliderH + 16);
    });

    // Bars
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Softmax 概率分布 ↓', rect.width / 2, barY - 10);

    LABELS.forEach((label, i) => {
      const cx = pad + i * sectionW + sectionW / 2;
      const barW = sectionW - 30;
      const h = probs[i] * barMaxH;

      ctx.fillStyle = colors[i] + '60';
      ctx.beginPath();
      ctx.roundRect(cx - barW / 2, barY + barMaxH - h, barW, h, 4);
      ctx.fill();

      ctx.fillStyle = colors[i];
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText((probs[i] * 100).toFixed(1) + '%', cx, barY + barMaxH - h - 6);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText(label, cx, barY + barMaxH + 16);
    });

    // Sum indicator
    const total = probs.reduce((a, b) => a + b, 0);
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`总和: ${(total * 100).toFixed(1)}% ✓`, rect.width / 2, rect.height - 10);
  }, [values, dragging]);

  useEffect(() => { draw(); }, [draw]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const pad = 20;
    const sectionW = (rect.width - pad * 2) / LABELS.length;

    if (my > 30 && my < 80) {
      for (let i = 0; i < LABELS.length; i++) {
        const cx = pad + i * sectionW + sectionW / 2;
        if (Math.abs(mx - cx) < sectionW / 2) {
          setDragging(i);
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          break;
        }
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragging === null) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const pad = 20;
    const sectionW = (rect.width - pad * 2) / LABELS.length;
    const cx = pad + dragging * sectionW + sectionW / 2;
    const sliderW = sectionW - 30;
    const norm = (mx - (cx - sliderW / 2)) / sliderW;
    const val = Math.max(-3, Math.min(5, norm * 8 - 3));
    setValues(prev => prev.map((v, i) => i === dragging ? val : v));
  };

  const handlePointerUp = () => setDragging(null);

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
