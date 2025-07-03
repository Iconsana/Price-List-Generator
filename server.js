import express from 'express';
import { createRequestHandler } from '@remix-run/express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Trust proxy for Render
app.set('trust proxy', 1);

// Serve static files
app.use('/build', express.static(join(__dirname, 'build'), {
  maxAge: '1y',
  immutable: true
}));

app.use(express.static(join(__dirname, 'public'), {
  maxAge: '1h'
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Load the build
let build;
try {
  const buildPath = join(__dirname, 'build', 'index.js');
  build = await import(buildPath);
} catch (error) {
  console.error('Failed to load build:', error);
  process.exit(1);
}

// Handle all other routes with Remix
app.all('*', createRequestHandler({
  build: build,
  mode: process.env.NODE_ENV || 'development',
  getLoadContext(req, res) {
    return {
      // Add any context you need
    };
  }
}));

const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
  console.log(`✅ Server ready at http://${host}:${port}`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📦 Build loaded successfully`);
});