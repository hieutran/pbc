-- Personal Breath Coach Database Schema
-- Migration: 0001_initial_schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY,
  default_technique TEXT,
  theme TEXT CHECK(theme IN ('light', 'dark', 'auto')) DEFAULT 'auto',
  sound_enabled INTEGER DEFAULT 1,
  reminder_enabled INTEGER DEFAULT 0,
  reminder_time TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Exercise sessions table
CREATE TABLE IF NOT EXISTS exercise_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  technique TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in seconds
  cycles INTEGER,
  settings TEXT NOT NULL, -- JSON string of exercise settings
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON exercise_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_completed_at ON exercise_sessions(completed_at);
CREATE INDEX IF NOT EXISTS idx_sessions_technique ON exercise_sessions(technique);
CREATE INDEX IF NOT EXISTS idx_sessions_user_completed ON exercise_sessions(user_id, completed_at DESC);

-- Trigger to update updated_at on users table
CREATE TRIGGER IF NOT EXISTS update_users_timestamp
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
END;
