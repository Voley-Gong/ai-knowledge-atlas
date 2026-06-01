'use client';

import { useRef, useEffect, useState } from 'react';

/**
 * Diffusion Model（扩散模型）交互演示
 * 通过逐步去噪来生成图像
 * 类比：从模糊噪声中雕刻出清晰图像
 */

export default function DiffusionInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(0);
  const maxSteps = 20;

  // 简化的"数字7"像素模板（用于去噪目标）
  const targetPattern = [
    [1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,0,1,1,1,1,1,0,0,0],
    [0,0,0,0,0,1,1,1,0,0,0,0],
    [0,0,0,0,0,1,1,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,1,1,0,0,0,0,0,0,0],
    [0,0,0,1,1,0,0,0,0,0,0,0],
    [0,0,1,1,0,0,0,0,0,0,0,0],
  ];

  // 生成带噪声的像素
  const getPixels = () => {
    const seed = 42;
    return targetPattern.map((row, r) =>
      row.map((target, c) => {
        const noise = Math.sin(seed + r * 13 + c * 7 + step * 3) * 0.5 + 0.5;
        const noiseAmount = Math.max(0, 1 - step / maxSteps);
        return target * (1 - noiseAmount) + noise * noiseAmount;
      })
    );
  };

  const autoPlay = () => {
    setStep(0);
    let s = 0;
    const interval = setInterval(() => {
      s++;
      if (s > maxSteps) { clearInterval(interval); return; }
      setStep(s);
    }, 150);
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

    const pad = 16;
    const pixels = getPixels();
    const rows = pixels.length;
    const cols = pixels[0].length;

    // 左侧：去噪过程
    const gridSize = 14;
    const gridStartX = pad + 10;
    const gridStartY = 30;

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🎨 去噪步骤: ${step}/${maxSteps}`, pad + 10, 22);

    // 去噪进度条
    const barY = gridStartY + rows * gridSize + 8;
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(gridStartX, barY, cols * gridSize, 6, 3);
    ctx.fill();
    ctx.fillStyle = '#8B5CF6';
    ctx.beginPath();
    ctx.roundRect(gridStartX, barY, cols * gridSize * (step / maxSteps), 6, 3);
    ctx.fill();

    pixels.forEach((row, r) => {
      row.forEach((val, c) => {
        const px = gridStartX + c * gridSize;
        const py = gridStartY + r * gridSize;
        const brightness = Math.floor(val * 255);
        ctx.fillStyle = `rgb(${brightness}, ${Math.floor(brightness * 0.6)}, ${Math.floor(255 - brightness * 0.3)})`;
        ctx.beginPath();
        ctx.roundRect(px, py, gridSize - 1, gridSize - 1, 2);
        ctx.fill();
      });
    });

    // 右侧：正向扩散 vs 反向扩散
    const rightX = gridStartX + cols * gridSize + 30;
    const rightW = rect.width - rightX - pad;

    // 正向扩散（加噪）
    ctx.fillStyle = '#EF4444';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('➡️ 正向扩散', rightX + rightW / 2, 30);

    const miniGrid = 6;
    const miniCols = 8;
    const miniRows = 6;
    const miniY = 38;
    for (let r = 0; r < miniRows; r++) {
      for (let c = 0; c < miniCols; c++) {
        const noise = Math.random();
        ctx.fillStyle = `rgb(${Math.floor(noise * 150)}, ${Math.floor(noise * 80)}, ${Math.floor(noise * 50)})`;
        ctx.fillRect(rightX + c * miniGrid, miniY + r * miniGrid, miniGrid - 1, miniGrid - 1);
      }
    }
    ctx.fillStyle = '#64748b';
    ctx.font = '8px sans-serif';
    ctx.fillText('清晰 → 噪声', rightX + rightW / 2, miniY + miniRows * miniGrid + 12);

    // 反向扩散（去噪）
    const reverseY = miniY + miniRows * miniGrid + 28;
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('⬅️ 反向扩散', rightX + rightW / 2, reverseY);

    const revMiniY = reverseY + 10;
    const denoiseLevel = step / maxSteps;
    for (let r = 0; r < miniRows; r++) {
      for (let c = 0; c < miniCols; c++) {
        const noise = Math.random() * (1 - denoiseLevel);
        const target = targetPattern[r + 2]?.[c + 2] || 0;
        const val = target * denoiseLevel + noise;
        const b = Math.floor(val * 200);
        ctx.fillStyle = `rgb(${b}, ${Math.floor(b * 0.7)}, ${Math.floor(200 - b * 0.5)})`;
        ctx.fillRect(rightX + c * miniGrid, revMiniY + r * miniGrid, miniGrid - 1, miniGrid - 1);
      }
    }
    ctx.fillStyle = '#64748b';
    ctx.font = '8px sans-serif';
    ctx.fillText('噪声 → 清晰', rightX + rightW / 2, revMiniY + miniRows * miniGrid + 12);

    // 当前状态
    const statusY = revMiniY + miniRows * miniGrid + 30;
    if (step === 0) {
      ctx.fillStyle = '#EF4444';
      ctx.font = '10px sans-serif';
      ctx.fillText('🔴 纯噪声', rightX + rightW / 2, statusY);
    } else if (step >= maxSteps) {
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('✅ 图像生成完成！', rightX + rightW / 2, statusY);
    } else {
      ctx.fillStyle = '#F59E0B';
      ctx.font = '10px sans-serif';
      ctx.fillText(`🔧 去噪中... ${Math.round(denoiseLevel * 100)}%`, rightX + rightW / 2, statusY);
    }

    // 底部说明
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎨 扩散模型 = 从噪声中雕刻出图像，像米开朗基罗凿去多余的大理石', rect.width / 2, rect.height - 8);

  }, [step]);

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex items-center gap-2">
        <button
          onClick={() => setStep(s => Math.min(s + 2, maxSteps))}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          去噪 +2 →
        </button>
        <button
          onClick={autoPlay}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          ▶ 自动播放
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
