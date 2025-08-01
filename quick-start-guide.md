# 🚂 Railway Deployment Guide for Family GnuCash

## Quick Start (5 minutes)

### 1. Prerequisites
- GitHub account with your Family GnuCash repo
- Railway account (free at [railway.app](https://railway.app))
- Railway CLI installed: `npm install -g @railway/cli`

### 2. One-Click Deploy from GitHub

#### Option A: Deploy via Railway Dashboard (Easiest)
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your Family GnuCash repository
5. Railway will automatically detect it's a Next.js app
6. Add MySQL: Click "New" → "Database" → "MySQL"
7. Set environment variables (see below)
8. Click "Deploy"

#### Option B: Deploy via CLI
```bash
# Login to Railway
railway login

# Clone your repo and navigate to it
git clone https://github.com/yourusername/family-gnucash
cd family-gnucash

# Run the deployment script
chmod +x deploy-to-railway.sh
./deploy-to-railway.sh
```

### 3. Required Environment Variables

In Railway dashboard, go to your service → Variables, and add:

```env
# Database URL (Railway provides this automatically when you add MySQL)
DATABASE_URL=${{MYSQL_URL}}

# NextAuth (REQUIRED - Generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=https://${{RAILWAY_STATIC_URL}}

# App Settings
APP_NAME=Family GnuCash
DEFAULT_CURRENCY=USD
NODE_ENV=production
```

### 4. Post-Deployment Setup

After deployment completes:

```bash
# Seed the database with demo data
railway run npm run db:seed

# View your app URL
railway domain

# Monitor logs
railway logs
```

## 🔧 Manual Deployment Steps

If the automated script doesn't work:

### Step 1: Create Railway Project
```bash
railway init --name family-gnucash
```

### Step 2: Add MySQL Database
```bash
railway add --plugin mysql
```

### Step 3: Set Environment Variables
```bash
# Generate secure secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Set variables
railway variables set NODE_ENV=production
railway variables set NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
railway variables set NEXTAUTH_URL="https://\${{RAILWAY_STATIC_URL}}"
railway variables set APP_NAME="Family GnuCash"
railway variables set DEFAULT_CURRENCY="USD"
```

### Step 4: Update package.json
Ensure your package.json has these scripts:
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

### Step 5: Deploy
```bash
railway up
```

### Step 6: Initialize Database
```bash
# Push schema
railway run npx prisma db push

# Seed database
railway run npm run db:seed
```

### Step 7: Add Custom Domain (Optional)
```bash
# Generate a Railway domain
railway domain

# Or add your own domain in the dashboard
```

## 🔍 Troubleshooting

### Common Issues

1. **Build Fails**
   ```bash
   # Check logs
   railway logs
   
   # Ensure all dependencies are in package.json
   npm install --save [missing-package]
   ```

2. **Database Connection Error**
   - Ensure DATABASE_URL is set correctly
   - Format: `mysql://user:password@host:port/database`
   - Railway provides this automatically as MYSQL_URL

3. **Prisma Schema Issues**
   ```bash
   # Regenerate Prisma client
   railway run npx prisma generate
   
   # Force push schema
   railway run npx prisma db push --force-reset
   ```

4. **NextAuth Error**
   - Ensure NEXTAUTH_SECRET is set
   - NEXTAUTH_URL must match your Railway URL

### Useful Commands

```bash
# View all environment variables
railway variables

# Connect to database
railway run npx prisma studio

# Run any command in production environment
railway run [command]

# SSH into container (if needed)
railway shell
```

## 📊 Production Checklist

- [ ] Change default passwords immediately after first login
- [ ] Set up Google Drive backup (optional)
- [ ] Configure custom domain
- [ ] Enable HTTPS (automatic with Railway)
- [ ] Set up monitoring/alerts
- [ ] Create production users
- [ ] Remove demo data if needed

## 🎉 Success!

Your app should now be live at the Railway-provided URL. Default credentials:
- **Admin**: admin / admin123
- **User**: spouse / spouse123  
- **Read-only**: teen / teen123

**Remember to change these immediately!**

## 💡 Tips

1. **Free Tier**: Railway's free tier includes 500 hours/month and $5 credit
2. **Scaling**: Easily scale via dashboard or CLI
3. **Backups**: Enable automatic MySQL backups in Railway dashboard
4. **Monitoring**: Use Railway's built-in metrics and logs
5. **CI/CD**: Pushes to main branch auto-deploy

## 📚 Resources

- [Railway Docs](https://docs.railway.app)
- [Next.js on Railway](https://docs.railway.app/guides/nextjs)
- [Prisma with Railway](https://docs.railway.app/guides/prisma)
- [Railway CLI Reference](https://docs.railway.app/develop/cli)

## Need Help?

1. Check Railway dashboard for deployment logs
2. Join [Railway Discord](https://discord.gg/railway)
3. Check your repo issues
4. Ensure all files from this guide are properly added