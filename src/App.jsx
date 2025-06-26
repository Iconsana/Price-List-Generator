import React, { useState, useRef, useEffect } from ‘react’;
import { Download, Plus, Trash2, Upload, Save, FileText, Zap, Eye, EyeOff, Copy, Grid, List, Search, Filter, ChevronDown, ChevronRight, ShoppingBag, Tags, Package, DollarSign, Star, Layers, RefreshCw, Check, X, AlertCircle } from ‘lucide-react’;

const ShopifyPriceListGenerator = () => {
// Shopify Connection State
const [shopifyConnected, setShopifyConnected] = useState(false);
const [shopifyStore, setShopifyStore] = useState(’’);
const [shopifyToken, setShopifyToken] = useState(’’);
const [connecting, setConnecting] = useState(false);

// Shopify Data State
const [shopifyProducts, setShopifyProducts] = useState([]);
const [shopifyCollections, setShopifyCollections] = useState([]);
const [productTypes, setProductTypes] = useState([]);
const [vendors, setVendors] = useState([]);
const [loading, setLoading] = useState(false);

// Filter State
const [selectedProducts, setSelectedProducts] = useState([]);
const [filterMode, setFilterMode] = useState(‘all’); // ‘all’, ‘collection’, ‘type’, ‘vendor’, ‘custom’
const [selectedCollection, setSelectedCollection] = useState(’’);
const [selectedType, setSelectedType] = useState(’’);
const [selectedVendor, setSelectedVendor] = useState(’’);
const [priceRange, setPriceRange] = useState({ min: ‘’, max: ‘’ });
const [selectedTags, setSelectedTags] = useState([]);
const [searchQuery, setSearchQuery] = useState(’’);

// Existing state from original component
const [selectedCategory, setSelectedCategory] = useState(‘batteries’);
const [products, setProducts] = useState([]);
const [companyInfo, setCompanyInfo] = useState({
name: ‘Your Company Name’,
phone: ‘+1 234-567-8900’,
email: ‘sales@yourcompany.com’,
website: ‘https://yourcompany.com’,
terms: ‘Payment terms: Net 30. Terms & Conditions Apply.’,
tagline: ‘Your Company Tagline’,
logo: null
});
const [listTitle, setListTitle] = useState(‘PRODUCT CATALOG’);
const [bulletPoints, setBulletPoints] = useState({
point1: ‘Professional Grade’,
point2: ‘Quality Assured’,
point3: ‘Fast Delivery’
});
const [showPreview, setShowPreview] = useState(false);
const [savedTemplates, setSavedTemplates] = useState([]);
const [viewMode, setViewMode] = useState(‘grid’); // grid or list
const [showBulkEdit, setShowBulkEdit] = useState(false);
const [bulkEditData, setBulkEditData] = useState(’’);
const [showShopifyPanel, setShowShopifyPanel] = useState(false);

const printRef = useRef();
const fileInputRef = useRef();
const logoInputRef = useRef();

const categories = {
batteries: {
name: ‘Batteries’,
color: ‘#00a8cc’,
fields: [‘model’, ‘capacity’, ‘voltage’, ‘dimensions’, ‘price’]
},
solar: {
name: ‘Solar Panels’,
color: ‘#ff6b35’,
fields: [‘model’, ‘wattage’, ‘efficiency’, ‘dimensions’, ‘pricePerWatt’, ‘unitPrice’]
},
inverters: {
name: ‘Inverters’,
color: ‘#4ecdc4’,
fields: [‘model’, ‘power’, ‘inputVoltage’, ‘outputVoltage’, ‘efficiency’, ‘price’]
},
mounting: {
name: ‘Mounting Systems’,
color: ‘#45b7d1’,
fields: [‘model’, ‘material’, ‘suitableFor’, ‘dimensions’, ‘price’]
}
};

// Mock Shopify API functions (replace with real API calls)
const connectToShopify = async () => {
setConnecting(true);
try {
// Simulate API connection
await new Promise(resolve => setTimeout(resolve, 2000));

```
  // Mock successful connection
  setShopifyConnected(true);
  
  // Load mock data
  const mockProducts = [
    {
      id: 8765432109876,
      title: "Lithium Battery 100Ah 12V",
      handle: "lithium-battery-100ah-12v",
      product_type: "Battery",
      vendor: "PowerTech",
      tags: "lithium, 100ah, 12v, battery, solar",
      variants: [{
        id: 45678901234567,
        title: "Default Title",
        price: "1299.00",
        compare_at_price: "1499.00",
        sku: "LITH-100AH-12V",
        inventory_quantity: 25
      }],
      images: [{
        id: 34567890123456,
        src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
      }],
      collection_ids: [12345678901234]
    },
    {
      id: 8765432109877,
      title: "Solar Panel 300W Monocrystalline",
      handle: "solar-panel-300w-mono",
      product_type: "Solar Panel",
      vendor: "SolarMax",
      tags: "solar, panel, 300w, monocrystalline",
      variants: [{
        id: 45678901234568,
        title: "Default Title",
        price: "299.00",
        compare_at_price: "399.00",
        sku: "SOLAR-300W-MONO",
        inventory_quantity: 50
      }],
      images: [{
        id: 34567890123457,
        src: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400"
      }],
      collection_ids: [12345678901235]
    },
    {
      id: 8765432109878,
      title: "Pure Sine Wave Inverter 2000W",
      handle: "pure-sine-wave-inverter-2000w",
      product_type: "Inverter",
      vendor: "InverTech",
      tags: "inverter, 2000w, pure sine wave, 12v, 24v",
      variants: [{
        id: 45678901234569,
        title: "12V Version",
        price: "599.00",
        compare_at_price: "699.00",
        sku: "INV-2000W-12V",
        inventory_quantity: 15
      }, {
        id: 45678901234570,
        title: "24V Version",
        price: "649.00",
        compare_at_price: "749.00",
        sku: "INV-2000W-24V",
        inventory_quantity: 12
      }],
      images: [{
        id: 34567890123458,
        src: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400"
      }],
      collection_ids: [12345678901236]
    }
  ];

  const mockCollections = [
    { id: 12345678901234, title: "Solar Batteries", handle: "solar-batteries", products_count: 15 },
    { id: 12345678901235, title: "Solar Panels", handle: "solar-panels", products_count: 25 },
    { id: 12345678901236, title: "Power Inverters", handle: "power-inverters", products_count: 18 }
  ];

  setShopifyProducts(mockProducts);
  setShopifyCollections(mockCollections);
  setProductTypes([...new Set(mockProducts.map(p => p.product_type))]);
  setVendors([...new Set(mockProducts.map(p => p.vendor))]);
  
  alert('Successfully connected to Shopify store!');
} catch (error) {
  alert('Failed to connect to Shopify. Please check your credentials.');
}
setConnecting(false);
```

};

// Filter products based on current selection
const getFilteredShopifyProducts = () => {
let filtered = […shopifyProducts];

```
// Apply search query
if (searchQuery) {
  filtered = filtered.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.product_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.tags?.toLowerCase().includes(searchQuery.toLowerCase())
  );
}

// Apply filters based on mode
switch (filterMode) {
  case 'collection':
    if (selectedCollection) {
      filtered = filtered.filter(product => 
        product.collection_ids?.includes(parseInt(selectedCollection))
      );
    }
    break;
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
    // Apply price range
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
```

};

// Convert Shopify product to internal format
const convertShopifyProduct = (shopifyProduct, variantIndex = 0) => {
const variant = shopifyProduct.variants[variantIndex] || shopifyProduct.variants[0];

```
return {
  id: `shopify_${shopifyProduct.id}_${variant.id}`,
  model: `${shopifyProduct.title}${shopifyProduct.variants.length > 1 ? ` - ${variant.title}` : ''}`,
  image: shopifyProduct.images[0]?.src || null,
  specs: {
    sku: variant.sku || '',
    type: shopifyProduct.product_type || '',
    vendor: shopifyProduct.vendor || '',
    tags: shopifyProduct.tags || '',
    stock: variant.inventory_quantity || 0
  },
  price: `R ${parseFloat(variant.price || 0).toFixed(2)}`,
  comparePrice: variant.compare_at_price ? `R ${parseFloat(variant.compare_at_price).toFixed(2)}` : '',
  incVat: 'INCL VAT',
  productUrl: `https://${shopifyStore}.myshopify.com/products/${shopifyProduct.handle}`,
  shopifyData: {
    productId: shopifyProduct.id,
    variantId: variant.id,
    handle: shopifyProduct.handle
  }
};
```

};

// Add selected Shopify products to price list
const addSelectedProducts = () => {
const newProducts = [];

```
selectedProducts.forEach(productId => {
  const shopifyProduct = shopifyProducts.find(p => p.id.toString() === productId);
  if (shopifyProduct) {
    // Add all variants as separate products
    shopifyProduct.variants.forEach((variant, index) => {
      newProducts.push(convertShopifyProduct(shopifyProduct, index));
    });
  }
});

setProducts([...products, ...newProducts]);
setSelectedProducts([]);
alert(`Added ${newProducts.length} product(s) to your price list!`);
```

};

// Toggle product selection
const toggleProductSelection = (productId) => {
setSelectedProducts(prev =>
prev.includes(productId.toString())
? prev.filter(id => id !== productId.toString())
: […prev, productId.toString()]
);
};

// Select all filtered products
const selectAllFiltered = () => {
const filteredProducts = getFilteredShopifyProducts();
const allIds = filteredProducts.map(p => p.id.toString());
setSelectedProducts(allIds);
};

// Clear all selections
const clearAllSelections = () => {
setSelectedProducts([]);
};

// Add products from collection
const addFromCollection = (collectionId) => {
const collectionProducts = shopifyProducts.filter(p =>
p.collection_ids?.includes(parseInt(collectionId))
);

```
const newProducts = [];
collectionProducts.forEach(shopifyProduct => {
  shopifyProduct.variants.forEach((variant, index) => {
    newProducts.push(convertShopifyProduct(shopifyProduct, index));
  });
});

setProducts([...products, ...newProducts]);

const collection = shopifyCollections.find(c => c.id.toString() === collectionId);
alert(`Added ${newProducts.length} product(s) from "${collection?.title}" collection!`);
```

};

// Existing functions from original component
const addProduct = () => {
const newProduct = {
id: Date.now(),
model: ‘’,
image: null,
specs: {},
price: ‘’,
incVat: ‘INCL VAT’,
productUrl: ‘’
};

```
categories[selectedCategory].fields.forEach(field => {
  if (field !== 'price') {
    newProduct.specs[field] = '';
  }
});

setProducts([...products, newProduct]);
```

};

const updateProduct = (id, field, value) => {
setProducts(products.map(product =>
product.id === id
? { …product, [field]: value }
: product
));
};

const updateProductSpec = (id, spec, value) => {
setProducts(products.map(product =>
product.id === id
? { …product, specs: { …product.specs, [spec]: value } }
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
…productToDuplicate,
id: Date.now(),
model: productToDuplicate.model + ’ (Copy)’
};
setProducts([…products, newProduct]);
}
};

const exportToPDF = () => {
if (!printRef.current) {
setShowPreview(true);
setTimeout(() => {
exportToPDF();
}, 500);
return;
}

```
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
        @media print { @page { margin: 0.5in; size: A4; } body { -webkit-print-color-adjust: exact; color-adjust: exact; print-color-adjust: exact; } .no-print { display: none !important; } }
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
```

};

const filteredProducts = products.filter(product =>
product.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
Object.values(product.specs).some(spec =>
spec.toString().toLowerCase().includes(searchQuery.toLowerCase())
)
);

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

```
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
```

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

```
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
      {filteredProducts.map(product => (
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
```

);

return (
<div className="min-h-screen bg-gray-50">
<div className="container mx-auto p-4 lg:p-8 max-w-7xl">
<div className="bg-white rounded-xl shadow-xl mb-8">
<div className="p-6 lg:p-8 border-b border-gray-200">
<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
<div>
<h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-3">Shopify Price List Generator</h1>
<p className="text-gray-600 text-base lg:text-lg">Connect your Shopify store and create professional price lists</p>
</div>
<div className="flex items-center gap-4">
{shopifyConnected ? (
<div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
<Check size={20} />
<span className="font-medium">Connected to {shopifyStore}</span>
</div>
) : (
<div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg">
<X size={20} />
<span className="font-medium">Not Connected</span>
</div>
)}
<button
onClick={() => setShowShopifyPanel(!showShopifyPanel)}
className=“flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors”
>
<ShoppingBag size={20} />
Shopify
</button>
</div>
</div>
</div>

```
      {/* Shopify Connection Panel */}
      {showShopifyPanel && (
        <div className="p-6 lg:p-8 bg-blue-50 border-b border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Shopify Connection</h3>
          
          {!shopifyConnected ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Store URL</label>
                  <input
                    type="text"
                    value={shopifyStore}
                    onChange={(e) => setShopifyStore(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your-store-name"
                  />
                  <p className="text-xs text-gray-500 mt-1">Just the store name, not the full URL</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Private App Password</label>
                  <input
                    type="password"
                    value={shopifyToken}
                    onChange={(e) => setShopifyToken(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="shppa_..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Get this from your Shopify Admin → Apps → Private apps</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={connectToShopify}
                  disabled={connecting || !shopifyStore}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {connecting ? <RefreshCw size={20} className="animate-spin" /> : <ShoppingBag size={20} />}
                  {connecting ? 'Connecting...' : 'Connect to Shopify'}
                </button>
                
                <button
                  onClick={() => setShowShopifyPanel(false)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
              
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Demo Mode Available</p>
                    <p>Click "Connect to Shopify" without entering credentials to try the demo with sample products.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Connected to <strong>{shopifyStore}.myshopify.com</strong>
                  </p>
                  <p className="text-xs text-gray-500">
                    {shopifyProducts.length} products • {shopifyCollections.length} collections
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShopifyConnected(false);
                    setShopifyProducts([]);
                    setShopifyCollections([]);
                    setProductTypes([]);
                    setVendors([]);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Disconnect
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-blue-600">{shopifyProducts.length}</div>
                  <div className="text-sm text-gray-600">Products</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-green-600">{shopifyCollections.length}</div>
                  <div className="text-sm text-gray-600">Collections</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-purple-600">{productTypes.length}</div>
                  <div className="text-sm text-gray-600">Product Types</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-orange-600">{vendors.length}</div>
                  <div className="text-sm text-gray-600">Vendors</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Shopify Product Selection */}
      {shopifyConnected && (
        <div className="p-6 lg:p-8 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Select Products from Shopify</h3>
          
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
                <option value="collection">By Collection</option>
                <option value="type">By Product Type</option>
                <option value="vendor">By Vendor</option>
                <option value="custom">Custom Filter</option>
              </select>
            </div>

            {filterMode === 'collection' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Collection</label>
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Collection</option>
                  {shopifyCollections.map(collection => (
                    <option key={collection.id} value={collection.id}>
                      {collection.title} ({collection.products_count})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {filterMode === 'type' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Type</option>
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
                  <option value="">Select Vendor</option>
                  {vendors.map(vendor => (
                    <option key={vendor} value={vendor}>{vendor}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search Products</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, type, vendor..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
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
                    placeholder="Min"
                    className="flex-1 p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                    placeholder="Max"
                    className="flex-1 p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quick Collection Actions */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-sm font-semibold text-gray-700">Quick Actions:</span>
            {shopifyCollections.map(collection => (
              <button
                key={collection.id}
                onClick={() => addFromCollection(collection.id.toString())}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-sm"
              >
                Add all "{collection.title}"
              </button>
            ))}
          </div>

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
              onClick={selectAllFiltered}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm"
            >
              Select All Filtered
            </button>
            
            <button
              onClick={clearAllSelections}
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Clear Selection
            </button>
          </div>

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
                    {product.images[0] ? (
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

          {getFilteredShopifyProducts().length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No products found matching your criteria</p>
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
                placeholder="+1 234-567-8900"
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
                Price List Products ({filteredProducts.length} of {products.length})
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
          {filteredProducts.length > 0 && (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
              {filteredProducts.map((product, index) => (
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
                        />
                      </div>
                    ))}
                  </div>
                  
                  {product.shopifyData && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <ShoppingBag size={16} />
                        <span className="text-sm font-medium">Imported from Shopify</span>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        Product ID: {product.shopifyData.productId} • Variant ID: {product.shopifyData.variantId}
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
                {shopifyConnected ? 
                  'Select products from your Shopify store above, or add products manually.' :
                  'Connect to Shopify to import products, or add products manually.'
                }
              </p>
              <div className="flex gap-4 justify-center">
                {shopifyConnected ? (
                  <button
                    onClick={() => setShowShopifyPanel(true)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Select from Shopify
                  </button>
                ) : (
                  <button
                    onClick={() => setShowShopifyPanel(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Connect to Shopify
                  </button>
                )}
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
```

);
};

export default ShopifyPriceListGenerator;