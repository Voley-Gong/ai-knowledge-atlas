// AI 知识星图 - 学习路径数据
// 预设4条学习路线，每条路线用一系列概念节点串联

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  // 路径上的概念节点序列
  nodes: string[];
}

export const learningPaths: LearningPath[] = [
  {
    id: 'token-journey',
    name: '一个Token的旅程',
    description: '从输入文本到模型输出，追踪一个Token经过的完整处理流水线',
    emoji: '🛤️',
    color: '#3B82F6',
    nodes: [
      'token',
      'embedding',
      'positional-encoding',
      'attention',
      'self-attention',
      'multi-head-attention',
      'transformer',
      'feed-forward-network',
      'softmax',
      'loss-function',
      'backpropagation',
      'gradient-descent',
    ],
  },
  {
    id: 'train-to-deploy',
    name: '从训练到部署',
    description: '了解一个大模型从预训练到最终部署上线的完整生命周期',
    emoji: '🛤️',
    color: '#10B981',
    nodes: [
      'pre-training',
      'fine-tuning',
      'rlhf',
      'quantization',
      'kv-cache',
      'temperature',
      'agent',
    ],
  },
  {
    id: 'frontier-panorama',
    name: 'AI前沿全景',
    description: '纵览AI最前沿的研究方向和技术突破',
    emoji: '🛤️',
    color: '#EC4899',
    nodes: [
      'scaling-law',
      'moe',
      'diffusion',
      'reasoning-model',
      'knowledge-distillation',
      'world-model',
      'embodied-ai',
      'agi',
    ],
  },
  {
    id: 'transformer-family',
    name: 'Transformer家族',
    description: '深入了解Transformer架构及其三大变体和衍生应用',
    emoji: '🛤️',
    color: '#8B5CF6',
    nodes: [
      'transformer',
      'encoder-only',
      'decoder-only',
      'encoder-decoder',
      'cross-attention',
      'rag',
      'agent',
      'mcp',
    ],
  },
];
