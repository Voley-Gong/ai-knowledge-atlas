'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

type BatchSize = 1 | 8 | 32 | 128;

const PLATE_TOTAL = 20; // total "dumplings"

export default function BatchEpochInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [batchSize, setBatchSize] = useState<BatchSize>(8);
  const [epochs, setEpochs] = useState(3);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0); // 0-1 per epoch animation
  const [epochProgress, setEpochProgress] = useState(0); // which epoch we're on
  const [history, setHistory] = useState<number[]>([]);

  // Generate a training loss curve based on batch size
  const genLoss = useCallback((step: number, bs: BatchSize): number => {
    const base = 2.5 * Math.exp(-step * 0.3) + 0.3;
    const noise = bs <= 8 ? (Math.sin(step * 3.7) * 0.15 + Math.cos(step * 5.3) * 0.1) : bs <= 32 ? Math.sin(step * 2) * 0.05 : 0.01;
    return Math.max(0.1, base + noise);
  }, []);

  useEffect(() => {
    if (!running) return;
    const totalSteps = epochs * Math.ceil(PLATE_TOTAL / batchSize);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const currentEpoch = Math.floor((step - 1) / Math.ceil(PLATE_TOTAL / batchSize));
      const stepInEpoch = ((step - 1) % Math.ceil(PLATE_TOTAL / batchSize)) / Math.ceil(PLATE_TOTAL / batchSize);
      setEpochProgress(currentEpoch);
      setProgress(stepInEpoch);
      setHistory(prev => [...prev, genLoss(step, batchSize)]);
      if (step >= totalSteps) {
        clearInterval(interval);
        setRunning(false);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [running, batchSize, epochs, genLoss]);

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

    // === TOP LEFT: Dumpling plate animation ===
    const plateSize = Math.min(rect.width * 0.4, 120);
    const plateX = pad + plateSize / 2 + 10;
    const plateY = plateSize / 2 + 20;

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🥟 饺子盘比喻', plateX, 12);

    // Plate
    ctx.beginPath();
    ctx.arc(plateX, plateY, plateSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1f35';
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dumplings on plate
    const totalSlots = Math.min(PLATE_TOTAL, 20);
    const eatenPerEpoch = Math.ceil(totalSlots / Math.ceil(PLATE_TOTAL / batchSize)) * Math.ceil(PLATE_TOTAL / batchSize);
    const eatenThisEpoch = Math.floor(progress * eatenPerEpoch);
    const totalEaten = epochProgress * eatenPerEpoch + eatenThisEpoch;

    for (let i = 0; i < totalSlots; i++) {
      const angle = (i / totalSlots) * Math.PI * 2 - Math.PI / 2;
      const r = plateSize * 0.3;
      const dx = plateX + Math.cos(angle) * r;
      const dy = plateY + Math.sin(angle) * r;
      const isEaten = i < totalEaten;

      ctx.font = isEaten ? '10px sans-serif' : '12px sans-serif';
      ctx.fillStyle = isEaten ? '#334155' : '#F59E0B';
      ctx.fillText(isEaten ? '·' : '🥟', dx, dy + 4);
    }

    // Epoch indicator
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Epoch ${epochProgress + 1}/${epochs}`, plateX, plateY + plateSize / 2 + 15);
    ctx.fillText(`Batch: ${batchSize} 个/口`, plateX, plateY + plateSize / 2 + 27);

    // === TOP RIGHT: Info ===
    const infoX = rect.width * 0.42 + pad;
    const infoW = rect.width * 0.58 - pad * 2;

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('⚙️ 训练配置', infoX, 12);

    // Batch size buttons
    const batches: BatchSize[] = [1, 8, 32, 128];
    const btnW = 38;
    batches.forEach((bs, i) => {
      const bx = infoX + i * (btnW + 4);
      const by = 22;
      ctx.fillStyle = batchSize === bs ? '#3B82F630' : '#1e293b';
      ctx.beginPath(); ctx.roundRect(bx, by, btnW, 20, 4); ctx.fill();
      ctx.strokeStyle = batchSize === bs ? '#3B82F6' : '#334155';
      ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = batchSize === bs ? '#3B82F6' : '#64748b';
      ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(`${bs}`, bx + btnW / 2, by + 13);
    });

    // Epoch slider
    const sliderX = infoX;
    const sliderY = 55;
    const sliderW = infoW - 20;
    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.roundRect(sliderX, sliderY, sliderW, 6, 3); ctx.fill();
    const knobX = sliderX + ((epochs - 1) / 9) * sliderW;
    ctx.fillStyle = '#8B5CF6';
    ctx.beginPath(); ctx.arc(knobX, sliderY + 3, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(`Epochs: ${epochs}`, sliderX, sliderY - 5);

    // Explanation
    const descY = sliderY + 22;
    ctx.fillStyle = '#64748b';
    ctx.font = '9px sans-serif'; ctx.textAlign = 'left';
    if (batchSize <= 8) {
      ctx.fillText('🐟 小 Batch: 震荡大，但泛化可能更好', infoX, descY);
    } else if (batchSize <= 32) {
      ctx.fillText('⚖️ 中 Batch: 训练稳定，速度适中', infoX, descY);
    } else {
      ctx.fillText('🐘 大 Batch: 平滑，但可能陷入局部最优', infoX, descY);
    }

    // Steps per epoch
    const stepsPerEpoch = Math.ceil(PLATE_TOTAL / batchSize);
    ctx.fillText(`每 Epoch 步数: ${stepsPerEpoch}`, infoX, descY + 14);

    // === BOTTOM: Training curve ===
    const curveY = descY + 32;
    const curveH = rect.height - curveY - pad;
    const curveW = rect.width - pad * 2;
    const curveX = pad;

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('📉 训练曲线', curveX, curveY - 3);

    // Curve background
    ctx.fillStyle = '#0a0e1a';
    ctx.beginPath(); ctx.roundRect(curveX, curveY + 3, curveW, curveH, 4); ctx.fill();

    if (history.length > 1) {
      const maxLoss = Math.max(...history, 3);
      ctx.beginPath();
      ctx.strokeStyle = batchSize <= 8 ? '#F59E0B' : batchSize <= 32 ? '#3B82F6' : '#10B981';
      ctx.lineWidth = 1.5;
      history.forEach((loss, i) => {
        const hx = curveX + (i / Math.max(history.length - 1, 1)) * curveW;
        const hy = curveY + 3 + curveH - (loss / maxLoss) * curveH;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      });
      ctx.stroke();
    } else {
      ctx.fillStyle = '#334155';
      ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('点击"开始训练"查看曲线', curveX + curveW / 2, curveY + curveH / 2 + 5);
    }
  }, [batchSize, epochs, running, progress, epochProgress, history]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Check batch size buttons
    const infoX = rect.width * 0.42 + 12;
    const btnW = 38;
    const batches: BatchSize[] = [1, 8, 32, 128];
    batches.forEach((bs, i) => {
      const bx = infoX + i * (btnW + 4);
      if (mx >= bx && mx <= bx + btnW && my >= 22 && my <= 42) {
        setBatchSize(bs);
      }
    });

    // Check epoch slider
    const sliderX = infoX;
    const sliderY = 55;
    const sliderW = (rect.width * 0.58 - 12 * 2) - 20;
    if (my >= sliderY - 8 && my <= sliderY + 14 && mx >= sliderX && mx <= sliderX + sliderW) {
      const norm = (mx - sliderX) / sliderW;
      setEpochs(Math.max(1, Math.min(10, Math.round(norm * 9 + 1))));
    }
  };

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex gap-2 items-center">
        <button
          onClick={() => { setRunning(true); setHistory([]); setEpochProgress(0); setProgress(0); }}
          disabled={running}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white disabled:opacity-50 transition-colors"
        >
          {running ? '⏳ 训练中...' : '▶ 开始训练'}
        </button>
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
