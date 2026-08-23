#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 /tmp/tiku.txt（textutil 从题库 docx 转出）解析为 9 个章节 JS 题库文件。"""
import re, json, os

SRC = '/tmp/tiku.txt'
OUT = os.path.join(os.path.dirname(__file__), '..', 'data', 'quiz')
text = open(SRC, encoding='utf-8').read()
lines = [l.rstrip() for l in text.split('\n')]

# ---------- 切分大节 ----------
def section(start_pat, end_pat=None):
    s = next(i for i, l in enumerate(lines) if re.match(start_pat, l))
    e = len(lines)
    if end_pat:
        e = next((i for i, l in enumerate(lines) if i > s and re.match(end_pat, l)), len(lines))
    return lines[s:e]

sec_choice = section(r'^选择题', r'^填空题')
sec_fill   = section(r'^填空题', r'^判断题')
sec_judge  = section(r'^判断题', r'^简答题')
sec_short  = section(r'^简答题', r'^论述题')
sec_essay  = section(r'^论述题', r'^【|^### ')

# 案例分析题（紧凑版，位于文件后段）
case_start = next((i for i, l in enumerate(lines) if re.match(r'^1\. 【.+】', l)), None)
case_end = next((i for i, l in enumerate(lines) if i > (case_start or 0) and (l.startswith('###') or l.startswith('**') and '案例' in l)), len(lines))
sec_case = lines[case_start:case_end] if case_start else []

cases = []
cur = None
for l in sec_case:
    l = l.strip()
    if not l: continue
    m = re.match(r'^(\d+)\. 【(.+?)】\s*(.*)$', l)
    if m:
        if cur: cases.append(cur)
        cur = {'no': int(m.group(1)), 'title': m.group(2), 'q': '', 'answer': '', 'inAns': False}
        if m.group(3): cur['q'] = m.group(3)
    elif cur is not None:
        if l.startswith('参考答案:'):
            cur['inAns'] = True
            cur['answer'] += l[len('参考答案:'):].strip() + '\n'
        elif cur['inAns']:
            cur['answer'] += l + '\n'
        else:
            cur['q'] += l + '\n'
if cur: cases.append(cur)
print(f'案例分析 {len(cases)}')

# ---------- 解析 ----------
def parse_items(sec, kind):
    items, cur = [], None
    for l in sec:
        l = l.strip()
        if not l: continue
        m = re.match(r'^(\d+)\.\s*(.+)$', l)
        if m and not l.startswith('参考答案') and not re.match(r'^\d+\.\s*(参考答案|答案|解析)', l):
            if cur: items.append(cur)
            cur = {'no': int(m.group(1)), 'q': m.group(2).strip(), 'answer': '', 'explain': ''}
        elif cur is not None:
            if l.startswith('参考答案:'):
                cur['answer'] += l[len('参考答案:'):].strip()
            elif l.startswith('答案:'):
                cur['answer'] += l[len('答案:'):].strip()
            elif l.startswith('解析:'):
                cur['explain'] += l[len('解析:'):].strip()
            elif re.match(r'^[A-D]\.\s', l):
                cur.setdefault('opts', []).append(l)
            elif l.startswith('- '):
                cur['answer'] += '\n' + l
            else:
                # 多行参考答案续行
                if cur['answer']: cur['answer'] += ' ' + l
    if cur: items.append(cur)
    return items

choices = parse_items(sec_choice, 'choice')
fills   = parse_items(sec_fill, 'fill')
judges  = parse_items(sec_judge, 'judge')
shorts  = parse_items(sec_short, 'short')
essays  = parse_items(sec_essay, 'essay')
print(f'选择题 {len(choices)} 填空 {len(fills)} 判断 {len(judges)} 简答 {len(shorts)} 论述 {len(essays)}')

# ---------- 章节打标 ----------
TAGS = [
    ('06', r'注意力|Transformer|变换器|GPT|大语言|大模型|生成对抗|GAN|扩散|多模态|预训练|AlphaGo|BERT|深蓝|机器翻译|语音识别|人脸识别'),
    ('05', r'卷积|CNN|循环神经|RNN|LSTM|长短期|特征提取|层次化特征|词向量|嵌入|深度学习'),
    ('07', r'伦理|隐私|偏见|就业|安全|责任|滥用|失业'),
    ('09', r'提示词|智能体|Agent|RAG|本地部署|检索增强'),
    ('08', r'诗|创作|艺术|意识|中文屋|哲学|写作'),
    ('04', r'神经网络|感知机|激活函数|反向传播|神经元|权重|学习率|黑箱'),
    ('03', r'机器学习|监督|无监督|强化学习|过拟合|欠拟合|分类|回归|聚类|训练集|测试集|决策树|近邻|KNN|贝叶斯|偏差|方差|泛化|梯度'),
    ('02', r'专家系统|知识库|推理机|知识表示|符号|搜索|语义网络|知识'),
    ('01', r'图灵|达特茅斯|寒冬|二进制|人工智能|发展|历史|要素|智能'),
]
def tag(q):
    for ch, pat in TAGS:
        if re.search(pat, q): return ch
    return '01'

# ---------- 组装 ----------
items = []
seen_q = set()   # 按题干去重（A/B/C 套间重复）
def dedup_key(q):
    return re.sub(r'[\s，。？?、:："\'（）()]+', '', q)[:40]
cid = 0
for it in choices:
    opts = it.get('opts', [])
    if len(opts) < 4 or not it['answer']:
        continue
    k = dedup_key(it['q'])
    if k in seen_q: continue
    seen_q.add(k)
    cid += 1
    items.append({
        'id': f'c{cid}', 'ch': tag(it['q']), 'type': 'single', 'diff': 1,
        'q': it['q'],
        'opts': [re.sub(r'^[A-D]\.\s*', '', o) for o in opts[:4]],
        'answer': it['answer'].strip()[:1],
        'explain': it['explain'] or '见课程对应章节。'
    })
for it in fills:
    if not it['answer']: continue
    k = dedup_key(it['q'])
    if k in seen_q: continue
    seen_q.add(k)
    cid += 1
    items.append({
        'id': f'f{cid}', 'ch': tag(it['q']), 'type': 'fill', 'diff': 2,
        'q': it['q'], 'answer': it['answer'], 'explain': it['explain'] or ''
    })
for it in judges:
    if not it['answer']: continue
    k = dedup_key(it['q'])
    if k in seen_q: continue
    seen_q.add(k)
    cid += 1
    ans = it['answer'].replace('（', '(').strip()
    val = '对' if ('√' in ans or '对' in ans or '(' not in ans) else '错'
    m = re.search(r'\((.+)\)', ans)
    if m: val = '对' if ('√' in m.group(1) or m.group(1) == 'T') else '错'
    items.append({
        'id': f'j{cid}', 'ch': tag(it['q']), 'type': 'judge', 'diff': 1,
        'q': it['q'], 'answer': val, 'explain': it['explain'] or ''
    })
for it in shorts:
    if not it['answer']: continue
    cid += 1
    items.append({
        'id': f's{cid}', 'ch': tag(it['q']), 'type': 'open', 'sub': '简答', 'diff': 3,
        'q': it['q'], 'ref': it['answer'].strip(),
        'hints': [
            '先回忆定义/分类框架，再按「是什么—为什么—怎么样」组织语言。',
            f'参考要点提示：{it["answer"].strip()[:40]}…'
        ]
    })
for it in essays:
    if not it['answer']: continue
    cid += 1
    items.append({
        'id': f'e{cid}', 'ch': tag(it['q']), 'type': 'open', 'sub': '论述', 'diff': 3,
        'q': it['q'], 'ref': it['answer'].strip(),
        'hints': [
            '论述题结构：亮观点 → 2-3 个分论点（各配例证）→ 回扣观点。可用课程概念作为理论支点。',
            f'评分要点提示：{it["answer"].strip()[:40]}…'
        ]
    })

print(f'有效题目共 {len(items)} 道')

# 案例分析入库
for it in cases:
    if not it['answer']: continue
    cid += 1
    items.append({
        'id': f'x{cid}', 'ch': tag(it['title'] + it['q']), 'type': 'open', 'sub': '案例分析', 'diff': 3,
        'q': f'【{it["title"]}】\n{it["q"].strip()}', 'ref': it['answer'].strip(),
        'hints': ['案例分析三步法：定位涉及的技术概念 → 用课程理论分析利弊 → 给出有依据的判断/建议。']
    })

# 合并人工补充题（scripts/extra-questions.json）
extra_path = os.path.join(os.path.dirname(__file__), 'extra-questions.json')
if os.path.exists(extra_path):
    extras = json.load(open(extra_path, encoding='utf-8'))
    for it in extras:
        cid += 1
        it['id'] = it.get('id') or f'x{cid}'
    items.extend(extras)
    print(f'补充题 +{len(extras)}')

by_ch = {}
for it in items:
    by_ch.setdefault(it['ch'], []).append(it)

os.makedirs(OUT, exist_ok=True)
for n in range(1, 10):
    ch = f'{n:02d}'
    lst = by_ch.get(ch, [])
    js = '/* 第 %s 章题库（源自《人工智能导论题库.docx》，脚本自动转换 + 章节打标） */\nexport default %s;\n' % (
        ch, json.dumps(lst, ensure_ascii=False, indent=1))
    open(os.path.join(OUT, ch + '.js'), 'w', encoding='utf-8').write(js)
    print(ch, len(lst))
print('完成')
