/* মক টেস্ট ও ভুল প্রশ্ন রিভিউ (spaced repetition) */
(function () {
  'use strict';
  const { $, $$, esc, store, toast, n, pick, L } = SB;
  const T = (bn, en) => (I18N.lang === 'en' ? en : bn);
  const plain = h => String(h || '').replace(/<[^>]+>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
  const shuffle = a => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
  const seedOf = k => SB.seedOf(k);
  const dayStr = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const addDays = k => { const d = new Date(); d.setDate(d.getDate() + k); return dayStr(d); };
  const fmtTime = s => { s = Math.max(0, Math.round(s)); const m = Math.floor(s / 60), x = s % 60; return n(`${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}`); };

  // ═══════════════ প্রশ্ন একত্রীকরণ: key → একই ধরনের item ═══════════════
  // key: job:<id> | quiz:<lessonId>:<i> | ex:<lessonId>:<i> | ch:<id>
  const MARKS = { mcq: 1, viva: 2, sql: { easy: 2, medium: 3, hard: 4 } };
  function resolve(key) {
    const [type, a, b] = key.split(':');
    if (type === 'job') {
      const q = (window.JOB_QUESTIONS || []).find(x => x.id === a); if (!q) return null;
      const cat = JOB_CATS.find(c => c.id === q.cat);
      return { key, kind: q.type, html: true, seedKey: 'job', q: window.jobQuestionHTML ? jobQuestionHTML(q) : pick(q.q), options: q.options, answer: q.answer, explain: q.explain, ex: q.type === 'sql' ? q : null,
        hints: (q.hints || []).map(h => pick(h)), level: q.level, topic: cat ? `${cat.icon} ${pick(cat)}` : q.cat, src: q.src, link: `#/jobprep/${q.id}`, tryIt: q.tryIt,
        tables: Object.keys(window.JOB_TABLE_INFO).filter(x => x !== 't'), tableInfo: window.JOB_TABLE_INFO };
    }
    if (type === 'quiz' || type === 'ex') {
      const l = LESSONS.find(x => x.id === a); const i = +b; if (!l) return null;
      const loc = L(l);
      if (type === 'quiz') { const qq = loc.quiz(i); if (!qq) return null; return { key, kind: 'mcq', html: false, q: qq.q, options: qq.options, answer: qq.answer, explain: qq.explain, level: 'easy', topic: '📘 ' + loc.title, src: T('লেসন কুইজ', 'Lesson quiz'), link: `#/learn/${l.id}` }; }
      const ex = l.exercises[i]; if (!ex) return null;
      return { key, kind: 'sql', html: true, seedKey: 'main', q: loc.task(i), ex, hints: [loc.hint(i)].filter(Boolean), level: 'easy', topic: '📘 ' + loc.title, src: T('লেসন অনুশীলন', 'Lesson exercise'), link: `#/learn/${l.id}`, tables: l.tables, tableInfo: window.TABLE_INFO };
    }
    if (type === 'px') {
      const l = LESSONS.find(x => x.id === a); const x = ((window.PRACTICE || {})[a] || { extra: [] }).extra[+b]; if (!l || !x) return null;
      return { key, kind: 'sql', html: true, seedKey: 'main', q: pick(x.q), ex: x, hints: [pick(x.hint)].filter(Boolean), level: x.level || 'easy', topic: '🎯 ' + L(l).title,
        src: T('অনুশীলন সেট', 'Practice set'), link: `#/learn/${l.id}/practice`, tables: l.tables, tableInfo: window.TABLE_INFO };
    }
    if (type === 'ch') {
      const c = (window.CHALLENGES || []).find(x => x.id === a); if (!c) return null;
      return { key, kind: 'sql', html: true, seedKey: 'main', q: pick(c.task), ex: c, hints: c.hints.map(h => pick(h)), explain: c.explain, level: c.level,
        topic: '🏆 ' + T('ইন্টারভিউ চ্যালেঞ্জ', 'Interview challenge'), src: pick(c.title), link: `#/challenges/${c.id}`, tables: c.tables, tableInfo: window.TABLE_INFO };
    }
    if (SB.extraResolvers && SB.extraResolvers[type]) return SB.extraResolvers[type](key, a, b);
    return null;
  }
  const marksOf = it => (it.kind === 'sql' ? MARKS.sql[it.level] || 2 : MARKS[it.kind]);
  const qHTML = it => (it.html ? it.q : esc(it.q));
  const explainHTML = it => (it.explain ? (it.html ? pick(it.explain) : esc(pick(it.explain))) : '');
  const optText = o => esc(pick(o));
  const letters = () => (I18N.lang === 'en' ? 'abcd' : 'কখগঘ');

  // ═══════════════ রিভিউ (Leitner box) ═══════════════
  // box 0..4 → পরের রিভিউ: আজ, ১, ৩, ৭, ১৪ দিন পর; box 5 = আয়ত্তে
  const INTERVAL = [0, 1, 3, 7, 14];
  const rv = store.get('sqlbn-review', {});
  const saveRv = () => { store.set('sqlbn-review', rv); SB.save('review'); };
  const review = {
    data: rv,
    // ভুল → box 0; সঠিক → এক ধাপ ওপরে (তালিকায় থাকলে)
    record(key, correct) {
      if (!key) return;
      const r = rv[key];
      if (correct) {
        if (!r || r.mastered) return;
        r.right = (r.right || 0) + 1; r.box = Math.min(5, (r.box || 0) + 1); r.last = dayStr(new Date());
        if (r.box >= 5) { r.mastered = true; r.due = null; } else r.due = addDays(INTERVAL[r.box]);
      } else {
        const isNew = !r || r.mastered;
        rv[key] = { box: 0, wrong: ((r && r.wrong) || 0) + 1, right: (r && r.right) || 0, added: (r && r.added) || dayStr(new Date()),
          last: dayStr(new Date()), due: isNew || !r ? dayStr(new Date()) : addDays(1), mastered: false };
      }
      saveRv();
    },
    remove(key) { delete rv[key]; saveRv(); },
    keys: () => Object.keys(rv).filter(k => resolve(k)),
    dueKeys() { const today = dayStr(new Date()); return this.keys().filter(k => !rv[k].mastered && rv[k].due && rv[k].due <= today); },
    activeKeys() { return this.keys().filter(k => !rv[k].mastered); },
    dueCount() { return this.dueKeys().length; }
  };
  SB.review = review;

  // ═══════════════ মক টেস্ট ═══════════════
  const PRESETS = {
    govt: { icon: '🏛️', title: { bn: 'সরকারি/ব্যাংক IT (AP/AE/Officer)', en: 'Govt./Bank IT (AP/AE/Officer)' }, desc: { bn: '১৫টি MCQ + ৫টি কুয়েরি · ৩০ মিনিট · ভুল MCQ-তে −০.২৫', en: '15 MCQ + 5 queries · 30 min · −0.25 per wrong MCQ' }, minutes: 30, mcq: 15, sql: 5, viva: 0, neg: 0.25 },
    lecturer: { icon: '🎓', title: { bn: 'লেকচারার (CSE) লিখিত', en: 'Lecturer (CSE) written' }, desc: { bn: '১০টি MCQ + ৩টি কুয়েরি + ৪টি লিখিত · ৪৫ মিনিট', en: '10 MCQ + 3 queries + 4 written · 45 min' }, minutes: 45, mcq: 10, sql: 3, viva: 4, neg: 0 },
    quick: { icon: '⚡', title: { bn: 'দ্রুত অনুশীলন', en: 'Quick practice' }, desc: { bn: '৮টি MCQ + ২টি কুয়েরি · ১০ মিনিট', en: '8 MCQ + 2 queries · 10 min' }, minutes: 10, mcq: 8, sql: 2, viva: 0, neg: 0 },
    hard: { icon: '🔥', title: { bn: 'কঠিন কুয়েরি রাউন্ড', en: 'Hard query round' }, desc: { bn: '৬টি মাঝারি/কঠিন কুয়েরি · ৪০ মিনিট', en: '6 medium/hard queries · 40 min' }, minutes: 40, mcq: 0, sql: 6, viva: 0, neg: 0, sqlLevels: ['medium', 'hard'] }
  };
  function pools(o) {
    const topics = o.topics; // null = সব
    const okCat = c => !topics || topics.includes(c);
    const mcq = [], sql = [], viva = [];
    JOB_QUESTIONS.forEach(q => { if (!okCat(q.cat)) return; (q.type === 'mcq' ? mcq : q.type === 'sql' ? sql : viva).push('job:' + q.id); });
    if (okCat('lessons')) LESSONS.forEach(l => l.quiz.forEach((_, i) => mcq.push(`quiz:${l.id}:${i}`)));
    if (okCat('challenges')) CHALLENGES.forEach(c => sql.push('ch:' + c.id));
    if (okCat('lessons')) Object.entries(window.PRACTICE || {}).forEach(([id, ps]) => ps.extra.forEach((_, i) => sql.push(`px:${id}:${i}`)));
    (SB.extraPools || []).forEach(fn => fn(okCat, mcq, sql, viva));
    const lv = o.sqlLevels;
    return { mcq, sql: lv ? sql.filter(k => lv.includes(resolve(k).level)) : sql, viva };
  }
  function buildExam(o) {
    let keys;
    if (o.fromKeys) keys = shuffle(o.fromKeys).slice(0, o.limit || 30);
    else {
      const p = pools(o);
      // MCQ-তে চাকরির প্রশ্ন আগে প্রাধান্য পায়, বাকি লেসন কুইজ থেকে
      const jobMcq = shuffle(p.mcq.filter(k => k.startsWith('job:'))), lesMcq = shuffle(p.mcq.filter(k => !k.startsWith('job:')));
      const mcq = [...jobMcq.slice(0, Math.ceil(o.mcq * 0.6)), ...lesMcq].slice(0, o.mcq);
      if (mcq.length < o.mcq) mcq.push(...jobMcq.filter(k => !mcq.includes(k)).slice(0, o.mcq - mcq.length));
      keys = [...shuffle(mcq), ...shuffle(p.sql).slice(0, o.sql), ...shuffle(p.viva).slice(0, o.viva)];
    }
    if (!keys.length) return null;
    const minutes = o.minutes || Math.max(5, Math.round(keys.reduce((s, k) => s + ({ mcq: 1, sql: 4, viva: 5 }[resolve(k).kind]), 0)));
    return { id: Date.now().toString(36), title: o.title, keys, answers: {}, flags: {}, cur: 0, start: Date.now(), end: Date.now() + minutes * 60000, minutes, neg: o.neg || 0 };
  }
  const getActive = () => store.get('sqlbn-mock-active', null);
  const setActive = e => store.set('sqlbn-mock-active', e);
  let timer = null;
  const stopTimer = () => { clearInterval(timer); timer = null; };

  function renderMock(sub) {
    stopTimer();
    document.body.classList.add('no-sidebar');
    SB.context = { where: 'mock test' };
    const active = getActive();
    if (sub === 'exam' && active) return renderExam(active);
    if (sub === 'result') return renderResult(store.get('sqlbn-mock-last', null));
    const hist = store.get('sqlbn-mock-history', []);
    const cats = [...JOB_CATS.filter(c => c.id !== 'lecturer' || true).map(c => ({ id: c.id, label: `${c.icon} ${pick(c)}` })), { id: 'lessons', label: '📘 ' + T('লেসন কুইজ', 'Lesson quizzes') }, { id: 'challenges', label: '🏆 ' + T('ইন্টারভিউ চ্যালেঞ্জ', 'Interview challenges') }, ...(SB.extraCats || []).map(c => ({ id: c.id, label: pick(c.label) }))];
    const wrongCount = review.activeKeys().length;
    $('#app').innerHTML = `<div class="page">
      <h1>📝 ${T('মক টেস্ট', 'Mock Test')}</h1>
      <p class="lead">${T('আসল পরীক্ষার মতো সময় বেঁধে পরীক্ষা দাও। কুয়েরি প্রশ্নে চালিয়ে ফলাফল দেখা যায়, কিন্তু সঠিক কিনা জানা যাবে জমা দেওয়ার পর। শেষে টপিকভিত্তিক বিশ্লেষণ পাবে, আর ভুল প্রশ্নগুলো নিজে থেকেই রিভিউ তালিকায় যাবে।', 'Take a timed test like the real exam. You can run queries to see results, but correctness is revealed only after you submit. You get a topic-wise analysis, and wrong answers go to your review list automatically.')}</p>
      ${active ? `<div class="callout warn"><b>⏱ ${T('একটি পরীক্ষা চলছে', 'A test is in progress')}:</b> ${esc(pick(active.title))} — ${T('বাকি সময়', 'time left')} ${fmtTime((active.end - Date.now()) / 1000)}
        <div class="toolbar"><a class="btn sm primary" href="#/mock/exam">${T('চালিয়ে যাও', 'Continue')}</a><button class="btn sm" data-m="abandon">${T('বাতিল করো', 'Abandon')}</button></div></div>` : ''}
      <div class="mock-presets">${Object.entries(PRESETS).map(([k, p]) => `<button class="mock-preset" data-preset="${k}"><span class="mp-icon">${p.icon}</span><b>${esc(pick(p.title))}</b><small>${esc(pick(p.desc))}</small></button>`).join('')}
        <button class="mock-preset" data-preset="wrong" ${wrongCount ? '' : 'disabled'}><span class="mp-icon">🔁</span><b>${T('আমার ভুল প্রশ্ন থেকে', 'From my wrong answers')}</b><small>${wrongCount ? T(`রিভিউ তালিকার ${n(wrongCount)}টি প্রশ্ন থেকে`, `From ${wrongCount} questions in your review list`) : T('এখনো কোনো ভুল প্রশ্ন নেই', 'No wrong answers yet')}</small></button>
      </div>
      <details class="mock-custom"><summary>⚙ ${T('নিজের মতো পরীক্ষা বানাও', 'Build a custom test')}</summary>
        <div class="mc-grid">
          <label>MCQ <input type="number" id="cMcq" min="0" max="60" value="10"></label>
          <label>${T('কুয়েরি', 'Queries')} <input type="number" id="cSql" min="0" max="30" value="4"></label>
          <label>${T('লিখিত/ভাইভা', 'Written/viva')} <input type="number" id="cViva" min="0" max="15" value="0"></label>
          <label>${T('সময় (মিনিট)', 'Time (minutes)')} <input type="number" id="cMin" min="1" max="180" value="25"></label>
          <label class="chk"><input type="checkbox" id="cNeg"> ${T('নেগেটিভ মার্কিং (ভুল MCQ-তে −০.২৫)', 'Negative marking (−0.25 per wrong MCQ)')}</label>
        </div>
        <p class="muted small">${T('টপিক (কিছু না বাছলে সব):', 'Topics (none selected = all):')}</p>
        <div class="mc-topics">${cats.map(c => `<label class="chk"><input type="checkbox" value="${c.id}"> ${esc(c.label)}</label>`).join('')}</div>
        <button class="btn primary" data-m="custom">${T('শুরু করো', 'Start')}</button>
      </details>
      <h2>${T('আগের পরীক্ষাগুলো', 'Past tests')}</h2>
      ${hist.length ? `${trendSVG(hist)}<div class="mock-hist">${hist.slice().reverse().map(h => `<div class="mh-row"><span>${esc(h.date)}</span><span>${esc(pick(h.title))}</span><b class="${h.pct >= 60 ? 'good' : h.pct >= 40 ? 'mid' : 'low'}">${n(h.score)}/${n(h.total)} · ${n(h.pct)}%</b></div>`).join('')}</div>`
        : `<p class="muted">${T('এখনো কোনো পরীক্ষা দাওনি।', 'No tests taken yet.')}</p>`}
      ${store.get('sqlbn-mock-last', null) ? `<p><a href="#/mock/result">${T('শেষ পরীক্ষার ফলাফল দেখো →', 'View last result →')}</a></p>` : ''}
    </div>`;
    $('#app').onclick = e => {
      const b = e.target.closest('button'); if (!b) return;
      let exam = null;
      if (b.dataset.m === 'abandon') { if (confirm(T('পরীক্ষা বাতিল করবে?', 'Abandon this test?'))) { setActive(null); renderMock(); } return; }
      if (b.dataset.preset === 'wrong') exam = buildExam({ title: { bn: 'আমার ভুল প্রশ্ন', en: 'My wrong answers' }, fromKeys: review.activeKeys(), limit: 25, neg: 0 });
      else if (b.dataset.preset) { const p = PRESETS[b.dataset.preset]; exam = buildExam({ ...p, title: p.title }); }
      if (b.dataset.m === 'custom') {
        const topics = $$('.mc-topics input:checked').map(i => i.value);
        const num = id => Math.max(0, +$(id).value || 0);
        if (!num('#cMcq') && !num('#cSql') && !num('#cViva')) return toast(T('অন্তত একটি প্রশ্ন দাও', 'Add at least one question'));
        exam = buildExam({ title: { bn: 'কাস্টম পরীক্ষা', en: 'Custom test' }, mcq: num('#cMcq'), sql: num('#cSql'), viva: num('#cViva'), minutes: Math.max(1, num('#cMin')), neg: $('#cNeg').checked ? 0.25 : 0, topics: topics.length ? topics : null });
      }
      if (!b.dataset.preset && b.dataset.m !== 'custom') return;
      if (!exam) return toast(T('এই টপিকে যথেষ্ট প্রশ্ন নেই', 'Not enough questions for these topics'));
      if (getActive() && !confirm(T('চলমান পরীক্ষা বাতিল হয়ে নতুনটা শুরু হবে।', 'The running test will be replaced.'))) return;
      setActive(exam); location.hash = '#/mock/exam';
    };
  }
  function trendSVG(hist) {
    const h = hist.slice(-15); if (h.length < 2) return '';
    const W = 520, H = 90, P = 10, step = (W - 2 * P) / (h.length - 1);
    const pts = h.map((x, i) => `${P + i * step},${H - P - (x.pct / 100) * (H - 2 * P)}`).join(' ');
    return `<svg class="trend" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-label="score trend">
      <line x1="${P}" x2="${W - P}" y1="${H - P - 0.6 * (H - 2 * P)}" y2="${H - P - 0.6 * (H - 2 * P)}" class="tr-grid"/>
      <polyline points="${pts}" class="tr-line"/>${h.map((x, i) => `<circle cx="${P + i * step}" cy="${H - P - (x.pct / 100) * (H - 2 * P)}" r="3.5" class="tr-dot"><title>${x.date}: ${x.pct}%</title></circle>`).join('')}</svg>`;
  }

  function renderExam(exam) {
    const items = exam.keys.map(resolve);
    const total = items.reduce((s, it) => s + (it ? marksOf(it) : 0), 0);
    $('#app').innerHTML = `<div class="mock-exam">
      <div class="mock-bar">
        <b class="mb-title">📝 ${esc(pick(exam.title))}</b>
        <span class="mb-info">${n(items.length)} ${T('প্রশ্ন', 'questions')} · ${n(total)} ${T('নম্বর', 'marks')}${exam.neg ? ` · ${T('নেগেটিভ', 'negative')} −${n(exam.neg)}` : ''}</span>
        <span class="spacer"></span>
        <span class="mb-timer" id="mockTimer">⏱ --:--</span>
        <button class="btn primary sm" data-x="submit">${T('জমা দাও', 'Submit')}</button>
      </div>
      <div class="mock-grid">
        <aside class="mock-palette" id="mockPal"></aside>
        <section class="mock-q" id="mockQ"></section>
      </div></div>`;
    const save = () => setActive(exam);
    const isAnswered = k => { const v = exam.answers[k]; return v !== undefined && v !== null && String(v).trim() !== ''; };
    const drawPalette = () => {
      $('#mockPal').innerHTML = `<div class="mp-legend"><span class="pl ans"></span>${T('উত্তর দেওয়া', 'Answered')} <span class="pl flag"></span>${T('পরে দেখব', 'Review later')}</div>
        <div class="mp-nums">${items.map((it, i) => `<button class="pn ${isAnswered(exam.keys[i]) ? 'ans' : ''} ${exam.flags[exam.keys[i]] ? 'flag' : ''} ${i === exam.cur ? 'cur' : ''}" data-go="${i}" title="${it.kind}">${n(i + 1)}</button>`).join('')}</div>
        <p class="muted small">${n(exam.keys.filter(isAnswered).length)}/${n(items.length)} ${T('উত্তর দেওয়া হয়েছে', 'answered')}</p>`;
    };
    let cm = null;
    const drawQ = () => {
      const i = exam.cur, it = items[i], key = exam.keys[i];
      cm = null;
      const kindLabel = { mcq: 'MCQ', sql: T('কুয়েরি', 'Query'), viva: T('লিখিত', 'Written') }[it.kind];
      let body = '';
      if (it.kind === 'mcq') body = `<div class="quiz-opts">${it.options.map((o, k) => `<button class="quiz-opt ${exam.answers[key] === k ? 'sel' : ''}" data-opt="${k}">${letters()[k]}) ${optText(o)}</button>`).join('')}</div>
        ${exam.answers[key] !== undefined ? `<button class="btn sm ghost" data-x="clearans">${T('উত্তর মুছো', 'Clear answer')}</button>` : ''}`;
      if (it.kind === 'sql') body = `${it.tables ? `<div class="chips">${T('টেবিল:', 'Tables:')} ${it.tables.map(tb => `<button class="chip" data-table="${tb}">${tb}</button>`).join('')}</div>` : ''}
        <div class="editor-wrap" id="mockEd"></div>
        <div class="toolbar"><button class="btn sm" data-x="run">${T('▶ চালাও (শুধু ফলাফল দেখো)', '▶ Run (see result only)')}</button><span class="spacer"></span><span class="shortcut muted small">${T('উত্তর নিজে থেকে সেভ হয়', 'Answer saves automatically')}</span></div>
        <div class="result" id="mockOut"></div>`;
      if (it.kind === 'viva') body = `<textarea class="mock-text" id="mockTxt" rows="9" placeholder="${T('এখানে উত্তর লেখো… (জমা দেওয়ার পর মডেল উত্তরের সাথে মিলিয়ে নিজে নম্বর দেবে)', 'Write your answer… (after submitting you compare with the model answer and mark yourself)')}">${esc(exam.answers[key] || '')}</textarea>`;
      $('#mockQ').innerHTML = `
        <div class="mq-head"><span class="mq-num">${T('প্রশ্ন', 'Question')} ${n(i + 1)} / ${n(items.length)}</span><span class="tags"><span>${kindLabel}</span><span>${n(marksOf(it))} ${T('নম্বর', 'marks')}</span></span><span class="src">${esc(it.src || '')}</span></div>
        <div class="task-box big">${qHTML(it)}</div>
        ${body}
        <div class="mq-nav">
          <button class="btn sm" data-x="prev" ${i === 0 ? 'disabled' : ''}>← ${T('আগের', 'Previous')}</button>
          <button class="btn sm ${exam.flags[key] ? 'on' : ''}" data-x="flag">🚩 ${exam.flags[key] ? T('চিহ্ন তোলো', 'Unflag') : T('পরে দেখব', 'Review later')}</button>
          ${i < items.length - 1 ? `<button class="btn sm primary" data-x="next">${T('পরের', 'Next')} →</button>` : `<button class="btn sm primary" data-x="submit">${T('জমা দাও', 'Submit')}</button>`}
        </div>`;
      if (it.kind === 'sql') {
        const runIt = () => { $('#mockOut').innerHTML = SB.runInline(cm.getValue(), seedOf(it.seedKey)); };
        const db = SB.freshDb(seedOf(it.seedKey)); const schema = SB.schemaOf(db); db.close();
        cm = SB.makeEditor($('#mockEd'), exam.answers[key] || '', runIt, schema);
        cm.on('change', () => { exam.answers[key] = cm.getValue(); save(); drawPalette(); });
      }
      if (it.kind === 'viva') $('#mockTxt').addEventListener('input', e => { exam.answers[key] = e.target.value; save(); drawPalette(); });
      SB.context = { where: 'mock test (do not reveal answers)', task: it.q };
    };
    const go = i => { exam.cur = Math.max(0, Math.min(items.length - 1, i)); save(); drawPalette(); drawQ(); window.scrollTo(0, 0); };
    $('#app').onclick = e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.go !== undefined) return go(+b.dataset.go);
      const key = exam.keys[exam.cur];
      if (b.dataset.opt !== undefined) { exam.answers[key] = +b.dataset.opt; save(); drawPalette(); drawQ(); return; }
      if (b.dataset.table) { $('#mockOut').innerHTML = SB.runInline(`SELECT * FROM "${b.dataset.table}" LIMIT 50;`, seedOf(items[exam.cur].seedKey)); return; }
      const x = b.dataset.x;
      if (x === 'prev') go(exam.cur - 1);
      if (x === 'next') go(exam.cur + 1);
      if (x === 'flag') { exam.flags[key] = !exam.flags[key]; save(); drawPalette(); drawQ(); }
      if (x === 'clearans') { delete exam.answers[key]; save(); drawPalette(); drawQ(); }
      if (x === 'run' && cm) $('#mockOut').innerHTML = SB.runInline(cm.getValue(), seedOf(items[exam.cur].seedKey));
      if (x === 'submit') {
        const left = exam.keys.filter(k => !isAnswered(k)).length;
        const msg = left ? T(`${n(left)}টি প্রশ্নের উত্তর দাওনি। তবুও জমা দেবে?`, `${left} question(s) unanswered. Submit anyway?`) : T('জমা দেবে?', 'Submit the test?');
        if (confirm(msg)) submit(exam, false);
      }
    };
    const tick = () => {
      const el = $('#mockTimer'); if (!el) return stopTimer();
      const left = (exam.end - Date.now()) / 1000;
      el.textContent = '⏱ ' + fmtTime(left);
      el.classList.toggle('warn', left < 300); el.classList.toggle('danger', left < 60);
      if (left <= 0) { stopTimer(); toast(T('⏰ সময় শেষ — পরীক্ষা জমা হয়েছে', '⏰ Time is up — test submitted')); submit(exam, true); }
    };
    drawPalette(); drawQ(); tick(); timer = setInterval(tick, 1000);
  }

  function grade(exam) {
    return exam.keys.map(key => {
      const it = resolve(key); if (!it) return null;
      const given = exam.answers[key];
      const answered = given !== undefined && given !== null && String(given).trim() !== '';
      const marks = marksOf(it);
      let correct = null, earned = 0, verdict = '';
      if (it.kind === 'mcq') {
        if (answered) { correct = given === it.answer; earned = correct ? marks : -(exam.neg || 0); } else correct = false;
      } else if (it.kind === 'sql') {
        if (answered) { const r = SB.checkExercise(it.ex, given, seedOf(it.seedKey)); correct = !!(r.verdict && r.verdict.ok); verdict = r.error ? SB.explainError(r.error) : (r.verdict && !r.verdict.ok ? r.verdict.msg : ''); earned = correct ? marks : 0; }
        else correct = false;
      } // viva: correct = null (নিজে নম্বর দেবে)
      return { key, kind: it.kind, marks, given: answered ? given : null, answered, correct, earned, verdict, self: null };
    }).filter(Boolean);
  }
  function summarize(res) {
    const total = res.items.reduce((s, x) => s + x.marks, 0);
    const score = Math.round(res.items.reduce((s, x) => s + (x.kind === 'viva' ? (x.self || 0) : x.earned), 0) * 100) / 100;
    res.total = total; res.score = score; res.pct = total ? Math.max(0, Math.round(score * 100 / total)) : 0;
    return res;
  }
  function submit(exam, timeUp) {
    stopTimer();
    const items = grade(exam);
    const res = summarize({ id: exam.id, title: exam.title, date: dayStr(new Date()), used: Math.min(exam.minutes * 60, Math.round((Date.now() - exam.start) / 1000)), minutes: exam.minutes, neg: exam.neg, timeUp, items });
    items.forEach(x => { if (x.kind !== 'viva') review.record(x.key, x.correct === true); });
    store.set('sqlbn-mock-last', res);
    const hist = store.get('sqlbn-mock-history', []);
    hist.push({ id: res.id, date: res.date, title: res.title, score: res.score, total: res.total, pct: res.pct });
    store.set('sqlbn-mock-history', hist.slice(-30));
    setActive(null);
    SB.recordActivity(); SB.save('mock');
    if (location.hash === '#/mock/result') renderResult(res); else location.hash = '#/mock/result';
  }
  function updateHistory(res) {
    const hist = store.get('sqlbn-mock-history', []);
    const h = hist.find(x => x.id === res.id); if (h) { h.score = res.score; h.pct = res.pct; store.set('sqlbn-mock-history', hist); }
  }

  function renderResult(res) {
    if (!res) { location.hash = '#/mock'; return; }
    const items = res.items.map(x => ({ ...x, it: resolve(x.key) })).filter(x => x.it);
    const cnt = { right: items.filter(x => x.correct === true).length, wrong: items.filter(x => x.answered && x.correct === false).length, skip: items.filter(x => !x.answered).length };
    const negLoss = items.filter(x => x.kind === 'mcq' && x.answered && !x.correct).length * (res.neg || 0);
    const vivaPending = items.filter(x => x.kind === 'viva' && x.self === null).length;
    const verdict = res.pct >= 80 ? T('🏆 চমৎকার! পরীক্ষার জন্য তুমি প্রস্তুত।', '🏆 Excellent! You are exam-ready.') : res.pct >= 60 ? T('👍 ভালো — দুর্বল টপিকগুলো আরেকবার দেখো।', '👍 Good — revisit your weak topics.') : res.pct >= 40 ? T('🙂 মোটামুটি — রিভিউ তালিকা অনুশীলন করো।', '🙂 Fair — practise your review list.') : T('📚 আরও অনুশীলন দরকার — লেসনগুলো আবার পড়ো।', '📚 More practice needed — revisit the lessons.');
    // টপিকভিত্তিক
    const topics = {};
    items.forEach(x => { const t = topics[x.it.topic] = topics[x.it.topic] || { got: 0, total: 0, right: 0, n: 0 }; t.total += x.marks; t.n++; const e = x.kind === 'viva' ? (x.self || 0) : Math.max(0, x.earned); t.got += e; if (x.correct || (x.kind === 'viva' && x.self === x.marks)) t.right++; });
    const topicRows = Object.entries(topics).sort((a, b) => a[1].got / a[1].total - b[1].got / b[1].total);
    $('#app').innerHTML = `<div class="page narrow">
      <a href="#/mock" class="back">← ${T('মক টেস্ট', 'Mock test')}</a>
      <h1>📊 ${T('ফলাফল', 'Result')}: ${esc(pick(res.title))}</h1>
      ${res.timeUp ? `<div class="callout warn">⏰ ${T('সময় শেষ হওয়ায় পরীক্ষা নিজে থেকে জমা হয়েছে।', 'The test was submitted automatically when time ran out.')}</div>` : ''}
      <div class="stat-row">
        <div class="stat big"><b>${n(res.score)}<small>/${n(res.total)}</small></b><span>${T('প্রাপ্ত নম্বর', 'Score')}</span></div>
        <div class="stat"><b>${n(res.pct)}%</b><span>${T('শতাংশ', 'Percent')}</span></div>
        <div class="stat"><b class="good">${n(cnt.right)}</b><span>${T('সঠিক', 'Correct')}</span></div>
        <div class="stat"><b class="low">${n(cnt.wrong)}</b><span>${T('ভুল', 'Wrong')}</span></div>
        <div class="stat"><b>${n(cnt.skip)}</b><span>${T('উত্তর দাওনি', 'Skipped')}</span></div>
        <div class="stat"><b>${fmtTime(res.used)}</b><span>${T('সময় লেগেছে', 'Time used')} / ${n(res.minutes)}′</span></div>
        ${res.neg ? `<div class="stat"><b class="low">−${n(Math.round(negLoss * 100) / 100)}</b><span>${T('নেগেটিভ মার্কিং', 'Negative marking')}</span></div>` : ''}
      </div>
      <p class="mock-verdict">${verdict}</p>
      ${vivaPending ? `<div class="callout info">✍️ ${T(`${n(vivaPending)}টি লিখিত প্রশ্নে নিচে মডেল উত্তর দেখে নিজে নম্বর দাও — তারপর মোট নম্বর হালনাগাদ হবে।`, `Mark yourself on ${vivaPending} written question(s) below using the model answer — the total updates.`)}</div>` : ''}
      <h2>${T('টপিকভিত্তিক বিশ্লেষণ', 'Topic analysis')} <small class="muted">${T('(দুর্বল টপিক উপরে)', '(weakest first)')}</small></h2>
      <div class="topic-rows">${topicRows.map(([name, t]) => { const p = Math.round(t.got * 100 / t.total); return `<div class="tp-row"><span class="tp-name">${esc(name)}</span><div class="pbar"><span class="${p >= 60 ? '' : p >= 40 ? 'mid' : 'low'}" style="width:${p}%"></span></div><span class="tp-val">${n(t.right)}/${n(t.n)}</span></div>`; }).join('')}</div>
      <div class="toolbar">
        ${cnt.wrong + cnt.skip ? `<button class="btn primary" data-r="retrywrong">🔁 ${T('শুধু ভুলগুলো দিয়ে আবার পরীক্ষা', 'Retest only the wrong ones')}</button>` : ''}
        <a class="btn" href="#/review">${T('রিভিউ তালিকায় যাও', 'Go to review list')}</a>
        <a class="btn ghost" href="#/mock">${T('নতুন পরীক্ষা', 'New test')}</a>
      </div>
      <h2>${T('প্রশ্নভিত্তিক উত্তর', 'Answers, question by question')}</h2>
      <div class="mock-review-list">${items.map((x, i) => {
        const it = x.it;
        const icon = x.kind === 'viva' ? (x.self === null ? '✍️' : x.self === x.marks ? '✅' : x.self > 0 ? '🟡' : '❌') : x.correct ? '✅' : x.answered ? '❌' : '⏭';
        let yours = '', right = '';
        if (it.kind === 'mcq') {
          yours = x.answered ? `${letters()[x.given]}) ${optText(it.options[x.given])}` : `<i class="muted">${T('উত্তর দাওনি', 'not answered')}</i>`;
          right = `${letters()[it.answer]}) ${optText(it.options[it.answer])}`;
        } else if (it.kind === 'sql') {
          yours = x.answered ? `<pre class="syntax">${esc(x.given)}</pre>${x.verdict ? `<div class="muted small">${x.verdict}</div>` : ''}` : `<i class="muted">${T('উত্তর দাওনি', 'not answered')}</i>`;
          right = `<pre class="syntax">${esc(SB.formatSql(it.ex.solution))}</pre>`;
        } else {
          yours = x.answered ? `<div class="viva-ans">${esc(x.given).replace(/\n/g, '<br>')}</div>` : `<i class="muted">${T('উত্তর দাওনি', 'not answered')}</i>`;
        }
        return `<details class="mr-item ${x.correct ? 'ok' : x.kind === 'viva' && x.self === null ? 'pending' : 'bad'}" ${x.correct ? '' : 'open'}>
          <summary><span class="mr-icon">${icon}</span><span class="mr-num">${n(i + 1)}.</span><span class="mr-q">${esc(plain(it.q)).slice(0, 140)}</span><span class="mr-marks">${n(x.kind === 'viva' ? (x.self ?? 0) : x.earned)}/${n(x.marks)}</span></summary>
          <div class="mr-body">
            <div class="task-box">${qHTML(it)}</div>
            <div class="mr-cols"><div><h4>${T('তোমার উত্তর', 'Your answer')}</h4>${yours}</div>${right ? `<div><h4>${T('সঠিক উত্তর', 'Correct answer')}</h4>${right}</div>` : ''}</div>
            ${it.kind === 'viva' ? `<div class="explain-box"><h4>${T('মডেল উত্তর', 'Model answer')}</h4>${explainHTML(it)}</div>
              <div class="self-grade"><span>${T('নিজে নম্বর দাও:', 'Mark yourself:')}</span>${[[x.marks, T('পুরোটা পেরেছি', 'Fully correct')], [1, T('আংশিক', 'Partly')], [0, T('পারিনি', 'Missed it')]].map(([v, l]) => `<button class="btn sm ${x.self === v ? 'on' : ''}" data-self="${i}" data-v="${v}">${l} (${n(v)})</button>`).join('')}</div>`
              : (explainHTML(it) ? `<details class="expl"><summary>${T('ব্যাখ্যা', 'Explanation')}</summary><div class="explain-box">${explainHTML(it)}</div></details>` : '')}
            <a class="small" href="${it.link}">${T('মূল প্রশ্নে যাও →', 'Open the original question →')}</a>
          </div></details>`;
      }).join('')}</div></div>`;
    $$('#app pre.syntax').forEach(SB.highlight);
    $$('#app .explain-box pre').forEach(SB.highlight);
    $('#app').onclick = e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.self !== undefined) {
        const x = res.items[+b.dataset.self]; x.self = +b.dataset.v;
        review.record(x.key, x.self === x.marks);
        summarize(res); store.set('sqlbn-mock-last', res); updateHistory(res); renderResult(res);
        const el = $$('.mr-item')[+b.dataset.self]; if (el) el.scrollIntoView({ block: 'center' });
      }
      if (b.dataset.r === 'retrywrong') {
        const keys = res.items.filter(x => x.correct !== true && !(x.kind === 'viva' && x.self === x.marks)).map(x => x.key);
        const exam = buildExam({ title: { bn: 'ভুল প্রশ্নের পুনঃপরীক্ষা', en: 'Retest of wrong answers' }, fromKeys: keys, limit: keys.length, neg: res.neg });
        if (exam) { setActive(exam); location.hash = '#/mock/exam'; }
      }
    };
  }

  // ═══════════════ রিভিউ পেজ ═══════════════
  function renderReview(sub) {
    stopTimer();
    document.body.classList.add('no-sidebar');
    SB.context = { where: 'review (spaced repetition)' };
    if (sub === 'session') return renderSession();
    const keys = review.keys();
    const due = review.dueKeys(), active = review.activeKeys(), mastered = keys.filter(k => rv[k].mastered);
    const boxes = [0, 1, 2, 3, 4].map(b => active.filter(k => (rv[k].box || 0) === b).length);
    const today = dayStr(new Date());
    const sorted = keys.sort((a, b) => (rv[a].mastered - rv[b].mastered) || String(rv[a].due).localeCompare(String(rv[b].due)));
    $('#app').innerHTML = `<div class="page">
      <h1>🔁 ${T('ভুল প্রশ্ন রিভিউ', 'Wrong-answer review')}</h1>
      <p class="lead">${T('যেকোনো জায়গায় — লেসন কুইজ, অনুশীলন, চ্যালেঞ্জ, চাকরি প্রস্তুতি বা মক টেস্টে — ভুল করলে (বা আগে সমাধান দেখে ফেললে) প্রশ্নটা এখানে চলে আসে। ঠিক উত্তর দিলে প্রশ্নটা পরের বাক্সে যায় এবং আরও পরে আবার আসে; ভুল করলে আবার প্রথম বাক্সে। ৫ বার টানা ঠিক হলে "আয়ত্তে"।', 'Whenever you get something wrong — lesson quiz, exercise, challenge, job prep or mock test (or peek at the solution first) — the question lands here. A correct answer moves it to the next box and it comes back later; a wrong one sends it back to box 1. Five correct in a row = mastered.')}</p>
      <div class="stat-row">
        <div class="stat big"><b>${n(due.length)}</b><span>${T('আজ রিভিউ বাকি', 'Due today')}</span></div>
        <div class="stat"><b>${n(active.length)}</b><span>${T('তালিকায় আছে', 'In the list')}</span></div>
        <div class="stat"><b class="good">${n(mastered.length)}</b><span>${T('আয়ত্তে', 'Mastered')}</span></div>
      </div>
      <div class="toolbar">
        <a class="btn primary big" href="#/review/session?mode=due" ${due.length ? '' : 'aria-disabled="true" style="pointer-events:none;opacity:.5"'}>▶ ${T(`আজকের রিভিউ শুরু (${n(due.length)})`, `Start today's review (${due.length})`)}</a>
        <a class="btn" href="#/review/session?mode=all" ${active.length ? '' : 'aria-disabled="true" style="pointer-events:none;opacity:.5"'}>${T(`সব ভুল প্রশ্ন অনুশীলন (${n(active.length)})`, `Practise all wrong answers (${active.length})`)}</a>
        <a class="btn ghost" href="#/mock">📝 ${T('এগুলো দিয়ে মক টেস্ট', 'Mock test from these')}</a>
      </div>
      <h2>${T('লাইটনার বাক্স', 'Leitner boxes')}</h2>
      <div class="leitner">${boxes.map((c, b) => `<div class="lbox b${b}"><b>${n(c)}</b><span>${T('বাক্স', 'Box')} ${n(b + 1)}</span><small>${b === 0 ? T('আজই', 'today') : T(`${n(INTERVAL[b])} দিন পর`, `every ${INTERVAL[b]} d`)}</small></div>`).join('<span class="larrow">→</span>')}<span class="larrow">→</span><div class="lbox done"><b>${n(mastered.length)}</b><span>${T('আয়ত্তে', 'Mastered')}</span><small>✓</small></div></div>
      <h2>${T('তালিকা', 'List')}</h2>
      ${sorted.length ? `<div class="rv-list">${sorted.map(k => {
        const r = rv[k], it = resolve(k);
        const dueTxt = r.mastered ? '✓ ' + T('আয়ত্তে', 'mastered') : r.due <= today ? `<b class="low">${T('আজ', 'today')}</b>` : esc(r.due);
        return `<div class="rv-row ${r.mastered ? 'mastered' : ''}">
          <span class="jp-type">${{ mcq: '☑️', sql: '⌨️', viva: '🗣️' }[it.kind]}</span>
          <div class="jp-body"><div class="jp-q">${esc(plain(it.q)).slice(0, 150)}</div>
            <div class="jp-meta"><span class="src">${esc(it.topic)}</span><span class="src">❌ ${n(r.wrong || 0)} · ✅ ${n(r.right || 0)}</span><span class="src">${T('বাক্স', 'box')} ${n(Math.min(5, (r.box || 0) + 1))}</span><span class="src">${T('পরের রিভিউ', 'next')}: ${dueTxt}</span></div></div>
          <div class="rv-act"><a class="btn sm" href="#/review/session?key=${encodeURIComponent(k)}">${T('অনুশীলন', 'Practise')}</a><button class="btn sm ghost" data-rm="${esc(k)}" title="${T('তালিকা থেকে সরাও', 'Remove')}">✕</button></div></div>`;
      }).join('')}</div>` : `<div class="callout tip">🎉 ${T('তালিকা খালি! লেসন, চ্যালেঞ্জ, চাকরি প্রস্তুতি বা মক টেস্টে ভুল হলে প্রশ্ন এখানে আসবে।', 'The list is empty! Questions you get wrong in lessons, challenges, job prep or mock tests will show up here.')}</div>`}
    </div>`;
    $('#app').onclick = e => { const b = e.target.closest('[data-rm]'); if (b && confirm(T('তালিকা থেকে সরাবে?', 'Remove from the list?'))) { review.remove(b.dataset.rm); renderReview(); } };
  }

  function renderSession() {
    const params = new URLSearchParams(location.hash.split('?')[1] || '');
    const keys = params.get('key') ? [params.get('key')] : shuffle(params.get('mode') === 'all' ? review.activeKeys() : review.dueKeys());
    if (!keys.length) { location.hash = '#/review'; return; }
    let i = 0; const results = [];
    const drawEnd = () => {
      const right = results.filter(Boolean).length;
      $('#app').innerHTML = `<div class="page narrow"><h1>🎉 ${T('রিভিউ শেষ!', 'Review done!')}</h1>
        <div class="stat-row"><div class="stat big"><b>${n(right)}/${n(results.length)}</b><span>${T('সঠিক', 'Correct')}</span></div><div class="stat"><b>${n(review.dueCount())}</b><span>${T('আজ আরও বাকি', 'Still due today')}</span></div></div>
        <p class="muted">${T('সঠিকগুলো পরের বাক্সে গেছে, ভুলগুলো কাল আবার আসবে।', 'Correct ones moved up a box; wrong ones come back tomorrow.')}</p>
        <div class="toolbar"><a class="btn primary" href="#/review">${T('রিভিউ তালিকা', 'Review list')}</a><a class="btn" href="#/mock">📝 ${T('মক টেস্ট', 'Mock test')}</a></div></div>`;
    };
    const draw = () => {
      if (i >= keys.length) return drawEnd();
      const key = keys[i], it = resolve(key), r = rv[key] || {};
      let answered = false;
      $('#app').innerHTML = `<div class="page narrow">
        <div class="rs-top"><a href="#/review" class="back">← ${T('রিভিউ', 'Review')}</a><span class="spacer"></span><span class="muted">${n(i + 1)} / ${n(keys.length)}</span></div>
        <div class="pbar big"><span style="width:${i * 100 / keys.length}%"></span></div>
        <div class="ch-head" style="margin-top:12px"><span class="tags"><span>${esc(it.topic)}</span></span><span class="src">❌ ${n(r.wrong || 0)} ${T('বার ভুল', 'times wrong')}</span></div>
        <div class="task-box big">${qHTML(it)}</div>
        <div id="rsWork"></div>
        <div class="toolbar rs-next"><span class="spacer"></span><button class="btn" id="rsNext">${T('এড়িয়ে যাও →', 'Skip →')}</button></div></div>`;
      const work = $('#rsWork');
      const done = ok => { if (answered) return; answered = true; results.push(ok); review.record(key, ok); $('#rsNext').textContent = T('পরের প্রশ্ন →', 'Next question →'); $('#rsNext').classList.add('primary'); };
      $('#rsNext').onclick = () => { if (!answered) results.push(false); i++; draw(); window.scrollTo(0, 0); };
      if (it.kind === 'mcq') {
        work.innerHTML = `<div class="quiz-opts">${it.options.map((o, k) => `<button class="quiz-opt" data-k="${k}">${letters()[k]}) ${optText(o)}</button>`).join('')}</div><div class="quiz-explain"></div>`;
        work.onclick = e => {
          const b = e.target.closest('.quiz-opt'); if (!b || answered) return;
          const ok = +b.dataset.k === it.answer;
          $$('.quiz-opt', work).forEach((x, k) => { x.disabled = true; if (k === it.answer) x.classList.add('correct'); else if (x === b) x.classList.add('wrong'); });
          const ex = $('.quiz-explain', work); ex.classList.add('show'); ex.innerHTML = (ok ? '✅ ' : '❌ ') + explainHTML(it);
          done(ok);
        };
      } else if (it.kind === 'sql') {
        let solved = false;
        SB.practice(work, {
          ex: it.ex, seedKey: it.seedKey, draftKey: 'sqlbn-rvdraft-' + key, tables: it.tables, tableInfo: it.tableInfo, hints: it.hints || [], explain: it.explain,
          where: 'review', title: plain(it.q), task: it.q,
          isSolved: () => solved, onSolved: () => { solved = true; },
          onResult: ok => done(ok), nextHtml: () => ''
        });
      } else {
        work.innerHTML = `<div class="toolbar"><button class="btn primary" id="rsShow">${T('📖 মডেল উত্তর দেখো', '📖 Show model answer')}</button></div><div class="explain-box viva" hidden>${explainHTML(it)}</div>
          <div class="self-grade" hidden><span>${T('তুমি কি পেরেছিলে?', 'Did you know it?')}</span><button class="btn sm" data-sg="1">✅ ${T('পেরেছি', 'Yes')}</button><button class="btn sm" data-sg="0">❌ ${T('পারিনি', 'No')}</button></div>`;
        $('#rsShow').onclick = () => { $('.explain-box', work).hidden = false; $('.self-grade', work).hidden = false; $$('.explain-box pre', work).forEach(SB.highlight); };
        work.onclick = e => { const b = e.target.closest('[data-sg]'); if (b) { done(b.dataset.sg === '1'); $$('[data-sg]', work).forEach(x => { x.disabled = true; }); b.classList.add('on'); } };
      }
    };
    draw();
  }

  SB.resolveItem = resolve;
  SB.renderMock = renderMock;
  SB.renderReview = renderReview;
  SB.stopMockTimer = stopTimer;
})();
