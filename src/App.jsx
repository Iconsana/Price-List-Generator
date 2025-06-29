import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppBridge } from '@shopify/app-bridge-react';
import { Redirect } from '@shopify/app-bridge/actions';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import { 
  Download, Plus, Trash2, Eye, EyeOff, Copy, Grid, List, Search, 
  ShoppingBag, Package, RefreshCw, Check, X, AlertCircle, Loader2,
  ExternalLink, FileText, Zap
} from 'lucide-react';

const ShopifyPriceListGenerator = () => {
  const app = useAppBridge();
  const fetch = useAuthenticatedFetch();
  
  // Shopify Data State
  const [shopInfo, setShopInfo] = useState(null);
  const [shopifyProducts, setShopifyProducts] = useState([]);
  const [shopifyCollections, setShopifyCollections] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [pagination, setPagination] = useState({
    next_page_info: null,
    prev_page_info: null,
    has_next: false,
    has_prev: false
  });

  // Filter State
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [filterMode, setFilterMode] = useState('all');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [searchQuery, setSearchQuery] = useState('');

  // App State
  const [products, setProducts] = useState([]);
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    phone: '',
    email: '',
    website: '',
    terms: 'Payment terms: Net 30. Terms & Conditions Apply.',
    tagline: '',
    logo: null
  });
  const [listTitle, setListTitle] = useState('PRODUCT CATALOG');
  const [bulletPoints, setBulletPoints] = useState({
    point1: 'Professional Grade',
    point2: 'Quality Assured', 
    point3: 'Fast Delivery'
  });
  const [showPreview, setShowPreview] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  
  const printRef = useRef();
  const logoInputRef = useRef();

  // Fetch shop info and initialize data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setInitialLoading(true);
        setError(null);

        // Fetch shop info
        const shopResponse = await fetch('/api/shop');
        if (!shopResponse.ok) throw new Error('Failed to fetch shop info');
        const shopData = await shopResponse.json();
        
        setShopInfo(shopData.shop);
        
        // Pre-fill company info from shop data
        setCompanyInfo(prev => ({
          ...prev,
          name: shopData.shop.name || prev.name,
          email: shopData.shop.email || prev.email,
          phone: shopData.shop.phone || prev.phone,
          website: `https://${shopData.shop.domain}` || prev.website,
          tagline: shopData.shop.shop_owner || prev.tagline
        }));

        // Fetch initial data
        await Promise.all([
          fetchProducts(),
          fetchCollections()
        ]);

      } catch (error) {
        console.error('Failed to initialize app:', error);
        setError(`Failed to initialize: ${error.message}`);
      } finally {
        setInitialLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Fetch products from Shopify API
  const fetchProducts = useCallback(async (pageInfo = null) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (pageInfo) params.append('page_info', pageInfo);
      
      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      
      setShopifyProducts(data.products);
      setPagination(data.pagination);
      
      // Extract unique product types and vendors
      const types = [...new Set(data.products.map(p => p.product_type).filter(Boolean))];
      const vendorList = [...new Set(data.products.map(p => p.vendor).filter(Boolean))];
      
      setProductTypes(types);
      setVendors(vendorList);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(`Failed to fetch products: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [fetch]);

  // Fetch collections
  const fetchCollections = useCallback(async () => {
    try {
      const response = await fetch('/api/collections');
      if (!response.ok) throw new Error('Failed to fetch collections');
      
      const data = await response.json();
      setShopifyCollections(data.collections);
      
    } catch (error) {
      console.error('Error fetching collections:', error);
      setError(`Failed to fetch collections: ${error.message}`);
    }
  }, [fetch]);

  // Search products
  const searchProducts = useCallback(async () => {
    if (!searchQuery.trim()) {
      await fetchProducts();
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        query: searchQuery,
        limit: '50'
      });

      if (selectedType) params.append('product_type', selectedType);
      if (selectedVendor) params.append('vendor', selectedVendor);

      const response = await fetch(`/api/products/search?${params}`);
      if (!response.ok) throw new Error('Failed to search products');
      
      const data = await response.json();
      setShopifyProducts(data.products);
      
    } catch (error) {
      console.error('Error searching products:', error);
      setError(`Search failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedType, selectedVendor, fetch, fetchProducts]);

  // Filter products based on current selection
  const getFilteredShopifyProducts = () => {
    let filtered = [...shopifyProducts];

    switch (filterMode) {
      case 'type':
        if (selectedType) {
          filtered = filtered.filter(product => product.product_type === selectedType);
        }
        break;
      case 'vendor':
        if (selectedVendor) {
          filtered = filtered.filter(product => product.vendor === selectedVendor);
        }
        break;
      case 'custom':
        if (priceRange.min || priceRange.max) {
          filtered = filtered.filter(product => {
            const price = parseFloat(product.variants[0]?.price || 0);
            const min = parseFloat(priceRange.min || 0);
            const max = parseFloat(priceRange.max || Infinity);
            return price >= min && price <= max;
          });
        }
        break;
    }

    return filtered;
  };

  // Convert Shopify product to internal format
  const convertShopifyProduct = (shopifyProduct, variantIndex = 0) => {
    const variant = shopifyProduct.variants[variantIndex] || shopifyProduct.variants[0];
    
    return {
      id: `shopify_${shopifyProduct.id}_${variant.id}`,
      model: `${shopifyProduct.title}${shopifyProduct.variants.length > 1 ? ` - ${variant.title}` : ''}`,
      image: shopifyProduct.images[0]?.src || null,
      specs: {
        sku: variant.sku || '',
        type: shopifyProduct.product_type || '',
        vendor: shopifyProduct.vendor || '',
        tags: shopifyProduct.tags || '',
        stock: variant.inventory_quantity || 0,
        weight: variant.weight ? `${variant.weight} ${variant.weight_unit}` : '',
        barcode: variant.barcode || '',
        description: shopifyProduct.body_html ? 
          shopifyProduct.body_html.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : ''
      },
      price: `R ${parseFloat(variant.price || 0).toFixed(2)}`,
      comparePrice: variant.compare_at_price ? 
        `R ${parseFloat(variant.compare_at_price).toFixed(2)}` : '',
      incVat: 'INCL VAT',
      productUrl: shopInfo ? `https://${shopInfo.domain}/products/${shopifyProduct.handle}` : '',
      shopifyData: {
        productId: shopifyProduct.id,
        variantId: variant.id,
        handle: shopifyProduct.handle,
        createdAt: shopifyProduct.created_at,
        updatedAt: shopifyProduct.updated_at,
        status: shopifyProduct.status
      }
    };
  };

  // Add selected Shopify products to price list
  const addSelectedProducts = () => {
    const newProducts = [];
    
    selectedProducts.forEach(productId => {
      const shopifyProduct = shopifyProducts.find(p => p.id.toString() === productId);
      if (shopifyProduct) {
        shopifyProduct.variants.forEach((variant, index) => {
          newProducts.push(convertShopifyProduct(shopifyProduct, index));
        });
      }
    });

    setProducts([...products, ...newProducts]);
    setSelectedProducts([]);
    
    // Show success message
    if (app) {
      app.dispatch(Redirect.create(app, {
        message: `Added ${newProducts.length} product(s) to your price list!`,
        kind: 'success'
      }));
    }
  };

  // Toggle product selection
  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId.toString())
        ? prev.filter(id => id !== productId.toString())
        : [...prev, productId.toString()]
    );
  };

  // Add products from collection
  const addFromCollection = async (collectionId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/collections/${collectionId}/products`);
      if (!response.ok) throw new Error('Failed to fetch collection products');
      
      const data = await response.json();
      const newProducts = [];
      
      data.products.forEach(shopifyProduct => {
        shopifyProduct.variants.forEach((variant, index) => {
          newProducts.push(convertShopifyProduct(shopifyProduct, index));
        });
      });

      setProducts([...products, ...newProducts]);
      
      const collection = shopifyCollections.find(c => c.id.toString() === collectionId);
      setError(null);
      
    } catch (error) {
      console.error('Error fetching collection products:', error);
      setError(`Error loading collection products: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Standard product management functions
  const addProduct = () => {
    const newProduct = {
      id: Date.now(),
      model: '',
      image: null,
      specs: {
        sku: '',
        type: '',
        vendor: '',
        description: ''
      },
      price: '',
      incVat: 'INCL VAT',
      productUrl: ''
    };
    
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id, field, value) => {
    setProducts(products.map(product => 
      product.id === id 
        ? { ...product, [field]: value }
        : product
    ));
  };

  const updateProductSpec = (id, spec, value) => {
    setProducts(products.map(product => 
      product.id === id 
        ? { ...product, specs: { ...product.specs, [spec]: value } }
        : product
    ));
  };

  const removeProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const duplicateProduct = (id) => {
    const productToDuplicate = products.find(p => p.id === id);
    if (productToDuplicate) {
      const newProduct = {
        ...productToDuplicate,
        id: Date.now(),
        model: productToDuplicate.model + ' (Copy)'
      };
      setProducts([...products, newProduct]);
    }
  };

  // Export to PDF
  const exportToPDF = async () => {
    try {
      // First try to generate PDF on backend
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products, companyInfo, listTitle, bulletPoints })
      });
      
      if (response.ok) {
        // For now, fall back to frontend PDF generation
        exportToPDFFrontend();
      }
    } catch (error) {
      console.error('Backend PDF generation failed, using frontend:', error);
      exportToPDFFrontend();
    }
  };

  const exportToPDFFrontend = () => {
    if (!printRef.current) {
      setShowPreview(true);
      setTimeout(() => {
        exportToPDFFrontend();
      }, 500);
      return;
    }

    const printWindow = window.open('', '_blank');
    const previewContent = printRef.current.outerHTML;
    
    const printDocument = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Price List - ${companyInfo.name}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; color: #111827; background: white; }
            @media print { 
              @page { margin: 0.5in; size: A4; } 
              body { -webkit-print-color-adjust: exact; color-adjust: exact; print-color-adjust: exact; } 
              .no-print { display: none !important; } 
            }
            .bg-white { background-color: #ffffff; }
            .bg-gray-50 { background-color: #f9fafb; }
            .bg-gray-100 { background-color: #f3f4f6; }
            .bg-gray-900 { background-color: #111827; }
            .bg-blue-600 { background-color: #2563eb; }
            .bg-blue-900 { background-color: #1e3a8a; }
            .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
            .from-gray-900 { --tw-gradient-from: #111827; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(17, 24, 39, 0)); }
            .to-blue-900 { --tw-gradient-to: #1e3a8a; }
            .text-white { color: #ffffff; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-800 { color: #1f2937; }
            .text-gray-900 { color: #111827; }
            .text-blue-600 { color: #2563eb; }
            .text-red-400 { color: #f87171; }
            .text-xs { font-size: 0.75rem; }
            .text-sm { font-size: 0.875rem; }
            .text-base { font-size: 1rem; }
            .text-lg { font-size: 1.125rem; }
            .text-xl { font-size: 1.25rem; }
            .text-2xl { font-size: 1.5rem; }
            .text-3xl { font-size: 1.875rem; }
            .text-4xl { font-size: 2.25rem; }
            .text-5xl { font-size: 3rem; }
            .font-medium { font-weight: 500; }
            .font-semibold { font-weight: 600; }
            .font-bold { font-weight: 700; }
            .p-2 { padding: 0.5rem; }
            .p-4 { padding: 1rem; }
            .p-6 { padding: 1.5rem; }
            .p-8 { padding: 2rem; }
            .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
            .px-8 { padding-left: 2rem; padding-right: 2rem; }
            .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
            .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-3 { margin-bottom: 0.75rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mt-1 { margin-top: 0.25rem; }
            .mt-2 { margin-top: 0.5rem; }
            .mt-3 { margin-top: 0.75rem; }
            .mt-8 { margin-top: 2rem; }
            .ml-2 { margin-left: 0.5rem; }
            .gap-2 { gap: 0.5rem; }
            .gap-3 { gap: 0.75rem; }
            .gap-4 { gap: 1rem; }
            .gap-6 { gap: 1.5rem; }
            .gap-8 { gap: 2rem; }
            .flex { display: flex; }
            .flex-col { flex-direction: column; }
            .flex-row { flex-direction: row; }
            .flex-1 { flex: 1 1 0%; }
            .flex-shrink-0 { flex-shrink: 0; }
            .items-start { align-items: flex-start; }
            .items-center { align-items: center; }
            .items-end { align-items: flex-end; }
            .justify-start { justify-content: flex-start; }
            .justify-center { justify-content: center; }
            .justify-between { justify-content: space-between; }
            .grid { display: grid; }
            .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .space-y-2 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.5rem; }
            .w-full { width: 100%; }
            .w-16 { width: 4rem; }
            .w-24 { width: 6rem; }
            .w-40 { width: 10rem; }
            .h-16 { height: 4rem; }
            .h-24 { height: 6rem; }
            .h-40 { height: 10rem; }
            .h-full { height: 100%; }
            .min-w-0 { min-width: 0px; }
            .min-h-screen { min-height: 100vh; }
            .rounded-lg { border-radius: 0.5rem; }
            .rounded-xl { border-radius: 0.75rem; }
            .border-2 { border-width: 2px; }
            .border-gray-200 { border-color: #e5e7eb; }
            .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
            .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
            .text-center { text-align: center; }
            .text-left { text-align: left; }
            .text-right { text-align: right; }
            .overflow-hidden { overflow: hidden; }
            .object-cover { object-fit: cover; }
            .object-contain { object-fit: contain; }
            .print-container { width: 100%; max-width: none; }
            @media (min-width: 1024px) {
              .lg\\:flex-row { flex-direction: row; }
              .lg\\:text-left { text-align: left; }
              .lg\\:text-right { text-align: right; }
              .lg\\:text-base { font-size: 1rem; }
              .lg\\:text-5xl { font-size: 3rem; }
              .lg\\:text-3xl { font-size: 1.875rem; }
              .lg\\:p-10 { padding: 2.5rem; }
              .lg\\:p-8 { padding: 2rem; }
              .lg\\:w-auto { width: auto; }
              .lg\\:justify-start { justify-content: flex-start; }
            }
            @media (min-width: 1280px) {
              .xl\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            }
          </style>
        </head>
        <body>
          ${previewContent}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              }, 500);
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(printDocument);
    printWindow.document.close();
  };

  const filteredProductsForPriceList = products.filter(product => 
    product.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    Object.values(product.specs).some(spec => 
      spec.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Loading state
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-900">Loading Shopify Store...</h2>
          <p className="text-gray-600">Connecting to your store and fetching data</p>
        </div>
      </div>
    );
  }

  const ProductCard = ({ product, isPreview = false }) => {
    const cardContent = (
      <div className={`bg-white rounded-xl border-2 border-gray-200 p-6 ${isPreview ? 'shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer' : ''} ${product.productUrl && isPreview ? 'hover:border-blue-400' : ''}`}>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-full sm:w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-200 flex-shrink-0">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.model}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400 text-sm text-center">
                <div className="text-3xl mb-2">📷</div>
                <div>No Image</div>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0 w-full">
            <h3 className="font-bold text-xl text-gray-900 mb-4">{product.model || 'Product Model'}</h3>
            
            <div className="space-y-2 text-sm">
              {Object.entries(product.specs).map(([key, value]) => {
                if (!value) return null;
                const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                return (
                  <div key={key} className="flex flex-wrap">
                    <span className="text-gray-600 font-medium">• {label}:</span>
                    <span className="ml-2 font-semibold text-gray-800">{value}</span>
                  </div>
                );
              })}
              
              {product.productUrl && isPreview && (
                <div className="flex flex-wrap mt-3">
                  <span className="text-blue-600 font-medium text-xs">🔗 Click anywhere to view details</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="w-full sm:w-auto text-center sm:text-right flex-shrink-0">
            <div className="flex flex-col items-center sm:items-end gap-3">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-3 rounded-xl shadow-lg">
                <div className="text-2xl font-bold">{product.price || 'R 0.00'}</div>
                {product.comparePrice && (
                  <div className="text-xs text-red-400 line-through">{product.comparePrice}</div>
                )}
                <div className="text-xs text-red-400 font-bold mt-1">{product.incVat}</div>
              </div>
              {product.shopifyData && (
                <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  From Shopify
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );

    if (isPreview && product.productUrl) {
      return (
        <a 
          href={product.productUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block transform hover:scale-[1.02] transition-transform duration-200"
        >
          {cardContent}
        </a>
      );
    }

    return cardContent;
  };

  const PreviewSheet = () => (
    <div ref={printRef} className="bg-white min-h-screen">
      <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white p-8">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              {companyInfo.logo && (
                <div className="w-16 h-16 bg-white rounded-lg p-2 flex items-center justify-center">
                  <img 
                    src={companyInfo.logo} 
                    alt={companyInfo.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <h1 className="text-4xl lg:text-5xl font-bold">{companyInfo.name}</h1>
            </div>
            <div className="text-sm lg:text-base space-y-2">
              <div>• {companyInfo.tagline}</div>
              <div>• Prices are subject to change without prior notice.</div>
              <div>• {companyInfo.terms}</div>
            </div>
          </div>
          
          <div className="w-full lg:w-auto text-center lg:text-right">
            <div className="bg-blue-600 px-8 py-4 rounded-xl shadow-xl">
              <h2 className="text-2xl lg:text-3xl font-bold">{listTitle}</h2>
              <div className="text-sm lg:text-base mt-2">
                <div>• {bulletPoints.point1}</div>
                <div>• {bulletPoints.point2}</div>
                <div>• {bulletPoints.point3}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-10">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {filteredProductsForPriceList.map(product => (
            <ProductCard key={product.id} product={product} isPreview={true} />
          ))}
        </div>
      </div>

      <div className="bg-gray-900 text-white p-6 lg:p-8 mt-8">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="space-y-2 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <span className="text-xl">📞</span>
              <span className="text-lg">{companyInfo.phone}</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <span className="text-xl">✉️</span>
              <span className="text-lg">{companyInfo.email}</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <span className="text-xl">🌐</span>
              <span className="text-lg">{companyInfo.website}</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm mb-3">Scan to visit our website:</div>
            <div className="w-24 h-24 bg-white rounded-lg mx-auto flex items-center justify-center shadow-lg p-2">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(companyInfo.website)}`}
                alt="QR Code"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 lg:p-8 max-w-7xl">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
              <div className="text-sm text-red-800">
                <p className="font-semibold">Error</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-xl mb-8">
          <div className="p-6 lg:p-8 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-3">
                  {shopInfo ? `${shopInfo.name} - Price List Generator` : 'Shopify Price List Generator'}
                </h1>
                <p className="text-gray-600 text-base lg:text-lg">
                  {shopInfo ? 
                    `Connected to ${shopInfo.domain} • ${shopifyProducts.length} products available` :
                    'Loading your Shopify store...'
                  }
                </p>
              </div>
              <div className="flex items-center gap-4">
                {shopInfo ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                    <Check size={20} />
                    <span className="font-medium">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg">
                    <Loader2 size={20} className="animate-spin" />
                    <span className="font-medium">Loading...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shopify Product Selection */}
          {shopInfo && (
            <div className="p-6 lg:p-8 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Select Products from Your Store</h3>
              
              {/* Store Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{shopifyProducts.length}</div>
                  <div className="text-sm text-blue-800">Products Available</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{shopifyCollections.length}</div>
                  <div className="text-sm text-green-800">Collections</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">{productTypes.length}</div>
                  <div className="text-sm text-purple-800">Product Types</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600">{vendors.length}</div>
                  <div className="text-sm text-orange-800">Vendors</div>
                </div>
              </div>

              {/* Filter Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Filter Mode</label>
                  <select
                    value={filterMode}
                    onChange={(e) => setFilterMode(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Products</option>
                    <option value="type">By Product Type</option>
                    <option value="vendor">By Vendor</option>
                    <option value="custom">Custom Filter</option>
                  </select>
                </div>

                {filterMode === 'type' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Product Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Types</option>
                      {productTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                )}

                {filterMode === 'vendor' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Vendor</label>
                    <select
                      value={selectedVendor}
                      onChange={(e) => setSelectedVendor(e.target.value)}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Vendors</option>
                      {vendors.map(vendor => (
                        <option key={vendor} value={vendor}>{vendor}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Search Products</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button
                      onClick={searchProducts}
                      disabled={loading}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Custom Filters */}
              {filterMode === 'custom' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price Range</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                        placeholder="Min Price"
                        className="flex-1 p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                        placeholder="Max Price"
                        className="flex-1 p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Collection Actions */}
              {shopifyCollections.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="text-sm font-semibold text-gray-700">Quick Actions:</span>
                  {shopifyCollections.slice(0, 5).map(collection => (
                    <button
                      key={collection.id}
                      onClick={() => addFromCollection(collection.id.toString())}
                      disabled={loading}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-sm disabled:opacity-50"
                    >
                      Add all "{collection.title}"
                    </button>
                  ))}
                </div>
              )}

              {/* Selection Controls */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">
                    {selectedProducts.length} selected
                  </span>
                  {selectedProducts.length > 0 && (
                    <button
                      onClick={addSelectedProducts}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <Plus size={16} />
                      Add to Price List
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    const filteredProducts = getFilteredShopifyProducts();
                    const allIds = filteredProducts.map(p => p.id.toString());
                    setSelectedProducts(allIds);
                  }}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  Select All Filtered ({getFilteredShopifyProducts().length})
                </button>
                
                <button
                  onClick={() => setSelectedProducts([])}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Clear Selection
                </button>

                <button
                  onClick={() => fetchProducts()}
                  disabled={loading}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm disabled:opacity-50"
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>

              {/* Pagination Controls */}
              {(pagination.has_prev || pagination.has_next) && (
                <div className="flex justify-between items-center mb-6">
                  <button
                    onClick={() => fetchProducts(pagination.prev_page_info)}
                    disabled={!pagination.has_prev || loading}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous Page
                  </button>
                  
                  <span className="text-sm text-gray-600">
                    Showing {shopifyProducts.length} products
                  </span>
                  
                  <button
                    onClick={() => fetchProducts(pagination.next_page_info)}
                    disabled={!pagination.has_next || loading}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Page
                  </button>
                </div>
              )}

              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {getFilteredShopifyProducts().map(product => (
                  <div
                    key={product.id}
                    onClick={() => toggleProductSelection(product.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedProducts.includes(product.id.toString())
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.images && product.images[0] ? (
                          <img 
                            src={product.images[0].src} 
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="text-gray-400" size={20} />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{product.title}</h4>
                        <p className="text-sm text-gray-600">{product.product_type}</p>
                        <p className="text-sm text-gray-500">{product.vendor}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-green-600">
                            R {parseFloat(product.variants[0]?.price || 0).toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      
                      {selectedProducts.includes(product.id.toString()) && (
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center">
                            <Check size={16} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {getFilteredShopifyProducts().length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  <Package size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No products found matching your criteria</p>
                  <button
                    onClick={() => {
                      setFilterMode('all');
                      setSelectedType('');
                      setSelectedVendor('');
                      setSearchQuery('');
                      fetchProducts();
                    }}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              )}

              {loading && (
                <div className="text-center py-8">
                  <Loader2 className="animate-spin mx-auto mb-4" size={48} />
                  <p className="text-gray-600">Loading products...</p>
                </div>
              )}
            </div>
          )}
          
          <div className="p-6 lg:p-8">
            {/* Company Information Section */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Company Information</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Company Name</label>
                  <input
                    type="text"
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                    placeholder="Your Company Name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Company Logo</label>
                  <div className="flex gap-4 items-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg border-2 border-gray-300 flex items-center justify-center overflow-hidden">
                      {companyInfo.logo ? (
                        <img 
                          src={companyInfo.logo} 
                          alt="Company logo"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-gray-400 text-center">
                          <div className="text-2xl mb-1">🏢</div>
                          <div className="text-xs">No Logo</div>
                        </div>
                      )}
                    </div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            setCompanyInfo({...companyInfo, logo: e.target.result});
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Upload Logo
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Phone Number</label>
                  <input
                    type="text"
                    value={companyInfo.phone}
                    onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="+27 11 123 4567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Email Address</label>
                  <input
                    type="email"
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="sales@yourcompany.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Website</label>
                  <input
                    type="url"
                    value={companyInfo.website}
                    onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="https://yourcompany.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Company Tagline</label>
                  <input
                    type="text"
                    value={companyInfo.tagline}
                    onChange={(e) => setCompanyInfo({...companyInfo, tagline: e.target.value})}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., Quality Products, Exceptional Service"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Terms & Conditions</label>
                  <input
                    type="text"
                    value={companyInfo.terms}
                    onChange={(e) => setCompanyInfo({...companyInfo, terms: e.target.value})}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., Payment terms: Net 30. T&C's Apply."
                  />
                </div>
              </div>
            </div>

            {/* List Title and Bullet Points */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">List Title</label>
                <input
                  type="text"
                  value={listTitle}
                  onChange={(e) => setListTitle(e.target.value)}
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                  placeholder="e.g., PRODUCT CATALOG"
                />
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Title Block Bullet Points</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={bulletPoints.point1}
                    onChange={(e) => setBulletPoints({...bulletPoints, point1: e.target.value})}
                    className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., Professional Grade"
                  />
                  <input
                    type="text"
                    value={bulletPoints.point2}
                    onChange={(e) => setBulletPoints({...bulletPoints, point2: e.target.value})}
                    className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., Quality Assured"
                  />
                  <input
                    type="text"
                    value={bulletPoints.point3}
                    onChange={(e) => setBulletPoints({...bulletPoints, point3: e.target.value})}
                    className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., Fast Delivery"
                  />
                </div>
              </div>
            </div>

            {/* Product Management */}
            <div className="mb-8">
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                    Price List Products ({filteredProductsForPriceList.length} of {products.length})
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 ${showPreview ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 hover:bg-gray-700'} text-white rounded-lg transition-colors font-medium`}
                    >
                      {showPreview ? <EyeOff size={20} /> : <Eye size={20} />}
                      {showPreview ? 'Hide' : 'Show'} Preview
                    </button>
                    
                    <button
                      onClick={addProduct}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Plus size={20} />
                      Add Manual Product
                    </button>
                  </div>
                </div>
                
                {/* Search */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search price list products..."
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-3 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      <Grid size={20} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-3 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      <List size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Product List/Grid */}
              {filteredProductsForPriceList.length > 0 && (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
                  {filteredProductsForPriceList.map((product, index) => (
                    <div key={product.id} className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-xl font-bold text-gray-900">
                          {product.model || `Product ${index + 1}`}
                        </h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => duplicateProduct(product.id)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Duplicate"
                          >
                            <Copy size={18} />
                          </button>
                          <button
                            onClick={() => removeProduct(product.id)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Product Image</label>
                          <div className="space-y-2">
                            <div className="w-full h-24 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-blue-400 transition-colors">
                              {product.image ? (
                                <img 
                                  src={product.image} 
                                  alt="Product preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-gray-400 text-sm">No image</span>
                              )}
                            </div>
                            {!product.shopifyData && (
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                      updateProduct(product.id, 'image', e.target.result);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="w-full text-xs file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              />
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Model/Name</label>
                          <input
                            type="text"
                            value={product.model}
                            onChange={(e) => updateProduct(product.id, 'model', e.target.value)}
                            className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter model name"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Price</label>
                          <input
                            type="text"
                            value={product.price}
                            onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                            className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="R 1,000.00"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Product URL</label>
                          <input
                            type="url"
                            value={product.productUrl}
                            onChange={(e) => updateProduct(product.id, 'productUrl', e.target.value)}
                            className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://example.com/product"
                            readOnly={!!product.shopifyData}
                          />
                        </div>
                        
                        {Object.entries(product.specs).map(([key, value]) => (
                          <div key={key}>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                            </label>
                            <input
                              type="text"
                              value={value || ''}
                              onChange={(e) => updateProductSpec(product.id, key, e.target.value)}
                              className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder={`Enter ${key.toLowerCase()}`}
                              readOnly={!!product.shopifyData && key !== 'description'}
                            />
                          </div>
                        ))}
                      </div>
                      
                      {product.shopifyData && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 text-green-800">
                            <ShoppingBag size={16} />
                            <span className="text-sm font-medium">Imported from Shopify</span>
                            {product.productUrl && (
                              <a 
                                href={product.productUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="ml-auto text-green-600 hover:text-green-800"
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                          <p className="text-xs text-green-600 mt-1">
                            Product ID: {product.shopifyData.productId} • Variant ID: {product.shopifyData.variantId}
                          </p>
                          <p className="text-xs text-green-600">
                            Status: {product.shopifyData.status} • Handle: {product.shopifyData.handle}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {products.length === 0 && (
                <div className="text-center py-16 bg-gray-50 rounded-xl">
                  <Zap size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No products yet!</h3>
                  <p className="text-gray-500 mb-6">
                    {shopInfo ? 
                      'Select products from your Shopify store above, or add products manually.' :
                      'Connect to Shopify to import products, or add products manually.'
                    }
                  </p>
                  <div className="flex gap-4 justify-center">
                    {shopInfo ? (
                      <button
                        onClick={() => {
                          const firstFewProducts = shopifyProducts.slice(0, 5).map(p => p.id.toString());
                          setSelectedProducts(firstFewProducts);
                          addSelectedProducts();
                        }}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Add First 5 Products
                      </button>
                    ) : null}
                    <button
                      onClick={addProduct}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                      Add Manual Product
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Export Options */}
            {products.length > 0 && (
              <div className="text-center mt-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-900 mb-2">Export Instructions</h4>
                  <p className="text-blue-800 text-sm">
                    • Click "Export Price List" to open a new window with only your price list<br/>
                    • The new window will automatically trigger the print dialog<br/>
                    • Choose "Save as PDF" from the print destination<br/>
                    • Products with URLs will be clickable when viewed digitally<br/>
                    • For best results, use A4 paper size and check "More settings" → "Background graphics"
                  </p>
                </div>
                <button
                  onClick={exportToPDF}
                  className="flex items-center gap-3 px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl mx-auto"
                >
                  <Download size={24} />
                  Export Price List to PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && products.length > 0 && (
          <div className="bg-white rounded-xl shadow-xl">
            <div className="p-6 lg:p-8 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">Preview</h3>
            </div>
            <PreviewSheet />
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopifyPriceListGenerator;
