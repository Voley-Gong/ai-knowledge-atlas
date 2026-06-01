'use client';

import { useRef, useEffect, useState } from 'react';

interface TaskConfig {
  label: string;
  icon: string;
  color: string;
  boostDims: number[];
  desc: string;
}

const DIMS = ['语言理解', '逻辑推理', '知识广度', '创造力', '专业深度', '对话能力'];

const BASE_VALUES = [0.6, 0.55, 0.7, 0.5, 0.4, 0.65];

const TASKS: Record<string, TaskConfig> = {
  medical: {
    label: '医疗诊断',
    icon: '🏥',
    color: '#10B981',
    boostDims: [4, 1],
    desc: '强化医学知识和推理能力',
  },
  legal: {
    label: '法律咨询',
    icon: '⚖️',
    color: '#3B82F6',
    boostDims: [4, 0],
    desc: '强化法律条文理解和应用',
  },
  coding: {
    label: '编程助手',
    icon: '💻',
    color: '#8B5CF6',
    boostDims: [1, 3],
    desc: '强化逻辑推理和代码创造力',
  },
  customer: {
    label: '智能客服',
    icon: '🎧',
    color: '#F59E0B',
    boostDims: [5, 0],
    desc: '强化对话能力和理解力',
  },
};

export default function FineTuningInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [currentValues, setCurrentValues] = useState<number[]>([...BASE_VALUES]);
  const [targetValues, setTargetValues] = useState<number[]>([...BASE_VALUES]);
  const [animating, setAnimating] = useState(false);
  const [showBefore, setShowBefore] = useState(true);

  const selectTask = (taskId: string) => {
    setSelectedTask(taskId);
    setCurrentValues([...BASE_VALUES]);
    setShowBefore(true);

    const task = TASKS[taskId];
    const newValues = BASE_VALUES.map((v, i) => {
      if (task.boostDims.includes(i)) return Math.min(0.95, v + 0.3);
      return Math.max(0.3, v - 0.05); // slight reduction
    });
    setTargetValues(newValues);
  };

  const startFineTuning = () => {
    if (!selectedTask || animating) return;
    setAnimating(true);
    setShowBefore(false);

    let progress = 0;
    const steps = 30;
    const startValues = [...currentValues];

    const interval = setInterval(() => {
      progress++;
      const t = progress / steps;
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // ease in-out

      setCurrentValues(startValues.map((sv, i) => {
        return sv + (targetValues[i] - sv) * eased;
      }));

      if (progress >= steps) {
        clearInterval(interval);
        setAnimating(false);
      }
    }, 50);
  };

  const reset = () => {
    setSelectedTask(null);
    setCurrentValues([...BASE_VALUES]);
    setTargetValues([...BASE_VALUES]);
    setAnimating(false);
    setShowBefore(true);
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
    const cy = rect.height / 2 + 5;
    const maxR = Math.min(rect.width, rect.height) * 0.33;

    // Draw grid circles
    for (let i = 1; i <= 5; i++) {
      const r = (i / 5) * maxR;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Draw axis lines and labels
    const dimCount = DIMS.length;
    DIMS.forEach((dim, i) => {
      const angle = (i / dimCount) * Math.PI * 2 - Math.PI / 2;
      const ex = cx + Math.cos(angle) * maxR;
      const ey = cy + Math.sin(angle) * maxR;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Label
      const lx = cx + Math.cos(angle) * (maxR + 18);
      const ly = cy + Math.sin(angle) * (maxR + 18);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(dim, lx, ly);
    });

    // Draw before values (base) if showing comparison
    if (showBefore && selectedTask) {
      ctx.beginPath();
      DIMS.forEach((_, i) => {
        const angle = (i / dimCount) * Math.PI * 2 - Math.PI / 2;
        const r = BASE_VALUES[i] * maxR;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = '#4b556320';
      ctx.fill();
      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw current radar
    const taskColor = selectedTask ? TASKS[selectedTask].color : '#8B5CF6';
    ctx.beginPath();
    DIMS.forEach((_, i) => {
      const angle = (i / dimCount) * Math.PI * 2 - Math.PI / 2;
      const r = currentValues[i] * maxR;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = taskColor + '20';
    ctx.fill();
    ctx.strokeStyle = taskColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw dots on vertices
    DIMS.forEach((_, i) => {
      const angle = (i / dimCount) * Math.PI * 2 - Math.PI / 2;
      const r = currentValues[i] * maxR;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = taskColor;
      ctx.fill();
    });

    // Status
    if (selectedTask) {
      const task = TASKS[selectedTask];
      ctx.fillStyle = task.color;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${task.icon} ${task.desc}`, 10, 14);

      if (showBefore) {
        ctx.fillStyle = '#4b5563';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('虚线 = 预训练模型 | 实线 = 微调后', rect.width / 2, rect.height - 5);
      }
    } else {
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👆 选择微调任务，观察能力雷达图变化', rect.width / 2, 14);
    }
  }, [currentValues, selectedTask, showBefore]);

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex gap-2 items-center flex-wrap">
        {Object.entries(TASKS).map(([id, task]) => (
          <button
            key={id}
            onClick={() => selectTask(id)}
            className="px-2 py-1 rounded text-xs transition-colors"
            style={{
              backgroundColor: selectedTask === id ? task.color + '25' : '#1e293b',
              color: selectedTask === id ? task.color : '#94a3b8',
              border: selectedTask === id ? `1px solid ${task.color}50` : '1px solid transparent',
            }}
          >
            {task.icon} {task.label}
          </button>
        ))}
        <button
          onClick={startFineTuning}
          disabled={!selectedTask || animating}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors disabled:opacity-50"
        >
          {animating ? '⏳ 微调中...' : '🔧 开始微调'}
        </button>
        <button
          onClick={reset}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          🔄
        </button>
      </div>
      <div style={{ height: '240px', position: 'relative' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
    </div>
  );
}
