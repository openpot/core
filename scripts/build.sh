#!/bin/bash

# Openpot Build Script
# Generates a clean production static export with consistent version tagging.

set -e

# 1. Determine Build Version
GIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "prod")
echo "📦 Building Openpot [Tag: $GIT_HASH]"

# 2. Preparation
echo "🧹 Cleaning previous build artifacts..."
rm -rf .next out

# 3. Execution
echo "🚀 Starting production build (Static Export)..."
# Inject build hash for PWA cache busting and metadata
BUILD_HASH=$GIT_HASH npm run build

# 4. Finalization
echo ""
echo "✨ Build Complete!"
echo "📍 Location: ./out"
echo "🌐 Local Verification: npm run serve"
echo ""
