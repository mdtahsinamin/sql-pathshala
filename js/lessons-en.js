// English versions of the core lessons. Keyed by lesson id.
// Exercise order and quiz answer indexes match the Bangla originals.
window.LESSONS_EN = {
intro: {
  title: 'Introduction to SQL & Databases',
  summary: 'What SQL is, how relational databases work, and our demo database',
  content: `
<h2>What is SQL?</h2>
<p><b>SQL</b> (Structured Query Language, pronounced "S-Q-L" or "sequel") is the language for talking to databases. With it we ask a database things like "give me the names of all students in Dhaka", "change this product's price" or "create a new table".</p>
<p>Behind almost every app — social networks, mobile banking, e-commerce, hospitals — sits a database, and SQL moves data in and out of it. That makes SQL a valuable skill for programmers, data analysts, and even marketing or finance people.</p>
<div class="callout info"><b>Did you know?</b> SQLite, MySQL, PostgreSQL, Oracle and Microsoft SQL Server are all popular databases. They follow the core SQL standard, so what you learn here works almost everywhere. This site runs <b>SQLite</b> right inside your browser.</div>
<h2>What is a relational database?</h2>
<p>A relational database is a collection of <b>tables</b>. Each table looks a lot like an Excel sheet:</p>
<ul>
  <li><b>Column</b> — a named attribute such as <code>name</code>, <code>city</code>, <code>cgpa</code>.</li>
  <li><b>Row</b> — one complete record, e.g. all the data about one student.</li>
  <li><b>Primary key</b> — the column that uniquely identifies each row, usually <code>id</code>.</li>
  <li><b>Foreign key</b> — a reference to another table's primary key. <code>students.dept_id</code> points to <code>departments.id</code>. That is how tables form "relations".</li>
</ul>
<table class="demo-table">
  <caption>Example: part of the students table</caption>
  <tr><th>id</th><th>name</th><th>dept_id</th><th>city</th><th>cgpa</th></tr>
  <tr><td>1</td><td>Rahim Uddin</td><td>1</td><td>Dhaka</td><td>3.75</td></tr>
  <tr><td>2</td><td>Karim Hasan</td><td>1</td><td>Chattogram</td><td>3.2</td></tr>
  <tr><td>3</td><td>Fatema Akter</td><td>2</td><td>Dhaka</td><td>3.9</td></tr>
</table>
<h2>Kinds of SQL commands</h2>
<table class="demo-table">
  <tr><th>Type</th><th>Purpose</th><th>Commands</th></tr>
  <tr><td><b>DQL</b> (Query)</td><td>Read / search data</td><td><code>SELECT</code></td></tr>
  <tr><td><b>DML</b> (Manipulation)</td><td>Add / change / remove data</td><td><code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code></td></tr>
  <tr><td><b>DDL</b> (Definition)</td><td>Create / change table structure</td><td><code>CREATE</code>, <code>ALTER</code>, <code>DROP</code></td></tr>
  <tr><td><b>TCL</b> (Transaction)</td><td>Group changes safely</td><td><code>BEGIN</code>, <code>COMMIT</code>, <code>ROLLBACK</code></td></tr>
</table>
<h2>Our demo database</h2>
<p>Throughout the course we use data from a university and a small online shop. Here are all the tables — click one to see its data.</p>
<div class="schema-auto"></div>
<h2>How to use this site</h2>
<ol>
  <li>Read the lesson. Every example has a <b>▶ Run</b> button.</li>
  <li>The <b>Exercises</b> tab has tasks. Write a query and press <kbd>Ctrl</kbd>+<kbd>Enter</kbd> — you get a ✓ when it's right.</li>
  <li>Stuck? Use the <b>Hint</b>, then the <b>Solution</b>, or ask the <b>AI Tutor</b>.</li>
  <li><b>🔍 Visualize</b> shows how a query runs, step by step.</li>
  <li>Don't worry about breaking data — every run starts from a fresh database.</li>
</ol>
<p>Let's run your first query:</p>
<pre class="ex">SELECT * FROM students;</pre>
`,
  ex: [{ task: 'Your first query! Show all data in the <code>students</code> table.', hint: 'Try SELECT * FROM table_name;' }],
  quiz: [
    { q: 'What uniquely identifies each record in a table?', options: ['Foreign Key', 'Primary Key', 'Column', 'Index'], explain: 'A primary key identifies every row uniquely. No two rows share one.' },
    { q: 'students.dept_id refers to departments.id. What is dept_id?', options: ['Primary Key', 'Foreign Key', 'Unique Key', 'Super Key'], explain: 'A column that references another table\'s primary key is a foreign key.' },
    { q: 'Which is a DDL command?', options: ['SELECT', 'INSERT', 'CREATE', 'COMMIT'], explain: 'CREATE, ALTER and DROP are DDL — they work on table structure.' }
  ]
},
select: {
  title: 'SELECT — reading data',
  summary: 'Fetching specific columns or all columns from a table',
  content: `
<p>To read data we use the <code>SELECT</code> statement. This is called a <b>query</b> — asking the database a question.</p>
<h2>Selecting specific columns</h2>
<pre class="syntax">SELECT column1, column2, ...
FROM table_name;</pre>
<p>To see only the names and cities of students:</p>
<pre class="ex">SELECT name, city
FROM students;</pre>
<p>The database returns a new temporary table with just the columns you asked for. The original table is unchanged.</p>
<h2>All columns: <code>*</code></h2>
<pre class="ex">SELECT * FROM products;</pre>
<div class="callout warn"><b>Note:</b> in real projects avoid <code>SELECT *</code> on big tables — ask only for the columns you need. Queries get faster and code gets clearer.</div>
<h2>Some basic rules</h2>
<ul>
  <li>Keywords (<code>SELECT</code>, <code>FROM</code>) are case-insensitive, but upper case is the convention.</li>
  <li>End statements with <code>;</code> — required when writing several statements.</li>
  <li>Line breaks and spaces don't matter.</li>
  <li>Comments: <code>--</code> for one line, <code>/* ... */</code> for several lines.</li>
</ul>
<pre class="ex">-- This is a comment, the database ignores it
SELECT name, cgpa   /* name and CGPA */
FROM students;</pre>
<h2>Column order</h2>
<p>Columns appear in the order you list them. You can even list one twice.</p>
<pre class="ex">SELECT cgpa, name FROM students;</pre>
`,
  ex: [
    { task: 'Show only the <b>name</b> (<code>name</code>) of every student.', hint: 'SELECT name FROM ...' },
    { task: 'Show every student\'s <b>name</b> and <b>city</b> (<code>city</code>).', hint: 'Separate columns with commas.' },
    { task: 'Show all columns of the <code>products</code> table.', hint: 'Use *.' },
    { task: 'Show each product\'s <b>name</b>, <b>category</b> and <b>price</b> (<code>name, category, price</code>).', hint: 'List the columns in exactly that order.' }
  ],
  quiz: [
    { q: 'Which symbol selects all columns?', options: ['%', '*', '#', 'ALL'], explain: 'SELECT * means "all columns".' },
    { q: 'Will select name from students; work?', options: ['No, keywords must be upper case', 'Yes, keywords are case-insensitive', 'Only in MySQL', 'Only without a semicolon'], explain: 'Keywords work in any case.' },
    { q: 'What happens to the original table when you run SELECT?', options: ['Data is deleted', 'Nothing — it is only read', 'Columns are reordered', 'A new table is saved'], explain: 'SELECT only reads.' }
  ]
},
'where-num': {
  title: 'WHERE — filtering with conditions (numbers)',
  summary: 'Comparison operators, BETWEEN, IN, AND/OR',
  content: `
<p>To get only the rows that meet a condition, use <code>WHERE</code>. The database tests every row and keeps it only if the condition is true.</p>
<pre class="syntax">SELECT column, ...
FROM table
WHERE condition;</pre>
<pre class="ex">SELECT name, cgpa
FROM students
WHERE cgpa > 3.5;</pre>
<h2>Comparison operators</h2>
<table class="demo-table">
  <tr><th>Operator</th><th>Meaning</th><th>Example</th></tr>
  <tr><td><code>=</code></td><td>Equal</td><td><code>admission_year = 2022</code></td></tr>
  <tr><td><code>!=</code> or <code>&lt;&gt;</code></td><td>Not equal</td><td><code>dept_id != 1</code></td></tr>
  <tr><td><code>&lt;</code> <code>&lt;=</code></td><td>Less / less or equal</td><td><code>price &lt;= 500</code></td></tr>
  <tr><td><code>&gt;</code> <code>&gt;=</code></td><td>Greater / greater or equal</td><td><code>cgpa &gt;= 3.5</code></td></tr>
  <tr><td><code>BETWEEN … AND …</code></td><td>Within a range (inclusive)</td><td><code>price BETWEEN 500 AND 5000</code></td></tr>
  <tr><td><code>NOT BETWEEN … AND …</code></td><td>Outside a range</td><td><code>cgpa NOT BETWEEN 3 AND 3.5</code></td></tr>
  <tr><td><code>IN (…)</code></td><td>Any value in the list</td><td><code>id IN (2, 5, 9)</code></td></tr>
  <tr><td><code>NOT IN (…)</code></td><td>None of the list</td><td><code>dept_id NOT IN (1, 2)</code></td></tr>
</table>
<pre class="ex">SELECT name, price
FROM products
WHERE price BETWEEN 500 AND 5000;</pre>
<h2>Combining conditions: AND, OR, NOT</h2>
<ul>
  <li><code>AND</code> — both must be true.</li>
  <li><code>OR</code> — either is enough.</li>
  <li><code>NOT</code> — inverts a condition.</li>
</ul>
<pre class="ex">-- CSE (dept_id = 1) students with CGPA 3.5 or more
SELECT name, cgpa
FROM students
WHERE dept_id = 1 AND cgpa >= 3.5;</pre>
<div class="callout tip"><b>Tip:</b> when mixing <code>AND</code> and <code>OR</code>, use parentheses. <code>AND</code> binds tighter, so <code>a OR b AND c</code> means <code>a OR (b AND c)</code> — probably not what you meant.</div>
<pre class="ex">SELECT name, admission_year, cgpa
FROM students
WHERE (admission_year = 2021 OR admission_year = 2023)
  AND cgpa > 3.5;</pre>
`,
  ex: [
    { task: 'Show all data of students whose <code>cgpa</code> is <b>greater than</b> 3.5.', hint: 'WHERE cgpa > 3.5' },
    { task: 'Show the <b>names</b> of students admitted in 2022 (<code>admission_year</code>).', hint: 'Equality in SQL is a single =.' },
    { task: 'Show <code>name</code> and <code>price</code> of products priced <b>500 to 5000</b> (inclusive).', hint: 'BETWEEN 500 AND 5000' },
    { task: 'Show all data for students with <code>id</code> 2, 5 and 9.', hint: 'IN (2, 5, 9)' },
    { task: 'Show <code>name</code> and <code>cgpa</code> of CSE students (<code>dept_id = 1</code>) with CGPA <b>3.5 or more</b>.', hint: 'Join two conditions with AND.' }
  ],
  quiz: [
    { q: 'price BETWEEN 100 AND 200 — is a price of exactly 200 included?', options: ['Yes, BETWEEN is inclusive', 'No, 200 is excluded', 'Only 100 counts', 'Depends on the database'], explain: 'BETWEEN includes both ends.' },
    { q: 'How is a OR b AND c evaluated?', options: ['(a OR b) AND c', 'a OR (b AND c)', 'Left to right', 'Error'], explain: 'AND has higher precedence than OR. Parentheses keep it safe.' },
    { q: 'Which means "not equal"?', options: ['=!', '!= or <>', '><', 'NOT='], explain: 'Both != and <> mean not equal.' }
  ]
},
'where-text': {
  title: 'WHERE — text and LIKE',
  summary: 'Matching text and searching patterns with LIKE',
  content: `
<p>To filter a text (string) column, put the value inside <b>single quotes</b> <code>' '</code>.</p>
<pre class="ex">SELECT name, city
FROM students
WHERE city = 'Dhaka';</pre>
<div class="callout warn"><b>Common mistake:</b> <code>WHERE city = Dhaka</code> makes SQL think <code>Dhaka</code> is a column name, so it errors. Text always goes in quotes: <code>'Dhaka'</code>.</div>
<h2>Operators for text</h2>
<table class="demo-table">
  <tr><th>Operator</th><th>Meaning</th><th>Example</th></tr>
  <tr><td><code>=</code></td><td>Exact match</td><td><code>city = 'Dhaka'</code></td></tr>
  <tr><td><code>!=</code> / <code>&lt;&gt;</code></td><td>No match</td><td><code>category != 'Grocery'</code></td></tr>
  <tr><td><code>LIKE</code></td><td>Matches a pattern</td><td><code>name LIKE 'S%'</code></td></tr>
  <tr><td><code>NOT LIKE</code></td><td>Doesn't match</td><td><code>name NOT LIKE '%a'</code></td></tr>
  <tr><td><code>%</code></td><td>(in LIKE) zero or more characters</td><td><code>'%Hossain%'</code></td></tr>
  <tr><td><code>_</code></td><td>(in LIKE) exactly one character</td><td><code>'_ita'</code> → Mita, Rita</td></tr>
  <tr><td><code>IN (…)</code></td><td>Any in the list</td><td><code>city IN ('Sylhet', 'Khulna')</code></td></tr>
</table>
<h2>Pattern search with LIKE</h2>
<pre class="ex">-- Names starting with 'S'
SELECT name FROM students WHERE name LIKE 'S%';</pre>
<pre class="ex">-- Names containing 'Hossain'
SELECT name FROM students WHERE name LIKE '%Hossain%';</pre>
<pre class="ex">-- Names ending with 'n'
SELECT name FROM students WHERE name LIKE '%n';</pre>
<div class="callout info"><b>Did you know?</b> In SQLite and MySQL, <code>LIKE</code> ignores case for English letters. PostgreSQL does not — use <code>ILIKE</code> there. <code>=</code> usually needs an exact match.</div>
`,
  ex: [
    { task: 'Show all data of students from <b>Dhaka</b>.', hint: "Text in single quotes: 'Dhaka'" },
    { task: 'Show <code>name</code> of students whose name starts with <b>S</b>.', hint: "LIKE 'S%'" },
    { task: 'Show <code>name</code> and <code>city</code> of students whose name contains <b>Hossain</b>.', hint: "Put % on both sides: '%Hossain%'" },
    { task: 'Show <code>name</code> and <code>city</code> of students from <b>Sylhet</b> or <b>Khulna</b>.', hint: "IN ('Sylhet', 'Khulna') or use OR." },
    { task: 'Show <code>name</code> and <code>category</code> of all products not in <b>Grocery</b>.', hint: "!= 'Grocery'" }
  ],
  quiz: [
    { q: "Which name matches name LIKE '_a%'?", options: ['Shirin', 'Karim', 'Ahmed', 'Nusrat'], explain: "'_a%' = any one character, then 'a', then anything. K-a-rim ✓; the others don't have 'a' second." },
    { q: 'What happens with WHERE city = Dhaka (no quotes)?', options: ['Rows from Dhaka', 'Error: no column named Dhaka', 'Empty result', 'All rows'], explain: 'Without quotes SQL reads it as a column name.' },
    { q: 'What does % mean in LIKE?', options: ['Exactly one character', 'Zero or more characters', 'Digits only', 'Percent'], explain: '% = any number of characters (even none). _ = exactly one.' }
  ]
},
order: {
  title: 'DISTINCT, ORDER BY & LIMIT',
  summary: 'Removing duplicates, sorting and limiting results',
  content: `
<h2>DISTINCT — remove duplicates</h2>
<p>Many students share a city. To see each city once:</p>
<pre class="ex">SELECT DISTINCT city FROM students;</pre>
<p>With several columns, <code>DISTINCT</code> applies to the whole combination — <code>SELECT DISTINCT city, admission_year</code> gives unique city+year pairs.</p>
<h2>ORDER BY — sort results</h2>
<p>Without it, the database guarantees no order. To sort:</p>
<pre class="syntax">SELECT ... FROM ...
ORDER BY column ASC;   -- smallest first (default)
ORDER BY column DESC;  -- largest first</pre>
<pre class="ex">SELECT name, cgpa
FROM students
ORDER BY cgpa DESC;</pre>
<p>Sort by several columns — the second breaks ties in the first:</p>
<pre class="ex">SELECT name, city, cgpa
FROM students
ORDER BY city ASC, cgpa DESC;</pre>
<h2>LIMIT and OFFSET</h2>
<p><code>LIMIT n</code> returns the first n rows. <code>OFFSET m</code> skips the first m rows. This is how websites build pagination (page 1, 2, 3…).</p>
<pre class="ex">-- Top 3 CGPAs
SELECT name, cgpa
FROM students
ORDER BY cgpa DESC
LIMIT 3;</pre>
<pre class="ex">-- 4th to 6th cheapest products
SELECT name, price
FROM products
ORDER BY price
LIMIT 3 OFFSET 3;</pre>
<div class="callout info"><b>Did you know?</b> SQL Server has no <code>LIMIT</code> — it uses <code>SELECT TOP 3 ...</code>. Oracle uses <code>FETCH FIRST 3 ROWS ONLY</code>.</div>
<p>Clause order: <code>SELECT → FROM → WHERE → ORDER BY → LIMIT</code></p>
`,
  ex: [
    { task: 'Show a <b>unique</b> list of the cities students come from.', hint: 'SELECT DISTINCT city ...' },
    { task: 'Show every student\'s <code>name</code> and <code>cgpa</code>, <b>highest CGPA first</b>.', hint: 'ORDER BY cgpa DESC' },
    { task: 'Show <code>name</code> and <code>cgpa</code> of the <b>top 3</b> students by CGPA.', hint: 'ORDER BY ... DESC LIMIT 3' },
    { task: 'Sorting products by price (cheapest first), show <code>name</code> and <code>price</code> of the <b>4th, 5th and 6th</b>.', hint: 'Skip 3 with OFFSET 3, then LIMIT 3.' },
    { task: 'Show students\' <code>name, city, cgpa</code> — sorted by city (A→Z), and within a city by CGPA highest first.', hint: 'ORDER BY city ASC, cgpa DESC' }
  ],
  quiz: [
    { q: 'What order does ORDER BY use without ASC/DESC?', options: ['DESC', 'ASC (smallest first)', 'Random', 'Error'], explain: 'The default is ASC.' },
    { q: 'LIMIT 5 OFFSET 10 returns which rows?', options: ['1–5', '10–15', '11–15', '5–10'], explain: 'Skip 10, take the next 5 — rows 11 to 15.' },
    { q: 'Without ORDER BY, what is true about result order?', options: ['Always by id', 'Always insertion order', 'Not guaranteed', 'Alphabetical'], explain: 'If you need an order, write ORDER BY.' }
  ]
},
review1: {
  title: 'Review: simple SELECT queries',
  summary: 'Practise everything so far on the cities table',
  content: `
<p>Congratulations! 🎉 You've learned the most-used part of SQL. Let's practise on <code>cities</code> — districts of Bangladesh with division, population and area (approximate data).</p>
<pre class="ex">SELECT * FROM cities;</pre>
<h2>Summary</h2>
<pre class="syntax">SELECT DISTINCT column, ...
FROM table
WHERE condition
ORDER BY column ASC/DESC
LIMIT n OFFSET m;</pre>
<ul>
  <li><code>SELECT</code> — which columns</li>
  <li><code>FROM</code> — which table</li>
  <li><code>WHERE</code> — which rows (<code>=, &lt;, BETWEEN, IN, LIKE, AND, OR</code>)</li>
  <li><code>DISTINCT</code> — remove duplicates</li>
  <li><code>ORDER BY</code> — sort</li>
  <li><code>LIMIT / OFFSET</code> — how many rows</li>
</ul>
<div class="callout tip"><b>Tip:</b> break hard questions into small steps. First <code>SELECT * FROM cities</code>, then add WHERE, then ORDER BY, then LIMIT.</div>
`,
  ex: [
    { task: 'Show <code>name</code> and <code>population</code> of all districts in the <b>Dhaka</b> division (<code>division</code>).', hint: "WHERE division = 'Dhaka'" },
    { task: 'Show <code>name</code> and <code>population</code> of the <b>3</b> most populous districts (largest first).', hint: 'ORDER BY population DESC LIMIT 3' },
    { task: 'Show <code>name</code> of districts with area (<code>area_km2</code>) <b>under 2500</b>, alphabetically.', hint: 'WHERE area_km2 < 2500 ORDER BY name' },
    { task: 'Show <code>name, division, population</code> of districts in <b>Chattogram</b> or <b>Rajshahi</b> division, by population descending.', hint: "IN ('Chattogram', 'Rajshahi') then ORDER BY" },
    { task: 'Show <code>name</code> and <code>area_km2</code> of the <b>2nd to 4th</b> largest districts by area.', hint: 'Skip the first: OFFSET 1, then LIMIT 3' }
  ],
  quiz: [
    { q: 'In which order are the clauses written?', options: ['SELECT, WHERE, FROM, ORDER BY', 'SELECT, FROM, WHERE, ORDER BY, LIMIT', 'FROM, SELECT, WHERE, LIMIT', 'SELECT, FROM, ORDER BY, WHERE'], explain: 'SELECT → FROM → WHERE → ORDER BY → LIMIT' },
    { q: 'Which gets the least populous district?', options: ['ORDER BY population DESC LIMIT 1', 'ORDER BY population LIMIT 1', 'WHERE population = MIN', 'LIMIT 1 ORDER BY population'], explain: 'Sort ascending (default) and take the first.' }
  ]
},
join: {
  title: 'INNER JOIN — combining tables',
  summary: 'Bringing data from several tables together',
  content: `
<h2>Why is data split across tables?</h2>
<p>If every student row stored the department name, building and budget, "Building A" would be written 100 times for 100 CSE students. Changing the building means 100 updates, with plenty of room for mistakes.</p>
<p>So databases split data up — this is <b>normalization</b>. The student table keeps only <code>dept_id</code>; department details live in <code>departments</code>. When needed we combine them with <code>JOIN</code>.</p>
<h2>INNER JOIN</h2>
<pre class="syntax">SELECT column, ...
FROM table_a
INNER JOIN table_b
  ON table_a.column = table_b.column;</pre>
<p><code>ON</code> says which columns link the tables. <code>INNER JOIN</code> returns only rows that match in <b>both</b> tables.</p>
<pre class="ex">SELECT students.name, departments.name
FROM students
INNER JOIN departments
  ON students.dept_id = departments.id;</pre>
<p>Notice <code>Sabbir Hossain</code> has no <code>dept_id</code> (NULL), so he's missing. Pharmacy has no students, so it's missing too.</p>
<h2>Table aliases</h2>
<p>Short names save typing. When both tables have a column with the same name (<code>name</code>, <code>id</code>), you must say which table you mean.</p>
<pre class="ex">SELECT s.name, d.name AS department, d.building
FROM students AS s
JOIN departments AS d ON s.dept_id = d.id
WHERE s.cgpa > 3.5;</pre>
<p>Plain <code>JOIN</code> means <code>INNER JOIN</code>. <code>AS</code> is optional — <code>students s</code> works too.</p>
<h2>Three or more tables</h2>
<p><code>enrollments</code> links students and courses (a many-to-many relationship). Who got what marks in which course:</p>
<pre class="ex">SELECT s.name, c.title, e.marks
FROM enrollments e
JOIN students s ON e.student_id = s.id
JOIN courses c  ON e.course_id = c.id;</pre>
<div class="callout tip"><b>Tip:</b> before writing a JOIN, find the linking columns — usually one table's <code>id</code> and the other's <code>xxx_id</code>.</div>
`,
  ex: [
    { task: 'Show each student\'s <b>name</b> and their <b>department name</b> (two columns).', hint: 'students JOIN departments ON students.dept_id = departments.id' },
    { task: 'Show each course\'s <code>title</code> and the department (<code>name</code>) offering it.', hint: 'courses.dept_id = departments.id' },
    { task: 'Show the <b>name</b> and <b>marks</b> of students enrolled in <b>Database Systems</b>.', hint: 'Join enrollments, students, courses, then WHERE c.title = ...' },
    { task: 'Show <code>name</code> and their department\'s <code>building</code> for employees earning <b>more than 80000</b>.', hint: 'employees JOIN departments, then WHERE salary > 80000' },
    { task: 'Show each order\'s <code>id</code>, <code>customer_name</code> and the product <code>name</code>.', hint: 'orders.product_id = products.id' }
  ],
  quiz: [
    { q: 'Which rows does INNER JOIN return?', options: ['All rows of the left table', 'All rows of both', 'Only rows matching in both tables', 'Rows that don\'t match'], explain: 'INNER JOIN = matching rows only.' },
    { q: 'Both tables have a name column and you write SELECT name. What happens?', options: ['The first table\'s', 'Error: ambiguous column name', 'Both appear', 'Empty'], explain: 'Say s.name or d.name.' },
    { q: 'What is splitting data across tables called?', options: ['Indexing', 'Normalization', 'Aggregation', 'Partitioning'], explain: 'Normalization reduces duplication and keeps data consistent.' }
  ]
},
'outer-join': {
  title: 'OUTER JOIN — LEFT, RIGHT, FULL',
  summary: 'Keeping rows without a match; finding unmatched data',
  content: `
<p><code>INNER JOIN</code> drops unmatched rows. Often we want them too — "show all departments, even with no students". That's an <b>OUTER JOIN</b>.</p>
<div class="join-diagram">
  <div><div class="venn left"></div><b>LEFT JOIN</b><span>all of left + matches</span></div>
  <div><div class="venn inner"></div><b>INNER JOIN</b><span>matches only</span></div>
  <div><div class="venn right"></div><b>RIGHT JOIN</b><span>all of right + matches</span></div>
  <div><div class="venn full"></div><b>FULL JOIN</b><span>everything</span></div>
</div>
<h2>LEFT JOIN</h2>
<p><b>All</b> rows of the left (first) table are kept. Where the right table has no match, its columns become <code>NULL</code>.</p>
<pre class="ex">SELECT d.name AS department, s.name AS student
FROM departments d
LEFT JOIN students s ON s.dept_id = d.id;</pre>
<p><b>Pharmacy</b> shows student <code>NULL</code> — nobody is in it.</p>
<h2>Finding unmatched rows (very useful!)</h2>
<pre class="ex">-- Departments with no students
SELECT d.name
FROM departments d
LEFT JOIN students s ON s.dept_id = d.id
WHERE s.id IS NULL;</pre>
<h2>RIGHT JOIN and FULL OUTER JOIN</h2>
<p><code>RIGHT JOIN</code> is the mirror of LEFT JOIN. In practice people swap the tables and use LEFT JOIN. <code>FULL OUTER JOIN</code> keeps all rows from both sides.</p>
<pre class="ex">SELECT s.name AS student, d.name AS department
FROM students s
FULL OUTER JOIN departments d ON s.dept_id = d.id;</pre>
<p>Both Sabbir (no department) and Pharmacy (no students) appear.</p>
<div class="callout info"><b>Did you know?</b> MySQL has no <code>FULL OUTER JOIN</code> — combine a LEFT and a RIGHT JOIN with <code>UNION</code>. SQLite supports RIGHT and FULL JOIN since 3.39.</div>
`,
  ex: [
    { task: 'Show <b>all departments</b> with their students\' names — departments without students must still appear. Columns: department <code>name</code>, student <code>name</code>.', hint: 'departments LEFT JOIN students' },
    { task: 'Show the <code>name</code> of departments with <b>no students</b>.', hint: 'LEFT JOIN, then WHERE s.id IS NULL' },
    { task: 'Show the <code>title</code> of courses <b>nobody enrolled in</b>.', hint: 'courses LEFT JOIN enrollments ... WHERE e.id IS NULL' },
    { task: 'Show <b>every student\'s</b> <code>name</code> and their department <code>name</code> — students without a department included.', hint: 'Put students on the left this time.' }
  ],
  quiz: [
    { q: 'In a LEFT JOIN, what fills the right columns when there is no match?', options: ['0', 'Empty string', 'NULL', 'The row is dropped'], explain: 'Unmatched columns become NULL.' },
    { q: 'Do A LEFT JOIN B and B RIGHT JOIN A give the same result?', options: ['Yes (except column order)', 'No', 'Only in MySQL', 'Never'], explain: 'Both keep all rows of A.' },
    { q: '"Customers who never ordered" — best pattern?', options: ['INNER JOIN', 'LEFT JOIN + WHERE right.id IS NULL', 'CROSS JOIN', 'GROUP BY'], explain: 'LEFT JOIN + IS NULL is the classic anti-join.' }
  ]
},
null: {
  title: 'NULL — missing values',
  summary: 'IS NULL, IS NOT NULL, COALESCE and the odd behaviour of NULL',
  content: `
<p><code>NULL</code> means "unknown" or "no value". It is not zero (<code>0</code>) and not empty text (<code>''</code>). Some students have no email — that's <code>NULL</code>.</p>
<h2>Finding NULL: IS NULL</h2>
<div class="callout warn"><b>Common mistake:</b> <code>WHERE email = NULL</code> never works! Any comparison with NULL gives NULL (unknown), not true. Always write <code>IS NULL</code> or <code>IS NOT NULL</code>.</div>
<pre class="ex">SELECT name, email
FROM students
WHERE email IS NULL;</pre>
<pre class="ex">-- Wrong — returns no rows
SELECT name FROM students WHERE email = NULL;</pre>
<h2>Replacing NULL: COALESCE</h2>
<p><code>COALESCE(a, b, c...)</code> returns the first value that isn't NULL. Handy for nice reports.</p>
<pre class="ex">SELECT name, COALESCE(email, 'no email') AS email
FROM students;</pre>
<p><code>IFNULL(a, b)</code> in SQLite/MySQL and <code>ISNULL(a, b)</code> in SQL Server do the same.</p>
<h2>How NULL behaves</h2>
<ul>
  <li>Arithmetic with NULL gives NULL: <code>5 + NULL = NULL</code></li>
  <li><code>COUNT(*)</code> counts all rows, <code>COUNT(email)</code> skips NULLs.</li>
  <li><code>AVG</code>, <code>SUM</code> etc. ignore NULLs.</li>
  <li>If a <code>NOT IN</code> list contains NULL, no rows come back — careful!</li>
</ul>
<pre class="ex">SELECT COUNT(*) AS total, COUNT(email) AS has_email
FROM students;</pre>
<div class="callout tip"><b>Tip:</b> when creating tables, put <code>NOT NULL</code> on columns that must never be empty.</div>
`,
  ex: [
    { task: 'Show <code>name</code> of students with <b>no email</b>.', hint: 'WHERE email IS NULL' },
    { task: 'Show <code>name</code> and <code>email</code> of students who <b>have</b> an email.', hint: 'IS NOT NULL' },
    { task: 'Show every student\'s <code>name</code> and email — <code>\'N/A\'</code> when missing.', hint: "COALESCE(email, 'N/A')" },
    { task: 'Show <code>name</code> and <code>role</code> of employees with <b>no manager</b> (<code>manager_id</code>).', hint: 'manager_id IS NULL' }
  ],
  quiz: [
    { q: 'What does WHERE email = NULL return?', options: ['Rows with no email', 'No rows', 'Error', 'All rows'], explain: '= NULL is always unknown, so nothing matches. Use IS NULL.' },
    { q: 'SELECT 10 + NULL; gives?', options: ['10', '0', 'NULL', 'Error'], explain: 'Any arithmetic with NULL is NULL.' },
    { q: 'COALESCE(NULL, NULL, 7, 9) = ?', options: ['NULL', '7', '9', '16'], explain: 'The first non-NULL value: 7.' }
  ]
},
expressions: {
  title: 'Expressions, AS & functions',
  summary: 'Calculated columns, aliases, text and number functions',
  content: `
<p>SELECT can compute new columns, not just return existing ones — these are expressions.</p>
<pre class="ex">SELECT name, price, stock, price * stock
FROM products;</pre>
<h2>AS — give a column a name (alias)</h2>
<pre class="ex">SELECT name, price * stock AS stock_value
FROM products
ORDER BY stock_value DESC;</pre>
<h2>Arithmetic operators</h2>
<p><code>+  -  *  /  %</code> (remainder). Careful: in SQLite dividing two integers drops the fraction (<code>7 / 2 = 3</code>). For decimals make one side a decimal: <code>7 * 1.0 / 2 = 3.5</code>.</p>
<pre class="ex">-- Population density (per km²)
SELECT name, ROUND(population * 1.0 / area_km2, 2) AS density
FROM cities
ORDER BY density DESC;</pre>
<h2>Useful functions</h2>
<table class="demo-table">
  <tr><th>Function</th><th>Does</th><th>Example → result</th></tr>
  <tr><td><code>UPPER(x)</code> / <code>LOWER(x)</code></td><td>Upper / lower case</td><td><code>UPPER('dhaka')</code> → DHAKA</td></tr>
  <tr><td><code>LENGTH(x)</code></td><td>Number of characters</td><td><code>LENGTH('SQL')</code> → 3</td></tr>
  <tr><td><code>SUBSTR(x, start, len)</code></td><td>Part of a text</td><td><code>SUBSTR('Bangladesh', 1, 6)</code> → Bangla</td></tr>
  <tr><td><code>x || y</code></td><td>Concatenate</td><td><code>'Hello' || ' ' || 'SQL'</code></td></tr>
  <tr><td><code>TRIM(x)</code></td><td>Strip spaces</td><td><code>TRIM('  hi ')</code> → hi</td></tr>
  <tr><td><code>REPLACE(x, old, new)</code></td><td>Replace</td><td><code>REPLACE('a-b', '-', '+')</code></td></tr>
  <tr><td><code>ROUND(x, n)</code></td><td>Round to n decimals</td><td><code>ROUND(3.14159, 2)</code> → 3.14</td></tr>
  <tr><td><code>ABS(x)</code></td><td>Absolute value</td><td><code>ABS(-5)</code> → 5</td></tr>
</table>
<pre class="ex">SELECT UPPER(name) AS name_caps,
       LENGTH(name) AS len,
       name || ' (' || city || ')' AS label
FROM students;</pre>
<div class="callout info"><b>Did you know?</b> MySQL concatenates with <code>CONCAT(a, b)</code>, SQL Server with <code>a + b</code>. PostgreSQL and SQLite use <code>||</code>. Dates get their own lesson next.</div>
`,
  ex: [
    { task: 'Show each product\'s <code>name</code> and total stock value (<code>price * stock</code>) named <code>stock_value</code>.', hint: 'price * stock AS stock_value' },
    { task: 'Show each district\'s <code>name</code> and population density (<code>population / area_km2</code>, 2 decimals) — highest first.', hint: 'ROUND(population * 1.0 / area_km2, 2) — multiplying by 1.0 gives decimal division' },
    { task: 'Show each employee\'s <code>name</code> and <b>yearly</b> salary (<code>salary * 12</code>).', hint: 'salary * 12' },
    { task: 'Show each student\'s name in <b>upper case</b> and the <b>length</b> of the name.', hint: 'UPPER(name), LENGTH(name)' },
    { task: 'Show each order\'s <code>id</code>, the product <code>name</code> and the total (<code>quantity * price</code>).', hint: 'orders JOIN products, then o.quantity * p.price' }
  ],
  quiz: [
    { q: 'In SQLite, SELECT 7 / 2; gives?', options: ['3.5', '3', '4', 'Error'], explain: 'Integer ÷ integer = integer. Write 7.0 / 2 for 3.5.' },
    { q: 'Which keyword renames a column?', options: ['RENAME', 'AS', 'NAME', 'ALIAS'], explain: 'SELECT price * 2 AS double_price' },
    { q: "In SQLite, 'Dhaka' || '-' || 'BD' gives?", options: ['Dhaka-BD', 'Error', '0', 'DhakaBD'], explain: '|| concatenates text.' }
  ]
},
aggregates: {
  title: 'Aggregate functions',
  summary: 'Summaries with COUNT, SUM, AVG, MIN, MAX',
  content: `
<p>Often we don't want every row but a <b>summary</b> — "how many students?", "what's the average salary?". <b>Aggregate functions</b> turn many rows into one value.</p>
<table class="demo-table">
  <tr><th>Function</th><th>Does</th></tr>
  <tr><td><code>COUNT(*)</code></td><td>Number of rows</td></tr>
  <tr><td><code>COUNT(column)</code></td><td>Rows where that column isn't NULL</td></tr>
  <tr><td><code>COUNT(DISTINCT column)</code></td><td>Number of unique values</td></tr>
  <tr><td><code>SUM(column)</code></td><td>Total</td></tr>
  <tr><td><code>AVG(column)</code></td><td>Average</td></tr>
  <tr><td><code>MIN(column)</code> / <code>MAX(column)</code></td><td>Smallest / largest</td></tr>
</table>
<pre class="ex">SELECT COUNT(*) AS total_students,
       ROUND(AVG(cgpa), 2) AS avg_cgpa,
       MAX(cgpa) AS best,
       MIN(cgpa) AS lowest
FROM students;</pre>
<pre class="ex">SELECT COUNT(DISTINCT city) AS city_count FROM students;</pre>
<h2>With WHERE</h2>
<p>WHERE filters rows first, then the aggregate is computed:</p>
<pre class="ex">-- Average salary of lecturers only
SELECT AVG(salary) FROM employees WHERE role = 'Lecturer';</pre>
<div class="callout warn"><b>Common mistake:</b> <code>SELECT name, MAX(salary) FROM employees</code> — mixing plain columns and aggregates is an error in most databases (SQLite allows it, but don't rely on it). To find who earns the most, use a subquery or ORDER BY + LIMIT.</div>
`,
  ex: [
    { task: 'How many students are there?', hint: 'COUNT(*)' },
    { task: 'Show the average CGPA of all students (2 decimals).', hint: 'ROUND(AVG(cgpa), 2)' },
    { task: 'Show the <b>highest</b> and <b>lowest</b> employee salary (two columns).', hint: 'MAX(salary), MIN(salary)' },
    { task: 'How many students have an email? (use COUNT\'s special behaviour)', hint: 'COUNT(email) skips NULLs.' },
    { task: 'What is the total stock value of all products (sum of <code>price * stock</code>)?', hint: 'SUM(price * stock)' }
  ],
  quiz: [
    { q: 'Difference between COUNT(*) and COUNT(email)?', options: ['None', 'COUNT(email) skips NULLs', 'COUNT(*) skips NULLs', 'COUNT(email) skips duplicates'], explain: 'COUNT(column) counts only non-NULL values.' },
    { q: 'cgpa values 3.0, 4.0, NULL — AVG(cgpa) = ?', options: ['2.33', '3.5', 'NULL', '7.0'], explain: 'AVG ignores NULL: (3+4)/2 = 3.5' },
    { q: 'Which counts unique values?', options: ['COUNT(UNIQUE x)', 'COUNT(DISTINCT x)', 'DISTINCT COUNT(x)', 'UNIQUE(x)'], explain: 'COUNT(DISTINCT x)' }
  ]
},
'group-by': {
  title: 'GROUP BY & HAVING',
  summary: 'Splitting rows into groups and summarising each',
  content: `
<p>"How many students per city?" — we split students into <b>groups</b> by city and COUNT each group. That's <code>GROUP BY</code>.</p>
<pre class="syntax">SELECT group_column, AGG_FUNC(column)
FROM table
GROUP BY group_column;</pre>
<pre class="ex">SELECT city, COUNT(*) AS student_count
FROM students
GROUP BY city
ORDER BY student_count DESC;</pre>
<p>How it works: rows with the same <code>city</code> go into one bucket, then COUNT runs per bucket, giving one row per bucket. Try <b>🔍 Visualize</b> to watch it.</p>
<div class="callout warn"><b>Rule:</b> with GROUP BY, SELECT should contain only (1) grouped columns and (2) aggregates. Anything else is an error in PostgreSQL/SQL Server.</div>
<h2>GROUP BY with JOIN</h2>
<pre class="ex">SELECT d.name, COUNT(s.id) AS students, ROUND(AVG(s.cgpa), 2) AS avg_cgpa
FROM departments d
LEFT JOIN students s ON s.dept_id = d.id
GROUP BY d.name;</pre>
<h2>HAVING — conditions on groups</h2>
<p><code>WHERE</code> filters rows <b>before</b> grouping. <code>HAVING</code> filters groups <b>after</b> grouping — so HAVING can use aggregates and WHERE can't.</p>
<pre class="ex">-- Cities with 3 or more students
SELECT city, COUNT(*) AS cnt
FROM students
GROUP BY city
HAVING COUNT(*) >= 3;</pre>
<pre class="ex">-- WHERE and HAVING together
SELECT dept_id, ROUND(AVG(cgpa), 2) AS avg_cgpa
FROM students
WHERE admission_year > 2021
GROUP BY dept_id
HAVING AVG(cgpa) > 3.4;</pre>
`,
  ex: [
    { task: 'Show how many students per city — <code>city</code> and the count.', hint: 'GROUP BY city' },
    { task: 'Show the average salary per <code>role</code>.', hint: 'GROUP BY role, AVG(salary)' },
    { task: 'Show each department\'s <b>name</b> and its number of students (only departments that have students).', hint: 'JOIN, then GROUP BY d.name' },
    { task: 'Show <code>city</code> and count for cities with <b>3 or more</b> students.', hint: 'HAVING COUNT(*) >= 3' },
    { task: 'Show total stock per category — only categories with total stock <b>above 100</b>. Columns: <code>category</code>, total stock.', hint: 'GROUP BY category HAVING SUM(stock) > 100' }
  ],
  quiz: [
    { q: 'Main difference between WHERE and HAVING?', options: ['None', 'WHERE filters rows before grouping; HAVING filters groups after', 'HAVING runs first', 'WHERE is for text only'], explain: 'Aggregate conditions (COUNT(*) > 3) go in HAVING.' },
    { q: 'What happens with WHERE COUNT(*) > 3?', options: ['Works', 'Error: misuse of aggregate', 'Empty result', 'Acts like HAVING'], explain: 'Aggregates are not allowed in WHERE.' },
    { q: 'SELECT city, name, COUNT(*) FROM students GROUP BY city — the problem?', options: ['None', 'name is neither grouped nor aggregated', 'COUNT(*) is wrong', 'city is needed twice'], explain: 'A city has many names — which one to show? Invalid in standard SQL.' }
  ]
},
'exec-order': {
  title: 'How a query runs (execution order)',
  summary: 'The database does not run clauses in the order you write them',
  content: `
<p>You now know every part of a full SELECT:</p>
<pre class="syntax">SELECT DISTINCT column, AGG(column)
FROM table
JOIN other_table ON ...
WHERE condition
GROUP BY column
HAVING group_condition
ORDER BY column
LIMIT n OFFSET m;</pre>
<p>But the database does <b>not</b> run it top to bottom. The real order:</p>
<ol class="steps">
  <li><b>FROM & JOIN</b> — gather and combine the source rows.</li>
  <li><b>WHERE</b> — test each row, drop the rest.</li>
  <li><b>GROUP BY</b> — split remaining rows into groups.</li>
  <li><b>HAVING</b> — filter groups.</li>
  <li><b>SELECT</b> — compute columns/expressions, create aliases.</li>
  <li><b>DISTINCT</b> — remove duplicates.</li>
  <li><b>ORDER BY</b> — sort.</li>
  <li><b>LIMIT / OFFSET</b> — cut to size.</li>
</ol>
<p>Press <b>🔍 Visualize</b> on the example below to watch each step.</p>
<h2>Why it matters</h2>
<ul>
  <li><b>SELECT aliases can't be used in WHERE</b> (in standard SQL) because WHERE runs before SELECT. They work in ORDER BY, which runs after.</li>
  <li><b>COUNT/SUM can't be used in WHERE</b> because groups don't exist yet — hence HAVING.</li>
  <li><b>LIMIT is last</b> — without ORDER BY you can't know which rows you'll get.</li>
</ul>
<pre class="ex">-- Aliases work in ORDER BY
SELECT division, SUM(population) AS total
FROM cities
GROUP BY division
HAVING SUM(population) > 5000000
ORDER BY total DESC;</pre>
<div class="callout info"><b>Did you know?</b> SQLite and MySQL sometimes accept aliases in WHERE, but PostgreSQL and SQL Server don't. Stick to the standard for portable code.</div>
`,
  ex: [
    { task: 'Show total population per <code>division</code> — only divisions above <b>5,000,000</b>, largest first.', hint: 'GROUP BY division HAVING SUM(population) > 5000000 ORDER BY ... DESC' },
    { task: 'Show the <b>top 2</b> departments by average student CGPA — department name and average (2 decimals).', hint: 'JOIN → GROUP BY d.name → ORDER BY avg DESC → LIMIT 2' }
  ],
  quiz: [
    { q: 'What runs first?', options: ['SELECT', 'WHERE', 'FROM / JOIN', 'ORDER BY'], explain: 'The data source (FROM/JOIN) comes first.' },
    { q: 'Why can ORDER BY use SELECT aliases?', options: ['ORDER BY runs after SELECT', 'ORDER BY runs first', 'Aliases work everywhere', 'It can\'t'], explain: 'SELECT creates the alias, then ORDER BY runs.' },
    { q: 'HAVING runs right after…', options: ['ORDER BY', 'GROUP BY', 'SELECT', 'LIMIT'], explain: 'FROM → WHERE → GROUP BY → HAVING → SELECT → ...' }
  ]
},
case: {
  title: 'CASE — conditional values',
  summary: 'SQL\'s if-else: categorising and conditional counting',
  content: `
<p>Like <code>if-else</code> in programming, SQL has <code>CASE</code> to return different values depending on conditions.</p>
<pre class="syntax">CASE
  WHEN condition1 THEN value1
  WHEN condition2 THEN value2
  ELSE other_value
END</pre>
<p>Conditions are checked top-down; the first true one wins. Without <code>ELSE</code>, no match gives NULL.</p>
<pre class="ex">SELECT name, cgpa,
  CASE
    WHEN cgpa >= 3.75 THEN 'Excellent'
    WHEN cgpa >= 3.25 THEN 'Good'
    ELSE 'Average'
  END AS grade
FROM students;</pre>
<h2>Conditional aggregation</h2>
<p>Put CASE inside SUM/COUNT to compute several counts in one query — a reporting favourite:</p>
<pre class="ex">SELECT
  SUM(CASE WHEN cgpa >= 3.5 THEN 1 ELSE 0 END) AS high,
  SUM(CASE WHEN cgpa < 3.5 THEN 1 ELSE 0 END) AS low
FROM students;</pre>
<pre class="ex">-- Per admission year: students from Dhaka vs. outside (a pivot)
SELECT admission_year,
  SUM(CASE WHEN city = 'Dhaka' THEN 1 ELSE 0 END) AS dhaka,
  SUM(CASE WHEN city != 'Dhaka' THEN 1 ELSE 0 END) AS outside
FROM students
GROUP BY admission_year;</pre>
<h2>Short form</h2>
<pre class="ex">SELECT name,
  CASE dept_id WHEN 1 THEN 'CSE' WHEN 2 THEN 'EEE' ELSE 'Other' END AS dept
FROM students;</pre>
`,
  ex: [
    { task: 'Show each student\'s <code>name</code>, <code>cgpa</code> and a grade: CGPA ≥ 3.75 → <code>\'Excellent\'</code>, ≥ 3.25 → <code>\'Good\'</code>, else <code>\'Average\'</code>.', hint: 'CASE WHEN ... THEN ... WHEN ... THEN ... ELSE ... END' },
    { task: 'Show each product\'s <code>name</code> and status: stock 0 → <code>\'Out of stock\'</code>, otherwise <code>\'In stock\'</code>.', hint: "CASE WHEN stock = 0 THEN 'Out of stock' ELSE 'In stock' END" },
    { task: 'In one row show: how many students have CGPA <b>3.5 or more</b>, and how many <b>below 3.5</b> (two columns).', hint: 'SUM(CASE WHEN ... THEN 1 ELSE 0 END)' }
  ],
  quiz: [
    { q: 'No WHEN matches and there is no ELSE. Result?', options: ['0', 'Error', 'NULL', 'Empty string'], explain: 'Without ELSE you get NULL.' },
    { q: "cgpa = 3.9: CASE WHEN cgpa >= 3.0 THEN 'A' WHEN cgpa >= 3.75 THEN 'B' END = ?", options: ["'A'", "'B'", 'Both', 'NULL'], explain: 'It stops at the first true condition — so put the strictest condition first.' },
    { q: 'Which word ends a CASE?', options: ['STOP', 'END', 'ENDCASE', 'DONE'], explain: 'CASE ... END' }
  ]
},
subqueries: {
  title: 'Subqueries',
  summary: 'A query inside a query — IN, EXISTS, correlated subqueries',
  content: `
<p>A subquery is a query inside another query. The inner one runs first and the outer one uses its result.</p>
<h2>1. Returns one value (scalar subquery)</h2>
<pre class="ex">SELECT name, cgpa
FROM students
WHERE cgpa > (SELECT AVG(cgpa) FROM students);</pre>
<pre class="ex">-- Who earns the most?
SELECT name, salary
FROM employees
WHERE salary = (SELECT MAX(salary) FROM employees);</pre>
<h2>2. Returns a list (IN / NOT IN)</h2>
<pre class="ex">-- Products never ordered
SELECT name FROM products
WHERE id NOT IN (SELECT product_id FROM orders);</pre>
<h2>3. Correlated subquery</h2>
<p>The inner query depends on the current row of the outer query — it runs once per outer row.</p>
<pre class="ex">-- Employees earning above their own department's average
SELECT e.name, e.dept_id, e.salary
FROM employees e
WHERE e.salary > (
  SELECT AVG(e2.salary) FROM employees e2
  WHERE e2.dept_id = e.dept_id
);</pre>
<h2>4. EXISTS</h2>
<p><code>EXISTS</code> just checks whether the subquery returns any row — often faster than <code>IN</code> on big data.</p>
<pre class="ex">-- Students who scored 90+ in at least one course
SELECT name FROM students s
WHERE EXISTS (
  SELECT 1 FROM enrollments e
  WHERE e.student_id = s.id AND e.marks >= 90
);</pre>
<h2>5. Subquery in FROM (derived table)</h2>
<pre class="ex">SELECT dept_id, avg_cgpa
FROM (
  SELECT dept_id, AVG(cgpa) AS avg_cgpa
  FROM students GROUP BY dept_id
) AS t
WHERE avg_cgpa > 3.4;</pre>
<div class="callout tip"><b>Tip:</b> many subqueries can also be written as JOINs — pick whichever reads better. For complex ones, use a <b>CTE</b> (next lessons).</div>
`,
  ex: [
    { task: 'Show <code>name</code> and <code>cgpa</code> of students <b>above the average CGPA</b>.', hint: 'WHERE cgpa > (SELECT AVG(cgpa) FROM students)' },
    { task: 'Show <code>name</code> of products <b>never ordered</b>.', hint: 'NOT IN (SELECT product_id FROM orders)' },
    { task: 'Show <code>name, dept_id, salary</code> of employees with the <b>highest salary in their own department</b>.', hint: 'Correlated: WHERE salary = (SELECT MAX(salary) ... WHERE e2.dept_id = e.dept_id)' },
    { task: 'Show <code>name</code> of students enrolled in <b>any CSE (dept_id = 1) course</b> (each once).', hint: 'Two nested IN subqueries: courses → enrollments → students' }
  ],
  quiz: [
    { q: 'What characterises a correlated subquery?', options: ['Runs once', 'Runs for each outer row', 'Only in FROM', 'Needs a JOIN'], explain: 'It uses outer columns, so it is evaluated per outer row.' },
    { q: 'WHERE x = (SELECT ...) and the subquery returns several rows. What happens?', options: ['Compares all', 'Error (or only the first row is used)', 'Empty', 'Acts like IN'], explain: '= needs one value; use IN for many. (SQLite silently takes the first row; others error.)' },
    { q: 'What does EXISTS test?', options: ['Equality', 'Whether the subquery returns at least one row', 'NULL', 'Whether a table exists'], explain: 'TRUE if at least one row comes back.' }
  ]
},
'set-ops': {
  title: 'UNION, INTERSECT, EXCEPT',
  summary: 'Combining or comparing the results of several queries',
  content: `
<p>JOIN puts tables <b>side by side</b> (more columns). Set operations stack results <b>on top of each other</b> or compare them (working on rows).</p>
<table class="demo-table">
  <tr><th>Operator</th><th>Does</th></tr>
  <tr><td><code>UNION</code></td><td>All rows of both, duplicates removed</td></tr>
  <tr><td><code>UNION ALL</code></td><td>All rows of both, duplicates kept (faster)</td></tr>
  <tr><td><code>INTERSECT</code></td><td>Rows present in both</td></tr>
  <tr><td><code>EXCEPT</code></td><td>Rows in the first but not the second (Oracle: <code>MINUS</code>)</td></tr>
</table>
<div class="callout warn"><b>Rule:</b> both queries must have the <b>same number of columns</b> with compatible types. ORDER BY goes only once, at the very end.</div>
<pre class="ex">-- Cities of students and customers (unique)
SELECT city FROM students
UNION
SELECT city FROM orders
ORDER BY city;</pre>
<pre class="ex">-- Cities with both students and orders
SELECT city FROM students
INTERSECT
SELECT city FROM orders;</pre>
<pre class="ex">-- Cities with students but no orders
SELECT city FROM students
EXCEPT
SELECT city FROM orders;</pre>
<pre class="ex">-- Everyone, labelled
SELECT name, 'Student' AS type FROM students
UNION ALL
SELECT name, 'Employee' FROM employees;</pre>
`,
  ex: [
    { task: 'Show the <b>unique</b> list of cities from students and orders combined.', hint: 'UNION' },
    { task: 'Show cities that appear among students <b>and</b> among orders.', hint: 'INTERSECT' },
    { task: 'Show cities with orders but <b>no students</b>.', hint: 'orders first, then EXCEPT students' },
    { task: 'Show every <code>name</code> of students and employees in one column, duplicates kept (UNION ALL).', hint: 'UNION ALL' }
  ],
  quiz: [
    { q: 'UNION vs UNION ALL?', options: ['No difference', 'UNION removes duplicates, UNION ALL doesn\'t', 'UNION ALL removes duplicates', 'UNION only for two tables'], explain: 'Removing duplicates costs time — use UNION ALL when you don\'t need it.' },
    { q: 'SELECT a, b ... UNION SELECT c ... — what happens?', options: ['Works', 'Error: column counts differ', 'b becomes NULL', 'c appears twice'], explain: 'Both sides need the same number of columns.' },
    { q: 'JOIN vs UNION?', options: ['JOIN adds columns (side by side), UNION adds rows (stacked)', 'Same thing', 'UNION adds columns', 'JOIN only for two tables'], explain: 'JOIN = horizontal, UNION = vertical.' }
  ]
},
cte: {
  title: 'CTE — the WITH clause',
  summary: 'Splitting complex queries into named steps; recursive CTEs',
  content: `
<p>A <b>CTE (Common Table Expression)</b> is a temporary, named result defined at the start of a query and then used like a table. It makes complex subqueries readable.</p>
<pre class="syntax">WITH name AS (
  SELECT ...
)
SELECT ... FROM name;</pre>
<pre class="ex">WITH dept_avg AS (
  SELECT dept_id, ROUND(AVG(cgpa), 2) AS avg_cgpa
  FROM students
  GROUP BY dept_id
)
SELECT d.name, a.avg_cgpa
FROM dept_avg a
JOIN departments d ON d.id = a.dept_id
ORDER BY a.avg_cgpa DESC;</pre>
<h2>Several CTEs</h2>
<p>Separate them with commas; later ones can use earlier ones:</p>
<pre class="ex">WITH
  totals AS (SELECT division, SUM(population) AS pop FROM cities GROUP BY division),
  country AS (SELECT SUM(pop) AS all_pop FROM totals)
SELECT division, pop,
       ROUND(pop * 100.0 / all_pop, 1) AS percent
FROM totals, country
ORDER BY pop DESC;</pre>
<h2>Recursive CTE</h2>
<p>A CTE can reference itself — great for trees (manager → employee, category → sub-category) or generating series.</p>
<pre class="ex">-- Numbers 1 to 10
WITH RECURSIVE nums(n) AS (
  SELECT 1                       -- starting point (anchor)
  UNION ALL
  SELECT n + 1 FROM nums WHERE n < 10   -- repeat
)
SELECT n FROM nums;</pre>
<pre class="ex">-- Each employee's level in the management chain
WITH RECURSIVE chain AS (
  SELECT id, name, manager_id, 0 AS level
  FROM employees WHERE manager_id IS NULL
  UNION ALL
  SELECT e.id, e.name, e.manager_id, c.level + 1
  FROM employees e JOIN chain c ON e.manager_id = c.id
)
SELECT name, level FROM chain ORDER BY level, name;</pre>
`,
  ex: [
    { task: 'Use a CTE to get each <code>dept_id</code>\'s average CGPA, then show <code>dept_id</code> and the average only where it is <b>above 3.4</b>.', hint: 'WITH a AS (SELECT dept_id, AVG(cgpa) AS avg_cgpa ... GROUP BY dept_id) SELECT ... WHERE avg_cgpa > 3.4' },
    { task: 'With a recursive CTE, show the numbers <b>1 to 10</b> in order.', hint: 'WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x < 10)' },
    { task: 'Show the <code>name</code> of everyone working under <b>Dr. Abdul Karim</b> (id = 1), directly or indirectly.', hint: 'Start with manager_id = 1, then JOIN sub ON e.manager_id = sub.id' }
  ],
  quiz: [
    { q: 'Which keyword starts a CTE?', options: ['WITH', 'TEMP', 'DEFINE', 'LET'], explain: 'WITH name AS (...)' },
    { q: 'What stops a recursive CTE from looping forever?', options: ['LIMIT', 'A WHERE stop condition', 'BREAK', 'Nothing'], explain: 'The recursive part needs a condition that eventually becomes false.' },
    { q: 'Main benefit of a CTE?', options: ['Saves data permanently', 'Makes complex queries easier to read', 'Always faster', 'Creates an index'], explain: 'CTEs exist only for that query; the big win is readability.' }
  ]
},
window: {
  title: 'Window functions',
  summary: 'ROW_NUMBER, RANK, running totals, LAG/LEAD — calculations without collapsing rows',
  content: `
<p><code>GROUP BY</code> collapses many rows into one. What if you want to keep every row <b>and</b> show a group calculation next to it? That's a <b>window function</b> — a very popular interview topic!</p>
<pre class="syntax">function() OVER (
  PARTITION BY column   -- split into groups (optional)
  ORDER BY column       -- order inside the group (optional)
)</pre>
<h2>Ranking functions</h2>
<table class="demo-table">
  <tr><th>Function</th><th>With ties (e.g. 90, 90, 85)</th></tr>
  <tr><td><code>ROW_NUMBER()</code></td><td>1, 2, 3 — always distinct</td></tr>
  <tr><td><code>RANK()</code></td><td>1, 1, 3 — ties share, next skips</td></tr>
  <tr><td><code>DENSE_RANK()</code></td><td>1, 1, 2 — no gaps</td></tr>
</table>
<pre class="ex">SELECT name, cgpa,
       RANK() OVER (ORDER BY cgpa DESC) AS position
FROM students;</pre>
<h2>PARTITION BY — within groups</h2>
<pre class="ex">-- Separate ranking per department
SELECT name, dept_id, cgpa,
       ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY cgpa DESC) AS rank_in_dept
FROM students;</pre>
<pre class="ex">-- Each salary next to the department average
SELECT name, dept_id, salary,
       AVG(salary) OVER (PARTITION BY dept_id) AS dept_avg
FROM employees;</pre>
<h2>Running total</h2>
<pre class="ex">SELECT id, order_date, quantity,
       SUM(quantity) OVER (ORDER BY order_date) AS running_total
FROM orders;</pre>
<h2>LAG and LEAD — previous / next row</h2>
<pre class="ex">SELECT id, order_date, quantity,
       LAG(quantity) OVER (ORDER BY order_date) AS prev_qty,
       LEAD(quantity) OVER (ORDER BY order_date) AS next_qty
FROM orders;</pre>
<div class="callout tip"><b>Interview classic:</b> "top 2 salaries per department" — put ROW_NUMBER() OVER (PARTITION BY ...) in a CTE and filter <code>WHERE rn &lt;= 2</code> outside.</div>
<pre class="ex">WITH ranked AS (
  SELECT name, dept_id, salary,
         ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rn
  FROM employees
)
SELECT name, dept_id, salary FROM ranked WHERE rn <= 2;</pre>
`,
  ex: [
    { task: 'Show each student\'s <code>name</code>, <code>cgpa</code> and <code>RANK()</code> by CGPA (highest = 1), sorted by rank.', hint: 'RANK() OVER (ORDER BY cgpa DESC), then ORDER BY that column' },
    { task: 'Show each student\'s <code>name, dept_id</code> and <code>ROW_NUMBER()</code> by CGPA <b>within their department</b>.', hint: 'PARTITION BY dept_id ORDER BY cgpa DESC' },
    { task: 'Show each employee\'s <code>name, salary</code> and their department\'s average salary (<code>AVG ... OVER</code>).', hint: 'AVG(salary) OVER (PARTITION BY dept_id)' },
    { task: 'Show orders\' <code>id, order_date, quantity</code> and a <b>running total of quantity</b> by date (sorted by date).', hint: 'SUM(quantity) OVER (ORDER BY order_date)' }
  ],
  quiz: [
    { q: 'Values 90, 90, 85 — DENSE_RANK() gives?', options: ['1, 2, 3', '1, 1, 3', '1, 1, 2', '2, 2, 1'], explain: 'DENSE_RANK gives ties the same rank and leaves no gap.' },
    { q: 'Key difference between window functions and GROUP BY?', options: ['Window functions keep every row', 'GROUP BY is faster', 'Window functions only do SUM', 'None'], explain: 'Window functions add a calculation beside each row.' },
    { q: 'Which gets the previous row\'s value?', options: ['LEAD', 'LAG', 'PREV', 'FIRST'], explain: 'LAG = previous, LEAD = next.' }
  ]
},
insert: {
  title: 'INSERT — adding data',
  summary: 'Adding new rows to a table',
  content: `
<p>So far we've only read data. Now we write! Add rows with <code>INSERT INTO</code>.</p>
<pre class="syntax">INSERT INTO table (column1, column2, ...)
VALUES (value1, value2, ...);</pre>
<pre class="ex">INSERT INTO departments (id, name, building, budget)
VALUES (7, 'Architecture', 'Building F', 2000000);

SELECT * FROM departments;</pre>
<div class="callout info"><b>No worries:</b> examples and exercises always run on a fresh database, so whatever you insert or delete is gone next time. Use the <b>Playground</b> for lasting changes.</div>
<h2>Leaving out columns</h2>
<p>Columns you don't supply get <code>NULL</code> or their default. Leave out an <code>INTEGER PRIMARY KEY</code> and SQLite assigns the next id.</p>
<pre class="ex">INSERT INTO students (name, dept_id, city, cgpa, admission_year)
VALUES ('Nadia Rahman', 1, 'Dhaka', 3.65, 2024);

SELECT * FROM students ORDER BY id DESC LIMIT 3;</pre>
<h2>Several rows at once</h2>
<pre class="ex">INSERT INTO products (name, category, price, stock) VALUES
  ('Mango 1kg', 'Grocery', 150, 300),
  ('Umbrella', 'Accessories', 550, 45);

SELECT * FROM products;</pre>
<h2>INSERT from another query</h2>
<pre class="ex">CREATE TABLE toppers (name TEXT, cgpa REAL);
INSERT INTO toppers (name, cgpa)
SELECT name, cgpa FROM students WHERE cgpa >= 3.8;
SELECT * FROM toppers;</pre>
<div class="callout tip"><b>Good habit:</b> always name the columns. <code>INSERT INTO t VALUES (...)</code> depends on column order and breaks when a column is added later.</div>
`,
  ex: [
    { task: 'Add a department: id = <b>7</b>, name = <b>\'Architecture\'</b>, building = <b>\'Building F\'</b>, budget = <b>2000000</b>.', hint: 'INSERT INTO departments (id, name, building, budget) VALUES (...)' },
    { task: 'Add a student: id <b>17</b>, name <b>\'Nadia Rahman\'</b>, dept_id <b>1</b>, city <b>\'Dhaka\'</b>, cgpa <b>3.65</b>, admission_year <b>2024</b> (no email).', hint: 'Leave out email — it becomes NULL.' },
    { task: 'With <b>one INSERT</b>, add two products: (12, \'Mango 1kg\', \'Grocery\', 150, 300) and (13, \'Umbrella\', \'Accessories\', 550, 45) — column order id, name, category, price, stock.', hint: 'VALUES (...), (...)' }
  ],
  quiz: [
    { q: 'What happens to a column you don\'t give a value for?', options: ['Always an error', 'NULL or the DEFAULT (error if NOT NULL)', '0', 'The row isn\'t added'], explain: 'Without constraints it becomes NULL or its default.' },
    { q: 'How do you insert several rows at once?', options: ['Separate INSERTs only', 'VALUES (...), (...), (...)', 'INSERT MANY', 'VALUES [(...)]'], explain: 'Comma-separated tuples.' },
    { q: 'Why name columns in INSERT?', options: ['Faster', 'Code keeps working when the table changes', 'Required', 'Avoids NULL'], explain: 'No dependency on column order.' }
  ]
},
update: {
  title: 'UPDATE — changing data',
  summary: 'Changing values in existing rows',
  content: `
<p>Change existing data with <code>UPDATE</code>:</p>
<pre class="syntax">UPDATE table
SET column1 = value1, column2 = value2
WHERE condition;</pre>
<pre class="ex">UPDATE students
SET email = 'nusrat@uni.edu'
WHERE id = 4;

SELECT * FROM students WHERE id = 4;</pre>
<div class="callout danger"><b>⚠️ The most dangerous mistake:</b> forget <code>WHERE</code> and <b>every row</b> changes! <code>UPDATE employees SET salary = 0;</code> — everyone's salary is zero. Before an UPDATE, run a <code>SELECT</code> with the same WHERE to see which rows will change.</div>
<h2>Based on the old value</h2>
<pre class="ex">-- Give all lecturers a 10% raise
UPDATE employees
SET salary = salary * 1.10
WHERE role = 'Lecturer';

SELECT name, role, salary FROM employees;</pre>
<h2>Several columns at once</h2>
<pre class="ex">UPDATE products
SET stock = 50, price = 1300
WHERE name = 'Hilsa Fish';

SELECT * FROM products WHERE name = 'Hilsa Fish';</pre>
<h2>UPDATE with a subquery</h2>
<pre class="ex">-- +5000 for every CSE employee
UPDATE employees
SET salary = salary + 5000
WHERE dept_id = (SELECT id FROM departments WHERE name = 'CSE');
SELECT name, dept_id, salary FROM employees;</pre>
`,
  ex: [
    { task: 'Raise every <b>Lecturer</b>\'s salary by <b>10%</b>.', hint: "SET salary = salary * 1.10 WHERE role = 'Lecturer'" },
    { task: 'Set the email of student id <b>4</b> (Nusrat) to <b>\'nusrat@uni.edu\'</b>.', hint: "Don't forget WHERE id = 4!" },
    { task: 'Set <b>Hilsa Fish</b> stock to <b>50</b> and price to <b>1300</b>.', hint: 'SET stock = 50, price = 1300' }
  ],
  quiz: [
    { q: 'UPDATE without WHERE does what?', options: ['Error', 'Nothing', 'Updates every row', 'Only the first row'], explain: 'A classic production disaster. Be careful!' },
    { q: 'A safe habit before UPDATE?', options: ['Run a SELECT with the same WHERE', 'Drop the table', 'Nothing', 'Create an index'], explain: 'Check with SELECT first, then UPDATE — ideally inside a transaction.' },
    { q: 'How do you separate several columns in SET?', options: ['AND', 'Comma (,)', 'Semicolon', 'Repeat SET'], explain: 'SET a = 1, b = 2' }
  ]
},
delete: {
  title: 'DELETE — removing data',
  summary: 'Deleting rows and working safely',
  content: `
<p>Remove rows with <code>DELETE FROM</code>:</p>
<pre class="syntax">DELETE FROM table
WHERE condition;</pre>
<pre class="ex">DELETE FROM orders
WHERE status = 'Cancelled';

SELECT * FROM orders;</pre>
<div class="callout danger"><b>⚠️ Again:</b> <code>DELETE FROM orders;</code> (no WHERE) removes <b>every row</b>. The table stays, empty. Check with SELECT first!</div>
<h2>Several conditions and subqueries</h2>
<pre class="ex">-- Admitted in 2023 with CGPA under 3.2
DELETE FROM students
WHERE admission_year = 2023 AND cgpa < 3.2;
SELECT name, admission_year, cgpa FROM students;</pre>
<pre class="ex">-- Delete products that were never ordered
DELETE FROM products
WHERE id NOT IN (SELECT product_id FROM orders);
SELECT * FROM products;</pre>
<h2>Soft delete — a real-world technique</h2>
<p>Many apps never really delete data. They keep an <code>is_deleted</code> or <code>deleted_at</code> column and run <code>UPDATE ... SET is_deleted = 1</code>. Mistakes can be undone and history is preserved.</p>
<div class="callout info"><b>Did you know?</b> With <code>ON DELETE CASCADE</code> on a foreign key, deleting a parent row automatically deletes its child rows.</div>
`,
  ex: [
    { task: 'Delete all orders with status <b>Cancelled</b>.', hint: "WHERE status = 'Cancelled'" },
    { task: 'Delete products whose stock is <b>0</b>.', hint: 'WHERE stock = 0' },
    { task: 'Delete students admitted in <b>2023</b> with CGPA <b>below 3.2</b>.', hint: 'Two conditions with AND' }
  ],
  quiz: [
    { q: 'What does DELETE FROM students; do?', options: ['Drops the table', 'Deletes all rows, table stays empty', 'Error', 'Deletes the first row'], explain: 'DELETE removes rows; DROP TABLE removes the table.' },
    { q: 'What is a soft delete?', options: ['Slow deletion', 'Marking a row deleted with a flag instead of removing it', 'Keeping a backup', 'Deleting an index'], explain: 'is_deleted = 1 — the data stays, just hidden.' },
    { q: 'What does ON DELETE CASCADE do?', options: ['Blocks deletes', 'Deleting a parent also deletes related child rows', 'Takes a backup', 'Sets NULL'], explain: 'Child rows are removed automatically.' }
  ]
},
transactions: {
  title: 'Transactions',
  summary: 'BEGIN, COMMIT, ROLLBACK — all or nothing',
  content: `
<p>Rahim sends Karim 1000 taka. Two steps: take it from Rahim, add it to Karim. What if the server dies between the two? Money vanishes! 😱</p>
<p>A <b>transaction</b> guarantees: either every step succeeds together, or none of them happen.</p>
<pre class="syntax">BEGIN;          -- start
  ... statements ...
COMMIT;         -- make permanent
-- or
ROLLBACK;       -- undo everything since BEGIN</pre>
<pre class="ex">BEGIN;
UPDATE accounts SET balance = balance - 1000 WHERE holder = 'Rahim';
UPDATE accounts SET balance = balance + 1000 WHERE holder = 'Karim';
COMMIT;

SELECT * FROM accounts;</pre>
<pre class="ex">BEGIN;
DELETE FROM accounts;          -- oops, mistake!
ROLLBACK;                      -- saved

SELECT * FROM accounts;</pre>
<h2>ACID — four properties of a good database</h2>
<table class="demo-table">
  <tr><th>Property</th><th>Meaning</th></tr>
  <tr><td><b>A</b>tomicity</td><td>All or nothing</td></tr>
  <tr><td><b>C</b>onsistency</td><td>Rules (constraints) always hold — e.g. balance never negative</td></tr>
  <tr><td><b>I</b>solation</td><td>Concurrent transactions don't interfere</td></tr>
  <tr><td><b>D</b>urability</td><td>After COMMIT, data survives a power cut</td></tr>
</table>
<p>Our <code>accounts</code> table has <code>CHECK (balance &gt;= 0)</code>. Try it:</p>
<pre class="ex">UPDATE accounts SET balance = balance - 99999 WHERE holder = 'Karim';</pre>
`,
  ex: [
    { task: 'In one transaction send <b>1000</b> from <b>Rahim</b> to <b>Karim</b> (BEGIN … COMMIT).', hint: 'BEGIN; two UPDATEs; COMMIT;' },
    { task: 'Start a transaction, set <b>Fatema</b>\'s balance to 0, then <b>ROLLBACK</b>. The balance should end unchanged.', hint: 'BEGIN; UPDATE ...; ROLLBACK;' }
  ],
  quiz: [
    { q: 'What does ROLLBACK do?', options: ['Makes changes permanent', 'Undoes all changes in the transaction', 'Drops a table', 'Starts a transaction'], explain: 'Everything since BEGIN is undone.' },
    { q: 'What does the A in ACID stand for?', options: ['Accuracy', 'Atomicity', 'Availability', 'Access'], explain: 'Atomicity — all or nothing.' },
    { q: 'Data survives a power cut after COMMIT — which property?', options: ['Isolation', 'Consistency', 'Durability', 'Atomicity'], explain: 'Durability.' }
  ]
},
create: {
  title: 'CREATE TABLE & data types',
  summary: 'Creating tables, data types and constraints',
  content: `
<p>Create a table with <code>CREATE TABLE</code>: each column needs a name, a data type and optionally rules (constraints).</p>
<pre class="syntax">CREATE TABLE IF NOT EXISTS table (
  column1 TYPE CONSTRAINT,
  column2 TYPE CONSTRAINT,
  ...
);</pre>
<pre class="ex">CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  price REAL CHECK (price >= 0),
  isbn TEXT UNIQUE,
  in_stock INTEGER DEFAULT 1
);
INSERT INTO books (title, author, price) VALUES ('Himu', 'Humayun Ahmed', 250);
SELECT * FROM books;</pre>
<h2>Common data types</h2>
<table class="demo-table">
  <tr><th>Type</th><th>Holds</th><th>Example</th></tr>
  <tr><td><code>INTEGER</code> / <code>INT</code></td><td>Whole numbers</td><td>42, -7</td></tr>
  <tr><td><code>REAL</code> / <code>FLOAT</code> / <code>DECIMAL(p,s)</code></td><td>Decimals</td><td>3.75</td></tr>
  <tr><td><code>TEXT</code> / <code>VARCHAR(n)</code> / <code>CHAR(n)</code></td><td>Text</td><td>'Dhaka'</td></tr>
  <tr><td><code>DATE</code> / <code>DATETIME</code> / <code>TIMESTAMP</code></td><td>Date & time</td><td>'2024-03-15'</td></tr>
  <tr><td><code>BOOLEAN</code></td><td>True/false</td><td>TRUE / FALSE (1/0 in SQLite)</td></tr>
  <tr><td><code>BLOB</code></td><td>Binary data (images, files)</td><td>—</td></tr>
</table>
<div class="callout info"><b>Did you know?</b> Don't use <code>FLOAT</code> for money — 0.1 + 0.2 = 0.30000000000000004. Use <code>DECIMAL(10,2)</code> in MySQL/PostgreSQL, or store paisa as integers.</div>
<h2>Constraints — rules for data</h2>
<table class="demo-table">
  <tr><th>Constraint</th><th>Does</th></tr>
  <tr><td><code>PRIMARY KEY</code></td><td>Unique + not null; identifies each row</td></tr>
  <tr><td><code>NOT NULL</code></td><td>Cannot be empty</td></tr>
  <tr><td><code>UNIQUE</code></td><td>No two rows share the value</td></tr>
  <tr><td><code>DEFAULT value</code></td><td>Used when no value is given</td></tr>
  <tr><td><code>CHECK (condition)</code></td><td>Rejects rows that fail the condition</td></tr>
  <tr><td><code>REFERENCES t(col)</code></td><td>Foreign key — the value must exist in the other table</td></tr>
</table>
<pre class="ex">CREATE TABLE library_loans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES students(id),
  book_title TEXT NOT NULL,
  loan_date DATE DEFAULT CURRENT_DATE,
  returned BOOLEAN DEFAULT 0
);
INSERT INTO library_loans (student_id, book_title) VALUES (1, 'Database Concepts');
SELECT * FROM library_loans;</pre>
<p>See what happens when a constraint is broken:</p>
<pre class="ex">CREATE TABLE t (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL);
INSERT INTO t VALUES (1, 'a@x.com');
INSERT INTO t VALUES (2, 'a@x.com');  -- breaks UNIQUE</pre>
`,
  ex: [
    { task: 'Create a <code>books</code> table: <code>id</code> (INTEGER, PRIMARY KEY), <code>title</code> (TEXT, NOT NULL), <code>author</code> (TEXT), <code>price</code> (REAL), <code>published_year</code> (INTEGER) — in that order.', hint: 'CREATE TABLE books ( id INTEGER PRIMARY KEY, title TEXT NOT NULL, ... );' },
    { task: 'Create <code>members</code> (<code>id</code> INTEGER PRIMARY KEY, <code>name</code> TEXT NOT NULL, <code>joined</code> DATE), then insert one row: (1, \'Rahim\', \'2024-01-01\').', hint: 'Separate the two statements with a semicolon.' }
  ],
  quiz: [
    { q: 'Which two rules does a PRIMARY KEY imply?', options: ['UNIQUE and NOT NULL', 'CHECK and DEFAULT', 'NULL and UNIQUE', 'FOREIGN and INDEX'], explain: 'A primary key is unique and never empty. (SQLite has a historical quirk for non-INTEGER keys, but treat it as the rule.)' },
    { q: 'Safest type for money?', options: ['FLOAT', 'DECIMAL', 'TEXT', 'BLOB'], explain: 'DECIMAL stores exact decimals; FLOAT has rounding errors.' },
    { q: 'Why use CREATE TABLE IF NOT EXISTS?', options: ['No error if the table already exists', 'Faster', 'Copies data', 'For temporary tables'], explain: 'If the table exists it does nothing instead of erroring.' }
  ]
},
alter: {
  title: 'ALTER TABLE — changing a table',
  summary: 'Adding, renaming and dropping columns',
  content: `
<p>Change a table's structure after creating it with <code>ALTER TABLE</code>.</p>
<h2>Add a column</h2>
<pre class="ex">ALTER TABLE students ADD COLUMN phone TEXT;
SELECT * FROM students LIMIT 3;</pre>
<p>Existing rows get <code>NULL</code> (or the <code>DEFAULT</code>):</p>
<pre class="ex">ALTER TABLE students ADD COLUMN is_active INTEGER DEFAULT 1;
SELECT name, is_active FROM students LIMIT 3;</pre>
<h2>Rename a column</h2>
<pre class="ex">ALTER TABLE students RENAME COLUMN cgpa TO gpa;
SELECT name, gpa FROM students LIMIT 3;</pre>
<h2>Rename a table</h2>
<pre class="ex">ALTER TABLE cities RENAME TO districts;
SELECT * FROM districts LIMIT 3;</pre>
<h2>Drop a column</h2>
<pre class="ex">ALTER TABLE cities DROP COLUMN area_km2;
SELECT * FROM cities LIMIT 3;</pre>
<div class="callout info"><b>Did you know?</b> MySQL/PostgreSQL can change a column's type with <code>ALTER TABLE ... MODIFY/ALTER COLUMN</code>. SQLite is limited — you create a new table and copy data. Real projects keep these changes in <b>migration</b> files.</div>
`,
  ex: [
    { task: 'Add a TEXT column named <code>phone</code> to <code>students</code>.', hint: 'ALTER TABLE students ADD COLUMN phone TEXT;' },
    { task: 'Rename the <code>cities</code> table to <code>districts</code>.', hint: 'ALTER TABLE cities RENAME TO districts;' },
    { task: 'Drop the <code>area_km2</code> column from <code>cities</code>.', hint: 'DROP COLUMN area_km2' }
  ],
  quiz: [
    { q: 'After adding a column, what do existing rows hold?', options: ['0', 'NULL or the DEFAULT', 'Error', 'Rows are deleted'], explain: 'NULL unless a DEFAULT is given.' },
    { q: 'Which renames a table?', options: ['RENAME TABLE a b', 'ALTER TABLE a RENAME TO b', 'UPDATE TABLE a SET name = b', 'CHANGE a TO b'], explain: 'ALTER TABLE a RENAME TO b (MySQL also has RENAME TABLE a TO b).' }
  ]
},
drop: {
  title: 'DROP TABLE',
  summary: 'Removing a table completely; DELETE vs TRUNCATE vs DROP',
  content: `
<p>Remove a whole table (structure + data) with <code>DROP TABLE</code>:</p>
<pre class="ex">DROP TABLE orders;
SELECT name FROM sqlite_master WHERE type = 'table';</pre>
<p>Avoid an error if it doesn't exist:</p>
<pre class="ex">DROP TABLE IF EXISTS old_logs;</pre>
<div class="callout danger"><b>⚠️ Warning:</b> DROP TABLE has no undo (outside a transaction). Always back up before running it on production.</div>
<h2>DELETE vs TRUNCATE vs DROP</h2>
<table class="demo-table">
  <tr><th></th><th>DELETE</th><th>TRUNCATE</th><th>DROP</th></tr>
  <tr><td>Removes</td><td>Rows (optionally filtered)</td><td>All rows</td><td>The whole table</td></tr>
  <tr><td>WHERE allowed?</td><td>Yes</td><td>No</td><td>No</td></tr>
  <tr><td>Structure kept?</td><td>Yes</td><td>Yes</td><td>No</td></tr>
  <tr><td>Speed</td><td>Slow (row by row)</td><td>Very fast</td><td>Fast</td></tr>
  <tr><td>Type</td><td>DML</td><td>DDL</td><td>DDL</td></tr>
</table>
<p>SQLite has no <code>TRUNCATE</code>; <code>DELETE FROM t;</code> (no WHERE) does the same job.</p>
`,
  ex: [
    { task: 'Drop the <code>orders</code> table completely.', hint: 'DROP TABLE orders;' },
    { task: 'Drop <code>enrollments</code> in a way that doesn\'t error if it doesn\'t exist.', hint: 'IF EXISTS' }
  ],
  quiz: [
    { q: 'Remove all data but keep the structure?', options: ['DROP TABLE', 'DELETE FROM t (or TRUNCATE)', 'ALTER TABLE', 'REMOVE'], explain: 'DROP removes the table; DELETE/TRUNCATE only the data.' },
    { q: 'Which accepts WHERE?', options: ['DROP', 'TRUNCATE', 'DELETE', 'All'], explain: 'Only DELETE can be filtered.' }
  ]
},
'index-view': {
  title: 'INDEX & VIEW',
  summary: 'Faster queries and saved queries',
  content: `
<h2>INDEX — like a book's index</h2>
<p>Finding "SQL" in a 1000-page book by flipping every page is slow; the index sends you straight there. Databases are the same — with millions of rows, <code>WHERE city = 'Dhaka'</code> is far faster with an index.</p>
<pre class="ex">CREATE INDEX idx_students_city ON students(city);

-- Is the index used?
EXPLAIN QUERY PLAN
SELECT * FROM students WHERE city = 'Dhaka';</pre>
<ul>
  <li><b>Where to index:</b> columns used a lot in WHERE, JOIN, ORDER BY.</li>
  <li><b>Cost:</b> indexes take space and slow INSERT/UPDATE/DELETE slightly (the index must be updated too). Don't index everything.</li>
  <li><code>PRIMARY KEY</code> and <code>UNIQUE</code> columns are indexed automatically.</li>
  <li><code>CREATE UNIQUE INDEX</code> — index + uniqueness rule.</li>
</ul>
<h2>VIEW — a saved query</h2>
<p>If you write the same complex query again and again, save it as a <b>VIEW</b>. It looks like a table but stores no data — it runs against the base tables every time.</p>
<pre class="ex">CREATE VIEW student_details AS
SELECT s.name, s.cgpa, d.name AS department, d.building
FROM students s
JOIN departments d ON s.dept_id = d.id;

SELECT * FROM student_details WHERE cgpa > 3.5;</pre>
<p>Benefits: hides complexity, security (expose only some columns), reuse. Remove with <code>DROP VIEW name;</code></p>
`,
  ex: [
    { task: 'Create an index named <b>idx_students_city</b> on the <code>city</code> column of <code>students</code>.', hint: 'CREATE INDEX idx_students_city ON students(city);' },
    { task: 'Create a VIEW named <b>top_students</b> showing <code>name</code> and <code>cgpa</code> of students with CGPA <b>3.7 or more</b>.', hint: 'CREATE VIEW top_students AS SELECT ...' }
  ],
  quiz: [
    { q: 'A downside of indexes?', options: ['SELECT gets slower', 'INSERT/UPDATE get slightly slower and use space', 'Data loss', 'None'], explain: 'Every write must update the index too.' },
    { q: 'Which is true about a VIEW?', options: ['Stores its own copy of data', 'A saved query that runs on the base tables each time', 'Cannot be read', 'Another name for an index'], explain: 'A normal VIEW stores no data. (Materialized views do — in PostgreSQL/Oracle.)' }
  ]
},
next: {
  title: 'Database design & next steps',
  summary: 'Normalization, relationships, different databases and career tips',
  content: `
<p>🎉 Congratulations! You've covered nearly all core SQL. Now some big-picture ideas.</p>
<h2>Kinds of relationships</h2>
<table class="demo-table">
  <tr><th>Type</th><th>Example</th><th>How</th></tr>
  <tr><td>One-to-One</td><td>A person ↔ one national ID</td><td>A UNIQUE foreign key</td></tr>
  <tr><td>One-to-Many</td><td>A department → many students</td><td>Foreign key on the "many" side (<code>students.dept_id</code>)</td></tr>
  <tr><td>Many-to-Many</td><td>Many students ↔ many courses</td><td>A junction table in between (<code>enrollments</code>)</td></tr>
</table>
<p>See the relationships in our database on the <b>Database → ER diagram</b> page.</p>
<h2>Normalization (in plain words)</h2>
<ul>
  <li><b>1NF:</b> one value per cell. Not <code>phones = '017..., 018...'</code> — use a separate table.</li>
  <li><b>2NF:</b> 1NF + every column depends on the whole primary key (not part of a composite key).</li>
  <li><b>3NF:</b> 2NF + no non-key column depends on another non-key column. Storing <code>dept_building</code> in students is wrong — it belongs in departments.</li>
</ul>
<p>In one sentence: <b>"every fact in one place, once."</b></p>
<h2>Differences between databases</h2>
<table class="demo-table">
  <tr><th>Task</th><th>SQLite</th><th>MySQL</th><th>PostgreSQL</th><th>SQL Server</th></tr>
  <tr><td>Limit rows</td><td>LIMIT</td><td>LIMIT</td><td>LIMIT</td><td>TOP / OFFSET FETCH</td></tr>
  <tr><td>Auto ID</td><td>AUTOINCREMENT</td><td>AUTO_INCREMENT</td><td>SERIAL / IDENTITY</td><td>IDENTITY</td></tr>
  <tr><td>Concatenate</td><td>||</td><td>CONCAT()</td><td>|| or CONCAT()</td><td>+ or CONCAT()</td></tr>
  <tr><td>Today</td><td>DATE('now')</td><td>CURDATE()</td><td>CURRENT_DATE</td><td>GETDATE()</td></tr>
  <tr><td>Typical use</td><td>Mobile apps, small projects</td><td>Websites (WordPress)</td><td>Large apps, analytics</td><td>Enterprise</td></tr>
</table>
<p>Use the <b>⇄ Dialect</b> button in the playground to see your query translated to other databases.</p>
<h2>What to learn next</h2>
<ol>
  <li><b>Install a real database</b> — PostgreSQL or MySQL, with DBeaver / pgAdmin.</li>
  <li><b>Your own project:</b> library, hostel or e-commerce management — start with the table design (ER diagram).</li>
  <li><b>With a programming language:</b> Python (sqlite3, SQLAlchemy), Node.js (Prisma), Django ORM.</li>
  <li><b>Practice:</b> the <b>Interview challenges</b> on this site, then LeetCode SQL 50, HackerRank SQL, StrataScratch.</li>
  <li><b>Advanced:</b> stored procedures, partitioning, replication, query tuning on large data.</li>
</ol>
<p>Good luck! Keep practising in the playground. 🚀</p>
`,
  ex: [],
  quiz: [
    { q: 'How is a many-to-many relationship between students and courses built?', options: ['course_id in students', 'A junction table in between', 'student_id in courses', 'Comma-separated ids in one column'], explain: 'A junction table like enrollments holds both foreign keys.' },
    { q: "Storing '017..., 018...' in one cell breaks which normal form?", options: ['1NF', '2NF', '3NF', 'None'], explain: '1NF: every cell holds one atomic value.' },
    { q: 'The right way to prevent SQL injection?', options: ['Upper-case the input', 'Parameterized queries / prepared statements', 'Short queries', 'Avoid SELECT *'], explain: 'Parameters are sent separately and never run as SQL code.' }
  ]
}
};
