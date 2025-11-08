# 🚀 Deploy to Production

## Quick Deploy (Railway - Recommended)

1. **Go to Railway:** https://railway.app
2. **Sign up** with GitHub
3. **New Project** → Deploy from GitHub repo
4. **Select:** `amirb101/AdvocateAI`
5. **Settings:**
   - Root Directory: `backend`
   - Build: `npm install` (default)
   - Start: `npm start` (default)
6. **Variables tab** → Add these:
   ```
   DEEPSEEK_API_KEY = your_deepseek_api_key_here
   NODE_ENV = production
   JWT_SECRET = 0248ccaa7bf92fcb25798997c8f478b4c6f108ef2d921315b56a3d2e6dc7eb2f
   API_KEY_SECRET = 752c06e0e8b36bd0ed70444d70fae5bf88f5e820fd4537d3ed51c20b98fa0f40
   DATABASE_PATH = ./data/advocate.db
   RATE_LIMIT_WINDOW_MS = 86400000
   RATE_LIMIT_MAX_REQUESTS = 5
   CACHE_TTL_SECONDS = 3600
   LOG_LEVEL = info
   ```
7. **Deploy** → Get your URL: `https://your-app.railway.app`
8. **Test:** `curl https://your-app.railway.app/api/v1/health`

## Update Extension

1. Chrome → `chrome://extensions/` → Options
2. Backend URL: `https://your-app.railway.app`
3. Provider: DeepSeek, Model: DeepSeek Chat
4. Save & Test!

## Alternative: Render

Same steps, but at https://render.com - see `backend/DEPLOY.md` for details.

