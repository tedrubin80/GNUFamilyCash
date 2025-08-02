// scripts/build-debug.js
// Build script with detailed debugging

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Debug Build Process Starting...\n');

// Check what's installed
console.log('📦 Checking installed packages:');
try {
  // List key dependencies
  const deps = ['next', 'react', 'react-dom', 'tailwindcss', 'lucide-react', '@prisma/client'];
  deps.forEach(dep => {
    const exists = fs.existsSync(`node_modules/${dep}`);
    console.log(`  ${exists ? '✅' : '❌'} ${dep}`);
  });
} catch (e) {
  console.error('Error checking packages:', e.message);
}

console.log('\n🔧 Setting up environment...');
try {
  require('./setup-env');
} catch (e) {
  console.error('❌ Error in setup-env:', e.message);
}

console.log('\n📊 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch (e) {
  console.error('❌ Prisma generate failed:', e.message);
}

console.log('\n🚀 Building Next.js...');
try {
  execSync('npx next build', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  console.log('\n✅ Build successful!');
} catch (e) {
  console.error('\n❌ Next.js build failed');
  console.error('Error:', e.message);
  process.exit(1);
}
