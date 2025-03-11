import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import axios from 'axios';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import AdminSidebar from '../../../components/AdminSidebar';
import { useNotification } from '../../../context/NotificationContext';
import { isAdmin } from '../../../utils/auth';
import { authOptions } from '../../api/auth/[...nextauth]';

// Update the API endpoint to ensure it's correct
const API_ENDPOINT = '/api/aliexpress/import';

export default function ImportProductPage() {
  const [productUrl, setProductUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [importedProduct, setImportedProduct] = useState<any>(null);
  const [error, setError] = useState('');
  const [detailedError, setDetailedError] = useState('');
  const { showNotification } = useNotification();

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productUrl) {
      showNotification('Please enter a product URL', 'error');
      return;
    }
    
    // Validate URL format
    if (!productUrl.includes('aliexpress.com/item/') && !productUrl.includes('aliexpress.com/i/')) {
      setError('Invalid AliExpress URL. Please enter a valid product URL (e.g., https://www.aliexpress.com/item/1234567890.html)');
      showNotification('Invalid AliExpress URL', 'error');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setDetailedError('');
    setImportedProduct(null);
    
    try {
      showNotification('Importing product, this may take a moment...', 'info');
      
      console.log('Sending request with productUrl:', productUrl);
      console.log('API endpoint:', API_ENDPOINT);
      
      // Make sure we're using the correct parameter name
      const response = await axios.post(API_ENDPOINT, { 
        productUrl: productUrl.trim() 
      });
      
      console.log('Response received:', response.data);
      
      if (response.data.product) {
        setImportedProduct(response.data.product);
        showNotification(response.data.message, 'success');
      } else {
        setError('Product was imported but no data was returned');
        showNotification('Import completed with warnings', 'warning');
      }
      
      setProductUrl('');
    } catch (error: any) {
      console.error('Error importing product:', error);
      
      // Log more detailed error information
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      }
      
      const errorMessage = error.response?.data?.message || 'Failed to import product';
      const detailedErrorMessage = error.response?.data?.error || error.message || 'Unknown error';
      
      setError(errorMessage);
      setDetailedError(detailedErrorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title="Import AliExpress Product" description="Import products from AliExpress">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <AdminSidebar />
          </div>
          
          <div className="md:w-3/4">
            <div className="bg-gradient-to-r from-primary-dark to-secondary-dark text-white py-6 px-6 rounded-t-lg">
              <h1 className="text-2xl font-bold">Import AliExpress Product</h1>
              <p className="text-white/80">
                Import products directly from AliExpress to your store.
              </p>
            </div>
            
            <div className="bg-white rounded-b-lg shadow-md p-6 mb-8">
              <form 
                onSubmit={handleImport} 
                className="mb-6"
                method="POST"
                action={API_ENDPOINT}
              >
                <div className="mb-4">
                  <label htmlFor="productUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    AliExpress Product URL
                  </label>
                  <input
                    type="text"
                    id="productUrl"
                    name="productUrl"
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    placeholder="https://www.aliexpress.com/item/1234567890.html"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Paste the full URL of the AliExpress product you want to import.
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-primary-main text-white rounded-md hover:bg-primary-dark transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Importing...
                    </>
                  ) : 'Import Product'}
                </button>
              </form>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                  <h3 className="font-medium">Error importing product</h3>
                  <p>{error}</p>
                  {detailedError && (
                    <p className="mt-1 text-sm text-red-600">Details: {detailedError}</p>
                  )}
                  <div className="mt-2">
                    <p className="text-sm">Troubleshooting tips:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li>Make sure the URL is from AliExpress (starts with https://www.aliexpress.com/item/)</li>
                      <li>Check if the product is still available on AliExpress</li>
                      <li>Try using a different browser or clearing your cache</li>
                      <li>Some products may be protected against scraping and may not import correctly.</li>
                    </ul>
                  </div>
                </div>
              )}
              
              {importedProduct && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500">
                  <h3 className="font-medium text-green-700">Product imported successfully!</h3>
                  <div className="mt-2">
                    <p><span className="font-medium">Name:</span> {importedProduct.name}</p>
                    <p><span className="font-medium">Price:</span> ${importedProduct.price}</p>
                    {importedProduct.images && importedProduct.images.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium">Preview:</p>
                        <img 
                          src={importedProduct.images[0]} 
                          alt={importedProduct.name} 
                          className="w-32 h-32 object-contain mt-1 border border-gray-200 rounded"
                        />
                      </div>
                    )}
                    <div className="mt-2">
                      <Link 
                        href={`/admin/products/edit/${importedProduct._id}`}
                        className="text-primary-main hover:underline"
                      >
                        Edit Product Details
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium mb-4">Import Instructions</h3>
                <ol className="list-decimal pl-5 space-y-4">
                  <li className="text-gray-700">
                    <strong>Find a product on AliExpress</strong> - Browse AliExpress and find a product you want to sell in your store.
                  </li>
                  <li className="text-gray-700">
                    <strong>Copy the product URL</strong> - Copy the full URL from your browser's address bar.
                  </li>
                  <li className="text-gray-700">
                    <strong>Paste the URL above</strong> - Paste the URL in the input field and click "Import Product".
                  </li>
                  <li className="text-gray-700">
                    <strong>Review and edit</strong> - After importing, you can edit the product details from the <Link href="/admin/products" className="text-primary-main hover:underline">Products page</Link>.
                  </li>
                </ol>
                
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Important Notes</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <ul className="list-disc pl-5 space-y-1">
                          <li>The product price will automatically include your markup (30%).</li>
                          <li>Product availability is subject to AliExpress inventory.</li>
                          <li>Images and descriptions are imported directly from AliExpress.</li>
                          <li>You can edit any product details after importing.</li>
                          <li>Some products may be protected against scraping and may not import correctly.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <Link href="/admin/products/import-mobile" className="text-primary-main hover:underline text-sm">
          Switch to Mobile Version
        </Link>
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
        destination: '/login',
        permanent: false,
      },
    };
  }
  
  return {
    props: {},
  };
}; 