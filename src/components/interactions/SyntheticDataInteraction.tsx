'use client';

import { useRef, useEffect, useState } from 'react';

/**
 * Synthetic Data（合成数据）交互演示
 * 用AI生成的数据来训练AI，解决真实数据不够用或太贵的问题
 * 类比：练武功时用木人桩练习——不是真人对打，但足够逼真
 */

// 模拟数据点
const generateRealData = () => {
  const points: { x: number; y: number; label: number }[] = [];
  // 两个高斯分布的聚类
  for (let i = 0; i < 20; i++) {
    points.push({
      x: 0.3 + (Math.random() - 0.5) * 0.2,
      y: 0.3 + (Math.random() - 0.5) * 0.2,
      label: 0,
    });
    points.push({
      x: 0.7 + (Math.random() - 0.5) * 0.2,
      y: 0.7 + (Math.random() - 0.5) * 0.2,
      label: 1,
    });
  }
  return points;
};

const generateSyntheticData = (realData: { x: number; y: number; label: number }[]) => {
  // 在真实数据基础上加噪声生成合成数据
  return realData.map(p => ({
    x: Math.max(0, Math.min(1, p.x + (Math.random() - 0.5) * 0.15)),
    y: Math.max(0, Math.min(1, p.y + (Math.random() - 0.5) * 0.15)),
    label: p.label,
  }));
};

export default function SyntheticDataInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(0);
  const [ratio, setRatio] = useState(50);
  const [realData] = useState(generateRealData);
  const [syntheticData] = useState(() => generateSyntheticData(generateRealData()));

  const steps = ['真实数据', 'AI 学习分布', '生成合成数据', '混合训练'];

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
    const areaW = (rect.width - pad * 3) / 2;
    const areaH = (rect.height - pad * 2 - 50) * 0.7;

    const drawDataArea = (
      offsetX: number, offsetY: number,
      title: string, points: { x: number; y: number; label: number }[],
      showSynthetic: boolean, syntheticPts: { x: number; y: number; label: number }[]
    ) => {
      // 背景
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.roundRect(offsetX, offsetY, areaW, areaH, 8);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 标题
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(title, offsetX + 8, offsetY + 16);

      const plotPad = 28;
      const plotW = areaW - plotPad * 2;
      const plotH = areaH - plotPad - 12;

      // 坐标轴
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(offsetX + plotPad, offsetY + plotPad);
      ctx.lineTo(offsetX + plotPad, offsetY + plotPad + plotH);
      ctx.lineTo(offsetX + plotPad + plotW, offsetY + plotPad + plotH);
      ctx.stroke();

      // 真实数据点
      const realCount = Math.round(points.length * ratio / 100);
      const realPts = points.slice(0, realCount);
      realPts.forEach(p => {
        ctx.beginPath();
        ctx.arc(
          offsetX + plotPad + p.x * plotW,
          offsetY + plotPad + (1 - p.y) * plotH,
          3, 0, Math.PI * 2
        );
        ctx.fillStyle = p.label === 0 ? '#3B82F6' : '#8B5CF6';
        ctx.fill();
      });

      // 合成数据点
      if (showSynthetic) {
        const synthCount = points.length - realCount;
        syntheticPts.slice(0, synthCount).forEach(p => {
          ctx.beginPath();
          ctx.arc(
            offsetX + plotPad + p.x * plotW,
            offsetY + plotPad + (1 - p.y) * plotH,
            3, 0, Math.PI * 2
          );
          ctx.fillStyle = p.label === 0 ? '#3B82F630' : '#8B5CF630';
          ctx.fill();
          ctx.strokeStyle = p.label === 0 ? '#3B82F660' : '#8B5CF660';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        });
      }

      // 图例
      ctx.font = '9px sans-serif';
      ctx.fillStyle = '#3B82F6';
      ctx.beginPath();
      ctx.arc(offsetX + 10, offsetY + areaH - 12, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText('真实', offsetX + 16, offsetY + areaH - 9);

      if (showSynthetic) {
        ctx.fillStyle = '#8B5CF660';
        ctx.strokeStyle = '#8B5CF660';
        ctx.beginPath();
        ctx.arc(offsetX + 55, offsetY + areaH - 12, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#8B5CF6';
        ctx.fillText('合成', offsetX + 61, offsetY + areaH - 9);
      }
    };

    // 左侧：数据分布
    drawDataArea(pad, pad + 28, step >= 2 ? '📊 数据分布（混合）' : '📊 真实数据分布', realData, step >= 3, syntheticData);

    // 右侧：训练效果
    const rightX = pad * 2 + areaW;
    drawDataArea(rightX, pad + 28, '📈 模型训练效果', realData, step >= 3, syntheticData);

    // 训练效果指标（右侧）
    if (step >= 3) {
      const metricY = pad + 28 + areaH + 12;
      const dataUsed = Math.round(ratio);
      ctx.fillStyle = '#10B981';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`✅ 训练数据量: ${dataUsed}% 真实 + ${100 - dataUsed}% 合成`, rightX + 8, metricY);

      // 效果条
      const barY = metricY + 12;
      const barW = areaW - 16;
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(rightX + 8, barY, barW, 8, 4);
      ctx.fill();
      const accuracy = 0.75 + (dataUsed / 100) * 0.05 + ((100 - dataUsed) / 100) * 0.15;
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.roundRect(rightX + 8, barY, barW * Math.min(accuracy, 0.98), 8, 4);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '9px sans-serif';
      ctx.fillText(`准确率 ${(accuracy * 100).toFixed(1)}%`, rightX + 12, barY + 7);
    }

    // 底部统计
    if (step >= 2) {
      const statY = pad + 28 + areaH + 12;
      ctx.fillStyle = '#60A5FA';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`🤖 AI 学习真实数据分布...`, pad + 8, statY);
      ctx.fillStyle = '#10B981';
      ctx.fillText(`生成 ${syntheticData.length} 条合成数据`, pad + 8, statY + 14);
    }

    // 步骤指示
    const stepY = rect.height - 18;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`步骤 ${step + 1}/4: ${steps[step]}`, rect.width / 2, stepY);

  }, [step, ratio, realData, syntheticData]);

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setStep(s => Math.min(s + 1, 3))}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          {step >= 3 ? '✅ 完成' : '下一步 →'}
        </button>
        <button
          onClick={() => { setStep(0); }}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          🔄 重置
        </button>
        {step >= 3 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-[#64748b]">真实/合成比例</span>
            <input
              type="range"
              min={10}
              max={90}
              value={ratio}
              onChange={e => setRatio(Number(e.target.value))}
              className="w-20 accent-blue-500"
            />
            <span className="text-xs text-[#94a3b8]">{ratio}/{100 - ratio}</span>
          </div>
        )}
      </div>
      <div style={{ height: '250px', position: 'relative' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
    </div>
  );
}
