import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Download, Plus, Trash2, Eye, EyeOff, Copy, Grid, List, Search, 
  ShoppingBag, Package, RefreshCw, Check, X, AlertCircle, Loader2,
  ExternalLink, Zap
} from 'lucide-react';

const PriceListGenerator = () => {
  // App State
  const [shopifyProducts, setShopifyProducts] = useState([]);
  const [shopifyCollections, setShopifyCollections] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shopInfo, setShopInfo] = useState(null);

  // Filter State
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Product Management
  const [products, setProducts] = useState([]);
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Sample Store',
    phone: '+27 11 123 4567',
    email: 'sales@samplestore.com',
    website: 'https://samplestore.com',
    terms: 'Payment terms: Net 30. Terms & Conditions Apply.',
    tagline: 'Quality Products, Exceptional Service',
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

  // Simple fetch function
  const fetchAPI = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      console.error('API fetch error:', error);
      throw error;
    }
  };

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setInitialLoading(true);
        setError(null);

        // Try to fetch from our backend
        try {
          const shopResponse = await fetchAPI('/api/shop');
          const shopData = await shopResponse.json();
          setShopInfo(shopData.shop);
          
          // Update company info
          setCompanyInfo(prev => ({
            ...prev,
            name: shopData.shop.name || prev.name,
            email: shopData.shop.email || prev.email,
            phone: shopData.shop.phone || prev.phone,
            website: `https://${shopData.shop.domain}` || prev.website
          }));

          await fetchProducts();
          await fetchCollections();
        } catch (error) {
          console.log('Using demo mode - backend not available');
          // Create demo data
          setShopInfo({
            name: 'Demo Store',
            domain: 'demo-store.myshopify.com',
            email: 'demo@store.com',
            phone: '+27 11 123 4567'
          });
          
          // Demo products
          setShopifyProducts([
            {
              id: 1,
              title: "Premium Solar Panel 300W",
              product_type: "Solar Equipment",
              vendor: "SolarTech",
              tags: "solar, renewable, energy",
              variants: [{
                id: 1,
                price: "2999.99",
                sku: "SP300W",
                inventory_quantity: 15
              }],
              images: [{
                src: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=300&h=300&fit=crop"
              }],
              handle: "premium-solar-panel-300w",
              status: "active"
            },
            {
              id: 2,
              title: "Lithium Battery 100Ah",
              product_type: "Battery",
              vendor: "PowerMax",
              tags: "battery, lithium, storage",
              variants: [{
                id: 2,
                price: "8999.99",
                sku: "LB100",
                inventory_quantity: 8
              }],
              images: [{
                src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop"
              }],
              handle: "lithium-battery-100ah",
              status: "active"
            },
            {
              id: 3,
              title: "MPPT Charge Controller 60A",
              product_type: "Electronics",
              vendor: "ElectroTech",
              tags: "controller, mppt, solar",
              variants: [{
                id: 3,
                price: "1599.99",
                sku: "MPPT60",
                inventory_quantity: 12
              }],
              images: [{
                src: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop"
              }],
              handle: "mppt-charge-controller-60a",
              status: "active"
            }
          ]);

          setShopifyCollections([
            { id: 1, title: "Solar Equipment", handle: "solar-equipment" },
            { id: 2, title: "Batteries", handle: "batteries" },
            { id: 3, title: "Electronics", handle: "electronics" }
          ]);

          setProductTypes(["Solar Equipment", "Battery", "Electronics"]);
          setVendors(["SolarTech", "PowerMax", "ElectroTech"]);
        }

      } catch (error) {
        console.error('Failed to initialize app:', error);
        setError(`Failed to initialize: ${error.message}`);
      } finally {
        setInitialLoading(false);
      }
    };

    initializeApp();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetchAPI('/api/products');
      const data = await response.json();
      setShopifyProducts(data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const response = await fetchAPI('/api/collections');
      const data = await response.json();
      setShopifyCollections(data.collections);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  // Convert product to internal format
  const convertShopifyProduct = (shopifyProduct, variantIndex = 0) => {
    const variant = shopifyProduct.variants[variantIndex] || shopifyProduct.variants[0];
    
    return {
      id: `product_${shopifyProduct.id}_${variant.id}`,
      model: `${shopifyProduct.title}${shopifyProduct.variants.length > 1 ? ` - ${variant.title}` : ''}`,
      image: shopifyProduct.images[0]?.src || null,
      specs: {
        sku: variant.sku || '',
        type: shopifyProduct.product_type || '',
        vendor: shopifyProduct.vendor || '',
        tags: shopifyProduct.tags || '',
        stock: variant.inventory_quantity || 0,
        description: `High-quality ${shopifyProduct.product_type?.toLowerCase() || 'product'} from ${shopifyProduct.vendor || 'trusted supplier'}`
      },
      price: `R ${parseFloat(variant.price || 0).toFixed(2)}`,
      incVat: 'INCL VAT',
      productUrl: shopInfo ? `https://${shopInfo.domain}/products/${shopifyProduct.handle}` : '',
      shopifyData: {
        productId: shopifyProduct.id,
        variantId: variant.id,
        handle: shopifyProduct.handle,
        status: shopifyProduct.status
      }
    };
  };

  // Add selected products to price list
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
    alert(`Added ${newProducts.length} product(s) to your price list!`);
  };

  // Toggle product selection
  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId.toString())
        ? prev.filter(id => id !== productId.toString())
        : [...prev, productId.toString()]
    );
  };

  // Product management functions
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
  const exportToPDF = () => {
    if (!printRef.current) {
      setShowPreview(true);
      setTimeout(() => {
        exportToPDF();
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
            }
            .bg-white { background-color: #ffffff; }
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
            .flex-1 { flex: 1 1 0%; }
            .flex-shrink-0 { flex-shrink: 0; }
            .items-start { align-items: flex-start; }
            .items-center { align-items: center; }
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
          <h2 className="text-xl font-semibold text-gray-900">Loading Price List Generator...</h2>
          <p className="text-gray-600">Setting up your professional price list tool</p>
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
                <div className="text-xs text-red-400 font-bold mt-1">{product.incVat}</div>
              </div>
              {product.shopifyData && (
                <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  From Store
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
                  {shopInfo ? `${shopInfo.name} - Price List Generator` : 'Professional Price List Generator'}
                </h1>
                <p className="text-gray-600 text-base lg:text-lg">
                  Create professional price lists with ease • {shopifyProducts.length} products available
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                  <Check size={20} />
                  <span className="font-medium">Ready to Use</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Selection */}
          <div className="p-6 lg:p-8 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Select Products for Your Price List</h3>
            
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
                <div className="text-2xl font-bold text-purple-600
