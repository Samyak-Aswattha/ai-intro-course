/* ============================================================
   references.js — 参考资料中心数据
   local: 课程目录内的电子书/文件（校内可用）；web: 外部链接
   ============================================================ */
export default [
  {
    id: 'papers', name: '里程碑论文（读懂 3 篇即超纲）',
    icon: '📄',
    items: [
      { t: 'Turing (1950) Computing Machinery and Intelligence', d: '图灵测试的原始论文，开头几页极其好读——本课一切讨论的起点', url: 'https://redirect.cs.ubc.ca/~poole/aibook/html/TuringTest.html', tag: '第一章' },
      { t: 'Searle (1980) Minds, Brains, and Programs', d: '中文屋原始论文', url: 'https://plato.stanford.edu/entries/chinese-room/', tag: '第一章' },
      { t: 'McCulloch & Pitts (1943) 神经活动的逻辑演算', d: '神经网络的创世论文', url: 'https://link.springer.com/article/10.1007/BF02478259', tag: '第二章' },
      { t: 'Rumelhart, Hinton & Williams (1986) 反向传播', d: '两页半 Nature 论文，改变历史', url: 'https://www.nature.com/articles/323533a0', tag: '第四章' },
      { t: 'LeCun et al. (1998) / Krizhevsky (2012) CNN 双璧', d: 'LeNet 与 AlexNet：卷积网络的奠基与爆发', url: 'https://arxiv.org/abs/1605.02636', tag: '第五章' },
      { t: 'Vaswani et al. (2017) Attention Is All You Need', d: '本课最重要的一篇——Transformer 原始论文', url: 'https://arxiv.org/abs/1706.03762', tag: '第六章' },
      { t: 'Goodfellow et al. (2014) GAN', d: '酒馆白板点子的正式化', url: 'https://arxiv.org/abs/1406.2661', tag: '第六章' },
      { t: 'Ho et al. (2020) DDPM 扩散模型', d: '当代图像生成的理论源头', url: 'https://arxiv.org/abs/2006.11239', tag: '第六章' },
      { t: 'Kaplan et al. (2020) Scaling Laws', d: '规模法则：大模型时代的物理定律', url: 'https://arxiv.org/abs/2001.08361', tag: '第六章' },
      { t: 'Bender et al. (2021) Stochastic Parrots', d: '"随机鹦鹉"檄文——大模型批评的必读反方', url: 'https://dl.acm.org/doi/10.1145/3442188.3445922', tag: '第六/七章' },
      { t: 'Sutton (2019) The Bitter Lesson', d: '两页短文，AI 圈被引用最多的"苦涩教训"', url: 'http://www.incompleteideas.net/IncIdeas/BitterLesson.html', tag: '第一章' },
      { t: 'Wei et al. (2022) Chain-of-Thought Prompting', d: '思维链提示的原始论文', url: 'https://arxiv.org/abs/2201.11903', tag: '第九章' }
    ]
  },
  {
    id: 'books', name: '教材与书籍（课程藏书柜）',
    icon: '📘',
    items: [
      { t: '周志华《机器学习》（西瓜书）', d: '中文机器学习标准教材，第一章术语权威来源', local: true, tag: '第三章' },
      { t: 'Goodfellow《深度学习》（花书）', d: '深度学习圣经，本课指定参考', local: true, tag: '第四-六章' },
      { t: '邱锡鹏《神经网络与深度学习》', d: 'nndl-book，中文开源，与课程主线高度契合', local: true, tag: '第四-六章' },
      { t: '《深度学习：基础、研究与应用》(d2l)', d: '动手学深度学习的理论版', local: true, tag: '第五章' },
      { t: '《图解深度学习》', d: '全图解入门，零基础友好', local: true, tag: '第四章' },
      { t: '矢泽久雄《程序是怎样跑起来的》', d: '从二进制到程序的图解之旅', local: true, tag: '第一章' },
      { t: '冯·诺依曼《计算机与大脑》相关比较研究', d: 'CAN COMPUTERS THINK? 课程藏书', local: true, tag: '第八章' },
      { t: 'Brian Christian《对齐问题》', d: 'AI 安全全景叙事佳作（有中译）', web: 'https://book.douban.com/subject/35489832/', tag: '第七章' },
      { t: '祖博夫《监控资本主义时代》', d: '第七章概念的完整论证', web: 'https://book.douban.com/subject/34897930/', tag: '第七章' },
      { t: '玛格丽特·博登《AI：人工智能的本质与未来》', d: '认知科学家视角的智能观', web: 'https://book.douban.com/subject/27614204/', tag: '第一章' }
    ]
  },
  {
    id: 'courses', name: '视频课程（课后加餐）',
    icon: '🎬',
    items: [
      { t: '李宏毅机器学习/生成式 AI 导论', d: '台大李宏毅——中文世界最好的 AI 课，本课多章结构参考了它', web: 'https://speech.ee.ntu.edu.tw/~hylee/ml/2023-spring.php', tag: '全课程' },
      { t: '3Blue1Brown 神经网络系列', d: '全球公认最优雅的神经网络可视化（B 站有官方中字）', web: 'https://www.bilibili.com/video/BV1bx411M7MZ', tag: '第四章' },
      { t: 'CrashCourse Computer Science', d: '计算机科学速成课 1-10 集，对应第一章计算原理', web: 'https://www.bilibili.com/video/BV1EW411u7th', tag: '第一章' },
      { t: 'StatQuest（机器学习专题）', d: '最友好的统计科普频道，决策树/集成等讲解极佳', web: 'https://www.youtube.com/@statquest', tag: '第三章' },
      { t: '课程视频素材库', d: 'AI 名画入境、AI 电影第一名、欢迎来到 AI 时代、模拟退火动画等（本站 assets/video）', local: true, tag: '多章' },
      { t: '清华 AI 光影社通识课（50 集）', d: '课程素材库内的成系列通识 PPT，按主题检索', local: true, tag: '多章' }
    ]
  },
  {
    id: 'tools', name: '实践工具箱',
    icon: '🛠️',
    items: [
      { t: 'Teachable Machine', d: '谷歌浏览器内零代码训练图像/声音分类器', web: 'https://teachablemachine.withgoogle.com', tag: '第九章' },
      { t: 'TensorFlow Playground', d: '官方神经网络训练操场', web: 'https://playground.tensorflow.org', tag: '第四章' },
      { t: 'Ollama', d: '一行命令本地跑大模型', web: 'https://ollama.com', tag: '第九章' },
      { t: 'LM Studio', d: '图形界面本地大模型', web: 'https://lmstudio.ai', tag: '第九章' },
      { t: 'AnythingLLM', d: '桌面级开源 RAG 知识库', web: 'https://anythingllm.com', tag: '第九章' },
      { t: 'Embedding Projector', d: '谷歌官方高维向量可视化', web: 'https://projector.tensorflow.org', tag: '第五章' },
      { t: 'Kaggle Notebooks', d: '免费 GPU 练代码（进阶选）', web: 'https://www.kaggle.com/code', tag: '进阶' }
    ]
  },
  {
    id: 'readings', name: '深度阅读与课程特藏',
    icon: '🧭',
    items: [
      { t: 'A Brief History of AI: How to Prevent Another Winter', d: '课程指定 AI 简史长文（中英对照版在课程素材库）', local: true, tag: '第一章' },
      { t: '大模型运作原理（课程原创图解）', d: '教学团队原创：从 token 到生成的全链路', local: true, tag: '第六章' },
      { t: '《AI 启示录》/《AI 战事前线情势》', d: '课程指定阅读的宏观视角双联', local: true, tag: '第六-八章' },
      { t: '鲍平磊《殊途同归：生物视觉与人工视觉》', d: 'CNN 的生物学对照——课程指定阅读', local: true, tag: '第五章' },
      { t: '曼宁《NLP 历史和展望》（中译）', d: '斯坦福 NLP 宗师的百年回望演讲', local: true, tag: '第六章' },
      { t: '《进化算法的算法进化》（课程原创讲义）', d: '从达尔文到遗传算法', local: true, tag: '第二章' },
      { t: '《物理符号系统能思考吗》debate graph', d: '符号系统之争的论证地图（辩论课素材）', local: true, tag: '第八章' },
      { t: 'WaytoAGI 提示词工程指南', d: '飞书开源知识库，实战课参考教材', web: 'https://waytoagi.feishu.cn/wiki/QfPeXKCRbia6rjkole2cLUD8nye', tag: '第九章' },
      { t: 'Karpathy: Neural Networks Zero to Hero', d: '从零手写 GPT 的传奇课程（进阶）', web: 'https://karpathy.ai/zero-to-hero.html', tag: '进阶' },
      { t: 'DeepSeek-R1 论文（2025）', d: '强化学习让推理自发涌现的原始论文——2026 课堂"推理时代"一手材料', web: 'https://arxiv.org/abs/2501.12948', tag: '第六章' },
      { t: 'MCP 官方文档（Model Context Protocol）', d: '智能体协议一手资料：规范、SDK、服务器列表', web: 'https://modelcontextprotocol.io', tag: '第九章' },
      { t: '欧盟 AI 法案官方追踪站', d: '条款、时间线、实施进度——2026-08-02 全面适用', web: 'https://artificialintelligenceact.eu', tag: '第七章' },
      { t: 'Chinchilla 论文（2022）', d: '训练最优配比：参数与数据 1:20——规模法则实验室的理论底座', web: 'https://arxiv.org/abs/2203.15556', tag: '第六章' }
    ]
  }
];
