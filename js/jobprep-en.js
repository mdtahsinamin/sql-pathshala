// চাকরি প্রস্তুতির প্রশ্ন — বাংলাদেশের নিয়োগ পরীক্ষার মতো আনুষ্ঠানিক ইংরেজিতে।
// প্রশ্নপত্রে যেমন থাকে তেমনভাবে ইংরেজি প্রধান; বাংলা মোডে নিচে বাংলা অনুবাদ দেখায়।
(function () {
  const S = {
    emp: '<code>emp(emp_id, name, designation, dept_id, salary, commission, city, join_date, manager_id, email)</code>',
    dept: '<code>dept(dept_id, dept_name, location)</code>',
    stu: '<code>student_info(stu_id, name, department, cgpa, email, phone, fee_balance)</code>',
    sales: '<code>salesperson(id, name, age, salary, city, commission)</code>, <code>customer(id, name, city, industry)</code> and <code>sales_order(number, order_date, cust_id, salesperson_id, amount)</code>',
    bank: '<code>depositor(customer_name, account_number)</code> and <code>borrower(customer_name, loan_number)</code>',
    es: '<code>employee_salary(emp_id, project, salary)</code>'
  };
  const EN = {
    // ── DDL / DML
    'j-create-fk': `Write an SQL statement to create a table <code>course</code> with the following columns: <code>course_id</code> INTEGER as the PRIMARY KEY, <code>course_name</code> TEXT NOT NULL, and <code>stu_id</code> INTEGER as a FOREIGN KEY referencing <code>student_info(stu_id)</code>. Make sure referential integrity is enforced.`,
    'j-alter-gender': `Consider the table ${S.emp}. Write an SQL statement to add a new column <code>gender</code> of type TEXT, with a CHECK constraint that allows only the values <code>'Male'</code> or <code>'Female'</code>.`,
    'j-rename-col': `Consider the table ${S.emp}. Write an SQL statement to rename the column <code>email</code> to <code>office_email</code>.`,
    'j-update-case': `Consider the table ${S.emp}. Write a single SQL command to increase the salary by 20% for employees whose salary is greater than 50000, and by 10% for all other employees.`,
    'j-delete-no-orders': `Given ${S.sales}, write an SQL query to delete the customers who have not placed any orders.`,
    'j-insert-two': `Consider the table ${S.stu}. Write an SQL command to insert the following two records:<br>(9, 'Sakib', 'CSE', 3.60, 'sakib@gmail.com', '01700000009', 0) and (10, 'Riya', 'EEE', 3.75, NULL, '01800000010', 1500).`,
    'j-copy-table': `Consider the table ${S.emp}. Write an SQL command to create a backup table <code>emp_backup</code> that has the same structure and data as <code>emp</code>.`,
    // ── WHERE / ORDER BY / LIKE
    'j-dhaka-15000': `Consider the table ${S.emp}. Write an SQL query to find the name and salary of all employees who live in Dhaka and whose salary is higher than Tk. 40,000.`,
    'j-like-name-desig': `Consider the table ${S.emp}. Write an SQL query to find all employees whose name includes "Abdul Jalil" and whose designation is "Section Officer".`,
    'j-between-date': `Consider the table ${S.emp}. Write an SQL query to find the name and joining date of the employees whose joining date falls between 01 January 2018 and 31 December 2020 (inclusive).`,
    'j-like-underscore': `Consider the table ${S.emp}. Write an SQL query to fetch the names of the employees whose name has the letter 'a' in the second position.`,
    'j-recent-orders': `Given ${S.sales}, write an SQL query to show all details of the orders, with the most recent orders on top.`,
    'j-even-rows': `Consider the table ${S.emp}. Write an SQL query to display the records of the employees whose <code>emp_id</code> is an even number.`,
    'j-gmail-count': `Consider the table ${S.stu}. Write an SQL query to count the number of students whose email address ends with "gmail.com".`,
    'j-sort-two': `Given ${S.sales}, write an SQL query to select the name, salary and commission of all salespersons. Sort the result in ascending order of commission and then in descending order of salary.`,
    // ── JOIN
    'j-emp-dept': `Given ${S.emp} and ${S.dept}, write an SQL query to display the name of each employee along with the name of the department they work in.`,
    'j-dept-count-left': `Given ${S.emp} and ${S.dept}, write an SQL query to display every department name together with the number of employees in it. Departments with no employees must be shown with a count of 0.`,
    'j-self-manager': `Consider the table ${S.emp}, where <code>manager_id</code> refers to <code>emp_id</code> of the same table. Write an SQL query to display the name of each employee along with the name of his or her manager.`,
    'j-before-manager': `Consider the table ${S.emp}, where <code>manager_id</code> refers to <code>emp_id</code> of the same table. Write an SQL query to display the names of the employees who joined before their manager.`,
    'j-samsonic': `Given ${S.sales}, write an SQL query to find the names of all salespersons who have an order with the customer named 'Samsonic'.`,
    'j-not-samsonic': `Given ${S.sales}, write an SQL query to find the names of all salespersons who do not have any order with the customer named 'Samsonic'.`,
    'j-diff-city': `Given ${S.sales}, write an SQL query to locate those salespersons who do not live in the same city where their customers live and who receive a commission of more than 12%. Return customer name, customer city, salesperson name, salesperson city and commission.`,
    'j-account-not-loan': `Consider the bank database relations ${S.bank}. Write an SQL query to find all customers of the bank who have an account but not a loan.`,
    // ── Aggregation / GROUP BY / HAVING
    'j-count-25k': `Consider the table ${S.emp}. For all departments, find the number of employees who get more than 40,000 salary. Print the <code>dept_id</code> and the total number of such employees.`,
    'j-dept-above-company-avg': `Given ${S.emp} and ${S.dept}, write an SQL query to find the names of the departments whose average employee salary is greater than the average salary of the whole company.`,
    'j-fewer-than-3': `Given ${S.emp} and ${S.dept}, write an SQL query to display the department id and department name of the departments that employ fewer than three employees (including departments with no employees).`,
    'j-dept-most-emp': `Given ${S.emp} and ${S.dept}, write an SQL query to display the department id and department name of the department that has the highest number of employees.`,
    'j-max-avg-dept': `Consider the table ${S.emp}. Write an SQL query to find the maximum salary and the average salary for each department.`,
    'j-two-or-more-orders': `Given ${S.sales}, write an SQL query to find the names of the salespersons who have two or more orders, along with the number of orders.`,
    'j-emp-with-dept-avg': `Consider the table ${S.emp}. Write an SQL query that displays the employee id, name, salary, department id, and the average salary of their department, for all employees who belong to a department.`,
    // ── Subquery / Ranking / Nth
    'j-2nd-max': `Consider the table ${S.emp}. Write an SQL query to find the second highest salary.`,
    'j-3rd-max': `Consider the table ${S.emp}. Write an SQL query to find the third maximum (distinct) salary.`,
    'j-nth-dense': `Consider the table ${S.emp}. Write an SQL query to get the n-th highest salary, where n can be any number. Use DENSE_RANK and show the answer for n = 4.`,
    'j-top-per-dept-in': `Consider the table ${S.emp}. Write an SQL query to find the employees who earn the highest salary in each department. Return department id, employee name and salary.`,
    'j-max-cgpa-who': `Consider the table ${S.stu}. Write a query to get the maximum CGPA of each department and the student(s) who obtained it. Return name, department and CGPA.`,
    'j-top3-salary': `Consider the table ${S.emp}. Write an SQL query to retrieve the top 3 highest-paid employees (name and salary), in descending order of salary.`,
    'j-above-avg': `Consider the table ${S.emp}. Write an SQL command to show those employees whose salary is greater than the average salary of all employees. Return employee id, name and salary.`,
    'j-greater-than-all': `Consider the table ${S.emp}. Find the name and salary of the employees whose salary is greater than the salary of every employee of department 20.`,
    'j-manager-many': `Consider the table ${S.emp}. Write an SQL query to fetch the employee id and name of all employees who are managers and manage more than 2 employees.`,
    // ── Duplicates
    'j-dup-salary': `Consider the table ${S.emp}. Write an SQL query to find the duplicate salary values, i.e. the salaries shared by more than one employee, along with how many employees share each.`,
    'j-dup-rows': `Consider the table ${S.es}. Write an SQL query to find the duplicate records based on (project, salary), showing how many times each pair occurs.`,
    'j-remove-dup': `Consider the table ${S.es}. Write an SQL query to remove the duplicate rows (same project and salary) without using a temporary table, keeping the row with the smallest <code>emp_id</code> in each group.`,
    'j-distinct-without': `Consider the table ${S.stu}. How do you get the distinct departments from the table without using the DISTINCT keyword? Write the query.`,
    'j-in-one-not-other': `Consider the bank database relations ${S.bank}. Write an SQL query to fetch the customers who are present in one table but not in the other, i.e. customers who have a loan but no account.`,
    // ── Keys
    'j-two-tables-fk': `Write SQL queries to create the following two tables and identify the primary key and foreign key, making sure referential integrity is enforced:<br>a) <code>office(office_id INTEGER, office_name TEXT NOT NULL)</code> — primary key <code>office_id</code><br>b) <code>staff(staff_id INTEGER, staff_name TEXT NOT NULL, office_id INTEGER)</code> — primary key <code>staff_id</code>, foreign key <code>office_id</code> referencing <code>office</code>.`,
    'j-pk-fk-mcq': 'Which of the following statements about primary keys and foreign keys is true?',
    'j-candidate-mcq': 'A minimal super key that uniquely identifies each tuple of a relation, from which the primary key is chosen, is called a:',
    'j-ref-integrity-mcq': 'With foreign key constraints enforced, what happens when a row is inserted into <code>emp</code> with <code>dept_id = 99</code>, a department that does not exist in <code>dept</code>?',
    // ── Normalization
    'j-1nf-mcq': "A student table stores several phone numbers in a single column, e.g. <code>'01711…, 01811…'</code>. Which normal form does this violate?",
    'j-2nf-mcq': 'In the relation <code>enrollment(stu_id, course_id, stu_name, grade)</code> with primary key (stu_id, course_id), the attribute <code>stu_name</code> depends only on <code>stu_id</code>. Which normal form is violated?',
    'j-3nf-mcq': 'In the relation <code>emp(emp_id, name, dept_id, dept_location)</code>, <code>dept_location</code> depends on <code>dept_id</code>, which depends on <code>emp_id</code>. Which normal form is violated?',
    'j-anomaly-mcq': "In an unnormalized table, deleting a department's last employee also deletes the department's information. This is known as:",
    'j-bcnf-viva': 'Explain 1NF, 2NF, 3NF and BCNF with suitable examples. Why is BCNF considered stricter than 3NF?',
    'j-denorm-viva': 'What is denormalization? In which situations is a database deliberately denormalized?',
    // ── Security
    'j-inject-sql': `A login page builds its query as <code>"SELECT * FROM emp WHERE email = '" + input + "'"</code>. An attacker enters <code>' OR '1'='1</code> as input. Write the resulting SQL query and execute it to show how much data is exposed.`,
    'j-inject-mcq': 'Which of the following is the most effective way to prevent SQL injection?',
    'j-inject-viva': 'What is SQL injection? Describe the common types of SQL injection attacks and the approaches to prevent them.',
    // ── DDL / DML MCQ
    'j-ddl-dml-mcq': 'Which of the following is a DML (Data Manipulation Language) command?',
    'j-truncate-mcq': 'After which of the following statements can the data usually NOT be recovered with ROLLBACK (in Oracle/MySQL)?',
    'j-unmatched-mcq': 'Which type of join is used to find the unmatched data from a table?',
    // ── Output
    'j-count-null': "What is the output of the following SQL statements?<br><code>CREATE TABLE t (val INT);<br>INSERT INTO t VALUES (1), (2), (2), (3), (NULL), (NULL), (4), (5);<br>SELECT COUNT(val), COUNT(DISTINCT val) FROM t;</code>",
    'j-avg-null': 'For the same table <code>t</code> (values 1, 2, 2, 3, NULL, NULL, 4, 5), what is the output of <code>SELECT AVG(val) FROM t;</code>?',
    'j-eq-null': 'For the same table <code>t</code>, what is the output of <code>SELECT COUNT(*) FROM t WHERE val = NULL;</code>?',
    'j-order-output': 'Table <code>myTable(id, name)</code> contains: (1, Dhaka), (11, Electric), (2, Supply), (1, Company), (1, Limited), (0, Bangladesh). What are the first and last rows of the output of<br><code>SELECT * FROM myTable WHERE id &gt; 0 ORDER BY id DESC, name DESC;</code>',
    'j-natural-join': 'The table <code>Loan_Records(Borrower, Bank_Manager, Loan_Amount)</code> contains (Hr, Aminul, 10000), (Rkb, A. Kashem, 5000) and (Jon, Aminul, 7000). What is the output of the following query?<br><code>SELECT COUNT(*) FROM ((SELECT Borrower, Bank_Manager FROM Loan_Records) AS S NATURAL JOIN (SELECT Bank_Manager, Loan_Amount FROM Loan_Records) AS T);</code>',
    'j-blob-mcq': 'Which data type is used to store photos, PDF or DOCX files in a database?',
    // ── Lecturer (CSE)
    'l-dbms-vs-file': 'What are the advantages of a Database Management System (DBMS) over a traditional file processing system?',
    'l-sql-categories': 'Differentiate among DDL, DML, DCL and TCL with examples of each.',
    'l-delete-truncate-drop': 'Differentiate among the DELETE, TRUNCATE and DROP commands.',
    'l-keys': 'Define super key, candidate key, primary key, alternate key, foreign key and composite key with a suitable example.',
    'l-acid': 'Explain the ACID properties of a transaction with the example of a bank fund transfer.',
    'l-isolation': 'What are dirty read, non-repeatable read and phantom read? Which transaction isolation level prevents which anomaly?',
    'l-relational-algebra': 'What is relational algebra? Mention its fundamental operators, and express the following SQL query in relational algebra: <code>SELECT name FROM emp WHERE salary &gt; 50000;</code>',
    'l-index': 'What is an index? Differentiate between clustered and non-clustered indexes. When can an index degrade performance?',
    'l-where-having': 'Differentiate between the WHERE and HAVING clauses. Write a query that uses both.',
    'l-view-mview': 'Differentiate between a view and a materialized view. How can a materialized view be implemented in Oracle, SQL Server and MySQL?',
    'l-er-mapping': 'How are one-to-one, one-to-many and many-to-many relationships of an ER diagram mapped into relational tables?',
    'l-in-exists': 'Differentiate between IN and EXISTS, and between UNION and UNION ALL. When should each be used?',
    'l-proc-func-trigger': 'Differentiate among a stored procedure, a function and a trigger.',
    'l-deadlock': 'What is a deadlock? How does the Two-Phase Locking (2PL) protocol ensure serializability, and how are deadlocks handled in a DBMS?',
    'l-teach-join': '(Demo class) How would you teach the concept of JOIN to first-year undergraduate students? Present a 10-minute lesson plan.'
  };
  (window.JOB_QUESTIONS || []).forEach(q => { if (EN[q.id]) q.q.en = EN[q.id]; });
  // প্রশ্নপত্রের মতো: ইংরেজি প্রধান, বাংলা মোডে নিচে অনুবাদ
  window.jobQuestionHTML = q => `<div class="q-en" lang="en">${q.q.en}</div>` +
    (window.I18N && I18N.lang !== 'en' && q.q.bn ? `<div class="q-bn"><span>বাংলায়:</span> ${q.q.bn}</div>` : '');
})();
