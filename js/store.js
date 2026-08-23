/* ============================================================
   store.js — 本地存储层：进度 / 间隔重复 / 错题本 / 笔记 / 设置
   全部数据存 localStorage，键前缀 aic:
   ============================================================ */

const PREFIX = 'aic:';

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch { return fallback; }
}
function write(key, val) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(val)); } catch (e) { console.warn('存储失败', e); }
}

/* ---------- 主题 ---------- */
export const theme = {
  get() { return localStorage.getItem(PREFIX + 'theme') || 'light'; },
  set(v) { localStorage.setItem(PREFIX + 'theme', v); },
  toggle() { const v = this.get() === 'dark' ? 'light' : 'dark'; this.set(v); return v; }
};

/* ---------- 阅读进度 ---------- */
export const progress = {
  all() { return read('progress', {}); },
  markDone(pageId) {
    const p = this.all();
    if (!p[pageId]) { p[pageId] = Date.now(); write('progress', p); }
  },
  isDone(pageId) { return !!this.all()[pageId]; },
  count() { return Object.keys(this.all()).length; }
};

/* ---------- 间隔重复（简化 SM-2） ----------
   记录: { due: 到期时间戳, ivl: 间隔天数, reps: 连续正确次数, lapses: 失误次数 }
   答对: ivl = ivl===0 ? 1 : ivl*2（封顶 64 天）；答错: ivl=0，次日重现 */
export const srs = {
  all() { return read('srs', {}); },
  get(qid) { return this.all()[qid]; },
  answer(qid, correct) {
    const s = this.all();
    const rec = s[qid] || { due: 0, ivl: 0, reps: 0, lapses: 0 };
    if (correct) {
      rec.ivl = rec.ivl === 0 ? 1 : Math.min(rec.ivl * 2, 64);
      rec.reps += 1;
      rec.due = Date.now() + rec.ivl * 864e5;
    } else {
      rec.ivl = 0; rec.reps = 0; rec.lapses += 1;
      rec.due = Date.now() + 864e5;
    }
    s[qid] = rec; write('srs', s);
  },
  dueList() {
    const now = Date.now();
    return Object.entries(this.all())
      .filter(([, r]) => r.due <= now)
      .map(([qid]) => qid);
  },
  dueCount() { return this.dueList().length; },
  masteredCount() {
    return Object.values(this.all()).filter(r => r.ivl >= 7).length;
  }
};

/* ---------- 错题本 ---------- */
export const wrongbook = {
  all() { return read('wrong', {}); },
  add(qid) {
    const w = this.all();
    w[qid] = { ts: Date.now(), times: (w[qid]?.times || 0) + 1 };
    write('wrong', w);
  },
  remove(qid) {
    const w = this.all();
    if (w[qid]) { delete w[qid]; write('wrong', w); }
  },
  has(qid) { return !!this.all()[qid]; },
  ids() { return Object.keys(this.all()); }
};

/* ---------- 答题统计 ---------- */
export const stats = {
  all() { return read('stats', { answered: 0, correct: 0, byCh: {} }); },
  record(chId, correct) {
    const s = this.all();
    s.answered += 1;
    if (correct) s.correct += 1;
    s.byCh[chId] = s.byCh[chId] || { a: 0, c: 0 };
    s.byCh[chId].a += 1;
    if (correct) s.byCh[chId].c += 1;
    write('stats', s);
  }
};

/* ---------- 划线笔记 ----------
   { id, pageId, pageTitle, text, prefix, suffix, intent, note, ts }
   intent: confused | important | doubt | dig */
export const notes = {
  all() { return read('notes', []); },
  of(pageId) { return this.all().filter(n => n.pageId === pageId); },
  add(n) {
    const list = this.all();
    n.id = 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    n.ts = Date.now();
    list.push(n); write('notes', list);
    return n;
  },
  update(id, patch) {
    const list = this.all();
    const n = list.find(x => x.id === id);
    if (n) { Object.assign(n, patch); write('notes', list); }
  },
  remove(id) {
    write('notes', this.all().filter(x => x.id !== id));
  },
  exportMarkdown(pageTitle) {
    const INTENT = { confused: '❓ 不懂', important: '⭐ 重要', doubt: '⚠️ 存疑', dig: '🔎 深挖' };
    const list = pageTitle ? this.all().filter(n => n.pageTitle === pageTitle) : this.all();
    if (!list.length) return '';
    let md = `# 《人工智能导论》学习笔记\n\n> 导出时间：${new Date().toLocaleString('zh-CN')}\n\n`;
    const byPage = {};
    list.forEach(n => { (byPage[n.pageTitle] = byPage[n.pageTitle] || []).push(n); });
    for (const [pt, ns] of Object.entries(byPage)) {
      md += `## ${pt}\n\n`;
      ns.forEach(n => {
        md += `- ${INTENT[n.intent] || n.intent} 「${n.text}」\n`;
        if (n.note) md += `  - 批注：${n.note}\n`;
      });
      md += '\n';
    }
    return md;
  }
};

/* ---------- AI 问答设置 ---------- */
export const aiCfg = {
  all() {
    return read('ai-cfg', { base: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4.6', key: '' });
  },
  save(cfg) { write('ai-cfg', { ...this.all(), ...cfg }); },
  get hasKey() { return !!this.all().key; }
};

/* ---------- 学习计划打卡（可选轻量） ---------- */
export function resetAll() {
  Object.keys(localStorage)
    .filter(k => k.startsWith(PREFIX))
    .forEach(k => localStorage.removeItem(k));
}
