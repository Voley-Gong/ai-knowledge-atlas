'use client';

import { useRef, useEffect, useState } from 'react';

const STEPS_FLOW = [
  { label: '输入', sublabel: 'Token Embedding', color: '#3B82F6' },
  { label: 'Multi-Head Attention', sublabel: '收集信息', color: '#8B5CF6' },
  { label: 'Add & Norm', sublabel: '残差 + 归一化', color: '#10B981' },
  { label: 'Feed Forward', sublabel: '消化吸收', color: '#F59E0B' },
  { label: 'Add & Norm', sublabel: '残差 + 归一化', color: '#10B981' },
  { label: '输出', sublabel: '下一层/最终输出', color: '#3B82F6' },
];

const DIM_STEPS = [
  { label: '输入', dim: 512, color: '#3B82F6' },
  { label: '升维 W₁', dim: 2048, color: '#F59E0B' },
  { label: '激活 GELU', dim: 2048, color: '#8B5CF6' },
  { label: '降维 W₂', dim: 512, color: '#10B981' },
];

export default function FeedForwardInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(-1); // -1 = not started
  const [showDims, setShowDims] = useState(false);

  const nextStep = () => setStep(s => Math.min(s + 1, STEPS_FLOW.length - 1));
  const prevStep = () => setStep(s => Math.max(s - 1, -1));

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

    if (!showDims) {
      // === Main flow diagram ===
      const flowX = 20;
      const flowW = rect.width * 0.58 - 20;
      const stepH = 26;
      const stepSpacing = stepH + 6;
      const startY = 15;

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('🏗️ Transformer Block 数据流', flowX, 12);

      STEPS_FLOW.forEach((s, i) => {
        const sy = startY + 15 + i * stepSpacing;
        const isActive = step >= i;
        const isCurrent = step === i;

        // Step box
        ctx.beginPath();
        ctx.roundRect(flowX, sy, flowW, stepH, 5);
        ctx.fillStyle = isCurrent ? s.color + '25' : isActive ? s.color + '10' : '#111827';
        ctx.fill();
        ctx.strokeStyle = isCurrent ? s.color : isActive ? s.color + '50' : '#1e293b';
        ctx.lineWidth = isCurrent ? 2 : 1;
        ctx.stroke();

        // Step number
        ctx.fillStyle = isCurrent ? s.color : isActive ? s.color + '80' : '#334155';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${i + 1}`, flowX + 12, sy + 16);

        // Label
        ctx.fillStyle = isCurrent ? '#fff' : isActive ? s.color : '#4b5563';
        ctx.font = `${isCurrent ? 'bold ' : ''}10px sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(s.label, flowX + 26, sy + 11);
        ctx.fillStyle = isCurrent ? s.color + 'cc' : '#334155';
        ctx.font = '8px sans-serif';
        ctx.fillText(s.sublabel, flowX + 26, sy + 22);

        // Arrow to next
        if (i < STEPS_FLOW.length - 1 && isActive) {
          const arrowY = sy + stepH + 2;
          ctx.fillStyle = step > i ? STEPS_FLOW[i + 1].color + '80' : '#334155';
          ctx.beginPath();
          ctx.moveTo(flowX + flowW / 2 - 4, arrowY);
          ctx.lineTo(flowX + flowW / 2, arrowY + 4);
          ctx.lineTo(flowX + flowW / 2 + 4, arrowY);
          ctx.fill();
        }
      });

      // === Right side: explanation ===
      const infoX = rect.width * 0.6;
      const infoW = rect.width * 0.38;

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('📝 FFN 解析', infoX, 12);

      const explanations = [
        '注意力层负责"收集信息"，\n从所有位置提取相关内容',
        '前馈网络(FFN)是"消化层"，\n对每个位置独立做非线性变换',
        'FFN 的两步变换:\n升维 → 激活 → 降维\n(512 → 2048 → 512)',
        '升维让模型有更多"思考空间"，\n降维把结果压缩回原始维度',
      ];

      const activeIdx = step < 2 ? 0 : step < 4 ? 1 : 2;
      const lines = explanations[activeIdx].split('\n');
      lines.forEach((line, li) => {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px sans-serif';
        ctx.fillText(line, infoX, 30 + li * 14);
      });

      // FFN zoom-in
      const zoomY = 75;
      ctx.fillStyle = '#4b5563';
      ctx.font = '9px sans-serif';
      ctx.fillText('FFN = Linear(xW₁ + b₁) → xW₂ + b₂', infoX, zoomY);

      // Animated data flow
      if (step >= 3) {
        const flowAnimY = zoomY + 20;
        ctx.fillStyle = '#F59E0B20';
        ctx.beginPath();
        ctx.roundRect(infoX, flowAnimY, infoW - 10, 40, 5);
        ctx.fill();

        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText('📊 维度变化:', infoX + 5, flowAnimY + 12);

        ctx.fillStyle = '#3B82F6';
        ctx.font = '10px sans-serif';
        ctx.fillText('512', infoX + 10, flowAnimY + 27);
        ctx.fillStyle = '#64748b';
        ctx.fillText('→', infoX + 35, flowAnimY + 27);
        ctx.fillStyle = '#F59E0B';
        ctx.fillText('2048', infoX + 48, flowAnimY + 27);
        ctx.fillStyle = '#64748b';
        ctx.fillText('→', infoX + 82, flowAnimY + 27);
        ctx.fillStyle = '#10B981';
        ctx.fillText('512', infoX + 95, flowAnimY + 27);

        ctx.fillStyle = '#64748b';
        ctx.font = '8px sans-serif';
        ctx.fillText('升维4x → GELU激活 → 降维回原', infoX + 5, flowAnimY + 38);
      }

    } else {
      // === Dimension visualization ===
      const barMaxH = 140;
      const barW = rect.width / (DIM_STEPS.length * 2.5);
      const maxDim = 2048;
      const startX = rect.width / 2 - (DIM_STEPS.length * barW * 1.5) / 2;

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📊 FFN 维度变化柱状图', rect.width / 2, 14);

      DIM_STEPS.forEach((ds, i) => {
        const bx = startX + i * barW * 1.8;
        const barH = (ds.dim / maxDim) * barMaxH;
        const by = 25 + barMaxH - barH;

        // Bar
        ctx.fillStyle = ds.color + '40';
        ctx.beginPath();
        ctx.roundRect(bx, by, barW, barH, 4);
        ctx.fill();
        ctx.strokeStyle = ds.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Dimension label
        ctx.fillStyle = ds.color;
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ds.dim.toString(), bx + barW / 2, by - 5);

        // Step label
        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px sans-serif';
        ctx.fillText(ds.label, bx + barW / 2, 25 + barMaxH + 14);
      });

      // Arrow between bars
      ctx.fillStyle = '#64748b';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      DIM_STEPS.forEach((_, i) => {
        if (i < DIM_STEPS.length - 1) {
          const ax = startX + i * barW * 1.8 + barW + barW * 0.4;
          ctx.fillText('→', ax, 25 + barMaxH / 2);
        }
      });

      // Explanation
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💡 先升维到4倍(更多表达空间) → 激活函数增加非线性 → 降维回来', rect.width / 2, 25 + barMaxH + 35);

      // Parameters info
      const params = 512 * 2048 + 2048 + 2048 * 512 + 512;
      ctx.fillStyle = '#4b5563';
      ctx.font = '9px sans-serif';
      ctx.fillText(`参数量: ~${(params / 1e6).toFixed(1)}M (单层FFN)`, rect.width / 2, 25 + barMaxH + 50);
    }
  }, [step, showDims]);

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex gap-2 items-center">
        <button
          onClick={prevStep}
          disabled={step <= -1}
          className="px-3 py-1 rounded bg-[#1e293b] text-xs text-[#94a3b8] hover:text-white disabled:opacity-50 transition-colors"
        >
          ← 上一步
        </button>
        <button
          onClick={nextStep}
          disabled={step >= STEPS_FLOW.length - 1}
          className="px-3 py-1 rounded bg-[#1e293b] text-xs text-[#94a3b8] hover:text-white disabled:opacity-50 transition-colors"
        >
          下一步 →
        </button>
        <button
          onClick={() => { setShowDims(!showDims); setStep(-1); }}
          className={`px-3 py-1 rounded text-xs transition-colors ${
            showDims ? 'bg-[#F59E0B20] text-[#F59E0B]' : 'bg-[#1e293b] text-[#64748b] hover:text-white'
          }`}
        >
          {showDims ? '🔄 流程图' : '📊 维度图'}
        </button>
        {step >= 0 && (
          <span className="text-xs text-[#64748b]">
            步骤 {step + 1}/{STEPS_FLOW.length}
          </span>
        )}
      </div>
      <div style={{ height: '240px', position: 'relative' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
    </div>
  );
}
