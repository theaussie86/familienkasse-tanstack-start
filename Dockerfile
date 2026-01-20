# Stage 1: Install dependencies
FROM node:22-alpine AS deps

# Add libc compatibility for native modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Stage 2: Build the application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Bundle migration script to JavaScript (temporary - remove after migration)
RUN npx esbuild src/scripts/migrate-from-supabase.ts --bundle --platform=node --target=node22 --outfile=dist-scripts/migrate-from-supabase.mjs --format=esm --external:postgres --external:drizzle-orm --external:dotenv

# Stage 3: Production runtime
FROM node:22-alpine AS runner

# Add curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# Copy built output from builder stage
COPY --from=builder --chown=appuser:nodejs /app/.output ./.output

# Copy package files for migrations
COPY --from=builder --chown=appuser:nodejs /app/package.json ./
COPY --from=builder --chown=appuser:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=appuser:nodejs /app/drizzle.config.ts ./
COPY --from=builder --chown=appuser:nodejs /app/src/db ./src/db

# Copy compiled migration script (temporary - remove after migration)
COPY --from=builder --chown=appuser:nodejs /app/dist-scripts ./dist-scripts

# Copy node_modules for drizzle-kit migrations
COPY --from=deps --chown=appuser:nodejs /app/node_modules ./node_modules

# Copy entrypoint script
COPY --chown=appuser:nodejs docker-entrypoint.sh ./

# Make entrypoint executable
RUN chmod +x docker-entrypoint.sh

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Use entrypoint to run migrations before starting the app
ENTRYPOINT ["./docker-entrypoint.sh"]
