# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package manifests for caching & reproducible builds
COPY package.json package-lock.json ./

RUN npm ci

# Copy the rest of the application files
COPY . .

# Build-time environment variable for Next.js static injection
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the Next.js application in standalone mode
RUN npm run build


# Stage 2: Runtime
FROM node:22-alpine AS runtime

# Install tini for process handling
RUN apk add --no-cache tini 

WORKDIR /app 

# Create a secure non-root user and group
RUN addgroup -S nodejs && adduser -S -G nodejs nodejs

ENV NODE_ENV=production
ENV PORT=3000
# Set HOSTNAME to bind server correctly in container environments
ENV HOSTNAME="0.0.0.0"

# Copy Next.js standalone build artifacts with proper non-root ownership
COPY --chown=nodejs:nodejs --from=builder /app/public ./public
COPY --chown=nodejs:nodejs --from=builder /app/.next/standalone ./
COPY --chown=nodejs:nodejs --from=builder /app/.next/static ./.next/static

USER nodejs

EXPOSE 3000

# Healthcheck to verify frontend responsiveness
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Use tini to handle SIGTERM/SIGINT signals gracefully
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]