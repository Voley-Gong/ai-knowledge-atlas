'use client';

import { useRef, useEffect, useState } from 'react';

/**
 * AI Chip（AI芯片与算力基础设施）交互演示
 * 驱动AI运行的硬件基础——从GPU到专用AI芯片
 * 类比：AI模型是赛车，算法是驾驶技术，算力是汽油
 */

interface Chip {
  name: string;
  tflops: number;
  memory: number;
  year: number;
  color: string;
  desc: string;
}

const CHIPS: Chip[] = [
  { name: 'NVIDIA A100', tflops: 312, memory: 80, year: 2020, color: '#76B900', desc: '数据中心标准' },
  { name: 'NVIDIA H100', tflops: 989, memory: 80, year: 2022, color: '#76B900', desc: '训练主力' },
  { name: 'NVIDIA B200', tflops: 2250, memory: 192, year: 2024, color: '#76B900', desc: 'Blackwell 架构' },
  { name: 'Google TPU v5', tflops: 459, memory: 95, year: 2023, color: '#4285F4', desc: '谷歌自研' },
  { name: '华为昇腾910B', tflops: 320, memory: 64, year: 2022, color: '#CF0A2C', desc: '国产算力' },
  { name: 'AMD MI300X', tflops: 1046, memory: 192, year: 2023, color: '#ED1C24', desc: 'AMD 竞品' },
];

const MODELS = [
  { name: 'GPT-3', params: '175B', chips: 1024, days: 34 },
  { name: 'GPT-4', params: '~1.8T', chips: 25000, days: 100 },
  { name: 'Llama 3 70B', params: '70B', chips: 2048, days: 7 },
];

export default function AIChipInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedChip, setSelectedChip] = useState(2); // B200 default
  const [selectedModel, setSelectedModel] = useState(0);
  const [tab, setTab] = useState<'chips' | 'training'>('chips');

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

    if (tab === 'chips') {
      // === 芯片算力对比柱状图 ===
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('⚡ AI芯片算力对比 (TFLOPS FP16)', pad, 22);

      const barAreaY = 35;
      const barAreaH = rect.height - barAreaY - 60;
      const barW = (rect.width - pad * 2 - 20) / CHIPS.length - 6;
      const maxTflops = Math.max(...CHIPS.map(c => c.tflops));

      CHIPS.forEach((chip, i) => {
        const bx = pad + 10 + i * (barW + 6);
        const barH = (chip.tflops / maxTflops) * (barAreaH - 30);
        const by = barAreaY + barAreaH - barH;

        const isSelected = i === selectedChip;

        // 柱子
        ctx.fillStyle = isSelected ? chip.color : chip.color + '40';
        ctx.beginPath();
        ctx.roundRect(bx, by, barW, barH, 4);
        ctx.fill();

        if (isSelected) {
          ctx.strokeStyle = chip.color;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // 数值
        ctx.fillStyle = isSelected ? '#fff' : '#94a3b8';
        ctx.font = `${isSelected ? 'bold ' : ''}9px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(`${chip.tflops}T`, bx + barW / 2, by - 4);

        // 名称
        ctx.fillStyle = isSelected ? '#e2e8f0' : '#64748b';
        ctx.font = '8px sans-serif';
        ctx.save();
        ctx.translate(bx + barW / 2, barAreaY + barAreaH + 10);
        ctx.fillText(chip.name, 0, 0);
        ctx.restore();

        // 年份
        ctx.fillStyle = '#4b5563';
        ctx.fillText(`${chip.year}`, bx + barW / 2, barAreaY + barAreaH + 22);
      });

      // 选中芯片详情
      const chip = CHIPS[selectedChip];
      const detailY = rect.height - 40;
      ctx.fillStyle = chip.color + '20';
      ctx.beginPath();
      ctx.roundRect(pad, detailY - 5, rect.width - pad * 2, 30, 6);
      ctx.fill();
      ctx.fillStyle = chip.color;
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${chip.name}`, pad + 10, detailY + 10);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText(`| ${chip.desc} | ${chip.memory}GB显存 | ${chip.tflops} TFLOPS`, pad + 10 + ctx.measureText(chip.name).width + 20, detailY + 10);

    } else {
      // === 训练算力需求 ===
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('🏋️ 模型训练算力需求', pad, 22);

      const model = MODELS[selectedModel];

      // 模型信息
      const infoY = 40;
      ctx.fillStyle = '#3B82F6';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(model.name, pad + 10, infoY);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText(`参数量: ${model.params}`, pad + 10, infoY + 18);
      ctx.fillText(`需要: ~${model.chips.toLocaleString()} 张 GPU`, pad + 10, infoY + 34);
      ctx.fillText(`训练时间: ~${model.days} 天`, pad + 10, infoY + 50);

      // GPU 方块阵列
      const gridStartY = infoY + 70;
      const gridSize = 8;
      const cols = Math.ceil(Math.sqrt(Math.min(model.chips, 400)));
      const rows = Math.ceil(Math.min(model.chips, 400) / cols);
      const cellSize = Math.min(8, (rect.width - pad * 2 - 20) / cols);

      ctx.fillStyle = '#64748b';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`GPU 集群 (每方块 ≈ ${Math.ceil(model.chips / (cols * rows))} 张):`, pad + 10, gridStartY);

      const chip = CHIPS[selectedChip];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cx = pad + 10 + c * (cellSize + 1);
          const cy = gridStartY + 12 + r * (cellSize + 1);
          ctx.fillStyle = chip.color + '80';
          ctx.fillRect(cx, cy, cellSize - 1, cellSize - 1);
        }
      }

      // 费用估算
      const costY = gridStartY + 12 + rows * (cellSize + 1) + 16;
      const costPerGPU = 3; // $3/hour approx
      const totalCost = (model.chips * model.days * 24 * costPerGPU / 1000000).toFixed(1);
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`💰 估算训练费用: ~$${totalCost}M`, pad + 10, costY);

      ctx.fillStyle = '#64748b';
      ctx.font = '9px sans-serif';
      ctx.fillText(`(${model.chips} GPU × ${model.days}天 × $${costPerGPU}/小时)`, pad + 10, costY + 14);
    }

    // 底部说明
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⛽ 算力是AI的燃料——模型越大，需要的"油"越多', rect.width / 2, rect.height - 8);

  }, [selectedChip, selectedModel, tab]);

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setTab('chips')}
          className={`px-3 py-1 rounded text-sm transition-colors ${tab === 'chips' ? 'bg-[#3B82F6] text-white' : 'bg-[#1e293b] text-[#94a3b8] hover:text-white'}`}
        >
          ⚡ 芯片对比
        </button>
        <button
          onClick={() => setTab('training')}
          className={`px-3 py-1 rounded text-sm transition-colors ${tab === 'training' ? 'bg-[#3B82F6] text-white' : 'bg-[#1e293b] text-[#94a3b8] hover:text-white'}`}
        >
          🏋️ 训练算力
        </button>
        {tab === 'chips' ? (
          <select
            value={selectedChip}
            onChange={e => setSelectedChip(Number(e.target.value))}
            className="px-2 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] border border-[#334155] ml-auto"
          >
            {CHIPS.map((c, i) => (
              <option key={i} value={i}>{c.name}</option>
            ))}
          </select>
        ) : (
          <select
            value={selectedModel}
            onChange={e => setSelectedModel(Number(e.target.value))}
            className="px-2 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] border border-[#334155] ml-auto"
          >
            {MODELS.map((m, i) => (
              <option key={i} value={i}>{m.name}</option>
            ))}
          </select>
        )}
      </div>
      <div style={{ height: '240px', position: 'relative' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
    </div>
  );
}
