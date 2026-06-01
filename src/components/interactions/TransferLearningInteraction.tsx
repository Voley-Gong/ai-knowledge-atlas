'use client';

import { useRef, useEffect, useState } from 'react';

/**
 * Transfer Learning（迁移学习）交互演示
 * 把一个领域学到的知识迁移到另一个领域
 * 类比：学会了骑自行车后学摩托车就快多了
 */

export default function TransferLearningInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(0);

  const steps = [
    '源模型（ImageNet）',
    '冻结底层特征',
    '微调顶层',
    '迁移完成',
  ];

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
    const modelW = (rect.width - pad * 3) / 2;
    const modelH = rect.height - 70;

    const drawModel = (
      offsetX: number, title: string, titleColor: string,
      layers: { name: string; frozen: boolean; active: boolean }[]
    ) => {
      // 背景
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.roundRect(offsetX, 10, modelW, modelH, 8);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 标题
      ctx.fillStyle = titleColor;
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, offsetX + modelW / 2, 30);

      // 层
      const layerH = (modelH - 50) / layers.length;
      layers.forEach((layer, i) => {
        const ly = 42 + i * layerH;
        const lw = modelW - 24;
        const lx = offsetX + 12;

        // 层背景
        ctx.beginPath();
        ctx.roundRect(lx, ly, lw, layerH - 4, 4);
        if (layer.frozen && step >= 1) {
          ctx.fillStyle = '#3B82F610';
          ctx.fill();
          ctx.strokeStyle = '#3B82F640';
          ctx.lineWidth = 1;
          ctx.stroke();
          // 冻结图标
          ctx.fillStyle = '#3B82F6';
          ctx.font = '9px sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText('🔒冻结', lx + lw - 6, ly + layerH / 2 + 3);
        } else if (layer.active && step >= 2) {
          ctx.fillStyle = '#10B98115';
          ctx.fill();
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          // 训练中图标
          ctx.fillStyle = '#10B981';
          ctx.font = '9px sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText('🔥训练中', lx + lw - 6, ly + layerH / 2 + 3);
        } else {
          ctx.fillStyle = '#0d1117';
          ctx.fill();
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

        // 层名称
        ctx.fillStyle = layer.frozen && step >= 1 ? '#3B82F6' : layer.active && step >= 2 ? '#10B981' : '#94a3b8';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(layer.name, lx + 8, ly + layerH / 2 + 3);

        // 节点示意
        const nodeCount = layer.name.includes('输入') ? 5 : layer.name.includes('输出') ? 3 : 4;
        const nodeStartX = lx + 8 + ctx.measureText(layer.name).width + 16;
        for (let n = 0; n < nodeCount; n++) {
          const nx = nodeStartX + n * 12;
          if (nx > lx + lw - 70) break;
          ctx.beginPath();
          ctx.arc(nx, ly + layerH / 2, 3, 0, Math.PI * 2);
          ctx.fillStyle = layer.active && step >= 2 ? '#10B98160' : '#3B82F630';
          ctx.fill();
        }
      });
    };

    // 源模型层
    const sourceLayers = [
      { name: '输入层 (图像)', frozen: false, active: false },
      { name: '边缘检测层', frozen: false, active: false },
      { name: '纹理识别层', frozen: false, active: false },
      { name: '形状识别层', frozen: false, active: false },
      { name: '物体部件层', frozen: false, active: false },
      { name: '分类层 (1000类)', frozen: false, active: false },
    ];

    // 目标模型层
    const targetLayers = [
      { name: '输入层 (X光片)', frozen: step >= 1, active: false },
      { name: '边缘检测层', frozen: step >= 1, active: false },
      { name: '纹理识别层', frozen: step >= 1, active: false },
      { name: '形状识别层', frozen: step >= 1, active: false },
      { name: '异常特征层', frozen: false, active: step >= 2 },
      { name: '诊断分类层', frozen: false, active: step >= 2 },
    ];

    drawModel(pad, '📚 源模型 (ImageNet)', '#3B82F6', sourceLayers);
    drawModel(pad * 2 + modelW, '🏥 目标模型 (X光诊断)', '#10B981', targetLayers);

    // 迁移箭头
    if (step >= 1) {
      const arrowX = pad + modelW + 2;
      const arrowEndX = pad * 2 + modelW - 2;
      const arrowY = 42 + (modelH - 50) * 0.3;

      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(arrowEndX, arrowY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 箭头头部
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(arrowEndX - 2, arrowY - 5);
      ctx.lineTo(arrowEndX + 4, arrowY);
      ctx.lineTo(arrowEndX - 2, arrowY + 5);
      ctx.fill();

      ctx.fillStyle = '#F59E0B';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('迁移底层特征', (arrowX + arrowEndX) / 2, arrowY - 8);
    }

    // 步骤指示
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`步骤 ${step + 1}/4: ${steps[step]}`, rect.width / 2, rect.height - 8);

  }, [step]);

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex gap-2">
        <button
          onClick={() => setStep(s => Math.min(s + 1, 3))}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          {step >= 3 ? '✅ 完成' : '下一步 →'}
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
