'use client';

import { useRef, useEffect, useState } from 'react';

interface KnowledgeBlock {
  label: string;
  icon: string;
  color: string;
  x: number;
  y: number;
  absorbed: boolean;
}

const KNOWLEDGE_BLOCKS: Omit<KnowledgeBlock, 'x' | 'y' | 'absorbed'>[] = [
  { label: '文学', icon: '📖', color: '#3B82F6' },
  { label: '科学', icon: '🔬', color: '#10B981' },
  { label: '历史', icon: '📜', color: '#F59E0B' },
  { label: '编程', icon: '💻', color: '#8B5CF6' },
  { label: '数学', icon: '🔢', color: '#EF4444' },
  { label: '艺术', icon: '🎨', color: '#EC4899' },
  { label: '医学', icon: '🏥', color: '#14B8A6' },
  { label: '法律', icon: '⚖️', color: '#64748b' },
];

export default function PreTrainingInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [blocks, setBlocks] = useState<KnowledgeBlock[]>([]);
  const [phase, setPhase] = useState<'idle' | 'training' | 'done'>('idle');
  const [progress, setProgress] = useState(0);
  const [brainSize, setBrainSize] = useState(30);
  const animRef = useRef<number>(0);
  const frameRef = useRef(0);

  const initBlocks = (w: number, h: number) => {
    return KNOWLEDGE_BLOCKS.map((b, i) => {
      const angle = (i / KNOWLEDGE_BLOCKS.length) * Math.PI * 2;
      const radius = Math.min(w, h) * 0.38;
      return {
        ...b,
        x: w / 2 + Math.cos(angle) * radius,
        y: h / 2 + Math.sin(angle) * radius * 0.7,
        absorbed: false,
      };
    });
  };

  const startTraining = () => {
    if (phase === 'training') return;
    setPhase('training');
    setProgress(0);
    setBrainSize(30);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setBlocks(initBlocks(rect.width, rect.height));
  };

  useEffect(() => {
    if (phase !== 'training' || blocks.length === 0) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 1;
        if (next > blocks.length) {
          setPhase('done');
          return blocks.length;
        }

        // Absorb next block
        setBlocks(prevBlocks => {
          const updated = [...prevBlocks];
          if (next - 1 < updated.length) {
            updated[next - 1] = { ...updated[next - 1], absorbed: true };
          }
          return updated;
        });

        // Grow brain
        setBrainSize(30 + next * 4);

        return next;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [phase, blocks.length]);

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

    // Draw brain
    const brainR = brainSize;
    const brainGlow = phase === 'done' ? 20 : 10;
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, brainR + brainGlow);
    gradient.addColorStop(0, '#8B5CF630');
    gradient.addColorStop(0.7, '#8B5CF615');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, brainR + brainGlow, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, brainR, 0, Math.PI * 2);
    ctx.fillStyle = '#1e1040';
    ctx.fill();
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Brain icon
    ctx.fillStyle = '#8B5CF6';
    ctx.font = `${Math.max(16, brainR * 0.6)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🧠', cx, cy);

    // Brain size label
    ctx.fillStyle = '#64748b';
    ctx.font = '9px sans-serif';
    ctx.fillText(`知识量: ${brainR.toFixed(0)}`, cx, cy + brainR + 14);

    // Draw knowledge blocks
    blocks.forEach((block, i) => {
      if (block.absorbed) {
        // Show absorbed state inside brain
        const angle = (i / blocks.length) * Math.PI * 2;
        const r = brainR * 0.55;
        const bx = cx + Math.cos(angle) * r;
        const by = cy + Math.sin(angle) * r;
        ctx.fillStyle = block.color + '60';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(block.icon, bx, by);
        return;
      }

      const bx = block.x;
      const by = block.y;

      // Block background
      ctx.beginPath();
      ctx.roundRect(bx - 24, by - 16, 48, 32, 8);
      ctx.fillStyle = block.color + '15';
      ctx.fill();
      ctx.strokeStyle = block.color + '60';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Icon
      ctx.fillStyle = block.color;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(block.icon, bx, by - 2);

      // Label
      ctx.fillStyle = block.color;
      ctx.font = '8px sans-serif';
      ctx.fillText(block.label, bx, by + 12);

      // Line to brain
      ctx.beginPath();
      ctx.moveTo(bx, by + (by > cy ? -18 : 18));
      ctx.lineTo(cx, cy + (by > cy ? -brainR : brainR));
      ctx.strokeStyle = block.color + '20';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Progress bar
    const barW = rect.width - 40;
    const barH = 6;
    const barX = 20;
    const barY = rect.height - 20;
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 3);
    ctx.fill();
    const fillW = (progress / blocks.length) * barW;
    ctx.fillStyle = '#8B5CF6';
    ctx.beginPath();
    ctx.roundRect(barX, barY, Math.max(0, fillW), barH, 3);
    ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`预训练进度: ${Math.round((progress / blocks.length) * 100)}%`, rect.width / 2, barY - 6);

    // Done message
    if (phase === 'done') {
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✅ 预训练完成！模型获得了通用知识', rect.width / 2, 16);
    }
  }, [blocks, phase, progress, brainSize]);

  const reset = () => {
    setPhase('idle');
    setProgress(0);
    setBrainSize(30);
    setBlocks([]);
  };

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex gap-2 items-center">
        <button
          onClick={startTraining}
          disabled={phase === 'training'}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors disabled:opacity-50"
        >
          {phase === 'idle' ? '🚀 开始预训练' : phase === 'training' ? '⏳ 训练中...' : '✅ 已完成'}
        </button>
        <button
          onClick={reset}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          🔄 重置
        </button>
      </div>
      <div style={{ height: '240px', position: 'relative' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
    </div>
  );
}
