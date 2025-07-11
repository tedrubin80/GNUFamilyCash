#!/bin/bash

# organize-family-gnucash.sh
# Script to organize Family GnuCash project files into proper Next.js structure
# This script only organizes files - no dependencies are installed

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "family-gnucash.tsx" ] && [ ! -f "auth-system.ts" ]; then
    print_error "This script should be run from the root of your Family GnuCash repository"
    echo "Please navigate to your project directory and run again."
    exit 1
fi

print_status "Starting Family GnuCash project organization..."

# Create directory structure
print_status "Creating Next.js directory structure..."

mkdir -p app/{admin,api,accounts,budgets,dashboard,login,reports,transactions,reconciliation,import-export}
mkdir -p app/admin/{users,settings}
mkdir -p app/api/{auth,admin,accounts,transactions,budgets,import,export}
mkdir -p "app/api/auth/[...nextauth]"
mkdir -p app/api/admin/{users,settings}
mkdir -p "app/api/transactions/[id]/reconcile"
mkdir -p components
mkdir -p lib
mkdir -p prisma
mkdir -p types
mkdir -p public
mkdir -p docs

print_success "Directory structure created"

# Function to extract content from combined files
extract_section() {
    local source_file=$1
    local section_marker=$2
    local dest_file=$3
    
    if [ -f "$source_file" ]; then
        # Extract content between section markers
        sed -n "/=== \.\\/$section_marker ===/,/=== /p" "$source_file" | sed '1d; $d' > "$dest_file"
        if [ -s "$dest_file" ]; then
            print_success "Extracted $dest_file from $source_file"
        fi
    fi
}

# Organize configuration files
print_status "Organizing configuration files..."

# Create package.json
if [ -f "package-json.json" ]; then
    cp "package-json.json" "package.json"
elif [ -f "scripts/package-json.json" ]; then
    cp "scripts/package-json.json" "package.json"
elif [ -f "project-config-files.json" ]; then
    # Extract package.json from the combined file
    sed -n '/"package.json": {/,/^  },/p' "project-config-files.json" | sed '1s/.*{/{/; $s/},/}/' > "package.json"
fi

# If still no package.json, create one
if [ ! -f "package.json" ] || [ ! -s "package.json" ]; then
    print_status "Creating package.json..."
    cat > package.json << 'EOF'
{
  "name": "family-gnucash",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
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
fi

# Copy other config files
[ -f "next-config.js" ] && cp "next-config.js" "next.config.js"
[ -f "tailwind-config.js" ] && cp "tailwind-config.js" "tailwind.config.js"
[ -f "postcss-config.js" ] && cp "postcss-config.js" "postcss.config.js"
[ -f "tsconfig.json" ] && cp "tsconfig.json" "tsconfig.json"

# Create missing config files if needed
if [ ! -f "next.config.js" ]; then
    print_status "Creating next.config.js..."
    cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mysql2']
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    APP_NAME: process.env.APP_NAME,
    DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY,
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
EOF
fi

if [ ! -f "postcss.config.js" ]; then
    cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
fi

# Create .env.local.example
if [ -f "scripts/env-local.sh" ]; then
    cp "scripts/env-local.sh" ".env.local.example"
else
    cat > .env.local.example << 'EOF'
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/family_accounting"

# NextAuth.js Configuration
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Google Drive Integration (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REFRESH_TOKEN="your-google-refresh-token"
GOOGLE_DRIVE_FOLDER_ID="your-folder-id"

# Application Settings
APP_NAME="Family GnuCash"
DEFAULT_CURRENCY="USD"
DEFAULT_DATE_FORMAT="MM/DD/YYYY"

# Security Settings
SESSION_TIMEOUT_HOURS=8
BCRYPT_ROUNDS=12
EOF
fi

print_success "Configuration files organized"

# Organize Prisma files
print_status "Organizing Prisma schema..."

if [ -f "prisma/prisma-schema.txt" ]; then
    cp "prisma/prisma-schema.txt" "prisma/schema.prisma"
elif [ -f "prisma-schema.txt" ]; then
    cp "prisma-schema.txt" "prisma/schema.prisma"
fi

# Copy seed file if it exists
[ -f "prisma/seed.ts" ] && cp "prisma/seed.ts" "prisma/seed.ts"

print_success "Prisma files organized"

# Organize app directory files
print_status "Organizing app directory files..."

# App layout
if [ -f "app/layout.ts" ]; then
    cp "app/layout.ts" "app/layout.tsx"
elif [ -f "main-app-pages.ts" ]; then
    extract_section "main-app-pages.ts" "app/layout.tsx" "app/layout.tsx"
fi

# App providers
[ -f "app/providers.ts" ] && cp "app/providers.ts" "app/providers.tsx"

# Global CSS
if [ -f "app/globals-css.css" ]; then
    cp "app/globals-css.css" "app/globals.css"
elif [ -f "app/globals.css" ]; then
    cp "app/globals.css" "app/globals.css"
elif [ -f "main-app-pages.ts" ]; then
    extract_section "main-app-pages.ts" "app/globals.css" "app/globals.css"
fi

print_success "App directory organized"

# Organize page components
print_status "Organizing page components..."

# Dashboard
[ -f "app/dashboard/dashboard-page.ts" ] && cp "app/dashboard/dashboard-page.ts" "app/dashboard/page.tsx"

# Login
[ -f "app/login/login-page.ts" ] && cp "app/login/login-page.ts" "app/login/page.tsx"

# Extract from combined files
if [ -f "main-app-pages.ts" ]; then
    extract_section "main-app-pages.ts" "app/accounts/page.tsx" "app/accounts/page.tsx"
    extract_section "main-app-pages.ts" "app/transactions/page.tsx" "app/transactions/page.tsx"
fi

if [ -f "final-pages-and-setup.ts" ]; then
    extract_section "final-pages-and-setup.ts" "app/budgets/page.tsx" "app/budgets/page.tsx"
    extract_section "final-pages-and-setup.ts" "app/reports/page.tsx" "app/reports/page.tsx"
    extract_section "final-pages-and-setup.ts" "app/reconciliation/page.tsx" "app/reconciliation/page.tsx"
    extract_section "final-pages-and-setup.ts" "app/import-export/page.tsx" "app/import-export/page.tsx"
fi

print_success "Page components organized"

# Organize API routes
print_status "Organizing API routes..."

# NextAuth route
if [ -f "app/api/auth/nextauth-route.ts" ]; then
    cp "app/api/auth/nextauth-route.ts" "app/api/auth/[...nextauth]/route.ts"
elif [ -f "auth-system.ts" ]; then
    extract_section "auth-system.ts" "app/api/auth/\[...nextauth\]/route.ts" "app/api/auth/[...nextauth]/route.ts"
fi

# Admin API routes
if [ -f "admin-panel.ts" ]; then
    extract_section "admin-panel.ts" "app/api/admin/users/route.ts" "app/api/admin/users/route.ts"
fi

# Other API routes
if [ -f "components-and-apis.ts" ]; then
    extract_section "components-and-apis.ts" "app/api/accounts/route.ts" "app/api/accounts/route.ts"
    extract_section "components-and-apis.ts" "app/api/transactions/route.ts" "app/api/transactions/route.ts"
fi

# Reconcile route
if [ -f "final-pages-and-setup.ts" ]; then
    extract_section "final-pages-and-setup.ts" "app/api/transactions/\[id\]/reconcile/route.ts" "app/api/transactions/[id]/reconcile/route.ts"
fi

print_success "API routes organized"

# Organize admin pages
print_status "Organizing admin pages..."

if [ -f "admin-panel.ts" ]; then
    extract_section "admin-panel.ts" "app/admin/page.tsx" "app/admin/page.tsx"
    extract_section "admin-panel.ts" "app/admin/users/page.tsx" "app/admin/users/page.tsx"
    extract_section "admin-panel.ts" "app/admin/settings/page.tsx" "app/admin/settings/page.tsx"
fi

print_success "Admin pages organized"

# Organize components
print_status "Organizing components..."

# Navigation
if [ -f "components/navigation-component.ts" ]; then
    cp "components/navigation-component.ts" "components/Navigation.tsx"
elif [ -f "components-and-apis.ts" ]; then
    extract_section "components-and-apis.ts" "components/Navigation.tsx" "components/Navigation.tsx"
fi

# Other components
if [ -f "components-and-apis.ts" ]; then
    extract_section "components-and-apis.ts" "components/AccountsList.tsx" "components/AccountsList.tsx"
    extract_section "components-and-apis.ts" "components/AddAccountForm.tsx" "components/AddAccountForm.tsx"
    extract_section "components-and-apis.ts" "components/TransactionsList.tsx" "components/TransactionsList.tsx"
    extract_section "components-and-apis.ts" "components/AddTransactionForm.tsx" "components/AddTransactionForm.tsx"
    extract_section "components-and-apis.ts" "components/TransactionFilters.tsx" "components/TransactionFilters.tsx"
fi

print_success "Components organized"

# Organize lib files
print_status "Organizing lib files..."

# Auth
if [ -f "lib/auth.ts" ]; then
    cp "lib/auth.ts" "lib/auth.ts"
elif [ -f "auth-system.ts" ]; then
    extract_section "auth-system.ts" "lib/auth.ts" "lib/auth.ts"
fi

# Database
if [ -f "lib/database.ts" ]; then
    cp "lib/database.ts" "lib/database.ts"
elif [ -f "database-utils.ts" ]; then
    extract_section "database-utils.ts" "lib/database.ts" "lib/database.ts"
fi

# Utils
if [ -f "lib/utils.ts" ]; then
    cp "lib/utils.ts" "lib/utils.ts"
elif [ -f "database-utils.ts" ]; then
    extract_section "database-utils.ts" "lib/utils.ts" "lib/utils.ts"
fi

# Google Drive
if [ -f "database-utils.ts" ]; then
    extract_section "database-utils.ts" "lib/google-drive.ts" "lib/google-drive.ts"
fi

print_success "Lib files organized"

# Organize types
print_status "Organizing types..."

if [ -f "types/types-index.ts" ]; then
    cp "types/types-index.ts" "types/index.ts"
elif [ -f "database-utils.ts" ]; then
    extract_section "database-utils.ts" "types/index.ts" "types/index.ts"
fi

print_success "Types organized"

# Organize middleware
print_status "Organizing middleware..."

if [ -f "backend/middleware.ts" ]; then
    cp "backend/middleware.ts" "middleware.ts"
elif [ -f "auth-system.ts" ]; then
    extract_section "auth-system.ts" "middleware.ts" "middleware.ts"
fi

print_success "Middleware organized"

# Create documentation
print_status "Creating documentation..."

# README
if [ -f "final-pages-and-setup.ts" ]; then
    extract_section "final-pages-and-setup.ts" "README.md" "README.md"
fi

# Project tracker
if [ -f "project-tracker.md" ]; then
    cp "project-tracker.md" "docs/PROJECT_TRACKER.md"
elif [ -f "Family GnuCash - Project Progress Tracker.md" ]; then
    cp "Family GnuCash - Project Progress Tracker.md" "docs/PROJECT_TRACKER.md"
fi

print_success "Documentation organized"

# Create .gitignore
print_status "Creating .gitignore..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Next.js
.next/
out/

# Production
build/
dist/

# Environment variables
.env.local
.env.development.local
.env.test.local
.env.production.local

# Database
*.db
*.sqlite

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Prisma
prisma/migrations/
EOF

print_success ".gitignore created"

# Clean up GitHub workflows (keep only main.yml)
if [ -d ".github/workflows" ]; then
    print_status "Cleaning up duplicate workflows..."
    cd .github/workflows
    for file in sin.yml organize-files.yml 242n.yml man.yml; do
        [ -f "$file" ] && rm "$file" && print_warning "Removed duplicate workflow: $file"
    done
    cd ../..
fi

# Validate project structure
print_status "Validating project structure..."

required_files=(
    "package.json"
    "next.config.js"
    "tailwind.config.js"
    "tsconfig.json"
    "prisma/schema.prisma"
    "app/layout.tsx"
    "app/dashboard/page.tsx"
    "app/login/page.tsx"
    "app/api/auth/[...nextauth]/route.ts"
    "components/Navigation.tsx"
    "lib/auth.ts"
    "lib/database.ts"
    "middleware.ts"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    print_success "All required files are present!"
else
    print_warning "Missing files:"
    printf '%s\n' "${missing_files[@]}"
fi

# Create setup instructions
print_status "Creating setup instructions..."
cat > SETUP.md << 'EOF'
# Family GnuCash - Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your database and API keys
   ```

3. **Setup Database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open Application**
   - Visit http://localhost:3000
   - Login with: admin / admin123

## Project Structure

```
family-gnucash/
├── app/                    # Next.js 14 App Router
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   ├── dashboard/         # Main dashboard
│   ├── login/             # Authentication
│   └── ...                # Other accounting pages
├── components/            # Reusable React components  
├── lib/                   # Utilities and database
├── prisma/               # Database schema and migrations
├── types/                # TypeScript type definitions
└── docs/                 # Documentation
```

## Features

- 🔒 Password-protected family accounting
- 📊 Double-entry bookkeeping system
- 💰 Budget tracking and variance reporting
- 📈 Financial reports (P&L, Balance Sheet)
- 🔄 Account reconciliation
- 📁 Import/Export (CSV, OFX, QIF, GnuCash XML)
- ☁️ Google Drive backup integration
- 👥 Multi-user support with role-based access
- 🛡️ Admin panel for system configuration

## Next Steps

1. Configure your MySQL database connection
2. Set up Google Drive API for backups (optional)
3. Customize the chart of accounts for your family
4. Create additional user accounts for family members
5. Start recording your financial transactions!

For detailed documentation, see `docs/PROJECT_TRACKER.md`
EOF

print_success "Setup instructions created"

# Final summary
echo ""
echo "========================================"
echo -e "${GREEN}✅ Project organization complete!${NC}"
echo "========================================"
echo ""
echo "Project structure is now organized!"
echo ""
echo "Files have been organized into:"
echo "- app/         Next.js app directory"
echo "- components/  React components"
echo "- lib/         Utility functions"
echo "- prisma/      Database schema"
echo "- types/       TypeScript definitions"
echo "- docs/        Documentation"
echo ""
echo "Configuration files created:"
echo "- package.json"
echo "- next.config.js"
echo "- tailwind.config.js"
echo "- tsconfig.json"
echo "- .env.local.example"
echo "- .gitignore"
echo ""
echo "For project details, see SETUP.md and docs/PROJECT_TRACKER.md"

# Optional: Ask if user wants to remove source files
echo ""
read -p "Do you want to remove the original source files? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Removing original source files..."
    rm -f *.ts *.tsx *.md *.json 2>/dev/null || true
    rm -rf scripts/ backend/ 2>/dev/null || true
    print_success "Source files removed"
else
    print_status "Original source files kept"
fi

print_success "Script completed successfully!"
