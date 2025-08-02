#!/bin/bash

echo "🔧 Fixing Family GnuCash Build Errors"
echo "===================================="
echo ""

# Step 1: Clean previous builds
echo "1. Cleaning previous builds..."
rm -rf .next
rm -rf node_modules
rm -f package-lock.json
echo "✅ Cleaned"
echo ""

# Step 2: Install dependencies
echo "2. Installing dependencies..."
npm install --legacy-peer-deps
echo "✅ Dependencies installed"
echo ""

# Step 3: Generate Prisma client
echo "3. Generating Prisma client..."
npx prisma generate
echo "✅ Prisma client generated"
echo ""

# Step 4: Create missing directories
echo "4. Creating required directories..."
mkdir -p app/api/scheduled-transactions/[id]
mkdir -p types
mkdir -p components
echo "✅ Directories created"
echo ""

# Step 5: Fix common import issues
echo "5. Checking for common issues..."

# Create missing components if they don't exist
if [ ! -f "components/ScheduledTransactionsList.tsx" ]; then
    echo "Creating placeholder ScheduledTransactionsList component..."
    cat > components/ScheduledTransactionsList.tsx << 'EOF'
'use client'

export function ScheduledTransactionsList({ userRole }: { userRole: string }) {
  return (
    <div className="bg-white p-6 rounded-lg border">
      <p>Scheduled Transactions List</p>
    </div>
  )
}
EOF
fi

if [ ! -f "components/AddScheduledTransactionForm.tsx" ]; then
    echo "Creating placeholder AddScheduledTransactionForm component..."
    cat > components/AddScheduledTransactionForm.tsx << 'EOF'
'use client'

export function AddScheduledTransactionForm({ accounts }: { accounts: any[] }) {
  return <button className="bg-blue-600 text-white px-4 py-2 rounded">Add Scheduled Transaction</button>
}
EOF
fi

if [ ! -f "components/SubscriptionsList.tsx" ]; then
    echo "Creating placeholder SubscriptionsList component..."
    cat > components/SubscriptionsList.tsx << 'EOF'
'use client'

export function SubscriptionsList({ userRole, accounts }: { userRole: string; accounts: any[] }) {
  return (
    <div className="bg-white p-6 rounded-lg border">
      <p>Subscriptions List</p>
    </div>
  )
}
EOF
fi

echo "✅ Component placeholders created"
echo ""

# Step 6: Run build with verbose output
echo "6. Attempting build with verbose output..."
npm run build --verbose

echo ""
echo "Build script completed. Check output above for any remaining errors."