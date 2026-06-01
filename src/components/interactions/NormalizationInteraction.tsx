'use client';

import { useRef, useEffect, useState } from 'react';

type NormMode = 'none' | 'batchnorm' | 'layernorm';

interface LayerSignal {
  values: number[];
  label: string;
}

function generateSignals(mode: NormMode): LayerSignal[] {
  const layers: LayerSignal[] = [];
  const layerSizes = [8, 8, 8, 8];
  const layerNames = ['输入层', '隐藏层1', '隐藏层2', '输出层'];

  for (let l = 0; l < layerSizes.length; l++) {
    let values: number[];
    if (l === 0) {
      values = [0.2, 0.5, -0.3, 0.8, -0.1, 0.6, 0.4, -0.2];
    } else {
      // Simulate explosion/vanishing without normalization
      const prev = layers[l - 1].values;
      const scale = mode === 'none'
        ? Math.pow(2.5, l) * (Math.random() * 0.5 + 0.75)
        : mode === 'batchnorm'
          ? 0.8 + Math.random() * 0.4
          : 1.0 + Math.random() * 0.3;
      values = prev.map(v => {
        const raw = v * scale + (Math.random() - 0.5) * 0.5;
        if (mode === 'batchnorm') {
          // BatchNorm: normalize to mean 0, var 1, then scale
          return raw * 0.5;
        }
        if (mode === 'layernorm') {
          // LayerNorm: similar normalization
          return Math.tanh(raw) * 0.8;
        }
        return raw;
      });
    }
    layers.push({ values, label: layerNames[l] });
  }
  return layers;
}

export default function NormalizationInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<NormMode>('none');
  const [signals, setSignals] = useState<LayerSignal[]>(() => generateSignals('none'));
  const [animStep, setAnimStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setSignals(generateSignals(mode));
  }, [mode]);

  const runTraining = () => {
    if (animating) return;
    setAnimating(true);
    setAnimStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setSignals(generateSignals(mode));
      setAnimStep(step);
      if (step >= 10) {
        clearInterval(interval);
        setAnimating(false);
      }
    }, 400);
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

    const pad = 15;
    const layerCount = signals.length;
    const barMaxH = 40;
    const layerSpacing = (rect.width - pad * 2) / layerCount;
    const barWidth = 8;
    const barGap = 3;
    const centerY = rect.height / 2 - 10;

    // Title
    const modeNames: Record<NormMode, string> = {
      'none': '❌ 无归一化',
      'batchnorm': '🔵 BatchNorm',
      'layernorm': '🟢 LayerNorm',
    };
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(modeNames[mode], pad, 14);

    // Training stability indicator
    if (animStep > 0) {
      const lastLayer = signals[signals.length - 1].values;
      const variance = lastLayer.reduce((s, v) => s + v * v, 0) / lastLayer.length;
      const stable = mode !== 'none' || variance < 5;
      ctx.fillStyle = stable ? '#10B981' : '#EF4444';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(
        stable ? '✅ 训练稳定' : '⚠️ 梯度不稳定',
        rect.width - pad, 14
      );
    }

    signals.forEach((layer, li) => {
      const layerX = pad + li * layerSpacing + layerSpacing / 2;

      // Layer label
      ctx.fillStyle = '#64748b';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(layer.label, layerX, rect.height - 5);

      // Draw bars
      const totalBarsW = layer.values.length * (barWidth + barGap) - barGap;
      const startX = layerX - totalBarsW / 2;

      layer.values.forEach((val, vi) => {
        const bx = startX + vi * (barWidth + barGap);
        const barH = Math.min(Math.abs(val) * barMaxH / 3, barMaxH);
        const by = val >= 0 ? centerY - barH : centerY;

        // Color based on magnitude
        const magnitude = Math.abs(val);
        let color: string;
        if (magnitude < 1) color = '#3B82F6';
        else if (magnitude < 3) color = '#F59E0B';
        else color = '#EF4444';

        ctx.fillStyle = color + '80';
        ctx.beginPath();
        ctx.roundRect(bx, by, barWidth, barH, 2);
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // Zero line
      ctx.strokeStyle = '#4b556340';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(startX - 2, centerY);
      ctx.lineTo(startX + totalBarsW + 2, centerY);
      ctx.stroke();

      // Range indicator
      const maxVal = Math.max(...layer.values.map(Math.abs));
      ctx.fillStyle = '#4b5563';
      ctx.font = '7px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`max: ${maxVal.toFixed(1)}`, layerX, centerY + barMaxH + 18);

      // Arrow between layers
      if (li < layerCount - 1) {
        const ax = pad + (li + 1) * layerSpacing - 5;
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.moveTo(ax, centerY - 3);
        ctx.lineTo(ax + 6, centerY);
        ctx.lineTo(ax, centerY + 3);
        ctx.fill();
      }
    });

    // Legend
    const legendY = 26;
    const legendItems = [
      { color: '#3B82F6', label: '正常范围' },
      { color: '#F59E0B', label: '偏大' },
      { color: '#EF4444', label: '爆炸/消失' },
    ];
    let lx = pad;
    legendItems.forEach(item => {
      ctx.fillStyle = item.color;
      ctx.fillRect(lx, legendY, 10, 6);
      ctx.fillStyle = '#64748b';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, lx + 13, legendY + 6);
      lx += 65;
    });
  }, [signals, mode, animStep]);

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex gap-2 items-center flex-wrap">
        <button
          onClick={() => setMode('none')}
          className="px-3 py-1 rounded text-sm transition-colors"
          style={{
            backgroundColor: mode === 'none' ? '#EF444420' : '#1e293b',
            color: mode === 'none' ? '#EF4444' : '#94a3b8',
          }}
        >
          ❌ 无归一化
        </button>
        <button
          onClick={() => setMode('batchnorm')}
          className="px-3 py-1 rounded text-sm transition-colors"
          style={{
            backgroundColor: mode === 'batchnorm' ? '#3B82F620' : '#1e293b',
            color: mode === 'batchnorm' ? '#3B82F6' : '#94a3b8',
          }}
        >
          🔵 BatchNorm
        </button>
        <button
          onClick={() => setMode('layernorm')}
          className="px-3 py-1 rounded text-sm transition-colors"
          style={{
            backgroundColor: mode === 'layernorm' ? '#10B98120' : '#1e293b',
            color: mode === 'layernorm' ? '#10B981' : '#94a3b8',
          }}
        >
          🟢 LayerNorm
        </button>
        <button
          onClick={runTraining}
          disabled={animating}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors disabled:opacity-50"
        >
          {animating ? '⏳ 训练中...' : '▶ 模拟训练'}
        </button>
      </div>
      <div style={{ height: '240px', position: 'relative' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
    </div>
  );
}
