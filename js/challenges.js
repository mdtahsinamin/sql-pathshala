// ইন্টারভিউ চ্যালেঞ্জ — জনপ্রিয় SQL ইন্টারভিউ প্রশ্ন, ধাপে ধাপে হিন্ট ও ব্যাখ্যাসহ।
// level: easy | medium | hard ; hints: ক্রমান্বয়ে বেশি সাহায্য
window.CHALLENGES = [
{
  id: 'second-highest-salary', level: 'easy', tags: ['subquery', 'MAX'], tables: ['employees'],
  title: { bn: 'দ্বিতীয় সর্বোচ্চ বেতন', en: 'Second highest salary' },
  task: { bn: '<code>employees</code> টেবিল থেকে <b>দ্বিতীয় সর্বোচ্চ</b> বেতনটি বের করো (একটি কলাম, একটি রো)।', en: 'Find the <b>second highest</b> salary in <code>employees</code> (one column, one row).' },
  hints: [
    { bn: 'আগে সর্বোচ্চ বেতনটা বের করো। তারপর ভাবো — সর্বোচ্চের চেয়ে কম বেতনগুলোর মধ্যে সবচেয়ে বড় কোনটা?', en: 'First find the maximum. Then: among salaries below that maximum, which is the largest?' },
    { bn: 'WHERE salary < (SELECT MAX(salary) FROM employees)', en: 'WHERE salary < (SELECT MAX(salary) FROM employees)' }
  ],
  solution: 'SELECT MAX(salary) AS second_highest\nFROM employees\nWHERE salary < (SELECT MAX(salary) FROM employees);',
  explain: {
    bn: '<p><b>কৌশল:</b> সাবকুয়েরি সর্বোচ্চ বেতন (150000) দেয়। বাইরের কুয়েরি শুধু তার চেয়ে কম বেতনগুলো রাখে, তাদের MAX-ই দ্বিতীয় সর্বোচ্চ।</p><p><b>কেন ORDER BY + LIMIT 1 OFFSET 1 নয়?</b> দুজনের সর্বোচ্চ বেতন সমান হলে OFFSET ভুল উত্তর দেবে। এই পদ্ধতি ডুপ্লিকেটে নিরাপদ, আর দ্বিতীয় বেতন না থাকলে NULL দেয় — যেটা ইন্টারভিউয়াররা প্রায়ই জিজ্ঞেস করে।</p>',
    en: '<p><b>Approach:</b> the subquery returns the maximum (150000). The outer query keeps only lower salaries; their MAX is the second highest.</p><p><b>Why not ORDER BY + LIMIT 1 OFFSET 1?</b> If two people share the top salary, OFFSET gives the wrong answer. This version is safe with duplicates and returns NULL when no second salary exists — a common interviewer follow-up.</p>'
  }
},
{
  id: 'nth-highest-salary', level: 'medium', tags: ['DISTINCT', 'OFFSET', 'DENSE_RANK'], tables: ['employees'],
  title: { bn: 'N-তম সর্বোচ্চ বেতন (N = 3)', en: 'Nth highest salary (N = 3)' },
  task: { bn: '<b>তৃতীয় সর্বোচ্চ ইউনিক</b> বেতনটি বের করো।', en: 'Find the <b>3rd highest distinct</b> salary.' },
  hints: [
    { bn: 'একই বেতন দুবার থাকলে একবার গুনতে হবে — DISTINCT লাগবে।', en: 'Equal salaries should count once — you need DISTINCT.' },
    { bn: 'বড় থেকে ছোট সাজাও, প্রথম ২টি বাদ দিয়ে ১টি নাও: LIMIT 1 OFFSET 2', en: 'Sort descending, skip 2, take 1: LIMIT 1 OFFSET 2' }
  ],
  solution: 'SELECT DISTINCT salary\nFROM employees\nORDER BY salary DESC\nLIMIT 1 OFFSET 2;',
  explain: {
    bn: '<p>DISTINCT ডুপ্লিকেট বাদ দেয়, তারপর সাজিয়ে OFFSET 2 দিয়ে প্রথম দুটি বাদ দিই।</p><p><b>বিকল্প (আরও সাধারণ):</b></p><pre>SELECT salary FROM (\n  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk\n  FROM employees\n) WHERE rnk = 3 LIMIT 1;</pre><p>DENSE_RANK সমান বেতনকে একই র‍্যাংক দেয়, তাই "N-তম" প্রশ্নে এটাই সবচেয়ে নির্ভরযোগ্য।</p>',
    en: '<p>DISTINCT removes duplicates; then sort and skip the first two with OFFSET 2.</p><p><b>Alternative (more general):</b></p><pre>SELECT salary FROM (\n  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk\n  FROM employees\n) WHERE rnk = 3 LIMIT 1;</pre><p>DENSE_RANK gives equal salaries the same rank, which makes it the most reliable answer to "Nth highest".</p>'
  }
},
{
  id: 'duplicate-emails', level: 'easy', tags: ['GROUP BY', 'HAVING'], tables: ['newsletter'],
  title: { bn: 'ডুপ্লিকেট ইমেইল খোঁজা', en: 'Find duplicate emails' },
  task: { bn: '<code>newsletter</code> টেবিলে যেসব <code>email</code> একাধিকবার আছে, সেগুলো দেখাও (প্রতিটি একবার)।', en: 'Show every <code>email</code> that appears more than once in <code>newsletter</code> (each once).' },
  hints: [
    { bn: 'একই ইমেইলগুলোকে এক দলে রাখো।', en: 'Put identical emails into one group.' },
    { bn: 'GROUP BY email HAVING COUNT(*) > 1', en: 'GROUP BY email HAVING COUNT(*) > 1' }
  ],
  solution: 'SELECT email\nFROM newsletter\nGROUP BY email\nHAVING COUNT(*) > 1;',
  explain: {
    bn: '<p>GROUP BY একই ইমেইলের রোগুলো এক দলে আনে, HAVING শুধু যেসব দলে ১-এর বেশি রো আছে সেগুলো রাখে। WHERE এখানে চলবে না, কারণ COUNT গ্রুপ তৈরির পরে হিসাব হয়।</p><p>বাস্তবে: ইমেইল case-insensitive হলে <code>GROUP BY LOWER(email)</code> লিখতে হয়।</p>',
    en: '<p>GROUP BY puts rows with the same email together; HAVING keeps groups with more than one row. WHERE can\'t do this because COUNT only exists after grouping.</p><p>In real life emails are case-insensitive, so you\'d write <code>GROUP BY LOWER(email)</code>.</p>'
  }
},
{
  id: 'delete-duplicates', level: 'medium', tags: ['DELETE', 'subquery', 'MIN'], tables: ['newsletter'],
  title: { bn: 'ডুপ্লিকেট মুছে ফেলো (সবচেয়ে পুরনোটা রেখে)', en: 'Delete duplicates (keep the oldest)' },
  task: { bn: '<code>newsletter</code> থেকে ডুপ্লিকেট ইমেইলগুলো মুছে ফেলো — প্রতিটি ইমেইলের <b>সবচেয়ে ছোট id</b>-র রো রেখে।', en: 'Delete duplicate emails from <code>newsletter</code>, keeping the row with the <b>smallest id</b> for each email.' },
  hints: [
    { bn: 'কোন রোগুলো রাখবে? প্রতিটি ইমেইলের MIN(id)।', en: 'Which rows do you keep? MIN(id) per email.' },
    { bn: 'DELETE FROM newsletter WHERE id NOT IN (SELECT MIN(id) FROM newsletter GROUP BY email)', en: 'DELETE FROM newsletter WHERE id NOT IN (SELECT MIN(id) FROM newsletter GROUP BY email)' }
  ],
  solution: 'DELETE FROM newsletter\nWHERE id NOT IN (\n  SELECT MIN(id) FROM newsletter GROUP BY email\n);',
  check: 'SELECT * FROM newsletter ORDER BY id;',
  explain: {
    bn: '<p>সাবকুয়েরি প্রতিটি ইমেইলের প্রথম (সবচেয়ে ছোট) id দেয়: 1, 2, 4, 6। বাকি সব id মুছে যায়।</p><p><b>বিকল্প (window):</b> <code>DELETE FROM newsletter WHERE id IN (SELECT id FROM (SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) rn FROM newsletter) WHERE rn &gt; 1);</code></p><p><b>সতর্কতা:</b> আগে একই শর্ত দিয়ে SELECT চালিয়ে দেখে নাও কোনগুলো মুছবে।</p>',
    en: '<p>The subquery returns the first (smallest) id per email: 1, 2, 4, 6. Every other id is deleted.</p><p><b>Alternative (window):</b> <code>DELETE FROM newsletter WHERE id IN (SELECT id FROM (SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) rn FROM newsletter) WHERE rn &gt; 1);</code></p><p><b>Careful:</b> run a SELECT with the same condition first to see what will be deleted.</p>'
  }
},
{
  id: 'manager-salary-gap', level: 'easy', tags: ['self join'], tables: ['employees'],
  title: { bn: 'ম্যানেজারের সাথে বেতনের পার্থক্য', en: 'Salary gap with manager' },
  task: { bn: 'যাদের ম্যানেজার আছে, তাদের <code>name</code>, ম্যানেজারের নাম ও <b>ম্যানেজারের বেতন − নিজের বেতন</b> দেখাও।', en: 'For employees with a manager show their <code>name</code>, the manager\'s name and <b>manager salary − own salary</b>.' },
  hints: [
    { bn: 'একই টেবিল দুবার — একবার কর্মচারী, একবার ম্যানেজার (Self JOIN)।', en: 'Same table twice — once as employee, once as manager (self join).' },
    { bn: 'FROM employees e JOIN employees m ON e.manager_id = m.id', en: 'FROM employees e JOIN employees m ON e.manager_id = m.id' }
  ],
  solution: 'SELECT e.name, m.name AS manager, m.salary - e.salary AS gap\nFROM employees e\nJOIN employees m ON e.manager_id = m.id;',
  explain: {
    bn: '<p>Self JOIN-এ <code>e</code> কর্মচারী আর <code>m</code> ম্যানেজার। <code>e.manager_id = m.id</code> দিয়ে প্রতিটি কর্মচারীকে তার ম্যানেজারের রো-র সাথে জোড়া হয়, তারপর দুই বেতনের পার্থক্য।</p><p>ক্লাসিক ভ্যারিয়েশন: "ম্যানেজারের চেয়ে বেশি বেতন পায় কে?" — শুধু <code>WHERE e.salary &gt; m.salary</code> যোগ করো।</p>',
    en: '<p>In the self join <code>e</code> is the employee and <code>m</code> the manager. <code>e.manager_id = m.id</code> pairs each employee with their manager\'s row, then we subtract salaries.</p><p>Classic variant: "who earns more than their manager?" — just add <code>WHERE e.salary &gt; m.salary</code>.</p>'
  }
},
{
  id: 'managers-report-count', level: 'medium', tags: ['self join', 'GROUP BY'], tables: ['employees'],
  title: { bn: 'প্রতিটি ম্যানেজারের অধীনে কতজন', en: 'Direct reports per manager' },
  task: { bn: 'প্রতিটি ম্যানেজারের <code>name</code> ও তার অধীনে সরাসরি কতজন কাজ করে দেখাও (শুধু যাদের অধীনে কেউ আছে)।', en: 'Show each manager\'s <code>name</code> and how many people report directly to them (only managers with reports).' },
  hints: [
    { bn: 'কর্মচারী টেবিলকে ম্যানেজার টেবিলের সাথে JOIN করো, তারপর ম্যানেজার অনুযায়ী গ্রুপ।', en: 'Join employees to managers, then group by manager.' },
    { bn: 'GROUP BY m.id, m.name এবং COUNT(*)', en: 'GROUP BY m.id, m.name with COUNT(*)' }
  ],
  solution: 'SELECT m.name, COUNT(*) AS reports\nFROM employees e\nJOIN employees m ON e.manager_id = m.id\nGROUP BY m.id, m.name;',
  explain: {
    bn: '<p>JOIN-এর পরে প্রতিটি রো = (কর্মচারী, তার ম্যানেজার)। ম্যানেজার অনুযায়ী গ্রুপ করে গুনলেই অধীনস্থের সংখ্যা। <code>m.id</code> দিয়েও গ্রুপ করা ভালো — দুজন ম্যানেজারের নাম একই হলে আলাদা থাকবে।</p>',
    en: '<p>After the join every row is (employee, their manager). Grouping by manager and counting gives the number of reports. Grouping by <code>m.id</code> too keeps two managers with the same name apart.</p>'
  }
},
{
  id: 'dept-highest-avg-salary', level: 'medium', tags: ['JOIN', 'GROUP BY', 'ORDER BY'], tables: ['employees', 'departments'],
  title: { bn: 'সর্বোচ্চ গড় বেতনের বিভাগ', en: 'Department with the highest average salary' },
  task: { bn: 'কর্মচারীদের গড় বেতন যে বিভাগে সবচেয়ে বেশি, সেই বিভাগের <code>name</code> দেখাও।', en: 'Show the <code>name</code> of the department whose employees have the highest average salary.' },
  hints: [
    { bn: 'employees ও departments JOIN করে বিভাগ অনুযায়ী AVG(salary)।', en: 'Join employees and departments, then AVG(salary) per department.' },
    { bn: 'ORDER BY AVG(e.salary) DESC LIMIT 1', en: 'ORDER BY AVG(e.salary) DESC LIMIT 1' }
  ],
  solution: 'SELECT d.name\nFROM employees e\nJOIN departments d ON e.dept_id = d.id\nGROUP BY d.name\nORDER BY AVG(e.salary) DESC\nLIMIT 1;',
  explain: {
    bn: '<p>গ্রুপ করে গড় বের করো, গড় অনুযায়ী সাজাও, প্রথমটা নাও। ORDER BY-তে অ্যাগ্রিগেট সরাসরি লেখা যায় — SELECT-এ না রাখলেও।</p><p><b>টাই হলে?</b> দুটো বিভাগের গড় সমান হলে LIMIT 1 একটাকে বাদ দেবে। সব সেরাকে আনতে <code>HAVING AVG(salary) = (SELECT MAX(avg) FROM (...))</code> বা RANK() ব্যবহার করো।</p>',
    en: '<p>Group, compute the average, sort by it, take the first. ORDER BY can use an aggregate directly, even if it is not in SELECT.</p><p><b>Ties?</b> If two departments share the top average, LIMIT 1 drops one. Use <code>HAVING AVG(salary) = (SELECT MAX(avg) FROM (...))</code> or RANK() to keep all winners.</p>'
  }
},
{
  id: 'top-earner-per-dept', level: 'medium', tags: ['window', 'RANK', 'PARTITION BY'], tables: ['employees'],
  title: { bn: 'প্রতিটি বিভাগের সর্বোচ্চ বেতনভোগী', en: 'Top earner in each department' },
  task: { bn: 'প্রতিটি বিভাগে (<code>dept_id</code> NULL নয়) সবচেয়ে বেশি বেতন পাওয়া কর্মচারীর <code>name, dept_id, salary</code> দেখাও।', en: 'For each department (<code>dept_id</code> not NULL) show <code>name, dept_id, salary</code> of the highest-paid employee.' },
  hints: [
    { bn: 'বিভাগের ভেতরে বেতন অনুযায়ী র‍্যাংক দাও: RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC)', en: 'Rank by salary within each department: RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC)' },
    { bn: 'র‍্যাংক করা ফলাফলটাকে সাবকুয়েরি/CTE-তে রেখে বাইরে WHERE rnk = 1', en: 'Put the ranked result in a subquery/CTE and filter WHERE rnk = 1 outside.' }
  ],
  solution: 'WITH ranked AS (\n  SELECT name, dept_id, salary,\n         RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rnk\n  FROM employees\n  WHERE dept_id IS NOT NULL\n)\nSELECT name, dept_id, salary FROM ranked WHERE rnk = 1;',
  explain: {
    bn: '<p>উইন্ডো ফাংশন সরাসরি WHERE-এ ব্যবহার করা যায় না (WHERE আগে চলে), তাই CTE-তে র‍্যাংক বানিয়ে বাইরে ফিল্টার। RANK ব্যবহারে টাই হলে দুজনই আসবে; ঠিক একজন চাইলে ROW_NUMBER।</p><p><b>বিকল্প:</b> correlated subquery — <code>WHERE salary = (SELECT MAX(salary) FROM employees e2 WHERE e2.dept_id = e.dept_id)</code>।</p>',
    en: '<p>Window functions can\'t be used in WHERE (WHERE runs first), so rank inside a CTE and filter outside. RANK keeps ties; use ROW_NUMBER for exactly one per department.</p><p><b>Alternative:</b> a correlated subquery — <code>WHERE salary = (SELECT MAX(salary) FROM employees e2 WHERE e2.dept_id = e.dept_id)</code>.</p>'
  }
},
{
  id: 'top2-students-per-dept', level: 'medium', tags: ['window', 'ROW_NUMBER', 'Top-N'], tables: ['students'],
  title: { bn: 'প্রতিটি বিভাগের সেরা ২ জন ছাত্র', en: 'Top 2 students per department' },
  task: { bn: 'প্রতিটি বিভাগের (<code>dept_id</code> NULL নয়) CGPA অনুযায়ী সেরা <b>২ জন</b> ছাত্রের <code>name, dept_id, cgpa</code> দেখাও।', en: 'Show <code>name, dept_id, cgpa</code> of the top <b>2</b> students by CGPA in each department (<code>dept_id</code> not NULL).' },
  hints: [
    { bn: '"প্রতিটি দলের Top-N" = ROW_NUMBER() OVER (PARTITION BY ...)', en: '"Top N per group" = ROW_NUMBER() OVER (PARTITION BY ...)' },
    { bn: 'CTE-তে rn বানাও, তারপর WHERE rn <= 2', en: 'Compute rn in a CTE, then WHERE rn <= 2' }
  ],
  solution: 'WITH r AS (\n  SELECT name, dept_id, cgpa,\n         ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY cgpa DESC) AS rn\n  FROM students\n  WHERE dept_id IS NOT NULL\n)\nSELECT name, dept_id, cgpa FROM r WHERE rn <= 2;',
  explain: {
    bn: '<p>এটা ইন্টারভিউয়ের সবচেয়ে জনপ্রিয় প্যাটার্ন: <b>Top-N per group</b>। PARTITION BY প্রতিটি বিভাগকে আলাদা উইন্ডো বানায়, ORDER BY cgpa DESC সেরাকে ১ নম্বরে রাখে।</p><p>LIMIT 2 এখানে কাজ করবে না — সেটা পুরো ফলাফলে মাত্র ২টি রো দেয়, প্রতিটি দলে নয়।</p>',
    en: '<p>This is the most popular interview pattern: <b>Top N per group</b>. PARTITION BY makes each department its own window and ORDER BY cgpa DESC puts the best at number 1.</p><p>LIMIT 2 won\'t work here — it limits the whole result to 2 rows, not 2 per group.</p>'
  }
},
{
  id: 'never-enrolled', level: 'easy', tags: ['LEFT JOIN', 'anti-join'], tables: ['students', 'enrollments'],
  title: { bn: 'যারা কোনো কোর্সে ভর্তি হয়নি', en: 'Students never enrolled' },
  task: { bn: 'যেসব ছাত্র কোনো কোর্সে ভর্তি হয়নি, তাদের <code>name</code> দেখাও।', en: 'Show the <code>name</code> of students who never enrolled in any course.' },
  hints: [
    { bn: 'সব ছাত্র রাখতে হবে, মিল না থাকলেও — কোন JOIN?', en: 'You must keep all students even without a match — which JOIN?' },
    { bn: 'LEFT JOIN enrollments ... WHERE e.id IS NULL', en: 'LEFT JOIN enrollments ... WHERE e.id IS NULL' }
  ],
  solution: 'SELECT s.name\nFROM students s\nLEFT JOIN enrollments e ON e.student_id = s.id\nWHERE e.id IS NULL;',
  explain: {
    bn: '<p><b>Anti-join</b> প্যাটার্ন: LEFT JOIN-এ মিল না পেলে ডান পাশ NULL হয়, সেটাই ফিল্টার করি।</p><p>বিকল্প: <code>WHERE NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id = s.id)</code>। <code>NOT IN</code>-ও চলে, কিন্তু সাবকুয়েরিতে NULL থাকলে ফল খালি হয়ে যায় — তাই NOT EXISTS নিরাপদ।</p>',
    en: '<p>The <b>anti-join</b> pattern: in a LEFT JOIN, unmatched rows get NULL on the right — filter for those.</p><p>Alternative: <code>WHERE NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id = s.id)</code>. <code>NOT IN</code> also works, but returns nothing if the subquery contains a NULL — NOT EXISTS is safer.</p>'
  }
},
{
  id: 'repeat-customers', level: 'easy', tags: ['GROUP BY', 'HAVING'], tables: ['orders'],
  title: { bn: 'যারা একাধিকবার অর্ডার করেছে', en: 'Repeat customers' },
  task: { bn: 'যেসব ক্রেতা <b>একাধিক</b> অর্ডার করেছে, তাদের <code>customer_name</code> ও অর্ডার সংখ্যা দেখাও।', en: 'Show <code>customer_name</code> and order count for customers with <b>more than one</b> order.' },
  hints: [
    { bn: 'ক্রেতা অনুযায়ী গ্রুপ করো।', en: 'Group by customer.' },
    { bn: 'HAVING COUNT(*) > 1', en: 'HAVING COUNT(*) > 1' }
  ],
  solution: 'SELECT customer_name, COUNT(*) AS orders\nFROM orders\nGROUP BY customer_name\nHAVING COUNT(*) > 1;',
  explain: {
    bn: '<p>GROUP BY + HAVING-এর সরল প্রয়োগ। ব্যবসায় "repeat customer rate" খুব গুরুত্বপূর্ণ মেট্রিক — এই কুয়েরিই তার ভিত্তি।</p>',
    en: '<p>A straightforward GROUP BY + HAVING. "Repeat customer rate" is a key business metric, and this query is its basis.</p>'
  }
},
{
  id: 'low-stock-ordered', level: 'easy', tags: ['IN', 'EXISTS'], tables: ['products', 'orders'],
  title: { bn: 'স্টক কম কিন্তু চাহিদা আছে', en: 'Low stock but in demand' },
  task: { bn: 'যেসব পণ্যের স্টক <b>50-এর কম</b> এবং অন্তত একবার অর্ডার হয়েছে, তাদের <code>name</code> ও <code>stock</code> দেখাও।', en: 'Show <code>name</code> and <code>stock</code> of products with stock <b>below 50</b> that were ordered at least once.' },
  hints: [
    { bn: 'দুটো শর্ত: stock < 50, আর id অর্ডারের তালিকায় আছে।', en: 'Two conditions: stock < 50, and the id appears in orders.' },
    { bn: 'AND id IN (SELECT product_id FROM orders)', en: 'AND id IN (SELECT product_id FROM orders)' }
  ],
  solution: 'SELECT name, stock\nFROM products\nWHERE stock < 50\n  AND id IN (SELECT product_id FROM orders);',
  explain: {
    bn: '<p>IN সাবকুয়েরি দিয়ে "অন্তত একবার অর্ডার হয়েছে" যাচাই। JOIN দিয়ে করলে একাধিক অর্ডারের কারণে একই পণ্য বারবার আসত — তখন DISTINCT লাগত। EXISTS-ও সমান ভালো।</p>',
    en: '<p>The IN subquery checks "ordered at least once". With a JOIN, a product with several orders would repeat and you\'d need DISTINCT. EXISTS works equally well.</p>'
  }
},
{
  id: 'best-course-avg', level: 'easy', tags: ['JOIN', 'AVG', 'NULL'], tables: ['courses', 'enrollments'],
  title: { bn: 'সর্বোচ্চ গড় নম্বরের কোর্স', en: 'Course with the best average marks' },
  task: { bn: 'যে কোর্সে গড় নম্বর সবচেয়ে বেশি, তার <code>title</code> দেখাও।', en: 'Show the <code>title</code> of the course with the highest average marks.' },
  hints: [
    { bn: 'courses JOIN enrollments, কোর্স অনুযায়ী AVG(marks)।', en: 'courses JOIN enrollments, AVG(marks) per course.' },
    { bn: 'ORDER BY AVG(e.marks) DESC LIMIT 1 — মনে রেখো AVG NULL উপেক্ষা করে।', en: 'ORDER BY AVG(e.marks) DESC LIMIT 1 — remember AVG ignores NULL.' }
  ],
  solution: 'SELECT c.title\nFROM courses c\nJOIN enrollments e ON e.course_id = c.id\nGROUP BY c.id, c.title\nORDER BY AVG(e.marks) DESC\nLIMIT 1;',
  explain: {
    bn: '<p>Digital Electronics-এ দুজন — একজন 88, আরেকজনের নম্বর NULL (এখনো দেওয়া হয়নি)। AVG NULL বাদ দিয়ে হিসাব করে, তাই গড় 88। ইন্টারভিউতে জিজ্ঞেস করতে পারে: "NULL-কে 0 ধরলে?" — তখন <code>AVG(COALESCE(marks, 0))</code> = 44।</p>',
    en: '<p>Digital Electronics has two enrollments — 88 and NULL (not graded yet). AVG skips NULL, giving 88. Interviewers may ask "what if NULL counts as 0?" — then <code>AVG(COALESCE(marks, 0))</code> = 44.</p>'
  }
},
{
  id: 'revenue-by-category', level: 'easy', tags: ['JOIN', 'SUM'], tables: ['orders', 'products'],
  title: { bn: 'ক্যাটাগরিভিত্তিক আয়', en: 'Revenue by category' },
  task: { bn: 'Cancelled বাদে সব অর্ডার থেকে প্রতিটি <code>category</code>-র মোট আয় (<code>quantity * price</code>) দেখাও — বেশি থেকে কম।', en: 'Show total revenue (<code>quantity * price</code>) per <code>category</code> from all non-Cancelled orders, highest first.' },
  hints: [
    { bn: 'orders JOIN products, WHERE status != \'Cancelled\'', en: "orders JOIN products, WHERE status != 'Cancelled'" },
    { bn: 'GROUP BY p.category, SUM(o.quantity * p.price), ORDER BY ... DESC', en: 'GROUP BY p.category, SUM(o.quantity * p.price), ORDER BY ... DESC' }
  ],
  solution: "SELECT p.category, SUM(o.quantity * p.price) AS revenue\nFROM orders o\nJOIN products p ON p.id = o.product_id\nWHERE o.status != 'Cancelled'\nGROUP BY p.category\nORDER BY revenue DESC;",
  ordered: true,
  explain: {
    bn: '<p>ক্রম: JOIN → WHERE (Cancelled বাদ) → GROUP BY → SUM → ORDER BY। WHERE গ্রুপিংয়ের আগে চলে, তাই বাতিল অর্ডার হিসাবেই আসে না। 🔍 ভিজুয়ালাইজার দিয়ে প্রতিটি ধাপ দেখো।</p>',
    en: '<p>Order: JOIN → WHERE (drop Cancelled) → GROUP BY → SUM → ORDER BY. WHERE runs before grouping, so cancelled orders never enter the totals. Use 🔍 Visualize to watch each step.</p>'
  }
},
{
  id: 'city-share', level: 'medium', tags: ['window', 'percentage'], tables: ['students'],
  title: { bn: 'শহরভিত্তিক ছাত্রের শতাংশ', en: 'Share of students per city' },
  task: { bn: 'প্রতিটি <code>city</code>, সেখানে ছাত্রসংখ্যা, এবং মোট ছাত্রের কত শতাংশ (১ দশমিক ঘর) দেখাও।', en: 'Show each <code>city</code>, its student count, and its percentage of all students (1 decimal).' },
  hints: [
    { bn: 'মোট ছাত্রসংখ্যা জানতে সাবকুয়েরি বা SUM(COUNT(*)) OVER ()', en: 'Get the total with a subquery or SUM(COUNT(*)) OVER ()' },
    { bn: 'ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM students), 1)', en: 'ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM students), 1)' }
  ],
  solution: 'SELECT city, COUNT(*) AS students,\n       ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS pct\nFROM students\nGROUP BY city;',
  explain: {
    bn: '<p><code>SUM(COUNT(*)) OVER ()</code> দেখতে অদ্ভুত, কিন্তু চমৎকার: GROUP BY-র পরে প্রতিটি শহরের COUNT হয়, তারপর উইন্ডো ফাংশন সেই COUNT-গুলোর যোগফল (১৬) প্রতিটি রো-তে দেয়। <code>100.0</code> দিয়ে গুণ করলে পূর্ণসংখ্যা-ভাগের সমস্যা হয় না।</p>',
    en: '<p><code>SUM(COUNT(*)) OVER ()</code> looks odd but is neat: after GROUP BY each city has a COUNT, and the window sums those counts (16) onto every row. Multiplying by <code>100.0</code> avoids integer division.</p>'
  }
},
{
  id: 'above-dept-average', level: 'medium', tags: ['correlated subquery', 'window'], tables: ['students'],
  title: { bn: 'নিজ বিভাগের গড়ের চেয়ে ভালো', en: 'Above their department average' },
  task: { bn: 'যেসব ছাত্রের CGPA তাদের <b>নিজ বিভাগের গড়ের</b> চেয়ে বেশি, তাদের <code>name, dept_id, cgpa</code> দেখাও।', en: 'Show <code>name, dept_id, cgpa</code> of students whose CGPA is above <b>their own department\'s average</b>.' },
  hints: [
    { bn: 'প্রতিটি ছাত্রের জন্য তার বিভাগের গড় লাগবে — correlated subquery।', en: 'Each student needs their department\'s average — a correlated subquery.' },
    { bn: 'WHERE cgpa > (SELECT AVG(cgpa) FROM students s2 WHERE s2.dept_id = s.dept_id)', en: 'WHERE cgpa > (SELECT AVG(cgpa) FROM students s2 WHERE s2.dept_id = s.dept_id)' }
  ],
  solution: 'SELECT name, dept_id, cgpa\nFROM students s\nWHERE cgpa > (\n  SELECT AVG(cgpa) FROM students s2\n  WHERE s2.dept_id = s.dept_id\n);',
  explain: {
    bn: '<p>ভেতরের কুয়েরি বাইরের রো-র <code>s.dept_id</code> ব্যবহার করে, তাই প্রতিটি ছাত্রের জন্য আলাদা গড় হিসাব হয়। dept_id NULL হলে <code>s2.dept_id = NULL</code> কখনো সত্য নয় — Sabbir স্বয়ংক্রিয়ভাবে বাদ।</p><p><b>উইন্ডো বিকল্প:</b> CTE-তে <code>AVG(cgpa) OVER (PARTITION BY dept_id)</code> বানিয়ে বাইরে তুলনা — বড় টেবিলে সাধারণত দ্রুত।</p>',
    en: '<p>The inner query uses the outer row\'s <code>s.dept_id</code>, so each student gets their own average. With a NULL dept_id, <code>s2.dept_id = NULL</code> is never true — Sabbir drops out automatically.</p><p><b>Window alternative:</b> compute <code>AVG(cgpa) OVER (PARTITION BY dept_id)</code> in a CTE and compare outside — usually faster on big tables.</p>'
  }
},
{
  id: 'pivot-year', level: 'medium', tags: ['CASE', 'pivot', 'JOIN'], tables: ['students', 'departments'],
  title: { bn: 'পিভট: বিভাগ × ভর্তির বছর', en: 'Pivot: department × admission year' },
  task: { bn: 'প্রতিটি বিভাগের <code>name</code> ও তিনটি কলাম: ২০২১, ২০২২, ২০২৩-এ কতজন ভর্তি হয়েছে (শুধু যেসব বিভাগে ছাত্র আছে)।', en: 'Show each department <code>name</code> and three columns: how many students were admitted in 2021, 2022 and 2023 (only departments with students).' },
  hints: [
    { bn: 'রো-কে কলামে ঘোরাতে conditional aggregation: SUM(CASE WHEN ... THEN 1 ELSE 0 END)', en: 'Turning rows into columns = conditional aggregation: SUM(CASE WHEN ... THEN 1 ELSE 0 END)' },
    { bn: 'প্রতি বছরের জন্য একটি SUM(CASE WHEN admission_year = 2021 THEN 1 ELSE 0 END)', en: 'One SUM(CASE WHEN admission_year = 2021 THEN 1 ELSE 0 END) per year' }
  ],
  solution: 'SELECT d.name,\n  SUM(CASE WHEN s.admission_year = 2021 THEN 1 ELSE 0 END) AS y2021,\n  SUM(CASE WHEN s.admission_year = 2022 THEN 1 ELSE 0 END) AS y2022,\n  SUM(CASE WHEN s.admission_year = 2023 THEN 1 ELSE 0 END) AS y2023\nFROM students s\nJOIN departments d ON s.dept_id = d.id\nGROUP BY d.name;',
  explain: {
    bn: '<p><b>পিভট</b> মানে রো-র মানকে কলামে পরিণত করা — Excel-এর Pivot Table-এর মতো। প্রতিটি CASE একটি বছরের জন্য 1 বা 0 দেয়, SUM সেগুলো গোনে। SQL Server/Oracle-এ <code>PIVOT</code> কিওয়ার্ডও আছে, কিন্তু CASE পদ্ধতি সব ডেটাবেসে চলে।</p>',
    en: '<p><b>Pivoting</b> turns row values into columns — like an Excel pivot table. Each CASE yields 1 or 0 for one year and SUM counts them. SQL Server/Oracle have a <code>PIVOT</code> keyword, but the CASE approach works everywhere.</p>'
  }
},
{
  id: 'first-order-per-customer', level: 'medium', tags: ['window', 'ROW_NUMBER'], tables: ['orders'],
  title: { bn: 'প্রতিটি ক্রেতার প্রথম অর্ডার', en: 'Each customer\'s first order' },
  task: { bn: 'প্রতিটি ক্রেতার <b>প্রথম</b> অর্ডারের <code>id, customer_name, order_date</code> দেখাও।', en: 'Show <code>id, customer_name, order_date</code> of each customer\'s <b>first</b> order.' },
  hints: [
    { bn: 'MIN(order_date) দিয়ে শুধু তারিখ পাবে, পুরো রো নয়। পুরো রো চাইলে?', en: 'MIN(order_date) gives only the date, not the whole row. To get the row…' },
    { bn: 'ROW_NUMBER() OVER (PARTITION BY customer_name ORDER BY order_date) = 1', en: 'ROW_NUMBER() OVER (PARTITION BY customer_name ORDER BY order_date) = 1' }
  ],
  solution: 'WITH r AS (\n  SELECT id, customer_name, order_date,\n         ROW_NUMBER() OVER (PARTITION BY customer_name ORDER BY order_date) AS rn\n  FROM orders\n)\nSELECT id, customer_name, order_date FROM r WHERE rn = 1;',
  explain: {
    bn: '<p>"প্রতিটি দলের প্রথম/শেষ রো" = ROW_NUMBER + PARTITION BY। GROUP BY দিয়ে MIN(order_date) পাওয়া যায়, কিন্তু সেই অর্ডারের id পেতে আবার JOIN লাগত। উইন্ডো ফাংশন এক ধাপে পুরো রো দেয়।</p>',
    en: '<p>"First/last row per group" = ROW_NUMBER + PARTITION BY. GROUP BY gives MIN(order_date) but you\'d need another join to get that order\'s id. The window function returns the whole row in one step.</p>'
  }
},
{
  id: 'above-course-average', level: 'medium', tags: ['window', 'JOIN'], tables: ['enrollments', 'students', 'courses'],
  title: { bn: 'কোর্সের গড়ের চেয়ে বেশি নম্বর', en: 'Marks above the course average' },
  task: { bn: 'যেসব এনরোলমেন্টে ছাত্রের নম্বর ওই কোর্সের গড়ের চেয়ে বেশি: ছাত্রের <code>name</code>, কোর্সের <code>title</code>, <code>marks</code>।', en: 'Enrollments where the student scored above that course\'s average: student <code>name</code>, course <code>title</code>, <code>marks</code>.' },
  hints: [
    { bn: 'প্রতিটি রো-র পাশে কোর্সের গড়: AVG(marks) OVER (PARTITION BY course_id)', en: 'Course average beside each row: AVG(marks) OVER (PARTITION BY course_id)' },
    { bn: 'CTE-তে গড় বানাও, তারপর JOIN করে WHERE marks > avg_marks', en: 'Compute the average in a CTE, then join and filter WHERE marks > avg_marks' }
  ],
  solution: 'WITH e AS (\n  SELECT student_id, course_id, marks,\n         AVG(marks) OVER (PARTITION BY course_id) AS avg_marks\n  FROM enrollments\n)\nSELECT s.name, c.title, e.marks\nFROM e\nJOIN students s ON s.id = e.student_id\nJOIN courses c ON c.id = e.course_id\nWHERE e.marks > e.avg_marks;',
  explain: {
    bn: '<p>উইন্ডো ফাংশন রো না কমিয়ে কোর্সের গড় প্রতিটি রো-তে বসায়। তারপর সাধারণ WHERE দিয়ে তুলনা। NULL নম্বর তুলনায় সত্য হয় না, তাই নিজে থেকেই বাদ।</p>',
    en: '<p>The window function puts the course average on every row without collapsing rows. Then a plain WHERE compares. NULL marks never compare true, so they drop out by themselves.</p>'
  }
},
{
  id: 'running-revenue', level: 'medium', tags: ['window', 'running total'], tables: ['orders', 'products'],
  title: { bn: 'দৈনিক আয় ও রানিং টোটাল', en: 'Daily revenue with running total' },
  task: { bn: 'Cancelled বাদে প্রতিটি <code>order_date</code>-এর আয় (<code>quantity * price</code>) এবং শুরু থেকে রানিং টোটাল দেখাও — তারিখ অনুযায়ী সাজিয়ে।', en: 'For non-Cancelled orders, show each <code>order_date</code>, that day\'s revenue (<code>quantity * price</code>) and the running total since the start, sorted by date.' },
  hints: [
    { bn: 'প্রথমে তারিখ অনুযায়ী দৈনিক আয় (GROUP BY order_date)।', en: 'First daily revenue (GROUP BY order_date).' },
    { bn: 'তারপর SUM(SUM(...)) OVER (ORDER BY order_date) — অথবা CTE-তে দৈনিক আয় রেখে SUM(revenue) OVER (ORDER BY order_date)।', en: 'Then SUM(SUM(...)) OVER (ORDER BY order_date) — or daily revenue in a CTE and SUM(revenue) OVER (ORDER BY order_date).' }
  ],
  solution: "WITH daily AS (\n  SELECT o.order_date, SUM(o.quantity * p.price) AS revenue\n  FROM orders o JOIN products p ON p.id = o.product_id\n  WHERE o.status != 'Cancelled'\n  GROUP BY o.order_date\n)\nSELECT order_date, revenue,\n       SUM(revenue) OVER (ORDER BY order_date) AS running_total\nFROM daily\nORDER BY order_date;",
  ordered: true,
  explain: {
    bn: '<p>দুই ধাপ: (১) CTE-তে দিনভিত্তিক মোট, (২) উইন্ডো দিয়ে ক্রমযোজিত যোগফল। ORDER BY-সহ SUM OVER-এর ডিফল্ট ফ্রেম "শুরু থেকে বর্তমান রো" — ঠিক রানিং টোটালের সংজ্ঞা।</p>',
    en: '<p>Two steps: (1) daily totals in a CTE, (2) a cumulative sum with a window. SUM OVER with ORDER BY defaults to "start to current row" — exactly a running total.</p>'
  }
},
{
  id: 'month-over-month', level: 'hard', tags: ['window', 'LAG', 'date'], tables: ['orders'],
  title: { bn: 'মাস-থেকে-মাস পরিবর্তন', en: 'Month-over-month change' },
  task: { bn: 'প্রতিটি মাসের (<code>YYYY-MM</code>) অর্ডার সংখ্যা, আগের মাসের সংখ্যা, এবং পার্থক্য দেখাও — মাস অনুযায়ী সাজিয়ে।', en: 'Show each month (<code>YYYY-MM</code>), its order count, the previous month\'s count, and the difference — sorted by month.' },
  hints: [
    { bn: 'প্রথমে STRFTIME(\'%Y-%m\', order_date) দিয়ে মাসিক COUNT।', en: "First monthly COUNT with STRFTIME('%Y-%m', order_date)." },
    { bn: 'আগের রো-র মান = LAG(cnt) OVER (ORDER BY month)', en: "Previous row's value = LAG(cnt) OVER (ORDER BY month)" },
    { bn: 'পার্থক্য = cnt - LAG(cnt) OVER (ORDER BY month); প্রথম মাসে NULL হবে।', en: 'Difference = cnt - LAG(cnt) OVER (ORDER BY month); NULL for the first month.' }
  ],
  solution: "WITH m AS (\n  SELECT STRFTIME('%Y-%m', order_date) AS month, COUNT(*) AS cnt\n  FROM orders\n  GROUP BY month\n)\nSELECT month, cnt,\n       LAG(cnt) OVER (ORDER BY month) AS prev_cnt,\n       cnt - LAG(cnt) OVER (ORDER BY month) AS change\nFROM m\nORDER BY month;",
  ordered: true,
  explain: {
    bn: '<p>গ্রোথ রিপোর্টের ক্লাসিক কাঠামো: মাসিক অ্যাগ্রিগেট → LAG দিয়ে আগের মাস → পার্থক্য। শতাংশে চাইলে <code>ROUND((cnt - prev) * 100.0 / prev, 1)</code>। প্রথম মাসের আগের মান নেই বলে NULL — এটাই ঠিক আচরণ।</p><p><b>সূক্ষ্ম বিষয়:</b> কোনো মাসে অর্ডার না থাকলে সেই মাস বাদ পড়বে, আর LAG ভুল মাসের সাথে তুলনা করবে। তখন recursive CTE দিয়ে সব মাস তৈরি করে LEFT JOIN করতে হয়।</p>',
    en: '<p>The classic growth-report shape: monthly aggregate → LAG for the previous month → difference. For a percentage use <code>ROUND((cnt - prev) * 100.0 / prev, 1)</code>. The first month has no predecessor, so NULL is correct.</p><p><b>Subtlety:</b> if a month has no orders it disappears and LAG compares with the wrong month. Then generate all months with a recursive CTE and LEFT JOIN.</p>'
  }
},
{
  id: 'median-cgpa', level: 'hard', tags: ['window', 'median'], tables: ['students'],
  title: { bn: 'মিডিয়ান CGPA', en: 'Median CGPA' },
  task: { bn: 'সব ছাত্রের CGPA-র <b>মিডিয়ান</b> বের করো (SQLite-এ MEDIAN ফাংশন নেই)।', en: 'Compute the <b>median</b> CGPA of all students (SQLite has no MEDIAN function).' },
  hints: [
    { bn: 'মিডিয়ান = সাজানো তালিকার মাঝের মান। জোড় সংখ্যক হলে মাঝের দুটির গড়।', en: 'Median = the middle of the sorted list; with an even count, the average of the two middle values.' },
    { bn: 'ROW_NUMBER() OVER (ORDER BY cgpa) আর COUNT(*) OVER () একসাথে বের করো।', en: 'Compute ROW_NUMBER() OVER (ORDER BY cgpa) and COUNT(*) OVER () together.' },
    { bn: 'মাঝের রো: rn IN ((c + 1) / 2, (c + 2) / 2) — পূর্ণসংখ্যা ভাগ দুটো ক্ষেত্রেই কাজ করে।', en: 'Middle rows: rn IN ((c + 1) / 2, (c + 2) / 2) — integer division handles both cases.' }
  ],
  solution: 'WITH o AS (\n  SELECT cgpa,\n         ROW_NUMBER() OVER (ORDER BY cgpa) AS rn,\n         COUNT(*) OVER () AS c\n  FROM students\n)\nSELECT AVG(cgpa) AS median\nFROM o\nWHERE rn IN ((c + 1) / 2, (c + 2) / 2);',
  explain: {
    bn: '<p>১৬ জন ছাত্র → (17)/2 = 8 আর (18)/2 = 9, তাই ৮ম ও ৯ম মানের গড়। বিজোড় হলে (যেমন ১৫) দুটো সূত্রই 8 দেয়, তাই একটাই মান। পূর্ণসংখ্যা ভাগের এই কৌশল জোড়-বিজোড় দুটোই সামলায়।</p><p>PostgreSQL-এ সহজে: <code>PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY cgpa)</code>।</p>',
    en: '<p>16 students → (17)/2 = 8 and (18)/2 = 9, so we average the 8th and 9th values. With an odd count (say 15) both formulas give 8, so one value. Integer division handles both cases.</p><p>In PostgreSQL simply: <code>PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY cgpa)</code>.</p>'
  }
},
{
  id: 'consecutive-logins', level: 'hard', tags: ['gaps & islands', 'window', 'date'], tables: ['logins'],
  title: { bn: 'টানা ৩ দিন লগইন', en: 'Logged in 3 days in a row' },
  task: { bn: 'যেসব ইউজার <b>অন্তত ৩ দিন টানা</b> লগইন করেছে, তাদের <code>user_name</code> দেখাও (প্রতিটি একবার)। মনে রেখো একই দিনে একাধিক লগইন থাকতে পারে।', en: 'Show the <code>user_name</code> of users who logged in on <b>at least 3 consecutive days</b> (each once). Note: there can be several logins on the same day.' },
  hints: [
    { bn: 'প্রথমে প্রতিটি ইউজারের ইউনিক দিনগুলো নাও (DISTINCT)।', en: 'First take each user\'s distinct days (DISTINCT).' },
    { bn: '"Gaps & Islands" কৌশল: তারিখ − ROW_NUMBER() টানা দিনগুলোর জন্য একই মান দেয়।', en: '"Gaps & islands" trick: date − ROW_NUMBER() is constant across consecutive days.' },
    { bn: 'grp = JULIANDAY(login_date) - ROW_NUMBER() OVER (PARTITION BY user_name ORDER BY login_date); তারপর GROUP BY user_name, grp HAVING COUNT(*) >= 3', en: 'grp = JULIANDAY(login_date) - ROW_NUMBER() OVER (PARTITION BY user_name ORDER BY login_date); then GROUP BY user_name, grp HAVING COUNT(*) >= 3' }
  ],
  solution: 'WITH days AS (\n  SELECT DISTINCT user_name, login_date FROM logins\n),\ng AS (\n  SELECT user_name, login_date,\n         JULIANDAY(login_date)\n           - ROW_NUMBER() OVER (PARTITION BY user_name ORDER BY login_date) AS grp\n  FROM days\n)\nSELECT DISTINCT user_name\nFROM g\nGROUP BY user_name, grp\nHAVING COUNT(*) >= 3;',
  explain: {
    bn: '<p><b>Gaps & Islands</b> — হার্ড ইন্টারভিউয়ের প্রিয় প্রশ্ন। ধারণা: টানা দিনগুলোতে তারিখ ১ করে বাড়ে, ROW_NUMBER-ও ১ করে বাড়ে — তাই বিয়োগফল একই থাকে। একটা দিন বাদ পড়লেই বিয়োগফল বদলে যায় → নতুন "দ্বীপ"।</p><pre>Rahim: 03-01 (rn 1) → grp X\n       03-02 (rn 2) → grp X\n       03-03 (rn 3) → grp X   ← ৩ দিনের দ্বীপ\n       03-05 (rn 4) → grp X+1 ← নতুন দ্বীপ</pre><p>DISTINCT প্রথম ধাপে জরুরি — নইলে একই দিনের দুই লগইন ROW_NUMBER গুলিয়ে দেবে।</p>',
    en: '<p><b>Gaps & islands</b> — a favourite hard interview question. Idea: on consecutive days the date rises by 1 and so does ROW_NUMBER, so their difference stays constant. Skip a day and the difference changes → a new "island".</p><pre>Rahim: 03-01 (rn 1) → grp X\n       03-02 (rn 2) → grp X\n       03-03 (rn 3) → grp X   ← a 3-day island\n       03-05 (rn 4) → grp X+1 ← new island</pre><p>The DISTINCT step matters — two logins on one day would otherwise break the ROW_NUMBER sequence.</p>'
  }
},
{
  id: 'longest-streak', level: 'hard', tags: ['gaps & islands', 'window'], tables: ['logins'],
  title: { bn: 'প্রত্যেকের দীর্ঘতম লগইন স্ট্রিক', en: 'Longest login streak per user' },
  task: { bn: 'প্রতিটি <code>user_name</code> ও তার <b>সবচেয়ে লম্বা টানা লগইন দিনের সংখ্যা</b> দেখাও।', en: 'Show each <code>user_name</code> and their <b>longest run of consecutive login days</b>.' },
  hints: [
    { bn: 'আগের চ্যালেঞ্জের মতো দ্বীপ (grp) বানাও।', en: 'Build islands (grp) as in the previous challenge.' },
    { bn: 'প্রতিটি দ্বীপের দৈর্ঘ্য = COUNT(*) (GROUP BY user_name, grp)। তারপর ইউজার অনুযায়ী MAX।', en: 'Island length = COUNT(*) (GROUP BY user_name, grp). Then MAX per user.' }
  ],
  solution: 'WITH days AS (\n  SELECT DISTINCT user_name, login_date FROM logins\n),\ng AS (\n  SELECT user_name,\n         JULIANDAY(login_date)\n           - ROW_NUMBER() OVER (PARTITION BY user_name ORDER BY login_date) AS grp\n  FROM days\n),\nislands AS (\n  SELECT user_name, COUNT(*) AS len FROM g GROUP BY user_name, grp\n)\nSELECT user_name, MAX(len) AS longest_streak\nFROM islands\nGROUP BY user_name;',
  explain: {
    bn: '<p>তিন ধাপের CTE পাইপলাইন: ইউনিক দিন → দ্বীপ নম্বর → দ্বীপের দৈর্ঘ্য → সর্বোচ্চ। বড় সমস্যাকে নামযুক্ত ছোট ধাপে ভাঙা — এটাই CTE-র আসল শক্তি। Duolingo বা GitHub-এর "streak" ফিচার ঠিক এভাবেই হিসাব হয়।</p>',
    en: '<p>A three-step CTE pipeline: distinct days → island id → island length → maximum. Breaking a big problem into named small steps is the real power of CTEs. Streak features in learning or coding apps are computed exactly like this.</p>'
  }
},
{
  id: 'missing-days', level: 'hard', tags: ['recursive CTE', 'EXCEPT', 'date'], tables: ['logins'],
  title: { bn: 'যে দিনগুলোতে লগইন হয়নি', en: 'Days with no login' },
  task: { bn: '<b>2024-03-01</b> থেকে <b>2024-03-06</b> পর্যন্ত যেসব দিনে <b>Rahim</b> লগইন করেনি, সেই তারিখগুলো দেখাও।', en: 'Show the dates between <b>2024-03-01</b> and <b>2024-03-06</b> on which <b>Rahim</b> did not log in.' },
  hints: [
    { bn: 'প্রথমে ০১ থেকে ০৬ পর্যন্ত সব তারিখের একটা তালিকা বানাও — টেবিলে তো নেই!', en: 'First build a list of every date from 01 to 06 — it isn\'t in any table!' },
    { bn: "WITH RECURSIVE d(day) AS (SELECT '2024-03-01' UNION ALL SELECT DATE(day, '+1 day') FROM d WHERE day < '2024-03-06')", en: "WITH RECURSIVE d(day) AS (SELECT '2024-03-01' UNION ALL SELECT DATE(day, '+1 day') FROM d WHERE day < '2024-03-06')" },
    { bn: "তারপর SELECT day FROM d EXCEPT SELECT login_date FROM logins WHERE user_name = 'Rahim'", en: "Then SELECT day FROM d EXCEPT SELECT login_date FROM logins WHERE user_name = 'Rahim'" }
  ],
  solution: "WITH RECURSIVE d(day) AS (\n  SELECT '2024-03-01'\n  UNION ALL\n  SELECT DATE(day, '+1 day') FROM d WHERE day < '2024-03-06'\n)\nSELECT day FROM d\nEXCEPT\nSELECT login_date FROM logins WHERE user_name = 'Rahim';",
  explain: {
    bn: '<p>"যা নেই তা খোঁজা" কঠিন, কারণ অনুপস্থিত ডেটা টেবিলে থাকে না। সমাধান: recursive CTE দিয়ে সম্পূর্ণ তালিকা (date spine) বানাও, তারপর EXCEPT বা LEFT JOIN … IS NULL দিয়ে যা আছে তা বাদ দাও। রিপোর্টে "শূন্য বিক্রির দিন" দেখাতেও একই কৌশল।</p>',
    en: '<p>Finding what is missing is hard because missing data isn\'t in any table. Fix: generate the complete list (a date spine) with a recursive CTE, then remove what exists with EXCEPT or LEFT JOIN … IS NULL. The same trick shows "zero-sales days" in reports.</p>'
  }
},
{
  id: 'hierarchy-path', level: 'hard', tags: ['recursive CTE', 'hierarchy'], tables: ['employees'],
  title: { bn: 'অফিস হায়ারার্কির পথ', en: 'Reporting chain path' },
  task: { bn: 'প্রতিটি কর্মচারীর <code>name</code> ও শীর্ষ বস থেকে তার পর্যন্ত পথ দেখাও, যেমন <code>Dr. Abdul Karim &gt; Mahmud Hasan</code>। শীর্ষ বসদের পথ শুধু নিজের নাম।', en: 'Show each employee\'s <code>name</code> and the path from the top boss down to them, e.g. <code>Dr. Abdul Karim &gt; Mahmud Hasan</code>. A top boss\'s path is just their name.' },
  hints: [
    { bn: 'শুরু (anchor): manager_id IS NULL, path = name', en: 'Anchor: manager_id IS NULL, path = name' },
    { bn: "পুনরাবৃত্তি: JOIN chain c ON e.manager_id = c.id, path = c.path || ' > ' || e.name", en: "Recursive step: JOIN chain c ON e.manager_id = c.id, path = c.path || ' > ' || e.name" }
  ],
  solution: "WITH RECURSIVE chain AS (\n  SELECT id, name, name AS path\n  FROM employees WHERE manager_id IS NULL\n  UNION ALL\n  SELECT e.id, e.name, c.path || ' > ' || e.name\n  FROM employees e JOIN chain c ON e.manager_id = c.id\n)\nSELECT name, path FROM chain;",
  explain: {
    bn: '<p>Recursive CTE গাছের মতো ডেটায় উপর থেকে নিচে হাঁটে: প্রথমে মূল (বস), তারপর প্রতিটি ধাপে তাদের অধীনস্থ, প্রতিবার পথে নাম যোগ করে। ফাইল ফোল্ডার, ক্যাটাগরি ট্রি, কমেন্ট থ্রেড — সব একই কৌশলে।</p><p>বাস্তবে চক্র (A → B → A) থাকলে অসীম লুপ হতে পারে — তখন level সীমা বা path-এ আগে আছে কিনা যাচাই যোগ করো।</p>',
    en: '<p>A recursive CTE walks a tree top-down: first the roots (bosses), then at each step their reports, appending each name to the path. Folders, category trees and comment threads all use the same technique.</p><p>If the data could contain a cycle (A → B → A), add a depth limit or check whether the name is already in the path, or it loops forever.</p>'
  }
}
];
