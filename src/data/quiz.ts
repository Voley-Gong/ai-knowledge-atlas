// AI 知识星图 - 记忆辅助测验数据

export interface QuizQuestion {
  id: string;
  type: 'match' | 'choice' | 'fill';
  question: string;
  // 选择题选项
  options?: string[];
  // 正确答案
  answer: string;
  // 解析
  explanation: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    type: 'choice',
    question: 'Token是什么？',
    options: ['AI的输出格式', 'AI理解文本的最小单位', '一种编程语言', 'AI的训练数据'],
    answer: 'AI理解文本的最小单位',
    explanation: 'Token是AI处理文本的基本单元，类似于乐高积木的最小块件。',
  },
  {
    id: 'q2',
    type: 'choice',
    question: 'Embedding的作用是什么？',
    options: ['压缩模型大小', '把Token变成数字向量', '加速推理过程', '防止过拟合'],
    answer: '把Token变成数字向量',
    explanation: 'Embedding将符号（词语）映射到数学空间中，让AI能计算语义相似度。',
  },
  {
    id: 'q3',
    type: 'choice',
    question: 'Self-Attention让每个词做什么？',
    options: ['记住自己的位置', '找到和自己最相关的其他词', '翻译成其他语言', '生成新的词语'],
    answer: '找到和自己最相关的其他词',
    explanation: 'Self-Attention让句子中的每个词"环顾四周"，找出和自己最相关的其他词。',
  },
  {
    id: 'q4',
    type: 'choice',
    question: 'Positional Encoding解决什么问题？',
    options: ['Token太多的问题', 'Transformer不知道词的顺序的问题', '模型太大的问题', '训练太慢的问题'],
    answer: 'Transformer不知道词的顺序的问题',
    explanation: 'Transformer并行处理所有Token，不像RNN天然有顺序，所以需要位置编码告诉每个Token"你在第几位"。',
  },
  {
    id: 'q5',
    type: 'choice',
    question: 'GPT使用的是什么架构？',
    options: ['Encoder-Only', 'Decoder-Only', 'Encoder-Decoder', 'CNN'],
    answer: 'Decoder-Only',
    explanation: 'GPT系列使用Decoder-Only架构，只向前看，逐词生成文本。',
  },
  {
    id: 'q6',
    type: 'choice',
    question: 'Loss Function衡量的是什么？',
    options: ['模型的大小', '模型预测和正确答案之间的差距', '训练速度', '模型参数数量'],
    answer: '模型预测和正确答案之间的差距',
    explanation: 'Loss Function就像AI的成绩单，衡量预测结果与真实答案的差距。',
  },
  {
    id: 'q7',
    type: 'choice',
    question: 'RLHF的全称是什么？',
    options: ['Real-time Learning from Humans', 'Reinforcement Learning from Human Feedback', 'Rapid Language Generation', 'Recursive Logic Framework'],
    answer: 'Reinforcement Learning from Human Feedback',
    explanation: 'RLHF是用人类反馈来强化学习，让AI输出更符合人类期望。',
  },
  {
    id: 'q8',
    type: 'choice',
    question: 'RAG解决了什么核心问题？',
    options: ['模型太大', 'AI幻觉（编造事实）', '训练太慢', '推理延迟'],
    answer: 'AI幻觉（编造事实）',
    explanation: 'RAG让AI先查资料再回答，大大减少"一本正经地胡说八道"的问题。',
  },
  {
    id: 'q9',
    type: 'choice',
    question: 'Quantization的作用是什么？',
    options: ['让模型更聪明', '给模型瘦身减少资源消耗', '增加训练数据', '提高准确率'],
    answer: '给模型瘦身减少资源消耗',
    explanation: '量化用更少的数字位数表示参数，像压缩照片一样，大小减少但质量几乎不变。',
  },
  {
    id: 'q10',
    type: 'choice',
    question: 'MoE（Mixture of Experts）的核心思想是什么？',
    options: ['让所有参数同时工作', '分成多个专家每次只激活相关的', '只用一个专家', '随机选择参数'],
    answer: '分成多个专家每次只激活相关的',
    explanation: 'MoE像医院分科室，来什么病找什么科，不用所有医生都出动。',
  },
  {
    id: 'q11',
    type: 'choice',
    question: 'Dropout的技术原理是什么？',
    options: ['增加神经元数量', '训练时随机关掉一部分神经元', '降低学习率', '增加网络层数'],
    answer: '训练时随机关掉一部分神经元',
    explanation: 'Dropout像足球队训练时随机让几名球员休息，迫使其他球员能独当一面。',
  },
  {
    id: 'q12',
    type: 'choice',
    question: 'Diffusion Model生成图像的过程像什么？',
    options: ['画一幅画', '从噪声中逐步去噪雕刻出图像', '拼接已有图片', '3D建模'],
    answer: '从噪声中逐步去噪雕刻出图像',
    explanation: 'Diffusion像米开朗基罗的雕塑——从石头中去掉多余部分，露出作品。',
  },
  {
    id: 'q13',
    type: 'choice',
    question: 'Chain of Thought让AI做什么？',
    options: ['说得更快', '一步步展示思考过程', '记住更多内容', '生成更多文字'],
    answer: '一步步展示思考过程',
    explanation: 'CoT就像数学老师要求写解题步骤，有了步骤正确率更高。',
  },
  {
    id: 'q14',
    type: 'choice',
    question: 'LoRA的核心优势是什么？',
    options: ['让模型更大', '用极少参数实现高效微调', '增加训练数据', '加速推理'],
    answer: '用极少参数实现高效微调',
    explanation: 'LoRA像给汽车换贴纸，小改动就能大变化，让普通人也能定制大模型。',
  },
  {
    id: 'q15',
    type: 'choice',
    question: 'AGI和当前AI的最大区别是什么？',
    options: ['更大更快', '能像人类一样学习和理解任何智力任务', '参数更多', '训练数据更多'],
    answer: '能像人类一样学习和理解任何智力任务',
    explanation: '当前AI是偏科天才，AGI是全科优秀生——什么都能学、什么都能做。',
  },
  {
    id: 'q16',
    type: 'choice',
    question: 'Backpropagation的工作原理是什么？',
    options: ['从输入到输出正向传播', '从输出层往回逐层追溯错误', '随机更新参数', '只更新最后一层'],
    answer: '从输出层往回逐层追溯错误',
    explanation: '反向传播像公司出问题后的追责——从CEO逐级往下追查"谁的锅"。',
  },
  {
    id: 'q17',
    type: 'choice',
    question: '什么是AI幻觉（Hallucination）？',
    options: ['AI产生幻觉图像', 'AI一本正经地输出错误信息', 'AI出现故障', 'AI的创造性'],
    answer: 'AI一本正经地输出错误信息',
    explanation: 'AI幻觉就像一个自信的导游，讲的故事一半是编的——听起来很合理但实际是错的。',
  },
  {
    id: 'q18',
    type: 'choice',
    question: 'Scaling Law告诉我们什么？',
    options: ['AI能力有上限', '模型越大数据越多效果越好', '小模型更好', '算力不重要'],
    answer: '模型越大数据越多效果越好',
    explanation: 'Scaling Law是AI的物理定律——投入（模型大小、数据量、算力）越多，产出越好。',
  },
  {
    id: 'q19',
    type: 'choice',
    question: 'KV Cache加速了什么操作？',
    options: ['模型训练', '推理时避免重复计算', '数据加载', '梯度计算'],
    answer: '推理时避免重复计算',
    explanation: 'KV Cache像考试的草稿纸——已经算过的中间结果不用重新计算。',
  },
  {
    id: 'q20',
    type: 'choice',
    question: 'Cross-Attention和Self-Attention的区别是什么？',
    options: ['Cross更强大', 'Cross连接两个不同来源的信息', '没有区别', 'Self更慢'],
    answer: 'Cross连接两个不同来源的信息',
    explanation: 'Self-Attention是在同一组信息内部找关系，Cross-Attention是让一组信息去关注另一组不同来源的信息。',
  },
];
