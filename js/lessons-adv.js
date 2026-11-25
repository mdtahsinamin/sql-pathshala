// অ্যাডভান্সড লেসন — প্রতিটি লেসন `after` লেসনের পরে LESSONS-এ বসানো হয়।
// `en` অংশে ইংরেজি সংস্করণ।
(function () {
const ADV = [
// ───────────────────────────── Self JOIN & CROSS JOIN
{
  id: 'self-cross-join', after: 'outer-join', section: 'join', title: 'Self JOIN ও CROSS JOIN',
  summary: 'টেবিলকে নিজের সাথে জোড়া, সব কম্বিনেশন তৈরি, non-equi join',
  tables: ['employees', 'students', 'departments'],
  content: `
<h2>Self JOIN — টেবিল নিজের সাথে</h2>
<p><code>employees</code> টেবিলে <code>manager_id</code> কলামটা একই টেবিলের <code>id</code>-কে নির্দেশ করে। "প্রতিটি কর্মচারীর ম্যানেজারের নাম" জানতে টেবিলটাকে দুটো আলাদা নাম (alias) দিয়ে নিজের সাথেই JOIN করি — যেন একই টেবিলের দুটো কপি।</p>
<pre class="ex">SELECT e.name AS employee, m.name AS manager
FROM employees e
JOIN employees m ON e.manager_id = m.id;</pre>
<p>এখানে <code>e</code> = কর্মচারী হিসেবে টেবিল, <code>m</code> = ম্যানেজার হিসেবে একই টেবিল। ম্যানেজার না থাকলেও সবাইকে দেখাতে <code>LEFT JOIN</code>:</p>
<pre class="ex">SELECT e.name AS employee, COALESCE(m.name, '— নেই —') AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;</pre>

<h2>একই টেবিলের রো-জোড়া খোঁজা</h2>
<p>"একই শহরের ছাত্রদের জোড়া" — <code>s1.id &lt; s2.id</code> শর্তটা খুব জরুরি, নইলে (A,B) আর (B,A) দুবার আসবে, আর (A,A)-ও আসবে।</p>
<pre class="ex">SELECT s1.name, s2.name, s1.city
FROM students s1
JOIN students s2 ON s1.city = s2.city AND s1.id < s2.id;</pre>

<h2>CROSS JOIN — সব সম্ভাব্য কম্বিনেশন</h2>
<p><code>CROSS JOIN</code> কোনো শর্ত ছাড়াই প্রথম টেবিলের প্রতিটি রো-কে দ্বিতীয় টেবিলের প্রতিটি রো-র সাথে জোড়ে (Cartesian product)। ৬টি বিভাগ × ৩টি বছর = ১৮টি রো।</p>
<pre class="ex">SELECT d.name, y.admission_year
FROM departments d
CROSS JOIN (SELECT DISTINCT admission_year FROM students) y
ORDER BY d.name, y.admission_year;</pre>
<p><b>কোথায় কাজে লাগে:</b> সাইজ × রঙের সব ভ্যারিয়েন্ট বানানো, রিপোর্টে "শূন্য" মানসহ সব মাস × সব ক্যাটাগরি দেখানো।</p>
<div class="callout warn"><b>সতর্কতা:</b> ১০,০০০ × ১০,০০০ রো-র CROSS JOIN = ১০ কোটি রো! JOIN-এ <code>ON</code> শর্ত ভুলে গেলেও একই ঘটনা ঘটে।</div>

<h2>Non-equi JOIN</h2>
<p>ON-এ সবসময় <code>=</code> লাগবে এমন নয়। <code>&lt;</code>, <code>&gt;</code>, <code>BETWEEN</code> দিয়েও জোড়া যায়:</p>
<pre class="ex">-- একই বিভাগে কে কার চেয়ে বেশি বেতন পায়
SELECT a.name AS higher, b.name AS lower, a.dept_id
FROM employees a
JOIN employees b ON a.dept_id = b.dept_id AND a.salary > b.salary;</pre>
`,
  exercises: [
    { task: 'প্রতিটি কর্মচারীর <code>name</code> ও তার ম্যানেজারের <code>name</code> দেখাও (শুধু যাদের ম্যানেজার আছে)।', solution: 'SELECT e.name, m.name FROM employees e JOIN employees m ON e.manager_id = m.id;', hint: 'employees e JOIN employees m ON e.manager_id = m.id' },
    { task: '<b>সব</b> কর্মচারীর নাম ও ম্যানেজারের নাম দেখাও — ম্যানেজার না থাকলে NULL।', solution: 'SELECT e.name, m.name FROM employees e LEFT JOIN employees m ON e.manager_id = m.id;', hint: 'LEFT JOIN ব্যবহার করো।' },
    { task: 'একই শহরের ছাত্রদের জোড়া দেখাও (প্রতিটি জোড়া একবার): <code>s1.name, s2.name</code>।', solution: 'SELECT s1.name, s2.name FROM students s1 JOIN students s2 ON s1.city = s2.city AND s1.id < s2.id;', hint: 'ON s1.city = s2.city AND s1.id < s2.id' },
    { task: 'প্রতিটি বিভাগের <code>name</code> ও ছাত্রদের প্রতিটি ইউনিক <code>admission_year</code>-এর সব কম্বিনেশন দেখাও।', solution: 'SELECT d.name, y.admission_year FROM departments d CROSS JOIN (SELECT DISTINCT admission_year FROM students) y;', hint: 'CROSS JOIN (SELECT DISTINCT admission_year FROM students)' }
  ],
  quiz: [
    { q: 'Self JOIN-এ একই টেবিল দুবার ব্যবহার করতে কী অবশ্যই লাগে?', options: ['আলাদা alias', 'UNION', 'সাবকুয়েরি', 'CROSS JOIN'], answer: 0, explain: 'দুটো ভিন্ন alias (যেমন e ও m) না দিলে কোন কপির কলাম তা বোঝা যায় না।' },
    { q: '৫ রো-র টেবিল × ৪ রো-র টেবিল CROSS JOIN করলে কত রো?', options: ['৯', '৫', '২০', '৪'], answer: 2, explain: 'Cartesian product: ৫ × ৪ = ২০।' },
    { q: 'জোড়া খুঁজতে s1.id < s2.id কেন দিই?', options: ['দ্রুত চালাতে', 'ডুপ্লিকেট জোড়া ও নিজের সাথে জোড়া বাদ দিতে', 'NULL বাদ দিতে', 'সাজাতে'], answer: 1, explain: '(A,B) ও (B,A) একই জোড়া — একটাই রাখতে হয়; আর (A,A) বাদ যায়।' }
  ],
  en: {
    title: 'Self JOIN & CROSS JOIN',
    summary: 'Joining a table to itself, generating all combinations, non-equi joins',
    content: `
<h2>Self JOIN — a table joined to itself</h2>
<p>In <code>employees</code>, the <code>manager_id</code> column points to the <code>id</code> of the <i>same</i> table. To get each employee's manager name, give the table two aliases and join it to itself — as if there were two copies.</p>
<pre class="ex">SELECT e.name AS employee, m.name AS manager
FROM employees e
JOIN employees m ON e.manager_id = m.id;</pre>
<p><code>e</code> plays the employee, <code>m</code> plays the manager. To keep employees without a manager, use <code>LEFT JOIN</code>:</p>
<pre class="ex">SELECT e.name AS employee, COALESCE(m.name, '- none -') AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;</pre>
<h2>Finding pairs within one table</h2>
<p>"Pairs of students from the same city" — the condition <code>s1.id &lt; s2.id</code> matters: without it you get both (A,B) and (B,A), plus (A,A).</p>
<pre class="ex">SELECT s1.name, s2.name, s1.city
FROM students s1
JOIN students s2 ON s1.city = s2.city AND s1.id < s2.id;</pre>
<h2>CROSS JOIN — every combination</h2>
<p><code>CROSS JOIN</code> pairs every row of the first table with every row of the second (Cartesian product). 6 departments × 3 years = 18 rows.</p>
<pre class="ex">SELECT d.name, y.admission_year
FROM departments d
CROSS JOIN (SELECT DISTINCT admission_year FROM students) y
ORDER BY d.name, y.admission_year;</pre>
<p><b>Use cases:</b> generating size × colour variants, or reports that must show every month × category even when the value is zero.</p>
<div class="callout warn"><b>Careful:</b> 10,000 × 10,000 rows = 100 million rows! Forgetting the <code>ON</code> condition of a join causes the same explosion.</div>
<h2>Non-equi JOIN</h2>
<p>The ON condition doesn't have to be <code>=</code>. You can join with <code>&lt;</code>, <code>&gt;</code> or <code>BETWEEN</code>:</p>
<pre class="ex">-- Who earns more than whom, within the same department
SELECT a.name AS higher, b.name AS lower, a.dept_id
FROM employees a
JOIN employees b ON a.dept_id = b.dept_id AND a.salary > b.salary;</pre>
`,
    ex: [
      { task: 'Show each employee\'s <code>name</code> and their manager\'s <code>name</code> (only employees who have a manager).', hint: 'employees e JOIN employees m ON e.manager_id = m.id' },
      { task: 'Show <b>all</b> employees with their manager\'s name — NULL if there is none.', hint: 'Use LEFT JOIN.' },
      { task: 'List pairs of students from the same city (each pair once): <code>s1.name, s2.name</code>.', hint: 'ON s1.city = s2.city AND s1.id < s2.id' },
      { task: 'Show every combination of department <code>name</code> and distinct student <code>admission_year</code>.', hint: 'CROSS JOIN (SELECT DISTINCT admission_year FROM students)' }
    ],
    quiz: [
      { q: 'What do you need to use the same table twice in a self join?', options: ['Different aliases', 'UNION', 'A subquery', 'CROSS JOIN'], explain: 'Without two aliases (e.g. e and m) SQL cannot tell which copy a column belongs to.' },
      { q: 'A 5-row table CROSS JOIN a 4-row table gives how many rows?', options: ['9', '5', '20', '4'], explain: 'Cartesian product: 5 × 4 = 20.' },
      { q: 'Why add s1.id < s2.id when finding pairs?', options: ['To run faster', 'To drop duplicate and self pairs', 'To drop NULLs', 'To sort'], explain: '(A,B) and (B,A) are the same pair — keep one; (A,A) is removed too.' }
    ]
  }
},

// ───────────────────────────── Date & Time
{
  id: 'datetime', after: 'expressions', section: 'agg', title: 'তারিখ ও সময় (Date & Time)',
  summary: 'DATE, STRFTIME, তারিখ যোগ-বিয়োগ, দুই তারিখের পার্থক্য, মাসভিত্তিক রিপোর্ট',
  tables: ['orders', 'employees'],
  content: `
<p>রিপোর্টে সবচেয়ে বেশি লাগে তারিখের হিসাব — "এই মাসের বিক্রি", "গত ৭ দিন", "কতদিন চাকরি করছে"। SQLite-এ তারিখ সাধারণত <code>'YYYY-MM-DD'</code> ফরম্যাটে টেক্সট হিসেবে রাখা হয় (ISO 8601)। এই ফরম্যাটের সুবিধা: টেক্সট হিসেবে তুলনা করলেও সঠিক ক্রম হয়।</p>
<pre class="ex">SELECT DATE('now') AS today,
       DATETIME('now') AS now_utc,
       DATE('now', '+7 days') AS next_week,
       DATE('now', 'start of month') AS month_start;</pre>

<h2>তারিখ থেকে অংশ বের করা: STRFTIME</h2>
<table class="demo-table">
  <tr><th>ফরম্যাট</th><th>অর্থ</th><th>উদাহরণ</th></tr>
  <tr><td><code>%Y</code></td><td>বছর</td><td>2024</td></tr>
  <tr><td><code>%m</code></td><td>মাস (01-12)</td><td>03</td></tr>
  <tr><td><code>%d</code></td><td>দিন</td><td>15</td></tr>
  <tr><td><code>%H:%M:%S</code></td><td>ঘণ্টা:মিনিট:সেকেন্ড</td><td>14:30:00</td></tr>
  <tr><td><code>%w</code></td><td>সপ্তাহের দিন (0 = রবিবার)</td><td>5</td></tr>
  <tr><td><code>%j</code></td><td>বছরের কততম দিন</td><td>075</td></tr>
  <tr><td><code>%W</code></td><td>বছরের কততম সপ্তাহ</td><td>10</td></tr>
</table>
<pre class="ex">-- মাসভিত্তিক অর্ডার সংখ্যা
SELECT STRFTIME('%Y-%m', order_date) AS month, COUNT(*) AS orders
FROM orders
GROUP BY month
ORDER BY month;</pre>

<h2>তারিখ যোগ-বিয়োগ (Modifiers)</h2>
<p><code>DATE(তারিখ, 'মডিফায়ার', ...)</code> — <code>'+7 days'</code>, <code>'-1 month'</code>, <code>'+1 year'</code>, <code>'start of month'</code>, <code>'start of year'</code>, <code>'weekday 5'</code> (পরের শুক্রবার)।</p>
<pre class="ex">SELECT id, order_date,
       DATE(order_date, '+7 days') AS delivery_by,
       DATE(order_date, 'start of month', '+1 month', '-1 day') AS month_end
FROM orders;</pre>

<h2>দুই তারিখের পার্থক্য</h2>
<p><code>JULIANDAY()</code> তারিখকে দিনের সংখ্যায় রূপান্তর করে — বিয়োগ করলে দিনের পার্থক্য পাওয়া যায়।</p>
<pre class="ex">SELECT name, join_date,
       JULIANDAY('2024-12-31') - JULIANDAY(join_date) AS days_worked,
       CAST((JULIANDAY('2024-12-31') - JULIANDAY(join_date)) / 365.25 AS INTEGER) AS years
FROM employees
ORDER BY days_worked DESC;</pre>

<h2>তারিখ দিয়ে ফিল্টার</h2>
<pre class="ex">-- মার্চ ২০২৪-এর অর্ডার (index-friendly উপায়)
SELECT * FROM orders
WHERE order_date >= '2024-03-01' AND order_date < '2024-04-01';</pre>
<div class="callout tip"><b>টিপস:</b> <code>WHERE STRFTIME('%m', order_date) = '03'</code> কাজ করে, কিন্তু কলামের উপর ফাংশন দিলে index ব্যবহার হয় না। বড় টেবিলে রেঞ্জ (<code>&gt;=</code> ও <code>&lt;</code>) ব্যবহার করো।</div>

<h2>অন্য ডেটাবেসে</h2>
<table class="demo-table">
  <tr><th>কাজ</th><th>SQLite</th><th>MySQL</th><th>PostgreSQL</th><th>SQL Server</th></tr>
  <tr><td>আজ</td><td>DATE('now')</td><td>CURDATE()</td><td>CURRENT_DATE</td><td>CAST(GETDATE() AS DATE)</td></tr>
  <tr><td>৭ দিন যোগ</td><td>DATE(d,'+7 days')</td><td>DATE_ADD(d, INTERVAL 7 DAY)</td><td>d + INTERVAL '7 days'</td><td>DATEADD(day, 7, d)</td></tr>
  <tr><td>পার্থক্য (দিন)</td><td>JULIANDAY(a)-JULIANDAY(b)</td><td>DATEDIFF(a, b)</td><td>a - b</td><td>DATEDIFF(day, b, a)</td></tr>
  <tr><td>বছর বের করা</td><td>STRFTIME('%Y', d)</td><td>YEAR(d)</td><td>EXTRACT(YEAR FROM d)</td><td>YEAR(d)</td></tr>
</table>
`,
  exercises: [
    { task: '<b>মার্চ ২০২৪</b>-এ হওয়া অর্ডারগুলোর <code>id</code> ও <code>order_date</code> দেখাও।', solution: "SELECT id, order_date FROM orders WHERE order_date >= '2024-03-01' AND order_date < '2024-04-01';", hint: "order_date >= '2024-03-01' AND order_date < '2024-04-01'" },
    { task: 'প্রতি মাসে কতটি অর্ডার হয়েছে দেখাও — কলাম: মাস (<code>YYYY-MM</code> ফরম্যাটে) ও সংখ্যা।', solution: "SELECT STRFTIME('%Y-%m', order_date) AS month, COUNT(*) FROM orders GROUP BY month;", hint: "STRFTIME('%Y-%m', order_date) দিয়ে GROUP BY" },
    { task: 'প্রতিটি কর্মচারীর <code>name</code> ও <b>2024-12-31</b> পর্যন্ত কতদিন চাকরি করেছে (<code>JULIANDAY</code> পার্থক্য) দেখাও।', solution: "SELECT name, JULIANDAY('2024-12-31') - JULIANDAY(join_date) FROM employees;", hint: "JULIANDAY('2024-12-31') - JULIANDAY(join_date)" },
    { task: 'প্রতিটি অর্ডারের <code>id</code> ও অর্ডারের <b>৭ দিন পরের</b> তারিখ দেখাও।', solution: "SELECT id, DATE(order_date, '+7 days') FROM orders;", hint: "DATE(order_date, '+7 days')" }
  ],
  quiz: [
    { q: "DATE('2024-01-31', '+1 month') SQLite-এ কী দেয়?", options: ['2024-02-29', '2024-03-02', '2024-02-31', 'NULL'], answer: 1, explain: "SQLite ফেব্রুয়ারি ৩১ বানিয়ে ওভারফ্লো করে ২০২৪-০৩-০২ দেয়। মাস যোগের সময় এমন এজ কেস মাথায় রাখো।" },
    { q: 'তারিখকে "YYYY-MM-DD" টেক্সট হিসেবে রাখার সুবিধা কী?', options: ['জায়গা কম লাগে', 'টেক্সট হিসেবে তুলনা ও সাজানো সঠিক হয়', 'টাইমজোন ঠিক থাকে', 'কোনো সুবিধা নেই'], answer: 1, explain: "ISO ফরম্যাটে '2024-03-01' < '2024-12-01' — বর্ণানুক্রম আর সময়ক্রম একই।" },
    { q: 'কলামের উপর STRFTIME দিয়ে WHERE লিখলে সমস্যা কী?', options: ['ভুল ফল দেয়', 'Index ব্যবহার করতে পারে না, বড় টেবিলে ধীর', 'এরর দেয়', 'কোনো সমস্যা নেই'], answer: 1, explain: 'কলামকে ফাংশনে মোড়ালে ডেটাবেস প্রতিটি রো হিসাব করে — রেঞ্জ শর্ত index-friendly।' }
  ],
  en: {
    title: 'Date & Time',
    summary: 'DATE, STRFTIME, adding intervals, date differences, monthly reports',
    content: `
<p>Reports constantly need date maths — "sales this month", "last 7 days", "years of service". SQLite stores dates as text in <code>'YYYY-MM-DD'</code> (ISO 8601). The nice property: comparing them as text gives the correct chronological order.</p>
<pre class="ex">SELECT DATE('now') AS today,
       DATETIME('now') AS now_utc,
       DATE('now', '+7 days') AS next_week,
       DATE('now', 'start of month') AS month_start;</pre>
<h2>Extracting parts: STRFTIME</h2>
<table class="demo-table">
  <tr><th>Format</th><th>Meaning</th><th>Example</th></tr>
  <tr><td><code>%Y</code></td><td>Year</td><td>2024</td></tr>
  <tr><td><code>%m</code></td><td>Month (01-12)</td><td>03</td></tr>
  <tr><td><code>%d</code></td><td>Day</td><td>15</td></tr>
  <tr><td><code>%H:%M:%S</code></td><td>Hour:minute:second</td><td>14:30:00</td></tr>
  <tr><td><code>%w</code></td><td>Weekday (0 = Sunday)</td><td>5</td></tr>
  <tr><td><code>%j</code></td><td>Day of year</td><td>075</td></tr>
  <tr><td><code>%W</code></td><td>Week of year</td><td>10</td></tr>
</table>
<pre class="ex">-- Orders per month
SELECT STRFTIME('%Y-%m', order_date) AS month, COUNT(*) AS orders
FROM orders
GROUP BY month
ORDER BY month;</pre>
<h2>Adding and subtracting (modifiers)</h2>
<p><code>DATE(date, 'modifier', ...)</code> — <code>'+7 days'</code>, <code>'-1 month'</code>, <code>'+1 year'</code>, <code>'start of month'</code>, <code>'start of year'</code>, <code>'weekday 5'</code> (next Friday).</p>
<pre class="ex">SELECT id, order_date,
       DATE(order_date, '+7 days') AS delivery_by,
       DATE(order_date, 'start of month', '+1 month', '-1 day') AS month_end
FROM orders;</pre>
<h2>Difference between two dates</h2>
<p><code>JULIANDAY()</code> turns a date into a day number — subtracting gives the gap in days.</p>
<pre class="ex">SELECT name, join_date,
       JULIANDAY('2024-12-31') - JULIANDAY(join_date) AS days_worked,
       CAST((JULIANDAY('2024-12-31') - JULIANDAY(join_date)) / 365.25 AS INTEGER) AS years
FROM employees
ORDER BY days_worked DESC;</pre>
<h2>Filtering by date</h2>
<pre class="ex">-- Orders in March 2024 (index-friendly)
SELECT * FROM orders
WHERE order_date >= '2024-03-01' AND order_date < '2024-04-01';</pre>
<div class="callout tip"><b>Tip:</b> <code>WHERE STRFTIME('%m', order_date) = '03'</code> works, but wrapping a column in a function prevents index use. On big tables use a range (<code>&gt;=</code> and <code>&lt;</code>).</div>
<h2>In other databases</h2>
<table class="demo-table">
  <tr><th>Task</th><th>SQLite</th><th>MySQL</th><th>PostgreSQL</th><th>SQL Server</th></tr>
  <tr><td>Today</td><td>DATE('now')</td><td>CURDATE()</td><td>CURRENT_DATE</td><td>CAST(GETDATE() AS DATE)</td></tr>
  <tr><td>Add 7 days</td><td>DATE(d,'+7 days')</td><td>DATE_ADD(d, INTERVAL 7 DAY)</td><td>d + INTERVAL '7 days'</td><td>DATEADD(day, 7, d)</td></tr>
  <tr><td>Difference (days)</td><td>JULIANDAY(a)-JULIANDAY(b)</td><td>DATEDIFF(a, b)</td><td>a - b</td><td>DATEDIFF(day, b, a)</td></tr>
  <tr><td>Extract year</td><td>STRFTIME('%Y', d)</td><td>YEAR(d)</td><td>EXTRACT(YEAR FROM d)</td><td>YEAR(d)</td></tr>
</table>
`,
    ex: [
      { task: 'Show <code>id</code> and <code>order_date</code> of orders placed in <b>March 2024</b>.', hint: "order_date >= '2024-03-01' AND order_date < '2024-04-01'" },
      { task: 'Count orders per month — columns: month (as <code>YYYY-MM</code>) and the count.', hint: "GROUP BY STRFTIME('%Y-%m', order_date)" },
      { task: 'Show each employee\'s <code>name</code> and the number of days worked up to <b>2024-12-31</b> (a <code>JULIANDAY</code> difference).', hint: "JULIANDAY('2024-12-31') - JULIANDAY(join_date)" },
      { task: 'Show each order\'s <code>id</code> and the date <b>7 days after</b> the order date.', hint: "DATE(order_date, '+7 days')" }
    ],
    quiz: [
      { q: "What does DATE('2024-01-31', '+1 month') return in SQLite?", options: ['2024-02-29', '2024-03-02', '2024-02-31', 'NULL'], explain: 'SQLite builds "Feb 31" and overflows to 2024-03-02. Watch for edge cases when adding months.' },
      { q: 'Why store dates as "YYYY-MM-DD" text?', options: ['Uses less space', 'Text comparison and sorting stay correct', 'Keeps timezones right', 'No benefit'], explain: "In ISO format '2024-03-01' < '2024-12-01' — alphabetical order equals chronological order." },
      { q: 'What is wrong with WHERE STRFTIME(...) on a column?', options: ['Wrong results', 'Cannot use an index, slow on big tables', 'Error', 'Nothing'], explain: 'Wrapping a column in a function forces a full scan — range conditions are index-friendly.' }
    ]
  }
},

// ───────────────────────────── Advanced window functions
{
  id: 'window-adv', after: 'window', section: 'adv', title: 'অ্যাডভান্সড উইন্ডো ফাংশন',
  summary: 'ফ্রেম (ROWS BETWEEN), মুভিং এভারেজ, NTILE, FIRST_VALUE, মোটের শতাংশ',
  tables: ['orders', 'students', 'products', 'employees'],
  content: `
<h2>Window Frame — কোন রোগুলো হিসাবে ধরবে</h2>
<p>উইন্ডোর ভেতরে প্রতিটি রো-র জন্য একটা "ফ্রেম" থাকে — হিসাবটা শুধু ওই ফ্রেমের রোগুলো নিয়ে হয়।</p>
<pre class="syntax">AVG(x) OVER (
  ORDER BY date
  ROWS BETWEEN 2 PRECEDING AND CURRENT ROW   -- আগের ২টি + বর্তমান
)</pre>
<table class="demo-table">
  <tr><th>ফ্রেম অংশ</th><th>অর্থ</th></tr>
  <tr><td><code>UNBOUNDED PRECEDING</code></td><td>পার্টিশনের শুরু থেকে</td></tr>
  <tr><td><code>n PRECEDING</code></td><td>আগের n টি রো</td></tr>
  <tr><td><code>CURRENT ROW</code></td><td>বর্তমান রো</td></tr>
  <tr><td><code>n FOLLOWING</code></td><td>পরের n টি রো</td></tr>
  <tr><td><code>UNBOUNDED FOLLOWING</code></td><td>পার্টিশনের শেষ পর্যন্ত</td></tr>
</table>
<pre class="ex">-- ৩-অর্ডারের মুভিং এভারেজ (শেয়ার বাজার/বিক্রির ট্রেন্ড দেখতে)
SELECT id, order_date, quantity,
       ROUND(AVG(quantity) OVER (
         ORDER BY order_date
         ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS moving_avg_3
FROM orders;</pre>

<div class="callout warn"><b>LAST_VALUE-এর ফাঁদ:</b> <code>ORDER BY</code> দিলে ডিফল্ট ফ্রেম হয় "শুরু থেকে বর্তমান রো পর্যন্ত"। তাই <code>LAST_VALUE(x)</code> বর্তমান রো-র মানই দেয়! পুরো পার্টিশনের শেষ মান চাইলে লিখতে হয় <code>ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING</code>।</div>
<pre class="ex">SELECT name, dept_id, salary,
  FIRST_VALUE(name) OVER w AS top_earner,
  LAST_VALUE(name) OVER (PARTITION BY dept_id ORDER BY salary DESC
       ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS lowest_earner
FROM employees
WINDOW w AS (PARTITION BY dept_id ORDER BY salary DESC);</pre>
<p>উপরে <code>WINDOW w AS (...)</code> দিয়ে উইন্ডোকে নাম দেওয়া হয়েছে — একই উইন্ডো বারবার লিখতে হয় না।</p>

<h2>NTILE — সমান ভাগে ভাগ</h2>
<p><code>NTILE(4)</code> রোগুলোকে ৪টি প্রায়-সমান দলে (quartile) ভাগ করে। "শীর্ষ ২৫% ছাত্র" বের করতে কাজের।</p>
<pre class="ex">SELECT name, cgpa, NTILE(4) OVER (ORDER BY cgpa DESC) AS quartile
FROM students;</pre>

<h2>মোটের শতাংশ ও তুলনা</h2>
<p>খালি <code>OVER ()</code> মানে পুরো টেবিলই একটা উইন্ডো:</p>
<pre class="ex">SELECT name, price * stock AS value,
       ROUND(price * stock * 100.0 / SUM(price * stock) OVER (), 2) AS pct_of_total
FROM products
ORDER BY value DESC;</pre>
<pre class="ex">-- প্রত্যেকে তার বিভাগের গড়ের চেয়ে কত বেশি/কম
SELECT name, dept_id, cgpa,
       ROUND(cgpa - AVG(cgpa) OVER (PARTITION BY dept_id), 2) AS diff_from_avg,
       ROUND(PERCENT_RANK() OVER (ORDER BY cgpa), 2) AS pct_rank
FROM students;</pre>
`,
  exercises: [
    { task: 'অর্ডারগুলোর <code>id, order_date, quantity</code> ও তারিখ অনুযায়ী <b>৩-অর্ডারের মুভিং এভারেজ</b> (আগের ২টি + বর্তমান) দেখাও, তারিখ অনুযায়ী সাজিয়ে।', solution: 'SELECT id, order_date, quantity, AVG(quantity) OVER (ORDER BY order_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) FROM orders ORDER BY order_date;', hint: 'AVG(quantity) OVER (ORDER BY order_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)', ordered: true },
    { task: 'প্রতিটি ছাত্রের <code>name, cgpa</code> ও CGPA অনুযায়ী (বড় থেকে ছোট) <code>NTILE(4)</code> দেখাও।', solution: 'SELECT name, cgpa, NTILE(4) OVER (ORDER BY cgpa DESC) FROM students;', hint: 'NTILE(4) OVER (ORDER BY cgpa DESC)' },
    { task: 'প্রতিটি পণ্যের <code>name</code> ও মোট স্টক মূল্যের কত শতাংশ তার (<code>price*stock</code>) — ২ দশমিক ঘর পর্যন্ত।', solution: 'SELECT name, ROUND(price * stock * 100.0 / SUM(price * stock) OVER (), 2) FROM products;', hint: 'SUM(price * stock) OVER () দিয়ে মোট' },
    { task: 'প্রতিটি কর্মচারীর <code>name, dept_id, salary</code> ও নিজ বিভাগের সর্বোচ্চ বেতন (<code>FIRST_VALUE</code> বা <code>MAX ... OVER</code>) দেখাও।', solution: 'SELECT name, dept_id, salary, FIRST_VALUE(salary) OVER (PARTITION BY dept_id ORDER BY salary DESC) FROM employees;', hint: 'FIRST_VALUE(salary) OVER (PARTITION BY dept_id ORDER BY salary DESC)' }
  ],
  quiz: [
    { q: 'ORDER BY সহ উইন্ডোর ডিফল্ট ফ্রেম কী?', options: ['পুরো পার্টিশন', 'শুরু থেকে বর্তমান রো পর্যন্ত', 'শুধু বর্তমান রো', 'আগের ১টি রো'], answer: 1, explain: 'RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — এজন্যই LAST_VALUE অবাক করা ফল দেয়।' },
    { q: '১০টি রো-তে NTILE(3) দিলে দলগুলোর আকার কী?', options: ['3, 3, 4', '4, 3, 3', '3, 4, 3', 'সব 3'], answer: 1, explain: 'অতিরিক্ত রো প্রথম দলগুলোতে যায়: 4, 3, 3।' },
    { q: 'SUM(x) OVER () কী দেয়?', options: ['রানিং টোটাল', 'প্রতিটি রো-তে পুরো টেবিলের মোট', 'এরর', 'শুধু প্রথম রো'], answer: 1, explain: 'খালি OVER() = পুরো ফলাফল এক উইন্ডো।' }
  ],
  en: {
    title: 'Advanced Window Functions',
    summary: 'Frames (ROWS BETWEEN), moving averages, NTILE, FIRST_VALUE, percent of total',
    content: `
<h2>Window frames — which rows are included</h2>
<p>For every row, a window function looks at a "frame" of rows and computes over just those.</p>
<pre class="syntax">AVG(x) OVER (
  ORDER BY date
  ROWS BETWEEN 2 PRECEDING AND CURRENT ROW   -- previous 2 + current
)</pre>
<table class="demo-table">
  <tr><th>Frame bound</th><th>Meaning</th></tr>
  <tr><td><code>UNBOUNDED PRECEDING</code></td><td>From the start of the partition</td></tr>
  <tr><td><code>n PRECEDING</code></td><td>n rows before</td></tr>
  <tr><td><code>CURRENT ROW</code></td><td>The current row</td></tr>
  <tr><td><code>n FOLLOWING</code></td><td>n rows after</td></tr>
  <tr><td><code>UNBOUNDED FOLLOWING</code></td><td>To the end of the partition</td></tr>
</table>
<pre class="ex">-- 3-order moving average (spotting trends)
SELECT id, order_date, quantity,
       ROUND(AVG(quantity) OVER (
         ORDER BY order_date
         ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS moving_avg_3
FROM orders;</pre>
<div class="callout warn"><b>The LAST_VALUE trap:</b> with <code>ORDER BY</code>, the default frame is "start of partition to the current row", so <code>LAST_VALUE(x)</code> just returns the current row's value! For the true last value write <code>ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING</code>.</div>
<pre class="ex">SELECT name, dept_id, salary,
  FIRST_VALUE(name) OVER w AS top_earner,
  LAST_VALUE(name) OVER (PARTITION BY dept_id ORDER BY salary DESC
       ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS lowest_earner
FROM employees
WINDOW w AS (PARTITION BY dept_id ORDER BY salary DESC);</pre>
<p><code>WINDOW w AS (...)</code> names a window so you don't repeat it.</p>
<h2>NTILE — equal buckets</h2>
<p><code>NTILE(4)</code> splits rows into 4 roughly equal groups (quartiles). Great for "top 25% of students".</p>
<pre class="ex">SELECT name, cgpa, NTILE(4) OVER (ORDER BY cgpa DESC) AS quartile
FROM students;</pre>
<h2>Percent of total and comparisons</h2>
<p>An empty <code>OVER ()</code> makes the whole result one window:</p>
<pre class="ex">SELECT name, price * stock AS value,
       ROUND(price * stock * 100.0 / SUM(price * stock) OVER (), 2) AS pct_of_total
FROM products
ORDER BY value DESC;</pre>
<pre class="ex">-- How far each student is from their department average
SELECT name, dept_id, cgpa,
       ROUND(cgpa - AVG(cgpa) OVER (PARTITION BY dept_id), 2) AS diff_from_avg,
       ROUND(PERCENT_RANK() OVER (ORDER BY cgpa), 2) AS pct_rank
FROM students;</pre>
`,
    ex: [
      { task: 'Show orders\' <code>id, order_date, quantity</code> and a <b>3-order moving average</b> (previous 2 + current) by date, sorted by date.', hint: 'AVG(quantity) OVER (ORDER BY order_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)' },
      { task: 'Show each student\'s <code>name, cgpa</code> and <code>NTILE(4)</code> by CGPA (highest first).', hint: 'NTILE(4) OVER (ORDER BY cgpa DESC)' },
      { task: 'Show each product\'s <code>name</code> and its share (%) of total stock value (<code>price*stock</code>), rounded to 2 decimals.', hint: 'Total = SUM(price * stock) OVER ()' },
      { task: 'Show each employee\'s <code>name, dept_id, salary</code> and the highest salary in their department (<code>FIRST_VALUE</code> or <code>MAX ... OVER</code>).', hint: 'FIRST_VALUE(salary) OVER (PARTITION BY dept_id ORDER BY salary DESC)' }
    ],
    quiz: [
      { q: 'What is the default frame of a window with ORDER BY?', options: ['The whole partition', 'Start up to the current row', 'Only the current row', 'One previous row'], explain: 'RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — which is why LAST_VALUE surprises people.' },
      { q: 'NTILE(3) over 10 rows gives group sizes…', options: ['3, 3, 4', '4, 3, 3', '3, 4, 3', 'all 3'], explain: 'Extra rows go to the first groups: 4, 3, 3.' },
      { q: 'What does SUM(x) OVER () return?', options: ['A running total', 'The grand total on every row', 'An error', 'Only the first row'], explain: 'An empty OVER() treats the whole result as one window.' }
    ]
  }
},

// ───────────────────────────── JSON
{
  id: 'json', after: 'window-adv', section: 'adv', title: 'JSON ডেটা নিয়ে কাজ',
  summary: 'json_extract, ->>, json_each, JSON তৈরি — আধা-কাঠামোবদ্ধ ডেটা',
  tables: ['app_users', 'students'],
  content: `
<p>আধুনিক অ্যাপে অনেক সময় এমন ডেটা থাকে যার গঠন রো-ভেদে আলাদা — যেমন ইউজারের সেটিংস, API থেকে আসা ডেটা। এগুলো একটা কলামে <b>JSON</b> হিসেবে রাখা যায়। <code>app_users.profile</code> কলাম দেখো:</p>
<pre class="ex">SELECT * FROM app_users;</pre>

<h2>JSON থেকে মান বের করা</h2>
<p><code>json_extract(কলাম, '$.পথ')</code> অথবা শর্টকাট অপারেটর <code>-&gt;&gt;</code>। <code>$</code> মানে পুরো JSON, <code>.city</code> মানে city কী, <code>[0]</code> মানে অ্যারের প্রথম উপাদান।</p>
<pre class="ex">SELECT name,
       json_extract(profile, '$.age') AS age,
       profile ->> '$.city' AS city,
       profile ->> '$.skills[0]' AS first_skill
FROM app_users;</pre>
<pre class="ex">-- JSON-এর মান দিয়ে ফিল্টার (JSON true → 1)
SELECT name FROM app_users
WHERE json_extract(profile, '$.premium') = 1
  AND profile ->> '$.age' > 21;</pre>

<h2>অ্যারে ভেঙে রো বানানো: json_each</h2>
<p><code>json_each</code> একটা JSON অ্যারেকে টেবিলে পরিণত করে — প্রতিটি উপাদান একটি রো (<code>value</code> কলামে)।</p>
<pre class="ex">SELECT u.name, s.value AS skill
FROM app_users u, json_each(u.profile, '$.skills') s;</pre>
<pre class="ex">-- কোন স্কিল কতজনের আছে
SELECT s.value AS skill, COUNT(*) AS people
FROM app_users u, json_each(u.profile, '$.skills') s
GROUP BY s.value ORDER BY people DESC;</pre>

<h2>JSON তৈরি করা</h2>
<pre class="ex">SELECT json_object('name', name, 'cgpa', cgpa) AS obj FROM students LIMIT 3;</pre>
<pre class="ex">-- বিভাগ অনুযায়ী ছাত্রদের নামের JSON অ্যারে (API রেসপন্সের মতো)
SELECT dept_id, json_group_array(name) AS students
FROM students GROUP BY dept_id;</pre>
<p>অন্যান্য: <code>json_array_length</code>, <code>json_set</code> (মান বদলানো), <code>json_valid</code>, <code>json_type</code>।</p>
<div class="callout info"><b>কখন JSON, কখন আলাদা টেবিল?</b> যে ডেটা দিয়ে প্রায়ই খোঁজ/JOIN/হিসাব হবে, সেটা আলাদা কলাম/টেবিলে রাখো (নরমালাইজেশন)। শুধু সংরক্ষণ বা মাঝেমধ্যে পড়ার ডেটা JSON-এ রাখা সুবিধাজনক। PostgreSQL-এর <code>JSONB</code> টাইপ ও GIN index JSON-এ খুব দ্রুত খোঁজ করতে দেয়।</div>
`,
  exercises: [
    { task: 'প্রতিটি ইউজারের <code>name</code> ও profile থেকে <code>city</code> দেখাও।', solution: "SELECT name, profile ->> '$.city' FROM app_users;", hint: "profile ->> '$.city' অথবা json_extract(profile, '$.city')" },
    { task: '<b>premium</b> ইউজারদের <code>name</code> দেখাও।', solution: "SELECT name FROM app_users WHERE json_extract(profile, '$.premium') = 1;", hint: "json_extract(profile, '$.premium') = 1" },
    { task: 'প্রতিটি ইউজারের <code>name</code> ও তার কতগুলো skill আছে দেখাও।', solution: "SELECT name, json_array_length(profile, '$.skills') FROM app_users;", hint: "json_array_length(profile, '$.skills')" },
    { task: 'প্রতিটি ইউজার-স্কিল জোড়ার জন্য একটি রো: <code>name</code> ও skill।', solution: "SELECT u.name, s.value FROM app_users u, json_each(u.profile, '$.skills') s;", hint: "FROM app_users u, json_each(u.profile, '$.skills') s" }
  ],
  quiz: [
    { q: "json_extract(data, '$.items[1]') কী দেয়?", options: ['items অ্যারের প্রথম উপাদান', 'items অ্যারের দ্বিতীয় উপাদান', 'items-এর দৈর্ঘ্য', 'এরর'], answer: 1, explain: 'JSON অ্যারের ইনডেক্স ০ থেকে শুরু।' },
    { q: 'JSON অ্যারেকে আলাদা রো-তে ভাঙতে কোন ফাংশন?', options: ['json_extract', 'json_each', 'json_object', 'json_valid'], answer: 1, explain: 'json_each একটি table-valued function।' },
    { q: 'কোন ডেটা JSON-এ না রেখে আলাদা কলামে রাখা উচিত?', options: ['যা দিয়ে প্রায়ই খোঁজ ও JOIN হয়', 'ইউজার সেটিংস', 'API লগ', 'কোনোটাই না'], answer: 0, explain: 'ঘন ঘন ব্যবহৃত ডেটা নরমালাইজ করলে index ও কনস্ট্রেইন্ট ব্যবহার করা যায়।' }
  ],
  en: {
    title: 'Working with JSON',
    summary: 'json_extract, ->>, json_each, building JSON — semi-structured data',
    content: `
<p>Modern apps often have data whose shape varies per row — user settings, API payloads. You can keep it in one column as <b>JSON</b>. Look at <code>app_users.profile</code>:</p>
<pre class="ex">SELECT * FROM app_users;</pre>
<h2>Reading values from JSON</h2>
<p><code>json_extract(column, '$.path')</code> or the shortcut operator <code>-&gt;&gt;</code>. <code>$</code> is the whole document, <code>.city</code> a key, <code>[0]</code> the first array element.</p>
<pre class="ex">SELECT name,
       json_extract(profile, '$.age') AS age,
       profile ->> '$.city' AS city,
       profile ->> '$.skills[0]' AS first_skill
FROM app_users;</pre>
<pre class="ex">-- Filtering on JSON values (JSON true → 1)
SELECT name FROM app_users
WHERE json_extract(profile, '$.premium') = 1
  AND profile ->> '$.age' > 21;</pre>
<h2>Turning arrays into rows: json_each</h2>
<p><code>json_each</code> turns a JSON array into a table — one row per element (in the <code>value</code> column).</p>
<pre class="ex">SELECT u.name, s.value AS skill
FROM app_users u, json_each(u.profile, '$.skills') s;</pre>
<pre class="ex">-- How many people have each skill
SELECT s.value AS skill, COUNT(*) AS people
FROM app_users u, json_each(u.profile, '$.skills') s
GROUP BY s.value ORDER BY people DESC;</pre>
<h2>Building JSON</h2>
<pre class="ex">SELECT json_object('name', name, 'cgpa', cgpa) AS obj FROM students LIMIT 3;</pre>
<pre class="ex">-- JSON array of student names per department (like an API response)
SELECT dept_id, json_group_array(name) AS students
FROM students GROUP BY dept_id;</pre>
<p>Also useful: <code>json_array_length</code>, <code>json_set</code> (modify), <code>json_valid</code>, <code>json_type</code>.</p>
<div class="callout info"><b>JSON or a separate table?</b> Data you search, join or aggregate often belongs in real columns/tables (normalization). JSON suits data you mostly store and occasionally read. PostgreSQL's <code>JSONB</code> type with GIN indexes makes JSON queries fast.</div>
`,
    ex: [
      { task: 'Show each user\'s <code>name</code> and the <code>city</code> from their profile.', hint: "profile ->> '$.city' or json_extract(profile, '$.city')" },
      { task: 'Show the <code>name</code> of <b>premium</b> users.', hint: "json_extract(profile, '$.premium') = 1" },
      { task: 'Show each user\'s <code>name</code> and how many skills they have.', hint: "json_array_length(profile, '$.skills')" },
      { task: 'One row per user-skill pair: <code>name</code> and the skill.', hint: "FROM app_users u, json_each(u.profile, '$.skills') s" }
    ],
    quiz: [
      { q: "What does json_extract(data, '$.items[1]') return?", options: ['The first item', 'The second item', 'The length of items', 'An error'], explain: 'JSON array indexes start at 0.' },
      { q: 'Which function splits a JSON array into rows?', options: ['json_extract', 'json_each', 'json_object', 'json_valid'], explain: 'json_each is a table-valued function.' },
      { q: 'Which data should live in real columns instead of JSON?', options: ['Data you filter and join on often', 'User settings', 'API logs', 'None'], explain: 'Normalized columns can use indexes and constraints.' }
    ]
  }
},

// ───────────────────────────── UPSERT & RETURNING
{
  id: 'upsert', after: 'delete', section: 'dml', title: 'UPSERT ও RETURNING',
  summary: 'থাকলে আপডেট, না থাকলে ইনসার্ট — ON CONFLICT; পরিবর্তিত রো ফেরত পাওয়া',
  tables: ['products', 'orders'],
  content: `
<p>বাস্তবে প্রায়ই দরকার হয়: "এই পণ্য আগে থাকলে স্টক আপডেট করো, না থাকলে নতুন যোগ করো"। আলাদা SELECT করে তারপর INSERT/UPDATE করলে দুটো ইউজার একসাথে করলে গোলমাল হতে পারে। তাই এক স্টেটমেন্টে — <b>UPSERT</b> (update + insert)।</p>
<pre class="syntax">INSERT INTO টেবিল (কলাম...) VALUES (...)
ON CONFLICT (ইউনিক_কলাম) DO UPDATE SET কলাম = excluded.কলাম;
-- অথবা
ON CONFLICT (ইউনিক_কলাম) DO NOTHING;</pre>
<p><code>excluded</code> মানে "যে মানটা ইনসার্ট করতে চেয়েছিলাম"। ON CONFLICT-এর কলামে PRIMARY KEY বা UNIQUE থাকতে হবে।</p>
<pre class="ex">-- id 3 আগে থেকেই আছে → শুধু stock আপডেট হবে
INSERT INTO products (id, name, category, price, stock)
VALUES (3, 'Headphone', 'Electronics', 2500, 120)
ON CONFLICT (id) DO UPDATE SET stock = excluded.stock;

SELECT * FROM products WHERE id = 3;</pre>
<pre class="ex">-- পুরনো মানের সাথে যোগ: স্টক বাড়াও
INSERT INTO products (id, name, category, price, stock)
VALUES (7, 'Rice 5kg', 'Grocery', 450, 10)
ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock;

SELECT * FROM products WHERE id = 7;</pre>

<h2>অন্য রূপ</h2>
<ul>
  <li><code>INSERT OR IGNORE</code> — কনফ্লিক্ট হলে চুপচাপ বাদ (= DO NOTHING)।</li>
  <li><code>INSERT OR REPLACE</code> — পুরনো রো <b>মুছে</b> নতুন বসায়। সাবধান: যে কলাম দাওনি সেগুলো NULL হয়ে যাবে, আর ON DELETE ট্রিগার/CASCADE চলতে পারে।</li>
</ul>

<h2>RETURNING — কী বদলালো তা সাথে সাথে দেখো</h2>
<p>INSERT/UPDATE/DELETE-এর শেষে <code>RETURNING</code> দিলে পরিবর্তিত রোগুলো ফলাফল হিসেবে ফেরত আসে — নতুন id জানতে বা লগ রাখতে আলাদা SELECT লাগে না।</p>
<pre class="ex">INSERT INTO products (name, category, price, stock)
VALUES ('Keyboard', 'Electronics', 1500, 25)
RETURNING id, name;</pre>
<pre class="ex">DELETE FROM orders WHERE status = 'Cancelled' RETURNING id, customer_name;</pre>

<h2>বিভিন্ন ডেটাবেসে</h2>
<table class="demo-table">
  <tr><th>ডেটাবেস</th><th>UPSERT</th><th>RETURNING</th></tr>
  <tr><td>SQLite / PostgreSQL</td><td><code>ON CONFLICT ... DO UPDATE</code></td><td>আছে</td></tr>
  <tr><td>MySQL</td><td><code>ON DUPLICATE KEY UPDATE col = VALUES(col)</code></td><td>নেই (MariaDB-তে আছে)</td></tr>
  <tr><td>SQL Server / Oracle</td><td><code>MERGE INTO ... WHEN MATCHED ... WHEN NOT MATCHED</code></td><td><code>OUTPUT</code> (SQL Server)</td></tr>
</table>
`,
  exercises: [
    { task: 'UPSERT দিয়ে <b>id 3</b> (Headphone)-এর stock <b>120</b> করো: <code>VALUES (3, \'Headphone\', \'Electronics\', 2500, 120)</code>।', solution: "INSERT INTO products (id, name, category, price, stock) VALUES (3, 'Headphone', 'Electronics', 2500, 120) ON CONFLICT (id) DO UPDATE SET stock = excluded.stock;", check: 'SELECT * FROM products ORDER BY id;', hint: 'ON CONFLICT (id) DO UPDATE SET stock = excluded.stock' },
    { task: 'একই UPSERT প্যাটার্নে নতুন পণ্য যোগ করো: <code>(14, \'Keyboard\', \'Electronics\', 1500, 25)</code>।', solution: "INSERT INTO products (id, name, category, price, stock) VALUES (14, 'Keyboard', 'Electronics', 1500, 25) ON CONFLICT (id) DO UPDATE SET stock = excluded.stock;", check: 'SELECT * FROM products ORDER BY id;', hint: 'id 14 নেই, তাই সাধারণ ইনসার্ট হবে।' },
    { task: '<b>id 7</b> (Rice 5kg)-এর স্টক <b>10 বাড়াও</b> UPSERT দিয়ে (পুরনো স্টক + নতুন)।', solution: "INSERT INTO products (id, name, category, price, stock) VALUES (7, 'Rice 5kg', 'Grocery', 450, 10) ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock;", check: 'SELECT * FROM products ORDER BY id;', hint: 'SET stock = stock + excluded.stock' },
    { task: '<b>Cancelled</b> অর্ডারগুলো মুছে ফেলো এবং <code>RETURNING</code> দিয়ে মুছে ফেলা অর্ডারের <code>id</code> দেখাও।', solution: "DELETE FROM orders WHERE status = 'Cancelled' RETURNING id;", hint: "DELETE ... RETURNING id" }
  ],
  quiz: [
    { q: 'ON CONFLICT ... DO UPDATE-এ excluded.stock মানে কী?', options: ['পুরনো স্টক', 'যে মানটি ইনসার্ট করতে চাওয়া হয়েছিল', 'মুছে ফেলা স্টক', 'NULL'], answer: 1, explain: 'excluded = কনফ্লিক্টের কারণে যে রো ইনসার্ট হয়নি তার মান।' },
    { q: 'INSERT OR REPLACE-এর বিপদ কী?', options: ['ধীর', 'পুরনো রো মুছে নতুন বসায় — না দেওয়া কলাম NULL হয়', 'এরর দেয়', 'কিছু না'], answer: 1, explain: 'এটা আসলে DELETE + INSERT।' },
    { q: 'MySQL-এ UPSERT-এর সিনট্যাক্স?', options: ['ON CONFLICT', 'ON DUPLICATE KEY UPDATE', 'MERGE', 'UPSERT INTO'], answer: 1, explain: 'MySQL: INSERT ... ON DUPLICATE KEY UPDATE।' }
  ],
  en: {
    title: 'UPSERT & RETURNING',
    summary: 'Update if it exists, insert if not — ON CONFLICT; getting changed rows back',
    content: `
<p>A frequent need: "if this product exists, update its stock; otherwise add it". Doing a SELECT and then INSERT/UPDATE separately can break when two users do it at once. So we do it in one statement — <b>UPSERT</b> (update + insert).</p>
<pre class="syntax">INSERT INTO table (cols...) VALUES (...)
ON CONFLICT (unique_col) DO UPDATE SET col = excluded.col;
-- or
ON CONFLICT (unique_col) DO NOTHING;</pre>
<p><code>excluded</code> means "the values I tried to insert". The ON CONFLICT column must be a PRIMARY KEY or UNIQUE.</p>
<pre class="ex">-- id 3 already exists → only stock is updated
INSERT INTO products (id, name, category, price, stock)
VALUES (3, 'Headphone', 'Electronics', 2500, 120)
ON CONFLICT (id) DO UPDATE SET stock = excluded.stock;

SELECT * FROM products WHERE id = 3;</pre>
<pre class="ex">-- Add to the existing value: increase stock
INSERT INTO products (id, name, category, price, stock)
VALUES (7, 'Rice 5kg', 'Grocery', 450, 10)
ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock;

SELECT * FROM products WHERE id = 7;</pre>
<h2>Other forms</h2>
<ul>
  <li><code>INSERT OR IGNORE</code> — silently skip on conflict (= DO NOTHING).</li>
  <li><code>INSERT OR REPLACE</code> — <b>deletes</b> the old row and inserts a new one. Careful: columns you didn't supply become NULL, and delete triggers/cascades may fire.</li>
</ul>
<h2>RETURNING — see what changed immediately</h2>
<p>Add <code>RETURNING</code> to INSERT/UPDATE/DELETE and the affected rows come back as a result — no extra SELECT to learn the new id.</p>
<pre class="ex">INSERT INTO products (name, category, price, stock)
VALUES ('Keyboard', 'Electronics', 1500, 25)
RETURNING id, name;</pre>
<pre class="ex">DELETE FROM orders WHERE status = 'Cancelled' RETURNING id, customer_name;</pre>
<h2>Across databases</h2>
<table class="demo-table">
  <tr><th>Database</th><th>UPSERT</th><th>RETURNING</th></tr>
  <tr><td>SQLite / PostgreSQL</td><td><code>ON CONFLICT ... DO UPDATE</code></td><td>Yes</td></tr>
  <tr><td>MySQL</td><td><code>ON DUPLICATE KEY UPDATE col = VALUES(col)</code></td><td>No (MariaDB has it)</td></tr>
  <tr><td>SQL Server / Oracle</td><td><code>MERGE INTO ... WHEN MATCHED ... WHEN NOT MATCHED</code></td><td><code>OUTPUT</code> (SQL Server)</td></tr>
</table>
`,
    ex: [
      { task: 'Use an UPSERT to set the stock of <b>id 3</b> (Headphone) to <b>120</b>: <code>VALUES (3, \'Headphone\', \'Electronics\', 2500, 120)</code>.', hint: 'ON CONFLICT (id) DO UPDATE SET stock = excluded.stock' },
      { task: 'With the same UPSERT pattern add a new product: <code>(14, \'Keyboard\', \'Electronics\', 1500, 25)</code>.', hint: 'id 14 does not exist, so it becomes a normal insert.' },
      { task: '<b>Increase</b> the stock of <b>id 7</b> (Rice 5kg) <b>by 10</b> using an UPSERT (old stock + new).', hint: 'SET stock = stock + excluded.stock' },
      { task: 'Delete the <b>Cancelled</b> orders and use <code>RETURNING</code> to show the deleted order <code>id</code>s.', hint: 'DELETE ... RETURNING id' }
    ],
    quiz: [
      { q: 'In ON CONFLICT ... DO UPDATE, what is excluded.stock?', options: ['The old stock', 'The value we tried to insert', 'Deleted stock', 'NULL'], explain: 'excluded = the row that could not be inserted because of the conflict.' },
      { q: 'What is dangerous about INSERT OR REPLACE?', options: ['Slow', 'It deletes the old row — unspecified columns become NULL', 'Errors', 'Nothing'], explain: 'It is really DELETE + INSERT.' },
      { q: 'UPSERT syntax in MySQL?', options: ['ON CONFLICT', 'ON DUPLICATE KEY UPDATE', 'MERGE', 'UPSERT INTO'], explain: 'MySQL: INSERT ... ON DUPLICATE KEY UPDATE.' }
    ]
  }
},

// ───────────────────────────── Triggers
{
  id: 'triggers', after: 'index-view', section: 'ddl', title: 'TRIGGER — স্বয়ংক্রিয় কাজ',
  summary: 'INSERT/UPDATE/DELETE হলে নিজে থেকে চলা কোড: অডিট লগ, ভ্যালিডেশন',
  tables: ['employees', 'products'],
  content: `
<p><b>ট্রিগার</b> হলো ডেটাবেসে সেভ করা এমন কোড, যেটা কোনো টেবিলে INSERT, UPDATE বা DELETE হলে <b>নিজে থেকেই</b> চলে। অ্যাপের কোড ভুলে গেলেও ডেটাবেস নিয়ম মেনে চলে।</p>
<pre class="syntax">CREATE TRIGGER নাম
{BEFORE | AFTER} {INSERT | UPDATE [OF কলাম] | DELETE} ON টেবিল
[WHEN শর্ত]
BEGIN
  ... এক বা একাধিক স্টেটমেন্ট ...;
END;</pre>
<p>ট্রিগারের ভেতরে <code>NEW.কলাম</code> = নতুন মান (INSERT/UPDATE), <code>OLD.কলাম</code> = পুরনো মান (UPDATE/DELETE)।</p>

<h2>উদাহরণ ১: অডিট লগ</h2>
<p>কে কবে কার বেতন বদলালো — হিসাব রাখা খুব জরুরি (বিশেষ করে ব্যাংক, HR সিস্টেমে):</p>
<pre class="ex">CREATE TABLE salary_log (emp_id INTEGER, old_salary INTEGER, new_salary INTEGER,
                         changed_at TEXT DEFAULT CURRENT_TIMESTAMP);

CREATE TRIGGER log_salary_change
AFTER UPDATE OF salary ON employees
BEGIN
  INSERT INTO salary_log (emp_id, old_salary, new_salary)
  VALUES (OLD.id, OLD.salary, NEW.salary);
END;

UPDATE employees SET salary = salary + 5000 WHERE role = 'Lecturer';
SELECT * FROM salary_log;</pre>

<h2>উদাহরণ ২: ভ্যালিডেশন — খারাপ ডেটা আটকাও</h2>
<p><code>RAISE(ABORT, 'মেসেজ')</code> স্টেটমেন্টটা বাতিল করে এরর দেয়:</p>
<pre class="ex">CREATE TRIGGER no_negative_stock
BEFORE UPDATE OF stock ON products
WHEN NEW.stock < 0
BEGIN
  SELECT RAISE(ABORT, 'Stock cannot be negative');
END;

UPDATE products SET stock = stock - 50 WHERE id = 1;  -- Laptop-এর স্টক ১২ → এরর</pre>

<h2>উদাহরণ ৩: স্বয়ংক্রিয় হিসাব</h2>
<pre class="ex">CREATE TRIGGER reduce_stock_on_order
AFTER INSERT ON orders
BEGIN
  UPDATE products SET stock = stock - NEW.quantity WHERE id = NEW.product_id;
END;

INSERT INTO orders (customer_name, city, product_id, quantity, order_date, status)
VALUES ('Test User', 'Dhaka', 2, 3, '2024-05-01', 'Pending');
SELECT name, stock FROM products WHERE id = 2;   -- 40 → 37</pre>
<div class="callout warn"><b>সাবধান:</b> ট্রিগার "অদৃশ্য" — কোড পড়ে বোঝা যায় না যে আড়ালে কিছু ঘটছে। বেশি ট্রিগার ডিবাগ করা কঠিন ও পারফরম্যান্স কমায়। অডিট, সামঞ্জস্য রক্ষার মতো জরুরি কাজেই ব্যবহার করো। মুছতে: <code>DROP TRIGGER নাম;</code></div>
<p>MySQL/PostgreSQL-এ ট্রিগারের পাশাপাশি <b>Stored Procedure</b> (ডেটাবেসে সেভ করা ফাংশন) আছে; PostgreSQL-এ ট্রিগার একটা function কল করে। SQLite-এ stored procedure নেই।</p>
`,
  exercises: [
    { task: '<code>salary_log (emp_id INTEGER, old_salary INTEGER, new_salary INTEGER)</code> টেবিল বানাও, <code>employees</code>-এর salary আপডেট হলে লগ রাখার AFTER UPDATE ট্রিগার বানাও, তারপর <code>UPDATE employees SET salary = 70000 WHERE id = 3;</code> চালাও।', solution: 'CREATE TABLE salary_log (emp_id INTEGER, old_salary INTEGER, new_salary INTEGER); CREATE TRIGGER log_salary AFTER UPDATE OF salary ON employees BEGIN INSERT INTO salary_log VALUES (OLD.id, OLD.salary, NEW.salary); END; UPDATE employees SET salary = 70000 WHERE id = 3;', check: 'SELECT * FROM salary_log;', hint: 'তিনটি স্টেটমেন্ট: CREATE TABLE; CREATE TRIGGER ... BEGIN INSERT ... VALUES (OLD.id, OLD.salary, NEW.salary); END; UPDATE ...;' },
    { task: '<b>no_negative_stock</b> নামে একটি BEFORE UPDATE ট্রিগার বানাও যেটা <code>products</code>-এর stock ঋণাত্মক হলে <code>RAISE(ABORT, ...)</code> দেয়।', solution: "CREATE TRIGGER no_negative_stock BEFORE UPDATE OF stock ON products WHEN NEW.stock < 0 BEGIN SELECT RAISE(ABORT, 'Stock cannot be negative'); END;", check: "SELECT name, tbl_name FROM sqlite_master WHERE type = 'trigger';", hint: 'WHEN NEW.stock < 0 BEGIN SELECT RAISE(ABORT, ...); END;' }
  ],
  quiz: [
    { q: 'DELETE ট্রিগারে কোনটি ব্যবহার করা যায়?', options: ['NEW', 'OLD', 'দুটোই', 'কোনোটাই না'], answer: 1, explain: 'DELETE-এ শুধু পুরনো (OLD) রো থাকে; INSERT-এ শুধু NEW; UPDATE-এ দুটোই।' },
    { q: 'ডেটা ভ্যালিডেশনের জন্য BEFORE না AFTER ট্রিগার ভালো?', options: ['BEFORE', 'AFTER', 'পার্থক্য নেই', 'কোনোটাই না'], answer: 0, explain: 'BEFORE ট্রিগারে পরিবর্তন হওয়ার আগেই আটকানো যায়।' },
    { q: 'ট্রিগারের প্রধান অসুবিধা কী?', options: ['কাজ করে না', 'লুকানো আচরণ — ডিবাগ কঠিন', 'শুধু SQLite-এ আছে', 'ডেটা মুছে দেয়'], answer: 1, explain: 'কোড পড়ে বোঝা যায় না আড়ালে কী ঘটছে।' }
  ],
  en: {
    title: 'TRIGGER — automatic actions',
    summary: 'Code that runs by itself on INSERT/UPDATE/DELETE: audit logs, validation',
    content: `
<p>A <b>trigger</b> is code stored in the database that runs <b>automatically</b> when a table gets an INSERT, UPDATE or DELETE. Even if application code forgets a rule, the database still enforces it.</p>
<pre class="syntax">CREATE TRIGGER name
{BEFORE | AFTER} {INSERT | UPDATE [OF column] | DELETE} ON table
[WHEN condition]
BEGIN
  ... one or more statements ...;
END;</pre>
<p>Inside a trigger, <code>NEW.column</code> is the new value (INSERT/UPDATE) and <code>OLD.column</code> the old value (UPDATE/DELETE).</p>
<h2>Example 1: audit log</h2>
<p>Recording who changed whose salary and when is essential in banking and HR systems:</p>
<pre class="ex">CREATE TABLE salary_log (emp_id INTEGER, old_salary INTEGER, new_salary INTEGER,
                         changed_at TEXT DEFAULT CURRENT_TIMESTAMP);

CREATE TRIGGER log_salary_change
AFTER UPDATE OF salary ON employees
BEGIN
  INSERT INTO salary_log (emp_id, old_salary, new_salary)
  VALUES (OLD.id, OLD.salary, NEW.salary);
END;

UPDATE employees SET salary = salary + 5000 WHERE role = 'Lecturer';
SELECT * FROM salary_log;</pre>
<h2>Example 2: validation — block bad data</h2>
<p><code>RAISE(ABORT, 'message')</code> cancels the statement with an error:</p>
<pre class="ex">CREATE TRIGGER no_negative_stock
BEFORE UPDATE OF stock ON products
WHEN NEW.stock < 0
BEGIN
  SELECT RAISE(ABORT, 'Stock cannot be negative');
END;

UPDATE products SET stock = stock - 50 WHERE id = 1;  -- Laptop stock is 12 → error</pre>
<h2>Example 3: automatic bookkeeping</h2>
<pre class="ex">CREATE TRIGGER reduce_stock_on_order
AFTER INSERT ON orders
BEGIN
  UPDATE products SET stock = stock - NEW.quantity WHERE id = NEW.product_id;
END;

INSERT INTO orders (customer_name, city, product_id, quantity, order_date, status)
VALUES ('Test User', 'Dhaka', 2, 3, '2024-05-01', 'Pending');
SELECT name, stock FROM products WHERE id = 2;   -- 40 → 37</pre>
<div class="callout warn"><b>Careful:</b> triggers are "invisible" — reading app code doesn't reveal what happens behind the scenes. Too many triggers are hard to debug and slow writes down. Use them for audits and integrity rules. Remove with <code>DROP TRIGGER name;</code></div>
<p>MySQL/PostgreSQL also have <b>stored procedures</b> (functions saved in the database); PostgreSQL triggers call a function. SQLite has no stored procedures.</p>
`,
    ex: [
      { task: 'Create <code>salary_log (emp_id INTEGER, old_salary INTEGER, new_salary INTEGER)</code>, an AFTER UPDATE trigger on <code>employees</code> salary that logs changes, then run <code>UPDATE employees SET salary = 70000 WHERE id = 3;</code>', hint: 'Three statements: CREATE TABLE; CREATE TRIGGER ... BEGIN INSERT ... VALUES (OLD.id, OLD.salary, NEW.salary); END; UPDATE ...;' },
      { task: 'Create a BEFORE UPDATE trigger named <b>no_negative_stock</b> that raises <code>RAISE(ABORT, ...)</code> when a product\'s stock would go negative.', hint: 'WHEN NEW.stock < 0 BEGIN SELECT RAISE(ABORT, ...); END;' }
    ],
    quiz: [
      { q: 'Which can a DELETE trigger use?', options: ['NEW', 'OLD', 'Both', 'Neither'], explain: 'DELETE has only the OLD row; INSERT only NEW; UPDATE has both.' },
      { q: 'For validation, BEFORE or AFTER triggers?', options: ['BEFORE', 'AFTER', 'No difference', 'Neither'], explain: 'A BEFORE trigger stops the change before it happens.' },
      { q: 'The main drawback of triggers?', options: ['They don\'t work', 'Hidden behaviour — hard to debug', 'SQLite-only', 'They delete data'], explain: 'You cannot see what happens behind the scenes by reading app code.' }
    ]
  }
},

// ───────────────────────────── Query optimization
{
  id: 'optimization', after: 'triggers', section: 'ddl', title: 'কুয়েরি অপ্টিমাইজেশন',
  summary: 'EXPLAIN QUERY PLAN, sargable শর্ত, composite index, দ্রুত কুয়েরি লেখার নিয়ম',
  tables: ['orders', 'students'],
  content: `
<p>১৬ রো-র টেবিলে সব কুয়েরিই দ্রুত। কিন্তু ১ কোটি রো-তে ভুল কুয়েরি মিনিট নিতে পারে, সঠিক কুয়েরি মিলিসেকেন্ড। চলো দেখি ডেটাবেস কীভাবে কুয়েরি চালায়।</p>
<h2>EXPLAIN QUERY PLAN — ডেটাবেসের পরিকল্পনা দেখো</h2>
<pre class="ex">EXPLAIN QUERY PLAN
SELECT * FROM students WHERE city = 'Dhaka';</pre>
<p><code>SCAN students</code> মানে পুরো টেবিল এক এক করে পড়ছে (ধীর)। এবার index দিয়ে:</p>
<pre class="ex">CREATE INDEX idx_city ON students(city);
EXPLAIN QUERY PLAN
SELECT * FROM students WHERE city = 'Dhaka';</pre>
<p>এখন <code>SEARCH students USING INDEX idx_city</code> — সরাসরি দরকারি রো-তে যাচ্ছে (দ্রুত)। PostgreSQL/MySQL-এ <code>EXPLAIN</code> / <code>EXPLAIN ANALYZE</code>।</p>

<h2>Sargable — index ব্যবহারযোগ্য শর্ত লেখো</h2>
<p>কলামকে ফাংশন বা হিসাবের ভেতরে রাখলে ডেটাবেস index ব্যবহার করতে পারে না:</p>
<table class="demo-table">
  <tr><th>❌ ধীর (index কাজ করে না)</th><th>✅ দ্রুত</th></tr>
  <tr><td><code>WHERE STRFTIME('%Y', order_date) = '2024'</code></td><td><code>WHERE order_date &gt;= '2024-01-01' AND order_date &lt; '2025-01-01'</code></td></tr>
  <tr><td><code>WHERE salary * 12 &gt; 1200000</code></td><td><code>WHERE salary &gt; 100000</code></td></tr>
  <tr><td><code>WHERE UPPER(city) = 'DHAKA'</code></td><td><code>WHERE city = 'Dhaka'</code> (ডেটা পরিষ্কার রাখো)</td></tr>
  <tr><td><code>WHERE name LIKE '%rim'</code> (শুরুতে %)</td><td><code>WHERE name LIKE 'Ra%'</code></td></tr>
</table>
<pre class="ex">CREATE INDEX idx_date ON orders(order_date);
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE STRFTIME('%m', order_date) = '03';</pre>
<pre class="ex">CREATE INDEX idx_date ON orders(order_date);
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE order_date >= '2024-03-01' AND order_date < '2024-04-01';</pre>

<h2>Composite index — কলামের ক্রম জরুরি</h2>
<p><code>CREATE INDEX idx ON students(dept_id, cgpa)</code> টেলিফোন ডিরেক্টরির মতো — আগে dept_id, তারপর cgpa অনুযায়ী সাজানো। তাই:</p>
<ul>
  <li>✅ <code>WHERE dept_id = 1</code> — index কাজ করে</li>
  <li>✅ <code>WHERE dept_id = 1 AND cgpa &gt; 3.5</code> — index পুরোপুরি কাজ করে</li>
  <li>❌ <code>WHERE cgpa &gt; 3.5</code> একা — প্রথম কলাম ছাড়া index কাজে লাগে না (leftmost prefix rule)</li>
</ul>
<p><b>Covering index:</b> কুয়েরির সব কলাম index-এই থাকলে মূল টেবিল পড়তেই হয় না — সবচেয়ে দ্রুত।</p>
<pre class="ex">CREATE INDEX idx_dept_cgpa ON students(dept_id, cgpa);
EXPLAIN QUERY PLAN SELECT dept_id, cgpa FROM students WHERE dept_id = 1 AND cgpa > 3.5;</pre>

<h2>দ্রুত কুয়েরির চেকলিস্ট</h2>
<ol>
  <li><code>SELECT *</code> নয় — শুধু দরকারি কলাম।</li>
  <li>WHERE, JOIN, ORDER BY-র কলামে index; কিন্তু অপ্রয়োজনীয় index নয় (লেখা ধীর হয়)।</li>
  <li>আগে ফিল্টার, পরে JOIN/GROUP — যত কম রো, তত দ্রুত।</li>
  <li>বড় ফলাফলে <code>LIMIT</code> ও pagination; বিশাল OFFSET-এর বদলে <code>WHERE id &gt; শেষ_id</code> (keyset pagination)।</li>
  <li>লুপে একটা একটা কুয়েরি (N+1 সমস্যা) নয় — একটা JOIN বা <code>IN (...)</code> দিয়ে একবারে।</li>
  <li>অনেক রো ইনসার্টে ট্রানজ্যাকশন ব্যবহার করো — শতগুণ দ্রুত হয়।</li>
  <li>অনুমান নয়, মাপো: <code>EXPLAIN</code> দেখো, সময় মাপো।</li>
</ol>
`,
  exercises: [
    { task: '<code>orders</code> টেবিলের <code>order_date</code> কলামে <b>idx_orders_date</b> নামে index বানাও।', solution: 'CREATE INDEX idx_orders_date ON orders(order_date);', check: "SELECT name, tbl_name FROM sqlite_master WHERE type = 'index' AND name NOT LIKE 'sqlite_%';", hint: 'CREATE INDEX idx_orders_date ON orders(order_date);' },
    { task: 'ফেব্রুয়ারি ২০২৪-এর অর্ডারের <code>id, order_date</code> দেখাও — কিন্তু <b>sargable</b> উপায়ে (কলামে ফাংশন ছাড়া, রেঞ্জ দিয়ে)।', solution: "SELECT id, order_date FROM orders WHERE order_date >= '2024-02-01' AND order_date < '2024-03-01';", hint: "order_date >= '2024-02-01' AND order_date < '2024-03-01'" },
    { task: '<code>students</code>-এ <code>(dept_id, cgpa)</code> কলামে <b>idx_students_dept_cgpa</b> নামে composite index বানাও।', solution: 'CREATE INDEX idx_students_dept_cgpa ON students(dept_id, cgpa);', check: "SELECT name, tbl_name FROM sqlite_master WHERE type = 'index' AND name NOT LIKE 'sqlite_%';", hint: 'ON students(dept_id, cgpa)' }
  ],
  quiz: [
    { q: "WHERE UPPER(email) = 'A@X.COM' — email-এ index থাকলেও সমস্যা কী?", options: ['এরর', 'ফাংশনের কারণে index ব্যবহার হয় না', 'ভুল ফল', 'কোনো সমস্যা নেই'], answer: 1, explain: 'কলাম ফাংশনে মোড়ালে non-sargable হয়।' },
    { q: 'Index (a, b) আছে। কোন কুয়েরি index ভালোভাবে ব্যবহার করতে পারবে না?', options: ['WHERE a = 1', 'WHERE a = 1 AND b = 2', 'WHERE b = 2', 'WHERE a = 1 ORDER BY b'], answer: 2, explain: 'Leftmost prefix: প্রথম কলাম a ছাড়া b একা সাধারণত index কাজে লাগাতে পারে না।' },
    { q: 'EXPLAIN QUERY PLAN-এ "SCAN table" মানে কী?', options: ['Index ব্যবহার হচ্ছে', 'পুরো টেবিল পড়া হচ্ছে', 'কুয়েরি ভুল', 'ক্যাশ থেকে পড়ছে'], answer: 1, explain: 'SCAN = full table scan; SEARCH ... USING INDEX = index দিয়ে।' },
    { q: 'N+1 সমস্যা কী?', options: ['N টি index', 'লুপে প্রতিটি আইটেমের জন্য আলাদা কুয়েরি চালানো', 'N টি টেবিল JOIN', 'একটা বাড়তি কলাম'], answer: 1, explain: '১০০ পোস্টের জন্য ১০০টি আলাদা কুয়েরি — একটি JOIN দিয়েই করা যেত।' }
  ],
  en: {
    title: 'Query Optimization',
    summary: 'EXPLAIN QUERY PLAN, sargable conditions, composite indexes, rules for fast queries',
    content: `
<p>On a 16-row table every query is fast. On 10 million rows a badly written query can take minutes, a good one milliseconds. Let's see how the database actually runs a query.</p>
<h2>EXPLAIN QUERY PLAN — see the database's plan</h2>
<pre class="ex">EXPLAIN QUERY PLAN
SELECT * FROM students WHERE city = 'Dhaka';</pre>
<p><code>SCAN students</code> means it reads the whole table row by row (slow). Now with an index:</p>
<pre class="ex">CREATE INDEX idx_city ON students(city);
EXPLAIN QUERY PLAN
SELECT * FROM students WHERE city = 'Dhaka';</pre>
<p>Now it says <code>SEARCH students USING INDEX idx_city</code> — jumping straight to the matching rows (fast). PostgreSQL/MySQL use <code>EXPLAIN</code> / <code>EXPLAIN ANALYZE</code>.</p>
<h2>Sargable — write index-friendly conditions</h2>
<p>If you wrap a column in a function or calculation, the database cannot use its index:</p>
<table class="demo-table">
  <tr><th>❌ Slow (index unusable)</th><th>✅ Fast</th></tr>
  <tr><td><code>WHERE STRFTIME('%Y', order_date) = '2024'</code></td><td><code>WHERE order_date &gt;= '2024-01-01' AND order_date &lt; '2025-01-01'</code></td></tr>
  <tr><td><code>WHERE salary * 12 &gt; 1200000</code></td><td><code>WHERE salary &gt; 100000</code></td></tr>
  <tr><td><code>WHERE UPPER(city) = 'DHAKA'</code></td><td><code>WHERE city = 'Dhaka'</code> (keep data clean)</td></tr>
  <tr><td><code>WHERE name LIKE '%rim'</code> (leading %)</td><td><code>WHERE name LIKE 'Ra%'</code></td></tr>
</table>
<pre class="ex">CREATE INDEX idx_date ON orders(order_date);
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE STRFTIME('%m', order_date) = '03';</pre>
<pre class="ex">CREATE INDEX idx_date ON orders(order_date);
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE order_date >= '2024-03-01' AND order_date < '2024-04-01';</pre>
<h2>Composite indexes — column order matters</h2>
<p><code>CREATE INDEX idx ON students(dept_id, cgpa)</code> works like a phone book — sorted by dept_id first, then cgpa. So:</p>
<ul>
  <li>✅ <code>WHERE dept_id = 1</code> — index used</li>
  <li>✅ <code>WHERE dept_id = 1 AND cgpa &gt; 3.5</code> — index fully used</li>
  <li>❌ <code>WHERE cgpa &gt; 3.5</code> alone — without the first column the index doesn't help (leftmost prefix rule)</li>
</ul>
<p><b>Covering index:</b> if every column the query needs is in the index, the table itself is never read — the fastest case.</p>
<pre class="ex">CREATE INDEX idx_dept_cgpa ON students(dept_id, cgpa);
EXPLAIN QUERY PLAN SELECT dept_id, cgpa FROM students WHERE dept_id = 1 AND cgpa > 3.5;</pre>
<h2>Fast-query checklist</h2>
<ol>
  <li>No <code>SELECT *</code> — only the columns you need.</li>
  <li>Index columns used in WHERE, JOIN and ORDER BY — but not needlessly (indexes slow writes).</li>
  <li>Filter first, then join/group — fewer rows, faster work.</li>
  <li>Use <code>LIMIT</code> and pagination; instead of a huge OFFSET use <code>WHERE id &gt; last_id</code> (keyset pagination).</li>
  <li>Avoid one query per item in a loop (the N+1 problem) — use one JOIN or <code>IN (...)</code>.</li>
  <li>Wrap bulk inserts in a transaction — it can be hundreds of times faster.</li>
  <li>Measure, don't guess: read <code>EXPLAIN</code> and time it.</li>
</ol>
`,
    ex: [
      { task: 'Create an index named <b>idx_orders_date</b> on <code>orders(order_date)</code>.', hint: 'CREATE INDEX idx_orders_date ON orders(order_date);' },
      { task: 'Show <code>id, order_date</code> of February 2024 orders — the <b>sargable</b> way (a range, no function on the column).', hint: "order_date >= '2024-02-01' AND order_date < '2024-03-01'" },
      { task: 'Create a composite index named <b>idx_students_dept_cgpa</b> on <code>students(dept_id, cgpa)</code>.', hint: 'ON students(dept_id, cgpa)' }
    ],
    quiz: [
      { q: "WHERE UPPER(email) = 'A@X.COM' — what's wrong even with an index on email?", options: ['Error', 'The function prevents index use', 'Wrong result', 'Nothing'], explain: 'Wrapping the column in a function makes it non-sargable.' },
      { q: 'With an index on (a, b), which query cannot use it well?', options: ['WHERE a = 1', 'WHERE a = 1 AND b = 2', 'WHERE b = 2', 'WHERE a = 1 ORDER BY b'], explain: 'Leftmost prefix: b alone usually can\'t use an index that starts with a.' },
      { q: 'What does "SCAN table" mean in EXPLAIN QUERY PLAN?', options: ['Index used', 'Full table read', 'Query is wrong', 'Read from cache'], explain: 'SCAN = full table scan; SEARCH ... USING INDEX = index lookup.' },
      { q: 'What is the N+1 problem?', options: ['N indexes', 'Running a separate query for every item in a loop', 'Joining N tables', 'An extra column'], explain: '100 posts → 100 separate queries, when one JOIN would do.' }
    ]
  }
},

// ───────────────────────────── Security
{
  id: 'security', after: 'optimization', section: 'next', title: 'SQL Injection ও নিরাপত্তা',
  summary: 'হ্যাকাররা কীভাবে SQL দিয়ে আক্রমণ করে, আর কীভাবে ঠেকাবে',
  tables: ['app_users'],
  content: `
<p>ওয়েবসাইটের সবচেয়ে পুরনো ও বিপজ্জনক দুর্বলতাগুলোর একটা হলো <b>SQL Injection</b>। এটা বোঝা প্রতিটি ডেভেলপারের দায়িত্ব।</p>
<h2>আক্রমণটা কীভাবে হয়</h2>
<p>ধরো লগইন পেজের কোড ইউজারের ইনপুট সরাসরি স্ট্রিং জোড়া দিয়ে কুয়েরি বানায়:</p>
<pre class="syntax">// ❌ বিপজ্জনক কোড (JavaScript)
const sql = "SELECT * FROM app_users WHERE name = '" + input + "'";</pre>
<p>সাধারণ ইউজার <code>Rahim</code> লিখলে কুয়েরি হয়: <code>... WHERE name = 'Rahim'</code> — ঠিক আছে। কিন্তু হ্যাকার লিখল: <code>' OR '1'='1</code> — তখন কুয়েরি দাঁড়ায়:</p>
<pre class="ex">SELECT * FROM app_users WHERE name = '' OR '1'='1';</pre>
<p><code>'1'='1'</code> সবসময় সত্য — তাই <b>সব ইউজারের</b> ডেটা ফাঁস! আরও খারাপ ইনপুট: <code>'; DROP TABLE app_users; --</code> — পুরো টেবিল মুছে যেতে পারে। <code>--</code> বাকি কুয়েরিকে কমেন্ট বানিয়ে দেয়।</p>

<h2>সমাধান ১: Parameterized Query (সবচেয়ে জরুরি)</h2>
<p>কুয়েরি আর ডেটা <b>আলাদাভাবে</b> পাঠাও। ডেটাবেস ইনপুটকে সবসময় শুধু "মান" হিসেবে ধরে, কোড হিসেবে কখনো চালায় না।</p>
<pre class="syntax"># Python (sqlite3)
cur.execute("SELECT * FROM app_users WHERE name = ?", (user_input,))

// Node.js (pg)
await db.query("SELECT * FROM app_users WHERE name = $1", [userInput]);

// PHP (PDO)
$stmt = $pdo->prepare("SELECT * FROM app_users WHERE name = :name");
$stmt->execute(['name' => $input]);

// Java (JDBC)
PreparedStatement ps = conn.prepareStatement("SELECT * FROM app_users WHERE name = ?");
ps.setString(1, input);</pre>
<p>ইনপুট <code>' OR '1'='1</code> হলেও ডেটাবেস খুঁজবে ঠিক এই নামের ইউজার — যেন এভাবে লেখা হয়েছে:</p>
<pre class="ex">SELECT * FROM app_users WHERE name = ''' OR ''1''=''1';</pre>
<p>(টেক্সটের ভেতরে <code>'</code> লিখতে <code>''</code> দুবার দিতে হয়।) ফল: কোনো রো নেই। ✅</p>

<h2>আরও নিরাপত্তা নিয়ম</h2>
<ul>
  <li><b>ORM / Query Builder</b> (Django ORM, Prisma, SQLAlchemy) ব্যবহার করো — এরা নিজেরাই parameterize করে। তবে raw query লিখলে সাবধান।</li>
  <li><b>Least privilege:</b> অ্যাপের ডেটাবেস ইউজারকে শুধু দরকারি অনুমতি দাও। রিপোর্টিং ইউজারের DROP/DELETE অনুমতি থাকবে কেন?
    <pre class="syntax">-- MySQL / PostgreSQL
CREATE USER report_user WITH PASSWORD '...';
GRANT SELECT ON orders TO report_user;
REVOKE DELETE ON orders FROM app_user;</pre></li>
  <li><b>পাসওয়ার্ড কখনো plain text-এ রাখবে না</b> — bcrypt/argon2 দিয়ে hash করে রাখো।</li>
  <li><b>এরর মেসেজ লুকাও:</b> ইউজারকে raw ডেটাবেস এরর দেখালে হ্যাকার টেবিলের গঠন জেনে যায়।</li>
  <li><b>ইনপুট ভ্যালিডেশন:</b> বয়স হলে সংখ্যা কিনা, ইমেইল হলে ফরম্যাট ঠিক কিনা — কিন্তু এটা parameterization-এর বিকল্প নয়।</li>
  <li><b>নিয়মিত ব্যাকআপ</b> আর সংবেদনশীল ডেটা (NID, কার্ড নম্বর) এনক্রিপ্ট করো।</li>
</ul>
<div class="callout danger"><b>মনে রাখো:</b> শুধু <code>'</code> চিহ্ন সরিয়ে দেওয়া বা নিজে escape করা যথেষ্ট নয় — হ্যাকাররা বহু কৌশল জানে। সবসময় parameterized query।</div>
`,
  exercises: [
    { task: 'লগইন কুয়েরি <code>SELECT * FROM app_users WHERE name = \'<i>ইনপুট</i>\';</code>-এ ইনপুট হিসেবে <code>\' OR \'1\'=\'1</code> বসালে যে কুয়েরি তৈরি হয়, সেটা লিখে চালাও — দেখো কীভাবে সব ইউজার বেরিয়ে আসে।', solution: "SELECT * FROM app_users WHERE name = '' OR '1'='1';", hint: "ইনপুটটা দুই কোটের মাঝে হুবহু বসাও: name = '' OR '1'='1'" }
  ],
  quiz: [
    { q: 'SQL Injection ঠেকানোর সবচেয়ে কার্যকর উপায়?', options: ["ইনপুট থেকে ' মুছে ফেলা", 'Parameterized query / prepared statement', 'ইনপুট বড় হাতে করা', 'HTTPS ব্যবহার'], answer: 1, explain: 'Parameterized query-তে ইনপুট কখনো SQL কোড হিসেবে চলে না।' },
    { q: "ইনপুটে '--' দিলে কী হয়?", options: ['কিছু না', 'বাকি কুয়েরি কমেন্ট হয়ে যায়', 'এরর', 'ডাটাবেস বন্ধ হয়'], answer: 1, explain: '-- এর পরের অংশ (যেমন পাসওয়ার্ড চেক) উপেক্ষিত হয়।' },
    { q: 'Least privilege মানে কী?', options: ['সবাইকে admin অনুমতি', 'শুধু যতটুকু দরকার ততটুকু অনুমতি দেওয়া', 'পাসওয়ার্ড ছোট রাখা', 'কম টেবিল রাখা'], answer: 1, explain: 'আক্রমণ হলেও ক্ষতি সীমিত থাকে।' }
  ],
  en: {
    title: 'SQL Injection & Security',
    summary: 'How attackers abuse SQL, and how to stop them',
    content: `
<p>One of the oldest and most dangerous web vulnerabilities is <b>SQL Injection</b>. Every developer must understand it.</p>
<h2>How the attack works</h2>
<p>Suppose a login page builds the query by gluing user input into a string:</p>
<pre class="syntax">// ❌ Dangerous code (JavaScript)
const sql = "SELECT * FROM app_users WHERE name = '" + input + "'";</pre>
<p>A normal user types <code>Rahim</code> and gets <code>... WHERE name = 'Rahim'</code> — fine. An attacker types <code>' OR '1'='1</code> and the query becomes:</p>
<pre class="ex">SELECT * FROM app_users WHERE name = '' OR '1'='1';</pre>
<p><code>'1'='1'</code> is always true — <b>every user's</b> data leaks! Worse input: <code>'; DROP TABLE app_users; --</code> could delete the table. <code>--</code> turns the rest of the query into a comment.</p>
<h2>Fix 1: parameterized queries (the essential one)</h2>
<p>Send the query and the data <b>separately</b>. The database always treats input as a value, never as code.</p>
<pre class="syntax"># Python (sqlite3)
cur.execute("SELECT * FROM app_users WHERE name = ?", (user_input,))

// Node.js (pg)
await db.query("SELECT * FROM app_users WHERE name = $1", [userInput]);

// PHP (PDO)
$stmt = $pdo->prepare("SELECT * FROM app_users WHERE name = :name");
$stmt->execute(['name' => $input]);

// Java (JDBC)
PreparedStatement ps = conn.prepareStatement("SELECT * FROM app_users WHERE name = ?");
ps.setString(1, input);</pre>
<p>Even with input <code>' OR '1'='1</code> the database looks for a user with exactly that name — as if you wrote:</p>
<pre class="ex">SELECT * FROM app_users WHERE name = ''' OR ''1''=''1';</pre>
<p>(Inside text, a quote is written as <code>''</code>.) Result: no rows. ✅</p>
<h2>More security rules</h2>
<ul>
  <li><b>Use an ORM / query builder</b> (Django ORM, Prisma, SQLAlchemy) — they parameterize for you. Be careful when writing raw SQL.</li>
  <li><b>Least privilege:</b> give the app's database user only the permissions it needs. Why would a reporting user have DROP/DELETE?
    <pre class="syntax">-- MySQL / PostgreSQL
CREATE USER report_user WITH PASSWORD '...';
GRANT SELECT ON orders TO report_user;
REVOKE DELETE ON orders FROM app_user;</pre></li>
  <li><b>Never store plain-text passwords</b> — hash them with bcrypt/argon2.</li>
  <li><b>Hide error messages:</b> raw database errors reveal your table structure to attackers.</li>
  <li><b>Validate input:</b> is the age a number, is the email well-formed — but this does not replace parameterization.</li>
  <li><b>Back up regularly</b> and encrypt sensitive data (national IDs, card numbers).</li>
</ul>
<div class="callout danger"><b>Remember:</b> stripping <code>'</code> characters or escaping by hand is not enough — attackers know many tricks. Always use parameterized queries.</div>
`,
    ex: [
      { task: 'In the login query <code>SELECT * FROM app_users WHERE name = \'<i>input</i>\';</code>, substitute the input <code>\' OR \'1\'=\'1</code>, write the resulting query and run it — see how every user comes out.', hint: "Paste the input exactly between the quotes: name = '' OR '1'='1'" }
    ],
    quiz: [
      { q: 'The most effective defence against SQL injection?', options: ["Removing ' from input", 'Parameterized queries / prepared statements', 'Upper-casing input', 'Using HTTPS'], explain: 'With parameters, input is never executed as SQL code.' },
      { q: "What happens if the input contains '--'?", options: ['Nothing', 'The rest of the query becomes a comment', 'Error', 'The database shuts down'], explain: 'Everything after -- (like a password check) is ignored.' },
      { q: 'What does least privilege mean?', options: ['Admin rights for everyone', 'Grant only the permissions needed', 'Short passwords', 'Fewer tables'], explain: 'If an attack happens, the damage stays limited.' }
    ]
  }
}
];

ADV.forEach(l => {
  const i = window.LESSONS.findIndex(x => x.id === l.after);
  window.LESSONS.splice(i < 0 ? window.LESSONS.length : i + 1, 0, l);
});
})();
