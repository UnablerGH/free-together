# FreeTogether Deployment Guide

## 🚀 Quick Deploy (Recommended)

### Frontend: Vercel
### Backend: Railway

---

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Firebase Project** - Already set up with authentication
3. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
4. **Railway Account** - Sign up at [railway.app](https://railway.app)

---

## 🔧 Step 1: Prepare Your Code

### Backend Environment Variables
Create a `.env` file in the `backend/` directory:

```env
FIREBASE_CRED_PATH=./serviceAccountKey.json
FIREBASE_PROJECT_ID=your-firebase-project-id
SECRET_KEY=your-super-secret-production-key
FLASK_ENV=production
PORT=5000
```

### Frontend Environment Variables
Create a `.env` file in the `frontend/` directory:

```env
# Firebase Configuration (from your Firebase console)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# API Configuration (will be updated after backend deployment)
VITE_API_URL=https://your-backend-url.railway.app/api/v1
```

---

## 🚂 Step 2: Deploy Backend to Railway

1. **Go to [Railway.app](https://railway.app)** and sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your FreeTogether repository
   - Select the `backend` folder as the root directory

3. **Configure Environment Variables**
   - Go to your project dashboard
   - Click on "Variables" tab
   - Add these variables:
     ```
     FIREBASE_PROJECT_ID=your-firebase-project-id
     SECRET_KEY=your-super-secret-production-key
     FLASK_ENV=production
     PORT=5000
     ```

4. **Upload Firebase Service Account**
   - In Railway dashboard, go to "Settings"
   - Upload your `serviceAccountKey.json` file
   - Set `FIREBASE_CRED_PATH=./serviceAccountKey.json`

5. **Deploy**
   - Railway will automatically detect it's a Python app
   - It will install dependencies from `requirements.txt`
   - Your backend will be available at: `https://your-app-name.railway.app`

---

## ⚡ Step 3: Deploy Frontend to Vercel

1. **Go to [Vercel.com](https://vercel.com)** and sign in with GitHub

2. **Import Project**
   - Click "New Project"
   - Import your FreeTogether repository
   - Set the root directory to `frontend`

3. **Configure Build Settings**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Add Environment Variables**
   - In project settings, go to "Environment Variables"
   - Add all the `VITE_` variables from your `.env` file
   - **Important**: Update `VITE_API_URL` with your Railway backend URL

5. **Deploy**
   - Click "Deploy"
   - Your frontend will be available at: `https://your-app-name.vercel.app`

---

## 🔄 Step 4: Update CORS Settings

After both deployments, update your backend CORS settings:

1. **Edit `backend/app/config.py`**:
   ```python
   CORS_ORIGINS = [
       'http://localhost:3000',  # Development
       'https://your-actual-vercel-url.vercel.app',  # Your production URL
   ]
   ```

2. **Redeploy Backend**
   - Push changes to GitHub
   - Railway will automatically redeploy

---

## 🔐 Step 5: Update Firebase Settings

1. **Firebase Console** → Authentication → Settings
2. **Add Authorized Domains**:
   - Add your Vercel domain: `your-app-name.vercel.app`

3. **Update Firebase Config** (if needed):
   - Ensure your frontend environment variables match your Firebase project

---

## ✅ Step 6: Test Your Deployment

1. **Visit your Vercel URL**
2. **Test user registration/login**
3. **Create a test event**
4. **Invite users and test functionality**

---

## 🛠️ Alternative Deployment Options

### Option 2: Netlify + Heroku
- **Frontend**: Deploy to Netlify (similar to Vercel)
- **Backend**: Deploy to Heroku (requires credit card for dynos)

### Option 3: AWS/Google Cloud
- **Frontend**: S3 + CloudFront or Firebase Hosting
- **Backend**: EC2, App Engine, or Cloud Run

### Option 4: Self-Hosted
- **VPS**: DigitalOcean, Linode, or Vultr
- **Docker**: Use Docker containers for both frontend and backend

---

## 🔧 Production Optimizations

### Backend Optimizations
1. **Add Gunicorn** for production WSGI server:
   ```bash
   pip install gunicorn
   ```
   
   Update `Procfile`:
   ```
   web: gunicorn app:app
   ```

2. **Environment-based Configuration**:
   ```python
   # In config.py
   import os
   
   class ProductionConfig(Config):
       DEBUG = False
       TESTING = False
   
   class DevelopmentConfig(Config):
       DEBUG = True
   ```

### Frontend Optimizations
1. **Build Optimization** - Already handled by Vite
2. **CDN** - Vercel provides global CDN automatically
3. **Caching** - Configure in `vercel.json` if needed

---

## 📊 Monitoring & Maintenance

### Backend Monitoring
- **Railway**: Built-in metrics and logs
- **Error Tracking**: Consider Sentry integration

### Frontend Monitoring
- **Vercel**: Built-in analytics and performance metrics
- **User Analytics**: Consider Google Analytics

### Database
- **Firebase**: Built-in monitoring in Firebase console

---

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure frontend URL is in backend CORS_ORIGINS
   - Check that API_URL is correct in frontend

2. **Firebase Auth Issues**
   - Verify authorized domains in Firebase console
   - Check environment variables match Firebase config

3. **API Connection Issues**
   - Verify VITE_API_URL is correct
   - Check Railway backend is running

4. **Build Failures**
   - Check all environment variables are set
   - Verify dependencies in package.json/requirements.txt

### Debug Commands

**Check Railway Logs**:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and view logs
railway login
railway logs
```

**Check Vercel Logs**:
- Go to Vercel dashboard → Project → Functions tab

---

## 💰 Cost Estimates

### Free Tier Limits
- **Vercel**: 100GB bandwidth, unlimited static sites
- **Railway**: $5/month after trial, includes 500 hours
- **Firebase**: Generous free tier for auth and small databases

### Scaling Costs
- **Railway**: ~$5-20/month for small to medium apps
- **Vercel**: Free for most use cases, Pro at $20/month for teams
- **Firebase**: Pay-as-you-go for database operations

---

## 🔄 CI/CD Setup

### Automatic Deployments
Both Vercel and Railway support automatic deployments:

1. **Push to main branch** → Automatic production deployment
2. **Push to develop branch** → Preview deployment (Vercel)
3. **Pull requests** → Preview deployments

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml` for custom CI/CD pipeline.

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Railway/Vercel documentation
3. Check Firebase console for auth issues
4. Verify all environment variables are correctly set

---

**🎉 Congratulations! Your FreeTogether app is now live in production!** 