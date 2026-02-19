CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK(role IN ('student', 'admin', 'faculty')) NOT NULL DEFAULT 'student'
);

CREATE TABLE IF NOT EXISTS notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  posted_by INTEGER,
  category TEXT CHECK(category IN ('admin', 'student')) NOT NULL DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  sent_via_email BOOLEAN DEFAULT 0
);

CREATE TABLE IF NOT EXISTS study_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  subject TEXT NOT NULL,
  plan_json TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS study_materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  link TEXT NOT NULL,
  category TEXT NOT NULL,
  uploaded_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  questions_json TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assessment_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  assessment_id INTEGER,
  score INTEGER,
  total_score INTEGER,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_type TEXT CHECK(event_type IN ('exam', 'holiday', 'event', 'deadline')) NOT NULL,
  description TEXT
);
