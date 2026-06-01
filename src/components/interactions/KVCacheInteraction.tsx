'use client';

import { useRef, useEffect, useState } from 'react';

/**
 * KV Cache 交互演示
 * 缓存 Key 和 Value 避免重复计算
 * 类比：把算过的中间结果写在草稿纸上
 */

export default function KVCacheInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [genPos, setGenPos] = useState(0);
  const words = ['今天', '天气', '真好', '适合', '出去', '散步'];

  const nextWord = () => setGenPos(p => Math.min(p + 1, words.length - 1));
  const reset = () => setGenPos(0);

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
    const halfH = (rect.height - 60) / 2;

    const drawRow = (offsetY: number, title: string, titleColor: string, useCache: boolean) => {
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.roundRect(pad, offsetY, rect.width - pad * 2, halfH, 8);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = titleColor;
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(title, pad + 10, offsetY + 16);

      // Token 方块
      const boxW = 38;
      const boxH = 26;
      const boxGap = 4;
      const startX = pad + 10;
      const startY = offsetY + 24;

      let totalCompute = 0;

      for (let i = 0; i <= genPos && i < words.length; i++) {
        const bx = startX + i * (boxW + boxGap);
        const isCurrent = i === genPos;

        // 计算量
        const compute = useCache ? (isCurrent ? i + 1 : i + 1) : genPos + 1;
        totalCompute += useCache ? (isCurrent ? i + 1 : 0) : (genPos + 1);

        // K/V 矩阵
        if (!useCache || (useCache && i <= genPos)) {
          // K block
          ctx.fillStyle = isCurrent ? '#3B82F640' : '#3B82F615';
          ctx.beginPath();
          ctx.roundRect(bx, startY, boxW, boxH / 2 - 1, 3);
          ctx.fill();
          ctx.fillStyle = isCurrent ? '#60A5FA' : '#3B82F680';
          ctx.font = '7px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('K', bx + boxW / 2, startY + 8);

          // V block
          ctx.fillStyle = isCurrent ? '#8B5CF640' : '#8B5CF615';
          ctx.beginPath();
          ctx.roundRect(bx, startY + boxH / 2 + 1, boxW, boxH / 2 - 1, 3);
          ctx.fill();
          ctx.fillStyle = isCurrent ? '#A78BFA' : '#8B5CF680';
          ctx.fillText('V', bx + boxW / 2, startY + boxH / 2 + 10);
        }

        // 词
        ctx.fillStyle = isCurrent ? '#fff' : '#94a3b8';
        ctx.font = `${isCurrent ? 'bold ' : ''}9px sans-serif`;
        ctx.fillText(words[i], bx + boxW / 2, startY + boxH + 14);

        // 已缓存标记
        if (useCache && i < genPos) {
          ctx.fillStyle = '#10B981';
          ctx.font = '7px sans-serif';
          ctx.fillText('📋缓存', bx + boxW / 2, startY - 4);
        }

        // 计算量指示
        if (isCurrent && useCache) {
          ctx.fillStyle = '#10B981';
          ctx.font = '7px sans-serif';
          ctx.fillText(`计算${i + 1}次`, bx + boxW / 2, startY + boxH + 24);
        } else if (!useCache && i === genPos) {
          ctx.fillStyle = '#EF4444';
          ctx.font = '7px sans-serif';
          ctx.fillText(`重复计算${(genPos + 1) * (genPos + 1)}次`, bx + boxW / 2, startY + boxH + 24);
        }
      }

      // 总计算量
      const noCacheCompute = Array.from({ length: genPos + 1 }, (_, i) => (i + 1) * (i + 1)).reduce((a, b) => a + b, 0);
      const cacheCompute = Array.from({ length: genPos + 1 }, (_, i) => i + 1).reduce((a, b) => a + b, 0);
      const compute = useCache ? cacheCompute : noCacheCompute;
      const maxCompute = 6 * 7 * 13 / 2; // max possible

      const barY = startY + boxH + 34;
      const barW = rect.width - pad * 4 - 60;
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(pad + 60, barY, barW, 8, 4);
      ctx.fill();
      const fillW = Math.min(barW * (compute / maxCompute), barW);
      ctx.fillStyle = useCache ? '#10B981' : '#EF4444';
      ctx.beginPath();
      ctx.roundRect(pad + 60, barY, Math.max(fillW, 2), 8, 4);
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('计算量:', pad + 10, barY + 7);
      ctx.fillStyle = useCache ? '#10B981' : '#EF4444';
      ctx.textAlign = 'right';
      ctx.fillText(`${compute} 次`, rect.width - pad - 10, barY + 7);
    };

    drawRow(pad, '❌ 无 KV Cache — 每次重新计算所有注意力', '#EF4444', false);
    drawRow(pad + halfH + 8, '✅ 有 KV Cache — 只计算新增部分', '#10B981', true);

    // 节省比例
    if (genPos > 0) {
      const noCacheCompute = Array.from({ length: genPos + 1 }, (_, i) => (i + 1) * (i + 1)).reduce((a, b) => a + b, 0);
      const cacheCompute = Array.from({ length: genPos + 1 }, (_, i) => i + 1).reduce((a, b) => a + b, 0);
      const saving = ((1 - cacheCompute / noCacheCompute) * 100).toFixed(0);

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`⚡ KV Cache 节省了 ${saving}% 的计算量`, rect.width / 2, rect.height - 8);
    } else {
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📋 KV Cache = 草稿纸，把算过的结果存起来避免重复计算', rect.width / 2, rect.height - 8);
    }

  }, [genPos]);

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex gap-2">
        <button
          onClick={nextWord}
          disabled={genPos >= words.length - 1}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white disabled:opacity-40 transition-colors"
        >
          生成下一个词 →
        </button>
        <button onClick={reset} className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors">
          🔄 重置
        </button>
        <span className="text-xs text-[#64748b] ml-auto self-center">
          已生成: {genPos + 1}/{words.length} 词
        </span>
      </div>
      <div style={{ height: '240px', position: 'relative' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
    </div>
  );
}
