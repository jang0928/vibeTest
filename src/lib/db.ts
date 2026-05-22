import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'survey.db');

declare global {
  // eslint-disable-next-line no-var
  var _surveyDb: DatabaseSync | undefined;
}

export function getDb(): DatabaseSync {
  if (globalThis._surveyDb) {
    return globalThis._surveyDb;
  }

  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new DatabaseSync(DB_PATH);

  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      name            TEXT    NOT NULL,
      email           TEXT    NOT NULL,
      phone           TEXT,
      affiliation     TEXT,
      age_group       TEXT,
      gender          TEXT,
      purpose         TEXT,
      ai_experience   TEXT,
      interest_areas  TEXT,
      comments        TEXT,
      status          TEXT NOT NULL DEFAULT 'pending',
      created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS trg_submissions_updated_at
      AFTER UPDATE ON submissions
      FOR EACH ROW
    BEGIN
      UPDATE submissions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `);

  globalThis._surveyDb = db;
  return db;
}
