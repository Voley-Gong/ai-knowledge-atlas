'use client';

import { useRef, useEffect, useState } from 'react';

/**
 * Knowledge Distillation（知识蒸馏）交互演示
 * 让小模型拜大模型为师
 * 类比：大学教授把精华整理成教科书给学生
 */

export default function KnowledgeDistillationInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(0);

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
    const midX = rect.width / 2;
    const teacherX = pad + 40;
    const studentX = midX + 20;

    // === 教师（大模型）===
    const teacherW = rect.width / 2 - pad - 30;
    const teacherH = rect.height - 60;

    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.roundRect(teacherX - 10, 10, teacherW, teacherH, 8);
    ctx.fill();
    ctx.strokeStyle = '#3B82F640';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#3B82F6';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👨‍🏫 教师（大模型）', teacherX + teacherW / 2 - 10, 30);

    // 大网络（6x5节点）
    const tNodes = 5;
    const tLayers = 6;
    const tNodeSpacing = teacherW / (tLayers + 1);
    const tLayerSpacing = (teacherH - 50) / (tNodes + 1);

    for (let l = 0; l < tLayers; l++) {
      for (let n = 0; n < tNodes; n++) {
        const nx = teacherX - 10 + tNodeSpacing * (l + 1);
        const ny = 42 + tLayerSpacing * (n + 1);
        const isActive = step >= 1;

        // 连线
        if (l < tLayers - 1) {
          for (let nn = 0; nn < tNodes; nn++) {
            const nnx = teacherX - 10 + tNodeSpacing * (l + 2);
            const nny = 42 + tLayerSpacing * (nn + 1);
            ctx.strokeStyle = isActive ? '#3B82F615' : '#1e293b30';
            ctx.lineWidth = 0.3;
            ctx.beginPath();
            ctx.moveTo(nx, ny);
            ctx.lineTo(nnx, nny);
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.arc(nx, ny, 4, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? '#3B82F6' : '#3B82F630';
        ctx.fill();
      }
    }

    // 模型大小标签
    ctx.fillStyle = '#94a3b8';
    ctx.font = '8px sans-serif';
    ctx.fillText('175B 参数', teacherX + teacherW / 2 - 10, teacherH + 2);

    // === 学生（小模型）===
    const studentW = rect.width / 2 - pad - 30;
    const studentH = rect.height - 60;

    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.roundRect(studentX, 10, studentW, studentH, 8);
    ctx.fill();
    ctx.strokeStyle = step >= 3 ? '#10B98140' : '#1e293b';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = step >= 3 ? '#10B981' : '#F59E0B';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(step >= 3 ? '🎓 学生（蒸馏后）' : '👶 学生（小模型）', studentX + studentW / 2, 30);

    // 小网络（4x3节点）
    const sNodes = 3;
    const sLayers = 4;
    const sNodeSpacing = studentW / (sLayers + 1);
    const sLayerSpacing = (studentH - 50) / (sNodes + 1);

    for (let l = 0; l < sLayers; l++) {
      for (let n = 0; n < sNodes; n++) {
        const nx = studentX + sNodeSpacing * (l + 1);
        const ny = 50 + sLayerSpacing * (n + 1);
        const isActive = step >= 3;

        if (l < sLayers - 1) {
          for (let nn = 0; nn < sNodes; nn++) {
            const nnx = studentX + sNodeSpacing * (l + 2);
            const nny = 50 + sLayerSpacing * (nn + 1);
            ctx.strokeStyle = isActive ? '#10B98115' : '#1e293b30';
            ctx.lineWidth = 0.3;
            ctx.beginPath();
            ctx.moveTo(nx, ny);
            ctx.lineTo(nnx, nny);
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.arc(nx, ny, 4, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? '#10B981' : '#F59E0B30';
        ctx.fill();
      }
    }

    ctx.fillStyle = '#94a3b8';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('1.5B 参数', studentX + studentW / 2, studentH + 2);

    // === 蒸馏过程 ===
    if (step >= 2) {
      const arrowX = teacherX + teacherW - 10;
      const arrowEndX = studentX;
      const arrowY = rect.height / 2 - 10;

      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(arrowEndX, arrowY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 箭头
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(arrowEndX - 2, arrowY - 5);
      ctx.lineTo(arrowEndX + 4, arrowY);
      ctx.lineTo(arrowEndX - 2, arrowY + 5);
      ctx.fill();

      // 软标签
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📋 知识传递', midX + 5, arrowY - 8);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '7px sans-serif';
      ctx.fillText('(软标签分布)', midX + 5, arrowY + 4);
    }

    // 性能对比
    if (step >= 3) {
      const compY = rect.height - 35;
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.roundRect(pad, compY, rect.width - pad * 2, 22, 6);
      ctx.fill();

      ctx.font = '9px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#3B82F6';
      ctx.fillText('教师: 175B → 95%准确率', pad + 10, compY + 14);
      ctx.fillStyle = '#10B981';
      ctx.textAlign = 'right';
      ctx.fillText('学生: 1.5B → 88%准确率（体积↓116倍，性能仅↓7%）', rect.width - pad - 10, compY + 14);
    }

    // 底部
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👨‍🏫 知识蒸馏 = 师父传功，浓缩就是精华', rect.width / 2, rect.height - 8);

  }, [step]);

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex gap-2">
        <button
          onClick={() => setStep(s => Math.min(s + 1, 3))}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          {step >= 3 ? '✅ 完成' : step === 0 ? '开始蒸馏 →' : '下一步 →'}
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
