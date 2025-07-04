import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { login } from "../../shopify.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Price List Generator</h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-sm text-gray-600">🚀 Over 10,000 catalogs generated</span>
              <div className="flex items-center space-x-1">
                <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                <span className="text-sm text-gray-600">4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl font-bold mb-6 leading-tight">
                Create <span className="text-yellow-300">Professional</span> Price Lists in Minutes
              </h2>
              <p className="text-xl mb-8 text-gray-200">
                Transform your Shopify products into stunning, branded catalogs that convert browsers into buyers. No design skills required.
              </p>
              
              {/* Key Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">⚡</div>
                  <div className="text-sm font-semibold">5 Min Setup</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">🎨</div>
                  <div className="text-sm font-semibold">Auto-Branded</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">📊</div>
                  <div className="text-sm font-semibold">PDF Export</div>
                </div>
              </div>

              {/* Install Form */}
              {showForm && (
                <div className="bg-white rounded-xl p-6 shadow-2xl">
                  <h3 className="text-gray-900 text-lg font-semibold mb-4">Start Your Free Trial Today</h3>
                  <Form method="post" action="/auth/login" className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Shop Domain</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          name="shop" 
                          placeholder="your-store.myshopify.com"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                    >
                      🚀 Install Free App
                    </button>
                  </Form>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    ✅ Free 14-day trial • ✅ No credit card required • ✅ Cancel anytime
                  </p>
                </div>
              )}
            </div>
            
            {/* Hero Visual */}
            <div className="animate-pulse">
              <div className="relative">
                <div className="bg-white rounded-xl shadow-2xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="flex-1 bg-gray-200 rounded h-6"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-100 rounded h-24 flex items-center justify-center">
                        <span className="text-4xl">📱</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-6 bg-blue-500 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-100 rounded h-24 flex items-center justify-center">
                        <span className="text-4xl">💻</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-6 bg-purple-500 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                  PDF Ready!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Sell More</h2>
            <p className="text-xl text-gray-600">Powerful features that work seamlessly with your Shopify store</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Lightning Fast Setup</h3>
              <p className="text-gray-600">Connect your Shopify store and generate your first professional price list in under 5 minutes.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Auto-Branded Design</h3>
              <p className="text-gray-600">Your price lists automatically match your brand with colors, fonts, and logos. No design skills needed.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Professional PDFs</h3>
              <p className="text-gray-600">Export print-ready PDFs that look amazing in emails, presentations, and trade shows.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Growing Businesses</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  SJ
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className="text-sm text-gray-600">TechGadgets Store</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">"Cut our catalog creation time from 2 days to 10 minutes. Our sales team loves the professional look!"</p>
              <div className="flex text-yellow-400">⭐⭐⭐⭐⭐</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                  MC
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">Mike Chen</h4>
                  <p className="text-sm text-gray-600">Outdoor Gear Co</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">"Perfect for trade shows! Our price lists now look as professional as our products."</p>
              <div className="flex text-yellow-400">⭐⭐⭐⭐⭐</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  ER
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">Emma Rodriguez</h4>
                  <p className="text-sm text-gray-600">Fashion Forward</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">"Customers love getting our beautifully formatted catalogs. Increased orders by 40%!"</p>
              <div className="flex text-yellow-400">⭐⭐⭐⭐⭐</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Product Catalogs?</h2>
          <p className="text-xl mb-8 text-gray-200">Join thousands of merchants who've already upgraded their pricing game.</p>
          
          {showForm && (
            <div className="bg-white rounded-xl p-8 max-w-md mx-auto">
              <Form method="post" action="/auth/login" className="space-y-4">
                <input 
                  type="text" 
                  name="shop" 
                  placeholder="your-store.myshopify.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-all transform hover:scale-105"
                >
                  🚀 Start Free 14-Day Trial
                </button>
              </Form>
              <p className="text-xs text-gray-500 mt-3">
                No credit card required • Cancel anytime • 4.9/5 rating
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Price List Generator</h3>
              <p className="text-gray-400">Create professional catalogs that convert browsers into buyers.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Templates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Tutorial</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Price List Generator. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
