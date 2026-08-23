/* ============================================================
   module-page.js — 模块首页
   ============================================================ */
import './app.js';
import { MODULES, CHAPTERS } from './data.js';
import { P, scanReveal } from './app.js';
import * as store from './store.js';

const mid = (document.body.dataset.page || '').replace(/^module:/, '') || 'foundations';
const m = MODULES[mid];
document.body.dataset.module = mid;
document.title = `${m.tag} · 人工智能导论`;

const content = document.getElementById('content');
const chs = CHAPTERS.filter(c => c.module === mid);
const secs = chs.flatMap(c => c.sections.map(s => ({ ch: c, sec: s, pid: `ch${c.id}-${s.id}` })));
const doneCount = secs.filter(x => store.progress.isDone(x.pid)).length;

content.innerHTML = `
<header class="page-head reveal">
  <div class="ch-tag">${m.tag}</div>
  <h1>${m.icon} ${m.name}</h1>
  <p class="lede">${m.desc}</p>
</header>
<div class="dash-grid reveal" style="margin-top:0">
  <div class="stat-card"><div class="s-label">📖 小节</div><div class="s-value">${secs.length}</div></div>
  <div class="stat-card"><div class="s-label">✅ 已读</div><div class="s-value">${doneCount}<small> / ${secs.length}</small></div></div>
  <div class="stat-card"><div class="s-label">⏱️ 学时</div><div class="s-value">${chs.reduce((a, c) => a + c.hours, 0)}</div></div>
</div>
${chs.map(ch => `
  <section>
    <div class="band-head"><h2>${ch.num} · ${ch.title}</h2><span class="bh-sub">${ch.hours} 学时</span></div>
    <p class="text-muted" style="margin:4px 0 14px">${ch.brief}</p>
    <div class="sec-grid">
      ${ch.sections.map((sec, i) => {
        const pid = `ch${ch.id}-${sec.id}`;
        const done = store.progress.isDone(pid);
        return `<a class="sec-card" href="${P('modules', mid, pid + '.html')}">
          <div class="sc-num">${ch.id}.${i + 1}${done ? ' ✓ 已读' : ''}</div>
          <div class="sc-title">${sec.title}</div><div class="sc-desc">${sec.desc}</div>
          ${sec.demos?.length ? `<div class="sc-demos">${sec.demos.map(d => `<span class="d-tag">🧪 ${d}</span>`).join('')}</div>` : ''}
        </a>`;
      }).join('')}
    </div>
    <div class="quiz-entry"><div class="qe-ico">✍️</div>
      <div class="qe-main"><div class="qe-title">第${ch.id.replace(/^0/, '')}章整章测评</div><div class="qe-sub">即时判分 · 误解解析 · 间隔重复</div></div>
      <a class="btn" href="${P('quiz', 'practice.html')}?ch=${ch.id}">去练习</a></div>
  </section>`).join('')}
<footer class="site-footer"><span>《人工智能导论》通识课</span></footer>`;
scanReveal();
