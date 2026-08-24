/* ============================================================
   portal.js — 门户首页 v3
   Hero 内嵌真实运行的神经网络训练演示 + 2026 前沿动态条 + 密集布局
   ============================================================ */
import './app.js';
import { MODULES, CHAPTERS, flatSections } from './data.js';
import { P, scanReveal } from './app.js';
import * as store from './store.js';

document.body.dataset.module = 'intro';
document.title = '人工智能导论 · 交互式课程';

const content = document.getElementById('content');
const secs = flatSections();
const totalDemos = new Set(secs.flatMap(x => x.sec.demos || [])).size;
const doneCount = secs.filter(x => store.progress.isDone(x.pageId)).length;
const firstUnread = secs.find(x => !store.progress.isDone(x.pageId)) || secs[0];
const dueN = store.srs.dueCount();
const stats = store.stats.all();

const PEeks = [
  { i: '🧠', t: '3D 神经网络漫游', d: '旋转、点亮信号，看它逐层抽象', u: P('demos', 'nn-3d', '') },
  { i: '🏔️', t: '梯度下降 3D', d: '投小球看它滚向最优，弄坏学习率看它飞天', u: P('demos', 'gradient-descent', '') },
  { i: '🔥', t: '注意力热图', d: '真实 softmax(QKᵀ)，看"它"指代谁', u: P('demos', 'attention-viz', '') },
  { i: '💬', t: '思维链剧场', d: '直答 vs 思考再答：推理模型开箱', u: P('demos', 'reasoning-trace', '') },
];
const SHOW = [
  { i: '🕵️', t: '图灵测试实验室', d: '与三个对象盲聊，判断谁是机器', u: P('demos', 'turing-chat'), c: 'var(--m-intro)', b: '实验室' },
  { i: '🚪', t: '走进中文屋', d: '扮演查表的人，体验"会答而不懂"', u: P('demos', 'chinese-room'), c: 'var(--m-intro)', b: '剧场' },
  { i: '📼', t: '图灵机模拟器', d: '读写头在纸带上移动，跑回文检测', u: P('demos', 'turing-machine'), c: 'var(--m-intro)', b: '实验室' },
  { i: '🗺️', t: '迷宫搜索对比', d: 'BFS/DFS/贪心/A* 四种走法', u: P('demos', 'pathfinding'), c: 'var(--m-foundations)', b: '实验室' },
  { i: '🌳', t: '决策树实验室', d: '真实信息增益分裂，拖深度看过拟合', u: P('demos', 'decision-tree'), c: 'var(--m-foundations)', b: '实验室' },
  { i: '🎢', t: '过拟合滑杆', d: '从直线到疯狂过山车的 U 形曲线', u: P('demos', 'overfitting'), c: 'var(--m-foundations)', b: '实验室' },
  { i: '🧪', t: 'MLP 训练操场', d: '浏览器里真实跑反向传播', u: P('demos', 'mlp-playground'), c: 'var(--m-foundations)', b: '实验室' },
  { i: '🖼️', t: '卷积核滑窗', d: '亲手拖卷积核，编辑 9 个权重', u: P('demos', 'convolution'), c: 'var(--m-foundations)', b: '实验室' },
  { i: '🌌', t: '词嵌入星系 3D', d: '漫游语义星空，搜索近邻星座', u: P('demos', 'embedding-3d'), c: 'var(--m-foundations)', b: '3D' },
  { i: '⌨️', t: '自回归生成机', d: '逐词生成+概率分布，调温度', u: P('demos', 'autoregressive'), c: 'var(--m-foundations)', b: '实验室' },
  { i: '⚔️', t: 'GAN 对抗博弈', d: '生成器 vs 判别器，开模式崩塌', u: P('demos', 'gan-battle'), c: 'var(--m-foundations)', b: '实验室' },
  { i: '📈', t: '规模法则实验室', d: '拨动算力/参数/数据，看损失曲线', u: P('demos', 'scaling-laws'), c: 'var(--m-foundations)', b: '实验室' },
  { i: '⚖️', t: '偏见模拟器', d: '招聘算法的三种公平互相冲突', u: P('demos', 'algorithm-bias'), c: 'var(--m-foundations)', b: '实验室' },
  { i: '🏛️', t: '诗歌擂台', d: '人 or 机盲测 + 三连问复盘', u: P('demos', 'poetry-arena'), c: 'var(--m-debates)', b: '辩论场' },
  { i: '📚', t: 'RAG 透视模拟器', d: '三阶段透视，关掉 RAG 看幻觉', u: P('demos', 'rag-explainer'), c: 'var(--m-practice)', b: '实验室' },
  { i: '🛰️', t: 'Agent 协议星图', d: 'MCP/A2A：智能体的血管系统', u: P('demos', 'agent-protocols'), c: 'var(--m-practice)', b: '新·2026' },
];
/* 2026 前沿动态条（源自 2026-08 实况检索） */
content.innerHTML = `
<section class="hero3">
  <div class="hero3-grid">
    <div class="h3-left">
      <div class="kicker">校 通 识 课 · 3 学 分 · 48 学 时 · 2026 秋 · 面 向 人 文 社 科</div>
      <h1>欢迎来到<em>人工智能</em>导论</h1>
      <p class="sub">这不是一门"看懂"的课，是一门<b>"没法骗自己"</b>的课。右边这块画布里的神经网络此刻正在你的浏览器里<b>真实训练</b>——本课 ${totalDemos} 个演示个个如此：亲手运行每一种核心算法，<b>弄坏它、修好它</b>。</p>
      <div class="cta">
        <a class="btn" href="${P('modules', firstUnread.ch.module, firstUnread.pageId + '.html')}">${doneCount ? '继续：' + firstUnread.sec.title : '从第一节开始 →'}</a>
        <a class="btn ghost" href="${P('quiz', 'dashboard.html')}">📊 仪表盘</a>
        <a class="btn ghost" href="#demos">演示橱窗 ↓</a>
      </div>
      <div class="hero-stats">
        <div class="h-stat"><div class="n">${CHAPTERS.length}</div><div class="l">章 · ${secs.length} 节</div></div>
        <div class="h-stat"><div class="n">${totalDemos}+</div><div class="l">可运行演示</div></div>
        <div class="h-stat"><div class="n">7</div><div class="l">个 3D 场景</div></div>
        <div class="h-stat"><div class="n">205</div><div class="l">误解驱动题库</div></div>
        ${doneCount ? `<div class="h-stat"><div class="n" style="color:var(--accent)">${doneCount}<span style="font-size:13px;color:var(--muted)">/${secs.length}</span></div><div class="l">已读</div></div>` : ''}
      </div>
    </div>
    <div class="h3-right">
      <div class="live-lab">
        <div class="ll-head">
          <span class="ll-dot"></span><span class="ll-dot"></span><span class="ll-dot"></span>
          <b>THIS IS AI · 现场训练中</b>
          <span class="ll-epoch" id="llEpoch">epoch 0</span>
        </div>
        <canvas id="llCanvas"></canvas>
        <div class="ll-bar">
          <span class="ll-loss" id="llLoss">loss —</span>
          <span class="ll-tabs" id="llTabs"></span>
        </div>
        <div class="ll-cap">一个 2-8-8-2 神经网络正在学习当前形状 · 每帧三次全批梯度下降 · 点标签换数据试试</div>
      </div>
    </div>
  </div>
  <div class="peek-strip">
    ${PEeks.map(p => `<a class="peek-item" href="${p.u}"><span class="pi">${p.i}</span><span><span class="pt">${p.t}</span><br><span class="pd">${p.d}</span></span></a>`).join('')}
  </div>
</section>

<section id="map">
  <div class="band-head"><h2>课程地图</h2><span class="bh-sub">四大模块 · 建议按序学习，也可随时跳转</span></div>
  <div class="path-flow reveal">
    ${Object.entries(MODULES).map(([mid, m], i) => `
      <a class="path-step" style="--pc:var(--m-${mid})" href="${P('modules', mid, 'index.html')}">
        <span class="ps-num">${i + 1}</span><span class="ps-tag">${m.tag}</span>
        <div class="ps-name">${m.icon} ${m.name}</div><div class="ps-desc">${m.desc}</div>
      </a>`).join('')}
  </div>
  <div class="mod-cards reveal">
    ${Object.entries(MODULES).map(([mid, m]) => {
      const chs = CHAPTERS.filter(c => c.module === mid);
      return `<a class="mod-card" style="--mm:var(--m-${mid})" href="${P('modules', mid, 'index.html')}">
        <div class="mc-tag">${m.tag} · ${chs.length} 章 ${chs.reduce((a, c) => a + c.sections.length, 0)} 节</div>
        <h3>${m.icon} ${m.name}</h3>
        <div class="mc-desc">${chs.map(c => `<span style="white-space:nowrap;margin-right:10px">${c.num}·${c.title}</span>`).join('')}</div>
      </a>`;
    }).join('')}
  </div>
</section>

<section id="demos">
  <div class="band-head"><h2>演示橱窗</h2><span class="bh-sub">${totalDemos} 个交互演示 · 全部本地运行 · 点开即玩</span></div>
  <div class="demo-showcase reveal">
    ${SHOW.map(s => `<a class="show-card" style="--sc:${s.c}" href="${s.u}">
      <span class="sc-ico">${s.i}</span><span class="sc-t">${s.t}</span><span class="sc-d">${s.d}</span><span class="sc-b">${s.b}</span>
    </a>`).join('')}
  </div>
</section>

<section>
  <div class="band-head"><h2>这门课怎么"玩"</h2><span class="bh-sub">六个让理解可被检验的设计</span></div>
  <div class="feature-band reveal">
    <a class="feature-item" href="#demos"><div class="f-ico">🧪</div><div class="f-name">可运行实验室</div><div class="f-desc">核心算法在浏览器真实执行——每个实验室都有"故意弄坏"开关，亲眼看它崩坏，才懂每个部件为什么必要。</div></a>
    <a class="feature-item" href="#demos"><div class="f-ico">🧊</div><div class="f-name">3D 可视化</div><div class="f-desc">神经网络、损失曲面、词嵌入星系、Transformer 解剖……可旋转漫游的立体世界。</div></a>
    <a class="feature-item" href="${P('quiz', 'index.html')}"><div class="f-ico">🎯</div><div class="f-name">误解驱动题库</div><div class="f-desc">错误选项对应真实误解——选错时你会看到自己"错在哪"，错误本身成为教材。</div></a>
    <a class="feature-item" href="${P('quiz', 'review.html')}"><div class="f-ico">🔁</div><div class="f-name">间隔重复</div><div class="f-desc">答错的题按 1/2/4/8…天周期自动重现，直到真正记住。进度本地保存。</div></a>
    <a class="feature-item" href="${P('notes.html')}"><div class="f-ico">🖍️</div><div class="f-name">划线提问包</div><div class="f-desc">对任意文字划线：不懂/重要/存疑/深挖——一键生成提问包，粘给任意大模型。</div></a>
    <button type="button" class="feature-item" id="featureAiBtn"><div class="f-ico">🤖</div><div class="f-name">AI 课程助教</div><div class="f-desc">右下角随时唤起，配 Key 即可在线问答；不配也能用 FAQ 检索与提问包。</div></button>
  </div>
</section>

<section>
  <div class="band-head"><h2>我的进度</h2><span class="bh-sub">数据仅保存在本机浏览器</span></div>
  <div class="dash-grid reveal">
    <div class="stat-card"><div class="s-label">📖 已读小节</div><div class="s-value">${doneCount}<small> / ${secs.length}</small></div><div class="s-foot">${Math.round(doneCount / secs.length * 100)}% 完成</div></div>
    <div class="stat-card"><div class="s-label">✍️ 累计答题</div><div class="s-value">${stats.answered}</div><div class="s-foot">正确率 ${stats.answered ? Math.round(stats.correct / stats.answered * 100) : 0}%</div></div>
    <div class="stat-card"><div class="s-label">🔁 待复习</div><div class="s-value">${dueN}</div><div class="s-foot">${dueN ? '现在就去复习吧' : '暂无到期'}</div></div>
    <div class="stat-card"><div class="s-label">🗒️ 划线笔记</div><div class="s-value">${store.notes.all().length}</div><div class="s-foot"><a href="${P('notes.html')}">查看 / 导出 →</a></div></div>
  </div>
  ${dueN ? `<div class="quiz-entry"><div class="qe-ico">⏰</div><div class="qe-main"><div class="qe-title">你有 ${dueN} 道题到了复习时间</div><div class="qe-sub">间隔重复：现在复习，记忆效果最好</div></div><a class="btn" href="${P('quiz', 'review.html')}">开始复习</a></div>` : ''}
</section>

<footer class="site-footer" style="margin-top:60px">
  <span>《人工智能导论》通识课 · 2026 秋 · 课程网站 v3</span>
  <span><a href="${P('faq', 'index.html')}">答疑中心</a></span>
  <span><a href="${P('references', 'index.html')}">参考资料</a></span>
  <span><a href="${P('docs', '使用与部署说明.md')}" download>使用说明下载</a></span>
</footer>`;
scanReveal();
document.getElementById('featureAiBtn')?.addEventListener('click', () => document.getElementById('aiFab')?.click());

/* ================= Hero 现场 NN 实验室（真实训练） ================= */
(function liveLab() {
  const cv = document.getElementById('llCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const DATA = {
    '环带': (() => { const pts = []; for (let i = 0; i < 90; i++) { const a = i * 0.37, r1 = 0.16 + Math.random() * 0.06, r2 = 0.42 + Math.random() * 0.14; pts.push([Math.cos(a) * r1, Math.sin(a) * r1, 0]); pts.push([Math.cos(a) * r2, Math.sin(a) * r2, 1]); } return pts; })(),
    '异或': (() => { const pts = []; for (let i = 0; i < 100; i++) { const x = Math.random() * 1.4 - 0.7, y = Math.random() * 1.4 - 0.7; pts.push([x, y, x * y > 0 ? 1 : 0]); } return pts; })(),
    '双螺旋': (() => { const pts = []; for (let c = 0; c < 2; c++) for (let i = 0; i < 50; i++) { const t = i / 50 * 2.6 + c * 0.35, r = 0.12 + t * 0.17; pts.push([Math.cos(t + c * Math.PI) * r, Math.sin(t + c * Math.PI) * r, c]); } return pts; })(),
  };
  let cur = '双螺旋';
  let W1, B1, W2, B2, W3, B3, epoch = 0, loss = 1;
  const rnd = () => (Math.random() - 0.5);
  function init() {
    W1 = Array.from({ length: 8 }, () => Array.from({ length: 2 }, rnd)); B1 = new Array(8).fill(0);
    W2 = Array.from({ length: 8 }, () => Array.from({ length: 8 }, rnd)); B2 = new Array(8).fill(0);
    W3 = Array.from({ length: 2 }, () => Array.from({ length: 8 }, rnd)); B3 = new Array(2).fill(0);
    epoch = 0; loss = 1;
  }
  const relu = v => Math.max(0, v), drelu = v => v > 0 ? 1 : 0;
  function forward(x) {
    const h1 = W1.map((w, i) => relu(w[0] * x[0] + w[1] * x[1] + B1[i]));
    const h2 = W2.map((w, i) => relu(w.reduce((s, v, j) => s + v * h1[j], 0) + B2[i]));
    const o = W3.map(w => w.reduce((s, v, j) => s + v * h2[j], 0));
    const m = Math.max(...o), es = o.map(v => Math.exp(v - m)), sum = es.reduce((a, b) => a + b, 0);
    return { h1, h2, p: es.map(e => e / sum) };
  }
  function step() {
    const data = DATA[cur], n = data.length;
    let totLoss = 0;
    const gW1 = W1.map(r => r.map(() => 0)), gB1 = new Array(8).fill(0);
    const gW2 = W2.map(r => r.map(() => 0)), gB2 = new Array(8).fill(0);
    const gW3 = W3.map(r => r.map(() => 0)), gB3 = new Array(2).fill(0);
    for (const [x0, x1, y] of data) {
      const { h1, h2, p } = forward([x0, x1]);
      totLoss += -Math.log(Math.max(1e-9, p[y]));
      const d3 = p.map((pi, i) => pi - (i === y ? 1 : 0));
      const dh2 = new Array(8).fill(0);
      for (let i = 0; i < 2; i++) for (let j = 0; j < 8; j++) { gW3[i][j] += d3[i] * h2[j]; dh2[j] += d3[i] * W3[i][j]; }
      for (let i = 0; i < 2; i++) gB3[i] += d3[i];
      const dh2r = dh2.map((v, j) => v * drelu(h2[j]));
      const dh1 = new Array(8).fill(0);
      for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { gW2[i][j] += dh2r[i] * h1[j]; dh1[j] += dh2r[i] * W2[i][j]; }
      for (let i = 0; i < 8; i++) gB2[i] += dh2r[i];
      const dh1r = dh1.map((v, j) => v * drelu(h1[j]));
      for (let i = 0; i < 8; i++) { for (let j = 0; j < 2; j++) gW1[i][j] += dh1r[i] * (j ? x1 : x0); gB1[i] += dh1r[i]; }
    }
    const lr = 0.9 / n;
    const upd = (W, G) => W.forEach((r, i) => r.forEach((_, j) => r[j] -= lr * G[i][j]));
    upd(W1, gW1); upd(W2, gW2); upd(W3, gW3);
    B1.forEach((_, i) => B1[i] -= lr * gB1[i]); B2.forEach((_, i) => B2[i] -= lr * gB2[i]); B3.forEach((_, i) => B3[i] -= lr * gB3[i]);
    epoch++; loss = totLoss / n;
  }
  function paint() {
    const rect = cv.getBoundingClientRect();
    const w = Math.max(120, rect.width), h = Math.max(90, rect.height);
    if (cv.width !== Math.round(w * 2)) { cv.width = Math.round(w * 2); cv.height = Math.round(h * 2); }
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    const X = x => (x + 0.9) / 1.8 * w, Y = y => h - (y + 0.9) / 1.8 * h;
    const sp = 9;
    for (let px = 0; px < w; px += sp) for (let py = 0; py < h; py += sp) {
      const x = px / w * 1.8 - 0.9, y = (h - py) / h * 1.8 - 0.9;
      const { p } = forward([x, y]);
      ctx.fillStyle = p[1] > 0.5 ? 'rgba(15,118,110,.15)' : 'rgba(180,72,43,.12)';
      ctx.fillRect(px, py, sp + 1, sp + 1);
    }
    for (const [x, y, c] of DATA[cur]) {
      ctx.fillStyle = c ? '#0f766e' : '#b4482b';
      ctx.beginPath(); ctx.arc(X(x), Y(y), 2.4, 0, 7); ctx.fill();
    }
  }
  function loop() {
    for (let i = 0; i < 3; i++) step();
    paint();
    const ep = document.getElementById('llEpoch'), lo = document.getElementById('llLoss');
    if (ep) ep.textContent = 'epoch ' + epoch;
    if (lo) lo.textContent = 'loss ' + loss.toFixed(3) + (loss < 0.12 ? ' ✓ 已学会' : '');
    requestAnimationFrame(loop);
  }
  init();
  const tabs = document.getElementById('llTabs');
  Object.keys(DATA).forEach(k => {
    const b = document.createElement('button');
    b.textContent = k; b.className = k === cur ? 'on' : '';
    b.addEventListener('click', () => { cur = k; init(); tabs.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); });
    tabs.append(b);
  });
  requestAnimationFrame(loop);
})();
