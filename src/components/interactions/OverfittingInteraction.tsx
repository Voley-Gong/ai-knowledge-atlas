'use client';

import { useRef, useEffect, useState } from 'react';

// Generate fixed data points
const DATA_POINTS: [number, number][] = [
  [0.1, 0.8], [0.3, 1.2], [0.5, 1.5], [0.8, 2.1], [1.0, 2.3],
  [1.3, 2.8], [1.5, 3.0], [1.8, 3.5], [2.0, 3.2], [2.3, 3.8],
  [2.5, 4.0], [2.8, 3.9], [3.0, 4.2], [3.3, 4.5], [3.5, 4.3],
  [3.8, 4.8], [4.0, 4.7], [4.3, 5.0], [4.5, 5.2], [4.8, 5.1],
];

const TEST_POINTS: [number, number][] = [
  [0.2, 1.0], [0.6, 1.8], [1.2, 2.5], [1.7, 3.3], [2.2, 3.6],
  [2.7, 4.1], [3.2, 4.4], [3.7, 4.6], [4.2, 4.9], [4.6, 5.3],
];

function polyFit(points: [number, number][], degree: number): number[] {
  // Simple polynomial regression via normal equations (small system)
  const n = degree + 1;
  const XTX: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const XTY: number[] = Array(n).fill(0);

  points.forEach(([x, y]) => {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        XTX[i][j] += Math.pow(x, i + j);
      }
      XTY[i] += Math.pow(x, i) * y;
    }
  });

  // Gaussian elimination
  for (let i = 0; i < n; i++) {
    XTX[i].push(XTY[i]);
  }
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(XTX[k][i]) > Math.abs(XTX[maxRow][i])) maxRow = k;
    }
    [XTX[i], XTX[maxRow]] = [XTX[maxRow], XTX[i]];
    for (let k = i + 1; k < n; k++) {
      const factor = XTX[k][i] / XTX[i][i];
      for (let j = i; j <= n; j++) {
        XTX[k][j] -= factor * XTX[i][j];
      }
    }
  }
  const coeffs = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    coeffs[i] = XTX[i][n];
    for (let j = i + 1; j < n; j++) {
      coeffs[i] -= XTX[i][j] * coeffs[j];
    }
    coeffs[i] /= XTX[i][i];
  }
  return coeffs;
}

function polyEval(coeffs: number[], x: number): number {
  let y = 0;
  for (let i = 0; i < coeffs.length; i++) {
    y += coeffs[i] * Math.pow(x, i);
  }
  return y;
}

function mse(points: [number, number][], coeffs: number[]): number {
  const n = points.length;
  let sum = 0;
  points.forEach(([x, y]) => {
    const pred = polyEval(coeffs, x);
    sum += (pred - y) ** 2;
  });
  return sum / n;
}

export default function OverfittingInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [degree, setDegree] = useState(1);
  const [coeffs, setCoeffs] = useState<number[]>([0, 1]);

  useEffect(() => {
    try {
      const c = polyFit(DATA_POINTS, degree);
      setCoeffs(c);
    } catch {
      setCoeffs([0]);
    }
  }, [degree]);

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

    const padL = 35, padR = 15, padT = 25, padB = 50;
    const plotW = rect.width - padL - padR;
    const plotH = rect.height - padT - padB - 30;

    const xMin = 0, xMax = 5, yMin = 0, yMax = 6;

    function toScreen(x: number, y: number): [number, number] {
      return [
        padL + (x - xMin) / (xMax - xMin) * plotW,
        padT + plotH - (y - yMin) / (yMax - yMin) * plotH,
      ];
    }

    // Grid
    ctx.strokeStyle = '#1e293b40';
    ctx.lineWidth = 0.5;
    for (let y = 0; y <= 6; y += 1) {
      const [, sy] = toScreen(0, y);
      ctx.beginPath();
      ctx.moveTo(padL, sy);
      ctx.lineTo(padL + plotW, sy);
      ctx.stroke();
      ctx.fillStyle = '#4b5563';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(y.toString(), padL - 4, sy + 3);
    }

    // Fit curve
    ctx.beginPath();
    ctx.strokeStyle = degree <= 2 ? '#10B981' : degree <= 5 ? '#F59E0B' : '#EF4444';
    ctx.lineWidth = 2;
    for (let px = 0; px <= plotW; px++) {
      const x = xMin + (px / plotW) * (xMax - xMin);
      const y = polyEval(coeffs, x);
      const clampedY = Math.max(yMin - 1, Math.min(yMax + 1, y));
      const [sx, sy] = toScreen(x, clampedY);
      if (px === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // Training data points (blue)
    DATA_POINTS.forEach(([x, y]) => {
      const [sx, sy] = toScreen(x, y);
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#3B82F6';
      ctx.fill();
    });

    // Test data points (orange, outline)
    TEST_POINTS.forEach(([x, y]) => {
      const [sx, sy] = toScreen(x, y);
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#0f1425';
      ctx.fill();
      ctx.strokeStyle = '#F97316';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Error bars
    const trainErr = mse(DATA_POINTS, coeffs);
    const testErr = mse(TEST_POINTS, coeffs);

    // Error bar chart at bottom
    const barY = padT + plotH + 15;
    const barW = plotW / 3;
    const maxErr = Math.max(trainErr, testErr, 1);

    // Training error bar
    const trainBarH = Math.min(25, (trainErr / maxErr) * 25);
    ctx.fillStyle = '#3B82F640';
    ctx.fillRect(padL + barW * 0.5, barY + 25 - trainBarH, barW * 0.8, trainBarH);
    ctx.fillStyle = '#3B82F6';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`训练误差: ${trainErr.toFixed(3)}`, padL + barW * 0.9, barY + 38);

    // Test error bar
    const testBarH = Math.min(25, (testErr / maxErr) * 25);
    ctx.fillStyle = '#F9731640';
    ctx.fillRect(padL + barW * 1.5, barY + 25 - testBarH, barW * 0.8, testBarH);
    ctx.fillStyle = '#F97316';
    ctx.fillText(`测试误差: ${testErr.toFixed(3)}`, padL + barW * 1.9, barY + 38);

    // Status label
    const label = degree <= 2 ? '📉 欠拟合 — 模型太简单' : degree <= 5 ? '✅ 合适 — 泛化良好' : '📈 过拟合 — 模型太复杂';
    const labelColor = degree <= 2 ? '#3B82F6' : degree <= 5 ? '#10B981' : '#EF4444';
    ctx.fillStyle = labelColor;
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${degree}阶多项式 — ${label}`, padL, 14);

    // Legend
    ctx.fillStyle = '#3B82F6';
    ctx.beginPath(); ctx.arc(padL + plotW - 80, 10, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('训练数据', padL + plotW - 75, 13);

    ctx.strokeStyle = '#F97316';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(padL + plotW - 30, 10, 3, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('测试数据', padL + plotW - 25, 13);

  }, [coeffs, degree]);

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex gap-3 items-center">
        <span className="text-xs text-[#64748b]">模型复杂度:</span>
        <input
          type="range"
          min={1}
          max={12}
          value={degree}
          onChange={e => setDegree(Number(e.target.value))}
          className="flex-1 max-w-[200px] accent-blue-500"
        />
        <span className="text-xs text-[#94a3b8] font-mono">{degree}阶</span>
      </div>
      <div style={{ height: '240px', position: 'relative' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
    </div>
  );
}
