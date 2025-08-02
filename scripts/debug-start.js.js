// scripts/debug-start.js
// Minimal script that won't crash - just logs environment and waits

const http = require('http');

console.log('🔍 Debug Start - This script will NOT crash');
console.log('=========================================');
console.log('');

// Log all environment variables related to MySQL/Database
console.log('📊 Database-related environment variables:');
Object.keys(process.env).sort().forEach(key => {
  if (key.includes('MYSQL') || key.includes('DATABASE') || key === 'DATABASE_URL') {
    const value = process.env[key];
    if (key.includes('PASSWORD')) {
      console.log(`${key}: ${value ? '***SET***' : 'NOT SET'}`);
    } else {
      console.log(`${key}: ${value || 'NOT SET'}`);
    }
  }
});

console.log('');
console.log('🌐 Railway-specific variables:');
['PORT', 'RAILWAY_ENVIRONMENT', 'RAILWAY_STATIC_URL', 'RAILWAY_SERVICE_NAME'].forEach(key => {
  console.log(`${key}: ${process.env[key] || 'NOT SET'}`);
});

// Create a simple HTTP server that won't crash
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <body>
          <h1>Family GnuCash - Debug Mode</h1>
          <h2>Environment Variables:</h2>
          <pre>${JSON.stringify({
            DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
            MYSQL_URL: process.env.MYSQL_URL ? 'SET' : 'NOT SET',
            MYSQLHOST: process.env.MYSQLHOST || 'NOT SET',
            MYSQLPORT: process.env.MYSQLPORT || 'NOT SET',
            MYSQLUSER: process.env.MYSQLUSER || 'NOT SET',
            MYSQLPASSWORD: process.env.MYSQLPASSWORD ? 'SET' : 'NOT SET',
            MYSQLDATABASE: process.env.MYSQLDATABASE || 'NOT SET',
            PORT: process.env.PORT || 'NOT SET',
            NODE_ENV: process.env.NODE_ENV || 'NOT SET'
          }, null, 2)}</pre>
          <p>Check the logs for more details.</p>
        </body>
      </html>
    `);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`✅ Debug server listening on port ${PORT}`);
  console.log('');
  console.log('The app is now running in debug mode.');
  console.log('Visit your Railway URL to see environment variables.');