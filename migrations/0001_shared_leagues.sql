CREATE TABLE IF NOT EXISTS leagues (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS members (
  league_code TEXT NOT NULL REFERENCES leagues(code) ON DELETE CASCADE,
  device_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  gw INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  joined_at TEXT NOT NULL,
  PRIMARY KEY (league_code, device_hash)
);
CREATE INDEX IF NOT EXISTS members_league ON members(league_code);
