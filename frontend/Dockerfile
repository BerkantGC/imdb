# Frontend Dockerfile - Multi-stage build
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user (nginx group already exists in nginx:alpine)
RUN adduser -S nginxuser -u 1001 -G nginx

# Set proper permissions
RUN chown -R nginxuser:nginx /usr/share/nginx/html && \
    chown -R nginxuser:nginx /var/cache/nginx && \
    chown -R nginxuser:nginx /var/log/nginx && \
    chown -R nginxuser:nginx /etc/nginx/conf.d

# Switch to non-root user
USER nginxuser

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
