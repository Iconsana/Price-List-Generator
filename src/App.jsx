import React, { useState, useRef } from 'react';
import { Download, Plus, Trash2, Edit3, Eye } from 'lucide-react';

const PriceListGenerator = () => {
  const [selectedCategory, setSelectedCategory] = useState('batteries');
  const [products, setProducts] = useState([]);
  const [companyInfo, setCompanyInfo] = useState({
    phone: '+27 11 568-7166',
    email: 'sales@bshockedelectrical.co.za',
    website: 'https://bshockedelectrical.co.za',
    terms: 'Payment terms are COD. T\'s & C\'s Apply.'
  });
  const [listTitle, setListTitle] = useState('LUNATIC LITHIUMS');
  const [bulletPoints, setBulletPoints] = useState({
    point1: 'Professional Grade',
    point2: 'Quality Assured', 
    point3: 'Fast Delivery'
  });
  const [showPreview, setShowPreview] = useState(true);
  
  const printRef = useRef();

  const categories = {
    batteries: {
      name: 'Batteries',
      color: '#00a8cc',
      fields: ['model', 'capacity', 'voltage', 'dimensions', 'warranty', 'price']
    },
    solar: {
      name: 'Solar Panels',
      color: '#ff6b35',
      fields: ['model', 'wattage', 'efficiency', 'dimensions', 'warranty', 'pricePerWatt', 'unitPrice']
    },
    inverters: {
      name: 'Inverters',
      color: '#4ecdc4',
      fields: ['model', 'power', 'inputVoltage', 'outputVoltage', 'efficiency', 'warranty', 'price']
    },
    mounting: {
      name: 'Mounting Systems',
      color: '#45b7d1',
      fields: ['model', 'material', 'suitableFor', 'dimensions', 'warranty', 'price']
    }
  };

  const addProduct = () => {
    const newProduct = {
      id: Date.now(),
      model: '',
      image: '/api/placeholder/150/100',
      specs: {},
      price: '',
      warranty: '0',
      incVat: 'INCL VAT',
      productUrl: ''
    };
    
    categories[selectedCategory].fields.forEach(field => {
      if (field !== 'price' && field !== 'warranty') {
        newProduct.specs[field] = '';
      }
    });
    
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

  const handleImageUpload = (id, file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateProduct(id, 'image', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const exportToPDF = () => {
    // Show only the preview sheet for printing
    const printContent = printRef.current;
    if (printContent) {
      // Hide everything else temporarily
      document.body.style.visibility = 'hidden';
      printContent.style.visibility = 'visible';
      printContent.style.position = 'absolute';
      printContent.style.left = '0';
      printContent.style.top = '0';
      printContent.style.width = '100%';
      
      // Trigger print dialog
      window.print();
      
      // Restore visibility after print
      setTimeout(() => {
        document.body.style.visibility = 'visible';
        printContent.style.position = 'static';
      }, 1000);
    }
  };

  const ProductCard = ({ product, isPreview = false }) => {
    const cardContent = (
      <div className={`bg-white rounded-xl border-2 border-gray-200 p-6 print-break-inside-avoid ${isPreview ? 'shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer' : ''} ${product.productUrl && isPreview ? 'hover:border-blue-400' : ''}`}>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Image Section - Now Square and Larger */}
          <div className="w-full sm:w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-200 flex-shrink-0">
            {product.image && product.image !== '/api/placeholder/150/100' ? (
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
          
          {/* Content Section */}
          <div className="flex-1 min-w-0 w-full">
            <h3 className="font-bold text-xl text-gray-900 mb-4">{product.model || 'Product Model'}</h3>
            
            <div className="space-y-2 text-sm">
              {categories[selectedCategory].fields.map(field => {
                if (field === 'price' || field === 'warranty') return null;
                
                const value = product.specs[field] || '';
                const label = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
                
                return value ? (
                  <div key={field} className="flex flex-wrap">
                    <span className="text-gray-600 font-medium">• {label}:</span>
                    <span className="ml-2 font-semibold text-gray-800">{value}</span>
                  </div>
                ) : null;
              })}
              
              {/* Show product URL if available */}
              {product.productUrl && isPreview && (
                <div className="flex flex-wrap mt-3">
                  <span className="text-blue-600 font-medium text-xs">🔗 Click anywhere to view details</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Price Section */}
          <div className="w-full sm:w-auto text-center sm:text-right flex-shrink-0">
            <div className="flex flex-col items-center sm:items-end gap-3">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md">
                {product.warranty} YEAR{product.warranty !== '1' ? 'S' : ''}
              </div>
              
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-3 rounded-xl shadow-lg">
                <div className="text-2xl font-bold">{product.price || 'R 0.00'}</div>
                <div className="text-xs text-red-400 font-bold mt-1">{product.incVat}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    // If it's a preview and has a URL, make it clickable
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
    <div ref={printRef} className="bg-white min-h-screen print:min-h-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white p-8 print:p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
          <div className="flex-1">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">B | SHOCKED</h1>
            <div className="text-sm lg:text-base space-y-2">
              <div>• Prices are subject to change without prior notice.</div>
              <div>• {companyInfo.terms}</div>
            </div>
          </div>
          
          <div className="w-full lg:w-auto text-center lg:text-right">
            <div className="bg-blue-600 px-8 py-4 rounded-xl transform lg:-skew-x-12 shadow-xl">
              <h2 className="text-2xl lg:text-3xl font-bold transform lg:skew-x-12">{listTitle}</h2>
              <div className="text-sm lg:text-base transform lg:skew-x-12 mt-2">
                <div>• {bulletPoints.point1}</div>
                <div>• {bulletPoints.point2}</div>
                <div>• {bulletPoints.point3}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-6 lg:p-10 print:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 print:gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} isPreview={true} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white p-6 lg:p-8 print:p-6 mt-8">
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
            <div className="text-sm mb-3">Scan to place orders online:</div>
            <div className="w-20 h-20 bg-white rounded-lg mx-auto flex items-center justify-center shadow-lg">
              <div className="text-black font-bold">QR</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 lg:p-8 max-w-7xl">
        <div className="bg-white rounded-xl shadow-xl mb-8">
          <div className="p-6 lg:p-8 border-b border-gray-200">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">B SHOCKED Price List Generator</h1>
            <p className="text-gray-600 text-lg">Create professional price sheets for solar installers</p>
          </div>
          
          <div className="p-6 lg:p-8">
            {/* Configuration Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Product Category</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setProducts([]);
                  }}
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                >
                  {Object.entries(categories).map(([key, category]) => (
                    <option key={key} value={key}>{category.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">List Title</label>
                <input
                  type="text"
                  value={listTitle}
                  onChange={(e) => setListTitle(e.target.value)}
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                  placeholder="e.g., LUNATIC LITHIUMS"
                />
              </div>
            </div>

            {/* Title Block Bullet Points */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customize Title Block Bullet Points</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Bullet Point 1</label>
                  <input
                    type="text"
                    value={bulletPoints.point1}
                    onChange={(e) => setBulletPoints({...bulletPoints, point1: e.target.value})}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., Professional Grade"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Bullet Point 2</label>
                  <input
                    type="text"
                    value={bulletPoints.point2}
                    onChange={(e) => setBulletPoints({...bulletPoints, point2: e.target.value})}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., Quality Assured"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Bullet Point 3</label>
                  <input
                    type="text"
                    value={bulletPoints.point3}
                    onChange={(e) => setBulletPoints({...bulletPoints, point3: e.target.value})}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., Fast Delivery"
                  />
                </div>
              </div>
            </div>

            {/* Product Management */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Products ({products.length})</h3>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-lg"
                >
                  <Eye size={20} />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
                <button
                  onClick={addProduct}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                >
                  <Plus size={20} />
                  Add Product
                </button>
              </div>
            </div>

            {/* Product Forms */}
            {products.length > 0 && (
              <div className="space-y-8 mb-8">
                {products.map(product => (
                  <div key={product.id} className="border-2 border-gray-200 rounded-xl p-6 lg:p-8 bg-gray-50">
                    <div className="flex justify-between items-start mb-6">
                      <h4 className="text-xl font-bold text-gray-900">Product {products.indexOf(product) + 1}</h4>
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    
                    {/* Basic Info Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Product Image</label>
                        <div className="space-y-3">
                          <div className="w-full h-32 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-blue-400 transition-colors">
                            {product.image && product.image !== '/api/placeholder/150/100' ? (
                              <img 
                                src={product.image} 
                                alt="Product preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-400 text-sm">No image</span>
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) handleImageUpload(product.id, file);
                            }}
                            className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Model/Name</label>
                        <input
                          type="text"
                          value={product.model}
                          onChange={(e) => updateProduct(product.id, 'model', e.target.value)}
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter model name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Price</label>
                        <input
                          type="text"
                          value={product.price}
                          onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="R 1,000.00"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Warranty</label>
                        <select
                          value={product.warranty}
                          onChange={(e) => updateProduct(product.id, 'warranty', e.target.value)}
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="0">No Warranty</option>
                          <option value="1">1 Year</option>
                          <option value="2">2 Years</option>
                          <option value="3">3 Years</option>
                          <option value="5">5 Years</option>
                          <option value="10">10 Years</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Product URL</label>
                        <input
                          type="url"
                          value={product.productUrl}
                          onChange={(e) => updateProduct(product.id, 'productUrl', e.target.value)}
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="https://example.com/product"
                        />
                      </div>
                    </div>
                    
                    {/* Specifications Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {categories[selectedCategory].fields.map(field => {
                        if (field === 'price' || field === 'warranty') return null;
                        
                        const label = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
                        
                        return (
                          <div key={field}>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">{label}</label>
                            <input
                              type="text"
                              value={product.specs[field] || ''}
                              onChange={(e) => updateProductSpec(product.id, field, e.target.value)}
                              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder={`Enter ${label.toLowerCase()}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Export Options */}
            {products.length > 0 && (
              <div className="text-center mt-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-900 mb-2">Export Instructions</h4>
                  <p className="text-blue-800 text-sm">
                    • Click "Export Price List" to open print dialog<br/>
                    • Choose "Save as PDF" or your preferred printer<br/>
                    • Products with URLs will be clickable when viewed digitally<br/>
                    • For best results, use A4 paper size
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
      
      <style jsx>{`
        @media print {
          @page {
            margin: 0.5in;
            size: A4;
          }
          
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          .no-print {
            display: none !important;
          }
          
          /* Ensure colors and gradients print */
          .bg-gradient-to-r,
          .bg-blue-600,
          .bg-gray-900,
          .bg-gray-800 {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          /* Better spacing for print */
          .print\\:gap-4 {
            gap: 1rem;
          }
          
          .print\\:p-4 {
            padding: 1rem;
          }
          
          .print\\:p-6 {
            padding: 1.5rem;
          }
          
          /* Ensure proper page breaks */
          .print-break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default PriceListGenerator;