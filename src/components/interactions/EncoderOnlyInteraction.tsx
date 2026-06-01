'use client';

import { useRef, useEffect, useState } from 'react';

const SENTENCE = 'The cat sat on the [MASK] yesterday';
const WORDS = ['The', 'cat', 'sat', 'on', 'the', '[MASK]', 'yesterday'];
const MASK_INDEX = 5;

const PREDICTIONS: Record<number, { word: string; conf: number }[]> = {
  0: [
    { word: 'A', conf: 0.42 }, { word: 'The', conf: 0.35 }, { word: 'My', conf: 0.12 }, { word: 'That', conf: 0.08 },
  ],
  1: [
    { word: 'dog', conf: 0.38 }, { word: 'cat', conf: 0.30 }, { word: 'bird', conf: 0.18 }, { word: 'fish', conf: 0.10 },
  ],
  2: [
    { word: 'stood', conf: 0.35 }, { word: 'sat', conf: 0.28 }, { word: 'lay', conf: 0.22 }, { word: 'ran', conf: 0.12 },
  ],
  3: [
    { word: 'in', conf: 0.40 }, { word: 'on', conf: 0.30 }, { word: 'at', conf: 0.18 }, { word: 'by', conf: 0.10 },
  ],
  4: [
    { word: 'a', conf: 0.45 }, { word: 'the', conf: 0.32 }, { word: 'that', conf: 0.13 }, { word: 'his', conf: 0.07 },
  ],
  5: [
    { word: 'mat', conf: 0.52 }, { word: 'couch', conf: 0.18 }, { word: 'floor', conf: 0.15 }, { word: 'chair', conf: 0.10 },
  ],
  6: [
    { word: 'morning', conf: 0.48 }, { word: 'yesterday', conf: 0.25 }, { word: 'evening', conf: 0.15 }, { word: 'night', conf: 0.08 },
  ],
};

export default function EncoderOnlyInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [maskPos, setMaskPos] = useState(MASK_INDEX);
  const [processing, setProcessing] = useState(false);
  const [layerProgress, setLayerProgress] = useState(0);

  const currentWords = WORDS.map((w, i) => i === maskPos ? '[MASK]' : w);

  const startProcess = () => {
    setProcessing(true);
    setLayerProgress(0);
  };

  useEffect(() => {
    if (!processing) return;
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      setLayerProgress(Math.min(1, frame / 50));
      if (frame >= 50) { clearInterval(interval); setProcessing(false); }
    }, 40);
    return () => clearInterval(interval);
  }, [processing]);

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

    // Title
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🧠 BERT: 阅读理解专家 (Encoder-Only)', rect.width / 2, 14);

    // Sentence at top
    const wordSpacing = Math.min(55, (rect.width - pad * 2) / currentWords.length);
    const startX = (rect.width - wordSpacing * (currentWords.length - 1)) / 2;
    const wordY = 38;

    currentWords.forEach((word, i) => {
      const wx = startX + i * wordSpacing;
      const isMasked = i === maskPos;

      // Word box
      ctx.beginPath();
      ctx.roundRect(wx - 22, wordY - 11, 44, 22, 5);
      ctx.fillStyle = isMasked ? '#8B5CF620' : '#1e293b';
      ctx.fill();
      ctx.strokeStyle = isMasked ? '#8B5CF6' : '#334155';
      ctx.lineWidth = isMasked ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = isMasked ? '#A78BFA' : '#94a3b8';
      ctx.font = `${isMasked ? 'bold ' : ''}10px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(word, wx, wordY + 3);

      // Click hint for non-masked words
      if (!isMasked) {
        ctx.fillStyle = '#334155';
        ctx.font = '7px sans-serif';
        ctx.fillText('点击遮盖', wx, wordY + 19);
      }
    });

    // Processing layers
    const layersY = wordY + 30;
    const layerCount = 6;
    const layerH = 14;
    const layerSpacing = layerH + 3;

    for (let l = 0; l < layerCount; l++) {
      const ly = layersY + l * layerSpacing;
      const progress = processing ? Math.min(1, layerProgress * layerCount - l) : (layerProgress >= 1 ? 1 : 0);

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(pad, ly, rect.width - pad * 2, layerH, 3);
      ctx.fill();

      // Progress fill
      if (progress > 0) {
        ctx.fillStyle = '#3B82F620';
        ctx.beginPath();
        ctx.roundRect(pad, ly, (rect.width - pad * 2) * progress, layerH, 3);
        ctx.fill();
      }

      // Layer label
      ctx.fillStyle = progress > 0.5 ? '#3B82F6' : '#4b5563';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Layer ${l + 1}`, pad + 4, ly + 10);

      // Show flowing token representations
      if (progress > 0) {
        currentWords.forEach((_, ti) => {
          const tx = startX + ti * wordSpacing;
          const dotSize = 2 + Math.sin(l * 0.8 + ti * 0.5) * 1;
          ctx.beginPath();
          ctx.arc(tx, ly + layerH / 2, dotSize, 0, Math.PI * 2);
          ctx.fillStyle = ti === maskPos ? '#8B5CF6' : '#3B82F6';
          ctx.globalAlpha = 0.3 + progress * 0.4;
          ctx.fill();
          ctx.globalAlpha = 1;
        });
      }
    }

    // Predictions
    const predY = layersY + layerCount * layerSpacing + 12;
    const preds = PREDICTIONS[maskPos] || PREDICTIONS[5];

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎯 预测结果 (点击词可切换遮盖位置)', rect.width / 2, predY - 2);

    const barStartX = rect.width / 2 - 100;
    const barW = 200;
    preds.forEach((pred, i) => {
      const by = predY + 4 + i * 20;
      const conf = processing ? 0 : pred.conf;

      // Word label
      ctx.fillStyle = i === 0 ? '#10B981' : '#94a3b8';
      ctx.font = `${i === 0 ? 'bold ' : ''}10px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(i === 0 ? '🏆' : `${i + 1}.`, barStartX - 16, by + 10);

      // Bar background
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(barStartX, by, barW, 14, 3);
      ctx.fill();

      // Confidence bar
      ctx.fillStyle = i === 0 ? '#10B98180' : '#3B82F640';
      ctx.beginPath();
      ctx.roundRect(barStartX, by, barW * conf, 14, 3);
      ctx.fill();

      // Label
      ctx.fillStyle = '#fff';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${pred.word} (${(conf * 100).toFixed(0)}%)`, barStartX + 4, by + 10);
    });
  }, [maskPos, processing, layerProgress, currentWords]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Check word clicks
    const pad = 12;
    const wordSpacing = Math.min(55, (rect.width - pad * 2) / WORDS.length);
    const startX = (rect.width - wordSpacing * (WORDS.length - 1)) / 2;
    const wordY = 38;

    WORDS.forEach((_, i) => {
      const wx = startX + i * wordSpacing;
      if (Math.abs(mx - wx) < 25 && Math.abs(my - wordY) < 15) {
        setMaskPos(i);
        setLayerProgress(0);
      }
    });
  };

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex gap-2 items-center">
        <button
          onClick={startProcess}
          disabled={processing}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white disabled:opacity-50 transition-colors"
        >
          {processing ? '⏳ 处理中...' : '▶ 运行 BERT'}
        </button>
        <span className="text-xs text-[#64748b]">点击上方词语切换遮盖位置</span>
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
