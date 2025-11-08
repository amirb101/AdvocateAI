import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger.js';

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 86400000; // 24 hours
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5;

export const rateLimiter = rateLimit({
  windowMs: windowMs,
  max: maxRequests,
  message: {
    error: 'Rate limit exceeded',
    message: `Maximum ${maxRequests} requests per ${windowMs / 1000 / 60 / 60} hours`,
    retryAfter: windowMs / 1000
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: `Maximum ${maxRequests} requests per ${windowMs / 1000 / 60 / 60} hours`,
      retryAfter: windowMs / 1000
    });
  }
});

