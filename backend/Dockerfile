FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma

RUN npm ci

RUN npx prisma generate

RUN npm prune --omit=dev

FROM node:20-alpine AS runtime

WORKDIR /app

ARG BUILD_DATE=unknown
ARG GIT_COMMIT=unknown
ARG APP_VERSION=1.0.0

LABEL maintainer="[EMAIL_ADDRESS]" \
      org.opencontainers.image.created=$BUILD_DATE \
      org.opencontainers.image.revision=$GIT_COMMIT \
      org.opencontainers.image.version=$APP_VERSION

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy all application source code
COPY index.js prismaClient.js ./
COPY controllers ./controllers/
COPY routes ./routes/
COPY middlewares ./middlewares/
COPY prisma ./prisma/

RUN addgroup -S nodejs && adduser -S -G nodejs nodejs && chown -R nodejs:nodejs /app

USER nodejs

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider \
  http://localhost:8080/health || exit 1

EXPOSE 8080

CMD ["node", "index.js"]
