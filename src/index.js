import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
import { AppProvider } from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import App from './App';
import './styles/index.css';

// Get app configuration from environment or meta tags
const config = {
  apiKey: window.shopifyAppApiKey || import.meta.env.VITE_SHOPIFY_API_KEY,
  host: new URLSearchParams(window.location.search).get('host') || window.shopifyAppHost,
  forceRedirect: true
};

function ShopifyApp() {
  return (
    <AppBridgeProvider config={config}>
      <AppProvider i18n={en}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppProvider>
    </AppBridgeProvider>
  );
}

// Check if we're in Shopify admin embedded context
const isEmbedded = window.top !== window.self;

if (isEmbedded || config.host) {
  // We're in Shopify admin or have host parameter
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ShopifyApp />
    </React.StrictMode>
  );
} else {
  // Fallback for development or standalone mode
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <AppProvider i18n={en}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppProvider>
    </React.StrictMode>
  );
}

console.log('Shopify Price List Generator App loaded');
console.log('App Bridge Config:', config);
console.log('Embedded mode:', isEmbedded);
