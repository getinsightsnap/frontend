# Rating System Fix Guide

## Problem
The rating feature is not working because the backend doesn't have Supabase credentials configured.

**Error:** `"Rating system not available - database not configured"`

## Solution

### Step 1: Get Your Supabase Service Role Key

1. Go to your Supabase project settings: 
   https://supabase.com/dashboard/project/gytwrtduuauffcrvnlza/settings/api

2. Under **Project API keys**, find the **service_role** key
   - ⚠️ **NOT the anon/public key** - you need the service_role key
   - This key has admin privileges - keep it secret!

3. Copy the service_role key

### Step 2: Add Environment Variables to Railway Backend

1. Go to your Railway dashboard: https://railway.app/dashboard

2. Navigate to your backend service (insightsnap-backend)

3. Go to **Variables** tab

4. Add these two environment variables:
   ```
   SUPABASE_URL=https://gytwrtduuauffcrvnlza.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

5. Railway will automatically redeploy your backend after adding the variables

### Step 3: Verify the Fix

After Railway finishes redeploying:

1. Wait 1-2 minutes for deployment to complete

2. Test the backend health:
   ```bash
   curl https://backend-production-be5d.up.railway.app/health
   ```

3. Try rating a search result - the stars should now work!

### Step 4: (Optional) Setup Local Backend Testing

If you want to test the backend locally, create a `.env` file in the `insightsnap-backend` folder:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://gytwrtduuauffcrvnlza.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Other API Keys (copy from your frontend .env)
PERPLEXITY_API_KEY=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
REDDIT_CLIENT_ID=XGD_W6VKI3wpyffexmUbfA
REDDIT_CLIENT_SECRET=kzyJRaSFaNs0DhGx8IQ3n90QU4iuIQ
X_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAADYm3wEAAAAAQGfL1kX9D8la8QXa%2BIK91C4V4Vc%3DTaNgFMn21cRBnlsuKGQLR3DsJxiu0TZKzxUTnHEDEUntC6k2wr

# CORS Configuration
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,https://insightsnap.netlify.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=300
```

## What Changed in the Code

I've updated the `RelevanceRating.tsx` component to:
- ✅ Show clearer error messages when ratings fail
- ✅ Display "Rating system temporarily unavailable" when backend is not configured
- ✅ Add console logging for debugging
- ✅ Better visual feedback for users

## Testing After Fix

1. Do a search on your app
2. Click on any star (1-5) for a search result
3. You should see:
   - "Submitting..." briefly
   - "✓ Rated" confirmation
   - The star color should change based on your rating

If you still see errors, check the browser console (F12) for detailed error messages.

## Need Help?

If you're having trouble finding the service_role key or setting it up on Railway, let me know!

