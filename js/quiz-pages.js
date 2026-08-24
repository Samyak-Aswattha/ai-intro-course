/* ============================================================
   quiz-pages.js — 测评中心：练习 / 复习 / 错题本 / 仪表盘
   ============================================================ */
import './app.js';
import { CHAPTERS, findChapter, getAllQuiz } from './data.js';
import { P, $, $$, esc } from './app.js';
import * as store from './store.js';

const page = document.body.dataset.page;
const content = document.getElementById('content');

const TYPE_NAME = { single: '选择', multi: '多选', fill: '填空', judge: '判断', open: q => q.sub || '开放' };

/* ---------- 题卡渲染引擎 ---------- */
function qCard(item, idx) {
  const card = document.createElement('div');
  card.className = 'q-card';
  const typeLabel = typeof TYPE_NAME[item.type] === 'function' ? TYPE_NAME[item.type](item) : TYPE_NAME[item.type];
  const diff = '●'.repeat(item.diff || 1) + '○'.repeat(3 - (item.diff || 1));
  let inner = `<div class="q-head">
    <span class="q-no">Q${idx + 1} · ${item.id}</span>
    <span class="q-type">${typeLabel}题</span>
    <span class="q-diff"><i>${diff}</i></span>
    ${store.srs.get(item.id) ? `<span class="chip" title="间隔重复状态">${nextDueLabel(item.id)}</span>` : ''}
  </div>
  <div class="q-body">${esc(item.q).replace(/\n/g, '<br>')}</div>`;

  if (item.type === 'single') {
    inner += `<div class="q-opts">` + item.opts.map((o, i) => `
      <div class="q-opt" data-i="${i}">
        <span class="o-key">${'ABCD'[i]}</span><span>${esc(o)}</span>
        ${item.mis && item.mis['ABCD'[i]] ? `<span class="o-mis" hidden>${esc(item.mis['ABCD'[i]])}</span>` : ''}
      </div>`).join('') + `</div>`;
  } else if (item.type === 'judge') {
    inner += `<div class="q-opts">
      <div class="q-opt" data-i="0"><span class="o-key">对</span><span>正确</span></div>
      <div class="q-opt" data-i="1"><span class="o-key">错</span><span>错误</span></div>
    </div>`;
  } else if (item.type === 'fill') {
    inner += `<div class="q-opts" style="grid-template-columns:1fr">
      <input class="q-input" placeholder="填入答案（多空用逗号分隔）">
      <button class="btn sm check-btn">检查</button></div>`;
  } else if (item.type === 'open') {
    inner += `<textarea class="q-answer" placeholder="先写下你自己的答案——哪怕只是几行提纲，写出来才算真的想过一遍，再往下看参考答案。">${esc(store.draft.get(item.id))}</textarea>
    <div class="q-hints">
      <button class="hint-btn">💡 提示（${(item.hints || []).length} 级）</button>
      <div class="hint-body" hidden></div>
    </div>
    <details class="ref-answer"><summary>📖 展开参考答案（先自己作答再看）</summary>
      <div class="ra-body">${esc(item.ref || '').replace(/\n/g, '<br>')}</div>
      <div class="self-rate">
        <button data-rate="good">😊 我答得不错</button>
        <button data-rate="bad">😅 需要复习</button>
      </div></details>`;
  }
  card.innerHTML = inner;
  wire(card, item);
  return card;
}

function nextDueLabel(id) {
  const r = store.srs.get(id);
  const days = Math.ceil((r.due - Date.now()) / 864e5);
  if (days <= 0) return '🔁 待复习';
  return `⏳ ${days} 天后复习`;
}

function wire(card, item) {
  const done = () => card.dataset.done === '1';
  const finish = (correct, explainHtml) => {
    card.dataset.done = '1';
    store.srs.answer(item.id, correct);
    store.stats.record(item.ch, correct);
    if (correct) store.wrongbook.remove(item.id);
    else store.wrongbook.add(item.id);
    const ex = document.createElement('div');
    ex.className = 'q-explain ' + (correct ? 'ok' : 'err');
    ex.innerHTML = (correct ? '<b>✅ 答对了。</b> ' : '<b>❌ 答错了。</b> ') + explainHtml +
      `<div style="margin-top:6px;font-size:12px;color:var(--muted)">${correct ? '已安排 ' + nextDueLabel(item.id) : '明天将进入复习队列'}</div>`;
    card.append(ex);
    document.dispatchEvent(new CustomEvent('quiz-progress'));
  };

  if (item.type === 'single' || item.type === 'judge') {
    const opts = $$('.q-opt', card);
    opts.forEach(opt => opt.addEventListener('click', () => {
      if (done()) return;
      const i = opt.dataset.i;
      const ansIdx = item.type === 'judge' ? (item.answer === '对' ? 0 : 1) : 'ABCD'.indexOf(item.answer);
      const correct = +i === ansIdx;
      opts.forEach((o, k) => {
        o.style.pointerEvents = 'none';
        if (k === ansIdx) o.classList.add('correct');
        else if (k === +i) o.classList.add(o.classList.contains('correct') ? '' : 'wrong');
        else o.classList.add('dimmed');
        const mis = o.querySelector('.o-mis');
        if (mis && k === +i && !correct) mis.hidden = false;
      });
      finish(correct, `<b>答案：${item.type === 'judge' ? (item.answer === '对' ? '对' : '错') : item.answer}</b>　${esc(item.explain || '')}`);
    }));
  } else if (item.type === 'fill') {
    const input = $('input', card), btn = $('.check-btn', card);
    const check = () => {
      if (done()) return;
      const user = input.value.trim().replace(/[，、\s]+/g, ',');
      const std = String(item.answer).trim().replace(/[，、\s]+/g, ',');
      const ua = user.split(',').map(s => s.trim()).filter(Boolean);
      const sa = std.split(',').map(s => s.trim()).filter(Boolean);
      const correct = ua.length === sa.length && ua.every((u, i) => u === sa[i]);
      input.disabled = true; btn.disabled = true;
      finish(correct, `<b>答案：${esc(item.answer)}</b>　${esc(item.explain || '')}`);
    };
    btn.addEventListener('click', check);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
  } else if (item.type === 'open') {
    const answerBox = $('.q-answer', card);
    if (answerBox) {
      let saveT;
      answerBox.addEventListener('input', () => {
        clearTimeout(saveT);
        saveT = setTimeout(() => store.draft.set(item.id, answerBox.value.trim()), 400);
      });
    }
    const hintBtn = $('.hint-btn', card), hintBody = $('.hint-body', card);
    let hintLv = 0;
    hintBtn.addEventListener('click', () => {
      if (!(item.hints || []).length) { hintBody.hidden = false; hintBody.textContent = '本题没有分级提示，直接看参考答案自评吧。'; return; }
      if (hintLv < item.hints.length) {
        hintBody.hidden = false;
        hintBody.innerHTML = (hintLv > 0 ? hintBody.innerHTML + '<hr style="border:0;border-top:1px dashed var(--border);margin:8px 0">' : '') +
          `<b>提示 ${hintLv + 1}/${item.hints.length}：</b>${esc(item.hints[hintLv])}`;
        hintLv++;
        if (hintLv >= item.hints.length) hintBtn.textContent = '💡 提示已全部展开';
      }
    });
    $$('.self-rate button', card).forEach(b => b.addEventListener('click', () => {
      if (done()) return;
      const good = b.dataset.rate === 'good';
      b.classList.add(good ? 'on-good' : 'on-bad');
      finish(good, good ? '已记为掌握。' : '已加入复习队列——间隔重复会帮你记住它。');
    }));
  }
}

/* ---------- 页面：练习 ---------- */
async function pagePractice() {
  const chId = new URLSearchParams(location.search).get('ch');
  const sec = new URLSearchParams(location.search).get('sec');
  const ch = chId && findChapter(chId);
  const all = await getAllQuiz();
  let items = ch ? all.filter(q => q.ch === ch.id) : all;
  if (sec) {
    /* 优先展示与小节标签匹配的（题库无小节字段时保持整章顺序） */
    items = shuffle(items);
  } else if (ch) {
    items = shuffle(items);
  } else {
    items = shuffle(items);
  }
  document.title = `${ch ? ch.num + ' ' + ch.title : '综合练习'} · 测评中心`;
  document.body.dataset.module = ch ? ch.module : 'foundations';

  const head = document.createElement('header');
  head.className = 'page-head';
  head.innerHTML = `<div class="ch-tag">${ch ? ch.num + ' · ' + ch.title : '随机综合'}</div>
    <h1>${ch ? esc(ch.title) + ' · 章节练习' : '综合练习'}</h1>
    <p class="lede">${items.length} 题（已打乱顺序）：选择/判断即时判分，填空精确匹配，开放题先自答再看参考答案。答错自动进入<b>间隔重复</b>队列。</p>`;
  content.append(head);

  const prog = document.createElement('div');
  prog.className = 'gauge';
  prog.innerHTML = '<div id="pfill" style="width:0%"></div>';
  content.append(prog);

  const list = document.createElement('div');
  content.append(list);
  let doneN = 0;
  document.addEventListener('quiz-progress', () => {
    doneN = $$('[data-done="1"]', list).length;
    $('#pfill').style.width = (doneN / items.length * 100) + '%';
  });

  items.forEach((it, i) => list.append(qCard(it, i)));

  const foot = document.createElement('div');
  foot.className = 'quiz-entry';
  foot.innerHTML = `<div class="qe-ico">🔁</div><div class="qe-main"><div class="qe-title">做完了？</div><div class="qe-sub">答错的题会在 1/3/7/14 天后自动重现</div></div>
    <a class="btn" href="${P('quiz', 'dashboard.html')}">查看学习仪表盘</a>`;
  content.append(foot);
}

/* ---------- 页面：复习 ---------- */
async function pageReview() {
  const all = await getAllQuiz();
  const dueIds = new Set(store.srs.dueList());
  const items = shuffle(all.filter(q => dueIds.has(q.id)));
  document.title = '间隔复习 · 测评中心';
  const head = document.createElement('header');
  head.className = 'page-head';
  head.innerHTML = `<div class="ch-tag">间隔重复</div><h1>今日复习队列</h1>
    <p class="lede">${items.length ? `${items.length} 道题到了最佳复习时间——现在复习，记忆巩固效果最好。` : '当前没有到期的复习题。去章节练习里答几道题吧！'}</p>`;
  content.append(head);
  const list = document.createElement('div');
  content.append(list);
  items.forEach((it, i) => list.append(qCard(it, i)));
  if (items.length) {
    const tip = document.createElement('div');
    tip.className = 'quiz-entry';
    tip.innerHTML = `<div class="qe-ico">🧠</div><div class="qe-main"><div class="qe-title">为什么是现在？</div><div class="qe-sub">简化 SM-2 算法：答对间隔翻倍（1→2→4→…天），答错重置。在遗忘临界点复习，效率最高。</div></div>`;
    content.append(tip);
  } else {
    const go = document.createElement('div');
    go.className = 'quiz-entry';
    go.innerHTML = `<div class="qe-ico">✍️</div><div class="qe-main"><div class="qe-title">去答点新题</div><div class="qe-sub">新答的题会进入间隔重复系统</div></div><a class="btn" href="${P('quiz', 'practice.html')}">综合练习</a>`;
    content.append(go);
  }
}

/* ---------- 页面：错题本 ---------- */
async function pageWrong() {
  const all = await getAllQuiz();
  const wrongIds = new Set(store.wrongbook.ids());
  const items = all.filter(q => wrongIds.has(q.id));
  document.title = '错题本 · 测评中心';
  const head = document.createElement('header');
  head.className = 'page-head';
  head.innerHTML = `<div class="ch-tag">错题本</div><h1>我的错题</h1>
    <p class="lede">${items.length ? `${items.length} 道错题。重做答对即移出错题本。` : '暂无错题——要么你很强，要么你还没开始做题 😏'}</p>`;
  content.append(head);
  const list = document.createElement('div');
  content.append(list);
  const byCh = {};
  items.forEach(it => (byCh[it.ch] = byCh[it.ch] || []).push(it));
  for (const [chId, arr] of Object.entries(byCh)) {
    const ch = findChapter(chId);
    const h = document.createElement('h2');
    h.style.cssText = 'font-size:18px;margin:26px 0 12px';
    h.innerHTML = `${ch ? esc(ch.num + ' ' + ch.title) : chId} <span class="small text-muted">（${arr.length}）</span>`;
    content.append(h);
    arr.forEach((it, i) => list.append(qCard(it, i)));
  }
  content.append(list);
}

/* ---------- 页面：仪表盘 ---------- */
async function pageDashboard() {
  const all = await getAllQuiz();
  document.title = '学习仪表盘 · 测评中心';
  const s = store.stats.all();
  const secs = CHAPTERS.flatMap(c => c.sections.map(x => ({ c, x, pid: `ch${c.id}-${x.id}` })));
  const readN = secs.filter(x => store.progress.isDone(x.pid)).length;
  const dueN = store.srs.dueCount();
  const mastered = store.srs.masteredCount();

  const head = document.createElement('header');
  head.className = 'page-head';
  head.innerHTML = `<div class="ch-tag">数据看板</div><h1>学习仪表盘</h1><p class="lede">所有数据只存在你的浏览器里——换设备不会同步，清除浏览器数据会丢失。</p>`;
  content.append(head);

  const grid = document.createElement('div');
  grid.className = 'dash-grid';
  grid.innerHTML = `
    <div class="stat-card"><div class="s-label">📖 阅读进度</div><div class="s-value">${readN}<small> / ${secs.length} 节</small></div><div class="s-foot">${Math.round(readN / secs.length * 100)}% 完成</div></div>
    <div class="stat-card"><div class="s-label">✍️ 累计答题</div><div class="s-value">${s.answered}</div><div class="s-foot">正确率 ${s.answered ? Math.round(s.correct / s.answered * 100) : 0}%</div></div>
    <div class="stat-card"><div class="s-label">🔁 待复习</div><div class="s-value">${dueN}</div><div class="s-foot">${dueN ? '<a href="' + P('quiz', 'review.html') + '">立即复习 →</a>' : '暂无到期'}</div></div>
    <div class="stat-card"><div class="s-label">🏆 已掌握</div><div class="s-value">${mastered}</div><div class="s-foot">间隔 ≥7 天视为掌握</div></div>
    <div class="stat-card"><div class="s-label">📕 错题本</div><div class="s-value">${store.wrongbook.ids().length}</div><div class="s-foot"><a href="${P('quiz', 'wrong.html')}">去重做 →</a></div></div>
    <div class="stat-card"><div class="s-label">🗒️ 划线笔记</div><div class="s-value">${store.notes.all().length}</div><div class="s-foot"><a href="${P('notes.html')}">查看 →</a></div></div>`;
  content.append(grid);

  /* 章节热力 */
  const h2 = document.createElement('div');
  h2.className = 'band-head';
  h2.innerHTML = '<h2>各章掌握度</h2><span class="bh-sub">按答题正确率</span>';
  content.append(h2);
  const heat = document.createElement('div');
  heat.className = 'heat-chapters';
  const rows = CHAPTERS.map(ch => {
    const st = s.byCh[ch.id] || { a: 0, c: 0 };
    const pct = st.a ? Math.round(st.c / st.a * 100) : 0;
    const total = all.filter(q => q.ch === ch.id).length;
    return `<div class="heat-row">
      <span class="h-label">${ch.num} ${esc(ch.title)}</span>
      <div class="h-bar"><div class="h-fill" style="width:${st.a ? pct : 0}%"></div></div>
      <span class="h-num">${st.a ? pct + '%' : '未测'} <span style="opacity:.6">(${st.a}/${total}题)</span></span>
    </div>`;
  }).join('');
  heat.innerHTML = rows + `<div style="margin-top:14px"><button class="btn sm ghost" id="resetAll" style="color:var(--err);border-color:var(--err)">清空全部学习数据</button></div>`;
  content.append(heat);
  $('#resetAll').addEventListener('click', () => {
    if (confirm('确定清空所有进度、错题、复习记录与笔记？不可恢复。')) {
      Object.keys(localStorage).filter(k => k.startsWith('aic:')).forEach(k => localStorage.removeItem(k));
      location.reload();
    }
  });
}

/* ---------- 页面：测评中心首页 ---------- */
async function pageHome() {
  document.title = '测评中心 · 人工智能导论';
  const all = await getAllQuiz();
  const dueN = store.srs.dueCount();
  const head = document.createElement('header');
  head.className = 'page-head';
  head.innerHTML = `<div class="ch-tag">测评中心</div><h1>测一测，别骗自己</h1>
    <p class="lede">题库源自课程题库并按章节重组：<b>错误选项对应真实误解</b>——选错时你会看到自己错在哪；答错的题进入<b>间隔重复</b>（1/3/7/14 天重现），直到真正记住。</p>`;
  content.append(head);

  const quick = document.createElement('div');
  quick.className = 'dash-grid';
  quick.innerHTML = `
    <a class="stat-card" href="${P('quiz', 'review.html')}" style="text-decoration:none"><div class="s-label">🔁 间隔复习</div><div class="s-value">${dueN}</div><div class="s-foot">今日到期 →</div></a>
    <a class="stat-card" href="${P('quiz', 'wrong.html')}" style="text-decoration:none"><div class="s-label">📕 错题本</div><div class="s-value">${store.wrongbook.ids().length}</div><div class="s-foot">重做移出 →</div></a>
    <a class="stat-card" href="${P('quiz', 'dashboard.html')}" style="text-decoration:none"><div class="s-label">📊 仪表盘</div><div class="s-value" style="font-size:22px">学习全景</div><div class="s-foot">进度/掌握度 →</div></a>
    <a class="stat-card" href="${P('quiz', 'practice.html')}" style="text-decoration:none"><div class="s-label">🎲 综合练习</div><div class="s-value">${all.length}</div><div class="s-foot">全库随机 →</div></a>`;
  content.append(quick);

  const h2 = document.createElement('div');
  h2.className = 'band-head';
  h2.innerHTML = '<h2>按章节练习</h2><span class="bh-sub">题目已按新课程结构重新分组</span>';
  content.append(h2);
  const grid = document.createElement('div');
  grid.className = 'sec-grid';
  const CH_ORDER = ['01', '02', '03', '04', '05', '06', '07', '08', '09'];
  const CH_TAG = { '01': '🧭', '02': '📜', '03': '📊', '04': '🧠', '05': '🔬', '06': '🚀', '07': '⚖️', '08': '⚔️', '09': '🛠️' };
  CH_ORDER.forEach(id => {
    const ch = findChapter(id);
    const n = all.filter(q => q.ch === id).length;
    const a = document.createElement('a');
    a.className = 'sec-card';
    a.href = P('quiz', 'practice.html') + '?ch=' + id;
    a.innerHTML = `<div class="sc-num" style="--mm:var(--m-${ch.module})">${CH_TAG[id]} 第${+id}章</div>
      <div class="sc-title">${esc(ch.title)}</div><div class="sc-desc">${n} 题 · 即时判分 · 误解解析</div>`;
    content.append;
    grid.append(a);
  });
  content.append(grid);
}

function shuffle(a) {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- 路由 ---------- */
if (page === 'quiz-home') pageHome();
else if (page === 'quiz-practice') pagePractice();
else if (page === 'quiz-review') pageReview();
else if (page === 'quiz-wrong') pageWrong();
else if (page === 'quiz-dashboard') pageDashboard();
