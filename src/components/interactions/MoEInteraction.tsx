'use client';

import { useState, useRef, useEffect } from 'react';

/**
 * MoE (Mixture of Experts) 交互原型
 * 展示多个专家中只有部分被激活
 */

interface Expert {
  id: number;
  name: string;
  specialty: string;
  color: string;
}

const experts: Expert[] = [
  { id: 0, name: '专家A', specialty: '数学', color: '#3B82F6' },
  { id: 1, name: '专家B', specialty: '代码', color: '#8B5CF6' },
  { id: 2, name: '专家C', specialty: '语言', color: '#10B981' },
  { id: 3, name: '专家D', specialty: '推理', color: '#F59E0B' },
  { id: 4, name: '专家E', specialty: '创意', color: '#EC4899' },
  { id: 5, name: '专家F', specialty: '常识', color: '#06B6D4' },
  { id: 6, name: '专家G', specialty: '翻译', color: '#F97316' },
  { id: 7, name: '专家H', specialty: '分析', color: '#14B8A6' },
];

const inputs = [
  { text: '解方程 x²+3x-4=0', activated: [0, 3] },
  { text: '用Python写快排', activated: [1, 7] },
  { text: '把"你好"翻译成法语', activated: [2, 6] },
  { text: '写一首关于月亮的诗', activated: [2, 4] },
];

export default function MoEInteraction() {
  const [selectedInput, setSelectedInput] = useState(0);
  const [animating, setAnimating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentInput = inputs[selectedInput];
  const activatedSet = new Set(currentInput.activated);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    // 路由器（中间）
    const routerX = w / 2;
    const routerY = 35;
    const routerR = 20;

    // 绘制路由器
    ctx.beginPath();
    ctx.arc(routerX, routerY, routerR, 0, Math.PI * 2);
    ctx.fillStyle = '#334155';
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('路由器', routerX, routerY + 4);

    // 绘制专家
    const cols = 4;
    const rows = 2;
    const gapX = w / (cols + 1);
    const gapY = 50;
    const startY = 90;

    experts.forEach((expert, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const ex = gapX * (col + 1);
      const ey = startY + row * gapY;
      const isActive = activatedSet.has(expert.id);

      // 连线：路由器到专家
      ctx.beginPath();
      ctx.moveTo(routerX, routerY + routerR);
      ctx.lineTo(ex, ey - 16);
      ctx.strokeStyle = isActive ? expert.color + '80' : '#1e293b';
      ctx.lineWidth = isActive ? 2 : 0.5;
      ctx.stroke();

      // 专家方块
      const size = 30;
      ctx.beginPath();
      const r = 6;
      ctx.roundRect(ex - size / 2, ey - size / 2, size, size, r);
      ctx.fillStyle = isActive ? expert.color + '30' : '#1e293b';
      ctx.fill();
      ctx.strokeStyle = isActive ? expert.color : '#334155';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.stroke();

      // 专家名
      ctx.fillStyle = isActive ? '#e2e8f0' : '#475569';
      ctx.font = isActive ? 'bold 10px sans-serif' : '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(expert.name, ex, ey + 2);

      // 专长标签
      ctx.fillStyle = isActive ? expert.color : '#334155';
      ctx.font = '9px sans-serif';
      ctx.fillText(expert.specialty, ex, ey + size / 2 + 12);

      // 激活标记
      if (isActive) {
        ctx.beginPath();
        ctx.arc(ex + size / 2 - 2, ey - size / 2 + 2, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#22c55e';
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 7px sans-serif';
        ctx.fillText('✓', ex + size / 2 - 2, ey - size / 2 + 4.5);
      }
    });

  }, [selectedInput, activatedSet]);

  const handleInputChange = (idx: number) => {
    setAnimating(true);
    setSelectedInput(idx);
    setTimeout(() => setAnimating(false), 300);
  };

  return (
    <div className="w-full bg-[#0f1425] rounded-xl p-4 space-y-3">
      {/* 输入选择 */}
      <div className="text-xs text-slate-400 mb-1">💬 选择输入：</div>
      <div className="flex flex-wrap gap-2">
        {inputs.map((input, i) => (
          <button
            key={i}
            onClick={() => handleInputChange(i)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
              selectedInput === i
                ? 'border-blue-500/60 bg-blue-500/20 text-blue-300'
                : 'border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-slate-600'
            }`}
          >
            {input.text}
          </button>
        ))}
      </div>

      {/* Canvas 展示 */}
      <canvas
        ref={canvasRef}
        className="w-full rounded-lg"
        style={{ height: '190px' }}
      />

      {/* 统计信息 */}
      <div className="flex items-center justify-between bg-slate-800/40 rounded-lg px-3 py-2">
        <span className="text-xs text-slate-400">
          激活专家: <span className="text-green-400 font-medium">{currentInput.activated.length}</span> / 8
        </span>
        <span className="text-xs text-green-400">
          💡 节省 {Math.round((1 - currentInput.activated.length / 8) * 100)}% 计算
        </span>
      </div>
    </div>
  );
}
