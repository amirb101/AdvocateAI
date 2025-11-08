import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initializeDatabase } from './models/database.js';
import { initializeCache } from './services/cache.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import analyzeRoutes from './routes/analyze.js';
import healthRoutes from './routes/health.js';
import quotaRoutes from './routes/quota.js';
import { logger } from './utils/logger.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow extension to call API
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration - allow Chrome extension origin
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow Chrome extension origins
    if (origin.startsWith('chrome-extension://')) {
      return callback(null, true);
    }
    
    // In development, allow localhost
    if (NODE_ENV === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Body parsing with size limits
app.use(express.json({ limit: '5mb' })); // Reduced from 10mb for security
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use('/api/', rateLimiter);

// Routes
app.use('/api/v1/analyze', analyzeRoutes);
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/quota', quotaRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Advocate LLM API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      analyze: '/api/v1/analyze',
      health: '/api/v1/health',
      quota: '/api/v1/quota/:userId'
    }
  });
});

// Error handling (must be last)
app.use(errorHandler);

// Initialize services
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    logger.info('Database initialized');
    
    // Initialize cache
    initializeCache();
    logger.info('Cache initialized');
    
    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📝 Environment: ${NODE_ENV}`);
      logger.info(`🔗 API available at http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();

export default app;

