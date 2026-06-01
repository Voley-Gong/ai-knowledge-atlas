'use client';

import { getConceptById, CATEGORY_CONFIG, getAllConceptIds } from '@/data/concepts';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// 动态导入所有交互组件，按需加载，避免所有页面加载全部组件
const interactionComponents: Record<string, React.ComponentType> = {
  'token': dynamic(() => import('@/components/interactions/TokenInteraction')),
  'embedding': dynamic(() => import('@/components/interactions/EmbeddingInteraction')),
  'attention': dynamic(() => import('@/components/interactions/AttentionInteraction')),
  'transformer': dynamic(() => import('@/components/interactions/TransformerInteraction')),
  'self-attention': dynamic(() => import('@/components/interactions/SelfAttentionInteraction')),
  'softmax': dynamic(() => import('@/components/interactions/SoftmaxInteraction')),
  'loss-function': dynamic(() => import('@/components/interactions/LossFunctionInteraction')),
  'gradient-descent': dynamic(() => import('@/components/interactions/GradientDescentInteraction')),
  'dropout': dynamic(() => import('@/components/interactions/DropoutInteraction')),
  'encoder-decoder': dynamic(() => import('@/components/interactions/EncoderDecoderInteraction')),
  'decoder-only': dynamic(() => import('@/components/interactions/DecoderOnlyInteraction')),
  'temperature': dynamic(() => import('@/components/interactions/TemperatureInteraction')),
  'rag': dynamic(() => import('@/components/interactions/RAGInteraction')),
  'chain-of-thought': dynamic(() => import('@/components/interactions/ChainOfThoughtInteraction')),
  'moe': dynamic(() => import('@/components/interactions/MoEInteraction')),
  'multi-head-attention': dynamic(() => import('@/components/interactions/MultiHeadAttentionInteraction')),
  'positional-encoding': dynamic(() => import('@/components/interactions/PositionalEncodingInteraction')),
  'backpropagation': dynamic(() => import('@/components/interactions/BackpropagationInteraction')),
  'learning-rate': dynamic(() => import('@/components/interactions/LearningRateInteraction')),
  'overfitting': dynamic(() => import('@/components/interactions/OverfittingInteraction')),
  'normalization': dynamic(() => import('@/components/interactions/NormalizationInteraction')),
  'cross-attention': dynamic(() => import('@/components/interactions/CrossAttentionInteraction')),
  'pre-training': dynamic(() => import('@/components/interactions/PreTrainingInteraction')),
  'fine-tuning': dynamic(() => import('@/components/interactions/FineTuningInteraction')),
  'agent': dynamic(() => import('@/components/interactions/AgentInteraction')),
  'activation-function': dynamic(() => import('@/components/interactions/ActivationFunctionInteraction')),
  'regularization': dynamic(() => import('@/components/interactions/RegularizationInteraction')),
  'batch-epoch': dynamic(() => import('@/components/interactions/BatchEpochInteraction')),
  'resnet': dynamic(() => import('@/components/interactions/ResNetInteraction')),
  'encoder-only': dynamic(() => import('@/components/interactions/EncoderOnlyInteraction')),
  'feed-forward-network': dynamic(() => import('@/components/interactions/FeedForwardInteraction')),
  'rlhf': dynamic(() => import('@/components/interactions/RLHFInteraction')),
  'prompt-engineering': dynamic(() => import('@/components/interactions/PromptEngineeringInteraction')),
  'lora': dynamic(() => import('@/components/interactions/LoRAInteraction')),
  'quantization': dynamic(() => import('@/components/interactions/QuantizationInteraction')),
  'synthetic-data': dynamic(() => import('@/components/interactions/SyntheticDataInteraction')),
  'world-model': dynamic(() => import('@/components/interactions/WorldModelInteraction')),
  'embodied-ai': dynamic(() => import('@/components/interactions/EmbodiedAIInteraction')),
  'ai-chip': dynamic(() => import('@/components/interactions/AIChipInteraction')),
  'agi': dynamic(() => import('@/components/interactions/AGIInteraction')),
};

function InteractionLoader({ conceptId }: { conceptId: string }) {
  const Comp = interactionComponents[conceptId];
  if (!Comp) return null;
  return <Comp />;
}

export default function ConceptPageClient({ id }: { id: string }) {
  const concept = getConceptById(id);

  if (!concept) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-4">🤷 概念未找到</p>
          <Link href="/" className="text-blue-400 hover:underline">返回首页</Link>
        </div>
      </main>
    );
  }

  const cfg = CATEGORY_CONFIG[concept.category];
  const allIds = getAllConceptIds();
  const idx = allIds.indexOf(id);
  const prevId = idx > 0 ? allIds[idx - 1] : null;
  const nextId = idx < allIds.length - 1 ? allIds[idx + 1] : null;
  const hasInteraction = !!interactionComponents[id];

  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0a0e1a]/90 backdrop-blur-md border-b border-[#1e293b]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="text-[#94a3b8] hover:text-white text-sm shrink-0">
            ← 返回
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold truncate">{concept.name}</h1>
              <span className="text-sm text-[#64748b] hidden sm:inline">{concept.nameEn}</span>
            </div>
          </div>
          <span
            className="shrink-0 text-xs px-2 py-1 rounded-full font-medium"
            style={{ backgroundColor: cfg.color + '20', color: cfg.color }}
          >
            {cfg.icon} {cfg.label}
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 mt-4 space-y-5">
        {/* Interaction Area */}
        {hasInteraction && (
          <div
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: cfg.color + '30', backgroundColor: '#0d1117' }}
          >
            <div className="px-4 py-2 text-xs font-medium flex items-center gap-1" style={{ color: cfg.color }}>
              ⚡ 交互演示
            </div>
            <div style={{ height: '320px', overflow: 'hidden' }}>
              <InteractionLoader conceptId={id} />
            </div>
          </div>
        )}

        {/* Definition */}
        <section className="rounded-xl border border-[#1e293b] bg-[#111827] p-5">
          <h2 className="text-sm font-medium text-[#64748b] mb-2">📖 一句话定义</h2>
          <p className="text-[#f1f5f9] leading-relaxed">{concept.definition}</p>
        </section>

        {/* Analogy */}
        <section className="rounded-xl border border-[#1e293b] bg-[#111827] p-5">
          <h2 className="text-sm font-medium text-[#64748b] mb-2">🎯 通俗类比</h2>
          <p className="text-[#f1f5f9] leading-relaxed">{concept.analogy}</p>
        </section>

        {/* Mnemonic */}
        <section className="rounded-xl border border-[#1e293b] bg-[#111827] p-5">
          <h2 className="text-sm font-medium text-[#64748b] mb-2">🧠 记忆口诀</h2>
          <p className="text-[#f1f5f9] leading-relaxed">{concept.mnemonic}</p>
        </section>

        {/* Role */}
        <section className="rounded-xl border border-[#1e293b] bg-[#111827] p-5">
          <h2 className="text-sm font-medium text-[#64748b] mb-2">🏭 在AI中的角色</h2>
          <p className="text-[#f1f5f9] leading-relaxed">{concept.role}</p>
        </section>

        {/* Applications */}
        <section className="rounded-xl border border-[#1e293b] bg-[#111827] p-5">
          <h2 className="text-sm font-medium text-[#64748b] mb-3">💡 应用场景</h2>
          <div className="flex flex-wrap gap-2">
            {concept.applications.map(app => (
              <span
                key={app}
                className="px-3 py-1.5 rounded-lg text-sm"
                style={{ backgroundColor: cfg.color + '15', color: cfg.color }}
              >
                {app}
              </span>
            ))}
          </div>
        </section>

        {/* Related Concepts */}
        <section className="rounded-xl border border-[#1e293b] bg-[#111827] p-5">
          <h2 className="text-sm font-medium text-[#64748b] mb-3">🔗 关联概念</h2>
          <div className="flex flex-wrap gap-2">
            {[...concept.prerequisites, ...concept.successors, ...concept.relatedTo]
              .filter((v, i, a) => a.indexOf(v) === i)
              .map(rid => {
                const rc = getConceptById(rid);
                if (!rc) return null;
                const rcfg = CATEGORY_CONFIG[rc.category];
                return (
                  <Link
                    key={rid}
                    href={`/concept/${rid}`}
                    className="px-3 py-1.5 rounded-lg text-sm hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: rcfg.color + '15', color: rcfg.color }}
                  >
                    {rcfg.icon} {rc.name}
                  </Link>
                );
              })}
          </div>
        </section>

        {/* Prev/Next Navigation */}
        <nav className="flex justify-between items-center pt-4">
          {prevId ? (
            <Link
              href={`/concept/${prevId}`}
              className="flex items-center gap-1 text-sm text-[#94a3b8] hover:text-white transition-colors"
            >
              ← {getConceptById(prevId)?.name}
            </Link>
          ) : <span />}
          {nextId ? (
            <Link
              href={`/concept/${nextId}`}
              className="flex items-center gap-1 text-sm text-[#94a3b8] hover:text-white transition-colors"
            >
              {getConceptById(nextId)?.name} →
            </Link>
          ) : <span />}
        </nav>
      </div>
    </main>
  );
}
