'use client';

import { useRef, useEffect, useState } from 'react';

/**
 * AGI（通用人工智能）交互演示
 * 能像人类一样理解和学习任何智力任务的AI
 * 类比：现在的AI是"偏科天才"，AGI是"全科优秀生"
 */

interface AIMilestone {
  year: number;
  name: string;
  type: 'narrow' | 'emerging' | 'agi';
  desc: string;
  color: string;
  capability: number; // 0-100
}

const TIMELINE: AIMilestone[] = [
  { year: 1997, name: '深蓝', type: 'narrow', desc: '击败国际象棋冠军', color: '#3B82F6', capability: 8 },
  { year: 2012, name: 'AlexNet', type: 'narrow', desc: '深度学习图像识别突破', color: '#3B82F6', capability: 15 },
  { year: 2016, name: 'AlphaGo', type: 'narrow', desc: '击败围棋世界冠军', color: '#8B5CF6', capability: 25 },
  { year: 2017, name: 'Transformer', type: 'narrow', desc: '注意力机制论文发表', color: '#8B5CF6', capability: 30 },
  { year: 2020, name: 'GPT-3', type: 'emerging', desc: '少样本学习，175B参数', color: '#F59E0B', capability: 45 },
  { year: 2023, name: 'GPT-4', type: 'emerging', desc: '多模态，复杂推理', color: '#F59E0B', capability: 55 },
  { year: 2024, name: 'o1/o3', type: 'emerging', desc: '推理模型，深度思考', color: '#F59E0B', capability: 65 },
  { year: 2026, name: 'Agent时代', type: 'emerging', desc: '自主规划执行', color: '#EC4899', capability: 72 },
  { year: 2030, name: 'AGI?', type: 'agi', desc: '通用人工智能?', color: '#10B981', capability: 90 },
];

const CAPABILITIES = [
  { name: '语言理解', current: 85, agi: 95 },
  { name: '视觉识别', current: 80, agi: 95 },
  { name: '逻辑推理', current: 65, agi: 95 },
  { name: '常识理解', current: 45, agi: 98 },
  { name: '创造力', current: 55, agi: 90 },
  { name: '物理直觉', current: 30, agi: 95 },
  { name: '跨领域迁移', current: 35, agi: 95 },
  { name: '自主学习', current: 25, agi: 98 },
];

export default function AGIInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tab, setTab] = useState<'timeline' | 'radar'>('timeline');
  const [hoverIdx, setHoverIdx] = useState(-1);

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

    if (tab === 'timeline') {
      // === 时间线 ===
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('📅 AI 能力演进时间线', pad, 22);

      const tlY = 130;
      const tlStartX = pad + 30;
      const tlEndX = rect.width - pad - 30;
      const tlW = tlEndX - tlStartX;

      // 主线
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tlStartX, tlY);
      ctx.lineTo(tlEndX, tlY);
      ctx.stroke();

      // 渐变背景区域
      const narrowEnd = tlStartX + tlW * 0.35;
      const emergingEnd = tlStartX + tlW * 0.75;

      ctx.fillStyle = '#3B82F610';
      ctx.fillRect(tlStartX, tlY - 60, narrowEnd - tlStartX, 120);
      ctx.fillStyle = '#F59E0B10';
      ctx.fillRect(narrowEnd, tlY - 60, emergingEnd - narrowEnd, 120);
      ctx.fillStyle = '#10B98110';
      ctx.fillRect(emergingEnd, tlY - 60, tlEndX - emergingEnd, 120);

      // 区域标签
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#3B82F6';
      ctx.fillText('窄AI', (tlStartX + narrowEnd) / 2, tlY + 55);
      ctx.fillStyle = '#F59E0B';
      ctx.fillText('涌现能力', (narrowEnd + emergingEnd) / 2, tlY + 55);
      ctx.fillStyle = '#10B981';
      ctx.fillText('通用智能?', (emergingEnd + tlEndX) / 2, tlY + 55);

      // 里程碑
      TIMELINE.forEach((m, i) => {
        const mx = tlStartX + (i / (TIMELINE.length - 1)) * tlW;
        const isHovered = i === hoverIdx;
        const dotSize = isHovered ? 8 : 5;

        // 圆点
        ctx.beginPath();
        ctx.arc(mx, tlY, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? m.color : m.color + '80';
        ctx.fill();
        if (isHovered) {
          ctx.strokeStyle = m.color;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // 年份
        ctx.fillStyle = isHovered ? '#fff' : '#64748b';
        ctx.font = `${isHovered ? 'bold ' : ''}9px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(`${m.year}`, mx, tlY + 22);

        // 名称（交替上下）
        if (i % 2 === 0) {
          ctx.fillText(m.name, mx, tlY - 18);
        } else {
          ctx.fillText(m.name, mx, tlY - 30);
        }

        // 悬停详情
        if (isHovered) {
          ctx.fillStyle = '#11182790';
          ctx.beginPath();
          ctx.roundRect(mx - 60, tlY - 58, 120, 24, 4);
          ctx.fill();
          ctx.fillStyle = '#e2e8f0';
          ctx.font = '9px sans-serif';
          ctx.fillText(m.desc, mx, tlY - 42);
        }
      });

      // 能力进度条
      const barY = tlY + 70;
      ctx.fillStyle = '#64748b';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('AI能力指数', pad + 10, barY);

      const barW = rect.width - pad * 2 - 20;
      const maxCap = 100;
      TIMELINE.forEach((m, i) => {
        const segW = barW / TIMELINE.length;
        const segX = pad + 10 + i * segW;
        const fillH = (m.capability / maxCap) * 30;
        ctx.fillStyle = m.color + '40';
        ctx.fillRect(segX, barY + 8 + (30 - fillH), segW - 2, fillH);
      });

    } else {
      // === 能力雷达图 ===
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('🎯 当前AI vs AGI 能力对比', pad, 22);

      const centerX = rect.width / 2;
      const centerY = 145;
      const radius = 85;
      const n = CAPABILITIES.length;

      // 背景网格
      for (let ring = 1; ring <= 4; ring++) {
        const r = radius * ring / 4;
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let i = 0; i <= n; i++) {
          const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
          const px = centerX + r * Math.cos(angle);
          const py = centerY + r * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // 轴线
      for (let i = 0; i < n; i++) {
        const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
        ctx.stroke();

        // 标签
        const labelR = radius + 18;
        const lx = centerX + labelR * Math.cos(angle);
        const ly = centerY + labelR * Math.sin(angle);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(CAPABILITIES[i].name, lx, ly + 3);
      }

      // AGI 雷达（目标）
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const idx = i % n;
        const angle = (Math.PI * 2 * idx / n) - Math.PI / 2;
        const r = radius * CAPABILITIES[idx].agi / 100;
        const px = centerX + r * Math.cos(angle);
        const py = centerY + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.fillStyle = '#10B98115';
      ctx.fill();
      ctx.strokeStyle = '#10B98160';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 当前 AI 雷达
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const idx = i % n;
        const angle = (Math.PI * 2 * idx / n) - Math.PI / 2;
        const r = radius * CAPABILITIES[idx].current / 100;
        const px = centerX + r * Math.cos(angle);
        const py = centerY + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.fillStyle = '#3B82F620';
      ctx.fill();
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 图例
      const legendY = rect.height - 40;
      ctx.fillStyle = '#3B82F6';
      ctx.beginPath();
      ctx.roundRect(centerX - 100, legendY - 2, 12, 8, 2);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('当前AI', centerX - 84, legendY + 5);

      ctx.fillStyle = '#10B98160';
      ctx.beginPath();
      ctx.roundRect(centerX + 10, legendY - 2, 12, 8, 2);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('AGI 目标', centerX + 26, legendY + 5);
    }

    // 底部说明
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌟 AGI = 从偏科天才到全科优秀，AI的终极目标', rect.width / 2, rect.height - 8);

  }, [tab, hoverIdx]);

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex items-center gap-2">
        <button
          onClick={() => setTab('timeline')}
          className={`px-3 py-1 rounded text-sm transition-colors ${tab === 'timeline' ? 'bg-[#3B82F6] text-white' : 'bg-[#1e293b] text-[#94a3b8] hover:text-white'}`}
        >
          📅 时间线
        </button>
        <button
          onClick={() => setTab('radar')}
          className={`px-3 py-1 rounded text-sm transition-colors ${tab === 'radar' ? 'bg-[#8B5CF6] text-white' : 'bg-[#1e293b] text-[#94a3b8] hover:text-white'}`}
        >
          🎯 能力对比
        </button>
      </div>
      <div
        style={{ height: '240px', position: 'relative' }}
        onMouseMove={e => {
          if (tab !== 'timeline') { setHoverIdx(-1); return; }
          const canvas = canvasRef.current;
          if (!canvas) return;
          const rect = canvas.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const pad = 16;
          const tlStartX = pad + 30;
          const tlEndX = rect.width - pad - 30;
          const tlW = tlEndX - tlStartX;
          let closest = -1;
          let minDist = 20;
          TIMELINE.forEach((_, i) => {
            const mx = tlStartX + (i / (TIMELINE.length - 1)) * tlW;
            const dist = Math.abs(mouseX - mx);
            if (dist < minDist) { minDist = dist; closest = i; }
          });
          setHoverIdx(closest);
        }}
        onMouseLeave={() => setHoverIdx(-1)}
      >
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
    </div>
  );
}
