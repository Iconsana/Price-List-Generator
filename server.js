import express from 'express';
import { createRequestHandler } from '@remix-run/express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Trust proxy for Render
app.set('trust proxy', 1);

// Serve static files from the build/client directory
app.use('/build', express.static(join(__dirname, 'build', 'client'), {
  maxAge: '1y',
  immutable: true
}));

// Serve other static files
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

// Load the Remix build
let build;
try {
  // Import the server build
  build = await import('./build/server/index.js');
} catch (error) {
  console.error('Failed to load Remix build:', error);
  
  // Try alternative path
  try {
    build = await import('./build/index.js');
  } catch (fallbackError) {
    console.error('Failed to load build from fallback path:', fallbackError);
    console.error('Available files in build directory:');
    
    try {
      const fs = await import('fs');
      const buildContents = fs.readdirSync(join(__dirname, 'build'));
      console.log('Build directory contents:', buildContents);
      
      // Check if there's a server directory
      if (buildContents.includes('server')) {
        const serverContents = fs.readdirSync(join(__dirname, 'build', 'server'));
        console.log('Server directory contents:', serverContents);
      }
    } catch (fsError) {
      console.error('Could not read build directory:', fsError);
    }
    
    process.exit(1);
  }
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
