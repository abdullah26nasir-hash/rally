-- Feedback board: device-identity requests, votes, comments, reports (pre-auth; rows migrate to user_id at signup)
CREATE TABLE fb_scouts (
  device_hash TEXT PRIMARY KEY,
  scout_number INTEGER UNIQUE NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE fb_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_hash TEXT NOT NULL,
  title TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',
  team_update TEXT,
  team_update_at TEXT,
  created_at TEXT NOT NULL,
  hidden INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_fb_requests_created ON fb_requests(created_at);
CREATE TABLE fb_votes (
  request_id INTEGER NOT NULL,
  device_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (request_id, device_hash)
);
CREATE TABLE fb_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id INTEGER NOT NULL,
  device_hash TEXT NOT NULL,
  body TEXT NOT NULL,
  is_team INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  hidden INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_fb_comments_request ON fb_comments(request_id);
CREATE TABLE fb_reports (
  comment_id INTEGER NOT NULL,
  device_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (comment_id, device_hash)
);
