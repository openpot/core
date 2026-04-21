#!/bin/bash

# Openpot Deployment Script
# Ensures the production build is permanently tagged with the current Git hash.

# 1. Parse arguments
PROD_MODE=false
for arg in "$@"; do
  if [ "$arg" == "--prod" ]; then
    PROD_MODE=true
  fi
done

# 2. Get the current short hash
GIT_HASH=$(git rev-parse --short HEAD 2>/dev/null)

if [ -z "$GIT_HASH" ]; then
  echo "⚠️  Warning: Could not retrieve Git hash. Using 'prod' as fallback."
  GIT_HASH="prod"
else
  echo "✅ Detected Build Hash: $GIT_HASH"
fi

# 3. Create a local hint (git-ignored)
echo "$GIT_HASH" > .build_version

# 4. Run the clean local build
echo "🚀 Starting clean production build..."
rm -rf .next out
BUILD_HASH=$GIT_HASH npm run build

echo ""
echo "✨ Local Build Complete!"
echo "📍 Local Build Location: ./out"
echo "🔖 Version Tag: $GIT_HASH"
echo "🌍 Production tracking link: https://openpot.co/version.json"

# 5. Production Propagation (Optional)
if [ "$PROD_MODE" = true ]; then
  echo ""
  echo "📡 Production Flag Detected: Triggering Remote Deployment..."
  
  # Optional Vercel Login Check (Pattern from root deploy.sh)
  read -p "🔐 Do you need to log in to Vercel first? (y/N): " LOGIN_CHOICE
  if [[ "$LOGIN_CHOICE" =~ ^[Yy]$ ]]; then
      echo "🔑 Opening Vercel login..."
      npx vercel login
  fi

  echo "📦 Initiating Vercel Production Deployment..."
  # Move to root where vercel.json/config lives
  cd ..
  npx vercel --prod || { echo "❌ Error: Vercel deployment failed."; cd core; exit 1; }
  # Return to core
  cd core
  
  echo ""
  echo "🎉 Production deployment successful!"
else
  echo ""
  echo "To serve locally: node scripts/serve-https.js"
fi
