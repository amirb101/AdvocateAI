import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DATABASE_PATH || './data/advocate.db';
const dbDir = dbPath.substring(0, dbPath.lastIndexOf('/'));

// Create data directory if it doesn't exist
if (dbDir && !existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

let db = null;

export function getDatabase() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL'); // Better concurrency
  }
  return db;
}

export async function initializeDatabase() {
  const database = getDatabase();
  
  // Create users table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      quota_reset_date TEXT NOT NULL,
      quota_count INTEGER NOT NULL DEFAULT 0,
      total_requests INTEGER NOT NULL DEFAULT 0,
      last_request_at INTEGER
    )
  `);
  
  // Create cache table
  database.exec(`
    CREATE TABLE IF NOT EXISTS cache (
      id TEXT PRIMARY KEY,
      article_hash TEXT NOT NULL UNIQUE,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      response TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      expires_at INTEGER NOT NULL
    )
  `);
  
  // Create requests table for logging
  database.exec(`
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      article_hash TEXT,
      cached INTEGER NOT NULL DEFAULT 0,
      success INTEGER NOT NULL DEFAULT 1,
      error_message TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )
  `);
  
  // Create indexes
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_cache_article_hash ON cache(article_hash);
    CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON cache(expires_at);
    CREATE INDEX IF NOT EXISTS idx_users_quota_reset ON users(quota_reset_date);
    CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests(user_id);
    CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at);
  `);
  
  logger.info('Database initialized successfully');
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

