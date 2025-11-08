# Backend API Server

Secure, scalable backend for Advocate LLM Chrome Extension.

## Quick Start

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your DeepSeek API key: DEEPSEEK_API_KEY=your_key
npm start
```

Server runs on `http://localhost:3000`

## Configuration

Edit `.env` file:
- `DEEPSEEK_API_KEY` - Your DeepSeek API key (required)
- `OPENAI_API_KEY` - Optional, if using OpenAI
- `ANTHROPIC_API_KEY` - Optional, if using Anthropic
- `PORT` - Server port (default: 3000)
- `RATE_LIMIT_MAX_REQUESTS` - Requests per day (default: 5)

## API Endpoints

### POST /api/v1/analyze
Analyze article and find polarising points.

**Request:**
```json
{
  "articleText": "Article content...",
  "provider": "deepseek",
  "model": "deepseek-chat",
  "userId": "optional-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": [{"quote": "...", "counterpoint": "...", ...}],
  "cached": false
}
```

### GET /api/v1/health
Health check endpoint.

### GET /api/v1/quota/:userId
Get quota status for user.

## Features

- ✅ Secure API key storage (never exposed to client)
- ✅ Rate limiting (5/day default)
- ✅ Response caching (reduces API costs)
- ✅ Multi-LLM support (OpenAI, DeepSeek, Anthropic)
- ✅ Database-backed quota tracking
- ✅ Request logging
- ✅ Error handling & logging

## Deployment

### Railway
1. Connect GitHub repo
2. Set environment variables
3. Deploy!

### Render
1. Create Web Service
2. Build: `cd backend && npm install`
3. Start: `cd backend && npm start`
4. Add environment variables

### Fly.io
```bash
fly launch
fly secrets set DEEPSEEK_API_KEY=your_key
fly deploy
```

## Security

- API keys stored on server only
- Rate limiting prevents abuse
- Input validation
- CORS configured for Chrome extensions
- Security headers (Helmet)
- Error messages don't leak sensitive info

## Architecture

```
Extension → Backend API → LLM Provider
              ↓
         Cache (instant responses)
         Database (quota tracking)
         Rate Limiter (abuse prevention)
```

## Database

SQLite database with tables:
- `users` - Quota tracking
- `cache` - Cached analyses
- `requests` - Request logging

## Environment Variables

See `.env.example` for all options.

## API Documentation

### POST /api/v1/analyze

Analyze article and find polarising points.

**Request:**
```json
{
  "articleText": "Full article text...",
  "provider": "deepseek" | "openai" | "anthropic",
  "model": "deepseek-chat" | "gpt-3.5-turbo" | "claude-3-haiku-20240307",
  "userId": "optional-user-id"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": [
    {
      "quote": "Exact quote from article",
      "stance": "What the claim argues for",
      "why_polarising": "Why this is controversial",
      "counterpoint": "Steelmanned counterargument",
      "citations": ["url1", "url2"]
    }
  ],
  "cached": false
}
```

**Status Codes:**
- `200` - Success
- `400` - Validation error
- `429` - Rate limit exceeded
- `500` - Server error

### GET /api/v1/health

Health check endpoint. Returns server status, cache stats, and database connection.

### GET /api/v1/quota/:userId

Get quota status for a user. Returns remaining requests, count, and reset date.

## Architecture

```
Chrome Extension
      ↓
  Backend API (Express)
      ↓
  ┌─────────────────┐
  │  Rate Limiter   │ ← Prevents abuse (5/day)
  └─────────────────┘
      ↓
  ┌─────────────────┐
  │  Cache Layer    │ ← Reduces API costs (~80% savings)
  └─────────────────┘
      ↓
  ┌─────────────────┐
  │  Quota Service  │ ← Tracks usage (database-backed)
  └─────────────────┘
      ↓
  ┌─────────────────┐
  │  LLM Service    │ ← Calls DeepSeek/OpenAI/Anthropic
  └─────────────────┘
      ↓
  ┌─────────────────┐
  │  Database       │ ← SQLite (upgradeable to PostgreSQL)
  └─────────────────┘
```

## Components

- **API Server** (`src/server.js`) - Express.js with CORS, Helmet, logging
- **Routes** (`src/routes/`) - analyze, health, quota endpoints
- **Services** (`src/services/`) - LLM calls, caching, quota, logging
- **Middleware** (`src/middleware/`) - Rate limiting, request logging, error handling
- **Database** (`src/models/`) - SQLite with users, cache, requests tables
- **Utils** (`src/utils/`) - Winston logging

## Security Features

1. API keys stored on server (never exposed)
2. Rate limiting (prevents abuse)
3. Input validation (express-validator)
4. Security headers (Helmet.js)
5. CORS (Chrome extensions only)
6. Error handling (doesn't leak sensitive info)

## Scalability

**Current (MVP):**
- In-memory cache (NodeCache)
- SQLite database
- Single server

**Production Ready:**
- Redis for distributed caching
- PostgreSQL database
- Load balancer
- Multiple instances

## Monitoring

- Winston logging (files + console)
- Request logging in database
- Health check endpoint
- Cache statistics

## Troubleshooting

**Backend won't start:**
- Check Node.js version (needs >= 18.0.0)
- Verify `.env` file exists
- Check API keys are set

**API calls failing:**
- Verify API keys in `.env` are correct
- Check logs: `tail -f logs/combined.log`
- Test health endpoint: `curl http://localhost:3000/api/v1/health`

## Next Steps

- [ ] Deploy to production
- [ ] Set production environment variables
- [ ] Monitor logs and usage
- [ ] Upgrade to PostgreSQL (optional)
- [ ] Add Redis caching (optional)
