'use client';

import { useRef, useEffect, useState } from 'react';

const STEPS = ['query', 'retrieve', 'generate'] as const;
type Step = typeof STEPS[number];

const DOCS = [
  { id: 1, title: 'RAG技术详解.pdf', snippet: 'RAG通过检索外部知识库...' },
  { id: 2, title: '向量数据库指南.pdf', snippet: 'Embedding存储与检索...' },
  { id: 3, title: 'LLM幻觉研究.pdf', snippet: 'AI幻觉的根本原因...' },
  { id: 4, title: '知识库构建.pdf', snippet: '企业知识库最佳实践...' },
];

export default function RAGInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState<number>(0);
  const [query] = useState('什么是RAG？');
  const [autoPlaying, setAutoPlaying] = useState(false);

  const nextStep = () => {
    setStep(s => (s + 1) % 4); // 0=idle, 1=query, 2=retrieve, 3=generate
  };

  const autoPlay = () => {
    if (autoPlaying) {
      setAutoPlaying(false);
      return;
    }
    setAutoPlaying(true);
    setStep(0);
    let s = 0;
    const interval = setInterval(() => {
      s++;
      if (s > 3) {
        clearInterval(interval);
        setAutoPlaying(false);
        return;
      }
      setStep(s);
    }, 1500);
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
    const midY = rect.height / 2;

    // 3-step pipeline
    const stageNames = ['🔍 用户提问', '📚 检索资料库', '🤖 LLM生成回答'];
    const stageColors = ['#3B82F6', '#10B981', '#8B5CF6'];
    const stageW = (rect.width - pad * 2 - 20) / 3;

    stageNames.forEach((name, i) => {
      const x = pad + i * (stageW + 10);
      const isActive = step >= i + 1;
      const isCurrent = step === i + 1;

      ctx.beginPath();
      ctx.roundRect(x, midY - 25, stageW, 50, 10);
      ctx.fillStyle = isCurrent ? stageColors[i] + '30' : isActive ? stageColors[i] + '10' : '#111827';
      ctx.fill();
      ctx.strokeStyle = isCurrent ? stageColors[i] : isActive ? stageColors[i] + '60' : '#334155';
      ctx.lineWidth = isCurrent ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = isCurrent ? '#fff' : isActive ? stageColors[i] : '#4b5563';
      ctx.font = `${isCurrent ? 'bold ' : ''}11px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(name, x + stageW / 2, midY + 4);

      // Arrow to next
      if (i < 2) {
        const ax = x + stageW + 2;
        ctx.fillStyle = isActive && step > i + 1 ? stageColors[i + 1] : '#334155';
        ctx.beginPath();
        ctx.moveTo(ax, midY - 4);
        ctx.lineTo(ax + 6, midY);
        ctx.lineTo(ax, midY + 4);
        ctx.fill();
      }
    });

    // Query text
    if (step >= 1) {
      ctx.fillStyle = '#60A5FA';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`❓ "${query}"`, pad, midY - 45);
    }

    // Retrieved docs
    if (step >= 2) {
      const docsY = midY + 45;
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('检索到的文档:', pad, docsY);

      DOCS.slice(0, 3).forEach((doc, i) => {
        const dy = docsY + 14 + i * 22;
        ctx.fillStyle = '#10B98130';
        ctx.beginPath();
        ctx.roundRect(pad, dy, rect.width - pad * 2, 18, 4);
        ctx.fill();
        ctx.fillStyle = '#10B981';
        ctx.font = '10px sans-serif';
        ctx.fillText(`📄 ${doc.title} — ${doc.snippet}`, pad + 6, dy + 12);
      });
    }

    // Generated answer
    if (step >= 3) {
      const ansY = midY - 75;
      ctx.fillStyle = '#8B5CF620';
      ctx.beginPath();
      ctx.roundRect(pad, ansY, rect.width - pad * 2, 28, 6);
      ctx.fill();
      ctx.fillStyle = '#A78BFA';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('💬 RAG是通过检索外部知识库来增强LLM回答的技术...', pad + 8, ansY + 17);
    }

    // Step indicator
    const stepLabels = ['准备就绪', '步骤1: 提问', '步骤2: 检索', '步骤3: 生成'];
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(stepLabels[step], rect.width / 2, rect.height - 8);
  }, [step, autoPlaying]);

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-2 flex gap-2">
        <button
          onClick={nextStep}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          下一步 →
        </button>
        <button
          onClick={autoPlay}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          {autoPlaying ? '⏹ 停止' : '▶ 自动播放'}
        </button>
      </div>
      <div className="flex-1">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
}
