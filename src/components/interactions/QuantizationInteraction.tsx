'use client';

import { useRef, useEffect, useState } from 'react';

type Precision = 'fp32' | 'fp16' | 'int8' | 'int4';

const PRECISIONS: Record<Precision, {
  name: string; bits: number; modelSize: string; accuracyLoss: number; color: string;
}> = {
  fp32: { name: 'FP32', bits: 32, modelSize: '100%', accuracyLoss: 0, color: '#3B82F6' },
  fp16: { name: 'FP16', bits: 16, modelSize: '50%', accuracyLoss: 2, color: '#10B981' },
  int8: { name: 'INT8', bits: 8, modelSize: '25%', accuracyLoss: 8, color: '#F59E0B' },
  int4: { name: 'INT4', bits: 4, modelSize: '12.5%', accuracyLoss: 18, color: '#EF4444' },
};

// Generate sample weight values and quantize them
function genWeights(precision: Precision): { original: number; quantized: number }[] {
  const values: number[] = [];
  // Generate a Gaussian-like distribution
  for (let i = 0; i < 200; i++) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    values.push(z * 0.5);
  }

  return values.map(v => {
    let quantized: number;
    switch (precision) {
      case 'fp32':
        quantized = v; // full precision
        break;
      case 'fp16':
        quantized = Math.round(v * 2048) / 2048; // ~11 bit mantissa
        break;
      case 'int8': {
        const scale = 127 / 3;
        quantized = Math.round(v * scale) / scale;
        break;
      }
      case 'int4': {
        const scale4 = 7 / 3;
        quantized = Math.round(v * scale4) / scale4;
        break;
      }
      default:
        quantized = v;
    }
    return { original: v, quantized };
  });
}

// Seed random for consistent display
let seededValues: number[] = [];
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getSeededWeights(): number[] {
  if (seededValues.length > 0) return seededValues;
  for (let i = 0; i < 200; i++) {
    const u1 = seededRandom(i * 7.3 + 1.1);
    const u2 = seededRandom(i * 13.7 + 2.3);
    const z = Math.sqrt(-2 * Math.log(Math.max(0.0001, u1))) * Math.cos(2 * Math.PI * u2);
    seededValues.push(z * 0.5);
  }
  return seededValues;
}

function quantize(v: number, precision: Precision): number {
  switch (precision) {
    case 'fp32': return v;
    case 'fp16': return Math.round(v * 2048) / 2048;
    case 'int8': { const s = 127 / 3; return Math.round(v * s) / s; }
    case 'int4': { const s = 7 / 3; return Math.round(v * s) / s; }
  }
}

export default function QuantizationInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [precision, setPrecision] = useState<Precision>('fp32');

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

    const pad = 12;
    const pInfo = PRECISIONS[precision];

    // Title
    ctx.fillStyle = pInfo.color;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`📊 量化: ${pInfo.name} (${pInfo.bits}位)`, rect.width / 2, 14);

    // === LEFT: Value distribution ===
    const distX = pad;
    const distW = rect.width * 0.55 - pad;
    const distY = 28;
    const distH = 120;

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📉 权重值分布', distX, distY);

    const values = getSeededWeights();
    const bins = 30;
    const histOrig = new Array(bins).fill(0);
    const histQuant = new Array(bins).fill(0);
    const binMin = -3, binMax = 3;

    values.forEach(v => {
      const qi = Math.floor((v - binMin) / (binMax - binMin) * bins);
      const qv = quantize(v, precision);
      const qqi = Math.floor((qv - binMin) / (binMax - binMin) * bins);
      if (qi >= 0 && qi < bins) histOrig[qi]++;
      if (qqi >= 0 && qqi < bins) histQuant[qqi]++;
    });

    const maxCount = Math.max(...histOrig, ...histQuant, 1);
    const barW = distW / bins;
    const plotY = distY + 8;
    const plotH = distH - 16;

    // Original distribution (outline)
    histOrig.forEach((count, i) => {
      const barH = (count / maxCount) * plotH;
      const bx = distX + i * barW;
      const by = plotY + plotH - barH;
      ctx.fillStyle = '#3B82F620';
      ctx.fillRect(bx, by, barW - 0.5, barH);
    });

    // Quantized distribution (filled)
    histQuant.forEach((count, i) => {
      const barH = (count / maxCount) * plotH;
      const bx = distX + i * barW;
      const by = plotY + plotH - barH;
      ctx.fillStyle = pInfo.color + '60';
      ctx.fillRect(bx, by, barW - 0.5, barH);
      ctx.fillStyle = pInfo.color;
      ctx.fillRect(bx, by, barW - 0.5, 1.5);
    });

    // X axis
    ctx.fillStyle = '#4b5563';
    ctx.font = '7px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('-3', distX, plotY + plotH + 10);
    ctx.fillText('0', distX + distW / 2, plotY + plotH + 10);
    ctx.fillText('3', distX + distW, plotY + plotH + 10);

    // Precision info
    ctx.fillStyle = '#94a3b8';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('浅蓝=原始分布 | 彩色=量化后分布', distX + distW / 2, plotY + plotH + 20);

    // === RIGHT: Model size & accuracy ===
    const rightX = rect.width * 0.57 + pad;
    const rightW = rect.width * 0.43 - pad * 2;
    const rightY = 28;

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('💾 模型体积', rightX, rightY);

    // Model size visual (block)
    const blockSize = Math.min(rightW - 10, 50);
    const scaledSize = blockSize * (pInfo.modelSize === '100%' ? 1 : pInfo.modelSize === '50%' ? 0.71 : pInfo.modelSize === '25%' ? 0.5 : 0.354);
    const blockX = rightX + (rightW - scaledSize) / 2;
    const blockY = rightY + 10;

    // Background (original size)
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.strokeRect(rightX + (rightW - blockSize) / 2, blockY, blockSize, blockSize);
    ctx.setLineDash([]);

    // Actual size
    ctx.fillStyle = pInfo.color + '30';
    ctx.fillRect(blockX, blockY + (blockSize - scaledSize) / 2, scaledSize, scaledSize);
    ctx.strokeStyle = pInfo.color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(blockX, blockY + (blockSize - scaledSize) / 2, scaledSize, scaledSize);

    ctx.fillStyle = pInfo.color;
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(pInfo.modelSize, rightX + rightW / 2, blockY + blockSize + 14);

    // Accuracy loss
    const accY = blockY + blockSize + 24;
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🎯 精度损失', rightX, accY);

    const lossBarW = rightW - 10;
    const lossBarY = accY + 6;
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(rightX, lossBarY, lossBarW, 10, 3);
    ctx.fill();

    const lossFill = (pInfo.accuracyLoss / 20) * lossBarW;
    ctx.fillStyle = pInfo.accuracyLoss < 5 ? '#10B98140' : pInfo.accuracyLoss < 15 ? '#F59E0B40' : '#EF444440';
    ctx.beginPath();
    ctx.roundRect(rightX, lossBarY, lossFill, 10, 3);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${pInfo.accuracyLoss}%`, rightX + lossBarW, lossBarY + 28);

    // === BOTTOM: Precision buttons ===
    const btnY = distH + 48;
    const btnW = (rect.width - pad * 2 - 3 * 6) / 4;

    (Object.keys(PRECISIONS) as Precision[]).forEach((key, i) => {
      const p = PRECISIONS[key];
      const bx = pad + i * (btnW + 6);
      const isActive = key === precision;

      ctx.fillStyle = isActive ? p.color + '20' : '#1e293b';
      ctx.beginPath();
      ctx.roundRect(bx, btnY, btnW, 26, 5);
      ctx.fill();
      ctx.strokeStyle = isActive ? p.color : '#334155';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = isActive ? p.color : '#64748b';
      ctx.font = `${isActive ? 'bold ' : ''}10px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(p.name, bx + btnW / 2, btnY + 11);
      ctx.font = '8px sans-serif';
      ctx.fillText(`${p.bits}位 | ${p.modelSize}`, bx + btnW / 2, btnY + 22);
    });

    // Trade-off description
    ctx.fillStyle = '#4b5563';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💡 精度越低 → 体积越小 → 信息有损但通常够用', rect.width / 2, rect.height - 6);

  }, [precision]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const pad = 12;
    const btnY = 168; // approximate
    const btnW = (rect.width - pad * 2 - 3 * 6) / 4;

    (Object.keys(PRECISIONS) as Precision[]).forEach((key, i) => {
      const bx = pad + i * (btnW + 6);
      if (mx >= bx && mx <= bx + btnW && my >= btnY && my <= btnY + 26) {
        setPrecision(key);
      }
    });
  };

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-1 flex gap-2 items-center">
        <span className="text-xs text-[#64748b]">点击下方精度按钮切换</span>
      </div>
      <div style={{ height: '244px', position: 'relative' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
          onClick={handleClick}
        />
      </div>
    </div>
  );
}
