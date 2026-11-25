/* ER ডায়াগ্রাম — ডেটাবেসের টেবিল ও ফরেন কি সম্পর্ক SVG-তে আঁকে */
(function () {
  'use strict';
  const { esc } = SB;
  const ORDER = ['departments', 'students', 'courses', 'enrollments', 'employees', 'products', 'orders', 'cities', 'accounts', 'logins', 'newsletter', 'app_users',
    'dept', 'emp', 'salesperson', 'sales_order', 'customer', 'student_info', 'depositor', 'borrower', 'employee_salary', 't'];
  const W = 200, HEAD = 30, ROW = 21, GAP_X = 70, GAP_Y = 34, PAD = 20;

  function layout(tables, cols) {
    const sorted = [...tables].sort((a, b) => {
      const ia = ORDER.indexOf(a.name), ib = ORDER.indexOf(b.name);
      return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
    });
    const heights = new Array(cols).fill(PAD);
    const pos = {};
    sorted.forEach(tb => {
      const h = HEAD + tb.cols.length * ROW + 8;
      let c = 0; for (let i = 1; i < cols; i++) if (heights[i] < heights[c] - 1) c = i;
      pos[tb.name] = { x: PAD + c * (W + GAP_X), y: heights[c], h };
      heights[c] += h + GAP_Y;
    });
    return { pos, width: PAD * 2 + cols * W + (cols - 1) * GAP_X, height: Math.max(...heights) + PAD };
  }

  function render(container, db) {
    const tables = SB.schemaOf(db).filter(tb => tb.type === 'table');
    const cols = Math.max(2, Math.min(4, Math.ceil(tables.length / 3)));
    const { pos, width, height } = layout(tables, cols);
    const rowY = (tb, col) => { const p = pos[tb.name]; const i = Math.max(0, tb.cols.findIndex(c => c.name === col)); return p.y + HEAD + i * ROW + ROW / 2 + 2; };
    let lines = '', boxes = '';
    tables.forEach(tb => {
      tb.fks.forEach(fk => {
        const target = tables.find(x => x.name === fk.table); if (!target) return;
        const a = pos[tb.name], b = pos[target.name];
        const y1 = rowY(tb, fk.from), y2 = rowY(target, fk.to);
        let d;
        if (target === tb) { // self reference — ডান পাশে লুপ
          const x = a.x + W; d = `M${x} ${y1} C${x + 45} ${y1}, ${x + 45} ${y2}, ${x} ${y2}`;
        } else {
          const leftToRight = a.x + W / 2 < b.x + W / 2;
          const sameCol = Math.abs(a.x - b.x) < 5;
          const x1 = sameCol ? a.x : (leftToRight ? a.x + W : a.x), x2 = sameCol ? b.x : (leftToRight ? b.x : b.x + W);
          const bend = sameCol ? -50 : (leftToRight ? 1 : -1) * Math.max(40, Math.abs(x2 - x1) / 2);
          d = `M${x1} ${y1} C${x1 + bend} ${y1}, ${x2 - (sameCol ? -50 : bend)} ${y2}, ${x2} ${y2}`;
        }
        lines += `<path class="er-line" d="${d}"><title>${esc(tb.name)}.${esc(fk.from)} → ${esc(target.name)}.${esc(fk.to)}</title></path>
          <circle class="er-dot" cx="${d.split(' ').slice(-2)[0].replace(/[^\d.-]/g, '')}" cy="${y2}" r="3.5"/>`;
      });
      const p = pos[tb.name];
      boxes += `<g class="er-table" data-t="${esc(tb.name)}" transform="translate(${p.x},${p.y})">
        <rect class="er-box" width="${W}" height="${p.h}" rx="10"/>
        <path class="er-head" d="M0 10 a10 10 0 0 1 10 -10 h${W - 20} a10 10 0 0 1 10 10 v${HEAD - 10} h-${W} z"/>
        <text class="er-title" x="12" y="20">${esc(tb.name)}</text>
        <text class="er-count" x="${W - 10}" y="20" text-anchor="end">${tb.count}</text>
        ${tb.cols.map((c, i) => `<text class="er-col ${c.pk ? 'pk' : ''} ${c.fk ? 'fk' : ''}" x="12" y="${HEAD + i * ROW + 16}">${c.pk ? '🔑 ' : c.fk ? '🔗 ' : ''}${esc(c.name)}</text>
          <text class="er-type" x="${W - 10}" y="${HEAD + i * ROW + 16}" text-anchor="end">${esc((c.type || '').toLowerCase())}</text>`).join('')}
      </g>`;
    });
    container.innerHTML = `<div class="er-wrap"><svg class="er-svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="ER diagram">${lines}${boxes}</svg></div>`;
  }
  SB.renderER = render;
})();
