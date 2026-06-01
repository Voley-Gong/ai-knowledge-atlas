'use client';

import { useRef, useEffect, useState } from 'react';

const LAYERS = 10;

export default function ResNetInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasResidual, setHasResidual] = useState(false);
  const [animProgress, setAnimProgress] = useState(0);
  const [animating, setAnimating] = useState(false);

  const startAnimation = () => {
    setAnimating(true);
    setAnimProgress(0);
  };

  useEffect(() => {
    if (!animating) return;
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      setAnimProgress(Math.min(1, frame / 80));
      if (frame >= 80) { clearInterval(interval); setAnimating(false); }
    }, 25);
    return () => clearInterval(interval);
  }, [animating]);

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

    const pad = 20;
    const networkW = rect.width - pad * 2;
    const networkH = rect.height - 60;
    const startY = 30;

    const layerSpacing = networkW / (LAYERS + 1);
    const nodeY = startY + networkH / 2;

    // Signal intensity at each layer
    const getIntensity = (layer: number): number => {
      if (hasResidual) {
        // With residual: signal stays strong, slight degradation
        const base = 1 - layer * 0.02;
        const skip = layer > 1 ? 0.3 * Math.min(1, animProgress) : 0;
        return Math.min(1, base + skip);
      } else {
        // Without residual: signal attenuates
        const t = Math.min(1, animProgress);
        return Math.max(0.05, 1 - layer * 0.1 * t);
      }
    };

    // Title
    ctx.fillStyle = hasResidual ? '#10B981' : '#EF4444';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      hasResidual ? '✅ 有残差连接 — 信息保真度高' : '❌ 无残差连接 — 信号逐层衰减',
      rect.width / 2, 16
    );

    // Draw layers
    for (let i = 0; i < LAYERS; i++) {
      const x = pad + (i + 1) * layerSpacing;
      const intensity = getIntensity(i);
      const nodeRadius = 14;
      const hue = hasResidual ? 160 : 0;
      const sat = 70;
      const light = Math.round(20 + intensity * 50);

      // Connection to next layer
      if (i < LAYERS - 1) {
        const nx = pad + (i + 2) * layerSpacing;
        const nextIntensity = getIntensity(i + 1);
        ctx.beginPath();
        ctx.moveTo(x + nodeRadius, nodeY);
        ctx.lineTo(nx - nodeRadius, nodeY);
        ctx.strokeStyle = hasResidual
          ? `rgba(16, 185, 129, ${0.15 + intensity * 0.3})`
          : `rgba(239, 68, 68, ${0.05 + intensity * 0.2})`;
        ctx.lineWidth = Math.max(1, intensity * 3);
        ctx.stroke();
      }

      // Skip connection (residual)
      if (hasResidual && i > 0 && i < LAYERS - 1 && i % 2 === 0) {
        const prevX = pad + (i - 1) * layerSpacing;
        ctx.beginPath();
        ctx.moveTo(prevX + nodeRadius, nodeY - nodeRadius);
        ctx.bezierCurveTo(
          (prevX + x) / 2, nodeY - 40,
          (prevX + x) / 2, nodeY - 40,
          x + nodeRadius, nodeY - nodeRadius
        );
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.4 * animProgress})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Elevator icon
        const midX = (prevX + x) / 2;
        ctx.fillStyle = '#8B5CF6';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🛗', midX, nodeY - 38);
      }

      // Node
      const gradient = ctx.createRadialGradient(x, nodeY, 0, x, nodeY, nodeRadius);
      if (hasResidual) {
        gradient.addColorStop(0, `hsla(${hue}, ${sat}%, ${light + 15}%, ${0.3 + intensity * 0.5})`);
        gradient.addColorStop(1, `hsla(${hue}, ${sat}%, ${light}%, ${0.1 + intensity * 0.2})`);
      } else {
        gradient.addColorStop(0, `hsla(${hue}, ${sat}%, ${light + 15}%, ${0.3 + intensity * 0.5})`);
        gradient.addColorStop(1, `hsla(${hue}, ${sat}%, ${light}%, ${0.1 + intensity * 0.2})`);
      }

      ctx.beginPath();
      ctx.arc(x, nodeY, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = hasResidual ? `rgba(16, 185, 129, ${0.3 + intensity * 0.5})` : `rgba(239, 68, 68, ${0.3 + intensity * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Layer number
      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`L${i + 1}`, x, nodeY + nodeRadius + 12);

      // Intensity bar below
      const barW = 20;
      const barH = 4;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x - barW / 2, nodeY + nodeRadius + 16, barW, barH);
      const barColor = hasResidual ? '#10B981' : '#EF4444';
      ctx.fillStyle = barColor + (intensity > 0.3 ? 'cc' : '40');
      ctx.fillRect(x - barW / 2, nodeY + nodeRadius + 16, barW * intensity, barH);
    }

    // Signal flow animation
    if (animProgress > 0) {
      const signalLayer = Math.floor(animProgress * (LAYERS - 1));
      const signalX = pad + (signalLayer + 1) * layerSpacing;
      ctx.beginPath();
      ctx.arc(signalX, nodeY, 18, 0, Math.PI * 2);
      ctx.strokeStyle = hasResidual ? '#10B98160' : '#EF444460';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Bottom info
    ctx.fillStyle = '#64748b';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      hasResidual ? '🛗 残差连接 = 信息电梯，信号直接"搭电梯"跳过中间层' : '📉 深层网络中信号逐渐衰减/变形',
      rect.width / 2, rect.height - 8
    );
  }, [hasResidual, animProgress, animating]);

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex gap-2 items-center">
        <button
          onClick={() => setHasResidual(!hasResidual)}
          className={`px-3 py-1 rounded text-xs transition-colors ${
            hasResidual ? 'bg-[#10B98120] text-[#10B981]' : 'bg-[#1e293b] text-[#64748b] hover:text-white'
          }`}
        >
          {hasResidual ? '✅ 残差连接 ON' : '❌ 残差连接 OFF'}
        </button>
        <button
          onClick={startAnimation}
          className="px-3 py-1 rounded bg-[#1e293b] text-xs text-[#94a3b8] hover:text-white transition-colors"
        >
          📡 发送信号
        </button>
      </div>
      <div style={{ height: '240px', position: 'relative' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
    </div>
  );
}
