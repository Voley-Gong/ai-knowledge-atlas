'use client';

import { useRef, useEffect, useState } from 'react';

type Phase = 'idle' | 'forward' | 'backward';

interface Node {
  x: number;
  y: number;
  value: number;
  error: number;
  label: string;
}

const LAYERS = [3, 4, 2]; // input, hidden, output
const TARGET = [0.9, 0.1];

export default function BackpropagationInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [animProgress, setAnimProgress] = useState(0);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [animating, setAnimating] = useState(false);

  const initNodes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const allNodes: Node[] = [];
    LAYERS.forEach((count, li) => {
      const x = 60 + li * ((rect.width - 120) / (LAYERS.length - 1));
      for (let ni = 0; ni < count; ni++) {
        const y = (rect.height - 40) / 2 - ((count - 1) * 40) / 2 + ni * 40 + 20;
        const val = Math.random();
        allNodes.push({
          x, y, value: val, error: 0,
          label: li === 0 ? `x${ni + 1}` : li === LAYERS.length - 1 ? `y${ni + 1}` : `h${ni + 1}`,
        });
      }
    });
    setNodes(allNodes);
  };

  useEffect(() => { initNodes(); }, []);

  const getLayerRange = (layerIdx: number): [number, number] => {
    let start = 0;
    for (let i = 0; i < layerIdx; i++) start += LAYERS[i];
    return [start, start + LAYERS[layerIdx]];
  };

  const runAnimation = (targetPhase: Phase) => {
    if (animating) return;
    setAnimating(true);
    setPhase(targetPhase);
    setAnimProgress(0);

    let progress = 0;
    const maxLayer = targetPhase === 'forward' ? LAYERS.length - 1 : LAYERS.length - 1;
    const totalSteps = maxLayer * 20;

    const interval = setInterval(() => {
      progress++;
      const layerReached = Math.floor((progress / totalSteps) * maxLayer);
      setAnimProgress(layerReached);

      if (targetPhase === 'forward') {
        setNodes(prev => prev.map((n, i) => {
          const li = Math.floor(i / 1); // simplified
          return { ...n, value: Math.random() };
        }));
      } else {
        setNodes(prev => prev.map((n, i) => {
          let layerOfNode = 0;
          let acc = 0;
          for (let l = 0; l < LAYERS.length; l++) {
            if (i < acc + LAYERS[l]) { layerOfNode = l; break; }
            acc += LAYERS[l];
          }
          if (layerOfNode >= LAYERS.length - 1 - layerReached && layerOfNode > 0) {
            const error = Math.abs(n.value - TARGET[i - acc]) || Math.random() * 0.5;
            return { ...n, error };
          }
          return n;
        }));
      }

      if (progress >= totalSteps) {
        clearInterval(interval);
        setAnimating(false);
      }
    }, 80);
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

    if (nodes.length === 0) return;

    // Draw connections
    for (let li = 0; li < LAYERS.length - 1; li++) {
      const [s1, e1] = getLayerRange(li);
      const [s2, e2] = getLayerRange(li + 1);

      const isActive = phase === 'forward'
        ? li < animProgress + 1
        : phase === 'backward'
          ? (LAYERS.length - 2 - li) < animProgress + 1
          : false;

      for (let i = s1; i < e1; i++) {
        for (let j = s2; j < e2; j++) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);

          if (isActive && phase === 'forward') {
            const gradient = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
            gradient.addColorStop(0, '#10B98180');
            gradient.addColorStop(1, '#10B98130');
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
          } else if (isActive && phase === 'backward') {
            const gradient = ctx.createLinearGradient(nodes[j].x, nodes[j].y, nodes[i].x, nodes[i].y);
            gradient.addColorStop(0, '#EF444480');
            gradient.addColorStop(1, '#EF444430');
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
          } else {
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1;
          }
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach((node, i) => {
      let layerOfNode = 0;
      let acc = 0;
      for (let l = 0; l < LAYERS.length; l++) {
        if (i < acc + LAYERS[l]) { layerOfNode = l; break; }
        acc += LAYERS[l];
      }

      const isActive = phase === 'forward'
        ? layerOfNode <= animProgress
        : phase === 'backward'
          ? layerOfNode >= LAYERS.length - 1 - animProgress
          : false;

      const errorLevel = node.error;
      const radius = 16;

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);

      if (phase === 'backward' && errorLevel > 0) {
        const red = Math.round(errorLevel * 255);
        ctx.fillStyle = `rgba(${red}, 40, 40, 0.6)`;
        ctx.strokeStyle = `rgb(${red}, 80, 80)`;
      } else if (phase === 'forward' && isActive) {
        ctx.fillStyle = '#064e3b';
        ctx.strokeStyle = '#10B981';
      } else {
        ctx.fillStyle = '#111827';
        ctx.strokeStyle = isActive ? '#3B82F6' : '#334155';
      }

      ctx.lineWidth = isActive ? 2.5 : 1.5;
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);

      // Value
      if (phase === 'forward' && isActive) {
        ctx.fillStyle = '#10B981';
        ctx.font = '9px sans-serif';
        ctx.fillText(node.value.toFixed(2), node.x, node.y + 24);
      }
      if (phase === 'backward' && errorLevel > 0) {
        ctx.fillStyle = '#EF4444';
        ctx.font = '9px sans-serif';
        ctx.fillText(`err:${errorLevel.toFixed(2)}`, node.x, node.y + 24);
      }
    });

    // Labels
    const layerNames = ['输入层', '隐藏层', '输出层'];
    LAYERS.forEach((_, li) => {
      const [s] = getLayerRange(li);
      const x = nodes[s].x;
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(layerNames[li], x, rect.height - 8);
    });

    // Phase indicator
    if (phase !== 'idle') {
      ctx.fillStyle = phase === 'forward' ? '#10B981' : '#EF4444';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(
        phase === 'forward' ? '→ 前向传播中...' : '← 反向传播中（追责）...',
        15, 16
      );
    }
  }, [nodes, phase, animProgress]);

  const reset = () => {
    setPhase('idle');
    setAnimProgress(0);
    initNodes();
  };

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex gap-2 items-center">
        <button
          onClick={() => runAnimation('forward')}
          disabled={animating}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors disabled:opacity-50"
        >
          ➡️ 前向传播
        </button>
        <button
          onClick={() => runAnimation('backward')}
          disabled={animating || phase === 'idle'}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors disabled:opacity-50"
        >
          ⬅️ 反向传播
        </button>
        <button
          onClick={reset}
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
