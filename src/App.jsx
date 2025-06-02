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
      warranty: '1',
      incVat: 'INCL VAT'
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
    if (printRef.current) {
      window.print();
    }
  };

  const ProductCard = ({ product, isPreview = false }) => (
    <div className={`bg-white rounded-lg border-2 border-gray-200 p-6 ${isPreview ? 'shadow-md' : ''} mb-4`}>
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Product Image */}
        <div className="w-full lg:w-32 h-24 lg:h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-200 flex-shrink-0">
          {product.image && product.image !== '/api/placeholder/150/100' ? (
            <img 
              src={product.image} 
              alt={product.model}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-400 text-sm text-center">
              <div className="text-2xl mb-1">📷</div>
              <div>No Image</div>
            </div>
          )}
        </div>
        
        {/* Product Details */}
        <div className="flex-1 min-w-0 w-full lg:w-auto">
          <h3 className="font-bold text-xl text-gray-900 mb-4 break-words">{product.model || 'Product Model'}</h3>
          
          <div className="space-y-3 text-sm">
            {categories[selectedCategory].fields.map(field => {
              if (field === 'price' || field === 'warranty') return null;
              
              const value = product.specs[field] || '';
              const label = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
              
              return value ? (
                <div key={field} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-gray-600 font-medium">• {label}:</span>
                  <span className="font-medium text-gray-800 break-words">{value}</span>
                </div>
              ) : null;
            })}
          </div>
        </div>
        
        {/* Price and Warranty */}
        <div className="w-full lg:w-auto text-center lg:text-right flex-shrink-0">
          <div className="flex flex-col items-center lg:items-end gap-4">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold">
              {product.warranty} YEAR{product.warranty !== '1' ? 'S' : ''} WARRANTY
            </div>
            
            <div className="bg-gray-800 text-white px-6 py-4 rounded-lg min-w-[140px]">
              <div className="text-2xl font-bold break-words">{product.price || 'R 0.00'}</div>
              <div className="text-xs text-red-400 font-bold mt-1">{product.incVat}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const PreviewSheet = () => (
    <div ref={printRef} className="bg-white min-h-screen print:min-h-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white p-6 sm:p-8 print:p-4">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
          <div className="w-full lg:w-auto">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">B | SHOCKED</h1>
            <div className="text-sm space-y-2">
              <div>• Prices are subject to change without prior notice.</div>
              <div>• {companyInfo.terms}</div>
            </div>
          </div>
          
          <div className="w-full lg:w-auto text-left lg:text-right">
            <div className="bg-blue-600 px-4 sm:px-6 py-3 rounded-lg transform -skew-x-12 inline-block">
              <h2 className="text-xl sm:text-2xl font-bold transform skew-x-12 break-words">{listTitle}</h2>
              <div className="text-sm transform skew-x-12 mt-2">
                <div>• {categories[selectedCategory].name}</div>
                <div>• Professional Grade</div>
                <div>• Quality Assured</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-4 sm:p-6 lg:p-8 print:p-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 print:gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} isPreview={true} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white p-4 sm:p-6 print:p-4 mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span>📞</span>
              <span className="break-words">{companyInfo.phone}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span>✉️</span>
              <span className="break-words">{companyInfo.email}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span>🌐</span>
              <span className="break-words">{companyInfo.website}</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm mb-2">Scan to place orders online:</div>
            <div className="w-16 h-16 bg-white rounded mt-2 flex items-center justify-center mx-auto">
              <div className="text-black text-xs">QR</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="p-4 sm:p-6 border-b">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">B SHOCKED Price List Generator</h1>
            <p className="text-gray-600">Create professional price sheets for solar installers</p>
          </div>
          
          <div className="p-4 sm:p-6">
            {/* Configuration Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Product Category</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setProducts([]);
                  }}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                >
                  {Object.entries(categories).map(([key, category]) => (
                    <option key={key} value={key}>{category.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">List Title</label>
                <input
                  type="text"
                  value={listTitle}
                  onChange={(e) => setListTitle(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="e.g., LUNATIC LITHIUMS"
                />
              </div>
            </div>

            {/* Product Management */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-xl font-semibold">Products ({products.length})</h3>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-base font-medium"
                >
                  <Eye size={16} />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
                <button
                  onClick={addProduct}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-base font-medium"
                >
                  <Plus size={16} />
                  Add Product
                </button>
              </div>
            </div>

            {/* Product Forms */}
            {products.length > 0 && (
              <div className="space-y-6 mb-8">
                {products.map(product => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4 sm:p-6">
                    <div className="flex justify-between items-start mb-6">
                      <h4 className="font-medium text-gray-900 text-lg">Product {products.indexOf(product) + 1}</h4>
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="sm:col-span-2 lg:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Product Image</label>
                        <div className="space-y-3">
                          <div className="w-full h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
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
                            className="w-full text-sm file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Model/Name</label>
                        <input
                          type="text"
                          value={product.model}
                          onChange={(e) => updateProduct(product.id, 'model', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                          placeholder="Enter model name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Price</label>
                        <input
                          type="text"
                          value={product.price}
                          onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                          placeholder="R 1,000.00"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Warranty (Years)</label>
                        <select
                          value={product.warranty}
                          onChange={(e) => updateProduct(product.id, 'warranty', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                        >
                          <option value="1">1 Year</option>
                          <option value="2">2 Years</option>
                          <option value="3">3 Years</option>
                          <option value="5">5 Years</option>
                          <option value="10">10 Years</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                      {categories[selectedCategory].fields.map(field => {
                        if (field === 'price' || field === 'warranty') return null;
                        
                        const label = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
                        
                        return (
                          <div key={field}>
                            <label className="block text-sm font-medium text-gray-700 mb-3">{label}</label>
                            <input
                              type="text"
                              value={product.specs[field] || ''}
                              onChange={(e) => updateProductSpec(product.id, field, e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
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
              <div className="flex justify-center">
                <button
                  onClick={exportToPDF}
                  className="flex items-center gap-3 px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-base"
                >
                  <Download size={20} />
                  Export Price List
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && products.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-4 sm:p-6 border-b">
              <h3 className="text-xl font-semibold">Preview</h3>
            </div>
            <PreviewSheet />
          </div>
        )}
      </div>
      
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          [ref="printRef"] * {
            visibility: visible;
          }
          [ref="printRef"] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default PriceListGenerator;