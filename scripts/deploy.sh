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

# 1.5. Freeze hash for build engine
echo "$GIT_HASH" > .build_version

# 2. Run the clean build with explicit environment variable
echo "🚀 Starting clean production build..."
rm -rf .next out
BUILD_HASH=$GIT_HASH npm run build

echo ""
echo "✨ Build Complete!"
echo "📍 Local Build Location: ./out"
echo "🔖 Version Tag: $GIT_HASH"
echo "🌍 Production tracking link: https://openpot.co/version.json"
echo ""
echo "To serve locally: node scripts/serve-https.js"
