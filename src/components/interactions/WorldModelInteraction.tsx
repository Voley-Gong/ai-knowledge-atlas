'use client';

import { useRef, useEffect, useState } from 'react';

/**
 * World Model（世界模型）交互演示
 * 让AI在内部构建一个"世界模拟器"，理解物理规律和因果关系
 * 类比：你在脑海中可以模拟"杯子掉地上会碎"
 */

interface PhysicsState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'ball' | 'box';
  color: string;
  label: string;
}

export default function WorldModelInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<'no-model' | 'world-model'>('no-model');
  const [simulating, setSimulating] = useState(false);
  const [tick, setTick] = useState(0);
  const animRef = useRef<number>(0);
  const stateRef = useRef<{ objects: PhysicsState[]; grounded: boolean }>({
    objects: [],
    grounded: false,
  });

  const initObjects = (): PhysicsState[] => [
    { x: 120, y: 80, vx: 0, vy: 0, type: 'ball', color: '#3B82F6', label: '球' },
    { x: 100, y: 140, vx: 0, vy: 0, type: 'box', color: '#F59E0B', label: '盒子' },
    { x: 200, y: 110, vx: 0, vy: 0, type: 'box', color: '#10B981', label: '箱子' },
  ];

  const startSim = () => {
    stateRef.current = { objects: initObjects(), grounded: false };
    setSimulating(true);
    setTick(0);
  };

  useEffect(() => {
    if (!simulating) return;
    const interval = setInterval(() => {
      setTick(t => {
        const next = t + 1;
        if (next > 80) {
          setSimulating(false);
          return t;
        }
        return next;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [simulating]);

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

    const midX = rect.width / 2;
    const areaW = midX - 20;
    const areaH = rect.height - 50;
    const groundY = areaH - 10;

    const drawScene = (offsetX: number, title: string, hasGravity: boolean, hasCollision: boolean) => {
      // 背景
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.roundRect(offsetX, 10, areaW, areaH, 8);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 标题
      ctx.fillStyle = hasGravity ? '#10B981' : '#EF4444';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, offsetX + areaW / 2, 30);

      // 地面
      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(offsetX + 10, groundY);
      ctx.lineTo(offsetX + areaW - 10, groundY);
      ctx.stroke();
      ctx.fillStyle = '#4b556380';
      ctx.font = '8px sans-serif';
      ctx.fillText('地面', offsetX + areaW / 2, groundY + 12);

      // 模拟物体
      const objs = stateRef.current.objects;
      objs.forEach((obj, i) => {
        let ox = obj.x;
        let oy = obj.y;
        const t = tick;

        if (hasGravity && t > 0) {
          // 有世界模型：重力 + 碰撞
          oy = obj.y + Math.min(t * t * 0.05, groundY - obj.y - 25);
          if (oy >= groundY - 25) {
            oy = groundY - 25;
          }
          // 简单碰撞检测
          if (hasCollision) {
            objs.forEach((other, j) => {
              if (i !== j) {
                const otherOy = other.y + Math.min(t * t * 0.05, groundY - other.y - 25);
                if (otherOy >= groundY - 25) otherOy === groundY - 25;
              }
            });
          }
        } else if (!hasGravity && t > 0) {
          // 无世界模型：物体乱飞或穿透
          ox = obj.x + Math.sin(t * 0.1 + i) * 20;
          oy = obj.y + Math.cos(t * 0.15 + i * 2) * 15;
          // 可能穿透地面
          oy = Math.max(20, oy);
        }

        const drawX = offsetX + 20 + (ox - 80) * (areaW - 40) / 200;
        const drawY = 45 + (oy - 60) * (areaH - 80) / 150;

        if (obj.type === 'ball') {
          ctx.beginPath();
          ctx.arc(drawX, drawY, 14, 0, Math.PI * 2);
          ctx.fillStyle = obj.color + (hasGravity ? '' : '60');
          ctx.fill();
          ctx.strokeStyle = obj.color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else {
          ctx.fillStyle = obj.color + (hasGravity ? '' : '60');
          ctx.beginPath();
          ctx.roundRect(drawX - 16, drawY - 12, 32, 24, 4);
          ctx.fill();
          ctx.strokeStyle = obj.color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // 标签
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(obj.label, drawX, drawY + 3);
      });

      // 状态提示
      if (tick > 0) {
        const statusY = areaH - 25;
        if (hasGravity) {
          ctx.fillStyle = '#10B981';
          ctx.font = '9px sans-serif';
          ctx.fillText('✅ 物体自然落地，符合物理规律', offsetX + areaW / 2, statusY);
        } else {
          ctx.fillStyle = '#EF4444';
          ctx.font = '9px sans-serif';
          ctx.fillText('❌ 物体乱飞，违反物理规律', offsetX + areaW / 2, statusY);
        }
      }
    };

    // 左侧：无世界模型
    drawScene(10, '❌ 无世界模型', false, false);
    // 右侧：有世界模型
    drawScene(midX + 10, '✅ 有世界模型', true, true);

    // 分隔线
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(midX, 10);
    ctx.lineTo(midX, areaH + 10);
    ctx.stroke();
    ctx.setLineDash([]);

    // 底部说明
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌍 世界模型让AI理解物理规律，预测"如果...会怎样"', rect.width / 2, rect.height - 8);

  }, [tick, mode]);

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex gap-2">
        <button
          onClick={startSim}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          🎬 模拟物理场景
        </button>
        <button
          onClick={() => { setSimulating(false); setTick(0); stateRef.current = { objects: initObjects(), grounded: false }; }}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          🔄 重置
        </button>
        {simulating && (
          <span className="text-xs text-[#10B981] flex items-center gap-1">
            <span className="animate-pulse">●</span> 模拟中...
          </span>
        )}
      </div>
      <div style={{ height: '240px', position: 'relative' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
    </div>
  );
}
