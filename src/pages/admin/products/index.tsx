import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import axios from 'axios';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { useNotification } from '../../../context/NotificationContext';
import { isAdmin } from '../../../utils/auth';
import { authOptions } from '../../api/auth/[...nextauth]';
import { IProduct } from '../../../models/Product';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/admin/products');
    } else if (status === 'authenticated' && session) {
      fetchProducts();
    }
  }, [status, session]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/products');
      if (response.status === 200) {
        setProducts(response.data.products || []);
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      showNotification(error.response?.data?.message || 'Failed to fetch products', 'error');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setIsDeleting(productId);
      try {
        const response = await axios.delete(`/api/products/${productId}`);
        if (response.status === 200) {
          showNotification('Product deleted successfully', 'success');
          // Remove the deleted product from the list
          setProducts(products.filter(product => product._id !== productId));
        }
      } catch (error: any) {
        console.error('Error deleting product:', error);
        showNotification(error.response?.data?.message || 'Failed to delete product', 'error');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : [];

  if (status === 'loading') {
    return (
      <Layout title="Admin - Products" description="Manage your products">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-main"></div>
        </div>
      </Layout>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect in useEffect
  }

  return (
    <Layout title="Admin - Products" description="Manage your products">
      <div className="bg-gradient-to-r from-primary-dark to-secondary-dark text-white py-12 mb-8">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Products</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Manage your product catalog.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pb-16">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">All Products</h2>
              <div className="flex space-x-4">
                <Link
                  href="/admin/products/add"
                  className="px-4 py-2 bg-primary-main text-white rounded-md hover:bg-primary-dark transition duration-300"
                >
                  Add Product
                </Link>
                <Link
                  href="/admin/import-products"
                  className="px-4 py-2 bg-secondary-main text-white rounded-md hover:bg-secondary-dark transition duration-300"
                >
                  Import from AliExpress
                </Link>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-main border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading products...</p>
            </div>
          ) : safeProducts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No products found.</p>
              <p className="mt-2 text-gray-500">
                Get started by adding a new product or importing from AliExpress.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {safeProducts.map((product) => (
                    <tr key={product._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={product.images[0] || 'https://via.placeholder.com/150'}
                          alt={product.name}
                          className="h-12 w-12 object-cover rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${product.price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.countInStock}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/products/edit/${product._id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            disabled={isDeleting === product._id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            {isDeleting === product._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
        destination: '/login?redirect=/admin/products',
        permanent: false,
      },
    };
  }
  
  return {
    props: {
      session: JSON.parse(JSON.stringify(session))
    },
  };
}; 