# Stage 1: Build & Prune
FROM node:22-alpine AS builder

# Install OpenSSL & compatibility libs for Prisma client generation
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Explicitly copy package manifests for caching & reproducible builds
COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Prune development dependencies
RUN npm prune --omit=dev


# Stage 2: Runtime
FROM node:22-alpine AS runtime

# Install tini for PID 1 signal handling, openssl and libc6-compat for Prisma runtime
RUN apk add --no-cache tini openssl libc6-compat

WORKDIR /app

# Create a secure non-root user and group
RUN addgroup -S nodejs && adduser -S -G nodejs nodejs

ARG BUILD_DATE=unknown
ARG GIT_COMMIT=unknown
ARG APP_VERSION=1.0.0

LABEL maintainer="[EMAIL_ADDRESS]" \
      org.opencontainers.image.created=$BUILD_DATE \
      org.opencontainers.image.revision=$GIT_COMMIT \
      org.opencontainers.image.version=$APP_VERSION

ENV NODE_ENV=production
ENV PORT=8080

# Copy node_modules and package.json with correct non-root ownership
COPY --chown=nodejs:nodejs --from=builder /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs --from=builder /app/package.json ./package.json

# Copy all application source code (uses .dockerignore to skip node_modules and env files)
COPY --chown=nodejs:nodejs . .

USER nodejs

# Healthcheck to verify service availability
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

EXPOSE 8080

# Use tini as the entrypoint to handle signals gracefully
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "index.js"]
