// scripts/start-production.js
// Production startup script that ensures DATABASE_URL is set

// First, set up environment
require('./setup-env');

const { execSync } = require('child_process');

async function start() {
  try {
    console.log('🚀 Starting Family GnuCash...\n');
    
    // Step 1: Push database schema
    console.log('📊 Updating database schema...');
    try {
      execSync('npx prisma db push --skip-generate', { 
        stdio: 'inherit',
        env: process.env 
      });
      console.log('✅ Database schema updated\n');
    } catch (error) {
      console.error('⚠️  Database schema update failed (might already be up to date)');
    }
    
    // Step 2: Check if we should seed the database
    if (process.env.SEED_ON_START === 'true') {
      console.log('🌱 Seeding database...');
      try {
        execSync('npm run db:seed', { 
          stdio: 'inherit',
          env: process.env 
        });
        console.log('✅ Database seeded\n');
      } catch (error) {
        console.error('⚠️  Database seeding failed (might already be seeded)');
      }
    }
    
    // Step 3: Start the Next.js server
    console.log('🌐 Starting Next.js server...');
    execSync('npm run start', { 
      stdio: 'inherit',
      env: process.env 
    });
    
  } catch (error) {
    console.error('❌ Startup failed:', error.message);
    process.exit(1);
  }
}

// Start the application
start();