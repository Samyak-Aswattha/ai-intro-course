/* ============================================================
   refs-page.js — 参考资料中心
   ============================================================ */
import './app.js';
import { getReferences } from './data.js';
import { $, esc } from './app.js';

document.title = '参考资料 · 人工智能导论';
const content = document.getElementById('content');

(async function () {
  const refs = await getReferences();
  const head = document.createElement('header');
  head.className = 'page-head';
  head.innerHTML = `<div class="ch-tag">资料中心</div><h1>往深处去的路标</h1>
    <p class="lede">标 <b>📁 本地</b> 的资源在课程素材库中（校内网络/教师机可取）；标 <b>🌐 在线</b> 的为外部链接。按章节标签过滤，找到属于你的深潜点。</p>`;
  content.append(head);

  /* 章节筛选 */
  const chips = document.createElement('div');
  chips.className = 'flex';
  chips.style.cssText = 'flex-wrap:wrap;margin:6px 0 4px';
  const TAGS = ['全部', '第一章', '第二章', '第三章', '第四章', '第五章', '第六章', '第七章', '第八章', '第九章', '进阶'];
  chips.innerHTML = TAGS.map((t, i) => `<button class="btn sm ${i ? 'ghost' : ''}" data-t="${t}">${t}</button>`).join('');
  content.append(chips);

  const box = document.createElement('div');
  content.append(box);

  function render(tag) {
    box.innerHTML = '';
    refs.forEach(cat => {
      const items = cat.items.filter(x => tag === '全部' || x.tag === tag || x.tag?.includes(tag));
      if (!items.length) return;
      const sec = document.createElement('section');
      sec.className = 'faq-cat';
      sec.innerHTML = `<h2>${cat.icon} ${esc(cat.name)} <span class="small text-muted">（${items.length}）</span></h2>
        <div class="further" style="margin-top:4px">` + items.map(x => `
          <a href="${x.web || x.url || '#'}" ${x.web || x.url ? 'target="_blank" rel="noopener"' : ''}>
            <div class="f-type">${x.local ? '📁' : '🌐'}</div>
            <div><div class="f-title">${esc(x.t)} <span class="chip" style="font-size:10.5px">${esc(x.tag || '')}</span></div>
            <div class="f-desc">${esc(x.d)}</div></div>
          </a>`).join('') + '</div>';
      box.append(sec);
    });
  }
  chips.addEventListener('click', e => {
    const b = e.target.closest('[data-t]');
    if (!b) return;
    chips.querySelectorAll('button').forEach(x => x.className = 'btn sm ghost');
    b.className = 'btn sm';
    render(b.dataset.t);
  });
  render('全部');
})();
