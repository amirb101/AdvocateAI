# Git Setup & Deployment Checklist

## Step 1: Initialize Git (if not already done)

```bash
cd /Users/amirbattye/dev/AdvocateAI
git init
```

## Step 2: Add All Files

```bash
git add .
```

## Step 3: Commit Everything

```bash
git commit -m "Initial commit: Advocate LLM Chrome Extension with backend

- Complete Chrome extension (Manifest V3)
- Backend API server (Express.js)
- Multi-LLM support (OpenAI, DeepSeek, Anthropic)
- Quote matching with multiple strategies
- Readability integration with fallbacks
- Rate limiting and caching
- Complete documentation
- Privacy policy and terms of service
- Ready for deployment"
```

## Step 4: Create GitHub Repo

1. Go to https://github.com/new
2. Repository name: `AdvocateAI` (or your choice)
3. Description: "Chrome extension that surfaces opposing viewpoints in news articles"
4. Choose Public or Private
5. **Don't** initialize with README (we already have one)
6. Click "Create repository"

## Step 5: Connect and Push

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/AdvocateAI.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 6: Verify

- Go to your GitHub repo
- Verify all files are there
- Check that `.env` is NOT there (should be in .gitignore)

## Step 7: Deploy!

Now you can deploy from GitHub:
- **Railway**: Connect GitHub repo → Auto-deploys
- **Render**: Connect GitHub repo → Auto-deploys
- **Fly.io**: Already connected if using CLI

---

## Important: Don't Commit Secrets!

✅ **Safe to commit:**
- All code files
- Documentation
- Configuration files (except .env)

❌ **Never commit:**
- `.env` files (already in .gitignore)
- API keys
- Database files (`*.db`)
- Logs (`*.log`)

Your `.gitignore` already excludes these!

