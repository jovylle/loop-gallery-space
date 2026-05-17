CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  display_title TEXT,
  bio TEXT,
  avatar_key TEXT,
  links_json TEXT,
  theme_json TEXT,
  is_public INTEGER DEFAULT 1,
  storage_bytes INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS gallery_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  r2_key TEXT NOT NULL,
  media_type TEXT NOT NULL,
  mime TEXT,
  width INTEGER,
  height INTEGER,
  caption TEXT,
  tags_json TEXT,
  sort_order INTEGER NOT NULL,
  blurhash TEXT,
  size_bytes INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS upload_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_items_user_order ON gallery_items(user_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_upload_log_user_date ON upload_log(user_id, created_at);
