/* কুয়েরি ভিজুয়ালাইজার — SELECT কুয়েরিকে execution order অনুযায়ী ধাপে ধাপে দেখায় */
(function () {
  'use strict';
  const { esc, t, n, pick } = SB;

  // স্ট্রিং/কমেন্ট/বন্ধনীর ভেতরের অংশ স্পেস দিয়ে ঢেকে দেয় (দৈর্ঘ্য একই থাকে) — টপ-লেভেল কিওয়ার্ড খুঁজতে
  function mask(sql) {
    let out = '', depth = 0, i = 0;
    while (i < sql.length) {
      const c = sql[i], c2 = sql.substr(i, 2);
      if (c2 === '--') { const j = sql.indexOf('\n', i); const end = j < 0 ? sql.length : j; out += ' '.repeat(end - i); i = end; continue; }
      if (c2 === '/*') { const j = sql.indexOf('*/', i + 2); const end = j < 0 ? sql.length : j + 2; out += ' '.repeat(end - i); i = end; continue; }
      if (c === "'" || c === '"' || c === '`' || c === '[') {
        const close = c === '[' ? ']' : c; let j = i + 1;
        while (j < sql.length) { if (sql[j] === close) { if (sql[j + 1] === close && close !== ']') { j += 2; continue; } break; } j++; }
        const end = Math.min(j + 1, sql.length), len = end - i;
        out += depth ? ' '.repeat(len) : c + ' '.repeat(Math.max(0, len - 2)) + (len > 1 ? sql[end - 1] : '');
        i = end; continue;
      }
      if (c === '(') { out += depth ? ' ' : '('; depth++; i++; continue; }
      if (c === ')') { depth = Math.max(0, depth - 1); out += depth ? ' ' : ')'; i++; continue; }
      out += depth ? ' ' : c; i++;
    }
    return out;
  }
  // টপ-লেভেল কমা দিয়ে ভাগ
  function splitTop(text) {
    const m = mask(text), parts = []; let last = 0;
    for (let i = 0; i < m.length; i++) if (m[i] === ',') { parts.push(text.slice(last, i).trim()); last = i + 1; }
    parts.push(text.slice(last).trim());
    return parts.filter(Boolean);
  }

  const CLAUSES = [['select', /\bSELECT\b/i], ['from', /\bFROM\b/i], ['where', /\bWHERE\b/i], ['groupBy', /\bGROUP\s+BY\b/i],
    ['having', /\bHAVING\b/i], ['window', /\bWINDOW\b/i], ['orderBy', /\bORDER\s+BY\b/i], ['limit', /\bLIMIT\b/i]];

  function parse(sqlIn) {
    let sql = sqlIn.trim().replace(/;\s*$/, '').trim();
    const m = mask(sql);
    if (/;\s*\S/.test(m)) return { error: { bn: 'একাধিক স্টেটমেন্ট', en: 'multiple statements' } };
    const first = (m.match(/^\s*(\w+)/) || [])[1] || '';
    if (/^WITH$/i.test(first)) return { error: { bn: 'CTE (WITH)', en: 'CTE (WITH)' } };
    if (!/^SELECT$/i.test(first)) return { error: { bn: 'শুধু SELECT কুয়েরি দেখানো যায়', en: 'only SELECT queries are supported' } };
    if (/\b(UNION|INTERSECT|EXCEPT)\b/i.test(m)) return { error: { bn: 'UNION/INTERSECT/EXCEPT', en: 'UNION/INTERSECT/EXCEPT' } };
    // প্রতিটি ক্লজের শুরু খুঁজি (প্রথম টপ-লেভেল মিল)
    const pos = [];
    for (const [key, re] of CLAUSES) {
      const g = new RegExp(re.source, 'ig'); const mm = g.exec(m);
      if (mm) pos.push({ key, start: mm.index, bodyStart: mm.index + mm[0].length });
    }
    pos.sort((a, b) => a.start - b.start);
    const c = {};
    pos.forEach((p, i) => { c[p.key] = sql.slice(p.bodyStart, i + 1 < pos.length ? pos[i + 1].start : sql.length).trim(); });
    if (c.window !== undefined) return { error: { bn: 'WINDOW ক্লজ', en: 'WINDOW clause' } };
    c.distinct = /^DISTINCT\b/i.test(c.select || '');
    c.selectBody = (c.select || '').replace(/^(DISTINCT|ALL)\s+/i, '');
    c.sql = sql;
    // FROM-এর প্রথম টেবিল ও JOIN আছে কিনা
    if (c.from) {
      const fm = mask(c.from);
      const j = fm.search(/\b(LEFT|RIGHT|FULL|INNER|CROSS|NATURAL|JOIN)\b|,/i);
      c.hasJoin = j >= 0;
      c.firstTable = c.hasJoin ? c.from.slice(0, j).trim() : c.from;
    }
    // SELECT alias → expression (GROUP BY-তে alias/পজিশন বদলাতে)
    c.items = splitTop(c.selectBody).map(it => {
      const mi = mask(it);
      let am = mi.match(/\s+AS\s+("?[\w]+"?)\s*$/i) || mi.match(/[\w)\]'"]\s+("?[A-Za-z_]\w*"?)\s*$/);
      if (am && /^(END|NULL|DESC|ASC|TRUE|FALSE)$/i.test(am[1])) am = null;
      if (am) { const alias = am[1].replace(/"/g, ''); return { expr: it.slice(0, it.length - am[0].length + (am[0].startsWith(' ') ? 0 : 1)).trim(), alias }; }
      return { expr: it, alias: null };
    });
    return c;
  }

  function resolveGroupItem(c, g) {
    if (/^\d+$/.test(g)) { const it = c.items[+g - 1]; return it ? it.expr : g; }
    const hit = c.items.find(it => it.alias && it.alias.toLowerCase() === g.replace(/"/g, '').toLowerCase());
    return hit ? hit.expr : g;
  }

  // ধাপগুলো তৈরি — প্রতিটি ধাপে: শিরোনাম, কী হলো, সংখ্যা (আগে/পরে), রঙের মানে, মনে রাখার কথা
  const B = (bn, en) => ({ bn, en });
  const C = s => `<code>${esc(String(s).replace(/\s+/g, ' ').trim())}</code>`;
  const N = v => (I18N.lang === 'en' ? String(v) : n(v));
  function buildSteps(c, db) {
    const steps = [];
    const run = sql => { const r = db.exec(sql); return r.length ? r[r.length - 1] : { columns: [], values: [] }; };
    const W = c.where ? ` WHERE ${c.where}` : '';
    const G = c.groupBy ? ` GROUP BY ${c.groupBy}` : '';
    const H = c.having ? ` HAVING ${c.having}` : '';
    const isAgg = !c.groupBy && /\b(COUNT|SUM|AVG|MIN|MAX|GROUP_CONCAT|TOTAL)\s*\(/i.test(c.selectBody) && !/\bOVER\b/i.test(c.selectBody);
    const hasWindow = /\bOVER\b/i.test(c.selectBody);
    const rowsW = B('রো', 'rows'), groupsW = B('দল', 'groups');

    if (!c.from) {
      const d = run(c.sql);
      steps.push({ key: 'select', clause: 'SELECT ' + c.select, data: d, count: d.values.length, unit: rowsW,
        title: B('শুধু হিসাব', 'Just a calculation'),
        what: B('এখানে কোনো টেবিল নেই। SELECT শুধু লেখা এক্সপ্রেশনগুলো হিসাব করে একটি রো দেয়।', 'There is no table here. SELECT just evaluates the expressions and returns one row.') });
      return steps;
    }
    // ১. FROM
    const base = run(`SELECT * FROM ${c.firstTable}`);
    steps.push({ key: 'from', clause: 'FROM ' + c.firstTable, data: base, count: base.values.length, unit: rowsW,
      title: B('টেবিল থেকে সব রো নেওয়া', 'Take every row of the table'),
      what: B(`${C(c.firstTable)} টেবিলের সব <b>${N(base.values.length)}</b>টি রো নেওয়া হলো। এখনো কোনো শর্ত বা হিসাব হয়নি।`, `All <b>${base.values.length}</b> rows of ${C(c.firstTable)} are taken. No filter or calculation yet.`),
      stats: [[B('রো', 'Rows'), base.values.length, '']],
      tip: B('কুয়েরিতে SELECT আগে লেখা হলেও ডেটাবেস কাজ শুরু করে FROM থেকে।', 'You write SELECT first, but the database starts its work at FROM.') });
    // ২. JOIN
    let joined = base;
    if (c.hasJoin) {
      joined = run(`SELECT * FROM ${c.from}`);
      const fm = mask(c.from);
      const kind = /\bCROSS\s+JOIN\b|,/i.test(fm) ? 'cross' : /\bLEFT\b/i.test(fm) ? 'left' : /\bRIGHT\b/i.test(fm) ? 'right' : /\bFULL\b/i.test(fm) ? 'full' : 'inner';
      const tip = {
        cross: B('CROSS JOIN বা কমা দিলে প্রতিটি রো অন্য টেবিলের প্রতিটি রো-র সাথে জোড়া হয়, অর্থাৎ সব সম্ভাব্য জোড়া।', 'CROSS JOIN (or a comma) pairs every row with every row of the other table — all combinations.'),
        left: B('LEFT JOIN-এ বাঁ দিকের টেবিলের সব রো থাকে। ডান দিকে মিল না পেলে সেই কলামগুলো NULL হয়।', 'LEFT JOIN keeps every row of the left table; where nothing matches, the right-hand columns are NULL.'),
        right: B('RIGHT JOIN-এ ডান দিকের টেবিলের সব রো থাকে। বাঁ দিকে মিল না পেলে NULL হয়।', 'RIGHT JOIN keeps every row of the right table; unmatched left columns are NULL.'),
        full: B('FULL JOIN-এ দুই দিকের সব রো থাকে। যেদিকে মিল নেই, সেদিকে NULL।', 'FULL JOIN keeps every row from both sides; NULL where there is no match.'),
        inner: B('INNER JOIN-এ শুধু যেসব রো-র মিল আছে সেগুলো থাকে। মিল না পাওয়া রো বাদ পড়ে।', 'INNER JOIN keeps only rows that match; unmatched rows are dropped.')
      }[kind];
      steps.push({ key: 'join', clause: 'FROM ' + c.from, data: joined, count: joined.values.length, unit: rowsW,
        title: B('টেবিল জোড়া লাগানো', 'Join the tables'),
        what: B(`ON-এর শর্ত মিলিয়ে দুই টেবিলের রো পাশাপাশি বসানো হলো। প্রতিটি রো-তে এখন দুই টেবিলেরই কলাম আছে।`, `Rows of both tables are put side by side wherever the ON condition matches. Each row now has the columns of both tables.`),
        stats: [[B('আগে', 'Before'), base.values.length, ''], [B('জোড়ার পরে', 'After join'), joined.values.length, '']], tip });
    }
    // ৩. WHERE
    if (c.where) {
      const d = run(`SELECT CASE WHEN (${c.where}) THEN 1 ELSE 0 END AS __keep, * FROM ${c.from}`);
      const kept = d.values.filter(r => r[0] === 1).length;
      steps.push({ key: 'where', clause: 'WHERE ' + c.where, data: d, mode: 'filter', count: kept, unit: rowsW,
        title: B('শর্ত দিয়ে রো ছাঁকা', 'Filter rows with a condition'),
        what: B(`প্রতিটি রো-তে ${C(c.where)} শর্তটি পরীক্ষা করা হলো। যেসব রো-তে শর্ত সত্য, শুধু সেগুলো থাকল।`, `The condition ${C(c.where)} is tested on every row; only rows where it is true remain.`),
        stats: [[B('পরীক্ষা হলো', 'Checked'), d.values.length, ''], [B('রাখা হলো', 'Kept'), kept, 'ok'], [B('বাদ পড়ল', 'Removed'), d.values.length - kept, 'bad']],
        legend: 'filter',
        tip: B('এই ধাপে এখনো দল তৈরি হয়নি, SELECT-এর নতুন নামও (alias) তৈরি হয়নি। তাই WHERE-এ COUNT() বা alias ব্যবহার করা যায় না।', 'Groups and SELECT aliases do not exist yet at this step — that is why WHERE cannot use COUNT() or an alias.') });
    }
    // ৪. GROUP BY
    if (c.groupBy) {
      const gItems = splitTop(c.groupBy).map(g => resolveGroupItem(c, g));
      const key = gItems.map(g => `quote(${g})`).join(" || ' | ' || ");
      const d = run(`SELECT ${key} AS __grp, * FROM ${c.from}${W} ORDER BY 1`);
      const ng = new Set(d.values.map(r => r[0])).size;
      steps.push({ key: 'group', clause: 'GROUP BY ' + c.groupBy, data: d, mode: 'group', count: ng, unit: groupsW,
        title: B('একই মানের রো এক দলে রাখা', 'Put equal values into groups'),
        what: B(`${C(c.groupBy)}-এর মান যেসব রো-তে একই, সেগুলো এক দলে রাখা হলো। টেবিলে একই রঙের রোগুলো একই দলের।`, `Rows with the same ${C(c.groupBy)} are put into one group. Rows of the same colour belong to the same group.`),
        stats: [[B('রো', 'Rows'), d.values.length, ''], [B('দল', 'Groups'), ng, 'ok']],
        legend: 'group',
        tip: B('প্রতিটি দল শেষে একটি রো হবে। COUNT, SUM, AVG-এর হিসাব প্রতিটি দলের ভেতরে আলাদাভাবে হয়।', 'Each group becomes one row at the end; COUNT, SUM and AVG are computed separately inside each group.') });
      // ৫. HAVING
      if (c.having) {
        const hd = run(`SELECT ${c.selectBody}, CASE WHEN (${c.having}) THEN 1 ELSE 0 END AS __keep FROM ${c.from}${W}${G}`);
        const keepIdx = hd.columns.length - 1;
        const kept = hd.values.filter(r => r[keepIdx] === 1).length;
        steps.push({ key: 'having', clause: 'HAVING ' + c.having, data: hd, mode: 'filterLast', count: kept, unit: groupsW,
          title: B('শর্ত দিয়ে দল ছাঁকা', 'Filter the groups'),
          what: B(`প্রতিটি <b>দলের</b> উপর ${C(c.having)} পরীক্ষা করা হলো। যেসব দলে শর্ত সত্য, শুধু সেগুলো থাকল।`, `The condition ${C(c.having)} is tested on every <b>group</b>; only groups where it is true remain.`),
          stats: [[B('দল', 'Groups'), hd.values.length, ''], [B('রাখা হলো', 'Kept'), kept, 'ok'], [B('বাদ পড়ল', 'Removed'), hd.values.length - kept, 'bad']],
          legend: 'filter',
          tip: B('WHERE ছাঁকে একেকটি রো (দল বানানোর আগে), আর HAVING ছাঁকে পুরো দল (দল বানানোর পরে)। এজন্যই HAVING-এ COUNT(), SUM() লেখা যায়।', 'WHERE filters single rows (before grouping); HAVING filters whole groups (after grouping). That is why HAVING can use COUNT() and SUM().') });
      }
    }
    // ৬. SELECT
    const sel = run(`SELECT ${c.selectBody} FROM ${c.from}${W}${G}${H}`);
    let wb, we;
    if (c.groupBy) { wb = `প্রতিটি দল থেকে একটি করে রো বানানো হলো, আর ${C(c.selectBody)} হিসাব করা হলো।`; we = `One row is built from each group and ${C(c.selectBody)} is computed.`; }
    else if (isAgg) { wb = `GROUP BY নেই, কিন্তু অ্যাগ্রিগেট ফাংশন আছে। তাই পুরো টেবিলকে একটি দল ধরে হিসাব হলো, ফলাফল একটি রো।`; we = 'There is no GROUP BY but there is an aggregate, so the whole table is treated as one group — one result row.'; }
    else { wb = `প্রতিটি রো থেকে দরকারি কলামগুলো বেছে নেওয়া হলো: ${C(c.selectBody)}।`; we = `The needed columns are picked from every row: ${C(c.selectBody)}.`; }
    if (hasWindow) { wb += ' উইন্ডো ফাংশন (OVER) এই ধাপেই হিসাব হয়, আর রো-এর সংখ্যা কমে না।'; we += ' Window functions (OVER) are computed here, without reducing the rows.'; }
    steps.push({ key: 'select', clause: 'SELECT ' + c.selectBody, data: sel, count: sel.values.length, unit: rowsW,
      title: B('কলাম বাছাই ও হিসাব', 'Pick columns and compute'), what: B(wb, we),
      stats: [[B('রো', 'Rows'), sel.values.length, ''], [B('কলাম', 'Columns'), sel.columns.length, '']],
      tip: B('এখানে দেওয়া নতুন নাম (AS) শুধু পরের ধাপগুলোতে, অর্থাৎ ORDER BY-তে ব্যবহার করা যায়।', 'A name given here with AS can only be used by later steps — that is, ORDER BY.') });
    // ৭. DISTINCT
    let cur = sel;
    if (c.distinct) {
      cur = run(`SELECT DISTINCT ${c.selectBody} FROM ${c.from}${W}${G}${H}`);
      steps.push({ key: 'distinct', clause: 'DISTINCT', data: cur, count: cur.values.length, unit: rowsW,
        title: B('ডুপ্লিকেট বাদ দেওয়া', 'Remove duplicates'),
        what: B('হুবহু একই রোগুলোর মধ্যে একটি করে রাখা হলো।', 'Of rows that are exactly the same, one copy is kept.'),
        stats: [[B('আগে', 'Before'), sel.values.length, ''], [B('পরে', 'After'), cur.values.length, 'ok'], [B('বাদ পড়ল', 'Removed'), sel.values.length - cur.values.length, 'bad']] });
    }
    const S = `SELECT ${c.distinct ? 'DISTINCT ' : ''}${c.selectBody} FROM ${c.from}${W}${G}${H}`;
    // ৮. ORDER BY
    if (c.orderBy) {
      cur = run(`${S} ORDER BY ${c.orderBy}`);
      const desc = /\bDESC\b/i.test(c.orderBy);
      steps.push({ key: 'order', clause: 'ORDER BY ' + c.orderBy, data: cur, count: cur.values.length, unit: rowsW,
        title: B('ফলাফল সাজানো', 'Sort the result'),
        what: B(`ফলাফল ${C(c.orderBy)} অনুযায়ী ${desc ? 'বড় থেকে ছোট' : 'ছোট থেকে বড়'} ক্রমে সাজানো হলো। রো-এর সংখ্যা বদলায়নি।`, `The result is sorted by ${C(c.orderBy)}, ${desc ? 'largest first' : 'smallest first'}. The number of rows does not change.`),
        tip: B('ASC মানে ছোট থেকে বড় (এটাই ডিফল্ট), DESC মানে বড় থেকে ছোট। ORDER BY চলে SELECT-এর পরে, তাই এখানে alias ব্যবহার করা যায়।', 'ASC = smallest first (the default), DESC = largest first. ORDER BY runs after SELECT, so aliases work here.') });
    }
    // ৯. LIMIT
    if (c.limit) {
      let lim, off = 0;
      const parts = c.limit.split(/\bOFFSET\b/i);
      try {
        if (parts.length > 1) { const r = run(`SELECT (${parts[0]}), (${parts[1]})`).values[0]; lim = r[0]; off = r[1]; }
        else if (splitTop(c.limit).length === 2) { const [a, b] = splitTop(c.limit); const r = run(`SELECT (${b}), (${a})`).values[0]; lim = r[0]; off = r[1]; }
        else lim = run(`SELECT (${c.limit})`).values[0][0];
      } catch (e) { lim = cur.values.length; }
      const keep = Math.max(0, Math.min(lim, cur.values.length - off));
      steps.push({ key: 'limit', clause: 'LIMIT ' + c.limit, data: cur, mode: 'range', range: [off, off + lim], count: keep, unit: rowsW,
        title: B('নির্দিষ্ট সংখ্যক রো রাখা', 'Keep only some rows'),
        what: off ? B(`প্রথম <b>${N(off)}</b>টি রো বাদ দিয়ে পরের <b>${N(lim)}</b>টি রাখা হলো (সবুজ)।`, `The first <b>${off}</b> rows are skipped and the next <b>${lim}</b> are kept (green).`)
          : B(`শুধু প্রথম <b>${N(lim)}</b>টি রো রাখা হলো (সবুজ), বাকিগুলো বাদ।`, `Only the first <b>${lim}</b> rows are kept (green); the rest are dropped.`),
        stats: [[B('আগে', 'Before'), cur.values.length, ''], [B('রাখা হলো', 'Kept'), keep, 'ok']],
        legend: 'filter',
        tip: B('LIMIT সবার শেষে চলে। তাই ORDER BY ছাড়া LIMIT দিলে কোন রোগুলো আসবে তা নিশ্চিত নয়।', 'LIMIT runs last — so without ORDER BY you cannot be sure which rows you get.') });
    }
    return steps;
  }

  const STEP_LABEL = { from: 'FROM', join: 'JOIN', where: 'WHERE', group: 'GROUP BY', having: 'HAVING', select: 'SELECT', distinct: 'DISTINCT', order: 'ORDER BY', limit: 'LIMIT' };
  const ORDER = ['from', 'join', 'where', 'group', 'having', 'select', 'distinct', 'order', 'limit'];

  function stepTable(s) {
    const d = s.data;
    if (!d || !d.columns || !d.columns.length) return `<div class="empty-result">${t('noRows')}</div>`;
    let hide = -1, rowClass = null;
    if (s.mode === 'filter') { hide = 0; rowClass = r => r[0] === 1 ? 'viz-keep' : 'viz-drop'; }
    if (s.mode === 'filterLast') { hide = d.columns.length - 1; rowClass = r => r[hide] === 1 ? 'viz-keep' : 'viz-drop'; }
    if (s.mode === 'group') {
      hide = 0; const map = new Map();
      d.values.forEach(r => { if (!map.has(r[0])) map.set(r[0], map.size); });
      rowClass = r => 'viz-g' + (map.get(r[0]) % 8);
    }
    if (s.mode === 'range') rowClass = (r, i) => (i >= s.range[0] && i < s.range[1]) ? 'viz-keep' : 'viz-drop';
    const cols = d.columns.map((c, i) => i === hide ? null : c);
    const view = { columns: cols.filter(c => c !== null), values: d.values.map(r => r.filter((_, i) => i !== hide)) };
    const rc = rowClass ? (r, i) => rowClass(d.values[i], i) : null;
    return SB.tableHTML(view, '', { rowClass: rc, max: 300 });
  }
  function legendHTML(s) {
    if (s.legend === 'filter') return `<div class="viz-legend"><span><i class="lg keep"></i>${pick(B('সবুজ = রাখা হলো', 'green = kept'))}</span><span><i class="lg drop"></i>${pick(B('লাল ও কাটা = বাদ পড়ল', 'red, struck out = removed'))}</span></div>`;
    if (s.legend === 'group') return `<div class="viz-legend"><span><i class="lg g0"></i><i class="lg g1"></i><i class="lg g2"></i>${pick(B('একই রঙ = একই দল', 'same colour = same group'))}</span></div>`;
    return '';
  }

  // container-এ ভিজুয়ালাইজার আঁকে
  function render(container, sql, db) {
    const ownDb = !db; db = db || SB.freshDb();
    let steps, final, err = null;
    const c = parse(sql);
    try {
      if (c.error) err = pick(c.error);
      else steps = buildSteps(c, db);
    } catch (e) { err = e.message; }
    if (err) {
      try { const r = db.exec(sql); final = r.length ? r[r.length - 1] : null; } catch (e) { final = null; err = null; container.innerHTML = `<div class="status err show">${SB.errorHTML(e.message)}</div>`; if (ownDb) db.close(); return; }
      container.innerHTML = `<div class="status info show">${t('vizUnsupported', { r: esc(err) })}</div>${SB.tableHTML(final)}`;
      if (ownDb) db.close();
      return;
    }
    if (ownDb) db.close();
    let i = 0, timer = null;
    const byKey = Object.fromEntries(steps.map((s, k) => [s.key, k]));
    const L = I18N.lang === 'en';
    function draw() {
      const s = steps[i], last = i === steps.length - 1;
      container.innerHTML = `
        <div class="viz-order" role="tablist">${ORDER.map(k => { const k2 = byKey[k], st = steps[k2];
          return `<button class="viz-chip ${st ? 'on' : 'off'} ${s.key === k ? 'cur' : ''} ${st && k2 < i ? 'done' : ''}" data-k="${k}" ${st ? '' : 'disabled'} title="${st ? esc(pick(st.title)) : ''}"><b>${STEP_LABEL[k]}</b><small>${st ? `${N(st.count)} ${pick(st.unit)}` : '—'}</small></button>`; }).join('<span class="viz-arrow">→</span>')}</div>
        <div class="viz-step">
          <div class="viz-head">
            <span class="viz-num"><small>${t('step')}</small><b>${N(i + 1)}/${N(steps.length)}</b></span>
            <div class="viz-title"><h3>${esc(pick(s.title))}</h3><pre class="viz-clause">${esc(s.clause)}</pre></div>
          </div>
          <p class="viz-explain">${pick(s.what)}</p>
          ${s.stats ? `<div class="viz-stats">${s.stats.map(([lb, v, cls]) => `<span class="viz-stat ${cls}"><small>${esc(pick(lb))}</small><b>${N(v)}</b></span>`).join('')}</div>` : ''}
          ${s.tip ? `<div class="viz-tip"><span>💡</span><div><b>${L ? 'Remember' : 'মনে রাখো'}:</b> ${pick(s.tip)}</div></div>` : ''}
          ${legendHTML(s)}
          <div class="viz-tablebox">${stepTable(s)}</div>
          ${last ? `<div class="viz-final">✅ ${L ? 'This is the final result of the query.' : 'এটাই কুয়েরির চূড়ান্ত ফলাফল।'}</div>` : ''}
        </div>
        <div class="viz-controls">
          <button class="btn sm" data-vstep="prev" ${i === 0 ? 'disabled' : ''}>${t('prev')}</button>
          <button class="btn sm" data-vstep="play">${timer ? t('pause') : t('play')}</button>
          <button class="btn sm primary" data-vstep="next" ${last ? 'disabled' : ''}>${t('next')}</button>
        </div>`;
      SB.highlight(SB.$('.viz-clause', container));
      const cur = SB.$('.viz-chip.cur', container); if (cur && cur.scrollIntoView) { const o = SB.$('.viz-order', container); o.scrollLeft = cur.offsetLeft - o.clientWidth / 2 + cur.clientWidth / 2; }
    }
    function stop() { clearInterval(timer); timer = null; }
    // ধাপের বাটনের ক্লিক পেজের অন্য হ্যান্ডলারে (যেমন উদাহরণ বাটন) পৌঁছাবে না
    container.onclick = e => {
      const b = e.target.closest('button'); if (!b || !container.contains(b)) return;
      e.stopPropagation();
      if (b.dataset.k) { stop(); i = byKey[b.dataset.k]; draw(); return; }
      const v = b.dataset.vstep; if (!v) return;
      if (v === 'prev') { stop(); i = Math.max(0, i - 1); }
      if (v === 'next') { stop(); i = Math.min(steps.length - 1, i + 1); }
      if (v === 'play') {
        if (timer) stop();
        else { if (i === steps.length - 1) i = 0; timer = setInterval(() => { if (!container.isConnected || i >= steps.length - 1) { stop(); if (container.isConnected) draw(); return; } i++; draw(); }, 3200); }
      }
      draw();
    };
    container.tabIndex = 0;
    container.onkeydown = e => { if (e.key === 'ArrowRight' && i < steps.length - 1) { stop(); i++; draw(); } if (e.key === 'ArrowLeft' && i > 0) { stop(); i--; draw(); } };
    draw();
  }

  SB.visualize = function (sql, db) {
    if (!sql || !sql.trim()) return SB.toast(t('writeFirst'));
    const m = SB.modal(t('vizTitle'), '<div class="viz"></div>', { wide: true });
    render(SB.$('.viz', m.el), sql, db);
  };
  SB.renderViz = render;
  SB.parseSelect = parse;
})();
