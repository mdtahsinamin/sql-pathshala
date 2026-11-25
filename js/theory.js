/* DBMS তত্ত্ব — চাকরির পরীক্ষা (ব্যাংক IT, BPSC, লেকচারার) ও ভাইভার জন্য; প্রতিটি টপিকে MCQ, আর FD/নরমালাইজেশন ক্যালকুলেটর */
(function () {
  'use strict';
  const { $, $$, esc, store, n, pick } = SB;
  const EN = () => I18N.lang === 'en';
  const T = (bn, en) => (EN() ? en : bn);
  // Q(প্রশ্ন[bn,en], অপশন (একই হলে স্ট্রিং, আলাদা হলে [bn,en]), সঠিক index, ব্যাখ্যা[bn,en])
  const Q = (q, opts, answer, ex) => ({ q: { bn: q[0], en: q[1] }, options: opts.map(o => Array.isArray(o) ? { bn: o[0], en: o[1] } : { bn: o, en: o }), answer, explain: { bn: ex[0], en: ex[1] } });

  const TOPICS = [
    { id: 'intro', icon: '🏛️', title: { bn: 'DBMS পরিচিতি ও আর্কিটেকচার', en: 'DBMS basics & architecture' },
      content: {
        bn: `<p><b>ডেটাবেস</b> হলো সম্পর্কিত ডেটার গোছানো সংগ্রহ। <b>DBMS</b> (Database Management System) সেই ডেটা রাখা, খোঁজা, বদলানো আর সুরক্ষার সফটওয়্যার — যেমন MySQL, Oracle, PostgreSQL, SQL Server, SQLite।</p>
<h3>ফাইল সিস্টেমের সমস্যা যা DBMS সমাধান করে</h3>
<ul><li><b>Data redundancy ও inconsistency</b> — একই তথ্য একাধিক ফাইলে, একটায় বদলালে অন্যটায় পুরোনো থাকে।</li><li><b>Data isolation</b> — ভিন্ন ফরম্যাটের ফাইল থেকে ডেটা একসাথে আনা কঠিন।</li><li><b>Integrity</b> নিয়ম (যেমন ব্যালান্স ঋণাত্মক হবে না) কোডে ছড়িয়ে থাকে।</li><li><b>Atomicity</b> — মাঝপথে ক্র্যাশ হলে অর্ধেক কাজ থেকে যায়।</li><li><b>Concurrent access</b> আর <b>security</b>-এর সমস্যা।</li></ul>
<h3>তিন স্তরের আর্কিটেকচার (ANSI/SPARC)</h3>
<ul><li><b>External / View level</b> — প্রতিটি ইউজার যা দেখে (view)।</li><li><b>Conceptual / Logical level</b> — পুরো ডেটাবেসের গঠন: টেবিল, সম্পর্ক, constraint।</li><li><b>Internal / Physical level</b> — ডিস্কে আসলে কীভাবে রাখা: ফাইল, ইনডেক্স, ব্লক।</li></ul>
<h3>Data independence</h3>
<ul><li><b>Logical</b> — কনসেপচুয়াল স্কিমা বদলালেও (যেমন নতুন কলাম) external view/অ্যাপ বদলাতে হয় না। এটা অর্জন করা কঠিন।</li><li><b>Physical</b> — স্টোরেজ বদলালেও (যেমন নতুন ইনডেক্স) কনসেপচুয়াল স্কিমা বদলায় না।</li></ul>
<h3>Schema বনাম Instance</h3><p><b>Schema</b> = গঠন (কদাচিৎ বদলায়), <b>Instance</b> = কোনো মুহূর্তের ডেটা (সবসময় বদলায়)।</p>
<h3>SQL-এর ভাগ</h3>
<table class="th-tbl"><tr><th>ভাগ</th><th>কাজ</th><th>কমান্ড</th></tr><tr><td>DDL</td><td>গঠন</td><td>CREATE, ALTER, DROP, TRUNCATE, RENAME</td></tr><tr><td>DML</td><td>ডেটা বদল</td><td>INSERT, UPDATE, DELETE, MERGE</td></tr><tr><td>DQL</td><td>ডেটা পড়া</td><td>SELECT</td></tr><tr><td>DCL</td><td>অনুমতি</td><td>GRANT, REVOKE</td></tr><tr><td>TCL</td><td>ট্রানজ্যাকশন</td><td>COMMIT, ROLLBACK, SAVEPOINT</td></tr></table>
<h3>ডেটা মডেল</h3><p>Hierarchical (গাছ), Network (গ্রাফ), <b>Relational</b> (টেবিল — E. F. Codd, ১৯৭০), Object-oriented, NoSQL (document, key-value, column, graph)।</p>
<h3>DBA-এর কাজ</h3><p>স্কিমা ডিজাইন, স্টোরেজ ও ইনডেক্স, ইউজার ও অনুমতি, ব্যাকআপ-রিকভারি, পারফরম্যান্স টিউনিং।</p>`,
        en: `<p>A <b>database</b> is an organised collection of related data. A <b>DBMS</b> is the software that stores, queries, changes and protects it — MySQL, Oracle, PostgreSQL, SQL Server, SQLite.</p>
<h3>File-system problems a DBMS solves</h3>
<ul><li><b>Redundancy & inconsistency</b> — the same fact in many files; update one and the others go stale.</li><li><b>Data isolation</b> — data scattered in different formats.</li><li><b>Integrity</b> rules buried in application code.</li><li><b>Atomicity</b> — a crash midway leaves half-done work.</li><li><b>Concurrent access</b> and <b>security</b> problems.</li></ul>
<h3>Three-level architecture (ANSI/SPARC)</h3>
<ul><li><b>External / view level</b> — what each user sees.</li><li><b>Conceptual / logical level</b> — the whole database structure: tables, relationships, constraints.</li><li><b>Internal / physical level</b> — how data is stored on disk: files, indexes, blocks.</li></ul>
<h3>Data independence</h3>
<ul><li><b>Logical</b> — change the conceptual schema (e.g. add a column) without changing views/apps. Harder to achieve.</li><li><b>Physical</b> — change storage (e.g. add an index) without changing the conceptual schema.</li></ul>
<h3>Schema vs instance</h3><p><b>Schema</b> = the structure (rarely changes); <b>instance</b> = the data at a moment (changes constantly).</p>
<h3>Sub-languages of SQL</h3>
<table class="th-tbl"><tr><th>Group</th><th>Purpose</th><th>Commands</th></tr><tr><td>DDL</td><td>structure</td><td>CREATE, ALTER, DROP, TRUNCATE, RENAME</td></tr><tr><td>DML</td><td>change data</td><td>INSERT, UPDATE, DELETE, MERGE</td></tr><tr><td>DQL</td><td>read data</td><td>SELECT</td></tr><tr><td>DCL</td><td>permissions</td><td>GRANT, REVOKE</td></tr><tr><td>TCL</td><td>transactions</td><td>COMMIT, ROLLBACK, SAVEPOINT</td></tr></table>
<h3>Data models</h3><p>Hierarchical (tree), Network (graph), <b>Relational</b> (tables — E. F. Codd, 1970), Object-oriented, NoSQL (document, key-value, column, graph).</p>
<h3>Role of the DBA</h3><p>Schema design, storage and indexes, users and privileges, backup and recovery, performance tuning.</p>` },
      quiz: [
        Q(['ডেটাবেসের গঠন বদলালেও অ্যাপ্লিকেশন প্রোগ্রাম না বদলানোর ক্ষমতাকে কী বলে?', 'The ability to change the schema without changing application programs is called'], [['Logical data independence', 'Logical data independence'], 'Physical data independence', 'Data abstraction', 'Data integrity'], 0, ['কনসেপচুয়াল স্কিমা বদলালেও external view/অ্যাপ অপরিবর্তিত থাকা = logical data independence।', 'Changing the conceptual schema without affecting external views/apps = logical data independence.']),
        Q(['TRUNCATE কোন ভাগের কমান্ড?', 'TRUNCATE belongs to which group?'], ['DML', 'DDL', 'DCL', 'TCL'], 1, ['TRUNCATE টেবিলের ডেটা একবারে মুছলেও এটা DDL — অনেক DBMS-এ ROLLBACK করা যায় না এবং auto-commit হয়।', 'Although it removes data, TRUNCATE is DDL — in many DBMSs it auto-commits and cannot be rolled back.']),
        Q(['কোন স্তর বর্ণনা করে ডেটা ডিস্কে কীভাবে রাখা হয়?', 'Which level describes how data is stored on disk?'], ['External', 'Conceptual', 'Internal', 'View'], 2, ['Internal (physical) level স্টোরেজ, ফাইল, ইনডেক্সের বিবরণ রাখে।', 'The internal (physical) level describes storage, files and indexes.']),
        Q(['কোনো নির্দিষ্ট মুহূর্তে ডেটাবেসে থাকা ডেটাকে কী বলে?', 'The data in the database at a particular moment is called'], ['Schema', 'Instance', 'Metadata', 'Data dictionary'], 1, ['Instance = বর্তমান ডেটা; schema = গঠন।', 'Instance = current data; schema = structure.']),
        Q(['Relational model কে প্রস্তাব করেন?', 'Who proposed the relational model?'], ['Peter Chen', 'E. F. Codd', 'Charles Bachman', 'Raymond Boyce'], 1, ['E. F. Codd, ১৯৭০ (IBM)। Peter Chen ER মডেল দেন।', 'E. F. Codd, 1970 (IBM). Peter Chen introduced the ER model.']),
        Q(['GRANT ও REVOKE কোন ধরনের কমান্ড?', 'GRANT and REVOKE are'], ['DDL', 'DML', 'DCL', 'TCL'], 2, ['অনুমতি দেওয়া/নেওয়া — Data Control Language।', 'Giving/removing privileges — Data Control Language.']),
        Q(['ডেটাবেস সম্পর্কিত ডেটা (টেবিলের নাম, কলাম, টাইপ) কোথায় থাকে?', 'Where is data about the database (table names, columns, types) kept?'], ['Data dictionary (system catalog)', 'Log file', 'Buffer', 'Index'], 0, ['মেটাডেটা থাকে data dictionary/system catalog-এ (SQLite-এ sqlite_master)।', 'Metadata lives in the data dictionary/system catalog (sqlite_master in SQLite).']),
        Q(['কোনটি DBMS-এর সুবিধা নয়?', 'Which is NOT an advantage of a DBMS?'], [['ডেটা redundancy কমানো', 'Reduced redundancy'], ['Concurrent access নিয়ন্ত্রণ', 'Controlled concurrent access'], ['কম খরচ ও কম জটিলতা', 'Lower cost and complexity'], ['Backup ও recovery', 'Backup and recovery']], 2, ['DBMS-এর হার্ডওয়্যার, সফটওয়্যার, প্রশিক্ষণ খরচ ও জটিলতা বেশি — এটাই এর অসুবিধা।', 'A DBMS costs more (hardware, software, training) and is more complex — a disadvantage.'])
      ] },

    { id: 'er', icon: '🔷', title: { bn: 'ER মডেল ও টেবিলে রূপান্তর', en: 'ER model & mapping to tables' },
      content: {
        bn: `<p><b>ER (Entity-Relationship) মডেল</b> (Peter Chen, ১৯৭৬) ডেটাবেসের নকশা আঁকার উপায়।</p>
<ul><li><b>Entity</b> — আলাদা করে চেনা যায় এমন বস্তু (একজন ছাত্র)। <b>Entity set</b> — একই ধরনের সব (সব ছাত্র)। চিহ্ন: আয়তক্ষেত্র।</li>
<li><b>Weak entity</b> — নিজের কোনো key নেই, owner entity-র উপর নির্ভরশীল (যেমন কর্মচারীর Dependent)। চিহ্ন: দ্বিগুণ আয়তক্ষেত্র; এর আংশিক key-কে <b>discriminator / partial key</b> বলে (ড্যাশ দাগ)।</li>
<li><b>Attribute</b> (উপবৃত্ত): <i>simple</i> (বয়স), <i>composite</i> (নাম = প্রথম+শেষ), <i>multivalued</i> (একাধিক ফোন — দ্বিগুণ উপবৃত্ত), <i>derived</i> (জন্মতারিখ থেকে বয়স — ড্যাশ উপবৃত্ত), <i>key</i> (আন্ডারলাইন)।</li>
<li><b>Relationship</b> (রম্বস) — entity-দের মধ্যে সম্পর্ক। <b>Degree</b>: unary (নিজের সাথে), binary, ternary।</li>
<li><b>Cardinality</b>: 1:1, 1:N, M:N।</li><li><b>Participation</b>: total (প্রতিটিকে অংশ নিতেই হবে — দ্বিগুণ রেখা) বা partial।</li>
<li><b>Generalization</b> (নিচ থেকে ওপরে সাধারণীকরণ), <b>Specialization</b> (ওপর থেকে নিচে ভাগ), <b>Aggregation</b> (সম্পর্ককে entity হিসেবে দেখা)।</li></ul>
<h3>ER → টেবিল</h3>
<ul><li>প্রতিটি strong entity → একটি টেবিল; key → primary key।</li><li><b>1:N</b> → N-দিকের টেবিলে 1-দিকের PK foreign key হিসেবে যোগ।</li><li><b>1:1</b> → যেকোনো একদিকে FK (total participation যে দিকে, সেদিকে ভালো)।</li><li><b>M:N</b> → নতুন টেবিল, যেখানে দুই দিকের PK মিলে composite PK (যেমন <code>enrollments(student_id, course_id)</code>)।</li><li><b>Multivalued attribute</b> → আলাদা টেবিল (id, value)।</li><li><b>Weak entity</b> → টেবিলে owner-এর PK + partial key = PK।</li><li>Composite attribute → উপাদানগুলো আলাদা কলাম; derived attribute সাধারণত রাখা হয় না।</li></ul>`,
        en: `<p>The <b>Entity-Relationship model</b> (Peter Chen, 1976) is a way to draw a database design.</p>
<ul><li><b>Entity</b> — a distinguishable thing (a student). <b>Entity set</b> — all of one kind. Symbol: rectangle.</li>
<li><b>Weak entity</b> — has no key of its own and depends on an owner (an employee's Dependent). Double rectangle; its partial key is the <b>discriminator</b> (dashed underline).</li>
<li><b>Attributes</b> (ellipses): <i>simple</i>, <i>composite</i> (name = first + last), <i>multivalued</i> (several phones — double ellipse), <i>derived</i> (age from birth date — dashed ellipse), <i>key</i> (underlined).</li>
<li><b>Relationship</b> (diamond). <b>Degree</b>: unary, binary, ternary.</li>
<li><b>Cardinality</b>: 1:1, 1:N, M:N. <b>Participation</b>: total (double line) or partial.</li>
<li><b>Generalization</b> (bottom-up), <b>specialization</b> (top-down), <b>aggregation</b> (treat a relationship as an entity).</li></ul>
<h3>ER → tables</h3>
<ul><li>Each strong entity → a table; its key → primary key.</li><li><b>1:N</b> → put the 1-side's PK as a foreign key in the N-side table.</li><li><b>1:1</b> → FK on either side (prefer the total-participation side).</li><li><b>M:N</b> → a new table whose PK combines both sides' PKs (e.g. <code>enrollments(student_id, course_id)</code>).</li><li><b>Multivalued attribute</b> → its own table (id, value).</li><li><b>Weak entity</b> → owner's PK + partial key = PK.</li><li>Composite attributes → separate columns; derived attributes are usually not stored.</li></ul>` },
      quiz: [
        Q(['ER ডায়াগ্রামে weak entity-কে কোন চিহ্ন দিয়ে দেখানো হয়?', 'In an ER diagram a weak entity is shown by'], [['দ্বিগুণ আয়তক্ষেত্র', 'A double rectangle'], ['রম্বস', 'A diamond'], ['দ্বিগুণ উপবৃত্ত', 'A double ellipse'], ['ড্যাশ উপবৃত্ত', 'A dashed ellipse']], 0, ['দ্বিগুণ আয়তক্ষেত্র = weak entity; দ্বিগুণ উপবৃত্ত = multivalued attribute; ড্যাশ উপবৃত্ত = derived।', 'Double rectangle = weak entity; double ellipse = multivalued; dashed ellipse = derived.']),
        Q(['একজন ছাত্রের একাধিক ফোন নম্বর — এটা কোন ধরনের attribute?', 'A student having several phone numbers is a'], ['Composite', 'Derived', 'Multivalued', 'Key'], 2, ['একাধিক মান = multivalued; টেবিলে আলাদা টেবিল লাগে।', 'Several values = multivalued; it needs its own table.']),
        Q(['M:N সম্পর্ককে relational টেবিলে রূপান্তর করতে কী লাগে?', 'Mapping an M:N relationship to tables needs'], [['একদিকে foreign key', 'A foreign key on one side'], ['একটি নতুন টেবিল যার PK দুই দিকের PK মিলে', 'A new table whose PK combines both PKs'], ['দুই টেবিল একত্র করা', 'Merging both tables'], ['কিছুই লাগে না', 'Nothing']], 1, ['M:N-এর জন্য junction/bridge টেবিল (যেমন enrollments)।', 'M:N needs a junction/bridge table (like enrollments).']),
        Q(['বয়স জন্মতারিখ থেকে হিসাব করা যায় — বয়স কোন attribute?', 'Age computed from date of birth is a'], ['Stored', 'Derived', 'Composite', 'Multivalued'], 1, ['অন্য attribute থেকে হিসাব করা যায় = derived।', 'Computable from another attribute = derived.']),
        Q(['1:N সম্পর্কে foreign key কোন টেবিলে বসে?', 'In a 1:N relationship the foreign key goes in'], [['1-দিকের টেবিলে', 'The 1-side table'], ['N-দিকের টেবিলে', 'The N-side table'], ['দুটোতেই', 'Both'], ['নতুন টেবিলে', 'A new table']], 1, ['প্রতিটি N-দিকের রো একটি 1-দিকের রোকে নির্দেশ করে, যেমন students.dept_id → departments.id।', 'Each N-side row points to one 1-side row, e.g. students.dept_id → departments.id.']),
        Q(['ER মডেল কে প্রস্তাব করেন?', 'Who proposed the ER model?'], ['E. F. Codd', 'Peter Chen', 'Boyce', 'Ullman'], 1, ['Peter Chen, ১৯৭৬।', 'Peter Chen, 1976.']),
        Q(['ওপরের সাধারণ entity থেকে নিচে বিশেষ sub-entity বানানোকে কী বলে?', 'Defining sub-entities from a general entity (top-down) is'], ['Generalization', 'Specialization', 'Aggregation', 'Normalization'], 1, ['Top-down = specialization; bottom-up = generalization।', 'Top-down = specialization; bottom-up = generalization.']),
        Q(['প্রতিটি কর্মচারীকে অবশ্যই কোনো বিভাগে কাজ করতে হবে — এটা কোন participation?', 'Every employee must work in some department — this participation is'], ['Partial', 'Total', 'Optional', 'Recursive'], 1, ['"অবশ্যই" = total participation (দ্বিগুণ রেখা)।', '"Must" = total participation (double line).'])
      ] },

    { id: 'keys', icon: '🔑', title: { bn: 'Key ও Integrity Constraint', en: 'Keys & integrity constraints' },
      content: {
        bn: `<ul><li><b>Super key</b> — এক বা একাধিক কলাম যা প্রতিটি রোকে অনন্যভাবে চেনায় (অতিরিক্ত কলাম থাকতে পারে)।</li>
<li><b>Candidate key</b> — <i>minimal</i> super key: কোনো কলাম বাদ দিলে আর অনন্য থাকে না।</li>
<li><b>Primary key</b> — candidate key-গুলোর মধ্যে বেছে নেওয়া একটি; NULL হতে পারে না, অনন্য।</li>
<li><b>Alternate key</b> — বাকি candidate key-গুলো (প্রায়ই UNIQUE দিয়ে রাখা হয়)।</li>
<li><b>Composite key</b> — একাধিক কলাম মিলে key।</li><li><b>Foreign key</b> — অন্য (বা একই) টেবিলের PK/UNIQUE কলামকে নির্দেশ করে।</li>
<li><b>Surrogate key</b> — অর্থহীন কৃত্রিম id (AUTO_INCREMENT); <b>Natural key</b> — বাস্তব অর্থপূর্ণ (NID নম্বর)।</li></ul>
<p>সম্পর্ক: সব candidate key super key, কিন্তু সব super key candidate key নয়। <b>n</b>টি attribute-এর টেবিলে একটি candidate key একক attribute হলে super key-এর সংখ্যা <b>2<sup>n−1</sup></b>।</p>
<h3>Integrity constraint</h3>
<ul><li><b>Domain</b> — কলামের মান নির্দিষ্ট টাইপ/সীমার মধ্যে (CHECK, NOT NULL)।</li><li><b>Entity integrity</b> — primary key কখনো NULL নয়।</li><li><b>Referential integrity</b> — foreign key-এর মান হয় NULL, নয়তো মূল টেবিলে আছে। মূল রো মুছলে: CASCADE, SET NULL, SET DEFAULT, RESTRICT/NO ACTION।</li><li><b>Key constraint</b> — UNIQUE/PK-তে ডুপ্লিকেট নয়।</li></ul>`,
        en: `<ul><li><b>Super key</b> — one or more columns that uniquely identify each row (may contain extra columns).</li>
<li><b>Candidate key</b> — a <i>minimal</i> super key: drop any column and it is no longer unique.</li>
<li><b>Primary key</b> — the candidate key chosen; unique and never NULL.</li><li><b>Alternate key</b> — the remaining candidate keys (often declared UNIQUE).</li>
<li><b>Composite key</b> — a key made of several columns.</li><li><b>Foreign key</b> — refers to the PK/UNIQUE column of another (or the same) table.</li>
<li><b>Surrogate key</b> — a meaningless generated id; <b>natural key</b> — meaningful in the real world (national ID).</li></ul>
<p>Every candidate key is a super key, not vice versa. With <b>n</b> attributes and a single-attribute candidate key, there are <b>2<sup>n−1</sup></b> super keys.</p>
<h3>Integrity constraints</h3>
<ul><li><b>Domain</b> — values within a type/range (CHECK, NOT NULL).</li><li><b>Entity integrity</b> — the primary key is never NULL.</li><li><b>Referential integrity</b> — a foreign key is NULL or exists in the parent. On parent delete: CASCADE, SET NULL, SET DEFAULT, RESTRICT/NO ACTION.</li><li><b>Key constraint</b> — no duplicates in UNIQUE/PK.</li></ul>` },
      quiz: [
        Q(['Minimal super key-কে কী বলে?', 'A minimal super key is a'], ['Primary key', 'Candidate key', 'Foreign key', 'Alternate key'], 1, ['যে super key থেকে কিছু বাদ দেওয়া যায় না = candidate key।', 'A super key with nothing removable = candidate key.']),
        Q(['Primary key NULL হতে পারে না — এই নিয়মের নাম?', 'The rule that a primary key cannot be NULL is'], ['Referential integrity', 'Entity integrity', 'Domain integrity', 'Key constraint'], 1, ['Entity integrity।', 'Entity integrity.']),
        Q(['R(A, B, C, D)-তে A একমাত্র candidate key। super key কয়টি?', 'In R(A, B, C, D) A is the only candidate key. How many super keys?'], ['4', '7', '8', '16'], 2, ['A থাকতেই হবে, বাকি ৩টি থাকতে বা না থাকতে পারে: 2³ = 8।', 'A must be present; each of the other 3 may or may not be: 2³ = 8.']),
        Q(['মূল টেবিলের রো মুছলে সংশ্লিষ্ট child রোগুলোও মুছে যাক — কোন অপশন?', 'Delete child rows automatically when the parent is deleted:'], ['ON DELETE SET NULL', 'ON DELETE CASCADE', 'ON DELETE RESTRICT', 'ON UPDATE CASCADE'], 1, ['CASCADE = সাথে সাথে child-ও মুছে যায়।', 'CASCADE deletes the children too.']),
        Q(['Foreign key-এর মান কী হতে পারে?', 'A foreign key value can be'], [['শুধু মূল টেবিলে থাকা মান', 'Only a value present in the parent'], ['মূল টেবিলে থাকা মান বা NULL', 'A value in the parent, or NULL'], ['যেকোনো মান', 'Any value'], ['শুধু NULL', 'Only NULL']], 1, ['NOT NULL না দিলে FK NULL হতে পারে; নইলে মূল টেবিলে থাকতে হবে।', 'Unless NOT NULL, a FK may be NULL; otherwise it must exist in the parent.']),
        Q(['যে candidate key primary key হিসেবে বাছা হয়নি, তাকে কী বলে?', 'A candidate key not chosen as primary key is called'], ['Super key', 'Alternate key', 'Foreign key', 'Surrogate key'], 1, ['Alternate (secondary) key।', 'Alternate (secondary) key.']),
        Q(['একটি টেবিলে কয়টি primary key থাকতে পারে?', 'How many primary keys can a table have?'], [['একটি (একাধিক কলাম মিলে হতে পারে)', 'One (possibly multi-column)'], ['যত খুশি', 'Any number'], ['দুটি', 'Two'], ['একটিও না', 'None']], 0, ['একটিই PK, তবে সেটা composite হতে পারে। UNIQUE অনেকগুলো থাকতে পারে।', 'Exactly one PK, though it can be composite. There can be many UNIQUE constraints.']),
        Q(['AUTO_INCREMENT দিয়ে বানানো অর্থহীন id-কে কী বলে?', 'A meaningless generated id (AUTO_INCREMENT) is a'], ['Natural key', 'Surrogate key', 'Composite key', 'Super key'], 1, ['Surrogate key।', 'Surrogate key.'])
      ] },

    { id: 'algebra', icon: '∑', title: { bn: 'Relational Algebra', en: 'Relational algebra' },
      content: {
        bn: `<p>Relational algebra হলো টেবিলের উপর অপারেশনের গাণিতিক ভাষা — SQL-এর ভিত্তি। প্রতিটি অপারেশন একটি টেবিল দেয়।</p>
<table class="th-tbl"><tr><th>অপারেশন</th><th>চিহ্ন</th><th>কাজ</th><th>SQL</th></tr>
<tr><td>Selection</td><td>σ</td><td>শর্ত মেলে এমন রো</td><td><code>WHERE</code></td></tr>
<tr><td>Projection</td><td>π</td><td>নির্দিষ্ট কলাম (ডুপ্লিকেট বাদ)</td><td><code>SELECT DISTINCT col</code></td></tr>
<tr><td>Union</td><td>∪</td><td>দুটোর সব রো</td><td><code>UNION</code></td></tr><tr><td>Set difference</td><td>−</td><td>প্রথমটায় আছে, দ্বিতীয়টায় নেই</td><td><code>EXCEPT</code></td></tr>
<tr><td>Intersection</td><td>∩</td><td>দুটোতেই আছে</td><td><code>INTERSECT</code></td></tr><tr><td>Cartesian product</td><td>×</td><td>সব জোড়া</td><td><code>CROSS JOIN</code></td></tr>
<tr><td>Rename</td><td>ρ</td><td>নাম বদল</td><td><code>AS</code></td></tr><tr><td>Natural join</td><td>⋈</td><td>একই নামের কলামে মেলানো</td><td><code>NATURAL JOIN</code></td></tr>
<tr><td>Theta join</td><td>⋈<sub>θ</sub></td><td>শর্তে জোড়া = σ<sub>θ</sub>(R × S)</td><td><code>JOIN … ON</code></td></tr><tr><td>Division</td><td>÷</td><td>"সবগুলোর সাথে" সম্পর্ক</td><td><code>NOT EXISTS … NOT EXISTS</code></td></tr></table>
<p><b>মৌলিক (basic) অপারেশন:</b> σ, π, ∪, −, ×, ρ। বাকিগুলো (∩, ⋈, ÷) এগুলো দিয়ে বানানো যায়: R ∩ S = R − (R − S)।</p>
<p>Union/difference/intersection-এর জন্য দুই টেবিল <b>union-compatible</b> হতে হবে: কলাম সংখ্যা সমান, ডোমেইন মেলে।</p>
<p>R-এ m রো, S-এ n রো হলে R × S-এ m × n রো; কলাম = দুটোর যোগফল।</p>
<h3>উদাহরণ</h3><p>π<sub>name</sub>(σ<sub>cgpa &gt; 3.5</sub>(students))  ≡</p><pre class="ex">SELECT DISTINCT name FROM students WHERE cgpa > 3.5;</pre>
<p>π<sub>s.name, d.name</sub>(students ⋈<sub>students.dept_id = departments.id</sub> departments)  ≡</p><pre class="ex">SELECT s.name, d.name FROM students s JOIN departments d ON s.dept_id = d.id;</pre>
<p><b>Division</b>: যেসব শিক্ষার্থী <i>সব</i> কোর্স নিয়েছে — enrollments(student_id, course_id) ÷ courses(id)।</p>
<p><b>Relational calculus</b> হলো nonprocedural (কী চাই বলে, কীভাবে নয়) — Tuple RC আর Domain RC। Algebra procedural।</p>`,
        en: `<p>Relational algebra is the mathematical language of operations on tables — the foundation of SQL. Every operation returns a table.</p>
<table class="th-tbl"><tr><th>Operation</th><th>Symbol</th><th>Meaning</th><th>SQL</th></tr>
<tr><td>Selection</td><td>σ</td><td>rows matching a condition</td><td><code>WHERE</code></td></tr><tr><td>Projection</td><td>π</td><td>chosen columns (no duplicates)</td><td><code>SELECT DISTINCT col</code></td></tr>
<tr><td>Union</td><td>∪</td><td>rows of both</td><td><code>UNION</code></td></tr><tr><td>Set difference</td><td>−</td><td>in first, not in second</td><td><code>EXCEPT</code></td></tr>
<tr><td>Intersection</td><td>∩</td><td>in both</td><td><code>INTERSECT</code></td></tr><tr><td>Cartesian product</td><td>×</td><td>every pair</td><td><code>CROSS JOIN</code></td></tr>
<tr><td>Rename</td><td>ρ</td><td>rename</td><td><code>AS</code></td></tr><tr><td>Natural join</td><td>⋈</td><td>match same-named columns</td><td><code>NATURAL JOIN</code></td></tr>
<tr><td>Theta join</td><td>⋈<sub>θ</sub></td><td>σ<sub>θ</sub>(R × S)</td><td><code>JOIN … ON</code></td></tr><tr><td>Division</td><td>÷</td><td>"related to all"</td><td><code>NOT EXISTS … NOT EXISTS</code></td></tr></table>
<p><b>Basic operations:</b> σ, π, ∪, −, ×, ρ. Others (∩, ⋈, ÷) derive from them: R ∩ S = R − (R − S).</p>
<p>∪, −, ∩ require <b>union-compatible</b> relations: same number of columns with matching domains.</p>
<p>If R has m rows and S has n rows, R × S has m × n rows and the columns of both.</p>
<h3>Examples</h3><p>π<sub>name</sub>(σ<sub>cgpa &gt; 3.5</sub>(students)) ≡</p><pre class="ex">SELECT DISTINCT name FROM students WHERE cgpa > 3.5;</pre>
<p>π<sub>s.name, d.name</sub>(students ⋈<sub>students.dept_id = departments.id</sub> departments) ≡</p><pre class="ex">SELECT s.name, d.name FROM students s JOIN departments d ON s.dept_id = d.id;</pre>
<p><b>Division</b>: students who took <i>every</i> course — enrollments(student_id, course_id) ÷ courses(id).</p>
<p><b>Relational calculus</b> is nonprocedural (what, not how) — tuple RC and domain RC. Algebra is procedural.</p>` },
      quiz: [
        Q(['σ (sigma) অপারেশন SQL-এর কোন অংশের সমতুল্য?', 'The σ (sigma) operation corresponds to SQL\'s'], ['SELECT list', 'WHERE', 'FROM', 'GROUP BY'], 1, ['σ রো বাছাই করে = WHERE। কলাম বাছাই করে π।', 'σ picks rows = WHERE. π picks columns.']),
        Q(['কোনটি মৌলিক (basic) relational algebra অপারেশন নয়?', 'Which is NOT a basic relational algebra operation?'], ['Selection', 'Union', 'Intersection', 'Cartesian product'], 2, ['∩ = R − (R − S), তাই এটা derived।', '∩ = R − (R − S), so it is derived.']),
        Q(['R-এ ৫টি রো, S-এ ৪টি রো। R × S-এ কয়টি রো?', 'R has 5 rows, S has 4. How many rows in R × S?'], ['9', '20', '5', '4'], 1, ['Cartesian product = 5 × 4 = 20।', 'Cartesian product = 5 × 4 = 20.']),
        Q(['"সব কোর্স নিয়েছে এমন শিক্ষার্থী" কোন অপারেশনে সবচেয়ে স্বাভাবিকভাবে প্রকাশ হয়?', '"Students who took all courses" is most naturally expressed with'], ['Union', 'Projection', 'Division', 'Rename'], 2, ['"সবগুলোর সাথে" = division (÷)।', '"For all" = division (÷).']),
        Q(['Union অপারেশনের জন্য দুই relation-কে কী হতে হয়?', 'For union, the two relations must be'], ['Union-compatible', ['একই নামের', 'Same-named'], ['একই রো সংখ্যার', 'Same row count'], ['Key-সহ', 'Keyed']], 0, ['কলাম সংখ্যা ও ডোমেইন মিলতে হবে।', 'Same number of columns and matching domains.']),
        Q(['π অপারেশন ডুপ্লিকেট রো সম্পর্কে কী করে?', 'What does π do with duplicate rows?'], [['রেখে দেয়', 'Keeps them'], ['বাদ দেয়', 'Removes them'], ['এরর দেয়', 'Raises an error'], ['গুনে রাখে', 'Counts them']], 1, ['Relational algebra set-ভিত্তিক — ডুপ্লিকেট থাকে না। SQL-এ এজন্য DISTINCT লাগে।', 'Relational algebra is set-based — no duplicates. SQL needs DISTINCT for that.']),
        Q(['Theta join R ⋈θ S কোনটির সমান?', 'The theta join R ⋈θ S equals'], ['σθ(R × S)', 'πθ(R × S)', 'R ∪ S', 'R − S'], 0, ['প্রথমে সব জোড়া, তারপর শর্তে ছাঁকা।', 'All pairs, then filter by the condition.']),
        Q(['কোনটি nonprocedural query language?', 'Which is a nonprocedural query language?'], ['Relational algebra', 'Relational calculus', 'C', 'Assembly'], 1, ['Calculus বলে "কী চাই", algebra বলে "কীভাবে"।', 'Calculus says "what"; algebra says "how".'])
      ] },

    { id: 'normal', icon: '🧩', title: { bn: 'Functional Dependency ও Normalization (গভীরে)', en: 'Functional dependency & normalization (deep)' }, tool: true,
      content: {
        bn: `<p><b>Functional dependency</b> X → Y মানে: X-এর মান একই হলে Y-এর মানও একই হবে। যেমন <code>student_id → name</code>।</p>
<h3>Armstrong-এর axiom</h3><ul><li><b>Reflexivity</b>: Y ⊆ X হলে X → Y</li><li><b>Augmentation</b>: X → Y হলে XZ → YZ</li><li><b>Transitivity</b>: X → Y ও Y → Z হলে X → Z</li></ul>
<p>এগুলো থেকে পাওয়া যায়: <b>Union</b> (X→Y, X→Z ⇒ X→YZ), <b>Decomposition</b> (X→YZ ⇒ X→Y), <b>Pseudo-transitivity</b> (X→Y, WY→Z ⇒ WX→Z)।</p>
<h3>Attribute closure (X⁺)</h3><p>X দিয়ে যত attribute নির্ধারণ করা যায় সব। X⁺-এ টেবিলের সব attribute থাকলে X একটি super key। <b>Candidate key</b> খোঁজার কৌশল: যে attribute কোনো FD-র ডান পাশে নেই, সেটা প্রতিটি key-তে থাকবেই — সেখান থেকে শুরু করো।</p>
<p><b>Prime attribute</b> = কোনো candidate key-র অংশ; বাকিগুলো non-prime।</p>
<h3>Normal form</h3>
<ul><li><b>1NF</b> — প্রতিটি ঘরে একক (atomic) মান; repeating group নেই।</li>
<li><b>2NF</b> — 1NF + কোনো non-prime attribute candidate key-র <i>অংশের</i> উপর নির্ভর করে না (partial dependency নেই)। key একক attribute হলে 1NF টেবিল নিজেই 2NF।</li>
<li><b>3NF</b> — 2NF + transitive dependency নেই। সংজ্ঞা: প্রতিটি X → A-তে হয় X super key, নয়তো A prime।</li>
<li><b>BCNF</b> — প্রতিটি non-trivial X → A-তে X super key। 3NF-এর চেয়ে কড়া।</li>
<li><b>4NF</b> — BCNF + non-trivial multivalued dependency নেই। <b>5NF</b> — join dependency নেই।</li></ul>
<h3>Anomaly</h3><p>Normalize না করলে: <b>insertion</b> (কোর্স না থাকলে বিভাগ যোগ করা যায় না), <b>update</b> (একই তথ্য অনেক রো-তে বদলাতে হয়), <b>deletion</b> (শেষ ছাত্র মুছলে বিভাগের তথ্যও হারায়)।</p>
<h3>Decomposition</h3><p><b>Lossless join</b>: R কে R1, R2-তে ভাগ করলে R1 ∩ R2 → R1 বা R1 ∩ R2 → R2 হতে হবে। <b>Dependency preserving</b>: সব FD ভাগ হওয়া টেবিলগুলোতে পরীক্ষা করা যায়। 3NF-এ দুটোই সবসময় পাওয়া যায়; BCNF-এ dependency preservation নাও থাকতে পারে।</p>
<p>নিচের ক্যালকুলেটরে নিজের relation আর FD দিয়ে closure, candidate key আর normal form বের করো।</p>`,
        en: `<p>A <b>functional dependency</b> X → Y means equal X values imply equal Y values, e.g. <code>student_id → name</code>.</p>
<h3>Armstrong's axioms</h3><ul><li><b>Reflexivity</b>: if Y ⊆ X then X → Y</li><li><b>Augmentation</b>: X → Y ⇒ XZ → YZ</li><li><b>Transitivity</b>: X → Y, Y → Z ⇒ X → Z</li></ul>
<p>Derived rules: <b>union</b>, <b>decomposition</b>, <b>pseudo-transitivity</b> (X→Y, WY→Z ⇒ WX→Z).</p>
<h3>Attribute closure (X⁺)</h3><p>Everything X determines. If X⁺ contains all attributes, X is a super key. To find <b>candidate keys</b>: any attribute that never appears on a right-hand side must be in every key — start from those.</p>
<p><b>Prime attribute</b> = part of some candidate key; the rest are non-prime.</p>
<h3>Normal forms</h3>
<ul><li><b>1NF</b> — atomic values; no repeating groups.</li><li><b>2NF</b> — 1NF and no non-prime attribute depends on <i>part</i> of a candidate key (no partial dependency). A 1NF table with single-attribute keys is already 2NF.</li>
<li><b>3NF</b> — for every X → A, X is a super key or A is prime (no transitive dependency).</li><li><b>BCNF</b> — for every non-trivial X → A, X is a super key. Stricter than 3NF.</li>
<li><b>4NF</b> — BCNF and no non-trivial multivalued dependency. <b>5NF</b> — no join dependency.</li></ul>
<h3>Anomalies</h3><p>Without normalization: <b>insertion</b>, <b>update</b> and <b>deletion</b> anomalies.</p>
<h3>Decomposition</h3><p><b>Lossless join</b>: R1 ∩ R2 → R1 or R1 ∩ R2 → R2. <b>Dependency preserving</b>: every FD can be checked within the parts. 3NF always achieves both; BCNF may lose dependency preservation.</p>
<p>Use the calculator below to compute closures, candidate keys and the normal form of your own relation.</p>` },
      quiz: [
        Q(['R(A, B, C, D), FD: A → B, B → C, C → D। A⁺ কত?', 'R(A, B, C, D), FDs: A → B, B → C, C → D. What is A⁺?'], ['{A, B}', '{A, B, C}', '{A, B, C, D}', '{A}'], 2, ['A → B → C → D, তাই A⁺ = ABCD; A একটি candidate key।', 'A → B → C → D, so A⁺ = ABCD; A is a candidate key.']),
        Q(['R(A, B, C), FD: AB → C, C → B। candidate key কোনগুলো?', 'R(A, B, C), FDs: AB → C, C → B. Candidate keys?'], ['AB', 'AC', ['AB ও AC', 'AB and AC'], 'A'], 2, ['A কোনো ডান পাশে নেই, তাই প্রতিটি key-তে থাকবে। AB⁺ = ABC, AC⁺ = ACB — দুটোই।', 'A never appears on a right side, so it is in every key. AB⁺ = ABC and AC⁺ = ACB — both.']),
        Q(['ওপরের relation (AB → C, C → B) কোন সর্বোচ্চ normal form-এ আছে?', 'The relation above (AB → C, C → B) is in at most'], ['2NF', '3NF', 'BCNF', '1NF'], 1, ['C → B-তে C super key নয়, তাই BCNF নয়; কিন্তু B prime, তাই 3NF।', 'In C → B, C is not a super key, so not BCNF; but B is prime, so it is 3NF.']),
        Q(['Partial dependency কোন normal form দূর করে?', 'Which normal form removes partial dependency?'], ['1NF', '2NF', '3NF', 'BCNF'], 1, ['2NF।', '2NF.']),
        Q(['Transitive dependency কোন normal form দূর করে?', 'Which normal form removes transitive dependency?'], ['1NF', '2NF', '3NF', '4NF'], 2, ['3NF।', '3NF.']),
        Q(['X → Y এবং Y → Z থেকে X → Z — কোন axiom?', 'X → Y and Y → Z gives X → Z by'], ['Reflexivity', 'Augmentation', 'Transitivity', 'Union'], 2, ['Transitivity।', 'Transitivity.']),
        Q(['Multivalued dependency দূর করে কোন normal form?', 'Which normal form deals with multivalued dependency?'], ['3NF', 'BCNF', '4NF', '5NF'], 2, ['4NF।', '4NF.']),
        Q(['R কে R1(A, B), R2(A, C)-তে ভাগ করা হলো। কোন শর্তে এটা lossless?', 'R is split into R1(A, B) and R2(A, C). It is lossless if'], ['A → B বা A → C', 'B → C', 'C → B', ['সবসময়', 'Always']], 0, ['সাধারণ attribute A; A → R1 বা A → R2 লাগবে, অর্থাৎ A → B বা A → C।', 'The common attribute is A; we need A → R1 or A → R2, i.e. A → B or A → C.']),
        Q(['কোনটি সবসময় সত্য?', 'Which is always true?'], [['প্রতিটি 3NF টেবিল BCNF', 'Every 3NF table is BCNF'], ['প্রতিটি BCNF টেবিল 3NF', 'Every BCNF table is 3NF'], ['BCNF সবসময় dependency রাখে', 'BCNF always preserves dependencies'], ['2NF-এ transitive dependency থাকে না', '2NF has no transitive dependency']], 1, ['BCNF ⊂ 3NF ⊂ 2NF ⊂ 1NF।', 'BCNF ⊂ 3NF ⊂ 2NF ⊂ 1NF.'])
      ] },

    { id: 'txn', icon: '🔄', title: { bn: 'Transaction, ACID ও Serializability', en: 'Transactions, ACID & serializability' },
      content: {
        bn: `<p><b>Transaction</b> = এক বা একাধিক অপারেশনের একটি যৌক্তিক একক (যেমন টাকা পাঠানো: একজনের থেকে কাটা + অন্যজনকে দেওয়া)।</p>
<h3>ACID</h3><ul><li><b>Atomicity</b> — সব হবে, নয়তো কিছুই না। দায়িত্ব: recovery manager (undo log)।</li><li><b>Consistency</b> — ডেটাবেস এক বৈধ অবস্থা থেকে আরেক বৈধ অবস্থায় যায় (constraint মানে)। দায়িত্ব: প্রোগ্রামার + DBMS।</li><li><b>Isolation</b> — একসাথে চলা transaction একে অন্যকে প্রভাবিত করে না, যেন একটার পর একটা চলেছে। দায়িত্ব: concurrency control।</li><li><b>Durability</b> — COMMIT হলে ক্র্যাশের পরও থাকবে। দায়িত্ব: recovery manager (redo log)।</li></ul>
<h3>Transaction-এর অবস্থা</h3><p>Active → Partially committed → Committed; অথবা Active → Failed → Aborted (rollback, তারপর restart বা kill)। শেষ অবস্থা: committed বা aborted (= terminated)।</p>
<h3>Schedule</h3><ul><li><b>Serial</b> — একটার পর একটা; সবসময় সঠিক কিন্তু ধীর।</li><li><b>Serializable</b> — interleaved, কিন্তু ফলাফল কোনো serial schedule-এর সমান।</li><li><b>Conflict</b>: দুটি অপারেশন conflict করে যদি ভিন্ন transaction-এর, একই ডেটার উপর, এবং অন্তত একটি write (R-W, W-R, W-W)।</li><li><b>Conflict serializable</b> পরীক্ষা: <b>precedence graph</b> আঁকো (Ti → Tj যদি Ti-এর অপারেশন Tj-এর conflicting অপারেশনের আগে)। <b>Cycle না থাকলে</b> conflict serializable; topological order-ই সমতুল্য serial order।</li><li><b>View serializable</b> — conflict serializable-এর চেয়ে বড় শ্রেণি (blind write থাকলে)।</li></ul>
<h3>Recoverability</h3><ul><li><b>Recoverable</b> — Tj যদি Ti-এর লেখা পড়ে, তাহলে Ti আগে commit করবে।</li><li><b>Cascadeless</b> — শুধু commit হওয়া ডেটা পড়া হয়; একটার abort-এ অন্যগুলোর cascading rollback হয় না।</li><li><b>Strict</b> — commit/abort না হওয়া পর্যন্ত সেই ডেটা কেউ পড়েও না, লেখেও না।</li></ul>
<h3>Recovery</h3><p><b>Log</b>-এ প্রতিটি পরিবর্তন (পুরোনো ও নতুন মান) লেখা হয়। <b>WAL</b> (Write-Ahead Logging): ডেটা ডিস্কে লেখার আগে log লেখা হয়। ক্র্যাশের পর commit হওয়াগুলো <b>redo</b>, অসম্পূর্ণগুলো <b>undo</b>। <b>Checkpoint</b> recovery-র সময় কমায়। Deferred update (commit-এর পর লেখা; শুধু redo) বনাম immediate update (undo + redo)। <b>Shadow paging</b> — log ছাড়া, কপি পেজ দিয়ে।</p>`,
        en: `<p>A <b>transaction</b> is one logical unit of work (a money transfer: debit one account + credit another).</p>
<h3>ACID</h3><ul><li><b>Atomicity</b> — all or nothing. Ensured by the recovery manager (undo log).</li><li><b>Consistency</b> — from one valid state to another (constraints hold). Programmer + DBMS.</li><li><b>Isolation</b> — concurrent transactions don't interfere, as if run one after another. Concurrency control.</li><li><b>Durability</b> — once committed, survives crashes. Recovery manager (redo log).</li></ul>
<h3>Transaction states</h3><p>Active → partially committed → committed; or active → failed → aborted (rolled back, then restarted or killed).</p>
<h3>Schedules</h3><ul><li><b>Serial</b> — one after another; always correct but slow.</li><li><b>Serializable</b> — interleaved but equivalent to some serial schedule.</li><li>Two operations <b>conflict</b> if they are from different transactions, on the same item, and at least one is a write (R-W, W-R, W-W).</li><li><b>Conflict-serializability test</b>: draw the <b>precedence graph</b> (Ti → Tj if an operation of Ti precedes a conflicting one of Tj). <b>No cycle</b> ⇒ conflict serializable; a topological order gives the equivalent serial order.</li><li><b>View serializable</b> is a larger class (allows blind writes).</li></ul>
<h3>Recoverability</h3><ul><li><b>Recoverable</b> — if Tj reads what Ti wrote, Ti commits first.</li><li><b>Cascadeless</b> — only committed data is read; no cascading rollback.</li><li><b>Strict</b> — nobody reads or writes an item until its writer commits/aborts.</li></ul>
<h3>Recovery</h3><p>The <b>log</b> records every change (old and new values). <b>WAL</b>: write the log before the data page. After a crash: <b>redo</b> committed transactions, <b>undo</b> incomplete ones. <b>Checkpoints</b> shorten recovery. Deferred update (redo only) vs immediate update (undo + redo). <b>Shadow paging</b> avoids a log by keeping copy pages.</p>` },
      quiz: [
        Q(['"সব হবে, নয়তো কিছুই না" — ACID-এর কোনটি?', '"All or nothing" is which ACID property?'], ['Atomicity', 'Consistency', 'Isolation', 'Durability'], 0, ['Atomicity।', 'Atomicity.']),
        Q(['COMMIT-এর পর ক্র্যাশ হলেও ডেটা থাকে — কোন property?', 'Committed data survives a crash — which property?'], ['Atomicity', 'Consistency', 'Isolation', 'Durability'], 3, ['Durability।', 'Durability.']),
        Q(['Precedence graph-এ cycle থাকলে schedule কী?', 'If the precedence graph has a cycle, the schedule is'], [['Conflict serializable', 'Conflict serializable'], ['Conflict serializable নয়', 'Not conflict serializable'], ['Serial', 'Serial'], ['Strict', 'Strict']], 1, ['Cycle = conflict serializable নয়।', 'A cycle means not conflict serializable.']),
        Q(['কোন জোড়া অপারেশন conflict করে না? (ভিন্ন transaction, একই ডেটা)', 'Which pair does NOT conflict? (different transactions, same item)'], ['Read–Write', 'Write–Read', 'Write–Write', 'Read–Read'], 3, ['দুটোই read হলে কোনো conflict নেই।', 'Two reads never conflict.']),
        Q(['Isolation নিশ্চিত করে DBMS-এর কোন অংশ?', 'Which DBMS component ensures isolation?'], ['Recovery manager', 'Concurrency control manager', 'Query optimizer', 'Storage manager'], 1, ['Concurrency control (locking, timestamp)।', 'The concurrency control manager (locking, timestamps).']),
        Q(['WAL (Write-Ahead Logging)-এর নিয়ম কী?', 'The WAL rule says'], [['ডেটা লেখার আগে log ডিস্কে লেখা', 'Write the log to disk before the data'], ['ডেটার পরে log লেখা', 'Write the log after the data'], ['log না রাখা', 'Keep no log'], ['শুধু commit-এ log', 'Log only at commit']], 0, ['log আগে, ডেটা পরে — তাই ক্র্যাশের পর undo/redo করা যায়।', 'Log first, data later — so undo/redo is possible after a crash.']),
        Q(['যে schedule-এ একটার abort-এ অন্যগুলোকেও rollback করতে হয় না, তাকে কী বলে?', 'A schedule where one abort never forces others to roll back is'], ['Recoverable', 'Cascadeless', 'Serial', 'Non-recoverable'], 1, ['শুধু commit হওয়া ডেটা পড়া হয় = cascadeless।', 'Reading only committed data = cascadeless.']),
        Q(['Checkpoint-এর মূল উদ্দেশ্য কী?', 'The main purpose of a checkpoint is'], [['Recovery-র সময় কমানো', 'To shorten recovery time'], ['Deadlock ধরা', 'To detect deadlock'], ['ইনডেক্স বানানো', 'To build indexes'], ['Normalization', 'Normalization']], 0, ['Checkpoint-এর আগের commit হওয়া কাজ আবার redo করতে হয় না।', 'Work committed before the checkpoint need not be redone.'])
      ] },

    { id: 'concurrency', icon: '🔒', title: { bn: 'Concurrency Control ও Deadlock', en: 'Concurrency control & deadlock' },
      content: {
        bn: `<h3>Concurrency-র সমস্যা</h3><ul><li><b>Lost update</b> — দুজন একই মান পড়ে বদলায়; একজনের পরিবর্তন হারায়।</li><li><b>Dirty read</b> — commit না হওয়া (পরে rollback হওয়া) ডেটা পড়া।</li><li><b>Non-repeatable read</b> — একই রো দুবার পড়লে ভিন্ন মান (মাঝে অন্য কেউ UPDATE করেছে)।</li><li><b>Phantom read</b> — একই শর্তে দুবার খুঁজলে নতুন রো দেখা দেয় (অন্য কেউ INSERT করেছে)।</li></ul>
<h3>Isolation level (SQL standard)</h3><table class="th-tbl"><tr><th>Level</th><th>Dirty</th><th>Non-repeatable</th><th>Phantom</th></tr><tr><td>READ UNCOMMITTED</td><td>হতে পারে</td><td>হতে পারে</td><td>হতে পারে</td></tr><tr><td>READ COMMITTED</td><td>না</td><td>হতে পারে</td><td>হতে পারে</td></tr><tr><td>REPEATABLE READ</td><td>না</td><td>না</td><td>হতে পারে</td></tr><tr><td>SERIALIZABLE</td><td>না</td><td>না</td><td>না</td></tr></table>
<h3>Locking</h3><ul><li><b>Shared (S)</b> lock — পড়ার জন্য; অনেকে একসাথে নিতে পারে। <b>Exclusive (X)</b> lock — লেখার জন্য; একা। S–S compatible, বাকি সব না।</li>
<li><b>Two-Phase Locking (2PL)</b>: <i>growing phase</i> (শুধু lock নেওয়া) তারপর <i>shrinking phase</i> (শুধু ছাড়া)। 2PL conflict serializability নিশ্চিত করে, কিন্তু deadlock আটকায় না।</li>
<li><b>Strict 2PL</b> — X lock commit পর্যন্ত ধরে রাখা (cascadeless)। <b>Rigorous 2PL</b> — সব lock commit পর্যন্ত।</li></ul>
<h3>Timestamp ordering</h3><p>প্রতিটি transaction-এর একটি timestamp; পুরোনোটা আগে চলেছে ধরে নিয়ে conflict হলে নতুনটাকে rollback। <b>Thomas write rule</b> পুরোনো (obsolete) write উপেক্ষা করে। কোনো lock নেই, তাই deadlock হয় না।</p>
<h3>Deadlock</h3><p>দুই বা ততোধিক transaction একে অপরের ধরে রাখা lock-এর জন্য চিরকাল অপেক্ষা করে। চারটি শর্ত (Coffman): <b>mutual exclusion, hold and wait, no preemption, circular wait</b>।</p>
<ul><li><b>Detection</b> — <i>wait-for graph</i>-এ cycle থাকলে deadlock; একটি victim বেছে rollback।</li><li><b>Prevention</b> (timestamp দিয়ে): <b>Wait-Die</b> (non-preemptive) — পুরোনো অপেক্ষা করে, নতুন মরে (rollback)। <b>Wound-Wait</b> (preemptive) — পুরোনো নতুনকে "wound" করে (rollback করায়), নতুন অপেক্ষা করে।</li><li><b>Timeout</b> — বেশি সময় অপেক্ষা করলে abort।</li><li><b>Starvation</b> — একই transaction বারবার victim হওয়া; সমাধান: পুরোনো timestamp ধরে রাখা।</li></ul>`,
        en: `<h3>Concurrency problems</h3><ul><li><b>Lost update</b> — two transactions read and change the same value; one change is lost.</li><li><b>Dirty read</b> — reading uncommitted data (later rolled back).</li><li><b>Non-repeatable read</b> — reading the same row twice gives different values.</li><li><b>Phantom read</b> — the same search returns new rows the second time.</li></ul>
<h3>Isolation levels (SQL standard)</h3><table class="th-tbl"><tr><th>Level</th><th>Dirty</th><th>Non-repeatable</th><th>Phantom</th></tr><tr><td>READ UNCOMMITTED</td><td>possible</td><td>possible</td><td>possible</td></tr><tr><td>READ COMMITTED</td><td>no</td><td>possible</td><td>possible</td></tr><tr><td>REPEATABLE READ</td><td>no</td><td>no</td><td>possible</td></tr><tr><td>SERIALIZABLE</td><td>no</td><td>no</td><td>no</td></tr></table>
<h3>Locking</h3><ul><li><b>Shared (S)</b> lock for reading — many can hold it. <b>Exclusive (X)</b> for writing — only one. Only S–S is compatible.</li>
<li><b>Two-phase locking (2PL)</b>: a <i>growing phase</i> (only acquire) then a <i>shrinking phase</i> (only release). Guarantees conflict serializability but not freedom from deadlock.</li>
<li><b>Strict 2PL</b> — hold X locks until commit (cascadeless). <b>Rigorous 2PL</b> — hold all locks until commit.</li></ul>
<h3>Timestamp ordering</h3><p>Each transaction gets a timestamp; on a conflict the younger one is rolled back. The <b>Thomas write rule</b> ignores obsolete writes. No locks, hence no deadlock.</p>
<h3>Deadlock</h3><p>Transactions wait forever for each other's locks. Coffman conditions: <b>mutual exclusion, hold and wait, no preemption, circular wait</b>.</p>
<ul><li><b>Detection</b> — a cycle in the <i>wait-for graph</i>; roll back a victim.</li><li><b>Prevention</b> with timestamps: <b>wait-die</b> (non-preemptive) — older waits, younger dies. <b>Wound-wait</b> (preemptive) — older wounds (rolls back) the younger; younger waits.</li><li><b>Timeout</b> — abort after waiting too long.</li><li><b>Starvation</b> — the same transaction is always the victim; keep its original timestamp.</li></ul>` },
      quiz: [
        Q(['Commit না হওয়া ডেটা পড়াকে কী বলে?', 'Reading uncommitted data is a'], ['Lost update', 'Dirty read', 'Phantom read', 'Deadlock'], 1, ['Dirty read।', 'Dirty read.']),
        Q(['কোন isolation level phantom read-ও আটকায়?', 'Which isolation level also prevents phantom reads?'], ['READ UNCOMMITTED', 'READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE'], 3, ['শুধু SERIALIZABLE।', 'Only SERIALIZABLE.']),
        Q(['কোন lock দুটি একসাথে compatible?', 'Which two locks are compatible?'], ['S ও S', 'S ও X', 'X ও S', 'X ও X'], 0, ['শুধু shared–shared।', 'Only shared–shared.']),
        Q(['2PL কী নিশ্চিত করে?', '2PL guarantees'], [['Deadlock হবে না', 'Freedom from deadlock'], ['Conflict serializability', 'Conflict serializability'], ['Starvation হবে না', 'No starvation'], ['Cascadeless', 'Cascadelessness']], 1, ['2PL serializability দেয়, কিন্তু deadlock হতে পারে।', '2PL gives serializability but deadlocks can still happen.']),
        Q(['Wait-Die পদ্ধতিতে নতুন (younger) transaction পুরোনোটার lock চাইলে কী হয়?', 'In wait-die, when a younger transaction requests a lock held by an older one, it'], [['অপেক্ষা করে', 'Waits'], ['Rollback (die) হয়', 'Is rolled back (dies)'], ['পুরোনোটাকে rollback করায়', 'Rolls back the older one'], ['Lock পেয়ে যায়', 'Gets the lock']], 1, ['Wait-Die: পুরোনো অপেক্ষা করে, নতুন মরে।', 'Wait-die: older waits, younger dies.']),
        Q(['Deadlock detection-এ কোন graph ব্যবহার হয়?', 'Deadlock detection uses the'], ['Precedence graph', 'Wait-for graph', 'ER diagram', 'B+ tree'], 1, ['Wait-for graph-এ cycle = deadlock।', 'A cycle in the wait-for graph = deadlock.']),
        Q(['কোনটি deadlock-এর Coffman শর্ত নয়?', 'Which is NOT a Coffman condition for deadlock?'], ['Mutual exclusion', 'Hold and wait', 'Preemption', 'Circular wait'], 2, ['শর্ত হলো NO preemption।', 'The condition is NO preemption.']),
        Q(['Timestamp ordering protocol সম্পর্কে কোনটি সত্য?', 'Which is true of timestamp ordering?'], [['Deadlock হয় না', 'It is deadlock-free'], ['Shared lock লাগে', 'It needs shared locks'], ['সবসময় serial চলে', 'It always runs serially'], ['Log লাগে না', 'It needs no log']], 0, ['কোনো lock বা অপেক্ষা নেই, তাই deadlock নেই (তবে starvation/rollback হতে পারে)।', 'No locks or waiting, so no deadlock (though rollbacks can happen).'])
      ] },

    { id: 'index', icon: '🌲', title: { bn: 'Indexing, B+ Tree ও Hashing', en: 'Indexing, B+ trees & hashing' },
      content: {
        bn: `<p><b>Index</b> বইয়ের সূচিপত্রের মতো — পুরো টেবিল না পড়ে সরাসরি দরকারি রো-তে যাওয়া যায়।</p>
<ul><li><b>Primary index</b> — ফাইল যে key অনুযায়ী সাজানো, তার উপর (ordered file)।</li><li><b>Clustering index</b> — সাজানো কিন্তু key নয় এমন কলামের উপর। একটি টেবিলে <b>একটিই</b> clustered index (কারণ ডেটা এক ক্রমেই সাজানো যায়)।</li><li><b>Secondary (non-clustered) index</b> — যেকোনো কলামে, অনেকগুলো হতে পারে; সবসময় dense।</li>
<li><b>Dense</b> — প্রতিটি search-key মানের জন্য entry। <b>Sparse</b> — কিছু মানের জন্য (প্রতি ব্লকে একটি); শুধু সাজানো ফাইলে।</li><li><b>Multilevel index</b> — ইনডেক্সের উপর ইনডেক্স।</li></ul>
<h3>B-tree ও B+ tree</h3><ul><li>সবসময় <b>balanced</b> — সব leaf একই গভীরতায়; খোঁজা, যোগ, মোছা O(log n)।</li><li><b>B+ tree</b>: সব ডেটা পয়েন্টার শুধু <b>leaf</b>-এ; internal node-এ শুধু পথ দেখানোর key। leaf-গুলো linked list দিয়ে যুক্ত — তাই <b>range query</b> (BETWEEN, ORDER BY) দ্রুত।</li><li><b>B-tree</b>: internal node-এও ডেটা পয়েন্টার থাকে; leaf linked নয়।</li><li>order p-এর B+ tree-তে প্রতিটি internal node (root ছাড়া) অন্তত ⌈p/2⌉ child রাখে।</li><li>বেশিরভাগ DBMS (MySQL InnoDB, PostgreSQL, SQLite) ডিফল্টে B+ tree/B-tree ব্যবহার করে।</li></ul>
<h3>Hashing</h3><ul><li>hash function key থেকে সরাসরি bucket বের করে — সমতা (=) খোঁজা O(1), কিন্তু <b>range query-তে কাজে আসে না</b>।</li><li><b>Static hashing</b> — bucket সংখ্যা নির্দিষ্ট; overflow chain হয়। <b>Dynamic</b>: <i>extendible hashing</i> (directory দ্বিগুণ হয়), <i>linear hashing</i>।</li><li>Collision সমাধান: chaining, open addressing।</li></ul>
<h3>কখন ইনডেক্স</h3><p>WHERE, JOIN, ORDER BY-তে ঘনঘন ব্যবহৃত, বেশি ভিন্ন মানের (high selectivity) কলামে। ছোট টেবিল বা ঘনঘন আপডেট হওয়া কলামে লাভ কম — প্রতিটি INSERT/UPDATE/DELETE-এ ইনডেক্সও আপডেট করতে হয়।</p>`,
        en: `<p>An <b>index</b> works like a book's index — jump straight to the rows instead of reading the whole table.</p>
<ul><li><b>Primary index</b> — on the key the file is ordered by.</li><li><b>Clustering index</b> — on an ordering non-key column. Only <b>one</b> clustered index per table (data can be physically sorted one way).</li><li><b>Secondary (non-clustered) index</b> — on any column, many allowed; always dense.</li>
<li><b>Dense</b> — an entry for every search-key value. <b>Sparse</b> — for some values (one per block); only on ordered files.</li><li><b>Multilevel index</b> — an index on the index.</li></ul>
<h3>B-tree and B+ tree</h3><ul><li>Always <b>balanced</b> — all leaves at the same depth; search/insert/delete in O(log n).</li><li><b>B+ tree</b>: data pointers only in <b>leaves</b>; internal nodes only guide the search. Leaves are linked, so <b>range queries</b> (BETWEEN, ORDER BY) are fast.</li><li><b>B-tree</b>: internal nodes also hold data pointers; leaves not linked.</li><li>In a B+ tree of order p each internal node (except root) has at least ⌈p/2⌉ children.</li><li>Most DBMSs (MySQL InnoDB, PostgreSQL, SQLite) use B+/B-trees by default.</li></ul>
<h3>Hashing</h3><ul><li>A hash function maps a key to a bucket — equality (=) lookups in O(1), but <b>useless for range queries</b>.</li><li><b>Static hashing</b> — fixed buckets, overflow chains. <b>Dynamic</b>: <i>extendible hashing</i> (directory doubles), <i>linear hashing</i>.</li><li>Collision handling: chaining, open addressing.</li></ul>
<h3>When to index</h3><p>Columns used often in WHERE, JOIN and ORDER BY with many distinct values (high selectivity). Little benefit on small tables or heavily updated columns — every INSERT/UPDATE/DELETE must update the index too.</p>` },
      quiz: [
        Q(['একটি টেবিলে সর্বোচ্চ কয়টি clustered index থাকতে পারে?', 'How many clustered indexes can a table have?'], ['একটি', 'দুটি', 'যত খুশি', 'একটিও না'].map((x, i) => [x, ['One', 'Two', 'Any number', 'None'][i]]), 0, ['ডেটা শারীরিকভাবে একভাবেই সাজানো যায়, তাই একটি।', 'Data can be physically ordered only one way, so one.']),
        Q(['B+ tree-তে ডেটা পয়েন্টার কোথায় থাকে?', 'In a B+ tree, data pointers are stored'], [['শুধু leaf node-এ', 'Only in leaf nodes'], ['শুধু root-এ', 'Only in the root'], ['সব node-এ', 'In every node'], ['শুধু internal node-এ', 'Only in internal nodes']], 0, ['B+ tree-তে শুধু leaf-এ; B-tree-তে internal node-এও।', 'Only leaves in a B+ tree; internal nodes too in a B-tree.']),
        Q(['Range query (BETWEEN)-র জন্য কোনটি সবচেয়ে ভালো?', 'Best for range queries (BETWEEN)?'], ['Hash index', 'B+ tree index', ['কোনো ইনডেক্স না', 'No index'], 'Bitmap of hashes'], 1, ['B+ tree-র leaf linked — পরপর পড়া যায়। Hash শুধু = খোঁজায় ভালো।', 'B+ tree leaves are linked for sequential reading. Hashing only helps equality.']),
        Q(['Sparse index কোথায় বানানো যায়?', 'A sparse index can be built only on'], [['সাজানো (ordered) ফাইলে', 'An ordered file'], ['যেকোনো ফাইলে', 'Any file'], ['Hash ফাইলে', 'A hashed file'], ['Heap ফাইলে', 'A heap file']], 0, ['প্রতি ব্লকে একটি entry — ব্লকের ভেতর সাজানো থাকলেই কাজ করে।', 'One entry per block — works only if the data is ordered.']),
        Q(['B+ tree সবসময় কেমন?', 'A B+ tree is always'], ['Balanced', 'Unbalanced', 'Binary', 'Sorted by insertion time'], 0, ['সব leaf একই গভীরতায়।', 'All leaves at the same depth.']),
        Q(['Extendible hashing-এ bucket ভরে গেলে কী হতে পারে?', 'In extendible hashing, when a bucket overflows'], [['Directory দ্বিগুণ হতে পারে', 'The directory may double'], ['টেবিল মুছে যায়', 'The table is dropped'], ['B+ tree বানানো হয়', 'A B+ tree is built'], ['কিছুই না', 'Nothing']], 0, ['bucket ভাগ হয়; local depth > global depth হলে directory দ্বিগুণ।', 'The bucket splits; if local depth exceeds global depth, the directory doubles.']),
        Q(['ইনডেক্সের একটি অসুবিধা কী?', 'A drawback of indexes is'], [['INSERT/UPDATE ধীর হয় ও জায়গা লাগে', 'Slower writes and extra space'], ['SELECT ধীর হয়', 'Slower SELECTs'], ['JOIN চলে না', 'JOINs stop working'], ['ডেটা হারায়', 'Data loss']], 0, ['প্রতিটি পরিবর্তনে ইনডেক্সও আপডেট হয়।', 'Every change must update the index too.']),
        Q(['Secondary index সাধারণত কেমন?', 'A secondary index is generally'], ['Dense', 'Sparse', 'Clustered', 'Hashed only'], 0, ['ডেটা সেই কলামে সাজানো নয়, তাই প্রতিটি মানের entry লাগে।', 'The data is not ordered on that column, so every value needs an entry.'])
      ] },

    { id: 'plsql', icon: '⚙️', title: { bn: 'Stored Procedure, Function, Cursor (PL/SQL)', en: 'Stored procedures, functions, cursors (PL/SQL)' },
      content: {
        bn: `<p>SQLite-এ এগুলো নেই, কিন্তু MySQL, Oracle (PL/SQL), SQL Server (T-SQL), PostgreSQL (PL/pgSQL)-এ আছে — আর লিখিত পরীক্ষা ও ভাইভায় প্রায়ই আসে।</p>
<h3>Stored procedure</h3><p>সার্ভারে সংরক্ষিত নামযুক্ত SQL ব্লক। সুবিধা: নেটওয়ার্ক ট্রাফিক কম, একবার compile, নিরাপত্তা (টেবিলে সরাসরি অনুমতি না দিয়ে procedure চালানোর অনুমতি), কোড পুনর্ব্যবহার। প্যারামিটার: <b>IN</b>, <b>OUT</b>, <b>IN OUT</b>।</p>
<pre class="syntax">-- MySQL
DELIMITER //
CREATE PROCEDURE raise_salary(IN p_dept INT, IN p_pct DECIMAL(5,2))
BEGIN
  UPDATE emp SET salary = salary * (1 + p_pct / 100) WHERE dept_id = p_dept;
END //
DELIMITER ;
CALL raise_salary(10, 5);

-- Oracle PL/SQL
CREATE OR REPLACE PROCEDURE raise_salary(p_dept IN NUMBER, p_pct IN NUMBER) AS
BEGIN
  UPDATE emp SET salary = salary * (1 + p_pct / 100) WHERE dept_id = p_dept;
  COMMIT;
END;
/
EXEC raise_salary(10, 5);</pre>
<h3>Function বনাম Procedure</h3><table class="th-tbl"><tr><th></th><th>Function</th><th>Procedure</th></tr><tr><td>ফেরত মান</td><td>অবশ্যই একটি (RETURN)</td><td>দরকার নেই (OUT প্যারামিটার দিয়ে একাধিক)</td></tr><tr><td>SELECT-এর ভেতরে</td><td>ব্যবহার করা যায়</td><td>যায় না</td></tr><tr><td>DML</td><td>সাধারণত নয়</td><td>করা যায়</td></tr><tr><td>চালানো</td><td>এক্সপ্রেশনে</td><td>CALL / EXEC</td></tr></table>
<pre class="syntax">CREATE OR REPLACE FUNCTION annual_salary(p_id IN NUMBER) RETURN NUMBER AS
  v_sal emp.salary%TYPE;
BEGIN
  SELECT salary INTO v_sal FROM emp WHERE emp_id = p_id;
  RETURN v_sal * 12;
EXCEPTION
  WHEN NO_DATA_FOUND THEN RETURN 0;
END;
/
SELECT name, annual_salary(emp_id) FROM emp;</pre>
<h3>PL/SQL ব্লকের গঠন</h3><p><code>DECLARE</code> (ঐচ্ছিক) → <code>BEGIN</code> (আবশ্যিক) → <code>EXCEPTION</code> (ঐচ্ছিক) → <code>END;</code>। <code>%TYPE</code> = কলামের টাইপ, <code>%ROWTYPE</code> = পুরো রো-র টাইপ। আগে থেকে সংজ্ঞায়িত exception: <code>NO_DATA_FOUND</code>, <code>TOO_MANY_ROWS</code>, <code>ZERO_DIVIDE</code>, <code>DUP_VAL_ON_INDEX</code>।</p>
<h3>Cursor</h3><p>একাধিক রো একটা একটা করে প্রক্রিয়া করার পয়েন্টার। <b>Implicit</b> — প্রতিটি DML/SELECT INTO-তে নিজে থেকে (<code>SQL%ROWCOUNT</code>, <code>SQL%FOUND</code>)। <b>Explicit</b> — নিজে ঘোষণা: <b>DECLARE → OPEN → FETCH → CLOSE</b>। Attribute: <code>%FOUND</code>, <code>%NOTFOUND</code>, <code>%ROWCOUNT</code>, <code>%ISOPEN</code>।</p>
<pre class="syntax">DECLARE
  CURSOR c_emp IS SELECT name, salary FROM emp WHERE dept_id = 10;
  v_name emp.name%TYPE; v_sal emp.salary%TYPE;
BEGIN
  OPEN c_emp;
  LOOP
    FETCH c_emp INTO v_name, v_sal;
    EXIT WHEN c_emp%NOTFOUND;
    DBMS_OUTPUT.PUT_LINE(v_name || ': ' || v_sal);
  END LOOP;
  CLOSE c_emp;
END;
/</pre>
<h3>Trigger ও Package</h3><p><b>Trigger</b> — কোনো ঘটনায় (INSERT/UPDATE/DELETE) নিজে চলে; row-level (<code>FOR EACH ROW</code>, :NEW/:OLD) বা statement-level। <b>Package</b> (Oracle) — সম্পর্কিত procedure/function/variable একসাথে: <i>specification</i> (বাইরে যা দেখা যায়) + <i>body</i> (বাস্তবায়ন)।</p>
<h3>অন্যান্য</h3><p><b>View</b> — সংরক্ষিত কুয়েরি (ডেটা রাখে না); <b>Materialized view</b> — ফলাফলও সংরক্ষণ করে, refresh লাগে। <b>Sequence</b> (Oracle) — <code>seq.NEXTVAL</code> দিয়ে ক্রমিক সংখ্যা। <b>Synonym</b> — অবজেক্টের বিকল্প নাম।</p>`,
        en: `<p>SQLite does not have these, but MySQL, Oracle (PL/SQL), SQL Server (T-SQL) and PostgreSQL (PL/pgSQL) do — and they are frequent in written exams and vivas.</p>
<h3>Stored procedure</h3><p>A named SQL block stored on the server. Benefits: less network traffic, compiled once, security (grant EXECUTE instead of table access), reuse. Parameters: <b>IN</b>, <b>OUT</b>, <b>IN OUT</b>.</p>
<pre class="syntax">-- MySQL
DELIMITER //
CREATE PROCEDURE raise_salary(IN p_dept INT, IN p_pct DECIMAL(5,2))
BEGIN
  UPDATE emp SET salary = salary * (1 + p_pct / 100) WHERE dept_id = p_dept;
END //
DELIMITER ;
CALL raise_salary(10, 5);

-- Oracle PL/SQL
CREATE OR REPLACE PROCEDURE raise_salary(p_dept IN NUMBER, p_pct IN NUMBER) AS
BEGIN
  UPDATE emp SET salary = salary * (1 + p_pct / 100) WHERE dept_id = p_dept;
  COMMIT;
END;
/
EXEC raise_salary(10, 5);</pre>
<h3>Function vs procedure</h3><table class="th-tbl"><tr><th></th><th>Function</th><th>Procedure</th></tr><tr><td>Return value</td><td>exactly one (RETURN)</td><td>not required (several via OUT)</td></tr><tr><td>Inside SELECT</td><td>allowed</td><td>not allowed</td></tr><tr><td>DML</td><td>usually not</td><td>allowed</td></tr><tr><td>Called by</td><td>an expression</td><td>CALL / EXEC</td></tr></table>
<pre class="syntax">CREATE OR REPLACE FUNCTION annual_salary(p_id IN NUMBER) RETURN NUMBER AS
  v_sal emp.salary%TYPE;
BEGIN
  SELECT salary INTO v_sal FROM emp WHERE emp_id = p_id;
  RETURN v_sal * 12;
EXCEPTION
  WHEN NO_DATA_FOUND THEN RETURN 0;
END;
/
SELECT name, annual_salary(emp_id) FROM emp;</pre>
<h3>PL/SQL block structure</h3><p><code>DECLARE</code> (optional) → <code>BEGIN</code> (required) → <code>EXCEPTION</code> (optional) → <code>END;</code>. <code>%TYPE</code> = a column's type, <code>%ROWTYPE</code> = a whole row's type. Predefined exceptions: <code>NO_DATA_FOUND</code>, <code>TOO_MANY_ROWS</code>, <code>ZERO_DIVIDE</code>, <code>DUP_VAL_ON_INDEX</code>.</p>
<h3>Cursor</h3><p>A pointer for processing rows one at a time. <b>Implicit</b> — automatic for each DML/SELECT INTO (<code>SQL%ROWCOUNT</code>, <code>SQL%FOUND</code>). <b>Explicit</b> — you declare it: <b>DECLARE → OPEN → FETCH → CLOSE</b>. Attributes: <code>%FOUND</code>, <code>%NOTFOUND</code>, <code>%ROWCOUNT</code>, <code>%ISOPEN</code>.</p>
<pre class="syntax">DECLARE
  CURSOR c_emp IS SELECT name, salary FROM emp WHERE dept_id = 10;
  v_name emp.name%TYPE; v_sal emp.salary%TYPE;
BEGIN
  OPEN c_emp;
  LOOP
    FETCH c_emp INTO v_name, v_sal;
    EXIT WHEN c_emp%NOTFOUND;
    DBMS_OUTPUT.PUT_LINE(v_name || ': ' || v_sal);
  END LOOP;
  CLOSE c_emp;
END;
/</pre>
<h3>Triggers and packages</h3><p>A <b>trigger</b> runs automatically on INSERT/UPDATE/DELETE; row-level (<code>FOR EACH ROW</code>, :NEW/:OLD) or statement-level. A <b>package</b> (Oracle) groups related procedures/functions/variables: a <i>specification</i> (public part) + a <i>body</i> (implementation).</p>
<h3>Others</h3><p><b>View</b> — a stored query (no data); <b>materialized view</b> — also stores the result, needs refreshing. <b>Sequence</b> (Oracle) — <code>seq.NEXTVAL</code> for running numbers. <b>Synonym</b> — an alias for an object.</p>` },
      quiz: [
        Q(['Explicit cursor ব্যবহারের সঠিক ক্রম কোনটি?', 'The correct order for using an explicit cursor is'], ['OPEN → DECLARE → FETCH → CLOSE', 'DECLARE → OPEN → FETCH → CLOSE', 'DECLARE → FETCH → OPEN → CLOSE', 'FETCH → OPEN → CLOSE → DECLARE'], 1, ['DECLARE, OPEN, FETCH (লুপে), CLOSE।', 'DECLARE, OPEN, FETCH (in a loop), CLOSE.']),
        Q(['Function আর procedure-এর মূল পার্থক্য কী?', 'The key difference between a function and a procedure?'], [['Function অবশ্যই একটি মান ফেরত দেয় এবং SELECT-এ ব্যবহার করা যায়', 'A function must return a value and can be used in SELECT'], ['Procedure অবশ্যই মান ফেরত দেয়', 'A procedure must return a value'], ['দুটো একই', 'They are identical'], ['Function-এ প্যারামিটার থাকে না', 'Functions take no parameters']], 0, ['Function RETURN করে, এক্সপ্রেশনে চলে; procedure CALL/EXEC দিয়ে।', 'A function RETURNs and is used in expressions; a procedure is run with CALL/EXEC.']),
        Q(['SELECT … INTO কোনো রো না পেলে Oracle কোন exception দেয়?', 'When SELECT … INTO finds no row, Oracle raises'], ['TOO_MANY_ROWS', 'NO_DATA_FOUND', 'ZERO_DIVIDE', 'INVALID_CURSOR'], 1, ['NO_DATA_FOUND; একাধিক রো পেলে TOO_MANY_ROWS।', 'NO_DATA_FOUND; more than one row gives TOO_MANY_ROWS.']),
        Q(['%ROWTYPE কী বোঝায়?', '%ROWTYPE declares a variable with'], [['একটি কলামের টাইপ', 'One column\'s type'], ['পুরো রো-র গঠন', 'A whole row\'s structure'], ['একটি সংখ্যা', 'A number'], ['একটি cursor', 'A cursor']], 1, ['%TYPE = একটি কলাম, %ROWTYPE = পুরো রো।', '%TYPE = one column, %ROWTYPE = a whole row.']),
        Q(['কোন প্যারামিটার মোড দিয়ে procedure থেকে মান বাইরে পাঠানো যায়?', 'Which parameter mode passes a value back out of a procedure?'], ['IN', 'OUT', 'CONST', 'RETURN'], 1, ['OUT (বা IN OUT)।', 'OUT (or IN OUT).']),
        Q(['PL/SQL ব্লকের কোন অংশ আবশ্যিক?', 'Which part of a PL/SQL block is mandatory?'], ['DECLARE', 'BEGIN … END', 'EXCEPTION', ['সবগুলো', 'All of them']], 1, ['শুধু BEGIN…END আবশ্যিক।', 'Only BEGIN…END is required.']),
        Q(['Oracle package-এর দুটি অংশ কী?', 'The two parts of an Oracle package are'], ['Header ও footer', 'Specification ও body', 'Cursor ও trigger', 'Table ও view'].map((x, i) => [x, ['Header and footer', 'Specification and body', 'Cursor and trigger', 'Table and view'][i]]), 1, ['Specification (public) + body।', 'Specification (public) + body.']),
        Q(['Materialized view সম্পর্কে কোনটি সঠিক?', 'Which is true about a materialized view?'], [['ফলাফল ডিস্কে সংরক্ষণ করে, refresh লাগে', 'It stores the result and needs refreshing'], ['কোনো ডেটা রাখে না', 'It stores no data'], ['শুধু INSERT করা যায়', 'It only supports INSERT'], ['ইনডেক্সের অন্য নাম', 'It is another name for an index']], 0, ['সাধারণ view প্রতিবার কুয়েরি চালায়; materialized view ফলাফল রেখে দেয়।', 'A normal view re-runs its query; a materialized view keeps the result.'])
      ] }
  ];

  // ───────── FD ক্যালকুলেটর ─────────
  function parseFD(attrsText, fdText) {
    const tok = s => s.trim().split(/[\s,]+/).filter(Boolean);
    const single = /^[A-Za-z]+$/.test(attrsText.replace(/[\s,]/g, '')) && !/[\s,]/.test(attrsText.trim()) ? attrsText.trim().split('') : null;
    const attrs = single || tok(attrsText);
    const split = s => (single || attrs.every(a => a.length === 1)) && !/[\s,]/.test(s.trim()) ? s.trim().split('') : tok(s);
    const fds = fdText.split(/[;\n]+/).map(x => x.trim()).filter(x => x && /->|→/.test(x)).map(x => { const [l, r] = x.split(/->|→/); return { l: split(l), r: split(r) }; });
    return { attrs, fds };
  }
  function closure(X, fds, steps) {
    const c = new Set(X); let changed = true;
    while (changed) { changed = false; for (const f of fds) { if (f.l.every(a => c.has(a)) && f.r.some(a => !c.has(a))) { const add = f.r.filter(a => !c.has(a)); add.forEach(a => c.add(a)); changed = true; if (steps) steps.push({ f, add, now: [...c] }); } } }
    return c;
  }
  function candidateKeys(attrs, fds) {
    const right = new Set(fds.flatMap(f => f.r)); const must = attrs.filter(a => !right.has(a)); const rest = attrs.filter(a => !must.includes(a));
    const keys = [];
    if (attrs.length > 14) return { keys: [], must };
    for (let size = 0; size <= rest.length; size++) {
      const combos = (arr, k, start = 0, cur = [], out = []) => { if (cur.length === k) { out.push(cur.slice()); return out; } for (let i = start; i < arr.length; i++) { cur.push(arr[i]); combos(arr, k, i + 1, cur, out); cur.pop(); } return out; };
      for (const comb of combos(rest, size)) { const X = [...must, ...comb]; if (keys.some(k => k.every(a => X.includes(a)))) continue; if (closure(X, fds).size === attrs.length) keys.push(X); }
    }
    return { keys, must };
  }
  function normalForm(attrs, fds, keys) {
    const prime = new Set(keys.flat()); const isSuper = X => closure(X, fds).size === attrs.length;
    const nonTriv = fds.flatMap(f => f.r.filter(a => !f.l.includes(a)).map(a => ({ l: f.l, a })));
    const viol = { bcnf: [], nf3: [], nf2: [] };
    nonTriv.forEach(d => {
      const sup = isSuper(d.l);
      if (!sup) viol.bcnf.push(d);
      if (!sup && !prime.has(d.a)) viol.nf3.push(d);
      if (!prime.has(d.a) && keys.some(k => d.l.every(x => k.includes(x)) && d.l.length < k.length)) viol.nf2.push(d);
    });
    const nf = !viol.nf2.length ? (!viol.nf3.length ? (!viol.bcnf.length ? 'BCNF' : '3NF') : '2NF') : '1NF';
    return { nf, viol, prime };
  }
  const J = a => a.every(x => x.length === 1) ? a.join('') : a.join(', ');
  function toolHTML() {
    return `<section class="th-tool"><h2>🧮 ${T('FD ও Normalization ক্যালকুলেটর', 'FD & normalization calculator')}</h2>
      <p class="muted small">${T('Attribute গুলো লেখো (যেমন ABCDE বা student_id, name, dept) আর প্রতিটি FD আলাদা লাইনে বা ; দিয়ে (যেমন A->B; BC->D)।', 'Enter the attributes (e.g. ABCDE or student_id, name, dept) and each FD on its own line or separated by ; (e.g. A->B; BC->D).')}</p>
      <div class="th-tool-in"><label>${T('Relation-এর attribute', 'Attributes')}<input id="fdA" value="ABCDE"></label>
        <label>${T('Functional dependency', 'Functional dependencies')}<textarea id="fdF" rows="3">A -> B
BC -> D
D -> E</textarea></label>
        <label>${T('Closure বের করো (ঐচ্ছিক)', 'Closure of (optional)')}<input id="fdX" value="AC"></label>
        <div class="toolbar"><button class="btn primary" id="fdGo">${T('হিসাব করো', 'Calculate')}</button>
          <span class="muted small">${T('উদাহরণ:', 'Examples:')}</span> <button class="chip" data-fd="0">R(ABC) AB→C, C→B</button> <button class="chip" data-fd="1">${T('ছাত্র-কোর্স', 'Student–course')}</button> <button class="chip" data-fd="2">R(ABCD) A→B, B→C</button></div></div>
      <div id="fdOut"></div></section>`;
  }
  const FD_EX = [['ABC', 'AB -> C\nC -> B', 'C'], ['student_id, course_id, name, dept, marks', 'student_id -> name, dept\nstudent_id, course_id -> marks', 'student_id'], ['ABCD', 'A -> B\nB -> C', 'A']];
  function runTool() {
    const { attrs, fds } = parseFD($('#fdA').value, $('#fdF').value);
    const out = $('#fdOut');
    if (!attrs.length || !fds.length) { out.innerHTML = `<div class="status show err">${T('attribute আর অন্তত একটি FD দাও।', 'Give the attributes and at least one FD.')}</div>`; return; }
    const unknown = [...new Set(fds.flatMap(f => [...f.l, ...f.r]).filter(a => !attrs.includes(a)))];
    if (unknown.length) { out.innerHTML = `<div class="status show err">${T('FD-তে অজানা attribute:', 'Unknown attribute in FDs:')} ${esc(unknown.join(', '))}</div>`; return; }
    const { keys, must } = candidateKeys(attrs, fds); const r = normalForm(attrs, fds, keys);
    let html = `<div class="th-res"><div><b>${T('Candidate key', 'Candidate keys')}:</b> ${keys.map(k => `<code>${esc(J(k))}</code>`).join(', ') || '—'}</div>
      <div class="muted small">${T('যে attribute কোনো FD-র ডান পাশে নেই (প্রতিটি key-তে থাকবেই)', 'Attributes never on a right-hand side (in every key)')}: ${must.length ? `<code>${esc(J(must))}</code>` : '—'}</div>
      <div><b>${T('Prime attribute', 'Prime attributes')}:</b> ${[...r.prime].map(a => `<code>${esc(a)}</code>`).join(' ') || '—'} · <b>Non-prime:</b> ${attrs.filter(a => !r.prime.has(a)).map(a => `<code>${esc(a)}</code>`).join(' ') || '—'}</div>
      <div class="th-nf">${T('সর্বোচ্চ normal form', 'Highest normal form')}: <span class="th-nfb">${r.nf}</span></div>`;
    const why = (list, msgBn, msgEn) => list.length ? `<li>${T(msgBn, msgEn)}: ${list.map(d => `<code>${esc(J(d.l))} → ${esc(d.a)}</code>`).join(', ')}</li>` : '';
    html += `<ul>${why(r.viol.nf2, '2NF ভাঙে (partial dependency — key-র অংশ থেকে non-prime)', 'Breaks 2NF (partial dependency — part of a key determines a non-prime)')}${why(r.viol.nf3.filter(d => !r.viol.nf2.includes(d)), '3NF ভাঙে (transitive — বাঁ পাশ super key নয়, ডান পাশ non-prime)', 'Breaks 3NF (transitive — LHS not a super key, RHS non-prime)')}${why(r.viol.bcnf.filter(d => !r.viol.nf3.includes(d)), 'BCNF ভাঙে (বাঁ পাশ super key নয়)', 'Breaks BCNF (LHS not a super key)')}</ul></div>`;
    const Xtxt = $('#fdX').value.trim();
    if (Xtxt) {
      const X = parseFD($('#fdA').value, Xtxt + '->' + Xtxt).fds[0].l; const steps = []; const c = closure(X, fds, steps);
      html += `<div class="th-res"><b>(${esc(J(X))})⁺</b> ${T('বের করার ধাপ', 'step by step')}:<ol><li>${T('শুরু', 'Start')}: {${esc(J(X))}}</li>${steps.map(s => `<li>${T('FD', 'FD')} <code>${esc(J(s.f.l))} → ${esc(J(s.f.r))}</code> ${T('ব্যবহার করে যোগ', 'adds')} <b>${esc(J(s.add))}</b> ⇒ {${esc(J(s.now))}}</li>`).join('')}</ol>
        <div>${T('ফল', 'Result')}: <code>{${esc(J([...c]))}}</code> — ${c.size === attrs.length ? T('সব attribute আছে, তাই এটা <b>super key</b>।', 'contains every attribute, so it is a <b>super key</b>.') : T('সব attribute নেই, তাই super key নয়।', 'not all attributes, so not a super key.')}</div></div>`;
    }
    out.innerHTML = html;
  }

  // ───────── অবস্থা, রিভিউ, মক ─────────
  const st = store.get('sqlbn-theory', {});
  const save = () => { store.set('sqlbn-theory', st); SB.save('theory'); };
  SB.extraResolvers = SB.extraResolvers || {};
  SB.extraResolvers.th = (key, tid, i) => { const tp = TOPICS.find(x => x.id === tid); const q = tp && tp.quiz[+i]; if (!q) return null;
    return { key, kind: 'mcq', html: false, q: pick(q.q), options: q.options.map(pick), answer: q.answer, explain: q.explain, level: 'easy', topic: `${tp.icon} ${pick(tp.title)}`, src: 'DBMS', link: '#/theory/' + tid }; };
  SB.extraPools = SB.extraPools || [];
  SB.extraPools.push((okCat, mcq) => { if (okCat('theory')) TOPICS.forEach(tp => tp.quiz.forEach((_, i) => mcq.push(`th:${tp.id}:${i}`))); });
  SB.extraCats = SB.extraCats || [];
  SB.extraCats.push({ id: 'theory', label: { bn: '🏛️ DBMS তত্ত্ব', en: '🏛️ DBMS theory' } });

  function topicScore(tp) { const a = st[tp.id] || {}; const done = Object.keys(a).length; const ok = Object.entries(a).filter(([i, c]) => tp.quiz[i] && tp.quiz[i].answer === c).length; return { done, ok, total: tp.quiz.length }; }

  function renderIndex() {
    SB.context = { where: 'DBMS theory' };
    const all = TOPICS.reduce((s, tp) => { const x = topicScore(tp); return { done: s.done + x.done, ok: s.ok + x.ok, total: s.total + x.total }; }, { done: 0, ok: 0, total: 0 });
    $('#app').innerHTML = `<div class="page"><h1>🏛️ ${T('DBMS তত্ত্ব', 'DBMS Theory')}</h1>
      <p class="lead">${T('ব্যাংক IT, BPSC আর CSE লেকচারার পরীক্ষার MCQ ও ভাইভায় SQL-এর পাশাপাশি এই তত্ত্বগুলো থেকে প্রচুর প্রশ্ন আসে। প্রতিটি টপিক পড়ে MCQ দাও — ভুলগুলো রিভিউতে জমা হবে, মক টেস্টেও আসবে।', 'Bank IT, BPSC and CSE-lecturer MCQs and vivas ask a lot from these topics besides SQL. Read each topic and take its MCQs — mistakes go to Review and topics appear in mock tests.')}</p>
      <div class="pbar big"><span style="width:${all.total ? all.done * 100 / all.total : 0}%"></span></div><p class="muted">${n(all.done)}/${n(all.total)} MCQ · ✅ ${n(all.ok)}</p>
      <div class="ps-hub">${TOPICS.map(tp => { const x = topicScore(tp); return `<a class="ps-hub-card ${x.done === x.total ? 'solved' : ''}" href="#/theory/${tp.id}"><div class="ps-hub-top"><b>${tp.icon} ${esc(pick(tp.title))}</b>${tp.tool ? '<span class="ps-src this">🧮</span>' : ''}</div><div class="pbar"><span style="width:${x.done * 100 / x.total}%"></span></div><div class="ps-hub-bot"><span class="muted small">${n(x.done)}/${n(x.total)} MCQ · ✅ ${n(x.ok)}</span><span class="small">${x.done ? T('চালিয়ে যাও', 'Continue') : T('শুরু করো', 'Start')}</span></div></a>`; }).join('')}</div>
      <div class="toolbar"><a class="btn" href="#/mock">📝 ${T('তত্ত্ব থেকে মক টেস্ট (কাস্টম → DBMS তত্ত্ব)', 'Theory mock test (custom → DBMS theory)')}</a> <a class="btn ghost" href="#/print/theory">🖨 ${T('প্রিন্ট / PDF', 'Print / PDF')}</a></div></div>`;
  }
  function renderTopic(id) {
    const tp = TOPICS.find(x => x.id === id); if (!tp) return renderIndex();
    SB.context = { where: 'DBMS theory', title: pick(tp.title) };
    const i = TOPICS.indexOf(tp), prev = TOPICS[i - 1], next = TOPICS[i + 1];
    const a = st[tp.id] || {};
    $('#app').innerHTML = `<div class="page th-page"><p class="muted small"><a href="#/theory">🏛️ ${T('DBMS তত্ত্ব', 'DBMS theory')}</a> / ${n(i + 1)}</p><h1>${tp.icon} ${esc(pick(tp.title))}</h1>
      <article class="article th-article">${pick(tp.content)}</article>
      ${tp.tool ? toolHTML() : ''}
      <section class="th-quiz"><h2>✍️ MCQ</h2>${tp.quiz.map((q, k) => { const c = a[k], done = c !== undefined;
        return `<div class="quiz-q" data-k="${k}"><h4>${n(k + 1)}. ${esc(pick(q.q))}</h4><div class="quiz-opts">${q.options.map((o, j) => `<button class="quiz-opt ${done && j === q.answer ? 'correct' : done && j === c ? 'wrong' : ''}" data-j="${j}" ${done ? 'disabled' : ''}>${(EN() ? 'abcd' : 'কখগঘ')[j]}) ${esc(pick(o))}</button>`).join('')}</div>
          <div class="quiz-explain ${done ? 'show' : ''}">${done ? (c === q.answer ? '✅ ' : '❌ ') + esc(pick(q.explain)) : ''}</div></div>`; }).join('')}
        <button class="btn sm ghost" id="thReset">${T('উত্তর মুছে আবার', 'Reset answers')}</button></section>
      <div class="pager">${prev ? `<a href="#/theory/${prev.id}"><small>←</small>${esc(pick(prev.title))}</a>` : '<span></span>'}${next ? `<a class="next" href="#/theory/${next.id}"><small>→</small>${esc(pick(next.title))}</a>` : ''}</div></div>`;
    $$('pre.syntax', $('#app')).forEach(SB.highlight);
    // চালানো যায় এমন উদাহরণ
    $$('pre.ex', $('#app')).forEach(pre => { const sql = pre.textContent.trim(); pre.classList.add('syntax'); SB.highlight(pre); const b = document.createElement('div'); b.className = 'toolbar'; b.innerHTML = `<button class="btn sm">${SB.t('run')}</button>`; const out = document.createElement('div'); pre.after(b); b.after(out); b.firstChild.onclick = () => { out.innerHTML = SB.runInline(sql); }; });
    if (tp.tool) { $('#fdGo').onclick = runTool; runTool(); }
    $('#app').onclick = e => {
      const ex = e.target.closest('[data-fd]'); if (ex) { const [A, F, X] = FD_EX[+ex.dataset.fd]; $('#fdA').value = A; $('#fdF').value = F; $('#fdX').value = X; runTool(); return; }
      if (e.target.id === 'thReset') { delete st[tp.id]; save(); renderTopic(id); return; }
      const b = e.target.closest('.quiz-opt'); if (!b || b.disabled) return;
      const box = b.closest('.quiz-q'), k = +box.dataset.k, j = +b.dataset.j, q = tp.quiz[k], ok = j === q.answer;
      st[tp.id] = st[tp.id] || {}; st[tp.id][k] = j; save(); SB.review.record(`th:${tp.id}:${k}`, ok); if (ok) SB.recordActivity();
      $$('.quiz-opt', box).forEach((o, x) => { o.disabled = true; if (x === q.answer) o.classList.add('correct'); else if (x === j) o.classList.add('wrong'); });
      const ex2 = $('.quiz-explain', box); ex2.classList.add('show'); ex2.textContent = (ok ? '✅ ' : '❌ ') + pick(q.explain);
    };
  }
  SB.pages = SB.pages || {};
  SB.pages.theory = id => (id ? renderTopic(id) : renderIndex());
  SB.theory = { TOPICS, parseFD, closure, candidateKeys, normalForm, state: st };
})();
