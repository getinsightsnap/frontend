# InsightSnap Deployment Guide

This guide covers deploying both the frontend and backend of InsightSnap.

## Architecture Overview

```
Frontend (Netlify) → Backend (Railway/Heroku) → External APIs
                   ↓
                Supabase (Database)
```

## Prerequisites

- GitHub repository with your code
- Netlify account (for frontend)
- Railway/Heroku account (for backend)
- Supabase account (for database)
- X API Bearer Token
- Perplexity AI API Key

## Step 1: Backend Deployment

### Option A: Railway (Recommended)

1. **Go to [Railway.app](https://railway.app) and sign up**
2. **Connect your GitHub repository**
3. **Create new project from GitHub repo**
4. **Select the `backend` folder as root directory**
5. **Set environment variables:**
   ```
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://insightsnap.co
   X_BEARER_TOKEN=your_x_bearer_token
   PERPLEXITY_API_KEY=your_perplexity_api_key
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   LOG_LEVEL=info
   ```
6. **Deploy** - Railway will automatically build and deploy

### Option B: Heroku

1. **Install Heroku CLI**
2. **Login to Heroku:**
   ```bash
   heroku login
   ```
3. **Create Heroku app:**
   ```bash
   heroku create insightsnap-backend
   ```
4. **Set buildpack:**
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```
5. **Set environment variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set FRONTEND_URL=https://insightsnap.co
   heroku config:set X_BEARER_TOKEN=your_x_bearer_token
   heroku config:set PERPLEXITY_API_KEY=your_perplexity_api_key
   ```
6. **Deploy:**
   ```bash
   git subtree push --prefix=backend heroku main
   ```

### Option C: DigitalOcean App Platform

1. **Go to DigitalOcean App Platform**
2. **Create new app from GitHub**
3. **Select backend folder as source**
4. **Configure environment variables**
5. **Deploy**

## Step 2: Frontend Deployment (Netlify)

1. **Go to [Netlify](https://netlify.com) and sign up**
2. **Connect your GitHub repository**
3. **Set build settings:**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Base directory:** (leave empty)
4. **Set environment variables:**
   ```
   VITE_BACKEND_URL=https://your-backend-url.railway.app/api
   VITE_META_PIXEL_ID=your_meta_pixel_id
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
5. **Deploy**

## Step 3: Domain Configuration

### Custom Domain Setup

1. **In Netlify:**
   - Go to Site Settings → Domain Management
   - Add custom domain: `insightsnap.co`
   - Configure DNS records as instructed

2. **In Railway/Heroku:**
   - Add custom domain if needed
   - Update CORS settings to include your domain

### Environment Variables for Production

**Frontend (.env in Netlify):**
```env
VITE_BACKEND_URL=https://your-backend-url.railway.app/api
VITE_META_PIXEL_ID=782862880877552
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend (Railway/Heroku):**
```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://insightsnap.co
X_BEARER_TOKEN=your_x_bearer_token
PERPLEXITY_API_KEY=your_perplexity_api_key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

## Step 4: Testing Deployment

### Backend Health Check

```bash
curl https://your-backend-url.railway.app/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

### Frontend Test

1. **Visit your domain:** `https://insightsnap.co`
2. **Open browser console**
3. **Check for any CORS errors**
4. **Test a search to verify backend connection**

### API Test

```bash
curl -X POST https://your-backend-url.railway.app/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "test",
    "platforms": ["reddit"],
    "language": "en",
    "timeFilter": "week"
  }'
```

## Step 5: Monitoring and Maintenance

### Health Monitoring

- **Backend Health:** `GET /health`
- **Service Health:** `GET /api/{service}/health`
- **Search Stats:** `GET /api/search/stats`

### Logs

- **Railway:** View logs in dashboard
- **Heroku:** `heroku logs --tail`
- **DigitalOcean:** View in app dashboard

### Performance Monitoring

- Monitor response times
- Check error rates
- Monitor API quota usage
- Set up alerts for failures

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `FRONTEND_URL` in backend environment
   - Verify frontend URL matches exactly

2. **API Key Errors**
   - Verify X API Bearer Token is correct
   - Check Perplexity API Key is valid
   - Monitor API quota usage

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

4. **Database Connection Issues**
   - Verify Supabase credentials
   - Check database connection limits
   - Monitor database performance

### Debug Mode

For debugging, temporarily set:
```env
NODE_ENV=development
LOG_LEVEL=debug
```

## Scaling Considerations

### Backend Scaling

- **Railway:** Automatic scaling based on usage
- **Heroku:** Use Hobby/Standard dynos for production
- **DigitalOcean:** Scale based on CPU/memory usage

### Database Scaling

- **Supabase:** Upgrade plan for higher limits
- **Monitor:** Connection counts and query performance

### CDN and Caching

- **Netlify:** Built-in CDN
- **Backend:** Implement Redis for caching (future enhancement)

## Security Checklist

- [ ] API keys are stored in environment variables
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced
- [ ] Database credentials are secure
- [ ] Logs don't contain sensitive information

## Backup Strategy

- **Code:** GitHub repository
- **Database:** Supabase automatic backups
- **Environment:** Document all environment variables
- **Logs:** Export important logs regularly

## Cost Optimization

### Railway
- Free tier: 500 hours/month
- Pro: $5/month for unlimited

### Heroku
- Eco: $5/month per dyno
- Basic: $7/month per dyno

### Netlify
- Free tier: 100GB bandwidth
- Pro: $19/month for more features

### Supabase
- Free tier: 500MB database
- Pro: $25/month for more storage

## Support and Maintenance

- Monitor error rates daily
- Check API quotas weekly
- Update dependencies monthly
- Review security quarterly
- Backup data regularly

---

## Quick Start Commands

### Local Development

```bash
# Backend
cd backend
npm install
cp env.example .env
# Edit .env with your keys
npm run dev

# Frontend (in another terminal)
npm install
cp frontend-env.example .env
# Edit .env with your backend URL
npm run dev
```

### Production Deployment

```bash
# Deploy backend to Railway
# (Use Railway dashboard or CLI)

# Deploy frontend to Netlify
# (Use Netlify dashboard or CLI)
```

This completes your deployment setup! Your InsightSnap application should now be live and accessible at your custom domain.
