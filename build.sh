#!/bin/bash

# Render build script for Shopify Price List Generator
set -e

echo "🚀 Starting Render build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Build the application
echo "🏗️ Building application..."
npm run build

echo "✅ Build process completed successfully!"
echo "🔍 Verifying build output..."
ls -la build/

echo "📊 Build statistics:"
echo "- Build size: $(du -sh build | cut -f1)"
echo "- Node modules: $(du -sh node_modules | cut -f1)"
echo "- Total project: $(du -sh . | cut -f1)"
