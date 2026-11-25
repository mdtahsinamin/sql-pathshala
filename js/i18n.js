// UI ভাষা (বাংলা / English)
(function () {
  const S = {
    learn: ['শিখুন', 'Learn'], playground: ['প্লেগ্রাউন্ড', 'Playground'], challenges: ['চ্যালেঞ্জ', 'Challenges'],
    database: ['ডেটাবেস', 'Database'], cheatsheet: ['চিটশিট', 'Cheatsheet'], profile: ['প্রোফাইল', 'Profile'],
    searchLessons: ['লেসন খুঁজুন… (যেমন JOIN)', 'Search lessons… (e.g. JOIN)'], nothingFound: ['কিছু পাওয়া যায়নি', 'Nothing found'],
    loading: ['ডেটাবেস ইঞ্জিন লোড হচ্ছে…', 'Loading the database engine…'],
    libFail: ['⚠️ লাইব্রেরি লোড হয়নি। ইন্টারনেট সংযোগ চেক করে পেজ রিলোড করো।', '⚠️ Libraries failed to load. Check your connection and reload.'],
    lessonsDone: ['লেসন', 'lessons'], lesson: ['লেসন', 'Lesson'],
    prevLesson: ['← আগের লেসন', '← Previous lesson'], nextLesson: ['পরের লেসন →', 'Next lesson →'],
    run: ['▶ চালাও', '▶ Run'], runCheck: ['▶ চালাও ও যাচাই করো', '▶ Run & check'], copyToEditor: ['এডিটরে নাও', 'Copy to editor'],
    hint: ['💡 হিন্ট', '💡 Hint'], solution: ['সমাধান', 'Solution'], clear: ['মুছো', 'Clear'], clearTitle: ['এডিটর খালি করো', 'Clear the editor'],
    visualize: ['🔍 ভিজুয়ালাইজ', '🔍 Visualize'], askTutor: ['🤖 টিউটর', '🤖 Tutor'], dialect: ['⇄ ডায়ালেক্ট', '⇄ Dialect'],
    exercises: ['অনুশীলন', 'Exercises'], editor: ['এডিটর', 'Editor'], quiz: ['কুইজ', 'Quiz'],
    exercise: ['অনুশীলন', 'Exercise'], done: ['সম্পন্ন', 'done'], viewTable: ['টেবিল দেখো:', 'View table:'],
    writeFirst: ['আগে এডিটরে একটা কুয়েরি লেখো।', 'Write a query in the editor first.'],
    correct: ['🎉 <b>সঠিক!</b> দারুণ হয়েছে।', '🎉 <b>Correct!</b> Well done.'], allDone: ['এই লেসনের সব অনুশীলন শেষ!', 'All exercises in this lesson are done!'],
    nextExercise: ['পরের অনুশীলন →', 'Next exercise →'], takeQuiz: ['কুইজ দাও →', 'Take the quiz →'],
    notYet: ['✗ এখনো হয়নি।', '✗ Not yet.'], hintLabel: ['💡 <b>হিন্ট:</b>', '💡 <b>Hint:</b>'], defaultHint: ['প্রশ্নটা আবার পড়ো, ধাপে ধাপে চিন্তা করো।', 'Re-read the task and think step by step.'],
    possibleSolution: ['<b>একটি সম্ভাব্য সমাধান:</b>', '<b>One possible solution:</b>'], useSolution: ['এডিটরে বসাও', 'Put in editor'],
    typeYourself: ['নিজে টাইপ করে চালালে বেশি মনে থাকবে!', 'Typing it yourself helps you remember!'],
    showExpected: ['প্রত্যাশিত আউটপুট দেখো', 'Show expected output'], expected: ['প্রত্যাশিত', 'Expected'], expectedAfter: ['সঠিক হলে টেবিল দেখতে এমন হবে', 'The table should look like this'],
    yourResult: ['তোমার ফলাফল', 'Your result'], tableAfter: ['তোমার কুয়েরির পর টেবিলের অবস্থা', 'Table after your query'],
    noRows: ['কোনো রো পাওয়া যায়নি (০ টি রো)', 'No rows returned (0 rows)'], result: ['ফলাফল', 'Result'], rows: ['টি রো', 'rows'],
    firstShown: ['প্রথম {n}টি দেখানো হচ্ছে', 'showing first {n}'], ranOk: ['✓ সফলভাবে চলেছে।', '✓ Ran successfully.'], rowsAffected: ['{n}টি রো প্রভাবিত হয়েছে।', '{n} row(s) affected.'],
    showingTable: ['<code>{t}</code> টেবিলের ডেটা দেখানো হচ্ছে।', 'Showing data from <code>{t}</code>.'],
    noExercises: ['এই লেসনে অনুশীলন নেই — যা খুশি কুয়েরি চালিয়ে দেখো।', 'No exercises here — run any query you like.'],
    score: ['স্কোর', 'Score'], retry: ['আবার চেষ্টা করো', 'Try again'], excellent: ['🏆 অসাধারণ!', '🏆 Excellent!'],
    copied: ['এডিটরে কপি হয়েছে', 'Copied to editor'], clipboard: ['ক্লিপবোর্ডে কপি হয়েছে', 'Copied to clipboard'],
    listen: ['🔊 শোনো', '🔊 Listen'], stop: ['⏹ থামাও', '⏹ Stop'], noVoice: ['এই ব্রাউজারে বাংলা ভয়েস নেই — English ভাষায় চেষ্টা করো', 'No voice available in this browser'],
    // compare
    noResultMsg: ['তোমার কুয়েরি কোনো ফলাফল দেয়নি। শেষ স্টেটমেন্টটি কি SELECT?', 'Your query returned no result. Is the last statement a SELECT?'],
    colMismatch: ['কলাম সংখ্যা মিলছে না — তোমার ফলাফলে <b>{a}</b>টি কলাম, প্রত্যাশিত <b>{b}</b>টি। প্রশ্নে ঠিক কোন কলামগুলো চাওয়া হয়েছে দেখো।', 'Column count differs — you have <b>{a}</b>, expected <b>{b}</b>. Check exactly which columns the task asks for.'],
    rowMismatch: ['রো সংখ্যা মিলছে না — তোমার ফলাফলে <b>{a}</b>টি রো, প্রত্যাশিত <b>{b}</b>টি। WHERE শর্ত, JOIN বা LIMIT চেক করো।', 'Row count differs — you have <b>{a}</b>, expected <b>{b}</b>. Check WHERE, JOIN or LIMIT.'],
    orderMismatch: ['ডেটা ঠিক আছে, কিন্তু <b>ক্রম</b> মিলছে না — ORDER BY চেক করো।', 'The data is right but the <b>order</b> differs — check ORDER BY.'],
    valueMismatch: ['রো সংখ্যা ঠিক আছে, কিন্তু কিছু মান মিলছে না। কলামের ক্রম, শর্ত বা হিসাব আবার দেখো।', 'Row count matches but some values differ. Re-check column order, conditions or calculations.'],
    checkFailed: ['তোমার কুয়েরি চলেছে, কিন্তু প্রত্যাশিত পরিবর্তন হয়নি।', 'Your query ran, but the expected change did not happen.'],
    queryError: ['কুয়েরিতে সমস্যা হয়েছে।', 'There is a problem in the query.'],
    // home
    heroTitle: ['বাংলায় <span class="hl">SQL</span> শিখুন', 'Learn <span class="hl">SQL</span> the easy way'],
    heroSub: ['সহজ বাংলা ও English ব্যাখ্যা, ব্রাউজারেই আসল ডেটাবেসে কুয়েরি, ধাপে ধাপে কুয়েরি ভিজুয়ালাইজার, AI টিউটর, ইন্টারভিউ চ্যালেঞ্জ — কোনো ইনস্টলেশন ছাড়াই।', 'Clear Bangla & English explanations, a real database in your browser, a step-by-step query visualizer, an AI tutor and interview challenges — nothing to install.'],
    start: ['শেখা শুরু করো →', 'Start learning →'], resume: ['যেখানে ছিলে সেখান থেকে শুরু →', 'Continue where you left off →'], openPg: ['প্লেগ্রাউন্ড খোলো', 'Open playground'],
    allLessons: ['সব লেসন', 'All lessons'], allLessonsSub: ['বেসিক SELECT থেকে উইন্ডো ফাংশন, JSON, ট্রিগার, অপ্টিমাইজেশন ও নিরাপত্তা পর্যন্ত।', 'From basic SELECT to window functions, JSON, triggers, optimization and security.'],
    // playground
    pgTitle: ['SQL প্লেগ্রাউন্ড', 'SQL Playground'],
    pgLead: ['এখানে যা খুশি চালাও — INSERT, UPDATE, CREATE সব। পরিবর্তন এই ব্রাউজারে সেভ থাকে, "রিসেট" না করা পর্যন্ত। কিছু অংশ সিলেক্ট করে চালালে শুধু সেটুকু চলবে।', 'Run anything — INSERT, UPDATE, CREATE. Changes are saved in this browser until you reset. Select part of the text to run only that part.'],
    tables: ['টেবিলসমূহ', 'Tables'], pgSideHelp: ['কলামে ক্লিক করলে এডিটরে বসবে। টেবিলের নামে ডাবল-ক্লিক করলে ডেটা দেখাবে।', 'Click a column to insert it. Double-click a table name to view its data.'],
    csv: ['⬇ CSV', '⬇ CSV'], resetDb: ['↺ ডেটাবেস রিসেট', '↺ Reset database'], recent: ['সাম্প্রতিক কুয়েরি', 'Recent queries'], noHistory: ['এখনো কিছু চালাওনি।', 'Nothing run yet.'],
    resetConfirm: ['ডেটাবেস রিসেট করবে? তোমার সব পরিবর্তন মুছে যাবে।', 'Reset the database? All your changes will be lost.'], resetDone: ['ডেটাবেস আগের অবস্থায় ফিরিয়ে আনা হয়েছে।', 'The database was reset.'],
    runSelectFirst: ['আগে একটি SELECT কুয়েরি চালাও', 'Run a SELECT query first'], ms: ['ms', 'ms'], autocomplete: ['অটোকমপ্লিট', 'Autocomplete'],
    // cheatsheet
    cheatTitle: ['SQL চিটশিট', 'SQL Cheatsheet'], cheatLead: ['এক নজরে সব গুরুত্বপূর্ণ সিনট্যাক্স। প্রিন্ট করতে <kbd>Ctrl</kbd>+<kbd>P</kbd>।', 'All the key syntax at a glance. Print with <kbd>Ctrl</kbd>+<kbd>P</kbd>.'],
    // challenges
    chTitle: ['ইন্টারভিউ চ্যালেঞ্জ', 'Interview Challenges'],
    chLead: ['চাকরির ইন্টারভিউতে বারবার আসা SQL প্রশ্ন। নিজে চেষ্টা করো — আটকে গেলে ধাপে ধাপে হিন্ট নাও, সমাধানের পরে বিস্তারিত ব্যাখ্যা পড়ো।', 'SQL questions that come up again and again in job interviews. Try them yourself — take hints step by step, then read the full explanation.'],
    all: ['সব', 'All'], easy: ['সহজ', 'Easy'], medium: ['মাঝারি', 'Medium'], hard: ['কঠিন', 'Hard'], solved: ['সমাধান হয়েছে', 'Solved'], unsolved: ['বাকি', 'Unsolved'],
    nextHint: ['💡 পরের হিন্ট', '💡 Next hint'], noMoreHints: ['আর হিন্ট নেই — চাইলে সমাধান দেখো।', 'No more hints — view the solution if you like.'],
    explanation: ['ব্যাখ্যা', 'Explanation'], backToList: ['← সব চ্যালেঞ্জ', '← All challenges'], nextChallenge: ['পরের চ্যালেঞ্জ →', 'Next challenge →'],
    showExplain: ['📖 সমাধান ও ব্যাখ্যা', '📖 Solution & explanation'], hintN: ['হিন্ট {n}', 'Hint {n}'],
    // database page
    dbTitle: ['ডেটাবেস', 'Database'], dbLead: ['ER ডায়াগ্রামে টেবিলগুলোর সম্পর্ক দেখো, নিজের ডেটা ইমপোর্ট করো বা ডেটাবেস ডাউনলোড করো। এখানকার পরিবর্তন প্লেগ্রাউন্ডের ডেটাবেসে হয়।', 'See how tables relate in the ER diagram, import your own data or download the database. Changes here apply to the playground database.'],
    erDiagram: ['ER ডায়াগ্রাম', 'ER diagram'], erHelp: ['🔑 = প্রাইমারি কি, 🔗 = ফরেন কি। লাইনগুলো দেখায় কোন কলাম কোন টেবিলকে নির্দেশ করে।', '🔑 = primary key, 🔗 = foreign key. Lines show which column points to which table.'],
    importData: ['নিজের ডেটা ইমপোর্ট', 'Import your own data'], importCsv: ['📄 CSV ফাইল → নতুন টেবিল', '📄 CSV file → new table'], importDb: ['🗄 SQLite ফাইল (.db/.sqlite) খোলো', '🗄 Open a SQLite file (.db/.sqlite)'],
    exportDb: ['⬇ ডেটাবেস ডাউনলোড (.sqlite)', '⬇ Download database (.sqlite)'], imported: ['ইমপোর্ট হয়েছে: {t} ({n} রো)', 'Imported: {t} ({n} rows)'], openedDb: ['ডেটাবেস খোলা হয়েছে', 'Database opened'],
    importFail: ['ইমপোর্ট ব্যর্থ: ', 'Import failed: '], tableDescriptions: ['টেবিলের বর্ণনা', 'Table descriptions'],
    // profile
    pfTitle: ['আমার প্রোফাইল', 'My profile'], yourName: ['তোমার নাম (সার্টিফিকেটের জন্য)', 'Your name (for the certificate)'],
    xp: ['XP', 'XP'], streak: ['দিনের স্ট্রিক', 'day streak'], bestStreak: ['সেরা স্ট্রিক', 'best streak'], exSolved: ['অনুশীলন সমাধান', 'exercises solved'],
    chSolved: ['চ্যালেঞ্জ সমাধান', 'challenges solved'], quizAcc: ['কুইজে সঠিক', 'quiz accuracy'], lessonsCompleted: ['লেসন শেষ', 'lessons completed'],
    activity: ['গত ১২ সপ্তাহের কার্যক্রম', 'Activity, last 12 weeks'], badges: ['ব্যাজ', 'Badges'], certificate: ['সার্টিফিকেট', 'Certificate'],
    certLocked: ['সব লেসন শেষ করলে সার্টিফিকেট আনলক হবে। এখন পর্যন্ত: {p}%', 'Finish every lesson to unlock the certificate. Progress: {p}%'],
    certReady: ['অভিনন্দন! তোমার সার্টিফিকেট তৈরি।', 'Congratulations! Your certificate is ready.'], downloadCert: ['⬇ সার্টিফিকেট ডাউনলোড (PNG)', '⬇ Download certificate (PNG)'],
    backup: ['ব্যাকআপ ও অন্য ডিভাইসে নেওয়া', 'Backup & move to another device'],
    backupHelp: ['অগ্রগতি এই ব্রাউজারেই সেভ থাকে। অন্য ফোন/কম্পিউটারে নিতে ফাইল এক্সপোর্ট করে সেখানে ইমপোর্ট করো, অথবা সিঙ্ক কোড কপি করে সেখানে পেস্ট করো।', 'Progress is saved in this browser. To move it, export a file and import it elsewhere, or copy the sync code and paste it there.'],
    exportProgress: ['⬇ অগ্রগতি এক্সপোর্ট', '⬇ Export progress'], importProgress: ['⬆ অগ্রগতি ইমপোর্ট', '⬆ Import progress'],
    copyCode: ['📋 সিঙ্ক কোড কপি', '📋 Copy sync code'], pasteCode: ['📥 সিঙ্ক কোড পেস্ট', '📥 Paste sync code'], pastePrompt: ['সিঙ্ক কোড পেস্ট করো:', 'Paste the sync code:'],
    progressImported: ['অগ্রগতি ইমপোর্ট হয়েছে ✓', 'Progress imported ✓'], badCode: ['কোডটা সঠিক নয়', 'That code is not valid'],
    resetProgress: ['🗑 সব অগ্রগতি মুছো', '🗑 Reset all progress'], resetProgressConfirm: ['সত্যিই সব অগ্রগতি মুছে ফেলবে? এটা ফেরানো যাবে না।', 'Really delete all progress? This cannot be undone.'],
    newBadge: ['🏅 নতুন ব্যাজ: ', '🏅 New badge: '],
    // tutor
    tutorTitle: ['AI টিউটর', 'AI Tutor'], tutorIntro: ['আমি তোমার SQL টিউটর। কুয়েরি ব্যাখ্যা, ভুল খোঁজা, হিন্ট — যা দরকার জিজ্ঞেস করো।', 'I\'m your SQL tutor. Ask me to explain a query, find a mistake, or give a hint.'],
    tutorPlaceholder: ['প্রশ্ন লেখো… (Enter = পাঠাও, Shift+Enter = নতুন লাইন)', 'Ask something… (Enter = send, Shift+Enter = new line)'],
    send: ['পাঠাও', 'Send'], settings: ['⚙ সেটিংস', '⚙ Settings'], apiKey: ['Anthropic API key', 'Anthropic API key'], model: ['মডেল', 'Model'], save: ['সেভ', 'Save'],
    keyHelp: ['AI টিউটরের জন্য তোমার নিজের Anthropic API key লাগবে (console.anthropic.com)। key শুধু এই ব্রাউজারে সেভ থাকে এবং সরাসরি Anthropic-এ পাঠানো হয় — অন্য কোথাও না। শেয়ার করা কম্পিউটারে key রাখবে না।', 'The AI tutor needs your own Anthropic API key (console.anthropic.com). It is stored only in this browser and sent directly to Anthropic — nowhere else. Don\'t save it on a shared computer.'],
    offlineMode: ['API key ছাড়া: অফলাইন টিউটর কুয়েরি বিশ্লেষণ করে সাধারণ ভুল ধরিয়ে দেবে।', 'Without a key: the offline tutor analyses your query and points out common mistakes.'],
    qaExplain: ['আমার কুয়েরি ব্যাখ্যা করো', 'Explain my query'], qaWrong: ['ভুল কোথায়?', 'What\'s wrong?'], qaHint: ['হিন্ট দাও (সমাধান না)', 'Give a hint (no solution)'], qaConcept: ['ধারণাটা সহজ করে বোঝাও', 'Explain the concept simply'],
    thinking: ['ভাবছি…', 'Thinking…'], keySaved: ['সেভ হয়েছে', 'Saved'], clearChat: ['🗑 চ্যাট মুছো', '🗑 Clear chat'], removeKey: ['key মুছো', 'Remove key'],
    errAuth: ['API key সঠিক নয়। সেটিংসে আবার দাও।', 'The API key is invalid. Re-enter it in settings.'], errRate: ['অনুরোধ বেশি হয়ে গেছে — একটু পরে আবার চেষ্টা করো।', 'Rate limited — try again shortly.'],
    errNet: ['Anthropic-এর সাথে সংযোগ হচ্ছে না। ইন্টারনেট চেক করো।', 'Can\'t reach Anthropic. Check your connection.'], errRefusal: ['এই প্রশ্নের উত্তর দেওয়া যাচ্ছে না। অন্যভাবে জিজ্ঞেস করো।', 'This request was declined. Try rephrasing.'],
    offlineTag: ['অফলাইন টিউটর', 'Offline tutor'],
    // visualizer
    vizTitle: ['কুয়েরি ভিজুয়ালাইজার', 'Query Visualizer'], vizLead: ['ডেটাবেস কোন ক্রমে তোমার কুয়েরি চালায় — প্রতিটি ধাপে রোগুলোর কী হয়, নিজের চোখে দেখো।', 'See the order in which the database runs your query — and what happens to the rows at each step.'],
    vizRun: ['🔍 ভিজুয়ালাইজ করো', '🔍 Visualize'], step: ['ধাপ', 'Step'], prev: ['← আগে', '← Back'], next: ['পরে →', 'Next →'], play: ['▶ চালাও', '▶ Play'], pause: ['⏸ থামাও', '⏸ Pause'],
    kept: ['রাখা হলো', 'kept'], removed: ['বাদ গেল', 'removed'], groups: ['টি গ্রুপ', 'groups'],
    vizUnsupported: ['এই কুয়েরিটা ধাপে ধাপে দেখানো যাচ্ছে না ({r})। শুধু চূড়ান্ত ফলাফল দেখাচ্ছি।', 'This query can\'t be shown step by step ({r}). Showing the final result only.'],
    close: ['বন্ধ করো', 'Close'], samples: ['উদাহরণ:', 'Examples:'],
    // dialect
    dialectTitle: ['অন্য ডেটাবেসে এই কুয়েরি', 'This query in other databases'],
    dialectNote: ['স্বয়ংক্রিয় রূপান্তর — আনুমানিক। আসল ডেটাবেসে চালিয়ে যাচাই করে নিও।', 'Automatic translation — approximate. Verify on the real database.'],
    noChanges: ['কোনো পরিবর্তন লাগবে না — এই কুয়েরি এভাবেই চলবে।', 'No changes needed — this query runs as is.'], notes: ['নোট', 'Notes'],
    install: ['📲 অ্যাপ ইনস্টল', '📲 Install app'], offlineReady: ['অফলাইনে ব্যবহারের জন্য প্রস্তুত', 'Ready to use offline'], video: ['🎬 ভিডিও', '🎬 Video'],
    jobprep: ['চাকরি প্রস্তুতি', 'Job Prep'], visualizer: ['ভিজুয়ালাইজার', 'Visualizer'], explainer: ['ব্যাখ্যা', 'Explain'], explainBtn: ['🧠 ব্যাখ্যা', '🧠 Explain'], more: ['আরও', 'More'],
    jpTitle: ['চাকরি প্রস্তুতি: বাংলাদেশ', 'Job Prep: Bangladesh'],
    jpLead: ['সরকারি প্রতিষ্ঠান ও ব্যাংকের IT পদ (BUET/BPSC পরিচালিত — Titas, DESCO, NESCO, BREB, BTCL, সোনালী/ইসলামী ব্যাংক ইত্যাদি) এবং বিশ্ববিদ্যালয়ের CSE লেকচারার নিয়োগে যে ধরনের SQL প্রশ্ন আসে, সেগুলোর অনুশীলন। কুয়েরি প্রশ্ন এই পেজের নিজস্ব ডেটাবেসে চালিয়ে সঙ্গে সঙ্গে যাচাই হয়।', 'Practise the kind of SQL questions asked for government and bank IT posts in Bangladesh (BUET/BPSC-administered — Titas, DESCO, NESCO, BREB, BTCL, Sonali/Islami Bank and others) and for university CSE lecturer recruitment. Query questions run on this page\'s own database and are checked instantly.'],
    jpNote: ['প্রশ্নগুলো পরীক্ষায় আসা প্রশ্নের ধরন অনুসরণ করে এই ডেটাবেসের জন্য নতুন করে লেখা; ট্যাগে দেখানো হয়েছে কোন পরীক্ষার ধাঁচে।', 'Questions follow the style of past exam questions, rewritten for this database; the tag shows which exam the style comes from.'],
    typeSql: ['কুয়েরি', 'Query'], typeMcq: ['MCQ', 'MCQ'], typeViva: ['ভাইভা/লিখিত', 'Viva/Written'],
    showAnswer: ['📖 মডেল উত্তর দেখো', '📖 Show model answer'], hideAnswer: ['উত্তর লুকাও', 'Hide answer'], tryIt: ['▶ নিজে চালিয়ে দেখো', '▶ Try it yourself'],
    markKnown: ['✓ আমি জানি', '✓ I know this'], known: ['জানা', 'Known'],
    mainDb: ['মূল ডেটাবেস', 'Main database'], jobDb: ['চাকরি-প্রস্তুতি ডেটাবেস', 'Job-prep database'], dbLabel: ['ডেটাবেস:', 'Database:'],
    practiceDb: ['এই প্রশ্নগুলোর ডেটাবেস', 'Database for these questions'], questions: ['প্রশ্ন', 'questions'], allTypes: ['সব ধরন', 'All types'],
    lecturerTitle: ['লেকচারার (CSE) প্রস্তুতি', 'Lecturer (CSE) prep'],
    lecturerLead: ['বিশ্ববিদ্যালয়ের CSE লেকচারার নিয়োগে লিখিত পরীক্ষা, ভাইভা ও ডেমো ক্লাসে আসা ডেটাবেস তত্ত্বের প্রশ্ন — মডেল উত্তরসহ।', 'Database theory questions from written tests, vivas and demo classes for university CSE lecturer posts — with model answers.'],
    practice: ['অনুশীলন', 'Practice'],
    psTitle: ['এই টপিকের অনুশীলন সেট', 'Practice set for this topic'],
    psLead: ['টপিকটা পড়া শেষ? এবার নিজে কুয়েরি লিখে সমাধান করো — "চালাও ও যাচাই করো" চাপলেই জানবে সমাধান হয়েছে কিনা। এখানে এই লেসনের নতুন প্রশ্ন, আর একই টপিকের চাকরি-পরীক্ষা ও ইন্টারভিউ প্রশ্ন আছে।', 'Finished the topic? Now write the queries yourself — press "Run & check" to see if it is solved. This set has new questions for this lesson plus job-exam and interview questions on the same topic.'],
    psSolve: ['✍️ সমাধান করো', '✍️ Solve'], psAgain: ['আবার করো', 'Solve again'], psClose: ['বন্ধ করো', 'Close'], psNext: ['পরের প্রশ্ন →', 'Next question →'],
    psThis: ['এই লেসন', 'This lesson'], psJob: ['চাকরি পরীক্ষা', 'Job exam'], psCh: ['ইন্টারভিউ', 'Interview'], psAllDone: ['🎉 এই টপিকের সব অনুশীলন শেষ!', '🎉 You finished every practice question in this topic!'],
    psGoSet: ['🎯 অনুশীলন সেটে যাও', '🎯 Go to the practice set'], psSolved: ['সমাধান হয়েছে', 'solved'],
    psHubTitle: ['টপিকভিত্তিক অনুশীলন', 'Practice by topic'], psHubLead: ['প্রতিটি টপিক শেখার পর এখানে সেই টপিকের প্রশ্ন নিজে কুয়েরি লিখে সমাধান করো। প্রতিটি উত্তর সাথে সাথে যাচাই হয়; ভুল হলে প্রশ্নটা রিভিউ তালিকায় যায়।', 'After each topic, solve its questions here by writing queries yourself. Every answer is checked instantly; mistakes go to your review list.'],
    psStart: ['অনুশীলন করো →', 'Practise →'], psContinue: ['চালিয়ে যাও →', 'Continue →'],
    mock: ['মক টেস্ট', 'Mock Test'], review: ['রিভিউ', 'Review'],
    copySql: ['📋 কপি', '📋 Copy'], fromTable: ['টেবিল', 'table']
  };
  let lang = 'bn';
  try { lang = localStorage.getItem('sqlbn-lang') || 'bn'; } catch (e) { }
  window.I18N = {
    get lang() { return lang; },
    set(l) { lang = l; try { localStorage.setItem('sqlbn-lang', l); } catch (e) { } document.documentElement.lang = l === 'en' ? 'en' : 'bn'; },
    t(key, vars) {
      const e = S[key]; let s = e ? e[lang === 'en' ? 1 : 0] : key;
      if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
      return s;
    },
    // বাংলা মোডে বাংলা সংখ্যা
    n(x) { return lang === 'en' ? String(x) : String(x).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]); },
    // {bn, en} অবজেক্ট থেকে বর্তমান ভাষার লেখা
    pick(o) { return o == null ? '' : typeof o === 'string' ? o : (o[lang] || o.bn || o.en || ''); }
  };
  document.documentElement.lang = lang === 'en' ? 'en' : 'bn';
})();
