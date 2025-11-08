# 🚀 Quick Setup - Let's Get This Running!

## Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

## Step 2: Start Backend

```bash
npm start
```

You should see:
```
🚀 Server running on port 3000
📝 Environment: development
🔗 API available at http://localhost:3000
```

## Step 3: Test Backend

Open a new terminal and run:

```bash
# Health check
curl http://localhost:3000/api/v1/health

# Should return JSON with status: "healthy"
```

## Step 4: Configure Extension

1. Open Chrome → `chrome://extensions/`
2. Find "Advocate LLM" extension
3. Click "Options" (or right-click → Options)
4. Add Backend URL: `http://localhost:3000`
5. Select Provider: **DeepSeek**
6. Select Model: **DeepSeek Chat**
7. Click "Save Settings"

## Step 5: Test Extension

1. Go to a news article (BBC, Guardian, NYT, etc.)
2. Click the extension icon
3. Click "Find 5 Polarising Points"
4. Wait for highlights to appear!
5. Hover over yellow highlights to see counterpoints

## Troubleshooting

**Backend won't start:**
- Make sure Node.js >= 18: `node --version`
- Check `.env` file exists: `ls backend/.env`
- Check logs: `tail -f backend/logs/combined.log`

**Extension can't connect:**
- Make sure backend is running (`npm start`)
- Check backend URL in extension settings
- Open browser console (F12) to see errors

**API errors:**
- Check DeepSeek API key is correct in `.env`
- Test with curl: `curl http://localhost:3000/api/v1/health`

## Next: Deploy to Production

Once local testing works:
1. Deploy backend to Railway/Render/Fly.io
2. Update extension with production URL
3. Submit to Chrome Web Store

See `backend/DEPLOY.md` for deployment instructions!

