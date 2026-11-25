/* প্রোফাইল — XP, স্ট্রিক, ব্যাজ, সার্টিফিকেট, ব্যাকআপ */
(function () {
  'use strict';
  const { $, esc, t, n, pick, state, store, today } = SB;

  function streaks() {
    const days = Object.keys(state.activity).filter(d => state.activity[d] > 0).sort();
    const set = new Set(days);
    const fmt = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const d = new Date(); if (!set.has(fmt(d))) d.setDate(d.getDate() - 1);
    let cur = 0; while (set.has(fmt(d))) { cur++; d.setDate(d.getDate() - 1); }
    let best = 0, run = 0, prev = null;
    days.forEach(s => { const x = new Date(s + 'T00:00:00'); run = prev && (x - prev) === 864e5 ? run + 1 : 1; best = Math.max(best, run); prev = x; });
    return { cur, best };
  }

  function stats() {
    let ex = 0, qOk = 0, qAll = 0, lessonsDone = 0;
    LESSONS.forEach(l => {
      const p = state.progress[l.id] || {};
      ex += Object.keys(p.ex || {}).length;
      Object.entries(p.quiz || {}).forEach(([i, c]) => { qAll++; if (l.quiz[i] && l.quiz[i].answer === c) qOk++; });
      if (SB.lessonStatus(l) === 'done') lessonsDone++;
    });
    const ch = (window.CHALLENGES || []).filter(c => (state.challenges[c.id] || {}).solved);
    const chHard = ch.filter(c => c.level === 'hard').length;
    const jp = (window.JOB_QUESTIONS || []).filter(q => (state.jobprep[q.id] || {}).solved);
    const px = Object.keys(state.practice || {}).filter(k => state.practice[k]).length;
    const xp = px * 12 + ex * 10 + qOk * 5 + ch.reduce((s, c) => s + ({ easy: 20, medium: 35, hard: 50 }[c.level] || 20), 0) + jp.reduce((s, q) => s + (q.type === 'sql' ? 15 : 5), 0);
    return { ex, px, qOk, qAll, lessonsDone, ch: ch.length, chHard, jp: jp.length, xp, ...streaks() };
  }
  const done = (...ids) => ids.every(id => { const l = LESSONS.find(x => x.id === id); return l && SB.lessonStatus(l) === 'done'; });

  const BADGES = [
    ['first', '🌱', { bn: 'প্রথম পদক্ষেপ', en: 'First step' }, { bn: 'প্রথম অনুশীলন সমাধান', en: 'Solve your first exercise' }, s => s.ex >= 1],
    ['ten', '🔟', { bn: '১০টি অনুশীলন', en: '10 exercises' }, { bn: '১০টি অনুশীলন সমাধান', en: 'Solve 10 exercises' }, s => s.ex >= 10],
    ['fifty', '🚀', { bn: '৫০টি অনুশীলন', en: '50 exercises' }, { bn: '৫০টি অনুশীলন সমাধান', en: 'Solve 50 exercises' }, s => s.ex >= 50],
    ['joiner', '🔗', { bn: 'JOIN মাস্টার', en: 'JOIN master' }, { bn: 'সব JOIN লেসন শেষ', en: 'Finish every JOIN lesson' }, () => done('join', 'outer-join', 'self-cross-join')],
    ['agg', '📊', { bn: 'হিসাবরক্ষক', en: 'Aggregator' }, { bn: 'অ্যাগ্রিগেট ও GROUP BY শেষ', en: 'Finish aggregates and GROUP BY' }, () => done('aggregates', 'group-by')],
    ['window', '🪟', { bn: 'উইন্ডো জাদুকর', en: 'Window wizard' }, { bn: 'দুটো উইন্ডো লেসন শেষ', en: 'Finish both window lessons' }, () => done('window', 'window-adv')],
    ['quiz', '🧠', { bn: 'কুইজ চ্যাম্পিয়ন', en: 'Quiz champion' }, { bn: '৩০টি কুইজ সঠিক', en: '30 correct quiz answers' }, s => s.qOk >= 30],
    ['challenger', '🏆', { bn: 'চ্যালেঞ্জার', en: 'Challenger' }, { bn: '৫টি ইন্টারভিউ চ্যালেঞ্জ', en: '5 interview challenges' }, s => s.ch >= 5],
    ['hardcore', '🔥', { bn: 'কঠিনের কারিগর', en: 'Hardcore' }, { bn: '৩টি কঠিন চ্যালেঞ্জ', en: '3 hard challenges' }, s => s.chHard >= 3],
    ['jobready', '💼', { bn: 'চাকরির জন্য প্রস্তুত', en: 'Job ready' }, { bn: '২০টি চাকরি-প্রস্তুতি প্রশ্ন', en: '20 job-prep questions' }, s => s.jp >= 20],
    ['streak3', '📅', { bn: '৩ দিনের স্ট্রিক', en: '3-day streak' }, { bn: 'টানা ৩ দিন প্র্যাকটিস', en: 'Practise 3 days in a row' }, s => s.best >= 3],
    ['streak7', '⚡', { bn: '৭ দিনের স্ট্রিক', en: '7-day streak' }, { bn: 'টানা ৭ দিন প্র্যাকটিস', en: 'Practise 7 days in a row' }, s => s.best >= 7],
    ['graduate', '🎓', { bn: 'গ্র্যাজুয়েট', en: 'Graduate' }, { bn: 'সব লেসন শেষ', en: 'Finish every lesson' }, s => s.lessonsDone >= LESSONS.length]
  ];

  // নতুন ব্যাজ পেলে টোস্ট
  let known = new Set(store.get('sqlbn-badges', []));
  SB.onChange(() => {
    const s = stats();
    BADGES.forEach(([id, icon, title, , test]) => {
      if (!known.has(id) && test(s)) { known.add(id); SB.toast(`${t('newBadge')}${icon} ${pick(title)}`); }
    });
    store.set('sqlbn-badges', [...known]);
  });

  function heatmap() {
    const cells = []; const d = new Date(); d.setDate(d.getDate() - 83);
    for (let i = 0; i < 84; i++) {
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const v = state.activity[k] || 0;
      cells.push(`<span class="hm l${v === 0 ? 0 : v < 3 ? 1 : v < 8 ? 2 : 3}" title="${k}: ${v}"></span>`);
      d.setDate(d.getDate() + 1);
    }
    return `<div class="heatmap">${cells.join('')}</div>`;
  }

  async function certificate(name, s) {
    try { await document.fonts.load('700 40px "Hind Siliguri"'); } catch (e) { }
    const c = document.createElement('canvas'); c.width = 1600; c.height = 1100;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 1600, 1100); grad.addColorStop(0, '#f2fbf7'); grad.addColorStop(1, '#eef4ff');
    g.fillStyle = grad; g.fillRect(0, 0, 1600, 1100);
    g.strokeStyle = '#0e9f6e'; g.lineWidth = 14; g.strokeRect(40, 40, 1520, 1020);
    g.strokeStyle = '#0891b2'; g.lineWidth = 2; g.strokeRect(70, 70, 1460, 960);
    g.textAlign = 'center'; g.fillStyle = '#0b7f58';
    g.font = '700 46px "Hind Siliguri", sans-serif'; g.fillText('SQL পাঠশালা · SQL Pathshala', 800, 190);
    g.fillStyle = '#1b2430'; g.font = '700 72px "Hind Siliguri", serif'; g.fillText('সমাপনী সনদ · Certificate of Completion', 800, 320);
    g.font = '400 34px "Hind Siliguri", sans-serif'; g.fillStyle = '#556070'; g.fillText('এই মর্মে প্রত্যয়ন করা যাচ্ছে যে · This certifies that', 800, 420);
    g.font = '700 84px "Hind Siliguri", serif'; g.fillStyle = '#0b7f58'; g.fillText(name || '—', 800, 540);
    g.fillStyle = '#1b2430'; g.font = '400 34px "Hind Siliguri", sans-serif';
    g.fillText(`সফলভাবে ${LESSONS.length}টি SQL লেসন সম্পন্ন করেছে · has completed all ${LESSONS.length} SQL lessons`, 800, 640);
    g.fillText(`${s.ex} exercises · ${s.qOk} quiz answers · ${s.ch} challenges · ${s.jp} job-prep · ${s.xp} XP`, 800, 700);
    g.font = '400 30px "Hind Siliguri", sans-serif'; g.fillStyle = '#556070';
    g.fillText(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), 800, 860);
    g.font = '700 120px sans-serif'; g.fillText('🎓', 800, 1000);
    c.toBlob(b => SB.download('sql-pathshala-certificate.png', b), 'image/png');
  }

  const encodeState = () => btoa(unescape(encodeURIComponent(JSON.stringify({ v: 1, progress: state.progress, challenges: state.challenges, activity: state.activity, jobprep: state.jobprep, practice: state.practice, review: store.get('sqlbn-review', {}), mockHistory: store.get('sqlbn-mock-history', []), name: store.get('sqlbn-name', '') }))));
  function importState(obj) {
    if (!obj || typeof obj !== 'object' || !obj.progress) throw new Error('bad');
    ['progress', 'challenges', 'activity', 'jobprep', 'practice'].forEach(k => { const v = obj[k] || {}; Object.keys(state[k]).forEach(x => delete state[k][x]); Object.assign(state[k], v); });
    if (obj.name) store.set('sqlbn-name', obj.name);
    if (obj.review) { Object.keys(SB.review.data).forEach(k => delete SB.review.data[k]); Object.assign(SB.review.data, obj.review); store.set('sqlbn-review', obj.review); }
    if (obj.mockHistory) store.set('sqlbn-mock-history', obj.mockHistory);
    SB.save('import');
  }

  function render(container) {
    const s = stats();
    const name = store.get('sqlbn-name', '');
    const pct = Math.round(s.lessonsDone * 100 / LESSONS.length);
    const earned = BADGES.filter(b => b[4](s));
    container.innerHTML = `
      <div class="profile">
        <h1>${t('pfTitle')}</h1>
        <label class="pf-name">${t('yourName')}<input id="pfName" value="${esc(name)}" maxlength="60"></label>
        <div class="stat-row">
          <div class="stat"><b>${n(s.xp)}</b><span>${t('xp')}</span></div>
          <div class="stat"><b>🔥 ${n(s.cur)}</b><span>${t('streak')}</span></div>
          <div class="stat"><b>${n(s.best)}</b><span>${t('bestStreak')}</span></div>
          <div class="stat"><b>${n(s.lessonsDone)}/${n(LESSONS.length)}</b><span>${t('lessonsCompleted')}</span></div>
          <div class="stat"><b>${n(s.ex)}</b><span>${t('exSolved')}</span></div>
          <div class="stat"><b>${n(s.px)}</b><span>🎯 ${t('practice')}</span></div>
          <div class="stat"><b>${n(s.ch)}/${n((window.CHALLENGES || []).length)}</b><span>${t('chSolved')}</span></div>
          <div class="stat"><b>${n(s.jp)}</b><span>💼 ${t('jobprep')}</span></div>
          <div class="stat"><b>${s.qAll ? n(Math.round(s.qOk * 100 / s.qAll)) + '%' : '—'}</b><span>${t('quizAcc')}</span></div>
        </div>
        <h2>${t('activity')}</h2>${heatmap()}
        <h2>${t('badges')} <small class="muted">${n(earned.length)}/${n(BADGES.length)}</small></h2>
        <div class="badges">${BADGES.map(([id, icon, title, desc, test]) => `<div class="badge-card ${test(s) ? 'got' : ''}" title="${esc(pick(desc))}"><span class="bi">${icon}</span><b>${esc(pick(title))}</b><small>${esc(pick(desc))}</small></div>`).join('')}</div>
        <h2>${t('certificate')}</h2>
        <div class="cert-box">${pct >= 100 ? `<p>🎉 ${t('certReady')}</p><button class="btn primary" data-p="cert">${t('downloadCert')}</button>` : `<p>${t('certLocked', { p: n(pct) })}</p><div class="pbar"><span style="width:${pct}%"></span></div>`}</div>
        <h2>${t('backup')}</h2>
        <p class="muted">${t('backupHelp')}</p>
        <div class="toolbar">
          <button class="btn sm" data-p="export">${t('exportProgress')}</button>
          <label class="btn sm">${t('importProgress')}<input type="file" accept=".json,application/json" id="pfImport" hidden></label>
          <button class="btn sm" data-p="copy">${t('copyCode')}</button>
          <button class="btn sm" data-p="paste">${t('pasteCode')}</button>
          <span class="spacer"></span>
          <button class="btn sm danger" data-p="reset">${t('resetProgress')}</button>
        </div>
      </div>`;
    $('#pfName', container).onchange = e => { store.set('sqlbn-name', e.target.value.trim()); };
    $('#pfImport', container).onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      try { importState(JSON.parse(await f.text())); SB.toast(t('progressImported')); render(container); } catch (err) { SB.toast(t('badCode')); }
    };
    container.onclick = async e => {
      const b = e.target.closest('[data-p]'); if (!b) return;
      const a = b.dataset.p;
      if (a === 'cert') certificate(store.get('sqlbn-name', '') || $('#pfName').value, s);
      if (a === 'export') SB.download(`sql-pathshala-progress-${today()}.json`, JSON.stringify(JSON.parse(decodeURIComponent(escape(atob(encodeState())))), null, 2), 'application/json');
      if (a === 'copy') { const code = encodeState(); try { await navigator.clipboard.writeText(code); SB.toast(t('clipboard')); } catch (err) { prompt(t('copyCode'), code); } }
      if (a === 'paste') {
        const code = prompt(t('pastePrompt')); if (!code) return;
        try { importState(JSON.parse(decodeURIComponent(escape(atob(code.trim()))))); SB.toast(t('progressImported')); render(container); } catch (err) { SB.toast(t('badCode')); }
      }
      if (a === 'reset' && confirm(t('resetProgressConfirm'))) {
        ['progress', 'challenges', 'activity', 'jobprep', 'practice'].forEach(k => Object.keys(state[k]).forEach(x => delete state[k][x]));
        Object.keys(SB.review.data).forEach(k => delete SB.review.data[k]); store.set('sqlbn-review', {}); store.set('sqlbn-mock-history', []);
        known = new Set(); store.set('sqlbn-badges', []); SB.save('reset'); render(container);
      }
    };
  }

  SB.stats = stats;
  SB.renderProfile = render;
})();
