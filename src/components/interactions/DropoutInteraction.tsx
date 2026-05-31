'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface Node {
  x: number;
  y: number;
  layer: number;
  active: boolean;
}

export default function DropoutInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [training, setTraining] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [seed, setSeed] = useState(0);

  // Build network
  useEffect(() => {
    const layers = [4, 6, 6, 4];
    const ns: Node[] = [];
    layers.forEach((count, li) => {
      for (let ni = 0; ni < count; ni++) {
        ns.push({
          x: li,
          y: ni,
          layer: li,
          active: true,
        });
      }
    });
    setNodes(ns);
  }, []);

  const toggleTraining = () => {
    if (!training) {
      // Activate dropout - randomly deactivate ~40% of nodes (not input/output)
      const rng = (s: number) => {
        const x = Math.sin(s * 9301 + 49297) * 49297;
        return x - Math.floor(x);
      };
      setNodes(prev => prev.map((n, i) => ({
        ...n,
        active: n.layer === 0 || n.layer === 3 ? true : rng(i + seed * 100) > 0.4,
      })));
      setSeed(s => s + 1);
    } else {
      setNodes(prev => prev.map(n => ({ ...n, active: true })));
    }
    setTraining(!training);
  };

  const draw = useCallback(() => {
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

    const layers = [4, 6, 6, 4];
    const pad = 40;
    const layerSpacing = (rect.width - pad * 2) / (layers.length - 1);
    const getNodePos = (layer: number, index: number): [number, number] => {
      const x = pad + layer * layerSpacing;
      const count = layers[layer];
      const totalH = rect.height - 60;
      const spacing = totalH / (count + 1);
      const y = 30 + spacing * (index + 1);
      return [x, y];
    };

    // Draw connections
    for (let li = 0; li < layers.length - 1; li++) {
      for (let ni = 0; ni < layers[li]; ni++) {
        for (let nj = 0; nj < layers[li + 1]; nj++) {
          const fromNode = nodes.find(n => n.layer === li && n.y === ni);
          const toNode = nodes.find(n => n.layer === li + 1 && n.y === nj);
          const [x1, y1] = getNodePos(li, ni);
          const [x2, y2] = getNodePos(li + 1, nj);
          const bothActive = fromNode?.active && toNode?.active;
          ctx.strokeStyle = bothActive ? '#33415580' : '#1e293b40';
          ctx.lineWidth = bothActive ? 1 : 0.5;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach(n => {
      const [x, y] = getNodePos(n.layer, n.y);
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);

      if (!n.active) {
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
        // X mark
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 5, y - 5);
        ctx.lineTo(x + 5, y + 5);
        ctx.moveTo(x + 5, y - 5);
        ctx.lineTo(x - 5, y + 5);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#3B82F630';
        ctx.fill();
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Layer labels
    const layerNames = ['输入层', '隐藏层1', '隐藏层2', '输出层'];
    layers.forEach((_, li) => {
      const x = pad + li * layerSpacing;
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(layerNames[li], x, rect.height - 8);
    });

    // Status
    const activeCount = nodes.filter(n => n.active).length;
    const totalCount = nodes.length;
    ctx.fillStyle = training ? '#F59E0B' : '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(
      training ? `训练中: ${activeCount}/${totalCount} 节点活跃` : '点击"训练中"随机关闭节点',
      rect.width - pad,
      18
    );
  }, [nodes, training]);

  useEffect(() => { draw(); }, [draw]);

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-2 flex gap-2">
        <button
          onClick={toggleTraining}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            training
              ? 'bg-yellow-600/30 text-yellow-400 hover:bg-yellow-600/40'
              : 'bg-[#1e293b] text-[#94a3b8] hover:text-white'
          }`}
        >
          {training ? '🟡 训练中 (点击切换)' : '⚪ 点击开始训练'}
        </button>
      </div>
      <div className="flex-1">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
}
