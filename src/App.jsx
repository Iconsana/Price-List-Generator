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
    <div className={`bg-white rounded-lg border-2 border-gray-200 p-4 ${isPreview ? 'shadow-md' : ''}`}>
      <div className="flex items-start gap-4">
        <div className="w-24 h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden border">
          {product.image && product.image !== '/api/placeholder/150/100' ? (
            <img 
              src={product.image} 
              alt={product.model}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-400 text-xs text-center">
              <div>📷</div>
              <div>No Image</div>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-gray-900 mb-2">{product.model || 'Product Model'}</h3>
          
          <div className="space-y-1 text-sm">
            {categories[selectedCategory].fields.map(field => {
              if (field === 'price' || field === 'warranty') return null;
              
              const value = product.specs[field] || '';
              const label = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
              
              return value ? (
                <div key={field} className="flex">
                  <span className="text-gray-600">• {label}:</span>
                  <span className="ml-1 font-medium">{value}</span>
                </div>
              ) : null;
            })}
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              {product.warranty} YEAR{product.warranty !== '1' ? 'S' : ''}
            </div>
          </div>
          
          <div className="bg-gray-800 text-white px-4 py-2 rounded-lg">
            <div className="text-2xl font-bold">{product.price || 'R 0.00'}</div>
            <div className="text-xs text-red-400 font-bold">{product.incVat}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const PreviewSheet = () => (
    <div ref={printRef} className="bg-white min-h-screen print:min-h-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white p-8 print:p-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">B | SHOCKED</h1>
            <div className="text-sm space-y-1">
              <div>• Prices are subject to change without prior notice.</div>
              <div>• {companyInfo.terms}</div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="bg-blue-600 px-6 py-3 rounded-lg transform -skew-x-12">
              <h2 className="text-2xl font-bold transform skew-x-12">{listTitle}</h2>
              <div className="text-sm transform skew-x-12">
                <div>• {categories[selectedCategory].name}</div>
                <div>• Professional Grade</div>
                <div>• Quality Assured</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-8 print:p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} isPreview={true} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white p-6 print:p-4 mt-8">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span>📞</span>
              <span>{companyInfo.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✉️</span>
              <span>{companyInfo.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🌐</span>
              <span>{companyInfo.website}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm">Scan to place orders online:</div>
            <div className="w-16 h-16 bg-white rounded mt-2 flex items-center justify-center">
              <div className="text-black text-xs">QR</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="p-6 border-b">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">B SHOCKED Price List Generator</h1>
            <p className="text-gray-600">Create professional price sheets for solar installers</p>
          </div>
          
          <div className="p-6">
            {/* Configuration Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Category</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setProducts([]);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(categories).map(([key, category]) => (
                    <option key={key} value={key}>{category.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">List Title</label>
                <input
                  type="text"
                  value={listTitle}
                  onChange={(e) => setListTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., LUNATIC LITHIUMS"
                />
              </div>
            </div>

            {/* Product Management */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Products ({products.length})</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Eye size={16} />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
                <button
                  onClick={addProduct}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  Add Product
                </button>
              </div>
            </div>

            {/* Product Forms */}
            {products.length > 0 && (
              <div className="space-y-4 mb-6">
                {products.map(product => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-gray-900">Product {products.indexOf(product) + 1}</h4>
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                        <div className="space-y-2">
                          <div className="w-full h-20 bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                            {product.image && product.image !== '/api/placeholder/150/100' ? (
                              <img 
                                src={product.image} 
                                alt="Product preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-400 text-xs">No image</span>
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) handleImageUpload(product.id, file);
                            }}
                            className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Model/Name</label>
                        <input
                          type="text"
                          value={product.model}
                          onChange={(e) => updateProduct(product.id, 'model', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                        <input
                          type="text"
                          value={product.price}
                          onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="R 1,000.00"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Warranty (Years)</label>
                        <select
                          value={product.warranty}
                          onChange={(e) => updateProduct(product.id, 'warranty', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="1">1 Year</option>
                          <option value="2">2 Years</option>
                          <option value="3">3 Years</option>
                          <option value="5">5 Years</option>
                          <option value="10">10 Years</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {categories[selectedCategory].fields.map(field => {
                        if (field === 'price' || field === 'warranty') return null;
                        
                        const label = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
                        
                        return (
                          <div key={field}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                            <input
                              type="text"
                              value={product.specs[field] || ''}
                              onChange={(e) => updateProductSpec(product.id, field, e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
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
            <div className="p-4 border-b">
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