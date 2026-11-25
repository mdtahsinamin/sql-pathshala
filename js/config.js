/* সাইটের মালিকের সেটিং — ওয়েবসাইট চালু করার পর এখানে বদলাও।
   aiProxy: server/ai-proxy-worker.js ডিপ্লয় করার পর তার URL দাও (যেমন 'https://sql-ai.yourname.workers.dev')।
            তাহলে ব্যবহারকারীদের নিজের API key লাগবে না — সবাই AI টিউটর পাবে (খরচ তোমার Anthropic অ্যাকাউন্টে)।
   aiModel: proxy দিয়ে কোন মডেল চলবে — খরচ কম রাখতে 'claude-haiku-5-5' ভালো। worker-এও একই মডেল অনুমোদিত থাকতে হবে।
   খালি রাখলে আগের মতো: প্রত্যেক ইউজার নিজের key দেবে, না দিলে অফলাইন টিউটর। */
window.SQLBN_CONFIG = {
  aiProxy: '',
  aiModel: 'claude-haiku-5-5'
};
