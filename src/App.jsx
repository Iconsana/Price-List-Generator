import React, { useState, useRef, useEffect } from 'react';
import { Download, Plus, Trash2, Upload, Save, FileText, Zap, Eye, EyeOff, Copy, Grid, List, Search, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import Papa from 'papaparse';

const PriceListGenerator = () => {
  const [selectedCategory, setSelectedCategory] = useState('batteries');
  const [products, setProducts] = useState([]);
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Your Company Name',
    phone: '+1 234-567-8900',
    email: 'sales@yourcompany.com',
    website: 'https://yourcompany.com',
    terms: 'Payment terms: Net 30. Terms & Conditions Apply.',
    tagline: 'Your Company Tagline',
    logo: null
  });
  const [listTitle, setListTitle] = useState('PRODUCT CATALOG');
  const [bulletPoints, setBulletPoints] = useState({
    point1: 'Professional Grade',
    point2: 'Quality Assured', 
    point3: 'Fast Delivery'
  });
  const [showPreview, setShowPreview] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [bulkEditData, setBulkEditData] = useState('');
  
  const printRef = useRef();
  const fileInputRef = useRef();

  const categories = {
    batteries: {
      name: 'Batteries',
      color: '#00a8cc',
      fields: ['model', 'capacity', 'voltage', 'dimensions', 'price']
    },
    solar: {
      name: 'Solar Panels',
      color: '#ff6b35',
      fields: ['model', 'wattage', 'efficiency', 'dimensions', 'pricePerWatt', 'unitPrice']
    },
    inverters: {
      name: 'Inverters',
      color: '#4ecdc4',
      fields: ['model', 'power', 'inputVoltage', 'outputVoltage', 'efficiency', 'price']
    },
    mounting: {
      name: 'Mounting Systems',
      color: '#45b7d1',
      fields: ['model', 'material', 'suitableFor', 'dimensions', 'price']
    }
  };

  // Load saved data on mount
  useEffect(() => {
    const saved = localStorage.getItem('priceListTemplates');
    if (saved) {
      setSavedTemplates(JSON.parse(saved));
    }
    
    // Load autosave if exists
    const autosave = localStorage.getItem('priceListAutosave');
    if (autosave) {
      const data = JSON.parse(autosave);
      setProducts(data.products || []);
      setSelectedCategory(data.category || 'batteries');
      setListTitle(data.listTitle || 'LUNATIC LITHIUMS');
      setBulletPoints(data.bulletPoints || bulletPoints);
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      localStorage.setItem('priceListAutosave', JSON.stringify({
        products,
        category: selectedCategory,
        listTitle,
        bulletPoints,
        timestamp: new Date().toISOString()
      }));
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [products, selectedCategory, listTitle, bulletPoints]);

  // Parse uploaded files (PDF text extraction would require additional library)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.name.split('.').pop().toLowerCase();

    if (fileType === 'csv') {
      Papa.parse(file, {
        complete: (results) => {
          const data = results.data;
          if (data.length > 0) {
            // Auto-detect headers and map to products
            const headers = data[0];
            const importedProducts = data.slice(1).map((row, index) => {
              const product = {
                id: Date.now() + index,
                model: '',
                image: '/api/placeholder/150/100',
                specs: {},
                price: '',
                incVat: 'INCL VAT',
                productUrl: ''
              };

              // Smart mapping based on header names
              headers.forEach((header, idx) => {
                const value = row[idx];
                const headerLower = header.toLowerCase();
                
                if (headerLower.includes('model') || headerLower.includes('name')) {
                  product.model = value;
                } else if (headerLower.includes('price')) {
                  product.price = value;
                } else if (headerLower.includes('url') || headerLower.includes('link')) {
                  product.productUrl = value;
                } else {
                  // Map to specs
                  product.specs[header] = value;
                }
              });

              return product;
            });

            setProducts([...products, ...importedProducts]);
            alert(`Successfully imported ${importedProducts.length} products!`);
          }
        },
        header: false
      });
    } else if (fileType === 'json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (Array.isArray(data)) {
            const importedProducts = data.map((item, index) => ({
              id: Date.now() + index,
              model: item.model || item.name || '',
              image: item.image || '/api/placeholder/150/100',
              specs: item.specs || {},
              price: item.price || '',
              incVat: item.incVat || 'INCL VAT',
              productUrl: item.productUrl || item.url || ''
            }));
            setProducts([...products, ...importedProducts]);
            alert(`Successfully imported ${importedProducts.length} products!`);
          }
        } catch (error) {
          alert('Error parsing JSON file');
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a CSV or JSON file. PDF parsing coming soon!');
    }
  };

  // Bulk edit functionality
  const handleBulkEdit = () => {
    try {
      const rows = bulkEditData.trim().split('\n');
      const importedProducts = rows.map((row, index) => {
        const cols = row.split('\t'); // Tab-separated values
        return {
          id: Date.now() + index,
          model: cols[0] || '',
          price: cols[1] || '',
          specs: {
            capacity: cols[2] || '',
            voltage: cols[3] || '',
            dimensions: cols[4] || ''
          },
          image: '/api/placeholder/150/100',
          incVat: 'INCL VAT',
          productUrl: cols[5] || ''
        };
      });
      
      setProducts([...products, ...importedProducts]);
      setBulkEditData('');
      setShowBulkEdit(false);
      alert(`Successfully imported ${importedProducts.length} products!`);
    } catch (error) {
      alert('Error parsing bulk data. Please use tab-separated values.');
    }
  };

  // Save template functionality
  const saveTemplate = () => {
    const templateName = prompt('Enter template name:');
    if (templateName) {
      const template = {
        id: Date.now(),
        name: templateName,
        category: selectedCategory,
        products,
        listTitle,
        bulletPoints,
        savedAt: new Date().toISOString()
      };
      
      const updated = [...savedTemplates, template];
      setSavedTemplates(updated);
      localStorage.setItem('priceListTemplates', JSON.stringify(updated));
      alert('Template saved successfully!');
    }
  };

  // Load template
  const loadTemplate = (template) => {
    setSelectedCategory(template.category);
    setProducts(template.products);
    setListTitle(template.listTitle);
    setBulletPoints(template.bulletPoints);
    alert(`Loaded template: ${template.name}`);
  };

  // Export to various formats
  const exportData = (format) => {
    let data = '';
    let filename = `price-list-${Date.now()}`;
    let mimeType = '';

    if (format === 'csv') {
      // Create CSV
      const headers = ['Model', 'Price', ...Object.keys(products[0]?.specs || {})];
      data = headers.join(',') + '\n';
      products.forEach(product => {
        const row = [
          product.model,
          product.price,
          ...Object.values(product.specs)
        ];
        data += row.map(cell => `"${cell}"`).join(',') + '\n';
      });
      filename += '.csv';
      mimeType = 'text/csv';
    } else if (format === 'json') {
      data = JSON.stringify(products, null, 2);
      filename += '.json';
      mimeType = 'application/json';
    }

    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addProduct = () => {
    const newProduct = {
      id: Date.now(),
      model: '',
      image: '/api/placeholder/150/100',
      specs: {},
      price: '',
      incVat: 'INCL VAT',
      productUrl: ''
    };
    
    categories[selectedCategory].fields.forEach(field => {
      if (field !== 'price') {
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

  const exportToPDF = () => {
    if (showPreview && printRef.current) {
      window.print();
    } else {
      // If preview is hidden, show it temporarily for printing
      setShowPreview(true);
      setTimeout(() => {
        window.print();
      }, 100);
    }
  };

  // Filter products based on search
  const filteredProducts = products.filter(product => 
    product.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    Object.values(product.specs).some(spec => 
      spec.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const ProductCard = ({ product, isPreview = false }) => {
    const cardContent = (
      <div className={`bg-white rounded-xl border-2 border-gray-200 p-6 print-break-inside-avoid ${isPreview ? 'shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer' : ''} ${product.productUrl && isPreview ? 'hover:border-blue-400' : ''}`}>
        <div className="flex flex-col sm:flex-row items-start gap-6">
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
          
          <div className="flex-1 min-w-0 w-full">
            <h3 className="font-bold text-xl text-gray-900 mb-4">{product.model || 'Product Model'}</h3>
            
            <div className="space-y-2 text-sm">
              {categories[selectedCategory].fields.map(field => {
                if (field === 'price') return null;
                
                const value = product.specs[field] || '';
                const label = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
                
                return value ? (
                  <div key={field} className="flex flex-wrap">
                    <span className="text-gray-600 font-medium">• {label}:</span>
                    <span className="ml-2 font-semibold text-gray-800">{value}</span>
                  </div>
                ) : null;
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
    <div ref={printRef} className="bg-white min-h-screen print:min-h-0">
      <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white p-8 print:p-6">
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

      <div className="p-6 lg:p-10 print:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 print:gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} isPreview={true} />
          ))}
        </div>
      </div>

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
        {/* Auto-save indicator */}
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2 z-50">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          Auto-saving...
        </div>
        <div className="bg-white rounded-xl shadow-xl mb-8">
          <div className="p-6 lg:p-8 border-b border-gray-200">
            <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-3">Universal Price List Generator</h1>
            <p className="text-gray-600 text-base lg:text-lg">Create professional price sheets for any business</p>
          </div>
          
          <div className="p-6 lg:p-8">
            {/* Quick Actions Bar */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                  <Upload size={20} />
                  Import Data
                </button>
                
                <button
                  onClick={() => setShowBulkEdit(!showBulkEdit)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors font-medium"
                >
                  <Grid size={20} />
                  Bulk Edit
                </button>
                
                <button
                  onClick={saveTemplate}
                  disabled={products.length === 0}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors font-medium disabled:opacity-50"
                >
                  <Save size={20} />
                  Save Template
                </button>
                
                <div className="relative group">
                  <button
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors font-medium w-full"
                  >
                    <Download size={20} />
                    Export As
                    <ChevronDown size={16} />
                  </button>
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 w-full">
                    <button
                      onClick={() => exportData('csv')}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-50 rounded-t-lg"
                    >
                      Export as CSV
                    </button>
                    <button
                      onClick={() => exportData('json')}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-50"
                    >
                      Export as JSON
                    </button>
                    <button
                      onClick={exportToPDF}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-50 rounded-b-lg"
                    >
                      Export as PDF
                    </button>
                  </div>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Saved Templates */}
            {savedTemplates.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Saved Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {savedTemplates.map(template => (
                    <div key={template.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {template.products.length} products • {new Date(template.savedAt).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadTemplate(template)}
                          className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => {
                            setSavedTemplates(savedTemplates.filter(t => t.id !== template.id));
                            localStorage.setItem('priceListTemplates', JSON.stringify(savedTemplates.filter(t => t.id !== template.id)));
                          }}
                          className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bulk Edit Section */}
            {showBulkEdit && (
              <div className="mb-8 bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Bulk Import - Paste Your Data</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Paste tab-separated data from Excel/Google Sheets. Format: Model [TAB] Price [TAB] Capacity [TAB] Voltage [TAB] Dimensions [TAB] URL
                </p>
                <textarea
                  value={bulkEditData}
                  onChange={(e) => setBulkEditData(e.target.value)}
                  className="w-full h-40 p-4 border-2 border-gray-300 rounded-lg font-mono text-sm"
                  placeholder="VOLT-5000	R15,999	5.12kWh	48V	520x300x180mm	https://example.com/volt5000"
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleBulkEdit}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Import Data
                  </button>
                  <button
                    onClick={() => {
                      setShowBulkEdit(false);
                      setBulkEditData('');
                    }}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Configuration Section */}
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

            {/* Product Category and List Title */}
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
                  placeholder="e.g., PRODUCT CATALOG"
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
            <div className="mb-8">
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900">Products ({filteredProducts.length} of {products.length})</h3>
                  
                  {/* Mobile-friendly buttons */}
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
                      Add Product
                    </button>
                  </div>
                </div>
                
                {/* Search and View Options */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
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
                      
                      {viewMode === 'list' ? (
                        // Compact List View
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <input
                            type="text"
                            value={product.model}
                            onChange={(e) => updateProduct(product.id, 'model', e.target.value)}
                            className="p-2 border-2 border-gray-300 rounded"
                            placeholder="Model"
                          />
                          <input
                            type="text"
                            value={product.price}
                            onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                            className="p-2 border-2 border-gray-300 rounded"
                            placeholder="Price"
                          />
                          {Object.keys(product.specs).slice(0, 2).map(spec => (
                            <input
                              key={spec}
                              type="text"
                              value={product.specs[spec]}
                              onChange={(e) => updateProductSpec(product.id, spec, e.target.value)}
                              className="p-2 border-2 border-gray-300 rounded"
                              placeholder={spec}
                            />
                          ))}
                        </div>
                      ) : (
                        // Full Grid View
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Product Image</label>
                              <div className="space-y-2">
                                <div className="w-full h-24 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-blue-400 transition-colors">
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
                                  className="w-full text-xs file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
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
                              />
                            </div>
                            
                            {categories[selectedCategory].fields.map(field => {
                              if (field === 'price') return null;
                              
                              const label = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
                              
                              return (
                                <div key={field}>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                                  <input
                                    type="text"
                                    value={product.specs[field] || ''}
                                    onChange={(e) => updateProductSpec(product.id, field, e.target.value)}
                                    className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={`Enter ${label.toLowerCase()}`}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {products.length === 0 && (
                <div className="text-center py-16 bg-gray-50 rounded-xl">
                  <Zap size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No products yet!</h3>
                  <p className="text-gray-500 mb-6">Add products manually, import from CSV/JSON, or paste from Excel.</p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={addProduct}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Add First Product
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
    
                      Import Data
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