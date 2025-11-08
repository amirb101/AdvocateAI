import express from 'express';
import { body, validationResult } from 'express-validator';
import { callLLM } from '../services/llmService.js';
import { generateCacheKey, getCached, setCached } from '../services/cache.js';
import { checkQuota, incrementQuota } from '../services/quotaService.js';
import { logRequest } from '../services/requestLogService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Validation middleware
const validateAnalyze = [
  body('articleText').isString().isLength({ min: 100, max: 50000 }).withMessage('Article text must be between 100 and 50000 characters'),
  body('provider').isIn(['openai', 'deepseek', 'anthropic']).withMessage('Invalid provider'),
  body('model').isString().notEmpty().withMessage('Model is required'),
  body('userId').optional().isString()
];

router.post('/', validateAnalyze, async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }
    
    const { articleText, provider, model, userId } = req.body;
    const userIdentifier = userId || req.ip; // Use IP if no userId
    
    // Check quota
    const quotaCheck = await checkQuota(userIdentifier);
    if (!quotaCheck.allowed) {
      logger.warn(`Quota exceeded for user: ${userIdentifier}`);
      return res.status(429).json({
        success: false,
        error: 'Quota exceeded',
        message: `You have ${quotaCheck.remaining} requests remaining today`,
        quota: quotaCheck
      });
    }
    
    // Check cache
    const cacheKey = generateCacheKey(articleText, provider, model);
    const cached = getCached(cacheKey);
    
    if (cached) {
      logger.info(`Cache hit for article analysis`);
      await logRequest(userIdentifier, provider, model, cacheKey, true, true);
      return res.json({
        success: true,
        data: cached,
        cached: true
      });
    }
    
    // Call LLM
    logger.info(`Calling LLM: ${provider}/${model}`);
    const result = await callLLM(articleText, provider, model);
    
    // Cache the result
    setCached(cacheKey, result);
    
    // Increment quota
    await incrementQuota(userIdentifier);
    
    // Log request
    await logRequest(userIdentifier, provider, model, cacheKey, false, true);
    
    res.json({
      success: true,
      data: result,
      cached: false
    });
    
  } catch (error) {
    logger.error('Error in analyze endpoint:', error);
    
    // Log failed request
    const userIdentifier = req.body.userId || req.ip;
    await logRequest(userIdentifier, req.body.provider, req.body.model, null, false, false, error.message);
    
    next(error);
  }
});

export default router;

