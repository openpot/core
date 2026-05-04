# --- Stage 1: Build ---
FROM node:22-alpine AS builder

# Check for pnpm availability or install it
RUN apk add --no-cache git && npm install -g pnpm@10.10.0

WORKDIR /app

# Copy configuration files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the source
COPY . .

# Create a build argument for the Git hash
ARG BUILD_HASH=koyeb-build
ENV BUILD_HASH=${BUILD_HASH}

# Build the Next.js app (Static Export)
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# --- Stage 2: Serve ---
FROM nginx:stable-alpine

# Copy the static export from the builder
COPY --from=builder /app/out /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port (Koyeb usually expects 8000/8080/80)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
