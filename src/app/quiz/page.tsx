'use client';

import { useState, useCallback } from 'react';
import { quizQuestions } from '@/data/quiz';
import Link from 'next/link';

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizPage() {
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<typeof quizQuestions>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const startQuiz = useCallback(() => {
    const q = shuffleArray(quizQuestions).slice(0, 10);
    setQuestions(q);
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
    setStarted(true);
  }, []);

  const handleSelect = (option: string) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);
    if (option === questions[current].answer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setFinished(true);
    }
  };

  if (!started) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">📝</div>
          <h1 className="text-2xl font-bold mb-3">AI 知识测验</h1>
          <p className="text-[#94a3b8] mb-8">
            随机10道选择题，测试你对AI核心概念的理解
          </p>
          <div className="flex flex-col gap-3 items-center">
            <button
              onClick={startQuiz}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              开始测验
            </button>
            <Link href="/" className="text-sm text-[#94a3b8] hover:text-white">
              ← 返回首页
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const emoji = pct >= 90 ? '🏆' : pct >= 70 ? '👏' : pct >= 50 ? '💪' : '📚';
    const msg = pct >= 90 ? '太强了！AI专家！' : pct >= 70 ? '很不错！继续加油！' : pct >= 50 ? '有基础了，再接再厉！' : '需要多复习哦！';
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">{emoji}</div>
          <h1 className="text-2xl font-bold mb-2">测验完成！</h1>
          <p className="text-4xl font-bold text-blue-400 mb-2">{score}/{questions.length}</p>
          <p className="text-lg text-[#94a3b8] mb-8">{msg}</p>
          <div className="flex flex-col gap-3 items-center">
            <button
              onClick={startQuiz}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              再来一次
            </button>
            <Link href="/" className="text-sm text-[#94a3b8] hover:text-white">
              ← 返回首页
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const q = questions[current];
  const isCorrect = selected === q.answer;

  return (
    <main className="min-h-screen pb-8">
      <header className="sticky top-0 z-30 bg-[#0a0e1a]/90 backdrop-blur-md border-b border-[#1e293b]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-[#94a3b8] hover:text-white text-sm">
            ← 退出
          </Link>
          <span className="text-sm text-[#94a3b8]">
            {current + 1} / {questions.length}
          </span>
          <span className="text-sm font-medium text-blue-400">
            得分: {score}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-[#1e293b]">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((current + (answered ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 mt-8">
        <h2 className="text-xl font-bold mb-6">{q.question}</h2>

        <div className="space-y-3">
          {q.options?.map((opt, i) => {
            let bgClass = 'bg-[#111827] border-[#1e293b]';
            let textClass = 'text-[#f1f5f9]';
            if (answered) {
              if (opt === q.answer) {
                bgClass = 'bg-green-900/30 border-green-600';
                textClass = 'text-green-400';
              } else if (opt === selected && !isCorrect) {
                bgClass = 'bg-red-900/30 border-red-600';
                textClass = 'text-red-400';
              } else {
                textClass = 'text-[#4b5563]';
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(opt)}
                disabled={answered}
                className={`w-full text-left p-4 rounded-xl border transition-all ${bgClass} ${textClass} ${
                  !answered ? 'hover:border-blue-500/50 hover:bg-blue-900/10 cursor-pointer' : 'cursor-default'
                }`}
              >
                <span className="font-medium">{String.fromCharCode(65 + i)}.</span> {opt}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {answered && (
          <div className="mt-6 space-y-4">
            <div className={`p-4 rounded-xl border ${
              isCorrect ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'
            }`}>
              <p className="font-medium mb-1">
                {isCorrect ? '✅ 正确！' : '❌ 错误'}
              </p>
              <p className="text-sm text-[#94a3b8]">{q.explanation}</p>
            </div>
            <button
              onClick={handleNext}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              {current < questions.length - 1 ? '下一题 →' : '查看结果'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
