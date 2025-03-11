import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import axios from 'axios';
import Link from 'next/link';
import { useNotification } from '../../../context/NotificationContext';
import { isAdmin } from '../../../utils/auth';
import { authOptions } from '../../api/auth/[...nextauth]';

// Mobile-specific API endpoint
const API_ENDPOINT = '/api/aliexpress/import-mobile';

export default function ImportMobilePage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [importedProduct, setImportedProduct] = useState<any>(null);
  const [error, setError] = useState('');
  const { showNotification } = useNotification();

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      showNotification('Please enter a product URL', 'error');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setImportedProduct(null);
    
    try {
      console.log('Sending request with URL:', url);
      
      // Make the request with both parameter names to ensure compatibility
      const response = await axios.post(API_ENDPOINT, { 
        productUrl: url.trim(),
        url: url.trim() 
      });
      
      console.log('Response received:', response.data);
      
      if (response.data.product) {
        setImportedProduct(response.data.product);
        showNotification('Product imported successfully', 'success');
      } else {
        setError('Product was imported but no data was returned');
        showNotification('Import completed with warnings', 'warning');
      }
      
      setUrl('');
    } catch (error: any) {
      console.error('Error importing product:', error);
      
      const errorMessage = error.response?.data?.message || 'Failed to import product';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="bg-blue-800 text-white py-4 px-4 rounded-t-lg">
        <h1 className="text-xl font-bold">Import Products</h1>
        <p className="text-white/80 text-sm">
          Import products from AliExpress to your store with automatic price markup.
        </p>
      </div>
      
      <div className="bg-white rounded-b-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-2">Import by URL</h2>
        
        <form onSubmit={handleImport} className="mb-4">
          <div className="mb-3">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              AliExpress Product URL
            </label>
            <input
              type="text"
              id="url"
              name="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.aliexpress.com/item/1234567890.html"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Importing...' : 'Import Product'}
          </button>
        </form>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {importedProduct && (
          <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-sm">
            <p className="font-medium text-green-700">Product imported successfully!</p>
            <p><span className="font-medium">Name:</span> {importedProduct.name}</p>
            <p><span className="font-medium">Price:</span> ${importedProduct.price}</p>
            {importedProduct.images && importedProduct.images.length > 0 && (
              <div className="mt-2">
                <img 
                  src={importedProduct.images[0]} 
                  alt={importedProduct.name} 
                  className="w-24 h-24 object-contain border border-gray-200 rounded"
                />
              </div>
            )}
            <div className="mt-2">
              <Link 
                href={`/admin/products/edit/${importedProduct._id}`}
                className="text-blue-600 hover:underline text-sm"
              >
                Edit Product Details
              </Link>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
        <p className="font-medium text-yellow-800">Tips</p>
        <ul className="list-disc pl-4 mt-1 text-yellow-700 space-y-1">
          <li>Copy the full product URL from AliExpress</li>
          <li>Price includes 30% markup automatically</li>
          <li>Edit product details after importing</li>
        </ul>
      </div>
      
      <div className="mt-4 text-center">
        <Link href="/admin/products/import" className="text-blue-600 hover:underline text-sm">
          Switch to Desktop Version
        </Link>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  
  // Check if user is authenticated and is an admin
  if (!session || !isAdmin(session)) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  
  return {
    props: {},
  };
}; 