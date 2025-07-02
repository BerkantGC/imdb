# Backend Dockerfile
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy package files
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY backend/ .

# Create uploads directory with proper permissions
RUN mkdir -p uploads/movies uploads/profiles && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

EXPOSE 3000

# Use node directly instead of npm for better signal handling
CMD ["node", "app.js"]
