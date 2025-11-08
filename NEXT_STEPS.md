# ✅ Backend Setup Complete!

## What We Just Did

1. ✅ Installed all backend dependencies
2. ✅ Configured `.env` with your DeepSeek API key
3. ✅ Started the backend server

## Next Steps - Test It!

### 1. Check Backend is Running

Open a new terminal and run:

```bash
curl http://localhost:3000/api/v1/health
```

You should see JSON like:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "uptime": ...,
  "cache": {...},
  "database": "connected"
}
```

### 2. Configure Extension

1. **Open Chrome Extensions:**
   - Go to `chrome://extensions/`
   - Make sure "Developer mode" is ON (top right)

2. **Load Extension (if not already loaded):**
   - Click "Load unpacked"
   - Select the `AdvocateAI` folder (not the backend folder)

3. **Configure Settings:**
   - Click the extension icon (or right-click → Options)
   - **Backend URL:** `http://localhost:3000`
   - **Provider:** DeepSeek
   - **Model:** DeepSeek Chat
   - Click "Save Settings"

### 3. Test It!

1. **Go to a news article:**
   - Visit: https://www.bbc.com/news or https://www.theguardian.com
   - Open any article

2. **Use the extension:**
   - Click the extension icon
   - Click "Find 5 Polarising Points"
   - Wait 10-30 seconds (LLM processing)
   - You should see yellow highlights appear!

3. **View counterpoints:**
   - Hover over any yellow highlight
   - Tooltip shows the counterargument

### 4. Troubleshooting

**Backend not running?**
```bash
cd backend
npm start
```

**Extension can't connect?**
- Make sure backend is running (`npm start`)
- Check Backend URL in extension settings: `http://localhost:3000`
- Open browser console (F12) to see errors

**No highlights appear?**
- Check browser console (F12) for errors
- Check backend logs: `tail -f backend/logs/combined.log`
- Make sure article text was extracted (check popup messages)

**API errors?**
- Verify DeepSeek API key is correct in `backend/.env`
- Check backend logs for detailed errors

## 🎉 Once It Works Locally...

You're ready to deploy to production! See `backend/DEPLOY.md` for:
- Railway deployment (easiest)
- Render deployment
- Fly.io deployment

Then update extension with production URL and submit to Chrome Web Store!

---

**Try it now!** Go to a news article and click "Find 5 Polarising Points" 🚀

