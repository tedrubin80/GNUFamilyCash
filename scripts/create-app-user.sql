-- scripts/create-app-user.sql
-- Run this after deployment to create a dedicated app user

-- Create a new user for the application
CREATE USER IF NOT EXISTS 'gnucash_app'@'%' IDENTIFIED BY 'your_secure_password_here';

-- Grant necessary permissions on the railway database
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP, INDEX, REFERENCES 
ON railway.* TO 'gnucash_app'@'%';

-- Apply the changes
FLUSH PRIVILEGES;

-- Verify the user was created
SELECT User, Host FROM mysql.user WHERE User = 'gnucash_app';

-- Show grants for the new user
SHOW GRANTS FOR 'gnucash_app'@'%';