# 🚀 Deployment Guide

## Production Backend

**URL:** `https://advocateai-production.up.railway.app`

## Update Extension

1. Chrome → `chrome://extensions/` → Options
2. Backend URL: `https://advocateai-production.up.railway.app`
3. Provider: DeepSeek, Model: DeepSeek Chat
4. Save & Test!

## Railway Variables

Make sure these are set in Railway Dashboard → Variables:
- `DEEPSEEK_API_KEY` = your DeepSeek API key
- `NODE_ENV` = `production`
- `JWT_SECRET` = random string
- `API_KEY_SECRET` = random string
- `DATABASE_PATH` = `./data/advocate.db`
- `RATE_LIMIT_WINDOW_MS` = `86400000`
- `RATE_LIMIT_MAX_REQUESTS` = `5`
- `CACHE_TTL_SECONDS` = `3600`
- `LOG_LEVEL` = `info`

## Test

```bash
curl https://advocateai-production.up.railway.app/api/v1/health
```

See `backend/DEPLOY.md` for detailed deployment instructions.

