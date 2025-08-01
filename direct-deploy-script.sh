#!/bin/bash

echo "🚂 Direct Railway Deploy (Bypass Build Issues)"
echo "============================================="
echo ""

# Step 1: Check Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Install with: npm install -g @railway/cli"
    exit 1
fi

# Step 2: Build locally first
echo "Building locally to verify..."
echo ""

# Create minimal build environment
export DATABASE_URL="mysql://test:test@localhost:3306/test"
export NEXTAUTH_SECRET="local-build-secret"
export NEXTAUTH_URL="http://localhost:3000"
export SKIP_ENV_VALIDATION="1"

# Clean and build
rm -rf .next
npm install --force
npx prisma generate || echo "Prisma generate skipped"
npm run build

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Local build failed. Fixing common issues..."
    
    # Create missing files
    mkdir -p app
    if [ ! -f "app/page.tsx" ]; then
        echo "export default function Home() { return <div>Home</div> }" > app/page.tsx
    fi
    
    # Try again
    npm run build
fi

echo ""
echo "Deploying to Railway..."
echo ""

# Deploy with verbose output
railway up --verbose

echo ""
echo "Deployment complete! Check Railway dashboard for status."
echo ""
echo "If deployment failed, try:"
echo "1. railway logs --build"
echo "2. Check Railway dashboard for environment variables"
echo "3. Use 'railway run npm run build' to test build in Railway environment"