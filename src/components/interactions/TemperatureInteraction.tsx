'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

const CANDIDATES = ['大', '山', '海', '天', '城'];
const BASE_PROBS = [0.40, 0.25, 0.15, 0.12, 0.08];

function softmax(arr: number[], temp: number): number[] {
  const t = Math.max(0.01, temp);
  const max = Math.max(...arr);
  const exps = arr.map(x => Math.exp((x - max) / t));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

export default function TemperatureInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [temperature, setTemperature] = useState(1.0);
  const [sampled, setSampled] = useState<string[]>([]);

  const logits = BASE_PROBS.map(p => Math.log(p + 0.001));

  const sample = () => {
    const probs = softmax(logits, temperature);
    let r = Math.random();
    for (let i = 0; i < probs.length; i++) {
      r -= probs[i];
      if (r <= 0) {
        setSampled(prev => [...prev.slice(-9), CANDIDATES[i]]);
        break;
      }
    }
  };

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
    const probs = softmax(logits, temperature);
    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];

    // Temperature slider
    const sliderY = 30;
    const sliderW = rect.width - pad * 2;

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(pad, sliderY, sliderW, 6, 3);
    ctx.fill();

    const knobX = pad + (temperature / 2) * sliderW;
    const tempColor = temperature < 0.5 ? '#3B82F6' : temperature < 1.2 ? '#10B981' : '#EF4444';
    ctx.beginPath();
    ctx.arc(knobX, sliderY + 3, 10, 0, Math.PI * 2);
    ctx.fillStyle = tempColor;
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🌡️ Temperature: ${temperature.toFixed(2)}`, rect.width / 2, sliderY - 10);

    // Labels
    ctx.font = '9px sans-serif';
    ctx.fillStyle = '#4b5563';
    ctx.textAlign = 'left';
    ctx.fillText('0 (精确)', pad, sliderY + 22);
    ctx.textAlign = 'right';
    ctx.fillText('2 (创意)', pad + sliderW, sliderY + 22);
    ctx.textAlign = 'center';
    ctx.fillText('1 (正常)', pad + sliderW / 2, sliderY + 22);

    // Bars
    const barY = sliderY + 45;
    const barMaxH = 80;
    const barW = (rect.width - pad * 2) / CANDIDATES.length - 12;

    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('概率分布', rect.width / 2, barY - 4);

    CANDIDATES.forEach((c, i) => {
      const bx = pad + i * (barW + 12) + 6;
      const h = probs[i] * barMaxH * 2;
      const isMax = probs[i] === Math.max(...probs);

      ctx.fillStyle = isMax ? colors[i] + '90' : colors[i] + '40';
      ctx.beginPath();
      ctx.roundRect(bx, barY + barMaxH - h, barW, h, 4);
      ctx.fill();

      ctx.fillStyle = colors[i];
      ctx.font = `${isMax ? 'bold ' : ''}14px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(c, bx + barW / 2, barY + barMaxH + 18);
      ctx.font = '10px sans-serif';
      ctx.fillText((probs[i] * 100).toFixed(1) + '%', bx + barW / 2, barY + barMaxH - h - 6);
    });

    // Sampled history
    if (sampled.length > 0) {
      const histY = barY + barMaxH + 35;
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('采样结果:', pad, histY);
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#F59E0B';
      ctx.fillText(sampled.join(' '), pad + 55, histY);
    }
  }, [temperature, sampled]);

  useEffect(() => { draw(); }, [draw]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.buttons === 0) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const pad = 20;
    const sliderW = rect.width - pad * 2;
    const sliderY = 30;
    const my = e.clientY - rect.top;
    if (Math.abs(my - sliderY) < 20) {
      const norm = Math.max(0, Math.min(1, (mx - pad) / sliderW));
      setTemperature(norm * 2);
    }
  };

  return (
    <div className="w-full flex flex-col" style={{ height: "100%" }}>
      <div className="px-4 pt-2 flex gap-2">
        <button
          onClick={sample}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          🎲 采样
        </button>
        <button
          onClick={() => setSampled([])}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          🗑️ 清空
        </button>
      </div>
      <div style={{ height: "240px", position: "relative" }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none"
          onPointerMove={handlePointerMove}
        />
      </div>
    </div>
  );
}
