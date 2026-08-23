/* ============================================================
   data.js — 章节树（全站导航与路由的单一来源）
   ============================================================ */

export const MODULES = {
  intro:       { id: 'intro',       name: '引论', tag: '模块一 · 引论', icon: '🧭', desc: '智能的定义、图灵测试、AI 七十年简史，以及支撑一切的计算原理。' },
  foundations: { id: 'foundations', name: '通识', tag: '模块二 · 通识', icon: '🏛️', desc: '从符号主义到大模型：机器学习、神经网络、深度学习、前沿突破与伦理反思。' },
  debates:     { id: 'debates',     name: '争锋', tag: '模块三 · 争锋', icon: '⚔️', desc: 'AI 时代，诗人何为？艺术何为？思想何为？——人文学科的正面交锋。' },
  practice:    { id: 'practice',    name: '实战', tag: '模块四 · 实战', icon: '🛠️', desc: '提示词工程、手搓 Agent、本地知识库与大模型部署、神经网络编程。' }
};

export const CHAPTERS = [
  {
    id: '01', module: 'intro', num: '第一章', title: '引论：什么是人工智能', hours: 2,
    brief: '在动手之前，先弄清三个问题：什么是"智能"？机器离它有多远？这一切从哪里来、往哪里去？',
    sections: [
      { id: 'what-is-intelligence', title: '智能的定义', desc: '心理学、哲学与工程学眼中的智能；图灵之问的由来。', demos: ['intelligence-quiz'] },
      { id: 'turing-test', title: '图灵测试与中文屋', desc: '模仿游戏、塞尔的哲学反击，以及"像不像"与"是不是"的鸿沟。', demos: ['turing-chat', 'chinese-room'] },
      { id: 'history', title: 'AI 简史：从达特茅斯到大模型', desc: '七十年三起两落：达特茅斯会议、两次寒冬、深度学习复兴与大模型时代。', demos: ['ai-timeline'] },
      { id: 'computation', title: '计算的前世今生', desc: '二进制、布尔代数、晶体管、算法与程序、图灵机——AI 的地基。', demos: ['binary-encoder', 'logic-gates', 'turing-machine'] },
      { id: 'paradigms', title: '三大范式与 Bitter Lesson', desc: '符号主义、连接主义、行为主义；以及 Sutton 那篇著名的"苦涩教训"。', demos: ['paradigm-compare'] }
    ]
  },
  {
    id: '02', module: 'foundations', num: '第二章', title: '知识与学习：AI 的两条道路', hours: 4,
    brief: '一条路是把知识写进机器（符号主义），一条路是让机器从数据中学习（连接主义）。两条路的分野贯穿 AI 全史。',
    sections: [
      { id: 'symbolic-vs-connection', title: '符号主义与连接主义', desc: '两种智能观：规则与表示 vs 神经元与权重；麦卡洛克-皮茨神经元。', demos: ['paradigm-compare'] },
      { id: 'knowledge-representation', title: '知识表示', desc: '逻辑、语义网络、知识图谱——让知识可以被机器推理。', demos: ['knowledge-graph-3d'] },
      { id: 'expert-system', title: '专家系统：知识工程的兴衰', desc: 'MYCIN 与 XCON 的辉煌，知识获取瓶颈与寒冬。', demos: ['expert-system'] },
      { id: 'search', title: '搜索与博弈：智能的另一面', desc: '迷宫中的宽度/深度优先搜索、A* 启发式与博弈树——深蓝的胜利之路。', demos: ['pathfinding'] }
    ]
  },
  {
    id: '03', module: 'foundations', num: '第三章', title: '机器学习', hours: 7,
    brief: '不给规则，给例子。数据驱动的新范式：回归、分类、聚类、在试错中成长，以及无处不在的过拟合。',
    sections: [
      { id: 'what-is-ml', title: '什么是机器学习', desc: '从数据中学习规律；训练/测试/验证；学习的三种范式。', demos: ['ml-pipeline'] },
      { id: 'regression', title: '回归：预测一个数', desc: '线性回归、损失函数、梯度下降——机器学习的"第一课"。', demos: ['linear-regression', 'gradient-descent'] },
      { id: 'classification', title: '分类：划一条边界', desc: '决策树、KNN、朴素贝叶斯；混淆矩阵与评估指标。', demos: ['decision-tree', 'knn', 'naive-bayes', 'confusion-matrix'] },
      { id: 'clustering', title: '聚类：无师自通', desc: '没有标签的学习：K-means 与物以类聚。', demos: ['kmeans'] },
      { id: 'reinforcement-learning', title: '强化学习：在试错中成长', desc: '没有标签，只有奖惩。MDP、贝尔曼方程与 Q-learning——AlphaGo 与 RLHF 背后真正的数学。', demos: ['paradigm-compare'] },
      { id: 'overfitting', title: '过拟合与模型评估', desc: '背题的学生：训练集满分、新题不及格；交叉验证与正则化。', demos: ['overfitting'] },
      { id: 'bias-variance', title: '偏差与方差', desc: '打靶寓言：打不准是枪的问题还是手的问题。', demos: ['bias-variance'] }
    ]
  },
  {
    id: '04', module: 'foundations', num: '第四章', title: '人工神经网络', hours: 6,
    brief: '仿造大脑的尝试：从单个感知机到多层网络，从激活函数到反向传播。',
    sections: [
      { id: 'perceptron', title: '感知机：第一个神经元', desc: ' Rosenblatt 的马克一号；用权重投票做出决定。', demos: ['perceptron'] },
      { id: 'mlp-activation', title: '多层感知机与激活函数', desc: '一层不够就叠多层；没有非线性就没有深度学习。', demos: ['activation-gallery', 'nn-3d'] },
      { id: 'backprop', title: '反向传播：神经网络的学分分配', desc: '误差从输出层往回走，层层追责，层层修正。', demos: ['backprop-viz'] },
      { id: 'training-craft', title: '训练的技艺', desc: '学习率、批大小、初始化——炼丹师的入门手册。', demos: ['mlp-playground'] }
    ]
  },
  {
    id: '05', module: 'foundations', num: '第五章', title: '深度学习', hours: 6,
    brief: '网络越深，能力越强？卷积看世界，循环记时序，嵌入懂语义。',
    sections: [
      { id: 'why-deep', title: '为什么要"深"', desc: '层级特征提取：从像素到边缘，从边缘到五官，从五官到人脸。', demos: ['feature-hierarchy', 'nn-3d'] },
      { id: 'cnn', title: '卷积神经网络（CNN）', desc: '卷积核扫过图像；池化、特征图与感受野。', demos: ['convolution', 'pooling', 'cnn-3d'] },
      { id: 'rnn', title: '循环神经网络（RNN 与 LSTM）', desc: '有记忆的网络；门控机制如何拯救长程依赖；序列到序列。', demos: ['rnn-unroll', 'lstm-gates', 'seq2seq'] },
      { id: 'embedding', title: '词嵌入与表示学习', desc: '国王 − 男人 + 女人 ≈ 王后：语义的几何学。', demos: ['embedding-3d', 'word2vec-arithmetic'] }
    ]
  },
  {
    id: '06', module: 'foundations', num: '第六章', title: '深度学习前沿', hours: 6,
    brief: '注意力机制改写一切：Transformer、大语言模型、GAN、扩散模型与多模态。',
    sections: [
      { id: 'attention', title: '注意力机制', desc: '从 Seq2Seq 的瓶颈到自注意力：Q、K、V 的三角关系。', demos: ['attention-viz'] },
      { id: 'transformer', title: 'Transformer： Attention Is All You Need', desc: '编码器-解码器架构全景；位置编码与多头注意力。', demos: ['transformer-3d'] },
      { id: 'llm-gpt', title: '大语言模型与 GPT', desc: '下一个词预测的奇迹：预训练、微调、对齐与涌现。', demos: ['autoregressive', 'tokenizer', 'scaling-laws', 'reasoning-trace'] },
      { id: 'gan', title: '生成对抗网络（GAN）', desc: '伪造者与鉴别者的博弈：无中生有的艺术。', demos: ['gan-battle'] },
      { id: 'diffusion', title: '扩散模型', desc: '先加噪再去噪：从随机噪声中"雕刻"出图像。', demos: ['diffusion'] },
      { id: 'multimodal', title: '多模态与前沿展望', desc: '图文对齐、图神经网络、世界模型与通往 AGI 之路。', demos: ['multimodal-align'] }
    ]
  },
  {
    id: '07', module: 'foundations', num: '第七章', title: 'AI 伦理：挑战与风险', hours: 2,
    brief: '能力越大，责任越大。偏见、隐私、就业冲击、安全与对齐——技术之外的必修课。',
    sections: [
      { id: 'bias-fairness', title: '偏见与公平', desc: '数据有偏见，模型就有偏见；算法歧视的真实案例。', demos: ['algorithm-bias'] },
      { id: 'privacy-work', title: '隐私、就业与社会影响', desc: '监控资本主义、职业变迁、深度伪造与信息茧房。', demos: ['echo-chamber'] },
      { id: 'safety-alignment', title: '安全与对齐', desc: '让 AI 的目标与人类对齐：价值对齐问题与治理尝试。', demos: ['spec-gaming'] }
    ]
  },
  {
    id: '08', module: 'debates', num: '第八章', title: '争锋：AI 时代，人文何为', hours: 6,
    brief: '当机器开始写诗、作画、论证，人文学科是被取代，还是被解放？三轮正面交锋。',
    sections: [
      { id: 'poet', title: 'AI 时代，诗人何为', desc: '机器写诗的水平与限度；语言的诗性 residu；创作主体性之辩。', demos: ['poetry-arena'] },
      { id: 'art', title: 'AI 时代，艺术何为', desc: '从摄影术冲击到 AI 绘画：艺术史上的"抄袭"恐慌与本真性。', demos: ['style-transfer', 'art-turing'] },
      { id: 'thought', title: 'AI 时代，思想何为', desc: '物理符号系统之争；中文屋的余波；人机共生时代的批判性思维。', demos: ['debate-map'] }
    ]
  },
  {
    id: '09', module: 'practice', num: '第九章', title: '实战：与 AI 一起工作', hours: 8,
    brief: '从怎么说话、怎么托付、怎么查资料，到自己的第一个仓库——把大模型用起来，也看清什么时候不该用。',
    sections: [
      { id: 'prompt', title: '怎么跟 AI 打交道', desc: '乔哈里视窗：先搞清楚你和 AI 处在哪种信息状态，技法才有意义。', demos: ['prompt-lab'] },
      { id: 'vibe-coding', title: 'Vibe Coding 与挽具工程', desc: 'Agent 还是 Agentic？从许愿到挽具：2026 年人人在谈的新词，到底是什么。', demos: ['agent-workflow'] },
      { id: 'knowledge-base', title: '知识库：从 RAG 到 ima', desc: '让 AI 读你的资料，而不是凭印象编——原理 + 腾讯 ima 实操。', demos: ['rag-explainer'] },
      { id: 'github-basics', title: 'GitHub 入门实操', desc: '仓库、提交、README：程序员的协作语言，你也用得上。', demos: [] },
      { id: 'contest', title: 'AI 创作比赛', desc: '赛制、评分维度、往届佳作与创作方法论。', demos: ['contest-judge'] }
    ]
  }
];

/* ---------- 查询工具 ---------- */
export function sectionPage(chId, secId) { return `ch${chId}-${secId}.html`; }
export function chapterPage(chId) { return `ch${chId}.html`; }
export function modulePage(modId) { return `../${modId}/index.html`; }

export function findChapter(chId) { return CHAPTERS.find(c => c.id === chId); }
export function findSection(pageId) {
  // pageId 形如 "ch03-regression"
  const m = pageId.match(/^ch(\d{2})-(.+)$/);
  if (!m) return null;
  const ch = findChapter(m[1]);
  if (!ch) return null;
  const sec = ch.sections.find(s => s.id === m[2]);
  return sec ? { ch, sec } : null;
}
export function flatSections() {
  const out = [];
  CHAPTERS.forEach(ch => ch.sections.forEach(sec => out.push({ ch, sec, pageId: `ch${ch.id}-${sec.id}` })));
  return out;
}
export function neighbors(pageId) {
  const list = flatSections();
  const i = list.findIndex(x => x.pageId === pageId);
  return { prev: i > 0 ? list[i - 1] : null, next: i >= 0 && i < list.length - 1 ? list[i + 1] : null };
}

/* ---------- 概念内容（懒加载） ---------- */
const conceptCache = {};
export async function getConcept(chId) {
  if (!conceptCache[chId]) {
    conceptCache[chId] = await import(`../data/concepts/${chId}.js`).then(m => m.default || m.concept);
  }
  return conceptCache[chId];
}
export async function getAllConcepts() {
  const all = {};
  for (const ch of CHAPTERS) all[ch.id] = await getConcept(ch.id);
  return all;
}

/* ---------- 题库（懒加载） ---------- */
const quizCache = {};
export async function getQuiz(chId) {
  if (!quizCache[chId]) {
    quizCache[chId] = await import(`../data/quiz/${chId}.js`).then(m => m.default || m.items);
  }
  return quizCache[chId];
}
export async function getAllQuiz() {
  const all = [];
  for (const ch of CHAPTERS) all.push(...await getQuiz(ch.id));
  return all;
}

/* ---------- FAQ / 参考资料 ---------- */
export async function getFaq() { return (await import('../data/faq.js')).default; }
export async function getReferences() { return (await import('../data/references.js')).default; }
