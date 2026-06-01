'use client';

import { useRef, useEffect, useState } from 'react';

/**
 * Embodied AI（具身智能）交互演示
 * 让AI拥有"身体"，在真实物理世界中感知和行动
 * 类比：AI从《黑客帝国》的虚拟世界走出来，拥有真实的机器人身体
 */

const ROBOT = { x: 0, y: 0, dir: 0 }; // dir: 0=右, 90=下, 180=左, 270=上

type Task = 'grasp' | 'navigate' | 'stack';

export default function EmbodiedAIInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(0);
  const [task, setTask] = useState<Task>('grasp');
  const [autoPlaying, setAutoPlaying] = useState(false);

  const taskInfo: Record<Task, { name: string; steps: string[] }> = {
    grasp: {
      name: '🎯 抓取任务',
      steps: ['感知环境', '识别目标物体', '规划抓取路径', '执行抓取', '验证成功'],
    },
    navigate: {
      name: '🧭 导航任务',
      steps: ['构建地图', '定位自身', '规划路线', '避障行走', '到达目标'],
    },
    stack: {
      name: '📦 堆叠任务',
      steps: ['扫描场景', '选择顺序', '抓取第一块', '放置', '抓取第二块堆叠'],
    },
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

    const pad = 16;
    const info = taskInfo[task];
    const sceneW = rect.width * 0.55;
    const panelW = rect.width - sceneW - pad * 3;

    // === 左侧：物理场景 ===
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.roundRect(pad, pad, sceneW, rect.height - pad * 2 - 25, 8);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(info.name, pad + 10, pad + 16);

    const scenePad = 35;
    const sceneInnerW = sceneW - scenePad * 2;
    const sceneInnerH = rect.height - pad * 2 - 25 - scenePad * 2;

    // 网格
    ctx.strokeStyle = '#1e293b40';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 6; i++) {
      const gx = pad + scenePad + (sceneInnerW / 6) * i;
      ctx.beginPath();
      ctx.moveTo(gx, pad + scenePad);
      ctx.lineTo(gx, pad + scenePad + sceneInnerH);
      ctx.stroke();
    }
    for (let i = 0; i <= 4; i++) {
      const gy = pad + scenePad + (sceneInnerH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad + scenePad, gy);
      ctx.lineTo(pad + scenePad + sceneInnerW, gy);
      ctx.stroke();
    }

    // 机器人
    const robotX = pad + scenePad + sceneInnerW * 0.2;
    const robotY = pad + scenePad + sceneInnerH * 0.6;

    // 感知范围（扇形）
    if (step >= 1) {
      ctx.fillStyle = '#3B82F610';
      ctx.beginPath();
      ctx.moveTo(robotX, robotY);
      ctx.arc(robotX, robotY, sceneInnerW * 0.35, -0.5, 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#3B82F640';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 机器人身体
    ctx.fillStyle = step >= 4 ? '#10B981' : '#3B82F6';
    ctx.beginPath();
    ctx.arc(robotX, robotY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🤖', robotX, robotY + 4);

    // 目标物体
    const targetX = pad + scenePad + sceneInnerW * 0.7;
    const targetY = pad + scenePad + sceneInnerH * 0.4;

    // 障碍物
    const obsX = pad + scenePad + sceneInnerW * 0.45;
    const obsY = pad + scenePad + sceneInnerH * 0.5;
    ctx.fillStyle = '#EF444430';
    ctx.beginPath();
    ctx.roundRect(obsX - 12, obsY - 8, 24, 16, 3);
    ctx.fill();
    ctx.fillStyle = '#EF4444';
    ctx.font = '9px sans-serif';
    ctx.fillText('障碍', obsX, obsY + 3);

    // 目标物体
    if (task === 'grasp') {
      ctx.fillStyle = step >= 4 ? '#10B98160' : '#F59E0B60';
      ctx.beginPath();
      ctx.roundRect(targetX - 14, targetY - 10, 28, 20, 4);
      ctx.fill();
      ctx.fillStyle = '#F59E0B';
      ctx.font = '9px sans-serif';
      ctx.fillText('目标', targetX, targetY + 3);
    } else if (task === 'navigate') {
      ctx.fillStyle = '#10B98140';
      ctx.beginPath();
      ctx.arc(targetX, targetY, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#10B981';
      ctx.font = '9px sans-serif';
      ctx.fillText('终点', targetX, targetY + 3);
    } else {
      // stack - 两个方块
      ctx.fillStyle = '#F59E0B60';
      ctx.beginPath();
      ctx.roundRect(targetX - 14, targetY - 5, 28, 20, 4);
      ctx.fill();
      ctx.fillStyle = '#8B5CF660';
      ctx.beginPath();
      ctx.roundRect(targetX + 24, targetY - 5, 28, 20, 4);
      ctx.fill();
    }

    // 路径规划线
    if (step >= 2) {
      ctx.strokeStyle = '#3B82F660';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(robotX + 12, robotY);
      // 绕过障碍物
      ctx.quadraticCurveTo(obsX - 30, obsY - 30, targetX - 14, targetY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 箭头
      ctx.fillStyle = '#3B82F6';
      ctx.beginPath();
      ctx.moveTo(targetX - 20, targetY - 4);
      ctx.lineTo(targetX - 14, targetY);
      ctx.lineTo(targetX - 20, targetY + 4);
      ctx.fill();
    }

    // 执行动画
    if (step >= 3) {
      const progress = Math.min((step - 3) / 1.5, 1);
      const movingX = robotX + (targetX - robotX - 26) * progress;
      const movingY = robotY + (targetY - robotY) * progress - Math.sin(progress * Math.PI) * 30;
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(movingX, movingY, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // 成功标记
    if (step >= 4) {
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✅', targetX, targetY - 20);
    }

    // === 右侧：感知-决策-执行面板 ===
    const panelX = sceneW + pad * 2;
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.roundRect(panelX, pad, panelW, rect.height - pad * 2 - 25, 8);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🔄 感知→思考→行动', panelX + 10, pad + 16);

    // 步骤列表
    info.steps.forEach((s, i) => {
      const sy = pad + 36 + i * 34;
      const isActive = step >= i + 1;
      const isCurrent = step === i;

      ctx.beginPath();
      ctx.roundRect(panelX + 8, sy, panelW - 16, 28, 6);
      ctx.fillStyle = isCurrent ? '#3B82F620' : isActive ? '#10B98110' : '#0a0e1a';
      ctx.fill();
      ctx.strokeStyle = isCurrent ? '#3B82F6' : isActive ? '#10B98140' : '#1e293b';
      ctx.lineWidth = isCurrent ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = isActive ? '#e2e8f0' : '#4b5563';
      ctx.font = `${isCurrent ? 'bold ' : ''}10px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(`${isActive ? '✅' : '○'} ${s}`, panelX + 16, sy + 18);

      // 连线
      if (i < info.steps.length - 1) {
        ctx.strokeStyle = isActive ? '#3B82F640' : '#1e293b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(panelX + panelW / 2, sy + 28);
        ctx.lineTo(panelX + panelW / 2, sy + 34);
        ctx.stroke();
      }
    });

    // 底部说明
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🤖 具身AI = 感知 + 决策 + 行动，在真实世界中学习', rect.width / 2, rect.height - 8);

  }, [step, task]);

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setStep(s => Math.min(s + 1, taskInfo[task].steps.length))}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          下一步 →
        </button>
        <button
          onClick={() => setStep(0)}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          🔄 重置
        </button>
        <select
          value={task}
          onChange={e => { setTask(e.target.value as Task); setStep(0); }}
          className="px-2 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] border border-[#334155]"
        >
          <option value="grasp">🎯 抓取任务</option>
          <option value="navigate">🧭 导航任务</option>
          <option value="stack">📦 堆叠任务</option>
        </select>
      </div>
      <div style={{ height: '240px', position: 'relative' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
    </div>
  );
}
