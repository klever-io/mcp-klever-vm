# Stage 1: Build
FROM node:22-alpine AS builder

RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src/ ./src/

RUN pnpm run build

# Stage 2: Production dependencies (clean install, no dev deps)
FROM node:22-alpine AS deps

RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --prod

# Stage 3: Runtime (no pnpm, no npm — minimal attack surface)
FROM node:22-alpine

# Remove npm (and its bundled tar/glob/diff) — we only need the Node.js runtime
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

ARG GIT_SHA=dev
ARG BUILD_TIME=""

# Default to stdio (MCP) mode for Docker MCP Catalog compatibility.
# Override with MODE=public for HTTP/streamable-http deployments.
ENV MODE=mcp
ENV NODE_ENV=production
ENV PORT=3000
ENV TRUST_PROXY=true
ENV GIT_SHA=${GIT_SHA}
ENV BUILD_TIME=${BUILD_TIME}

EXPOSE 3000

# Health check only applies in public (HTTP) mode; stdio mode has no HTTP server.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD if [ "$MODE" = "public" ] || [ "$MODE" = "http" ]; then wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3000}/health || exit 1; else exit 0; fi

CMD ["node", "dist/index.js"]
