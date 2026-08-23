#!/usr/bin/env node
/* ============================================================
   gen-pages.mjs — 一次性生成所有页面壳（内容运行时由数据渲染）
   用法：node scripts/gen-pages.mjs
   ============================================================ */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { CHAPTERS, MODULES } from '../js/data.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const FAVICON = "data:image/svg+xml," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#b4482b"/><text x="32" y="44" font-size="34" text-anchor="middle" fill="#fff" font-family="serif" font-weight="bold">智</text></svg>`
);

function shell({ title, page, module: mod, depth, script, crumb }) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>v2.1 · ${title}</title>
<link rel="icon" href="${FAVICON}">
<link rel="stylesheet" href="${depth}css/site.css">
<link rel="stylesheet" href="${depth}css/components.css">
${crumb ? `<meta name="crumb" content="${crumb}">` : ''}
</head>
<body data-page="${page}"${mod ? ` data-module="${mod}"` : ''}${crumb ? ` data-crumb="${crumb}"` : ''}>
<main class="main"><div class="content" id="content"></div></main>
<script type="module" src="${depth}${script}"></script>
</body>
</html>
`;
}

function write(rel, html) {
  const p = join(ROOT, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, html);
  console.log('✓', rel);
}

/* 门户 */
write('index.html', shell({ title: '人工智能导论 · 交互式课程', page: 'home', depth: '', script: 'js/portal.js' }));

/* 模块首页 / 章首页 / 小节页 */
for (const [mid] of Object.entries(MODULES)) {
  write(join('modules', mid, 'index.html'),
    shell({ title: `${MODULES[mid].tag} · 人工智能导论`, page: `module:${mid}`, module: mid, depth: '../../', script: 'js/module-page.js' }));
}
for (const ch of CHAPTERS) {
  write(join('modules', ch.module, `ch${ch.id}.html`),
    shell({ title: `${ch.num} ${ch.title} · 人工智能导论`, page: `ch${ch.id}`, module: ch.module, depth: '../../', script: 'js/pages.js' }));
  for (const sec of ch.sections) {
    write(join('modules', ch.module, `ch${ch.id}-${sec.id}.html`),
      shell({ title: `${sec.title} · ${ch.num} ${ch.title}`, page: `ch${ch.id}-${sec.id}`, module: ch.module, depth: '../../', script: 'js/pages.js' }));
  }
}

/* 笔记 */
write('notes.html', shell({ title: '我的笔记 · 人工智能导论', page: 'notes', depth: '', script: 'js/notes-page.js', crumb: '我的笔记' }));

/* 测评中心 */
const quizPages = [
  ['index.html', '测评中心 · 人工智能导论', 'quiz-home'],
  ['practice.html', '章节练习 · 人工智能导论', 'quiz-practice'],
  ['review.html', '间隔复习 · 人工智能导论', 'quiz-review'],
  ['wrong.html', '错题本 · 人工智能导论', 'quiz-wrong'],
  ['dashboard.html', '学习仪表盘 · 人工智能导论', 'quiz-dashboard'],
];
for (const [f, t, p] of quizPages)
  write(join('quiz', f), shell({ title: t, page: p, depth: '../', script: 'js/quiz-pages.js', crumb: '测评中心' }));

/* 答疑 & 参考资料 */
write(join('faq', 'index.html'), shell({ title: '答疑中心 · 人工智能导论', page: 'faq', depth: '../', script: 'js/faq-page.js', crumb: '答疑中心' }));
write(join('references', 'index.html'), shell({ title: '参考资料 · 人工智能导论', page: 'references', depth: '../', script: 'js/refs-page.js', crumb: '参考资料' }));

console.log('\n全部页面壳生成完毕。');
