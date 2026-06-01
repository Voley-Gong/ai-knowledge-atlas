'use client';

import { useRef, useEffect, useState } from 'react';

const QUESTION = '请解释什么是机器学习？';

const RESPONSES = [
  { id: 0, text: '机器学习就是让电脑自己学东西。', score: 2, rank: 3 },
  { id: 1, text: 'ML是AI的一个子领域，通过数据训练模型，使其能从经验中改进性能。', score: 8, rank: 1 },
  { id: 2, text: '机器学习(Machine Learning)是一种数据分析方法，它让计算机能够从数据中学习规律和模式，无需显式编程。主要包括监督学习、无监督学习和强化学习三种范式。', score: 6, rank: 2 },
];

const STEP_LABELS = ['Step 1: 模型生成多个回答', 'Step 2: 人类排序（拖拽调整）', 'Step 3: 奖励模型训练 + PPO微调'];

export default function RLHFInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(0);
  const [rankings, setRankings] = useState<number[]>([2, 0, 1]); // response indices sorted by user rank
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [trainingProgress, setTrainingProgress] = useState(0);

  useEffect(() => {
    if (step !== 2) { setTrainingProgress(0); return; }
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      setTrainingProgress(Math.min(1, frame / 60));
      if (frame >= 60) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [step]);

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

    const pad = 12;

    // Step indicator
    const stepColors = ['#3B82F6', '#10B981', '#8B5CF6'];
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = stepColors[step];
    ctx.fillText(STEP_LABELS[step], rect.width / 2, 14);

    if (step === 0) {
      // Show question and generated responses
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`❓ "${QUESTION}"`, pad, 30);

      RESPONSES.forEach((resp, i) => {
        const ry = 44 + i * 42;
        const respW = rect.width - pad * 2;

        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(pad, ry, respW, 36, 6);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#3B82F6';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`回答 ${String.fromCharCode(65 + i)}:`, pad + 6, ry + 12);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px sans-serif';
        // Truncate text
        const maxChars = Math.floor((respW - 20) / 5.5);
        const displayText = resp.text.length > maxChars ? resp.text.slice(0, maxChars) + '...' : resp.text;
        ctx.fillText(displayText, pad + 6, ry + 26);
      });

    } else if (step === 1) {
      // Ranking interface
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('👆 点击回答调整排序（点击交换相邻位置）:', pad, 30);

      rankings.forEach((respIdx, rank) => {
        const resp = RESPONSES[respIdx];
        const ry = 44 + rank * 46;
        const respW = rect.width - pad * 2 - 30;

        // Rank badge
        const badges = ['🥇', '🥈', '🥉'];
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(badges[rank], pad + 12, ry + 18);

        // Response box
        ctx.fillStyle = rank === 0 ? '#10B98115' : '#1e293b';
        ctx.beginPath();
        ctx.roundRect(pad + 28, ry, respW, 40, 6);
        ctx.fill();
        ctx.strokeStyle = rank === 0 ? '#10B98140' : '#334155';
        ctx.lineWidth = rank === 0 ? 1.5 : 1;
        ctx.stroke();

        ctx.fillStyle = rank === 0 ? '#10B981' : '#94a3b8';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'left';
        const maxChars = Math.floor((respW - 12) / 5.5);
        ctx.fillText(resp.text.slice(0, maxChars), pad + 34, ry + 16);
        ctx.fillStyle = '#4b5563';
        ctx.font = '8px sans-serif';
        ctx.fillText(`(原始回答 ${String.fromCharCode(65 + respIdx)})`, pad + 34, ry + 30);
      });

    } else if (step === 2) {
      // Training visualization
      const chartX = pad + 30;
      const chartW = rect.width - pad * 2 - 30;
      const chartY = 30;
      const chartH = 100;

      ctx.fillStyle = '#0a0e1a';
      ctx.beginPath();
      ctx.roundRect(chartX, chartY, chartW, chartH, 4);
      ctx.fill();

      // Axes labels
      ctx.fillStyle = '#4b5563';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('训练轮次 →', chartX + chartW / 2, chartY + chartH + 12);
      ctx.save();
      ctx.translate(chartX - 10, chartY + chartH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('回答质量 ↑', 0, 0);
      ctx.restore();

      // Training curve
      if (trainingProgress > 0) {
        const points = Math.floor(trainingProgress * 50);
        ctx.beginPath();
        ctx.strokeStyle = '#8B5CF6';
        ctx.lineWidth = 2;
        for (let i = 0; i <= points; i++) {
          const t = i / 50;
          const quality = 0.3 + 0.65 * (1 - Math.exp(-3 * t)) + Math.sin(t * 8) * 0.05 * (1 - t);
          const px = chartX + 5 + t * (chartW - 10);
          const py = chartY + chartH - 5 - quality * (chartH - 10);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Reward model info
      const infoY = chartY + chartH + 22;
      ctx.fillStyle = '#8B5CF6';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('🤖 奖励模型', pad, infoY);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px sans-serif';
      ctx.fillText('学习人类偏好，给回答打分', pad, infoY + 14);

      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('🎯 PPO 微调', pad + 140, infoY);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px sans-serif';
      ctx.fillText('用奖励信号优化策略', pad + 140, infoY + 14);

      // Progress
      const prog = trainingProgress * 100;
      ctx.fillStyle = '#64748b';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`训练进度: ${prog.toFixed(0)}% | 质量评分: ${(0.3 + 0.65 * trainingProgress).toFixed(2)}`, rect.width / 2, infoY + 32);

      // Dog training analogy
      ctx.fillStyle = '#4b5563';
      ctx.font = '9px sans-serif';
      ctx.fillText('🐕 就像训狗：做对了给奖励🦴，做错了纠正', rect.width / 2, infoY + 46);
    }
  }, [step, rankings, trainingProgress]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (step !== 1) return;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const my = e.clientY - rect.top;

    // Check which ranking slot was clicked
    rankings.forEach((_, rank) => {
      const ry = 44 + rank * 46;
      if (my >= ry && my <= ry + 40) {
        // Swap with next or previous
        if (rank < rankings.length - 1) {
          setRankings(prev => {
            const next = [...prev];
            [next[rank], next[rank + 1]] = [next[rank + 1], next[rank]];
            return next;
          });
        }
      }
    });
  };

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex gap-2 items-center">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step <= 0}
          className="px-3 py-1 rounded bg-[#1e293b] text-xs text-[#94a3b8] hover:text-white disabled:opacity-50 transition-colors"
        >
          ← 上一步
        </button>
        <button
          onClick={() => setStep(s => Math.min(2, s + 1))}
          disabled={step >= 2}
          className="px-3 py-1 rounded bg-[#1e293b] text-xs text-[#94a3b8] hover:text-white disabled:opacity-50 transition-colors"
        >
          下一步 →
        </button>
        <span className="text-xs text-[#64748b]">RLHF 三步流程</span>
      </div>
      <div style={{ height: '240px', position: 'relative' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
          onClick={handleClick}
        />
      </div>
    </div>
  );
}
