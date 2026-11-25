// সব লেসন এখানে। প্রতিটি লেসনে: ব্যাখ্যা (HTML), অনুশীলন (exercises) ও কুইজ (quiz)।
// <pre class="ex"> ব্লকগুলো স্বয়ংক্রিয়ভাবে "চালাও" বাটনসহ উদাহরণে পরিণত হয়।
// exercise: { task, solution, hint, ordered?, check? }
//   - ordered: true হলে রো-এর ক্রমও মিলতে হবে
//   - check: DML/DDL অনুশীলনে, ইউজারের SQL চালানোর পর এই কুয়েরি দিয়ে ফলাফল মেলানো হয়

window.SECTIONS = [
  { id: 'start', title: 'শুরু' },
  { id: 'read', title: 'ডেটা পড়া (SELECT)' },
  { id: 'join', title: 'একাধিক টেবিল' },
  { id: 'agg', title: 'হিসাব ও গ্রুপিং' },
  { id: 'adv', title: 'অ্যাডভান্সড কুয়েরি' },
  { id: 'dml', title: 'ডেটা পরিবর্তন' },
  { id: 'ddl', title: 'টেবিল ব্যবস্থাপনা' },
  { id: 'next', title: 'পরবর্তী ধাপ' }
];

window.LESSONS = [
// ───────────────────────────────── শুরু
{
  id: 'intro', section: 'start', title: 'SQL ও ডেটাবেস পরিচিতি',
  summary: 'SQL কী, রিলেশনাল ডেটাবেস কীভাবে কাজ করে, আর আমাদের ডেমো ডেটাবেস',
  tables: ['students'],
  content: `
<h2>SQL কী?</h2>
<p><b>SQL</b> (Structured Query Language, উচ্চারণ "এস-কিউ-এল" বা "সিকুয়েল") হলো ডেটাবেসের সাথে কথা বলার ভাষা। এই ভাষা দিয়ে আমরা ডেটাবেসকে বলি — "আমাকে ঢাকার সব ছাত্রের নাম দাও", "এই পণ্যের দাম বদলাও", "নতুন একটা টেবিল বানাও" ইত্যাদি।</p>
<p>ফেসবুক, বিকাশ, দারাজ, ব্যাংক, হাসপাতাল — প্রায় সব অ্যাপের পেছনেই কোনো না কোনো ডেটাবেস আছে, আর সেখান থেকে ডেটা আনা-নেওয়ার কাজ হয় SQL দিয়ে। তাই প্রোগ্রামার, ডেটা অ্যানালিস্ট, এমনকি মার্কেটিং বা ফাইন্যান্সের মানুষের জন্যও SQL খুব দরকারি একটা দক্ষতা।</p>

<div class="callout info"><b>জানো কি?</b> SQLite, MySQL, PostgreSQL, Oracle, Microsoft SQL Server — এগুলো সব জনপ্রিয় ডেটাবেস। সবগুলোই মূল SQL স্ট্যান্ডার্ড মেনে চলে, তাই এখানে যা শিখবে তা প্রায় সব জায়গায় কাজে লাগবে। এই সাইটে ব্রাউজারের ভেতরেই <b>SQLite</b> চলে।</div>

<h2>রিলেশনাল ডেটাবেস কী?</h2>
<p>রিলেশনাল ডেটাবেস হলো অনেকগুলো <b>টেবিলের</b> সমষ্টি। প্রতিটি টেবিল দেখতে অনেকটা Excel শিটের মতো:</p>
<ul>
  <li><b>কলাম (Column)</b> — নির্দিষ্ট নামের একেকটি বৈশিষ্ট্য, যেমন <code>name</code>, <code>city</code>, <code>cgpa</code>।</li>
  <li><b>রো (Row)</b> — একটি সম্পূর্ণ রেকর্ড, যেমন একজন ছাত্রের সব তথ্য।</li>
  <li><b>প্রাইমারি কি (Primary Key)</b> — যে কলাম দিয়ে প্রতিটি রো আলাদাভাবে চেনা যায়, সাধারণত <code>id</code>।</li>
  <li><b>ফরেন কি (Foreign Key)</b> — অন্য টেবিলের প্রাইমারি কি-র রেফারেন্স। যেমন <code>students.dept_id</code> নির্দেশ করে <code>departments.id</code>-কে। এভাবেই টেবিলগুলো একে অপরের সাথে "রিলেশন" তৈরি করে।</li>
</ul>

<table class="demo-table">
  <caption>উদাহরণ: students টেবিলের একটি অংশ</caption>
  <tr><th>id</th><th>name</th><th>dept_id</th><th>city</th><th>cgpa</th></tr>
  <tr><td>1</td><td>Rahim Uddin</td><td>1</td><td>Dhaka</td><td>3.75</td></tr>
  <tr><td>2</td><td>Karim Hasan</td><td>1</td><td>Chattogram</td><td>3.2</td></tr>
  <tr><td>3</td><td>Fatema Akter</td><td>2</td><td>Dhaka</td><td>3.9</td></tr>
</table>

<h2>SQL কমান্ডের ধরন</h2>
<table class="demo-table">
  <tr><th>ধরন</th><th>কাজ</th><th>কমান্ড</th></tr>
  <tr><td><b>DQL</b> (Query)</td><td>ডেটা পড়া/খোঁজা</td><td><code>SELECT</code></td></tr>
  <tr><td><b>DML</b> (Manipulation)</td><td>ডেটা যোগ/বদল/মুছা</td><td><code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code></td></tr>
  <tr><td><b>DDL</b> (Definition)</td><td>টেবিলের গঠন তৈরি/বদল</td><td><code>CREATE</code>, <code>ALTER</code>, <code>DROP</code></td></tr>
  <tr><td><b>TCL</b> (Transaction)</td><td>একাধিক কাজ একসাথে নিরাপদে করা</td><td><code>BEGIN</code>, <code>COMMIT</code>, <code>ROLLBACK</code></td></tr>
</table>

<h2>আমাদের ডেমো ডেটাবেস</h2>
<p>পুরো কোর্সে আমরা একটি বিশ্ববিদ্যালয় ও একটি ছোট অনলাইন শপের ডেটা নিয়ে কাজ করব। নিচে সব টেবিল আর তাদের কলাম দেখো — যেকোনো টেবিলে ক্লিক করলে ডান পাশে তার ডেটা দেখাবে।</p>
<div class="schema-auto"></div>

<h2>এই সাইট কীভাবে ব্যবহার করবে</h2>
<ol>
  <li>বাম পাশে লেসন পড়ো। প্রতিটি উদাহরণের পাশে <b>▶ চালাও</b> বাটন আছে — চাপলেই ফলাফল দেখবে।</li>
  <li>ডান পাশের <b>অনুশীলন</b> ট্যাবে প্রশ্ন আছে। নিজে কুয়েরি লিখে <kbd>Ctrl</kbd>+<kbd>Enter</kbd> চাপো — সঠিক হলে ✓ চিহ্ন পাবে।</li>
  <li>আটকে গেলে <b>হিন্ট</b> দেখো, তারপরও না পারলে <b>সমাধান</b>।</li>
  <li><b>কুইজ</b> ট্যাবে ধারণা যাচাই করো। তোমার অগ্রগতি ব্রাউজারে সেভ থাকে।</li>
  <li>অনুশীলনে ডেটা নষ্ট হওয়ার ভয় নেই — প্রতিবার নতুন করে ডেটাবেস তৈরি হয়।</li>
</ol>
<p>চলো প্রথম কুয়েরি চালাই:</p>
<pre class="ex">SELECT * FROM students;</pre>
`,
  exercises: [
    { task: 'তোমার প্রথম কুয়েরি! <code>students</code> টেবিলের সব ডেটা দেখাও।', solution: 'SELECT * FROM students;', hint: 'SELECT * FROM টেবিলের_নাম; লিখে দেখো।' }
  ],
  quiz: [
    { q: 'টেবিলের প্রতিটি রেকর্ডকে আলাদাভাবে চেনার জন্য কোনটি ব্যবহৃত হয়?', options: ['Foreign Key', 'Primary Key', 'Column', 'Index'], answer: 1, explain: 'Primary Key প্রতিটি রো-কে ইউনিকভাবে চিহ্নিত করে। দুটি রো-র একই প্রাইমারি কি থাকতে পারে না।' },
    { q: 'students.dept_id কলামটি departments.id কে নির্দেশ করে। dept_id কে কী বলা হয়?', options: ['Primary Key', 'Foreign Key', 'Unique Key', 'Super Key'], answer: 1, explain: 'অন্য টেবিলের প্রাইমারি কি-কে রেফার করা কলামকে Foreign Key বলে।' },
    { q: 'নিচের কোনটি DDL কমান্ড?', options: ['SELECT', 'INSERT', 'CREATE', 'COMMIT'], answer: 2, explain: 'CREATE, ALTER, DROP হলো DDL — এগুলো টেবিলের গঠন নিয়ে কাজ করে।' }
  ]
},

// ───────────────────────────────── SELECT
{
  id: 'select', section: 'read', title: 'SELECT — ডেটা পড়া',
  summary: 'টেবিল থেকে নির্দিষ্ট কলাম বা সব কলাম তুলে আনা',
  tables: ['students', 'products'],
  content: `
<p>ডেটাবেস থেকে ডেটা পড়ার জন্য আমরা <code>SELECT</code> স্টেটমেন্ট ব্যবহার করি। একে বলা হয় <b>কুয়েরি (query)</b> — মানে ডেটাবেসকে একটা প্রশ্ন করা।</p>

<h2>নির্দিষ্ট কলাম নির্বাচন</h2>
<pre class="syntax">SELECT কলাম১, কলাম২, ...
FROM টেবিলের_নাম;</pre>
<p>ধরো তুমি শুধু ছাত্রদের নাম আর শহর জানতে চাও:</p>
<pre class="ex">SELECT name, city
FROM students;</pre>
<p>ফলাফল হিসেবে ডেটাবেস একটা নতুন "অস্থায়ী টেবিল" ফেরত দেয় যেখানে শুধু তোমার চাওয়া কলামগুলো থাকে। মূল টেবিলে কোনো পরিবর্তন হয় না।</p>

<h2>সব কলাম নির্বাচন: <code>*</code></h2>
<p>সব কলাম একসাথে দেখতে চাইলে কলামের নামের বদলে তারকা চিহ্ন <code>*</code> দাও:</p>
<pre class="ex">SELECT * FROM products;</pre>
<div class="callout warn"><b>সতর্কতা:</b> বাস্তব প্রজেক্টে বড় টেবিলে <code>SELECT *</code> এড়িয়ে চলাই ভালো — যে কলাম দরকার শুধু সেগুলো চাও। এতে কুয়েরি দ্রুত হয় এবং কোড পড়তে সহজ হয়।</div>

<h2>কিছু জরুরি নিয়ম</h2>
<ul>
  <li>SQL কিওয়ার্ড (<code>SELECT</code>, <code>FROM</code>) ছোট বা বড় হাতের যেকোনোভাবে লেখা যায়, তবে বড় হাতে লেখা প্রচলিত — পড়তে সুবিধা।</li>
  <li>স্টেটমেন্টের শেষে সেমিকোলন <code>;</code> দেওয়া ভালো অভ্যাস, বিশেষ করে একাধিক স্টেটমেন্ট লিখলে।</li>
  <li>একাধিক লাইনে ভেঙে লিখলেও সমস্যা নেই — SQL স্পেস ও নতুন লাইন উপেক্ষা করে।</li>
  <li>কমেন্ট লিখতে <code>--</code> (এক লাইন) বা <code>/* ... */</code> (একাধিক লাইন) ব্যবহার করো।</li>
</ul>
<pre class="ex">-- এটা একটা কমেন্ট, ডেটাবেস এটা উপেক্ষা করবে
SELECT name, cgpa   /* নাম আর সিজিপিএ */
FROM students;</pre>
<h2>কলামের ক্রম</h2>
<p>তুমি যে ক্রমে কলাম লিখবে, ফলাফলেও সেই ক্রমে দেখাবে। চাইলে একই কলাম দুবারও আনতে পারো।</p>
<pre class="ex">SELECT cgpa, name FROM students;</pre>
`,
  exercises: [
    { task: 'সব ছাত্রছাত্রীর শুধু <b>নাম</b> (<code>name</code>) দেখাও।', solution: 'SELECT name FROM students;', hint: 'SELECT name FROM ...' },
    { task: 'সব ছাত্রের <b>নাম</b> ও <b>শহর</b> (<code>city</code>) দেখাও।', solution: 'SELECT name, city FROM students;', hint: 'একাধিক কলাম কমা দিয়ে আলাদা করো।' },
    { task: '<code>products</code> টেবিলের সব কলাম দেখাও।', solution: 'SELECT * FROM products;', hint: '* ব্যবহার করো।' },
    { task: 'প্রতিটি পণ্যের <b>নাম</b>, <b>ক্যাটাগরি</b> ও <b>দাম</b> (<code>name, category, price</code>) দেখাও।', solution: 'SELECT name, category, price FROM products;', hint: 'কলামের নাম ঠিক এই ক্রমে লেখো।' }
  ],
  quiz: [
    { q: 'টেবিলের সব কলাম দেখাতে কোন চিহ্ন ব্যবহার করা হয়?', options: ['%', '*', '#', 'ALL'], answer: 1, explain: 'SELECT * মানে "সব কলাম"।' },
    { q: 'select name from students; — এই কুয়েরি কি কাজ করবে?', options: ['না, কিওয়ার্ড বড় হাতে লিখতে হবে', 'হ্যাঁ, SQL কিওয়ার্ড case-insensitive', 'শুধু MySQL-এ কাজ করবে', 'সেমিকোলন না থাকলে কাজ করবে'], answer: 1, explain: 'SQL কিওয়ার্ড ছোট-বড় যেভাবেই লেখো কাজ করে।' },
    { q: 'SELECT কুয়েরি চালালে মূল টেবিলের কী হয়?', options: ['ডেটা মুছে যায়', 'কিছুই হয় না, শুধু পড়া হয়', 'কলামের ক্রম বদলে যায়', 'নতুন টেবিল সেভ হয়'], answer: 1, explain: 'SELECT শুধু ডেটা পড়ে — মূল টেবিল অপরিবর্তিত থাকে।' }
  ]
},

{
  id: 'where-num', section: 'read', title: 'WHERE — শর্ত দিয়ে ফিল্টার (সংখ্যা)',
  summary: 'তুলনা অপারেটর, BETWEEN, IN, AND/OR দিয়ে রো বাছাই',
  tables: ['students', 'products'],
  content: `
<p>সব রো না চেয়ে শুধু নির্দিষ্ট শর্ত পূরণ করা রো চাইলে <code>WHERE</code> ব্যবহার করি। ডেটাবেস প্রতিটি রো পরীক্ষা করে, শর্ত সত্য হলে সেটা রাখে, না হলে বাদ দেয়।</p>
<pre class="syntax">SELECT কলাম, ...
FROM টেবিল
WHERE শর্ত;</pre>
<pre class="ex">SELECT name, cgpa
FROM students
WHERE cgpa > 3.5;</pre>

<h2>তুলনা অপারেটর</h2>
<table class="demo-table">
  <tr><th>অপারেটর</th><th>অর্থ</th><th>উদাহরণ</th></tr>
  <tr><td><code>=</code></td><td>সমান</td><td><code>admission_year = 2022</code></td></tr>
  <tr><td><code>!=</code> বা <code>&lt;&gt;</code></td><td>সমান নয়</td><td><code>dept_id != 1</code></td></tr>
  <tr><td><code>&lt;</code> <code>&lt;=</code></td><td>ছোট / ছোট বা সমান</td><td><code>price &lt;= 500</code></td></tr>
  <tr><td><code>&gt;</code> <code>&gt;=</code></td><td>বড় / বড় বা সমান</td><td><code>cgpa &gt;= 3.5</code></td></tr>
  <tr><td><code>BETWEEN … AND …</code></td><td>দুটি মানের মধ্যে (দুই প্রান্তসহ)</td><td><code>price BETWEEN 500 AND 5000</code></td></tr>
  <tr><td><code>NOT BETWEEN … AND …</code></td><td>সীমার বাইরে</td><td><code>cgpa NOT BETWEEN 3 AND 3.5</code></td></tr>
  <tr><td><code>IN (…)</code></td><td>তালিকার যেকোনো একটি</td><td><code>id IN (2, 5, 9)</code></td></tr>
  <tr><td><code>NOT IN (…)</code></td><td>তালিকার কোনোটিই নয়</td><td><code>dept_id NOT IN (1, 2)</code></td></tr>
</table>
<pre class="ex">SELECT name, price
FROM products
WHERE price BETWEEN 500 AND 5000;</pre>

<h2>একাধিক শর্ত: AND, OR, NOT</h2>
<ul>
  <li><code>AND</code> — দুটো শর্তই সত্য হতে হবে।</li>
  <li><code>OR</code> — যেকোনো একটা সত্য হলেই চলবে।</li>
  <li><code>NOT</code> — শর্ত উল্টে দেয়।</li>
</ul>
<pre class="ex">-- CSE বিভাগের (dept_id = 1) যাদের CGPA 3.5 বা তার বেশি
SELECT name, cgpa
FROM students
WHERE dept_id = 1 AND cgpa >= 3.5;</pre>
<div class="callout tip"><b>টিপস:</b> <code>AND</code> আর <code>OR</code> একসাথে লিখলে বন্ধনী <code>( )</code> ব্যবহার করো। <code>AND</code>-এর অগ্রাধিকার বেশি, তাই <code>a OR b AND c</code> আসলে <code>a OR (b AND c)</code> হিসেবে কাজ করে — যা হয়তো তুমি চাওনি।</div>
<pre class="ex">SELECT name, admission_year, cgpa
FROM students
WHERE (admission_year = 2021 OR admission_year = 2023)
  AND cgpa > 3.5;</pre>
`,
  exercises: [
    { task: 'যাদের <code>cgpa</code> 3.5 এর <b>বেশি</b>, সেই ছাত্রদের সব তথ্য দেখাও।', solution: 'SELECT * FROM students WHERE cgpa > 3.5;', hint: 'WHERE cgpa > 3.5' },
    { task: '২০২২ সালে ভর্তি হওয়া (<code>admission_year</code>) ছাত্রদের <b>নাম</b> দেখাও।', solution: 'SELECT name FROM students WHERE admission_year = 2022;', hint: 'সমান বোঝাতে SQL-এ একটা = ব্যবহার হয়।' },
    { task: 'যেসব পণ্যের দাম <b>500 থেকে 5000</b> এর মধ্যে (দুই প্রান্তসহ), তাদের <code>name</code> ও <code>price</code> দেখাও।', solution: 'SELECT name, price FROM products WHERE price BETWEEN 500 AND 5000;', hint: 'BETWEEN 500 AND 5000' },
    { task: '<code>id</code> 2, 5 ও 9 — এই তিন ছাত্রের সব তথ্য দেখাও।', solution: 'SELECT * FROM students WHERE id IN (2, 5, 9);', hint: 'IN (2, 5, 9)' },
    { task: 'CSE বিভাগের (<code>dept_id = 1</code>) যেসব ছাত্রের CGPA <b>3.5 বা তার বেশি</b>, তাদের <code>name</code> ও <code>cgpa</code> দেখাও।', solution: 'SELECT name, cgpa FROM students WHERE dept_id = 1 AND cgpa >= 3.5;', hint: 'দুটো শর্ত AND দিয়ে যোগ করো।' }
  ],
  quiz: [
    { q: 'price BETWEEN 100 AND 200 — দাম ঠিক 200 হলে কি সেই রো আসবে?', options: ['হ্যাঁ, BETWEEN দুই প্রান্তসহ ধরে', 'না, 200 বাদ যাবে', 'শুধু 100 ধরা হবে', 'ডেটাবেসের উপর নির্ভর করে'], answer: 0, explain: 'BETWEEN inclusive — অর্থাৎ 100 ও 200 দুটোই অন্তর্ভুক্ত।' },
    { q: 'a OR b AND c — এটা কীভাবে মূল্যায়ন হয়?', options: ['(a OR b) AND c', 'a OR (b AND c)', 'বাম থেকে ডানে', 'এরর দেবে'], answer: 1, explain: 'AND-এর অগ্রাধিকার OR-এর চেয়ে বেশি। তাই বন্ধনী ব্যবহার করা নিরাপদ।' },
    { q: '"সমান নয়" বোঝাতে কোনটি সঠিক?', options: ['=!', '!= বা <>', '><', 'NOT='], answer: 1, explain: '!= এবং <> দুটোই "সমান নয়" বোঝায়।' }
  ]
},

{
  id: 'where-text', section: 'read', title: 'WHERE — টেক্সট ও LIKE',
  summary: 'টেক্সট মিলানো, LIKE দিয়ে প্যাটার্ন খোঁজা',
  tables: ['students', 'products'],
  content: `
<p>টেক্সট (স্ট্রিং) কলামে শর্ত দিতে মানটা <b>সিঙ্গেল কোট</b> <code>' '</code> এর মধ্যে লিখতে হয়।</p>
<pre class="ex">SELECT name, city
FROM students
WHERE city = 'Dhaka';</pre>
<div class="callout warn"><b>সাধারণ ভুল:</b> <code>WHERE city = Dhaka</code> লিখলে SQL ভাববে <code>Dhaka</code> একটা কলামের নাম, ফলে এরর দেবে। টেক্সট সবসময় <code>'Dhaka'</code> এভাবে কোটের মধ্যে।</div>

<h2>টেক্সটের জন্য অপারেটর</h2>
<table class="demo-table">
  <tr><th>অপারেটর</th><th>অর্থ</th><th>উদাহরণ</th></tr>
  <tr><td><code>=</code></td><td>হুবহু মিল</td><td><code>city = 'Dhaka'</code></td></tr>
  <tr><td><code>!=</code> / <code>&lt;&gt;</code></td><td>মিল নেই</td><td><code>category != 'Grocery'</code></td></tr>
  <tr><td><code>LIKE</code></td><td>প্যাটার্নের সাথে মিল</td><td><code>name LIKE 'S%'</code></td></tr>
  <tr><td><code>NOT LIKE</code></td><td>প্যাটার্নের সাথে মিল নেই</td><td><code>name NOT LIKE '%a'</code></td></tr>
  <tr><td><code>%</code></td><td>(LIKE-এ) শূন্য বা যেকোনো সংখ্যক অক্ষর</td><td><code>'%Hossain%'</code></td></tr>
  <tr><td><code>_</code></td><td>(LIKE-এ) ঠিক একটি অক্ষর</td><td><code>'_ita'</code> → Mita, Rita</td></tr>
  <tr><td><code>IN (…)</code></td><td>তালিকার যেকোনোটি</td><td><code>city IN ('Sylhet', 'Khulna')</code></td></tr>
</table>

<h2>LIKE দিয়ে প্যাটার্ন খোঁজা</h2>
<p>পুরো মান না জেনে আংশিক মিল খুঁজতে <code>LIKE</code>:</p>
<pre class="ex">-- নাম 'S' দিয়ে শুরু
SELECT name FROM students WHERE name LIKE 'S%';</pre>
<pre class="ex">-- নামের মধ্যে কোথাও 'Hossain' আছে
SELECT name FROM students WHERE name LIKE '%Hossain%';</pre>
<pre class="ex">-- নাম 'n' দিয়ে শেষ
SELECT name FROM students WHERE name LIKE '%n';</pre>
<div class="callout info"><b>জানো কি?</b> SQLite ও MySQL-এ <code>LIKE</code> ইংরেজি অক্ষরে ছোট-বড় পার্থক্য করে না (<code>'s%'</code> আর <code>'S%'</code> একই)। কিন্তু PostgreSQL-এ করে — সেখানে case-insensitive খোঁজার জন্য <code>ILIKE</code> আছে। আর <code>=</code> সাধারণত হুবহু মিল খোঁজে।</div>
`,
  exercises: [
    { task: '<b>Dhaka</b> শহরের সব ছাত্রের সব তথ্য দেখাও।', solution: "SELECT * FROM students WHERE city = 'Dhaka';", hint: "টেক্সট সিঙ্গেল কোটে: 'Dhaka'" },
    { task: 'যাদের নাম <b>S</b> দিয়ে শুরু, তাদের <code>name</code> দেখাও।', solution: "SELECT name FROM students WHERE name LIKE 'S%';", hint: "LIKE 'S%'" },
    { task: 'যাদের নামে <b>Hossain</b> আছে, সেই ছাত্রদের <code>name</code> ও <code>city</code> দেখাও।', solution: "SELECT name, city FROM students WHERE name LIKE '%Hossain%';", hint: "দুই পাশে % দাও: '%Hossain%'" },
    { task: '<b>Sylhet</b> অথবা <b>Khulna</b>-র ছাত্রদের <code>name</code> ও <code>city</code> দেখাও।', solution: "SELECT name, city FROM students WHERE city IN ('Sylhet', 'Khulna');", hint: "IN ('Sylhet', 'Khulna') অথবা OR ব্যবহার করো।" },
    { task: '<b>Grocery</b> ক্যাটাগরির বাইরে সব পণ্যের <code>name</code> ও <code>category</code> দেখাও।', solution: "SELECT name, category FROM products WHERE category != 'Grocery';", hint: "!= 'Grocery'" }
  ],
  quiz: [
    { q: "name LIKE '_a%' — কোন নামটি মিলবে?", options: ['Shirin', 'Karim', 'Ahmed', 'Nusrat'], answer: 1, explain: "'_a%' মানে: প্রথমে যেকোনো একটি অক্ষর, তারপর 'a', তারপর যা খুশি। Karim → K-a-rim ✓। বাকিদের দ্বিতীয় অক্ষর a নয়।" },
    { q: "WHERE city = Dhaka (কোট ছাড়া) লিখলে কী হবে?", options: ['ঢাকার সব রো আসবে', "এরর: Dhaka নামে কোনো কলাম নেই", 'খালি ফলাফল', 'সব রো আসবে'], answer: 1, explain: 'কোট ছাড়া লিখলে SQL একে কলামের নাম মনে করে।' },
    { q: "LIKE-এ % চিহ্নের অর্থ কী?", options: ['ঠিক একটি অক্ষর', 'শূন্য বা যেকোনো সংখ্যক অক্ষর', 'শুধু সংখ্যা', 'শতাংশ'], answer: 1, explain: '% = যেকোনো সংখ্যক অক্ষর (শূন্যও হতে পারে)। _ = ঠিক একটি অক্ষর।' }
  ]
},

{
  id: 'order', section: 'read', title: 'DISTINCT, ORDER BY ও LIMIT',
  summary: 'ডুপ্লিকেট বাদ দেওয়া, ফলাফল সাজানো ও সীমিত করা',
  tables: ['students', 'products'],
  content: `
<h2>DISTINCT — ডুপ্লিকেট বাদ দাও</h2>
<p>অনেক ছাত্র একই শহরের। শুধু ইউনিক শহরগুলো দেখতে চাইলে:</p>
<pre class="ex">SELECT DISTINCT city FROM students;</pre>
<p>একাধিক কলাম দিলে <code>DISTINCT</code> পুরো কম্বিনেশনের উপর কাজ করে — <code>SELECT DISTINCT city, admission_year</code> মানে শহর+বছরের ইউনিক জোড়া।</p>

<h2>ORDER BY — ফলাফল সাজাও</h2>
<p>ডিফল্টভাবে ডেটাবেস কোনো নির্দিষ্ট ক্রম নিশ্চিত করে না। ক্রম চাইলে <code>ORDER BY</code>:</p>
<pre class="syntax">SELECT ... FROM ...
ORDER BY কলাম ASC;   -- ছোট থেকে বড় (ডিফল্ট)
ORDER BY কলাম DESC;  -- বড় থেকে ছোট</pre>
<pre class="ex">SELECT name, cgpa
FROM students
ORDER BY cgpa DESC;</pre>
<p>একাধিক কলামে সাজানো যায় — প্রথম কলামে মান সমান হলে দ্বিতীয় কলাম দিয়ে:</p>
<pre class="ex">SELECT name, city, cgpa
FROM students
ORDER BY city ASC, cgpa DESC;</pre>

<h2>LIMIT ও OFFSET — নির্দিষ্ট সংখ্যক রো</h2>
<p><code>LIMIT n</code> প্রথম n টি রো দেয়। <code>OFFSET m</code> প্রথম m টি রো বাদ দিয়ে শুরু করে। এটা দিয়েই ওয়েবসাইটে "পেজিনেশন" (পেজ ১, ২, ৩...) বানানো হয়।</p>
<pre class="ex">-- সবচেয়ে বেশি CGPA-র ৩ জন
SELECT name, cgpa
FROM students
ORDER BY cgpa DESC
LIMIT 3;</pre>
<pre class="ex">-- ৪র্থ থেকে ৬ষ্ঠ সস্তা পণ্য
SELECT name, price
FROM products
ORDER BY price
LIMIT 3 OFFSET 3;</pre>
<div class="callout info"><b>জানো কি?</b> SQL Server-এ <code>LIMIT</code> নেই — সেখানে <code>SELECT TOP 3 ...</code> লেখা হয়। Oracle-এ <code>FETCH FIRST 3 ROWS ONLY</code>। কাজ একই।</div>
<p>কুয়েরিতে ক্লজগুলোর ক্রম মনে রাখো: <code>SELECT → FROM → WHERE → ORDER BY → LIMIT</code></p>
`,
  exercises: [
    { task: 'ছাত্রছাত্রীরা যেসব শহর থেকে এসেছে, সেই শহরগুলোর <b>ইউনিক</b> তালিকা দেখাও।', solution: 'SELECT DISTINCT city FROM students;', hint: 'SELECT DISTINCT city ...' },
    { task: 'সব ছাত্রের <code>name</code> ও <code>cgpa</code>, CGPA অনুযায়ী <b>বড় থেকে ছোট</b> ক্রমে দেখাও।', solution: 'SELECT name, cgpa FROM students ORDER BY cgpa DESC;', hint: 'ORDER BY cgpa DESC', ordered: true },
    { task: 'সবচেয়ে বেশি CGPA পাওয়া <b>৩ জন</b> ছাত্রের <code>name</code> ও <code>cgpa</code> দেখাও।', solution: 'SELECT name, cgpa FROM students ORDER BY cgpa DESC LIMIT 3;', hint: 'ORDER BY ... DESC LIMIT 3', ordered: true },
    { task: 'দাম অনুযায়ী ছোট থেকে বড় সাজালে <b>৪র্থ, ৫ম ও ৬ষ্ঠ</b> পণ্যের <code>name</code> ও <code>price</code> দেখাও।', solution: 'SELECT name, price FROM products ORDER BY price LIMIT 3 OFFSET 3;', hint: 'প্রথম ৩টি বাদ দিতে OFFSET 3, তারপর LIMIT 3।', ordered: true },
    { task: 'ছাত্রদের <code>name, city, cgpa</code> দেখাও — প্রথমে শহরের নাম অনুযায়ী (A→Z), একই শহরে CGPA বড় থেকে ছোট।', solution: 'SELECT name, city, cgpa FROM students ORDER BY city ASC, cgpa DESC;', hint: 'ORDER BY city ASC, cgpa DESC', ordered: true }
  ],
  quiz: [
    { q: 'ORDER BY-তে ASC বা DESC না লিখলে কোন ক্রমে সাজায়?', options: ['DESC', 'ASC (ছোট থেকে বড়)', 'র‍্যান্ডম', 'এরর দেয়'], answer: 1, explain: 'ডিফল্ট হলো ASC।' },
    { q: 'LIMIT 5 OFFSET 10 — কোন রোগুলো আসবে?', options: ['১ থেকে ৫', '১০ থেকে ১৫', '১১ থেকে ১৫', '৫ থেকে ১০'], answer: 2, explain: 'প্রথম ১০টি বাদ দিয়ে পরের ৫টি — অর্থাৎ ১১তম থেকে ১৫তম।' },
    { q: 'ORDER BY ছাড়া SELECT-এর ফলাফলের ক্রম সম্পর্কে কোনটি সত্য?', options: ['সবসময় id অনুযায়ী', 'সবসময় ইনসার্টের ক্রমে', 'কোনো নিশ্চয়তা নেই', 'বর্ণানুক্রমে'], answer: 2, explain: 'নির্দিষ্ট ক্রম চাইলে অবশ্যই ORDER BY লিখতে হবে।' }
  ]
},

{
  id: 'review1', section: 'read', title: 'রিভিউ: সাধারণ SELECT',
  summary: 'এখন পর্যন্ত শেখা সবকিছু cities টেবিলে প্র্যাকটিস',
  tables: ['cities'],
  content: `
<p>অভিনন্দন! 🎉 তুমি SQL-এর সবচেয়ে বেশি ব্যবহৃত অংশ শিখে ফেলেছ। এখন <code>cities</code> টেবিল দিয়ে প্র্যাকটিস করি। এই টেবিলে বাংলাদেশের কিছু জেলার নাম, বিভাগ, জনসংখ্যা ও আয়তন আছে (আনুমানিক ডেটা)।</p>
<pre class="ex">SELECT * FROM cities;</pre>
<h2>সংক্ষেপে যা শিখলাম</h2>
<pre class="syntax">SELECT DISTINCT কলাম, ...
FROM টেবিল
WHERE শর্ত
ORDER BY কলাম ASC/DESC
LIMIT n OFFSET m;</pre>
<ul>
  <li><code>SELECT</code> — কোন কলাম দেখবে</li>
  <li><code>FROM</code> — কোন টেবিল থেকে</li>
  <li><code>WHERE</code> — কোন রো রাখবে (<code>=, &lt;, BETWEEN, IN, LIKE, AND, OR</code>)</li>
  <li><code>DISTINCT</code> — ডুপ্লিকেট বাদ</li>
  <li><code>ORDER BY</code> — সাজানো</li>
  <li><code>LIMIT / OFFSET</code> — কতগুলো রো</li>
</ul>
<div class="callout tip"><b>টিপস:</b> কঠিন প্রশ্ন ভাঙো ছোট ধাপে। প্রথমে <code>SELECT * FROM cities</code> দেখো, তারপর WHERE যোগ করো, তারপর ORDER BY, তারপর LIMIT।</div>
`,
  exercises: [
    { task: '<b>Dhaka</b> বিভাগের (<code>division</code>) সব জেলার <code>name</code> ও <code>population</code> দেখাও।', solution: "SELECT name, population FROM cities WHERE division = 'Dhaka';", hint: "WHERE division = 'Dhaka'" },
    { task: 'জনসংখ্যায় সবচেয়ে বড় <b>৩টি</b> জেলার <code>name</code> ও <code>population</code> দেখাও (বড় থেকে ছোট)।', solution: 'SELECT name, population FROM cities ORDER BY population DESC LIMIT 3;', hint: 'ORDER BY population DESC LIMIT 3', ordered: true },
    { task: 'যেসব জেলার আয়তন (<code>area_km2</code>) <b>2500-এর কম</b>, তাদের <code>name</code> বর্ণানুক্রমে দেখাও।', solution: 'SELECT name FROM cities WHERE area_km2 < 2500 ORDER BY name;', hint: 'WHERE area_km2 < 2500 ORDER BY name', ordered: true },
    { task: '<b>Chattogram</b> বা <b>Rajshahi</b> বিভাগের জেলাগুলোর <code>name, division, population</code> — জনসংখ্যা অনুযায়ী বড় থেকে ছোট।', solution: "SELECT name, division, population FROM cities WHERE division IN ('Chattogram', 'Rajshahi') ORDER BY population DESC;", hint: "IN ('Chattogram', 'Rajshahi') তারপর ORDER BY", ordered: true },
    { task: 'আয়তনে <b>২য় থেকে ৪র্থ</b> বড় জেলার <code>name</code> ও <code>area_km2</code> দেখাও।', solution: 'SELECT name, area_km2 FROM cities ORDER BY area_km2 DESC LIMIT 3 OFFSET 1;', hint: 'প্রথমটি বাদ: OFFSET 1, তারপর ৩টি: LIMIT 3', ordered: true }
  ],
  quiz: [
    { q: 'নিচের কোন ক্রমে ক্লজগুলো লিখতে হয়?', options: ['SELECT, WHERE, FROM, ORDER BY', 'SELECT, FROM, WHERE, ORDER BY, LIMIT', 'FROM, SELECT, WHERE, LIMIT', 'SELECT, FROM, ORDER BY, WHERE'], answer: 1, explain: 'SELECT → FROM → WHERE → ORDER BY → LIMIT' },
    { q: 'জনসংখ্যায় সবচেয়ে ছোট জেলা পেতে কোনটি সঠিক?', options: ['ORDER BY population DESC LIMIT 1', 'ORDER BY population LIMIT 1', 'WHERE population = MIN', 'LIMIT 1 ORDER BY population'], answer: 1, explain: 'ASC (ডিফল্ট) সাজিয়ে প্রথমটি নিলেই সবচেয়ে ছোট।' }
  ]
},

// ───────────────────────────────── JOIN
{
  id: 'join', section: 'join', title: 'INNER JOIN — টেবিল জোড়া লাগানো',
  summary: 'একাধিক টেবিলের ডেটা একসাথে আনা',
  tables: ['students', 'departments', 'courses', 'enrollments'],
  content: `
<h2>কেন ডেটা একাধিক টেবিলে থাকে?</h2>
<p>ধরো প্রতিটি ছাত্রের রো-তে বিভাগের নাম, ভবন, বাজেট সব লিখে রাখলাম। তাহলে CSE-র ১০০ জন ছাত্রের জন্য "Building A" ১০০ বার লেখা হবে! ভবন বদলালে ১০০ জায়গায় আপডেট করতে হবে, ভুল হওয়ার সম্ভাবনাও বেশি।</p>
<p>তাই ডেটাবেসে ডেটা ভাগ করে রাখা হয় — একে বলে <b>নরমালাইজেশন (Normalization)</b>। ছাত্রের টেবিলে শুধু <code>dept_id</code> থাকে, আর বিভাগের বিস্তারিত থাকে <code>departments</code> টেবিলে। দরকার হলে <code>JOIN</code> দিয়ে জোড়া লাগাই।</p>

<h2>INNER JOIN</h2>
<pre class="syntax">SELECT কলাম, ...
FROM টেবিল_ক
INNER JOIN টেবিল_খ
  ON টেবিল_ক.কলাম = টেবিল_খ.কলাম;</pre>
<p><code>ON</code> বলে দেয় কোন কলাম দিয়ে দুই টেবিল মিলবে। <code>INNER JOIN</code> শুধু সেই রোগুলো দেয় যাদের <b>দুই টেবিলেই</b> মিল আছে।</p>
<pre class="ex">SELECT students.name, departments.name
FROM students
INNER JOIN departments
  ON students.dept_id = departments.id;</pre>
<p>লক্ষ করো, <code>Sabbir Hossain</code>-এর <code>dept_id</code> নেই (NULL), তাই সে ফলাফলে আসেনি। আবার Pharmacy বিভাগে কোনো ছাত্র নেই, সেটাও আসেনি।</p>

<h2>টেবিলের ছোট নাম (Alias)</h2>
<p>প্রতিবার পুরো টেবিলের নাম লেখা ঝামেলা। তাই ছোট নাম দিই। দুই টেবিলে একই নামের কলাম থাকলে (যেমন <code>name</code>, <code>id</code>) কোন টেবিলের কলাম তা অবশ্যই বলে দিতে হয়।</p>
<pre class="ex">SELECT s.name, d.name AS department, d.building
FROM students AS s
JOIN departments AS d ON s.dept_id = d.id
WHERE s.cgpa > 3.5;</pre>
<p><code>JOIN</code> লিখলে সেটা ডিফল্টভাবে <code>INNER JOIN</code>। <code>AS</code> শব্দটা ঐচ্ছিক — <code>students s</code> লিখলেও চলে।</p>

<h2>তিন বা তার বেশি টেবিল</h2>
<p><code>enrollments</code> টেবিল ছাত্র আর কোর্সকে যুক্ত করে (many-to-many সম্পর্ক)। কে কোন কোর্সে কত পেয়েছে দেখি:</p>
<pre class="ex">SELECT s.name, c.title, e.marks
FROM enrollments e
JOIN students s ON e.student_id = s.id
JOIN courses c  ON e.course_id = c.id;</pre>
<div class="callout tip"><b>টিপস:</b> JOIN লেখার আগে কাগজে দুই টেবিলের "সংযোগ কলাম" খুঁজে বের করো — সাধারণত একটার <code>id</code> আরেকটার <code>xxx_id</code>।</div>
`,
  exercises: [
    { task: 'প্রতিটি ছাত্রের <b>নাম</b> ও তার <b>বিভাগের নাম</b> দেখাও (দুটো কলাম)।', solution: 'SELECT s.name, d.name FROM students s JOIN departments d ON s.dept_id = d.id;', hint: 'students JOIN departments ON students.dept_id = departments.id' },
    { task: 'প্রতিটি কোর্সের <code>title</code> ও কোন বিভাগের কোর্স (বিভাগের <code>name</code>) দেখাও।', solution: 'SELECT c.title, d.name FROM courses c JOIN departments d ON c.dept_id = d.id;', hint: 'courses.dept_id = departments.id' },
    { task: '<b>Database Systems</b> কোর্সে যারা ভর্তি হয়েছে তাদের <b>নাম</b> ও <b>marks</b> দেখাও।', solution: "SELECT s.name, e.marks FROM enrollments e JOIN students s ON e.student_id = s.id JOIN courses c ON e.course_id = c.id WHERE c.title = 'Database Systems';", hint: 'enrollments, students, courses — তিনটা JOIN করো, তারপর WHERE c.title = ...' },
    { task: 'যেসব কর্মচারীর বেতন <b>80000-এর বেশি</b>, তাদের <code>name</code> ও তাদের বিভাগের <code>building</code> দেখাও।', solution: 'SELECT e.name, d.building FROM employees e JOIN departments d ON e.dept_id = d.id WHERE e.salary > 80000;', hint: 'employees JOIN departments, তারপর WHERE salary > 80000' },
    { task: 'প্রতিটি অর্ডারের <code>id</code>, <code>customer_name</code> ও পণ্যের <code>name</code> দেখাও।', solution: 'SELECT o.id, o.customer_name, p.name FROM orders o JOIN products p ON o.product_id = p.id;', hint: 'orders.product_id = products.id' }
  ],
  quiz: [
    { q: 'INNER JOIN কোন রোগুলো ফেরত দেয়?', options: ['বাম টেবিলের সব রো', 'দুই টেবিলের সব রো', 'শুধু যেসব রো দুই টেবিলেই মেলে', 'যেসব রো মেলে না'], answer: 2, explain: 'INNER JOIN = শুধু মিলে যাওয়া রো।' },
    { q: 'দুই টেবিলেই name কলাম থাকলে শুধু SELECT name লিখলে কী হবে?', options: ['প্রথম টেবিলেরটা আসবে', 'এরর: ambiguous column name', 'দুটোই আসবে', 'খালি আসবে'], answer: 1, explain: 'কোন টেবিলের name তা s.name বা d.name দিয়ে বলে দিতে হয়।' },
    { q: 'ডেটা একাধিক টেবিলে ভাগ করে রাখার প্রক্রিয়াকে কী বলে?', options: ['Indexing', 'Normalization', 'Aggregation', 'Partitioning'], answer: 1, explain: 'নরমালাইজেশন ডুপ্লিকেশন কমায় এবং ডেটা সামঞ্জস্যপূর্ণ রাখে।' }
  ]
},

{
  id: 'outer-join', section: 'join', title: 'OUTER JOIN — LEFT, RIGHT, FULL',
  summary: 'মিল না থাকলেও রো রাখা, অমিল ডেটা খুঁজে বের করা',
  tables: ['departments', 'students', 'courses', 'enrollments'],
  content: `
<p><code>INNER JOIN</code> মিল না থাকা রো ফেলে দেয়। কিন্তু অনেক সময় আমরা সেগুলোও চাই — যেমন "সব বিভাগ দেখাও, ছাত্র না থাকলেও"। তখন <b>OUTER JOIN</b>।</p>

<div class="join-diagram">
  <div><div class="venn left"></div><b>LEFT JOIN</b><span>বাম টেবিলের সব + ডানের মিল</span></div>
  <div><div class="venn inner"></div><b>INNER JOIN</b><span>শুধু মিল</span></div>
  <div><div class="venn right"></div><b>RIGHT JOIN</b><span>ডান টেবিলের সব + বামের মিল</span></div>
  <div><div class="venn full"></div><b>FULL JOIN</b><span>দুই টেবিলের সব</span></div>
</div>

<h2>LEFT JOIN</h2>
<p>বাম (প্রথম) টেবিলের <b>সব</b> রো থাকবে। ডান টেবিলে মিল না পেলে সেই কলামগুলোতে <code>NULL</code> বসবে।</p>
<pre class="ex">SELECT d.name AS department, s.name AS student
FROM departments d
LEFT JOIN students s ON s.dept_id = d.id;</pre>
<p>দেখো, <b>Pharmacy</b>-র পাশে student <code>NULL</code> — কারণ ওই বিভাগে কেউ নেই।</p>

<h2>অমিল খুঁজে বের করা (খুব কাজের প্যাটার্ন!)</h2>
<p>LEFT JOIN করে ডান টেবিলের id <code>NULL</code> হলে বুঝি মিল নেই:</p>
<pre class="ex">-- কোন বিভাগে কোনো ছাত্র নেই?
SELECT d.name
FROM departments d
LEFT JOIN students s ON s.dept_id = d.id
WHERE s.id IS NULL;</pre>

<h2>RIGHT JOIN ও FULL OUTER JOIN</h2>
<p><code>RIGHT JOIN</code> হলো LEFT JOIN-এর উল্টো — ডান টেবিলের সব রো রাখে। বাস্তবে টেবিলের ক্রম উল্টে LEFT JOIN লেখাই বেশি প্রচলিত। <code>FULL OUTER JOIN</code> দুই টেবিলের সব রো রাখে।</p>
<pre class="ex">SELECT s.name AS student, d.name AS department
FROM students s
FULL OUTER JOIN departments d ON s.dept_id = d.id;</pre>
<p>এখানে Sabbir (বিভাগ নেই) আর Pharmacy (ছাত্র নেই) — দুজনেই এসেছে।</p>
<div class="callout info"><b>জানো কি?</b> MySQL-এ <code>FULL OUTER JOIN</code> নেই — সেখানে LEFT JOIN আর RIGHT JOIN-কে <code>UNION</code> করে একই ফল পাওয়া যায়। SQLite 3.39 থেকে RIGHT ও FULL JOIN সাপোর্ট করে।</div>
`,
  exercises: [
    { task: '<b>সব বিভাগ</b> আর প্রতিটি বিভাগের ছাত্রদের নাম দেখাও — ছাত্র না থাকলেও বিভাগটি দেখাতে হবে। কলাম: বিভাগের <code>name</code>, ছাত্রের <code>name</code>।', solution: 'SELECT d.name, s.name FROM departments d LEFT JOIN students s ON s.dept_id = d.id;', hint: 'departments LEFT JOIN students' },
    { task: 'যেসব বিভাগে <b>কোনো ছাত্র নেই</b>, তাদের <code>name</code> দেখাও।', solution: 'SELECT d.name FROM departments d LEFT JOIN students s ON s.dept_id = d.id WHERE s.id IS NULL;', hint: 'LEFT JOIN করে WHERE s.id IS NULL' },
    { task: 'যেসব কোর্সে <b>কেউ ভর্তি হয়নি</b>, তাদের <code>title</code> দেখাও।', solution: 'SELECT c.title FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id WHERE e.id IS NULL;', hint: 'courses LEFT JOIN enrollments ... WHERE e.id IS NULL' },
    { task: '<b>সব ছাত্রের</b> <code>name</code> ও তার বিভাগের <code>name</code> দেখাও — বিভাগ না থাকলেও ছাত্রটি আসবে।', solution: 'SELECT s.name, d.name FROM students s LEFT JOIN departments d ON s.dept_id = d.id;', hint: 'এবার students বাম পাশে।' }
  ],
  quiz: [
    { q: 'LEFT JOIN-এ ডান টেবিলে মিল না পেলে সেই কলামে কী বসে?', options: ['0', 'খালি স্ট্রিং', 'NULL', 'রো বাদ যায়'], answer: 2, explain: 'মিল না থাকলে NULL বসে।' },
    { q: 'A LEFT JOIN B এবং B RIGHT JOIN A — এরা কি একই ফল দেয়?', options: ['হ্যাঁ (কলামের ক্রম ছাড়া)', 'না', 'শুধু MySQL-এ', 'কখনো না'], answer: 0, explain: 'দুটোই A-র সব রো রাখে।' },
    { q: '"কোন গ্রাহক কখনো অর্ডার করেনি" — কোন প্যাটার্ন সবচেয়ে উপযুক্ত?', options: ['INNER JOIN', 'LEFT JOIN + WHERE right.id IS NULL', 'CROSS JOIN', 'GROUP BY'], answer: 1, explain: 'অমিল খুঁজতে LEFT JOIN + IS NULL ক্লাসিক প্যাটার্ন।' }
  ]
},

{
  id: 'null', section: 'join', title: 'NULL — অনুপস্থিত মান',
  summary: 'IS NULL, IS NOT NULL, COALESCE এবং NULL-এর অদ্ভুত আচরণ',
  tables: ['students', 'employees', 'enrollments'],
  content: `
<p><code>NULL</code> মানে "মান জানা নেই" বা "মান নেই"। এটা শূন্য (<code>0</code>) নয়, খালি টেক্সট (<code>''</code>) ও নয়। যেমন কিছু ছাত্রের ইমেইল নেই — সেখানে <code>NULL</code>।</p>

<h2>NULL খোঁজা: IS NULL</h2>
<div class="callout warn"><b>সাধারণ ভুল:</b> <code>WHERE email = NULL</code> কখনো কাজ করে না! NULL-এর সাথে যেকোনো তুলনার ফল NULL (অজানা), সত্য নয়। সবসময় <code>IS NULL</code> বা <code>IS NOT NULL</code> লিখবে।</div>
<pre class="ex">SELECT name, email
FROM students
WHERE email IS NULL;</pre>
<pre class="ex">-- এটা ভুল — কোনো রো আসবে না
SELECT name FROM students WHERE email = NULL;</pre>

<h2>NULL-এর বদলে অন্য মান: COALESCE</h2>
<p><code>COALESCE(ক, খ, গ...)</code> প্রথম যে মানটা NULL নয় সেটা দেয়। রিপোর্টে NULL-এর জায়গায় সুন্দর লেখা দেখাতে কাজে লাগে।</p>
<pre class="ex">SELECT name, COALESCE(email, 'ইমেইল নেই') AS email
FROM students;</pre>
<p>SQLite/MySQL-এ <code>IFNULL(ক, খ)</code>, SQL Server-এ <code>ISNULL(ক, খ)</code> একই কাজ করে।</p>

<h2>NULL-এর আচরণ মনে রাখো</h2>
<ul>
  <li>গাণিতিক হিসাবে NULL থাকলে ফলাফলও NULL: <code>5 + NULL = NULL</code></li>
  <li><code>COUNT(*)</code> সব রো গোনে, কিন্তু <code>COUNT(email)</code> NULL বাদ দিয়ে গোনে।</li>
  <li><code>AVG</code>, <code>SUM</code> ইত্যাদি NULL উপেক্ষা করে।</li>
  <li><code>NOT IN</code> তালিকায় NULL থাকলে কোনো রো আসে না — সাবধান!</li>
</ul>
<pre class="ex">SELECT COUNT(*) AS total, COUNT(email) AS has_email
FROM students;</pre>
<div class="callout tip"><b>টিপস:</b> টেবিল বানানোর সময় যেসব কলাম কখনো খালি থাকা উচিত নয়, সেখানে <code>NOT NULL</code> কনস্ট্রেইন্ট দাও (পরের লেসনে শিখবে)।</div>
`,
  exercises: [
    { task: 'যেসব ছাত্রের <b>ইমেইল নেই</b>, তাদের <code>name</code> দেখাও।', solution: 'SELECT name FROM students WHERE email IS NULL;', hint: 'WHERE email IS NULL' },
    { task: 'যাদের <b>ইমেইল আছে</b>, তাদের <code>name</code> ও <code>email</code> দেখাও।', solution: 'SELECT name, email FROM students WHERE email IS NOT NULL;', hint: 'IS NOT NULL' },
    { task: 'সব ছাত্রের <code>name</code> ও ইমেইল দেখাও — ইমেইল না থাকলে <code>\'N/A\'</code> দেখাও।', solution: "SELECT name, COALESCE(email, 'N/A') FROM students;", hint: "COALESCE(email, 'N/A')" },
    { task: 'যেসব কর্মচারীর কোনো <b>ম্যানেজার নেই</b> (<code>manager_id</code>), তাদের <code>name</code> ও <code>role</code> দেখাও।', solution: 'SELECT name, role FROM employees WHERE manager_id IS NULL;', hint: 'manager_id IS NULL' }
  ],
  quiz: [
    { q: "WHERE email = NULL — এর ফলাফল কী?", options: ['ইমেইল নেই এমন সব রো', 'কোনো রো আসে না', 'এরর', 'সব রো'], answer: 1, explain: 'NULL-এর সাথে = তুলনা সবসময় অজানা (NULL) হয়, তাই কোনো রো আসে না। IS NULL ব্যবহার করো।' },
    { q: 'SELECT 10 + NULL; এর ফলাফল?', options: ['10', '0', 'NULL', 'এরর'], answer: 2, explain: 'NULL-এর সাথে যেকোনো গণনার ফল NULL।' },
    { q: 'COALESCE(NULL, NULL, 7, 9) এর মান কত?', options: ['NULL', '7', '9', '16'], answer: 1, explain: 'প্রথম non-NULL মানটি — 7।' }
  ]
},

// ───────────────────────────────── হিসাব ও গ্রুপিং
{
  id: 'expressions', section: 'agg', title: 'এক্সপ্রেশন, AS ও ফাংশন',
  summary: 'গণনা করা কলাম, নতুন নাম দেওয়া, টেক্সট ও তারিখ ফাংশন',
  tables: ['products', 'cities', 'employees', 'students'],
  content: `
<p>শুধু কলাম নয়, SELECT-এ আমরা <b>হিসাব</b> করেও নতুন কলাম বানাতে পারি — একে বলে এক্সপ্রেশন।</p>
<pre class="ex">SELECT name, price, stock, price * stock
FROM products;</pre>

<h2>AS — কলামকে নতুন নাম দাও (Alias)</h2>
<p>উপরের ফলাফলে কলামের নাম <code>price * stock</code> — দেখতে ভালো লাগে না। <code>AS</code> দিয়ে সুন্দর নাম দিই:</p>
<pre class="ex">SELECT name, price * stock AS stock_value
FROM products
ORDER BY stock_value DESC;</pre>

<h2>গাণিতিক অপারেটর</h2>
<p><code>+  -  *  /  %</code> (ভাগশেষ)। সাবধান: SQLite-এ দুটো পূর্ণসংখ্যা ভাগ করলে ভগ্নাংশ বাদ যায় (<code>7 / 2 = 3</code>)। ভগ্নাংশ চাইলে একটাকে দশমিক বানাও: <code>7 * 1.0 / 2 = 3.5</code>।</p>
<pre class="ex">-- জনসংখ্যার ঘনত্ব (প্রতি বর্গকিমিতে)
SELECT name, ROUND(population * 1.0 / area_km2, 2) AS density
FROM cities
ORDER BY density DESC;</pre>

<h2>দরকারি ফাংশন</h2>
<table class="demo-table">
  <tr><th>ফাংশন</th><th>কাজ</th><th>উদাহরণ → ফল</th></tr>
  <tr><td><code>UPPER(x)</code> / <code>LOWER(x)</code></td><td>বড়/ছোট হাতের অক্ষর</td><td><code>UPPER('dhaka')</code> → DHAKA</td></tr>
  <tr><td><code>LENGTH(x)</code></td><td>অক্ষর সংখ্যা</td><td><code>LENGTH('SQL')</code> → 3</td></tr>
  <tr><td><code>SUBSTR(x, শুরু, দৈর্ঘ্য)</code></td><td>টেক্সটের অংশ</td><td><code>SUBSTR('Bangladesh', 1, 6)</code> → Bangla</td></tr>
  <tr><td><code>x || y</code></td><td>টেক্সট জোড়া (concat)</td><td><code>'Hello' || ' ' || 'SQL'</code></td></tr>
  <tr><td><code>TRIM(x)</code></td><td>দুই পাশের স্পেস বাদ</td><td><code>TRIM('  hi ')</code> → hi</td></tr>
  <tr><td><code>REPLACE(x, পুরাতন, নতুন)</code></td><td>প্রতিস্থাপন</td><td><code>REPLACE('a-b', '-', '+')</code></td></tr>
  <tr><td><code>ROUND(x, n)</code></td><td>n দশমিক ঘর পর্যন্ত</td><td><code>ROUND(3.14159, 2)</code> → 3.14</td></tr>
  <tr><td><code>ABS(x)</code></td><td>পরম মান</td><td><code>ABS(-5)</code> → 5</td></tr>
  <tr><td><code>DATE('now')</code></td><td>আজকের তারিখ</td><td>2026-11-24</td></tr>
  <tr><td><code>STRFTIME('%Y', d)</code></td><td>তারিখ থেকে বছর/মাস</td><td><code>STRFTIME('%Y', '2024-03-15')</code> → 2024</td></tr>
</table>
<pre class="ex">SELECT UPPER(name) AS name_caps,
       LENGTH(name) AS len,
       name || ' (' || city || ')' AS label
FROM students;</pre>
<pre class="ex">SELECT name, join_date,
       STRFTIME('%Y', join_date) AS join_year
FROM employees;</pre>
<div class="callout info"><b>জানো কি?</b> টেক্সট জোড়া দিতে MySQL-এ <code>CONCAT(a, b)</code>, SQL Server-এ <code>a + b</code> ব্যবহার হয়। PostgreSQL ও SQLite-এ <code>||</code>। তারিখ ফাংশনও ডেটাবেস ভেদে আলাদা।</div>
`,
  exercises: [
    { task: 'প্রতিটি পণ্যের <code>name</code> ও মোট স্টক মূল্য (<code>price * stock</code>) <code>stock_value</code> নামে দেখাও।', solution: 'SELECT name, price * stock AS stock_value FROM products;', hint: 'price * stock AS stock_value' },
    { task: 'প্রতিটি জেলার <code>name</code> ও জনসংখ্যার ঘনত্ব (<code>population / area_km2</code>, ২ দশমিক ঘর পর্যন্ত) দেখাও — ঘনত্ব বেশি থেকে কম।', solution: 'SELECT name, ROUND(population * 1.0 / area_km2, 2) AS density FROM cities ORDER BY density DESC;', hint: 'ROUND(population * 1.0 / area_km2, 2) — 1.0 দিয়ে গুণ করলে দশমিক ভাগ হয়', ordered: true },
    { task: 'প্রতিটি কর্মচারীর <code>name</code> ও <b>বার্ষিক</b> বেতন (<code>salary * 12</code>) দেখাও।', solution: 'SELECT name, salary * 12 FROM employees;', hint: 'salary * 12' },
    { task: 'প্রতিটি ছাত্রের নাম <b>বড় হাতের অক্ষরে</b> এবং নামের <b>দৈর্ঘ্য</b> দেখাও।', solution: 'SELECT UPPER(name), LENGTH(name) FROM students;', hint: 'UPPER(name), LENGTH(name)' },
    { task: 'প্রতিটি অর্ডারের <code>id</code>, পণ্যের <code>name</code> এবং মোট দাম (<code>quantity * price</code>) দেখাও।', solution: 'SELECT o.id, p.name, o.quantity * p.price FROM orders o JOIN products p ON o.product_id = p.id;', hint: 'orders JOIN products, তারপর o.quantity * p.price' }
  ],
  quiz: [
    { q: 'SQLite-এ SELECT 7 / 2; এর ফল কত?', options: ['3.5', '3', '4', 'এরর'], answer: 1, explain: 'দুটো পূর্ণসংখ্যার ভাগ = পূর্ণসংখ্যা। 3.5 পেতে 7.0 / 2 লেখো।' },
    { q: 'কলামকে নতুন নাম দিতে কোন কিওয়ার্ড?', options: ['RENAME', 'AS', 'NAME', 'ALIAS'], answer: 1, explain: 'SELECT price * 2 AS double_price' },
    { q: "SQLite-এ 'Dhaka' || '-' || 'BD' এর ফল?", options: ['Dhaka-BD', 'এরর', '0', 'DhakaBD'], answer: 0, explain: '|| দিয়ে টেক্সট জোড়া লাগে।' }
  ]
},

{
  id: 'aggregates', section: 'agg', title: 'অ্যাগ্রিগেট ফাংশন',
  summary: 'COUNT, SUM, AVG, MIN, MAX দিয়ে সারসংক্ষেপ',
  tables: ['students', 'employees', 'products'],
  content: `
<p>অনেক সময় আমরা প্রতিটি রো দেখতে চাই না, বরং একটা <b>সারসংক্ষেপ</b> চাই — "মোট কতজন ছাত্র?", "গড় বেতন কত?" এজন্য <b>অ্যাগ্রিগেট ফাংশন</b>। এরা অনেকগুলো রো থেকে একটি মান তৈরি করে।</p>
<table class="demo-table">
  <tr><th>ফাংশন</th><th>কাজ</th></tr>
  <tr><td><code>COUNT(*)</code></td><td>মোট রো সংখ্যা</td></tr>
  <tr><td><code>COUNT(কলাম)</code></td><td>যেসব রো-তে ওই কলাম NULL নয়, তাদের সংখ্যা</td></tr>
  <tr><td><code>COUNT(DISTINCT কলাম)</code></td><td>ইউনিক মানের সংখ্যা</td></tr>
  <tr><td><code>SUM(কলাম)</code></td><td>যোগফল</td></tr>
  <tr><td><code>AVG(কলাম)</code></td><td>গড়</td></tr>
  <tr><td><code>MIN(কলাম)</code> / <code>MAX(কলাম)</code></td><td>সর্বনিম্ন / সর্বোচ্চ</td></tr>
</table>
<pre class="ex">SELECT COUNT(*) AS total_students,
       ROUND(AVG(cgpa), 2) AS avg_cgpa,
       MAX(cgpa) AS best,
       MIN(cgpa) AS lowest
FROM students;</pre>
<pre class="ex">SELECT COUNT(DISTINCT city) AS city_count FROM students;</pre>
<h2>WHERE-এর সাথে</h2>
<p>WHERE আগে রো ফিল্টার করে, তারপর অ্যাগ্রিগেট হিসাব হয়:</p>
<pre class="ex">-- শুধু লেকচারারদের গড় বেতন
SELECT AVG(salary) FROM employees WHERE role = 'Lecturer';</pre>
<div class="callout warn"><b>সাধারণ ভুল:</b> <code>SELECT name, MAX(salary) FROM employees</code> — সাধারণ কলাম আর অ্যাগ্রিগেট একসাথে লিখলে বেশিরভাগ ডেটাবেস এরর দেয় (SQLite দেয় না, কিন্তু ফল অনির্ভরযোগ্য হতে পারে)। সবচেয়ে বেশি বেতন কার — এটা জানতে সাবকুয়েরি বা ORDER BY + LIMIT ব্যবহার করো।</div>
`,
  exercises: [
    { task: 'মোট কতজন ছাত্র আছে?', solution: 'SELECT COUNT(*) FROM students;', hint: 'COUNT(*)' },
    { task: 'সব ছাত্রের গড় CGPA দেখাও (২ দশমিক ঘর পর্যন্ত)।', solution: 'SELECT ROUND(AVG(cgpa), 2) FROM students;', hint: 'ROUND(AVG(cgpa), 2)' },
    { task: 'কর্মচারীদের <b>সর্বোচ্চ</b> ও <b>সর্বনিম্ন</b> বেতন দেখাও (দুটি কলাম)।', solution: 'SELECT MAX(salary), MIN(salary) FROM employees;', hint: 'MAX(salary), MIN(salary)' },
    { task: 'কতজন ছাত্রের ইমেইল আছে? (<code>COUNT</code> এর বিশেষ আচরণ ব্যবহার করো)', solution: 'SELECT COUNT(email) FROM students;', hint: 'COUNT(email) NULL গোনে না।' },
    { task: 'সব পণ্যের মোট স্টক মূল্য (<code>price * stock</code>-এর যোগফল) কত?', solution: 'SELECT SUM(price * stock) FROM products;', hint: 'SUM(price * stock)' }
  ],
  quiz: [
    { q: 'COUNT(*) আর COUNT(email)-এর পার্থক্য কী?', options: ['কোনো পার্থক্য নেই', 'COUNT(email) NULL মান গোনে না', 'COUNT(*) NULL গোনে না', 'COUNT(email) ডুপ্লিকেট গোনে না'], answer: 1, explain: 'COUNT(column) শুধু non-NULL মান গোনে।' },
    { q: 'cgpa: 3.0, 4.0, NULL — AVG(cgpa) কত?', options: ['2.33', '3.5', 'NULL', '7.0'], answer: 1, explain: 'AVG NULL উপেক্ষা করে: (3+4)/2 = 3.5' },
    { q: 'কোন ফাংশন ইউনিক মানের সংখ্যা দেয়?', options: ['COUNT(UNIQUE x)', 'COUNT(DISTINCT x)', 'DISTINCT COUNT(x)', 'UNIQUE(x)'], answer: 1, explain: 'COUNT(DISTINCT x)' }
  ]
},

{
  id: 'group-by', section: 'agg', title: 'GROUP BY ও HAVING',
  summary: 'দলে ভাগ করে প্রতিটি দলের হিসাব',
  tables: ['students', 'employees', 'departments', 'products'],
  content: `
<p>"প্রতিটি শহরে কতজন ছাত্র?" — এখানে আমরা ছাত্রদের শহর অনুযায়ী <b>দলে (group)</b> ভাগ করে প্রতিটি দলে COUNT করতে চাই। এজন্য <code>GROUP BY</code>।</p>
<pre class="syntax">SELECT গ্রুপ_কলাম, AGG_FUNC(কলাম)
FROM টেবিল
GROUP BY গ্রুপ_কলাম;</pre>
<pre class="ex">SELECT city, COUNT(*) AS student_count
FROM students
GROUP BY city
ORDER BY student_count DESC;</pre>
<p>কীভাবে কাজ করে: ডেটাবেস প্রথমে একই <code>city</code>-র রোগুলোকে এক বাক্সে রাখে, তারপর প্রতিটি বাক্সের জন্য COUNT হিসাব করে একটি করে রো দেয়।</p>
<div class="callout warn"><b>নিয়ম:</b> GROUP BY থাকলে SELECT-এ শুধু (১) গ্রুপ করা কলাম আর (২) অ্যাগ্রিগেট ফাংশন রাখো। অন্য কলাম রাখলে PostgreSQL/SQL Server এরর দেবে।</div>

<h2>JOIN-এর সাথে GROUP BY</h2>
<pre class="ex">SELECT d.name, COUNT(s.id) AS students, ROUND(AVG(s.cgpa), 2) AS avg_cgpa
FROM departments d
LEFT JOIN students s ON s.dept_id = d.id
GROUP BY d.name;</pre>

<h2>HAVING — গ্রুপের উপর শর্ত</h2>
<p><code>WHERE</code> গ্রুপিংয়ের <b>আগে</b> প্রতিটি রো ফিল্টার করে। <code>HAVING</code> গ্রুপিংয়ের <b>পরে</b> গ্রুপ ফিল্টার করে — তাই HAVING-এ অ্যাগ্রিগেট ফাংশন ব্যবহার করা যায়, WHERE-এ যায় না।</p>
<pre class="ex">-- যেসব শহরে ৩ বা তার বেশি ছাত্র
SELECT city, COUNT(*) AS cnt
FROM students
GROUP BY city
HAVING COUNT(*) >= 3;</pre>
<pre class="ex">-- WHERE ও HAVING একসাথে: ২০২১-এর পরে ভর্তি হওয়া ছাত্রদের মধ্যে,
-- যেসব বিভাগের গড় CGPA ৩.৪-এর বেশি
SELECT dept_id, ROUND(AVG(cgpa), 2) AS avg_cgpa
FROM students
WHERE admission_year > 2021
GROUP BY dept_id
HAVING AVG(cgpa) > 3.4;</pre>
`,
  exercises: [
    { task: 'প্রতিটি শহরে কতজন ছাত্র — <code>city</code> ও সংখ্যা দেখাও।', solution: 'SELECT city, COUNT(*) FROM students GROUP BY city;', hint: 'GROUP BY city' },
    { task: 'প্রতিটি পদবির (<code>role</code>) গড় বেতন দেখাও।', solution: 'SELECT role, AVG(salary) FROM employees GROUP BY role;', hint: 'GROUP BY role, AVG(salary)' },
    { task: 'প্রতিটি বিভাগের <b>নাম</b> ও সেখানে কতজন ছাত্র আছে দেখাও (শুধু যেসব বিভাগে ছাত্র আছে)।', solution: 'SELECT d.name, COUNT(*) FROM students s JOIN departments d ON s.dept_id = d.id GROUP BY d.name;', hint: 'JOIN করে GROUP BY d.name' },
    { task: 'যেসব শহরে <b>৩ বা তার বেশি</b> ছাত্র, সেই <code>city</code> ও সংখ্যা দেখাও।', solution: 'SELECT city, COUNT(*) FROM students GROUP BY city HAVING COUNT(*) >= 3;', hint: 'HAVING COUNT(*) >= 3' },
    { task: 'প্রতিটি ক্যাটাগরির মোট স্টক দেখাও — শুধু যাদের মোট স্টক <b>100-এর বেশি</b>। কলাম: <code>category</code>, মোট স্টক।', solution: 'SELECT category, SUM(stock) FROM products GROUP BY category HAVING SUM(stock) > 100;', hint: 'GROUP BY category HAVING SUM(stock) > 100' }
  ],
  quiz: [
    { q: 'WHERE আর HAVING-এর মূল পার্থক্য কী?', options: ['কোনো পার্থক্য নেই', 'WHERE গ্রুপিংয়ের আগে রো ফিল্টার করে, HAVING পরে গ্রুপ ফিল্টার করে', 'HAVING আগে কাজ করে', 'WHERE শুধু টেক্সটের জন্য'], answer: 1, explain: 'অ্যাগ্রিগেট শর্ত (যেমন COUNT(*) > 3) HAVING-এ লিখতে হয়।' },
    { q: 'WHERE COUNT(*) > 3 লিখলে কী হবে?', options: ['কাজ করবে', 'এরর: misuse of aggregate', 'খালি ফলাফল', 'HAVING হিসেবে চলবে'], answer: 1, explain: 'WHERE-এ অ্যাগ্রিগেট ফাংশন ব্যবহার করা যায় না।' },
    { q: 'SELECT city, name, COUNT(*) FROM students GROUP BY city — সমস্যা কী?', options: ['কোনো সমস্যা নেই', 'name গ্রুপ করা হয়নি বা অ্যাগ্রিগেটও নয়', 'COUNT(*) ভুল', 'city দুবার লাগবে'], answer: 1, explain: 'একটি শহরে অনেক name — কোনটা দেখাবে? তাই এটা স্ট্যান্ডার্ড SQL-এ ভুল।' }
  ]
},

{
  id: 'exec-order', section: 'agg', title: 'কুয়েরি কীভাবে চলে (Execution Order)',
  summary: 'আমরা যে ক্রমে লিখি, ডেটাবেস সে ক্রমে চালায় না',
  tables: ['cities', 'students', 'departments'],
  content: `
<p>এখন তুমি একটা পূর্ণাঙ্গ SELECT কুয়েরির সব অংশ জানো:</p>
<pre class="syntax">SELECT DISTINCT কলাম, AGG(কলাম)
FROM টেবিল
JOIN অন্য_টেবিল ON ...
WHERE শর্ত
GROUP BY কলাম
HAVING গ্রুপ_শর্ত
ORDER BY কলাম
LIMIT n OFFSET m;</pre>
<p>কিন্তু ডেটাবেস এটা <b>উপর থেকে নিচে চালায় না</b>। আসল ক্রম:</p>
<ol class="steps">
  <li><b>FROM ও JOIN</b> — কোন টেবিল থেকে ডেটা আসবে, প্রথমে সব জোড়া লাগানো হয়।</li>
  <li><b>WHERE</b> — প্রতিটি রো-তে শর্ত পরীক্ষা, বাকিগুলো বাদ।</li>
  <li><b>GROUP BY</b> — বাকি রোগুলো দলে ভাগ।</li>
  <li><b>HAVING</b> — দলগুলোর উপর শর্ত।</li>
  <li><b>SELECT</b> — কোন কলাম/এক্সপ্রেশন দেখাবে, alias তৈরি।</li>
  <li><b>DISTINCT</b> — ডুপ্লিকেট বাদ।</li>
  <li><b>ORDER BY</b> — সাজানো।</li>
  <li><b>LIMIT / OFFSET</b> — নির্দিষ্ট সংখ্যক রো।</li>
</ol>
<h2>এটা জানা কেন জরুরি?</h2>
<ul>
  <li><b>WHERE-এ SELECT-এর alias ব্যবহার করা যায় না</b> (স্ট্যান্ডার্ড SQL-এ), কারণ WHERE চলে SELECT-এর আগে। কিন্তু ORDER BY-তে যায়, কারণ সেটা পরে চলে।</li>
  <li><b>WHERE-এ COUNT/SUM চলে না</b>, কারণ তখনও গ্রুপ তৈরিই হয়নি — তাই HAVING।</li>
  <li><b>LIMIT সবার শেষে</b> — তাই ORDER BY ছাড়া LIMIT দিলে কোন রো আসবে বলা যায় না।</li>
</ul>
<pre class="ex">-- ORDER BY-তে alias চলে
SELECT division, SUM(population) AS total
FROM cities
GROUP BY division
HAVING SUM(population) > 5000000
ORDER BY total DESC;</pre>
<div class="callout info"><b>জানো কি?</b> SQLite ও MySQL কিছু ক্ষেত্রে WHERE-এ alias মেনে নেয়, কিন্তু PostgreSQL, SQL Server নেয় না। পোর্টেবল কোড লিখতে স্ট্যান্ডার্ড নিয়ম মেনে চলো।</div>
`,
  exercises: [
    { task: 'প্রতিটি বিভাগের (<code>division</code>) মোট জনসংখ্যা দেখাও — শুধু যাদের মোট <b>৫০ লক্ষের (5000000) বেশি</b>, বড় থেকে ছোট।', solution: 'SELECT division, SUM(population) AS total FROM cities GROUP BY division HAVING SUM(population) > 5000000 ORDER BY total DESC;', hint: 'GROUP BY division HAVING SUM(population) > 5000000 ORDER BY ... DESC', ordered: true },
    { task: 'গড় CGPA অনুযায়ী সেরা <b>২টি</b> বিভাগের নাম ও গড় CGPA (২ দশমিক) দেখাও।', solution: 'SELECT d.name, ROUND(AVG(s.cgpa), 2) AS avg_cgpa FROM students s JOIN departments d ON s.dept_id = d.id GROUP BY d.name ORDER BY avg_cgpa DESC LIMIT 2;', hint: 'JOIN → GROUP BY d.name → ORDER BY avg DESC → LIMIT 2', ordered: true }
  ],
  quiz: [
    { q: 'কোনটি সবার আগে চলে?', options: ['SELECT', 'WHERE', 'FROM / JOIN', 'ORDER BY'], answer: 2, explain: 'প্রথমে ডেটার উৎস (FROM/JOIN) ঠিক হয়।' },
    { q: 'ORDER BY-তে SELECT-এর alias ব্যবহার করা যায় কেন?', options: ['ORDER BY SELECT-এর পরে চলে', 'ORDER BY আগে চলে', 'সব ক্লজে alias চলে', 'যায় না'], answer: 0, explain: 'SELECT-এ alias তৈরি হয়, তারপর ORDER BY চলে।' },
    { q: 'HAVING কোনটির পরে চলে?', options: ['ORDER BY', 'GROUP BY', 'SELECT', 'LIMIT'], answer: 1, explain: 'FROM → WHERE → GROUP BY → HAVING → SELECT → ...' }
  ]
},

// ───────────────────────────────── অ্যাডভান্সড
{
  id: 'case', section: 'adv', title: 'CASE — শর্তসাপেক্ষ মান',
  summary: 'SQL-এর if-else: শ্রেণিবিভাগ ও শর্তসাপেক্ষ গণনা',
  tables: ['students', 'products'],
  content: `
<p>প্রোগ্রামিংয়ে যেমন <code>if-else</code>, SQL-এ তেমনি <code>CASE</code>। এটা দিয়ে শর্ত অনুযায়ী আলাদা মান দেখানো যায়।</p>
<pre class="syntax">CASE
  WHEN শর্ত১ THEN মান১
  WHEN শর্ত২ THEN মান২
  ELSE অন্য_মান
END</pre>
<p>শর্তগুলো উপর থেকে পরীক্ষা হয় — প্রথম যেটা সত্য, তার মান নেয়, বাকিগুলো আর দেখে না। <code>ELSE</code> না দিলে কোনো শর্ত না মিললে NULL।</p>
<pre class="ex">SELECT name, cgpa,
  CASE
    WHEN cgpa >= 3.75 THEN 'Excellent'
    WHEN cgpa >= 3.25 THEN 'Good'
    ELSE 'Average'
  END AS grade
FROM students;</pre>

<h2>শর্তসাপেক্ষ গণনা (Conditional Aggregation)</h2>
<p>CASE-কে SUM/COUNT-এর ভেতরে রাখলে এক কুয়েরিতেই একাধিক হিসাব — রিপোর্টে খুব কাজের:</p>
<pre class="ex">SELECT
  SUM(CASE WHEN cgpa >= 3.5 THEN 1 ELSE 0 END) AS high,
  SUM(CASE WHEN cgpa < 3.5 THEN 1 ELSE 0 END) AS low
FROM students;</pre>
<pre class="ex">-- প্রতিটি ভর্তির বছরে ঢাকা ও ঢাকার বাইরের ছাত্র সংখ্যা
SELECT admission_year,
  SUM(CASE WHEN city = 'Dhaka' THEN 1 ELSE 0 END) AS dhaka,
  SUM(CASE WHEN city != 'Dhaka' THEN 1 ELSE 0 END) AS outside
FROM students
GROUP BY admission_year;</pre>

<h2>সংক্ষিপ্ত রূপ</h2>
<p>একটি কলামের সাথে সরাসরি মিলালে:</p>
<pre class="ex">SELECT name,
  CASE dept_id WHEN 1 THEN 'CSE' WHEN 2 THEN 'EEE' ELSE 'Other' END AS dept
FROM students;</pre>
`,
  exercises: [
    { task: 'প্রতিটি ছাত্রের <code>name</code>, <code>cgpa</code> ও গ্রেড দেখাও: CGPA ≥ 3.75 হলে <code>\'Excellent\'</code>, ≥ 3.25 হলে <code>\'Good\'</code>, বাকিরা <code>\'Average\'</code>।', solution: "SELECT name, cgpa, CASE WHEN cgpa >= 3.75 THEN 'Excellent' WHEN cgpa >= 3.25 THEN 'Good' ELSE 'Average' END FROM students;", hint: 'CASE WHEN ... THEN ... WHEN ... THEN ... ELSE ... END' },
    { task: 'প্রতিটি পণ্যের <code>name</code> ও স্ট্যাটাস দেখাও: স্টক 0 হলে <code>\'Out of stock\'</code>, না হলে <code>\'In stock\'</code>।', solution: "SELECT name, CASE WHEN stock = 0 THEN 'Out of stock' ELSE 'In stock' END FROM products;", hint: "CASE WHEN stock = 0 THEN 'Out of stock' ELSE 'In stock' END" },
    { task: 'একটি রো-তে দেখাও: CGPA <b>3.5 বা বেশি</b> কতজন, আর <b>3.5-এর কম</b> কতজন (দুটি কলাম)।', solution: 'SELECT SUM(CASE WHEN cgpa >= 3.5 THEN 1 ELSE 0 END), SUM(CASE WHEN cgpa < 3.5 THEN 1 ELSE 0 END) FROM students;', hint: 'SUM(CASE WHEN ... THEN 1 ELSE 0 END)' }
  ],
  quiz: [
    { q: 'CASE-এ কোনো WHEN না মিললে এবং ELSE না থাকলে ফল কী?', options: ['0', 'এরর', 'NULL', 'খালি স্ট্রিং'], answer: 2, explain: 'ELSE না থাকলে NULL।' },
    { q: 'cgpa = 3.9 হলে: CASE WHEN cgpa >= 3.0 THEN \'A\' WHEN cgpa >= 3.75 THEN \'B\' END — ফল?', options: ["'A'", "'B'", "দুটোই", 'NULL'], answer: 0, explain: 'প্রথম সত্য শর্তেই থেমে যায়। তাই বড় সীমা আগে লিখতে হয়।' },
    { q: 'CASE স্টেটমেন্ট কোন শব্দ দিয়ে শেষ হয়?', options: ['STOP', 'END', 'ENDCASE', 'DONE'], answer: 1, explain: 'CASE ... END' }
  ]
},

{
  id: 'subqueries', section: 'adv', title: 'সাবকুয়েরি (Subquery)',
  summary: 'কুয়েরির ভেতরে কুয়েরি — IN, EXISTS, correlated subquery',
  tables: ['students', 'products', 'orders', 'employees', 'courses', 'enrollments'],
  content: `
<p>সাবকুয়েরি মানে একটি কুয়েরির ভেতরে আরেকটি কুয়েরি। ভেতরেরটা আগে চলে, তার ফল বাইরেরটা ব্যবহার করে।</p>
<h2>১. একটি মান ফেরত দেয় (Scalar Subquery)</h2>
<p>"গড় CGPA-র চেয়ে বেশি পেয়েছে কারা?" — গড়টা আগে জানতে হবে:</p>
<pre class="ex">SELECT name, cgpa
FROM students
WHERE cgpa > (SELECT AVG(cgpa) FROM students);</pre>
<pre class="ex">-- সবচেয়ে বেশি বেতন কার?
SELECT name, salary
FROM employees
WHERE salary = (SELECT MAX(salary) FROM employees);</pre>

<h2>২. একটি তালিকা ফেরত দেয় (IN / NOT IN)</h2>
<pre class="ex">-- যেসব পণ্য কেউ কখনো অর্ডার করেনি
SELECT name FROM products
WHERE id NOT IN (SELECT product_id FROM orders);</pre>

<h2>৩. Correlated Subquery</h2>
<p>ভেতরের কুয়েরি বাইরের কুয়েরির প্রতিটি রো-র উপর নির্ভর করে — প্রতিটি রো-র জন্য আলাদাভাবে চলে।</p>
<pre class="ex">-- নিজ বিভাগের গড়ের চেয়ে বেশি বেতন পান যারা
SELECT e.name, e.dept_id, e.salary
FROM employees e
WHERE e.salary > (
  SELECT AVG(e2.salary) FROM employees e2
  WHERE e2.dept_id = e.dept_id
);</pre>

<h2>৪. EXISTS</h2>
<p><code>EXISTS</code> শুধু দেখে সাবকুয়েরি কোনো রো ফেরত দেয় কিনা — বড় ডেটায় প্রায়ই <code>IN</code>-এর চেয়ে দ্রুত।</p>
<pre class="ex">-- যেসব ছাত্র অন্তত একটি কোর্সে ৯০+ পেয়েছে
SELECT name FROM students s
WHERE EXISTS (
  SELECT 1 FROM enrollments e
  WHERE e.student_id = s.id AND e.marks >= 90
);</pre>

<h2>৫. FROM-এ সাবকুয়েরি (Derived Table)</h2>
<pre class="ex">SELECT dept_id, avg_cgpa
FROM (
  SELECT dept_id, AVG(cgpa) AS avg_cgpa
  FROM students GROUP BY dept_id
) AS t
WHERE avg_cgpa > 3.4;</pre>
<div class="callout tip"><b>টিপস:</b> অনেক সাবকুয়েরি JOIN দিয়েও লেখা যায়। যেটা পড়তে সহজ সেটা বেছে নাও। জটিল হলে পরের লেসনের <b>CTE</b> ব্যবহার করো।</div>
`,
  exercises: [
    { task: 'যাদের CGPA <b>গড় CGPA-র চেয়ে বেশি</b>, তাদের <code>name</code> ও <code>cgpa</code> দেখাও।', solution: 'SELECT name, cgpa FROM students WHERE cgpa > (SELECT AVG(cgpa) FROM students);', hint: 'WHERE cgpa > (SELECT AVG(cgpa) FROM students)' },
    { task: 'যেসব পণ্য <b>কখনো অর্ডার হয়নি</b>, তাদের <code>name</code> দেখাও।', solution: 'SELECT name FROM products WHERE id NOT IN (SELECT product_id FROM orders);', hint: 'NOT IN (SELECT product_id FROM orders)' },
    { task: 'নিজ বিভাগে <b>সবচেয়ে বেশি বেতন</b> পান এমন কর্মচারীদের <code>name, dept_id, salary</code> দেখাও।', solution: 'SELECT name, dept_id, salary FROM employees e WHERE salary = (SELECT MAX(salary) FROM employees e2 WHERE e2.dept_id = e.dept_id);', hint: 'Correlated: WHERE salary = (SELECT MAX(salary) ... WHERE e2.dept_id = e.dept_id)' },
    { task: 'যেসব ছাত্র <b>CSE বিভাগের (dept_id = 1) কোনো কোর্সে</b> ভর্তি হয়েছে, তাদের <code>name</code> দেখাও (প্রত্যেকে একবার)।', solution: 'SELECT name FROM students WHERE id IN (SELECT student_id FROM enrollments WHERE course_id IN (SELECT id FROM courses WHERE dept_id = 1));', hint: 'দুই স্তরের IN সাবকুয়েরি: courses → enrollments → students' }
  ],
  quiz: [
    { q: 'Correlated subquery-র বৈশিষ্ট্য কী?', options: ['একবারই চলে', 'বাইরের কুয়েরির প্রতিটি রো-র জন্য চলে', 'শুধু FROM-এ ব্যবহার হয়', 'JOIN ছাড়া চলে না'], answer: 1, explain: 'বাইরের কুয়েরির কলাম ব্যবহার করে বলে প্রতিটি রো-র জন্য আলাদাভাবে মূল্যায়ন হয়।' },
    { q: 'WHERE x = (SELECT ...) — সাবকুয়েরি একাধিক রো দিলে কী হয়?', options: ['সব মিলিয়ে দেখে', 'এরর (বা শুধু প্রথম রো ব্যবহার)', 'খালি', 'IN-এর মতো কাজ করে'], answer: 1, explain: '= এর জন্য একটি মান লাগে। একাধিক মানের জন্য IN ব্যবহার করো। (SQLite চুপচাপ প্রথম রো নেয়, অন্যরা এরর দেয়।)' },
    { q: 'EXISTS কী পরীক্ষা করে?', options: ['মান সমান কিনা', 'সাবকুয়েরি অন্তত একটি রো দেয় কিনা', 'NULL কিনা', 'টেবিল আছে কিনা'], answer: 1, explain: 'অন্তত একটি রো থাকলেই TRUE।' }
  ]
},

{
  id: 'set-ops', section: 'adv', title: 'UNION, INTERSECT, EXCEPT',
  summary: 'একাধিক কুয়েরির ফলাফল একত্রিত বা তুলনা করা',
  tables: ['students', 'orders', 'employees'],
  content: `
<p>JOIN টেবিলগুলোকে <b>পাশাপাশি</b> জোড়ে (কলাম বাড়ে)। আর Set অপারেশন দুই কুয়েরির ফলাফলকে <b>উপর-নিচে</b> জোড়ে বা তুলনা করে (রো নিয়ে কাজ)।</p>
<table class="demo-table">
  <tr><th>অপারেটর</th><th>কাজ</th></tr>
  <tr><td><code>UNION</code></td><td>দুটোর সব রো, ডুপ্লিকেট বাদ</td></tr>
  <tr><td><code>UNION ALL</code></td><td>দুটোর সব রো, ডুপ্লিকেটসহ (দ্রুততর)</td></tr>
  <tr><td><code>INTERSECT</code></td><td>যেগুলো দুটোতেই আছে</td></tr>
  <tr><td><code>EXCEPT</code></td><td>প্রথমটায় আছে কিন্তু দ্বিতীয়টায় নেই (Oracle-এ <code>MINUS</code>)</td></tr>
</table>
<div class="callout warn"><b>নিয়ম:</b> দুই কুয়েরিতে <b>কলাম সংখ্যা সমান</b> হতে হবে এবং ডেটা টাইপ মানানসই হতে হবে। ORDER BY থাকলে শুধু একদম শেষে একবার।</div>
<pre class="ex">-- ছাত্র ও ক্রেতা — সবার শহর (ইউনিক)
SELECT city FROM students
UNION
SELECT city FROM orders
ORDER BY city;</pre>
<pre class="ex">-- যেসব শহরে ছাত্রও আছে, অর্ডারও এসেছে
SELECT city FROM students
INTERSECT
SELECT city FROM orders;</pre>
<pre class="ex">-- ছাত্র আছে কিন্তু কোনো অর্ডার আসেনি এমন শহর
SELECT city FROM students
EXCEPT
SELECT city FROM orders;</pre>
<pre class="ex">-- ছাত্র ও কর্মচারী মিলিয়ে সবার তালিকা, কে কী তা চিহ্নিত করে
SELECT name, 'Student' AS type FROM students
UNION ALL
SELECT name, 'Employee' FROM employees;</pre>
`,
  exercises: [
    { task: 'ছাত্রদের শহর ও অর্ডারের শহর মিলিয়ে সব <b>ইউনিক</b> শহরের তালিকা দেখাও।', solution: 'SELECT city FROM students UNION SELECT city FROM orders;', hint: 'UNION' },
    { task: 'যেসব শহর ছাত্রদের তালিকায় <b>এবং</b> অর্ডারের তালিকায় — দুটোতেই আছে।', solution: 'SELECT city FROM students INTERSECT SELECT city FROM orders;', hint: 'INTERSECT' },
    { task: 'যেসব শহর থেকে অর্ডার এসেছে কিন্তু <b>কোনো ছাত্র নেই</b>।', solution: 'SELECT city FROM orders EXCEPT SELECT city FROM students;', hint: 'orders আগে, তারপর EXCEPT students' },
    { task: 'ছাত্র ও কর্মচারী — সবার <code>name</code> একটি কলামে, ডুপ্লিকেটসহ (UNION ALL)।', solution: 'SELECT name FROM students UNION ALL SELECT name FROM employees;', hint: 'UNION ALL' }
  ],
  quiz: [
    { q: 'UNION ও UNION ALL-এর পার্থক্য?', options: ['কোনো পার্থক্য নেই', 'UNION ডুপ্লিকেট বাদ দেয়, UNION ALL দেয় না', 'UNION ALL ডুপ্লিকেট বাদ দেয়', 'UNION শুধু দুটি টেবিলের জন্য'], answer: 1, explain: 'ডুপ্লিকেট বাদ দেওয়া খরচসাপেক্ষ — তাই দরকার না হলে UNION ALL দ্রুত।' },
    { q: 'SELECT a, b ... UNION SELECT c ... — কী হবে?', options: ['কাজ করবে', 'এরর: কলাম সংখ্যা মেলে না', 'b NULL হবে', 'c দুবার আসবে'], answer: 1, explain: 'দুই পাশে কলাম সংখ্যা সমান হতে হবে।' },
    { q: 'JOIN আর UNION-এর মূল পার্থক্য?', options: ['JOIN কলাম জোড়ে (পাশাপাশি), UNION রো জোড়ে (উপর-নিচে)', 'একই জিনিস', 'UNION কলাম জোড়ে', 'JOIN শুধু দুটি টেবিলে'], answer: 0, explain: 'JOIN = horizontal, UNION = vertical।' }
  ]
},

{
  id: 'cte', section: 'adv', title: 'CTE — WITH ক্লজ',
  summary: 'জটিল কুয়েরিকে নামযুক্ত ধাপে ভাগ করা, Recursive CTE',
  tables: ['students', 'departments', 'employees'],
  content: `
<p><b>CTE (Common Table Expression)</b> হলো কুয়েরির শুরুতে একটি অস্থায়ী, নামযুক্ত ফলাফল তৈরি করা — যেটা পরে টেবিলের মতো ব্যবহার করা যায়। জটিল সাবকুয়েরিকে পড়তে সহজ করে।</p>
<pre class="syntax">WITH নাম AS (
  SELECT ...
)
SELECT ... FROM নাম;</pre>
<pre class="ex">WITH dept_avg AS (
  SELECT dept_id, ROUND(AVG(cgpa), 2) AS avg_cgpa
  FROM students
  GROUP BY dept_id
)
SELECT d.name, a.avg_cgpa
FROM dept_avg a
JOIN departments d ON d.id = a.dept_id
ORDER BY a.avg_cgpa DESC;</pre>

<h2>একাধিক CTE</h2>
<p>কমা দিয়ে একাধিক CTE লেখা যায়, পরেরটা আগেরটাকে ব্যবহার করতে পারে:</p>
<pre class="ex">WITH
  totals AS (SELECT division, SUM(population) AS pop FROM cities GROUP BY division),
  country AS (SELECT SUM(pop) AS all_pop FROM totals)
SELECT division, pop,
       ROUND(pop * 100.0 / all_pop, 1) AS percent
FROM totals, country
ORDER BY pop DESC;</pre>

<h2>Recursive CTE</h2>
<p>CTE নিজেকে নিজে ডাকতে পারে — গাছের মতো গঠন (ম্যানেজার → কর্মচারী, ক্যাটাগরি → সাব-ক্যাটাগরি) বা সংখ্যার সিরিজ তৈরিতে কাজে লাগে।</p>
<pre class="ex">-- ১ থেকে ১০ পর্যন্ত সংখ্যা
WITH RECURSIVE nums(n) AS (
  SELECT 1                       -- শুরুর মান (anchor)
  UNION ALL
  SELECT n + 1 FROM nums WHERE n < 10   -- পুনরাবৃত্তি
)
SELECT n FROM nums;</pre>
<pre class="ex">-- প্রতিটি কর্মচারী ও তার ম্যানেজার শৃঙ্খলের স্তর
WITH RECURSIVE chain AS (
  SELECT id, name, manager_id, 0 AS level
  FROM employees WHERE manager_id IS NULL
  UNION ALL
  SELECT e.id, e.name, e.manager_id, c.level + 1
  FROM employees e JOIN chain c ON e.manager_id = c.id
)
SELECT name, level FROM chain ORDER BY level, name;</pre>
`,
  exercises: [
    { task: 'একটি CTE দিয়ে প্রতিটি <code>dept_id</code>-এর গড় CGPA বের করো, তারপর শুধু যাদের গড় <b>3.4-এর বেশি</b> সেই <code>dept_id</code> ও গড় দেখাও।', solution: 'WITH a AS (SELECT dept_id, AVG(cgpa) AS avg_cgpa FROM students GROUP BY dept_id) SELECT dept_id, avg_cgpa FROM a WHERE avg_cgpa > 3.4;', hint: 'WITH a AS (SELECT dept_id, AVG(cgpa) AS avg_cgpa ... GROUP BY dept_id) SELECT ... WHERE avg_cgpa > 3.4' },
    { task: 'Recursive CTE দিয়ে <b>১ থেকে ১০</b> পর্যন্ত সংখ্যা ক্রমানুসারে দেখাও।', solution: 'WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM n WHERE x < 10) SELECT x FROM n;', hint: 'WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x < 10)', ordered: true },
    { task: '<b>Dr. Abdul Karim</b> (id = 1)-এর অধীনে (সরাসরি বা পরোক্ষভাবে) যারা কাজ করে তাদের <code>name</code> দেখাও।', solution: 'WITH RECURSIVE sub AS (SELECT id, name FROM employees WHERE manager_id = 1 UNION ALL SELECT e.id, e.name FROM employees e JOIN sub ON e.manager_id = sub.id) SELECT name FROM sub;', hint: 'শুরু: manager_id = 1, তারপর JOIN sub ON e.manager_id = sub.id' }
  ],
  quiz: [
    { q: 'CTE লিখতে কোন কিওয়ার্ড ব্যবহার হয়?', options: ['WITH', 'TEMP', 'DEFINE', 'LET'], answer: 0, explain: 'WITH নাম AS (...)' },
    { q: 'Recursive CTE-তে অসীম লুপ থামাতে কী দরকার?', options: ['LIMIT', 'WHERE দিয়ে থামার শর্ত', 'BREAK', 'কিছুই না'], answer: 1, explain: 'পুনরাবৃত্তি অংশে একটি শর্ত লাগে যেটা একসময় মিথ্যা হবে।' },
    { q: 'CTE-র প্রধান সুবিধা কী?', options: ['ডেটা স্থায়ীভাবে সেভ হয়', 'জটিল কুয়েরি পড়তে ও বুঝতে সহজ হয়', 'সবসময় দ্রুত চলে', 'ইনডেক্স তৈরি করে'], answer: 1, explain: 'CTE অস্থায়ী — শুধু ওই কুয়েরির জন্য। মূল সুবিধা readability।' }
  ]
},

{
  id: 'window', section: 'adv', title: 'উইন্ডো ফাংশন',
  summary: 'ROW_NUMBER, RANK, রানিং টোটাল, LAG/LEAD — রো না কমিয়ে হিসাব',
  tables: ['students', 'employees', 'orders'],
  content: `
<p><code>GROUP BY</code> অনেক রো-কে একটি রো-তে পরিণত করে। কিন্তু যদি প্রতিটি রো রাখতে চাই <b>এবং</b> পাশে গ্রুপের হিসাবও দেখাতে চাই? তখন <b>উইন্ডো ফাংশন</b>। ইন্টারভিউতে এটা খুব জনপ্রিয় টপিক!</p>
<pre class="syntax">ফাংশন() OVER (
  PARTITION BY কলাম   -- কোন দলে ভাগ (ঐচ্ছিক)
  ORDER BY কলাম       -- দলের ভেতরে ক্রম (ঐচ্ছিক)
)</pre>

<h2>র‍্যাংকিং ফাংশন</h2>
<table class="demo-table">
  <tr><th>ফাংশন</th><th>সমান মান হলে (যেমন 90, 90, 85)</th></tr>
  <tr><td><code>ROW_NUMBER()</code></td><td>1, 2, 3 — সবসময় আলাদা নম্বর</td></tr>
  <tr><td><code>RANK()</code></td><td>1, 1, 3 — সমানদের একই র‍্যাংক, পরেরটা লাফ দেয়</td></tr>
  <tr><td><code>DENSE_RANK()</code></td><td>1, 1, 2 — লাফ দেয় না</td></tr>
</table>
<pre class="ex">SELECT name, cgpa,
       RANK() OVER (ORDER BY cgpa DESC) AS position
FROM students;</pre>

<h2>PARTITION BY — দলের ভেতরে</h2>
<pre class="ex">-- প্রতিটি বিভাগে আলাদা র‍্যাংক
SELECT name, dept_id, cgpa,
       ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY cgpa DESC) AS rank_in_dept
FROM students;</pre>
<pre class="ex">-- প্রতিটি কর্মচারীর বেতন ও তার বিভাগের গড় বেতন — পাশাপাশি
SELECT name, dept_id, salary,
       AVG(salary) OVER (PARTITION BY dept_id) AS dept_avg
FROM employees;</pre>

<h2>রানিং টোটাল</h2>
<pre class="ex">SELECT id, order_date, quantity,
       SUM(quantity) OVER (ORDER BY order_date) AS running_total
FROM orders;</pre>

<h2>LAG ও LEAD — আগের/পরের রো</h2>
<pre class="ex">SELECT id, order_date, quantity,
       LAG(quantity) OVER (ORDER BY order_date) AS prev_qty,
       LEAD(quantity) OVER (ORDER BY order_date) AS next_qty
FROM orders;</pre>
<div class="callout tip"><b>ইন্টারভিউ ক্লাসিক:</b> "প্রতিটি বিভাগের সর্বোচ্চ বেতনের ২ জন" — ROW_NUMBER() OVER (PARTITION BY ...) একটি CTE-তে রেখে বাইরে <code>WHERE rn &lt;= 2</code>।</div>
<pre class="ex">WITH ranked AS (
  SELECT name, dept_id, salary,
         ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rn
  FROM employees
)
SELECT name, dept_id, salary FROM ranked WHERE rn <= 2;</pre>
`,
  exercises: [
    { task: 'প্রতিটি ছাত্রের <code>name</code>, <code>cgpa</code> ও CGPA অনুযায়ী <code>RANK()</code> দেখাও (বড় CGPA = র‍্যাংক ১), র‍্যাংক অনুযায়ী সাজিয়ে।', solution: 'SELECT name, cgpa, RANK() OVER (ORDER BY cgpa DESC) AS r FROM students ORDER BY r;', hint: 'RANK() OVER (ORDER BY cgpa DESC), তারপর ORDER BY সেই কলাম', ordered: true },
    { task: 'প্রতিটি ছাত্রের <code>name, dept_id</code> ও <b>নিজ বিভাগে</b> CGPA অনুযায়ী <code>ROW_NUMBER()</code> দেখাও।', solution: 'SELECT name, dept_id, ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY cgpa DESC) FROM students;', hint: 'PARTITION BY dept_id ORDER BY cgpa DESC' },
    { task: 'প্রতিটি কর্মচারীর <code>name, salary</code> ও তার বিভাগের গড় বেতন (<code>AVG ... OVER</code>) দেখাও।', solution: 'SELECT name, salary, AVG(salary) OVER (PARTITION BY dept_id) FROM employees;', hint: 'AVG(salary) OVER (PARTITION BY dept_id)' },
    { task: 'অর্ডারগুলোর <code>id, order_date, quantity</code> ও তারিখ অনুযায়ী <b>quantity-র রানিং টোটাল</b> দেখাও (তারিখ অনুযায়ী সাজিয়ে)।', solution: 'SELECT id, order_date, quantity, SUM(quantity) OVER (ORDER BY order_date) FROM orders ORDER BY order_date;', hint: 'SUM(quantity) OVER (ORDER BY order_date)', ordered: true }
  ],
  quiz: [
    { q: 'মান 90, 90, 85 হলে DENSE_RANK() কী দেবে?', options: ['1, 2, 3', '1, 1, 3', '1, 1, 2', '2, 2, 1'], answer: 2, explain: 'DENSE_RANK সমানদের একই র‍্যাংক দেয় এবং লাফ দেয় না।' },
    { q: 'উইন্ডো ফাংশন আর GROUP BY-এর মূল পার্থক্য?', options: ['উইন্ডো ফাংশন রো সংখ্যা কমায় না', 'GROUP BY দ্রুত', 'উইন্ডো ফাংশন শুধু SUM-এ চলে', 'কোনো পার্থক্য নেই'], answer: 0, explain: 'উইন্ডো ফাংশন প্রতিটি রো রেখে পাশে হিসাব যোগ করে।' },
    { q: 'আগের রো-র মান পেতে কোন ফাংশন?', options: ['LEAD', 'LAG', 'PREV', 'FIRST'], answer: 1, explain: 'LAG = আগের, LEAD = পরের।' }
  ]
},

// ───────────────────────────────── DML
{
  id: 'insert', section: 'dml', title: 'INSERT — নতুন ডেটা যোগ',
  summary: 'টেবিলে নতুন রো যোগ করা',
  tables: ['departments', 'students', 'products'],
  content: `
<p>এতক্ষণ আমরা শুধু ডেটা পড়েছি। এবার ডেটা লিখব! নতুন রো যোগ করতে <code>INSERT INTO</code>।</p>
<pre class="syntax">INSERT INTO টেবিল (কলাম১, কলাম২, ...)
VALUES (মান১, মান২, ...);</pre>
<pre class="ex">INSERT INTO departments (id, name, building, budget)
VALUES (7, 'Architecture', 'Building F', 2000000);

SELECT * FROM departments;</pre>
<div class="callout info"><b>চিন্তা নেই:</b> উদাহরণ ও অনুশীলন প্রতিবার নতুন ডেটাবেসে চলে, তাই তুমি যা-ই ইনসার্ট/ডিলিট করো, পরেরবার সব আগের মতো থাকবে। স্থায়ী পরিবর্তন নিয়ে খেলতে <b>প্লেগ্রাউন্ড</b> ব্যবহার করো।</div>

<h2>কিছু কলাম বাদ দিয়ে</h2>
<p>যে কলামের মান দিচ্ছ না, সেখানে <code>NULL</code> বা ডিফল্ট মান বসবে। <code>INTEGER PRIMARY KEY</code> কলাম বাদ দিলে SQLite নিজেই পরের id দেয়।</p>
<pre class="ex">INSERT INTO students (name, dept_id, city, cgpa, admission_year)
VALUES ('Nadia Rahman', 1, 'Dhaka', 3.65, 2024);

SELECT * FROM students ORDER BY id DESC LIMIT 3;</pre>

<h2>একসাথে একাধিক রো</h2>
<pre class="ex">INSERT INTO products (name, category, price, stock) VALUES
  ('Mango 1kg', 'Grocery', 150, 300),
  ('Umbrella', 'Accessories', 550, 45);

SELECT * FROM products;</pre>

<h2>অন্য কুয়েরি থেকে INSERT</h2>
<pre class="ex">CREATE TABLE toppers (name TEXT, cgpa REAL);
INSERT INTO toppers (name, cgpa)
SELECT name, cgpa FROM students WHERE cgpa >= 3.8;
SELECT * FROM toppers;</pre>
<div class="callout tip"><b>ভালো অভ্যাস:</b> সবসময় কলামের নাম উল্লেখ করে INSERT লেখো। <code>INSERT INTO t VALUES (...)</code> কলামের ক্রমের উপর নির্ভর করে — টেবিলে পরে কলাম যোগ হলে কোড ভেঙে যাবে।</div>
`,
  exercises: [
    { task: '<code>departments</code> টেবিলে নতুন বিভাগ যোগ করো: id = <b>7</b>, name = <b>\'Architecture\'</b>, building = <b>\'Building F\'</b>, budget = <b>2000000</b>।', solution: "INSERT INTO departments (id, name, building, budget) VALUES (7, 'Architecture', 'Building F', 2000000);", check: 'SELECT * FROM departments ORDER BY id;', hint: 'INSERT INTO departments (id, name, building, budget) VALUES (...)' },
    { task: 'নতুন ছাত্র যোগ করো: id <b>17</b>, name <b>\'Nadia Rahman\'</b>, dept_id <b>1</b>, city <b>\'Dhaka\'</b>, cgpa <b>3.65</b>, admission_year <b>2024</b> (ইমেইল নেই)।', solution: "INSERT INTO students (id, name, dept_id, city, cgpa, admission_year) VALUES (17, 'Nadia Rahman', 1, 'Dhaka', 3.65, 2024);", check: 'SELECT * FROM students ORDER BY id;', hint: 'email কলাম বাদ দাও — NULL বসবে।' },
    { task: '<b>একটি INSERT</b> দিয়ে দুটি পণ্য যোগ করো: (12, \'Mango 1kg\', \'Grocery\', 150, 300) এবং (13, \'Umbrella\', \'Accessories\', 550, 45) — কলাম ক্রম: id, name, category, price, stock।', solution: "INSERT INTO products (id, name, category, price, stock) VALUES (12, 'Mango 1kg', 'Grocery', 150, 300), (13, 'Umbrella', 'Accessories', 550, 45);", check: 'SELECT * FROM products ORDER BY id;', hint: 'VALUES (...), (...)' }
  ],
  quiz: [
    { q: 'INSERT-এ কোনো কলামের মান না দিলে কী হয়?', options: ['এরর সবসময়', 'NULL বা DEFAULT মান বসে (NOT NULL হলে এরর)', '0 বসে', 'রো যোগ হয় না'], answer: 1, explain: 'কনস্ট্রেইন্ট না থাকলে NULL বা ডিফল্ট মান বসে।' },
    { q: 'একাধিক রো একসাথে ইনসার্ট করতে কী লিখতে হয়?', options: ['একাধিক INSERT লাগবেই', 'VALUES (...), (...), (...)', 'INSERT MANY', 'VALUES [(...)]'], answer: 1, explain: 'কমা দিয়ে আলাদা করে একাধিক টাপল।' },
    { q: 'কেন INSERT-এ কলামের নাম লেখা ভালো অভ্যাস?', options: ['দ্রুত চলে', 'টেবিলের গঠন বদলালেও কোড ঠিক থাকে', 'বাধ্যতামূলক', 'NULL এড়াতে'], answer: 1, explain: 'কলামের ক্রমের উপর নির্ভরতা থাকে না।' }
  ]
},

{
  id: 'update', section: 'dml', title: 'UPDATE — ডেটা পরিবর্তন',
  summary: 'বিদ্যমান রো-র মান বদলানো',
  tables: ['employees', 'students', 'products'],
  content: `
<p>বিদ্যমান ডেটা বদলাতে <code>UPDATE</code>:</p>
<pre class="syntax">UPDATE টেবিল
SET কলাম১ = মান১, কলাম২ = মান২
WHERE শর্ত;</pre>
<pre class="ex">UPDATE students
SET email = 'nusrat@uni.edu'
WHERE id = 4;

SELECT * FROM students WHERE id = 4;</pre>

<div class="callout danger"><b>⚠️ সবচেয়ে বিপজ্জনক ভুল:</b> <code>WHERE</code> ভুলে গেলে <b>টেবিলের সব রো</b> বদলে যাবে! <code>UPDATE employees SET salary = 0;</code> — সবার বেতন শূন্য! বাস্তবে UPDATE চালানোর আগে একই WHERE দিয়ে একটা <code>SELECT</code> চালিয়ে দেখে নাও কোন রোগুলো বদলাবে।</div>

<h2>পুরনো মানের উপর ভিত্তি করে</h2>
<pre class="ex">-- সব লেকচারারের বেতন ১০% বাড়াও
UPDATE employees
SET salary = salary * 1.10
WHERE role = 'Lecturer';

SELECT name, role, salary FROM employees;</pre>

<h2>একাধিক কলাম একসাথে</h2>
<pre class="ex">UPDATE products
SET stock = 50, price = 1300
WHERE name = 'Hilsa Fish';

SELECT * FROM products WHERE name = 'Hilsa Fish';</pre>
<h2>সাবকুয়েরি দিয়ে UPDATE</h2>
<pre class="ex">-- CSE বিভাগের সব কর্মচারীর বেতন ৫০০০ বাড়াও
UPDATE employees
SET salary = salary + 5000
WHERE dept_id = (SELECT id FROM departments WHERE name = 'CSE');
SELECT name, dept_id, salary FROM employees;</pre>
`,
  exercises: [
    { task: 'সব <b>Lecturer</b>-এর বেতন <b>১০%</b> বাড়াও।', solution: "UPDATE employees SET salary = salary * 1.10 WHERE role = 'Lecturer';", check: 'SELECT id, salary FROM employees ORDER BY id;', hint: "SET salary = salary * 1.10 WHERE role = 'Lecturer'" },
    { task: 'id = <b>4</b> ছাত্রের (Nusrat) ইমেইল <b>\'nusrat@uni.edu\'</b> সেট করো।', solution: "UPDATE students SET email = 'nusrat@uni.edu' WHERE id = 4;", check: 'SELECT id, email FROM students ORDER BY id;', hint: 'WHERE id = 4 ভুলো না!' },
    { task: '<b>Hilsa Fish</b>-এর stock <b>50</b> এবং price <b>1300</b> করো।', solution: "UPDATE products SET stock = 50, price = 1300 WHERE name = 'Hilsa Fish';", check: 'SELECT * FROM products ORDER BY id;', hint: 'SET stock = 50, price = 1300' }
  ],
  quiz: [
    { q: 'UPDATE-এ WHERE না দিলে কী হয়?', options: ['এরর', 'কিছুই হয় না', 'টেবিলের সব রো আপডেট হয়', 'শুধু প্রথম রো'], answer: 2, explain: 'এটা বাস্তবে বড় দুর্ঘটনার কারণ। সাবধান!' },
    { q: 'UPDATE চালানোর আগে নিরাপদ অভ্যাস কী?', options: ['একই WHERE দিয়ে SELECT চালিয়ে দেখা', 'টেবিল ড্রপ করা', 'কিছু না', 'ইনডেক্স বানানো'], answer: 0, explain: 'প্রথমে SELECT দিয়ে যাচাই, তারপর UPDATE — এবং সম্ভব হলে ট্রানজ্যাকশনে।' },
    { q: 'একাধিক কলাম আপডেট করতে কী দিয়ে আলাদা করবে?', options: ['AND', 'কমা (,)', 'সেমিকোলন', 'SET আবার লিখে'], answer: 1, explain: 'SET a = 1, b = 2' }
  ]
},

{
  id: 'delete', section: 'dml', title: 'DELETE — ডেটা মুছে ফেলা',
  summary: 'রো মুছে ফেলা ও নিরাপদে কাজ করা',
  tables: ['orders', 'products', 'students'],
  content: `
<p>রো মুছতে <code>DELETE FROM</code>:</p>
<pre class="syntax">DELETE FROM টেবিল
WHERE শর্ত;</pre>
<pre class="ex">DELETE FROM orders
WHERE status = 'Cancelled';

SELECT * FROM orders;</pre>
<div class="callout danger"><b>⚠️ আবারও:</b> <code>DELETE FROM orders;</code> (WHERE ছাড়া) টেবিলের <b>সব রো</b> মুছে দেবে। টেবিল থাকবে, কিন্তু খালি। আগে SELECT দিয়ে যাচাই করো!</div>

<h2>একাধিক শর্ত ও সাবকুয়েরি</h2>
<pre class="ex">-- ২০২৩-এ ভর্তি এবং CGPA 3.2-এর কম
DELETE FROM students
WHERE admission_year = 2023 AND cgpa < 3.2;
SELECT name, admission_year, cgpa FROM students;</pre>
<pre class="ex">-- যেসব পণ্যের কোনো অর্ডার নেই সেগুলো মুছে ফেলো
DELETE FROM products
WHERE id NOT IN (SELECT product_id FROM orders);
SELECT * FROM products;</pre>

<h2>Soft Delete — বাস্তব প্রজেক্টের কৌশল</h2>
<p>অনেক অ্যাপ আসলে ডেটা মোছে না। বরং <code>is_deleted</code> বা <code>deleted_at</code> কলাম রাখে এবং <code>UPDATE ... SET is_deleted = 1</code> করে। এতে ভুল করে মুছলেও ফিরিয়ে আনা যায়, আর হিসাবের ইতিহাস থাকে।</p>
<div class="callout info"><b>জানো কি?</b> ফরেন কি-তে <code>ON DELETE CASCADE</code> দেওয়া থাকলে, প্যারেন্ট রো মুছলে সংশ্লিষ্ট চাইল্ড রোগুলোও স্বয়ংক্রিয়ভাবে মুছে যায়।</div>
`,
  exercises: [
    { task: '<b>Cancelled</b> স্ট্যাটাসের সব অর্ডার মুছে ফেলো।', solution: "DELETE FROM orders WHERE status = 'Cancelled';", check: 'SELECT * FROM orders ORDER BY id;', hint: "WHERE status = 'Cancelled'" },
    { task: 'যেসব পণ্যের স্টক <b>0</b>, সেগুলো মুছে ফেলো।', solution: 'DELETE FROM products WHERE stock = 0;', check: 'SELECT * FROM products ORDER BY id;', hint: 'WHERE stock = 0' },
    { task: '<b>২০২৩</b>-এ ভর্তি হওয়া এবং CGPA <b>3.2-এর কম</b> এমন ছাত্রদের মুছে ফেলো।', solution: 'DELETE FROM students WHERE admission_year = 2023 AND cgpa < 3.2;', check: 'SELECT * FROM students ORDER BY id;', hint: 'দুটো শর্ত AND দিয়ে' }
  ],
  quiz: [
    { q: 'DELETE FROM students; চালালে কী হবে?', options: ['টেবিলটাই মুছে যাবে', 'সব রো মুছবে, টেবিল খালি থাকবে', 'এরর', 'প্রথম রো মুছবে'], answer: 1, explain: 'DELETE রো মোছে; টেবিল মুছতে DROP TABLE লাগে।' },
    { q: 'Soft delete কী?', options: ['ধীরে ধীরে মোছা', 'একটি ফ্ল্যাগ কলাম দিয়ে "মোছা" চিহ্নিত করা, আসলে না মোছা', 'ব্যাকআপ রাখা', 'ইনডেক্স মোছা'], answer: 1, explain: 'is_deleted = 1 — ডেটা থেকে যায়, শুধু লুকানো হয়।' },
    { q: 'ON DELETE CASCADE কী করে?', options: ['মোছা আটকায়', 'প্যারেন্ট মুছলে সংশ্লিষ্ট চাইল্ড রোও মোছে', 'ব্যাকআপ নেয়', 'NULL বসায়'], answer: 1, explain: 'চাইল্ড রো স্বয়ংক্রিয়ভাবে মুছে যায়।' }
  ]
},

{
  id: 'transactions', section: 'dml', title: 'ট্রানজ্যাকশন',
  summary: 'BEGIN, COMMIT, ROLLBACK — সব কাজ হবে, নয়তো কিছুই না',
  tables: ['accounts'],
  content: `
<p>ধরো রহিম করিমকে ১০০০ টাকা পাঠাবে। দুটো কাজ: রহিমের অ্যাকাউন্ট থেকে কাটা, করিমের অ্যাকাউন্টে যোগ। যদি প্রথমটা হয়ে দ্বিতীয়টার আগে সার্ভার বন্ধ হয়ে যায়? টাকা হাওয়া! 😱</p>
<p><b>ট্রানজ্যাকশন</b> নিশ্চিত করে — হয় সব কাজ একসাথে সফল হবে, নয়তো কোনোটাই হবে না।</p>
<pre class="syntax">BEGIN;          -- ট্রানজ্যাকশন শুরু
  ... কাজগুলো ...
COMMIT;         -- সব স্থায়ী করো
-- অথবা
ROLLBACK;       -- সব বাতিল, আগের অবস্থায় ফেরত</pre>
<pre class="ex">BEGIN;
UPDATE accounts SET balance = balance - 1000 WHERE holder = 'Rahim';
UPDATE accounts SET balance = balance + 1000 WHERE holder = 'Karim';
COMMIT;

SELECT * FROM accounts;</pre>
<pre class="ex">BEGIN;
DELETE FROM accounts;          -- ওহ না, ভুল হয়ে গেছে!
ROLLBACK;                      -- বাঁচা গেল

SELECT * FROM accounts;</pre>

<h2>ACID — ভালো ডেটাবেসের চার গুণ</h2>
<table class="demo-table">
  <tr><th>গুণ</th><th>অর্থ</th></tr>
  <tr><td><b>A</b>tomicity</td><td>সব হবে, নয়তো কিছুই না</td></tr>
  <tr><td><b>C</b>onsistency</td><td>নিয়ম (কনস্ট্রেইন্ট) সবসময় মানা হবে — যেমন balance ঋণাত্মক হবে না</td></tr>
  <tr><td><b>I</b>solation</td><td>একসাথে চলা ট্রানজ্যাকশন একে অপরকে এলোমেলো করবে না</td></tr>
  <tr><td><b>D</b>urability</td><td>COMMIT হলে বিদ্যুৎ চলে গেলেও ডেটা হারাবে না</td></tr>
</table>
<p>আমাদের <code>accounts</code> টেবিলে <code>CHECK (balance &gt;= 0)</code> আছে। চেষ্টা করে দেখো:</p>
<pre class="ex">UPDATE accounts SET balance = balance - 99999 WHERE holder = 'Karim';</pre>
`,
  exercises: [
    { task: 'একটি ট্রানজ্যাকশনে <b>Rahim</b> থেকে <b>Karim</b>-কে <b>1000</b> টাকা পাঠাও (BEGIN … COMMIT)।', solution: "BEGIN; UPDATE accounts SET balance = balance - 1000 WHERE holder = 'Rahim'; UPDATE accounts SET balance = balance + 1000 WHERE holder = 'Karim'; COMMIT;", check: 'SELECT * FROM accounts ORDER BY id;', hint: 'BEGIN; দুটো UPDATE; COMMIT;' },
    { task: 'ট্রানজ্যাকশন শুরু করো, <b>Fatema</b>-র ব্যালেন্স 0 করো, তারপর <b>ROLLBACK</b> করে বাতিল করো। শেষে ব্যালেন্স অপরিবর্তিত থাকা উচিত।', solution: "BEGIN; UPDATE accounts SET balance = 0 WHERE holder = 'Fatema'; ROLLBACK;", check: 'SELECT * FROM accounts ORDER BY id;', hint: 'BEGIN; UPDATE ...; ROLLBACK;' }
  ],
  quiz: [
    { q: 'ROLLBACK কী করে?', options: ['পরিবর্তন স্থায়ী করে', 'ট্রানজ্যাকশনের সব পরিবর্তন বাতিল করে', 'টেবিল মোছে', 'নতুন ট্রানজ্যাকশন শুরু করে'], answer: 1, explain: 'BEGIN-এর পরের সব পরিবর্তন বাতিল হয়।' },
    { q: 'ACID-এর A মানে কী?', options: ['Accuracy', 'Atomicity', 'Availability', 'Access'], answer: 1, explain: 'Atomicity — সব বা কিছুই না।' },
    { q: 'COMMIT-এর পর বিদ্যুৎ চলে গেলেও ডেটা থাকবে — এটা কোন গুণ?', options: ['Isolation', 'Consistency', 'Durability', 'Atomicity'], answer: 2, explain: 'Durability।' }
  ]
},

// ───────────────────────────────── DDL
{
  id: 'create', section: 'ddl', title: 'CREATE TABLE ও ডেটা টাইপ',
  summary: 'নতুন টেবিল তৈরি, ডেটা টাইপ ও কনস্ট্রেইন্ট',
  tables: ['students'],
  content: `
<p>নতুন টেবিল বানাতে <code>CREATE TABLE</code>। প্রতিটি কলামের নাম, ডেটা টাইপ ও প্রয়োজনে নিয়ম (কনস্ট্রেইন্ট) দিতে হয়।</p>
<pre class="syntax">CREATE TABLE IF NOT EXISTS টেবিল (
  কলাম১ টাইপ কনস্ট্রেইন্ট,
  কলাম২ টাইপ কনস্ট্রেইন্ট,
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

<h2>সাধারণ ডেটা টাইপ</h2>
<table class="demo-table">
  <tr><th>টাইপ</th><th>কী রাখে</th><th>উদাহরণ</th></tr>
  <tr><td><code>INTEGER</code> / <code>INT</code></td><td>পূর্ণসংখ্যা</td><td>42, -7</td></tr>
  <tr><td><code>REAL</code> / <code>FLOAT</code> / <code>DECIMAL(p,s)</code></td><td>দশমিক সংখ্যা</td><td>3.75</td></tr>
  <tr><td><code>TEXT</code> / <code>VARCHAR(n)</code> / <code>CHAR(n)</code></td><td>লেখা</td><td>'Dhaka'</td></tr>
  <tr><td><code>DATE</code> / <code>DATETIME</code> / <code>TIMESTAMP</code></td><td>তারিখ-সময়</td><td>'2024-03-15'</td></tr>
  <tr><td><code>BOOLEAN</code></td><td>সত্য/মিথ্যা</td><td>TRUE / FALSE (SQLite-এ 1/0)</td></tr>
  <tr><td><code>BLOB</code></td><td>বাইনারি ডেটা (ছবি, ফাইল)</td><td>—</td></tr>
</table>
<div class="callout info"><b>জানো কি?</b> টাকার হিসাবে <code>FLOAT</code> ব্যবহার করো না — ০.১ + ০.২ = ০.৩০০০০০০০০০০০০০০০৪ এর মতো সমস্যা হয়। MySQL/PostgreSQL-এ <code>DECIMAL(10,2)</code> ব্যবহার করো, অথবা পয়সায় পূর্ণসংখ্যা রাখো।</div>

<h2>কনস্ট্রেইন্ট (Constraint) — ডেটার নিয়ম</h2>
<table class="demo-table">
  <tr><th>কনস্ট্রেইন্ট</th><th>কাজ</th></tr>
  <tr><td><code>PRIMARY KEY</code></td><td>ইউনিক + NOT NULL; প্রতিটি রো-র পরিচয়</td></tr>
  <tr><td><code>NOT NULL</code></td><td>খালি রাখা যাবে না</td></tr>
  <tr><td><code>UNIQUE</code></td><td>দুটি রো-তে একই মান থাকবে না</td></tr>
  <tr><td><code>DEFAULT মান</code></td><td>মান না দিলে এটা বসবে</td></tr>
  <tr><td><code>CHECK (শর্ত)</code></td><td>শর্ত পূরণ না হলে ইনসার্ট/আপডেট বাতিল</td></tr>
  <tr><td><code>REFERENCES t(col)</code></td><td>ফরেন কি — অন্য টেবিলে মানটা থাকতেই হবে</td></tr>
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
<p>কনস্ট্রেইন্ট ভাঙলে কী হয় দেখো:</p>
<pre class="ex">CREATE TABLE t (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL);
INSERT INTO t VALUES (1, 'a@x.com');
INSERT INTO t VALUES (2, 'a@x.com');  -- UNIQUE ভাঙবে</pre>
`,
  exercises: [
    { task: '<code>books</code> নামে একটি টেবিল বানাও: <code>id</code> (INTEGER, PRIMARY KEY), <code>title</code> (TEXT, NOT NULL), <code>author</code> (TEXT), <code>price</code> (REAL), <code>published_year</code> (INTEGER) — এই ক্রমে।', solution: 'CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT NOT NULL, author TEXT, price REAL, published_year INTEGER);', check: "SELECT name, CASE WHEN pk = 1 THEN 1 ELSE \"notnull\" END AS required, pk FROM pragma_table_info('books') ORDER BY cid;", hint: 'CREATE TABLE books ( id INTEGER PRIMARY KEY, title TEXT NOT NULL, ... );' },
    { task: '<code>members</code> টেবিল বানাও (<code>id</code> INTEGER PRIMARY KEY, <code>name</code> TEXT NOT NULL, <code>joined</code> DATE), তারপর একটি রো ইনসার্ট করো: (1, \'Rahim\', \'2024-01-01\')।', solution: "CREATE TABLE members (id INTEGER PRIMARY KEY, name TEXT NOT NULL, joined DATE); INSERT INTO members VALUES (1, 'Rahim', '2024-01-01');", check: 'SELECT * FROM members;', hint: 'দুটো স্টেটমেন্ট সেমিকোলন দিয়ে আলাদা করো।' }
  ],
  quiz: [
    { q: 'PRIMARY KEY-তে স্বয়ংক্রিয়ভাবে কোন দুটি নিয়ম থাকে?', options: ['UNIQUE ও NOT NULL', 'CHECK ও DEFAULT', 'NULL ও UNIQUE', 'FOREIGN ও INDEX'], answer: 0, explain: 'প্রাইমারি কি ইউনিক এবং খালি হতে পারে না। (SQLite-এ ঐতিহাসিক কারণে INTEGER ছাড়া অন্য PK-তে NULL চলে, তবে নিয়ম হিসেবে ধরে নাও।)' },
    { q: 'টাকার হিসাব রাখতে কোন টাইপ সবচেয়ে নিরাপদ?', options: ['FLOAT', 'DECIMAL', 'TEXT', 'BLOB'], answer: 1, explain: 'DECIMAL নির্ভুল দশমিক রাখে; FLOAT-এ rounding error হয়।' },
    { q: 'CREATE TABLE IF NOT EXISTS কেন ব্যবহার করি?', options: ['টেবিল আগে থেকে থাকলে এরর না দিতে', 'দ্রুত চালাতে', 'ডেটা কপি করতে', 'অস্থায়ী টেবিলের জন্য'], answer: 0, explain: 'টেবিল থাকলে কিছু করে না, এরর দেয় না।' }
  ]
},

{
  id: 'alter', section: 'ddl', title: 'ALTER TABLE — টেবিল পরিবর্তন',
  summary: 'কলাম যোগ, নাম পরিবর্তন, কলাম মুছে ফেলা',
  tables: ['students', 'cities'],
  content: `
<p>টেবিল বানানোর পর তার গঠন বদলাতে <code>ALTER TABLE</code>।</p>
<h2>কলাম যোগ</h2>
<pre class="ex">ALTER TABLE students ADD COLUMN phone TEXT;
SELECT * FROM students LIMIT 3;</pre>
<p>পুরনো রোগুলোতে নতুন কলামের মান হবে <code>NULL</code> (বা <code>DEFAULT</code> দিলে সেটা):</p>
<pre class="ex">ALTER TABLE students ADD COLUMN is_active INTEGER DEFAULT 1;
SELECT name, is_active FROM students LIMIT 3;</pre>
<h2>কলামের নাম বদল</h2>
<pre class="ex">ALTER TABLE students RENAME COLUMN cgpa TO gpa;
SELECT name, gpa FROM students LIMIT 3;</pre>
<h2>টেবিলের নাম বদল</h2>
<pre class="ex">ALTER TABLE cities RENAME TO districts;
SELECT * FROM districts LIMIT 3;</pre>
<h2>কলাম মুছে ফেলা</h2>
<pre class="ex">ALTER TABLE cities DROP COLUMN area_km2;
SELECT * FROM cities LIMIT 3;</pre>
<div class="callout info"><b>জানো কি?</b> MySQL/PostgreSQL-এ <code>ALTER TABLE ... MODIFY/ALTER COLUMN</code> দিয়ে কলামের টাইপও বদলানো যায়। SQLite-এ সেটা সীমিত — সেখানে নতুন টেবিল বানিয়ে ডেটা কপি করতে হয়। বাস্তব প্রজেক্টে এসব পরিবর্তন <b>মাইগ্রেশন (migration)</b> ফাইলে লিখে রাখা হয়।</div>
`,
  exercises: [
    { task: '<code>students</code> টেবিলে <code>phone</code> নামে একটি TEXT কলাম যোগ করো।', solution: 'ALTER TABLE students ADD COLUMN phone TEXT;', check: "SELECT name FROM pragma_table_info('students') ORDER BY cid;", hint: 'ALTER TABLE students ADD COLUMN phone TEXT;' },
    { task: '<code>cities</code> টেবিলের নাম বদলে <code>districts</code> রাখো।', solution: 'ALTER TABLE cities RENAME TO districts;', check: "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;", hint: 'ALTER TABLE cities RENAME TO districts;' },
    { task: '<code>cities</code> টেবিল থেকে <code>area_km2</code> কলামটি মুছে ফেলো।', solution: 'ALTER TABLE cities DROP COLUMN area_km2;', check: "SELECT name FROM pragma_table_info('cities') ORDER BY cid;", hint: 'DROP COLUMN area_km2' }
  ],
  quiz: [
    { q: 'নতুন কলাম যোগ করলে পুরনো রোগুলোতে কী মান থাকে?', options: ['0', 'NULL বা DEFAULT মান', 'এরর হয়', 'রোগুলো মুছে যায়'], answer: 1, explain: 'DEFAULT না দিলে NULL।' },
    { q: 'টেবিলের নাম বদলাতে কোনটি?', options: ['RENAME TABLE a b', 'ALTER TABLE a RENAME TO b', 'UPDATE TABLE a SET name = b', 'CHANGE a TO b'], answer: 1, explain: 'ALTER TABLE a RENAME TO b (MySQL-এ RENAME TABLE a TO b-ও চলে)।' }
  ]
},

{
  id: 'drop', section: 'ddl', title: 'DROP TABLE',
  summary: 'টেবিল সম্পূর্ণ মুছে ফেলা; DELETE vs TRUNCATE vs DROP',
  tables: ['orders', 'enrollments'],
  content: `
<p>পুরো টেবিল (গঠন + ডেটা) মুছে ফেলতে <code>DROP TABLE</code>:</p>
<pre class="ex">DROP TABLE orders;
SELECT name FROM sqlite_master WHERE type = 'table';</pre>
<p>টেবিল না থাকলে এরর এড়াতে:</p>
<pre class="ex">DROP TABLE IF EXISTS old_logs;</pre>
<div class="callout danger"><b>⚠️ সতর্কতা:</b> DROP TABLE-এর কোনো "Undo" নেই (ট্রানজ্যাকশনের বাইরে)। প্রোডাকশন ডেটাবেসে চালানোর আগে অবশ্যই ব্যাকআপ নাও।</div>
<h2>DELETE vs TRUNCATE vs DROP</h2>
<table class="demo-table">
  <tr><th></th><th>DELETE</th><th>TRUNCATE</th><th>DROP</th></tr>
  <tr><td>কী মোছে</td><td>রো (শর্তসাপেক্ষে)</td><td>সব রো</td><td>পুরো টেবিল</td></tr>
  <tr><td>WHERE চলে?</td><td>হ্যাঁ</td><td>না</td><td>না</td></tr>
  <tr><td>টেবিলের গঠন থাকে?</td><td>হ্যাঁ</td><td>হ্যাঁ</td><td>না</td></tr>
  <tr><td>গতি</td><td>ধীর (রো ধরে ধরে)</td><td>খুব দ্রুত</td><td>দ্রুত</td></tr>
  <tr><td>ধরন</td><td>DML</td><td>DDL</td><td>DDL</td></tr>
</table>
<p>SQLite-এ <code>TRUNCATE</code> নেই; <code>DELETE FROM t;</code> (WHERE ছাড়া) একই কাজ করে।</p>
`,
  exercises: [
    { task: '<code>orders</code> টেবিলটি সম্পূর্ণ মুছে ফেলো।', solution: 'DROP TABLE orders;', check: "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;", hint: 'DROP TABLE orders;' },
    { task: '<code>enrollments</code> টেবিলটি মুছে ফেলো, কিন্তু এমনভাবে লেখো যাতে টেবিল না থাকলেও এরর না দেয়।', solution: 'DROP TABLE IF EXISTS enrollments;', check: "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;", hint: 'IF EXISTS' }
  ],
  quiz: [
    { q: 'টেবিলের গঠন রেখে সব ডেটা মুছতে কোনটি?', options: ['DROP TABLE', 'DELETE FROM t (বা TRUNCATE)', 'ALTER TABLE', 'REMOVE'], answer: 1, explain: 'DROP পুরো টেবিল মোছে; DELETE/TRUNCATE শুধু ডেটা।' },
    { q: 'কোনটিতে WHERE ব্যবহার করা যায়?', options: ['DROP', 'TRUNCATE', 'DELETE', 'সবগুলো'], answer: 2, explain: 'শুধু DELETE-এ শর্ত দেওয়া যায়।' }
  ]
},

{
  id: 'index-view', section: 'ddl', title: 'INDEX ও VIEW',
  summary: 'কুয়েরি দ্রুত করা ও সংরক্ষিত কুয়েরি',
  tables: ['students'],
  content: `
<h2>INDEX — বইয়ের সূচিপত্রের মতো</h2>
<p>১০০০ পাতার বইয়ে "SQL" শব্দ খুঁজতে প্রতিটি পাতা উল্টালে সময় লাগবে। সূচিপত্র (index) দেখলে সরাসরি পাতায় যাওয়া যায়। ডেটাবেসেও তাই — লক্ষ লক্ষ রো-তে <code>WHERE city = 'Dhaka'</code> খুঁজতে index থাকলে অনেক দ্রুত হয়।</p>
<pre class="ex">CREATE INDEX idx_students_city ON students(city);

-- কুয়েরি প্ল্যান দেখো: index ব্যবহার হচ্ছে কিনা
EXPLAIN QUERY PLAN
SELECT * FROM students WHERE city = 'Dhaka';</pre>
<ul>
  <li><b>কোথায় index দেবে:</b> যেসব কলাম WHERE, JOIN, ORDER BY-তে বেশি ব্যবহৃত হয়।</li>
  <li><b>অসুবিধা:</b> index জায়গা নেয় এবং INSERT/UPDATE/DELETE একটু ধীর করে (index-ও আপডেট করতে হয়)। তাই সব কলামে দেবে না।</li>
  <li><code>PRIMARY KEY</code> ও <code>UNIQUE</code> কলামে ডেটাবেস নিজেই index বানায়।</li>
  <li><code>CREATE UNIQUE INDEX</code> — index + ইউনিক নিয়ম।</li>
</ul>

<h2>VIEW — সংরক্ষিত কুয়েরি</h2>
<p>একটি জটিল কুয়েরি বারবার লিখতে হলে তাকে <b>VIEW</b> হিসেবে সেভ করো। View দেখতে টেবিলের মতো, কিন্তু নিজে কোনো ডেটা রাখে না — প্রতিবার মূল টেবিল থেকে চলে।</p>
<pre class="ex">CREATE VIEW student_details AS
SELECT s.name, s.cgpa, d.name AS department, d.building
FROM students s
JOIN departments d ON s.dept_id = d.id;

SELECT * FROM student_details WHERE cgpa > 3.5;</pre>
<p>সুবিধা: জটিলতা লুকানো, নিরাপত্তা (ইউজারকে শুধু নির্দিষ্ট কলাম দেখানো), কোড পুনঃব্যবহার। মুছতে: <code>DROP VIEW নাম;</code></p>
`,
  exercises: [
    { task: '<code>students</code> টেবিলের <code>city</code> কলামে <b>idx_students_city</b> নামে একটি index বানাও।', solution: 'CREATE INDEX idx_students_city ON students(city);', check: "SELECT name, tbl_name FROM sqlite_master WHERE type = 'index' AND name NOT LIKE 'sqlite_%';", hint: 'CREATE INDEX idx_students_city ON students(city);' },
    { task: '<b>top_students</b> নামে একটি VIEW বানাও যেটা CGPA <b>3.7 বা বেশি</b> এমন ছাত্রদের <code>name</code> ও <code>cgpa</code> দেখায়।', solution: 'CREATE VIEW top_students AS SELECT name, cgpa FROM students WHERE cgpa >= 3.7;', check: 'SELECT * FROM top_students;', hint: 'CREATE VIEW top_students AS SELECT ...' }
  ],
  quiz: [
    { q: 'Index-এর অসুবিধা কোনটি?', options: ['SELECT ধীর হয়', 'INSERT/UPDATE একটু ধীর হয় ও জায়গা নেয়', 'ডেটা হারায়', 'কোনো অসুবিধা নেই'], answer: 1, explain: 'প্রতিটি লেখার সময় index-ও আপডেট করতে হয়।' },
    { q: 'VIEW সম্পর্কে কোনটি সত্য?', options: ['নিজস্ব ডেটার কপি রাখে', 'একটি সংরক্ষিত কুয়েরি, প্রতিবার মূল টেবিল থেকে চলে', 'শুধু পড়া যায় না', 'index-এর আরেক নাম'], answer: 1, explain: 'সাধারণ VIEW ডেটা রাখে না। (Materialized View রাখে — PostgreSQL/Oracle-এ।)' }
  ]
},

// ───────────────────────────────── পরবর্তী ধাপ
{
  id: 'next', section: 'next', title: 'ডেটাবেস ডিজাইন ও পরবর্তী ধাপ',
  summary: 'নরমালাইজেশন, রিলেশনশিপ, বিভিন্ন ডেটাবেস ও ক্যারিয়ার টিপস',
  tables: [],
  content: `
<p>🎉 অভিনন্দন! তুমি SQL-এর প্রায় সব মূল বিষয় শিখে ফেলেছ। এবার কিছু বড় ছবির ধারণা।</p>

<h2>রিলেশনশিপের ধরন</h2>
<table class="demo-table">
  <tr><th>ধরন</th><th>উদাহরণ</th><th>কীভাবে বানায়</th></tr>
  <tr><td>One-to-One</td><td>একজন মানুষ ↔ একটি NID</td><td>এক টেবিলে UNIQUE ফরেন কি</td></tr>
  <tr><td>One-to-Many</td><td>একটি বিভাগ → অনেক ছাত্র</td><td>"অনেক" দিকের টেবিলে ফরেন কি (<code>students.dept_id</code>)</td></tr>
  <tr><td>Many-to-Many</td><td>অনেক ছাত্র ↔ অনেক কোর্স</td><td>মাঝখানে একটি junction টেবিল (<code>enrollments</code>)</td></tr>
</table>

<h2>নরমালাইজেশন (সহজ ভাষায়)</h2>
<ul>
  <li><b>1NF:</b> প্রতিটি ঘরে একটিমাত্র মান। <code>phones = '017..., 018...'</code> নয় — আলাদা টেবিল বানাও।</li>
  <li><b>2NF:</b> 1NF + প্রতিটি কলাম পুরো প্রাইমারি কি-র উপর নির্ভরশীল (composite key-এর অংশবিশেষের উপর নয়)।</li>
  <li><b>3NF:</b> 2NF + কোনো non-key কলাম অন্য non-key কলামের উপর নির্ভর করবে না। যেমন students-এ <code>dept_building</code> রাখা ভুল — সেটা বিভাগের তথ্য, departments-এ থাকবে।</li>
</ul>
<p>এক কথায়: <b>"প্রতিটি তথ্য এক জায়গায়, একবার।"</b></p>

<h2>বিভিন্ন ডেটাবেসের পার্থক্য</h2>
<table class="demo-table">
  <tr><th>কাজ</th><th>SQLite</th><th>MySQL</th><th>PostgreSQL</th><th>SQL Server</th></tr>
  <tr><td>সীমিত রো</td><td>LIMIT</td><td>LIMIT</td><td>LIMIT</td><td>TOP / OFFSET FETCH</td></tr>
  <tr><td>Auto ID</td><td>AUTOINCREMENT</td><td>AUTO_INCREMENT</td><td>SERIAL / IDENTITY</td><td>IDENTITY</td></tr>
  <tr><td>টেক্সট জোড়া</td><td>||</td><td>CONCAT()</td><td>|| বা CONCAT()</td><td>+ বা CONCAT()</td></tr>
  <tr><td>আজকের তারিখ</td><td>DATE('now')</td><td>CURDATE()</td><td>CURRENT_DATE</td><td>GETDATE()</td></tr>
  <tr><td>ব্যবহার</td><td>মোবাইল অ্যাপ, ছোট প্রজেক্ট</td><td>ওয়েবসাইট (WordPress)</td><td>বড় অ্যাপ, অ্যানালিটিক্স</td><td>এন্টারপ্রাইজ</td></tr>
</table>

<h2>এরপর কী শিখবে?</h2>
<ol>
  <li><b>একটি আসল ডেটাবেস ইনস্টল করো</b> — PostgreSQL বা MySQL, সাথে DBeaver / pgAdmin।</li>
  <li><b>নিজের প্রজেক্ট:</b> লাইব্রেরি ম্যানেজমেন্ট, হোস্টেল ম্যানেজমেন্ট, ই-কমার্স — টেবিল ডিজাইন থেকে শুরু করো (ER Diagram)।</li>
  <li><b>প্রোগ্রামিং ভাষার সাথে:</b> Python (sqlite3, SQLAlchemy), Node.js (Prisma), Django ORM।</li>
  <li><b>প্র্যাকটিস:</b> LeetCode SQL 50, HackerRank SQL, StrataScratch।</li>
  <li><b>অ্যাডভান্সড:</b> Stored Procedure, Trigger, Query Optimization, Partitioning।</li>
  <li><b>SQL Injection সম্পর্কে জানো</b> — কোডে কখনো ইউজার ইনপুট সরাসরি কুয়েরিতে জোড়া লাগাবে না; সবসময় parameterized query ব্যবহার করো।</li>
</ol>
<p>শুভকামনা! প্লেগ্রাউন্ডে গিয়ে ইচ্ছামতো প্র্যাকটিস চালিয়ে যাও। 🚀</p>
`,
  exercises: [],
  quiz: [
    { q: 'ছাত্র ও কোর্সের Many-to-Many সম্পর্ক কীভাবে বানায়?', options: ['students টেবিলে course_id রেখে', 'একটি মাঝখানের (junction) টেবিল দিয়ে', 'courses-এ student_id রেখে', 'একটি কলামে কমা দিয়ে আইডি রেখে'], answer: 1, explain: 'enrollments-এর মতো junction টেবিলে দুই পাশের ফরেন কি থাকে।' },
    { q: "একটি ঘরে '017..., 018...' রাখা কোন নর্মাল ফর্ম ভাঙে?", options: ['1NF', '2NF', '3NF', 'কোনোটাই না'], answer: 0, explain: '1NF: প্রতিটি ঘরে একটি (atomic) মান।' },
    { q: 'SQL Injection থেকে বাঁচার সঠিক উপায়?', options: ['ইনপুট বড় হাতে রূপান্তর', 'Parameterized query / prepared statement', 'কুয়েরি ছোট রাখা', 'SELECT * এড়ানো'], answer: 1, explain: 'প্যারামিটার আলাদাভাবে পাঠালে ইনপুট কখনো SQL কোড হিসেবে চলে না।' }
  ]
}
];
