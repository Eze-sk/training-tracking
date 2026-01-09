PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS user_metadata (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  max_streak INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  routine_start_date DATE
);

CREATE TABLE IF NOT EXISTS target_days (
  user_id INTEGER,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  
  PRIMARY KEY (user_id, day_of_week),
  FOREIGN KEY (user_id) REFERENCES user_metadata(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS training_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    date_recorded DATE NOT NULL, -- YYYY-MM-DD format
    status TEXT CHECK(status IN ('completed', 'failed', 'pending')),
    UNIQUE(user_id, date_recorded),
    FOREIGN KEY (user_id) REFERENCES user_metadata(id) ON DELETE CASCADE
);

