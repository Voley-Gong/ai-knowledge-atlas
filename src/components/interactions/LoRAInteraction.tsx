'use client';

import { useRef, useEffect, useState } from 'react';

export default function LoRAInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rank, setRank] = useState(4);
  const [animating, setAnimating] = useState(false);
  const [animProgress, setAnimProgress] = useState(0);

  const startAnim = () => {
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

    const pad = 15;
    const origH = 100; // Original W matrix height in pixels

    // === Original W matrix ===
    const wX = pad;
    const wY = 40;
    const wW = 80;
    const wH = origH;

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🏗️ LoRA: 低秩适应', pad, 14);

    ctx.fillStyle = '#334155';
    ctx.font = '8px sans-serif';
    ctx.fillText('原始权重 W (冻结)', wX, wY - 6);

    // W matrix
    ctx.fillStyle = animating ? '#1e293b' : '#3B82F615';
    ctx.beginPath();
    ctx.roundRect(wX, wY, wW, wH, 4);
    ctx.fill();
    ctx.strokeStyle = animating ? '#334155' : '#3B82F640';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Frozen label
    if (animating) {
      ctx.fillStyle = '#3B82F620';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('❄️', wX + wW / 2, wY + wH / 2 - 4);
      ctx.fillStyle = '#3B82F640';
      ctx.font = '8px sans-serif';
      ctx.fillText('FROZEN', wX + wW / 2, wY + wH / 2 + 10);
    } else {
      // Grid pattern
      ctx.strokeStyle = '#3B82F610';
      ctx.lineWidth = 0.5;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 5; c++) {
          ctx.strokeRect(wX + c * (wW / 5), wY + r * (wH / 8), wW / 5, wH / 8);
          ctx.fillStyle = `rgba(59, 130, 246, ${0.05 + Math.random() * 0.1})`;
          ctx.fillRect(wX + c * (wW / 5), wY + r * (wH / 8), wW / 5, wH / 8);
        }
      }
    }

    // Dimension labels
    ctx.fillStyle = '#64748b';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('d=512', wX + wW / 2, wY + wH + 12);
    ctx.save();
    ctx.translate(wX - 6, wY + wH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('d=512', 0, 0);
    ctx.restore();

    // === Plus sign ===
    const plusX = wX + wW + 12;
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('+', plusX + 5, wY + wH / 2 + 4);

    // === LoRA decomposition ===
    const loraX = plusX + 20;

    // A matrix (tall, thin)
    const aW = Math.max(8, rank * 3);
    const aH = origH;
    const aY = wY;

    ctx.fillStyle = '#10B98115';
    ctx.beginPath();
    ctx.roundRect(loraX, aY, aW, aH, 3);
    ctx.fill();
    ctx.strokeStyle = '#10B98160';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // A matrix label
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('A', loraX + aW / 2, aY - 6);
    ctx.fillStyle = '#64748b';
    ctx.font = '7px sans-serif';
    ctx.fillText(`${512}×${rank}`, loraX + aW / 2, aY + aH + 12);

    // A matrix animation (training)
    if (animating && animProgress > 0.3) {
      const rows = Math.min(8, Math.floor(aH / 14));
      for (let r = 0; r < rows; r++) {
        ctx.fillStyle = `rgba(16, 185, 129, ${0.1 + animProgress * 0.3})`;
        ctx.fillRect(loraX + 1, aY + 1 + r * (aH / rows), aW - 2, aH / rows - 1);
      }
      ctx.fillStyle = '#10B981';
      ctx.font = '8px sans-serif';
      ctx.fillText('🔄', loraX + aW / 2, aY + aH / 2 + 4);
    }

    // × sign
    const timesX = loraX + aW + 5;
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('×', timesX + 3, wY + wH / 2 + 4);

    // B matrix (short, wide)
    const bX = timesX + 10;
    const bW = wW;
    const bH = Math.max(8, rank * 3);
    const bY = wY + (origH - bH) / 2;

    ctx.fillStyle = '#8B5CF615';
    ctx.beginPath();
    ctx.roundRect(bX, bY, bW, bH, 3);
    ctx.fill();
    ctx.strokeStyle = '#8B5CF660';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // B matrix label
    ctx.fillStyle = '#8B5CF6';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('B', bX + bW / 2, bY - 6);
    ctx.fillStyle = '#64748b';
    ctx.font = '7px sans-serif';
    ctx.fillText(`${rank}×${512}`, bX + bW / 2, bY + bH + 12);

    // B matrix animation
    if (animating && animProgress > 0.5) {
      const cols = Math.min(5, Math.floor(bW / 16));
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = `rgba(139, 92, 246, ${0.1 + animProgress * 0.3})`;
        ctx.fillRect(bX + 1 + c * (bW / cols), bY + 1, bW / cols - 1, bH - 2);
      }
      ctx.fillStyle = '#8B5CF6';
      ctx.font = '8px sans-serif';
      ctx.fillText('🔄', bX + bW / 2, bY + bH / 2 + 3);
    }

    // === Info panel ===
    const infoY = wY + wH + 28;

    // Parameters comparison
    const originalParams = 512 * 512;
    const loraParams = 512 * rank * 2;
    const ratio = loraParams / originalParams;

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📊 参数量对比:', pad, infoY);

    // Original params bar
    const barX = pad;
    const barY2 = infoY + 8;
    const maxBarW = rect.width - pad * 2;
    const barH = 10;

    ctx.fillStyle = '#3B82F620';
    ctx.beginPath();
    ctx.roundRect(barX, barY2, maxBarW, barH, 3);
    ctx.fill();
    ctx.fillStyle = '#3B82F6';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`原始参数: ${(originalParams / 1000).toFixed(0)}K`, barX + 4, barY2 + 8);

    // LoRA params bar
    const loraBarW = ratio * maxBarW;
    ctx.fillStyle = '#10B98140';
    ctx.beginPath();
    ctx.roundRect(barX, barY2 + barH + 4, Math.max(10, loraBarW), barH, 3);
    ctx.fill();
    ctx.fillStyle = '#10B981';
    ctx.font = '8px sans-serif';
    ctx.fillText(`LoRA参数: ${loraParams} (${(ratio * 100).toFixed(1)}%)`, barX + 4, barY2 + barH + 12);

    // Rank slider info
    ctx.fillStyle = '#64748b';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`秩 r = ${rank}  |  只需训练 ${(ratio * 100).toFixed(1)}% 的参数`, rect.width / 2, barY2 + barH * 2 + 22);

    // Analogy
    ctx.fillStyle = '#4b5563';
    ctx.font = '8px sans-serif';
    ctx.fillText('📝 不改整本书，只在书页边上贴便利贴 (A×B)', rect.width / 2, rect.height - 6);

  }, [rank, animating, animProgress]);

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex gap-2 items-center">
        <span className="text-xs text-[#64748b]">秩 r:</span>
        <input
          type="range"
          min={1}
          max={16}
          value={rank}
          onChange={e => setRank(Number(e.target.value))}
          className="flex-1 max-w-[150px] accent-purple-500"
        />
        <span className="text-xs text-[#8B5CF6] font-mono">{rank}</span>
        <button
          onClick={startAnim}
          className="px-3 py-1 rounded bg-[#1e293b] text-xs text-[#94a3b8] hover:text-white transition-colors"
        >
          🔄 微调动画
        </button>
      </div>
      <div style={{ height: '240px', position: 'relative' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
    </div>
  );
}
