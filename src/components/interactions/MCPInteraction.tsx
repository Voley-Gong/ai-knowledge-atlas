'use client';

import { useRef, useEffect, useState } from 'react';

/**
 * MCP（Model Context Protocol）交互演示
 * 让AI能调用外部工具和数据的标准化协议
 * 类比：AI的"万能遥控器"
 */

const TOOLS = [
  { id: 'file', name: '📁 文件系统', desc: '读写本地文件', color: '#3B82F6' },
  { id: 'db', name: '🗄️ 数据库', desc: '查询结构化数据', color: '#8B5CF6' },
  { id: 'search', name: '🔍 搜索引擎', desc: '网络信息检索', color: '#10B981' },
  { id: 'api', name: '🌐 外部API', desc: '调用第三方服务', color: '#F59E0B' },
  { id: 'code', name: '💻 代码执行', desc: '运行代码获取结果', color: '#EC4899' },
];

const DEMO_FLOW = [
  { tool: 'search', request: '搜索"2024年诺贝尔物理学奖"', response: 'John Hopfield & Geoffrey Hinton' },
  { tool: 'code', request: '计算两者的年龄差', response: 'Hinton(76) - Hopfield(91) = 15岁' },
  { tool: 'file', request: '将结果保存到笔记', response: '已保存到 ~/notes/nobel.md' },
];

export default function MCPInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(0);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

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

    const centerX = rect.width * 0.35;
    const centerY = 120;
    const radius = 70;

    // 中心AI
    ctx.beginPath();
    ctx.arc(centerX, centerY, 28, 0, Math.PI * 2);
    ctx.fillStyle = step > 0 ? '#3B82F6' : '#3B82F640';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🤖', centerX, centerY + 5);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px sans-serif';
    ctx.fillText('AI 模型', centerX, centerY + 42);

    // 工具节点（围绕中心）
    TOOLS.forEach((tool, i) => {
      const angle = (Math.PI * 2 * i / TOOLS.length) - Math.PI / 2;
      const tx = centerX + radius * Math.cos(angle);
      const ty = centerY + radius * Math.sin(angle);
      const isActive = selectedTool === tool.id;
      const isInFlow = step > 0 && DEMO_FLOW[step - 1]?.tool === tool.id;

      // 连线
      ctx.strokeStyle = isInFlow ? tool.color : '#1e293b';
      ctx.lineWidth = isInFlow ? 2 : 0.5;
      ctx.beginPath();
      ctx.moveTo(centerX + 28 * Math.cos(angle), centerY + 28 * Math.sin(angle));
      ctx.lineTo(tx, ty);
      ctx.stroke();

      // 如果正在通信，画箭头动画
      if (isInFlow) {
        const progress = 0.5;
        const ax = centerX + (radius * progress) * Math.cos(angle);
        const ay = centerY + (radius * progress) * Math.sin(angle);
        ctx.fillStyle = tool.color;
        ctx.beginPath();
        ctx.arc(ax, ay, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // 工具节点
      ctx.beginPath();
      ctx.arc(tx, ty, 16, 0, Math.PI * 2);
      ctx.fillStyle = isActive || isInFlow ? tool.color + '30' : '#111827';
      ctx.fill();
      ctx.strokeStyle = isActive || isInFlow ? tool.color : '#334155';
      ctx.lineWidth = isActive || isInFlow ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tool.name.split(' ')[0], tx, ty + 4);
    });

    // MCP 协议标签
    ctx.fillStyle = '#F59E0B40';
    ctx.beginPath();
    ctx.roundRect(centerX - 25, centerY + 48, 50, 14, 7);
    ctx.fill();
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MCP 协议', centerX, centerY + 58);

    // 右侧：请求-响应面板
    const panelX = rect.width * 0.6;
    const panelW = rect.width - panelX - 12;
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.roundRect(panelX, 10, panelW, rect.height - 50, 8);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📡 MCP 调用流程', panelX + 10, 28);

    // 步骤
    DEMO_FLOW.forEach((flow, i) => {
      const fy = 42 + i * 58;
      const isDone = step > i;
      const isCurrent = step === i + 1;
      const tool = TOOLS.find(t => t.id === flow.tool)!;

      // 请求
      ctx.beginPath();
      ctx.roundRect(panelX + 8, fy, panelW - 16, 22, 4);
      ctx.fillStyle = isDone || isCurrent ? tool.color + '15' : '#0a0e1a';
      ctx.fill();
      ctx.strokeStyle = isCurrent ? tool.color : isDone ? tool.color + '40' : '#1e293b';
      ctx.lineWidth = isCurrent ? 1.5 : 0.5;
      ctx.stroke();

      ctx.fillStyle = isDone || isCurrent ? '#e2e8f0' : '#4b5563';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${isDone ? '✅' : isCurrent ? '▶️' : '○'} → ${flow.request}`, panelX + 14, fy + 14);

      // 响应
      if (isDone) {
        ctx.beginPath();
        ctx.roundRect(panelX + 8, fy + 24, panelW - 16, 22, 4);
        ctx.fillStyle = '#10B98110';
        ctx.fill();
        ctx.strokeStyle = '#10B98140';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        ctx.fillStyle = '#10B981';
        ctx.font = '9px sans-serif';
        ctx.fillText(`← ${flow.response}`, panelX + 14, fy + 38);
      }
    });

    // 底部说明
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔌 MCP = AI的万能遥控器，统一协议连接所有工具', rect.width / 2, rect.height - 8);

  }, [step, selectedTool]);

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-2 flex gap-2">
        <button
          onClick={() => setStep(s => Math.min(s + 1, DEMO_FLOW.length))}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          {step >= DEMO_FLOW.length ? '✅ 完成' : '调用工具 →'}
        </button>
        <button
          onClick={() => { setStep(0); setSelectedTool(null); }}
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
