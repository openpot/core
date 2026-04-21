#!/bin/bash

# Openpot Deployment Script
# Ensures the production build is permanently tagged with the current Git hash.

# 1. Get the current short hash
GIT_HASH=$(git rev-parse --short HEAD 2>/dev/null)

if [ -z "$GIT_HASH" ]; then
  echo "⚠️  Warning: Could not retrieve Git hash. Using 'prod' as fallback."
  GIT_HASH="prod"
else
  echo "✅ Detected Build Hash: $GIT_HASH"
fi

# 2. Run the clean build with explicit environment variable
echo "🚀 Starting clean production build..."
rm -rf .next out
BUILD_HASH=$GIT_HASH npm run build

# 3. Completion message
echo ""
echo "✨ Build Complete!"
echo "📍 Location: ./out"
echo "🔖 Version Tag: $GIT_HASH"
echo ""
echo "To serve this build locally, run: node scripts/serve-https.js"
