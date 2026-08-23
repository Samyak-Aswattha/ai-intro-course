/* ============================================================
   pages.js — 小节页 / 章首页 引导脚本
   页面 shell 只需：<body data-module data-page> + <main><div id="content">
   ============================================================ */
import './app.js';
import { findSection, findChapter, neighbors, getConcept } from './data.js';
import { renderSection, renderChapter } from './renderer.js';
import { P, scanReveal } from './app.js';

const pageId = document.body.dataset.page || '';
const found = findSection(pageId);

(async function boot() {
  const content = document.getElementById('content');
  if (!content) return;

  if (found) {
    const { ch, sec } = found;
    document.title = `${sec.title} · ${ch.num} ${ch.title} · 人工智能导论`;
    let secData = null;
    try {
      const concept = await getConcept(ch.id);
      secData = concept.sections?.[sec.id] || null;
    } catch (e) { console.warn('概念数据缺失', e); }
    if (!secData) {
      secData = { lede: sec.desc, blocks: [{ type: 'p', text: '本节内容编写中。' }] };
    }
    renderSection(content, ch, sec, secData);

    /* 上下页 */
    const nb = neighbors(pageId);
    const pager = document.createElement('nav');
    pager.className = 'pager reveal';
    pager.innerHTML = `
      ${nb.prev ? `<a href="${P('modules', nb.prev.ch.module, nb.prev.pageId + '.html')}"><div class="dir">← 上一节</div><div class="pt">${nb.prev.sec.title}</div></a>` : '<a style="visibility:hidden"></a>'}
      ${nb.next ? `<a class="next" href="${P('modules', nb.next.ch.module, nb.next.pageId + '.html')}"><div class="dir">下一节 →</div><div class="pt">${nb.next.sec.title}</div></a>` : `<a class="next" href="${P('quiz', 'practice.html')}?ch=${ch.id}"><div class="dir">学完本章 →</div><div class="pt">本章测评</div></a>`}`;
    content.append(pager);

    const foot = document.createElement('footer');
    foot.className = 'site-footer';
    foot.innerHTML = `<span>《人工智能导论》通识课 · 课程网站</span><span>读到这里了，${sec.title}完成 ✅</span>`;
    content.append(foot);
    scanReveal();
  } else {
    /* 章首页：pageId 形如 ch03 */
    const m = pageId.match(/^ch(\d{2})$/);
    const ch = m && findChapter(m[1]);
    if (ch) {
      document.title = `${ch.num} ${ch.title} · 人工智能导论`;
      renderChapter(content, ch);
      const foot = document.createElement('footer');
      foot.className = 'site-footer';
      foot.innerHTML = `<span>《人工智能导论》通识课 · 课程网站</span>`;
      content.append(foot);
      scanReveal();
    }
  }
})();
