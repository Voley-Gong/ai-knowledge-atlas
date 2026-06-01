'use client';

import { useRef, useEffect, useState } from 'react';

/**
 * Scaling Law（缩放定律）交互演示
 * AI能力的物理定律——模型越大、数据越多、算力越强，效果越好
 */

const MILESTONES = [
  { name: 'GPT-2', params: '1.5B', year: 2019, perf: 30 },
  { name: 'GPT-3', params: '175B', year: 2020, perf: 52 },
  { name: 'Chinchilla', params: '70B', year: 2022, perf: 60 },
  { name: 'GPT-4', params: '~1.8T', year: 2023, perf: 78 },
  { name: 'Llama 3', params: '405B', year: 2024, perf: 75 },
  { name: '未来?', params: '10T+', year: 2026, perf: 90 },
];

export default function ScalingLawInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paramsMultiplier, setParamsMultiplier] = useState(50);
  const [dataMultiplier, setDataMultiplier] = useState(50);
  const [computeMultiplier, setComputeMultiplier] = useState(50);

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

    // === 上方：缩放曲线 ===
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📈 AI能力 vs 资源投入（幂律曲线）', pad + 6, 22);

    const chartX = pad + 30;
    const chartY = 32;
    const chartW = rect.width - pad * 2 - 40;
    const chartH = 120;

    // 背景
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.roundRect(chartX - 10, chartY, chartW + 20, chartH, 6);
    ctx.fill();

    // 网格
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    for (let i = 1; i <= 4; i++) {
      const gy = chartY + chartH - (chartH * i / 4);
      ctx.beginPath();
      ctx.moveTo(chartX, gy);
      ctx.lineTo(chartX + chartW, gy);
      ctx.stroke();
    }

    // 幂律曲线
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const x = chartX + (i / 100) * chartW;
      // 幂律：y = x^0.3
      const val = Math.pow(i / 100, 0.3);
      const y = chartY + chartH - val * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 当前投入点
    const combinedScale = (paramsMultiplier + dataMultiplier + computeMultiplier) / 300;
    const currentPerf = Math.pow(combinedScale, 0.3);
    const dotX = chartX + combinedScale * chartW;
    const dotY = chartY + chartH - currentPerf * chartH;

    ctx.beginPath();
    ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#F59E0B';
    ctx.fill();
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${(currentPerf * 100).toFixed(0)}%`, dotX, dotY - 10);

    // 里程碑
    MILESTONES.forEach(m => {
      const mx = chartX + (m.perf / 100) * chartW * 0.85;
      const my = chartY + chartH - (m.perf / 100) * chartH;
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(mx, my, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4b5563';
      ctx.font = '7px sans-serif';
      ctx.fillText(m.name, mx, my - 6);
    });

    // 坐标轴标签
    ctx.fillStyle = '#64748b';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('资源投入 →', chartX + chartW / 2, chartY + chartH + 14);
    ctx.save();
    ctx.translate(chartX - 22, chartY + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('AI能力 ↑', 0, 0);
    ctx.restore();

    // === 下方：三个滑块 ===
    const sliderY = chartY + chartH + 28;
    const sliderW = (rect.width - pad * 4) / 3;

    const sliders = [
      { label: '📐 模型参数', value: paramsMultiplier, color: '#3B82F6' },
      { label: '📊 训练数据', value: dataMultiplier, color: '#10B981' },
      { label: '⚡ 计算算力', value: computeMultiplier, color: '#8B5CF6' },
    ];

    sliders.forEach((s, i) => {
      const sx = pad + i * (sliderW + pad);

      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.roundRect(sx, sliderY, sliderW, 60, 6);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = s.color;
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(s.label, sx + sliderW / 2, sliderY + 14);

      // 值条
      const barY = sliderY + 22;
      const barW = sliderW - 16;
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(sx + 8, barY, barW, 8, 4);
      ctx.fill();
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.roundRect(sx + 8, barY, barW * (s.value / 100), 8, 4);
      ctx.fill();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(`${s.value}%`, sx + sliderW / 2, barY + 24);
    });

    // 底部说明
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📈 Scaling Law = 投入越多产出越好，AI有自己的物理定律', rect.width / 2, rect.height - 8);

  }, [paramsMultiplier, dataMultiplier, computeMultiplier]);

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-[#3B82F6]">📐参数</span>
          <input type="range" min={5} max={100} value={paramsMultiplier}
            onChange={e => setParamsMultiplier(Number(e.target.value))} className="w-16 accent-blue-500" />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-[#10B981]">📊数据</span>
          <input type="range" min={5} max={100} value={dataMultiplier}
            onChange={e => setDataMultiplier(Number(e.target.value))} className="w-16 accent-green-500" />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-[#8B5CF6]">⚡算力</span>
          <input type="range" min={5} max={100} value={computeMultiplier}
            onChange={e => setComputeMultiplier(Number(e.target.value))} className="w-16 accent-purple-500" />
        </div>
        <button
          onClick={() => { setParamsMultiplier(50); setDataMultiplier(50); setComputeMultiplier(50); }}
          className="px-2 py-1 rounded bg-[#1e293b] text-xs text-[#94a3b8] hover:text-white transition-colors ml-auto"
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
