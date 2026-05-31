'use client';

import { useState } from 'react';

/**
 * Chain of Thought 交互原型
 * 对比"直接回答"和"一步步推理"两种方式
 */
export default function ChainOfThoughtInteraction() {
  const [step, setStep] = useState(0);

  const question = '一个水池有两个进水管，A管3小时灌满，B管6小时灌满。同时开多久灌满？';

  const directAnswer = {
    text: '2小时',
    correct: false,
    explanation: '凭直觉直接给答案，没经过推理，容易出错！',
  };

  const reasoningSteps = [
    { label: 'A管速率', content: 'A管每小时灌 1/3', icon: '💧' },
    { label: 'B管速率', content: 'B管每小时灌 1/6', icon: '💧' },
    { label: '合计速率', content: '1/3 + 1/6 = 1/2', icon: '➕' },
    { label: '计算时间', content: '1 ÷ 1/2 = 2小时', icon: '✅' },
  ];

  return (
    <div className="w-full bg-[#0f1425] rounded-xl p-4 space-y-4">
      {/* 题目 */}
      <div className="bg-slate-800/50 rounded-lg p-3">
        <div className="text-xs text-slate-400 mb-1">📝 题目</div>
        <p className="text-sm text-white">{question}</p>
      </div>

      {/* 两列对比 */}
      <div className="grid grid-cols-2 gap-3">
        {/* 直接回答 */}
        <div className={`rounded-lg p-3 border transition-all ${
          step >= 1 ? 'border-red-500/40 bg-red-500/5' : 'border-slate-700/50 bg-slate-800/30'
        }`}>
          <div className="text-xs text-slate-400 mb-2">🤷 直接回答</div>
          {step >= 1 ? (
            <div>
              <p className="text-lg font-bold text-red-400">{directAnswer.text}</p>
              <p className="text-[10px] text-red-400/70 mt-1">{directAnswer.explanation}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">等待展示...</p>
          )}
        </div>

        {/* 思维链推理 */}
        <div className={`rounded-lg p-3 border transition-all ${
          step >= 2 ? 'border-green-500/40 bg-green-500/5' : 'border-slate-700/50 bg-slate-800/30'
        }`}>
          <div className="text-xs text-slate-400 mb-2">🧠 一步步推理</div>
          <div className="space-y-1.5">
            {reasoningSteps.map((s, i) => (
              <div
                key={i}
                className={`text-xs transition-all duration-300 ${
                  step >= 2 + i
                    ? 'text-green-300 opacity-100'
                    : 'text-slate-600 opacity-30'
                }`}
              >
                {s.icon} {s.label}: {step >= 2 + i ? s.content : '???'}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 结论 */}
      {step >= 6 && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center animate-fade-in">
          <p className="text-sm text-green-300 font-medium">
            🎯 一步步推理，答案更准确！这就是 Chain of Thought 的力量
          </p>
        </div>
      )}

      {/* 控制按钮 */}
      <button
        onClick={() => setStep(prev => prev + 1)}
        disabled={step >= 6}
        className="w-full py-2 bg-blue-600/80 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm rounded-lg transition-colors"
      >
        {step === 0 ? '▶️ 开始对比' : step >= 6 ? '✅ 演示完成' : `下一步 (${step}/6)`}
      </button>
    </div>
  );
}
