// সার্ভিস ওয়ার্কার — অ্যাপ ও CDN লাইব্রেরি ক্যাশ করে, যাতে ইন্টারনেট ছাড়াও চলে।
// (AI টিউটরের Anthropic API কল কখনো ক্যাশ হয় না।)
const VERSION = 'sqlbn-v7';
const APP_SHELL = [
  './', 'index.html', 'css/style.css', 'css/features.css', 'css/mock.css', 'css/practice.css', 'css/explain.css', 'css/more.css','icon.svg', 'manifest.webmanifest',
  'js/i18n.js', 'js/db.js', 'js/lessons.js', 'js/lessons-adv.js', 'js/lessons-en.js', 'js/challenges.js', 'js/jobprep.js', 'js/jobprep-en.js', 'js/practice-sets.js', 'js/practice-more.js', 'js/challenges-more.js',
  'js/core.js', 'js/visualizer.js', 'js/explain.js', 'js/dialect.js', 'js/er.js', 'js/tutor.js', 'js/profile.js', 'js/mock-review.js', 'js/config.js', 'js/skills.js', 'js/theory.js', 'js/cases.js', 'js/extras.js', 'js/app.js'
];
const CDN = [
  'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js',
  'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.wasm',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/sql/sql.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/hint/show-hint.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/hint/show-hint.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/hint/sql-hint.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/runmode/runmode.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/comment/comment.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(APP_SHELL).then(() => Promise.allSettled(CDN.map(u => c.add(u))))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.hostname === 'api.anthropic.com') return;
  const sameOrigin = url.origin === location.origin;
  // নিজের ফাইল: network-first (আপডেট সাথে সাথে পাবে), অফলাইনে ক্যাশ
  if (sameOrigin) {
    e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
    return;
  }
  // CDN ও ফন্ট: cache-first
  if (/cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(url.hostname)) {
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
      if (r.ok || r.type === 'opaque') { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
      return r;
    })));
  }
});
