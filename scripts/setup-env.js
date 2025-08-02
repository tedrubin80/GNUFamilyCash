// scripts/setup-env.js
// This script sets up the DATABASE_URL from Railway's MySQL parameters

const MYSQL_HOST = process.env.MYSQLHOST || 'mysql.railway.internal';
const MYSQL_PORT = process.env.MYSQLPORT || '3306';
const MYSQL_USER = process.env.MYSQLUSER || 'root';
const MYSQL_PASSWORD = process.env.MYSQLPASSWORD || 'SrCovQAdEMpaVZnnHfhYGIKbYUNuPYRY';
const MYSQL_DATABASE = process.env.MYSQLDATABASE || 'railway';

// Construct DATABASE_URL
const DATABASE_URL = `mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}`;

// Set it as environment variable
process.env.DATABASE_URL = DATABASE_URL;

console.log('Environment setup complete:');
console.log(`- Host: ${MYSQL_HOST}`);
console.log(`- Port: ${MYSQL_PORT}`);
console.log(`- User: ${MYSQL_USER}`);
console.log(`- Database: ${MYSQL_DATABASE}`);
console.log('- DATABASE_URL has been set');

// Export for use in other scripts
module.exports = { DATABASE_URL };