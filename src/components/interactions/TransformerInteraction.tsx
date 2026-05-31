'use client';

import { useRef, useEffect, useState } from 'react';

const STAGES = [
  { name: 'Input', color: '#64748b', icon: '📄' },
  { name: 'Embedding', color: '#3B82F6', icon: '📍' },
  { name: 'Self-Attention', color: '#8B5CF6', icon: '🔦' },
  { name: 'FFN', color: '#10B981', icon: '🍳' },
  { name: 'Output', color: '#F59E0B', icon: '✨' },
];

export default function TransformerInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setStep(s => {
          if (s >= STAGES.length - 1) return 0;
          return s + 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing]);

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

    const padding = 20;
    const stageW = (rect.width - padding * 2) / STAGES.length;
    const centerY = rect.height * 0.5;

    // Draw stages
    STAGES.forEach((stage, i) => {
      const x = padding + i * stageW + stageW / 2;
      const boxW = stageW - 16;
      const boxH = 60;
      const isActive = i <= step;
      const isCurrent = i === step;

      // Connection line
      if (i > 0) {
        const prevX = padding + (i - 1) * stageW + stageW / 2;
        ctx.strokeStyle = isActive ? stage.color + '80' : '#1e293b';
        ctx.lineWidth = 2;
        ctx.setLineDash(isActive ? [] : [4, 4]);
        ctx.beginPath();
        ctx.moveTo(prevX + boxW / 2, centerY);
        ctx.lineTo(x - boxW / 2, centerY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Arrow
        if (isActive) {
          ctx.fillStyle = stage.color;
          ctx.beginPath();
          ctx.moveTo(x - boxW / 2 - 2, centerY - 5);
          ctx.lineTo(x - boxW / 2 + 6, centerY);
          ctx.lineTo(x - boxW / 2 - 2, centerY + 5);
          ctx.fill();
        }
      }

      // Box
      ctx.beginPath();
      ctx.roundRect(x - boxW / 2, centerY - boxH / 2, boxW, boxH, 10);
      ctx.fillStyle = isCurrent ? stage.color + '30' : isActive ? stage.color + '15' : '#1e293b';
      ctx.fill();
      ctx.strokeStyle = isCurrent ? stage.color : isActive ? stage.color + '60' : '#334155';
      ctx.lineWidth = isCurrent ? 2 : 1;
      ctx.stroke();

      // Icon + name
      ctx.fillStyle = isCurrent ? '#fff' : isActive ? '#94a3b8' : '#4b5563';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(stage.icon, x, centerY - 8);
      ctx.font = `${isCurrent ? 'bold ' : ''}11px sans-serif`;
      ctx.fillText(stage.name, x, centerY + 14);
    });

    // Moving token indicator
    const tokenX = padding + step * stageW + stageW / 2;
    ctx.beginPath();
    ctx.arc(tokenX, centerY - 50, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#3B82F6';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('T', tokenX, centerY - 50);

    // Bottom label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`当前阶段: ${STAGES[step].icon} ${STAGES[step].name}`, rect.width / 2, rect.height - 12);
  }, [step]);

  return (
    <div className="w-full flex flex-col" style={{ height: "100%" }}>
      <div className="px-4 pt-2 flex gap-2 items-center">
        <button
          onClick={() => { setPlaying(!playing); if (playing) setStep(0); }}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          {playing ? '⏹ 重置' : '▶ 播放'}
        </button>
        <button
          onClick={() => setStep(s => Math.min(s + 1, STAGES.length - 1))}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          下一步 →
        </button>
      </div>
      <div style={{ height: "240px", position: "relative" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
      </div>
    </div>
  );
}
