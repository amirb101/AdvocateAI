# Production Deployment Guide

## Pre-Deployment Checklist

- [ ] Add DeepSeek API key to production environment
- [ ] Change `JWT_SECRET` and `API_KEY_SECRET` to random strings
- [ ] Set `NODE_ENV=production`
- [ ] Test all endpoints work
- [ ] Verify CORS allows your production domain
- [ ] Set up monitoring/alerts

## Railway Deployment

1. **Connect Repository**
   - Go to Railway.app
   - New Project → Deploy from GitHub
   - Select your repo

2. **Configure**
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Set Environment Variables**
   - `DEEPSEEK_API_KEY` = your key
   - `NODE_ENV` = `production`
   - `PORT` = (auto-set by Railway)
   - `JWT_SECRET` = random string
   - `API_KEY_SECRET` = random string

4. **Deploy**
   - Railway auto-deploys on push
   - Get your production URL
   - Test: `curl https://your-app.railway.app/api/v1/health`

## Render Deployment

1. **Create Web Service**
   - Go to Render.com
   - New → Web Service
   - Connect GitHub repo

2. **Configure**
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Environment: Node

3. **Set Environment Variables**
   - Same as Railway above

4. **Deploy**
   - Render auto-deploys
   - Get your production URL

## Fly.io Deployment

```bash
cd backend
fly launch
# Follow prompts, select region
fly secrets set DEEPSEEK_API_KEY=your_key
fly secrets set NODE_ENV=production
fly secrets set JWT_SECRET=$(openssl rand -hex 32)
fly secrets set API_KEY_SECRET=$(openssl rand -hex 32)
fly deploy
```

## Post-Deployment

1. **Test Production**
   ```bash
   curl https://your-backend-url.com/api/v1/health
   ```

2. **Update Extension**
   - Go to extension Settings
   - Update Backend URL to production URL
   - Save

3. **Monitor**
   - Check logs: `fly logs` or Railway/Render dashboard
   - Monitor API costs
   - Watch for errors

## Security Checklist

- [ ] API keys set in production environment (not code)
- [ ] `NODE_ENV=production` set
- [ ] Random secrets generated
- [ ] HTTPS enabled (automatic on Railway/Render/Fly.io)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Error messages don't leak info

## Troubleshooting Production

**502 Bad Gateway:**
- Check server logs
- Verify environment variables set
- Check Node.js version (needs >= 18)

**CORS errors:**
- Verify CORS allows Chrome extension origins
- Check backend URL in extension settings

**API errors:**
- Verify API keys are correct
- Check provider API status
- Review backend logs

