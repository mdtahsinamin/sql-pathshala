/* SQL পাঠশালা — পেজ, রাউটার ও অ্যাপ শুরু */
(function () {
  'use strict';
  const { $, $$, esc, store, toast, t, n, pick, state, L } = SB;
  const SQLJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/';
  let currentLessonId = null;
  const plain = h => String(h || '').replace(/<[^>]+>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
  const seedOf = k => SB.seedOf(k);

  // ═══════════════ শেয়ার করা অনুশীলন প্যানেল ═══════════════
  // o: { ex, seedKey, draftKey, tables, tableInfo, hints[], explain, isSolved, onSolved(), nextHtml, where, title, task }
  function practice(host, o) {
    const seed = seedOf(o.seedKey);
    let hintShown = 0, sawSolution = false;
    host.innerHTML = `
      ${o.tables && o.tables.length ? `<div class="chips">${t('viewTable')} ${o.tables.map(tb => `<button class="chip" data-table="${tb}" title="${esc(pick((o.tableInfo || {})[tb]))}">${tb}</button>`).join('')}</div>` : ''}
      <div class="editor-wrap pr-editor"></div>
      <div class="toolbar">
        <button class="btn primary" data-act="run">${t('runCheck')}</button>
        <button class="btn sm" data-act="hint">${t('hint')}${o.hints.length > 1 ? ` <span class="badge">${n(o.hints.length)}</span>` : ''}</button>
        <button class="btn sm" data-act="solution">${o.explain ? t('showExplain') : t('solution')}</button>
        <button class="btn sm" data-act="viz">${t('visualize')}</button>
        <button class="btn sm" data-act="explain">${t('explainBtn')}</button>
        <button class="btn sm" data-act="tutor">${t('askTutor')}</button>
        <button class="btn sm ghost" data-act="dialect">${t('dialect')}</button>
        <button class="btn sm ghost" data-act="clear" title="${t('clearTitle')}">${t('clear')}</button>
        <span class="spacer"></span><span class="shortcut"><kbd>Ctrl</kbd>+<kbd>Enter</kbd></span>
      </div>
      <div class="status pr-status"></div>
      <div class="result pr-result"></div>
      <details class="expected"><summary>${t('showExpected')}</summary><div class="pr-expected"></div></details>`;
    const status = $('.pr-status', host), result = $('.pr-result', host);
    const setStatus = (cls, html) => { status.className = 'status pr-status show ' + cls; status.innerHTML = html; };
    SB.context = { where: o.where, title: o.title, task: o.task, exercise: o.ex, hints: o.hints.map(plain), seed: o.seedKey };

    const run = () => {
      const sql = cm.getValue();
      store.set(o.draftKey, sql);
      if (!sql.replace(/--.*$/gm, '').trim()) { setStatus('info', t('writeFirst')); return; }
      const r = SB.checkExercise(o.ex, sql, seed);
      SB.context.lastError = r.error || null;
      if (r.error) { setStatus('err', SB.errorHTML(r.error)); result.innerHTML = ''; SB.context.lastVerdict = null; return; }
      result.innerHTML = o.ex.check ? SB.tableHTML(r.cmp, t('tableAfter')) : SB.tableHTML(r.run.last, t('yourResult'));
      SB.context.lastVerdict = r.verdict.ok ? 'correct' : r.verdict.msg;
      if (r.verdict.ok) {
        const first = !o.isSolved();
        if (first) { SB.recordActivity(); o.onSolved(); }
        if (!sawSolution) { if (o.reviewKey) SB.review.record(o.reviewKey, true); if (o.onResult) o.onResult(true); }
        setStatus('ok', `${t('correct')} ${o.explain ? '' : ''}<div class="toolbar">${o.nextHtml ? o.nextHtml() : ''}${o.explain ? `<button class="btn sm" data-act="solution">${t('showExplain')}</button>` : ''}</div>`);
      } else {
        setStatus('bad', `${t('notYet')} ${r.verdict.msg} ${SB.compareModal ? `<button class="btn sm" data-act="compare">🔍 ${I18N.lang === 'en' ? 'What is different?' : 'পার্থক্য কোথায়?'}</button>` : ''} <button class="btn sm ghost" data-act="tutor-wrong">${t('askTutor')}</button>`);
      }
    };
    const cm = SB.makeEditor($('.pr-editor', host), store.get(o.draftKey, ''), run, SB.schemaOf((() => { const d = SB.freshDb(seed); setTimeout(() => d.close()); return d; })()));

    host.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.table) { result.innerHTML = SB.runInline(`SELECT * FROM "${b.dataset.table}";`, seed); setStatus('info', t('showingTable', { t: b.dataset.table })); return; }
      const act = b.dataset.act; if (!act) return;
      if (act === 'run') run();
      if (act === 'hint') {
        hintShown = Math.min(hintShown + 1, Math.max(1, o.hints.length));
        const hs = o.hints.length ? o.hints.slice(0, hintShown) : [t('defaultHint')];
        setStatus('info', hs.map((h, i) => `${t('hintLabel')}${o.hints.length > 1 ? ` (${n(i + 1)}/${n(o.hints.length)})` : ''} ${h}`).join('<br>') + (hintShown >= o.hints.length && o.hints.length > 1 ? `<br><small class="muted">${t('noMoreHints')}</small>` : ''));
      }
      if (act === 'solution') {
        if (!o.isSolved() && !sawSolution) { sawSolution = true; if (o.reviewKey) SB.review.record(o.reviewKey, false); if (o.onResult) o.onResult(false); }
        setStatus('info', `${t('possibleSolution')}<div class="solution-box"><pre class="syntax">${esc(SB.formatSql(o.ex.solution))}</pre></div>
          <button class="btn sm" data-act="usesol">${t('useSolution')}</button> <small class="muted">${t('typeYourself')}</small>
          ${o.explain ? `<div class="explain-box"><h4>${t('explanation')}</h4>${pick(o.explain)}</div>` : ''}`);
        SB.$$('pre.syntax', status).forEach(SB.highlight);
      }
      if (act === 'usesol') { cm.setValue(SB.formatSql(o.ex.solution)); cm.focus(); }
      if (act === 'clear') { cm.setValue(''); store.set(o.draftKey, ''); cm.focus(); }
      if (act === 'viz') SB.visualize(cm.getValue(), (() => SB.freshDb(seed))());
      if (act === 'explain') SB.explainModal(cm.getValue(), o.seedKey);
      if (act === 'dialect') SB.showDialects(cm.getValue());
      if (act === 'tutor') SB.tutor.toggle(true);
      if (act === 'tutor-wrong') SB.tutor.ask('wrong');
      if (act === 'compare') SB.compareModal(cm.getValue(), o.ex, seed, sawSolution || o.isSolved());
    });
    $('details.expected', host).addEventListener('toggle', function () {
      if (this.open) { try { $('.pr-expected', host).innerHTML = SB.tableHTML(SB.expectedResult(o.ex, seed), o.ex.check ? t('expectedAfter') : t('expected')); } catch (e) { } }
    });
    return { cm, run };
  }
  SB.practice = practice;

  // ═══════════════ সাইডবার ও হেডার ═══════════════
  function renderNav() {
    const q = ($('#lessonSearch').value || '').trim().toLowerCase();
    $('#lessonNav').innerHTML = SECTIONS.map(sec => {
      const items = LESSONS.map((l, i) => ({ l, i })).filter(({ l }) => {
        if (l.section !== sec.id) return false;
        if (!q) return true;
        const en = l.en || (window.LESSONS_EN || {})[l.id] || {};
        return (l.title + ' ' + l.summary + ' ' + l.id + ' ' + (en.title || '') + ' ' + plain(l.content)).toLowerCase().includes(q);
      });
      if (!items.length) return '';
      return `<div class="nav-section"><div class="nav-section-title">${sectionTitle(sec)}</div>${items.map(({ l, i }) => {
        const st = SB.lessonStatus(l);
        return `<a class="nav-item ${st} ${l.id === currentLessonId ? 'active' : ''}" href="#/learn/${l.id}"><span class="nav-num">${st === 'done' ? '✓' : n(i)}</span><span>${esc(L(l).title)}</span></a>`;
      }).join('')}</div>`;
    }).join('') || `<p class="muted" style="padding:8px">${t('nothingFound')}</p>`;
  }
  const SECTION_EN = { start: 'Start', read: 'Reading data (SELECT)', join: 'Multiple tables', agg: 'Calculating & grouping', adv: 'Advanced queries', dml: 'Changing data', ddl: 'Managing tables', next: 'Next steps' };
  const sectionTitle = sec => I18N.lang === 'en' ? SECTION_EN[sec.id] || sec.title : sec.title;

  function updateProgressUI() {
    const s = SB.stats();
    $('#progressPill').innerHTML = `⚡ ${n(s.xp)} XP${s.cur ? ` · 🔥${n(s.cur)}` : ''}`;
    const rl = $('.topnav a[data-nav="review"]'); if (rl) { const d = SB.review.dueCount(); rl.innerHTML = t('review') + (d ? ` <span class="nav-count">${n(d)}</span>` : ''); }
    renderNav();
  }
  function setActiveTop(name) { $$('.topnav a').forEach(a => a.classList.toggle('active', a.dataset.nav === name)); }
  function chromeText() {
    const map = { learn: 'learn', practice: 'practice', challenges: 'challenges', jobprep: 'jobprep', mock: 'mock', review: 'review', playground: 'playground', visualize: 'visualizer', explain: 'explainer', theory: 'theoryNav', database: 'database', cheatsheet: 'cheatsheet' };
    $$('.topnav a').forEach(a => { a.textContent = t(map[a.dataset.nav]); });
    $('#lessonSearch').placeholder = t('searchLessons');
    $('#langBtn').textContent = I18N.lang === 'en' ? 'বাং' : 'EN';
    $('#langBtn').title = I18N.lang === 'en' ? 'বাংলায় দেখুন' : 'View in English';
    $('#tutorFab').title = t('tutorTitle');
  }

  // ═══════════════ হোম ═══════════════
  function renderHome() {
    document.body.classList.add('no-sidebar'); currentLessonId = null; setActiveTop('');
    SB.context = { where: 'home' };
    const next = LESSONS.find(l => SB.lessonStatus(l) !== 'done') || LESSONS[0];
    const started = Object.keys(state.progress).length > 0;
    const exCount = LESSONS.reduce((s, l) => s + l.exercises.length, 0), qCount = LESSONS.reduce((s, l) => s + l.quiz.length, 0);
    const F = (ic, h, p, href) => `<a class="feature" href="${href}"><div class="ic">${ic}</div><h3>${h}</h3><p>${p}</p></a>`;
    const en = I18N.lang === 'en';
    const cards = SECTIONS.map(sec => `<div class="sec-label">${sectionTitle(sec)}</div>` + LESSONS.map((l, i) => l.section !== sec.id ? '' : `
      <a class="lesson-card ${SB.lessonStatus(l)}" href="#/learn/${l.id}"><span class="nav-num">${SB.lessonStatus(l) === 'done' ? '✓' : n(i)}</span>
        <div><h4>${esc(L(l).title)}</h4><p>${esc(L(l).summary)}</p></div></a>`).join('')).join('');
    $('#app').innerHTML = `
    <div class="home">
      <section class="hero">
        <h1>${t('heroTitle')}</h1>
        <p>${t('heroSub')}</p>
        <div class="hero-actions">
          <a class="btn primary big" href="#/learn/${next.id}">${started ? t('resume') : t('start')}</a>
          <a class="btn big" href="#/jobprep">💼 ${t('jobprep')}</a>
          <a class="btn big" href="#/playground">${t('openPg')}</a>
        </div>
        <div class="hero-code"><span class="k">SELECT</span> name, cgpa<br><span class="k">FROM</span> students<br><span class="k">WHERE</span> city = <span class="s">'Dhaka'</span><br><span class="k">ORDER BY</span> cgpa <span class="k">DESC</span>;</div>
      </section>
      <div id="homeExtra"></div>
      ${SB.review.dueCount() ? `<div class="callout warn home-due">🔁 ${en ? `${SB.review.dueCount()} question(s) you got wrong are due for review today.` : `আজ রিভিউ করার মতো ${n(SB.review.dueCount())}টি ভুল প্রশ্ন আছে।`} <a class="btn sm primary" href="#/review/session?mode=due">${en ? 'Review now' : 'এখনই রিভিউ করো'}</a></div>` : ''}
      <div class="features">
        ${F('📝', en ? 'Timed mock tests' : 'মক টেস্ট', en ? 'Exam-style timed tests with negative marking, a question palette and topic-wise results.' : 'নেগেটিভ মার্কিং, প্রশ্ন প্যালেট ও টপিকভিত্তিক ফলাফলসহ সময় বাঁধা পরীক্ষা।', '#/mock')}
        ${F('🔁', en ? 'Wrong-answer review' : 'ভুল প্রশ্ন রিভিউ', en ? 'Every mistake is saved and comes back on a spaced schedule until you master it.' : 'প্রতিটি ভুল সেভ হয় এবং আয়ত্তে না আসা পর্যন্ত নির্দিষ্ট বিরতিতে ফিরে আসে।', '#/review')}
        ${F('📖', en ? 'Bangla & English' : 'বাংলা ও English', en ? `${LESSONS.length} lessons, every one in both languages — switch anytime from the header.` : `${n(LESSONS.length)}টি লেসন, প্রতিটি দুই ভাষায় — হেডার থেকে যেকোনো সময় বদলাও।`, '#/learn/intro')}
        ${F('✅', en ? 'Auto-checked practice' : 'অটো-চেক অনুশীলন', en ? `${exCount} exercises and ${qCount} quiz questions with progressive hints.` : `${n(exCount)}টি অনুশীলন ও ${n(qCount)}টি কুইজ, ধাপে ধাপে হিন্টসহ।`, `#/learn/${next.id}`)}
        ${F('🧠', en ? 'Query explainer' : 'কুয়েরি ব্যাখ্যাকারী', en ? 'Paste any SQL — even MySQL/Oracle — and get every clause explained in plain words, in the order the database runs it.' : 'যেকোনো SQL পেস্ট করো (MySQL/Oracle-এরও) — প্রতিটি অংশ সহজ ভাষায়, ডেটাবেস যে ক্রমে চালায় সেই ক্রমে।', '#/explain')}
        ${F('🔍', en ? 'Query visualizer' : 'কুয়েরি ভিজুয়ালাইজার', en ? 'Watch FROM → WHERE → GROUP BY → SELECT → ORDER BY happen to the rows, step by step.' : 'FROM → WHERE → GROUP BY → SELECT → ORDER BY — প্রতিটি ধাপে রোগুলোর কী হয় চোখে দেখো।', '#/visualize')}
        ${F('🤖', en ? 'AI tutor' : 'AI টিউটর', en ? 'Explains your query, finds mistakes and gives hints — offline rules or Claude with your own key.' : 'তোমার কুয়েরি ব্যাখ্যা, ভুল খোঁজা, হিন্ট — অফলাইনে বা নিজের key দিয়ে Claude।', 'javascript:SB.tutor.toggle(true)')}
        ${F('💼', en ? 'BD job prep' : 'চাকরি প্রস্তুতি', en ? `${JOB_QUESTIONS.length} questions in the style of govt./bank IT exams and CSE lecturer vivas.` : `সরকারি/ব্যাংক IT পরীক্ষা ও CSE লেকচারার ভাইভার ধাঁচে ${n(JOB_QUESTIONS.length)}টি প্রশ্ন।`, '#/jobprep')}
        ${F('🏆', en ? 'Interview challenges' : 'ইন্টারভিউ চ্যালেঞ্জ', en ? `${CHALLENGES.length} classic problems — Nth salary, gaps & islands, median, pivot…` : `${n(CHALLENGES.length)}টি ক্লাসিক সমস্যা — N-তম বেতন, gaps & islands, মিডিয়ান, পিভট…`, '#/challenges')}
        ${F('🗄', en ? 'ER diagram & import' : 'ER ডায়াগ্রাম ও ইমপোর্ট', en ? 'See table relationships, load your own CSV or SQLite file, download the database.' : 'টেবিলের সম্পর্ক দেখো, নিজের CSV/SQLite ফাইল আনো, ডেটাবেস ডাউনলোড করো।', '#/database')}
        ${F('🎓', en ? 'XP, badges & certificate' : 'XP, ব্যাজ ও সার্টিফিকেট', en ? 'Streaks, badges, a certificate on completion, and progress sync between devices.' : 'স্ট্রিক, ব্যাজ, শেষে সার্টিফিকেট, আর অন্য ডিভাইসে অগ্রগতি নেওয়া।', '#/profile')}
      </div>
      <h2 class="section-h">${t('allLessons')}</h2>
      <p class="section-sub">${t('allLessonsSub')}</p>
      <div class="lesson-grid">${cards}</div>
    </div>`;
  }

  // ═══════════════ লেসন ═══════════════
  function vennSVG(type) {
    const A = type === 'left' || type === 'full', B = type === 'right' || type === 'full', f = 'fill:var(--accent)';
    return `<svg viewBox="0 0 100 60" width="92" height="55" aria-hidden="true">
      <defs><clipPath id="clip-${type}"><circle cx="38" cy="30" r="24"/></clipPath></defs>
      ${A ? `<circle cx="38" cy="30" r="24" style="${f};fill-opacity:.75"/>` : ''}${B ? `<circle cx="62" cy="30" r="24" style="${f};fill-opacity:.75"/>` : ''}
      <circle cx="62" cy="30" r="24" clip-path="url(#clip-${type})" style="${f};fill-opacity:${A || B ? .75 : .9}"/>
      <circle cx="38" cy="30" r="24" style="fill:none;stroke:var(--accent);stroke-width:2"/><circle cx="62" cy="30" r="24" style="fill:none;stroke:var(--accent);stroke-width:2"/>
      <text x="22" y="35" style="fill:var(--text);font:600 13px sans-serif">A</text><text x="70" y="35" style="fill:var(--text);font:600 13px sans-serif">B</text></svg>`;
  }
  function schemaCardsHTML(schema, info) {
    return `<div class="schema-grid">${schema.map(tb => `
      <div class="schema-card" data-table="${esc(tb.name)}">
        <h4>${esc(tb.name)} <small>${n(tb.count)} ${t('rows')}</small></h4>
        <p>${esc(pick((info || {})[tb.name]))}</p>
        <div class="cols">${tb.cols.map(c => `<span class="${c.pk ? 'pk' : ''}">${c.pk ? '🔑 ' : c.fk ? '🔗 ' : ''}${esc(c.name)}</span>`).join(', ')}</div>
      </div>`).join('')}</div><div class="schema-preview"></div>`;
  }
  // আর্টিকেলের উদাহরণ ব্লক সক্রিয় করা
  function enhanceArticle(art, seedKey) {
    const seed = seedOf(seedKey);
    $$('pre.ex', art).forEach(pre => {
      const sql = pre.textContent.trim();
      const wrap = document.createElement('div'); wrap.className = 'ex-wrap';
      pre.replaceWith(wrap); wrap.appendChild(pre); SB.highlight(pre);
      const actions = document.createElement('div'); actions.className = 'ex-actions';
      actions.innerHTML = `<button data-act="run">${t('run')}</button><button data-act="viz" title="${t('visualize')}">🔍</button><button data-act="explain" title="${t('explainBtn')}">🧠</button><button data-act="copy" title="${t('copyToEditor')}">⧉</button>`;
      wrap.appendChild(actions);
      const out = document.createElement('div'); out.className = 'result'; wrap.after(out);
      actions.addEventListener('click', e => {
        const act = e.target.dataset.act;
        if (act === 'run') out.innerHTML = SB.runInline(sql, seed);
        if (act === 'viz') SB.visualize(sql, SB.freshDb(seed));
        if (act === 'explain') SB.explainModal(sql, seedKey);
        if (act === 'copy') {
          if (SB.activeEditor && SB.activeEditor.getWrapperElement().isConnected) { SB.activeEditor.setValue(sql); SB.activeEditor.focus(); toast(t('copied')); }
          else if (navigator.clipboard) navigator.clipboard.writeText(sql).then(() => toast(t('clipboard')));
        }
      });
    });
    $$('pre.syntax', art).forEach(SB.highlight);
    $$('.venn', art).forEach(v => { const ty = ['left', 'right', 'full', 'inner'].find(c => v.classList.contains(c)); v.outerHTML = vennSVG(ty); });
    $$('.schema-auto', art).forEach(el => {
      const db = SB.freshDb(seed); el.innerHTML = schemaCardsHTML(SB.schemaOf(db), seedKey === 'job' ? window.JOB_TABLE_INFO : window.TABLE_INFO); db.close();
      el.addEventListener('click', e => { const card = e.target.closest('.schema-card'); if (card) $('.schema-preview', el).innerHTML = SB.runInline(`SELECT * FROM "${card.dataset.table}";`, seed); });
    });
  }

  // 🔊 পড়ে শোনানো (Web Speech API)
  function speak(btn, text) {
    const synth = window.speechSynthesis; if (!synth) return toast(t('noVoice'));
    if (synth.speaking) { synth.cancel(); btn.textContent = t('listen'); return; }
    const lang = I18N.lang === 'en' ? 'en' : 'bn';
    const voice = synth.getVoices().find(v => v.lang.toLowerCase().startsWith(lang));
    if (!voice && lang === 'bn') return toast(t('noVoice'));
    const u = new SpeechSynthesisUtterance(text.slice(0, 6000));
    u.lang = lang === 'en' ? 'en-US' : 'bn-BD'; if (voice) u.voice = voice; u.rate = lang === 'bn' ? 0.95 : 1;
    u.onend = () => { btn.textContent = t('listen'); };
    synth.speak(u); btn.textContent = t('stop');
  }

  function renderLesson(id) {
    const idx = LESSONS.findIndex(l => l.id === id);
    if (idx < 0) return renderLesson('intro');
    const l = LESSONS[idx], loc = L(l);
    currentLessonId = l.id;
    document.body.classList.remove('no-sidebar'); setActiveTop('learn');
    store.set('sqlbn-last', l.id);
    const prev = LESSONS[idx - 1], next = LESSONS[idx + 1];
    const sec = SECTIONS.find(s => s.id === l.section);
    $('#app').innerHTML = `
    <div class="lesson-page">
      <article class="article">
        <div class="crumb">${esc(sec ? sectionTitle(sec) : '')} · ${t('lesson')} ${n(idx)}</div>
        <h1>${esc(loc.title)}</h1>
        <p class="lead">${esc(loc.summary)}</p>
        <div class="article-tools">
          <button class="btn sm ghost" id="listenBtn">${t('listen')}</button>
          <button class="btn sm ghost" id="langInline">${I18N.lang === 'en' ? '🌐 বাংলায় পড়ো' : '🌐 Read in English'}</button>
          ${l.video ? `<button class="btn sm ghost" id="videoBtn">${t('video')}</button>` : ''}
        </div>
        ${l.video ? `<div class="video-box" hidden><iframe src="https://www.youtube-nocookie.com/embed/${esc(l.video)}" title="${esc(loc.title)}" allowfullscreen loading="lazy"></iframe></div>` : ''}
        <div class="lesson-content">${loc.content}</div>
        <section class="practice-set" id="practiceSet"></section>
        <div class="lesson-nav">
          ${prev ? `<a href="#/learn/${prev.id}"><small>${t('prevLesson')}</small>${esc(L(prev).title)}</a>` : '<span></span>'}
          ${next ? `<a class="next" href="#/learn/${next.id}"><small>${t('nextLesson')}</small>${esc(L(next).title)}</a>` : ''}
        </div>
      </article>
      <aside class="workspace" id="workspace"></aside>
    </div>`;
    const art = $('.article');
    enhanceArticle(art, 'main');
    $('#listenBtn').onclick = e => speak(e.target, loc.title + '. ' + plain($('.lesson-content').innerHTML.replace(/<pre[\s\S]*?<\/pre>/g, ' ')));
    $('#langInline').onclick = () => switchLang();
    if ($('#videoBtn')) $('#videoBtn').onclick = () => { const v = $('.video-box'); v.hidden = !v.hidden; };
    renderPracticeSet(l);
    renderWorkspace(l, store.get('sqlbn-tab-' + l.id, l.exercises.length ? 'ex' : 'quiz'));
  }

  function renderWorkspace(l, tab) {
    const ws = $('#workspace'), p = SB.lp(l.id);
    const exDone = Object.keys(p.ex).length, qDone = Object.keys(p.quiz).length;
    ws.innerHTML = `
      <div class="tabs">
        <button class="tab ${tab === 'ex' ? 'active' : ''}" data-tab="ex">${l.exercises.length ? t('exercises') : t('editor')}${l.exercises.length ? `<span class="badge">${n(exDone)}/${n(l.exercises.length)}</span>` : ''}</button>
        ${l.quiz.length ? `<button class="tab ${tab === 'quiz' ? 'active' : ''}" data-tab="quiz">${t('quiz')}<span class="badge">${n(qDone)}/${n(l.quiz.length)}</span></button>` : ''}
      </div>
      <div class="tab-body"></div>`;
    $$('.tab', ws).forEach(b => b.onclick = () => { store.set('sqlbn-tab-' + l.id, b.dataset.tab); renderWorkspace(l, b.dataset.tab); });
    const body = $('.tab-body', ws);
    if (tab === 'quiz' && l.quiz.length) renderQuiz(l, body);
    else if (l.exercises.length) renderExercise(l, body, firstUndone(l));
    else renderFreeEditor(l, body);
  }
  const firstUndone = l => { const p = SB.lp(l.id); const i = l.exercises.findIndex((_, k) => !p.ex[k]); return i < 0 ? 0 : i; };

  function renderExercise(l, body, i) {
    const ex = l.exercises[i], p = SB.lp(l.id), loc = L(l);
    body.innerHTML = `
      <div class="task-pills">${l.exercises.map((_, k) => `<button class="task-pill ${k === i ? 'active' : ''} ${p.ex[k] ? 'done' : ''}" data-i="${k}">${p.ex[k] ? '✓' : n(k + 1)}</button>`).join('')}</div>
      <div class="task-box"><div class="task-label">${t('exercise')} ${n(i + 1)} / ${n(l.exercises.length)}${p.ex[i] ? ' · ✓ ' + t('done') : ''}</div>${loc.task(i)}</div>
      <div class="pr-host"></div>`;
    $$('.task-pill', body).forEach(b => b.onclick = () => renderExercise(l, body, +b.dataset.i));
    practice($('.pr-host', body), {
      ex, seedKey: 'main', reviewKey: `ex:${l.id}:${i}`, draftKey: `sqlbn-draft-${l.id}-${i}`, tables: l.tables, tableInfo: window.TABLE_INFO,
      hints: [loc.hint(i)].filter(Boolean), where: 'lesson exercise', title: loc.title, task: loc.task(i),
      isSolved: () => !!p.ex[i],
      onSolved: () => { p.ex[i] = true; SB.save('ex'); const pill = $$('.task-pill', body)[i]; if (pill) { pill.classList.add('done'); pill.textContent = '✓'; } updateTabBadges(l); },
      nextHtml: () => {
        const nextI = l.exercises.findIndex((_, k) => !p.ex[k]);
        if (nextI >= 0) return `<button class="btn sm primary" data-go="${nextI}">${t('nextExercise')}</button>`;
        return `<span>${t('allDone')}</span>` + (l.quiz.length ? ` <button class="btn sm primary" data-go="quiz">${t('takeQuiz')}</button>` : '') + ($('#practiceSet') ? ` <button class="btn sm" data-go="practice">${t('psGoSet')}</button>` : '');
      }
    });
    body.onclick = e => {
      const b = e.target.closest('[data-go]'); if (!b) return;
      if (b.dataset.go === 'practice') { const ps = $('#practiceSet'); if (ps) ps.scrollIntoView({ behavior: 'smooth' }); }
      else if (b.dataset.go === 'quiz') { store.set('sqlbn-tab-' + l.id, 'quiz'); renderWorkspace(l, 'quiz'); }
      else renderExercise(l, body, +b.dataset.go);
    };
  }
  function updateTabBadges(l) {
    const p = SB.lp(l.id); const tabs = $$('#workspace .tab .badge');
    if (tabs[0] && l.exercises.length) tabs[0].textContent = `${n(Object.keys(p.ex).length)}/${n(l.exercises.length)}`;
    const qb = $('#workspace .tab[data-tab="quiz"] .badge'); if (qb) qb.textContent = `${n(Object.keys(p.quiz).length)}/${n(l.quiz.length)}`;
  }
  function renderFreeEditor(l, body) {
    body.innerHTML = `<p class="muted" style="margin:0 0 10px">${t('noExercises')}</p><div class="editor-wrap" id="freeEditor"></div>
      <div class="toolbar"><button class="btn primary" data-act="run">${t('run')}</button><button class="btn sm" data-act="viz">${t('visualize')}</button><button class="btn sm" data-act="tutor">${t('askTutor')}</button><span class="spacer"></span><span class="shortcut"><kbd>Ctrl</kbd>+<kbd>Enter</kbd></span></div>
      <div class="result" id="freeResult"></div>`;
    const run = () => { $('#freeResult', body).innerHTML = SB.runInline(cm.getValue()); };
    const cm = SB.makeEditor($('#freeEditor', body), 'SELECT * FROM students LIMIT 5;', run);
    SB.context = { where: 'lesson', title: L(l).title };
    body.onclick = e => { const a = e.target.closest('[data-act]'); if (!a) return; if (a.dataset.act === 'run') run(); if (a.dataset.act === 'viz') SB.visualize(cm.getValue()); if (a.dataset.act === 'tutor') SB.tutor.toggle(true); };
  }


  // ═══════════════ টপিকভিত্তিক অনুশীলন সেট ═══════════════
  const practiceKeys = id => { const ps = (window.PRACTICE || {})[id]; if (!ps) return []; return [...ps.extra.map((_, i) => `px:${id}:${i}`), ...ps.related].filter(k => SB.resolveItem(k)); };
  function psSolved(k) {
    const [ty, a] = k.split(':');
    if (ty === 'px') return !!state.practice[k];
    if (ty === 'job') return !!(state.jobprep[a] || {}).solved;
    if (ty === 'ch') return !!(state.challenges[a] || {}).solved;
    return false;
  }
  function psMark(k) {
    const [ty, a] = k.split(':');
    if (ty === 'px') state.practice[k] = true;
    if (ty === 'job') (state.jobprep[a] = state.jobprep[a] || {}).solved = true;
    if (ty === 'ch') (state.challenges[a] = state.challenges[a] || {}).solved = true;
    SB.save('practice');
  }
  function renderPracticeSet(l) {
    const host = $('#practiceSet'); if (!host) return;
    const keys = practiceKeys(l.id);
    if (!keys.length) { host.hidden = true; return; }
    const srcBadge = k => k.startsWith('px') ? `<span class="ps-src this">${t('psThis')}</span>` : k.startsWith('job') ? `<span class="ps-src job">💼 ${t('psJob')}</span>` : `<span class="ps-src ch">🏆 ${t('psCh')}</span>`;
    const drawHead = () => {
      const done = keys.filter(psSolved).length;
      $('.ps-progress', host).innerHTML = `<div class="pbar big"><span style="width:${done * 100 / keys.length}%"></span></div><span class="muted small">${n(done)}/${n(keys.length)} ${t('psSolved')}</span>${done === keys.length ? ` <b class="good">${t('psAllDone')}</b>` : ''}`;
    };
    host.innerHTML = `<h2>🎯 ${t('psTitle')}</h2><p class="muted">${t('psLead')}</p><div class="ps-progress"></div>
      <div class="ps-list">${keys.map((k, i) => { const it = SB.resolveItem(k); const d = psSolved(k); return `
        <div class="ps-card ${d ? 'solved' : ''}" data-k="${esc(k)}">
          <div class="ps-head"><span class="ps-num">${d ? '✓' : n(i + 1)}</span>
            <div class="ps-main"><div class="ps-meta">${srcBadge(k)}<span class="lvl ${it.level}">${t(it.level)}</span>${it.src && !k.startsWith('px') ? `<span class="src">${esc(it.src)}</span>` : ''}</div>
              <div class="ps-q">${it.q}</div></div>
            <button class="btn sm ${d ? '' : 'primary'}" data-open="${esc(k)}">${d ? t('psAgain') : t('psSolve')}</button></div>
          <div class="ps-work"></div></div>`; }).join('')}</div>`;
    drawHead();
    const open = k => {
      $$('.ps-card', host).forEach(c => { const w = $('.ps-work', c); if (c.dataset.k !== k && w.innerHTML) { w.innerHTML = ''; c.classList.remove('open'); $('[data-open]', c).textContent = psSolved(c.dataset.k) ? t('psAgain') : t('psSolve'); } });
      const card = $$('.ps-card', host).find(c => c.dataset.k === k); if (!card) return;
      const work = $('.ps-work', card), btn = $('.ps-head [data-open]', card);
      if (work.innerHTML) { work.innerHTML = ''; card.classList.remove('open'); btn.textContent = psSolved(k) ? t('psAgain') : t('psSolve'); return; }
      const it = SB.resolveItem(k);
      card.classList.add('open'); btn.textContent = t('psClose');
      SB.practice(work, {
        ex: it.ex, seedKey: it.seedKey, reviewKey: k, draftKey: 'sqlbn-psdraft-' + k, tables: it.tables, tableInfo: it.tableInfo,
        hints: it.hints || [], explain: it.explain, where: 'topic practice set', title: L(l).title, task: it.q,
        isSolved: () => psSolved(k),
        onSolved: () => { psMark(k); card.classList.add('solved'); $('.ps-num', card).textContent = '✓'; drawHead(); },
        nextHtml: () => { const nk = keys.find(x => !psSolved(x)); return nk ? `<button class="btn sm primary" data-open="${esc(nk)}">${t('psNext')}</button>` : `<b class="good">${t('psAllDone')}</b>`; }
      });
      card.scrollIntoView({ block: 'start', behavior: 'smooth' });
    };
    host.onclick = e => { const b = e.target.closest('[data-open]'); if (b) open(b.dataset.open); };
  }
  function renderPracticeHub() {
    document.body.classList.add('no-sidebar'); currentLessonId = null; setActiveTop('practice');
    SB.context = { where: 'practice hub' };
    const all = LESSONS.filter(l => practiceKeys(l.id).length);
    const tot = all.reduce((s, l) => s + practiceKeys(l.id).length, 0), done = all.reduce((s, l) => s + practiceKeys(l.id).filter(psSolved).length, 0);
    const en = I18N.lang === 'en';
    $('#app').innerHTML = `<div class="page"><h1>🎯 ${t('psHubTitle')}</h1><p class="lead">${t('psHubLead')}</p>
      <div class="hub-more">${[['#/debug', '🐞', en ? 'Find & fix the bug' : 'ভুল খুঁজে ঠিক করো', en ? 'Fix the classic mistakes' : 'পরীক্ষার পরিচিত ভুলগুলো ঠিক করো'], ['#/read', '👓', en ? 'Read the query' : 'কুয়েরি পড়ো', en ? 'Predict the result without running' : 'না চালিয়ে ফলাফল বলো'], ['#/cases', '💼', en ? 'Case studies' : 'কেস স্টাডি', en ? 'Real reports on real-looking data' : 'বাস্তবের মতো ডেটায় রিপোর্ট'], ['#/theory', '🏛️', en ? 'DBMS theory' : 'DBMS তত্ত্ব', en ? 'Theory + MCQ for exams' : 'পরীক্ষার তত্ত্ব + MCQ']].map(([h, i, a, b]) => `<a class="hub-more-card" href="${h}"><span>${i}</span><b>${a}</b><small>${b}</small></a>`).join('')}</div>
      <div class="pbar big"><span style="width:${tot ? done * 100 / tot : 0}%"></span></div><p class="muted">${n(done)}/${n(tot)} ${t('psSolved')}</p>
      ${SECTIONS.map(sec => { const ls = all.filter(l => l.section === sec.id); if (!ls.length) return ''; return `<h2>${sectionTitle(sec)}</h2><div class="ps-hub">${ls.map(l => {
        const ks = practiceKeys(l.id), d = ks.filter(psSolved).length, lessonDone = SB.lessonStatus(l) === 'done';
        return `<a class="ps-hub-card ${d === ks.length ? 'solved' : ''}" href="#/learn/${l.id}/practice">
          <div class="ps-hub-top"><b>${esc(L(l).title)}</b>${d === ks.length ? '<span class="ok">✓</span>' : ''}</div>
          <div class="pbar"><span style="width:${d * 100 / ks.length}%"></span></div>
          <div class="ps-hub-bot"><span class="muted small">${n(d)}/${n(ks.length)} ${t('psSolved')}${lessonDone ? ' · 📘 ✓' : ''}</span><span class="small">${d ? t('psContinue') : t('psStart')}</span></div></a>`;
      }).join('')}</div>`; }).join('')}</div>`;
  }

  // ═══════════════ কুইজ ═══════════════
  function mcqHTML(q, chosen, key, opts) {
    const done = chosen !== undefined;
    return `<div class="quiz-q" data-q="${key}">
      <h4>${opts.num ? opts.num + '. ' : ''}${opts.rawHtml ? pick(q.q) : esc(pick(q.q))}</h4>
      <div class="quiz-opts">${q.options.map((o, k) => {
        const cls = done && k === q.answer ? 'correct' : done && k === chosen ? 'wrong' : '';
        return `<button class="quiz-opt ${cls}" data-k="${k}" ${done ? 'disabled' : ''}>${(I18N.lang === 'en' ? 'abcd' : 'কখগঘ')[k]}) ${esc(pick(o))}</button>`;
      }).join('')}</div>
      <div class="quiz-explain ${done ? 'show' : ''}">${done ? (chosen === q.answer ? '✅ ' : '❌ ') : ''}${opts.rawHtml ? pick(q.explain) : esc(pick(q.explain))}</div>
    </div>`;
  }
  function renderQuiz(l, body) {
    const p = SB.lp(l.id), loc = L(l);
    const answered = Object.keys(p.quiz).length;
    const correct = l.quiz.filter((q, i) => p.quiz[i] === q.answer).length;
    SB.context = { where: 'lesson quiz', title: loc.title };
    body.innerHTML = `${answered === l.quiz.length ? `<div class="quiz-score">${t('score')}: ${n(correct)} / ${n(l.quiz.length)} ${correct === l.quiz.length ? t('excellent') : '👍'}
        <div style="margin-top:6px"><button class="btn sm" data-act="retry">${t('retry')}</button></div></div><br>` : ''}
      ${l.quiz.map((_, i) => mcqHTML(loc.quiz(i), p.quiz[i], i, { num: n(i + 1) })).join('')}`;
    body.onclick = e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.act === 'retry') { p.quiz = {}; SB.save('quiz'); return renderWorkspace(l, 'quiz'); }
      const qEl = b.closest('.quiz-q'); if (!qEl || b.disabled || b.dataset.k === undefined) return;
      const i = +qEl.dataset.q; p.quiz[i] = +b.dataset.k; SB.recordActivity(); SB.review.record(`quiz:${l.id}:${i}`, p.quiz[i] === l.quiz[i].answer); SB.save('quiz');
      renderWorkspace(l, 'quiz');
      const again = $(`#workspace .quiz-q[data-q="${i}"]`); if (again) again.scrollIntoView({ block: 'nearest' });
    };
  }

  // ═══════════════ চ্যালেঞ্জ ═══════════════
  const LEVEL_ORDER = { easy: 0, medium: 1, hard: 2 };
  function levelTag(lv) { return `<span class="lvl ${lv}">${t(lv)}</span>`; }
  function renderChallenges(id) {
    document.body.classList.add('no-sidebar'); currentLessonId = null; setActiveTop('challenges');
    if (id) return renderChallenge(id);
    SB.context = { where: 'challenges list' };
    const filter = store.get('sqlbn-chfilter', 'all');
    const topicOf = c => c.lesson || (Object.entries(window.PRACTICE || {}).find(([, ps]) => ps.related.includes('ch:' + c.id)) || [])[0] || '';
    const topics = [...new Set(CHALLENGES.map(topicOf).filter(Boolean))].map(id => LESSONS.find(l => l.id === id)).filter(Boolean).sort((a, b) => LESSONS.indexOf(a) - LESSONS.indexOf(b));
    const list = [...CHALLENGES].sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]).filter(c => filter === 'all' || c.level === filter || (filter === 'unsolved' && !(state.challenges[c.id] || {}).solved));
    const solved = CHALLENGES.filter(c => (state.challenges[c.id] || {}).solved).length;
    $('#app').innerHTML = `<div class="page"><h1>🏆 ${t('chTitle')}</h1><p class="lead">${t('chLead')}</p>
      <div class="pbar big"><span style="width:${solved * 100 / CHALLENGES.length}%"></span></div><p class="muted">${n(solved)}/${n(CHALLENGES.length)} ${t('solved')}</p>
      <div class="filter-row">${['all', 'easy', 'medium', 'hard', 'unsolved'].map(f => `<button class="chip ${f === filter ? 'on' : ''}" data-f="${f}">${t(f)}</button>`).join('')}
        <span class="spacer"></span>
        <select id="chTopic"><option value="">${I18N.lang === 'en' ? 'All topics' : 'সব টপিক'}</option>${topics.map(l => `<option value="${l.id}">${esc(L(l).title)}</option>`).join('')}</select>
        <input type="search" id="chSearch" class="ch-search" placeholder="${I18N.lang === 'en' ? 'Search… (e.g. salary, JOIN)' : 'খুঁজুন… (যেমন salary, JOIN)'}"></div>
      <p class="muted small" id="chCount"></p>
      <div class="ch-grid">${list.map(c => `<a class="ch-card ${(state.challenges[c.id] || {}).solved ? 'solved' : ''}" data-topic="${topicOf(c)}" data-s="${esc((c.title.bn + ' ' + c.title.en + ' ' + c.tags.join(' ') + ' ' + plain(c.task.en)).toLowerCase())}" href="#/challenges/${c.id}">
        <div class="ch-top">${levelTag(c.level)}${(state.challenges[c.id] || {}).solved ? '<span class="ok">✓</span>' : ''}</div>
        <h3>${esc(pick(c.title))}</h3><p>${plain(pick(c.task)).slice(0, 110)}…</p>
        <div class="tags">${c.tags.map(x => `<span>${esc(x)}</span>`).join('')}</div></a>`).join('')}</div></div>`;
    $('#app').onclick = e => { const b = e.target.closest('[data-f]'); if (b) { store.set('sqlbn-chfilter', b.dataset.f); renderChallenges(); } };
    const applyFilter = () => {
      const q = $('#chSearch').value.trim().toLowerCase(), tp = $('#chTopic').value;
      let shown = 0;
      $$('.ch-card').forEach(c => { const ok = (!q || c.dataset.s.includes(q)) && (!tp || c.dataset.topic === tp); c.hidden = !ok; if (ok) shown++; });
      $('#chCount').textContent = `${n(shown)} ${I18N.lang === 'en' ? 'challenges shown' : 'টি চ্যালেঞ্জ দেখানো হচ্ছে'}`;
      store.set('sqlbn-chsearch', { q: $('#chSearch').value, tp });
    };
    const saved = store.get('sqlbn-chsearch', { q: '', tp: '' });
    $('#chSearch').value = saved.q || ''; $('#chTopic').value = saved.tp || '';
    $('#chSearch').oninput = applyFilter; $('#chTopic').onchange = applyFilter; applyFilter();
  }
  function renderChallenge(id) {
    const sorted = [...CHALLENGES].sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);
    const idx = sorted.findIndex(c => c.id === id); if (idx < 0) return renderChallenges();
    const c = sorted[idx], next = sorted[idx + 1];
    const cs = state.challenges[c.id] = state.challenges[c.id] || {};
    $('#app').innerHTML = `<div class="page narrow">
      <a href="#/challenges" class="back">${t('backToList')}</a>
      <div class="ch-head">${levelTag(c.level)}<div class="tags">${c.tags.map(x => `<span>${esc(x)}</span>`).join('')}</div>${cs.solved ? `<span class="ok">✓ ${t('solved')}</span>` : ''}</div>
      <h1>${esc(pick(c.title))}</h1>
      <div class="task-box big">${pick(c.task)}</div>
      <div class="pr-host"></div>
      ${next ? `<div class="lesson-nav"><span></span><a class="next" href="#/challenges/${next.id}"><small>${t('nextChallenge')}</small>${esc(pick(next.title))}</a></div>` : ''}
    </div>`;
    practice($('.pr-host'), {
      ex: c, seedKey: 'main', reviewKey: 'ch:' + c.id, draftKey: 'sqlbn-chdraft-' + c.id, tables: c.tables, tableInfo: window.TABLE_INFO,
      hints: c.hints.map(h => pick(h)), explain: c.explain, where: 'interview challenge', title: pick(c.title), task: pick(c.task),
      isSolved: () => !!cs.solved, onSolved: () => { cs.solved = true; SB.save('challenge'); },
      nextHtml: () => next ? `<a class="btn sm primary" href="#/challenges/${next.id}">${t('nextChallenge')}</a>` : ''
    });
  }

  // ═══════════════ চাকরি প্রস্তুতি ═══════════════
  function renderJobPrep(id) {
    document.body.classList.add('no-sidebar'); currentLessonId = null; setActiveTop('jobprep');
    if (id) return renderJobQuestion(id);
    SB.context = { where: 'job prep list', seed: 'job' };
    const cat = store.get('sqlbn-jpcat', 'all'), type = store.get('sqlbn-jptype', 'all');
    const qs = JOB_QUESTIONS.filter(q => (cat === 'all' || q.cat === cat) && (type === 'all' || q.type === type));
    const count = c => JOB_QUESTIONS.filter(q => q.cat === c).length;
    const solvedIn = c => JOB_QUESTIONS.filter(q => q.cat === c && (state.jobprep[q.id] || {}).solved).length;
    const typeIcon = { sql: '⌨️', mcq: '☑️', viva: '🗣️' };
    $('#app').innerHTML = `<div class="page">
      <h1>💼 ${t('jpTitle')}</h1><p class="lead">${t('jpLead')}</p>
      <p class="muted small">${t('jpNote')}</p>
      <div class="jp-cats">
        <button class="jp-cat ${cat === 'all' ? 'on' : ''}" data-c="all"><span>📚</span><b>${t('all')}</b><small>${n(JOB_QUESTIONS.length)} ${t('questions')}</small></button>
        ${JOB_CATS.map(c => `<button class="jp-cat ${cat === c.id ? 'on' : ''} ${c.id === 'lecturer' ? 'lect' : ''}" data-c="${c.id}"><span>${c.icon}</span><b>${esc(pick(c))}</b><small>${n(solvedIn(c.id))}/${n(count(c.id))}</small></button>`).join('')}
      </div>
      ${cat === 'lecturer' ? `<div class="callout info"><b>🎓 ${t('lecturerTitle')}:</b> ${t('lecturerLead')}</div>` : ''}
      <div class="filter-row">${['all', 'sql', 'mcq', 'viva'].map(x => `<button class="chip ${x === type ? 'on' : ''}" data-t="${x}">${x === 'all' ? t('allTypes') : typeIcon[x] + ' ' + t(x === 'sql' ? 'typeSql' : x === 'mcq' ? 'typeMcq' : 'typeViva')}</button>`).join('')}
        <span class="spacer"></span><a class="chip" href="#/database?db=job">🗄 ${t('practiceDb')}</a></div>
      <div class="jp-list">${qs.map((q, i) => {
        const s = state.jobprep[q.id] || {};
        const done = s.solved || s.choice !== undefined;
        return `<a class="jp-item ${s.solved ? 'solved' : ''}" href="#/jobprep/${q.id}">
          <span class="jp-type">${typeIcon[q.type]}</span>
          <div class="jp-body"><div class="jp-q" lang="en">${plain(q.q.en).slice(0, 170)}${plain(q.q.en).length > 170 ? '…' : ''}</div>
          <div class="jp-meta">${levelTag(q.level)}<span class="src">${esc(q.src)}</span></div></div>
          <span class="jp-state">${s.solved ? '✓' : done ? '•' : ''}</span></a>`;
      }).join('') || `<p class="muted">${t('nothingFound')}</p>`}</div></div>`;
    $('#app').onclick = e => {
      const c = e.target.closest('[data-c]'); if (c) { store.set('sqlbn-jpcat', c.dataset.c); return renderJobPrep(); }
      const ty = e.target.closest('[data-t]'); if (ty) { store.set('sqlbn-jptype', ty.dataset.t); return renderJobPrep(); }
    };
  }
  function renderJobQuestion(id) {
    const cat = store.get('sqlbn-jpcat', 'all'), type = store.get('sqlbn-jptype', 'all');
    const list = JOB_QUESTIONS.filter(q => (cat === 'all' || q.cat === cat) && (type === 'all' || q.type === type));
    let idx = list.findIndex(q => q.id === id);
    const q = JOB_QUESTIONS.find(x => x.id === id); if (!q) return renderJobPrep();
    const next = idx >= 0 ? list[idx + 1] : null, prev = idx > 0 ? list[idx - 1] : null;
    const s = state.jobprep[q.id] = state.jobprep[q.id] || {};
    const catObj = JOB_CATS.find(c => c.id === q.cat);
    SB.context = { where: 'job prep question', title: q.q.en, task: q.q.en, seed: 'job' };
    $('#app').innerHTML = `<div class="page narrow">
      <a href="#/jobprep" class="back">← ${t('jobprep')}</a>
      <div class="ch-head">${levelTag(q.level)}<span class="tags"><span>${catObj.icon} ${esc(pick(catObj))}</span></span><span class="src">${esc(q.src)}</span>${s.solved ? `<span class="ok">✓</span>` : ''}</div>
      <div class="task-box big exam-q">${jobQuestionHTML(q)}</div>
      <div class="jp-work"></div>
      <div class="lesson-nav">${prev ? `<a href="#/jobprep/${prev.id}"><small>←</small>${plain(prev.q.en).slice(0, 60)}…</a>` : '<span></span>'}${next ? `<a class="next" href="#/jobprep/${next.id}"><small>→</small>${plain(next.q.en).slice(0, 60)}…</a>` : ''}</div>
    </div>`;
    const work = $('.jp-work');
    const nextBtn = () => next ? `<a class="btn sm primary" href="#/jobprep/${next.id}">${t('next')}</a>` : '';
    if (q.type === 'sql') {
      practice(work, {
        ex: q, seedKey: 'job', reviewKey: 'job:' + q.id, draftKey: 'sqlbn-jpdraft-' + q.id, tables: Object.keys(window.JOB_TABLE_INFO).filter(x => x !== 't' || /\bt\b/.test(q.solution)), tableInfo: window.JOB_TABLE_INFO,
        hints: (q.hints || []).map(h => pick(h)), explain: q.explain, where: 'job prep (BD govt/bank IT exam)', title: plain(q.q.en), task: q.q.en,
        isSolved: () => !!s.solved, onSolved: () => { s.solved = true; SB.save('jobprep'); }, nextHtml: nextBtn
      });
    } else if (q.type === 'mcq') {
      const draw = () => {
        work.innerHTML = mcqHTML(q, s.choice, q.id, { rawHtml: true }) + (s.choice !== undefined ? `<div class="toolbar">${nextBtn()}</div>` : '') +
          (q.tryIt ? `<details class="tryit"><summary>${t('tryIt')}</summary><div class="editor-wrap" id="tryEd"></div><div class="toolbar"><button class="btn sm primary" id="tryRun">${t('run')}</button></div><div class="result" id="tryOut"></div></details>` : '');
        if (q.tryIt) {
          $('.tryit', work).addEventListener('toggle', function () {
            if (!this.open || $('#tryEd').childElementCount) return;
            const run = () => { $('#tryOut').innerHTML = SB.runInline(cm.getValue(), window.JOB_SEED_SQL); };
            const cm = SB.makeEditor($('#tryEd'), q.tryIt, run); $('#tryRun').onclick = run;
          });
        }
      };
      draw();
      work.onclick = e => {
        const b = e.target.closest('.quiz-opt'); if (!b || b.disabled) return;
        s.choice = +b.dataset.k; if (s.choice === q.answer) s.solved = true;
        SB.review.record('job:' + q.id, s.choice === q.answer);
        SB.recordActivity(); SB.save('jobprep'); draw();
      };
    } else {
      work.innerHTML = `<div class="toolbar"><button class="btn primary" id="showAns">${t('showAnswer')}</button>
        <button class="btn sm ${s.solved ? 'on' : ''}" id="knowIt">${s.solved ? '✓ ' + t('known') : t('markKnown')}</button>
        <button class="btn sm" id="addRv">🔁 ${I18N.lang === 'en' ? 'Add to review' : 'রিভিউতে রাখো'}</button>
        <button class="btn sm" id="askT">${t('askTutor')}</button></div>
        <div class="explain-box viva" hidden>${pick(q.explain)}</div>`;
      $('#showAns').onclick = () => { const b = $('.explain-box', work); b.hidden = !b.hidden; $('#showAns').textContent = b.hidden ? t('showAnswer') : t('hideAnswer'); SB.$$('pre', b).forEach(SB.highlight); };
      $('#knowIt').onclick = () => { s.solved = !s.solved; if (s.solved) SB.recordActivity(); SB.save('jobprep'); renderJobQuestion(id); };
      $('#askT').onclick = () => SB.tutor.toggle(true);
      $('#addRv').onclick = () => { SB.review.record('job:' + q.id, false); toast(I18N.lang === 'en' ? 'Added to your review list' : 'রিভিউ তালিকায় যোগ হয়েছে'); };
    }
  }

  // ═══════════════ প্লেগ্রাউন্ড ═══════════════
  const SAMPLES = [
    [{ bn: 'সব ছাত্র', en: 'All students' }, 'SELECT * FROM students;'],
    [{ bn: 'বিভাগভিত্তিক গড় CGPA', en: 'Avg CGPA by dept' }, 'SELECT d.name, COUNT(*) AS students, ROUND(AVG(s.cgpa), 2) AS avg_cgpa\nFROM students s\nJOIN departments d ON s.dept_id = d.id\nGROUP BY d.name\nORDER BY avg_cgpa DESC;'],
    [{ bn: 'সেরা বিক্রিত পণ্য', en: 'Best sellers' }, "SELECT p.name, SUM(o.quantity) AS sold, SUM(o.quantity * p.price) AS revenue\nFROM orders o\nJOIN products p ON p.id = o.product_id\nWHERE o.status != 'Cancelled'\nGROUP BY p.name\nORDER BY revenue DESC;"],
    [{ bn: 'মাসিক অর্ডার', en: 'Monthly orders' }, "SELECT STRFTIME('%Y-%m', order_date) AS month, COUNT(*) AS orders\nFROM orders\nGROUP BY month;"],
    [{ bn: 'বিভাগে র‍্যাংক', en: 'Rank in dept' }, 'SELECT name, dept_id, cgpa,\n  RANK() OVER (PARTITION BY dept_id ORDER BY cgpa DESC) AS rnk\nFROM students;'],
    [{ bn: 'নতুন টেবিল', en: 'New table' }, "CREATE TABLE notes (id INTEGER PRIMARY KEY, text TEXT);\nINSERT INTO notes (text) VALUES ('first note');\nSELECT * FROM notes;"]
  ];
  function loadPgDb() {
    if (SB.pgDb) return SB.pgDb;
    const saved = store.get('sqlbn-pgdb', null);
    if (saved) { try { const bin = Uint8Array.from(atob(saved), ch => ch.charCodeAt(0)); SB.pgDb = new SB.SQL.Database(bin); return SB.pgDb; } catch (e) { } }
    SB.pgDb = SB.freshDb(seedOf(store.get('sqlbn-pgseed', 'main')));
    return SB.pgDb;
  }
  function savePgDb() {
    try {
      const bin = SB.pgDb.export(); if (bin.length > 2.5e6) return;
      let s = ''; for (let i = 0; i < bin.length; i += 0x8000) s += String.fromCharCode.apply(null, bin.subarray(i, i + 0x8000));
      store.set('sqlbn-pgdb', btoa(s));
    } catch (e) { }
  }
  SB.savePgDb = savePgDb; SB.loadPgDb = loadPgDb;
  function resetPgDb(seedKey) { if (SB.pgDb) SB.pgDb.close(); store.set('sqlbn-pgseed', seedKey); SB.pgDb = SB.freshDb(seedOf(seedKey)); savePgDb(); }
  SB.resetPgDb = resetPgDb;

  function renderPlayground() {
    document.body.classList.add('no-sidebar'); currentLessonId = null; setActiveTop('playground');
    const db = loadPgDb();
    SB.context = { where: 'playground', seed: store.get('sqlbn-pgseed', 'main') };
    $('#app').innerHTML = `
      <div class="playground">
        <aside class="pg-side"><h3>${t('tables')}</h3><div id="pgSchema"></div><p class="muted small">${t('pgSideHelp')}</p></aside>
        <section class="pg-main">
          <h1>${t('pgTitle')}</h1>
          <p class="lead">${t('pgLead')}</p>
          <div class="samples">${SAMPLES.map((s, i) => `<button class="chip" data-sample="${i}">${esc(pick(s[0]))}</button>`).join('')}</div>
          <div class="editor-wrap" id="pgEditor"></div>
          <div class="toolbar">
            <button class="btn primary" data-act="run">${t('run')}</button>
            <button class="btn sm" data-act="viz">${t('visualize')}</button>
            <button class="btn sm" data-act="explain">${t('explainBtn')}</button>
            <button class="btn sm" data-act="dialect">${t('dialect')}</button>
            <button class="btn sm" data-act="tutor">${t('askTutor')}</button>
            <button class="btn sm" data-act="csv">${t('csv')}</button>
            <span class="spacer"></span>
            <label class="small">${t('dbLabel')} <select id="pgSeed"><option value="main">${t('mainDb')}</option><option value="job">${t('jobDb')}</option></select></label>
            <button class="btn sm" data-act="reset">${t('resetDb')}</button>
          </div>
          <div class="status" id="pgStatus"></div>
          <div id="pgResult"></div>
          <div class="history"><h3>${t('recent')}</h3><div id="pgHistory"></div></div>
        </section>
      </div>`;
    $('#pgSeed').value = store.get('sqlbn-pgseed', 'main');
    let lastResult = null, cm = null;
    const status = $('#pgStatus'), out = $('#pgResult');
    const setStatus = (cls, html) => { status.className = 'status show ' + cls; status.innerHTML = html; };
    const drawSchema = () => {
      const schema = SB.schemaOf(SB.pgDb);
      $('#pgSchema').innerHTML = schema.map((tb, i) => `<details class="pg-table" ${i === 0 ? 'open' : ''}>
        <summary data-t="${esc(tb.name)}">${esc(tb.name)} <small>${tb.type === 'view' ? 'view' : n(tb.count) + ' ' + t('rows')}</small></summary>
        <ul>${tb.cols.map(c => `<li data-c="${esc(c.name)}"><span>${c.pk ? '🔑 ' : c.fk ? '🔗 ' : ''}${esc(c.name)}</span><span class="t">${esc(c.type.toLowerCase())}</span></li>`).join('')}</ul></details>`).join('');
      if (cm) cm.setOption('hintOptions', { tables: SB.hintTables(schema), completeSingle: false });
    };
    const history = store.get('sqlbn-history', []);
    const drawHistory = () => {
      $('#pgHistory').innerHTML = history.length ? history.map((h, i) => `<div class="history-item" data-h="${i}" title="${esc(h)}">${esc(h.replace(/\s+/g, ' '))}</div>`).join('') : `<p class="muted small">${t('noHistory')}</p>`;
    };
    const run = () => {
      const sql = cm.somethingSelected() ? cm.getSelection() : cm.getValue();
      store.set('sqlbn-pg-draft', cm.getValue());
      if (!sql.trim()) return;
      const t0 = performance.now();
      try {
        const res = SB.pgDb.exec(sql);
        const ms = Math.max(1, Math.round(performance.now() - t0)), changes = SB.pgDb.getRowsModified();
        lastResult = res.length ? res[res.length - 1] : null;
        out.innerHTML = res.map((r, i) => SB.tableHTML(r, res.length > 1 ? `${t('result')} ${n(i + 1)}` : t('result'))).join('<br>');
        setStatus('ok', `${t('ranOk')} (${n(ms)} ms) ${!res.length && changes ? t('rowsAffected', { n: n(changes) }) : ''}`);
        SB.context.lastError = null;
        const k = history.indexOf(sql.trim()); if (k >= 0) history.splice(k, 1);
        history.unshift(sql.trim()); history.length = Math.min(history.length, 15);
        store.set('sqlbn-history', history); drawHistory(); drawSchema(); savePgDb();
        SB.recordActivity(); SB.save('pg');
      } catch (e) { setStatus('err', SB.errorHTML(e.message)); out.innerHTML = ''; SB.context.lastError = e.message; }
    };
    cm = SB.makeEditor($('#pgEditor'), store.get('sqlbn-pg-draft', 'SELECT * FROM students;'), run, SB.schemaOf(db));
    drawSchema(); drawHistory();
    $('#pgSeed').onchange = e => { if (confirm(t('resetConfirm'))) { resetPgDb(e.target.value); SB.context.seed = e.target.value; drawSchema(); out.innerHTML = ''; setStatus('info', t('resetDone')); } else e.target.value = store.get('sqlbn-pgseed', 'main'); };
    $('#app').onclick = e => {
      const s = e.target.closest('[data-sample]'); if (s) { cm.setValue(SAMPLES[+s.dataset.sample][1]); run(); return; }
      const h = e.target.closest('[data-h]'); if (h) { cm.setValue(history[+h.dataset.h]); cm.focus(); return; }
      const c = e.target.closest('[data-c]'); if (c) { cm.replaceSelection(c.dataset.c); cm.focus(); return; }
      const b = e.target.closest('button'); if (!b) return;
      const a = b.dataset.act;
      if (a === 'run') run();
      if (a === 'viz') SB.visualize(cm.somethingSelected() ? cm.getSelection() : cm.getValue(), SB.pgDb);
      if (a === 'explain') SB.explainModal(cm.somethingSelected() ? cm.getSelection() : cm.getValue());
      if (a === 'dialect') SB.showDialects(cm.somethingSelected() ? cm.getSelection() : cm.getValue());
      if (a === 'tutor') SB.tutor.toggle(true);
      if (a === 'reset' && confirm(t('resetConfirm'))) { resetPgDb($('#pgSeed').value); drawSchema(); out.innerHTML = ''; setStatus('info', t('resetDone')); }
      if (a === 'csv') {
        if (!lastResult) return toast(t('runSelectFirst'));
        const q = v => v === null ? '' : /[",\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : String(v);
        SB.download('result.csv', '﻿' + [lastResult.columns, ...lastResult.values].map(r => r.map(q).join(',')).join('\n'), 'text/csv;charset=utf-8');
      }
    };
    $('#app').ondblclick = e => { const s = e.target.closest('summary[data-t]'); if (s) { cm.setValue(`SELECT * FROM "${s.dataset.t}";`); run(); } };
  }

  // ═══════════════ ভিজুয়ালাইজার পেজ ═══════════════
  const VIZ_SAMPLES = [
    'SELECT name, cgpa FROM students WHERE cgpa > 3.5 ORDER BY cgpa DESC LIMIT 3;',
    'SELECT city, COUNT(*) AS cnt FROM students GROUP BY city HAVING COUNT(*) >= 2 ORDER BY cnt DESC;',
    'SELECT d.name, COUNT(s.id) AS students FROM departments d LEFT JOIN students s ON s.dept_id = d.id GROUP BY d.name;',
    'SELECT DISTINCT city FROM students WHERE admission_year = 2021;',
    'SELECT division, SUM(population) AS total FROM cities GROUP BY division HAVING SUM(population) > 5000000 ORDER BY total DESC;'
  ];
  function renderVisualize() {
    document.body.classList.add('no-sidebar'); currentLessonId = null; setActiveTop('visualize');
    SB.context = { where: 'visualizer' };
    $('#app').innerHTML = `<div class="page"><h1>🔍 ${t('vizTitle')}</h1><p class="lead">${t('vizLead')}</p>
      <div class="samples"><span class="muted small">${t('samples')}</span> ${VIZ_SAMPLES.map((s, i) => `<button class="chip mono" data-v="${i}">${esc(s.slice(0, 48))}…</button>`).join('')}</div>
      <div class="editor-wrap" id="vizEd"></div>
      <div class="toolbar"><button class="btn primary" id="vizGo">${t('vizRun')}</button><span class="spacer"></span><label class="small">${t('dbLabel')} <select id="vizDb"><option value="main">${t('mainDb')}</option><option value="job">${t('jobDb')}</option></select></label></div>
      <div class="viz" id="vizOut"></div></div>`;
    const go = () => SB.renderViz($('#vizOut'), cm.getValue(), SB.freshDb(seedOf($('#vizDb').value)));
    const cm = SB.makeEditor($('#vizEd'), store.get('sqlbn-viz-draft', VIZ_SAMPLES[1]), go);
    cm.on('change', () => store.set('sqlbn-viz-draft', cm.getValue()));
    $('#vizGo').onclick = go;
    $('#app').onclick = e => { const b = e.target.closest('[data-v]'); if (b) { cm.setValue(VIZ_SAMPLES[+b.dataset.v]); go(); } };
    go();
  }

  // ═══════════════ কুয়েরি ব্যাখ্যাকারী ═══════════════
  const XP_SAMPLES = [
    [{ bn: 'JOIN + GROUP BY', en: 'JOIN + GROUP BY' }, "SELECT d.name AS department, COUNT(s.id) AS students, ROUND(AVG(s.cgpa), 2) AS avg_cgpa\nFROM departments d\nLEFT JOIN students s ON s.dept_id = d.id\nGROUP BY d.name\nHAVING COUNT(s.id) >= 2\nORDER BY avg_cgpa DESC;"],
    [{ bn: 'দ্বিতীয় সর্বোচ্চ বেতন', en: '2nd highest salary' }, "SELECT DISTINCT salary\nFROM emp\nORDER BY salary DESC\nLIMIT 1 OFFSET 1;"],
    [{ bn: 'Correlated সাবকুয়েরি', en: 'Correlated subquery' }, "SELECT e.name, e.salary\nFROM emp e\nWHERE e.salary > (SELECT AVG(salary) FROM emp WHERE dept_id = e.dept_id);"],
    [{ bn: 'Self JOIN', en: 'Self JOIN' }, "SELECT e.name AS employee, m.name AS manager\nFROM emp e\nLEFT JOIN emp m ON e.manager_id = m.id;"],
    [{ bn: 'উইন্ডো ফাংশন', en: 'Window functions' }, "SELECT name, dept_id, salary,\n       DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rnk,\n       SUM(salary) OVER (PARTITION BY dept_id) AS dept_total\nFROM emp;"],
    [{ bn: 'রিকার্সিভ CTE', en: 'Recursive CTE' }, "WITH RECURSIVE nums(n) AS (\n  SELECT 1\n  UNION ALL\n  SELECT n + 1 FROM nums WHERE n < 10\n)\nSELECT n FROM nums;"],
    [{ bn: 'ডুপ্লিকেট খোঁজা/মোছা', en: 'Find/delete duplicates' }, "SELECT email, COUNT(*) AS times\nFROM newsletter\nGROUP BY email\nHAVING COUNT(*) > 1;\n\nDELETE FROM newsletter\nWHERE id NOT IN (SELECT MIN(id) FROM newsletter GROUP BY email);"],
    [{ bn: 'CREATE TABLE (PK/FK)', en: 'CREATE TABLE (PK/FK)' }, "CREATE TABLE result (\n  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,\n  course_id  INTEGER NOT NULL,\n  marks      DECIMAL(5,2) CHECK (marks BETWEEN 0 AND 100),\n  grade      CHAR(2) DEFAULT 'F',\n  PRIMARY KEY (student_id, course_id),\n  FOREIGN KEY (course_id) REFERENCES courses(id)\n);"],
    [{ bn: 'UPDATE ও ট্রানজ্যাকশন', en: 'UPDATE + transaction' }, "BEGIN;\nUPDATE accounts SET balance = balance - 500 WHERE id = 1;\nUPDATE accounts SET balance = balance + 500 WHERE id = 2;\nCOMMIT;"],
    [{ bn: 'UPSERT', en: 'UPSERT' }, "INSERT INTO products (id, name, price, stock)\nVALUES (1, 'Pen', 15, 100)\nON CONFLICT(id) DO UPDATE SET price = excluded.price, stock = stock + excluded.stock;"],
    [{ bn: 'ট্রিগার', en: 'Trigger' }, "CREATE TRIGGER no_negative_stock\nBEFORE UPDATE OF stock ON products\nWHEN NEW.stock < 0\nBEGIN\n  SELECT RAISE(ABORT, 'Stock cannot be negative');\nEND;"],
    [{ bn: 'MySQL/Oracle কুয়েরি', en: 'MySQL/Oracle query' }, "SELECT CONCAT(name, ' (', dept_id, ')') AS label, NVL(commission, 0) AS comm,\n       YEAR(hire_date) AS joined\nFROM emp\nWHERE hire_date >= DATE_SUB(CURDATE(), INTERVAL 5 YEAR)\nORDER BY joined DESC\nLIMIT 5;"]
  ];
  function renderExplainPage() {
    document.body.classList.add('no-sidebar'); currentLessonId = null; setActiveTop('explain');
    SB.context = { where: 'query explainer' };
    const en = I18N.lang === 'en';
    $('#app').innerHTML = `<div class="page xp-page"><h1>🧠 ${en ? 'Query Explainer' : 'কুয়েরি ব্যাখ্যাকারী'}</h1>
      <p class="lead">${en ? 'Type or paste <b>any</b> SQL — SELECT, JOIN, subqueries, CTE, window functions, INSERT/UPDATE/DELETE, CREATE TABLE, triggers, transactions — even MySQL, Oracle or SQL Server syntax. Every part is explained in plain words, in the order the database actually runs it, with warnings about common mistakes.' : '<b>যেকোনো</b> SQL লেখো বা পেস্ট করো — SELECT, JOIN, সাবকুয়েরি, CTE, উইন্ডো ফাংশন, INSERT/UPDATE/DELETE, CREATE TABLE, ট্রিগার, ট্রানজ্যাকশন — এমনকি MySQL, Oracle বা SQL Server-এর কুয়েরিও। প্রতিটি অংশ সহজ ভাষায়, ডেটাবেস আসলে যে ক্রমে চালায় সেই ক্রমে বোঝানো হবে, সাথে সাধারণ ভুলের সতর্কতা।'}</p>
      <div class="samples"><span class="muted small">${t('samples')}</span> ${XP_SAMPLES.map((s, i) => `<button class="chip" data-x="${i}">${esc(pick(s[0]))}</button>`).join('')}</div>
      <form class="xp-nl" id="xpNl"><input id="xpNlIn" placeholder="${en ? '🤖 Describe what you want, e.g. "students whose CGPA is above the average" — AI writes the SQL' : '🤖 কী চাও লেখো, যেমন "যাদের CGPA গড়ের বেশি তাদের নাম" — AI SQL লিখে দেবে'}"><button class="btn sm" type="submit">${en ? 'Write SQL' : 'SQL বানাও'}</button></form>
      <div id="xpNlOut" class="muted small"></div>
      <div class="editor-wrap" id="xpEd"></div>
      <div class="toolbar"><button class="btn primary" id="xpGo">${en ? 'Explain' : 'ব্যাখ্যা করো'}</button>
        <button class="btn sm" id="xpRun">▶ ${en ? 'Run on demo DB' : 'ডেমো ডেটাবেসে চালাও'}</button>
        <button class="btn sm" id="xpViz">${t('visualize')}</button>
        <button class="btn sm" id="xpAi">🤖 ${en ? 'Ask AI for more' : 'AI-কে আরও জিজ্ঞেস করো'}</button>
        <button class="btn sm" id="xpPlanBtn">📊 ${en ? 'Query plan' : 'কুয়েরি প্ল্যান'}</button>
        <button class="btn sm ghost" id="xpDia">${t('dialect')}</button>
        <span class="spacer"></span><label class="small">${t('dbLabel')} <select id="xpDb"><option value="auto">${en ? 'Auto' : 'নিজে বুঝে'}</option><option value="main">${t('mainDb')}</option><option value="job">${t('jobDb')}</option></select></label>
        <span class="shortcut"><kbd>Ctrl</kbd>+<kbd>Enter</kbd></span></div>
      <div id="xpOut"></div>
      <div id="xpPlan"></div>
      <div id="xpRunOut"></div></div>`;
    const seedKey = () => $('#xpDb').value === 'auto' ? SB.explainGuessSeed(cm.getValue()) : $('#xpDb').value;
    const go = () => { SB.renderExplain($('#xpOut'), cm.getValue()); store.set('sqlbn-xp-draft', cm.getValue()); };
    const runIt = () => {
      const sql = cm.getValue(); if (!sql.trim()) return;
      const db = SB.freshDb(seedOf(seedKey()));
      try {
        const res = db.exec(sql), ch = db.getRowsModified();
        $('#xpRunOut').innerHTML = `<h3 class="xp-runh">${en ? 'Result on the demo database' : 'ডেমো ডেটাবেসে ফলাফল'}</h3><div class="status show ok">${t('ranOk')} — ${seedKey() === 'job' ? t('jobDb') : t('mainDb')}${!res.length && ch ? ' · ' + t('rowsAffected', { n: n(ch) }) : ''}</div>` + res.map((r, i) => SB.tableHTML(r, res.length > 1 ? `${t('result')} ${n(i + 1)}` : t('result'))).join('<br>');
      } catch (e) { $('#xpRunOut').innerHTML = `<h3 class="xp-runh">${en ? 'Result on the demo database' : 'ডেমো ডেটাবেসে ফলাফল'}</h3><div class="status show err">${SB.errorHTML(e.message)}</div><p class="muted small">${en ? 'Queries written for MySQL/Oracle may not run on SQLite — the explanation above still applies. Try the dialect converter.' : 'MySQL/Oracle-এর জন্য লেখা কুয়েরি SQLite-এ নাও চলতে পারে — ওপরের ব্যাখ্যা তবুও ঠিক থাকে। ডায়ালেক্ট কনভার্টারটা দেখো।'}</p>`; }
      finally { db.close(); }
    };
    let timer = null;
    const cm = SB.makeEditor($('#xpEd'), store.get('sqlbn-xp-draft', XP_SAMPLES[0][1]), () => { go(); runIt(); }, SB.schemaOf((() => { const d = SB.freshDb(); setTimeout(() => d.close()); return d; })()));
    cm.on('change', () => { clearTimeout(timer); timer = setTimeout(go, 450); });
    $('#xpGo').onclick = go; $('#xpRun').onclick = () => { clearTimeout(timer); go(); runIt(); };
    $('#xpViz').onclick = () => SB.visualize(cm.getValue(), SB.freshDb(seedOf(seedKey())));
    $('#xpAi').onclick = () => { SB.tutor.toggle(true); SB.tutor.ask('explain'); };
    $('#xpDia').onclick = () => SB.showDialects(cm.getValue());
    $('#xpPlanBtn').onclick = () => { SB.renderPlan($('#xpPlan'), cm.getValue(), seedKey()); $('#xpPlan').scrollIntoView({ block: 'start', behavior: 'smooth' }); };
    $('#xpNl').onsubmit = async e => {
      e.preventDefault(); const q = $('#xpNlIn').value.trim(); if (!q) return;
      if (!SB.tutor.online()) { $('#xpNlOut').innerHTML = en ? 'This needs AI: add your Anthropic API key (or a proxy URL) in the AI tutor\'s ⚙ settings.' : 'এর জন্য AI লাগবে: AI টিউটরের ⚙ সেটিংসে তোমার Anthropic API key (বা proxy URL) দাও।'; SB.tutor.toggle(true); return; }
      $('#xpNlOut').textContent = en ? 'Writing SQL…' : 'SQL লেখা হচ্ছে…';
      const db = $('#xpDb').value === 'auto' ? 'main' : $('#xpDb').value;
      const r = await SB.nlToSql(q, db);
      if (r.error) { $('#xpNlOut').innerHTML = `<span class="err">${r.error}</span>`; return; }
      const m = r.text.match(/```(?:sql)?\s*([\s\S]*?)```/i);
      if (m) { cm.setValue(m[1].trim()); go(); runIt(); }
      $('#xpNlOut').innerHTML = esc(r.text.replace(/```[\s\S]*?```/g, '').trim());
    };
    $('#app').onclick = e => { const b = e.target.closest('[data-x]'); if (b) { cm.setValue(XP_SAMPLES[+b.dataset.x][1]); go(); $('#xpRunOut').innerHTML = ''; } };
    go();
  }

  // ═══════════════ ডেটাবেস পেজ (ER + ইমপোর্ট/এক্সপোর্ট) ═══════════════
  function parseCSV(text) {
    const rows = []; let row = [], cur = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; continue; }
      if (c === '"') q = true; else if (c === ',') { row.push(cur); cur = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; }
      else cur += c;
    }
    if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
    return rows.filter(r => r.some(x => x.trim() !== ''));
  }
  function importCSV(name, text) {
    const rows = parseCSV(text.replace(/^﻿/, ''));
    if (rows.length < 1) throw new Error('empty file');
    const head = rows[0].map((h, i) => (h.trim() || 'col' + (i + 1)).replace(/[^\w]+/g, '_').replace(/^(\d)/, '_$1').toLowerCase());
    const data = rows.slice(1);
    const types = head.map((_, i) => {
      const vals = data.map(r => (r[i] || '').trim()).filter(v => v !== '');
      if (vals.length && vals.every(v => /^-?\d+$/.test(v))) return 'INTEGER';
      if (vals.length && vals.every(v => /^-?\d*\.?\d+(e[+-]?\d+)?$/i.test(v))) return 'REAL';
      return 'TEXT';
    });
    let tbl = name.replace(/\.[^.]+$/, '').replace(/[^\w]+/g, '_').replace(/^(\d)/, 't_$1').toLowerCase() || 'imported';
    const exists = x => SB.pgDb.exec(`SELECT 1 FROM sqlite_master WHERE name = '${x}'`).length;
    let k = 2; const base = tbl; while (exists(tbl)) tbl = `${base}_${k++}`;
    SB.pgDb.exec(`CREATE TABLE ${SB.qid(tbl)} (${head.map((h, i) => `${SB.qid(h)} ${types[i]}`).join(', ')});`);
    const st = SB.pgDb.prepare(`INSERT INTO ${SB.qid(tbl)} VALUES (${head.map(() => '?').join(', ')})`);
    SB.pgDb.exec('BEGIN');
    data.forEach(r => st.run(head.map((_, i) => { const v = (r[i] || '').trim(); if (v === '') return null; return types[i] === 'TEXT' ? v : Number(v); })));
    SB.pgDb.exec('COMMIT'); st.free();
    savePgDb();
    return { tbl, count: data.length };
  }
  function renderDatabase() {
    document.body.classList.add('no-sidebar'); currentLessonId = null; setActiveTop('database');
    loadPgDb();
    SB.context = { where: 'database page', seed: store.get('sqlbn-pgseed', 'main') };
    const showJob = /db=job/.test(location.hash);
    $('#app').innerHTML = `<div class="page wide"><h1>🗄 ${t('dbTitle')}</h1><p class="lead">${t('dbLead')}</p>
      <div class="filter-row"><button class="chip ${showJob ? '' : 'on'}" data-db="main">${t('playground')} (${t(store.get('sqlbn-pgseed', 'main') === 'job' ? 'jobDb' : 'mainDb')})</button><button class="chip ${showJob ? 'on' : ''}" data-db="job">${t('jobDb')}</button></div>
      <h2>${t('erDiagram')}</h2><p class="muted small">${t('erHelp')}</p><div id="er"></div>
      ${showJob ? '' : `<h2>${t('importData')}</h2>
      <div class="toolbar">
        <label class="btn">${t('importCsv')}<input type="file" accept=".csv,text/csv" id="csvIn" hidden></label>
        <label class="btn">${t('importDb')}<input type="file" accept=".db,.sqlite,.sqlite3" id="dbIn" hidden></label>
        <button class="btn" id="dbOut">${t('exportDb')}</button>
        <button class="btn ghost" id="dbReset">${t('resetDb')}</button>
      </div><div class="status" id="dbStatus"></div>`}
      <h2>${t('tableDescriptions')}</h2><div id="tblDesc"></div></div>`;
    const draw = () => {
      const db = showJob ? SB.freshDb(window.JOB_SEED_SQL) : SB.pgDb;
      SB.renderER($('#er'), db);
      $('#tblDesc').innerHTML = schemaCardsHTML(SB.schemaOf(db), showJob ? window.JOB_TABLE_INFO : { ...window.TABLE_INFO, ...window.JOB_TABLE_INFO });
      if (showJob) db.close();
    };
    draw();
    const setStatus = (cls, html) => { const s = $('#dbStatus'); s.className = 'status show ' + cls; s.innerHTML = html; };
    $('#app').onclick = e => {
      const b = e.target.closest('[data-db]'); if (b) { location.hash = b.dataset.db === 'job' ? '#/database?db=job' : '#/database'; return; }
      const card = e.target.closest('.schema-card');
      if (card) { const db = showJob ? SB.freshDb(window.JOB_SEED_SQL) : SB.pgDb; try { const r = db.exec(`SELECT * FROM "${card.dataset.table}" LIMIT 100`); $('.schema-preview').innerHTML = SB.tableHTML(r[0]); } catch (err) { } if (showJob) db.close(); }
    };
    if (showJob) return;
    $('#csvIn').onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      try { const r = importCSV(f.name, await f.text()); setStatus('ok', t('imported', { t: `<code>${esc(r.tbl)}</code>`, n: n(r.count) })); draw(); }
      catch (err) { try { SB.pgDb.exec('ROLLBACK'); } catch (e2) { } setStatus('err', t('importFail') + esc(err.message)); }
      e.target.value = '';
    };
    $('#dbIn').onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      try { const bin = new Uint8Array(await f.arrayBuffer()); const db = new SB.SQL.Database(bin); db.exec('SELECT name FROM sqlite_master LIMIT 1'); SB.pgDb.close(); SB.pgDb = db; savePgDb(); setStatus('ok', t('openedDb')); draw(); }
      catch (err) { setStatus('err', t('importFail') + esc(err.message)); }
      e.target.value = '';
    };
    $('#dbOut').onclick = () => SB.download('sql-pathshala.sqlite', new Blob([SB.pgDb.export()], { type: 'application/x-sqlite3' }));
    $('#dbReset').onclick = () => { if (confirm(t('resetConfirm'))) { resetPgDb(store.get('sqlbn-pgseed', 'main')); draw(); setStatus('info', t('resetDone')); } };
  }

  // ═══════════════ চিটশিট ═══════════════
  const CHEAT = [
    ['🔍 SELECT', 'SELECT col1, col2 FROM t;\nSELECT * FROM t;\nSELECT DISTINCT city FROM t;', 'নির্দিষ্ট কলাম, সব কলাম, ইউনিক মান', 'Specific columns, all columns, unique values'],
    ['🎯 WHERE', "WHERE age >= 18 AND city = 'Dhaka'\nWHERE price BETWEEN 100 AND 500\nWHERE id IN (1, 2, 3)\nWHERE name LIKE 'S%'   -- % any, _ one char\nWHERE email IS NULL", 'টেক্সট সিঙ্গেল কোটে; NULL-এর জন্য IS NULL', "Text in single quotes; IS NULL for NULL"],
    ['↕️ ORDER BY / LIMIT', 'ORDER BY cgpa DESC, name ASC\nLIMIT 10 OFFSET 20\n-- SQL Server: SELECT TOP 10 ...\n-- Oracle 12c+: FETCH FIRST 10 ROWS ONLY', 'ASC = ছোট→বড় (ডিফল্ট), DESC = বড়→ছোট', 'ASC = smallest first (default), DESC = largest first'],
    ['🔗 JOIN', 'SELECT s.name, d.name\nFROM students s\nJOIN departments d ON s.dept_id = d.id;\n\nLEFT JOIN  -- all left rows\nFULL JOIN  -- all rows of both\nemp e JOIN emp m ON e.manager_id = m.id  -- self', 'অমিল খোঁজা: LEFT JOIN ... WHERE b.id IS NULL', 'Unmatched rows: LEFT JOIN ... WHERE b.id IS NULL'],
    ['📊 GROUP BY / HAVING', 'SELECT city, COUNT(*), AVG(cgpa)\nFROM t\nGROUP BY city\nHAVING COUNT(*) > 2;', 'WHERE → রো ফিল্টার, HAVING → গ্রুপ ফিল্টার', 'WHERE filters rows, HAVING filters groups'],
    ['🥈 2nd / Nth max', 'SELECT MAX(salary) FROM emp\nWHERE salary < (SELECT MAX(salary) FROM emp);\n\nSELECT DISTINCT salary FROM emp\nORDER BY salary DESC LIMIT 1 OFFSET N-1;', 'বা DENSE_RANK() = N', 'or DENSE_RANK() = N'],
    ['👯 Duplicates', 'SELECT email, COUNT(*) FROM t\nGROUP BY email HAVING COUNT(*) > 1;\n\nDELETE FROM t WHERE id NOT IN\n  (SELECT MIN(id) FROM t GROUP BY email);', 'খোঁজা ও ছোট id রেখে মুছা', 'Find, then delete keeping the smallest id'],
    ['🧮 Functions', "ROUND(x, 2), UPPER(s), LENGTH(s)\na || ' ' || b\nCOALESCE(email, 'N/A')\nSTRFTIME('%Y', d), DATE(d, '+7 days')", 'AS দিয়ে কলামের নাম', 'Rename columns with AS'],
    ['🔀 CASE', "CASE\n  WHEN cgpa >= 3.75 THEN 'A'\n  WHEN cgpa >= 3.25 THEN 'B'\n  ELSE 'C'\nEND AS grade", 'প্রথম সত্য শর্তে থামে', 'Stops at the first true condition'],
    ['🪆 Subquery & CTE', 'WHERE x > (SELECT AVG(x) FROM t)\nWHERE id IN (SELECT ...)\nWHERE NOT EXISTS (SELECT 1 FROM ...)\n\nWITH tmp AS (SELECT ...)\nSELECT * FROM tmp;', 'NOT IN-এ NULL সাবধান — NOT EXISTS নিরাপদ', 'Beware NULL in NOT IN — NOT EXISTS is safe'],
    ['🪟 Window', 'ROW_NUMBER() OVER (PARTITION BY dept ORDER BY sal DESC)\nRANK() / DENSE_RANK() OVER (...)\nSUM(x) OVER (ORDER BY date)\nAVG(x) OVER (ORDER BY d ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)\nLAG(x) / LEAD(x) OVER (ORDER BY date)', 'রো না কমিয়ে হিসাব', 'Calculations without collapsing rows'],
    ['➕ Set operations', 'SELECT a FROM t1\nUNION        -- / UNION ALL / INTERSECT / EXCEPT (Oracle: MINUS)\nSELECT a FROM t2;', 'দুই পাশে কলাম সংখ্যা সমান', 'Same number of columns on both sides'],
    ['✏️ DML', "INSERT INTO t (a, b) VALUES (1, 'x'), (2, 'y');\nUPDATE t SET a = a + 1 WHERE id = 5;\nDELETE FROM t WHERE id = 5;\nINSERT ... ON CONFLICT (id) DO UPDATE SET a = excluded.a;", '⚠️ UPDATE/DELETE-এ WHERE ভুলবে না!', '⚠️ Never forget WHERE in UPDATE/DELETE!'],
    ['🏗️ DDL', 'CREATE TABLE t (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  email TEXT UNIQUE,\n  age INTEGER CHECK (age >= 0),\n  dept_id INTEGER REFERENCES dept(id)\n);\nALTER TABLE t ADD COLUMN phone TEXT;\nALTER TABLE t RENAME COLUMN a TO b;\nDROP TABLE IF EXISTS t;', 'PK, NOT NULL, UNIQUE, CHECK, DEFAULT, FK', 'PK, NOT NULL, UNIQUE, CHECK, DEFAULT, FK'],
    ['⚡ Index / View / Trigger', 'CREATE INDEX idx_city ON t(city);\nCREATE VIEW v AS SELECT ...;\nCREATE TRIGGER tr AFTER UPDATE ON t\nBEGIN INSERT INTO log VALUES (OLD.id); END;\nEXPLAIN QUERY PLAN SELECT ...;', 'WHERE/JOIN-এ বেশি ব্যবহৃত কলামে index', 'Index columns used in WHERE/JOIN'],
    ['🔒 Transaction / DCL', 'BEGIN;\n  UPDATE ...; UPDATE ...;\nCOMMIT;    -- or ROLLBACK;\nGRANT SELECT ON t TO user1;\nREVOKE INSERT ON t FROM user1;', 'ACID: সব হবে নয়তো কিছুই না', 'ACID: all or nothing'],
    ['🧭 Execution order', 'FROM/JOIN → WHERE → GROUP BY → HAVING\n→ SELECT → DISTINCT → ORDER BY → LIMIT', 'এজন্যই WHERE-এ alias/aggregate চলে না', 'Why WHERE can\'t use aliases or aggregates']
  ];
  function renderCheat() {
    document.body.classList.add('no-sidebar'); currentLessonId = null; setActiveTop('cheatsheet');
    SB.context = { where: 'cheatsheet' };
    $('#app').innerHTML = `<div class="cheat"><h1>${t('cheatTitle')}</h1><p class="lead">${t('cheatLead')}</p>
      <div class="cheat-grid">${CHEAT.map(([h, code, bn, en]) => `<div class="cheat-card"><h3>${h}</h3><pre class="syntax">${esc(code)}</pre><p>${esc(I18N.lang === 'en' ? en : bn)}</p></div>`).join('')}</div></div>`;
    $$('.cheat pre').forEach(SB.highlight);
  }

  function renderProfilePage() {
    document.body.classList.add('no-sidebar'); currentLessonId = null; setActiveTop('profile');
    SB.context = { where: 'profile' };
    $('#app').innerHTML = '<div class="page" id="pf"></div>';
    SB.renderProfile($('#pf'));
  }

  // ═══════════════ রাউটার ═══════════════
  function route() {
    document.body.classList.remove('nav-open');
    if (window.speechSynthesis) speechSynthesis.cancel();
    SB.stopMockTimer();
    const app = $('#app'); app.onclick = null; app.ondblclick = null;
    const parts = (location.hash.slice(1).split('?')[0] || '/').split('/').filter(Boolean);
    const [p0, p1, p2] = parts;
    if (!p0) { renderHome(); if (SB.renderHomeExtras) SB.renderHomeExtras($('#homeExtra')); }
    else if (p0 === 'learn') renderLesson(p1 || 'intro');
    else if (p0 === 'practice') renderPracticeHub();
    else if (p0 === 'challenges') renderChallenges(p1);
    else if (p0 === 'jobprep') renderJobPrep(p1);
    else if (p0 === 'playground') renderPlayground();
    else if (p0 === 'visualize') renderVisualize();
    else if (p0 === 'explain') renderExplainPage();
    else if (SB.pages && SB.pages[p0]) { document.body.classList.add('no-sidebar'); currentLessonId = null; setActiveTop(p0); SB.pages[p0](p1, p2); }
    else if (p0 === 'database') renderDatabase();
    else if (p0 === 'cheatsheet') renderCheat();
    else if (p0 === 'profile') renderProfilePage();
    else if (p0 === 'mock') { setActiveTop('mock'); currentLessonId = null; SB.renderMock(p1); }
    else if (p0 === 'review') { setActiveTop('review'); currentLessonId = null; SB.renderReview(p1); }
    else renderHome();
    renderNav();
    window.scrollTo(0, 0);
    const a = $('.nav-item.active'); if (a) a.scrollIntoView({ block: 'nearest' });
    if (p0 === 'learn' && p2 === 'practice') setTimeout(() => { const ps = $('#practiceSet'); if (ps) ps.scrollIntoView({ block: 'start' }); }, 50);
  }
  function switchLang() {
    I18N.set(I18N.lang === 'en' ? 'bn' : 'en');
    chromeText(); SB.tutor.redraw(); updateProgressUI(); route();
  }

  // ═══════════════ শুরু ═══════════════
  function initChrome() {
    $('#menuBtn').onclick = () => document.body.classList.toggle('nav-open');
    $('#scrim').onclick = () => document.body.classList.remove('nav-open');
    $('#lessonSearch').addEventListener('input', renderNav);
    $('#langBtn').onclick = switchLang;
    $('#tutorFab').onclick = () => SB.tutor.toggle();
    $('#themeBtn').onclick = () => {
      const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('sqlbn-theme', next); } catch (e) { }
    };
    SB.onChange(updateProgressUI);
    chromeText();
    // PWA — শুধু http(s)-এ সার্ভিস ওয়ার্কার চলে
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(() => { });
    }
    let deferred = null;
    window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; $('#installBtn').hidden = false; });
    $('#installBtn').onclick = async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; $('#installBtn').hidden = true; };
  }

  initChrome();
  if (typeof initSqlJs !== 'function') { $('#app').innerHTML = `<div class="loading"><p>${t('libFail')}</p></div>`; return; }
  initSqlJs({ locateFile: f => SQLJS_CDN + f })
    .then(S => { SB.SQL = S; updateProgressUI(); window.addEventListener('hashchange', route); route(); })
    .catch(e => { $('#app').innerHTML = `<div class="loading"><p>${t('libFail')}<br><small>${esc(e.message || e)}</small></p></div>`; });
})();
