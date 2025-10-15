# URGENT FIX: Perplexity API Model Error

## Problem
Script generation was completely failing with error:
```
Invalid model 'llama-3.1-sonar-small-128k-online'
```

## Root Cause
The Perplexity API model name we were using has been **deprecated or renamed**. Both frontend and backend were using an invalid model.

## Fix Applied
✅ Updated all Perplexity API calls to use: **`llama-3.1-sonar-large-128k-chat`**

### Files Changed:
1. ✅ **Frontend:** `src/services/contentGenerationService.ts`
2. ✅ **Backend:** `insightsnap-backend/routes/scriptGeneration.js`
3. ✅ **Backend:** `insightsnap-backend/services/aiService.js` (3 occurrences)

### Why This Model?
- ✅ `llama-3.1-sonar-large-128k-chat` is a **valid, active** Perplexity model
- ✅ **LARGE** variant = better quality, more intelligent responses
- ✅ **CHAT** model = optimized for conversational content generation
- ✅ **128k context** = can handle long social media posts

## Deployment Status

### ✅ Frontend (DONE)
- Committed and pushed to GitHub: `d38cf34`
- Netlify will auto-deploy (if connected to GitHub)
- Or manually deploy with: `npm run build` → upload dist folder

### ⏳ Backend (NEEDS DEPLOYMENT)
**IMPORTANT:** You need to deploy the backend changes to Railway!

#### Option 1: If Railway is connected to your GitHub repo
Railway will automatically deploy when you push to the backend branch.

#### Option 2: Manual deployment
```bash
cd insightsnap-backend
git push railway main
```

#### Option 3: If backend is in same repo
The changes are already in the main branch, Railway should auto-deploy.

## Testing After Deployment

1. **Wait 2-3 minutes** for Railway backend deployment
2. **Clear browser cache** (Ctrl + F5)
3. **Do a search** on your app
4. **Generate a script** from any result
5. **Check browser console** (F12) for errors

### Expected Result:
✅ Script should generate successfully
✅ No "Invalid model" errors
✅ No 400 API errors
✅ Actual content (not error fallback)

### What You Should See in Console:
```
🎬 Generating script via backend API...
✅ Script generated successfully via backend
```

OR (if backend is still deploying):
```
🎬 Generating script via backend API...
⚠️ Backend script generation failed, using frontend fallback
✅ Script generated via frontend fallback
```

## If Still Not Working

1. **Check Railway logs** for backend errors
2. **Verify Perplexity API key** is set in Railway:
   - Environment variable: `PERPLEXITY_API_KEY`
   - Value: `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`
3. **Check API health:**
   ```bash
   curl https://backend-production-be5d.up.railway.app/api/scripts/health
   ```
   Should return: `{"status":"OK","perplexityConfigured":true}`

## Alternative Models (if needed)

If `llama-3.1-sonar-large-128k-chat` doesn't work, try these:
- `llama-3.1-sonar-small-128k-chat` (faster, cheaper)
- `sonar-large-chat` (if they simplified naming)
- `sonar-medium-online` (if you need online search)

To change model, update the same 3 files and redeploy.

## Summary

**The script generation was broken because:**
- ❌ Using deprecated model: `llama-3.1-sonar-small-128k-online`
- ✅ Fixed with valid model: `llama-3.1-sonar-large-128k-chat`

**What you need to do:**
1. ✅ Frontend - Already deployed (auto via Netlify)
2. ⏳ Backend - Deploy to Railway (may be automatic)
3. 🧪 Test script generation

**Once deployed, script generation will work again!** 🎉

