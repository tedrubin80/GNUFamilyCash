#!/bin/bash

# Build debugging script for Railway deployment issues

echo "🔍 Family GnuCash Build Debugger"
echo "================================"
echo ""

# Check Node version
echo "1. Node.js version:"
node --version
echo ""

# Check npm version
echo "2. NPM version:"
npm --version
echo ""

# Check if package.json exists
echo "3. Checking package.json:"
if [ -f "package.json" ]; then
    echo "✅ package.json found"
else
    echo "❌ package.json missing!"
    exit 1
fi
echo ""

# Check if node_modules exists
echo "4. Checking node_modules:"
if [ -d "node_modules" ]; then
    echo "✅ node_modules exists"
    echo "   Total packages: $(ls node_modules | wc -l)"
else
    echo "⚠️  node_modules missing - running npm install..."
    npm ci --legacy-peer-deps
fi
echo ""

# Check Prisma
echo "5. Checking Prisma:"
if [ -f "prisma/schema.prisma" ]; then
    echo "✅ Prisma schema found"
    echo "   Generating Prisma client..."
    npx prisma generate
else
    echo "❌ Prisma schema missing!"
fi
echo ""

# Check environment variables
echo "6. Checking environment variables:"
required_vars=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXTAUTH_URL")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ $var is not set"
    else
        echo "✅ $var is set"
    fi
done
echo ""

# Check TypeScript files
echo "7. Checking for TypeScript errors:"
if command -v tsc &> /dev/null; then
    echo "Running TypeScript check..."
    npx tsc --noEmit || echo "⚠️  TypeScript errors found (will be ignored during build)"
else
    echo "⚠️  TypeScript not found"
fi
echo ""

# Try building
echo "8. Attempting build:"
echo "---------------------"
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
else
    echo ""
    echo "❌ Build failed!"
    echo ""
    echo "Common fixes:"
    echo "1. Ensure all dependencies are installed: npm ci --legacy-peer-deps"
    echo "2. Clear cache: rm -rf .next node_modules"
    echo "3. Check for missing imports in your code"
    echo "4. Verify all environment variables are set"
fi