import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import axios from 'axios';
import Layout from '../../components/Layout';
import { useNotification } from '../../context/NotificationContext';
import { isAdmin } from '../../utils/auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { serializeSession } from '../../utils/session';

export default function ImportProductsPage() {
  const [productUrl, setProductUrl] = useState('');
  const [productId, setProductId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [markupPercentage, setMarkupPercentage] = useState(30);
  const { showNotification } = useNotification();

  const handleImportByUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productUrl) {
      showNotification('Please enter a product URL', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/aliexpress/import', { 
        url: productUrl,
        markupPercentage
      });
      
      if (response.status === 201) {
        showNotification('Product imported successfully', 'success');
        setProductUrl('');
      }
    } catch (error: any) {
      console.error('Error importing product:', error);
      showNotification(error.response?.data?.message || 'Failed to import product', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportById = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productId) {
      showNotification('Please enter a product ID', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/aliexpress/import', { 
        productId,
        markupPercentage
      });
      
      if (response.status === 201) {
        showNotification('Product imported successfully', 'success');
        setProductId('');
      }
    } catch (error: any) {
      console.error('Error importing product:', error);
      showNotification(error.response?.data?.message || 'Failed to import product', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm) {
      showNotification('Please enter a search term', 'error');
      return;
    }
    
    setIsSearching(true);
    
    try {
      const response = await axios.get(`/api/aliexpress/search?keyword=${encodeURIComponent(searchTerm)}`);
      
      if (response.status === 200) {
        setSearchResults(response.data.products);
        
        if (response.data.products.length === 0) {
          showNotification('No products found', 'info');
        }
      }
    } catch (error: any) {
      console.error('Error searching products:', error);
      showNotification(error.response?.data?.message || 'Failed to search products', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleImportFromSearch = async (productId: string) => {
    const product = searchResults.find((p: any) => p.id === productId);
    
    if (!product) {
      showNotification('Product not found', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/aliexpress/import', { 
        productId,
        markupPercentage
      });
      
      if (response.status === 201) {
        showNotification('Product imported successfully', 'success');
        
        // Remove the imported product from search results
        setSearchResults(searchResults.filter((p: any) => p.id !== productId));
      }
    } catch (error: any) {
      console.error('Error importing product:', error);
      showNotification(error.response?.data?.message || 'Failed to import product', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title="Admin - Import Products" description="Import products from AliExpress">
      <div className="bg-gradient-to-r from-primary-dark to-secondary-dark text-white py-12 mb-8">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Import Products</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Import products from AliExpress to your store with automatic price markup.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pb-16">
        {/* Markup Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Markup Settings</h2>
          <div className="flex items-center">
            <label htmlFor="markupPercentage" className="block text-gray-700 mr-4">
              Markup Percentage:
            </label>
            <input
              type="number"
              id="markupPercentage"
              value={markupPercentage}
              onChange={(e) => setMarkupPercentage(Number(e.target.value))}
              min="0"
              max="1000"
              className="w-24 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
            />
            <span className="ml-2 text-gray-700">%</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Import by URL */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Import by URL</h2>
            <form onSubmit={handleImportByUrl}>
              <div className="mb-4">
                <label htmlFor="productUrl" className="block text-gray-700 mb-2">
                  AliExpress Product URL
                </label>
                <input
                  type="text"
                  id="productUrl"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="https://www.aliexpress.com/item/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full px-4 py-2 rounded-md text-white font-medium ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-main hover:bg-primary-dark transition duration-300'
                }`}
              >
                {isLoading ? 'Importing...' : 'Import Product'}
              </button>
            </form>
          </div>
          
          {/* Import by ID */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Import by ID</h2>
            <form onSubmit={handleImportById}>
              <div className="mb-4">
                <label htmlFor="productId" className="block text-gray-700 mb-2">
                  AliExpress Product ID
                </label>
                <input
                  type="text"
                  id="productId"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  placeholder="1234567890"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full px-4 py-2 rounded-md text-white font-medium ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-main hover:bg-primary-dark transition duration-300'
                }`}
              >
                {isLoading ? 'Importing...' : 'Import Product'}
              </button>
            </form>
          </div>
          
          {/* Search Products */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Search Products</h2>
            <form onSubmit={handleSearch}>
              <div className="mb-4">
                <label htmlFor="searchTerm" className="block text-gray-700 mb-2">
                  Search Term
                </label>
                <input
                  type="text"
                  id="searchTerm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for products..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className={`w-full px-4 py-2 rounded-md text-white font-medium ${
                  isSearching
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-main hover:bg-primary-dark transition duration-300'
                }`}
              >
                {isSearching ? 'Searching...' : 'Search Products'}
              </button>
            </form>
          </div>
        </div>
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Search Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {searchResults.map((product: any) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative aspect-video">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-primary-main font-bold text-xl">
                          ${(product.price * (1 + markupPercentage / 100)).toFixed(2)}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Original: ${product.price.toFixed(2)}
                        </p>
                      </div>
                      {product.ratings && (
                        <div className="flex items-center">
                          <svg
                            className="w-5 h-5 text-yellow-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="ml-1 text-gray-600">
                            {product.ratings.averageRating || 0}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleImportFromSearch(product.id)}
                      disabled={isLoading}
                      className={`w-full px-4 py-2 rounded-md text-white font-medium ${
                        isLoading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-primary-main hover:bg-primary-dark transition duration-300'
                      }`}
                    >
                      {isLoading ? 'Importing...' : 'Import Product'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  
  // Check if user is authenticated and is an admin
  if (!session || !isAdmin(session)) {
    return {
      redirect: {
        destination: '/login?redirect=/admin/import-products',
        permanent: false,
      },
    };
  }
  
  // Serialize the session data to avoid undefined values
  const serializedSession = serializeSession(session);
  
  return {
    props: {
      session: serializedSession,
    },
  };
}; 