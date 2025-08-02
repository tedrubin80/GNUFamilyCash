// scripts/start-production.js
// Production startup script that ensures DATABASE_URL is set

const { execSync } = require('child_process');

// First, let's debug what environment variables we have
console.log('🔍 Checking environment variables...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

// Check for database URL in various forms
const dbUrl = process.env.DATABASE_URL || 
              process.env.MYSQL_URL || 
              process.env.MYSQL_PUBLIC_URL ||
              process.env.MYSQL_PRIVATE_URL;

if (!dbUrl) {
  console.log('❌ No DATABASE_URL found!');
  console.log('Available MySQL variables:');
  Object.keys(process.env).forEach(key => {
    if (key.includes('MYSQL') || key.includes('DATABASE')) {
      console.log(`  ${key}:`, process.env[key] ? 'Set' : 'Not set');
    }
  });
  
  // Try to construct from parts if available
  if (process.env.MYSQLHOST && process.env.MYSQLUSER && process.env.MYSQLPASSWORD && process.env.MYSQLDATABASE) {
    const constructed = `mysql://${process.env.MYSQLUSER}:${process.env.MYSQLPASSWORD}@${process.env.MYSQLHOST}:${process.env.MYSQLPORT || 3306}/${process.env.MYSQLDATABASE}`;
    console.log('✅ Constructing DATABASE_URL from parts');
    process.env.DATABASE_URL = constructed;
  } else {
    console.error('Cannot construct DATABASE_URL - missing components');
    process.exit(1);
  }
} else {
  console.log('✅ Database URL found');
  process.env.DATABASE_URL = dbUrl;
}

async function start() {
  try {
    console.log('🚀 Starting Family GnuCash...\n');
    
    const PORT = process.env.PORT || 3000;
    console.log(`📡 Will listen on port: ${PORT}`);
    
    // Step 1: Test database con