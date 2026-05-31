'use client';

import { useRef, useEffect, useState } from 'react';

const STEPS = [
  'idle',
  'encoding',
  'encoded',
  'decoding',
  'done',
] as const;

type Step = typeof STEPS[number];

export default function EncoderDecoderInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState<Step>('idle');
  const [input, setInput] = useState('我爱AI');
  const [output, setOutput] = useState('');
  const [animProgress, setAnimProgress] = useState(0);

  const nextStep = () => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) {
      const next = STEPS[idx + 1];
      setStep(next);
      if (next === 'decoding') setOutput('I ❤️ ');
      if (next === 'done') setOutput('I ❤️ AI');
      if (next === 'encoded') {
        setAnimProgress(0);
        let p = 0;
        const interval = setInterval(() => {
          p += 0.1;
          setAnimProgress(p);
          if (p >= 1) clearInterval(interval);
        }, 50);
      }
    } else {
      setStep('idle');
      setOutput('');
      setAnimProgress(0);
    }
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

    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const boxW = Math.min(140, rect.width * 0.28);
    const boxH = 70;
    const gap = 40;

    const encX = cx - boxW - gap / 2;
    const decX = cx + gap / 2;

    // Encoder box
    ctx.beginPath();
    ctx.roundRect(encX, cy - boxH / 2, boxW, boxH, 12);
    ctx.fillStyle = step === 'encoding' ? '#3B82F630' : '#111827';
    ctx.fill();
    ctx.strokeStyle = step === 'encoding' || step === 'encoded' || step === 'decoding' || step === 'done' ? '#3B82F6' : '#334155';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = step === 'encoding' ? '#60A5FA' : '#94a3b8';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Encoder', encX + boxW / 2, cy - 5);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('编码器', encX + boxW / 2, cy + 15);

    // Decoder box
    ctx.beginPath();
    ctx.roundRect(decX, cy - boxH / 2, boxW, boxH, 12);
    ctx.fillStyle = step === 'decoding' ? '#8B5CF630' : '#111827';
    ctx.fill();
    ctx.strokeStyle = step === 'decoding' || step === 'done' ? '#8B5CF6' : '#334155';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = step === 'decoding' ? '#A78BFA' : '#94a3b8';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('Decoder', decX + boxW / 2, cy - 5);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('解码器', decX + boxW / 2, cy + 15);

    // Connection arrow between
    const arrowY = cy;
    ctx.strokeStyle = (step === 'encoded' || step === 'decoding' || step === 'done') ? '#F59E0B' : '#334155';
    ctx.lineWidth = 2;
    ctx.setLineDash(step === 'encoded' || step === 'decoding' ? [] : [4, 4]);
    ctx.beginPath();
    ctx.moveTo(encX + boxW + 4, arrowY);
    ctx.lineTo(decX - 4, arrowY);
    ctx.stroke();
    ctx.setLineDash([]);
    if (step === 'encoded' || step === 'decoding' || step === 'done') {
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(decX - 8, arrowY - 4);
      ctx.lineTo(decX - 2, arrowY);
      ctx.lineTo(decX - 8, arrowY + 4);
      ctx.fill();
    }

    // Input text at top
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`输入: ${input}`, cx, 30);

    // Tokens flowing into encoder
    if (step === 'encoding' || step === 'encoded') {
      const tokens = input.split('');
      tokens.forEach((t, i) => {
        const progress = step === 'encoded' ? 1 : Math.min(1, animProgress * (tokens.length) / (i + 1));
        const tx = 30 + i * 35;
        const ty = 60 - progress * 10;
        ctx.beginPath();
        ctx.roundRect(tx, ty, 28, 24, 6);
        ctx.fillStyle = '#3B82F630';
        ctx.fill();
        ctx.strokeStyle = '#3B82F680';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#60A5FA';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(t, tx + 14, ty + 16);
      });
    }

    // Output text at bottom
    if (output) {
      ctx.fillStyle = '#A78BFA';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`输出: ${output}`, cx, rect.height - 25);
    }

    // Status text
    const statusMap: Record<Step, string> = {
      idle: '点击"下一步"开始',
      encoding: 'Encoder 正在读取输入...',
      encoded: '编码完成，传递给 Decoder',
      decoding: 'Decoder 正在生成输出...',
      done: '翻译完成！',
    };
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(statusMap[step], cx, rect.height - 8);
  }, [step, input, output, animProgress]);

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-2 flex gap-2 items-center">
        <button
          onClick={nextStep}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          下一步 →
        </button>
        <button
          onClick={() => { setStep('idle'); setOutput(''); setAnimProgress(0); }}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          🔄 重置
        </button>
      </div>
      <div className="flex-1">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
}
