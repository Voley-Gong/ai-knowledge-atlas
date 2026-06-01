'use client';

import { useRef, useEffect, useState } from 'react';

// Generate initial parameter distribution (scattered)
function genParams(lambda: number): number[] {
  const base = [];
  for (let i = 0; i < 100; i++) {
    // Without regularization: wide spread; with regularization: concentrated
    const raw = (Math.sin(i * 7.3 + 2.1) * 0.5 + Math.cos(i * 3.7 + 1.2) * 0.5);
    const spread = 4 * (1 - lambda) + 0.3;
    base.push(raw * spread);
  }
  return base;
}

function makeHistogram(values: number[], bins: number): number[] {
  const hist = new Array(bins).fill(0);
  const min = -5, max = 5;
  values.forEach(v => {
    const idx = Math.floor((v - min) / (max - min) * bins);
    if (idx >= 0 && idx < bins) hist[idx]++;
  });
  return hist;
}

export default function RegularizationInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lambda, setLambda] = useState(0);
  const [regType, setRegType] = useState<'l1' | 'l2'>('l2');

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
    const params = genParams(lambda);
    const bins = 20;

    // === LEFT: Parameter distribution histogram ===
    const histW = rect.width * 0.55 - pad * 2;
    const histH = rect.height * 0.55;
    const histX = pad;
    const histY = 25;

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📊 参数分布直方图', histX, 16);

    const hist = makeHistogram(params, bins);
    const maxCount = Math.max(...hist, 1);
    const barW = histW / bins;

    for (let i = 0; i < bins; i++) {
      const barH = (hist[i] / maxCount) * histH;
      const bx = histX + i * barW;
      const by = histY + histH - barH;
      const color = regType === 'l2' ? '#3B82F6' : '#F59E0B';
      ctx.fillStyle = color + '60';
      ctx.fillRect(bx, by, barW - 1, barH);
      ctx.fillStyle = color;
      ctx.fillRect(bx, by, barW - 1, 2);
    }

    // Axis labels
    ctx.fillStyle = '#4b5563';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('-5', histX, histY + histH + 10);
    ctx.fillText('0', histX + histW / 2, histY + histH + 10);
    ctx.fillText('5', histX + histW, histY + histH + 10);
    ctx.fillText('参数值', histX + histW / 2, histY + histH + 20);

    // Spread indicator
    const variance = params.reduce((s, v) => s + v * v, 0) / params.length;
    const spreadLabel = variance < 1 ? '集中收敛 ✅' : variance < 3 ? '适中' : '极端分散 ⚠️';
    const spreadColor = variance < 1 ? '#10B981' : variance < 3 ? '#F59E0B' : '#EF4444';
    ctx.fillStyle = spreadColor;
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`参数方差: ${variance.toFixed(2)} — ${spreadLabel}`, histX + histW, histY + histH + 20);

    // === RIGHT: Loss surface with regularization ===
    const surfX = rect.width * 0.55 + pad;
    const surfW = rect.width * 0.45 - pad * 2;
    const surfH = histH;
    const surfY = 25;

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🏔️ 损失曲面变化', surfX, 16);

    // Draw loss surface contour
    const resolution = 40;
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const w1 = -3 + (i / resolution) * 6;
        const w2 = -3 + (j / resolution) * 6;
        const loss = 0.3 * (w1 * w1 + w2 * w2) + 0.5 * Math.sin(w1) * Math.cos(w2) + lambda * (regType === 'l2' ? (w1 * w1 + w2 * w2) : (Math.abs(w1) + Math.abs(w2)));
        const sx = surfX + (i / resolution) * surfW;
        const sy = surfY + (j / resolution) * surfH;
        const cellW = surfW / resolution;
        const cellH = surfH / resolution;
        const intensity = Math.min(1, loss / 10);
        const r = Math.round(10 + intensity * 40);
        const g = Math.round(14 + intensity * 25);
        const b = Math.round(26 + intensity * 80);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(sx, sy, cellW + 1, cellH + 1);
      }
    }

    // Mark minimum point
    const minW = lambda * (regType === 'l2' ? 0.5 : 0.3);
    const minSx = surfX + ((minW + 3) / 6) * surfW;
    const minSy = surfY + ((minW + 3) / 6) * surfH;
    ctx.beginPath();
    ctx.arc(minSx, minSy, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#10B981';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#10B981';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('最优点', minSx, minSy - 8);

    // === BOTTOM: Regularization formula and info ===
    const infoY = histY + histH + 35;

    // L1/L2 toggle
    const btnW = 80;
    const l1X = rect.width / 2 - btnW - 5;
    const l2X = rect.width / 2 + 5;

    ctx.fillStyle = regType === 'l1' ? '#F59E0B30' : '#1e293b';
    ctx.beginPath();
    ctx.roundRect(l1X, infoY, btnW, 24, 6);
    ctx.fill();
    ctx.strokeStyle = regType === 'l1' ? '#F59E0B' : '#334155';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = regType === 'l1' ? '#F59E0B' : '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('L1 (Lasso)', l1X + btnW / 2, infoY + 15);

    ctx.fillStyle = regType === 'l2' ? '#3B82F630' : '#1e293b';
    ctx.beginPath();
    ctx.roundRect(l2X, infoY, btnW, 24, 6);
    ctx.fill();
    ctx.strokeStyle = regType === 'l2' ? '#3B82F6' : '#334155';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = regType === 'l2' ? '#3B82F6' : '#64748b';
    ctx.font = '10px sans-serif';
    ctx.fillText('L2 (Ridge)', l2X + btnW / 2, infoY + 15);

    // Formula
    const formula = regType === 'l1'
      ? `Loss + λ·Σ|wᵢ|  → 参数趋向稀疏`
      : `Loss + λ·Σwᵢ²  → 参数趋向均匀缩小`;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(formula, rect.width / 2, infoY + 40);

    // Lambda value
    ctx.fillStyle = lambda > 0.5 ? '#10B981' : '#64748b';
    ctx.font = '9px sans-serif';
    ctx.fillText(`正则化强度 λ = ${lambda.toFixed(2)}`, rect.width / 2, infoY + 55);

    // Analogy
    ctx.fillStyle = '#4b5563';
    ctx.font = '9px sans-serif';
    ctx.fillText('💡 束腰带：限制参数膨胀，防止过拟合', rect.width / 2, infoY + 70);
  }, [lambda, regType]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Check L1/L2 buttons
    const infoY = 25 + (rect.height * 0.55) + 35;
    const btnW = 80;
    const l1X = rect.width / 2 - btnW - 5;
    const l2X = rect.width / 2 + 5;

    if (my >= infoY && my <= infoY + 24) {
      if (mx >= l1X && mx <= l1X + btnW) setRegType('l1');
      else if (mx >= l2X && mx <= l2X + btnW) setRegType('l2');
    }
  };

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex gap-2 items-center">
        <span className="text-xs text-[#64748b]">正则化强度:</span>
        <input
          type="range"
          min={0}
          max={100}
          value={lambda * 100}
          onChange={e => setLambda(Number(e.target.value) / 100)}
          className="flex-1 max-w-[200px] accent-blue-500"
        />
        <span className="text-xs text-[#94a3b8] font-mono">λ={lambda.toFixed(2)}</span>
      </div>
      <div style={{ height: '240px', position: 'relative' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
          onClick={handleClick}
        />
      </div>
    </div>
  );
}
