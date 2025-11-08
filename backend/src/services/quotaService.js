import { getDatabase } from '../models/database.js';
import { logger } from '../utils/logger.js';

const QUOTA_LIMIT = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5;

export async function checkQuota(userId) {
  const db = getDatabase();
  const today = new Date().toDateString();
  
  // Get or create user
  let user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  
  if (!user) {
    // Create new user
    db.prepare(`
      INSERT INTO users (id, quota_reset_date, quota_count)
      VALUES (?, ?, 0)
    `).run(userId, today);
    
    return {
      allowed: true,
      remaining: QUOTA_LIMIT,
      count: 0,
      resetDate: today
    };
  }
  
  // Check if quota needs reset
  if (user.quota_reset_date !== today) {
    // Reset quota
    db.prepare(`
      UPDATE users 
      SET quota_reset_date = ?, quota_count = 0
      WHERE id = ?
    `).run(today, userId);
    
    return {
      allowed: true,
      remaining: QUOTA_LIMIT,
      count: 0,
      resetDate: today
    };
  }
  
  // Check quota
  const remaining = Math.max(0, QUOTA_LIMIT - user.quota_count);
  
  return {
    allowed: user.quota_count < QUOTA_LIMIT,
    remaining: remaining,
    count: user.quota_count,
    resetDate: user.quota_reset_date
  };
}

export async function incrementQuota(userId) {
  const db = getDatabase();
  const today = new Date().toDateString();
  
  // Get user
  let user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  
  if (!user) {
    // Create user
    db.prepare(`
      INSERT INTO users (id, quota_reset_date, quota_count, total_requests, last_request_at)
      VALUES (?, ?, 1, 1, ?)
    `).run(userId, today, Math.floor(Date.now() / 1000));
    return;
  }
  
  // Reset if new day
  if (user.quota_reset_date !== today) {
    db.prepare(`
      UPDATE users 
      SET quota_reset_date = ?, quota_count = 1, last_request_at = ?
      WHERE id = ?
    `).run(today, Math.floor(Date.now() / 1000), userId);
    return;
  }
  
  // Increment
  db.prepare(`
    UPDATE users 
    SET quota_count = quota_count + 1, 
        total_requests = total_requests + 1,
        last_request_at = ?
    WHERE id = ?
  `).run(Math.floor(Date.now() / 1000), userId);
}

