'use client';

import { learningPaths } from '@/data/learningPaths';
import { getConceptById, CATEGORY_CONFIG } from '@/data/concepts';
import Link from 'next/link';

export default function PathsPage() {
  return (
    <main className="min-h-screen pb-8">
      <header className="sticky top-0 z-30 bg-[#0a0e1a]/90 backdrop-blur-md border-b border-[#1e293b]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-[#94a3b8] hover:text-white text-sm">
            ← 返回
          </Link>
          <h1 className="text-xl font-bold">🛤️ 学习路径</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 mt-4 space-y-6">
        {learningPaths.map(path => (
          <div
            key={path.id}
            className="rounded-xl border border-[#1e293b] bg-[#111827] p-5"
          >
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">{path.emoji}</span>
              <div>
                <h2 className="text-lg font-bold" style={{ color: path.color }}>
                  {path.name}
                </h2>
                <p className="text-sm text-[#94a3b8] mt-1">{path.description}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-[#1e293b] rounded-full mb-4 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: '0%', backgroundColor: path.color }}
              />
            </div>

            {/* Concept list */}
            <div className="space-y-2">
              {path.nodes.map((nodeId, i) => {
                const concept = getConceptById(nodeId);
                if (!concept) return null;
                const cfg = CATEGORY_CONFIG[concept.category];
                return (
                  <Link
                    key={nodeId}
                    href={`/concept/${nodeId}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ backgroundColor: path.color + '20', color: path.color }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-[#f1f5f9] group-hover:text-white">
                        {concept.name}
                      </span>
                      <span className="text-xs text-[#64748b] ml-2">{concept.nameEn}</span>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full shrink-0"
                      style={{ backgroundColor: cfg.color + '15', color: cfg.color }}
                    >
                      {cfg.icon}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
