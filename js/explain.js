/* কুয়েরি ব্যাখ্যাকারী — যেকোনো SQL (SELECT/JOIN/সাবকুয়েরি/CTE/উইন্ডো/INSERT/UPDATE/DELETE/CREATE/ALTER/DROP/
   TRIGGER/INDEX/VIEW/ট্রানজ্যাকশন/GRANT) সহজ বাংলা ও ইংরেজিতে ধাপে ধাপে বুঝিয়ে দেয়। পুরোপুরি অফলাইন, নিয়মভিত্তিক। */
(function () {
  'use strict';
  const { esc, n } = SB;
  const EN = () => I18N.lang === 'en';
  const T = (bn, en) => EN() ? en : bn;
  const C = s => `<code>${esc(String(s).trim().replace(/\s+/g, ' '))}</code>`;
  const num = v => EN() ? String(v) : n(v);
  const ordBn = k => n(k) + ({ 1: 'ম', 2: 'য়', 3: 'য়', 4: 'র্থ', 6: 'ষ্ঠ' }[k] || (k <= 10 ? 'ম' : 'তম'));
  const ordEn = k => k + (['th', 'st', 'nd', 'rd'][(k % 100 > 10 && k % 100 < 14) ? 0 : k % 10] || 'th');

  // ───────── মাস্কিং: স্ট্রিং/কমেন্ট (ও চাইলে বন্ধনীর ভেতর) স্পেস দিয়ে ঢাকা, দৈর্ঘ্য একই ─────────
  function mask(sql, parens = true) {
    let out = '', depth = 0, i = 0;
    while (i < sql.length) {
      const c = sql[i], c2 = sql.substr(i, 2);
      if (c2 === '--') { const j = sql.indexOf('\n', i); const e = j < 0 ? sql.length : j; out += ' '.repeat(e - i); i = e; continue; }
      if (c2 === '/*') { const j = sql.indexOf('*/', i + 2); const e = j < 0 ? sql.length : j + 2; out += ' '.repeat(e - i); i = e; continue; }
      if (c === "'" || c === '"' || c === '`' || c === '[') {
        const close = c === '[' ? ']' : c; let j = i + 1;
        while (j < sql.length) { if (sql[j] === close) { if (sql[j + 1] === close && close !== ']') { j += 2; continue; } break; } j++; }
        const e = Math.min(j + 1, sql.length), len = e - i;
        out += parens && depth ? ' '.repeat(len) : c + ' '.repeat(Math.max(0, len - 2)) + (len > 1 ? sql[e - 1] : '');
        i = e; continue;
      }
      if (parens && c === '(') { out += depth ? ' ' : '('; depth++; i++; continue; }
      if (parens && c === ')') { depth = Math.max(0, depth - 1); out += depth ? ' ' : ')'; i++; continue; }
      out += parens && depth ? ' ' : c; i++;
    }
    return out;
  }
  function removeComments(sql) {
    let out = '', i = 0;
    while (i < sql.length) {
      const c = sql[i], c2 = sql.substr(i, 2);
      if (c2 === '--') { const j = sql.indexOf('\n', i); i = j < 0 ? sql.length : j; continue; }
      if (c2 === '/*') { const j = sql.indexOf('*/', i + 2); i = j < 0 ? sql.length : j + 2; out += ' '; continue; }
      if (c === "'" || c === '"' || c === '`') { let j = i + 1; while (j < sql.length) { if (sql[j] === c) { if (sql[j + 1] === c) { j += 2; continue; } break; } j++; } out += sql.slice(i, j + 1); i = j + 1; continue; }
      out += c; i++;
    }
    return out;
  }
  // বন্ধনী মেলানো (স্ট্রিং-সচেতন)
  function matchParen(s, open) {
    const m = mask(s, false); let d = 0;
    for (let i = open; i < s.length; i++) { if (m[i] === '(') d++; else if (m[i] === ')') { d--; if (!d) return i; } }
    return -1;
  }
  // টপ-লেভেলে রেগেক্স মিলের অবস্থান
  function findTop(text, re, from = 0) {
    const m = mask(text), g = new RegExp(re.source, 'gi'); g.lastIndex = from; const r = [];
    let x; while ((x = g.exec(m))) { r.push({ i: x.index, e: x.index + x[0].length, s: text.slice(x.index, x.index + x[0].length), g: x }); if (!x[0].length) g.lastIndex++; }
    return r;
  }
  function splitTop(text, re = /,/) {
    const hits = findTop(text, re), parts = []; let last = 0;
    hits.forEach(h => { parts.push(text.slice(last, h.i)); last = h.e; });
    parts.push(text.slice(last));
    return parts.map(p => p.trim()).filter(Boolean);
  }
  const unwrap = s => { s = s.trim(); while (s[0] === '(' && matchParen(s, 0) === s.length - 1) s = s.slice(1, -1).trim(); return s; };
  const isSub = s => /^\(\s*(SELECT|WITH|VALUES)\b/i.test(s.trim()) && matchParen(s.trim(), 0) === s.trim().length - 1;
  const KW = new Set('SELECT FROM WHERE GROUP BY HAVING ORDER LIMIT OFFSET JOIN LEFT RIGHT INNER OUTER FULL CROSS NATURAL ON USING AND OR NOT AS DESC ASC UNION ALL EXCEPT INTERSECT WINDOW CASE WHEN THEN ELSE END NULL IS IN LIKE BETWEEN EXISTS DISTINCT SET VALUES INTO RETURNING'.split(' '));

  // ───────── স্টেটমেন্ট আলাদা করা (TRIGGER-এর BEGIN…END ঠিক রাখে) ─────────
  function splitStatements(sql) {
    const m = mask(sql, false), out = []; let start = 0, depth = 0;
    const wordAt = (i, w) => m.substr(i, w.length).toUpperCase() === w && !/\w/.test(m[i - 1] || ' ') && !/\w/.test(m[i + w.length] || ' ');
    let block = 0;
    for (let i = 0; i < m.length; i++) {
      const c = m[i];
      if (c === '(') depth++; else if (c === ')') depth--;
      else if (/[A-Za-z]/.test(c) && !/\w/.test(m[i - 1] || ' ')) {
        const head = m.slice(start, i);
        if (/^\s*CREATE\s+(TEMP\w*\s+)?TRIGGER\b/i.test(head + m.slice(i, i + 8))) {
          if (wordAt(i, 'BEGIN') || wordAt(i, 'CASE')) block++;
          else if (wordAt(i, 'END')) block--;
        }
      } else if (c === ';' && depth <= 0 && block <= 0) { out.push(sql.slice(start, i)); start = i + 1; block = 0; }
    }
    out.push(sql.slice(start));
    return out.map(s => removeComments(s).trim()).filter(Boolean);
  }

  // ───────── ফাংশন অভিধান ─────────
  const dial = (ctx, bn, en) => ctx.notes.push({ type: 'dialect', html: T(bn, en) });
  const FN = {
    COUNT: (a) => /^\*$/.test(a[0]) ? T('মোট রো-র সংখ্যা', 'the number of rows') : /^DISTINCT\s+/i.test(a[0]) ? T(`${C(a[0].replace(/^DISTINCT\s+/i, ''))}-এর আলাদা (ভিন্ন) মানের সংখ্যা`, `the number of distinct ${C(a[0].replace(/^DISTINCT\s+/i, ''))} values`) : T(`${C(a[0])}-এ NULL নয় এমন মানের সংখ্যা`, `the count of non-NULL ${C(a[0])} values`),
    SUM: a => T(`${C(a[0])}-এর যোগফল`, `the sum of ${C(a[0])}`), TOTAL: a => T(`${C(a[0])}-এর যোগফল (কিছু না থাকলে 0.0)`, `the sum of ${C(a[0])} (0.0 if none)`),
    AVG: a => T(`${C(a[0])}-এর গড় (NULL বাদ দিয়ে)`, `the average of ${C(a[0])} (NULLs ignored)`),
    MIN: a => a.length > 1 ? T(`${a.map(C).join(', ')}-এর মধ্যে সবচেয়ে ছোটটি`, `the smallest of ${a.map(C).join(', ')}`) : T(`${C(a[0])}-এর সবচেয়ে ছোট মান`, `the smallest ${C(a[0])}`),
    MAX: a => a.length > 1 ? T(`${a.map(C).join(', ')}-এর মধ্যে সবচেয়ে বড়টি`, `the largest of ${a.map(C).join(', ')}`) : T(`${C(a[0])}-এর সবচেয়ে বড় মান`, `the largest ${C(a[0])}`),
    GROUP_CONCAT: a => T(`দলের সব ${C(a[0])} মান${a[1] ? ` ${C(a[1])} দিয়ে` : ' কমা দিয়ে'} জোড়া লাগানো এক লাইনে`, `all ${C(a[0])} values of the group joined${a[1] ? ` with ${C(a[1])}` : ' with commas'} into one string`),
    STRING_AGG: (a, x) => (dial(x, 'STRING_AGG PostgreSQL/SQL Server-এর; SQLite/MySQL-এ GROUP_CONCAT।', 'STRING_AGG is PostgreSQL/SQL Server; SQLite/MySQL use GROUP_CONCAT.'), FN.GROUP_CONCAT(a)),
    LISTAGG: (a, x) => (dial(x, 'LISTAGG Oracle-এর; SQLite-এ GROUP_CONCAT।', 'LISTAGG is Oracle; SQLite uses GROUP_CONCAT.'), FN.GROUP_CONCAT(a)),
    UPPER: a => T(`${C(a[0])} বড় হাতের অক্ষরে`, `${C(a[0])} in UPPER case`), LOWER: a => T(`${C(a[0])} ছোট হাতের অক্ষরে`, `${C(a[0])} in lower case`),
    LENGTH: a => T(`${C(a[0])}-এর অক্ষর সংখ্যা`, `the number of characters in ${C(a[0])}`),
    LEN: (a, x) => (dial(x, 'LEN SQL Server-এর; SQLite/MySQL-এ LENGTH।', 'LEN is SQL Server; SQLite/MySQL use LENGTH.'), FN.LENGTH(a)),
    CHAR_LENGTH: (a, x) => (dial(x, 'CHAR_LENGTH MySQL/PostgreSQL-এর; SQLite-এ LENGTH।', 'CHAR_LENGTH is MySQL/PostgreSQL; SQLite uses LENGTH.'), FN.LENGTH(a)),
    TRIM: a => T(`${C(a[0])}-এর দুই পাশের ফাঁকা জায়গা বাদ`, `${C(a[0])} with surrounding spaces removed`), LTRIM: a => T(`${C(a[0])}-এর বাঁ পাশের ফাঁকা বাদ`, `${C(a[0])} without leading spaces`), RTRIM: a => T(`${C(a[0])}-এর ডান পাশের ফাঁকা বাদ`, `${C(a[0])} without trailing spaces`),
    SUBSTR: a => T(`${C(a[0])}-এর ${num(a[1] || 1)} নম্বর অক্ষর থেকে ${a[2] ? num(a[2]) + 'টি অক্ষর' : 'শেষ পর্যন্ত'}`, `${a[2] ? a[2] + ' characters' : 'the rest'} of ${C(a[0])} starting at position ${a[1] || 1}`),
    SUBSTRING: (a) => FN.SUBSTR(a.length === 1 ? a[0].split(/\s+(?:FROM|FOR)\s+/i) : a),
    LEFT: (a, x) => (dial(x, 'LEFT() MySQL/SQL Server-এর; SQLite-এ SUBSTR(x, 1, n)।', 'LEFT() is MySQL/SQL Server; in SQLite use SUBSTR(x, 1, n).'), T(`${C(a[0])}-এর প্রথম ${num(a[1])}টি অক্ষর`, `the first ${a[1]} characters of ${C(a[0])}`)),
    RIGHT: (a, x) => (dial(x, 'RIGHT() MySQL/SQL Server-এর; SQLite-এ SUBSTR(x, -n)।', 'RIGHT() is MySQL/SQL Server; in SQLite use SUBSTR(x, -n).'), T(`${C(a[0])}-এর শেষ ${num(a[1])}টি অক্ষর`, `the last ${a[1]} characters of ${C(a[0])}`)),
    REPLACE: a => T(`${C(a[0])}-এ ${C(a[1])}-এর জায়গায় ${C(a[2])} বসানো`, `${C(a[0])} with ${C(a[1])} replaced by ${C(a[2])}`),
    INSTR: a => T(`${C(a[0])}-এর ভেতরে ${C(a[1])} কত নম্বর অবস্থানে (না থাকলে 0)`, `the position of ${C(a[1])} inside ${C(a[0])} (0 if absent)`),
    CONCAT: a => T(`${a.map(C).join(' + ')} জোড়া লাগানো লেখা`, `${a.map(C).join(' + ')} joined into one string`),
    CONCAT_WS: a => T(`${a.slice(1).map(C).join(', ')} — মাঝে ${C(a[0])} দিয়ে জোড়া`, `${a.slice(1).map(C).join(', ')} joined with ${C(a[0])}`),
    ROUND: a => T(`${C(a[0])} ${a[1] ? `দশমিকের পর ${num(a[1])} ঘর পর্যন্ত` : 'পূর্ণসংখ্যায়'} রাউন্ড করা`, `${C(a[0])} rounded to ${a[1] ? a[1] + ' decimal places' : 'a whole number'}`),
    ABS: a => T(`${C(a[0])}-এর পরম মান (চিহ্ন ছাড়া)`, `the absolute value of ${C(a[0])}`),
    CEIL: a => T(`${C(a[0])}-এর ঊর্ধ্ব পূর্ণসংখ্যা`, `${C(a[0])} rounded up`), CEILING: a => FN.CEIL(a), FLOOR: a => T(`${C(a[0])}-এর নিম্ন পূর্ণসংখ্যা`, `${C(a[0])} rounded down`),
    MOD: a => T(`${C(a[0])}-কে ${C(a[1])} দিয়ে ভাগ করলে ভাগশেষ`, `the remainder of ${C(a[0])} ÷ ${C(a[1])}`),
    POWER: a => T(`${C(a[0])}-এর ${C(a[1])} ঘাত`, `${C(a[0])} to the power ${C(a[1])}`), POW: a => FN.POWER(a), SQRT: a => T(`${C(a[0])}-এর বর্গমূল`, `the square root of ${C(a[0])}`),
    RANDOM: () => T('একটি এলোমেলো সংখ্যা', 'a random number'),
    RAND: (a, x) => (dial(x, 'RAND() MySQL-এর; SQLite-এ RANDOM()।', 'RAND() is MySQL; SQLite uses RANDOM().'), FN.RANDOM()),
    COALESCE: a => T(`${a.map(C).join(', ')} — এদের মধ্যে প্রথম যেটা NULL নয়`, `the first non-NULL of ${a.map(C).join(', ')}`),
    IFNULL: a => T(`${C(a[0])}; সেটা NULL হলে ${C(a[1])}`, `${C(a[0])}, or ${C(a[1])} if it is NULL`),
    NVL: (a, x) => (dial(x, 'NVL Oracle-এর; SQLite/MySQL-এ IFNULL বা COALESCE।', 'NVL is Oracle; SQLite/MySQL use IFNULL or COALESCE.'), FN.IFNULL(a)),
    ISNULL: (a, x) => a.length > 1 ? (dial(x, 'ISNULL(a, b) SQL Server-এর; SQLite-এ IFNULL।', 'ISNULL(a, b) is SQL Server; SQLite uses IFNULL.'), FN.IFNULL(a)) : T(`${C(a[0])} NULL কিনা (1/0)`, `whether ${C(a[0])} is NULL (1/0)`),
    NULLIF: a => T(`${C(a[0])}; কিন্তু সেটা ${C(a[1])}-এর সমান হলে NULL (শূন্য দিয়ে ভাগ এড়াতে কাজে লাগে)`, `${C(a[0])}, but NULL if it equals ${C(a[1])} (handy to avoid division by zero)`),
    IIF: (a, x) => T(`${cond(a[0], x)} হলে ${C(a[1])}, না হলে ${C(a[2])}`, `${C(a[1])} if ${cond(a[0], x)}, otherwise ${C(a[2])}`),
    IF: (a, x) => (dial(x, 'IF() MySQL-এর; SQLite-এ IIF() বা CASE।', 'IF() is MySQL; SQLite uses IIF() or CASE.'), FN.IIF(a, x)),
    CAST: a => { const p = a[0].split(/\s+AS\s+/i); return T(`${C(p[0])}-কে ${C(p[1] || '')} টাইপে রূপান্তর`, `${C(p[0])} converted to ${C(p[1] || '')}`); },
    TYPEOF: a => T(`${C(a[0])}-এর ডেটা টাইপের নাম`, `the data type name of ${C(a[0])}`),
    DATE: a => /^'now'$/i.test(a[0] || '') && a.length === 1 ? T('আজকের তারিখ', "today's date") : T(`${a.map(C).join(', ')} থেকে তারিখ (YYYY-MM-DD)`, `a date (YYYY-MM-DD) from ${a.map(C).join(', ')}`),
    TIME: a => T(`${a.map(C).join(', ')} থেকে সময় (HH:MM:SS)`, `the time (HH:MM:SS) from ${a.map(C).join(', ')}`),
    DATETIME: a => /^'now'$/i.test(a[0] || '') && a.length === 1 ? T('এই মুহূর্তের তারিখ-সময় (UTC)', 'the current date-time (UTC)') : T(`${a.map(C).join(', ')} থেকে তারিখ-সময়`, `a date-time from ${a.map(C).join(', ')}`),
    JULIANDAY: a => T(`${C(a[0])}-কে দিন-সংখ্যায় (দুটো বিয়োগ করলে মাঝে কত দিন)`, `${C(a[0])} as a day number (subtract two to get days between)`),
    STRFTIME: a => T(`${C(a[1] || "'now'")} থেকে ${C(a[0])} ফরম্যাটে অংশ (যেমন %Y = বছর, %m = মাস)`, `the ${C(a[0])} part of ${C(a[1] || "'now'")} (e.g. %Y = year, %m = month)`),
    NOW: (a, x) => (dial(x, 'NOW() MySQL/PostgreSQL-এর; SQLite-এ datetime(\'now\')।', "NOW() is MySQL/PostgreSQL; SQLite uses datetime('now')."), T('এই মুহূর্তের তারিখ-সময়', 'the current date-time')),
    CURDATE: (a, x) => (dial(x, 'CURDATE() MySQL-এর; SQLite-এ date(\'now\')।', "CURDATE() is MySQL; SQLite uses date('now')."), T('আজকের তারিখ', "today's date")),
    GETDATE: (a, x) => (dial(x, 'GETDATE() SQL Server-এর; SQLite-এ datetime(\'now\')।', "GETDATE() is SQL Server; SQLite uses datetime('now')."), T('এই মুহূর্তের তারিখ-সময়', 'the current date-time')),
    DATEDIFF: (a, x) => (dial(x, 'DATEDIFF MySQL/SQL Server-এর; SQLite-এ julianday(a) - julianday(b)।', 'DATEDIFF is MySQL/SQL Server; SQLite uses julianday(a) - julianday(b).'), T(`${a.map(C).join(' ও ')}-এর মধ্যে ব্যবধান (দিন)`, `the gap between ${a.map(C).join(' and ')} (days)`)),
    DATE_FORMAT: (a, x) => (dial(x, 'DATE_FORMAT MySQL-এর; SQLite-এ strftime।', 'DATE_FORMAT is MySQL; SQLite uses strftime.'), T(`${C(a[0])}-কে ${C(a[1])} ফরম্যাটে`, `${C(a[0])} formatted as ${C(a[1])}`)),
    YEAR: (a, x) => (dial(x, "YEAR() MySQL-এর; SQLite-এ strftime('%Y', d)।", "YEAR() is MySQL; SQLite uses strftime('%Y', d)."), T(`${C(a[0])}-এর বছর`, `the year of ${C(a[0])}`)),
    MONTH: (a, x) => (dial(x, "MONTH() MySQL-এর; SQLite-এ strftime('%m', d)।", "MONTH() is MySQL; SQLite uses strftime('%m', d)."), T(`${C(a[0])}-এর মাস`, `the month of ${C(a[0])}`)),
    DAY: (a, x) => (dial(x, "DAY() MySQL-এর; SQLite-এ strftime('%d', d)।", "DAY() is MySQL; SQLite uses strftime('%d', d)."), T(`${C(a[0])}-এর দিন`, `the day of ${C(a[0])}`)),
    EXTRACT: (a, x) => { const p = a[0].split(/\s+FROM\s+/i); dial(x, 'EXTRACT PostgreSQL/MySQL/Oracle-এর; SQLite-এ strftime।', 'EXTRACT is PostgreSQL/MySQL/Oracle; SQLite uses strftime.'); return T(`${C(p[1] || '')}-এর ${C(p[0])} অংশ`, `the ${C(p[0])} part of ${C(p[1] || '')}`); },
    TO_CHAR: (a, x) => (dial(x, 'TO_CHAR Oracle/PostgreSQL-এর; SQLite-এ strftime বা printf।', 'TO_CHAR is Oracle/PostgreSQL; SQLite uses strftime or printf.'), T(`${C(a[0])}-কে লেখায় (${C(a[1] || '')} ফরম্যাট)`, `${C(a[0])} as text (${C(a[1] || '')} format)`)),
    TO_DATE: (a, x) => (dial(x, 'TO_DATE Oracle/PostgreSQL-এর; SQLite-এ date()।', 'TO_DATE is Oracle/PostgreSQL; SQLite uses date().'), T(`${C(a[0])} লেখা থেকে তারিখ`, `a date parsed from ${C(a[0])}`)),
    PRINTF: a => T(`${C(a[0])} ছাঁচে ${a.slice(1).map(C).join(', ')} বসিয়ে লেখা`, `text built from the template ${C(a[0])} with ${a.slice(1).map(C).join(', ')}`), FORMAT: a => FN.PRINTF(a),
    JSON_EXTRACT: a => T(`JSON ${C(a[0])} থেকে ${C(a[1])} পথের মান`, `the value at path ${C(a[1])} inside JSON ${C(a[0])}`),
    JSON_OBJECT: a => T('দেওয়া key-value দিয়ে একটি JSON অবজেক্ট', 'a JSON object from the given key/value pairs'), JSON_ARRAY: a => T('দেওয়া মানগুলো দিয়ে JSON অ্যারে', 'a JSON array of the given values'),
    JSON_ARRAY_LENGTH: a => T(`JSON অ্যারে ${C(a[0])}-এ কয়টি উপাদান`, `the number of items in JSON array ${C(a[0])}`),
    ROW_NUMBER: () => T('ক্রমিক নম্বর ১, ২, ৩… (সমান মান হলেও আলাদা নম্বর)', 'a running number 1, 2, 3… (ties still get different numbers)'),
    RANK: () => T('র‍্যাংক — সমান মান হলে একই নম্বর, পরের নম্বর লাফ দেয় (১, ১, ৩)', 'a rank — ties share a number and the next one skips (1, 1, 3)'),
    DENSE_RANK: () => T('র‍্যাংক — সমান মান হলে একই নম্বর, কোনো ফাঁক থাকে না (১, ১, ২)', 'a rank — ties share a number with no gaps (1, 1, 2)'),
    NTILE: a => T(`রোগুলোকে ${num(a[0])}টি প্রায়-সমান ভাগে ভাগ করে ভাগের নম্বর`, `the bucket number after splitting rows into ${a[0]} near-equal buckets`),
    PERCENT_RANK: () => T('শতকরা অবস্থান (০ থেকে ১)', 'the relative rank from 0 to 1'), CUME_DIST: () => T('ক্রমযোজিত অনুপাত (এ পর্যন্ত কত অংশ রো)', 'the cumulative share of rows so far'),
    LAG: a => T(`${num(a[1] || 1)} রো আগের ${C(a[0])}${a[2] ? ` (না থাকলে ${C(a[2])})` : ' (না থাকলে NULL)'}`, `${C(a[0])} from ${a[1] || 1} row(s) before${a[2] ? ` (or ${C(a[2])})` : ' (or NULL)'}`),
    LEAD: a => T(`${num(a[1] || 1)} রো পরের ${C(a[0])}${a[2] ? ` (না থাকলে ${C(a[2])})` : ' (না থাকলে NULL)'}`, `${C(a[0])} from ${a[1] || 1} row(s) after${a[2] ? ` (or ${C(a[2])})` : ' (or NULL)'}`),
    FIRST_VALUE: a => T(`ফ্রেমের প্রথম রো-র ${C(a[0])}`, `${C(a[0])} of the first row in the frame`), LAST_VALUE: a => T(`ফ্রেমের শেষ রো-র ${C(a[0])} (সাবধান: ডিফল্ট ফ্রেম বর্তমান রো পর্যন্ত)`, `${C(a[0])} of the last row in the frame (careful: the default frame ends at the current row)`),
    NTH_VALUE: a => T(`ফ্রেমের ${num(a[1])} নম্বর রো-র ${C(a[0])}`, `${C(a[0])} of row ${a[1]} in the frame`),
    LAST_INSERT_ROWID: () => T('সর্বশেষ INSERT হওয়া রো-র id', 'the id of the last inserted row'), CHANGES: () => T('শেষ স্টেটমেন্টে কয়টি রো বদলেছে', 'how many rows the last statement changed'),
    QUOTE: a => T(`${C(a[0])}-কে SQL লিটারেল আকারে`, `${C(a[0])} as an SQL literal`), HEX: a => T(`${C(a[0])}-এর hex রূপ`, `${C(a[0])} in hex`), UNICODE: a => T(`${C(a[0])}-এর প্রথম অক্ষরের কোড`, `the code of the first character of ${C(a[0])}`), CHAR: a => T('কোড থেকে অক্ষর', 'characters from codes'),
    DATE_SUB: (a, x) => (dial(x, "DATE_SUB/DATE_ADD MySQL-এর; SQLite-এ date(d, '-5 years') বা date(d, '+7 days')।", "DATE_SUB/DATE_ADD is MySQL; SQLite uses date(d, '-5 years') or date(d, '+7 days')."), T(`${C(a[0])} থেকে ${C(a[1] || '')} বিয়োগ করা তারিখ`, `${C(a[0])} minus ${C(a[1] || '')}`)),
    DATE_ADD: (a, x) => (FN.DATE_SUB([], x), T(`${C(a[0])}-এর সাথে ${C(a[1] || '')} যোগ করা তারিখ`, `${C(a[0])} plus ${C(a[1] || '')}`)),
    RAISE: a => T(`এরর দিয়ে কাজ থামানো (${C(a[0])})${a[1] ? ': ' + C(a[1]) : ''}`, `stop with an error (${C(a[0])})${a[1] ? ': ' + C(a[1]) : ''}`),
    SIGN: a => T(`${C(a[0])} ধনাত্মক (১), ঋণাত্মক (−১) না শূন্য (০)`, `the sign of ${C(a[0])} (1, −1 or 0)`),
  };
  const AGG = /^(COUNT|SUM|AVG|MIN|MAX|TOTAL|GROUP_CONCAT|STRING_AGG|LISTAGG)$/i;
  const WIN_ONLY = /^(ROW_NUMBER|RANK|DENSE_RANK|NTILE|PERCENT_RANK|CUME_DIST|LAG|LEAD|FIRST_VALUE|LAST_VALUE|NTH_VALUE)$/i;

  // ───────── সাবকুয়েরি ─────────
  const CIRC = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];
  function addSub(text, ctx, role) {
    const body = unwrap(text);
    const key = role + '|' + body.replace(/\s+/g, ' ');
    const memo = ctx.root.subMemo || (ctx.root.subMemo = {});
    if (memo[key]) { if (!ctx.subs.includes(memo[key])) ctx.subs.push(memo[key]); return memo[key].ref; }
    const k = ctx.root.subCount = (ctx.root.subCount || 0) + 1;
    const tag = CIRC[k - 1] || `#${k}`;
    const inner = { notes: [], subs: [], aliases: {}, outer: { ...ctx.outer, ...ctx.aliases }, depth: ctx.depth + 1, root: ctx.root };
    const res = explainAny(body, inner);
    // correlated: ভেতরে বাইরের alias-এর ব্যবহার
    const outerNames = Object.keys(inner.outer).filter(a => !(a in inner.aliases));
    const corr = outerNames.find(a => new RegExp(`(^|[^\\w.])${a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.\\w`, 'i').test(mask(body, false)));
    const ref = `<span class="xp-subref">${T('সাবকুয়েরি', 'subquery')} ${tag}</span>`;
    const entry = { tag, role, sql: body, res, corr, ref }; memo[key] = entry;
    ctx.subs.push(entry);
    ctx.root.notes.push(...inner.notes.filter(x => !ctx.root.notes.some(y => y.html === x.html)));
    return ref;
  }

  // ───────── এক্সপ্রেশন ─────────
  function caseExpr(e, ctx) {
    const m = mask(e), toks = []; const re = /\b(CASE|WHEN|THEN|ELSE|END)\b/gi; let x, d = 0;
    while ((x = re.exec(m))) { const w = x[1].toUpperCase(); if (w === 'CASE') { d++; if (d === 1) toks.push({ w, i: x.index, e: re.lastIndex }); continue; } if (w === 'END') { if (d === 1) toks.push({ w, i: x.index, e: re.lastIndex }); d--; continue; } if (d === 1) toks.push({ w, i: x.index, e: re.lastIndex }); }
    const part = k => e.slice(toks[k].e, toks[k + 1] ? toks[k + 1].i : e.length).trim();
    const subject = toks.length > 1 && toks[0].w === 'CASE' ? part(0) : '';
    const rules = []; let other = null;
    toks.forEach((tk, k) => {
      if (tk.w === 'WHEN') { const w = part(k), th = toks[k + 1] && toks[k + 1].w === 'THEN' ? part(k + 1) : ''; rules.push(subject ? T(`${C(subject)} = ${C(w)} হলে → ${expr(th, ctx)}`, `if ${C(subject)} = ${C(w)} → ${expr(th, ctx)}`) : T(`${cond(w, ctx)} হলে → ${expr(th, ctx)}`, `if ${cond(w, ctx)} → ${expr(th, ctx)}`)); }
      if (tk.w === 'ELSE') other = part(k);
    });
    return T('শর্ত অনুযায়ী মান (প্রথম যে শর্ত মেলে): ', 'a value chosen by condition (first match wins): ') + `<ul class="xp-case">${rules.map(r => `<li>${r}</li>`).join('')}<li>${other !== null ? T(`অন্য সব ক্ষেত্রে → ${expr(other, ctx)}`, `otherwise → ${expr(other, ctx)}`) : T('কোনো শর্ত না মিললে → NULL', 'no match → NULL')}</li></ul>`;
  }
  function overClause(o, ctx) {
    o = o.trim();
    if (!o.startsWith('(')) return T(`${C(o)} নামের উইন্ডো`, `the window named ${C(o)}`);
    const body = o.slice(1, -1), parts = [];
    const pm = findTop(body, /\bPARTITION\s+BY\b/), om = findTop(body, /\bORDER\s+BY\b/), fm = findTop(body, /\b(ROWS|RANGE|GROUPS)\b/);
    const cut = (h, list) => { const ends = list.filter(x => x && x.i > h.i).map(x => x.i); return body.slice(h.e, ends.length ? Math.min(...ends) : body.length).trim(); };
    const all = [pm[0], om[0], fm[0]];
    const part = pm[0] ? cut(pm[0], all) : '', ord = om[0] ? cut(om[0], all) : '', frame = fm[0] ? body.slice(fm[0].i).trim() : '';
    parts.push(part ? T(`প্রতিটি ${C(part)} দলের ভেতরে আলাদাভাবে`, `separately within each ${C(part)} group`) : T('সব রো একসাথে একটি উইন্ডো', 'all rows as one window'));
    if (ord) parts.push(T(`${orderPhrase(ord)} ক্রমে`, `in ${orderPhrase(ord)} order`));
    if (frame) parts.push(T(`ফ্রেম: ${framePhrase(frame)}`, `frame: ${framePhrase(frame)}`));
    return { text: parts.join(', '), part, ord, frame };
  }
  function framePhrase(f) {
    const b = s => { s = s.trim().toUpperCase(); if (s === 'UNBOUNDED PRECEDING') return T('একদম শুরু', 'the very start'); if (s === 'UNBOUNDED FOLLOWING') return T('একদম শেষ', 'the very end'); if (s === 'CURRENT ROW') return T('বর্তমান রো', 'the current row'); const m = s.match(/^(\d+)\s+(PRECEDING|FOLLOWING)$/); return m ? (m[2] === 'PRECEDING' ? T(`${num(m[1])} রো আগে`, `${m[1]} row(s) before`) : T(`${num(m[1])} রো পরে`, `${m[1]} row(s) after`)) : C(s); };
    const m = f.match(/^(ROWS|RANGE|GROUPS)\s+BETWEEN\s+(.+?)\s+AND\s+(.+)$/i);
    if (m) return T(`${b(m[2])} থেকে ${b(m[3])} পর্যন্ত`, `from ${b(m[2])} to ${b(m[3])}`);
    const s = f.match(/^(ROWS|RANGE|GROUPS)\s+(.+)$/i); return s ? T(`${b(s[2])} থেকে বর্তমান রো পর্যন্ত`, `from ${b(s[2])} to the current row`) : C(f);
  }
  function fnCall(e) {
    const m = mask(e); const fm = m.match(/^([A-Za-z_][\w.]*)\s*\(\s*\)$/);
    if (!fm) return null;
    const open = e.indexOf('(');
    const inner = e.slice(open + 1, -1).trim();
    const name = fm[1].toUpperCase().replace(/^.*\./, '');
    return { name, inner, args: inner ? splitTop(inner) : [] };
  }
  function expr(e, ctx) {
    e = (e || '').trim(); if (!e) return '';
    if (isSub(e)) return addSub(e, ctx, 'scalar') + T(' (একটি মান দেয়)', ' (gives one value)');
    const raw = e; e = unwrap(e);
    if (e === '*') return T('সব কলাম', 'all columns');
    if (/^[\w"`\[\]]+\.\*$/.test(e)) return T(`${C(e.slice(0, -2))} টেবিলের সব কলাম`, `all columns of ${C(e.slice(0, -2))}`);
    const m = mask(e);
    const ov = findTop(e, /\bOVER\b/);
    if (ov.length) {
      const fpart = e.slice(0, ov[0].i).trim(), opart = e.slice(ov[0].e).trim();
      const f = fnCall(fpart); ctx.hasWindow = true;
      const o = overClause(opart, ctx);
      let what = f && FN[f.name] ? FN[f.name](f.args, ctx) : C(fpart);
      if (f && AGG.test(f.name) && typeof o === 'object') {
        if (o.ord && !o.frame) what += T(' — চলমান হিসাব (running), শুরু থেকে বর্তমান রো পর্যন্ত', ' — a running value from the start up to the current row');
        else if (!o.ord) what += T(' — পুরো দলের হিসাব, প্রতিটি রো-তে বসানো', ' — the whole group\'s value, repeated on every row');
      }
      return `${what} <span class="xp-dim">[${T('উইন্ডো', 'window')}: ${typeof o === 'object' ? o.text : o}]</span>`;
    }
    if (/^CASE\b/i.test(m) && /\bEND$/i.test(m)) return caseExpr(e, ctx);
    const f = fnCall(e);
    if (f) {
      f.args.forEach(a => { if (isSub(a)) addSub(a, ctx, 'arg'); });
      if (AGG.test(f.name) && f.args.length <= 2 && !(f.name.match(/^(MIN|MAX)$/) && f.args.length > 1)) ctx.hasAgg = true;
      if (FN[f.name]) return FN[f.name](f.args, ctx);
      return T(`${C(f.name)} ফাংশনের ফলাফল (${f.args.map(C).join(', ')})`, `the result of ${C(f.name)}(${f.args.map(C).join(', ')})`);
    }
    if (/^NULL$/i.test(e)) return T('খালি মান (NULL)', 'an empty value (NULL)');
    if (/^-?\d+(\.\d+)?$/.test(e)) return T(`সংখ্যা ${C(e)}`, `the number ${C(e)}`);
    if (/^'.*'$/s.test(e) && mask(e) === "'" + ' '.repeat(e.length - 2) + "'") return T(`লেখা ${C(e)}`, `the text ${C(e)}`);
    if (/^[A-Za-z_][\w$]*(\.[A-Za-z_][\w$]*)?$|^"[^"]+"$|^`[^`]+`$|^\[[^\]]+\]$/.test(e)) {
      if (/^(CURRENT_DATE|CURRENT_TIME|CURRENT_TIMESTAMP)$/i.test(e)) return T('এখনকার তারিখ/সময়', 'the current date/time');
      if (/^SYSDATE$/i.test(e)) { dial(ctx, "SYSDATE Oracle-এর; SQLite-এ datetime('now')।", "SYSDATE is Oracle; SQLite uses datetime('now')."); return T('এখনকার তারিখ-সময়', 'the current date-time'); }
      if (/^ROWNUM$/i.test(e)) { dial(ctx, 'ROWNUM Oracle-এর; SQLite-এ LIMIT বা ROW_NUMBER()।', 'ROWNUM is Oracle; SQLite uses LIMIT or ROW_NUMBER().'); return T('রো-র ক্রমিক নম্বর', 'the row number'); }
      return C(e);
    }
    if (/\|\|/.test(m)) return T(`${splitTop(e, /\|\|/).map(C).join(' + ')} জোড়া লাগানো লেখা`, `${splitTop(e, /\|\|/).map(C).join(' + ')} joined as text`);
    if (/(<=|>=|<>|!=|=|<|>|\bLIKE\b|\bIN\b|\bIS\b|\bBETWEEN\b)/i.test(m) && !/[+\-*/%]\s*$/.test(m)) return T(`${cond(e, ctx)} হলে ১, না হলে ০`, `1 if ${cond(e, ctx)}, else 0`);
    if (/[+\-*/%]/.test(m)) {
      findTop(e, /\(\s*(SELECT|WITH)\b/).forEach(h => { const close = matchParen(e, h.i); if (close > 0) addSub(e.slice(h.i, close + 1), ctx, 'scalar'); });
      const div = /\//.test(m) && /\b[A-Za-z_]\w*\s*\/\s*[A-Za-z_(]/.test(m) && !/\*\s*1\.0|1\.0\s*\*|CAST|REAL/i.test(e) ? T(' (সাবধান: দুটোই পূর্ণসংখ্যা হলে SQLite ভাগফলের দশমিক বাদ দেয় — 1.0 * দিয়ে গুণ করো)', ' (careful: integer ÷ integer drops the decimals in SQLite — multiply by 1.0)') : '';
      return T(`হিসাব করা মান ${C(e)}`, `the computed value ${C(e)}`) + div;
    }
    return C(raw);
  }

  // ───────── শর্ত (WHERE / HAVING / ON) ─────────
  function splitAnd(c) {
    const hits = findTop(c, /\b(AND|BETWEEN)\b/), out = []; let last = 0, pendingBetween = false;
    hits.forEach(h => { const w = h.s.toUpperCase(); if (w === 'BETWEEN') { pendingBetween = true; return; } if (pendingBetween) { pendingBetween = false; return; } out.push(c.slice(last, h.i)); last = h.e; });
    out.push(c.slice(last));
    return out.map(s => s.trim()).filter(Boolean);
  }
  function likePhrase(lhs, pat, neg) {
    const raw = pat.replace(/^'|'$/g, '');
    let p;
    const lit = s => C(`'${s}'`);
    if (!/[%_]/.test(raw)) p = T(`হুবহু ${lit(raw)}`, `exactly ${lit(raw)}`);
    else if (/^[^%_]+%$/.test(raw)) p = T(`${lit(raw.slice(0, -1))} দিয়ে শুরু`, `starts with ${lit(raw.slice(0, -1))}`);
    else if (/^%[^%_]+$/.test(raw)) p = T(`${lit(raw.slice(1))} দিয়ে শেষ`, `ends with ${lit(raw.slice(1))}`);
    else if (/^%[^%_]+%$/.test(raw)) p = T(`ভেতরে কোথাও ${lit(raw.slice(1, -1))} আছে`, `contains ${lit(raw.slice(1, -1))}`);
    else if (/^_+$/.test(raw)) p = T(`ঠিক ${num(raw.length)}টি অক্ষরের`, `exactly ${raw.length} characters long`);
    else if (/^(_+)([^%_]+)%$/.test(raw)) { const mm = raw.match(/^(_+)([^%_]+)%$/); p = T(`প্রথম ${num(mm[1].length)}টি অক্ষর যেকোনো, তারপর ${lit(mm[2])}`, `any ${mm[1].length} character(s), then ${lit(mm[2])}`); }
    else if (/^[^%_]+%[^%_]+$/.test(raw)) { const [a, b] = raw.split('%'); p = T(`${lit(a)} দিয়ে শুরু আর ${lit(b)} দিয়ে শেষ`, `starts with ${lit(a)} and ends with ${lit(b)}`); }
    else p = T(`${C(pat)} ছাঁচে মেলে (% = যেকোনো কিছু, _ = ঠিক একটি অক্ষর)`, `matches the pattern ${C(pat)} (% = anything, _ = exactly one character)`);
    return neg ? T(`${C(lhs)} ${p} নয়`, `${C(lhs)} does not ${p.replace(/^(starts|ends|contains)/, m => ({ starts: 'start', ends: 'end', contains: 'contain' })[m])}`) : T(`${C(lhs)} ${p}`, `${C(lhs)} ${p}`);
  }
  const OPS = {
    '=': (a, b) => T(`${a} = ${b}`, `${a} equals ${b}`), '==': (a, b) => OPS['='](a, b),
    '>': (a, b) => T(`${a}, ${b}-এর চেয়ে বেশি`, `${a} is greater than ${b}`), '>=': (a, b) => T(`${a}, ${b} বা তার বেশি`, `${a} is at least ${b}`),
    '<': (a, b) => T(`${a}, ${b}-এর চেয়ে কম`, `${a} is less than ${b}`), '<=': (a, b) => T(`${a}, ${b} বা তার কম`, `${a} is at most ${b}`),
    '<>': (a, b) => T(`${a}, ${b}-এর সমান নয়`, `${a} is not equal to ${b}`), '!=': (a, b) => OPS['<>'](a, b)
  };
  function side(s, ctx) { s = s.trim(); if (isSub(s)) return addSub(s, ctx, 'scalar'); const f = fnCall(unwrap(s)); if (f && AGG.test(f.name)) { ctx.hasAgg = true; return `${C(s)} <span class="xp-dim">(${FN[f.name](f.args, ctx)})</span>`; } return C(s); }
  function atom(a, ctx) {
    a = a.trim();
    if (a[0] === '(' && matchParen(a, 0) === a.length - 1 && !isSub(a)) return '(' + cond(a.slice(1, -1), ctx) + ')';
    const m = mask(a);
    let x;
    if ((x = m.match(/^(NOT\s+)?EXISTS\s*\(/i))) { const open = a.indexOf('(', x[0].length - 1); const ref = addSub(a.slice(open), ctx, 'exists'); return x[1] ? T(`${ref} একটিও রো দেয় না`, `${ref} returns no rows`) : T(`${ref} অন্তত একটি রো দেয়`, `${ref} returns at least one row`); }
    if (/^NOT\b/i.test(m)) return T(`এটা সত্য নয়: ${cond(a.replace(/^NOT\s+/i, ''), ctx)}`, `NOT (${cond(a.replace(/^NOT\s+/i, ''), ctx)})`);
    if ((x = m.match(/\s+IS\s+(NOT\s+)?NULL\s*$/i))) { const l = a.slice(0, x.index); return x[1] ? T(`${C(l)}-এ কোনো মান আছে (NULL নয়)`, `${C(l)} has a value (is not NULL)`) : T(`${C(l)} খালি (NULL)`, `${C(l)} is empty (NULL)`); }
    if ((x = m.match(/\s+(NOT\s+)?BETWEEN\s+/i))) { const l = a.slice(0, x.index), rest = a.slice(x.index + x[0].length); const p = splitTop(rest, /\bAND\b/); return x[1] ? T(`${C(l)}, ${C(p[0])} থেকে ${C(p[1] || '')}-এর বাইরে`, `${C(l)} is outside ${C(p[0])}–${C(p[1] || '')}`) : T(`${C(l)}, ${C(p[0])} থেকে ${C(p[1] || '')}-এর মধ্যে (দুই প্রান্তসহ)`, `${C(l)} is between ${C(p[0])} and ${C(p[1] || '')} (inclusive)`); }
    if ((x = m.match(/\s+(NOT\s+)?(LIKE|GLOB|ILIKE|REGEXP)\s+/i))) {
      const l = a.slice(0, x.index), r = a.slice(x.index + x[0].length).replace(/\s+ESCAPE\s+.*$/i, '').trim();
      if (/ILIKE/i.test(x[2])) dial(ctx, 'ILIKE PostgreSQL-এর; SQLite-এ সাধারণ LIKE-ই ইংরেজি অক্ষরে case-insensitive।', 'ILIKE is PostgreSQL; in SQLite plain LIKE is already case-insensitive for English letters.');
      if (/GLOB/i.test(x[2])) return T(`${C(l)} ${C(r)} ছাঁচে মেলে (GLOB: * = যেকোনো কিছু, ? = একটি অক্ষর, বড়-ছোট হাতের পার্থক্য করে)`, `${C(l)} matches ${C(r)} (GLOB: * = anything, ? = one character, case-sensitive)`);
      if (/^'.*'$/.test(r)) { if (!/[%_]/.test(r)) ctx.notes.push({ type: 'warn', html: T(`${C(a)}-এ % বা _ নেই — এটা হুবহু মিলের মতো কাজ করবে। "আছে" খুঁজতে ${C("'%text%'")}।`, `${C(a)} has no % or _ — it behaves like an exact match. For "contains" use ${C("'%text%'")}.`) }); return likePhrase(l, r, !!x[1]); }
      return T(`${C(l)}, ${C(r)} ছাঁচে মেলে`, `${C(l)} matches the pattern ${C(r)}`);
    }
    if ((x = m.match(/\s+(NOT\s+)?IN\s*\(/i))) {
      const l = a.slice(0, x.index), r = a.slice(x.index + x[0].length - 1).trim();
      if (isSub(r)) { const ref = addSub(r, ctx, 'in'); if (x[1]) ctx.notes.push({ type: 'warn', html: T('NOT IN (সাবকুয়েরি)-তে সাবকুয়েরি একটা NULL ফেরত দিলেই পুরো শর্ত অজানা হয়ে যায়, কোনো রো আসে না। নিরাপদ বিকল্প: NOT EXISTS, বা সাবকুয়েরিতে WHERE col IS NOT NULL।', 'With NOT IN (subquery), a single NULL from the subquery makes the whole test unknown and no rows come back. Safer: NOT EXISTS, or add WHERE col IS NOT NULL inside.') }); return x[1] ? T(`${C(l)}, ${ref}-এর দেওয়া মানগুলোর মধ্যে নেই`, `${C(l)} is not among the values from ${ref}`) : T(`${C(l)}, ${ref}-এর দেওয়া মানগুলোর একটি`, `${C(l)} is one of the values from ${ref}`); }
      const vals = splitTop(r.slice(1, -1));
      return x[1] ? T(`${C(l)}-এর মান ${vals.map(C).join(', ')} — এগুলোর কোনোটিই নয়`, `${C(l)} is none of ${vals.map(C).join(', ')}`) : T(`${C(l)}-এর মান ${vals.map(C).join(', ')} — এগুলোর যেকোনো একটি`, `${C(l)} is any of ${vals.map(C).join(', ')}`);
    }
    const cm = findTop(a, /(<=|>=|<>|!=|==|=|<|>)/);
    if (cm.length) {
      const op = cm[0].s, l = a.slice(0, cm[0].i).trim(), r = a.slice(cm[0].e).trim();
      if (/^NULL$/i.test(r) || /^NULL$/i.test(l)) ctx.notes.push({ type: 'warn', html: T(`${C(a)} কখনো সত্য হয় না — NULL-এর সাথে = বা <> সবসময় "অজানা"। লিখতে হবে ${C(l + (op === '=' ? ' IS NULL' : ' IS NOT NULL'))}।`, `${C(a)} is never true — comparing with NULL using = or <> is always "unknown". Write ${C(l + (op === '=' ? ' IS NULL' : ' IS NOT NULL'))}.`) });
      const am = r.match(/^(ANY|ALL|SOME)\s*(\(.*\))$/is);
      if (am) { const ref = addSub(am[2], ctx, 'scalar'); const q = am[1].toUpperCase() === 'ALL' ? T('সবগুলোর', 'all of') : T('অন্তত একটির', 'at least one of'); return T(`${C(l)} ${C(op)} ${ref}-এর ${q} মানের সাথে`, `${C(l)} ${C(op)} ${q} the values from ${ref}`); }
      return OPS[op](side(l, ctx), side(r, ctx));
    }
    if (/^ROWNUM\b/i.test(m)) dial(ctx, 'ROWNUM Oracle-এর; SQLite-এ LIMIT।', 'ROWNUM is Oracle; SQLite uses LIMIT.');
    return T(`${C(a)} সত্য`, `${C(a)} is true`);
  }
  function cond(c, ctx) {
    c = (c || '').trim();
    const ors = splitTop(c, /\bOR\b/);
    if (ors.length > 1) {
      if (ors.some(o => splitAnd(o).length > 1) && !ctx._warnedPrec) { ctx._warnedPrec = true; ctx.notes.push({ type: 'tip', html: T('এখানে AND আর OR একসাথে বন্ধনী ছাড়া আছে। মনে রেখো, AND আগে হিসাব হয় (গুণের মতো), OR পরে (যোগের মতো)। ভিন্ন অর্থ চাইলে বন্ধনী দাও।', 'AND and OR are mixed here without parentheses. AND is evaluated first (like ×), OR later (like +). Add parentheses if you mean otherwise.') }); }
      return ors.map(o => cond(o, ctx)).join(T(' <b>অথবা</b> ', ' <b>OR</b> '));
    }
    const ands = splitAnd(c);
    if (ands.length > 1) return ands.map(x => atom(x, ctx)).join(T(' <b>এবং</b> ', ' <b>AND</b> '));
    return atom(c, ctx);
  }
  function orderPhrase(o) {
    return splitTop(o).map(it => {
      const m = it.match(/^(.*?)(\s+(ASC|DESC))?(\s+NULLS\s+(FIRST|LAST))?\s*$/is);
      const e = m[1].trim(), desc = /DESC/i.test(m[3] || '');
      if (/^(RANDOM|RAND)\s*\(\s*\)$/i.test(e)) return T('এলোমেলো', 'random');
      const what = /^\d+$/.test(e) ? T(`SELECT-এর ${num(e)} নম্বর কলাম`, `select column #${e}`) : /^CASE\b/i.test(e) ? T(`নিজের ঠিক করা ক্রম (${C(e)})`, `a custom order (${C(e)})`) : C(e);
      return T(`${what} ${desc ? 'বড় থেকে ছোট' : 'ছোট থেকে বড়'}`, `${what} ${desc ? 'high → low' : 'low → high'}`) + (m[5] ? T(` (NULL ${/FIRST/i.test(m[5]) ? 'আগে' : 'শেষে'})`, ` (NULLs ${m[5].toLowerCase()})`) : '');
    }).join(T(', তারপর ', ', then '));
  }

  // ───────── FROM / JOIN ─────────
  function source(s, ctx) {
    s = s.trim();
    let m = s.match(/^(\(.*\))\s*(?:AS\s+)?([\w"`\[\]]+)?$/is);
    if (s[0] === '(' && m && matchParen(s, 0) === m[1].length - 1) {
      const alias = (m[2] || '').replace(/["`\[\]]/g, '');
      if (alias) ctx.aliases[alias.toLowerCase()] = '(subquery)';
      const ref = isSub(m[1]) ? addSub(m[1], ctx, 'from') : C(m[1]);
      return { name: alias || '(…)', html: T(`${ref}-এর ফলাফল — ${alias ? `${C(alias)} নামে ` : ''}একটি অস্থায়ী টেবিলের মতো (derived table)`, `the result of ${ref}, used as a temporary table${alias ? ` called ${C(alias)}` : ''} (derived table)`) };
    }
    m = s.match(/^([\w."`\[\]]+(?:\s*\([^)]*\))?)(?:\s+(?:AS\s+)?([\w"`\[\]]+))?$/i);
    if (!m) return { name: s, html: C(s) };
    const tbl = m[1].replace(/["`\[\]]/g, ''), alias = (m[2] || '').replace(/["`\[\]]/g, '');
    if (alias && KW.has(alias.toUpperCase())) return { name: tbl, html: C(s) };
    ctx.aliases[(alias || tbl).toLowerCase()] = tbl; ctx.tables.push(tbl.replace(/\(.*$/, ''));
    if (/^json_each|^json_tree/i.test(tbl)) return { name: alias || tbl, html: T(`${C(m[1])} — JSON-এর প্রতিটি উপাদান একেকটি রো হিসেবে`, `${C(m[1])} — each JSON element as a row`) };
    return { name: alias || tbl, tbl, html: alias && alias.toLowerCase() !== tbl.toLowerCase() ? T(`${C(tbl)} টেবিল (ছোট নাম ${C(alias)})`, `table ${C(tbl)} (alias ${C(alias)})`) : T(`${C(tbl)} টেবিল`, `table ${C(tbl)}`) };
  }
  const JOIN_RE = /(,|\b(?:NATURAL\s+)?(?:(?:LEFT|RIGHT|FULL)(?:\s+OUTER)?\s+|INNER\s+|CROSS\s+)?JOIN\b)/;
  function fromClause(f, ctx, step, whereText) {
    const hits = findTop(f, JOIN_RE), segs = []; let last = 0, kind = 'FIRST';
    hits.forEach(h => { segs.push({ kind, text: f.slice(last, h.i) }); kind = h.s.toUpperCase().replace(/\s+/g, ' '); last = h.e; });
    segs.push({ kind, text: f.slice(last) });
    const lines = []; const names = [];
    segs.forEach((sg, k) => {
      const onH = findTop(sg.text, /\b(ON|USING)\b/);
      const srcText = onH.length ? sg.text.slice(0, onH[0].i) : sg.text;
      const on = onH.length ? sg.text.slice(onH[0].e).trim() : '';
      const src = source(srcText, ctx); names.push(src);
      if (k === 0) { lines.push(T(`শুরু: ${src.html} — এর সব রো নেওয়া হয়।`, `Start: every row of ${src.html}.`)); return; }
      const kd = sg.kind;
      let jt;
      if (kd === ',') jt = T(`কমা দিয়ে ${src.html} যোগ — আগের প্রতিটি রো-র সাথে এর প্রতিটি রো জোড়া (CROSS JOIN)। ${/=/.test(whereText || '') ? 'আসল মিলটা পরে WHERE-এর শর্ত করে — পুরোনো স্টাইলের JOIN।' : ''}`, `A comma adds ${src.html} — every earlier row is paired with every row of it (CROSS JOIN). ${/=/.test(whereText || '') ? 'The real matching happens later in WHERE — old-style join.' : ''}`);
      else if (/CROSS/.test(kd)) jt = T(`<b>CROSS JOIN</b> ${src.html} — সব সম্ভাব্য জোড়া (রো সংখ্যা = দুই টেবিলের রো সংখ্যার গুণফল)।`, `<b>CROSS JOIN</b> ${src.html} — every possible pair (row count = product of both tables).`);
      else if (/NATURAL/.test(kd)) jt = T(`<b>${esc(kd)}</b> ${src.html} — দুই টেবিলে একই নামের কলামগুলো নিজে থেকে মিলিয়ে জোড়া।`, `<b>${esc(kd)}</b> ${src.html} — automatically matches on all same-named columns.`);
      else if (/LEFT/.test(kd)) { jt = T(`<b>LEFT JOIN</b> ${src.html} — বাঁ দিকের (আগের) সব রো থাকবেই; ডান দিকে মিল না পেলে ${C(src.name)}-এর কলামগুলো NULL।`, `<b>LEFT JOIN</b> ${src.html} — every row on the left (earlier) side is kept; if nothing matches on the right, ${C(src.name)}'s columns are NULL.`); src.left = true; }
      else if (/RIGHT/.test(kd)) jt = T(`<b>RIGHT JOIN</b> ${src.html} — ডান দিকের (${C(src.name)}) সব রো থাকবেই; বাঁ দিকে মিল না পেলে NULL।`, `<b>RIGHT JOIN</b> ${src.html} — every row of the right side (${C(src.name)}) is kept; unmatched left columns are NULL.`);
      else if (/FULL/.test(kd)) jt = T(`<b>FULL OUTER JOIN</b> ${src.html} — দুই দিকের সব রো থাকবে; যেদিকে মিল নেই সেদিকে NULL।`, `<b>FULL OUTER JOIN</b> ${src.html} — all rows from both sides; NULLs where there is no match.`);
      else jt = T(`<b>${/INNER/.test(kd) ? 'INNER JOIN' : 'JOIN'}</b> ${src.html} — শুধু যেসব রো-জোড়ার মিল আছে সেগুলো থাকবে; মিল না পাওয়া রো বাদ।`, `<b>${/INNER/.test(kd) ? 'INNER JOIN' : 'JOIN'}</b> ${src.html} — only row pairs that match are kept; unmatched rows are dropped.`);
      if (on) jt += /^USING/i.test(onH[0].s) ? T(` মিলানোর কলাম: ${C(on.replace(/^\(|\)$/g, ''))} (দুই টেবিলে একই নাম)।`, ` Matching column: ${C(on.replace(/^\(|\)$/g, ''))} (same name in both).`) : T(` মিলের শর্ত: ${cond(on, ctx)}।`, ` Match when: ${cond(on, ctx)}.`);
      lines.push(jt);
    });
    const tbls = names.filter(x => x.tbl).map(x => x.tbl.toLowerCase());
    if (tbls.length !== new Set(tbls).size) ctx.notes.push({ type: 'tip', html: T('একই টেবিল দুইবার আছে — এটা <b>SELF JOIN</b>। দুইটা আলাদা ছোট নাম (alias) দিয়ে একই টেবিলকে দুই ভূমিকায় ব্যবহার করা হচ্ছে (যেমন কর্মী আর তার ম্যানেজার)।', 'The same table appears twice — a <b>SELF JOIN</b>. Two aliases let one table play two roles (e.g. employee and manager).') });
    names.filter(x => x.left).forEach(x => {
      if (!whereText) return;
      const a = x.name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp(`\\b${a}\\.\\w+\\s+IS\\s+NULL`, 'i').test(whereText)) ctx.notes.push({ type: 'tip', html: T(`LEFT JOIN-এর পর WHERE-এ ${C(x.name + '.… IS NULL')} — এটা "মিল নেই এমন রো খোঁজা" (anti-join) প্যাটার্ন: যাদের ${C(x.name)}-এ কোনো মিল নেই শুধু তারা।`, `LEFT JOIN followed by ${C(x.name + '.… IS NULL')} — the anti-join pattern: only rows with no match in ${C(x.name)}.`) });
      else if (new RegExp(`\\b${a}\\.\\w+\\s*(=|>|<|LIKE|IN)`, 'i').test(whereText)) ctx.notes.push({ type: 'warn', html: T(`LEFT JOIN-এর ডান টেবিল ${C(x.name)}-এর কলাম WHERE-এ শর্তে আছে — মিল-না-পাওয়া রো-তে ওটা NULL, তাই সেগুলো বাদ পড়ে আর LEFT JOIN কার্যত INNER JOIN হয়ে যায়। সব রো রাখতে চাইলে শর্তটা ON-এ নাও।`, `A column of ${C(x.name)} (the right side of a LEFT JOIN) is filtered in WHERE — it is NULL for unmatched rows, so they are dropped and the LEFT JOIN acts like an INNER JOIN. Move the condition into ON to keep all rows.`) });
    });
    step.html = lines.length > 1 ? `<ul>${lines.map(l => `<li>${l}</li>`).join('')}</ul>` : lines[0];
    return names;
  }

  // ───────── SELECT ─────────
  const CLAUSES = [['select', /\bSELECT\b/], ['from', /\bFROM\b/], ['where', /\bWHERE\b/], ['groupBy', /\bGROUP\s+BY\b/], ['having', /\bHAVING\b/], ['window', /\bWINDOW\b/], ['orderBy', /\bORDER\s+BY\b/], ['limit', /\bLIMIT\b/], ['offset', /\bOFFSET\b/], ['fetch', /\bFETCH\s+(FIRST|NEXT)\b/]];
  function parseSimple(sql) {
    const pos = [];
    for (const [k, re] of CLAUSES) { const h = findTop(sql, re); if (h.length) pos.push({ k, i: h[0].i, e: h[0].e }); }
    pos.sort((a, b) => a.i - b.i);
    const c = {}; pos.forEach((p, i) => { c[p.k] = sql.slice(p.e, i + 1 < pos.length ? pos[i + 1].i : sql.length).trim(); });
    return c;
  }
  function splitAlias(item) {
    const m = mask(item);
    let x = m.match(/\s+AS\s+([\w"`\[\]']+)\s*$/i);
    if (x) return { e: item.slice(0, x.index).trim(), alias: item.slice(x.index + x[0].length - x[1].length).trim().replace(/^["`\['](.*)["`\]']$/, '$1') };
    x = m.match(/([^\s.(+\-*/|=<>,])\s+([A-Za-z_]\w*|"[^"]*")\s*$/);
    if (x && !KW.has(x[2].toUpperCase()) && !/\b(CASE|DISTINCT)\b[^]*$/i.test(m.slice(0, x.index + 1).replace(/\bEND\b/gi, '')) ) return { e: item.slice(0, x.index + 1).trim(), alias: x[2].replace(/"/g, '') };
    return { e: item.trim(), alias: '' };
  }
  function explainSimple(sql, ctx) {
    const c = parseSimple(sql), steps = [], sum = {};
    let selBody = c.select || '';
    let distinct = false, top = null, x;
    if ((x = selBody.match(/^\s*(DISTINCT|ALL)\b\s*/i))) { distinct = /DISTINCT/i.test(x[1]); selBody = selBody.slice(x[0].length); }
    if ((x = selBody.match(/^\s*TOP\s*\(?\s*(\d+)\s*\)?\s*(PERCENT\s+)?/i))) { top = x[1]; selBody = selBody.slice(x[0].length); dial(ctx, `TOP ${top} SQL Server-এর; SQLite/MySQL/PostgreSQL-এ শেষে LIMIT ${top}।`, `TOP ${top} is SQL Server; SQLite/MySQL/PostgreSQL put LIMIT ${top} at the end.`); }
    const add = (key, label, codeTxt, html) => { const s = { key, label, code: codeTxt, html, subs: [] }; steps.push(s); return s; };
    const withSubs = (fn) => { const before = ctx.subs.length; const out = fn(); return { out, subs: ctx.subs.slice(before) }; };
    // FROM
    if (c.from) {
      const st = add('from', /\bJOIN\b|,/i.test(mask(c.from)) ? 'FROM + JOIN' : 'FROM', c.from, '');
      const r = withSubs(() => fromClause(c.from, ctx, st, c.where));
      st.subs = r.subs; sum.from = r.out;
    }
    if (c.where) { const r = withSubs(() => cond(c.where, ctx)); const st = add('where', 'WHERE', c.where, T(`প্রতিটি রো পরীক্ষা করা হয় — শুধু যেগুলোতে শর্ত সত্য সেগুলো থাকে: ${r.out}।`, `Each row is tested; only rows where this holds remain: ${r.out}.`)); st.subs = r.subs; sum.where = r.out; }
    // SELECT আইটেম আগে বিশ্লেষণ (aggregate আছে কিনা জানতে)
    const items = splitTop(selBody).map(it => { const a = splitAlias(it); const r = withSubs(() => expr(a.e, ctx)); const plainCol = r.out === C(a.e); return { ...a, html: plainCol ? (a.alias ? T(`${C(a.e)} কলাম, নতুন নামে`, `column ${C(a.e)}, renamed`) : T('কলামের মান যেমন আছে', 'the column as is')) : r.out, plainCol, subs: r.subs }; });
    if (c.groupBy) {
      const g = splitTop(c.groupBy);
      add('group', 'GROUP BY', c.groupBy, T(`${g.map(C).join(' ও ')}-এর মান একই এমন রোগুলো এক দলে রাখা হয়। এরপর থেকে প্রতিটি দল ফলাফলে <b>একটি রো</b>; COUNT/SUM/AVG-এর মতো ফাংশন প্রতিটি দলের জন্য আলাদা হিসাব করে।`, `Rows with the same ${g.map(C).join(' and ')} are put in one group. From here on, each group becomes <b>one row</b>; COUNT/SUM/AVG compute per group.`));
      sum.group = g;
      const gl = g.map(v => v.toLowerCase().replace(/^.*\./, ''));
      const bad = items.filter(it => /^[\w.]+$/.test(it.e) && !/^\d+$/.test(it.e) && !gl.includes(it.e.toLowerCase().replace(/^.*\./, '')) && !g.some(v => v.toLowerCase() === it.e.toLowerCase()));
      if (bad.length) ctx.notes.push({ type: 'warn', html: T(`SELECT-এ ${bad.map(b => C(b.e)).join(', ')} আছে, কিন্তু সেটা GROUP BY-তেও নেই, কোনো অ্যাগ্রিগেট ফাংশনের ভেতরেও নেই। SQLite মেনে নিয়ে দলের যেকোনো একটা মান দেখায়, কিন্তু MySQL (strict), PostgreSQL আর Oracle এরর দেবে। পরীক্ষার খাতায় এটা ভুল ধরা হয়।`, `${bad.map(b => C(b.e)).join(', ')} is in SELECT but neither in GROUP BY nor inside an aggregate. SQLite shows an arbitrary value from the group; MySQL (strict), PostgreSQL and Oracle raise an error.`) });
    } else if (ctx.hasAgg && !ctx.hasWindow) {
      add('group', T('অ্যাগ্রিগেট', 'Aggregate'), '', T('GROUP BY নেই কিন্তু অ্যাগ্রিগেট ফাংশন আছে — তাই সব রো মিলে <b>একটিই দল</b>, ফলাফলে একটি রো।', 'No GROUP BY but there is an aggregate — so all rows form <b>one group</b> and the result is a single row.'));
      sum.oneRow = true;
    }
    if (c.having) { const r = withSubs(() => cond(c.having, ctx)); const st = add('having', 'HAVING', c.having, T(`দল বানানোর পর দলগুলো ছাঁকা হয় — শুধু যেসব দলে ${r.out}।`, `After grouping, groups are filtered — only groups where ${r.out}.`)); st.subs = r.subs; sum.having = r.out; if (!c.groupBy) ctx.notes.push({ type: 'tip', html: T('GROUP BY ছাড়া HAVING — পুরো টেবিল একটি দল ধরে শর্ত পরীক্ষা হয়।', 'HAVING without GROUP BY treats the whole table as one group.') }); }
    const selStep = add('select', 'SELECT', selBody, items.length === 1 ? T(`দেখানো হবে: ${items[0].plainCol ? C(items[0].e) : items[0].html}${items[0].alias ? ` → কলামের নাম ${C(items[0].alias)}` : ''}।`, `Output: ${items[0].plainCol ? C(items[0].e) : items[0].html}${items[0].alias ? ` → column name ${C(items[0].alias)}` : ''}.`) :
      T('প্রতিটি রো (বা দল) থেকে এই কলামগুলো বানানো হয়:', 'For each row (or group), these columns are produced:') + `<ul class="xp-cols">${items.map(it => `<li><span class="xp-col">${esc(it.alias || it.e.replace(/\s+/g, ' ').slice(0, 40))}</span> ${it.html}</li>`).join('')}</ul>`);
    selStep.subs = items.flatMap(i => i.subs);
    if (ctx.hasWindow) ctx.notes.push({ type: 'tip', html: T('উইন্ডো ফাংশন (OVER) GROUP BY-এর মতো রো কমায় না — প্রতিটি রো থাকে, পাশে হিসাবটা বসে। এটা WHERE/GROUP BY/HAVING-এর পরে চলে, তাই WHERE-এ উইন্ডো ফাংশন লেখা যায় না (CTE/সাবকুয়েরিতে মুড়িয়ে ফিল্টার করতে হয়)।', 'Window functions (OVER) do not collapse rows like GROUP BY — every row stays, with the value beside it. They run after WHERE/GROUP BY/HAVING, so you cannot filter on them in WHERE (wrap in a CTE/subquery).') });
    if (items.length === 1 && items[0].e === '*' && ctx.depth === 0 && !ctx.root._starTip) { ctx.root._starTip = true; ctx.notes.push({ type: 'tip', html: T('SELECT * শেখার সময় ঠিক আছে; আসল কাজে দরকারি কলামের নাম লেখা ভালো — দ্রুত হয়, আর টেবিলে কলাম বাড়লে কোড ভাঙে না।', 'SELECT * is fine for exploring; in real code list the columns you need — it is faster and won\'t break when columns are added.') }); }
    if (distinct) add('distinct', 'DISTINCT', '', T('পুরোপুরি একই রো (সব কলামের মান এক) একবারই রাখা হয় — ডুপ্লিকেট বাদ।', 'Fully identical rows (same value in every column) are kept only once — duplicates removed.'));
    if (c.orderBy) { add('order', 'ORDER BY', c.orderBy, T(`ফলাফল সাজানো হয়: ${orderPhrase(c.orderBy)}।`, `The result is sorted: ${orderPhrase(c.orderBy)}.`)); sum.order = orderPhrase(c.orderBy); }
    // LIMIT / OFFSET / TOP / FETCH
    let lim = null, off = null;
    if (c.limit) { const p = splitTop(c.limit); if (p.length === 2) { off = p[0]; lim = p[1]; } else lim = p[0]; }
    if (c.offset) off = c.offset.replace(/\s+ROWS?\s*$/i, '');
    if (c.fetch) { const fm = c.fetch.match(/(\d+)/); lim = fm ? fm[1] : '?'; dial(ctx, `FETCH FIRST … ROWS ONLY Oracle/SQL Server/PostgreSQL-এর স্ট্যান্ডার্ড রূপ; SQLite/MySQL-এ LIMIT ${lim}${off ? ' OFFSET ' + off : ''}।`, `FETCH FIRST … ROWS ONLY is the standard form (Oracle/SQL Server/PostgreSQL); SQLite/MySQL use LIMIT ${lim}${off ? ' OFFSET ' + off : ''}.`); }
    if (top) lim = top;
    if (lim !== null) {
      const ln = +lim, on = off !== null ? +off : 0;
      const txt = off !== null && !isNaN(on) && ln === 1 ? T(`প্রথম ${num(on)}টি রো বাদ দিয়ে শুধু ${ordBn(on + 1)} রো-টি রাখা হয়।`, `Skip the first ${on} row(s) and keep only row ${on + 1}.`) : off !== null && !isNaN(on) && !isNaN(ln) ? T(`প্রথম ${num(on)}টি রো বাদ দিয়ে পরের ${num(ln)}টি রাখা হয় — অর্থাৎ ${num(on + 1)} থেকে ${num(on + ln)} নম্বর রো।`, `Skip the first ${on} row(s) and keep the next ${ln} — i.e. rows ${on + 1} to ${on + ln}.`) : T(`শুধু প্রথম ${num(lim)}টি রো রাখা হয়।`, `Only the first ${lim} row(s) are kept.`);
      add('limit', top ? 'TOP' : c.fetch ? 'FETCH' : 'LIMIT', top ? 'TOP ' + top : (c.limit || '') + (c.offset ? ' OFFSET ' + c.offset : '') + (c.fetch ? 'FETCH ' + c.fetch : ''), txt);
      sum.limit = off !== null && !isNaN(on) && ln === 1 ? T(`শুধু ${ordBn(on + 1)} রো`, `only row ${on + 1}`) : off !== null && !isNaN(on) ? T(`${num(on + 1)} নম্বর থেকে ${num(ln)}টি রো`, `${ln} row(s) starting at row ${on + 1}`) : T(`প্রথম ${num(lim)}টি`, `the first ${lim}`);
      if (!c.orderBy && ctx.depth === 0) ctx.notes.push({ type: 'warn', html: T('ORDER BY ছাড়া LIMIT — কোন রোগুলো আসবে তার নিশ্চয়তা নেই। "সবচেয়ে বেশি/কম" চাইলে আগে ORDER BY দাও।', 'LIMIT without ORDER BY — which rows you get is not guaranteed. For "top/bottom N", add ORDER BY first.') });
      const ob = c.orderBy ? splitTop(c.orderBy) : [];
      if (ob.length === 1 && ln === 1 && on >= 1 && !isNaN(on)) {
        const desc = /\bDESC\b/i.test(ob[0]);
        ctx.notes.push({ type: 'tip', html: T(`এটা <b>${ordBn(on + 1)} ${desc ? 'সর্বোচ্চ' : 'সর্বনিম্ন'}</b> মান খোঁজার পরিচিত কৌশল (চাকরির পরীক্ষায় খুব কমন)। ${distinct ? 'DISTINCT থাকায় সমান মান (টাই) একবারই গোনা হচ্ছে — ঠিক আছে।' : 'সাবধান: একই মান একাধিকবার থাকলে (টাই) ভুল উত্তর আসবে — SELECT DISTINCT দাও, বা DENSE_RANK() ব্যবহার করো।'}`, `This is the classic way to find the <b>${ordEn(on + 1)} ${desc ? 'highest' : 'lowest'}</b> value (very common in job exams). ${distinct ? 'DISTINCT makes ties count once — good.' : 'Careful: with duplicate values (ties) you get the wrong answer — use SELECT DISTINCT or DENSE_RANK().'}`) });
      }
    }
    sum.items = items; sum.distinct = distinct;
    return { steps, sum, aliasCount: ctx.tables.length };
  }

  function summarySelect(sum) {
    const list = arr => arr.length <= 1 ? (arr[0] || '') : arr.slice(0, -1).join(', ') + T(' ও ', ' and ') + arr[arr.length - 1];
    const items = list((sum.items || []).slice(0, 5).map(it => it.e === '*' ? T('সব কলাম', 'all columns') : it.alias ? C(it.alias) : C(it.e.length > 30 ? it.e.slice(0, 28) + '…' : it.e))) + ((sum.items || []).length > 5 ? T(' ইত্যাদি', ' etc.') : '');
    const dupT = sum.from ? sum.from.filter(s => s.tbl).map(s => s.tbl.toLowerCase()) : [];
    const nm = s => C(s.tbl ? s.tbl + (dupT.filter(x => x === s.tbl.toLowerCase()).length > 1 && s.name !== s.tbl ? ' ' + s.name : '') : s.name);
    const src = sum.from && sum.from.length ? (sum.from.length === 1 ? T(`${nm(sum.from[0])} টেবিল থেকে`, `From ${nm(sum.from[0])}`) : T(`${list(sum.from.map(nm))} জোড়া লাগিয়ে`, `Joining ${list(sum.from.map(nm))}`)) : '';
    if (EN()) {
      const ps = [];
      if (src) ps.push(src);
      if (sum.where) ps.push('take the rows where ' + sum.where);
      if (sum.group) ps.push('group them by ' + list(sum.group.map(C)) + (sum.having ? ' (keeping only groups where ' + sum.having + ')' : ''));
      let s = ps.join(', ') + (ps.length > 1 ? ', and ' : ps.length ? ', ' : '') + 'show ' + items + (sum.distinct ? ' without duplicates' : '');
      if (sum.order || sum.limit) s += ' — ' + [sum.order ? 'sorted by ' + sum.order : '', sum.limit || ''].filter(Boolean).join(', ');
      return s.charAt(0).toUpperCase() + s.slice(1) + '.';
    }
    let s = src;
    if (sum.where) s += ` যেসব রো-তে ${sum.where}, সেগুলো নিয়ে`;
    if (sum.group) s += `${s ? ',' : ''} ${list(sum.group.map(C))} অনুযায়ী দল করে${sum.having ? ` (শুধু যেসব দলে ${sum.having})` : ''}`;
    s += `${s ? ' — ' : ''}${items} দেখাও${sum.distinct ? ' (ডুপ্লিকেট বাদে)' : ''}`;
    if (sum.order || sum.limit) s += '; ' + [sum.order ? sum.order + ' সাজিয়ে' : '', sum.limit || ''].filter(Boolean).join(', ');
    return s.trim() + '।';
  }

  // SELECT / WITH / UNION — সব ধরনের কুয়েরি
  function explainQuery(sql, ctx) {
    sql = unwrap(sql.trim().replace(/;\s*$/, ''));
    ctx.tables = ctx.tables || [];
    const m = mask(sql);
    if (/^WITH\b/i.test(m)) return explainWith(sql, ctx);
    if (/^VALUES\b/i.test(m)) { const rows = splitTop(sql.replace(/^VALUES\s*/i, '')); return { steps: [{ label: 'VALUES', code: sql, html: T(`নিজের দেওয়া ${num(rows.length)}টি রো দিয়ে একটি অস্থায়ী টেবিল।`, `A temporary table built from ${rows.length} literal row(s).`), subs: [] }], summary: T(`${num(rows.length)}টি নিজে-লেখা রো।`, `${rows.length} literal row(s).`) }; }
    const ops = findTop(sql, /\b(UNION\s+ALL|UNION|INTERSECT|EXCEPT|MINUS)\b/);
    if (ops.length) {
      const parts = []; let last = 0; ops.forEach(o => { parts.push(sql.slice(last, o.i)); last = o.e; }); parts.push(sql.slice(last));
      // শেষ অংশের ORDER BY/LIMIT পুরো ফলাফলে প্রযোজ্য
      let tail = ''; const lp = parts[parts.length - 1]; const tm = findTop(lp, /\b(ORDER\s+BY|LIMIT)\b/);
      if (tm.length) { tail = lp.slice(tm[0].i); parts[parts.length - 1] = lp.slice(0, tm[0].i); }
      const steps = []; const before = ctx.subs.length;
      const refs = parts.map(p => addSub(p, ctx, 'set'));
      const opDesc = o => { const w = o.toUpperCase().replace(/\s+/g, ' '); if (w === 'MINUS') dial(ctx, 'MINUS Oracle-এর; SQLite/PostgreSQL-এ EXCEPT।', 'MINUS is Oracle; SQLite/PostgreSQL use EXCEPT.'); return { 'UNION ALL': T('দুই ফলাফল একসাথে, ডুপ্লিকেটসহ (দ্রুত)', 'both results stacked, duplicates kept (faster)'), UNION: T('দুই ফলাফল একসাথে, ডুপ্লিকেট বাদ দিয়ে', 'both results stacked, duplicates removed'), INTERSECT: T('যে রো দুই ফলাফলেই আছে শুধু সেগুলো', 'only rows present in both results'), EXCEPT: T('প্রথম ফলাফলে আছে কিন্তু পরেরটায় নেই এমন রো', 'rows in the first result but not in the next'), MINUS: T('প্রথম ফলাফলে আছে কিন্তু পরেরটায় নেই এমন রো', 'rows in the first result but not in the next') }[w]; };
      steps.push({ label: T('আলাদা কুয়েরি', 'Separate queries'), code: '', html: T(`${refs.join(', ')} — প্রতিটি আলাদাভাবে চলে।`, `${refs.join(', ')} — each runs on its own.`), subs: ctx.subs.slice(before) });
      ops.forEach((o, k) => steps.push({ label: o.s.toUpperCase().replace(/\s+/g, ' '), code: '', html: `${refs[k]} ⟷ ${refs[k + 1]}: ${opDesc(o.s)}${T('।', '.')}`, subs: [] }));
      if (tail) steps.push({ label: T('শেষে', 'Finally'), code: tail, html: T('ORDER BY/LIMIT পুরো মিলিত ফলাফলের উপর কাজ করে।', 'ORDER BY/LIMIT apply to the combined result.'), subs: [] });
      ctx.notes.push({ type: 'tip', html: T('UNION/INTERSECT/EXCEPT-এ প্রতিটি অংশে কলামের সংখ্যা সমান হতে হয়, আর কলামের নাম আসে প্রথম অংশ থেকে।', 'With UNION/INTERSECT/EXCEPT every part needs the same number of columns; column names come from the first part.') });
      return { steps, summary: T(`${num(parts.length)}টি কুয়েরির ফলাফল ${ops.map(o => C(o.s.toUpperCase())).join(', ')} দিয়ে মেলানো।`, `The results of ${parts.length} queries combined with ${ops.map(o => C(o.s.toUpperCase())).join(', ')}.`) };
    }
    if (!/^SELECT\b/i.test(m)) return { steps: [{ label: '?', code: sql, html: C(sql), subs: [] }], summary: '' };
    const r = explainSimple(sql, ctx);
    return { steps: r.steps, summary: summarySelect(r.sum) };
  }
  function explainWith(sql, ctx) {
    let i = sql.match(/^WITH\s+(RECURSIVE\s+)?/i)[0].length; const rec = /RECURSIVE/i.test(sql.slice(0, i));
    const steps = []; const ctes = [];
    while (i < sql.length) {
      const head = sql.slice(i).match(/^\s*([\w"`\[\]]+)\s*(\([^)]*\))?\s*AS\s*(NOT\s+)?(MATERIALIZED\s+)?/i);
      if (!head) break;
      const open = i + head[0].length; if (sql[open] !== '(') break;
      const close = matchParen(sql, open); if (close < 0) break;
      ctes.push({ name: head[1].replace(/["`\[\]]/g, ''), cols: head[2] || '', body: sql.slice(open + 1, close).trim() });
      i = close + 1; const cm = sql.slice(i).match(/^\s*,/); if (cm) i += cm[0].length; else break;
    }
    const main = sql.slice(i).trim();
    ctes.forEach((ct, k) => {
      const before = ctx.subs.length;
      const isRec = rec && new RegExp(`\\b${ct.name}\\b`, 'i').test(mask(ct.body, false).replace(/^[\s\S]*?\bFROM\b/i, ''));
      ctx.aliases[ct.name.toLowerCase()] = '(cte)';
      let html;
      if (isRec) {
        const u = findTop(ct.body, /\bUNION(\s+ALL)?\b/);
        const anchor = u.length ? ct.body.slice(0, u[0].i) : ct.body, recur = u.length ? ct.body.slice(u[0].e) : '';
        const ra = addSub(anchor, ctx, 'anchor'), rr = recur ? addSub(recur, ctx, 'recursive') : '';
        html = T(`<b>রিকার্সিভ CTE</b> ${C(ct.name)}${ct.cols ? ' ' + C(ct.cols) : ''}:<ol><li>${ra} (শুরুর অংশ) প্রথম রো(গুলো) দেয়।</li><li>${rr} আগের ধাপে পাওয়া রো থেকে নতুন রো বানায় — এটা বারবার চলে।</li><li>যখন নতুন কোনো রো আসে না (সাধারণত WHERE শর্ত মিথ্যা হলে), থামে। সব ধাপের রো মিলে ${C(ct.name)}।</li></ol>`,
          `<b>Recursive CTE</b> ${C(ct.name)}${ct.cols ? ' ' + C(ct.cols) : ''}:<ol><li>${ra} (anchor) gives the starting row(s).</li><li>${rr} builds new rows from the previous step's rows — repeated again and again.</li><li>It stops when no new rows appear (usually when its WHERE becomes false). All rows together form ${C(ct.name)}.</li></ol>`);
      } else {
        const ref = addSub(ct.body, ctx, 'cte');
        html = T(`${ref}-এর ফলাফলকে ${C(ct.name)}${ct.cols ? ' ' + C(ct.cols) : ''} নাম দেওয়া হলো — এরপরের অংশে এটা টেবিলের মতো ব্যবহার করা যাবে।`, `The result of ${ref} is named ${C(ct.name)}${ct.cols ? ' ' + C(ct.cols) : ''} — later parts can use it like a table.`);
      }
      steps.push({ label: `WITH ${ct.name}`, code: '', html, subs: ctx.subs.slice(before) });
    });
    const r = explainQuery(main, ctx);
    r.steps.forEach(s => { s.label = (EN() ? 'Main: ' : 'মূল: ') + s.label; });
    return { steps: steps.concat(r.steps), summary: T(`প্রথমে ${ctes.map(c => C(c.name)).join(', ')} নামের অস্থায়ী ফলাফল বানানো হয়, তারপর: `, `First the temporary result(s) ${ctes.map(c => C(c.name)).join(', ')} are built, then: `) + r.summary };
  }

  // ───────── DDL ─────────
  const TYPES = [
    [/^(INT|INTEGER|BIGINT|SMALLINT|TINYINT|MEDIUMINT)\b/i, 'পূর্ণসংখ্যা', 'whole number'],
    [/^(NUMBER|NUMERIC|DECIMAL|DEC)\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/i, (m) => T(`দশমিক সংখ্যা — মোট ${num(m[2])} অঙ্ক, দশমিকের পরে ${num(m[3])}`, `decimal — ${m[2]} digits total, ${m[3]} after the point`)],
    [/^(NUMBER|NUMERIC|DECIMAL|DEC)\s*\(\s*(\d+)\s*\)/i, (m) => T(`সংখ্যা — সর্বোচ্চ ${num(m[2])} অঙ্ক`, `number — up to ${m[2]} digits`)],
    [/^(REAL|FLOAT|DOUBLE|NUMERIC|DECIMAL|NUMBER|MONEY)\b/i, 'দশমিক সংখ্যা', 'decimal number'],
    [/^(VARCHAR2?|NVARCHAR|CHARACTER\s+VARYING)\s*\(\s*(\d+)\s*\)/i, (m) => T(`লেখা — সর্বোচ্চ ${num(m[2])} অক্ষর`, `text — up to ${m[2]} characters`)],
    [/^(CHAR|NCHAR|CHARACTER)\s*\(\s*(\d+)\s*\)/i, (m) => T(`ঠিক ${num(m[2])} অক্ষরের লেখা`, `fixed-length text of ${m[2]} characters`)],
    [/^(TEXT|VARCHAR|CLOB|STRING|CHAR)\b/i, 'লেখা', 'text'],
    [/^DATETIME|^TIMESTAMP/i, 'তারিখ ও সময়', 'date and time'], [/^DATE\b/i, 'তারিখ', 'date'], [/^TIME\b/i, 'সময়', 'time'],
    [/^(BOOLEAN|BOOL|BIT)\b/i, 'হ্যাঁ/না (SQLite-এ 1/0)', 'true/false (1/0 in SQLite)'], [/^BLOB|^BINARY|^VARBINARY/i, 'বাইনারি ডেটা (ছবি/ফাইল)', 'binary data (images/files)'],
    [/^JSON\b/i, 'JSON', 'JSON'], [/^SERIAL\b/i, 'নিজে বাড়তে থাকা পূর্ণসংখ্যা (PostgreSQL)', 'auto-increment integer (PostgreSQL)']
  ];
  function typeText(t) { for (const [re, bn, en] of TYPES) { const m = t.match(re); if (m) return typeof bn === 'function' ? bn(m) : T(bn, en); } return t ? C(t) : T('টাইপ দেওয়া নেই (SQLite যেকোনো মান নেয়)', 'no type (SQLite accepts anything)'); }
  function fkText(ref, ctx) {
    const m = ref.match(/REFERENCES\s+([\w"`\[\]]+)\s*(\(([^)]*)\))?(.*)$/is); if (!m) return C(ref);
    const tail = m[4] || '', acts = [];
    const act = (ev, a) => { const w = a.toUpperCase().replace(/\s+/g, ' '); const d = { CASCADE: T('এখানেও মুছে/বদলে যাবে (CASCADE)', 'cascade here too'), 'SET NULL': T('এখানে NULL হবে', 'becomes NULL here'), 'SET DEFAULT': T('ডিফল্ট মান বসবে', 'gets the default'), RESTRICT: T('মুছতে/বদলাতে দেবে না', 'is blocked'), 'NO ACTION': T('বাধা দেবে (ডিফল্ট)', 'is blocked (default)') }[w] || C(a); return ev === 'DELETE' ? T(`মূল রো মুছলে → ${d}`, `when the parent row is deleted → ${d}`) : T(`মূল রো-র key বদলালে → ${d}`, `when the parent key changes → ${d}`); };
    tail.replace(/ON\s+(DELETE|UPDATE)\s+(CASCADE|SET\s+NULL|SET\s+DEFAULT|RESTRICT|NO\s+ACTION)/gi, (_, ev, a) => { acts.push(act(ev.toUpperCase(), a)); return ''; });
    return T(`<b>Foreign key</b> → ${C(m[1] + (m[2] || ''))} — এখানে শুধু সেই মান বসানো যাবে যা ${C(m[1])}-এ আছে`, `<b>Foreign key</b> → ${C(m[1] + (m[2] || ''))} — only values that exist in ${C(m[1])} are allowed`) + (acts.length ? '; ' + acts.join('; ') : '');
  }
  function colConstraints(rest, ctx) {
    const out = []; const m = mask(rest); let x;
    if (/\bPRIMARY\s+KEY\b/i.test(m)) out.push(T('<b>Primary key</b> — প্রতিটি রো-র অনন্য পরিচয়; ফাঁকা বা ডুপ্লিকেট হতে পারবে না', '<b>Primary key</b> — unique identity of each row; no NULLs or duplicates'));
    if (/\bAUTOINCREMENT\b/i.test(m)) out.push(T('AUTOINCREMENT — নতুন রো-তে নিজে থেকে পরের নম্বর, মুছে ফেলা নম্বর আর ফিরে আসে না', 'AUTOINCREMENT — new rows get the next number automatically; deleted numbers are never reused'));
    if (/\bAUTO_INCREMENT\b/i.test(m)) { out.push(T('AUTO_INCREMENT — নিজে থেকে পরের নম্বর', 'AUTO_INCREMENT — next number automatically')); dial(ctx, 'AUTO_INCREMENT MySQL-এর; SQLite-এ INTEGER PRIMARY KEY (চাইলে AUTOINCREMENT)।', 'AUTO_INCREMENT is MySQL; SQLite uses INTEGER PRIMARY KEY (optionally AUTOINCREMENT).'); }
    if (/\bIDENTITY\b/i.test(m)) { out.push(T('IDENTITY — নিজে থেকে পরের নম্বর', 'IDENTITY — next number automatically')); dial(ctx, 'IDENTITY SQL Server/Oracle-এর; SQLite-এ INTEGER PRIMARY KEY।', 'IDENTITY is SQL Server/Oracle; SQLite uses INTEGER PRIMARY KEY.'); }
    if (/\bNOT\s+NULL\b/i.test(m)) out.push(T('<b>NOT NULL</b> — খালি রাখা যাবে না', '<b>NOT NULL</b> — must have a value'));
    if (/\bUNIQUE\b/i.test(m)) out.push(T('<b>UNIQUE</b> — দুই রো-তে একই মান হতে পারবে না', '<b>UNIQUE</b> — no two rows may share a value'));
    if ((x = findTop(rest, /\bDEFAULT\b/)).length) { const v = rest.slice(x[0].e).trim().match(/^(\([^)]*\)|'[^']*'|[^\s,]+)/); out.push(T(`<b>DEFAULT</b> ${C(v ? v[1] : '')} — মান না দিলে এটা বসবে`, `<b>DEFAULT</b> ${C(v ? v[1] : '')} — used when no value is given`)); }
    if ((x = findTop(rest, /\bCHECK\s*\(/)).length) { const o = rest.indexOf('(', x[0].i); const cl = matchParen(rest, o); out.push(T(`<b>CHECK</b> — সবসময় সত্য থাকতে হবে: ${cond(rest.slice(o + 1, cl), ctx)}`, `<b>CHECK</b> — must always hold: ${cond(rest.slice(o + 1, cl), ctx)}`)); }
    if ((x = findTop(rest, /\bREFERENCES\b/)).length) out.push(fkText(rest.slice(x[0].i), ctx));
    if (/\bCOLLATE\s+NOCASE\b/i.test(m)) out.push(T('COLLATE NOCASE — তুলনায় বড়-ছোট হাতের অক্ষর এক ধরা হবে', 'COLLATE NOCASE — comparisons ignore letter case'));
    return out;
  }
  function explainCreateTable(sql, ctx) {
    const h = sql.match(/^CREATE\s+(TEMP(?:ORARY)?\s+)?TABLE\s+(IF\s+NOT\s+EXISTS\s+)?([\w."`\[\]]+)\s*/i);
    const name = h[3].replace(/["`\[\]]/g, ''), rest = sql.slice(h[0].length);
    const steps = [];
    if (/^AS\b/i.test(rest)) { const ref = addSub(rest.replace(/^AS\s*/i, ''), ctx, 'cta'); steps.push({ label: 'CREATE TABLE … AS', code: '', html: T(`${ref}-এর ফলাফল দিয়ে নতুন টেবিল ${C(name)} তৈরি — কলাম আর ডেটা দুটোই কপি হয় (কিন্তু PK/FK নয়)।`, `A new table ${C(name)} is created from the result of ${ref} — columns and data are copied (but not PK/FK constraints).`), subs: ctx.subs.slice() }); return { steps, summary: T(`কুয়েরির ফলাফল থেকে নতুন টেবিল ${C(name)} বানাও।`, `Create a new table ${C(name)} from a query's result.`) }; }
    const close = matchParen(rest, 0); const body = rest.slice(1, close);
    const defs = splitTop(body); const rows = []; const tcons = []; const pk = [], fk = [];
    defs.forEach(d => {
      if (/^(CONSTRAINT\s+\w+\s+)?(PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CHECK)\b/i.test(d)) {
        const dd = d.replace(/^CONSTRAINT\s+\w+\s+/i, ''); let x;
        if ((x = dd.match(/^PRIMARY\s+KEY\s*\(([^)]*)\)/i))) { const cols = splitTop(x[1]); pk.push(...cols); tcons.push(cols.length > 1 ? T(`<b>Composite primary key</b> (${cols.map(C).join(' + ')}) — এই কলামগুলোর <i>জোড়া</i> একসাথে অনন্য হবে; আলাদাভাবে একটার মান ফিরে আসতে পারে`, `<b>Composite primary key</b> (${cols.map(C).join(' + ')}) — the <i>combination</i> must be unique; a single column may repeat`) : T(`<b>Primary key</b>: ${C(cols[0])}`, `<b>Primary key</b>: ${C(cols[0])}`)); }
        else if ((x = dd.match(/^FOREIGN\s+KEY\s*\(([^)]*)\)\s*(REFERENCES.*)$/is))) { fk.push(x[1]); tcons.push(`${C(x[1])}: ${fkText(x[2], ctx)}`); }
        else if ((x = dd.match(/^UNIQUE\s*\(([^)]*)\)/i))) tcons.push(T(`<b>UNIQUE</b> (${C(x[1])}) — এই মান(গুলোর জোড়া) দুই রো-তে একই হতে পারবে না`, `<b>UNIQUE</b> (${C(x[1])}) — this value (combination) cannot repeat`));
        else if (/^CHECK/i.test(dd)) { const o = dd.indexOf('('); tcons.push(T(`<b>CHECK</b> — ${cond(dd.slice(o + 1, matchParen(dd, o)), ctx)}`, `<b>CHECK</b> — ${cond(dd.slice(o + 1, matchParen(dd, o)), ctx)}`)); }
        return;
      }
      const cm = d.match(/^([\w"`\[\]]+)\s*([A-Za-z][\w ]*?(\s*\([^)]*\))?)?(?=\s+(PRIMARY|NOT|NULL|UNIQUE|DEFAULT|CHECK|REFERENCES|CONSTRAINT|COLLATE|AUTO_INCREMENT|AUTOINCREMENT|IDENTITY|GENERATED)\b|\s*$)/i);
      const col = cm ? cm[1].replace(/["`\[\]]/g, '') : d.split(/\s+/)[0], type = cm && cm[2] ? cm[2].trim() : '';
      const rest2 = d.slice(cm ? cm[0].length : col.length);
      const cons = colConstraints(rest2, ctx);
      if (/PRIMARY\s+KEY/i.test(rest2)) pk.push(col); if (/REFERENCES/i.test(rest2)) fk.push(col);
      if (/^INT(EGER)?$/i.test(type) && /PRIMARY\s+KEY/i.test(rest2)) cons.push(T('SQLite-এ INTEGER PRIMARY KEY মানেই rowid — মান না দিলে নিজে থেকে নম্বর বসে', 'In SQLite INTEGER PRIMARY KEY is the rowid — numbered automatically if omitted'));
      rows.push(`<tr><td><code>${esc(col)}</code></td><td>${esc(type || '—')}<div class="xp-dim">${typeText(type)}</div></td><td>${cons.length ? cons.map(c => `<div>${c}</div>`).join('') : '<span class="xp-dim">—</span>'}</td></tr>`);
    });
    steps.push({ label: 'CREATE TABLE', code: '', html: T(`নতুন টেবিল ${C(name)} তৈরি${/IF\s+NOT\s+EXISTS/i.test(h[0]) ? ' (আগে থেকে থাকলে কিছু হবে না, এরর-ও না)' : ''}${h[1] ? ' — অস্থায়ী (সংযোগ বন্ধ হলে মুছে যাবে)' : ''}।`, `Create a new table ${C(name)}${/IF\s+NOT\s+EXISTS/i.test(h[0]) ? ' (if it already exists, nothing happens — no error)' : ''}${h[1] ? ' — temporary (gone when the connection closes)' : ''}.`), subs: [] });
    steps.push({ label: T('কলাম', 'Columns'), code: '', html: `<div class="xp-tbl-wrap"><table class="xp-tbl"><thead><tr><th>${T('কলাম', 'Column')}</th><th>${T('টাইপ', 'Type')}</th><th>${T('নিয়ম (constraint)', 'Rules (constraints)')}</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>`, subs: [] });
    if (tcons.length) steps.push({ label: T('টেবিল-স্তরের নিয়ম', 'Table constraints'), code: '', html: `<ul>${tcons.map(c => `<li>${c}</li>`).join('')}</ul>`, subs: [] });
    if (fk.length) ctx.notes.push({ type: 'tip', html: T('SQLite-এ foreign key নিয়ম কার্যকর করতে প্রতিটি সংযোগে একবার <code>PRAGMA foreign_keys = ON;</code> চালাতে হয়।', 'In SQLite, run <code>PRAGMA foreign_keys = ON;</code> once per connection to enforce foreign keys.') });
    if (!pk.length) ctx.notes.push({ type: 'tip', html: T('এই টেবিলে কোনো primary key নেই — প্রতিটি রো আলাদাভাবে চেনার জন্য সাধারণত একটি PK রাখা উচিত।', 'This table has no primary key — usually every table should have one to identify rows.') });
    return { steps, summary: T(`${C(name)} নামে নতুন টেবিল বানাও — ${num(rows.length)}টি কলাম${pk.length ? `, primary key ${pk.map(C).join(' + ')}` : ''}${fk.length ? `, foreign key ${fk.map(C).join(', ')}` : ''}।`, `Create a table ${C(name)} with ${rows.length} column(s)${pk.length ? `, primary key ${pk.map(C).join(' + ')}` : ''}${fk.length ? `, foreign key ${fk.map(C).join(', ')}` : ''}.`) };
  }

  // ───────── DML ─────────
  function explainInsert(sql, ctx) {
    const h = sql.match(/^(INSERT|REPLACE)\s+(OR\s+(\w+)\s+)?INTO\s+([\w."`\[\]]+)\s*(?:AS\s+\w+\s*)?/i);
    if (!h) return generic(sql);
    const tbl = h[4].replace(/["`\[\]]/g, ''); let rest = sql.slice(h[0].length).trim(); let cols = [];
    if (rest[0] === '(' && !/^\(\s*SELECT\b/i.test(rest)) { const cl = matchParen(rest, 0); cols = splitTop(rest.slice(1, cl)); rest = rest.slice(cl + 1).trim(); }
    const steps = []; let rowsN = null, summary;
    const conf = findTop(rest, /\bON\s+CONFLICT\b|\bON\s+DUPLICATE\s+KEY\s+UPDATE\b/), ret = findTop(rest, /\bRETURNING\b/);
    const endMain = Math.min(...[conf[0], ret[0]].filter(Boolean).map(x => x.i), rest.length);
    const main = rest.slice(0, endMain).trim();
    steps.push({ label: 'INSERT INTO', code: tbl + (cols.length ? ` (${cols.join(', ')})` : ''), html: cols.length ? T(`টেবিল ${C(tbl)}-এ নতুন রো যোগ হবে; মান বসবে এই কলামগুলোতে: ${cols.map(C).join(', ')}। বাকি কলামে DEFAULT মান বা NULL।`, `New rows go into ${C(tbl)}; values fill these columns: ${cols.map(C).join(', ')}. Other columns get their DEFAULT or NULL.`) : T(`টেবিল ${C(tbl)}-এ নতুন রো যোগ হবে। কলামের নাম দেওয়া নেই — তাই টেবিলের <b>সব কলামে, টেবিলের ক্রম অনুযায়ী</b> মান দিতে হবে।`, `New rows go into ${C(tbl)}. No column list — so values must be given for <b>every column, in table order</b>.`), subs: [] });
    if (/^VALUES\b/i.test(main)) {
      const tuples = splitTop(main.replace(/^VALUES\s*/i, '')); rowsN = tuples.length;
      const first = splitTop(unwrap(tuples[0]));
      const map = cols.length && cols.length === first.length ? `<div class="xp-tbl-wrap"><table class="xp-tbl"><thead><tr>${cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${tuples.slice(0, 5).map(tu => `<tr>${splitTop(unwrap(tu)).map(v => `<td><code>${esc(v)}</code></td>`).join('')}</tr>`).join('')}${tuples.length > 5 ? `<tr><td colspan="${cols.length}" class="xp-dim">… +${num(tuples.length - 5)}</td></tr>` : ''}</tbody></table></div>` : '';
      if (cols.length && cols.length !== first.length) ctx.notes.push({ type: 'warn', html: T(`কলাম ${num(cols.length)}টি কিন্তু মান ${num(first.length)}টি — এরর হবে। সংখ্যা মিলতে হবে।`, `${cols.length} columns but ${first.length} values — this errors. They must match.`) });
      steps.push({ label: 'VALUES', code: '', html: T(`${num(rowsN)}টি রো${rowsN > 1 ? ' একসাথে' : ''} যোগ হবে:`, `${rowsN} row(s) will be added${rowsN > 1 ? ' at once' : ''}:`) + map, subs: [] });
      if (/"[^"]*"/.test(mask(main, false).replace(/[^"]/g, '') ? main : '')) { if (/,\s*"|\(\s*"/.test(main)) ctx.notes.push({ type: 'warn', html: T('লেখার মান (string) দিতে একক উদ্ধৃতি <code>\'…\'</code> ব্যবহার করো। ডাবল কোট <code>"…"</code> SQL-এ কলাম/টেবিলের নামের জন্য।', 'Use single quotes <code>\'…\'</code> for text values. Double quotes <code>"…"</code> are for column/table names in SQL.') }); }
    } else if (/^(SELECT|WITH)\b/i.test(main)) {
      const before = ctx.subs.length; const ref = addSub(main, ctx, 'insert');
      steps.push({ label: 'INSERT … SELECT', code: '', html: T(`${ref} যতগুলো রো দেয়, সবগুলো একবারে ${C(tbl)}-এ ঢুকবে।`, `Every row produced by ${ref} is inserted into ${C(tbl)} at once.`), subs: ctx.subs.slice(before) });
    } else if (/^DEFAULT\s+VALUES/i.test(main)) steps.push({ label: 'DEFAULT VALUES', code: '', html: T('একটি রো — সব কলামে ডিফল্ট মান।', 'One row with every column at its default.'), subs: [] });
    const orw = (h[3] || (h[1].toUpperCase() === 'REPLACE' ? 'REPLACE' : '')).toUpperCase();
    if (orw) steps.push({ label: 'OR ' + orw, code: '', html: { REPLACE: T('একই primary key/UNIQUE মানের রো আগে থেকে থাকলে সেটা <b>মুছে</b> নতুনটা বসানো হবে।', 'If a row with the same primary key/UNIQUE value exists, it is <b>deleted</b> and replaced.'), IGNORE: T('নিয়ম ভাঙলে (যেমন ডুপ্লিকেট key) সেই রো চুপচাপ বাদ — কোনো এরর নয়।', 'Rows that break a rule (e.g. duplicate key) are silently skipped — no error.'), ABORT: T('নিয়ম ভাঙলে এই স্টেটমেন্ট বাতিল (ডিফল্ট)।', 'On a violation the statement is cancelled (default).'), FAIL: T('নিয়ম ভাঙলে থামবে, আগের রোগুলো থাকবে।', 'Stops on a violation; earlier rows stay.'), ROLLBACK: T('নিয়ম ভাঙলে পুরো ট্রানজ্যাকশন বাতিল।', 'A violation rolls back the whole transaction.') }[orw] || C(orw), subs: [] });
    if (conf.length) {
      const ctext = rest.slice(conf[0].i, ret.length ? ret[0].i : rest.length).trim();
      if (/DUPLICATE/i.test(conf[0].s)) { dial(ctx, 'ON DUPLICATE KEY UPDATE MySQL-এর; SQLite/PostgreSQL-এ ON CONFLICT(col) DO UPDATE SET …।', 'ON DUPLICATE KEY UPDATE is MySQL; SQLite/PostgreSQL use ON CONFLICT(col) DO UPDATE SET ….'); steps.push({ label: 'UPSERT', code: ctext, html: T('একই key আগে থেকে থাকলে নতুন রো না ঢুকিয়ে পুরোনো রো আপডেট হবে।', 'If the key already exists, the old row is updated instead of inserting.'), subs: [] }); }
      else {
        const k = ctext.match(/ON\s+CONFLICT\s*(\(([^)]*)\))?/i);
        const nothing = /DO\s+NOTHING/i.test(ctext); const setPart = (ctext.match(/DO\s+UPDATE\s+SET\s+([\s\S]*)$/i) || [])[1] || '';
        const sets = setPart ? splitTop(setPart.replace(/\s+WHERE\s+[\s\S]*$/i, '')).map(a => { const p = a.split('='); return T(`${C(p[0])} ← ${C(p.slice(1).join('='))}`, `${C(p[0])} ← ${C(p.slice(1).join('='))}`); }) : [];
        steps.push({ label: 'ON CONFLICT (UPSERT)', code: ctext, html: (nothing ? T(`${k && k[2] ? C(k[2]) + '-এ ' : ''}ডুপ্লিকেট হলে কিছুই করা হবে না (রো বাদ)।`, `On a duplicate${k && k[2] ? ' ' + C(k[2]) : ''}, do nothing (row skipped).`) : T(`${k && k[2] ? C(k[2]) + '-এ ' : ''}ডুপ্লিকেট হলে নতুন রো না ঢুকিয়ে পুরোনো রো আপডেট:`, `On a duplicate${k && k[2] ? ' ' + C(k[2]) : ''}, update the existing row instead:`) + `<ul>${sets.map(s => `<li>${s}</li>`).join('')}</ul>`) + (/excluded\./i.test(ctext) ? T('<div class="xp-dim"><code>excluded.col</code> মানে যে নতুন মানটা ঢোকানোর চেষ্টা হচ্ছিল।</div>', '<div class="xp-dim"><code>excluded.col</code> means the new value that was being inserted.</div>') : ''), subs: [] });
      }
    }
    if (ret.length) steps.push({ label: 'RETURNING', code: rest.slice(ret[0].e).trim(), html: T('যোগ হওয়া রো(গুলো)র এই কলামগুলো সাথে সাথে ফলাফল হিসেবে দেখাবে (যেমন নতুন id)।', 'These columns of the inserted row(s) are returned right away (e.g. the new id).'), subs: [] });
    summary = T(`${C(tbl)} টেবিলে ${rowsN ? num(rowsN) + 'টি ' : ''}নতুন রো যোগ করো${conf.length ? ' — ডুপ্লিকেট হলে আপডেট/বাদ' : ''}।`, `Add ${rowsN ? rowsN + ' ' : ''}new row(s) to ${C(tbl)}${conf.length ? ' — update/skip on duplicates' : ''}.`);
    return { steps, summary };
  }
  function setPhrase(a, ctx) {
    const i = findTop(a, /=/)[0]; if (!i) return C(a);
    const col = a.slice(0, i.i).trim(), v = a.slice(i.e).trim(); const cn = col.replace(/^.*\./, '').replace(/["`\[\]]/g, '');
    let extra = '';
    const pm = v.match(new RegExp(`^${cn}\\s*\\*\\s*(\\d+(?:\\.\\d+)?)$`, 'i')) || v.match(new RegExp(`^(\\d+(?:\\.\\d+)?)\\s*\\*\\s*${cn}$`, 'i'));
    if (pm) { const f = +pm[1]; const pct = Math.round((f - 1) * 1000) / 10; extra = pct > 0 ? T(` — অর্থাৎ ${num(pct)}% বাড়ানো`, ` — i.e. a ${pct}% increase`) : pct < 0 ? T(` — অর্থাৎ ${num(-pct)}% কমানো`, ` — i.e. a ${-pct}% decrease`) : ''; }
    const am = v.match(new RegExp(`^${cn}\\s*([+-])\\s*(\\d+(?:\\.\\d+)?)$`, 'i'));
    if (am) extra = am[1] === '+' ? T(` — আগের মানের সাথে ${num(am[2])} যোগ`, ` — adds ${am[2]} to the old value`) : T(` — আগের মান থেকে ${num(am[2])} বিয়োগ`, ` — subtracts ${am[2]} from the old value`);
    const before = ctx.subs.length; const ve = isSub(v) ? addSub(v, ctx, 'scalar') : (/^CASE\b/i.test(v) ? expr(v, ctx) : C(v));
    return T(`${C(col)}-এর নতুন মান হবে ${ve}${extra}`, `${C(col)} becomes ${ve}${extra}`);
  }
  function explainUpdate(sql, ctx) {
    const h = sql.match(/^UPDATE\s+(OR\s+\w+\s+)?([\w."`\[\]]+)(\s+(AS\s+)?(\w+))?\s+SET\s+/i); if (!h) return generic(sql);
    const tbl = h[2].replace(/["`\[\]]/g, ''); if (h[5] && !/^SET$/i.test(h[5])) ctx.aliases[h[5].toLowerCase()] = tbl; ctx.aliases[tbl.toLowerCase()] = tbl;
    const rest = sql.slice(h[0].length);
    const ends = findTop(rest, /\b(FROM|WHERE|RETURNING|ORDER\s+BY|LIMIT)\b/);
    const setText = rest.slice(0, ends.length ? ends[0].i : rest.length);
    const cl = k => { const x = findTop(rest, k)[0]; if (!x) return ''; const nx = ends.filter(e => e.i > x.i)[0]; return rest.slice(x.e, nx ? nx.i : rest.length).trim(); };
    const where = cl(/\bWHERE\b/), from = cl(/\bFROM\b/), steps = [];
    steps.push({ label: 'UPDATE', code: tbl, html: T(`টেবিল ${C(tbl)}-এর বিদ্যমান রো বদলানো হবে (নতুন রো যোগ হবে না)।`, `Existing rows of ${C(tbl)} will be changed (no new rows).`), subs: [] });
    if (from) { const st = { label: 'FROM', code: from, html: '', subs: [] }; const b = ctx.subs.length; fromClause(from, ctx, st, where); st.html = T('অন্য টেবিলের সাথে মিলিয়ে নতুন মান নেওয়া হবে: ', 'Values come from another table: ') + st.html; st.subs = ctx.subs.slice(b); steps.push(st); }
    if (where) { const b = ctx.subs.length; const w = cond(where, ctx); steps.push({ label: 'WHERE', code: where, html: T(`শুধু এই রোগুলো বদলাবে: ${w}।`, `Only these rows change: ${w}.`), subs: ctx.subs.slice(b) }); }
    else ctx.notes.push({ type: 'danger', html: T(`WHERE নেই — ${C(tbl)}-এর <b>সব রো</b> বদলে যাবে! ইচ্ছা না হলে আগে WHERE দাও। নিরাপদ অভ্যাস: আগে একই WHERE দিয়ে SELECT চালিয়ে দেখো কোন রোগুলো বদলাবে।`, `No WHERE — <b>every row</b> of ${C(tbl)} will change! Add a WHERE unless you mean it. Safe habit: run a SELECT with the same WHERE first.`) });
    const b = ctx.subs.length; const sets = splitTop(setText).map(a => setPhrase(a, ctx));
    steps.push({ label: 'SET', code: setText, html: sets.length === 1 ? sets[0] + T('।', '.') : `<ul>${sets.map(s => `<li>${s}</li>`).join('')}</ul>` + T('<div class="xp-dim">ডান পাশে কলামের নাম থাকলে সেটা <b>পুরোনো</b> মান ধরে হিসাব হয়।</div>', '<div class="xp-dim">Column names on the right-hand side use the <b>old</b> values.</div>'), subs: ctx.subs.slice(b) });
    const r = findTop(rest, /\bRETURNING\b/)[0]; if (r) steps.push({ label: 'RETURNING', code: rest.slice(r.e), html: T('বদলানো রোগুলোর এই কলাম সাথে সাথে দেখাবে।', 'Shows these columns of the changed rows.'), subs: [] });
    return { steps, summary: T(`${C(tbl)} টেবিলে ${where ? 'যেসব রো-তে ' + cond(where, { ...ctx, notes: [], subs: [] }) + ' সেগুলোর' : '<b>সব রো-র</b>'} ${splitTop(setText).map(a => C(a.split('=')[0])).join(', ')} বদলাও।`, `In ${C(tbl)}, change ${splitTop(setText).map(a => C(a.split('=')[0])).join(', ')} for ${where ? 'rows where ' + cond(where, { ...ctx, notes: [], subs: [] }) : '<b>every row</b>'}.`) };
  }
  function explainDelete(sql, ctx) {
    const h = sql.match(/^DELETE\s+FROM\s+([\w."`\[\]]+)(\s+(AS\s+)?(?!(?:WHERE|RETURNING|ORDER|LIMIT)(?:\s|$))(\w+))?/i); if (!h) return generic(sql);
    const tbl = h[1].replace(/["`\[\]]/g, ''); ctx.aliases[tbl.toLowerCase()] = tbl;
    const rest = sql.slice(h[0].length); const wm = findTop(rest, /\bWHERE\b/)[0]; const rm = findTop(rest, /\bRETURNING\b/)[0];
    const where = wm ? rest.slice(wm.e, rm ? rm.i : rest.length).trim() : '';
    const steps = [{ label: 'DELETE FROM', code: tbl, html: T(`টেবিল ${C(tbl)} থেকে রো মুছে ফেলা হবে (টেবিলের গঠন থাকবে)।`, `Rows will be removed from ${C(tbl)} (the table itself stays).`), subs: [] }];
    if (where) { const b = ctx.subs.length; steps.push({ label: 'WHERE', code: where, html: T(`শুধু এই রোগুলো মুছবে: ${cond(where, ctx)}।`, `Only these rows are deleted: ${cond(where, ctx)}.`), subs: ctx.subs.slice(b) }); }
    else ctx.notes.push({ type: 'danger', html: T(`WHERE নেই — ${C(tbl)}-এর <b>সব রো</b> মুছে যাবে! (টেবিল খালি থাকবে)`, `No WHERE — <b>every row</b> of ${C(tbl)} will be deleted! (the table remains, empty)`) });
    if (rm) steps.push({ label: 'RETURNING', code: rest.slice(rm.e), html: T('মুছে ফেলা রোগুলোর এই কলাম দেখাবে।', 'Shows these columns of the deleted rows.'), subs: [] });
    ctx.notes.push({ type: 'tip', html: T('<b>DELETE</b> বনাম <b>TRUNCATE</b> বনাম <b>DROP</b>: DELETE বেছে বেছে রো মোছে (ROLLBACK করা যায়); TRUNCATE সব রো একবারে মোছে (দ্রুত, SQLite-এ নেই); DROP পুরো টেবিলটাই (গঠনসহ) মুছে দেয়।', '<b>DELETE</b> vs <b>TRUNCATE</b> vs <b>DROP</b>: DELETE removes chosen rows (can roll back); TRUNCATE removes all rows at once (fast, not in SQLite); DROP removes the whole table including its structure.') });
    return { steps, summary: where ? T(`${C(tbl)} থেকে যেসব রো-তে ${cond(where, { ...ctx, notes: [], subs: [] })}, সেগুলো মুছে ফেলো।`, `Delete the rows of ${C(tbl)} where ${cond(where, { ...ctx, notes: [], subs: [] })}.`) : T(`${C(tbl)}-এর সব রো মুছে ফেলো।`, `Delete every row of ${C(tbl)}.`) };
  }

  // ───────── অন্যান্য স্টেটমেন্ট ─────────
  const one = (label, html, summary) => ({ steps: [{ label, code: '', html, subs: [] }], summary: summary || '' });
  function generic(sql) { return one('SQL', T(`${C(sql.split(/\s+/).slice(0, 3).join(' '))} — এই ধরনের স্টেটমেন্টের বিস্তারিত নিয়মভিত্তিক ব্যাখ্যা এখনো নেই। AI টিউটরকে জিজ্ঞেস করো।`, `${C(sql.split(/\s+/).slice(0, 3).join(' '))} — no detailed offline explanation for this kind of statement yet. Ask the AI tutor.`)); }
  function explainOther(sql, ctx) {
    const m = mask(sql); let x;
    if ((x = sql.match(/^CREATE\s+(UNIQUE\s+)?INDEX\s+(IF\s+NOT\s+EXISTS\s+)?([\w"`\[\]]+)\s+ON\s+([\w"`\[\]]+)\s*\(([^)]*)\)(\s+WHERE\s+([\s\S]+))?/i))) {
      const cols = splitTop(x[5]);
      if (cols.length > 1) ctx.notes.push({ type: 'tip', html: T(`কম্পোজিট ইনডেক্স বাঁ দিক থেকে কাজ করে: ${C(cols[0])} দিয়ে (বা ${C(cols[0])} + ${C(cols[1])} দিয়ে) খুঁজলে কাজে লাগে, কিন্তু শুধু ${C(cols[1])} দিয়ে খুঁজলে সাধারণত লাগে না।`, `A composite index works left to right: it helps searches on ${C(cols[0])} (or ${C(cols[0])} + ${C(cols[1])}), but usually not on ${C(cols[1])} alone.`) });
      ctx.notes.push({ type: 'tip', html: T('ইনডেক্স পড়া (SELECT) দ্রুত করে, কিন্তু প্রতিটি INSERT/UPDATE/DELETE-এ ইনডেক্সও আপডেট করতে হয় — তাই একটু ধীর করে আর জায়গা নেয়। <code>EXPLAIN QUERY PLAN</code> দিয়ে দেখো ইনডেক্স ব্যবহার হচ্ছে কিনা।', 'An index speeds up reads (SELECT) but every INSERT/UPDATE/DELETE must update it too — slightly slower writes and extra space. Check with <code>EXPLAIN QUERY PLAN</code>.') });
      return one(x[1] ? 'CREATE UNIQUE INDEX' : 'CREATE INDEX', T(`${C(x[4])} টেবিলের ${cols.map(C).join(' + ')} কলামে ${C(x[3])} নামের ইনডেক্স — বইয়ের সূচিপত্রের মতো, এই কলাম দিয়ে খোঁজা (WHERE), JOIN আর ORDER BY দ্রুত হবে।${x[1] ? ' UNIQUE থাকায় এই কলামে ডুপ্লিকেট মান আর ঢোকানো যাবে না।' : ''}${x[7] ? ` শুধু যেসব রো-তে ${cond(x[7], ctx)} সেগুলো ইনডেক্সে থাকবে (partial index)।` : ''}`, `An index ${C(x[3])} on ${C(x[4])}(${cols.map(C).join(' + ')}) — like a book's index, it makes searching (WHERE), JOIN and ORDER BY on these columns faster.${x[1] ? ' Being UNIQUE, duplicate values can no longer be inserted.' : ''}${x[7] ? ` Only rows where ${cond(x[7], ctx)} are indexed (partial index).` : ''}`));
    }
    if ((x = sql.match(/^CREATE\s+(TEMP\w*\s+)?VIEW\s+(IF\s+NOT\s+EXISTS\s+)?([\w"`\[\]]+)\s*(\([^)]*\))?\s*AS\s+/i))) {
      const ref = addSub(sql.slice(x[0].length), ctx, 'view');
      return { steps: [{ label: 'CREATE VIEW', code: '', html: T(`${ref}-কে ${C(x[3])} নামে সেভ করা হলো। ভিউ নিজে ডেটা রাখে না — যতবার ${C('SELECT … FROM ' + x[3])} চালাবে, ততবার কুয়েরিটা নতুন করে চলবে। জটিল কুয়েরি সহজ করতে আর নির্দিষ্ট কলাম লুকাতে কাজে লাগে।`, `${ref} is saved under the name ${C(x[3])}. A view stores no data — every ${C('SELECT … FROM ' + x[3])} re-runs the query. Useful to simplify complex queries and hide columns.`), subs: ctx.subs.slice() }], summary: T(`${C(x[3])} নামে একটি ভিউ (সংরক্ষিত কুয়েরি) বানাও।`, `Create a view (saved query) called ${C(x[3])}.`) };
    }
    if ((x = sql.match(/^CREATE\s+(TEMP\w*\s+)?TRIGGER\s+(IF\s+NOT\s+EXISTS\s+)?([\w"`\[\]]+)\s+(BEFORE|AFTER|INSTEAD\s+OF)?\s*(INSERT|DELETE|UPDATE(\s+OF\s+[\w\s,]+?)?)\s+ON\s+([\w"`\[\]]+)([\s\S]*?)\bBEGIN\b([\s\S]*)\bEND\s*$/i))) {
      const when = (x[8].match(/\bWHEN\s+([\s\S]+)$/i) || [])[1];
      const ev = x[5].toUpperCase().split(/\s+/)[0];
      const body = splitStatements(x[9]);
      const before = ctx.subs.length;
      const refs = body.map(b => addSub('(' + b + ')', ctx, 'trigger'));
      const timing = (x[4] || 'BEFORE').toUpperCase().replace(/\s+/g, ' ');
      const nw = ev === 'DELETE' ? T('<code>OLD.col</code> = মুছে ফেলা রো-র মান।', '<code>OLD.col</code> = the deleted row\'s value.') : ev === 'INSERT' ? T('<code>NEW.col</code> = নতুন রো-র মান।', '<code>NEW.col</code> = the new row\'s value.') : T('<code>OLD.col</code> = বদলের আগের মান, <code>NEW.col</code> = পরের মান।', '<code>OLD.col</code> = value before, <code>NEW.col</code> = value after.');
      return { steps: [
        { label: 'TRIGGER', code: '', html: T(`${C(x[7])} টেবিলে প্রতিবার ${C(x[5])} হওয়ার ${timing === 'AFTER' ? '<b>পরে</b>' : timing === 'BEFORE' ? '<b>আগে</b>' : '<b>বদলে</b>'} ${C(x[3])} নিজে থেকে চলবে — প্রতিটি প্রভাবিত রো-র জন্য একবার।${when ? ` শর্ত: ${cond(when, ctx)}।` : ''}`, `Every time a ${C(x[5])} happens on ${C(x[7])}, ${C(x[3])} runs automatically <b>${timing.toLowerCase()}</b> it — once per affected row.${when ? ` Only when: ${cond(when, ctx)}.` : ''}`), subs: [] },
        { label: 'NEW / OLD', code: '', html: nw, subs: [] },
        { label: 'BEGIN … END', code: '', html: T(`ট্রিগারের ভেতরে যা চলবে: ${refs.join(', ')}`, `What runs inside: ${refs.join(', ')}`), subs: ctx.subs.slice(before) }
      ], summary: T(`${C(x[7])}-এ ${C(ev)} হলে নিজে থেকে কিছু কাজ চালানোর জন্য ট্রিগার ${C(x[3])} বানাও।`, `Create trigger ${C(x[3])} that runs automatically on ${C(ev)} in ${C(x[7])}.`) };
    }
    if (/^CREATE\s+(TEMP\w*\s+)?TABLE\b/i.test(m)) return explainCreateTable(sql, ctx);
    if ((x = sql.match(/^ALTER\s+TABLE\s+([\w"`\[\]]+)\s+([\s\S]+)$/i))) {
      const t = x[1], a = x[2].trim(); let y, html;
      if ((y = a.match(/^RENAME\s+TO\s+(\S+)/i))) html = T(`টেবিল ${C(t)}-এর নাম বদলে ${C(y[1])}।`, `Rename table ${C(t)} to ${C(y[1])}.`);
      else if ((y = a.match(/^RENAME\s+(COLUMN\s+)?(\S+)\s+TO\s+(\S+)/i))) html = T(`${C(t)}-এর কলাম ${C(y[2])}-এর নাম বদলে ${C(y[3])} — ডেটা একই থাকে।`, `Rename column ${C(y[2])} of ${C(t)} to ${C(y[3])} — data unchanged.`);
      else if ((y = a.match(/^ADD\s+(COLUMN\s+)?([\s\S]+)$/i))) { const p = y[2].trim().split(/\s+/); const cons = colConstraints(y[2].slice(p[0].length + (p[1] || '').length + 1), ctx); html = T(`${C(t)}-এ নতুন কলাম ${C(p[0])} (${typeText(p[1] || '')}) যোগ — পুরোনো রোগুলোতে এর মান হবে NULL (বা DEFAULT)।`, `Add column ${C(p[0])} (${typeText(p[1] || '')}) to ${C(t)} — existing rows get NULL (or the DEFAULT).`) + (cons.length ? `<ul>${cons.map(c => `<li>${c}</li>`).join('')}</ul>` : ''); }
      else if ((y = a.match(/^DROP\s+(COLUMN\s+)?(\S+)/i))) html = T(`${C(t)} থেকে কলাম ${C(y[2])} মুছে ফেলা — ওই কলামের সব ডেটাও চলে যাবে।`, `Drop column ${C(y[2])} from ${C(t)} — its data is lost.`);
      else if (/^(MODIFY|ALTER\s+COLUMN|CHANGE)\b/i.test(a)) { html = T(`${C(t)}-এর একটি কলামের টাইপ/নিয়ম বদলানো: ${C(a)}।`, `Change a column's type/rules in ${C(t)}: ${C(a)}.`); dial(ctx, 'MODIFY/ALTER COLUMN MySQL/SQL Server/Oracle-এর; SQLite-এ কলামের টাইপ বদলানো যায় না — নতুন টেবিল বানিয়ে ডেটা কপি করতে হয়।', 'MODIFY/ALTER COLUMN is MySQL/SQL Server/Oracle; SQLite cannot change a column type — rebuild the table and copy the data.'); }
      else html = C(a);
      return one('ALTER TABLE', html);
    }
    if ((x = sql.match(/^DROP\s+(TABLE|VIEW|INDEX|TRIGGER)\s+(IF\s+EXISTS\s+)?([\w."`\[\]]+)/i))) {
      const k = x[1].toUpperCase();
      if (k === 'TABLE') ctx.notes.push({ type: 'danger', html: T('DROP TABLE ফেরত আনা যায় না (ট্রানজ্যাকশনের বাইরে) — গঠন, ডেটা, ইনডেক্স, ট্রিগার সব যাবে।', 'DROP TABLE cannot be undone (outside a transaction) — structure, data, indexes and triggers are gone.') });
      return one('DROP ' + k, T(`${{ TABLE: 'টেবিল', VIEW: 'ভিউ', INDEX: 'ইনডেক্স', TRIGGER: 'ট্রিগার' }[k]} ${C(x[3])} পুরোপুরি মুছে ফেলা${k === 'TABLE' ? ' — গঠন ও সব ডেটাসহ' : k === 'VIEW' ? ' (মূল টেবিলের ডেটা থাকে)' : ''}।${x[2] ? ' IF EXISTS: না থাকলে এরর দেবে না।' : ''}`, `Completely remove the ${k.toLowerCase()} ${C(x[3])}${k === 'TABLE' ? ' — structure and all data' : k === 'VIEW' ? ' (underlying data stays)' : ''}.${x[2] ? ' IF EXISTS: no error if it is missing.' : ''}`));
    }
    if ((x = sql.match(/^TRUNCATE\s+(TABLE\s+)?(\S+)/i))) { dial(ctx, `TRUNCATE SQLite-এ নেই; এখানে লেখো DELETE FROM ${x[2]};`, `SQLite has no TRUNCATE; write DELETE FROM ${x[2]};`); return one('TRUNCATE', T(`${C(x[2])}-এর সব রো একবারে মুছে ফেলা (গঠন থাকে)। DELETE-এর চেয়ে দ্রুত, WHERE দেওয়া যায় না, আর অনেক ডেটাবেসে AUTO_INCREMENT আবার ১ থেকে শুরু হয়।`, `Remove all rows of ${C(x[2])} at once (structure stays). Faster than DELETE, no WHERE allowed, and in many databases the auto-increment restarts.`)); }
    if (/^(BEGIN|START\s+TRANSACTION)\b/i.test(m)) return one('BEGIN', T('ট্রানজ্যাকশন শুরু — এরপরের পরিবর্তনগুলো অস্থায়ী থাকবে। COMMIT দিলে একসাথে স্থায়ী, ROLLBACK দিলে সব বাতিল (সব-অথবা-কিছুই-না: ACID-এর Atomicity)।', 'Start a transaction — the following changes stay tentative. COMMIT makes them permanent together; ROLLBACK cancels them all (all-or-nothing: the A in ACID).'));
    if (/^(COMMIT|END)\b/i.test(m)) return one('COMMIT', T('ট্রানজ্যাকশনের সব পরিবর্তন স্থায়ীভাবে সেভ।', 'Save all of the transaction\'s changes permanently.'));
    if ((x = sql.match(/^ROLLBACK(\s+TRANSACTION)?(\s+TO\s+(SAVEPOINT\s+)?(\S+))?/i))) return one('ROLLBACK', x[4] ? T(`সেভপয়েন্ট ${C(x[4])}-এর পরের পরিবর্তনগুলো বাতিল; তার আগেরগুলো থাকে, ট্রানজ্যাকশন চলতে থাকে।`, `Undo changes made after savepoint ${C(x[4])}; earlier ones stay and the transaction continues.`) : T('ট্রানজ্যাকশনের সব পরিবর্তন বাতিল — BEGIN-এর আগের অবস্থায় ফিরে যাওয়া।', 'Cancel all of the transaction\'s changes — back to the state before BEGIN.'));
    if ((x = sql.match(/^SAVEPOINT\s+(\S+)/i))) return one('SAVEPOINT', T(`${C(x[1])} নামে একটি চিহ্ন — পরে ${C('ROLLBACK TO ' + x[1])} দিলে শুধু এর পরের কাজগুলো বাতিল হবে।`, `A marker named ${C(x[1])} — later ${C('ROLLBACK TO ' + x[1])} undoes only what came after it.`));
    if ((x = sql.match(/^RELEASE\s+(SAVEPOINT\s+)?(\S+)/i))) return one('RELEASE', T(`সেভপয়েন্ট ${C(x[2])} সরিয়ে ফেলা (পরিবর্তনগুলো থাকে)।`, `Remove savepoint ${C(x[2])} (changes are kept).`));
    if ((x = sql.match(/^(GRANT|REVOKE)\s+([\s\S]+?)\s+ON\s+(\S+)\s+(TO|FROM)\s+(\S+)/i))) { dial(ctx, 'GRANT/REVOKE (DCL) SQLite-এ নেই — MySQL, PostgreSQL, Oracle, SQL Server-এ আছে।', 'GRANT/REVOKE (DCL) is not in SQLite — it exists in MySQL, PostgreSQL, Oracle and SQL Server.'); return one(x[1].toUpperCase(), x[1].toUpperCase() === 'GRANT' ? T(`ইউজার ${C(x[5])}-কে ${C(x[3])}-এর উপর ${C(x[2])} করার অনুমতি দেওয়া।`, `Give user ${C(x[5])} permission to ${C(x[2])} on ${C(x[3])}.`) : T(`ইউজার ${C(x[5])}-এর কাছ থেকে ${C(x[3])}-এর উপর ${C(x[2])} অনুমতি ফিরিয়ে নেওয়া।`, `Take away ${C(x[2])} permission on ${C(x[3])} from user ${C(x[5])}.`)); }
    if ((x = sql.match(/^EXPLAIN\s+(QUERY\s+PLAN\s+)?([\s\S]+)$/i))) { const ref = addSub('(' + x[2] + ')', ctx, 'explain'); return { steps: [{ label: 'EXPLAIN QUERY PLAN', code: '', html: T(`${ref} আসলে চালানো হয় না — ডেটাবেস দেখায় সে কীভাবে চালাবে। <code>SCAN</code> = পুরো টেবিল পড়া (ধীর), <code>SEARCH … USING INDEX</code> = ইনডেক্স দিয়ে সরাসরি খোঁজা (দ্রুত)।`, `${ref} is not actually run — the database shows how it would run it. <code>SCAN</code> = read the whole table (slow); <code>SEARCH … USING INDEX</code> = jump via an index (fast).`), subs: ctx.subs.slice() }], summary: T('কুয়েরি প্ল্যান দেখাও।', 'Show the query plan.') }; }
    if ((x = sql.match(/^PRAGMA\s+(\w+)\s*(\(([^)]*)\)|=\s*(\S+))?/i))) { const p = x[1].toLowerCase(); const d = { table_info: T(`${C(x[3] || '')} টেবিলের কলামগুলোর তালিকা (নাম, টাইপ, PK…)।`, `List the columns of ${C(x[3] || '')} (name, type, PK…).`), foreign_key_list: T(`${C(x[3] || '')} টেবিলের foreign key-গুলো।`, `Foreign keys of ${C(x[3] || '')}.`), foreign_keys: T('foreign key নিয়ম চালু/বন্ধ (ON = চালু)।', 'Turn foreign-key enforcement on/off.'), index_list: T(`${C(x[3] || '')}-এর ইনডেক্সগুলো।`, `Indexes of ${C(x[3] || '')}.`) }[p]; return one('PRAGMA', d || T(`SQLite-এর ${C(p)} সেটিং দেখা বা বদলানো।`, `Read or change SQLite's ${C(p)} setting.`)); }
    if (/^(SHOW\s+TABLES|SHOW\s+DATABASES)\b/i.test(m)) { dial(ctx, "SHOW TABLES MySQL-এর; SQLite-এ: SELECT name FROM sqlite_master WHERE type = 'table';", "SHOW TABLES is MySQL; in SQLite: SELECT name FROM sqlite_master WHERE type = 'table';"); return one('SHOW', T('ডেটাবেসের টেবিল/ডেটাবেসের তালিকা।', 'List the tables/databases.')); }
    if ((x = sql.match(/^(DESC|DESCRIBE)\s+(\S+)/i))) { dial(ctx, `DESC MySQL/Oracle-এর; SQLite-এ: PRAGMA table_info(${x[2]});`, `DESC is MySQL/Oracle; in SQLite: PRAGMA table_info(${x[2]});`); return one('DESCRIBE', T(`${C(x[2])} টেবিলের গঠন (কলাম, টাইপ) দেখাও।`, `Show the structure (columns, types) of ${C(x[2])}.`)); }
    if ((x = sql.match(/^CREATE\s+(DATABASE|SCHEMA)\s+(\S+)/i))) { dial(ctx, 'SQLite-এ প্রতিটি ফাইলই একটি ডেটাবেস, CREATE DATABASE নেই।', 'In SQLite every file is a database; there is no CREATE DATABASE.'); return one('CREATE DATABASE', T(`${C(x[2])} নামে নতুন ডেটাবেস তৈরি।`, `Create a new database ${C(x[2])}.`)); }
    if ((x = sql.match(/^USE\s+(\S+)/i))) return one('USE', T(`এরপরের কুয়েরিগুলো ${C(x[1])} ডেটাবেসে চলবে (MySQL/SQL Server)।`, `Following queries run in database ${C(x[1])} (MySQL/SQL Server).`));
    if (/^VACUUM\b/i.test(m)) return one('VACUUM', T('ডেটাবেস ফাইল গুছিয়ে খালি জায়গা ফেরত দেওয়া।', 'Rebuild the database file to reclaim free space.'));
    if (/^ANALYZE\b/i.test(m)) return one('ANALYZE', T('টেবিল/ইনডেক্সের পরিসংখ্যান সংগ্রহ — query planner ভালো প্ল্যান বাছতে পারে।', 'Gather statistics so the query planner can choose better plans.'));
    if (/^CREATE\s+(OR\s+REPLACE\s+)?(PROCEDURE|FUNCTION)\b/i.test(m)) { dial(ctx, 'Stored procedure/function SQLite-এ নেই — MySQL, PostgreSQL, Oracle (PL/SQL), SQL Server (T-SQL)-এ আছে।', 'Stored procedures/functions are not in SQLite — they exist in MySQL, PostgreSQL, Oracle (PL/SQL) and SQL Server (T-SQL).'); return one('PROCEDURE / FUNCTION', T('সার্ভারে সংরক্ষিত একগুচ্ছ SQL — নাম ধরে (CALL/EXEC) বারবার চালানো যায়; প্যারামিটার নিতে পারে।', 'A named block of SQL stored on the server — run it repeatedly by name (CALL/EXEC); can take parameters.')); }
    return generic(sql);
  }

  function explainAny(sql, ctx) {
    const F = ((sql.trim().match(/^\s*(\w+)/) || [])[1] || '').toUpperCase();
    if (F === 'INSERT' || F === 'REPLACE') return explainInsert(sql, ctx);
    if (F === 'UPDATE') return explainUpdate(sql, ctx);
    if (F === 'DELETE') return explainDelete(sql, ctx);
    if (/^(SELECT|WITH|VALUES)$/.test(F) || /^\(/.test(sql.trim())) return explainQuery(sql, ctx);
    return explainOther(sql, ctx);
  }
  // ───────── একটি স্টেটমেন্ট ─────────
  const KIND = {
    DQL: ['ডেটা পড়া — DQL', 'Read data — DQL'], DML: ['ডেটা বদলানো — DML', 'Change data — DML'], DDL: ['গঠন তৈরি/বদল — DDL', 'Define structure — DDL'],
    TCL: ['ট্রানজ্যাকশন — TCL', 'Transaction — TCL'], DCL: ['অনুমতি — DCL', 'Permissions — DCL'], OTHER: ['অন্যান্য', 'Other']
  };
  function kindOf(first) {
    if (/^(SELECT|WITH|VALUES)$/.test(first)) return 'DQL';
    if (/^(INSERT|UPDATE|DELETE|REPLACE|MERGE)$/.test(first)) return 'DML';
    if (/^(CREATE|ALTER|DROP|TRUNCATE|RENAME)$/.test(first)) return 'DDL';
    if (/^(BEGIN|COMMIT|ROLLBACK|SAVEPOINT|RELEASE|START|END)$/.test(first)) return 'TCL';
    if (/^(GRANT|REVOKE)$/.test(first)) return 'DCL';
    return 'OTHER';
  }
  function explainStatement(sql) {
    sql = sql.trim().replace(/;\s*$/, '');
    const ctx = { notes: [], subs: [], aliases: {}, outer: {}, depth: 0, tables: [] }; ctx.root = ctx;
    const first = (sql.match(/^\s*(\w+)/) || [])[1] || ''; const F = first.toUpperCase();
    let res;
    try {
      res = explainAny(sql, ctx);
    } catch (e) { if (SB.xpDebug) throw e; res = generic(sql); }
    // ডায়ালেক্ট-নির্দিষ্ট ফাংশন যেখানেই থাকুক (নেস্টেড হলেও) নোট
    const DIA = ['STRING_AGG', 'LISTAGG', 'LEN', 'CHAR_LENGTH', 'LEFT', 'RIGHT', 'RAND', 'NVL', 'IF', 'NOW', 'CURDATE', 'GETDATE', 'DATEDIFF', 'DATE_FORMAT', 'YEAR', 'MONTH', 'DAY', 'EXTRACT', 'TO_CHAR', 'TO_DATE', 'DATE_SUB', 'DATE_ADD'];
    const msk = mask(sql, false);
    DIA.forEach(k => { if (new RegExp(`(^|[^\\w.])${k}\\s*\\(`, 'i').test(msk)) { try { FN[k](['x', 'x', 'x'], ctx); } catch (e) { } } });
    if (/\bINTERVAL\s+['\d]/i.test(msk)) dial(ctx, "INTERVAL MySQL/PostgreSQL/Oracle-এর; SQLite-এ date(d, '-5 years') ধরনের modifier।", "INTERVAL is MySQL/PostgreSQL/Oracle; SQLite uses modifiers like date(d, '-5 years').");
    // সাধারণ সতর্কতা
    if (/(=|<>|!=|\bLIKE|\bIN\s*\()\s*"/i.test(mask(sql, false).replace(/'[^']*'/g, "''")) && /(=|<>|LIKE)\s*"[^"]*"/i.test(sql)) ctx.notes.push({ type: 'warn', html: T('লেখার মান ডাবল কোটে <code>"…"</code> দেওয়া — SQL স্ট্যান্ডার্ডে ডাবল কোট মানে কলাম/টেবিলের নাম; লেখার জন্য একক উদ্ধৃতি <code>\'…\'</code> ব্যবহার করো।', 'A text value is in double quotes <code>"…"</code> — in standard SQL double quotes mean a column/table name; use single quotes <code>\'…\'</code> for text.') });
    if (/'\s*\+\s*\w|\w\s*\+\s*'/.test(sql) && F === 'SELECT') ctx.notes.push({ type: 'dialect', html: T("লেখা জোড়া দিতে + ব্যবহার SQL Server-এর নিয়ম; SQLite/PostgreSQL/Oracle-এ || (যেমন first || ' ' || last), MySQL-এ CONCAT()।", "Using + to join text is SQL Server; SQLite/PostgreSQL/Oracle use || (e.g. first || ' ' || last), MySQL uses CONCAT().") });
    const seen = new Set(); const notes = ctx.notes.filter(x => !seen.has(x.html) && seen.add(x.html));
    return { sql, first: F || '?', kind: kindOf(F), steps: res.steps, summary: res.summary, notes, subsAll: ctx.subs };
  }

  // ───────── রেন্ডার ─────────
  function renderSubs(subs, depth) {
    if (!subs || !subs.length) return '';
    return subs.map(s => `<details class="xp-sub" ${depth < 1 ? 'open' : ''}><summary><span class="xp-subtag">${s.tag}</span> ${T('সাবকুয়েরি', 'Subquery')} ${s.corr ? `<span class="xp-pill warn">${T('correlated — বাইরের প্রতিটি রো-র জন্য আবার চলে', 'correlated — re-runs for every outer row')} (${esc(s.corr)}.…)</span>` : `<span class="xp-pill">${T('একবারই চলে', 'runs once')}</span>`}</summary>
      <pre class="syntax xp-code">${esc(SB.formatSql ? SB.formatSql(s.sql) : s.sql)}</pre>
      ${s.res.summary ? `<p class="xp-sum2">${s.res.summary}</p>` : ''}
      ${renderSteps(s.res.steps, depth + 1)}</details>`).join('');
  }
  function renderSteps(steps, depth = 0) {
    return `<ol class="xp-steps">${steps.map((s, i) => `<li class="xp-step"><div class="xp-step-h"><span class="xp-n">${num(i + 1)}</span><b class="xp-label">${esc(s.label)}</b>${s.code ? `<code class="xp-snip">${esc(s.code.replace(/\s+/g, ' ').slice(0, 120))}${s.code.length > 120 ? '…' : ''}</code>` : ''}</div><div class="xp-step-b">${s.html}</div>${renderSubs(s.subs, depth)}</li>`).join('')}</ol>`;
  }
  const NOTE_ICON = { warn: '⚠️', danger: '⛔', tip: '💡', dialect: '🔁' };
  function renderStatement(r, idx, total) {
    const order = r.kind === 'DQL' && r.first === 'SELECT' && r.steps.length > 2 ? `<div class="xp-order">${T('লেখার ক্রম আর চলার ক্রম আলাদা — ডেটাবেস নিচের ক্রমে কাজ করে:', 'Written order ≠ run order — the database works in the order below:')} ${r.steps.map(s => `<span>${esc(s.label)}</span>`).join('<i>→</i>')}</div>` : '';
    return `<section class="xp-stmt">
      <div class="xp-head">${total > 1 ? `<span class="xp-idx">${num(idx + 1)}/${num(total)}</span>` : ''}<span class="xp-badge k-${r.kind}">${esc(r.first)}</span><span class="xp-kind">${T(...KIND[r.kind])}</span></div>
      ${total > 1 ? `<pre class="syntax xp-code">${esc(SB.formatSql ? SB.formatSql(r.sql) : r.sql)}</pre>` : ''}
      ${r.summary ? `<div class="xp-summary"><span class="xp-sum-l">${T('সহজ কথায়', 'In plain words')}</span>${r.summary}</div>` : ''}
      ${order}
      ${renderSteps(r.steps)}
      ${r.notes.length ? `<div class="xp-notes">${r.notes.map(x => `<div class="xp-note ${x.type}"><span>${NOTE_ICON[x.type] || '•'}</span><div>${x.html}</div></div>`).join('')}</div>` : ''}
    </section>`;
  }
  function explainSQL(sql) { return splitStatements(sql || '').map(explainStatement); }
  function renderExplain(host, sql) {
    const list = explainSQL(sql);
    host.innerHTML = list.length ? `<div class="xp">${list.map((r, i) => renderStatement(r, i, list.length)).join('')}</div>` : `<p class="muted">${T('ব্যাখ্যার জন্য একটি কুয়েরি লেখো।', 'Write a query to explain.')}</p>`;
    SB.$$('pre.syntax', host).forEach(SB.highlight);
    return list;
  }
  // টিউটরের জন্য সাদা লেখা (markdown)
  function explainText(sql) {
    const strip = h => String(h).replace(/<code[^>]*>([\s\S]*?)<\/code>/g, '`$1`').replace(/<b>([\s\S]*?)<\/b>/g, '**$1**').replace(/<li>/g, '\n   - ').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    return explainSQL(sql).map(r => {
      const subs = []; const walk = steps => steps.forEach(s => (s.subs || []).forEach(x => { subs.push(x); walk(x.res.steps); }));
      walk(r.steps);
      return `**${r.first}** — ${T(...KIND[r.kind])}\n\n${r.summary ? strip(r.summary) + '\n\n' : ''}` + r.steps.map((s, i) => `${i + 1}. **${s.label}** — ${strip(s.html)}`).join('\n') +
        (subs.length ? '\n\n' + subs.map(s => `${s.tag} ${s.corr ? '(correlated) ' : ''}\`${s.sql.replace(/\s+/g, ' ').slice(0, 90)}\` — ${strip(s.res.summary)}`).join('\n') : '') +
        (r.notes.length ? '\n\n' + r.notes.map(x => `${NOTE_ICON[x.type]} ${strip(x.html)}`).join('\n') : '');
    }).join('\n\n---\n\n');
  }
  // কোন ডেমো ডেটাবেসে চালাবে — টেবিলের নাম দেখে
  let tableSets = null;
  function guessSeed(sql) {
    if (!tableSets) { tableSets = {}; [['main', window.SEED_SQL], ['job', window.JOB_SEED_SQL]].forEach(([k, s]) => { const set = new Set(); (s || '').replace(/CREATE\s+TABLE\s+(IF\s+NOT\s+EXISTS\s+)?["`]?(\w+)/gi, (_, __, t) => set.add(t.toLowerCase())); tableSets[k] = set; }); }
    const words = (mask(sql, false).match(/\b(?:FROM|JOIN|INTO|UPDATE|TABLE)\s+["`]?(\w+)/gi) || []).map(w => w.split(/\s+/).pop().replace(/["`]/g, '').toLowerCase());
    const score = k => words.filter(w => tableSets[k].has(w)).length;
    return score('job') > score('main') ? 'job' : 'main';
  }
  // মোডাল — যেকোনো এডিটর থেকে
  function explainModal(sql, seedKey) {
    if (!sql || !sql.trim()) { SB.toast(T('আগে একটি কুয়েরি লেখো।', 'Write a query first.')); return; }
    const m = SB.modal('🧠 ' + T('কুয়েরি ব্যাখ্যা', 'Query explained'), `<pre class="syntax xp-code">${esc(SB.formatSql ? SB.formatSql(sql) : sql)}</pre><div class="xp-host"></div>
      <div class="toolbar"><a class="btn sm" href="#/explain" data-xp-open>${T('ব্যাখ্যা পেজে খোলো', 'Open in the explainer')}</a><button class="btn sm" data-xp-ai>🤖 ${T('AI দিয়ে আরও বিস্তারিত', 'More detail from AI')}</button></div>`, { wide: true });
    SB.$$('pre.syntax', m.el).forEach(SB.highlight);
    renderExplain(SB.$('.xp-host', m.el), sql);
    m.el.addEventListener('click', e => {
      if (e.target.closest('[data-xp-open]')) { SB.store.set('sqlbn-xp-draft', sql); m.close(); }
      if (e.target.closest('[data-xp-ai]')) { m.close(); SB.tutor.toggle(true); SB.tutor.ask('explain'); }
    });
  }

  Object.assign(SB, { explainSQL, renderExplain, explainText, explainModal, explainGuessSeed: guessSeed, splitStatements });
})();
