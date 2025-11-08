# Production Configuration

## Environment Variables for Production

Create `.env` file with these values:

```env
# Server
PORT=3000
NODE_ENV=production

# API Keys (REQUIRED - add your DeepSeek key)
DEEPSEEK_API_KEY=your_deepseek_key_here
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Database
DATABASE_PATH=./data/advocate.db

# Rate Limiting
RATE_LIMIT_WINDOW_MS=86400000
RATE_LIMIT_MAX_REQUESTS=5

# Cache
CACHE_TTL_SECONDS=3600

# Security (CHANGE THESE!)
JWT_SECRET=generate_random_string_here
API_KEY_SECRET=generate_random_string_here

# Logging
LOG_LEVEL=info
```

## Generate Random Secrets

```bash
# Generate random secrets for production
openssl rand -hex 32
# Use output for JWT_SECRET and API_KEY_SECRET
```

## Quick Setup Script

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your DeepSeek API key
# Generate and add random secrets
npm start
```

## Testing

```bash
# Health check
curl http://localhost:3000/api/v1/health

# Test analyze (replace YOUR_KEY with actual key)
curl -X POST http://localhost:3000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "articleText": "Test article about climate change...",
    "provider": "deepseek",
    "model": "deepseek-chat"
  }'
```

