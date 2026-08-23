/* ============================================================
   app.js — 全站应用外壳：顶栏 / 侧边栏 / 搜索 / 主题 /
   划线笔记与提问包 / AI 答疑面板 / 灯箱 / 阅读进度
   每个页面以 <script type="module" src="…/js/app.js"></script> 引入
   ============================================================ */
import { MODULES, CHAPTERS, findSection, neighbors } from './data.js';
import * as store from './store.js';

/* ---------- 根路径（app.js 恒位于 <root>/js/） ---------- */
const ROOT = new URL('../', import.meta.url).href;
const P = (...seg) => ROOT + seg.join('/');

/* ---------- 主题 ---------- */
document.documentElement.dataset.theme = store.theme.get();

/* ---------- 工具 ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

/* ============================================================
   1. 外壳构建
   ============================================================ */
function buildShell() {
  const pageId = document.body.dataset.page || '';
  const mod = document.body.dataset.module || 'foundations';

  /* 顶栏 */
  const topbar = document.createElement('header');
  topbar.className = 'topbar';
  topbar.innerHTML = `
    <button class="icon-btn menu-btn" id="menuBtn" title="目录">☰</button>
    <a class="brand" href="${P('index.html')}"><span class="logo">智</span><span class="b-t">人工智能导论</span><span style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:var(--accent);border:1px solid var(--accent);border-radius:8px;padding:0 6px;margin-left:2px">v2.1</span></a>
    <nav class="crumbs" id="crumbs"></nav>
    <div class="topbar-actions">
      <button class="searchbox" id="searchBtn">🔍 搜索课程…<kbd>⌘K</kbd></button>
      <a class="icon-btn" href="${P('notes.html')}" title="我的笔记">🗒️</a>
      <button class="icon-btn" id="themeBtn" title="切换深浅主题">🌙</button>
    </div>`;
  document.body.prepend(topbar);

  /* 面包屑 */
  const crumbs = $('#crumbs');
  const found = findSection(pageId);
  let crumbHtml = `<a href="${P('index.html')}">首页</a>`;
  if (found) {
    const m = MODULES[found.ch.module];
    crumbHtml += `<span class="sep">/</span><a href="${P('modules', found.ch.module, 'index.html')}">${m.name}</a>
      <span class="sep">/</span><a href="${P('modules', found.ch.module, 'ch' + found.ch.id + '.html')}">${found.ch.num} ${found.ch.title}</a>
      <span class="sep">/</span><span>${esc(found.sec.title)}</span>`;
  } else {
    const extra = document.body.dataset.crumb;
    if (extra) extra.split('|').forEach((x, i) => crumbHtml += `<span class="sep">/</span>${i === 0 && document.body.dataset.crumbLink ? `<a href="${esc(document.body.dataset.crumbLink)}">${esc(x)}</a>` : `<span>${esc(x)}</span>`}`);
  }
  crumbs.innerHTML = crumbHtml;

  /* 侧边栏 */
  const sb = document.createElement('aside');
  sb.className = 'sidebar';
  sb.id = 'sidebar';
  let sbHtml = '';
  for (const [mid, m] of Object.entries(MODULES)) {
    sbHtml += `<div class="mod-group" style="--mm:var(--m-${mid})"><div class="mod-head"><span class="dot"></span>${m.tag}</div>`;
    CHAPTERS.filter(c => c.module === mid).forEach(ch => {
      const open = found ? found.ch.id === ch.id : (pageId === `ch${ch.id}` ? true : false);
      sbHtml += `<details class="ch" ${open ? 'open' : ''} style="--mm:var(--m-${mid})">
        <summary><span class="ch-num">${ch.id}</span>${esc(ch.title)}<span class="arrow">▶</span></summary>
        <div class="sec-list">`;
      ch.sections.forEach(sec => {
        const pid = `ch${ch.id}-${sec.id}`;
        const active = pid === pageId;
        const done = store.progress.isDone(pid);
        sbHtml += `<a class="sec-link ${active ? 'active' : ''}" href="${P('modules', mid, pid + '.html')}" data-pid="${pid}">${esc(sec.title)}${done ? '<span class="done-mark">✓</span>' : ''}</a>`;
      });
      sbHtml += `</div></details>`;
    });
    sbHtml += `</div>`;
  }
  sbHtml += `<div class="mod-group">
    <div class="sec-list" style="padding-left:8px">
      <a class="sec-link" href="${P('quiz', 'index.html')}">📊 测评中心</a>
      <a class="sec-link" href="${P('faq', 'index.html')}">💬 答疑中心</a>
      <a class="sec-link" href="${P('references', 'index.html')}">📚 参考资料</a>
      <a class="sec-link" href="${P('notes.html')}">🗒️ 我的笔记</a>
    </div></div>`;
  sb.innerHTML = sbHtml;
  document.body.append(sb);

  const mask = document.createElement('div');
  mask.className = 'sb-mask';
  document.body.append(mask);
  $('#menuBtn')?.addEventListener('click', () => { sb.classList.add('open'); mask.classList.add('show'); });
  mask.addEventListener('click', () => { sb.classList.remove('open'); mask.classList.remove('show'); });

  /* 主题按钮 */
  $('#searchBtn')?.addEventListener('click', openSearch);
  const tb = $('#themeBtn');
  const syncThemeBtn = () => tb.textContent = store.theme.get() === 'dark' ? '☀️' : '🌙';
  syncThemeBtn();
  tb.addEventListener('click', () => {
    document.documentElement.dataset.theme = store.theme.toggle();
    syncThemeBtn();
    document.dispatchEvent(new CustomEvent('themechange'));
  });

  /* 返回顶部 + 阅读进度条 */
  const bar = document.createElement('div'); bar.className = 'read-progress'; document.body.append(bar);
  const top = document.createElement('button'); top.className = 'to-top'; top.textContent = '↑'; top.title = '回到顶部';
  document.body.append(top);
  top.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  addEventListener('scroll', () => {
    const h = document.documentElement;
    const pct = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    bar.style.width = (pct * 100).toFixed(1) + '%';
    top.classList.toggle('show', h.scrollTop > 500);
  }, { passive: true });
}

/* ============================================================
   2. 搜索
   ============================================================ */
const searchState = { index: null, sel: 0, results: [] };

async function buildSearchIndex() {
  if (searchState.index) return searchState.index;
  const idx = [];
  CHAPTERS.forEach(ch => {
    const mid = ch.module;
    idx.push({ t: `${ch.num} ${ch.title}`, sub: ch.brief, url: P('modules', mid, `ch${ch.id}.html`), ico: '📖', w: 6, body: ch.title + ch.brief });
    ch.sections.forEach(sec => {
      idx.push({
        t: sec.title, sub: `${ch.num} ${ch.title} · ${sec.desc}`,
        url: P('modules', mid, `ch${ch.id}-${sec.id}.html`), ico: '📄', w: 5,
        body: sec.title + ' ' + sec.desc, chId: ch.id
      });
    });
  });
  /* FAQ 与概念正文懒加载 */
  try {
    const faq = await store0_getFaq();
    faq.forEach(cat => cat.items.forEach(f => {
      idx.push({ t: f.q, sub: `答疑 · ${cat.name}`, url: P('faq', 'index.html') + '?q=' + encodeURIComponent(f.q.slice(0, 20)), ico: '💬', w: 3, body: f.q + ' ' + f.a });
    }));
  } catch { /* faq 数据尚未就绪 */ }
  try {
    for (const ch of CHAPTERS) {
      const concept = await getConceptSafe(ch.id);
      if (!concept) continue;
      ch.sections.forEach(sec => {
        const blocks = (concept.sections?.[sec.id]?.blocks) || [];
        const txt = blocks.map(b => typeof b.text === 'string' ? b.text : '').join(' ').replace(/[#*`>]/g, '');
        if (txt) {
          const hit = idx.find(x => x.chId === ch.id && x.t === sec.title);
          if (hit) hit.body += ' ' + txt.slice(0, 3000);
        }
      });
    }
  } catch { /* 概念数据未就绪 */ }
  searchState.index = idx;
  return idx;
}
async function store0_getFaq() { try { return (await import('../data/faq.js')).default; } catch { return []; } }
async function getConceptSafe(id) { try { return (await import(`../data/concepts/${id}.js`)).default; } catch { return null; } }

function openSearch() {
  let ov = $('#searchOverlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'searchOverlay'; ov.className = 'search-overlay';
    ov.innerHTML = `<div class="search-box">
      <div class="s-input-row">🔍 <input id="searchInput" placeholder="搜索章节、知识点、常见问题…" autocomplete="off"><kbd style="font-size:11px;color:var(--muted)">ESC</kbd></div>
      <div class="s-results" id="searchResults"><div class="s-empty">输入关键词开始搜索</div></div>
    </div>`;
    document.body.append(ov);
    ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('show'); });
    const inp = $('#searchInput', ov);
    inp.addEventListener('input', debounce(() => runSearch(inp.value), 90));
    inp.addEventListener('keydown', e => {
      const items = $$('.s-item', ov);
      if (e.key === 'ArrowDown') { searchState.sel = Math.min(searchState.sel + 1, items.length - 1); }
      else if (e.key === 'ArrowUp') { searchState.sel = Math.max(searchState.sel - 1, 0); }
      else if (e.key === 'Enter') { items[searchState.sel]?.click(); return; }
      else if (e.key === 'Escape') { ov.classList.remove('show'); return; }
      items.forEach((it, i) => it.classList.toggle('on', i === searchState.sel));
      items[searchState.sel]?.scrollIntoView({ block: 'nearest' });
    });
  }
  ov.classList.add('show');
  const inp = $('#searchInput', ov);
  inp.value = ''; inp.focus();
  $('#searchResults', ov).innerHTML = '<div class="s-empty">输入关键词开始搜索</div>';
  buildSearchIndex();
}
function hl(text, q) {
  if (!q) return esc(text);
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return esc(text);
  return esc(text.slice(0, i)) + '<em>' + esc(text.slice(i, i + q.length)) + '</em>' + esc(text.slice(i + q.length));
}
async function runSearch(q) {
  const box = $('#searchResults');
  q = q.trim();
  if (!q) { box.innerHTML = '<div class="s-empty">输入关键词开始搜索</div>'; return; }
  const idx = await buildSearchIndex();
  const ql = q.toLowerCase();
  /* 中文友好：整句 + 去停用词后的 2 元片段 */
  const stripped = q.replace(/[？?！!。，,、："'"（）()\s]|什么是|怎么|为什么|如何|请问|哪些|什么/g, '');
  const grams = [];
  for (let i = 0; i + 2 <= stripped.length; i++) grams.push(stripped.slice(i, i + 2));
  const scored = [];
  for (const it of idx) {
    let s = 0;
    let bodyIdx = it.body.toLowerCase().indexOf(ql);
    if (it.t.toLowerCase().includes(ql)) s += it.w * 10;
    if (bodyIdx >= 0) s += 3;
    if (!s && grams.length) {
      let gHit = -1, gN = 0;
      for (const g of grams) { const p = it.body.toLowerCase().indexOf(g); if (p >= 0) { gN++; if (gHit < 0) gHit = p; } }
      if (it.t.toLowerCase().includes(grams[0])) s += it.w * 6;
      if (gN >= Math.min(2, grams.length)) s += 2 + gN; else gHit = -1;
      if (s) bodyIdx = gHit;
    }
    if (s > 0) {
      let sub = it.sub || '';
      if (bodyIdx >= 0) {
        const ctx = it.body.slice(Math.max(0, bodyIdx - 24), bodyIdx + q.length + 40);
        sub = '…' + ctx.trim() + '…';
      }
      scored.push({ ...it, score: s, sub });
    }
  }
  scored.sort((a, b) => b.score - a.score);
  searchState.results = scored.slice(0, 9); searchState.sel = 0;
  if (!searchState.results.length) { box.innerHTML = `<div class="s-empty">没有找到与「${esc(q)}」相关的内容<br><span class="small">试试：图灵、神经网络、过拟合、注意力…</span></div>`; return; }
  box.innerHTML = searchState.results.map((r, i) => `
    <div class="s-item ${i === 0 ? 'on' : ''}" data-url="${r.url}">
      <div class="si-ico">${r.ico}</div>
      <div style="min-width:0"><div class="si-title">${hl(r.t, q)}</div><div class="si-sub">${hl(r.sub, q)}</div></div>
    </div>`).join('');
  $$('.s-item', box).forEach(el => el.addEventListener('click', () => location.href = el.dataset.url));
}

/* ============================================================
   3. 划线笔记 + 提问包
   ============================================================ */
const INTENTS = {
  confused: { label: '不懂', ico: '❓', cls: 'hl-confused' },
  important: { label: '重要', ico: '⭐', cls: 'hl-important' },
  doubt: { label: '存疑', ico: '⚠️', cls: 'hl-doubt' },
  dig: { label: '深挖', ico: '🔎', cls: 'hl-doubt' }
};

function buildTextIndex(rootEl) {
  const nodes = [];
  const walk = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
  let n, S = '';
  while ((n = walk.nextNode())) {
    if (!n.nodeValue.trim() || n.parentElement.closest('mark,script,style,.sel-toolbar')) continue;
    nodes.push({ node: n, start: S.length });
    S += n.nodeValue;
  }
  return { S, nodes, locate(pos) { for (const { node, start } of this.nodes) { if (pos >= start && pos <= start + node.nodeValue.length) return { node, off: pos - start }; } return null; } };
}

function wrapRange(rootIx, start, end, cls, noteId) {
  const r = document.createRange();
  const a = rootIx.locate(start), b = rootIx.locate(end);
  if (!a || !b) return null;
  try {
    r.setStart(a.node, a.off); r.setEnd(b.node, b.off);
    const mark = document.createElement('mark');
    mark.className = 'hl ' + cls;
    mark.dataset.noteId = noteId;
    mark.appendChild(r.extractContents());
    r.insertNode(mark);
    return mark;
  } catch (e) { return null; }
}

function restoreHighlights(pageId, pageTitle) {
  const content = $('#content');
  if (!content) return;
  const list = store.notes.of(pageId);
  if (!list.length) return;
  let ix = buildTextIndex(content);
  list.forEach(n => {
    const pos = [];
    let from = 0;
    while (true) {
      const i = ix.S.indexOf(n.text, from);
      if (i < 0) break;
      const before = ix.S.slice(Math.max(0, i - n.prefix.length), i);
      const after = ix.S.slice(i + n.text.length, i + n.text.length + n.suffix.length);
      if (before.endsWith(n.prefix) && after.startsWith(n.suffix)) { pos.push(i); break; }
      from = i + 1;
    }
    if (pos.length) wrapRange(ix, pos[0], pos[0] + n.text.length, (INTENTS[n.intent] || INTENTS.confused).cls, n.id);
  });
}

function initSelectionToolbar() {
  const content = $('#content');
  if (!content) return;
  const pageId = document.body.dataset.page || location.pathname;
  const pageTitle = document.title.replace(' · 人工智能导论', '');

  const tb = document.createElement('div');
  tb.className = 'sel-toolbar';
  tb.innerHTML = `
    <button class="st-confused" data-i="confused"><i>❓</i>不懂</button>
    <button class="st-important" data-i="important"><i>⭐</i>重要</button>
    <button class="st-doubt" data-i="doubt"><i>⚠️</i>存疑</button>
    <button class="st-dig" data-i="dig"><i>🔎</i>深挖提问</button>`;
  document.body.append(tb);

  let pendingRange = null;
  document.addEventListener('mouseup', debounce(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) { tb.classList.remove('show'); return; }
    const range = sel.getRangeAt(0);
    if (!content.contains(range.commonAncestorContainer)) { tb.classList.remove('show'); return; }
    const text = sel.toString().trim();
    if (!text || text.length < 2 || text.length > 600) { tb.classList.remove('show'); return; }
    pendingRange = range.cloneRange();
    const rect = range.getBoundingClientRect();
    tb.style.top = (scrollY + rect.top - 52) + 'px';
    tb.style.left = Math.max(12, scrollX + rect.left + rect.width / 2 - 170) + 'px';
    tb.classList.add('show');
  }, 180));

  document.addEventListener('mousedown', e => {
    if (!tb.contains(e.target)) tb.classList.remove('show');
  });

  tb.addEventListener('click', e => {
    const btn = e.target.closest('button[data-i]');
    if (!btn || !pendingRange) return;
    const intent = btn.dataset.i;
    const text = pendingRange.toString().trim();
    if (!text) return;

    const ix = buildTextIndex(content);
    const at = ix.S.indexOf(text);
    if (at < 0) { tb.classList.remove('show'); return; }
    const pre = ix.S.slice(Math.max(0, at - 30), at);
    const suf = ix.S.slice(at + text.length, at + text.length + 30);

    const note = store.notes.add({ pageId, pageTitle, text, prefix: pre, suffix: suf, intent, note: '' });
    const mark = wrapRange(buildTextIndex(content), at, at + text.length, INTENTS[intent].cls, note.id);
    tb.classList.remove('show');
    window.getSelection()?.removeAllRanges();
    if (mark) attachMarkClick(mark);
    if (intent === 'dig') openQuestionPack(note);
    else openNoteEditor(note, mark);
  });

  /* 已有标记的点击 */
  $$('#content mark.hl').forEach(attachMarkClick);

  function attachMarkClick(mark) {
    mark.addEventListener('click', () => {
      const note = store.notes.all().find(n => n.id === mark.dataset.noteId);
      if (note) openNoteEditor(note, mark);
    });
  }
}

/* ---------- 笔记编辑弹窗 ---------- */
function modal(title, bodyHtml, footHtml = '') {
  const mask = document.createElement('div');
  mask.className = 'modal-mask';
  mask.innerHTML = `<div class="modal">
    <div class="mo-head"><div class="mo-title">${title}</div><button class="icon-btn mo-close">✕</button></div>
    <div class="mo-body">${bodyHtml}</div>
    ${footHtml ? `<div class="mo-foot">${footHtml}</div>` : ''}
  </div>`;
  document.body.append(mask);
  mask.classList.add('show');
  const close = () => { mask.classList.remove('show'); setTimeout(() => mask.remove(), 150); };
  mask.addEventListener('click', e => { if (e.target === mask) close(); });
  $('.mo-close', mask).addEventListener('click', close);
  return { mask, close };
}

function openNoteEditor(note, markEl) {
  const it = INTENTS[note.intent] || INTENTS.confused;
  const { close } = modal(`${it.ico} ${it.label} · 笔记`, `
    <div style="padding:12px 16px;background:var(--bg-soft);border-radius:10px;border:1px solid var(--border);font-size:14px;line-height:1.8;color:var(--text-2);margin-bottom:14px">「${esc(note.text)}」</div>
    <label style="font-size:13px;color:var(--muted)">我的批注（会一并写入提问包与导出）</label>
    <textarea class="q-input" id="noteTa" rows="3" style="margin-top:8px;width:100%" placeholder="写下你的想法…">${esc(note.note || '')}</textarea>
    <div class="flex" style="margin-top:14px;gap:8px;flex-wrap:wrap">
      <button class="btn sm ghost" id="pkBtn">🎁 生成提问包</button>
      <button class="btn sm ghost" id="delBtn" style="color:var(--err);border-color:var(--err)">删除划线</button>
    </div>`);
  $('#noteTa').addEventListener('input', e => store.notes.update(note.id, { note: e.target.value }));
  $('#delBtn').addEventListener('click', () => {
    store.notes.remove(note.id);
    if (markEl) { const p = markEl.parentNode; while (markEl.firstChild) p.insertBefore(markEl.firstChild, markEl); p.removeChild(markEl); p.normalize(); }
    close();
  });
  $('#pkBtn').addEventListener('click', () => { close(); openQuestionPack(note); });
}

/* ---------- 提问包 ---------- */
function openQuestionPack(note) {
  const found = findSection(note.pageId) || null;
  const it = INTENTS[note.intent] || INTENTS.dig;
  const asks = {
    confused: `1. 请先准确地解释这段内容在讲什么，不要因为省略术语而牺牲准确性。\n2. 它为什么重要？和课程的哪些部分有关联？`,
    important: `1. 请帮我判断：这段内容在整门课中的地位如何？考试与后续学习会在哪些地方用到它？\n2. 请帮我把这段内容整理成 3 条可记忆的要点。`,
    doubt: `1. 请审视这段论述：有没有可以质疑、补充或需要限定条件的地方？\n2. 请给出支持与反对它的各一个论证。`,
    dig: `1. 请由浅入深地展开讲解，并给一个生活中的类比。\n2. 这背后有没有更深层的技术或哲学问题？请指给我一条继续深挖的路径。`
  };
  const pack = `【提问包 · 《人工智能导论》课程学习】
▸ 疑问类型：${it.ico} ${it.label}
▸ 出处：${found ? `${found.ch.num}《${found.ch.title}》· ${found.sec.title}` : note.pageTitle}
▸ 原文引用：「${note.text}」
${note.note ? `▸ 我的批注：${note.note}\n` : ''}▸ 请你：
${asks[note.intent] || asks.dig}
▸ 约束：优先只依据引用内容作答；信息不足时明确说明，不要编造。先给准确直觉再给严谨表述，不要为了浅显而牺牲准确性。最后出一道检验我理解的小问题（附答案）。`;

  const { mask } = modal('🎁 提问包已生成', `
    <p style="font-size:13.5px;color:var(--text-2);line-height:1.8;margin:0 0 12px">把下面这段话整体复制，粘贴给任意一个大模型（ChatGPT / GLM / Kimi / 豆包…），即可获得针对这段内容的定制讲解。你可以在 <a href="${P('notes.html')}">我的笔记</a> 中再次导出。</p>
    <pre class="pk">${esc(pack)}</pre>`,
    `<button class="btn ghost" data-x="copy">📋 复制提问包</button><button class="btn" data-x="ai">💬 直接问课程助教</button>`);
  const foot = mask.querySelector('.mo-foot');
  foot.addEventListener('click', e => {
    const b = e.target.closest('button[data-x]');
    if (!b) return;
    if (b.dataset.x === 'copy') {
      navigator.clipboard?.writeText(pack).then(() => { b.textContent = '✅ 已复制'; }, () => {
        const ta = document.createElement('textarea'); ta.value = pack; document.body.append(ta); ta.select();
        document.execCommand('copy'); ta.remove(); b.textContent = '✅ 已复制';
      });
    } else {
      mask.remove();
      openAiPanel();
      setTimeout(() => aiAsk(pack), 120);
    }
  });
}

/* ============================================================
   4. AI 答疑面板
   ============================================================ */
let aiOpened = false;
function buildAiPanel() {
  const fab = document.createElement('button');
  fab.className = 'ai-fab'; fab.id = 'aiFab'; fab.title = 'AI 课程助教';
  fab.innerHTML = '🤖<span class="fab-dot"></span>';
  const panel = document.createElement('div');
  panel.className = 'ai-panel'; panel.id = 'aiPanel';
  panel.innerHTML = `
    <div class="ai-head">
      <div class="ai-avatar">🤖</div>
      <div><div class="ai-name">AI 课程助教</div><div class="ai-sub" id="aiSub">随时问我这门课的任何问题</div></div>
      <button class="icon-btn ai-settings" id="aiCfgBtn" title="设置">⚙️</button>
      <button class="icon-btn" id="aiCloseBtn" title="收起">✕</button>
    </div>
    <div class="ai-msgs" id="aiMsgs">
      <div class="ai-empty">
        <div class="big">🤖</div>
        我是这门《人工智能导论》的 AI 助教。<br>可以问我概念、演示怎么玩、题目为什么选错……
        <div class="sugs">
          <button data-q="用大白话解释一下什么是神经网络？">用大白话解释什么是神经网络？</button>
          <button data-q="图灵测试能证明机器有智能吗？">图灵测试能证明机器有智能吗？</button>
          <button data-q="过拟合是什么？为什么考试会考它？">过拟合是什么？</button>
          <button data-q="我该如何开始准备 AI 创作比赛？">如何准备 AI 创作比赛？</button>
        </div>
      </div>
    </div>
    <div class="ai-input-row">
      <textarea id="aiInput" placeholder="输入问题，Enter 发送…" rows="1"></textarea>
      <button class="ai-send" id="aiSend">➤</button>
    </div>`;
  document.body.append(fab, panel);
  fab.addEventListener('click', openAiPanel);
  $('#aiCloseBtn').addEventListener('click', () => panel.classList.remove('show'));
  $('#aiCfgBtn').addEventListener('click', openAiSettings);
  $('#aiSend').addEventListener('click', () => { const v = $('#aiInput').value.trim(); if (v) { $('#aiInput').value = ''; aiAsk(v); } });
  $('#aiInput').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); const v = e.target.value.trim(); if (v) { e.target.value = ''; aiAsk(v); } }
  });
  panel.addEventListener('click', e => {
    const sug = e.target.closest('[data-q]');
    if (sug) aiAsk(sug.dataset.q);
  });
  if (store.srs.dueCount() > 0) fab.classList.add('has-due');
}
function openAiPanel() {
  $('#aiPanel').classList.add('show');
  if (!aiOpened) { aiOpened = true; }
  $('#aiInput')?.focus();
}

const SYSTEM_PROMPT = `你是《人工智能导论》通识课的 AI 助教。这门课面向零编程基础的大一新生，3学分48学时，目标是让学生真正吃透技术原理，不满足于停在比喻和直觉层面。
课程结构：引论（智能定义、图灵测试、AI简史、计算原理）；知识与学习（符号主义vs连接主义、知识表示、专家系统、搜索博弈）；机器学习（回归、分类、聚类、过拟合、偏差方差）；神经网络（感知机、多层感知机、激活函数、反向传播）；深度学习（CNN、RNN/LSTM、词嵌入）；前沿（注意力、Transformer、大语言模型、GAN、扩散模型、多模态）；AI伦理（偏见、隐私、对齐）；争锋课（AI时代诗人/艺术/思想何为）；实战课（提示词工程、Agent、本地知识库RAG、本地部署大模型）。
回答要求：1) 准确优先——先给出清晰直觉，再给出严谨表述，该用数学符号和术语时直接用，不要为了显得好懂而牺牲准确性，也不要堆砌比喻；2) 结构清晰，适当使用短列表；3) 涉及课程内容时可指出对应章节；4) 学生问答题时先给思路再逐步揭示，不要直接给完整答案；5) 不确定就说不确定，不要编造。回答保持精炼，一般不超过400字。`;

function aiPushMsg(role, text, extraHtml = '') {
  const box = $('#aiMsgs');
  const empty = box.querySelector('.ai-empty');
  if (empty) empty.remove();
  const div = document.createElement('div');
  div.className = 'ai-msg ' + role;
  div.textContent = text;
  if (extraHtml) { const ex = document.createElement('div'); ex.className = 'ai-cards'; ex.innerHTML = extraHtml; div.append(ex); }
  box.append(div);
  box.scrollTop = box.scrollHeight;
  return div;
}

async function aiAsk(q) {
  openAiPanel();
  aiPushMsg('user', q);
  const cfg = store.aiCfg.all();
  if (!cfg.key) {
    /* 无 key：降级为 FAQ 检索 */
    const typing = aiTyping();
    await new Promise(r => setTimeout(r, 450));
    typing.remove();
    let cards = '';
    try {
      const faq = (await import('../data/faq.js')).default;
      /* 中文友好分词：去停用词 + 2 元 shingle + 空格分词 */
      const stripped = q.replace(/[？?！!。，,、："'"（）()\s]|什么是|怎么|为什么|如何|请问|一下|哪些|什么|怎么/g, '');
      const tokens = new Set(q.toLowerCase().split(/\s+/).filter(w => w.length > 1));
      for (let i = 0; i + 2 <= stripped.length; i++) tokens.add(stretchedToken(stripped.slice(i, i + 2)));
      function stretchedToken(t) { return t; }
      const hits = [];
      faq.forEach(cat => cat.items.forEach(f => {
        const hay = (f.q + f.a).toLowerCase();
        let s = 0;
        tokens.forEach(tk => { if (hay.includes(tk)) s += 2; });
        if (f.q.toLowerCase().includes(q.toLowerCase())) s += 8;
        if (s > 0) hits.push({ ...f, s, cat: cat.name });
      }));
      hits.sort((a, b) => b.s - a.s);
      if (hits.length) cards = hits.slice(0, 4).map(h => `<a href="${P('faq', 'index.html')}?q=${encodeURIComponent(h.q.slice(0, 18))}">💬 ${esc(h.q.slice(0, 34))}</a>`).join('');
    } catch { /* ignore */ }
    aiPushMsg('bot', '当前尚未配置 AI 接口（点右上角 ⚙️ 填入 API Key 即可开启在线问答）。\n先从课程 FAQ 里帮你找了相关条目：' + (cards ? '' : '\n（暂无匹配，换个说法试试，或先到答疑中心浏览）'), cards);
    return;
  }
  const typing = aiTyping();
  const botMsg = document.createElement('div');
  try {
    const res = await fetch(cfg.base.replace(/\/+$/, '') + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.key },
      body: JSON.stringify({
        model: cfg.model || 'glm-5.2',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: q }],
        stream: true, temperature: 0.6, max_tokens: 1200
      })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status + ' ' + (await res.text()).slice(0, 160));
    typing.remove();
    botMsg.className = 'ai-msg bot';
    $('#aiMsgs').append(botMsg);
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '', full = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith('data:')) continue;
        const payload = t.slice(5).trim();
        if (payload === '[DONE]') continue;
        try {
          const j = JSON.parse(payload);
          const d = j.choices?.[0]?.delta?.content || '';
          if (d) { full += d; botMsg.textContent = full; $('#aiMsgs').scrollTop = 1e9; }
        } catch { /* skip broken chunk */ }
      }
    }
    if (!full) botMsg.textContent = '（模型没有返回内容，请重试或检查模型名称）';
  } catch (err) {
    typing.remove();
    const msg = '⚠️ AI 接口调用失败：' + err.message +
      '\n\n常见原因：\n1) API Key 无效或未充值\n2) 浏览器直连被 CORS 拦截（参见 docs 目录中的代理脚本说明）\n3) 模型名称有误\n\n你也可以使用「划线 → 深挖提问」生成的提问包，粘贴到任意大模型网页版。';
    aiPushMsg('bot err', msg);
  }
}
function aiTyping() {
  const box = $('#aiMsgs');
  const t = document.createElement('div');
  t.className = 'ai-typing';
  t.innerHTML = '<span></span><span></span><span></span>';
  box.append(t); box.scrollTop = 1e9;
  return t;
}

function openAiSettings() {
  const cfg = store.aiCfg.all();
  const { mask, close } = modal('⚙️ AI 助教设置', `
    <p style="font-size:13.5px;color:var(--text-2);line-height:1.8">填写任意 OpenAI 兼容接口即可。默认指向智谱 GLM（<a href="https://open.bigmodel.cn" target="_blank" rel="noopener">open.bigmodel.cn</a> 注册可得 Key）。Key 只保存在你本机浏览器中。</p>
    <label style="font-size:13px;color:var(--muted)">接口地址（Base URL）</label>
    <input class="q-input" id="cfgBase" style="margin:6px 0 14px" value="${esc(cfg.base)}">
    <label style="font-size:13px;color:var(--muted)">模型名称</label>
    <input class="q-input" id="cfgModel" style="margin:6px 0 14px" value="${esc(cfg.model)}">
    <label style="font-size:13px;color:var(--muted)">API Key</label>
    <input class="q-input" id="cfgKey" type="password" style="margin:6px 0 4px" value="${esc(cfg.key)}" placeholder="sk-…">
    <p class="small text-muted" style="margin-top:10px">若浏览器直连报 CORS 错误，可按 docs/部署与使用说明.md 部署一个免费代理（Cloudflare Worker，约 3 分钟）。</p>`,
    `<button class="btn" id="cfgSave">保存</button>`);
  $('#cfgSave', mask).addEventListener('click', () => {
    store.aiCfg.save({ base: $('#cfgBase', mask).value.trim(), model: $('#cfgModel', mask).value.trim(), key: $('#cfgKey', mask).value.trim() });
    close();
  });
}

/* ============================================================
   5. 灯箱 / 揭示动画 / 快捷键
   ============================================================ */
function initLightbox() {
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = '<button class="lb-close">✕</button><img alt=""><div class="lb-cap"></div>';
  document.body.append(lb);
  const img = $('img', lb), cap = $('.lb-cap', lb);
  lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb-close')) lb.classList.remove('show'); });
  document.addEventListener('click', e => {
    const im = e.target.closest('.figure img, .prose img');
    if (!im || im.closest('.demo-frame')) return;
    img.src = im.src;
    cap.textContent = im.closest('figure')?.querySelector('figcaption')?.textContent || '';
    lb.classList.add('show');
  });
}
let revealIO = null;
function initReveal() {
  revealIO = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); revealIO.unobserve(x.target); } }), { rootMargin: '0px 0px -6% 0px' });
  scanReveal();
  /* app.js 在 boot2() 里同步跑完时，portal.js/pages.js 等页面脚本往往还没来得及把
     .reveal 内容塞进 #content——这一轮扫描常常扑空，元素永远停在 opacity:0。
     用 setTimeout 兜底再扫一轮，MutationObserver 兜住此后任何时候才出现的 .reveal；
     页面脚本自己在插入内容后调用 scanReveal() 是最直接、不依赖时序的做法。 */
  setTimeout(scanReveal, 0);
  new MutationObserver(muts => {
    muts.forEach(m => m.addedNodes.forEach(n => {
      if (n.nodeType !== 1) return;
      if (n.matches('.reveal')) revealIO.observe(n);
      n.querySelectorAll?.('.reveal').forEach(el => revealIO.observe(el));
    }));
  }).observe(document.body, { childList: true, subtree: true });
}
function scanReveal() {
  revealIO && $$('.reveal').forEach(el => revealIO.observe(el));
}
function initKeys() {
  addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
    if (e.key === 'Escape') { $('#searchOverlay')?.classList.remove('show'); }
    if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement?.tagName || '')) { e.preventDefault(); openSearch(); }
  });
}

/* ============================================================
   启动
   ============================================================ */
buildShell();
buildAiPanel();
document.addEventListener('open-pack', e => openQuestionPack(e.detail));
initLightbox();
initKeys();
/* boot2() 只依赖 document.body / #content，二者在脚本执行时已存在——
   不需要等 DOMContentLoaded。曾经的 readyState 分支在实测中会让 boot2()
   （进而 initReveal 的划线揭示动画）在某些时序下永远等不到那个事件，直接同步调用更稳。 */
boot2();

function boot2() {
  initSelectionToolbar();
  restoreHighlights(document.body.dataset.page || location.pathname, document.title);
  initReveal();
  /* 章节页打钩：进入即记录阅读 */
  const pid = document.body.dataset.page;
  if (pid && findSection(pid)) {
    setTimeout(() => store.progress.markDone(pid), 15000); // 停留 15 秒算读过
    addEventListener('beforeunload', () => { /* 见上 */ });
  }
}

export { openSearch, modal, P, $, $$, esc, scanReveal };
