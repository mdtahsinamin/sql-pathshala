/**
 * SQL Pathshala — AI টিউটরের জন্য ছোট proxy (Cloudflare Worker)
 *
 * কেন: পাবলিক ওয়েবসাইটে API key বসানো যায় না (যে কেউ চুরি করতে পারে)। এই worker key-টা
 * সার্ভারে গোপন রাখে, শুধু তোমার সাইট থেকে আসা অনুরোধ নেয়, মডেল ও টোকেন সীমিত রাখে,
 * আর প্রতিটি IP-কে দিনে নির্দিষ্ট সংখ্যক প্রশ্ন করতে দেয়।
 *
 * ডিপ্লয় (একবার):
 *   1. npm i -g wrangler ; wrangler login
 *   2. এই ফোল্ডারে: wrangler init sql-ai  (বা ড্যাশবোর্ডে নতুন Worker বানিয়ে এই কোড পেস্ট)
 *   3. wrangler secret put ANTHROPIC_API_KEY      ← তোমার key
 *   4. wrangler.toml-এ:
 *        [vars]
 *        ALLOWED_ORIGIN = "https://your-site.example"   (কমা দিয়ে একাধিক দেওয়া যায়)
 *        DAILY_LIMIT = "30"
 *        [[kv_namespaces]]
 *        binding = "RATE"      ← wrangler kv namespace create RATE  দিয়ে বানানো id
 *        id = "..."
 *   5. wrangler deploy → পাওয়া URL js/config.js-এর aiProxy-তে বসাও।
 */
const ALLOWED_MODELS = ['claude-haiku-5-5', 'claude-sonnet-5-5'];
const MAX_TOKENS = 4000;

export default {
  async fetch(request, env) {
    const origins = (env.ALLOWED_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
    const origin = request.headers.get('Origin') || '';
    const allowOrigin = origins.includes(origin) ? origin : '';
    const cors = {
      'Access-Control-Allow-Origin': allowOrigin || 'null',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type, anthropic-version, anthropic-beta, anthropic-dangerous-direct-browser-access, x-api-key, x-stainless-arch, x-stainless-lang, x-stainless-os, x-stainless-package-version, x-stainless-runtime, x-stainless-runtime-version, x-stainless-retry-count, x-stainless-timeout',
      'Access-Control-Max-Age': '86400'
    };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const json = (obj, status) => new Response(JSON.stringify(obj), { status, headers: { ...cors, 'content-type': 'application/json' } });
    if (!allowOrigin) return json({ type: 'error', error: { type: 'permission_error', message: 'Origin not allowed' } }, 403);
    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/v1/messages') return json({ type: 'error', error: { type: 'not_found_error', message: 'Not found' } }, 404);

    // প্রতিদিন প্রতি IP-র সীমা
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const day = new Date().toISOString().slice(0, 10);
    const limit = parseInt(env.DAILY_LIMIT || '30', 10);
    if (env.RATE) {
      const k = `${day}:${ip}`;
      const used = parseInt((await env.RATE.get(k)) || '0', 10);
      if (used >= limit) return json({ type: 'error', error: { type: 'rate_limit_error', message: `Daily limit of ${limit} questions reached. Try again tomorrow.` } }, 429);
      await env.RATE.put(k, String(used + 1), { expirationTtl: 60 * 60 * 26 });
    }

    let body;
    try { body = await request.json(); } catch (e) { return json({ type: 'error', error: { type: 'invalid_request_error', message: 'Bad JSON' } }, 400); }
    if (!ALLOWED_MODELS.includes(body.model)) body.model = ALLOWED_MODELS[0];
    body.max_tokens = Math.min(body.max_tokens || MAX_TOKENS, MAX_TOKENS);
    delete body.tools; delete body.mcp_servers; // শুধু লেখা উত্তর

    const headers = { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': request.headers.get('anthropic-version') || '2023-06-01' };
    const beta = request.headers.get('anthropic-beta'); if (beta) headers['anthropic-beta'] = beta;
    const upstream = await fetch('https://api.anthropic.com/v1/messages' + url.search, { method: 'POST', headers, body: JSON.stringify(body) });
    return new Response(upstream.body, { status: upstream.status, headers: { ...cors, 'content-type': upstream.headers.get('content-type') || 'application/json' } });
  }
};
