'use client';

import { useState } from 'react';

type AgentPhase = 'idle' | 'planning' | 'selecting' | 'executing' | 'observing' | 'responding' | 'done';

interface Tool {
  id: string;
  icon: string;
  label: string;
}

const TOOLS: Tool[] = [
  { id: 'search', icon: '🔍', label: '搜索' },
  { id: 'calculator', icon: '🧮', label: '计算器' },
  { id: 'calendar', icon: '📅', label: '日历' },
  { id: 'browser', icon: '🌐', label: '浏览器' },
];

interface TaskConfig {
  task: string;
  plan: string[];
  tools: string[];
  steps: { phase: AgentPhase; text: string; tool?: string }[];
}

const TASK_OPTIONS: TaskConfig[] = [
  {
    task: '帮我订一张下周三去北京的机票',
    plan: ['1. 查询下周三日期 → 日历', '2. 搜索北京机票 → 搜索', '3. 比较价格 → 浏览器'],
    tools: ['calendar', 'search', 'browser'],
    steps: [
      { phase: 'planning', text: '🤔 分析任务: 需要确定日期、搜索航班、比较价格' },
      { phase: 'selecting', text: '🔧 选择工具: 📅 日历', tool: 'calendar' },
      { phase: 'executing', text: '⚡ 执行: 查询下周三 = 2026年6月10日' },
      { phase: 'observing', text: '👀 观察: 获取到日期信息' },
      { phase: 'selecting', text: '🔧 选择工具: 🔍 搜索', tool: 'search' },
      { phase: 'executing', text: '⚡ 执行: 搜索"6月10日 → 北京 机票"' },
      { phase: 'observing', text: '👀 观察: 找到3个航班选项' },
      { phase: 'responding', text: '💬 推荐: 6月10日 CA1234航班，09:00出发，¥860' },
    ],
  },
  {
    task: '计算 (15 + 27) × 3 等于多少',
    plan: ['1. 计算加法 → 计算器', '2. 计算乘法 → 计算器'],
    tools: ['calculator'],
    steps: [
      { phase: 'planning', text: '🤔 分析任务: 需要两步计算' },
      { phase: 'selecting', text: '🔧 选择工具: 🧮 计算器', tool: 'calculator' },
      { phase: 'executing', text: '⚡ 执行: 15 + 27 = 42' },
      { phase: 'observing', text: '👀 观察: 加法结果 = 42' },
      { phase: 'selecting', text: '🔧 选择工具: 🧮 计算器', tool: 'calculator' },
      { phase: 'executing', text: '⚡ 执行: 42 × 3 = 126' },
      { phase: 'observing', text: '👀 观察: 最终结果 = 126' },
      { phase: 'responding', text: '💬 答案: (15 + 27) × 3 = 126' },
    ],
  },
];

const PHASE_COLORS: Record<AgentPhase, string> = {
  idle: '#64748b',
  planning: '#8B5CF6',
  selecting: '#F59E0B',
  executing: '#10B981',
  observing: '#3B82F6',
  responding: '#EC4899',
  done: '#10B981',
};

export default function AgentInteraction() {
  const [taskIdx, setTaskIdx] = useState(0);
  const [currentStep, setCurrentStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const task = TASK_OPTIONS[taskIdx];

  const startAgent = () => {
    if (running) return;
    setRunning(true);
    setCurrentStep(0);
    setLog([]);

    let step = -1;
    const interval = setInterval(() => {
      step++;
      if (step >= task.steps.length) {
        clearInterval(interval);
        setCurrentStep(step - 1);
        setRunning(false);
        return;
      }
      setCurrentStep(step);
      setLog(prev => [...prev, task.steps[step].text]);
    }, 1200);
  };

  const reset = () => {
    setCurrentStep(-1);
    setLog([]);
    setRunning(false);
  };

  const getPhaseOfStep = (stepIdx: number): AgentPhase => {
    if (stepIdx < 0) return 'idle';
    return task.steps[stepIdx].phase;
  };

  const currentPhase = getPhaseOfStep(currentStep);

  return (
    <div className="w-full flex flex-col" style={{ height: '100%', background: '#0d1117' }}>
      <div className="px-4 pt-2 flex gap-2 items-center flex-wrap">
        <select
          value={taskIdx}
          onChange={e => { setTaskIdx(Number(e.target.value)); reset(); }}
          className="px-2 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] border border-[#334155]"
        >
          {TASK_OPTIONS.map((t, i) => (
            <option key={i} value={i}>{t.task}</option>
          ))}
        </select>
        <button
          onClick={startAgent}
          disabled={running}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors disabled:opacity-50"
        >
          {running ? '⏳ 执行中...' : '🤖 启动 Agent'}
        </button>
        <button
          onClick={reset}
          className="px-3 py-1 rounded bg-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors"
        >
          🔄 重置
        </button>
      </div>

      <div className="flex-1 flex gap-2 px-4 py-2 min-h-0">
        {/* Left: Agent Loop Visualization */}
        <div className="flex flex-col items-center gap-1 w-[140px] shrink-0">
          <span className="text-[9px] text-[#64748b] mb-1">思考循环</span>
          {(['planning', 'selecting', 'executing', 'observing', 'responding'] as AgentPhase[]).map((phase, i) => {
            const isActive = currentPhase === phase;
            const isPast = currentStep >= 0 && task.steps.findIndex(s => s.phase === phase) <= currentStep;
            const phaseLabels: Record<string, string> = {
              planning: '🤔 规划',
              selecting: '🔧 选工具',
              executing: '⚡ 执行',
              observing: '👀 观察',
              responding: '💬 回复',
            };

            return (
              <div key={phase} className="flex flex-col items-center">
                <div
                  className="w-full px-2 py-1.5 rounded text-[10px] text-center transition-all duration-300"
                  style={{
                    backgroundColor: isActive ? PHASE_COLORS[phase] + '30' : isPast ? PHASE_COLORS[phase] + '10' : '#111827',
                    border: `1px solid ${isActive ? PHASE_COLORS[phase] : isPast ? PHASE_COLORS[phase] + '40' : '#1e293b'}`,
                    color: isActive ? '#fff' : isPast ? PHASE_COLORS[phase] : '#4b5563',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  {phaseLabels[phase]}
                </div>
                {i < 4 && (
                  <div
                    className="w-0.5 h-2"
                    style={{ backgroundColor: isPast ? PHASE_COLORS[phase] + '40' : '#1e293b' }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Middle: Log */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="text-[9px] text-[#64748b] mb-1">执行日志</div>
          <div className="space-y-1 overflow-y-auto" style={{ maxHeight: '200px' }}>
            {log.length === 0 && (
              <div className="text-[10px] text-[#4b5563] italic">等待 Agent 启动...</div>
            )}
            {log.map((entry, i) => {
              const stepInfo = task.steps[i];
              const phaseColor = stepInfo ? PHASE_COLORS[stepInfo.phase] : '#64748b';
              return (
                <div
                  key={i}
                  className="text-[10px] px-2 py-1 rounded transition-all"
                  style={{
                    backgroundColor: phaseColor + '10',
                    borderLeft: `2px solid ${phaseColor}`,
                    color: '#cbd5e1',
                  }}
                >
                  {entry}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Tools */}
        <div className="flex flex-col gap-1 w-[80px] shrink-0">
          <span className="text-[9px] text-[#64748b] mb-1">工具箱</span>
          {TOOLS.map(tool => {
            const isUsed = currentStep >= 0 && task.steps.some(
              (s, si) => si <= currentStep && s.tool === tool.id
            );
            const isActiveNow = currentStep >= 0 && task.steps[currentStep]?.tool === tool.id;

            return (
              <div
                key={tool.id}
                className="px-2 py-1.5 rounded text-[10px] text-center transition-all duration-300"
                style={{
                  backgroundColor: isActiveNow ? '#F59E0B25' : isUsed ? '#F59E0B10' : '#111827',
                  border: `1px solid ${isActiveNow ? '#F59E0B' : isUsed ? '#F59E0B40' : '#1e293b'}`,
                  color: isActiveNow ? '#F59E0B' : isUsed ? '#F59E0B' : '#4b5563',
                }}
              >
                {tool.icon} {tool.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
