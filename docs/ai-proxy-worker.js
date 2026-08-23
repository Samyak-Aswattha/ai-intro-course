/**
 * AI 助教 CORS 代理 · Cloudflare Worker（免费版即可）
 * 用途：浏览器直连大模型 API 被跨域拦截时，部署本脚本作为中转。
 * 部署：dash.cloudflare.com → Workers & Pages → Create Worker → 粘贴全文 → Deploy
 * 使用：课程网站 AI 助教设置中，接口地址填 https://<你的worker>.workers.dev/v4
 *
 * 安全说明：本代理默认只放行 POST /chat/completions，密钥仍由学生浏览器持有，
 * 并不经过你保管；如需彻底限制，把 ALLOW_ORIGINS 改成你的网站域名。
 */
const ALLOW_ORIGINS = '*'; // 例如 'https://your-course-site.github.io'

export default {
  async fetch(request) {
    const cors = {
      'Access-Control-Allow-Origin': ALLOW_ORIGINS,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: cors });

    const url = new URL(request.url);
    /* 路径 /v4/xxx → 上游 https://open.bigmodel.cn/api/paas/v4/xxx */
    const upstream = 'https://open.bigmodel.cn/api/paas/v4' + url.pathname.replace(/^\/v4/, '') + url.search;

    const resp = await fetch(upstream, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: await request.text(),
    });

    /* 流式响应透传 */
    const headers = new Headers(resp.headers);
    Object.entries(cors).forEach(([k, v]) => headers.set(k, v));
    return new Response(resp.body, { status: resp.status, headers });
  },
};
