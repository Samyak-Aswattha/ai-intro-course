/* ============================================================
   faq-page.js — 答疑中心
   ============================================================ */
import './app.js';
import { getFaq } from './data.js';
import { P, $, $$, esc } from './app.js';

document.title = '答疑中心 · 人工智能导论';
const content = document.getElementById('content');

(async function () {
  const faq = await getFaq();
  const params = new URLSearchParams(location.search);
  const initQ = params.get('q') || '';

  const head = document.createElement('header');
  head.className = 'page-head';
  head.innerHTML = `<div class="ch-tag">答疑中心</div><h1>问之前，先搜一搜</h1>
    <p class="lede">整理自课程记录与历年高频问题。找不到答案？右下角 <b>AI 课程助教</b> 随时在线（配置 Key 后），或在任意小节页<b>划线生成提问包</b>粘给任何大模型。</p>`;
  content.append(head);

  /* 搜索框 */
  const search = document.createElement('div');
  search.style.cssText = 'margin:10px 0 6px';
  search.innerHTML = `<input class="q-input" id="fq" placeholder="🔍 搜索问题关键词，如：过拟合 / 论文 / 本地部署…" style="padding:12px 18px;border-radius:24px;font-size:15px" value="${esc(initQ)}">`;
  content.append(search);

  const tip = document.createElement('div');
  tip.className = 'small text-muted';
  tip.style.margin = '4px 0 10px';
  content.append(tip);

  const box = document.createElement('div');
  content.append(box);

  function hl(t, q) {
    if (!q) return esc(t);
    const i = t.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return esc(t);
    return esc(t.slice(0, i)) + '<em style="color:var(--accent);font-style:normal;background:var(--accent-soft)">' + esc(t.slice(i, i + q.length)) + '</em>' + esc(t.slice(i + q.length));
  }

  function render(q) {
    q = (q || '').trim();
    let total = 0;
    box.innerHTML = '';
    faq.forEach(cat => {
      const hits = cat.items.filter(f => !q || (f.q + f.a).toLowerCase().includes(q.toLowerCase()));
      total += hits.length;
      if (!hits.length) return;
      const sec = document.createElement('div');
      sec.className = 'faq-cat';
      sec.innerHTML = `<h2>${esc(cat.name)} <span class="small text-muted">（${hits.length}）</span></h2>` +
        hits.map(f => `<details><summary><span class="q-ico">Q</span>${hl(f.q, q)}<span class="arr">▶</span></summary><div class="a-body">${hl(f.a, q)}</div></details>`).join('');
      box.append(sec);
    });
    tip.textContent = q ? `找到 ${total} 条与「${q}」相关的问答` : `共 ${faq.reduce((a, c) => a + c.items.length, 0)} 条常见问题`;
    if (q && !total) box.innerHTML = `<div class="ai-empty" style="padding:50px"><div class="big">🤷</div>没有找到「${esc(q)}」的现成答案。<br>试试右下角 <b>AI 助教</b>，或换一组关键词。</div>`;
  }
  $('#fq').addEventListener('input', e => render(e.target.value));
  render(initQ);
})();
