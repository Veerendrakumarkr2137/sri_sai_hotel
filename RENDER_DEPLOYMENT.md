# Render Backend Deployment Guide

## Your Backend Structure:
```
server.ts (main backend file)
server/
  ├── controllers/ (authController, bookingController, etc.)
  ├── middleware/ (authMiddleware)
  ├── models/ (User, Room, Booking)
  └── routes/ (authRoutes, bookingRoutes, etc.)
```

## Step-by-Step Deployment:

### 1. Create Render Account & Connect GitHub
- Go to https://render.com
- Sign up with GitHub
- Click "New +" → "Web Service"
- Select your GitHub repo (sri_sai_hotel)
- Connect repository

### 2. Configure Render Service
When creating the web service, fill in:

**Basic Settings:**
- Name: `sri-sai-hotel-backend`
- Environment: `Node`
- Region: `Singapore` (or closest to you)
- Branch: `main`

**Build & Start Commands:**
- Build Command: `npm install`
- Start Command: `npm start`

**Plan:** Free tier (sufficient for testing)

### 3. Add Environment Variables in Render Dashboard
After creating the service, go to **Settings** → **Environment** and add:

```
MONGODB_URI=mongodb+srv://veerendra2137_db_user:Veerendra%40DB1@hotel.vbn2mj8.mongodb.net/?appName=hotel
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
NODE_ENV=production
JWT_SECRET=your-secret-key-here
EMAIL_USER=tagmail469@gmail.com
EMAIL_PASS=tcpasdyqkmjpmneb
```

### 4. Get Your Render Backend URL
After deployment, Render will give you a URL like:
```
https://sri-sai-hotel-backend.onrender.com
```

### 5. Update Frontend API Configuration
Update `src/lib/api.ts` with your actual Render URL:

```typescript
// In production, use your actual Render backend URL
return "https://sri-sai-hotel-backend.onrender.com";
```

### 6. Deploy Frontend Changes
Push to GitHub:
```bash
git add -A
git commit -m "Update backend API URL for Render deployment"
git push
```

Vercel will auto-deploy the frontend.

## Testing:
1. Wait for Render deployment to complete (first deploy takes 2-3 minutes)
2. Visit your Vercel frontend: https://sri-sai-hotel.vercel.app/login
3. Try to login
4. Check Render logs if any issues

## Troubleshooting:
- **MongoDB connection error:** Verify MONGODB_URI in Render env vars
- **404 Not Found:** Backend URL in api.ts might be wrong
- **CORS error:** Check if frontend URL is whitelisted
- Check logs in Render dashboard for detailed errors

## Important Notes:
⚠️ Free tier on Render will spin down after 15 minutes of inactivity
✓ All your data persists in MongoDB Atlas (separate)
✓ Frontend stays on Vercel (always active)
