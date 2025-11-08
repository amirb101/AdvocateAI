# 🎯 What's Left For You To Do

## 🔴 Critical (Must Do Before Launch)

### 1. Deploy Backend to Production ⏱️ ~30 minutes

**Choose a hosting platform:**
- **Railway** (easiest): https://railway.app
- **Render** (free tier): https://render.com
- **Fly.io** (good performance): https://fly.io

**Steps:**
1. Create account on chosen platform
2. Connect your GitHub repo
3. Set environment variables:
   - `DEEPSEEK_API_KEY` = your actual DeepSeek key
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = run `openssl rand -hex 32` and paste result
   - `API_KEY_SECRET` = run `openssl rand -hex 32` and paste result
4. Deploy!
5. Get your production URL (e.g., `https://your-app.railway.app`)

**See:** `backend/DEPLOY.md` for detailed instructions

---

### 2. Update Legal Documents ⏱️ ~10 minutes

**Edit `PRIVACY_POLICY.md`:**
- Replace `[Date]` with today's date
- Replace `[your-email@example.com]` with your actual email

**Edit `TERMS_OF_SERVICE.md`:**
- Replace `[Date]` with today's date
- Replace `[your-email@example.com]` with your actual email

**Then:**
- Host these somewhere (GitHub Pages, your website, etc.)
- Or include them in the extension package

---

### 3. Configure Extension for Production ⏱️ ~5 minutes

1. Open extension Settings
2. Add Backend URL: your production URL from step 1
3. Select Provider: **DeepSeek**
4. Select Model: **DeepSeek Chat**
5. Save

**Test it:**
- Go to a news article
- Click extension → "Find 5 Polarising Points"
- Should work with production backend!

---

### 4. Create Chrome Web Store Listing ⏱️ ~1 hour

**Prerequisites:**
- Chrome Web Store Developer Account ($5 one-time fee)
- Sign up: https://chrome.google.com/webstore/devconsole

**Create Listing:**
1. Go to Chrome Web Store Developer Dashboard
2. Click "New Item"
3. Upload extension ZIP (see below)
4. Fill out store listing (use `CHROME_STORE_LISTING.md` as template)
5. Add Privacy Policy URL (from step 2)
6. Add screenshots:
   - Extension popup
   - Highlighted article with tooltip
   - Settings page
7. Submit for review

**Create Extension ZIP:**
```bash
# From project root
zip -r advocate-llm.zip . \
  -x "*.git*" \
  -x "node_modules/*" \
  -x "backend/*" \
  -x "*.md" \
  -x ".env*" \
  -x "*.log" \
  -x "data/*" \
  -x "logs/*"
```

**See:** `CHROME_STORE_LISTING.md` for listing content

---

## 🟡 Important (Should Do)

### 5. Test Everything ⏱️ ~30 minutes

**Test Checklist:**
- [ ] Backend health check works: `curl https://your-backend.com/api/v1/health`
- [ ] Extension connects to production backend
- [ ] Test on 3-5 different news sites (BBC, Guardian, NYT, etc.)
- [ ] Verify quotes are highlighted correctly
- [ ] Test tooltips appear and work
- [ ] Test error handling (disconnect backend, invalid requests)
- [ ] Test quota system (make 5+ requests, verify it stops at 5)
- [ ] Test caching (analyze same article twice, should be instant)

---

### 6. Monitor After Launch ⏱️ Ongoing

**First Week:**
- Check backend logs daily
- Monitor API costs
- Watch for errors
- Respond to user feedback quickly

**Tools:**
- Backend logs: Railway/Render/Fly.io dashboard
- API costs: DeepSeek dashboard
- User feedback: Chrome Web Store reviews

---

## 🟢 Optional (Can Add Later)

- [ ] Create proper extension icons (replace placeholders)
- [ ] Add analytics (optional, privacy-conscious)
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Create landing page/website
- [ ] Add user authentication
- [ ] Add Stripe payments

---

## 📋 Quick Checklist

**Before Launch:**
- [ ] Backend deployed with DeepSeek API key
- [ ] Random secrets generated and set
- [ ] Legal docs updated with your email
- [ ] Extension tested with production backend
- [ ] Chrome Web Store listing created
- [ ] Screenshots taken
- [ ] Privacy Policy hosted somewhere

**Launch Day:**
- [ ] Submit to Chrome Web Store
- [ ] Monitor for issues
- [ ] Check backend logs
- [ ] Respond to any errors quickly

---

## ⏱️ Time Estimate

**Minimum (MVP Launch):**
- Backend deployment: 30 min
- Legal docs: 10 min
- Extension config: 5 min
- Testing: 30 min
- Store listing: 1 hour
- **Total: ~2.5 hours**

**Polished Launch:**
- Add icon creation: +1 hour
- Add screenshots/demo: +1 hour
- More thorough testing: +1 hour
- **Total: ~5.5 hours**

---

## 🚀 Recommended Order

1. **Today:** Deploy backend + update legal docs (40 min)
2. **Today:** Test extension with production backend (30 min)
3. **Tomorrow:** Create Chrome Web Store listing (1 hour)
4. **Tomorrow:** Submit to store
5. **Next Week:** Monitor and fix any issues

---

## 📞 Need Help?

- **Backend deployment:** See `backend/DEPLOY.md`
- **Security setup:** See `backend/SECURITY.md`
- **Configuration:** See `backend/CONFIG.md`
- **Full checklist:** See `PRE_LAUNCH_CHECKLIST.md`

---

**You're almost there!** 🎉 Just deploy the backend, update the legal docs, and submit to the Chrome Web Store!

