'use client';

import { useRef, useEffect, useState } from 'react';

type Strategy = 'zero-shot' | 'few-shot' | 'role-play' | 'cot' | 'separator';

const QUESTION = '写一封邮件给客户，解释项目延期原因';

const STRATEGIES: Record<Strategy, {
  name: string; icon: string; prompt: string; response: string; quality: number; color: string;
}> = {
  'zero-shot': {
    name: '零样本', icon: '🎯',
    prompt: '写一封邮件给客户解释项目延期',
    response: '尊敬的客户：项目因故延期，敬请谅解。我们会尽快完成。',
    quality: 40, color: '#EF4444',
  },
  'few-shot': {
    name: '少样本', icon: '📋',
    prompt: '示例：\n延期邮件通常包含：道歉、原因、新时间线\n\n请写一封延期邮件给客户',
    response: '尊敬的张总：非常抱歉地通知您，由于技术团队在核心模块开发中遇到了超出预期的复杂度，项目交付日期需调整。原定3月15日的交付将推迟至3月25日。我们将加派人手确保按时完成。',
    quality: 72, color: '#F59E0B',
  },
  'role-play': {
    name: '角色扮演', icon: '🎭',
    prompt: '你是一位资深项目经理，擅长在困难情况下维护客户关系。请以你的专业身份，写一封邮件向客户解释项目延期。',
    response: '尊敬的李总：感谢贵司一直以来的信任与支持。作为项目负责人，我需要坦诚地告知您一个不太愉快的消息。在核心系统集成的压力测试阶段，我们发现了若干需要优先解决的架构瓶颈。基于对质量的承诺，我们建议将交付日期调整至3月25日。作为补偿，我们将在项目中免费增加性能优化模块。期待您的理解。',
    quality: 88, color: '#3B82F6',
  },
  'cot': {
    name: '思维链', icon: '🧠',
    prompt: '写一封延期邮件。请一步步思考：\n1. 客户最关心什么？\n2. 延期的真实原因是什么？\n3. 如何弥补？\n4. 语气应该怎样？\n\n然后写邮件。',
    response: '尊敬的王总：\n\n经过审慎评估，我需要将项目交付日期从3月15日调整至3月22日。\n\n【原因】集成测试阶段发现了3个关键性能瓶颈，修复需要额外时间\n【影响分析】延期一周可确保系统稳定性，避免上线后出现更严重问题\n【补救措施】已安排加班赶工，同时增加一名高级工程师支援\n【承诺】下周二前提交详细进度报告\n\n再次为带来的不便深表歉意。',
    quality: 95, color: '#10B981',
  },
  'separator': {
    name: '分隔符', icon: '📐',
    prompt: '请根据以下信息写延期邮件：\n---\n客户：赵总\n延期原因：第三方接口变更\n新交付日期：3月28日\n补偿：免费运维1个月\n---\n请用专业但温暖的语气撰写。',
    response: '尊敬的赵总：您好！关于目前正在进行的系统对接项目，我需要与您同步一个重要变更。由于第三方支付接口在近期进行了重大版本升级，我们的适配工作量相应增加。经技术团队评估，建议将交付时间调整至3月28日。为表达歉意，我们将免费提供一个月的系统运维服务。',
    quality: 82, color: '#8B5CF6',
  },
};

export default function PromptEngineeringInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeStrategy, setActiveStrategy] = useState<Strategy>('zero-shot');
  const [showResponse, setShowResponse] = useState(false);

  useEffect(() => {
    setShowResponse(false);
    const timer = setTimeout(() => setShowResponse(true), 600);
    return () => clearTimeout(timer);
  }, [activeStrategy]);

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

    const pad = 10;
    const strategy = STRATEGIES[activeStrategy];

    // === TOP: Strategy buttons ===
    const btnW = (rect.width - pad * 2 - 4 * 4) / 5;
    const btnY = 4;

    (Object.keys(STRATEGIES) as Strategy[]).forEach((key, i) => {
      const s = STRATEGIES[key];
      const bx = pad + i * (btnW + 4);
      const isActive = key === activeStrategy;

      ctx.fillStyle = isActive ? s.color + '20' : '#1e293b';
      ctx.beginPath();
      ctx.roundRect(bx, btnY, btnW, 22, 4);
      ctx.fill();
      ctx.strokeStyle = isActive ? s.color : '#334155';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = isActive ? s.color : '#64748b';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${s.icon} ${s.name}`, bx + btnW / 2, btnY + 14);
    });

    // === LEFT: Prompt ===
    const leftX = pad;
    const leftW = rect.width * 0.48 - pad;
    const leftY = 32;

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('💬 提示词 (Prompt)', leftX, leftY);

    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.roundRect(leftX, leftY + 5, leftW, 80, 5);
    ctx.fill();
    ctx.strokeStyle = '#33415580';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Wrap text
    const maxCharsPerLine = Math.floor((leftW - 12) / 5);
    const promptLines = strategy.prompt.split('\n');
    let lineY = leftY + 18;
    promptLines.forEach(line => {
      const words = line;
      for (let c = 0; c < words.length; c += maxCharsPerLine) {
        ctx.fillStyle = strategy.color;
        ctx.font = '8px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(words.slice(c, c + maxCharsPerLine), leftX + 6, lineY);
        lineY += 11;
      }
    });

    // === RIGHT: Response ===
    const rightX = rect.width * 0.5 + 5;
    const rightW = rect.width * 0.48 - pad;
    const rightY = 32;

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🤖 回答 (Response)', rightX, rightY);

    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.roundRect(rightX, rightY + 5, rightW, 80, 5);
    ctx.fill();
    ctx.strokeStyle = '#33415580';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    if (showResponse) {
      const respMaxChars = Math.floor((rightW - 12) / 5);
      const respLines = strategy.response.split('\n');
      let rLineY = rightY + 18;
      const maxLines = 7;
      let lineCount = 0;
      respLines.forEach(line => {
        if (lineCount >= maxLines) return;
        for (let c = 0; c < line.length && lineCount < maxLines; c += respMaxChars) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '8px sans-serif';
          ctx.textAlign = 'left';
          const text = line.slice(c, c + respMaxChars);
          ctx.fillText(text, rightX + 6, rLineY);
          rLineY += 11;
          lineCount++;
        }
      });
    } else {
      ctx.fillStyle = '#334155';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('生成中...', rightX + rightW / 2, rightY + 48);
    }

    // === BOTTOM: Quality score bar ===
    const scoreY = leftY + 95;
    const scoreW = rect.width - pad * 2;

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📊 回答质量评分', pad, scoreY);

    const barY = scoreY + 5;
    const barH = 16;

    // Background
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(pad, barY, scoreW, barH, 4);
    ctx.fill();

    // Quality fill
    const qualityW = showResponse ? (strategy.quality / 100) * scoreW : 0;
    ctx.fillStyle = strategy.color + '80';
    ctx.beginPath();
    ctx.roundRect(pad, barY, qualityW, barH, 4);
    ctx.fill();

    // Score text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'left';
    if (showResponse) {
      ctx.fillText(`${strategy.quality}/100`, pad + 6, barY + 12);
    }

    // Quality label
    const qualityLabel = strategy.quality >= 90 ? '🟢 优秀' : strategy.quality >= 70 ? '🟡 良好' : '🔴 一般';
    ctx.fillStyle = strategy.color;
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'right';
    if (showResponse) {
      ctx.fillText(qualityLabel, pad + scoreW, barY + 12);
    }

    // Comparison bars
    const compY = barY + barH + 10;
    ctx.fillStyle = '#64748b';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('各策略对比:', pad, compY);

    const miniBarW = rect.width / 5 - 12;
    (Object.keys(STRATEGIES) as Strategy[]).forEach((key, i) => {
      const s = STRATEGIES[key];
      const bx = pad + i * (miniBarW + 8);
      const by = compY + 5;
      const isActive = key === activeStrategy;

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(bx, by, miniBarW, 8, 2);
      ctx.fill();

      const fillW = showResponse ? (s.quality / 100) * miniBarW : (key === activeStrategy ? 0 : (s.quality / 100) * miniBarW);
      ctx.fillStyle = isActive ? s.color : s.color + '40';
      ctx.beginPath();
      ctx.roundRect(bx, by, fillW, 8, 2);
      ctx.fill();

      ctx.fillStyle = isActive ? s.color : '#4b5563';
      ctx.font = '7px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${s.icon}${s.quality}`, bx + miniBarW / 2, by + 18);
    });

    // Bottom tip
    ctx.fillStyle = '#4b5563';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💡 同样的问题，不同提示策略 → 质量天差地别！', rect.width / 2, rect.height - 6);
  }, [activeStrategy, showResponse]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const pad = 10;
    const btnW = (rect.width - pad * 2 - 4 * 4) / 5;
    const btnY = 4;

    (Object.keys(STRATEGIES) as Strategy[]).forEach((key, i) => {
      const bx = pad + i * (btnW + 4);
      if (mx >= bx && mx <= bx + btnW && my >= btnY && my <= btnY + 22) {
        setActiveStrategy(key);
      }
    });
  };

  return (
    <div className="w-full flex flex-col" style={{ height: '100%' }}>
      <div className="px-4 pt-1 flex gap-2 items-center">
        <span className="text-xs text-[#64748b]">点击上方策略按钮切换</span>
      </div>
      <div style={{ height: '244px', position: 'relative' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
          onClick={handleClick}
        />
      </div>
    </div>
  );
}
