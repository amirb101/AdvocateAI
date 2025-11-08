# Production Security Configuration

## Required Changes Before Launch

### 1. Generate Random Secrets

**DO NOT use default secrets in production!**

```bash
# Generate random JWT secret
openssl rand -hex 32

# Generate random API key secret  
openssl rand -hex 32
```

Add these to your `.env` file:
```env
JWT_SECRET=<generated_random_string>
API_KEY_SECRET=<generated_random_string>
```

### 2. Set Production Environment

```env
NODE_ENV=production
```

This enables:
- Production error handling (no stack traces to users)
- Optimized logging
- Security optimizations

### 3. Verify API Keys

Make sure your DeepSeek API key is set:
```env
DEEPSEEK_API_KEY=sk-your-actual-key-here
```

### 4. Review CORS Settings

The backend allows:
- Chrome extension origins (`chrome-extension://`)
- Localhost (development only)

For production, ensure your hosting provider's domain is handled correctly.

### 5. Rate Limiting

Default: 5 requests per 24 hours per user/IP

Adjust if needed:
```env
RATE_LIMIT_MAX_REQUESTS=5
RATE_LIMIT_WINDOW_MS=86400000  # 24 hours
```

### 6. Request Size Limits

Currently set to 5MB max. Adjust if needed in `src/server.js`:
```javascript
app.use(express.json({ limit: '5mb' }));
```

## Security Checklist

- [ ] Random secrets generated (not defaults)
- [ ] `NODE_ENV=production` set
- [ ] API keys added to production environment
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Error messages don't leak sensitive info
- [ ] HTTPS enabled (automatic on most platforms)
- [ ] Database path is secure (not world-readable)

## Monitoring

After deployment, monitor:
- Error logs: `logs/error.log`
- Combined logs: `logs/combined.log`
- Database: Check quota usage
- API costs: Monitor provider dashboard

