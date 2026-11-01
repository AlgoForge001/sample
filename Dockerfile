# =========================================================================
# Production Dockerfile for My Notes (Self-hosting on Coolify)
# =========================================================================

# Stage 1: Build React + Vite frontend
FROM node:22-alpine AS client-builder
WORKDIR /app/client

# Install frontend dependencies
COPY client/package*.json ./
RUN npm ci

# Copy client source code and build production bundle
COPY client/ ./
RUN npm run build

# =========================================================================
# Stage 2: Production runtime image
# =========================================================================
FROM node:22-alpine
WORKDIR /app

# Install native addon build tools and curl for health checks
RUN apk add --no-cache python3 make g++ curl

# Install backend production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy server code
COPY server/ ./server/

# Copy compiled frontend assets from client-builder stage
COPY --from=client-builder /app/client/dist ./client/dist

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV DB_PATH=/app/data/notes.db

# Ensure persistent SQLite data directory exists
RUN mkdir -p /app/data

# Declare volume for persistent data storage (mounted in Coolify)
VOLUME ["/app/data"]

# Expose application port (detected by Coolify)
EXPOSE 3000

# Container healthcheck monitoring endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://127.0.0.1:3000/api/health || exit 1

# Start the Express server
CMD ["node", "server/index.js"]
