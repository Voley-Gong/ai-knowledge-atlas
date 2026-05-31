'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

export default function LossFunctionInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [a, setA] = useState(0.5);
  const [b, setB] = useState(0.3);

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

    const pad = 30;
    const chartW = rect.width - pad * 2;
    const chartH = rect.height - 90;
    const chartY = 20;

    // Target curve: sin(x) + 0.5
    function target(x: number): number {
      return Math.sin(x * 2) * 0.4 + 0.5;
    }
    // Prediction: a * sin(b * x * 2) + 0.5
    function predict(x: number): number {
      return a * Math.sin(b * x * 2) * 0.8 + 0.5;
    }

    // Draw grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = chartY + (i / 4) * chartH;
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(pad + chartW, y);
      ctx.stroke();
    }

    // Draw loss area (fill between curves)
    ctx.beginPath();
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const x = pad + (i / steps) * chartW;
      const xv = i / steps;
      const y = chartY + (1 - target(xv)) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let i = steps; i >= 0; i--) {
      const x = pad + (i / steps) * chartW;
      const xv = i / steps;
      const y = chartY + (1 - predict(xv)) * chartH;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = '#EF444420';
    ctx.fill();

    // Draw target curve
    ctx.beginPath();
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2.5;
    for (let i = 0; i <= steps; i++) {
      const x = pad + (i / steps) * chartW;
      const y = chartY + (1 - target(i / steps)) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw prediction curve
    ctx.beginPath();
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 3]);
    for (let i = 0; i <= steps; i++) {
      const x = pad + (i / steps) * chartW;
      const y = chartY + (1 - predict(i / steps)) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Calculate loss
    let loss = 0;
    for (let i = 0; i <= steps; i++) {
      const diff = target(i / steps) - predict(i / steps);
      loss += diff * diff;
    }
    loss /= (steps + 1);

    // Loss display
    ctx.fillStyle = '#EF4444';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Loss: ${loss.toFixed(4)}`, rect.width - pad, chartY + chartH + 25);

    // Legend
    ctx.textAlign = 'left';
    ctx.fillStyle = '#3B82F6';
    ctx.fillText('— 目标曲线', pad, chartY + chartH + 25);
    ctx.fillStyle = '#F59E0B';
    ctx.fillText('--- 预测曲线', pad + 80, chartY + chartH + 25);
    ctx.fillStyle = '#EF444440';
    ctx.fillText('■ 误差区域', pad + 170, chartY + chartH + 25);

    // Sliders
    const sliderY1 = chartY + chartH + 40;
    const sliderY2 = sliderY1 + 18;
    const sliderW = chartW;

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`振幅 (a): ${a.toFixed(2)}`, pad, sliderY1 - 3);
    ctx.fillText(`频率 (b): ${b.toFixed(2)}`, pad, sliderY2 - 3);

    // Slider tracks
    [sliderY1 + 4, sliderY2 + 4].forEach((sy, si) => {
      const val = si === 0 ? a : b;
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(pad, sy, sliderW, 4, 2);
      ctx.fill();
      const knobX = pad + (val / 2) * sliderW;
      ctx.fillStyle = '#3B82F6';
      ctx.beginPath();
      ctx.arc(knobX, sy + 2, 7, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [a, b]);

  useEffect(() => { draw(); }, [draw]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const my = e.clientY - rect.top;
    const mx = e.clientX - rect.left;
    const pad = 30;
    const chartH = rect.height - 90;
    const chartY = 20;
    const sliderY1 = chartY + chartH + 40 + 4;
    const sliderY2 = sliderY1 + 18;
    const sliderW = rect.width - pad * 2;

    if (Math.abs(my - sliderY1) < 12) {
      const norm = Math.max(0, Math.min(1, (mx - pad) / sliderW));
      setA(norm * 2);
    }
    if (Math.abs(my - sliderY2) < 12) {
      const norm = Math.max(0, Math.min(1, (mx - pad) / sliderW));
      setB(norm * 2);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block", touchAction: "none" }}
      onPointerDown={handlePointerDown}
      onPointerMove={(e) => { if (e.buttons > 0) handlePointerMove(e); }}
    />
  );
}
