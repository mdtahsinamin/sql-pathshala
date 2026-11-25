/* AI টিউটর — API key থাকলে Claude (Anthropic SDK, browser), না থাকলে অফলাইন বিশ্লেষক */
(function () {
  'use strict';
  const { $, esc, t, store, pick } = SB;
  const SDK_URL = 'https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@1.8.0/+esm';
  const MODELS = [
    ['claude-opus-5-5', 'Claude Opus 5.5'],
    ['claude-sonnet-5-5', 'Claude Sonnet 5.5'],
    ['claude-haiku-5-5', 'Claude Haiku 5.5']
  ];
  let history = [];      // API-তে পাঠানোর জন্য সম্পূর্ণ content block সহ
  let busy = false;
  let sdkPromise = null;

  const getKey = () => { try { return localStorage.getItem('sqlbn-ai-key') || ''; } catch (e) { return ''; } };
  const getModel = () => store.get('sqlbn-ai-model', MODELS[0][0]);
  // সাইটের মালিক js/config.js-এ proxy দিলে key ছাড়াই সবাই AI পায়; ইউজার নিজের proxy-ও দিতে পারে
  const getProxy = () => store.get('sqlbn-ai-proxy', '') || ((window.SQLBN_CONFIG || {}).aiProxy || '');
  const isOnline = () => !!(getKey() || getProxy());
  function makeClient(Anthropic) {
    const proxy = getProxy();
    // নিজের key থাকলে সরাসরি Anthropic-এ; না থাকলে proxy (proxy সার্ভারে আসল key থাকে)
    if (getKey()) return new Anthropic({ apiKey: getKey(), dangerouslyAllowBrowser: true });
    return new Anthropic({ apiKey: 'proxy', baseURL: proxy.replace(/\/+$/, ''), dangerouslyAllowBrowser: true });
  }
  const proxyModel = () => (getKey() ? getModel() : ((window.SQLBN_CONFIG || {}).aiModel || getModel()));

  // ───────────── ছোট Markdown রেন্ডারার ─────────────
  function md(text) {
    const blocks = [];
    let s = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (m, lang, code) => { blocks.push(code.replace(/\n$/, '')); return `\u0000${blocks.length - 1}\u0000`; });
    s = esc(s)
      .replace(/`([^`\n]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>')
      .replace(/^#{1,4}\s+(.+)$/gm, '<b>$1</b>');
    const lines = s.split('\n'); let html = '', list = null;
    for (const ln of lines) {
      const m = ln.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
      if (m) { if (!list) { list = /^\s*\d/.test(ln) ? 'ol' : 'ul'; html += `<${list}>`; } html += `<li>${m[1]}</li>`; continue; }
      if (list) { html += `</${list}>`; list = null; }
      html += ln.trim() ? `<p>${ln}</p>` : '';
    }
    if (list) html += `</${list}>`;
    return html.replace(/<p>\u0000(\d+)\u0000<\/p>|\u0000(\d+)\u0000/g, (m, a, b) => {
      const code = blocks[+(a || b)];
      return `<div class="tutor-code"><pre class="syntax">${esc(code)}</pre><button class="btn sm" data-use="${encodeURIComponent(code)}">${t('useSolution')}</button></div>`;
    });
  }

  // ───────────── কনটেক্সট ─────────────
  function currentSql() { const cm = SB.activeEditor; return cm && cm.getWrapperElement().isConnected ? cm.getValue().trim() : ''; }
  function contextText() {
    const c = SB.context || {};
    const strip = h => String(h || '').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    const parts = [`Page: ${c.where || 'unknown'}${c.title ? ' — ' + strip(c.title) : ''}`];
    if (c.seed === 'job') parts.push('Database: the "job prep" practice database (dept, emp, salesperson, customer, sales_order, depositor, borrower, student_info, employee_salary, t).');
    if (c.task) parts.push(`Current task: ${strip(c.task)}`);
    const sql = currentSql(); if (sql) parts.push('Learner\'s current SQL:\n```sql\n' + sql + '\n```');
    if (c.lastError) parts.push(`Last error from SQLite: ${c.lastError}`);
    if (c.lastVerdict) parts.push(`Checker feedback: ${strip(c.lastVerdict)}`);
    return parts.join('\n');
  }
  function schemaText() {
    const fmt = (seed) => { const db = SB.freshDb(seed); const s = SB.schemaOf(db).map(tb => `${tb.name}(${tb.cols.map(c => c.name + (c.pk ? ' PK' : '') + (c.fk ? ' FK' : '')).join(', ')})`).join('\n'); db.close(); return s; };
    if (!schemaText.cache) schemaText.cache = `Main course database:\n${fmt(window.SEED_SQL)}\n\nJob-prep practice database:\n${fmt(window.JOB_SEED_SQL)}`;
    return schemaText.cache;
  }
  function systemPrompt() {
    return `You are the AI tutor inside "SQL Pathshala" (SQL পাঠশালা), a free site that teaches SQL to learners in Bangladesh — students, job seekers preparing for government/bank IT exams, and candidates for CSE lecturer posts.

How to teach:
- Reply in the language the learner writes in. If they write in Bangla or Banglish, answer in clear, simple Bangla and keep SQL keywords and technical terms in English. The site's current language setting is given in each message.
- Guide rather than hand over answers. When the learner is working on an exercise or challenge and asks what's wrong or for a hint, point to the specific mistake or give the next step. Give a complete solution only when they explicitly ask for it.
- When explaining a query, follow the real execution order (FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT).
- The site runs SQLite 3.45 in the browser, so write SQLite-compatible SQL. When it helps for job exams, briefly note how MySQL, PostgreSQL, Oracle or SQL Server differ.
- Keep answers short: a few sentences or a short list, under about 180 words unless the learner asks for detail. Put SQL in \`\`\`sql code blocks.
- Use the schema below; don't invent tables or columns.

${schemaText()}`;
  }

  // ───────────── অফলাইন টিউটর ─────────────
  const CONCEPTS = [
    [/join/i, { bn: '**JOIN** দুই টেবিলের রো মিলিয়ে পাশাপাশি বসায়। `INNER JOIN` শুধু মিল থাকা রো দেয়; `LEFT JOIN` বাম টেবিলের সব রো রাখে, মিল না থাকলে ডানে NULL। অমিল খুঁজতে: `LEFT JOIN ... WHERE right.id IS NULL`।', en: '**JOIN** matches rows of two tables and places them side by side. `INNER JOIN` keeps only matches; `LEFT JOIN` keeps every left row with NULLs where there is no match. To find unmatched rows: `LEFT JOIN ... WHERE right.id IS NULL`.' }],
    [/having|group\s*by/i, { bn: '**GROUP BY** একই মানের রোগুলোকে এক দলে আনে, প্রতিটি দল থেকে একটি রো। **WHERE** গ্রুপিংয়ের আগে রো ফিল্টার করে; **HAVING** পরে দল ফিল্টার করে, তাই HAVING-এ COUNT/SUM চলে।', en: '**GROUP BY** gathers rows with the same value into one group, one output row per group. **WHERE** filters rows before grouping; **HAVING** filters groups afterwards, so COUNT/SUM work in HAVING.' }],
    [/null/i, { bn: '**NULL** মানে "অজানা"। `= NULL` কখনো সত্য নয় — `IS NULL` / `IS NOT NULL` লেখো। COUNT(*) ছাড়া সব অ্যাগ্রিগেট NULL উপেক্ষা করে। NULL-এর বদলে মান দেখাতে `COALESCE(col, \'N/A\')`।', en: '**NULL** means "unknown". `= NULL` is never true — write `IS NULL` / `IS NOT NULL`. Every aggregate except COUNT(*) ignores NULL. Show a default with `COALESCE(col, \'N/A\')`.' }],
    [/subquer|সাবকুয়েরি|in\s*\(/i, { bn: '**সাবকুয়েরি** = কুয়েরির ভেতরে কুয়েরি। একটি মান দিলে `=` / `>` দিয়ে তুলনা, তালিকা দিলে `IN`, অস্তিত্ব যাচাইয়ে `EXISTS`। বাইরের রো ব্যবহার করলে correlated — প্রতিটি রো-র জন্য চলে।', en: 'A **subquery** is a query inside a query. One value → compare with `=` / `>`; a list → `IN`; existence → `EXISTS`. If it uses the outer row it is correlated and runs per row.' }],
    [/window|over|rank|row_number/i, { bn: '**উইন্ডো ফাংশন** রো না কমিয়ে পাশে হিসাব যোগ করে: `RANK() OVER (PARTITION BY dept ORDER BY salary DESC)`। "প্রতি দলের Top-N" = CTE-তে ROW_NUMBER, বাইরে `WHERE rn <= N`।', en: '**Window functions** add a calculation beside each row without collapsing rows: `RANK() OVER (PARTITION BY dept ORDER BY salary DESC)`. "Top N per group" = ROW_NUMBER in a CTE, then `WHERE rn <= N` outside.' }],
    [/second|2nd|third|3rd|nth|দ্বিতীয়|তৃতীয়/i, { bn: '**N-তম সর্বোচ্চ বেতন:** `SELECT DISTINCT salary FROM emp ORDER BY salary DESC LIMIT 1 OFFSET N-1;` অথবা DENSE_RANK() দিয়ে `WHERE rnk = N`। দ্বিতীয় সর্বোচ্চের ক্লাসিক: `SELECT MAX(salary) FROM emp WHERE salary < (SELECT MAX(salary) FROM emp);`', en: '**Nth highest salary:** `SELECT DISTINCT salary FROM emp ORDER BY salary DESC LIMIT 1 OFFSET N-1;` or DENSE_RANK() with `WHERE rnk = N`. The classic for 2nd highest: `SELECT MAX(salary) FROM emp WHERE salary < (SELECT MAX(salary) FROM emp);`' }],
    [/duplicate|ডুপ্লিকেট/i, { bn: '**ডুপ্লিকেট খোঁজা:** `GROUP BY col HAVING COUNT(*) > 1`। **মুছতে** (ছোট id রেখে): `DELETE FROM t WHERE id NOT IN (SELECT MIN(id) FROM t GROUP BY col);`', en: '**Find duplicates:** `GROUP BY col HAVING COUNT(*) > 1`. **Delete them** (keep the smallest id): `DELETE FROM t WHERE id NOT IN (SELECT MIN(id) FROM t GROUP BY col);`' }],
    [/normal|1nf|2nf|3nf|bcnf|নরমাল/i, { bn: '**নরমালাইজেশন:** 1NF — প্রতিটি ঘরে একটি মান; 2NF — composite key-এর অংশের উপর নির্ভরতা নেই; 3NF — non-key কলাম অন্য non-key-এর উপর নির্ভর নয়; BCNF — প্রতিটি নির্ধারক super key। মূলনীতি: "প্রতিটি তথ্য এক জায়গায়, একবার"।', en: '**Normalization:** 1NF — one value per cell; 2NF — no dependency on part of a composite key; 3NF — no non-key column depends on another non-key column; BCNF — every determinant is a super key. Principle: "every fact in one place, once".' }],
    [/inject|ইনজেকশন/i, { bn: '**SQL Injection:** ইউজারের ইনপুট সরাসরি কুয়েরিতে জোড়া দিলে `\' OR \'1\'=\'1` দিয়ে সব ডেটা বের করা যায়। প্রতিরোধ: parameterized query (`WHERE name = ?`), ORM, least privilege, raw এরর লুকানো।', en: '**SQL injection:** gluing user input into a query lets `\' OR \'1\'=\'1` dump all data. Defences: parameterized queries (`WHERE name = ?`), ORMs, least privilege, hiding raw errors.' }],
    [/index|ইনডেক্স/i, { bn: '**Index** বইয়ের সূচিপত্রের মতো — WHERE/JOIN/ORDER BY-র কলামে দিলে খোঁজা দ্রুত হয়, কিন্তু INSERT/UPDATE একটু ধীর হয়। `EXPLAIN QUERY PLAN` দিয়ে দেখো SCAN নাকি SEARCH USING INDEX।', en: 'An **index** is like a book\'s index — on WHERE/JOIN/ORDER BY columns it speeds up lookups, but slows INSERT/UPDATE slightly. Check with `EXPLAIN QUERY PLAN`: SCAN vs SEARCH USING INDEX.' }],
    [/transaction|acid|commit|rollback/i, { bn: '**ট্রানজ্যাকশন:** `BEGIN; ... COMMIT;` — সব হবে নয়তো কিছুই না; ভুল হলে `ROLLBACK`। ACID = Atomicity, Consistency, Isolation, Durability।', en: '**Transactions:** `BEGIN; ... COMMIT;` — all or nothing; `ROLLBACK` on mistakes. ACID = Atomicity, Consistency, Isolation, Durability.' }],
    [/primary|foreign|key|কি/i, { bn: '**Primary Key** প্রতিটি রো চেনায় (UNIQUE + NOT NULL)। **Foreign Key** অন্য টেবিলের PK-কে নির্দেশ করে, অস্তিত্বহীন রেফারেন্স আটকায় (referential integrity)। FK-তে ডুপ্লিকেট ও NULL চলে।', en: 'A **primary key** identifies each row (UNIQUE + NOT NULL). A **foreign key** points to another table\'s PK and blocks references to missing rows (referential integrity). FKs allow duplicates and NULL.' }]
  ];

  function lint(sql) {
    const L = I18N.lang === 'en' ? 1 : 0;
    const out = [];
    const noStr = sql.replace(/'(?:[^']|'')*'/g, "''");
    const add = (bn, en) => out.push([bn, en][L]);
    if (/(=|!=|<>)\s*NULL\b/i.test(noStr)) add('`= NULL` কখনো সত্য হয় না — `IS NULL` বা `IS NOT NULL` লেখো।', '`= NULL` is never true — write `IS NULL` or `IS NOT NULL`.');
    const where = (noStr.match(/\bWHERE\b([\s\S]*?)(\bGROUP\s+BY\b|\bORDER\s+BY\b|\bHAVING\b|\bLIMIT\b|;|$)/i) || [])[1] || '';
    if (/\b(COUNT|SUM|AVG|MIN|MAX)\s*\(/i.test(where.replace(/\([^()]*SELECT[\s\S]*?\)/gi, ''))) add('WHERE-এর ভেতরে COUNT/SUM/AVG চলে না — দলের উপর শর্ত হলে `HAVING`, অথবা সাবকুয়েরি `(SELECT AVG(...) FROM ...)` ব্যবহার করো।', 'COUNT/SUM/AVG are not allowed directly in WHERE — use `HAVING` for group conditions, or a subquery `(SELECT AVG(...) FROM ...)`.');
    if (/=\s*"[^"]*"/.test(sql)) add('টেক্সট মান ডাবল কোটে লেখা — স্ট্যান্ডার্ড SQL-এ টেক্সট সিঙ্গেল কোটে: `\'Dhaka\'`। ডাবল কোট মানে কলামের নাম।', 'A text value is in double quotes — standard SQL uses single quotes: `\'Dhaka\'`. Double quotes mean a column name.');
    if (/^\s*(UPDATE|DELETE)\b/im.test(noStr) && !/\bWHERE\b/i.test(noStr)) add('⚠️ WHERE ছাড়া UPDATE/DELETE পুরো টেবিলের সব রো বদলাবে/মুছবে! ইচ্ছাকৃত না হলে WHERE যোগ করো।', '⚠️ UPDATE/DELETE without WHERE affects every row in the table! Add WHERE unless that is intended.');
    if (/\bJOIN\b/i.test(noStr) && !/\bON\b|\bUSING\b/i.test(noStr) && !/\b(CROSS|NATURAL)\s+JOIN\b/i.test(noStr)) add('JOIN আছে কিন্তু `ON` শর্ত নেই — তাতে সব কম্বিনেশন (CROSS JOIN) তৈরি হবে। `ON a.x = b.y` যোগ করো।', 'There is a JOIN without an `ON` condition — that produces every combination (CROSS JOIN). Add `ON a.x = b.y`.');
    if (/\bLIMIT\b/i.test(noStr) && !/\bORDER\s+BY\b/i.test(noStr)) add('ORDER BY ছাড়া LIMIT দিলে কোন রোগুলো আসবে নিশ্চিত নয় — "সবচেয়ে বেশি/কম" চাইলে ORDER BY লাগবে।', 'LIMIT without ORDER BY gives unpredictable rows — for "highest/lowest" you need ORDER BY.');
    if (/\bLIKE\s*'[^%_']*'/i.test(sql)) add('LIKE-এ `%` বা `_` নেই, তাই এটা হুবহু মিলের মতো কাজ করছে। "আছে" খুঁজতে `\'%text%\'`।', 'LIKE has no `%` or `_`, so it acts as an exact match. For "contains" use `\'%text%\'`.');
    const g = noStr.match(/\bGROUP\s+BY\b([\s\S]*?)(\bHAVING\b|\bORDER\b|\bLIMIT\b|;|$)/i);
    const sel = noStr.match(/\bSELECT\b([\s\S]*?)\bFROM\b/i);
    if (g && sel) {
      const groups = g[1].split(',').map(x => x.trim().toLowerCase());
      const bare = sel[1].split(',').map(x => x.trim()).filter(x => /^[\w.]+$/.test(x) && !/^\d+$/.test(x));
      const missing = bare.filter(x => !groups.includes(x.toLowerCase()) && !groups.includes(x.split('.').pop().toLowerCase()));
      if (missing.length) add(`SELECT-এ \`${missing.join(', ')}\` আছে কিন্তু GROUP BY-তে নেই এবং অ্যাগ্রিগেটও নয় — SQLite মেনে নিলেও MySQL (strict)/PostgreSQL/Oracle এরর দেবে।`, `\`${missing.join(', ')}\` is in SELECT but neither grouped nor aggregated — SQLite tolerates it, but MySQL (strict)/PostgreSQL/Oracle will error.`);
    }
    if (/\bBETWEEN\s+(\d+(?:\.\d+)?)\s+AND\s+(\d+(?:\.\d+)?)/i.test(noStr)) { const m = noStr.match(/\bBETWEEN\s+(\d+(?:\.\d+)?)\s+AND\s+(\d+(?:\.\d+)?)/i); if (+m[1] > +m[2]) add('BETWEEN-এ ছোট মান আগে লিখতে হয় — `BETWEEN 500 AND 5000`, উল্টো দিলে কোনো রো আসবে না।', 'BETWEEN needs the smaller value first — `BETWEEN 500 AND 5000`; reversed, it returns no rows.'); }
    if (/\bNOT\s+IN\s*\(\s*SELECT/i.test(noStr)) add('NOT IN (SELECT ...)-এ সাবকুয়েরি NULL ফেরত দিলে কোনো রো আসবে না — নিরাপদ বিকল্প `NOT EXISTS`।', 'If a NOT IN (SELECT ...) subquery returns a NULL, no rows come back — `NOT EXISTS` is the safe alternative.');
    return out;
  }

  function explainOffline(sql) {
    if (SB.explainText) { try { return SB.explainText(sql) + (I18N.lang === 'en' ? '\n\nTip: the **🧠 Explain** page shows this with nested subqueries.' : '\n\nটিপস: **🧠 ব্যাখ্যা** পেজে এটা আরও গুছিয়ে, সাবকুয়েরিসহ দেখা যায়।'); } catch (e) { } }
    const L = I18N.lang;
    const c = SB.parseSelect ? SB.parseSelect(sql) : { error: true };
    if (c.error) {
      const kw = (sql.trim().match(/^\s*(\w+)/) || [])[1] || '';
      const map = {
        INSERT: ['**INSERT** টেবিলে নতুন রো যোগ করে।', '**INSERT** adds new rows to a table.'], UPDATE: ['**UPDATE** বিদ্যমান রো-র মান বদলায় — WHERE যে রোগুলো বাছাই করে শুধু সেগুলো।', '**UPDATE** changes values of existing rows — only those picked by WHERE.'],
        DELETE: ['**DELETE** রো মুছে ফেলে — WHERE যেগুলো বাছাই করে।', '**DELETE** removes rows — those picked by WHERE.'], CREATE: ['**CREATE** নতুন টেবিল/ইনডেক্স/ভিউ/ট্রিগার তৈরি করে।', '**CREATE** makes a new table/index/view/trigger.'],
        ALTER: ['**ALTER TABLE** টেবিলের গঠন বদলায় (কলাম যোগ/নাম বদল/মুছা)।', '**ALTER TABLE** changes a table\'s structure (add/rename/drop columns).'], DROP: ['**DROP** পুরো অবজেক্ট (গঠন + ডেটা) মুছে ফেলে।', '**DROP** deletes the whole object (structure + data).'],
        WITH: ['**WITH (CTE)** আগে একটি নামযুক্ত অস্থায়ী ফলাফল বানায়, তারপর মূল কুয়েরি সেটাকে টেবিলের মতো ব্যবহার করে।', '**WITH (CTE)** first builds a named temporary result, then the main query uses it like a table.'],
        BEGIN: ['**BEGIN** ট্রানজ্যাকশন শুরু করে; COMMIT করলে স্থায়ী, ROLLBACK করলে বাতিল।', '**BEGIN** starts a transaction; COMMIT makes it permanent, ROLLBACK cancels it.']
      };
      const m = map[kw.toUpperCase()];
      return m ? m[L === 'en' ? 1 : 0] : (L === 'en' ? 'I can explain SELECT queries step by step offline. For other statements, add an API key in settings for a full explanation.' : 'অফলাইনে SELECT কুয়েরি ধাপে ধাপে ব্যাখ্যা করতে পারি। অন্য স্টেটমেন্টের পূর্ণ ব্যাখ্যার জন্য সেটিংসে API key দাও।');
    }
    const steps = [];
    const S = (bn, en) => steps.push(L === 'en' ? en : bn);
    if (c.from) S(`**FROM** \`${c.from}\` — ${c.hasJoin ? 'টেবিলগুলো JOIN করে রো জোড়া লাগানো হয়' : 'এই টেবিলের সব রো নেওয়া হয়'}।`, `**FROM** \`${c.from}\` — ${c.hasJoin ? 'the tables are joined row by row' : 'every row of this table is taken'}.`);
    if (c.where) S(`**WHERE** \`${c.where}\` — যেসব রো-তে শর্ত সত্য শুধু সেগুলো থাকে।`, `**WHERE** \`${c.where}\` — only rows where this is true remain.`);
    if (c.groupBy) S(`**GROUP BY** \`${c.groupBy}\` — একই মানের রোগুলো এক দলে; প্রতিটি দল থেকে একটি রো।`, `**GROUP BY** \`${c.groupBy}\` — rows with equal values form one group; one row per group.`);
    if (c.having) S(`**HAVING** \`${c.having}\` — যেসব দল শর্ত পূরণ করে সেগুলো থাকে।`, `**HAVING** \`${c.having}\` — only groups meeting this remain.`);
    S(`**SELECT** \`${c.selectBody}\` — এই কলাম/হিসাবগুলো দেখানো হয়${c.distinct ? ', DISTINCT ডুপ্লিকেট বাদ দেয়' : ''}।`, `**SELECT** \`${c.selectBody}\` — these columns/expressions are output${c.distinct ? ', DISTINCT removes duplicates' : ''}.`);
    if (c.orderBy) S(`**ORDER BY** \`${c.orderBy}\` — ফলাফল সাজানো হয়।`, `**ORDER BY** \`${c.orderBy}\` — the result is sorted.`);
    if (c.limit) S(`**LIMIT** \`${c.limit}\` — শেষে নির্দিষ্ট সংখ্যক রো রাখা হয়।`, `**LIMIT** \`${c.limit}\` — finally only this many rows are kept.`);
    return (L === 'en' ? 'The database runs your query in this order:\n' : 'ডেটাবেস তোমার কুয়েরি এই ক্রমে চালায়:\n') + steps.map((s, i) => `${i + 1}. ${s}`).join('\n') +
      (L === 'en' ? '\n\nTip: press **🔍 Visualize** to watch the rows at each step.' : '\n\nটিপস: **🔍 ভিজুয়ালাইজ** চাপলে প্রতিটি ধাপে রোগুলোর কী হয় দেখতে পাবে।');
  }

  function offline(action, question) {
    const L = I18N.lang === 'en' ? 1 : 0;
    const sql = currentSql();
    const c = SB.context || {};
    const seed = c.seed === 'job' ? window.JOB_SEED_SQL : undefined;
    if (action === 'explain') return sql ? explainOffline(sql) : [ 'এডিটরে কোনো কুয়েরি নেই। আগে কিছু লেখো।', 'The editor is empty. Write a query first.'][L];
    if (action === 'wrong') {
      if (!sql) return ['এডিটরে কোনো কুয়েরি নেই।', 'The editor is empty.'][L];
      const out = [];
      const db = SB.freshDb(seed);
      try { db.exec(sql); } catch (e) { out.push(['**SQLite এরর:** ', '**SQLite error:** '][L] + SB.explainError(e.message).replace(/<[^>]+>/g, '')); }
      finally { db.close(); }
      out.push(...lint(sql));
      if (c.exercise && !out.length) {
        const r = SB.checkExercise(c.exercise, sql, seed);
        out.push(r.verdict && r.verdict.ok ? ['✅ তোমার উত্তর সঠিক!', '✅ Your answer is correct!'][L] : (r.verdict ? r.verdict.msg.replace(/<[^>]+>/g, '') : ''));
      }
      return out.length ? out.map(x => '- ' + x).join('\n') : ['স্পষ্ট কোনো ভুল পাইনি। প্রশ্নটা আবার পড়ে দেখো কোন কলাম ও কোন শর্ত চাওয়া হয়েছে; প্রত্যাশিত আউটপুটের সাথে মিলিয়ে দেখো।', 'I found no obvious mistake. Re-read which columns and conditions the task asks for, and compare with the expected output.'][L];
    }
    if (action === 'hint') {
      const ex = c.exercise; const hints = c.hints || [];
      if (hints.length) { const i = Math.min((offline.hintIdx = (offline.hintIdx || 0) + 1) - 1, hints.length - 1); return '💡 ' + hints[i].replace(/<[^>]+>/g, ''); }
      if (ex && ex.solution) {
        const kws = (ex.solution.toUpperCase().match(/\b(LEFT JOIN|JOIN|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET|DISTINCT|LIKE|BETWEEN|IN|NOT EXISTS|EXISTS|COALESCE|CASE|OVER|PARTITION BY|UNION|EXCEPT|INTERSECT|WITH)\b/g) || []);
        const uniq = [...new Set(kws)].slice(0, 4);
        return uniq.length ? ['💡 এই কিওয়ার্ডগুলো কাজে লাগবে: ', '💡 These keywords will help: '][L] + uniq.map(k => '`' + k + '`').join(', ') : ['💡 প্রশ্নে কোন টেবিল ও কোন কলাম চাওয়া হয়েছে আগে লিখে নাও।', '💡 First note which table and columns the task asks for.'][L];
      }
      return ['💡 ছোট ধাপে ভাবো: আগে `SELECT * FROM টেবিল` দেখো, তারপর WHERE, তারপর GROUP BY/ORDER BY যোগ করো।', '💡 Think in small steps: first `SELECT * FROM table`, then add WHERE, then GROUP BY/ORDER BY.'][L];
    }
    const text = (question || '') + ' ' + (action === 'concept' ? (c.title || '') + ' ' + sql : '');
    const hit = CONCEPTS.filter(([re]) => re.test(text)).slice(0, 2);
    if (hit.length) return hit.map(([, v]) => v[I18N.lang === 'en' ? 'en' : 'bn']).join('\n\n');
    return ['অফলাইন মোডে আমি কুয়েরি ব্যাখ্যা, ভুল খোঁজা আর হিন্ট দিতে পারি, এবং JOIN, GROUP BY, NULL, সাবকুয়েরি, উইন্ডো, নরমালাইজেশন, injection-এর মতো বিষয় সংক্ষেপে বোঝাতে পারি। যেকোনো প্রশ্নের বিস্তারিত উত্তরের জন্য ⚙ সেটিংসে Anthropic API key দাও।', 'Offline, I can explain queries, find mistakes, give hints, and briefly explain topics like JOIN, GROUP BY, NULL, subqueries, window functions, normalization and injection. For detailed answers to any question, add an Anthropic API key in ⚙ settings.'][L];
  }

  // ───────────── Claude (অনলাইন) ─────────────
  async function askClaude(userText, onDelta) {
    if (!sdkPromise) sdkPromise = import(SDK_URL);
    const mod = await sdkPromise;
    const Anthropic = mod.default;
    const client = makeClient(Anthropic);
    const model = proxyModel();
    const msg = { role: 'user', content: `[Site language: ${I18N.lang === 'en' ? 'English' : 'Bangla'}]\n[Context]\n${contextText()}\n[/Context]\n\n${userText}` };
    const messages = [...history, msg];
    const params = {
      model, max_tokens: 32000,
      output_config: { effort: 'low' },
      system: [{ type: 'text', text: systemPrompt(), cache_control: { type: 'ephemeral' } }],
      messages
    };
    if (model !== 'claude-haiku-5-5') { params.betas = ['server-side-fallback-2026-07-01']; params.fallbacks = 'default'; }
    try {
      const stream = client.beta.messages.stream(params);
      for await (const ev of stream) {
        if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') onDelta(ev.delta.text);
      }
      const final = await stream.finalMessage();
      if (final.stop_reason === 'refusal') return { error: t('errRefusal') };
      history.push(msg, { role: 'assistant', content: final.content });
      if (history.length > 20) history = history.slice(-20);
      return { ok: true };
    } catch (e) {
      if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) return { error: t('errAuth') };
      if (e instanceof Anthropic.RateLimitError) return { error: t('errRate') };
      if (e instanceof Anthropic.APIConnectionError) return { error: t('errNet') };
      if (e instanceof Anthropic.APIError) return { error: `${e.status || ''} ${esc(e.message || '')}` };
      return { error: esc(e.message || String(e)) };
    }
  }

  // ───────────── UI ─────────────
  function ensurePanel() {
    if ($('#tutorPanel')) return $('#tutorPanel');
    const p = document.createElement('aside');
    p.id = 'tutorPanel'; p.className = 'tutor'; p.setAttribute('aria-label', t('tutorTitle'));
    document.body.appendChild(p);
    draw();
    return p;
  }
  function draw() {
    const p = $('#tutorPanel'); if (!p) return;
    const online = isOnline();
    p.innerHTML = `
      <div class="tutor-head">
        <b>🤖 ${t('tutorTitle')}</b>
        <span class="tutor-mode ${online ? 'on' : ''}">${online ? MODELS.find(m => m[0] === getModel())?.[1] || 'Claude' : t('offlineTag')}</span>
        <span class="spacer"></span>
        <button class="icon-btn sm" data-a="settings" title="${t('settings')}">⚙</button>
        <button class="icon-btn sm" data-a="clear" title="${t('clearChat')}">🗑</button>
        <button class="icon-btn sm" data-a="close" title="${t('close')}">✕</button>
      </div>
      <div class="tutor-settings" hidden>
        <p class="muted">${t('keyHelp')}</p>
        <label>${t('apiKey')}<input type="password" id="tKey" placeholder="sk-ant-..." value="${esc(getKey())}" autocomplete="off"></label>
        <label>Proxy URL <small class="muted">(${I18N.lang === 'en' ? 'optional — instead of a key' : 'ঐচ্ছিক — key-এর বদলে'})</small><input id="tProxy" placeholder="https://….workers.dev" value="${esc(store.get('sqlbn-ai-proxy', ''))}" autocomplete="off"></label>
        <label>${t('model')}<select id="tModel">${MODELS.map(([id, l]) => `<option value="${id}" ${id === getModel() ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <div class="toolbar"><button class="btn sm primary" data-a="save">${t('save')}</button><button class="btn sm" data-a="remove">${t('removeKey')}</button></div>
        <p class="muted">${t('offlineMode')}</p>
      </div>
      <div class="tutor-msgs" id="tMsgs"><div class="tmsg bot">${t('tutorIntro')}<br><small class="muted">${online ? '' : t('offlineMode')}</small></div></div>
      <div class="tutor-quick">
        <button class="chip" data-q="explain">${t('qaExplain')}</button>
        <button class="chip" data-q="wrong">${t('qaWrong')}</button>
        <button class="chip" data-q="hint">${t('qaHint')}</button>
        <button class="chip" data-q="concept">${t('qaConcept')}</button>
      </div>
      <form class="tutor-input" id="tForm"><textarea id="tText" rows="2" placeholder="${t('tutorPlaceholder')}"></textarea><button class="btn primary" type="submit">${t('send')}</button></form>`;
    p.onclick = onClick;
    $('#tForm', p).onsubmit = e => { e.preventDefault(); send($('#tText', p).value); };
    $('#tText', p).onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e.target.value); } };
  }
  function onClick(e) {
    const b = e.target.closest('button'); if (!b) return;
    const p = $('#tutorPanel');
    if (b.dataset.use) { const code = decodeURIComponent(b.dataset.use); if (SB.activeEditor) { SB.activeEditor.setValue(code); SB.activeEditor.focus(); SB.toast(t('copied')); } return; }
    const a = b.dataset.a;
    if (a === 'close') toggle(false);
    if (a === 'settings') { const s = $('.tutor-settings', p); s.hidden = !s.hidden; }
    if (a === 'clear') { history = []; offline.hintIdx = 0; draw(); }
    if (a === 'save') { try { localStorage.setItem('sqlbn-ai-key', $('#tKey', p).value.trim()); } catch (e2) { } store.set('sqlbn-ai-model', $('#tModel', p).value); store.set('sqlbn-ai-proxy', $('#tProxy', p).value.trim()); SB.toast(t('keySaved')); draw(); }
    if (a === 'remove') { try { localStorage.removeItem('sqlbn-ai-key'); } catch (e2) { } draw(); }
    if (b.dataset.q) {
      const labels = { explain: t('qaExplain'), wrong: t('qaWrong'), hint: t('qaHint'), concept: t('qaConcept') };
      const prompts = {
        explain: 'Explain my current SQL query step by step, in execution order.',
        wrong: 'What is wrong with my current query for this task? Point to the mistake; do not give the full solution.',
        hint: 'Give me one hint for the next step of this task. Do not give the solution.',
        concept: 'Explain the main concept of this page simply, with one small example on this database.'
      };
      send(labels[b.dataset.q], b.dataset.q, prompts[b.dataset.q]);
    }
  }
  function addMsg(cls, html) {
    const box = $('#tMsgs'); const d = document.createElement('div');
    d.className = 'tmsg ' + cls; d.innerHTML = html; box.appendChild(d); box.scrollTop = box.scrollHeight; return d;
  }
  async function send(text, action, apiPrompt) {
    text = (text || '').trim(); if (!text || busy) return;
    const ta = $('#tText'); if (ta) ta.value = '';
    addMsg('me', esc(text));
    if (!isOnline()) {
      const reply = offline(action || 'free', text);
      addMsg('bot', md(reply));
      highlightIn($('#tMsgs').lastElementChild);
      return;
    }
    busy = true;
    const el = addMsg('bot', `<span class="muted">${t('thinking')}</span>`);
    let acc = '';
    const r = await askClaude(apiPrompt || text, d => { acc += d; el.innerHTML = md(acc); $('#tMsgs').scrollTop = 1e9; });
    if (r.error) el.innerHTML = (acc ? md(acc) : '') + `<div class="status err show">${r.error}</div>`;
    else { el.innerHTML = md(acc); highlightIn(el); }
    busy = false;
  }
  const highlightIn = el => SB.$$('pre.syntax', el).forEach(SB.highlight);

  function toggle(open) {
    const p = ensurePanel();
    const want = open === undefined ? !p.classList.contains('open') : open;
    p.classList.toggle('open', want);
    document.body.classList.toggle('tutor-open', want);
    if (want) setTimeout(() => { const ta = $('#tText'); if (ta) ta.focus(); }, 50);
  }
  // বাইরে থেকে: SB.tutor.ask('wrong') ইত্যাদি
  // ইতিহাস ছাড়া এক-বারের অনুরোধ (যেমন প্রশ্ন থেকে SQL বানানো)
  async function complete(system, userText, onDelta) {
    if (!sdkPromise) sdkPromise = import(SDK_URL);
    const mod = await sdkPromise; const Anthropic = mod.default;
    const client = makeClient(Anthropic); const model = proxyModel();
    const params = { model, max_tokens: 4000, output_config: { effort: 'low' }, system, messages: [{ role: 'user', content: userText }] };
    if (model !== 'claude-haiku-5-5') { params.betas = ['server-side-fallback-2026-07-01']; params.fallbacks = 'default'; }
    let text = '';
    try {
      const stream = client.beta.messages.stream(params);
      for await (const ev of stream) if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') { text += ev.delta.text; if (onDelta) onDelta(ev.delta.text); }
      const final = await stream.finalMessage();
      if (final.stop_reason === 'refusal') return { error: t('errRefusal') };
      return { text };
    } catch (e) {
      if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) return { error: t('errAuth') };
      if (e instanceof Anthropic.RateLimitError) return { error: t('errRate') };
      if (e instanceof Anthropic.APIConnectionError) return { error: t('errNet') };
      if (e instanceof Anthropic.APIError) return { error: `${e.status || ''} ${esc(e.message || '')}` };
      return { error: esc(e.message || String(e)) };
    }
  }
  SB.tutor = {
    complete, online: isOnline,
    toggle, redraw: () => { if ($('#tutorPanel')) draw(); },
    ask(action) { toggle(true); const btn = SB.$(`#tutorPanel [data-q="${action}"]`); if (btn) btn.click(); }
  };
})();
