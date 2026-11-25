/* SQL পাঠশালা — শেয়ার করা হেল্পার (window.SB) */
(function () {
  'use strict';
  const { t, n, pick } = window.I18N;
  const MAX_ROWS = 500;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

  function toast(msg) {
    const el = $('#toast');
    el.innerHTML = msg; el.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('show'), 2600);
  }

  // ───────────── অগ্রগতি (progress) ─────────────
  const listeners = [];
  const state = {
    progress: store.get('sqlbn-progress', {}),       // { lessonId: { ex: {i:true}, quiz: {i:choice} } }
    challenges: store.get('sqlbn-challenges', {}),   // { id: { solved, hints, viewed } }
    activity: store.get('sqlbn-activity', {}),       // { 'YYYY-MM-DD': count }
    jobprep: store.get('sqlbn-jobprep', {}),         // { id: { solved, choice, seen } }
    practice: store.get('sqlbn-practice', {})        // { 'px:lesson:i': true }
  };
  function save(kind) {
    store.set('sqlbn-progress', state.progress);
    store.set('sqlbn-challenges', state.challenges);
    store.set('sqlbn-activity', state.activity);
    store.set('sqlbn-jobprep', state.jobprep);
    store.set('sqlbn-practice', state.practice);
    listeners.forEach(fn => { try { fn(kind); } catch (e) { console.error(e); } });
  }
  function recordActivity() { const d = today(); state.activity[d] = (state.activity[d] || 0) + 1; }
  const lp = id => (state.progress[id] = state.progress[id] || { ex: {}, quiz: {} });

  function lessonStatus(l) {
    const p = state.progress[l.id] || {};
    const ex = Object.keys(p.ex || {}).length, qz = Object.keys(p.quiz || {}).length;
    const done = l.exercises.length ? ex >= l.exercises.length : (l.quiz.length ? qz >= l.quiz.length : false);
    if (done) return 'done';
    return (ex || qz) ? 'partial' : '';
  }

  // লেসনের বর্তমান ভাষার রূপ
  function L(l) {
    const en = I18N.lang === 'en' ? (l.en || (window.LESSONS_EN || {})[l.id]) : null;
    return {
      title: en ? en.title : l.title,
      summary: en ? en.summary : l.summary,
      content: en ? en.content : l.content,
      task: i => (en && en.ex[i] ? en.ex[i].task : l.exercises[i].task),
      hint: i => (en && en.ex[i] ? en.ex[i].hint : l.exercises[i].hint),
      quiz: i => (en && en.quiz[i] ? { ...l.quiz[i], ...en.quiz[i] } : l.quiz[i])
    };
  }

  // ───────────── ডেটাবেস ─────────────
  let SQL = null;
  function freshDb(seed) { const db = new SQL.Database(); db.exec(seed || window.SEED_SQL); return db; }
  function execAll(db, sql) {
    const res = db.exec(sql);
    return { res, last: res.length ? res[res.length - 1] : null, changes: db.getRowsModified() };
  }
  const qid = name => '"' + String(name).replace(/"/g, '""') + '"';
  function schemaOf(db) {
    const r = db.exec("SELECT name, type FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY type, rowid");
    if (!r.length) return [];
    return r[0].values.map(([name, type]) => {
      const cols = db.exec(`PRAGMA table_info(${qid(name)})`);
      let fks = [];
      try { const f = db.exec(`PRAGMA foreign_key_list(${qid(name)})`); if (f.length) fks = f[0].values.map(v => ({ table: v[2], from: v[3], to: v[4] || 'id' })); } catch (e) { }
      let count = 0;
      try { count = db.exec(`SELECT COUNT(*) FROM ${qid(name)}`)[0].values[0][0]; } catch (e) { }
      return {
        name, type, count, fks,
        cols: cols.length ? cols[0].values.map(c => ({ name: c[1], type: c[2] || '', notnull: c[3], pk: c[5], fk: fks.some(f => f.from === c[1]) })) : []
      };
    });
  }
  let seedSchema = null;
  const getSeedSchema = () => { if (!seedSchema) { const db = freshDb(); seedSchema = schemaOf(db); db.close(); } return seedSchema; };
  const hintTables = schema => Object.fromEntries(schema.map(tb => [tb.name, tb.cols.map(c => c.name)]));

  // SQLite এরর → সহজ ব্যাখ্যা (বাংলা / English)
  const ERR = [
    [/no such table: (\S+)/, m => [`<b>"${m[1]}"</b> নামে কোনো টেবিল নেই। টেবিলের নামের বানান চেক করো।`, `There is no table named <b>"${m[1]}"</b>. Check the spelling.`]],
    [/no such column: (\S+)/, m => [`<b>"${m[1]}"</b> নামে কোনো কলাম নেই। বানান দেখো। টেক্সট মান হলে সিঙ্গেল কোটে লেখো: <code>'${esc(m[1])}'</code>`, `There is no column <b>"${m[1]}"</b>. Check the spelling. If it's a text value, put it in single quotes: <code>'${esc(m[1])}'</code>`]],
    [/near "(.*?)": syntax error/, m => [`<b>"${esc(m[1])}"</b>-এর কাছে সিনট্যাক্স ভুল। কিওয়ার্ডের বানান, কমা, কোট বা বন্ধনী চেক করো।`, `Syntax error near <b>"${esc(m[1])}"</b>. Check keyword spelling, commas, quotes and brackets.`]],
    [/incomplete input/, () => ['কুয়েরিটি অসম্পূর্ণ। কোনো বন্ধনী <code>( )</code> বা কোট <code>\' \'</code> খোলা রয়ে গেছে কিনা দেখো।', 'The query is incomplete. Is a bracket <code>( )</code> or quote <code>\' \'</code> left open?']],
    [/ambiguous column name: (\S+)/, m => [`<b>"${m[1]}"</b> কলামটি একাধিক টেবিলে আছে। কোন টেবিলের তা বলে দাও, যেমন <code>s.${esc(m[1].split('.').pop())}</code>।`, `Column <b>"${m[1]}"</b> exists in several tables. Say which one, e.g. <code>s.${esc(m[1].split('.').pop())}</code>.`]],
    [/misuse of aggregate/, () => ['অ্যাগ্রিগেট ফাংশন (COUNT, SUM…) ভুল জায়গায়। WHERE-এ এগুলো চলে না — <code>HAVING</code> ব্যবহার করো।', 'Aggregate function (COUNT, SUM…) in the wrong place. They are not allowed in WHERE — use <code>HAVING</code>.']],
    [/misuse of window function/, () => ['উইন্ডো ফাংশন WHERE/GROUP BY-তে চলে না। সাবকুয়েরি বা CTE-তে রেখে বাইরে ফিল্টার করো।', 'Window functions are not allowed in WHERE/GROUP BY. Compute them in a subquery or CTE and filter outside.']],
    [/UNIQUE constraint failed: (\S+)/, m => [`<b>${m[1]}</b>-এ একই মান আগে থেকেই আছে (UNIQUE/PRIMARY KEY নিয়ম ভেঙেছে)।`, `<b>${m[1]}</b> already has this value (UNIQUE/PRIMARY KEY violated).`]],
    [/NOT NULL constraint failed: (\S+)/, m => [`<b>${m[1]}</b> খালি (NULL) রাখা যাবে না — একটি মান দাও।`, `<b>${m[1]}</b> cannot be NULL — supply a value.`]],
    [/CHECK constraint failed/, () => ['CHECK নিয়ম ভেঙেছে — মানটি টেবিলের শর্ত পূরণ করছে না।', 'CHECK constraint failed — the value breaks the table\'s rule.']],
    [/FOREIGN KEY constraint failed/, () => ['ফরেন কি নিয়ম ভেঙেছে — রেফার করা রো অন্য টেবিলে নেই।', 'Foreign key violated — the referenced row does not exist.']],
    [/table (\S+) already exists/, m => [`<b>${m[1]}</b> টেবিল আগে থেকেই আছে। <code>IF NOT EXISTS</code> ব্যবহার করতে পারো।`, `Table <b>${m[1]}</b> already exists. You can use <code>IF NOT EXISTS</code>.`]],
    [/(index|trigger|view) (\S+) already exists/, m => [`<b>${m[2]}</b> নামে ${m[1]} আগে থেকেই আছে।`, `A ${m[1]} named <b>${m[2]}</b> already exists.`]],
    [/do not have the same number of result columns/, () => ['UNION/INTERSECT/EXCEPT-এর দুই পাশে কলাম সংখ্যা সমান হতে হবে।', 'Both sides of UNION/INTERSECT/EXCEPT need the same number of columns.']],
    [/no such function: (\S+)/, m => [`<b>${m[1]}()</b> ফাংশনটি SQLite-এ নেই। বানান দেখো বা অন্য ফাংশন ব্যবহার করো।`, `SQLite has no function <b>${m[1]}()</b>. Check the spelling or use another function.`]],
    [/duplicate column name: (\S+)/, m => [`<b>${m[1]}</b> নামে কলাম আগে থেকেই আছে।`, `Column <b>${m[1]}</b> already exists.`]],
    [/within a transaction/, () => ['একটি ট্রানজ্যাকশন চলমান অবস্থায় আরেকটি BEGIN করা যায় না।', 'You can\'t BEGIN inside an open transaction.']],
    [/no transaction is active/, () => ['কোনো ট্রানজ্যাকশন চলছে না — আগে <code>BEGIN</code> লেখো।', 'No transaction is active — write <code>BEGIN</code> first.']],
    [/wrong number of arguments/, () => ['ফাংশনে আর্গুমেন্টের সংখ্যা ভুল।', 'Wrong number of arguments to a function.']],
    [/values for (\d+) columns/, () => ['কলামের সংখ্যা আর VALUES-এর মানের সংখ্যা মিলছে না।', 'The number of columns and VALUES don\'t match.']],
    [/has no column named (\S+)/, m => [`টেবিলে <b>${m[1]}</b> নামে কোনো কলাম নেই।`, `The table has no column named <b>${m[1]}</b>.`]],
    [/ON CONFLICT clause does not match/, () => ['ON CONFLICT-এর কলামে PRIMARY KEY বা UNIQUE থাকতে হবে।', 'The ON CONFLICT column must be a PRIMARY KEY or UNIQUE.']]
  ];
  function explainError(msg) {
    for (const [re, fn] of ERR) { const m = msg.match(re); if (m) return fn(m)[I18N.lang === 'en' ? 1 : 0]; }
    return t('queryError');
  }
  const errorHTML = msg => `⚠️ ${explainError(msg)}<span class="err-raw">${esc(msg)}</span>`;

  // ───────────── রেজাল্ট টেবিল ─────────────
  function cellHTML(v) {
    if (v === null) return '<td class="null">NULL</td>';
    if (typeof v === 'number') return `<td class="num">${esc(Math.round(v * 1e6) / 1e6)}</td>`;
    if (v instanceof Uint8Array) return '<td class="null">[BLOB]</td>';
    return `<td>${esc(v)}</td>`;
  }
  function tableHTML(r, label, opts = {}) {
    if (!r || !r.columns) return `<div class="empty-result">${t('noRows')}</div>`;
    const max = opts.max || MAX_ROWS;
    const rows = r.values.slice(0, max);
    const head = r.columns.map(c => `<th>${esc(c)}</th>`).join('');
    const body = rows.map((row, i) => `<tr class="${opts.rowClass ? opts.rowClass(row, i) : ''}">` + row.map(cellHTML).join('') + '</tr>').join('');
    const more = r.values.length > max ? ` (${t('firstShown', { n: n(max) })})` : '';
    return `<div class="result-meta"><span>${label || t('result')}</span><span>${n(r.values.length)} ${t('rows')}${more}</span></div>
      <div class="result-table-wrap"><table class="result-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  }
  function runInline(sql, seed) {
    const db = freshDb(seed);
    try {
      const r = execAll(db, sql);
      if (r.last) return tableHTML(r.last);
      return `<div class="status ok show">${t('ranOk')} ${r.changes ? t('rowsAffected', { n: n(r.changes) }) : ''}</div>`;
    } catch (e) {
      return `<div class="status err show">${errorHTML(e.message)}</div>`;
    } finally { db.close(); }
  }

  // ───────────── ফলাফল তুলনা ─────────────
  const normVal = v => v === null ? '∅' : typeof v === 'number' ? String(Math.round(v * 100) / 100) : String(v);
  const normRows = r => (r && r.values ? r.values : []).map(row => row.map(normVal));
  function compare(user, expected, ordered) {
    const a = normRows(user), b = normRows(expected);
    const ac = user && user.columns ? user.columns.length : 0, bc = expected && expected.columns ? expected.columns.length : 0;
    if (!user && b.length) return { ok: false, msg: t('noResultMsg') };
    if (a.length && b.length && ac !== bc) return { ok: false, msg: t('colMismatch', { a: n(ac), b: n(bc) }) };
    if (a.length !== b.length) return { ok: false, msg: t('rowMismatch', { a: n(a.length), b: n(b.length) }) };
    const sa = a.map(r => JSON.stringify(r)), sb = b.map(r => JSON.stringify(r));
    const sortedEq = [...sa].sort().join('\n') === [...sb].sort().join('\n');
    if (ordered) {
      if (sa.join('\n') === sb.join('\n')) return { ok: true };
      if (sortedEq) return { ok: false, msg: t('orderMismatch') };
    } else if (sortedEq) return { ok: true };
    return { ok: false, msg: t('valueMismatch') };
  }
  function expectedResult(ex, seed) {
    const db = freshDb(seed);
    try { const r = execAll(db, ex.solution); return ex.check ? execAll(db, ex.check).last : r.last; }
    finally { db.close(); }
  }
  // ex = { solution, check?, ordered? } — লেসন অনুশীলন ও চ্যালেঞ্জ দুটোতেই
  function checkExercise(ex, sql, seed) {
    const db1 = freshDb(seed);
    let run, cmp;
    try { run = execAll(db1, sql); } catch (e) { db1.close(); return { error: e.message }; }
    try { cmp = ex.check ? execAll(db1, ex.check).last : run.last; }
    catch (e) { db1.close(); return { run, verdict: { ok: false, msg: t('checkFailed') + '<span class="err-raw">' + esc(e.message) + '</span>' } }; }
    db1.close();
    const expected = expectedResult(ex, seed);
    return { run, cmp, expected, verdict: compare(cmp, expected, ex.ordered) };
  }

  // ───────────── এডিটর ও হাইলাইট ─────────────
  function highlight(el) {
    const text = el.textContent;
    if (window.CodeMirror && CodeMirror.runMode) { el.textContent = ''; CodeMirror.runMode(text, 'text/x-sqlite', el); }
  }
  function makeEditor(host, value, onRun, schema) {
    const cm = CodeMirror(host, {
      value: value || '', mode: 'text/x-sqlite', lineNumbers: true, tabSize: 2, indentUnit: 2, lineWrapping: true,
      extraKeys: {
        'Ctrl-Enter': () => onRun(), 'Cmd-Enter': () => onRun(), 'Shift-Enter': () => onRun(),
        'Ctrl-Space': 'autocomplete', 'Ctrl-/': 'toggleComment'
      },
      hintOptions: { tables: hintTables(schema || getSeedSchema()), completeSingle: false }
    });
    cm.on('inputRead', (c, ch) => { if (ch.text[0] === '.') c.showHint({ completeSingle: false }); });
    SB.activeEditor = cm;
    cm.on('focus', () => { SB.activeEditor = cm; });
    setTimeout(() => cm.refresh(), 0);
    return cm;
  }
  // সমাধানকে লাইনে ভাঙা
  function formatSql(sql) {
    if (sql.includes('\n')) return sql;
    return sql
      .replace(/\s+(FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|LEFT JOIN|INNER JOIN|FULL OUTER JOIN|CROSS JOIN|JOIN|UNION ALL|UNION|INTERSECT|EXCEPT|SET|VALUES|ON CONFLICT|RETURNING|BEGIN|WHEN)\b/g, '\n$1')
      .replace(/;\s*(?=\S)/g, ';\n');
  }

  // ───────────── মোডাল ─────────────
  function modal(title, html, opts = {}) {
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML = `<div class="modal ${opts.wide ? 'wide' : ''}" role="dialog" aria-modal="true">
      <div class="modal-head"><h3>${title}</h3><button class="icon-btn modal-x" aria-label="${t('close')}">✕</button></div>
      <div class="modal-body">${html}</div></div>`;
    document.body.appendChild(wrap);
    const close = () => { wrap.remove(); document.removeEventListener('keydown', onKey); if (opts.onClose) opts.onClose(); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    wrap.addEventListener('click', e => { if (e.target === wrap || e.target.closest('.modal-x')) close(); });
    return { el: $('.modal-body', wrap), close };
  }

  function download(name, data, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(data instanceof Blob ? data : new Blob([data], { type }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  window.SB = {
    $, $$, esc, store, toast, today, t, n, pick, state, save, recordActivity, lp, lessonStatus, L,
    get SQL() { return SQL; }, set SQL(v) { SQL = v; },
    freshDb, execAll, schemaOf, getSeedSchema, hintTables, qid, explainError, errorHTML,
    tableHTML, runInline, compare, checkExercise, expectedResult, highlight, makeEditor, formatSql, modal, download,
    onChange(fn) { listeners.push(fn); },
    activeEditor: null,
    pgDb: null,
    context: {}   // টিউটরের জন্য বর্তমান পেজের তথ্য
  };
})();
