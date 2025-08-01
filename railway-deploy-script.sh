#!/bin/bash

# Family GnuCash - Railway Deployment Script
# This script helps you deploy your app to Railway

echo "🚂 Family GnuCash - Railway Deployment Helper"
echo "==========================================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found!"
    echo ""
    echo "Please install Railway CLI first:"
    echo "npm install -g @railway/cli"
    echo ""
    echo "Or visit: https://docs.railway.app/develop/cli"
    exit 1
fi

# Check if user is logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway!"
    echo ""
    echo "Please login first:"
    echo "railway login"
    exit 1
fi

echo "✅ Railway CLI installed and authenticated"
echo ""

# Step 1: Initialize Railway project
echo "Step 1: Initialize Railway project"
echo "----------------------------------"
echo "Do you want to create a new Railway project? (y/n)"
read -r create_new

if [ "$create_new" = "y" ]; then
    echo "Enter a name for your Railway project (or press Enter for default):"
    read -r project_name
    
    if [ -z "$project_name" ]; then
        railway init
    else
        railway init --name "$project_name"
    fi
else
    echo "Linking to existing Railway project..."
    railway link
fi

echo ""
echo "Step 2: Add MySQL Database"
echo "--------------------------"
echo "Adding MySQL plugin to your Railway project..."

railway add --plugin mysql

echo "✅ MySQL database added"
echo ""

echo "Step 3: Set Environment Variables"
echo "---------------------------------"
echo "Setting up environment variables..."

# Generate a secure NEXTAUTH_SECRET
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Set environment variables
railway variables set NODE_ENV=production
railway variables set NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
railway variables set APP_NAME="Family GnuCash"
railway variables set DEFAULT_CURRENCY="USD"

echo ""
echo "Generated NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
echo "(Save this for your records)"
echo ""

echo "Step 4: Update package.json scripts"
echo "-----------------------------------"
echo "Checking package.json..."

# Check if required scripts exist
if ! grep -q '"db:seed"' package.json; then
    echo "Adding db:seed script to package.json..."
    # This is a bit hacky but works for adding the script
    sed -i.bak '/"scripts": {/a\
    "db:seed": "tsx prisma/seed.ts",
' package.json
fi

echo "✅ package.json is ready"
echo ""

echo "Step 5: Deploy to Railway"
echo "------------------------"
echo "Ready to deploy! This will:"
echo "1. Build your Next.js application"
echo "2. Run Prisma migrations"
echo "3. Seed the database with demo data"
echo "4. Start your application"
echo ""
echo "Deploy now? (y/n)"
read -r deploy_now

if [ "$deploy_now" = "y" ]; then
    echo "Deploying to Railway..."
    railway up
    
    echo ""
    echo "🎉 Deployment initiated!"
    echo ""
    echo "Step 6: Post-deployment setup"
    echo "-----------------------------"
    echo "1. Wait for deployment to complete (check Railway dashboard)"
    echo "2. Run database seed manually if needed:"
    echo "   railway run npm run db:seed"
    echo ""
    echo "3. Get your app URL:"
    railway domain
else
    echo ""
    echo "Deployment skipped. When ready, run:"
    echo "railway up"
fi

echo ""
echo "📝 Important Notes:"
echo "-------------------"
echo "1. Save your NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
echo "2. Default admin login: admin / admin123"
echo "3. Monitor logs: railway logs"
echo "4. Open app: railway open"
echo ""
echo "Need help? Visit https://docs.railway.app"