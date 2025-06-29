import express from 'express';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// ES modules dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV !== 'production';

const app = express();

// Security and performance middleware
app.use(helmet({
  contentSecurityPolicy: false, // Shopify embedded apps need this disabled
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cookieParser());

// CORS configuration for Shopify embedded apps
app.use(cors({
  origin: ['https://admin.shopify.com', process.env.SHOPIFY_APP_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Shopify-Topic', 'X-Shopify-Hmac-Sha256', 'X-Shopify-Shop-Domain']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic authentication middleware for now
const authenticateShopify = (req, res, next) => {
  // For now, we'll skip authentication and just proceed
  // In a real app, this would validate the Shopify session
  req.shopify = {
    shop: process.env.DEV_STORE_URL || 'cycle1-test.myshopify.com'
  };
  next();
};

// Mock Shopify API calls for development
const mockShopifyAPI = async (endpoint, shop) => {
  // This is a simplified mock - in production you'd use real Shopify API
  console.log(`Mock API call to ${endpoint} for shop ${shop}`);
  
  if (endpoint.includes('products')) {
    return {
      products: [
        {
          id: 1,
          title: "Sample Product 1",
          product_type: "Electronics",
          vendor: "Sample Vendor",
          tags: "sample, test",
          variants: [{
            id: 1,
            price: "99.99",
            sku: "SP001",
            inventory_quantity: 10,
            weight: 1.5,
            weight_unit: "kg"
          }],
          images: [{
            src: "https://via.placeholder.com/300x300/007bff/ffffff?text=Product+1"
          }],
          handle: "sample-product-1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: "active"
        },
        {
          id: 2,
          title: "Sample Product 2", 
          product_type: "Clothing",
          vendor: "Another Vendor",
          tags: "sample, clothing",
          variants: [{
            id: 2,
            price: "49.99",
            sku: "SP002",
            inventory_quantity: 25,
            weight: 0.5,
            weight_unit: "kg"
          }],
          images: [{
            src: "https://via.placeholder.com/300x300/28a745/ffffff?text=Product+2"
          }],
          handle: "sample-product-2",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: "active"
        }
      ]
    };
  }
  
  if (endpoint.includes('collections')) {
    return {
      collections: [
        {
          id: 1,
          title: "Sample Collection",
          handle: "sample-collection"
        }
      ]
    };
  }
  
  if (endpoint.includes('shop')) {
    return {
      shop: {
        name: "Sample Store",
        domain: shop,
        email: "test@example.com",
        phone: "+1234567890"
      }
    };
  }
  
  return {};
};

// API Routes
app.get('/api/products', authenticateShopify, async (req, res) => {
  try {
    const { limit = 250, page_info } = req.query;
    
    const data = await mockShopifyAPI('products', req.shopify.shop);
    
    res.json({
      products: data.products,
      pagination: {
        next_page_info: null,
        prev_page_info: null,
        has_next: false,
        has_prev: false
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      message: error.message
    });
  }
});

app.get('/api/collections', authenticateShopify, async (req, res) => {
  try {
    const data = await mockShopifyAPI('collections', req.shopify.shop);
    res.json({ collections: data.collections });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ 
      error: 'Failed to fetch collections',
      message: error.message
    });
  }
});

app.get('/api/collections/:id/products', authenticateShopify, async (req, res) => {
  try {
    const data = await mockShopifyAPI('products', req.shopify.shop);
    res.json({ products: data.products });
  } catch (error) {
    console.error('Error fetching collection products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch collection products',
      message: error.message
    });
  }
});

app.get('/api/products/search', authenticateShopify, async (req, res) => {
  try {
    const data = await mockShopifyAPI('products', req.shopify.shop);
    res.json({ products: data.products });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ 
      error: 'Failed to search products',
      message: error.message
    });
  }
});

app.get('/api/shop', authenticateShopify, async (req, res) => {
  try {
    const data = await mockShopifyAPI('shop', req.shopify.shop);
    res.json({ shop: data.shop });
  } catch (error) {
    console.error('Error fetching shop info:', error);
    res.status(500).json({ 
      error: 'Failed to fetch shop info',
      message: error.message
    });
  }
});

app.post('/api/generate-pdf', async (req, res) => {
  try {
    const { products, companyInfo, listTitle, bulletPoints } = req.body;
    
    res.json({ 
      success: true,
      message: 'PDF generation initiated',
      data: { products, companyInfo, listTitle, bulletPoints }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ 
      error: 'Failed to generate PDF',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static frontend files
if (!isDevelopment) {
  app.use(express.static(join(__dirname, '../dist')));
  
  // Catch-all handler for React Router
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist', 'index.html'));
  });
}

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: isDevelopment ? error.message : 'Something went wrong',
    ...(isDevelopment && { stack: error.stack })
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Shopify Price List Generator running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 App URL: ${process.env.SHOPIFY_APP_URL || `http://localhost:${PORT}`}`);
  console.log(`🏪 Shop: ${process.env.DEV_STORE_URL || 'cycle1-test.myshopify.com'}`);
});

export default app;
