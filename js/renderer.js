/* ============================================================
   renderer.js — 章节内容渲染器
   把 data/concepts/*.js 中的结构化 block 渲染为页面
   行内标记：**粗体**、`代码`、[词语|释义]（术语气泡）、[文字](链接)
   ============================================================ */
import { P } from './app.js';
import * as store from './store.js';

const $ = (s, el = document) => el.querySelector(s);

/* ---------- 行内标记解析 ---------- */
export function inline(text) {
  let s = String(text ?? '');
  s = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  s = s.replace(/\[([^\]|]+)\|([^\]]+)\]/g, (_, t, d) => `<term data-def="${d.replace(/"/g, '&quot;')}">${t}</term>`);
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  return s;
}

const CALLOUT_META = {
  think: { ico: '🤔', t: '想一想' },
  warn: { ico: '⚠️', t: '注意' },
  history: { ico: '📜', t: '历史注脚' },
  philosophy: { ico: '💭', t: '哲思一刻' },
  info: { ico: '💡', t: '小知识' },
  key: { ico: '🔑', t: '关键' }
};

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

/* ---------- 单个 block ---------- */
function renderBlock(b, depth) {
  switch (b.type) {
    case 'h3': return el('h3', null, inline(b.text));
    case 'p': return el('p', null, inline(b.text));
    case 'quote': {
      const q = el('blockquote', null, `<p>${inline(b.text)}</p>` + (b.by ? `<p style="text-align:right;color:var(--muted);font-size:13.5px">—— ${inline(b.by)}</p>` : ''));
      return q;
    }
    case 'callout': {
      const m = CALLOUT_META[b.variant] || CALLOUT_META.info;
      const c = el('div', 'callout ' + b.variant);
      c.innerHTML = `<div class="co-title"><span class="ico">${m.ico}</span>${inline(b.title || m.t)}</div><p>${inline(b.text)}</p>`;
      if (b.list) c.append(el('ul', null, b.list.map(x => `<li>${inline(x)}</li>`).join('')));
      return c;
    }
    case 'formula': {
      const f = el('div', 'formula', b.text + (b.note ? `<span class="fx-note">${inline(b.note)}</span>` : ''));
      return f;
    }
    case 'terms': {
      const g = el('div', 'term-grid');
      b.items.forEach(t => g.append(el('div', 'term-card', `<div class="t">${inline(t.t)}</div><div class="d">${inline(t.d)}</div>`)));
      return g;
    }
    case 'compare': {
      const wrap = el('div', 'compare');
      const rows = b.rows.map(r => `<tr>${r.map((c, i) => i === 0 ? `<td>${inline(c)}</td>` : `<td>${inline(c)}</td>`).join('')}</tr>`).join('');
      wrap.innerHTML = `<table><thead><tr>${b.headers.map(h => `<th>${inline(h)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`;
      return wrap;
    }
    case 'timeline': {
      const t = el('div', 'timeline');
      b.items.forEach(i => t.append(el('div', 'tl-item', `<div class="tl-year">${inline(i.year)}</div><div class="tl-title">${inline(i.title ?? i.t)}</div><div class="tl-desc">${inline(i.desc ?? i.d)}</div>`)));
      return t;
    }
    case 'figure': return figureBlock(b);
    case 'demo': return demoBlock(b, depth);
    case 'html': { const d = el('div'); d.innerHTML = b.text; return d; }
    case 'list': return el(b.ordered ? 'ol' : 'ul', null, b.items.map(x => `<li>${inline(x)}</li>`).join(''));
    default: return el('p', 'small text-muted', '未知内容块：' + b.type);
  }
}

/* ---------- 图片 / 视频 ---------- */
function figureBlock(b) {
  const fig = el('figure', 'figure');
  const src = b.src.startsWith('http') || b.src.startsWith('../..') ? b.src : P(b.src.replace(/^assets\//, 'assets/'));
  if (b.video || /\.mp4|\.mov|\.webm$/i.test(b.src)) {
    fig.innerHTML = `<div class="fig-media"><video controls preload="metadata" src="${src}"></video></div><figcaption><b> ${inline(b.title || '')}</b>${b.caption ? ' ' + inline(b.caption) : ''}</figcaption>`;
  } else {
    fig.innerHTML = `<div class="fig-media"><img loading="lazy" src="${src}" alt="${b.title || ''}"></div><figcaption><b>${inline(b.title || '')}</b>${b.caption ? ' ' + inline(b.caption) : ''}</figcaption>`;
  }
  if (b.width) fig.style.maxWidth = b.width + 'px', fig.style.marginInline = 'auto';
  return fig;
}

/* ---------- 演示容器（懒加载 iframe + 海报） ---------- */
function demoBlock(b, depth) {
  const frame = el('div', 'demo-frame');
  frame.style.setProperty('--fh', (b.height || 520) + 'px');
  const badge = b.badge ? `<span class="lab-badge">${b.badge}</span>` : '';
  frame.innerHTML = `
    <div class="frame-head">
      <div class="d-ico">${b.ico || '🧪'}</div>
      <div><div class="d-title">${inline(b.title)}</div>${b.desc ? `<div class="d-sub">${inline(b.desc)}</div>` : ''}</div>
      ${badge}
      <a class="d-open icon-btn" href="${b.src}" target="_blank" title="新标签页打开（可全屏）" aria-label="在新标签页打开该演示">⤢</a>
    </div>
    <div class="frame-wrap">
      <div class="frame-poster">
        <div class="play">▶</div>
        <div class="p-title">${inline(b.title)}</div>
        <div class="p-sub">${inline(b.hint || '点击加载交互演示（本地运行，无需网络）')}</div>
      </div>
    </div>`;
  const poster = $('.frame-poster', frame);
  const wrap = $('.frame-wrap', frame);
  let loaded = false;
  const load = () => {
    if (loaded) return;
    loaded = true;
    const ifr = document.createElement('iframe');
    ifr.loading = 'lazy';
    ifr.src = b.src + (b.src.includes('?') ? '&' : '?') + 'theme=' + (store.theme.get());
    wrap.innerHTML = ''; wrap.append(ifr);
    frame.querySelector('.d-open')?.setAttribute('href', b.src);
  };
  poster.addEventListener('click', load);
  /* 滚动到可视区即自动加载——首见即活，不留"占位框"观感 */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) { io.disconnect(); load(); } }, { rootMargin: '260px' });
    io.observe(frame);
  } else load();
  return frame;
}

/* ---------- 小节组装 ---------- */
export function renderSection(container, ch, sec, secData) {
  const m = ch.module;
  document.body.dataset.module = m;
  container.innerHTML = '';

  /* 页头 */
  const head = el('header', 'page-head reveal');
  head.innerHTML = `<div class="ch-tag">${ch.num} · ${sec.title}</div><h1>${sec.title}</h1><p class="lede">${inline(secData.lede || sec.desc || '')}</p>`;
  container.append(head);

  const prose = el('div', 'prose');
  container.append(prose);

  let h2n = 0;
  (secData.blocks || []).forEach(b => {
    if (b.type === 'h2') {
      h2n += 1;
      prose.append(el('h2', null, `<span class="h-index">${String(h2n).padStart(2, '0')}</span>${inline(b.text)}`));
    } else {
      prose.append(renderBlock(b));
    }
  });

  /* 要点小结 */
  if (secData.keypoints?.length) {
    const kp = el('div', 'keypoints reveal');
    kp.innerHTML = `<div class="kp-title">🎯 本节要点</div><ul>${secData.keypoints.map(k => `<li>${inline(k)}</li>`).join('')}</ul>`;
    container.append(kp);
  }

  /* 章节测验入口 */
  const qe = el('div', 'quiz-entry reveal');
  qe.innerHTML = `
    <div class="qe-ico">✍️</div>
    <div class="qe-main"><div class="qe-title">测一测：${ch.num} · ${ch.title}</div>
    <div class="qe-sub" id="qeCount">本题库加载中…</div></div>
    <a class="btn" href="${P('quiz', 'practice.html')}?ch=${ch.id}&sec=${sec.id}">开始练习</a>`;
  container.append(qe);
  import('./data.js').then(({ getQuiz }) => getQuiz(ch.id)).then(items => {
    const n = items.filter(q => !sec.id || q.sec === sec.id || !q.sec).length;
    const sub = $('#qeCount', qe);
    if (sub) sub.textContent = `本章题库共 ${items.length} 题（含选择题、判断题、简答），答错自动进入间隔重复队列`;
  }).catch(() => { const sub = $('#qeCount', qe); if (sub) sub.textContent = '进入本章练习'; });

  /* 本节 FAQ */
  if (secData.faq?.length) {
    const f = el('div', 'sec-faq reveal');
    f.innerHTML = `<div class="band-head"><h2>常见问题</h2></div>` + secData.faq.map(x => `
      <details><summary><span class="q-ico">Q</span>${inline(x.q)}<span class="arr">▶</span></summary><div class="a-body">${inline(x.a)}</div></details>`).join('');
    container.append(f);
  }

  /* 延伸阅读 */
  if (secData.further?.length) {
    const ICONS = { book: '📘', paper: '📄', video: '🎬', tool: '🛠️', link: '🔗', course: '🎓' };
    const fr = el('div', 'further reveal');
    fr.innerHTML = `<div class="band-head"><h2>延伸阅读</h2></div>` + secData.further.map(x => `
      <a href="${x.href}" ${x.href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>
        <div class="f-type">${ICONS[x.type] || '🔗'}</div>
        <div><div class="f-title">${inline(x.title)}</div><div class="f-desc">${inline(x.desc || '')}</div></div>
      </a>`).join('');
    container.append(fr);
  }
  return container;
}

/* ---------- 章首页（chapter overview） ---------- */
export function renderChapter(container, ch) {
  document.body.dataset.module = ch.module;
  container.innerHTML = '';
  const head = el('header', 'page-head reveal');
  head.innerHTML = `<div class="ch-tag">${ch.num} · ${ch.hours} 学时</div><h1>${ch.title}</h1><p class="lede">${inline(ch.brief)}</p>`;
  container.append(head);

  const grid = el('div', 'sec-grid reveal');
  ch.sections.forEach((sec, i) => {
    const pid = `ch${ch.id}-${sec.id}`;
    const done = store.progress.isDone(pid);
    const card = el('a', 'sec-card');
    card.href = P('modules', ch.module, pid + '.html');
    card.innerHTML = `<div class="sc-num">${ch.id}.${i + 1}${done ? ' ✓ 已读' : ''}</div>
      <div class="sc-title">${sec.title}</div><div class="sc-desc">${inline(sec.desc)}</div>
      ${sec.demos?.length ? `<div class="sc-demos">${sec.demos.map(d => `<span class="d-tag">🧪 ${d}</span>`).join('')}</div>` : ''}`;
    grid.append(card);
  });
  container.append(grid);

  const qe = el('div', 'quiz-entry reveal');
  qe.innerHTML = `
    <div class="qe-ico">✍️</div>
    <div class="qe-main"><div class="qe-title">本章测评</div><div class="qe-sub" id="qeCount">题库加载中…</div></div>
    <a class="btn" href="${P('quiz', 'practice.html')}?ch=${ch.id}">开始整章练习</a>`;
  container.append(qe);
  import('./data.js').then(({ getQuiz }) => getQuiz(ch.id)).then(items => {
    const sub = $('#qeCount', qe);
    if (sub) sub.textContent = `共 ${items.length} 题 · 即时判分 · 错题进入间隔重复`;
  }).catch(() => {});
}
