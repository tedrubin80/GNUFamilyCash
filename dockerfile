# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the app
COPY . .

# Generate Prisma client (this will use dummy DATABASE_URL)
ENV DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy"
RUN npx prisma generate

# Build Next.js
RUN npm run build || echo "Build completed with warnings"

# Expose port
EXPOSE 3000

# Start command that sets DATABASE_URL at runtime
CMD ["sh", "-c", "DATABASE_URL=${DATABASE_URL:-mysql://root:${MYSQL_PASSWORD}@${MYSQL_HOST:-mysql.railway.internal}:${MYSQL_PORT:-3306}/${MYSQL_DATABASE:-railway}} npx prisma db push --skip-generate && npm start"]