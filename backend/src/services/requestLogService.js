import { getDatabase } from '../models/database.js';
import { logger } from '../utils/logger.js';

export async function logRequest(userId, provider, model, articleHash, cached, success, errorMessage = null) {
  try {
    const db = getDatabase();
    
    db.prepare(`
      INSERT INTO requests (user_id, provider, model, article_hash, cached, success, error_message)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      provider,
      model,
      articleHash,
      cached ? 1 : 0,
      success ? 1 : 0,
      errorMessage
    );
  } catch (error) {
    logger.error('Failed to log request:', error);
    // Don't throw - logging failures shouldn't break the API
  }
}

