import NodeCache from 'node-cache';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';

const cacheTTL = parseInt(process.env.CACHE_TTL_SECONDS) || 3600; // 1 hour default

// Create cache instance
const cache = new NodeCache({
  stdTTL: cacheTTL,
  checkperiod: 600, // Check for expired keys every 10 minutes
  useClones: false // Better performance
});

export function initializeCache() {
  logger.info(`Cache initialized with TTL: ${cacheTTL}s`);
}

export function getCache() {
  return cache;
}

// Generate cache key from article text and model
export function generateCacheKey(articleText, provider, model) {
  const hash = crypto.createHash('sha256');
  hash.update(articleText + provider + model);
  return hash.digest('hex');
}

// Get from cache
export function getCached(key) {
  const cached = cache.get(key);
  if (cached) {
    logger.debug(`Cache hit for key: ${key.substring(0, 16)}...`);
    return cached;
  }
  logger.debug(`Cache miss for key: ${key.substring(0, 16)}...`);
  return null;
}

// Set in cache
export function setCached(key, value, ttl = cacheTTL) {
  cache.set(key, value, ttl);
  logger.debug(`Cached value for key: ${key.substring(0, 16)}...`);
}

// Clear cache
export function clearCache() {
  cache.flushAll();
  logger.info('Cache cleared');
}

// Get cache stats
export function getCacheStats() {
  return cache.getStats();
}

