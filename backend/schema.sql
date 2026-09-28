CREATE TABLE IF NOT EXISTS submissions (
  submission_id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  student TEXT NOT NULL,
  test_id TEXT NOT NULL,
  result_json TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS submissions_created_at_idx
  ON submissions (created_at DESC);
