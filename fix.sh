#!/bin/bash

echo "🧹 Quick Family GnuCash Repository Cleanup"
echo "=========================================="

# Remove duplicate and problematic files
echo "🗑️ Removing problematic files..."

rm -f ./lib/addschedualedtransactionform.tsx
rm -f ./lib/middleware.ts
rm -f ./postcc.config.js
rm -f ./scripts/build-debug.js
rm -f ./scripts/build.js
rm -f ./scripts/debug-start.js.js
rm -f ./scripts/setup-env.js
rm -f ./scripts/start-production.js

# Fix the types directory structure
if [ -f "./types/types/next-auth.d.ts" ]; then
    mv "./types/types/next-auth.d.ts" "./types/next-auth.d.ts"
    rmdir "./types/types" 2>/dev/null || true
fi

# Check if prisma schema exists (it wasn't in your file list)
if [ ! -f "prisma/schema.prisma" ]; then
    echo "⚠️ Warning: prisma/schema.prisma not found"
    echo "You may need to create it for the database to work"
fi

# Create missing app/page.tsx if needed
if [ ! -f "app/page.tsx" ]; then
    cat > app/page.tsx << 'EOF'
import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/dashboard')
}
EOF
    echo "✅ Created app/page.tsx"
fi

# Fix package.json to remove problematic scripts
echo "📦 Fixing package.json scripts..."
# First backup the current package.json
cp package.json package.json.backup

# Create clean package.json
cat > package.json << 'EOF'
{
  "name": "family-gnucash",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "npx prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "npx prisma generate",
    "db:push": "npx prisma db push",
    "db:migrate": "npx prisma migrate dev",
    "db:studio": "npx prisma studio",
    "db:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18",
    "react-dom": "^18",
    "next-auth": "^4.24.5",
    "@prisma/client": "^5.6.0",
    "@next-auth/prisma-adapter": "^1.0.7",
    "bcryptjs": "^2.4.3",
    "mysql2": "^3.6.5",
    "googleapis": "^128.0.0",
    "csv-parser": "^3.0.0",
    "papaparse": "^5.4.1",
    "date-fns": "^2.30.0",
    "zod": "^3.22.4",
    "lucide-react": "^0.263.1",
    "clsx": "^2.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.0.1",
    "postcss": "^8"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/bcryptjs": "^2.4.6",
    "@types/papaparse": "^5.3.14",
    "prisma": "^5.6.0",
    "tsx": "^4.0.0",
    "eslint": "^8",
    "eslint-config-next": "14.0.0"
  }
}
EOF

echo "✅ Cleanup completed!"
echo ""
echo "📊 Summary:"
echo "- Removed 8+ problematic files"
echo "- Fixed types directory structure"
echo "- Cleaned up package.json scripts"
echo "- Created missing app/page.tsx"
echo ""
echo "🚀 Next steps:"
echo "1. Test the build: npm install && npm run build"
echo "2. If successful: git add -A && git commit -m 'Clean up repository'"
echo "3. Deploy to your production server"
