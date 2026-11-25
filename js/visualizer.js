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

  // ধাপগুলো তৈরি
  function buildSteps(c, db) {
    const steps = [];
    const run = sql => { const r = db.exec(sql); return r.length ? r[r.length - 1] : { columns: [], values: [] }; };
    const W = c.where ? ` WHERE ${c.where}` : '';
    const G = c.groupBy ? ` GROUP BY ${c.groupBy}` : '';
    const H = c.having ? ` HAVING ${c.having}` : '';
    const isAgg = !c.groupBy && /\b(COUNT|SUM|AVG|MIN|MAX|GROUP_CONCAT|TOTAL)\s*\(/i.test(c.selectBody) && !/\bOVER\b/i.test(c.selectBody);
    const hasWindow = /\bOVER\b/i.test(c.selectBody);

    if (!c.from) {
      steps.push({ key: 'select', clause: 'SELECT ' + c.select, data: run(c.sql),
        explain: { bn: 'কোনো টেবিল নেই — SELECT শুধু এক্সপ্রেশনটি হিসাব করে একটি রো দেয়।', en: 'No table — SELECT just evaluates the expressions and returns one row.' } });
      return steps;
    }
    // ১. FROM
    const base = run(`SELECT * FROM ${c.firstTable}`);
    steps.push({ key: 'from', clause: 'FROM ' + c.firstTable, data: base,
      explain: { bn: `প্রথমে ডেটাবেস <b>FROM</b>-এর টেবিল থেকে সব রো নেয় — মোট <b>${n(base.values.length)}</b>টি রো। SELECT-এ যা-ই লেখো, শুরুটা এখান থেকেই।`,
        en: `First the database takes every row from the <b>FROM</b> table — <b>${base.values.length}</b> rows. Whatever SELECT says, everything starts here.` } });
    // ২. JOIN
    let joined = base;
    if (c.hasJoin) {
      joined = run(`SELECT * FROM ${c.from}`);
      const isCross = /\bCROSS\s+JOIN\b|,/i.test(mask(c.from));
      steps.push({ key: 'join', clause: 'FROM ' + c.from, data: joined,
        explain: { bn: `<b>JOIN</b> অন্য টেবিলের রো জোড়া লাগায়${isCross ? ' (সব কম্বিনেশন)' : ' — ON শর্ত মিললে'}। এখন <b>${n(joined.values.length)}</b>টি রো, প্রতিটি রো-তে দুই টেবিলের কলাম পাশাপাশি। LEFT JOIN-এ মিল না পেলে ডান পাশে NULL দেখবে।`,
          en: `<b>JOIN</b> attaches rows from the other table${isCross ? ' (every combination)' : ' wherever the ON condition matches'}. Now <b>${joined.values.length}</b> rows, with both tables' columns side by side. In a LEFT JOIN, unmatched rows get NULL on the right.` } });
    }
    // ৩. WHERE
    let afterWhere = joined.values.length;
    if (c.where) {
      const d = run(`SELECT CASE WHEN (${c.where}) THEN 1 ELSE 0 END AS __keep, * FROM ${c.from}`);
      const kept = d.values.filter(r => r[0] === 1).length;
      afterWhere = kept;
      steps.push({ key: 'where', clause: 'WHERE ' + c.where, data: d, mode: 'filter',
        explain: { bn: `<b>WHERE</b> প্রতিটি রো-তে শর্তটি পরীক্ষা করে। সত্য হলে রাখে (সবুজ), না হলে বাদ (লাল কাটা)। <b>${n(kept)}</b>টি রাখা হলো, <b>${n(d.values.length - kept)}</b>টি বাদ। মনে রেখো: এই ধাপে এখনো গ্রুপ বা SELECT-এর alias তৈরি হয়নি।`,
          en: `<b>WHERE</b> tests the condition on every row. True → kept (green), otherwise removed (struck out). <b>${kept}</b> kept, <b>${d.values.length - kept}</b> removed. Note: groups and SELECT aliases don't exist yet at this step.` } });
    }
    // ৪. GROUP BY
    if (c.groupBy) {
      const gItems = splitTop(c.groupBy).map(g => resolveGroupItem(c, g));
      const key = gItems.map(g => `quote(${g})`).join(" || ' | ' || ");
      const d = run(`SELECT ${key} AS __grp, * FROM ${c.from}${W} ORDER BY 1`);
      const ng = new Set(d.values.map(r => r[0])).size;
      steps.push({ key: 'group', clause: 'GROUP BY ' + c.groupBy, data: d, mode: 'group',
        explain: { bn: `<b>GROUP BY</b> একই <code>${esc(c.groupBy)}</code> মানের রোগুলোকে এক দলে রাখে — একই রঙ = একই দল। মোট <b>${n(ng)}</b>${t('groups')}। এরপর প্রতিটি দল থেকে একটি করে রো তৈরি হবে, আর COUNT/SUM/AVG প্রতিটি দলের ভেতরে আলাদাভাবে হিসাব হবে।`,
          en: `<b>GROUP BY</b> puts rows with the same <code>${esc(c.groupBy)}</code> into one group — same colour = same group. <b>${ng}</b> groups. Each group will become one output row, and COUNT/SUM/AVG are computed inside each group separately.` } });
      // ৫. HAVING
      if (c.having) {
        // SELECT লিস্টসহ চালাই যাতে HAVING-এ alias থাকলেও কাজ করে, আর প্রতিটি দলের হিসাবও দেখা যায়
        const hd = run(`SELECT ${c.selectBody}, CASE WHEN (${c.having}) THEN 1 ELSE 0 END AS __keep FROM ${c.from}${W}${G}`);
        const keepIdx = hd.columns.length - 1;
        const kept = hd.values.filter(r => r[keepIdx] === 1).length;
        steps.push({ key: 'having', clause: 'HAVING ' + c.having, data: hd, mode: 'filterLast',
          explain: { bn: `<b>HAVING</b> এখন পুরো <b>দলের</b> উপর শর্ত পরীক্ষা করে (WHERE করেছিল প্রতিটি রো-র উপর)। এজন্যই এখানে COUNT(*), SUM() ব্যবহার করা যায়। <b>${n(kept)}</b>টি দল টিকে গেল, <b>${n(hd.values.length - kept)}</b>টি বাদ।`,
            en: `<b>HAVING</b> now tests the condition on whole <b>groups</b> (WHERE worked on single rows). That's why COUNT(*) and SUM() are allowed here. <b>${kept}</b> groups survive, <b>${hd.values.length - kept}</b> removed.` } });
      }
    }
    // ৬. SELECT
    const sel = run(`SELECT ${c.selectBody} FROM ${c.from}${W}${G}${H}`);
    let selExplainBn = `<b>SELECT</b> এখন চলে — কোন কলাম দেখাবে ও কী হিসাব করবে। `;
    let selExplainEn = `<b>SELECT</b> runs now — choosing columns and computing expressions. `;
    if (c.groupBy) { selExplainBn += `প্রতিটি দল থেকে একটি রো, তাই <b>${n(sel.values.length)}</b>টি রো। `; selExplainEn += `One row per group, so <b>${sel.values.length}</b> rows. `; }
    else if (isAgg) { selExplainBn += 'GROUP BY ছাড়া অ্যাগ্রিগেট পুরো টেবিলকে একটি দল ধরে — তাই একটি রো। '; selExplainEn += 'An aggregate without GROUP BY treats the whole table as one group — so one row. '; }
    if (hasWindow) { selExplainBn += 'উইন্ডো ফাংশন (OVER) এই ধাপে হিসাব হয় — রো না কমিয়ে। '; selExplainEn += 'Window functions (OVER) are computed in this step — without collapsing rows. '; }
    selExplainBn += 'এখানে তৈরি alias (AS) শুধু এর পরের ধাপগুলো (ORDER BY) ব্যবহার করতে পারে।';
    selExplainEn += 'Aliases (AS) created here can only be used by later steps (ORDER BY).';
    steps.push({ key: 'select', clause: 'SELECT ' + c.selectBody, data: sel, explain: { bn: selExplainBn, en: selExplainEn } });
    // ৭. DISTINCT
    let cur = sel;
    if (c.distinct) {
      cur = run(`SELECT DISTINCT ${c.selectBody} FROM ${c.from}${W}${G}${H}`);
      steps.push({ key: 'distinct', clause: 'DISTINCT', data: cur,
        explain: { bn: `<b>DISTINCT</b> হুবহু একই রোগুলোর একটি করে রাখে: <b>${n(sel.values.length)}</b> → <b>${n(cur.values.length)}</b>টি রো।`,
          en: `<b>DISTINCT</b> keeps one copy of identical rows: <b>${sel.values.length}</b> → <b>${cur.values.length}</b> rows.` } });
    }
    const S = `SELECT ${c.distinct ? 'DISTINCT ' : ''}${c.selectBody} FROM ${c.from}${W}${G}${H}`;
    // ৮. ORDER BY
    if (c.orderBy) {
      cur = run(`${S} ORDER BY ${c.orderBy}`);
      steps.push({ key: 'order', clause: 'ORDER BY ' + c.orderBy, data: cur,
        explain: { bn: '<b>ORDER BY</b> ফলাফল সাজায়। এটা SELECT-এর পরে চলে, তাই SELECT-এর alias এখানে ব্যবহার করা যায়। ASC = ছোট থেকে বড়, DESC = বড় থেকে ছোট।',
          en: '<b>ORDER BY</b> sorts the result. It runs after SELECT, so SELECT aliases work here. ASC = smallest first, DESC = largest first.' } });
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
      steps.push({ key: 'limit', clause: 'LIMIT ' + c.limit, data: cur, mode: 'range', range: [off, off + lim],
        explain: { bn: `সবশেষে <b>LIMIT</b>${off ? ` / OFFSET` : ''}: ${off ? `প্রথম <b>${n(off)}</b>টি বাদ দিয়ে ` : ''}<b>${n(lim)}</b>টি রো রাখে। এটা সবার শেষে চলে — তাই ORDER BY ছাড়া LIMIT দিলে কোন রো আসবে নিশ্চিত নয়।`,
          en: `Finally <b>LIMIT</b>${off ? ' / OFFSET' : ''}: ${off ? `skip <b>${off}</b> rows, then ` : ''}keep <b>${lim}</b> rows. It runs last — which is why LIMIT without ORDER BY gives unpredictable rows.` } });
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
    const present = new Set(steps.map(s => s.key));
    function draw() {
      const s = steps[i];
      container.innerHTML = `
        <div class="viz-order">${ORDER.map(k => `<button class="viz-chip ${present.has(k) ? 'on' : 'off'} ${s.key === k ? 'cur' : ''}" data-k="${k}" ${present.has(k) ? '' : 'disabled'}>${STEP_LABEL[k]}</button>`).join('<span class="viz-arrow">→</span>')}</div>
        <div class="viz-step">
          <div class="viz-head"><span class="viz-num">${t('step')} ${n(i + 1)}/${n(steps.length)}</span><pre class="viz-clause">${esc(s.clause)}</pre></div>
          <p class="viz-explain">${pick(s.explain)}</p>
          ${stepTable(s)}
        </div>
        <div class="viz-controls">
          <button class="btn sm" data-v="prev" ${i === 0 ? 'disabled' : ''}>${t('prev')}</button>
          <button class="btn sm" data-v="play">${timer ? t('pause') : t('play')}</button>
          <button class="btn sm primary" data-v="next" ${i === steps.length - 1 ? 'disabled' : ''}>${t('next')}</button>
        </div>`;
      SB.highlight(SB.$('.viz-clause', container));
    }
    function stop() { clearInterval(timer); timer = null; }
    container.onclick = e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.k) { stop(); i = steps.findIndex(s => s.key === b.dataset.k); draw(); return; }
      if (b.dataset.v === 'prev') { stop(); i = Math.max(0, i - 1); }
      if (b.dataset.v === 'next') { stop(); i = Math.min(steps.length - 1, i + 1); }
      if (b.dataset.v === 'play') {
        if (timer) stop();
        else { if (i === steps.length - 1) i = 0; timer = setInterval(() => { if (!container.isConnected || i >= steps.length - 1) { stop(); if (container.isConnected) draw(); return; } i++; draw(); }, 2600); }
      }
      draw();
    };
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
