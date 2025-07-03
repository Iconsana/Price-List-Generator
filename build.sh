#!/bin/bash

# Render build script for Shopify Price List Generator
set -e

echo "🚀 Starting Render build process..."

# Install dependencies
echo "📦 Installing dependencies..."
if [ -f package-lock.json ]; then
    npm ci
else
    npm install
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Build the application
echo "🏗️ Building application..."
npm run build

# Run database migrations
echo "🗄️ Running database migrations..."
# Reset migration state for PostgreSQL
npx prisma migrate reset --force --skip-generate
# Push schema directly to database
npx prisma db push --skip-generate

echo "✅ Build process completed successfully!"
echo "🔍 Verifying build output..."
ls -la build/

echo "📊 Build statistics:"
echo "- Build size: $(du -sh build | cut -f1)"
echo "- Node modules: $(du -sh node_modules | cut -f1)"
echo "- Total project: $(du -sh . | cut -f1)"
