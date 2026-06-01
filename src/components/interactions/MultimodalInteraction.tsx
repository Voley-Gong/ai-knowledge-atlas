'use client';

import { useRef, useEffect, useState } from 'react';

/**
 * Multimodal（多模态）交互演示
 * 让AI同时理解文字、图片、音频等多种信息
 */

const MODALITIES = [
  { id: 'text', name: '文本', icon: '📝', color: '#3B82F6', example: '"一只橘猫坐在沙发上"' },
  { id: 'image', name: '图像', icon: '🖼️', color: '#10B981', example: '橘猫照片 → [0.2, 0.8, ...]' },
  { id: 'audio', name: '音频', icon: '🎵', color: '#8B5CF6', example: '"喵~" → [0.1, 0.5, ...]' },
];

const TASKS = [
  { name: '看图说话', needs: ['text', 'image'], desc: '描述图片内容' },
  { name: '图文搜索', needs: ['text', 'image'], desc: '用文字搜图片' },
  { name: '视频理解', needs: ['text', 'image', 'audio'], desc: '理解视频内容' },
];

export default function MultimodalInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeModes, setActiveModes] = useState<Set<string>>(new Set(['text']));
  const [step, setStep] = useState(0);

  const toggleMode = (id: string) => {
    setActiveModes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setStep(0);
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
    const activeMods = MODALITIES.filter(m => activeModes.has(m.id));

    // 模态输入节点
    const inputStartX = pad + 10;
    const inputSpacing = (rect.width * 0.4) / 3;
    const inputY = 40;

    activeMods.forEach((mod, i) => {
      const ix = inputStartX + i * inputSpacing;
      // 编码器框
      ctx.fillStyle = mod.color + '15';
      ctx.beginPath();
      ctx.roundRect(ix, inputY, inputSpacing - 8, 50, 6);
      ctx.fill();
      ctx.strokeStyle = step >= 1 ? mod.color : mod.color + '40';
      ctx.lineWidth = step >= 1 ? 1.5 : 1;
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(mod.icon, ix + (inputSpacing - 8) / 2, inputY + 18);

      ctx.fillStyle = mod.color;
      ctx.font = '9px sans-serif';
      ctx.fillText(mod.name, ix + (inputSpacing - 8) / 2, inputY + 32);

      ctx.fillStyle = '#64748b';
      ctx.font = '7px sans-serif';
      ctx.fillText('编码器', ix + (inputSpacing - 8) / 2, inputY + 44);

      // 编码后的向量
      if (step >= 1) {
        const vecY = inputY + 58;
        ctx.fillStyle = mod.color + '30';
        ctx.beginPath();
        ctx.roundRect(ix + 4, vecY, inputSpacing - 16, 18, 4);
        ctx.fill();
        ctx.strokeStyle = mod.color + '60';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.fillStyle = mod.color;
        ctx.font = '7px sans-serif';
        ctx.fillText('[向量]', ix + (inputSpacing - 8) / 2, vecY + 12);
      }

      // 到融合层的连线
      if (step >= 2) {
        const fusionX = rect.width * 0.35;
        const fusionY = 145;
        ctx.strokeStyle = mod.color + '60';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ix + (inputSpacing - 8) / 2, inputY + 76);
        ctx.lineTo(fusionX, fusionY);
        ctx.stroke();
      }
    });

    // 融合层
    if (step >= 2) {
      const fusionX = rect.width * 0.25;
      const fusionY = 135;
      const fusionW = rect.width * 0.2;
      const fusionH = 36;

      ctx.fillStyle = '#F59E0B15';
      ctx.beginPath();
      ctx.roundRect(fusionX, fusionY, fusionW, fusionH, 8);
      ctx.fill();
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔀 多模态融合层', fusionX + fusionW / 2, fusionY + 15);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px sans-serif';
      ctx.fillText(`融合 ${activeMods.length} 种模态`, fusionX + fusionW / 2, fusionY + 28);

      // 到输出的连线
      if (step >= 3) {
        const outX = rect.width * 0.55;
        ctx.strokeStyle = '#10B98160';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(fusionX + fusionW, fusionY + fusionH / 2);
        ctx.lineTo(outX, fusionY + fusionH / 2);
        ctx.stroke();
      }
    }

    // 输出
    if (step >= 3) {
      const outX = rect.width * 0.55;
      const outY = 125;
      ctx.fillStyle = '#10B98115';
      ctx.beginPath();
      ctx.roundRect(outX, outY, rect.width * 0.4, 56, 8);
      ctx.fill();
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('✅ 多模态理解结果', outX + 10, outY + 16);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '9px sans-serif';
      ctx.fillText('AI同时理解了文字含义、视觉内容和', outX + 10, outY + 32);
      ctx.fillText('声音信息，形成更全面的理解', outX + 10, outY + 44);
    }

    // 右侧：可完成的任务
    const taskY = 195;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('💡 可完成的多模态任务:', pad + 10, taskY);

    TASKS.forEach((task, i) => {
      const ty = taskY + 16 + i * 18;
      const canDo = task.needs.every(n => activeModes.has(n));
      ctx.fillStyle = canDo ? '#10B981' : '#334155';
      ctx.font = '9px sans-serif';
      ctx.fillText(`${canDo ? '✅' : '○'} ${task.name} — ${task.desc}`, pad + 14, ty);
    });

    // 底部
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👀 多模态 = AI像人类一样，同时用多种感官理解世界', rect.width / 2, rect.height - 8);

  }, [activeModes, step]);

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex items-center gap-2 flex-wrap">
        {MODALITIES.map(m => (
          <button
            key={m.id}
            onClick={() => toggleMode(m.id)}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${activeModes.has(m.id) ? 'text-white' : 'bg-[#1e293b] text-[#64748b] hover:text-white'}`}
            style={activeModes.has(m.id) ? { backgroundColor: m.color } : {}}
          >
            {m.icon} {m.name}
          </button>
        ))}
        <button
          onClick={() => setStep(s => Math.min(s + 1, 3))}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors ml-auto"
        >
          {step >= 3 ? '✅ 完成' : '下一步 →'}
        </button>
      </div>
      <div style={{ height: '240px', position: 'relative' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
    </div>
  );
}
