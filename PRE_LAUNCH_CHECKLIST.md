# 🚀 Pre-Launch Checklist

## 🔴 Critical (Must Have)

### Backend
- [ ] **Deploy backend to production**
  - [ ] Choose hosting (Railway/Render/Fly.io)
  - [ ] Set environment variables (API keys, secrets)
  - [ ] Test production URL works
  - [ ] Set up domain/SSL certificate
  - [ ] Configure CORS for production domain

- [ ] **Security Hardening**
  - [ ] Change `JWT_SECRET` and `API_KEY_SECRET` to random strings
  - [ ] Set `NODE_ENV=production`
  - [ ] Review and tighten CORS settings
  - [ ] Add request size limits
  - [ ] Set up rate limiting (currently 5/day - adjust if needed)
  - [ ] Add API key rotation plan

- [ ] **Database Setup**
  - [ ] Test database initialization
  - [ ] Set up database backups
  - [ ] Plan for database migration if needed
  - [ ] Test quota reset logic

- [ ] **Error Handling**
  - [ ] Test all error scenarios
  - [ ] Ensure error messages don't leak sensitive info
  - [ ] Add error reporting/monitoring (Sentry, etc.)
  - [ ] Test rate limit error responses

### Extension
- [ ] **Chrome Web Store Requirements**
  - [ ] Create proper extension icons (not placeholders)
  - [ ] Write privacy policy (required for Web Store)
  - [ ] Write terms of service
  - [ ] Create store listing description
  - [ ] Create screenshots/demo video
  - [ ] Set up Chrome Web Store developer account ($5 one-time fee)

- [ ] **Extension Configuration**
  - [ ] Update default backend URL to production
  - [ ] Test extension with production backend
  - [ ] Remove debug logging (or make it optional)
  - [ ] Test on multiple news sites (BBC, Guardian, NYT, etc.)

- [ ] **Testing**
  - [ ] Test quote matching on various articles
  - [ ] Test error handling (network failures, API errors)
  - [ ] Test quota system
  - [ ] Test caching (same article twice)
  - [ ] Test on different browsers (Chrome, Edge, Brave)

---

## 🟡 Important (Should Have)

### Backend
- [ ] **Monitoring & Logging**
  - [ ] Set up log aggregation (if needed)
  - [ ] Add health check monitoring
  - [ ] Set up alerts for errors
  - [ ] Monitor API costs/usage

- [ ] **Performance**
  - [ ] Load test backend
  - [ ] Optimize database queries
  - [ ] Consider Redis for distributed caching
  - [ ] Add request timeout handling

- [ ] **Documentation**
  - [ ] API documentation complete
  - [ ] Deployment guide
  - [ ] Troubleshooting guide
  - [ ] Admin guide (if needed)

### Extension
- [ ] **User Experience**
  - [ ] Improve error messages (user-friendly)
  - [ ] Add loading states
  - [ ] Add retry buttons for failed requests
  - [ ] Test tooltip positioning on different screen sizes
  - [ ] Add keyboard shortcuts (optional)

- [ ] **Polish**
  - [ ] Final UI/UX review
  - [ ] Test on different screen sizes
  - [ ] Check accessibility (keyboard navigation, screen readers)
  - [ ] Add analytics (optional, privacy-conscious)

---

## 🟢 Nice to Have (Can Add Later)

- [ ] **User Authentication**
  - [ ] Add user accounts
  - [ ] Email verification
  - [ ] Password reset

- [ ] **Payment Integration**
  - [ ] Stripe integration
  - [ ] Subscription plans
  - [ ] Payment webhooks

- [ ] **Advanced Features**
  - [ ] Quote position tracking (XPath/selectors)
  - [ ] Export highlights
  - [ ] Share counterpoints
  - [ ] Custom bias modes

- [ ] **Infrastructure**
  - [ ] Upgrade to PostgreSQL
  - [ ] Add Redis caching
  - [ ] Set up CDN (if needed)
  - [ ] Add load balancing

---

## 📋 Pre-Launch Testing Checklist

### Extension Testing
- [ ] Load extension in Chrome
- [ ] Configure backend URL
- [ ] Test on 5+ different news sites
- [ ] Verify quotes are highlighted correctly
- [ ] Test tooltips appear and work
- [ ] Test error handling (disconnect backend, invalid API key)
- [ ] Test quota system (make 5+ requests)
- [ ] Test caching (same article twice)

### Backend Testing
- [ ] Health check endpoint works
- [ ] Analyze endpoint works with valid request
- [ ] Rate limiting works (make 6th request)
- [ ] Caching works (same article = instant response)
- [ ] Error handling works (invalid API key, network error)
- [ ] Database persists data correctly
- [ ] Quota resets at midnight

### Integration Testing
- [ ] Extension → Backend → LLM → Extension flow works
- [ ] Error messages display correctly
- [ ] Quota updates in real-time
- [ ] Cached responses work

---

## 🔒 Security Checklist

- [ ] API keys stored securely (never in code)
- [ ] Environment variables set correctly
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (using parameterized queries)
- [ ] XSS protection (sanitize user input)
- [ ] HTTPS enabled (SSL certificate)
- [ ] Error messages don't leak sensitive info
- [ ] Logs don't contain API keys

---

## 📝 Legal/Compliance

- [ ] **Privacy Policy**
  - [ ] What data is collected
  - [ ] How data is used
  - [ ] Data retention policy
  - [ ] User rights (GDPR if EU users)

- [ ] **Terms of Service**
  - [ ] Usage terms
  - [ ] Liability disclaimers
  - [ ] API usage terms

- [ ] **Chrome Web Store**
  - [ ] Privacy policy URL
  - [ ] Single purpose description
  - [ ] Permissions justification

---

## 🎯 Launch Day Checklist

- [ ] Backend deployed and tested
- [ ] Extension tested with production backend
- [ ] All environment variables set
- [ ] Monitoring/alerts configured
- [ ] Documentation complete
- [ ] Privacy policy published
- [ ] Chrome Web Store listing ready
- [ ] Submit to Chrome Web Store
- [ ] Monitor for issues

---

## 🚨 Post-Launch Monitoring

- [ ] Monitor error rates
- [ ] Monitor API costs
- [ ] Monitor user feedback
- [ ] Monitor quota usage
- [ ] Check logs daily for first week
- [ ] Respond to user issues quickly

---

## 📊 Success Metrics

Track these after launch:
- Number of articles analyzed
- Cache hit rate
- Error rate
- Average response time
- User retention
- Most common errors

---

## ⚡ Quick Launch Path (MVP)

**Minimum viable launch:**
1. ✅ Deploy backend to Railway/Render
2. ✅ Add DeepSeek API key to production
3. ✅ Test backend endpoints
4. ✅ Update extension with production backend URL
5. ✅ Test extension end-to-end
6. ✅ Create privacy policy (simple)
7. ✅ Create Chrome Web Store listing
8. ✅ Submit to store

**Can add later:**
- User authentication
- Stripe payments
- Advanced monitoring
- Analytics dashboard

---

## 🎯 Recommended Order

1. **Week 1: Backend**
   - Deploy backend
   - Add API keys
   - Test thoroughly

2. **Week 2: Extension**
   - Test with production backend
   - Fix any issues
   - Create store assets

3. **Week 3: Legal/Store**
   - Write privacy policy
   - Create store listing
   - Submit to Chrome Web Store

4. **Week 4: Launch**
   - Monitor closely
   - Fix critical issues
   - Gather feedback

---

**Estimated time to launch: 2-3 weeks** (depending on how much polish you want)

