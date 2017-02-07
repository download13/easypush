CREATE TABLE subscriptions (
  user_id TEXT PRIMARY KEY,
  subscription TEXT NOT NULL,
  enabled INTEGER DEFAULT 1
);

CREATE TABLE channels (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  label TEXT
);

CREATE INDEX channels_by_user ON channels (user_id);

-- Down
DROP TABLE subscriptions;
DROP TABLE channels;
