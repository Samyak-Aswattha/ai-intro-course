/* ============================================================
   notes-page.js — 我的笔记（划线汇总 / 筛选 / 导出 Markdown）
   ============================================================ */
import './app.js';
import * as store from './store.js';
import { P, esc, scanReveal } from './app.js';

document.title = '我的笔记 · 人工智能导论';
const content = document.getElementById('content');
const INTENT = { confused: ['❓ 不懂', 'hl-confused'], important: ['⭐ 重要', 'hl-important'], doubt: ['⚠️ 存疑', 'hl-doubt'], dig: ['🔎 深挖', 'hl-doubt'] };

function render(filter = 'all') {
  const list = store.notes.all().filter(n => filter === 'all' || n.intent === filter)
    .sort((a, b) => b.ts - a.ts);
  content.innerHTML = `
  <header class="page-head">
    <div class="ch-tag">学习痕迹</div>
    <h1>🗒️ 我的笔记</h1>
    <p class="lede">所有划线与批注都保存在本机。可以按类型筛选、生成提问包、或整体导出为 Markdown（Obsidian / Notion 可直接导入）。</p>
  </header>
  <div class="flex reveal" style="gap:8px;flex-wrap:wrap">
    ${['all', ...Object.keys(INTENT)].map(k => `<button class="btn sm ${k === filter ? '' : 'ghost'}" data-f="${k}">${k === 'all' ? '全部 ' + store.notes.all().length : INTENT[k][0] + ' ' + store.notes.all().filter(n => n.intent === k).length}</button>`).join('')}
    <span style="flex:1"></span>
    <button class="btn sm ghost" id="exportMd">⬇️ 导出 Markdown</button>
    <button class="btn sm ghost" id="clearAll" style="color:var(--err);border-color:var(--err)">清空全部</button>
  </div>
  <div style="margin-top:22px">
  ${list.length ? list.map(n => `
    <div style="border:1px solid var(--border);border-radius:14px;background:var(--surface);padding:16px 20px;margin-bottom:12px">
      <div class="flex" style="gap:8px">
        <span class="chip">${INTENT[n.intent]?.[0] || n.intent}</span>
        <span class="small text-muted">${esc(n.pageTitle)} · ${new Date(n.ts).toLocaleString('zh-CN')}</span>
        <span style="flex:1"></span>
        <button class="btn sm ghost" data-pk="${n.id}">🎁 提问包</button>
        <button class="btn sm ghost" style="color:var(--err)" data-del="${n.id}">删除</button>
      </div>
      <div style="margin:10px 0 0;padding:10px 14px;background:var(--bg-soft);border-left:3px solid var(--mod,var(--accent));border-radius:0 8px 8px 0;font-size:14px;line-height:1.8">「${esc(n.text)}」</div>
      ${n.note ? `<div class="small" style="margin-top:8px;color:var(--text-2)">批注：${esc(n.note)}</div>` : ''}
    </div>`).join('') : '<div class="ai-empty" style="padding:60px"><div class="big">🗒️</div>还没有划线笔记。<br>去任意小节页<b>选中一段文字</b>，试试「不懂 / 重要 / 存疑 / 深挖」。<br><br><a class="btn" href="' + P('modules', 'intro', 'ch01-what-is-intelligence.html') + '">从第一节开始</a></div>'}
  </div>`;

  content.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => render(b.dataset.f)));
  const md = store.notes.exportMarkdown();
  const ex = content.querySelector('#exportMd');
  if (ex) ex.addEventListener('click', () => {
    if (!md) { alert('还没有笔记可导出'); return; }
    const blob = new Blob([md], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '人工智能导论-学习笔记.md';
    a.click();
  });
  content.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => { store.notes.remove(b.dataset.del); render(filter); }));
  content.querySelectorAll('[data-pk]').forEach(b => b.addEventListener('click', () => {
    const n = store.notes.all().find(x => x.id === b.dataset.pk);
    if (n) openQuestionPack(n);
  }));
  const ca = content.querySelector('#clearAll');
  if (ca) ca.addEventListener('click', () => {
    if (confirm('确定清空全部笔记？此操作不可恢复。')) { store.notes.update; localStorage.removeItem('aic:notes'); render(filter); }
  });
  scanReveal();
}
render();

/* 复用 app.js 的提问包（通过事件桥接） */
function openQuestionPack(note) {
  document.dispatchEvent(new CustomEvent('open-pack', { detail: note }));
}
