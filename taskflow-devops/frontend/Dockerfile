# ==============================================================================
# TaskFlow Frontend — Production Dockerfile
# ==============================================================================
# Multi-stage build for a clean, lean, secure Next.js container:
#   Stage 1 (builder): Installs dependencies and compiles production assets
#   Stage 2 (runner):  Lightweight production runtime with non-root security
# ==============================================================================

# ----- Stage 1: Dependencies & Build ------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies deterministically via package-lock.json
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build-time argument: Next.js inlines NEXT_PUBLIC_* variables into client bundles
# during compilation. Default points to local FastAPI backend.
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NODE_ENV=production

# Compile production bundle (generates optimized JS, CSS, and pre-rendered pages in .next)
RUN npm run build

# ----- Stage 2: Production Runner ---------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Security: use built-in unprivileged 'node' user (UID 1000)
USER node

# Copy only what is necessary to serve the application
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/package-lock.json ./package-lock.json
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/public ./public

# Next.js production server port
EXPOSE 3000

# Start production server
CMD ["npm", "start"]
