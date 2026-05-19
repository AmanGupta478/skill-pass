FROM node:20-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy package manifests first for caching
COPY package-lock.json package.json ./

# Install ALL dependencies for the build
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the Next.js application in standalone mode
RUN npm run build

# Runtime Stage
FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy Next.js standalone build artifacts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Create and run under a secure non-root user
RUN addgroup -S nodejs && adduser -S -G nodejs nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

CMD ["node", "server.js"]