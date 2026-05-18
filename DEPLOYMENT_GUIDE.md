# Complete Deployment Guide: Render + Vercel + Neon

This guide will deploy your Finance Tracker application to free cloud services:
- **Backend**: Render (https://render.com) - Free tier
- **Frontend**: Vercel (https://vercel.com) - Free tier  
- **Database**: Neon (https://neon.tech) - Free tier

---

## Step 1: Set Up PostgreSQL Database on Neon

### 1.1 Create Neon Account
1. Visit https://neon.tech
2. Click "Sign Up" → Sign up with GitHub (recommended)
3. Authorize Neon access to your GitHub account
4. Verify your email

### 1.2 Create Database
1. After login, click "Create project"
2. Enter project name: `finance-tracker`
3. Select region closest to you (e.g., us-east-1)
4. Click "Create project"
5. Wait for project to be created (takes 1-2 minutes)

### 1.3 Get Connection String
1. You'll see a connection string like:
   ```
   postgresql://user:password@host/database
   ```
2. **Copy this entire string** - you'll need it for backend deployment
3. Save it securely (you'll use it in Steps 2 & 3)

### 1.4 Test Connection (Optional)
Connection string format:
```
postgresql://neon_user:your_password@ep-xyz.us-east-1.neon.tech/neon_db
```

---

## Step 2: Deploy Backend on Render

### 2.1 Prerequisites
- GitHub account (where your code is pushed)
- Docker images (already created)
- Neon database connection string from Step 1

### 2.2 Create Render Account
1. Visit https://render.com
2. Click "Get Started" 
3. Choose "Sign up with GitHub"
4. Authorize Render to access your GitHub repositories
5. Verify email

### 2.3 Connect GitHub Repository
1. After login, go to Dashboard
2. Click "New +" → "Web Service"
3. Select "Deploy an existing repository"
4. Find and select `Personal-finance-tracker`
5. Click "Connect"

### 2.4 Configure Web Service
Fill in the settings as follows:

| Field | Value |
|-------|-------|
| **Name** | `finance-tracker-backend` |
| **Runtime** | `Docker` |
| **Region** | Select closest region |
| **Branch** | `master` |
| **Build Command** | (leave empty - Docker handles it) |
| **Start Command** | (leave empty - Docker handles it) |

### 2.5 Add Environment Variables
1. Scroll down to "Environment" section
2. Click "Add Environment Variable"
3. Add these variables:

```
SPRING_DATASOURCE_URL=postgresql://user:password@host/database
SPRING_DATASOURCE_USERNAME=username
SPRING_DATASOURCE_PASSWORD=password
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SERVER_PORT=10000
```

**Replace the database values** with your Neon connection string:
- Extract from: `postgresql://username:password@host/dbname`
- Extract these parts:
  - `username` → from connection string
  - `password` → from connection string  
  - `host` → from connection string (e.g., `ep-xyz.us-east-1.neon.tech`)
  - `dbname` → from connection string

### 2.6 Choose Backend Dockerfile Location
1. In Render dashboard, you need to specify the Dockerfile location
2. Set `Dockerfile Path` to: `./backend/Dockerfile`
3. Click "Create Web Service"

### 2.7 Wait for Deployment
- Render will build and deploy automatically
- Takes 5-10 minutes first time
- You'll get a URL like: `https://finance-tracker-backend.onrender.com`
- **Save this URL** - you'll need it for frontend

### 2.8 Test Backend
```
curl https://finance-tracker-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo123"}'
```

Should return a 200 status with JWT token.

---

## Step 3: Deploy Frontend on Vercel

### 3.1 Create Vercel Account
1. Visit https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel access
5. Verify email

### 3.2 Import Project
1. After login, click "Add New..." → "Project"
2. Click "Import Git Repository"
3. Select `Personal-finance-tracker`
4. Click "Import"

### 3.3 Configure Build Settings
1. Set **Framework Preset** to: `Create React App`
2. Set **Root Directory** to: `./frontend/finance-tracker`
3. **Build Command**: `npm run build`
4. **Output Directory**: `build`
5. **Install Command**: `npm ci`

### 3.4 Add Environment Variables
1. Scroll to "Environment Variables"
2. Click "Add"
3. Add this variable:

```
REACT_APP_API_BASE_URL=https://finance-tracker-backend.onrender.com
```

Replace with your actual Render backend URL from Step 2.7

### 3.5 Deploy
1. Click "Deploy"
2. Wait for deployment (takes 2-5 minutes)
3. You'll get a URL like: `https://personal-finance-tracker.vercel.app`

### 3.6 Test Frontend
1. Open your Vercel URL in browser
2. Should see login page
3. Try login with:
   - Username: `demo`
   - Password: `demo123`

---

## Step 4: Test End-to-End

### 4.1 Test Login Flow
1. Go to Vercel frontend URL
2. Click "Demo Credentials" button or enter:
   - Username: `demo`
   - Password: `demo123`
3. Should log in successfully
4. Should redirect to dashboard
5. All API calls should work

### 4.2 Test Database Connectivity
1. Check backend logs in Render:
   - Go to Render dashboard
   - Click your backend service
   - Open "Logs" tab
   - Should show successful database connections
   - Should NOT show "connection refused" errors

### 4.3 Test API Endpoints
From frontend or terminal:
```bash
# Login
curl https://finance-tracker-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo123"}'

# Get transactions (requires JWT token from login response)
curl https://finance-tracker-backend.onrender.com/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Troubleshooting

### Backend won't start on Render
**Symptom**: "Application run failed" in logs

**Solutions**:
1. Check environment variables are set correctly
2. Verify database connection string format
3. Check Render logs for detailed error
4. Ensure PostgreSQL is ready (may take 30 seconds)

### Frontend can't connect to backend
**Symptom**: Network errors, 401/403 responses

**Solutions**:
1. Verify `REACT_APP_API_BASE_URL` in Vercel matches Render backend URL
2. Check CORS is enabled in backend
3. Build frontend after changing env variables
4. Clear browser cache (Ctrl+Shift+Delete)

### Database connection timeout
**Symptom**: "Connection timed out" or "Connection refused"

**Solutions**:
1. Verify connection string is correct
2. Check Neon project is active (not paused)
3. Verify username/password in connection string
4. Check database exists and you have access

### Cold start delays
**Symptom**: First request takes 30+ seconds

**This is normal!** Free tier services pause when not used.

**Solutions**:
1. Use a monitoring service to ping backend every 5 minutes
2. Wait for backend to wake up on first request
3. Upgrade to paid tier if this is production

---

## Quick Reference: URLs & Credentials

After deployment, save this:

```
Frontend URL: https://personal-finance-tracker.vercel.app
Backend URL: https://finance-tracker-backend.onrender.com
Database: Neon connection string

Demo Login:
- Username: demo
- Password: demo123
```

---

## Keeping Services Running (Free Tier)

Free tier services automatically pause after inactivity. To keep them running:

### Option 1: Use Uptime Monitor
1. Visit https://uptimerobot.com (free)
2. Create free account
3. Add monitoring URL: `https://finance-tracker-backend.onrender.com/api/transactions`
4. Set check interval: every 5 minutes
5. This sends periodic pings to keep backend awake

### Option 2: Upgrade to Paid
- Render: ~$7/month for always-on instance
- Vercel: Free tier already handles traffic spikes
- Neon: Free tier is sufficient for small projects

---

## Next Steps

1. ✅ Create Neon database account (Step 1)
2. ✅ Deploy backend to Render (Step 2)
3. ✅ Deploy frontend to Vercel (Step 3)
4. ✅ Test everything works (Step 4)
5. Optional: Set up uptime monitoring
6. Optional: Add custom domain names

---

## Support & Docs

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/doc
- **GitHub Integration Help**: Check each platform's documentation

---

## Security Notes

1. **Never commit .env files** to GitHub
2. Use platform-provided environment variables
3. Neon provides secure connection strings
4. Keep your Neon password secure
5. Regularly rotate credentials in production

