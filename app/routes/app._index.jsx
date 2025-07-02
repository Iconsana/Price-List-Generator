import { useState, useRef, useCallback } from "react";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  InlineStack,
  TextField,
  Select,
  DataTable,
  Badge,
  Thumbnail,
  Modal,
  Banner,
  Spinner,
  Box,
  Divider,
  ButtonGroup,
  ResourceList,
  ResourceItem,
  Filters,
  ChoiceList,
  RangeSlider,
  EmptyState
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { 
  Download, 
  Plus, 
  Eye, 
  Search,
  Grid3X3,
  List,
  Settings,
  Package,
  ShoppingCart,
  FileText,
  Check,
  X,
  Trash2
} from "lucide-react";

// Loader function - fetches Shopify data server-side
export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  // Fetch products with GraphQL
  const productsResponse = await admin.graphql(`
    query getProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            productType
            vendor
            tags
            status
            featuredImage {
              url
              altText
            }
            variants(first: 5) {
              edges {
                node {
                  id
                  title
                  price
                  sku
                  inventoryQuantity
                  weight
                  weightUnit
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
      shop {
        name
        email
        phone
        myshopifyDomain
        primaryDomain {
          url
        }
      }
    }
  `, {
    variables: { first: 250 }
  });

  const data = await productsResponse.json();
  
  return json({
    products: data.data.products.edges.map(edge => edge.node),
    shop: data.data.shop,
    session
  });
};

// Action function - handles PDF generation and other actions
export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const actionType = formData.get("action");

  if (actionType === "generate-pdf") {
    const products = JSON.parse(formData.get("products"));
    const companyInfo = JSON.parse(formData.get("companyInfo"));
    
    // Here you would integrate with your PDF generation service
    // For now, return success
    return json({ 
      success: true, 
      message: "PDF generation initiated - opening in new window",
      timestamp: new Date().toISOString()
    });
  }

  return json({ success: false, message: "Invalid action" });
};

export default function PriceListGenerator() {
  const { products, shop } = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  
  // State management
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [priceListProducts, setPriceListProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Company info with shop data
  const [companyInfo, setCompanyInfo] = useState({
    name: shop.name || 'Your Store',
    email: shop.email || 'sales@yourstore.com',
    phone: shop.phone || '+27 11 123 4567',
    website: shop.primaryDomain?.url || `https://${shop.myshopifyDomain}`,
    terms: 'Payment terms: Net 30. Terms & Conditions Apply.',
    tagline: 'Quality Products, Exceptional Service'
  });
  
  const [listTitle, setListTitle] = useState('PRODUCT CATALOG');
  const [bulletPoints, setBulletPoints] = useState({
    point1: 'Professional Grade',
    point2: 'Quality Assured', 
    point3: 'Fast Delivery'
  });

  const printRef = useRef();
  const isLoading = fetcher.state === "submitting";

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.productType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.tags.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add selected products to price list
  const addSelectedProducts = useCallback(() => {
    const newProducts = selectedProducts.map(productId => {
      const product = products.find(p => p.id === productId);
      if (!product) return null;
      
      // Get first variant or default
      const variant = product.variants.edges[0]?.node;
      
      return {
        id: `${product.id}_${variant?.id || 'default'}`,
        title: product.title,
        price: variant?.price || "0.00",
        sku: variant?.sku || "",
        image: product.featuredImage?.url,
        productType: product.productType,
        vendor: product.vendor,
        handle: product.handle,
        weight: variant?.weight || 0,
        weightUnit: variant?.weightUnit || "kg",
        stock: variant?.inventoryQuantity || 0,
        shopifyData: {
          productId: product.id,
          variantId: variant?.id,
          handle: product.handle,
          status: product.status
        }
      };
    }).filter(Boolean);

    setPriceListProducts([...priceListProducts, ...newProducts]);
    setSelectedProducts([]);
    
    // Show success toast
    shopify.toast.show(`Added ${newProducts.length} product(s) to price list`);
  }, [selectedProducts, products, priceListProducts, shopify]);

  // Remove product from price list
  const removeFromPriceList = useCallback((productId) => {
    setPriceListProducts(priceListProducts.filter(p => p.id !== productId));
    shopify.toast.show("Product removed from price list");
  }, [priceListProducts, shopify]);

  // Generate PDF
  const generatePDF = useCallback(() => {
    if (priceListProducts.length === 0) {
      shopify.toast.show("Please add products to your price list first", { isError: true });
      return;
    }

    // Create the preview content and open in new window for PDF generation
    setShowPreview(true);
    
    // Small delay to ensure preview is rendered
    setTimeout(() => {
      const printWindow = window.open('', '_blank');
      const previewContent = printRef.current?.innerHTML;
      
      if (previewContent && printWindow) {
        const printDocument = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Price List - ${companyInfo.name}</title>
              <meta charset="UTF-8">
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                  line-height: 1.5; 
                  color: #111827; 
                  background: white; 
                }
                @media print { 
                  @page { margin: 0.5in; size: A4; } 
                  body { -webkit-print-color-adjust: exact; } 
                }
                .header { background: linear-gradient(135deg, #1e293b 0%, #1e40af 100%); color: white; padding: 2rem; }
                .content { padding: 2rem; }
                .product-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
                .product-card { border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; }
                .product-image { width: 120px; height: 120px; object-fit: cover; border-radius: 8px; background: #f3f4f6; }
                .product-title { font-size: 1.25rem; font-weight: bold; margin: 1rem 0; }
                .product-price { font-size: 1.5rem; font-weight: bold; color: #1e40af; }
                .footer { background: #1e293b; color: white; padding: 2rem; margin-top: 2rem; }
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
                  }, 1000);
                };
              </script>
            </body>
          </html>
        `;
        
        printWindow.document.write(printDocument);
        printWindow.document.close();
        
        shopify.toast.show("PDF generation started - check your new window");
      }
    }, 500);
  }, [priceListProducts, companyInfo, shopify]);

  // Get unique product types and vendors for filtering
  const productTypes = [...new Set(products.map(p => p.productType))].filter(Boolean);
  const vendors = [...new Set(products.map(p => p.vendor))].filter(Boolean);

  return (
    <Page>
      <TitleBar title="Price List Generator">
        <button 
          variant="primary" 
          onClick={generatePDF}
          disabled={priceListProducts.length === 0 || isLoading}
        >
          <Download size={16} />
          Generate PDF ({priceListProducts.length})
        </button>
      </TitleBar>

      <BlockStack gap="500">
        {/* Success Banner */}
        {fetcher.data?.success && (
          <Banner status="success" onDismiss={() => {}}>
            <p>{fetcher.data.message}</p>
          </Banner>
        )}

        {/* Stats Cards */}
        <Layout>
          <Layout.Section>
            <InlineStack gap="400">
              <Card>
                <Box padding="400">
                  <InlineStack align="space-between">
                    <BlockStack gap="100">
                      <Text variant="bodyMd" color="subdued">Available Products</Text>
                      <Text variant="heading2xl" as="h3">{products.length}</Text>
                    </BlockStack>
                    <Package size={32} color="#0969da" />
                  </InlineStack>
                </Box>
              </Card>
              
              <Card>
                <Box padding="400">
                  <InlineStack align="space-between">
                    <BlockStack gap="100">
                      <Text variant="bodyMd" color="subdued">Selected</Text>
                      <Text variant="heading2xl" as="h3">{selectedProducts.length}</Text>
                    </BlockStack>
                    <ShoppingCart size={32} color="#dc6803" />
                  </InlineStack>
                </Box>
              </Card>
              
              <Card>
                <Box padding="400">
                  <InlineStack align="space-between">
                    <BlockStack gap="100">
                      <Text variant="bodyMd" color="subdued">In Price List</Text>
                      <Text variant="heading2xl" as="h3">{priceListProducts.length}</Text>
                    </BlockStack>
                    <FileText size={32} color="#059669" />
                  </InlineStack>
                </Box>
              </Card>
            </InlineStack>
          </Layout.Section>
        </Layout>

        {/* Product Selection */}
        <Layout>
          <Layout.Section>
            <Card>
              <Box padding="400">
                <BlockStack gap="400">
                  <InlineStack align="space-between">
                    <Text variant="headingLg" as="h2">Select Products for Your Price List</Text>
                    <ButtonGroup>
                      <Button 
                        pressed={viewMode === "list"}
                        onClick={() => setViewMode("list")}
                      >
                        <List size={16} />
                      </Button>
                      <Button 
                        pressed={viewMode === "grid"}
                        onClick={() => setViewMode("grid")}
                      >
                        <Grid3X3 size={16} />
                      </Button>
                    </ButtonGroup>
                  </InlineStack>

                  <TextField
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search products..."
                    prefix={<Search size={16} />}
                    clearButton
                    onClearButtonClick={() => setSearchQuery("")}
                  />

                  {selectedProducts.length > 0 && (
                    <InlineStack gap="200">
                      <Button
                        variant="primary"
                        onClick={addSelectedProducts}
                        disabled={isLoading}
                      >
                        <Plus size={16} />
                        Add {selectedProducts.length} Product{selectedProducts.length !== 1 ? 's' : ''} to Price List
                      </Button>
                      <Button onClick={() => setSelectedProducts([])}>
                        Clear Selection
                      </Button>
                    </InlineStack>
                  )}
                </BlockStack>
              </Box>

              <ResourceList
                resourceName={{singular: 'product', plural: 'products'}}
                items={filteredProducts}
                selectedItems={selectedProducts}
                onSelectionChange={setSelectedProducts}
                selectable
                loading={isLoading}
                emptyState={
                  <EmptyState
                    heading="No products found"
                    description="Try adjusting your search terms"
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  />
                }
                renderItem={(product) => {
                  const { id, title, handle, productType, vendor, featuredImage, variants } = product;
                  const variant = variants.edges[0]?.node;
                  const price = variant?.price || "0.00";
                  const sku = variant?.sku || "";
                  const stock = variant?.inventoryQuantity || 0;

                  return (
                    <ResourceItem
                      id={id}
                      media={
                        <Thumbnail
                          source={featuredImage?.url || ""}
                          alt={featuredImage?.altText || title}
                          size="medium"
                        />
                      }
                      accessibilityLabel={`View details for ${title}`}
                    >
                      <InlineStack align="space-between">
                        <BlockStack gap="100">
                          <Text variant="bodyMd" fontWeight="bold" as="h3">
                            {title}
                          </Text>
                          <InlineStack gap="200">
                            {productType && <Badge>{productType}</Badge>}
                            {vendor && <Text variant="bodyMd" color="subdued">{vendor}</Text>}
                          </InlineStack>
                          {sku && (
                            <Text variant="bodyMd" color="subdued">SKU: {sku}</Text>
                          )}
                          <Text variant="bodyMd" color={stock > 0 ? "success" : "critical"}>
                            Stock: {stock}
                          </Text>
                        </BlockStack>
                        <BlockStack gap="100" align="end">
                          <Text variant="headingMd" as="h4">
                            R {parseFloat(price).toFixed(2)}
                          </Text>
                          <Badge status={stock > 0 ? "success" : "attention"}>
                            {stock > 0 ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </BlockStack>
                      </InlineStack>
                    </ResourceItem>
                  );
                }}
              />
            </Card>
          </Layout.Section>
        </Layout>

        {/* Price List Products */}
        {priceListProducts.length > 0 && (
          <Layout>
            <Layout.Section>
              <Card>
                <Box padding="400">
                  <BlockStack gap="400">
                    <InlineStack align="space-between">
                      <Text variant="headingLg" as="h2">
                        Price List Products ({priceListProducts.length})
                      </Text>
                      <ButtonGroup>
                        <Button onClick={() => setShowSettings(true)}>
                          <Settings size={16} />
                          Settings
                        </Button>
                        <Button onClick={() => setShowPreview(true)}>
                          <Eye size={16} />
                          Preview
                        </Button>
                      </ButtonGroup>
                    </InlineStack>
                  </BlockStack>
                </Box>

                <ResourceList
                  resourceName={{singular: 'product', plural: 'products'}}
                  items={priceListProducts}
                  renderItem={(product) => (
                    <ResourceItem
                      id={product.id}
                      media={
                        <Thumbnail
                          source={product.image || ""}
                          alt={product.title}
                          size="small"
                        />
                      }
                      shortcutActions={[
                        {
                          content: "Remove",
                          destructive: true,
                          onAction: () => removeFromPriceList(product.id)
                        }
                      ]}
                    >
                      <InlineStack align="space-between">
                        <BlockStack gap="100">
                          <Text variant="bodyMd" fontWeight="bold">
                            {product.title}
                          </Text>
                          <InlineStack gap="200">
                            {product.productType && <Badge>{product.productType}</Badge>}
                            {product.vendor && <Text variant="bodyMd" color="subdued">{product.vendor}</Text>}
                          </InlineStack>
                          {product.sku && (
                            <Text variant="bodyMd" color="subdued">SKU: {product.sku}</Text>
                          )}
                        </BlockStack>
                        <Text variant="headingMd">R {parseFloat(product.price).toFixed(2)}</Text>
                      </InlineStack>
                    </ResourceItem>
                  )}
                />
              </Card>
            </Layout.Section>
          </Layout>
        )}

        {/* Settings Modal */}
        <Modal
          open={showSettings}
          onClose={() => setShowSettings(false)}
          title="Price List Settings"
          primaryAction={{
            content: "Save Settings",
            onAction: () => setShowSettings(false)
          }}
        >
          <Modal.Section>
            <BlockStack gap="400">
              <TextField
                label="List Title"
                value={listTitle}
                onChange={setListTitle}
              />
              
              <TextField
                label="Company Name"
                value={companyInfo.name}
                onChange={(value) => setCompanyInfo({...companyInfo, name: value})}
              />
              
              <TextField
                label="Phone"
                value={companyInfo.phone}
                onChange={(value) => setCompanyInfo({...companyInfo, phone: value})}
              />
              
              <TextField
                label="Email"
                value={companyInfo.email}
                onChange={(value) => setCompanyInfo({...companyInfo, email: value})}
              />
              
              <TextField
                label="Website"
                value={companyInfo.website}
                onChange={(value) => setCompanyInfo({...companyInfo, website: value})}
              />
              
              <TextField
                label="Tagline"
                value={companyInfo.tagline}
                onChange={(value) => setCompanyInfo({...companyInfo, tagline: value})}
              />
              
              <TextField
                label="Terms & Conditions"
                value={companyInfo.terms}
                onChange={(value) => setCompanyInfo({...companyInfo, terms: value})}
                multiline={3}
              />
            </BlockStack>
          </Modal.Section>
        </Modal>

        {/* Preview Modal */}
        <Modal
          open={showPreview}
          onClose={() => setShowPreview(false)}
          title="Price List Preview"
          large
          primaryAction={{
            content: "Generate PDF",
            onAction: generatePDF
          }}
        >
          <Modal.Section>
            <div ref={printRef} style={{ maxHeight: "70vh", overflow: "auto" }}>
              {/* Preview content */}
              <div className="header" style={{ background: "linear-gradient(135deg, #1e293b 0%, #1e40af 100%)", color: "white", padding: "2rem" }}>
                <InlineStack align="space-between">
                  <BlockStack gap="200">
                    <Text variant="heading3xl" as="h1" color="base">{companyInfo.name}</Text>
                    <Text variant="bodyLg" color="base">{companyInfo.tagline}</Text>
                    <Text variant="bodyMd" color="base">{companyInfo.terms}</Text>
                  </BlockStack>
                  <BlockStack gap="100" align="end">
                    <Text variant="heading2xl" as="h2" color="base">{listTitle}</Text>
                    <Text variant="bodyMd" color="base">• {bulletPoints.point1}</Text>
                    <Text variant="bodyMd" color="base">• {bulletPoints.point2}</Text>
                    <Text variant="bodyMd" color="base">• {bulletPoints.point3}</Text>
                  </BlockStack>
                </InlineStack>
              </div>
              
              <div className="content" style={{ padding: "2rem" }}>
                <div className="product-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
                  {priceListProducts.map(product => (
                    <div key={product.id} className="product-card" style={{ border: "2px solid #e5e7eb", borderRadius: "12px", padding: "1.5rem" }}>
                      <InlineStack gap="300" align="start">
                        {product.image && (
                          <img 
                            src={product.image} 
                            alt={product.title}
                            className="product-image"
                            style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }}
                          />
                        )}
                        <BlockStack gap="200">
                          <Text variant="headingMd" as="h3">{product.title}</Text>
                          <Text variant="bodyMd" color="subdued">{product.productType} • {product.vendor}</Text>
                          {product.sku && <Text variant="bodyMd" color="subdued">SKU: {product.sku}</Text>}
                          <Text variant="headingLg" as="h4" className="product-price">R {parseFloat(product.price).toFixed(2)}</Text>
                        </BlockStack>
                      </InlineStack>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="footer" style={{ background: "#1e293b", color: "white", padding: "2rem" }}>
                <InlineStack align="space-between">
                  <BlockStack gap="100">
                    <Text variant="bodyMd" color="base">📞 {companyInfo.phone}</Text>
                    <Text variant="bodyMd" color="base">✉️ {companyInfo.email}</Text>
                    <Text variant="bodyMd" color="base">🌐 {companyInfo.website}</Text>
                  </BlockStack>
                  <div style={{ width: "80px", height: "80px", background: "white", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(companyInfo.website)}`}
                      alt="QR Code"
                      style={{ width: "70px", height: "70px" }}
                    />
                  </div>
                </InlineStack>
              </div>
            </div>
          </Modal.Section>
        </Modal>
      </BlockStack>
    </Page>
  );
}
