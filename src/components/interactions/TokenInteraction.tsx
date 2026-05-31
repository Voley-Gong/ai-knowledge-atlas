'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

// Simple Chinese tokenizer simulation
function simpleTokenize(text: string): string[] {
  if (!text) return [];
  const tokens: string[] = [];
  let i = 0;
  while (i < text.length) {
    if (i + 1 < text.length && Math.random() > 0.4) {
      tokens.push(text.slice(i, i + 2));
      i += 2;
    } else {
      tokens.push(text.slice(i, i + 1));
      i += 1;
    }
  }
  return tokens;
}

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#F97316', '#84CC16'];

const PRESETS = [
  { text: '人工智能改变世界', tokens: ['人工', '智能', '改变', '世界'] },
  { text: '深度学习很强大', tokens: ['深度', '学习', '很', '强大'] },
  { text: 'Hello World!', tokens: ['Hello', ' World', '!'] },
];

export default function TokenInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [input, setInput] = useState('人工智能改变世界');
  const [tokens, setTokens] = useState<string[]>(['人工', '智能', '改变', '世界']);
  const [hoveredToken, setHoveredToken] = useState<number | null>(null);

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

    if (tokens.length === 0) return;

    // Calculate layout
    const padding = 20;
    const gap = 8;
    const blockSize = 44;
    const startY = 20;

    // Draw token blocks
    let x = padding;
    let y = startY;
    tokens.forEach((token, i) => {
      const width = Math.max(blockSize, ctx.measureText(token).width + 24);
      if (x + width > rect.width - padding) {
        x = padding;
        y += blockSize + gap;
      }

      const color = COLORS[i % COLORS.length];
      const isHovered = hoveredToken === i;

      // Block
      ctx.fillStyle = isHovered ? color + '40' : color + '20';
      ctx.strokeStyle = isHovered ? color : color + '80';
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(x, y, width, blockSize, 8);
      ctx.fill();
      ctx.stroke();

      // Text
      ctx.fillStyle = isHovered ? '#fff' : color;
      ctx.font = `${isHovered ? 'bold ' : ''}16px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(token, x + width / 2, y + blockSize / 2);

      // Token index
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`#${i + 1}`, x + 4, y + blockSize - 6);

      x += width + gap;
    });

    // Hovered token info
    if (hoveredToken !== null && hoveredToken < tokens.length) {
      const token = tokens[hoveredToken];
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Token #${hoveredToken + 1}: "${token}" (${token.length} chars)`, padding, rect.height - 10);
    }
  }, [tokens, hoveredToken]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const padding = 20;
    const gap = 8;
    const blockSize = 44;
    let x = padding;
    let y = 20;
    let found = false;

    for (let i = 0; i < tokens.length; i++) {
      const width = Math.max(blockSize, ctx.measureText(tokens[i]).width + 24);
      if (x + width > rect.width - padding) {
        x = padding;
        y += blockSize + gap;
      }
      if (mx >= x && mx <= x + width && my >= y && my <= y + blockSize) {
        setHoveredToken(i);
        found = true;
        break;
      }
      x += width + gap;
    }
    if (!found) setHoveredToken(null);
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    if (val) {
      // Check if matches a preset
      const preset = PRESETS.find(p => p.text === val);
      setTokens(preset ? preset.tokens : simpleTokenize(val));
    } else {
      setTokens([]);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => handleInputChange(e.target.value)}
          placeholder="输入文字查看分词效果..."
          className="flex-1 bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#64748b] outline-none focus:border-blue-500"
        />
      </div>
      <div className="flex gap-2 px-4 pb-2">
        {PRESETS.map(p => (
          <button
            key={p.text}
            onClick={() => { setInput(p.text); setTokens(p.tokens); }}
            className="text-xs px-2 py-1 rounded bg-[#1e293b] text-[#94a3b8] hover:text-white hover:bg-[#334155] transition-colors"
          >
            {p.text}
          </button>
        ))}
      </div>
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredToken(null)}
        />
      </div>
    </div>
  );
}
