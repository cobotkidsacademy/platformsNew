# Railway Deployment Guide

## Setting Up Environment Variables in Railway

The error you're seeing indicates that Railway is not loading your Supabase environment variables. Here's how to fix it:

### Step 1: Access Railway Dashboard

1. Go to [Railway Dashboard](https://railway.app)
2. Select your project
3. Click on your **backend service**

### Step 2: Add Environment Variables

1. Click on the **Variables** tab in your Railway service
2. Click **+ New Variable** for each required variable

### Step 3: Add Required Environment Variables

Add the following environment variables:

#### Required Variables:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=24h
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

#### How to Get Your Supabase Credentials:

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `SUPABASE_URL`
   - **service_role** key (under "Project API keys") → Use for `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ **Important**: Use the `service_role` key, NOT the `anon` key

### Step 4: Redeploy

After adding all environment variables:
1. Railway will automatically redeploy, OR
2. Go to **Deployments** tab and click **Redeploy**

### Step 5: Verify

Check the deployment logs. You should see:
```
✅ Supabase configuration loaded successfully
```

Instead of the error message.

---

## Alternative: Using Railway CLI

If you prefer using the Railway CLI:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link your project
railway link

# Set variables
railway variables set SUPABASE_URL=https://your-project.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
railway variables set JWT_SECRET=your-jwt-secret
railway variables set JWT_EXPIRES_IN=24h
railway variables set PORT=3001
railway variables set NODE_ENV=production
railway variables set FRONTEND_URL=https://your-frontend-domain.com
```

---

## Railway Configuration Files (Optional)

If you want to configure Railway programmatically, you can create a `railway.json` file in your backend directory:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## Troubleshooting

### Issue: Variables not loading after setting them

**Solution:**
1. Make sure you're setting variables on the **correct service** (backend, not frontend)
2. Check that variable names match exactly (case-sensitive)
3. Ensure there are no extra spaces in the values
4. Redeploy the service after adding variables

### Issue: Still getting "Missing Supabase configuration"

**Solution:**
1. Verify variables are set:
   - Go to Variables tab
   - Check that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are listed
2. Check variable values:
   - Click on each variable to view its value
   - Ensure `SUPABASE_URL` starts with `https://`
   - Ensure `SUPABASE_SERVICE_ROLE_KEY` is the full service role key
3. Check deployment logs:
   - Look for the diagnostic output showing available env vars
   - If it shows `Available env vars starting with SUPABASE: []`, the variables aren't being loaded

### Issue: Service role key not working

**Solution:**
1. Make sure you're using the **service_role** key, not the **anon** key
2. The service_role key is longer and starts with `eyJ...`
3. It's found under "Project API keys" → "service_role" (not "anon public")

---

## Quick Checklist

- [ ] `SUPABASE_URL` is set and starts with `https://`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set (service_role key, not anon)
- [ ] `JWT_SECRET` is set (minimum 32 characters)
- [ ] `JWT_EXPIRES_IN` is set (e.g., "24h")
- [ ] `PORT` is set (Railway usually sets this automatically, but 3001 is safe)
- [ ] `NODE_ENV` is set to `production`
- [ ] `FRONTEND_URL` is set to your frontend domain
- [ ] Service has been redeployed after setting variables
- [ ] Deployment logs show "✅ Supabase configuration loaded successfully"

---

## Security Notes

⚠️ **Important Security Practices:**

1. **Never commit `.env` files** to version control
2. **Never share your service_role key** publicly
3. **Use Railway's Variables** instead of hardcoding secrets
4. **Rotate keys** if they're accidentally exposed
5. **Use different keys** for development and production

---

## Need Help?

If you're still having issues:

1. Check the enhanced error messages in the logs - they show exactly which variables are missing
2. Run the diagnostic tool locally: `npm run check:config` (in backend directory)
3. Verify your Supabase project is active and accessible
4. Check Railway's deployment logs for any other errors

