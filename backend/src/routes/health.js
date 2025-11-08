import express from 'express';
import { getCacheStats } from '../services/cache.js';
import { getDatabase } from '../models/database.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    
    // Check database connection
    db.prepare('SELECT 1').get();
    
    // Get cache stats
    const cacheStats = getCacheStats();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      cache: {
        keys: cacheStats.keys,
        hits: cacheStats.hits,
        misses: cacheStats.misses
      },
      database: 'connected'
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

export default router;

