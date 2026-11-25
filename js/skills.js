/* দক্ষতা অনুশীলন — "ভুল খুঁজে ঠিক করো" (debug) ও "কুয়েরি পড়ো" (read) */
(function () {
  'use strict';
  const { $, $$, esc, store, n, pick, t } = SB;
  const EN = () => I18N.lang === 'en';
  const T = (bn, en) => (EN() ? en : bn);

  // ───────── ভুল খুঁজে ঠিক করো ─────────
  // task: কুয়েরিটা কী করার কথা; bug: ভুল কুয়েরি (এডিটরে আগে থেকে বসানো); solution: সঠিক
  const D = (id, level, db, task, bug, solution, hint, explain, opt = {}) => ({ id, level, db, task: { bn: task[0], en: task[1] }, bug, solution, hint: { bn: hint[0], en: hint[1] }, explain: { bn: explain[0], en: explain[1] }, ...opt });
  const DEBUG = [
    D('null-eq', 'easy', 'main', ['যেসব কর্মচারীর কোনো ম্যানেজার নেই (manager_id খালি), তাদের নাম দেখাও।', 'Show the names of employees who have no manager (manager_id is empty).'],
      "SELECT name FROM employees WHERE manager_id = NULL;", "SELECT name FROM employees WHERE manager_id IS NULL;",
      ['NULL-এর সাথে = দিয়ে তুলনা কখনো সত্য হয় না।', 'Comparing with NULL using = is never true.'],
      ['NULL মানে "অজানা" — <code>= NULL</code>-এর ফল সবসময় অজানা, তাই কোনো রো আসে না। লিখতে হয় <code>IS NULL</code>।', 'NULL means "unknown" — <code>= NULL</code> is always unknown, so no row comes back. Use <code>IS NULL</code>.']),
    D('no-group', 'easy', 'main', ['প্রতিটি বিভাগে (dept_id) কতজন শিক্ষার্থী আছে দেখাও।', 'Show how many students each department (dept_id) has.'],
      "SELECT dept_id, COUNT(*) FROM students;", "SELECT dept_id, COUNT(*) FROM students GROUP BY dept_id;",
      ['"প্রতিটি" বিভাগের জন্য আলাদা হিসাব চাইলে কী লাগে?', 'What do you need to get a separate count for "each" department?'],
      ['GROUP BY ছাড়া COUNT(*) পুরো টেবিলকে এক দল ধরে — একটিই রো আসে। প্রতিটি বিভাগের জন্য <code>GROUP BY dept_id</code> লাগবে।', 'Without GROUP BY, COUNT(*) treats the whole table as one group — a single row. Add <code>GROUP BY dept_id</code>.']),
    D('where-agg', 'easy', 'main', ['যেসব বিভাগের শিক্ষার্থীদের গড় CGPA ৩.৫-এর বেশি, সেই dept_id আর গড় দেখাও।', 'Show dept_id and average CGPA for departments whose average CGPA is above 3.5.'],
      "SELECT dept_id, AVG(cgpa) FROM students WHERE AVG(cgpa) > 3.5 GROUP BY dept_id;", "SELECT dept_id, AVG(cgpa) FROM students GROUP BY dept_id HAVING AVG(cgpa) > 3.5;",
      ['WHERE দলের আগে চলে — তখন গড় জানাই নেই।', 'WHERE runs before grouping — the average does not exist yet.'],
      ['অ্যাগ্রিগেট (AVG, COUNT…) দিয়ে শর্ত WHERE-এ দেওয়া যায় না, কারণ WHERE প্রতিটি রো আলাদাভাবে দেখে। দলের উপর শর্ত দিতে <code>HAVING</code>।', 'Aggregates cannot be used in WHERE because WHERE looks at one row at a time. Filter groups with <code>HAVING</code>.']),
    D('like-wild', 'easy', 'main', ['যেসব শিক্ষার্থীর নাম "R" দিয়ে শুরু, তাদের নাম দেখাও।', 'Show students whose name starts with "R".'],
      "SELECT name FROM students WHERE name LIKE 'R';", "SELECT name FROM students WHERE name LIKE 'R%';",
      ['"দিয়ে শুরু" বোঝাতে ছাঁচে কী লাগে?', 'What does the pattern need to mean "starts with"?'],
      ["<code>LIKE 'R'</code> মানে নামটা হুবহু \"R\"। শুরু বোঝাতে <code>'R%'</code> — % মানে পরে যেকোনো কিছু।", "<code>LIKE 'R'</code> means the name is exactly \"R\". For \"starts with\" use <code>'R%'</code> — % matches anything after."]),
    D('case-eq', 'easy', 'main', ['ঢাকার (Dhaka) শিক্ষার্থীদের নাম দেখাও।', 'Show the names of students from Dhaka.'],
      "SELECT name FROM students WHERE city = 'dhaka';", "SELECT name FROM students WHERE city = 'Dhaka';",
      ['ডেটায় শহরের নাম কীভাবে লেখা আছে দেখো।', 'Look at how the city is written in the data.'],
      ["<code>=</code> দিয়ে লেখার তুলনা বড়-ছোট হাতের অক্ষর আলাদা ধরে: 'dhaka' ≠ 'Dhaka'। ঠিক বানান দাও, বা <code>LOWER(city) = 'dhaka'</code>।", "<code>=</code> on text is case-sensitive: 'dhaka' ≠ 'Dhaka'. Use the right spelling or <code>LOWER(city) = 'dhaka'</code>."]),
    D('order-dir', 'easy', 'main', ['সবচেয়ে বেশি CGPA-র ৩ জন শিক্ষার্থীর নাম ও CGPA (বড় থেকে ছোট)।', 'Name and CGPA of the 3 students with the highest CGPA (highest first).'],
      "SELECT name, cgpa FROM students ORDER BY cgpa LIMIT 3;", "SELECT name, cgpa FROM students ORDER BY cgpa DESC LIMIT 3;",
      ['ORDER BY-এর ডিফল্ট দিক কোনটা?', 'What is ORDER BY\'s default direction?'],
      ['ORDER BY ডিফল্টে ছোট থেকে বড় (ASC) সাজায় — তাই সবচেয়ে কম ৩ জন আসছিল। বড় থেকে ছোটর জন্য <code>DESC</code>।', 'ORDER BY sorts ascending by default — that gave the lowest 3. Use <code>DESC</code> for highest first.'], { ordered: true }),
    D('between-rev', 'easy', 'main', ['যেসব পণ্যের দাম ১০০০ থেকে ৫০০০০-এর মধ্যে, তাদের নাম ও দাম।', 'Name and price of products priced between 1000 and 50000.'],
      "SELECT name, price FROM products WHERE price BETWEEN 50000 AND 1000;", "SELECT name, price FROM products WHERE price BETWEEN 1000 AND 50000;",
      ['BETWEEN-এ কোন মান আগে লিখতে হয়?', 'Which value comes first in BETWEEN?'],
      ['<code>BETWEEN a AND b</code> মানে <code>&gt;= a AND &lt;= b</code>। a বড় হলে কোনো সংখ্যাই মেলে না। ছোট মান আগে।', '<code>BETWEEN a AND b</code> means <code>&gt;= a AND &lt;= b</code>. If a is larger, nothing matches. Smaller value first.']),
    D('count-col', 'easy', 'main', ['মোট কতজন কর্মচারী আছে?', 'How many employees are there in total?'],
      "SELECT COUNT(manager_id) FROM employees;", "SELECT COUNT(*) FROM employees;",
      ['COUNT(কলাম) কোন রোগুলো গোনে না?', 'Which rows does COUNT(column) skip?'],
      ['<code>COUNT(col)</code> শুধু NULL-নয় মান গোনে — যার ম্যানেজার নেই সে বাদ পড়েছে। সব রো গুনতে <code>COUNT(*)</code>।', '<code>COUNT(col)</code> counts only non-NULL values — employees without a manager were skipped. Use <code>COUNT(*)</code> to count rows.']),
    D('concat-plus', 'easy', 'main', ['প্রতিটি শিক্ষার্থীর জন্য "নাম - শহর" আকারে একটি লেখা দেখাও।', 'For each student show one text "name - city".'],
      "SELECT name + ' - ' + city FROM students;", "SELECT name || ' - ' || city FROM students;",
      ['SQLite-এ লেখা জোড়া দেওয়ার অপারেটর কোনটা?', 'Which operator joins text in SQLite?'],
      ["SQLite-এ <code>+</code> শুধু সংখ্যা যোগ করে — লেখা 0 হয়ে যায়। লেখা জোড়া দিতে <code>||</code> (MySQL-এ CONCAT())।", "In SQLite <code>+</code> only adds numbers — text becomes 0. Join text with <code>||</code> (CONCAT() in MySQL)."]),
    D('limit-order', 'easy', 'main', ['সবচেয়ে দামি ৩টি পণ্যের নাম ও দাম।', 'Name and price of the 3 most expensive products.'],
      "SELECT name, price FROM products LIMIT 3 ORDER BY price DESC;", "SELECT name, price FROM products ORDER BY price DESC LIMIT 3;",
      ['ক্লজগুলোর লেখার ক্রম দেখো।', 'Check the order in which clauses are written.'],
      ['লেখার ক্রম নির্দিষ্ট: SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT। LIMIT সবার শেষে।', 'Clause order is fixed: SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT. LIMIT goes last.'], { ordered: true }),
    D('date-like', 'easy', 'main', ['২০২৪ সালের জানুয়ারির সব অর্ডারের id ও তারিখ।', 'id and date of all orders placed in January 2024.'],
      "SELECT id, order_date FROM orders WHERE order_date LIKE '01-2024%';", "SELECT id, order_date FROM orders WHERE order_date LIKE '2024-01%';",
      ['ডেটায় তারিখ কোন ফরম্যাটে আছে?', 'What format are dates stored in?'],
      ["তারিখ রাখা আছে YYYY-MM-DD ফরম্যাটে (যেমন 2024-01-05)। তাই জানুয়ারি ২০২৪ = <code>'2024-01%'</code>, বা <code>strftime('%Y-%m', order_date) = '2024-01'</code>।", "Dates are stored as YYYY-MM-DD (e.g. 2024-01-05), so January 2024 is <code>'2024-01%'</code> or <code>strftime('%Y-%m', order_date) = '2024-01'</code>."]),
    D('or-prec', 'medium', 'main', ["Electronics অথবা Clothing ক্যাটাগরির যেসব পণ্যের দাম ৩০০০-এর বেশি, তাদের নাম, ক্যাটাগরি, দাম।", "Name, category and price of Electronics or Clothing products priced above 3000."],
      "SELECT name, category, price FROM products WHERE category = 'Electronics' OR category = 'Clothing' AND price > 3000;",
      "SELECT name, category, price FROM products WHERE (category = 'Electronics' OR category = 'Clothing') AND price > 3000;",
      ['AND আর OR-এর মধ্যে কোনটা আগে হিসাব হয়?', 'Which is evaluated first, AND or OR?'],
      ['AND আগে হিসাব হয়, তাই ভুল কুয়েরিটা আসলে "Electronics (যেকোনো দাম) অথবা (Clothing এবং দাম > ৩০০০)"। OR অংশ বন্ধনীতে রাখতে হবে।', 'AND binds first, so the buggy query meant "Electronics (any price) OR (Clothing AND price > 3000)". Put the OR part in parentheses.']),
    D('cross', 'medium', 'main', ['প্রতিটি শিক্ষার্থীর নাম আর তার বিভাগের নাম।', 'Each student\'s name with their department name.'],
      "SELECT s.name, d.name FROM students s, departments d;", "SELECT s.name, d.name FROM students s JOIN departments d ON s.dept_id = d.id;",
      ['দুই টেবিল জোড়া লাগানোর শর্ত কোথায়?', 'Where is the condition that matches the two tables?'],
      ['শর্ত ছাড়া কমা দিয়ে দুই টেবিল দিলে CROSS JOIN হয় — প্রতিটি শিক্ষার্থী প্রতিটি বিভাগের সাথে (১৬ × ৬ = ৯৬ রো)। <code>ON s.dept_id = d.id</code> দিয়ে মেলাতে হবে।', 'Two tables with a comma and no condition is a CROSS JOIN — every student with every department (16 × 6 = 96 rows). Match them with <code>ON s.dept_id = d.id</code>.']),
    D('ambig', 'medium', 'main', ['প্রতিটি শিক্ষার্থীর id, নাম আর বিভাগের নাম।', 'Each student\'s id, name and department name.'],
      "SELECT id, name, name FROM students JOIN departments ON dept_id = departments.id;", "SELECT students.id, students.name, departments.name FROM students JOIN departments ON students.dept_id = departments.id;",
      ['দুই টেবিলেই id আর name কলাম আছে।', 'Both tables have id and name columns.'],
      ['দুই টেবিলে একই নামের কলাম থাকলে কোনটা চাইছ বলে দিতে হয় (<code>students.id</code> বা alias দিয়ে <code>s.id</code>), না হলে "ambiguous column" এরর।', 'When both tables have a column with the same name you must say which one (<code>students.id</code> or an alias like <code>s.id</code>), otherwise you get "ambiguous column".']),
    D('join-col', 'medium', 'main', ['প্রতিটি এনরোলমেন্টের শিক্ষার্থী id, কোর্সের নাম আর নম্বর।', 'For each enrollment: student id, course title and marks.'],
      "SELECT e.student_id, c.title, e.marks FROM enrollments e JOIN courses c ON e.id = c.id;", "SELECT e.student_id, c.title, e.marks FROM enrollments e JOIN courses c ON e.course_id = c.id;",
      ['enrollments-এর কোন কলাম courses-কে নির্দেশ করে?', 'Which column of enrollments points to courses?'],
      ['মেলাতে হয় foreign key দিয়ে: <code>enrollments.course_id → courses.id</code>। দুই টেবিলের নিজস্ব id মেলালে ভুল জোড়া হয়।', 'Join on the foreign key: <code>enrollments.course_id → courses.id</code>. Matching the two tables\' own ids pairs the wrong rows.']),
    D('left-where', 'medium', 'main', ['সব বিভাগের নাম আর প্রতিটিতে ২০২১ সালে ভর্তি হওয়া শিক্ষার্থীর সংখ্যা (কেউ না থাকলে ০)।', 'Every department\'s name and how many of its students were admitted in 2021 (0 if none).'],
      "SELECT d.name, COUNT(s.id) FROM departments d LEFT JOIN students s ON s.dept_id = d.id WHERE s.admission_year = 2021 GROUP BY d.name;",
      "SELECT d.name, COUNT(s.id) FROM departments d LEFT JOIN students s ON s.dept_id = d.id AND s.admission_year = 2021 GROUP BY d.name;",
      ['০ জনের বিভাগগুলো কেন হারিয়ে যাচ্ছে? WHERE-এর শর্তটা কোথায় যাওয়া উচিত?', 'Why do the departments with 0 disappear? Where should the condition go?'],
      ['মিল-না-পাওয়া বিভাগে <code>s.admission_year</code> NULL — WHERE সেগুলো বাদ দিয়ে LEFT JOIN-কে INNER JOIN বানিয়ে দেয়। শর্তটা ON-এ নিলে সব বিভাগ থাকে।', 'For unmatched departments <code>s.admission_year</code> is NULL, so WHERE drops them and the LEFT JOIN becomes an INNER JOIN. Move the condition into ON to keep every department.']),
    D('int-div', 'medium', 'main', ['প্রতিটি বিভাগে মোট শিক্ষার্থীর কত শতাংশ আছে (dept_id ও শতাংশ, দশমিকসহ)।', 'Percentage of all students in each department (dept_id and percentage, with decimals).'],
      "SELECT dept_id, COUNT(*) * 100 / (SELECT COUNT(*) FROM students) AS pct FROM students GROUP BY dept_id;",
      "SELECT dept_id, COUNT(*) * 100.0 / (SELECT COUNT(*) FROM students) AS pct FROM students GROUP BY dept_id;",
      ['পূর্ণসংখ্যা ÷ পূর্ণসংখ্যা SQLite-এ কী দেয়?', 'What does integer ÷ integer give in SQLite?'],
      ['দুটো পূর্ণসংখ্যা ভাগ করলে SQLite দশমিক কেটে দেয় (25 ÷ 16 → 1)। একটাকে দশমিক বানাও: <code>100.0</code>।', 'Dividing two integers truncates in SQLite (25 ÷ 16 → 1). Make one side decimal: <code>100.0</code>.']),
    D('avg-where', 'medium', 'main', ['যাদের CGPA সব শিক্ষার্থীর গড় CGPA-র চেয়ে বেশি, তাদের নাম ও CGPA।', 'Name and CGPA of students whose CGPA is above the overall average.'],
      "SELECT name, cgpa FROM students WHERE cgpa > AVG(cgpa);", "SELECT name, cgpa FROM students WHERE cgpa > (SELECT AVG(cgpa) FROM students);",
      ['গড়টা আলাদা করে আগে বের করতে হবে।', 'The average must be computed separately first.'],
      ['WHERE-এ অ্যাগ্রিগেট চলে না। গড়টা একটি সাবকুয়েরিতে বের করে তুলনা করো: <code>(SELECT AVG(cgpa) FROM students)</code>।', 'Aggregates are not allowed in WHERE. Compute the average in a subquery: <code>(SELECT AVG(cgpa) FROM students)</code>.']),
    D('not-in-null', 'hard', 'main', ['যেসব কর্মচারী কারো ম্যানেজার নন, তাদের নাম।', 'Names of employees who are nobody\'s manager.'],
      "SELECT name FROM employees WHERE id NOT IN (SELECT manager_id FROM employees);",
      "SELECT name FROM employees WHERE id NOT IN (SELECT manager_id FROM employees WHERE manager_id IS NOT NULL);",
      ['সাবকুয়েরির ফলাফলে কি NULL আছে?', 'Does the subquery return a NULL?'],
      ['সাবকুয়েরিতে একটা NULL থাকলেই <code>NOT IN</code> সবসময় "অজানা" — কোনো রো আসে না। NULL বাদ দাও, বা <code>NOT EXISTS</code> ব্যবহার করো।', 'A single NULL in the subquery makes <code>NOT IN</code> always "unknown" — no rows. Exclude NULLs or use <code>NOT EXISTS</code>.']),
    D('second-dup', 'hard', 'job', ['employee_salary টেবিল থেকে দ্বিতীয় সর্বোচ্চ বেতন (একটি মান)।', 'The second highest salary in employee_salary (one value).'],
      "SELECT salary FROM employee_salary ORDER BY salary DESC LIMIT 1 OFFSET 1;", "SELECT DISTINCT salary FROM employee_salary ORDER BY salary DESC LIMIT 1 OFFSET 1;",
      ['একই বেতন একাধিকজনের থাকলে কী হয়?', 'What if several people share the same salary?'],
      ['সর্বোচ্চ বেতন একাধিকজনের হলে দ্বিতীয় রো-তেও সেই একই মান থাকে। <code>DISTINCT</code> দিয়ে আগে আলাদা বেতনগুলো নাও।', 'If the top salary is shared, the second row repeats it. Take distinct salaries first with <code>DISTINCT</code>.']),
    D('update-all', 'medium', 'main', ['শুধু ৩ নম্বর পণ্যের দাম ১০% বাড়াও।', 'Raise the price of product 3 only, by 10%.'],
      "UPDATE products SET price = price * 1.1;", "UPDATE products SET price = price * 1.1 WHERE id = 3;",
      ['কোন রো বদলাবে সেটা বলা হয়নি।', 'The query never says which row to change.'],
      ['WHERE ছাড়া UPDATE টেবিলের <b>সব</b> রো বদলে দেয়। আসল কাজে এটা মারাত্মক — আগে একই WHERE দিয়ে SELECT চালিয়ে দেখে নেওয়া ভালো অভ্যাস।', 'UPDATE without WHERE changes <b>every</b> row. In real work that is a disaster — run a SELECT with the same WHERE first.'], { check: 'SELECT id, price FROM products ORDER BY id;' }),
    D('dup-delete', 'hard', 'main', ['newsletter থেকে ডুপ্লিকেট ইমেইল মুছে ফেলো — প্রতিটি ইমেইলের সবচেয়ে ছোট id-র রোটা রাখো।', 'Delete duplicate emails from newsletter — keep the row with the smallest id for each email.'],
      "DELETE FROM newsletter WHERE id IN (SELECT MIN(id) FROM newsletter GROUP BY email);", "DELETE FROM newsletter WHERE id NOT IN (SELECT MIN(id) FROM newsletter GROUP BY email);",
      ['কোনগুলো রাখার কথা আর কোনগুলো মুছছ?', 'Which rows should stay, and which are you deleting?'],
      ['সাবকুয়েরি প্রতিটি ইমেইলের সবচেয়ে ছোট id দেয় — এগুলোই রাখার কথা। তাই মুছতে হবে যেগুলো এই তালিকায় <b>নেই</b>: <code>NOT IN</code>।', 'The subquery gives the smallest id per email — those are the keepers. Delete the ones <b>not</b> in that list: <code>NOT IN</code>.'], { check: 'SELECT * FROM newsletter ORDER BY id;' }),
    D('having-alias', 'medium', 'job', ['যেসব বিভাগে ২ জনের বেশি কর্মী, তাদের dept_id আর কর্মী সংখ্যা।', 'dept_id and head count of departments with more than 2 employees.'],
      "SELECT dept_id, COUNT(*) AS total FROM emp GROUP BY dept_id HAVING COUNT(*) > 2 ORDER BY dept_id WHERE dept_id IS NOT NULL;",
      "SELECT dept_id, COUNT(*) AS total FROM emp WHERE dept_id IS NOT NULL GROUP BY dept_id HAVING COUNT(*) > 2 ORDER BY dept_id;",
      ['WHERE-এর জায়গা কোথায়?', 'Where does WHERE belong?'],
      ['WHERE সবসময় FROM-এর ঠিক পরে, GROUP BY-এর আগে। ক্রম: SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY।', 'WHERE always comes right after FROM, before GROUP BY. Order: SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY.']),
    D('self-join', 'hard', 'job', ['প্রতিটি কর্মীর নাম আর তার ম্যানেজারের নাম (ম্যানেজার না থাকলেও কর্মী দেখাবে)।', 'Each employee\'s name and their manager\'s name (show employees without a manager too).'],
      "SELECT e.name, m.name FROM emp e JOIN emp m ON e.emp_id = m.manager_id;",
      "SELECT e.name, m.name FROM emp e LEFT JOIN emp m ON e.manager_id = m.emp_id;",
      ['দুটো ভুল আছে: মেলানোর দিক, আর JOIN-এর ধরন।', 'There are two bugs: the direction of the match and the join type.'],
      ['কর্মীর <code>manager_id</code> ম্যানেজারের <code>emp_id</code>-কে নির্দেশ করে, তাই <code>e.manager_id = m.emp_id</code>। আর ম্যানেজারহীন কর্মীদের রাখতে <code>LEFT JOIN</code>।', 'The employee\'s <code>manager_id</code> points to the manager\'s <code>emp_id</code>, so <code>e.manager_id = m.emp_id</code>. Use <code>LEFT JOIN</code> to keep employees without a manager.'])
  ];

  // ───────── কুয়েরি পড়ো ─────────
  // ask: 'rows' (কয়টি রো), 'value' (প্রথম ঘরের মান) — উত্তর রানটাইমে ডেটাবেস থেকে হিসাব হয়; বা হাতে লেখা অপশন (opts + answer)
  const RQ = (id, db, sql, ask, extra = {}) => ({ id, db, sql, ask, ...extra });
  const READ = [
    RQ('r1', 'main', "SELECT DISTINCT city FROM students;", 'rows'),
    RQ('r2', 'main', "SELECT dept_id, COUNT(*) FROM students GROUP BY dept_id;", 'rows'),
    RQ('r3', 'main', "SELECT COUNT(*) FROM students WHERE cgpa >= 3.5;", 'value'),
    RQ('r4', 'main', "SELECT COUNT(*) FROM students s, departments d;", 'value'),
    RQ('r5', 'main', "SELECT d.name FROM departments d LEFT JOIN students s ON s.dept_id = d.id WHERE s.id IS NULL;", 'rows'),
    RQ('r6', 'main', "SELECT COUNT(manager_id) FROM employees;", 'value'),
    RQ('r7', 'main', "SELECT name FROM products ORDER BY price DESC LIMIT 1 OFFSET 2;", 'value'),
    RQ('r8', 'main', "SELECT category FROM products GROUP BY category HAVING COUNT(*) >= 3;", 'rows'),
    RQ('r9', 'main', "SELECT MAX(credit) - MIN(credit) FROM courses;", 'value'),
    RQ('r10', 'job', "SELECT COUNT(*) FROM emp WHERE commission IS NULL;", 'value'),
    RQ('r11', 'job', "SELECT DISTINCT salary FROM emp ORDER BY salary DESC LIMIT 1 OFFSET 1;", 'value', { distract: [85000, 65000, 55000] }),
    RQ('r12', 'job', "SELECT val FROM t UNION SELECT val FROM t;", 'rows'),
    RQ('r13', 'job', "SELECT val FROM t UNION ALL SELECT val FROM t;", 'rows'),
    RQ('r14', 'main', "SELECT COUNT(*) FROM enrollments WHERE marks BETWEEN 70 AND 80;", 'value'),
    RQ('c1', 'main', "SELECT name FROM students WHERE email = NULL;", 'opts', { q: { bn: 'এই কুয়েরি কী ফেরত দেবে?', en: 'What does this query return?' }, opts: [{ bn: 'যাদের ইমেইল নেই তাদের নাম', en: 'Names of students with no email' }, { bn: 'কোনো রো না (খালি ফলাফল)', en: 'No rows (empty result)' }, { bn: 'সব শিক্ষার্থীর নাম', en: 'Every student\'s name' }, { bn: 'এরর', en: 'An error' }], answer: 1 }),
    RQ('c2', 'main', "SELECT dept_id, AVG(cgpa) FROM students WHERE AVG(cgpa) > 3 GROUP BY dept_id;", 'opts', { q: { bn: 'এই কুয়েরি চালালে কী হবে?', en: 'What happens when this runs?' }, opts: [{ bn: 'গড় ৩-এর বেশি এমন বিভাগ আসবে', en: 'Departments with average above 3' }, { bn: 'সব বিভাগ আসবে', en: 'All departments' }, { bn: 'এরর — WHERE-এ অ্যাগ্রিগেট চলে না', en: 'Error — aggregates are not allowed in WHERE' }, { bn: 'খালি ফলাফল', en: 'An empty result' }], answer: 2 }),
    RQ('c3', 'main', "SELECT name FROM employees WHERE id NOT IN (SELECT manager_id FROM employees);", 'opts', { q: { bn: 'manager_id কলামে একটি NULL আছে। কয়টি রো আসবে?', en: 'manager_id contains a NULL. How many rows come back?' }, opts: [{ bn: 'যারা ম্যানেজার নন তারা সবাই', en: 'Everyone who is not a manager' }, { bn: '০টি — NULL-এর কারণে NOT IN সবসময় অজানা', en: '0 — the NULL makes NOT IN always unknown' }, { bn: 'সব কর্মচারী', en: 'All employees' }, { bn: 'এরর', en: 'An error' }], answer: 1 }),
    RQ('c4', 'main', "SELECT name, RANK() OVER (ORDER BY cgpa DESC) AS r FROM students;", 'opts', { q: { bn: 'দুজনের CGPA সমান হলে পরের জনের r কত হবে? (যেমন ১, ২, ২, ?)', en: 'If two students tie, what is the next r? (e.g. 1, 2, 2, ?)' }, opts: [{ bn: '৩', en: '3' }, { bn: '৪', en: '4' }, { bn: '২', en: '2' }, { bn: '৫', en: '5' }], answer: 1 }),
    RQ('c5', 'main', "SELECT d.name, COUNT(s.id) FROM departments d LEFT JOIN students s ON s.dept_id = d.id GROUP BY d.name;", 'opts', { q: { bn: 'কোনো শিক্ষার্থী নেই এমন বিভাগের জন্য কী দেখাবে?', en: 'What is shown for a department with no students?' }, opts: [{ bn: 'বিভাগটি আসবেই না', en: 'The department is missing' }, { bn: 'COUNT = 1', en: 'COUNT = 1' }, { bn: 'COUNT = 0', en: 'COUNT = 0' }, { bn: 'COUNT = NULL', en: 'COUNT = NULL' }], answer: 2 }),
    RQ('c6', 'main', "SELECT 7 / 2, 7 / 2.0;", 'opts', { q: { bn: 'SQLite-এ ফলাফল কী?', en: 'What is the result in SQLite?' }, opts: [{ bn: '3.5, 3.5', en: '3.5, 3.5' }, { bn: '3, 3.5', en: '3, 3.5' }, { bn: '3, 3', en: '3, 3' }, { bn: '4, 3.5', en: '4, 3.5' }], answer: 1 })
  ];

  // রানটাইমে উত্তর ও অপশন
  function readItem(it) {
    if (it.ask === 'opts') return { q: pick(it.q), options: it.opts.map(pick), answer: it.answer };
    const db = SB.freshDb(SB.seedOf(it.db));
    let truth; try { const r = db.exec(it.sql); const last = r[r.length - 1]; truth = it.ask === 'rows' ? (last ? last.values.length : 0) : (last && last.values[0] ? last.values[0][0] : null); } finally { db.close(); }
    const fmt = v => v === null ? 'NULL' : typeof v === 'number' && !Number.isInteger(v) ? String(Math.round(v * 100) / 100) : String(v);
    let opts;
    if (typeof truth === 'number') {
      const seed = [...it.id].reduce((s, c) => s + c.charCodeAt(0), 0);
      const cands = it.distract ? it.distract : [truth + 1, truth - 1, truth + 2, truth * 2, truth - 2, truth + 3, 0].filter(v => v >= 0 && v !== truth);
      const uniq = [...new Set(cands)].slice(0, 3); opts = [truth, ...uniq];
      for (let i = opts.length - 1; i > 0; i--) { const j = (seed * (i + 3)) % (i + 1); [opts[i], opts[j]] = [opts[j], opts[i]]; }
      opts = opts.map(v => (EN() ? fmt(v) : n(fmt(v))));
      return { q: it.ask === 'rows' ? T('এই কুয়েরি কয়টি রো ফেরত দেবে?', 'How many rows does this query return?') : T('ফলাফলে কোন মান আসবে?', 'What value does it return?'), options: opts, answer: opts.indexOf(EN() ? fmt(truth) : n(fmt(truth))) };
    }
    // লেখা মান: অন্য রো থেকে বিকল্প
    const db2 = SB.freshDb(SB.seedOf(it.db));
    let others = []; try { const tbl = (it.sql.match(/FROM\s+(\w+)/i) || [])[1]; const col = (it.sql.match(/SELECT\s+(\w+)/i) || [])[1]; others = db2.exec(`SELECT DISTINCT ${col} FROM ${tbl} LIMIT 12`)[0].values.map(r => String(r[0])).filter(v => v !== String(truth)); } catch (e) { } finally { db2.close(); }
    opts = [String(truth), ...others.slice(0, 3)];
    const seed = it.id.length; for (let i = opts.length - 1; i > 0; i--) { const j = (seed * (i + 5)) % (i + 1); [opts[i], opts[j]] = [opts[j], opts[i]]; }
    return { q: T('ফলাফলে কোন মান আসবে?', 'What value does it return?'), options: opts, answer: opts.indexOf(String(truth)) };
  }

  const st = store.get('sqlbn-skills', { dbg: {}, rd: {} });
  const save = () => { store.set('sqlbn-skills', st); SB.save('skills'); };

  // রিভিউ / মক টেস্টে যুক্ত করা
  SB.extraResolvers = SB.extraResolvers || {};
  SB.extraResolvers.dbg = (key, id) => { const d = DEBUG.find(x => x.id === id); if (!d) return null;
    return { key, kind: 'sql', html: true, seedKey: d.db, q: `${pick(d.task)}<pre class="syntax">${esc(d.bug)}</pre><small class="muted">${T('ওপরের কুয়েরিতে ভুল আছে — ঠিক করে লেখো।', 'The query above has a bug — write the fixed version.')}</small>`, ex: d, hints: [pick(d.hint)], explain: d.explain, level: d.level,
      topic: '🐞 ' + T('ভুল খুঁজে ঠিক করো', 'Find & fix the bug'), src: T('ডিবাগ', 'Debug'), link: '#/debug', tables: tablesOf(d.db), tableInfo: d.db === 'job' ? window.JOB_TABLE_INFO : window.TABLE_INFO }; };
  SB.extraResolvers.rd = (key, id) => { const r = READ.find(x => x.id === id); if (!r || !SB.SQL) return null; const it = readItem(r);
    return { key, kind: 'mcq', html: true, q: `${esc(it.q)}<pre class="syntax">${esc(r.sql)}</pre>`, options: it.options, answer: it.answer, explain: { bn: 'নিচে আসল ফলাফল দেখে মিলিয়ে নাও।', en: 'Compare with the actual result.' }, level: 'easy', topic: '👓 ' + T('কুয়েরি পড়ো', 'Read the query'), src: T('কুয়েরি পড়া', 'Query reading'), link: '#/read' }; };
  SB.extraPools = SB.extraPools || [];
  SB.extraPools.push((okCat, mcq, sql) => { if (okCat('skills')) { DEBUG.forEach(d => sql.push('dbg:' + d.id)); READ.forEach(r => mcq.push('rd:' + r.id)); } });
  SB.extraCats = SB.extraCats || [];
  SB.extraCats.push({ id: 'skills', label: { bn: '🐞 ডিবাগ ও কুয়েরি পড়া', en: '🐞 Debug & query reading' } });
  function tablesOf(db) { return db === 'job' ? Object.keys(window.JOB_TABLE_INFO || {}).filter(x => x !== 't') : Object.keys(window.TABLE_INFO || {}); }

  // ───────── পেজ: ডিবাগ ─────────
  function renderDebug(open) {
    SB.context = { where: 'find-the-bug practice' };
    const done = DEBUG.filter(d => st.dbg[d.id]).length;
    $('#app').innerHTML = `<div class="page"><h1>🐞 ${T('ভুল খুঁজে ঠিক করো', 'Find & Fix the Bug')}</h1>
      <p class="lead">${T('প্রতিটি কুয়েরিতে একটা (কোথাও দুটো) ভুল আছে — পরীক্ষা আর ইন্টারভিউতে ঠিক এই ভুলগুলোই সবচেয়ে বেশি হয়। এডিটরে ভুল কুয়েরিটা দেওয়া আছে; ঠিক করে চালাও, সাথে সাথে যাচাই হবে।', 'Each query has one bug (a few have two) — exactly the mistakes that show up most in exams and interviews. The buggy query is already in the editor; fix it and run to check.')}</p>
      <div class="pbar big"><span style="width:${done * 100 / DEBUG.length}%"></span></div><p class="muted">${n(done)}/${n(DEBUG.length)} ${t('psSolved')}</p>
      <div class="ps-list">${DEBUG.map((d, i) => `<div class="ps-card ${st.dbg[d.id] ? 'solved' : ''}" data-k="${d.id}">
        <div class="ps-head"><span class="ps-num">${n(i + 1)}</span><div class="ps-main"><div class="ps-meta"><span class="lvl ${d.level}">${t(d.level)}</span><span class="ps-src">${d.db === 'job' ? t('jobDb') : t('mainDb')}</span></div>
          <div class="ps-q">${esc(pick(d.task))}</div><pre class="syntax dbg-bug">${esc(d.bug)}</pre></div>
          <button class="btn sm" data-open="${d.id}">${st.dbg[d.id] ? T('আবার', 'Again') : T('ঠিক করো', 'Fix it')}</button></div>
        <div class="ps-work"></div></div>`).join('')}</div></div>`;
    $$('pre.syntax', $('#app')).forEach(SB.highlight);
    const openCard = id => {
      $$('.ps-card.open').forEach(c => { c.classList.remove('open'); $('.ps-work', c).innerHTML = ''; });
      const card = $(`.ps-card[data-k="${id}"]`); if (!card) return;
      const d = DEBUG.find(x => x.id === id); card.classList.add('open');
      const dk = 'sqlbn-dbg-draft-' + id; if (store.get(dk, null) === null) store.set(dk, d.bug);
      SB.practice($('.ps-work', card), {
        ex: d, seedKey: d.db, reviewKey: 'dbg:' + d.id, draftKey: dk, tables: tablesOf(d.db), tableInfo: d.db === 'job' ? window.JOB_TABLE_INFO : window.TABLE_INFO,
        hints: [pick(d.hint)], explain: d.explain, where: 'find-the-bug', title: pick(d.task), task: pick(d.task) + '\nBuggy query: ' + d.bug,
        isSolved: () => !!st.dbg[d.id], onSolved: () => { st.dbg[d.id] = true; save(); card.classList.add('solved'); },
        nextHtml: () => { const nx = DEBUG[DEBUG.indexOf(d) + 1]; return nx ? `<button class="btn sm primary" data-open="${nx.id}">${T('পরেরটা →', 'Next →')}</button>` : ''; }
      });
      card.scrollIntoView({ block: 'start', behavior: 'smooth' });
    };
    $('#app').onclick = e => { const b = e.target.closest('[data-open]'); if (b) openCard(b.dataset.open); };
    if (open) openCard(open);
  }

  // ───────── পেজ: কুয়েরি পড়ো ─────────
  function renderRead() {
    SB.context = { where: 'query reading quiz' };
    const done = READ.filter(r => st.rd[r.id] !== undefined).length, right = READ.filter(r => st.rd[r.id] && st.rd[r.id].ok).length;
    $('#app').innerHTML = `<div class="page"><h1>👓 ${T('কুয়েরি পড়ো', 'Read the Query')}</h1>
      <p class="lead">${T('কুয়েরি না চালিয়ে মাথায় হিসাব করো — কয়টি রো আসবে, কোন মান আসবে। উত্তর দেওয়ার পর আসল ফলাফল আর ধাপে ধাপে ব্যাখ্যা দেখাবে। ভাইভা আর MCQ-তে এই দক্ষতাই লাগে।', 'Work it out in your head without running it — how many rows, which value. After you answer you see the real result and a step-by-step explanation. This is the skill viva and MCQ rounds test.')}</p>
      <p class="muted">${n(done)}/${n(READ.length)} ${T('উত্তর দেওয়া', 'answered')} · ✅ ${n(right)}</p>
      <div class="rd-list">${READ.map((r, i) => { const it = readItem(r); const s = st.rd[r.id];
        return `<div class="rd-card ${s ? (s.ok ? 'ok' : 'bad') : ''}" data-r="${r.id}"><div class="rd-head"><span class="ps-num">${n(i + 1)}</span><b>${esc(it.q)}</b><span class="ps-src">${r.db === 'job' ? t('jobDb') : t('mainDb')}</span></div>
          <pre class="syntax">${esc(r.sql)}</pre>
          <div class="quiz-opts">${it.options.map((o, k) => `<button class="quiz-opt ${s ? (k === it.answer ? 'correct' : k === s.c ? 'wrong' : '') : ''}" data-k="${k}" ${s ? 'disabled' : ''}>${(EN() ? 'abcd' : 'কখগঘ')[k]}) ${esc(o)}</button>`).join('')}</div>
          <div class="rd-after">${s ? afterHTML(r) : ''}</div></div>`; }).join('')}</div>
      <div class="toolbar"><button class="btn sm ghost" id="rdReset">${T('সব উত্তর মুছে আবার শুরু', 'Reset all answers')}</button></div></div>`;
    $$('pre.syntax', $('#app')).forEach(SB.highlight);
    $$('.rd-card').forEach(c => { if (st.rd[c.dataset.r]) fillAfter(c); });
    $('#app').onclick = e => {
      if (e.target.id === 'rdReset') { st.rd = {}; save(); renderRead(); return; }
      const b = e.target.closest('.quiz-opt'); if (!b || b.disabled) return;
      const card = b.closest('.rd-card'), r = READ.find(x => x.id === card.dataset.r), it = readItem(r), k = +b.dataset.k, ok = k === it.answer;
      st.rd[r.id] = { c: k, ok }; save(); SB.review.record('rd:' + r.id, ok); if (ok) SB.recordActivity();
      $$('.quiz-opt', card).forEach((o, j) => { o.disabled = true; if (j === it.answer) o.classList.add('correct'); else if (j === k) o.classList.add('wrong'); });
      card.classList.add(ok ? 'ok' : 'bad'); $('.rd-after', card).innerHTML = afterHTML(r); fillAfter(card);
    };
  }
  function afterHTML(r) { return `<div class="rd-res"></div><details class="rd-xp" open><summary>🧠 ${T('ধাপে ধাপে ব্যাখ্যা', 'Step-by-step explanation')}</summary><div class="rd-xpb"></div></details>`; }
  function fillAfter(card) {
    const r = READ.find(x => x.id === card.dataset.r);
    $('.rd-res', card).innerHTML = SB.runInline(r.sql, SB.seedOf(r.db));
    if (SB.renderExplain) SB.renderExplain($('.rd-xpb', card), r.sql);
  }

  SB.pages = SB.pages || {};
  SB.pages.debug = p1 => renderDebug(p1);
  SB.pages.read = () => renderRead();
  SB.skills = { DEBUG, READ, readItem, state: st };
})();
