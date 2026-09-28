CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  record TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS authors (
  email TEXT PRIMARY KEY,
  joined_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS story_images (
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  mime TEXT NOT NULL,
  data BLOB NOT NULL,
  created_at TEXT NOT NULL
);
