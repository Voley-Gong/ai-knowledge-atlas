'use client';

import { useRef, useEffect, useState } from 'react';

/**
 * Reasoning Model（推理模型）交互演示
 * 让AI在回答前多想一会儿，用更多推理时间换更高质量
 */

const PROBLEM = {
  question: '一个房间里有3盏灯和3个开关在房间外。你只能进房间一次，如何确定每个开关控制哪盏灯？',
  fastAnswer: '随机试一下就好了，反正概率也能猜对一部分。',
  fastCorrect: false,
  reasoningSteps: [
    { label: '分析条件', content: '3个开关、3盏灯、只能进房间一次', icon: '🔍' },
    { label: '发现线索', content: '灯除了亮/灭，还有温度属性！', icon: '💡' },
    { label: '制定策略', content: '开1号等5分钟→关1号→开2号→进去看', icon: '📋' },
    { label: '推理验证', content: '亮的=2号，暗但温的=1号，暗且凉的=3号', icon: '✅' },
  ],
};

export default function ReasoningModelInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(0);
  // 0=ready, 1=fast answer, 2-5=reasoning steps, 6=complete

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

    const pad = 16;

    // 题目
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.roundRect(pad, 8, rect.width - pad * 2, 38, 6);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📝 题目:', pad + 10, 24);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(PROBLEM.question.slice(0, 50), pad + 50, 24);
    ctx.fillText(PROBLEM.question.slice(50), pad + 10, 38);

    const colW = (rect.width - pad * 3) / 2;
    const colY = 52;

    // 左列：快速回答
    const leftX = pad;
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.roundRect(leftX, colY, colW, rect.height - colY - 30, 8);
    ctx.fill();
    ctx.strokeStyle = step >= 1 ? '#EF444440' : '#1e293b';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#EF4444';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ 快速直觉', leftX + colW / 2, colY + 16);

    // Token 消耗
    ctx.fillStyle = '#64748b';
    ctx.font = '8px sans-serif';
    ctx.fillText('消耗: ~50 tokens', leftX + colW / 2, colY + 28);

    if (step >= 1) {
      ctx.fillStyle = '#EF444410';
      ctx.beginPath();
      ctx.roundRect(leftX + 8, colY + 34, colW - 16, 40, 4);
      ctx.fill();
      ctx.fillStyle = '#EF4444';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'left';
      const words = PROBLEM.fastAnswer.match(/.{1,12}/g) || [];
      words.forEach((w, i) => ctx.fillText(w, leftX + 14, colY + 50 + i * 13));

      // 错误标记
      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('❌ 回答不靠谱', leftX + colW / 2, colY + 90);
    }

    // 右列：推理模式
    const rightX = pad * 2 + colW;
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.roundRect(rightX, colY, colW, rect.height - colY - 30, 8);
    ctx.fill();
    ctx.strokeStyle = step >= 2 ? '#10B98140' : '#1e293b';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🧠 深度推理', rightX + colW / 2, colY + 16);

    ctx.fillStyle = '#64748b';
    ctx.font = '8px sans-serif';
    ctx.fillText('消耗: ~500 tokens', rightX + colW / 2, colY + 28);

    // 推理步骤
    PROBLEM.reasoningSteps.forEach((s, i) => {
      const sy = colY + 36 + i * 34;
      const isActive = step >= i + 2;

      ctx.beginPath();
      ctx.roundRect(rightX + 6, sy, colW - 12, 28, 4);
      ctx.fillStyle = isActive ? '#10B98110' : '#0a0e1a';
      ctx.fill();
      ctx.strokeStyle = isActive ? '#10B98160' : '#1e293b';
      ctx.lineWidth = isActive ? 1 : 0.5;
      ctx.stroke();

      ctx.fillStyle = isActive ? '#10B981' : '#4b5563';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${isActive ? s.icon : '○'} ${s.label}: ${isActive ? s.content : '???'}`, rightX + 12, sy + 18);

      // 连线
      if (i < 3 && isActive) {
        ctx.strokeStyle = '#10B98140';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rightX + colW / 2, sy + 28);
        ctx.lineTo(rightX + colW / 2, sy + 34);
        ctx.stroke();
      }
    });

    // 最终结果
    if (step >= 6) {
      const resultY = colY + 36 + 4 * 34 + 4;
      ctx.fillStyle = '#10B98120';
      ctx.beginPath();
      ctx.roundRect(rightX + 6, resultY, colW - 12, 22, 4);
      ctx.fill();
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✅ 完美解决！', rightX + colW / 2, resultY + 14);
    }

    // 底部
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🤔 推理模型 = 多想一会儿，用时间换质量', rect.width / 2, rect.height - 8);

  }, [step]);

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex gap-2">
        <button
          onClick={() => setStep(s => Math.min(s + 1, 6))}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          {step >= 6 ? '✅ 完成' : '下一步 →'}
        </button>
        <button
          onClick={() => setStep(0)}
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
