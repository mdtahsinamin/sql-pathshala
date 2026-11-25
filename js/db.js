// ডেমো ডেটাবেস — একটি বিশ্ববিদ্যালয় + ছোট অনলাইন শপের ডেটা
// প্রতিটি অনুশীলন এই seed থেকে নতুন (fresh) ডেটাবেস তৈরি করে চালানো হয়।
window.SEED_SQL = `
CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  building TEXT,
  budget INTEGER
);
INSERT INTO departments VALUES
 (1,'CSE','Building A',5000000),
 (2,'EEE','Building B',4200000),
 (3,'BBA','Building C',3000000),
 (4,'English','Building C',1500000),
 (5,'Civil','Building D',3800000),
 (6,'Pharmacy','Building E',2500000);

CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  dept_id INTEGER REFERENCES departments(id),
  city TEXT,
  cgpa REAL,
  admission_year INTEGER,
  email TEXT
);
INSERT INTO students VALUES
 (1,'Rahim Uddin',1,'Dhaka',3.75,2021,'rahim@uni.edu'),
 (2,'Karim Hasan',1,'Chattogram',3.20,2022,'karim@uni.edu'),
 (3,'Fatema Akter',2,'Dhaka',3.90,2021,'fatema@uni.edu'),
 (4,'Nusrat Jahan',3,'Sylhet',3.45,2023,NULL),
 (5,'Tanvir Ahmed',1,'Rajshahi',2.95,2022,'tanvir@uni.edu'),
 (6,'Sadia Islam',4,'Khulna',3.60,2021,'sadia@uni.edu'),
 (7,'Arif Hossain',5,'Dhaka',3.10,2023,NULL),
 (8,'Mitu Rani',2,'Barishal',3.55,2022,'mitu@uni.edu'),
 (9,'Jamal Mia',3,'Rangpur',2.80,2021,'jamal@uni.edu'),
 (10,'Shirin Sultana',1,'Sylhet',3.95,2023,'shirin@uni.edu'),
 (11,'Rakib Khan',5,'Chattogram',3.30,2022,'rakib@uni.edu'),
 (12,'Lima Chowdhury',4,'Dhaka',3.15,2023,NULL),
 (13,'Hasib Rahman',2,'Mymensingh',3.70,2021,'hasib@uni.edu'),
 (14,'Anika Tabassum',3,'Dhaka',3.85,2022,'anika@uni.edu'),
 (15,'Sabbir Hossain',NULL,'Khulna',2.70,2023,'sabbir@uni.edu'),
 (16,'Puja Das',1,'Chattogram',3.50,2021,'puja@uni.edu');

CREATE TABLE courses (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  dept_id INTEGER REFERENCES departments(id),
  credit INTEGER
);
INSERT INTO courses VALUES
 (1,'Database Systems',1,3),
 (2,'Data Structures',1,3),
 (3,'Circuit Analysis',2,3),
 (4,'Digital Electronics',2,3),
 (5,'Principles of Marketing',3,3),
 (6,'Financial Accounting',3,3),
 (7,'English Literature',4,2),
 (8,'Structural Analysis',5,4),
 (9,'Machine Learning',1,3);

CREATE TABLE enrollments (
  id INTEGER PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  course_id INTEGER REFERENCES courses(id),
  semester TEXT,
  marks INTEGER
);
INSERT INTO enrollments VALUES
 (1,1,1,'Spring 2024',85),
 (2,1,2,'Fall 2023',78),
 (3,2,1,'Spring 2024',65),
 (4,2,2,'Fall 2023',72),
 (5,3,3,'Spring 2024',92),
 (6,3,4,'Fall 2023',88),
 (7,4,5,'Spring 2024',74),
 (8,5,1,'Spring 2024',55),
 (9,6,7,'Fall 2023',81),
 (10,7,8,'Spring 2024',68),
 (11,8,3,'Spring 2024',79),
 (12,8,4,'Fall 2023',NULL),
 (13,9,6,'Fall 2023',60),
 (14,10,1,'Spring 2024',95),
 (15,10,2,'Spring 2024',91),
 (16,11,8,'Fall 2023',70),
 (17,12,7,'Spring 2024',NULL),
 (18,13,3,'Fall 2023',83),
 (19,14,5,'Spring 2024',89),
 (20,14,6,'Fall 2023',86),
 (21,16,2,'Spring 2024',80),
 (22,16,1,'Fall 2023',77);

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  dept_id INTEGER REFERENCES departments(id),
  salary INTEGER,
  join_date DATE,
  manager_id INTEGER REFERENCES employees(id)
);
INSERT INTO employees VALUES
 (1,'Dr. Abdul Karim','Professor',1,150000,'2010-03-15',NULL),
 (2,'Dr. Nazma Begum','Professor',2,145000,'2012-07-01',NULL),
 (3,'Mahmud Hasan','Lecturer',1,60000,'2020-01-10',1),
 (4,'Rumana Afroz','Assistant Professor',1,90000,'2016-09-05',1),
 (5,'Shafiq Ahmed','Lecturer',2,58000,'2021-02-20',2),
 (6,'Farhana Yasmin','Associate Professor',3,110000,'2014-11-11',NULL),
 (7,'Kamal Uddin','Lecturer',3,55000,'2022-06-01',6),
 (8,'Selina Parvin','Professor',4,130000,'2011-04-18',NULL),
 (9,'Imran Hossain','Assistant Professor',5,85000,'2018-08-08',NULL),
 (10,'Jannat Ara','Lecturer',5,52000,'2023-01-15',9),
 (11,'Rafiq Islam','Officer',NULL,40000,'2019-05-05',NULL);

CREATE TABLE cities (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  division TEXT,
  population INTEGER,
  area_km2 INTEGER
);
INSERT INTO cities VALUES
 (1,'Dhaka','Dhaka',14700000,1464),
 (2,'Chattogram','Chattogram',9170000,5283),
 (3,'Khulna','Khulna',2610000,4389),
 (4,'Rajshahi','Rajshahi',2920000,2407),
 (5,'Sylhet','Sylhet',3860000,3452),
 (6,'Barishal','Barishal',2570000,2785),
 (7,'Rangpur','Rangpur',3170000,2401),
 (8,'Mymensingh','Mymensingh',5900000,4363),
 (9,'Cumilla','Chattogram',6210000,3146),
 (10,'Gazipur','Dhaka',5260000,1800),
 (11,'Narayanganj','Dhaka',3900000,700),
 (12,'Bogura','Rajshahi',3730000,2920);

CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  price REAL,
  stock INTEGER
);
INSERT INTO products VALUES
 (1,'Laptop','Electronics',75000,12),
 (2,'Smartphone','Electronics',25000,40),
 (3,'Headphone','Electronics',2500,100),
 (4,'T-Shirt','Clothing',600,200),
 (5,'Panjabi','Clothing',2200,80),
 (6,'Saree','Clothing',4500,35),
 (7,'Rice 5kg','Grocery',450,500),
 (8,'Hilsa Fish','Grocery',1200,0),
 (9,'Tea 500g','Grocery',280,150),
 (10,'SQL Book','Books',650,60),
 (11,'Novel','Books',350,0);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_name TEXT,
  city TEXT,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER,
  order_date DATE,
  status TEXT
);
INSERT INTO orders VALUES
 (1,'Rahim Uddin','Dhaka',1,1,'2024-01-05','Delivered'),
 (2,'Nadia Karim','Gazipur',4,3,'2024-01-09','Delivered'),
 (3,'Karim Hasan','Chattogram',2,1,'2024-01-15','Delivered'),
 (4,'Sumon Ali','Cumilla',7,4,'2024-02-02','Cancelled'),
 (5,'Fatema Akter','Dhaka',5,2,'2024-02-10','Delivered'),
 (6,'Nadia Karim','Gazipur',10,1,'2024-02-18','Shipped'),
 (7,'Rupa Saha','Sylhet',3,2,'2024-03-01','Delivered'),
 (8,'Rahim Uddin','Dhaka',9,5,'2024-03-07','Pending'),
 (9,'Sumon Ali','Cumilla',6,1,'2024-03-12','Cancelled'),
 (10,'Rupa Saha','Sylhet',2,1,'2024-03-20','Shipped'),
 (11,'Babul Mia','Bogura',7,10,'2024-04-02','Delivered'),
 (12,'Fatema Akter','Dhaka',3,1,'2024-04-11','Pending');

CREATE TABLE accounts (
  id INTEGER PRIMARY KEY,
  holder TEXT NOT NULL,
  balance INTEGER CHECK (balance >= 0)
);
INSERT INTO accounts VALUES
 (1,'Rahim',5000),
 (2,'Karim',3000),
 (3,'Fatema',10000);

CREATE TABLE logins (
  id INTEGER PRIMARY KEY,
  user_name TEXT NOT NULL,
  login_date DATE
);
INSERT INTO logins (user_name, login_date) VALUES
 ('Rahim','2024-03-01'),('Rahim','2024-03-02'),('Rahim','2024-03-02'),('Rahim','2024-03-03'),
 ('Rahim','2024-03-05'),('Rahim','2024-03-06'),
 ('Karim','2024-03-01'),('Karim','2024-03-03'),('Karim','2024-03-04'),('Karim','2024-03-05'),('Karim','2024-03-06'),
 ('Fatema','2024-03-02'),('Fatema','2024-03-04'),
 ('Mitu','2024-03-04'),('Mitu','2024-03-05'),('Mitu','2024-03-06');

CREATE TABLE newsletter (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL,
  subscribed_on DATE
);
INSERT INTO newsletter VALUES
 (1,'rahim@uni.edu','2024-01-01'),
 (2,'karim@mail.com','2024-01-03'),
 (3,'rahim@uni.edu','2024-01-10'),
 (4,'fatema@mail.com','2024-01-12'),
 (5,'karim@mail.com','2024-02-01'),
 (6,'mitu@mail.com','2024-02-05'),
 (7,'rahim@uni.edu','2024-02-20');

CREATE TABLE app_users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  profile TEXT
);
INSERT INTO app_users VALUES
 (1,'Rahim','{"age":22,"city":"Dhaka","skills":["SQL","Python"],"premium":true}'),
 (2,'Karim','{"age":25,"city":"Chattogram","skills":["Excel"],"premium":false}'),
 (3,'Fatema','{"age":21,"city":"Dhaka","skills":["SQL","Java","Go"],"premium":true}'),
 (4,'Mitu','{"age":23,"city":"Barishal","skills":[],"premium":false}');
`;

// প্রতিটি টেবিলের সংক্ষিপ্ত বর্ণনা (বাংলা / English)
window.TABLE_INFO = {
  departments: { bn: 'বিশ্ববিদ্যালয়ের বিভাগসমূহ (নাম, ভবন, বাজেট)', en: 'University departments (name, building, budget)' },
  students: { bn: 'ছাত্রছাত্রীদের তথ্য — বিভাগ, শহর, CGPA, ভর্তির বছর, ইমেইল', en: 'Students — department, city, CGPA, admission year, email' },
  courses: { bn: 'কোর্সের তালিকা ও কোন বিভাগের কোর্স', en: 'Courses and the department offering them' },
  enrollments: { bn: 'কোন ছাত্র কোন কোর্সে কত নম্বর পেয়েছে', en: 'Which student took which course and their marks' },
  employees: { bn: 'শিক্ষক ও কর্মচারী — পদবি, বেতন, ম্যানেজার', en: 'Teachers & staff — role, salary, manager' },
  cities: { bn: 'বাংলাদেশের কিছু জেলা — বিভাগ, জনসংখ্যা, আয়তন (আনুমানিক)', en: 'Districts of Bangladesh — division, population, area (approx.)' },
  products: { bn: 'অনলাইন শপের পণ্য — ক্যাটাগরি, দাম, স্টক', en: 'Online shop products — category, price, stock' },
  orders: { bn: 'অর্ডারের তালিকা — ক্রেতা, শহর, পণ্য, পরিমাণ, স্ট্যাটাস', en: 'Orders — customer, city, product, quantity, status' },
  accounts: { bn: 'ব্যাংক অ্যাকাউন্ট (ট্রানজ্যাকশন শেখার জন্য)', en: 'Bank accounts (for learning transactions)' },
  logins: { bn: 'অ্যাপে কে কবে লগইন করেছে (একই দিনে একাধিকবারও হতে পারে)', en: 'App login history (can repeat on the same day)' },
  newsletter: { bn: 'নিউজলেটার সাবস্ক্রিপশন — এখানে ডুপ্লিকেট ইমেইল আছে', en: 'Newsletter sign-ups — contains duplicate emails' },
  app_users: { bn: 'অ্যাপ ইউজার — profile কলামে JSON ডেটা', en: 'App users — the profile column holds JSON' }
};
