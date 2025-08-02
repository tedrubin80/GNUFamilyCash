#!/bin/bash
# check-project.sh - Verify Family GnuCash project structure and files

echo "🔍 Family GnuCash Project Health Check"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Counters
total_checks=0
passed_checks=0

# Function to check file exists and has content
check_file() {
    local file=$1
    local min_size=${2:-10}  # Minimum file size in bytes
    total_checks=$((total_checks + 1))
    
    if [ -f "$file" ]; then
        size=$(wc -c < "$file" | tr -d ' ')
        if [ "$size" -gt "$min_size" ]; then
            echo -e "${GREEN}✅${NC} $file (${size} bytes)"
            passed_checks=$((passed_checks + 1))
        else
            echo -e "${RED}❌${NC} $file exists but is too small (${size} bytes)"
        fi
    else
        echo -e "${RED}❌${NC} $file is missing"
    fi
}

# Function to check directory exists
check_dir() {
    local dir=$1
    total_checks=$((total_checks + 1))
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✅${NC} $dir/"
        passed_checks=$((passed_checks + 1))
    else
        echo -e "${RED}❌${NC} $dir/ is missing"
    fi
}

echo "📁 Checking Directory Structure:"
echo "--------------------------------"
check_dir "app"
check_dir "app/admin"
check_dir "app/api"
check_dir "app/api/auth/[...nextauth]"
check_dir "app/api/transactions/[id]/reconcile"
check_dir "components"
check_dir "lib"
check_dir "prisma"
check_dir "types"

echo ""
echo "📄 Checking Configuration Files:"
echo "--------------------------------"
check_file "package.json" 100
check_file "next.config.js" 50
check_file "tailwind.config.js" 50
check_file "postcss.config.js" 20
check_file "tsconfig.json" 100
check_file ".env.local.example" 50
check_file ".gitignore" 50
check_file "middleware.ts" 100

echo ""
echo "📄 Checking App Pages:"
echo "----------------------"
check_file "app/layout.tsx" 100
check_file "app/globals.css" 20
check_file "app/providers.tsx" 50
check_file "app/dashboard/page.tsx" 1000
check_file "app/login/page.tsx" 1000
check_file "app/accounts/page.tsx" 500
check_file "app/transactions/page.tsx" 500
check_file "app/budgets/page.tsx" 500
check_file "app/reports/page.tsx" 1000
check_file "app/reconciliation/page.tsx" 500
check_file "app/import-export/page.tsx" 1000

echo ""
echo "📄 Checking Admin Pages:"
echo "------------------------"
check_file "app/admin/page.tsx" 1000
check_file "app/admin/users/page.tsx" 2000
check_file "app/admin/settings/page.tsx" 2000

echo ""
echo "📄 Checking API Routes:"
echo "-----------------------"
check_file "app/api/auth/[...nextauth]/route.ts" 500
check_file "app/api/accounts/route.ts" 500
check_file "app/api/transactions/route.ts" 500
check_file "app/api/admin/users/route.ts" 500
check_file "app/api/transactions/[id]/reconcile/route.ts" 500

echo ""
echo "📄 Checking Components:"
echo "-----------------------"
check_file "components/Navigation.tsx" 1000
check_file "components/AccountsList.tsx" 1000
check_file "components/AddAccountForm.tsx" 1000
check_file "components/TransactionsList.tsx" 100
check_file "components/AddTransactionForm.tsx" 2000
check_file "components/TransactionFilters.tsx" 1000

echo ""
echo "📄 Checking Library Files:"
echo "--------------------------"
check_file "lib/auth.ts" 500
check_file "lib/database.ts" 1000
check_file "lib/utils.ts" 1000
check_file "lib/google-drive.ts" 1000

echo ""
echo "📄 Checking Other Files:"
echo "------------------------"
check_file "prisma/schema.prisma" 1000
check_file "types/index.ts" 1000
check_file "README.md" 1000

echo ""
echo "🔍 Checking for Empty Files:"
echo "----------------------------"
empty_files=$(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.json" | xargs -I {} sh -c 'if [ -f "{}" ] && [ ! -s "{}" ]; then echo "{}"; fi' 2>/dev/null)
if [ -z "$empty_files" ]; then
    echo -e "${GREEN}✅${NC} No empty files found!"
else
    echo -e "${RED}❌${NC} Found empty files:"
    echo "$empty_files"
fi

echo ""
echo "🔍 Checking for Problematic Files:"
echo "----------------------------------"
if [ -f "'ADMIN' || user.role" ] || [ -f "'ADMIN' || userRole" ] || [ -f "'ASSET' || a.type" ]; then
    echo -e "${RED}❌${NC} Found files with problematic names - run cleanup"
    ls -la "'ADMIN'"* "'ASSET'"* 2>/dev/null || true
else
    echo -e "${GREEN}✅${NC} No problematic file names found"
fi

echo ""
echo "📊 Summary:"
echo "-----------"
echo "Total checks: $total_checks"
echo "Passed: $passed_checks"
echo "Failed: $((total_checks - passed_checks))"
echo ""

if [ $passed_checks -eq $total_checks ]; then
    echo -e "${GREEN}🎉 All checks passed! Your project is ready.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Copy .env.local.example to .env.local and configure"
    echo "2. Run: npm install"
    echo "3. Set up your MySQL database"
    echo "4. Run: npx prisma generate"
    echo "5. Run: npx prisma db push"
    echo "6. Run: npm run dev"
else
    echo -e "${YELLOW}⚠️  Some checks failed. Review the issues above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "- For empty files: Run the fix-all-empty-files.sh script"
    echo "- For missing directories: They'll be created when you add files"
    echo "- For small files: Check if content was properly extracted"
fi

echo ""
echo "📁 Quick Project Tree:"
echo "---------------------"
tree -L 2 -I 'node_modules|.git|.next' 2>/dev/null || ls -la