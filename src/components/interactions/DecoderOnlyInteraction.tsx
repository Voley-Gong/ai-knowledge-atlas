'use client';

import { useRef, useEffect, useState } from 'react';

const CANDIDATES = ['山', '海', '龙', '寺', '城'];
const CANDIDATE_PROBS = [0.35, 0.25, 0.15, 0.15, 0.10];

export default function DecoderOnlyInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prompt, setPrompt] = useState('从前有座');
  const [generated, setGenerated] = useState('');
  const [generating, setGenerating] = useState(false);
  const [currentProbs, setCurrentProbs] = useState<number[]>(CANDIDATE_PROBS);

  const generate = () => {
    if (generating) return;
    setGenerated('');
    setGenerating(true);
    let text = '';
    let i = 0;
    const chars = '山，海。龙飞天上有座古城寺';
    const interval = setInterval(() => {
      const char = chars[Math.floor(Math.random() * chars.length)];
      text += char;
      setGenerated(text);
      // Random probs
      const raw = CANDIDATES.map(() => Math.random());
      const sum = raw.reduce((a, b) => a + b, 0);
      setCurrentProbs(raw.map(r => r / sum));
      i++;
      if (i >= 8) {
        clearInterval(interval);
        setGenerating(false);
      }
    }, 600);
  };

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

    // Input area
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('输入提示词:', pad, 22);

    const fullText = prompt + generated;
    const chars = fullText.split('');
    let x = pad;
    let y = 38;
    ctx.font = '16px sans-serif';
    chars.forEach((c, i) => {
      const isPrompt = i < prompt.length;
      const isLast = i === chars.length - 1 && generating;
      ctx.fillStyle = isLast ? '#F59E0B' : isPrompt ? '#94a3b8' : '#60A5FA';
      if (isLast) {
        ctx.font = 'bold 18px sans-serif';
      } else {
        ctx.font = '16px sans-serif';
      }
      const w = ctx.measureText(c).width;
      if (x + w > rect.width - pad) {
        x = pad;
        y += 24;
      }
      ctx.fillText(c, x, y);
      x += w + 2;
    });

    // Cursor
    if (generating) {
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(x, y - 14, 2, 18);
    }

    // Probability distribution
    const barY = y + 40;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('下一个词的概率分布 ↓', rect.width / 2, barY);

    const barArea = barY + 10;
    const barMaxH = 60;
    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];
    const barW = (rect.width - pad * 2) / CANDIDATES.length - 10;

    CANDIDATES.forEach((c, i) => {
      const bx = pad + i * (barW + 10) + 5;
      const h = currentProbs[i] * barMaxH * 2;
      const isMax = currentProbs[i] === Math.max(...currentProbs);

      ctx.fillStyle = isMax ? colors[i] + '80' : colors[i] + '30';
      ctx.beginPath();
      ctx.roundRect(bx, barArea + barMaxH - h, barW, h, 4);
      ctx.fill();

      ctx.fillStyle = isMax ? '#fff' : colors[i];
      ctx.font = `${isMax ? 'bold ' : ''}12px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(c, bx + barW / 2, barArea + barMaxH + 16);
      ctx.font = '10px sans-serif';
      ctx.fillText((currentProbs[i] * 100).toFixed(0) + '%', bx + barW / 2, barArea + barMaxH - h - 6);
    });

    // Arrow label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GPT: 自回归逐词生成 →', rect.width / 2, rect.height - 8);
  }, [prompt, generated, generating, currentProbs]);

  return (
    <div className="w-full flex flex-col" style={{ height: "100%" }}>
      <div className="px-4 pt-2 flex gap-2 items-center">
        <input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          className="flex-1 bg-[#1e293b] border border-[#334155] rounded px-2 py-1 text-sm text-white outline-none focus:border-blue-500"
          placeholder="输入开头..."
        />
        <button
          onClick={generate}
          disabled={generating}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white disabled:opacity-50 transition-colors"
        >
          {generating ? '⏳ 生成中...' : '▶ 生成'}
        </button>
      </div>
      <div style={{ height: "240px", position: "relative" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
      </div>
    </div>
  );
}
