# Multi-stage Dockerfile for My Notes

# Stage 1: Build React + Vite frontend
FROM node:22-alpine AS client-builder
WORKDIR /app/client

# Copy package manifests and install client dependencies
COPY client/package*.json ./
RUN npm ci

# Copy client source code and build production assets
COPY client/ ./
RUN npm run build

# Stage 2: Production runtime environment
FROM node:22-alpine
WORKDIR /app

# Install build dependencies for native Node.js addons (SQLite)
RUN apk add --no-cache python3 make g++

# Copy root package manifests and install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy server source code
COPY server/ ./server/

# Copy built frontend assets from the client-builder stage
COPY --from=client-builder /app/client/dist ./client/dist

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV DB_PATH=/app/data/notes.db

# Create directory for persistent SQLite database
RUN mkdir -p /app/data

# Declare volume for persistent data storage
VOLUME ["/app/data"]

# Expose port 3000
EXPOSE 3000

# Health check using the /api/health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

# Start the Express server
CMD ["node", "server/index.js"]

