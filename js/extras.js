/* বাড়তি ফিচার: ভুল উত্তরে তুলনা, ডেইলি চ্যালেঞ্জ, দুর্বল টপিক, কুয়েরি প্ল্যান, AI দিয়ে SQL বানানো, প্রিন্ট/PDF */
(function () {
  'use strict';
  const { $, $$, esc, store, n, pick, t } = SB;
  const EN = () => I18N.lang === 'en';
  const T = (bn, en) => (EN() ? en : bn);
  const C = s => `<code>${esc(s)}</code>`;
  const noStr = s => String(s || '').replace(/'(?:[^']|'')*'/g, "''").replace(/--.*$/gm, '');

  // ═══════════ ১. তোমার কুয়েরি বনাম সমাধান — কোথায় পার্থক্য ═══════════
  const FEATURES = [
    ['LEFT JOIN', /\bLEFT\s+(OUTER\s+)?JOIN\b/i], ['INNER JOIN / JOIN', /(^|[^T]\s)(INNER\s+)?JOIN\b/i], ['WHERE', /\bWHERE\b/i], ['GROUP BY', /\bGROUP\s+BY\b/i], ['HAVING', /\bHAVING\b/i],
    ['ORDER BY', /\bORDER\s+BY\b/i], ['DESC', /\bDESC\b/i], ['LIMIT', /\bLIMIT\b/i], ['OFFSET', /\bOFFSET\b|\bLIMIT\s+\d+\s*,/i], ['DISTINCT', /\bDISTINCT\b/i],
    ['COUNT()', /\bCOUNT\s*\(/i], ['SUM()', /\bSUM\s*\(/i], ['AVG()', /\bAVG\s*\(/i], ['MIN()', /\bMIN\s*\(/i], ['MAX()', /\bMAX\s*\(/i],
    [T('সাবকুয়েরি', 'subquery'), /\(\s*SELECT\b/i], ['EXISTS', /\bEXISTS\b/i], ['NOT IN', /\bNOT\s+IN\b/i], ['UNION', /\bUNION\b/i], ['WITH (CTE)', /^\s*WITH\b/i],
    [T('উইন্ডো ফাংশন (OVER)', 'window function (OVER)'), /\bOVER\s*\(/i], ['CASE', /\bCASE\b/i], ['LIKE', /\bLIKE\b/i], ['IS NULL', /\bIS\s+NULL\b/i], ['IS NOT NULL', /\bIS\s+NOT\s+NULL\b/i], ['BETWEEN', /\bBETWEEN\b/i], ['COALESCE/IFNULL', /\b(COALESCE|IFNULL)\s*\(/i]
  ];
  function tablesIn(sql) { const s = new Set(); noStr(sql).replace(/\b(?:FROM|JOIN|UPDATE|INTO)\s+["`]?(\w+)/gi, (_, x) => s.add(x.toLowerCase())); return s; }
  function compareHTML(user, ex, seed, revealed) {
    const sol = ex.solution, u = noStr(user), s = noStr(sol);
    const out = [];
    // ফলাফলের আকার
    let ures = null, eres = null, uerr = null;
    try { const r = SB.checkExercise(ex, user, seed); if (r.error) uerr = r.error; else ures = r.cmp; eres = r.expected || SB.expectedResult(ex, seed); } catch (e) { uerr = e.message; }
    const shape = r => r ? { rows: r.values.length, cols: r.columns.length } : { rows: 0, cols: 0 };
    if (uerr) out.push(`<div class="cmp-row bad">⛔ ${T('তোমার কুয়েরি এরর দিচ্ছে', 'Your query errors')}: ${SB.explainError ? SB.explainError(uerr) : esc(uerr)}</div>`);
    else {
      const a = shape(ures), b = shape(eres);
      out.push(`<table class="cmp-tbl"><tr><th></th><th>${T('তোমার ফলাফল', 'Your result')}</th><th>${T('প্রত্যাশিত', 'Expected')}</th></tr>
        <tr><td>${T('রো', 'Rows')}</td><td class="${a.rows === b.rows ? 'ok' : 'bad'}">${n(a.rows)}</td><td>${n(b.rows)}</td></tr>
        <tr><td>${T('কলাম', 'Columns')}</td><td class="${a.cols === b.cols ? 'ok' : 'bad'}">${n(a.cols)}</td><td>${n(b.cols)}</td></tr></table>`);
      if (a.rows > b.rows) out.push(`<div class="cmp-row">💡 ${T('তোমার কুয়েরি বেশি রো দিচ্ছে — কোনো শর্ত (WHERE/HAVING) বাদ পড়েছে, DISTINCT লাগবে, বা JOIN-এ মিলের শর্ত ঠিক নেই।', 'You return more rows — a condition (WHERE/HAVING) is missing, DISTINCT is needed, or a JOIN condition is wrong.')}</div>`);
      if (a.rows < b.rows) out.push(`<div class="cmp-row">💡 ${T('তোমার কুয়েরি কম রো দিচ্ছে — শর্ত বেশি কড়া, INNER JOIN-এ কিছু রো হারাচ্ছে (LEFT JOIN লাগবে?), বা LIMIT বেশি ছোট।', 'You return fewer rows — a condition is too strict, an INNER JOIN drops rows (need LEFT JOIN?), or LIMIT is too small.')}</div>`);
      if (a.rows === b.rows && a.cols === b.cols) out.push(`<div class="cmp-row">💡 ${T('আকার একই, কিন্তু মান আলাদা — হিসাবের সূত্র, কোন কলাম দেখাচ্ছ, বা সাজানোর ক্রম (ORDER BY) দেখো।', 'Same shape but different values — check the formula, which columns you show, or the sort order (ORDER BY).')}</div>`);
      if (a.cols !== b.cols) out.push(`<div class="cmp-row">💡 ${T('কলামের সংখ্যা মিলছে না — প্রশ্নে ঠিক কোন কোন কলাম চাওয়া হয়েছে আবার পড়ো।', 'The number of columns differs — re-read exactly which columns the task asks for.')}</div>`);
    }
    // গঠনগত পার্থক্য
    const miss = [], extra = [];
    FEATURES.forEach(([name, re]) => { const inS = re.test(s), inU = re.test(u); if (inS && !inU) miss.push(name); if (inU && !inS) extra.push(name); });
    const ts = tablesIn(sol), tu = tablesIn(user);
    const tMiss = [...ts].filter(x => !tu.has(x)), tExtra = [...tu].filter(x => !ts.has(x));
    const li = [];
    if (tMiss.length) li.push(T(`সমাধানে এই টেবিল লাগে কিন্তু তোমার কুয়েরিতে নেই: ${tMiss.map(C).join(', ')}`, `The solution uses these tables, yours does not: ${tMiss.map(C).join(', ')}`));
    if (tExtra.length) li.push(T(`তুমি এই টেবিল ব্যবহার করেছ যা দরকার নেই: ${tExtra.map(C).join(', ')}`, `You use tables that are not needed: ${tExtra.map(C).join(', ')}`));
    if (miss.length) li.push(T(`সমাধানে আছে, তোমার কুয়েরিতে নেই: ${miss.map(x => `<b>${esc(x)}</b>`).join(', ')}`, `In the solution but not in yours: ${miss.map(x => `<b>${esc(x)}</b>`).join(', ')}`));
    if (extra.length) li.push(T(`তোমার কুয়েরিতে আছে, সমাধানে লাগেনি: ${extra.map(x => `<b>${esc(x)}</b>`).join(', ')}`, `In yours but not needed: ${extra.map(x => `<b>${esc(x)}</b>`).join(', ')}`));
    if (li.length) out.push(`<h4>${T('গঠনে পার্থক্য', 'Structural differences')}</h4><ul>${li.map(x => `<li>${x}</li>`).join('')}</ul>`);
    else out.push(`<div class="cmp-row">${T('ব্যবহৃত টেবিল আর ক্লজ একই রকম — পার্থক্য খুঁটিনাটিতে (শর্তের মান, কলাম, অপারেটর)।', 'Same tables and clauses — the difference is in the details (condition values, columns, operators).')}</div>`);
    // ব্যাখ্যাকারীর সতর্কতা
    if (SB.explainSQL) { try { const ns = (SB.explainSQL(user)[0] || { notes: [] }).notes.filter(x => x.type === 'warn' || x.type === 'danger'); if (ns.length) out.push(`<h4>${T('তোমার কুয়েরিতে সম্ভাব্য ভুল', 'Possible mistakes in your query')}</h4>${ns.map(x => `<div class="xp-note ${x.type}"><span>⚠️</span><div>${x.html}</div></div>`).join('')}`); } catch (e) { } }
    if (revealed && SB.renderExplain) out.push(`<h4>${T('পাশাপাশি ব্যাখ্যা', 'Side-by-side explanation')}</h4><div class="cmp-side"><div><b>${T('তোমার কুয়েরি', 'Your query')}</b><div class="cmp-x" data-sql="${esc(user)}"></div></div><div><b>${T('সমাধান', 'Solution')}</b><div class="cmp-x" data-sql="${esc(sol)}"></div></div></div>`);
    else out.push(`<p class="muted small">${T('সমাধান দেখার পর (বা সঠিক হলে) এখানে দুটো কুয়েরির ধাপে ধাপে ব্যাখ্যা পাশাপাশি দেখা যাবে।', 'After you view the solution (or solve it), both queries are explained side by side here.')}</p>`);
    return out.join('');
  }
  SB.compareModal = (user, ex, seed, revealed) => {
    if (!user.trim()) return SB.toast(T('আগে কুয়েরি লেখো।', 'Write a query first.'));
    const m = SB.modal('🔍 ' + T('তোমার কুয়েরি বনাম প্রত্যাশিত', 'Your query vs expected'), `<div class="cmp">${compareHTML(user, ex, seed, revealed)}</div>`, { wide: true });
    $$('.cmp-x', m.el).forEach(el => SB.renderExplain(el, el.dataset.sql));
  };
  SB.compareHTML = compareHTML;

  // ═══════════ ২. দুর্বল টপিক ═══════════
  SB.weakTopics = function (limit = 3) {
    const data = (SB.review && SB.review.data) || {}; const agg = {};
    Object.entries(data).forEach(([key, r]) => {
      const it = SB.resolveItem && SB.resolveItem(key); if (!it) return;
      const score = (r.wrong || 0) * 2 - (r.right || 0) - (r.mastered ? 3 : 0); if (score <= 0) return;
      const a = agg[it.topic] = agg[it.topic] || { topic: it.topic, score: 0, wrong: 0, keys: [], link: it.link };
      a.score += score; a.wrong += r.wrong || 0; a.keys.push(key);
    });
    return Object.values(agg).sort((a, b) => b.score - a.score).slice(0, limit);
  };

  // ═══════════ ৩. ডেইলি চ্যালেঞ্জ ═══════════
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  function dailyPool() {
    const p = (window.CHALLENGES || []).map(c => ({ kind: 'ch', id: c.id, title: pick(c.title), level: c.level, link: `#/challenges/${c.id}`, solved: () => !!(SB.state.challenges[c.id] || {}).solved }));
    if (SB.skills) SB.skills.DEBUG.forEach(d => p.push({ kind: 'dbg', id: d.id, title: '🐞 ' + pick(d.task), level: d.level, link: `#/debug/${d.id}`, solved: () => !!SB.skills.state.dbg[d.id] }));
    return p;
  }
  SB.daily = function () {
    const pool = dailyPool(); if (!pool.length) return null;
    const d = today(); let h = 0; for (const c of d) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const item = pool[h % pool.length];
    const log = store.get('sqlbn-daily', {});
    if (item.solved() && !log[d]) { log[d] = item.id; store.set('sqlbn-daily', log); }
    let streak = 0; const dt = new Date(); if (!log[today()]) dt.setDate(dt.getDate() - 1);
    for (;;) { const k = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`; if (!log[k]) break; streak++; dt.setDate(dt.getDate() - 1); }
    return { ...item, done: !!log[d], streak };
  };

  // ═══════════ ৪. হোমপেজের বাড়তি অংশ ═══════════
  SB.renderHomeExtras = function (host) {
    if (!host) return;
    const dc = SB.daily(), weak = SB.weakTopics(3);
    host.innerHTML = `<div class="home-extra">
      ${dc ? `<a class="hx-card daily ${dc.done ? 'done' : ''}" href="${dc.link}"><div class="hx-top"><span>📅 ${T('আজকের চ্যালেঞ্জ', "Today's challenge")}</span>${dc.streak ? `<span class="hx-streak">🔥 ${n(dc.streak)} ${T('দিন', 'day')}${!EN() || dc.streak === 1 ? '' : 's'}</span>` : ''}</div><b>${esc(dc.title)}</b><div class="hx-bot"><span class="lvl ${dc.level}">${t(dc.level)}</span><span>${dc.done ? '✅ ' + T('আজকেরটা শেষ!', 'Done for today!') : T('সমাধান করো →', 'Solve it →')}</span></div></a>` : ''}
      <div class="hx-card weak"><div class="hx-top"><span>🎯 ${T('তোমার দুর্বল টপিক', 'Your weak topics')}</span></div>
        ${weak.length ? `<ul>${weak.map(w => `<li><a href="${w.link}">${esc(w.topic)}</a> <span class="muted small">${n(w.wrong)} ${T('বার ভুল', 'mistakes')}</span></li>`).join('')}</ul><a class="small" href="#/review">${T('ভুলগুলো আবার অনুশীলন করো →', 'Practise your mistakes again →')}</a>` : `<p class="muted small">${T('এখনো যথেষ্ট ডেটা নেই। কিছু অনুশীলন, কুইজ বা মক টেস্ট দিলে এখানে দেখাবে কোন টপিকে বেশি ভুল হচ্ছে।', 'Not enough data yet. After some practice, quizzes or a mock test, this shows where you make the most mistakes.')}</p>`}</div>
      <div class="hx-card links"><div class="hx-top"><span>✨ ${T('আরও অনুশীলন', 'More practice')}</span></div>
        <a href="#/theory">🏛️ ${T('DBMS তত্ত্ব + MCQ', 'DBMS theory + MCQ')}</a><a href="#/debug">🐞 ${T('ভুল খুঁজে ঠিক করো', 'Find & fix the bug')}</a><a href="#/read">👓 ${T('কুয়েরি পড়ো', 'Read the query')}</a><a href="#/cases">💼 ${T('কেস স্টাডি', 'Case studies')}</a><a href="#/print">🖨 ${T('প্রিন্ট / PDF', 'Print / PDF')}</a></div>
    </div>`;
  };

  // ═══════════ ৫. কুয়েরি প্ল্যান (EXPLAIN QUERY PLAN) ═══════════
  function planRows(sql, seed, extra) {
    const db = SB.freshDb(seed);
    try { if (extra) db.exec(extra); const r = db.exec('EXPLAIN QUERY PLAN ' + sql.trim().replace(/;\s*$/, '')); return r.length ? r[0].values.map(v => ({ id: v[0], parent: v[1], detail: String(v[3]) })) : []; }
    finally { db.close(); }
  }
  function badge(d) {
    if (/^SCAN\b/.test(d)) return ['bad', T('পুরো টেবিল পড়া হচ্ছে (ধীর)', 'reads the whole table (slow)')];
    if (/^SEARCH\b.*(INDEX|PRIMARY KEY)/.test(d)) return ['ok', T('ইনডেক্স/key দিয়ে সরাসরি খোঁজা (দ্রুত)', 'jumps via an index/key (fast)')];
    if (/^SEARCH\b/.test(d)) return ['ok', T('সরাসরি খোঁজা', 'direct lookup')];
    if (/TEMP B-TREE/.test(d)) return ['mid', T('ফলাফল আলাদা করে সাজাতে/দল করতে হচ্ছে', 'needs an extra sort/grouping step')];
    if (/SUBQUERY/.test(d)) return [/CORRELATED/.test(d) ? 'mid' : 'info', /CORRELATED/.test(d) ? T('correlated — বাইরের প্রতিটি রো-র জন্য আবার চলে', 'correlated — runs again for each outer row') : T('সাবকুয়েরি একবার চলে', 'subquery runs once')];
    if (/AUTOMATIC .*INDEX/.test(d)) return ['mid', T('SQLite নিজে অস্থায়ী ইনডেক্স বানাচ্ছে — স্থায়ী ইনডেক্স দিলে ভালো', 'SQLite builds a temporary index — a permanent one would help')];
    return ['info', ''];
  }
  function treeHTML(rows) {
    const kids = p => rows.filter(r => r.parent === p);
    const rec = p => { const k = kids(p); return k.length ? `<ul class="plan-tree">${k.map(r => { const [c, m] = badge(r.detail); return `<li><span class="plan-node ${c}"><code>${esc(r.detail)}</code>${m ? ` <small>${m}</small>` : ''}</span>${rec(r.id)}</li>`; }).join('')}</ul>` : ''; };
    return rec(0);
  }
  function suggestIndexes(sql, seed, rows) {
    const s = noStr(sql), alias = {};
    s.replace(/\b(?:FROM|JOIN)\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?/gi, (_, tb, al) => { alias[tb.toLowerCase()] = tb; if (al && !/^(WHERE|JOIN|ON|LEFT|INNER|GROUP|ORDER|LIMIT|CROSS|NATURAL|USING|RIGHT|FULL)$/i.test(al)) alias[al.toLowerCase()] = tb; });
    const db = SB.freshDb(seed); const cols = {};
    try { Object.values(alias).forEach(tb => { try { cols[tb.toLowerCase()] = db.exec(`PRAGMA table_info("${tb}")`)[0].values.map(v => String(v[1]).toLowerCase()); } catch (e) { } }); } finally { db.close(); }
    const out = [];
    rows.filter(r => /^SCAN (\w+)/.test(r.detail)).forEach(r => {
      const al = r.detail.match(/^SCAN (\w+)/)[1].toLowerCase(), tb = alias[al]; if (!tb || !cols[tb.toLowerCase()]) return;
      const cands = [];
      const re = /(?:\b(\w+)\.)?\b(\w+)\s*(?:=|>=|<=|>|<|\bLIKE\b|\bIN\b|\bBETWEEN\b)/gi;
      // আগে WHERE-এর কলাম (ছাঁকনিতে ইনডেক্স সবচেয়ে কাজে লাগে), তারপর JOIN-এর ON
      const wPart = (s.match(/\bWHERE\b([\s\S]*?)(\bGROUP\b|\bORDER\b|\bLIMIT\b|$)/i) || ['', ''])[1];
      const onPart = (s.match(/\bON\b[\s\S]*?(?=\bWHERE\b|\bGROUP\b|\bORDER\b|$)/gi) || []).join(' ');
      const where = wPart + ' \n ' + onPart;
      const single = new Set(Object.values(alias).map(x => x.toLowerCase())).size === 1;
      let m; while ((m = re.exec(where))) {
        const pre = (m[1] || '').toLowerCase(), c = m[2].toLowerCase();
        if (pre ? (pre !== al && pre !== tb.toLowerCase()) : !single) continue;
        if (cols[tb.toLowerCase()].includes(c) && !cands.includes(c)) cands.push(c);
      }
      if (cands.length) out.push({ tb, col: cands[0], sql: `CREATE INDEX idx_${tb}_${cands[0]} ON ${tb}(${cands[0]});` });
    });
    return out.filter((x, i, a) => a.findIndex(y => y.sql === x.sql) === i);
  }
  SB.renderPlan = function (host, sql, seedKey) {
    const seed = SB.seedOf(seedKey);
    const first = (SB.splitStatements ? SB.splitStatements(sql) : [sql])[0] || '';
    if (!/^\s*(SELECT|WITH)\b/i.test(first)) { host.innerHTML = `<p class="muted">${T('কুয়েরি প্ল্যান শুধু SELECT কুয়েরির জন্য দেখানো হয়।', 'The query plan is shown for SELECT queries only.')}</p>`; return; }
    let rows; try { rows = planRows(first, seed); } catch (e) { host.innerHTML = `<div class="status show err">${SB.errorHTML(e.message)}</div>`; return; }
    const sug = suggestIndexes(first, seed, rows);
    host.innerHTML = `<h3>📊 ${T('কুয়েরি প্ল্যান — ডেটাবেস আসলে কীভাবে চালাবে', 'Query plan — how the database will actually run it')}</h3>
      <p class="muted small">${T('SQLite-এর EXPLAIN QUERY PLAN-এর ফল। লাল = পুরো টেবিল পড়া, সবুজ = ইনডেক্স দিয়ে সরাসরি, হলুদ = বাড়তি সাজানো/দল করা।', 'Output of SQLite\'s EXPLAIN QUERY PLAN. Red = full table scan, green = direct via index, yellow = extra sort/grouping.')}</p>
      <div class="plan-box">${treeHTML(rows)}</div>
      ${sug.length ? `<div class="plan-sug"><b>💡 ${T('ইনডেক্স দিলে দ্রুত হতে পারে', 'An index might help')}:</b>${sug.map((x, i) => `<div><code>${esc(x.sql)}</code> <button class="btn sm" data-idx="${i}">${T('ইনডেক্স যোগ করে আবার দেখো', 'Add it and compare')}</button></div>`).join('')}<div class="plan-after"></div></div>` : `<p class="small">${rows.some(r => /^SCAN/.test(r.detail)) ? T('ছোট ডেমো টেবিলে পুরো টেবিল পড়াই স্বাভাবিক; বড় টেবিলে WHERE/JOIN-এর কলামে ইনডেক্স ভাবো।', 'Scanning is normal on small demo tables; on large tables consider indexes on WHERE/JOIN columns.') : '✅ ' + T('কোনো পুরো টেবিল স্ক্যান নেই।', 'No full table scans.')}</p>`}`;
    host.onclick = e => { const b = e.target.closest('[data-idx]'); if (!b) return; const x = sug[+b.dataset.idx];
      const after = planRows(first, seed, x.sql);
      $('.plan-after', host).innerHTML = `<div class="plan-cmp"><div><b>${T('আগে', 'Before')}</b>${treeHTML(rows)}</div><div><b>${T('ইনডেক্সের পরে', 'After the index')}</b>${treeHTML(after)}</div></div>${after.some(r => /USING (COVERING )?INDEX idx_/.test(r.detail)) ? `<p class="small">✅ ${T('এখন SQLite নতুন ইনডেক্স ব্যবহার করছে — SCAN এর বদলে SEARCH।', 'SQLite now uses the new index — SEARCH instead of SCAN.')}</p>` : `<p class="small muted">${T('SQLite এই ইনডেক্স ব্যবহার করেনি — অনেক সময় ছোট টেবিলে বা শর্তের ধরনের কারণে স্ক্যানই সস্তা মনে করে।', 'SQLite did not use this index — on small tables or with some conditions a scan is judged cheaper.')}</p>`}`; };
  };

  // ═══════════ ৬. AI দিয়ে প্রশ্ন থেকে SQL ═══════════
  SB.nlToSql = async function (text, seedKey, onDelta) {
    if (!SB.tutor || !SB.tutor.online || !SB.tutor.online()) return { error: 'offline' };
    const db = SB.freshDb(SB.seedOf(seedKey)); const schema = SB.schemaOf(db).map(tb => `${tb.name}(${tb.cols.map(c => c.name + ' ' + (c.type || '').toLowerCase() + (c.pk ? ' PK' : '') + (c.fk ? ' FK→' + c.fk : '')).join(', ')})`).join('\n'); db.close();
    const system = 'You turn a learner\'s request (Bangla, Banglish or English) into one correct SQLite query for the given schema. Reply with exactly one ```sql code block containing the query, then 1–3 short lines explaining it in the learner\'s language. Use only tables and columns from the schema. Prefer readable SQL with JOIN ... ON, clear aliases and uppercase keywords. If the request is ambiguous, pick the most reasonable reading and say so in one line.';
    return SB.tutor.complete(system, `Schema (SQLite):\n${schema}\n\nRequest: ${text}`, onDelta);
  };

  // ═══════════ ৭. প্রিন্ট / PDF ═══════════
  function printDoc(what, answers) {
    const A = answers;
    if (what === 'jobprep') {
      return `<h1>${T('চাকরি প্রস্তুতি — SQL প্রশ্নব্যাংক', 'Job prep — SQL question bank')}</h1>` + JOB_CATS.map(cat => { const qs = JOB_QUESTIONS.filter(q => q.cat === cat.id); if (!qs.length) return ''; return `<h2>${cat.icon} ${esc(pick(cat))}</h2><ol>${qs.map(q => `<li class="pr-q"><div>${q.q.en}</div>${!EN() && q.q.bn ? `<div class="pr-bn">${q.q.bn}</div>` : ''}${q.type === 'mcq' ? `<ol type="a">${q.options.map((o, i) => `<li ${A && i === q.answer ? 'class="pr-ans"' : ''}>${esc(pick(o))}</li>`).join('')}</ol>` : ''}${A && q.solution ? `<pre>${esc(SB.formatSql(q.solution))}</pre>` : ''}${A && q.explain ? `<div class="pr-ex">${pick(q.explain)}</div>` : ''}</li>`).join('')}</ol>`; }).join('');
    }
    if (what === 'theory' && SB.theory) return `<h1>${T('DBMS তত্ত্ব', 'DBMS theory')}</h1>` + SB.theory.TOPICS.map(tp => `<h2>${tp.icon} ${esc(pick(tp.title))}</h2><div class="pr-art">${pick(tp.content)}</div><h3>MCQ</h3><ol>${tp.quiz.map(q => `<li class="pr-q">${esc(pick(q.q))}<ol type="a">${q.options.map((o, i) => `<li ${A && i === q.answer ? 'class="pr-ans"' : ''}>${esc(pick(o))}</li>`).join('')}</ol>${A ? `<div class="pr-ex">${esc(pick(q.explain))}</div>` : ''}</li>`).join('')}</ol>`).join('');
    if (what === 'challenges') return `<h1>${T('ইন্টারভিউ চ্যালেঞ্জ', 'Interview challenges')}</h1><ol>${CHALLENGES.map(c => `<li class="pr-q"><b>${esc(pick(c.title))}</b> <small>(${c.level})</small><div>${pick(c.task)}</div>${A ? `<pre>${esc(SB.formatSql(c.solution))}</pre><div class="pr-ex">${pick(c.explain)}</div>` : ''}</li>`).join('')}</ol>`;
    if (what === 'debug' && SB.skills) return `<h1>${T('ভুল খুঁজে ঠিক করো', 'Find & fix the bug')}</h1><ol>${SB.skills.DEBUG.map(d => `<li class="pr-q">${esc(pick(d.task))}<pre>${esc(d.bug)}</pre>${A ? `<pre class="pr-fix">${esc(d.solution)}</pre><div class="pr-ex">${pick(d.explain)}</div>` : ''}</li>`).join('')}</ol>`;
    return '';
  }
  SB.pages = SB.pages || {};
  SB.pages.print = what => {
    SB.context = { where: 'print' };
    const opts = [['jobprep', T('চাকরি প্রস্তুতির প্রশ্নব্যাংক', 'Job-prep question bank')], ['theory', T('DBMS তত্ত্ব + MCQ', 'DBMS theory + MCQ')], ['challenges', T('ইন্টারভিউ চ্যালেঞ্জ', 'Interview challenges')], ['debug', T('ভুল খুঁজে ঠিক করো', 'Find & fix the bug')]];
    what = opts.some(o => o[0] === what) ? what : 'jobprep';
    const ans = store.get('sqlbn-print-ans', true);
    $('#app').innerHTML = `<div class="page print-page"><div class="no-print"><h1>🖨 ${T('প্রিন্ট / PDF', 'Print / PDF')}</h1><p class="lead">${T('যা প্রিন্ট করতে চাও বেছে নাও, তারপর "প্রিন্ট" চাপো। PDF চাইলে প্রিন্ট উইন্ডোতে "Save as PDF" বেছে নাও।', 'Choose what to print, then press Print. For a PDF choose "Save as PDF" in the print dialog.')}</p>
      <div class="toolbar">${opts.map(o => `<a class="chip ${o[0] === what ? 'on' : ''}" href="#/print/${o[0]}">${esc(o[1])}</a>`).join('')}</div>
      <div class="toolbar"><label class="small"><input type="checkbox" id="prAns" ${ans ? 'checked' : ''}> ${T('উত্তর ও ব্যাখ্যাসহ', 'Include answers & explanations')}</label><span class="spacer"></span><button class="btn primary" id="prGo">🖨 ${T('প্রিন্ট / PDF সেভ', 'Print / save PDF')}</button></div></div>
      <div class="print-doc">${printDoc(what, ans)}<p class="pr-foot">SQL Pathshala · ${today()}</p></div></div>`;
    $('#prAns').onchange = e => { store.set('sqlbn-print-ans', e.target.checked); SB.pages.print(what); };
    $('#prGo').onclick = () => window.print();
  };
})();
