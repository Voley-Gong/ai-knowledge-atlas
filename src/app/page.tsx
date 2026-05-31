'use client';

import { useState } from 'react';
import { concepts, CATEGORY_CONFIG, type Category } from '@/data/concepts';
import Link from 'next/link';

const categories: Category[] = ['basic', 'architecture', 'training', 'application', 'frontier'];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');

  const filtered = activeCategory === 'all'
    ? concepts
    : concepts.filter(c => c.category === activeCategory);

  const categoryConfig = (cat: Category) => CATEGORY_CONFIG[cat];

  return (
    <main className="min-h-screen pb-8">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0a0e1a]/90 backdrop-blur-md border-b border-[#1e293b]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-center mb-1">
            🧠 AI 知识图鉴
          </h1>
          <p className="text-sm text-[#94a3b8] text-center mb-4">
            50个核心概念 · 交互式学习
          </p>
          {/* Navigation */}
          <nav className="flex justify-center gap-4 text-sm">
            <Link href="/paths" className="text-[#94a3b8] hover:text-white transition-colors">
              🛤️ 学习路径
            </Link>
            <Link href="/quiz" className="text-[#94a3b8] hover:text-white transition-colors">
              📝 测验
            </Link>
          </nav>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="sticky top-[100px] z-20 bg-[#0a0e1a]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActiveCategory('all')}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === 'all'
                  ? 'bg-white/10 text-white ring-1 ring-white/20'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              全部 ({concepts.length})
            </button>
            {categories.map(cat => {
              const cfg = categoryConfig(cat);
              const count = concepts.filter(c => c.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === cat
                      ? 'text-white ring-1'
                      : 'text-[#94a3b8] hover:text-white'
                  }`}
                  style={activeCategory === cat ? {
                    backgroundColor: cfg.color + '20',
                    borderColor: cfg.color,
                    outlineColor: cfg.color + '60',
                  } : {}}
                >
                  {cfg.icon} {cfg.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Card Grid */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(concept => {
            const cfg = categoryConfig(concept.category);
            return (
              <Link
                key={concept.id}
                href={`/concept/${concept.id}`}
                className="group block rounded-xl p-5 border transition-all duration-200 hover:scale-[1.02]"
                style={{
                  backgroundColor: '#111827',
                  borderColor: '#1e293b',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = cfg.color + '60';
                  e.currentTarget.style.boxShadow = `0 0 20px ${cfg.color}20`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#1e293b';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{cfg.icon}</span>
                  <span
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{ backgroundColor: cfg.color + '20', color: cfg.color }}
                  >
                    {cfg.label}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
                  {concept.name}
                </h3>
                <p className="text-sm text-[#94a3b8] leading-relaxed line-clamp-2">
                  {concept.definition}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
