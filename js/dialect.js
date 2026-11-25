/* ডায়ালেক্ট কনভার্টার — SQLite কুয়েরিকে MySQL / PostgreSQL / SQL Server / Oracle-এ আনুমানিক রূপান্তর */
(function () {
  'use strict';
  const { esc, t, pick } = SB;

  const TOKEN_RE = /(\s+)|(--[^\n]*)|(\/\*[\s\S]*?\*\/)|('(?:[^']|'')*'?)|("(?:[^"]|"")*"?)|(`[^`]*`?)|(\d+(?:\.\d+)?)|([A-Za-z_][\w$]*)|(->>|->|\|\||<=|>=|<>|!=)|([\s\S])/g;
  const TYPES = ['ws', 'comment', 'comment', 'str', 'qid', 'qid', 'num', 'word', 'op', 'p'];
  function tokenize(s) {
    const out = []; let m; TOKEN_RE.lastIndex = 0;
    while ((m = TOKEN_RE.exec(s))) { for (let g = 1; g <= 10; g++) if (m[g] !== undefined) { out.push({ t: TYPES[g - 1], v: m[g] }); break; } }
    return out;
  }
  const str = toks => toks.map(x => x.v).join('');
  const U = x => x && x.t === 'word' ? x.v.toUpperCase() : null;
  const nextNW = (T, i) => { i++; while (i < T.length && (T[i].t === 'ws' || T[i].t === 'comment')) i++; return i; };
  const prevNW = (T, i) => { i--; while (i >= 0 && (T[i].t === 'ws' || T[i].t === 'comment')) i--; return i; };
  function matchClose(T, i) { let d = 0; for (let j = i; j < T.length; j++) { if (T[j].v === '(') d++; else if (T[j].v === ')') { d--; if (!d) return j; } } return T.length - 1; }
  function matchOpen(T, i) { let d = 0; for (let j = i; j >= 0; j--) { if (T[j].v === ')') d++; else if (T[j].v === '(') { d--; if (!d) return j; } } return 0; }
  // ফাংশন কলের আর্গুমেন্ট (টোকেন রেঞ্জ → টেক্সট)
  function args(T, open, close) {
    const out = []; let d = 0, start = open + 1;
    for (let j = open + 1; j < close; j++) {
      if (T[j].v === '(') d++; else if (T[j].v === ')') d--;
      else if (T[j].v === ',' && !d) { out.push(str(T.slice(start, j)).trim()); start = j + 1; }
    }
    out.push(str(T.slice(start, close)).trim());
    return out.filter((a, i) => a || i === 0);
  }
  const KW = new Set(['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'ON', 'AS', 'IN', 'IS', 'BY', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'VALUES', 'SET', 'RETURNING']);

  // a || b || c → CONCAT(a, b, c)
  function foldConcat(T) {
    for (let guard = 0; guard < 50; guard++) {
      const i = T.findIndex(x => x.v === '||'); if (i < 0) break;
      const leftOperand = k => {
        if (T[k].v === ')') { const o = matchOpen(T, k); const f = prevNW(T, o); return (f >= 0 && T[f].t === 'word' && !KW.has(U(T[f]))) ? f : o; }
        let s = k; while (s - 2 >= 0 && T[s - 1].v === '.' && (T[s - 2].t === 'word' || T[s - 2].t === 'qid')) s -= 2; return s;
      };
      const rightOperand = k => {
        if (T[k].t === 'word' && T[nextNW(T, k)] && T[nextNW(T, k)].v === '(') return matchClose(T, nextNW(T, k));
        if (T[k].v === '(') return matchClose(T, k);
        let e = k; while (e + 2 < T.length && T[e + 1].v === '.' && (T[e + 2].t === 'word' || T[e + 2].t === 'qid')) e += 2; return e;
      };
      const lEnd = prevNW(T, i); const lStart = leftOperand(lEnd);
      const ops = [str(T.slice(lStart, lEnd + 1))];
      let cur = i, end = lEnd;
      while (cur < T.length && T[cur] && T[cur].v === '||') {
        const rs = nextNW(T, cur); const re = rightOperand(rs);
        ops.push(str(T.slice(rs, re + 1))); end = re; cur = nextNW(T, re);
      }
      T.splice(lStart, end - lStart + 1, { t: 'raw', v: `CONCAT(${ops.join(', ')})` });
    }
    return T;
  }

  const FMT = {
    pg: { '%Y': 'YYYY', '%m': 'MM', '%d': 'DD', '%H': 'HH24', '%M': 'MI', '%S': 'SS', '%j': 'DDD', '%W': 'WW', '%w': 'D' },
    mssql: { '%Y': 'yyyy', '%m': 'MM', '%d': 'dd', '%H': 'HH', '%M': 'mm', '%S': 'ss' },
    mysql: { '%M': '%i', '%S': '%s', '%W': '%u' }
  };
  FMT.oracle = FMT.pg;
  const mapFmt = (f, d) => f.replace(/%[a-zA-Z]/g, x => (FMT[d][x] !== undefined ? FMT[d][x] : x));

  function dateMod(d, base, mod) {
    const m = mod.match(/^'([+-]?\d+)\s+(day|month|year|hour|minute)s?'$/i);
    if (!m) return null;
    const num = +m[1], unit = m[2].toLowerCase();
    if (d === 'mysql') return `DATE_ADD(${base}, INTERVAL ${num} ${unit.toUpperCase()})`;
    if (d === 'pg') return `(${base}::date + INTERVAL '${num} ${unit}s')`;
    if (d === 'mssql') return `DATEADD(${unit}, ${num}, ${base})`;
    if (d === 'oracle') return unit === 'day' ? `(${base} + ${num})` : unit === 'month' ? `ADD_MONTHS(${base}, ${num})` : unit === 'year' ? `ADD_MONTHS(${base}, ${num * 12})` : `(${base} + INTERVAL '${num}' ${unit.toUpperCase()})`;
  }
  const NOW = { mysql: ['CURDATE()', 'NOW()'], pg: ['CURRENT_DATE', 'CURRENT_TIMESTAMP'], mssql: ['CAST(GETDATE() AS DATE)', 'GETDATE()'], oracle: ['TRUNC(SYSDATE)', 'SYSDATE'] };

  function convert(sql, d) {
    const notes = [];
    const note = (bn, en) => { const s = pick({ bn, en }); if (!notes.includes(s)) notes.push(s); };
    let T = tokenize(sql);
    const upper = sql.toUpperCase();

    // ── ফাংশন কল রূপান্তর
    for (let i = 0; i < T.length; i++) {
      const w = U(T[i]); if (!w) continue;
      const o = nextNW(T, i); if (!T[o] || T[o].v !== '(') continue;
      const c = matchClose(T, o); const a = args(T, o, c);
      let rep = null;
      if (w === 'STRFTIME' && a.length >= 2 && /^'.*'$/.test(a[0])) {
        const f = a[0].slice(1, -1), x = a[1];
        if (d === 'mysql') rep = f === '%Y' ? `YEAR(${x})` : f === '%m' ? `MONTH(${x})` : `DATE_FORMAT(${x}, '${mapFmt(f, d)}')`;
        if (d === 'pg') rep = `TO_CHAR(${x}::date, '${mapFmt(f, d)}')`;
        if (d === 'mssql') rep = f === '%Y' ? `YEAR(${x})` : `FORMAT(CAST(${x} AS DATE), '${mapFmt(f, d)}')`;
        if (d === 'oracle') rep = `TO_CHAR(${x}, '${mapFmt(f, d)}')`;
      } else if ((w === 'DATE' || w === 'DATETIME') && a.length && /^'now'$/i.test(a[0])) {
        rep = NOW[d][w === 'DATE' ? 0 : 1];
        if (a.length > 1) { const m2 = dateMod(d, rep, a[1]); if (m2) rep = m2; else note(`DATE('now', ${a[1]}) হাতে রূপান্তর করো।`, `Convert DATE('now', ${a[1]}) by hand.`); }
      } else if (w === 'DATE' && a.length === 2) {
        const m2 = dateMod(d, a[0], a[1]);
        if (m2) rep = m2; else note(`তারিখ মডিফায়ার ${a[1]} হাতে রূপান্তর করো।`, `Convert the date modifier ${a[1]} by hand.`);
      } else if (w === 'JULIANDAY') {
        note('দুই তারিখের পার্থক্য: MySQL DATEDIFF(a, b), PostgreSQL a::date - b::date, SQL Server DATEDIFF(day, b, a), Oracle a - b।', 'Date difference: MySQL DATEDIFF(a, b), PostgreSQL a::date - b::date, SQL Server DATEDIFF(day, b, a), Oracle a - b.');
      } else if (w === 'IFNULL' && d !== 'mysql') rep = `COALESCE(${a.join(', ')})`;
      else if (w === 'SUBSTR' && d === 'mssql') rep = `SUBSTRING(${a.join(', ')})`;
      else if (w === 'LENGTH' && d === 'mssql') rep = `LEN(${a.join(', ')})`;
      else if (w === 'RANDOM') rep = { mysql: 'RAND()', pg: 'RANDOM()', mssql: 'NEWID()', oracle: 'DBMS_RANDOM.VALUE' }[d];
      else if (w === 'GROUP_CONCAT' && d !== 'mysql') { rep = d === 'oracle' ? `LISTAGG(${a[0]}, ${a[1] || "','"}) WITHIN GROUP (ORDER BY ${a[0]})` : `STRING_AGG(${a[0]}, ${a[1] || "','"})`; }
      else if (w === 'IIF' && d !== 'mssql') rep = `CASE WHEN ${a[0]} THEN ${a[1]} ELSE ${a[2]} END`;
      else if (w === 'JSON_EXTRACT') {
        if (d === 'mssql' || d === 'oracle') rep = `JSON_VALUE(${a.join(', ')})`;
        if (d === 'pg') { const p = (a[1] || '').replace(/^'\$\.?|'$/g, ''); rep = `(${a[0]}::jsonb #>> '{${p.replace(/\./g, ',').replace(/\[(\d+)\]/g, ',$1')}}')`; }
      } else if (/^JSON_(EACH|GROUP_ARRAY|OBJECT|ARRAY_LENGTH)$/.test(w) && d !== 'mysql') {
        note(`${w}: PostgreSQL-এ jsonb_array_elements / json_agg / json_build_object / jsonb_array_length; SQL Server-এ OPENJSON / FOR JSON।`, `${w}: PostgreSQL uses jsonb_array_elements / json_agg / json_build_object / jsonb_array_length; SQL Server uses OPENJSON / FOR JSON.`);
      } else if (w === 'CAST' && d === 'mysql' && /\bAS\s+INTEGER\s*$/i.test(a[0])) rep = `CAST(${a[0].replace(/\bINTEGER\s*$/i, 'SIGNED')})`;
      if (rep) { T.splice(i, c - i + 1, { t: 'raw', v: rep }); }
    }

    // ── || → CONCAT (MySQL, SQL Server)
    if ((d === 'mysql' || d === 'mssql') && T.some(x => x.v === '||')) { T = foldConcat(T); }

    // ── কোটেড আইডেন্টিফায়ার
    T.forEach(x => {
      if (x.t !== 'qid') return;
      if (d === 'mysql' && x.v[0] === '"') x.v = '`' + x.v.slice(1, -1) + '`';
      if (d === 'mssql' && x.v[0] === '"') x.v = '[' + x.v.slice(1, -1) + ']';
      if (d !== 'mysql' && x.v[0] === '`') x.v = '"' + x.v.slice(1, -1) + '"';
    });

    // ── LIMIT / OFFSET (SQL Server, Oracle)
    if (d === 'mssql' || d === 'oracle') {
      for (let i = 0; i < T.length; i++) {
        if (U(T[i]) !== 'LIMIT') continue;
        let depthBefore = 0; for (let j = 0; j < i; j++) { if (T[j].v === '(') depthBefore++; if (T[j].v === ')') depthBefore--; }
        let e = i + 1, d2 = 0; while (e < T.length && !(T[e].v === ';' || (T[e].v === ')' && d2 === 0))) { if (T[e].v === '(') d2++; if (T[e].v === ')') d2--; e++; }
        const body = str(T.slice(i + 1, e)).trim();
        let lim = body, off = null;
        const om = body.match(/^(.*?)\s+OFFSET\s+(.*)$/i); const cm = body.match(/^([^,]+),\s*(.+)$/);
        if (om) { lim = om[1]; off = om[2]; } else if (cm) { off = cm[1].trim(); lim = cm[2].trim(); }
        // একই স্টেটমেন্টে ORDER BY আছে কিনা
        let s = i; while (s > 0 && T[s - 1].v !== ';') s--;
        const stmt = str(T.slice(s, i)).toUpperCase();
        const hasOrder = /ORDER\s+BY/.test(stmt);
        let rep;
        if (d === 'oracle') rep = off ? `OFFSET ${off} ROWS FETCH NEXT ${lim} ROWS ONLY` : `FETCH FIRST ${lim} ROWS ONLY`;
        else if (off || hasOrder) {
          rep = `OFFSET ${off || 0} ROWS FETCH NEXT ${lim} ROWS ONLY`;
          if (!hasOrder) { rep = 'ORDER BY (SELECT NULL) ' + rep; note('SQL Server-এ OFFSET/FETCH-এর জন্য ORDER BY বাধ্যতামূলক।', 'SQL Server requires ORDER BY for OFFSET/FETCH.'); }
        } else {
          // TOP n — স্টেটমেন্টের প্রথম SELECT [DISTINCT]-এর পরে
          let k = s; while (k < i && U(T[k]) !== 'SELECT') k++;
          if (k < i) { let ins = nextNW(T, k); if (U(T[ins]) === 'DISTINCT') ins = nextNW(T, ins); T.splice(ins, 0, { t: 'raw', v: `TOP ${lim} ` }); i++; e++; }
          rep = '';
        }
        // LIMIT-এর আগের স্পেসসহ বদলাই
        let st = i; if (T[st - 1] && T[st - 1].t === 'ws' && !rep) st--;
        T.splice(st, e - st, { t: 'raw', v: rep });
        if (depthBefore > 0) note('সাবকুয়েরির ভেতরের LIMIT যাচাই করে নিও।', 'Check LIMIT inside subqueries carefully.');
      }
    }

    let out = str(T);

    // ── DDL: auto-increment ও টাইপ
    if (/\bCREATE\s+TABLE\b|\bALTER\s+TABLE\b/i.test(out)) {
      const AI = { mysql: 'INT AUTO_INCREMENT PRIMARY KEY', pg: 'SERIAL PRIMARY KEY', mssql: 'INT IDENTITY(1,1) PRIMARY KEY', oracle: 'NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY' };
      out = out.replace(/\bINTEGER\s+PRIMARY\s+KEY\s+AUTOINCREMENT\b/gi, AI[d]);
      if (d !== 'pg') out = out.replace(/\bINTEGER\s+PRIMARY\s+KEY\b/gi, m => d === 'oracle' ? 'NUMBER PRIMARY KEY' : 'INT PRIMARY KEY');
      const TY = {
        mysql: { TEXT: 'VARCHAR(255)', REAL: 'DOUBLE', BLOB: 'BLOB', BOOLEAN: 'BOOLEAN' },
        pg: { REAL: 'DOUBLE PRECISION', BLOB: 'BYTEA' },
        mssql: { TEXT: 'NVARCHAR(255)', REAL: 'FLOAT', BLOB: 'VARBINARY(MAX)', BOOLEAN: 'BIT' },
        oracle: { TEXT: 'VARCHAR2(255)', REAL: 'NUMBER', INTEGER: 'NUMBER(10)', BLOB: 'BLOB', BOOLEAN: 'NUMBER(1)' }
      }[d];
      // শুধু কলাম ডেফিনিশনের টাইপ (নাম + স্পেস + টাইপ)
      out = out.replace(/(\(\s*|,\s*|ADD\s+COLUMN\s+)(["`[]?\w+["`\]]?)\s+(TEXT|REAL|INTEGER|BLOB|BOOLEAN)\b/gi, (m0, pre, name, ty) => `${pre}${name} ${TY[ty.toUpperCase()] || ty}`);
      if (d === 'oracle') out = out.replace(/\bADD\s+COLUMN\b/gi, 'ADD');
      if (d === 'mssql') out = out.replace(/\bADD\s+COLUMN\b/gi, 'ADD');
      if (/CURRENT_DATE/i.test(out) && d === 'mssql') out = out.replace(/DEFAULT\s+CURRENT_DATE/gi, 'DEFAULT CAST(GETDATE() AS DATE)');
    }

    // ── ট্রানজ্যাকশন
    if (d === 'mysql') out = out.replace(/^(\s*)BEGIN(\s+TRANSACTION)?\s*;/gim, '$1START TRANSACTION;');
    if (d === 'mssql') out = out.replace(/^(\s*)BEGIN\s*;/gim, '$1BEGIN TRANSACTION;');
    if (d === 'oracle' && /^\s*BEGIN\s*;/im.test(out)) { out = out.replace(/^(\s*)BEGIN\s*;\s*\n?/gim, '$1'); note('Oracle-এ ট্রানজ্যাকশন স্বয়ংক্রিয়ভাবে শুরু হয় — BEGIN লাগে না, শুধু COMMIT/ROLLBACK।', 'Oracle starts transactions implicitly — no BEGIN, just COMMIT/ROLLBACK.'); }

    // ── INSERT OR … / UPSERT / RETURNING
    if (/\bINSERT\s+OR\s+IGNORE\b/i.test(out)) {
      if (d === 'mysql') out = out.replace(/\bINSERT\s+OR\s+IGNORE\b/gi, 'INSERT IGNORE');
      else if (d === 'pg') { out = out.replace(/\bINSERT\s+OR\s+IGNORE\b/gi, 'INSERT'); note('PostgreSQL: শেষে ON CONFLICT DO NOTHING যোগ করো।', 'PostgreSQL: append ON CONFLICT DO NOTHING.'); }
      else note('SQL Server/Oracle-এ INSERT OR IGNORE নেই — MERGE বা WHERE NOT EXISTS ব্যবহার করো।', 'SQL Server/Oracle have no INSERT OR IGNORE — use MERGE or WHERE NOT EXISTS.');
    }
    if (/\bINSERT\s+OR\s+REPLACE\b/i.test(out)) {
      if (d === 'mysql') out = out.replace(/\bINSERT\s+OR\s+REPLACE\b/gi, 'REPLACE');
      else note('INSERT OR REPLACE-এর বদলে ON CONFLICT DO UPDATE (PostgreSQL) বা MERGE (SQL Server/Oracle)।', 'Replace INSERT OR REPLACE with ON CONFLICT DO UPDATE (PostgreSQL) or MERGE (SQL Server/Oracle).');
    }
    if (/\bON\s+CONFLICT\b/i.test(out) && d !== 'pg') {
      if (d === 'mysql') {
        out = out.replace(/\bON\s+CONFLICT\s*\([^)]*\)\s*DO\s+UPDATE\s+SET\b/gi, 'ON DUPLICATE KEY UPDATE').replace(/\bexcluded\.(\w+)/gi, 'VALUES($1)')
          .replace(/\bON\s+CONFLICT\s*(\([^)]*\))?\s*DO\s+NOTHING\b/gi, '');
        if (/INSERT\s+INTO/i.test(out) && /DO\s+NOTHING/i.test(sql)) out = out.replace(/\bINSERT\s+INTO\b/i, 'INSERT IGNORE INTO');
      } else note('ON CONFLICT নেই — MERGE INTO ... USING ... WHEN MATCHED THEN UPDATE ... WHEN NOT MATCHED THEN INSERT ব্যবহার করো।', 'No ON CONFLICT — use MERGE INTO ... USING ... WHEN MATCHED THEN UPDATE ... WHEN NOT MATCHED THEN INSERT.');
    }
    if (/\bRETURNING\b/i.test(out)) {
      if (d === 'mysql') note('MySQL-এ RETURNING নেই — INSERT-এর পরে LAST_INSERT_ID() ব্যবহার করো।', 'MySQL has no RETURNING — use LAST_INSERT_ID() after INSERT.');
      if (d === 'mssql') note('SQL Server-এ RETURNING-এর বদলে OUTPUT inserted.* / deleted.* (VALUES/WHERE-এর আগে)।', 'SQL Server uses OUTPUT inserted.* / deleted.* instead of RETURNING (placed before VALUES/WHERE).');
      if (d === 'oracle') note('Oracle-এ RETURNING ... INTO :variable (PL/SQL-এ)।', 'Oracle uses RETURNING ... INTO :variable (in PL/SQL).');
    }

    // ── সেট অপারেশন ও JOIN
    if (d === 'oracle') out = out.replace(/\bEXCEPT\b/gi, 'MINUS');
    if (d === 'mysql' && /\bEXCEPT\b|\bINTERSECT\b/i.test(out)) note('INTERSECT/EXCEPT MySQL 8.0.31 থেকে আছে; পুরনো ভার্সনে NOT EXISTS / IN ব্যবহার করো।', 'INTERSECT/EXCEPT exist from MySQL 8.0.31; on older versions use NOT EXISTS / IN.');
    if (d === 'mysql' && /\bFULL\s+(OUTER\s+)?JOIN\b/i.test(out)) note('MySQL-এ FULL OUTER JOIN নেই — LEFT JOIN UNION RIGHT JOIN দিয়ে করো।', 'MySQL has no FULL OUTER JOIN — use LEFT JOIN UNION RIGHT JOIN.');

    // ── অন্যান্য নোট
    if (/->>|->/.test(out) && d !== 'mysql') note(d === 'pg' ? "PostgreSQL-এ ->> আছে কিন্তু পাথ আলাদা: profile ->> 'city' (JSONB)।" : 'JSON_VALUE(col, \'$.path\') ব্যবহার করো।', d === 'pg' ? "PostgreSQL has ->> with a different path: profile ->> 'city' (JSONB)." : "Use JSON_VALUE(col, '$.path').");
    if (/\bCREATE\s+TRIGGER\b/i.test(out)) note('ট্রিগারের সিনট্যাক্স প্রতিটি ডেটাবেসে আলাদা (PostgreSQL-এ ট্রিগার একটি function কল করে)। ডকুমেন্টেশন দেখো।', 'Trigger syntax differs per database (PostgreSQL triggers call a function). Check the docs.');
    if (/sqlite_master|PRAGMA/i.test(out)) note('sqlite_master/PRAGMA-র বদলে information_schema.tables / information_schema.columns।', 'Use information_schema.tables / information_schema.columns instead of sqlite_master/PRAGMA.');
    if (/\bEXPLAIN\s+QUERY\s+PLAN\b/i.test(out)) out = out.replace(/\bEXPLAIN\s+QUERY\s+PLAN\b/gi, d === 'mssql' ? 'SET SHOWPLAN_TEXT ON; --' : d === 'oracle' ? 'EXPLAIN PLAN FOR' : 'EXPLAIN');
    if (/[^/*]\/[^/*]/.test(sql.replace(/'[^']*'/g, '')) && (d === 'mysql' || d === 'oracle')) note('ভাগ: SQLite-এ 7/2 = 3 (পূর্ণসংখ্যা), কিন্তু এখানে 7/2 = 3.5।', 'Division: SQLite gives 7/2 = 3 (integer), but here 7/2 = 3.5.');
    if (/\bLIKE\b/i.test(out) && d === 'pg') note("PostgreSQL-এ LIKE বড়-ছোট হাতের পার্থক্য করে — case-insensitive খুঁজতে ILIKE।", 'PostgreSQL LIKE is case-sensitive — use ILIKE for case-insensitive search.');
    if (/\b(TRUE|FALSE)\b/i.test(sql.replace(/'[^']*'/g, '')) && (d === 'mssql' || d === 'oracle')) note('TRUE/FALSE-এর বদলে 1/0।', 'Use 1/0 instead of TRUE/FALSE.');
    if (/\bAUTOINCREMENT\b/i.test(upper) && !/PRIMARY/.test(upper)) note('AUTOINCREMENT হাতে রূপান্তর করো।', 'Convert AUTOINCREMENT by hand.');
    return { sql: out, notes, changed: out.trim() !== sql.trim() };
  }

  const DIALECTS = [['mysql', 'MySQL'], ['pg', 'PostgreSQL'], ['mssql', 'SQL Server'], ['oracle', 'Oracle']];
  SB.convertDialect = convert;
  SB.showDialects = function (sql) {
    if (!sql || !sql.trim()) return SB.toast(t('writeFirst'));
    const m = SB.modal(t('dialectTitle'), `<p class="muted">${t('dialectNote')}</p>
      <div class="dl-tabs">${DIALECTS.map(([k, l], i) => `<button class="tab ${i ? '' : 'active'}" data-d="${k}">${l}</button>`).join('')}</div>
      <div class="dl-body"></div>`, { wide: true });
    const body = SB.$('.dl-body', m.el);
    const show = d => {
      const r = convert(sql, d);
      body.innerHTML = `<div class="dl-code"><pre class="syntax">${esc(r.sql)}</pre><button class="btn sm dl-copy">📋</button></div>
        ${r.changed ? '' : `<p class="muted">✓ ${t('noChanges')}</p>`}
        ${r.notes.length ? `<div class="callout info"><b>${t('notes')}:</b><ul>${r.notes.map(x => `<li>${x}</li>`).join('')}</ul></div>` : ''}`;
      SB.highlight(SB.$('pre', body));
      SB.$('.dl-copy', body).onclick = () => navigator.clipboard && navigator.clipboard.writeText(r.sql).then(() => SB.toast(t('clipboard')));
    };
    m.el.addEventListener('click', e => {
      const b = e.target.closest('[data-d]'); if (!b) return;
      SB.$$('.dl-tabs .tab', m.el).forEach(x => x.classList.toggle('active', x === b)); show(b.dataset.d);
    });
    show('mysql');
  };
})();
