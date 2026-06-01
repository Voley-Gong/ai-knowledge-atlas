'use client';

import { useState } from 'react';

/**
 * Hallucination（AI幻觉）交互演示
 * AI自信地说出错误信息
 * 类比：一本正经胡说八道的学生
 */

interface QA {
  question: string;
  answers: { text: string; isHallucination: boolean; explanation: string }[];
}

const QUESTIONS: QA[] = [
  {
    question: '爱因斯坦什么时候访问过中国？',
    answers: [
      { text: '爱因斯坦于1922年访问过中国，在香港和上海短暂停留。', isHallucination: false, explanation: '✅ 这是事实，爱因斯坦1922年确实途经中国。' },
      { text: '爱因斯坦于1937年访问中国，在北大做了三个月演讲。', isHallucination: true, explanation: '❌ 幻觉！1937年爱因斯坦在美国，从未在北大演讲。AI编造了看似合理的细节。' },
    ],
  },
  {
    question: '李白是哪个朝代的诗人？',
    answers: [
      { text: '李白是唐代伟大的浪漫主义诗人，被誉为"诗仙"。', isHallucination: false, explanation: '✅ 完全正确。' },
      { text: '李白是宋代的宫廷诗人，深受宋徽宗赏识。', isHallucination: true, explanation: '❌ 幻觉！李白是唐代诗人，且从未担任过宫廷诗人。AI把朝代搞错了。' },
    ],
  },
];

export default function HallucinationInteraction() {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const qa = QUESTIONS[qIdx];

  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
  };

  const nextQ = () => {
    setQIdx(i => Math.min(i + 1, QUESTIONS.length - 1));
    setSelected(null);
    setRevealed(false);
  };

  const reset = () => {
    setQIdx(0);
    setSelected(null);
    setRevealed(false);
  };

  return (
    <div className="w-full bg-[#0f1425] p-4 space-y-3" style={{ height: '100%', overflowY: 'auto' }}>
      {/* 标题 */}
      <div className="text-xs text-[#94a3b8]">🔍 判断哪个是AI幻觉？点击你认为是幻觉的答案</div>

      {/* 问题 */}
      <div className="bg-slate-800/50 rounded-lg p-3">
        <div className="text-xs text-slate-400 mb-1">📝 问题</div>
        <p className="text-sm text-white font-medium">{qa.question}</p>
      </div>

      {/* 答案选项 */}
      <div className="space-y-2">
        {qa.answers.map((ans, i) => {
          const isSelected = selected === i;
          const isHallu = ans.isHallucination;
          let borderColor = 'border-slate-700/50';
          let bgColor = 'bg-slate-800/30';
          if (revealed && isSelected) {
            borderColor = isHallu ? 'border-green-500/50' : 'border-red-500/50';
            bgColor = isHallu ? 'bg-green-500/5' : 'bg-red-500/5';
          } else if (revealed && !isSelected && isHallu) {
            borderColor = 'border-green-500/30';
            bgColor = 'bg-green-500/5';
          }

          return (
            <div
              key={i}
              onClick={() => handleSelect(i)}
              className={`rounded-lg p-3 border cursor-pointer transition-all ${borderColor} ${bgColor} ${!revealed ? 'hover:border-slate-500' : ''}`}
            >
              <div className="flex items-start gap-2">
                <span className="text-xs text-[#64748b] mt-0.5 shrink-0">
                  {revealed ? (isHallu ? '🤥' : '✅') : `方案${i + 1}`}
                </span>
                <p className="text-xs text-[#e2e8f0] leading-relaxed">{ans.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 解释 */}
      {revealed && (
        <div className="space-y-1.5 animate-fade-in">
          {qa.answers.map((ans, i) => (
            <div key={i} className={`text-xs p-2 rounded ${ans.isHallucination ? 'text-green-300 bg-green-500/10' : 'text-red-300 bg-red-500/10'}`}>
              {ans.explanation}
            </div>
          ))}
        </div>
      )}

      {/* 幻觉类型提示 */}
      {revealed && (
        <div className="bg-slate-800/30 rounded-lg p-2.5">
          <div className="text-xs text-[#64748b] mb-1.5">💡 幻觉的三种常见类型：</div>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="text-center p-1.5 bg-red-500/10 rounded">
              <div className="text-red-400">事实错误</div>
              <div className="text-slate-500">编造不存在的事实</div>
            </div>
            <div className="text-center p-1.5 bg-yellow-500/10 rounded">
              <div className="text-yellow-400">细节编造</div>
              <div className="text-slate-500">真实框架+假细节</div>
            </div>
            <div className="text-center p-1.5 bg-purple-500/10 rounded">
              <div className="text-purple-400">逻辑谬误</div>
              <div className="text-slate-500">推理过程有漏洞</div>
            </div>
          </div>
        </div>
      )}

      {/* 控制 */}
      <div className="flex gap-2">
        <button
          onClick={nextQ}
          disabled={qIdx >= QUESTIONS.length - 1}
          className="flex-1 py-1.5 bg-blue-600/60 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs rounded-lg transition-colors"
        >
          下一题 →
        </button>
        <button onClick={reset} className="px-3 py-1.5 bg-slate-700 text-xs text-slate-400 rounded-lg hover:text-white transition-colors">
          🔄 重置
        </button>
      </div>
    </div>
  );
}
